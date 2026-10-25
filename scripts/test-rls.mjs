#!/usr/bin/env node
/**
 * Adversarial RLS + commission-engine tests.
 *
 * Creates two real agents, then attacks the database AS those agents using
 * `set local role authenticated` + a forged request.jwt.claims — the same
 * context PostgREST establishes for a signed-in user. A UI that merely hides
 * a button proves nothing; this proves the database refuses.
 *
 *   node scripts/test-rls.mjs
 */
import fs from "node:fs";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

function loadEnv(file = ".env.local") {
  const out = {};
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = loadEnv();
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const db = new pg.Client({
  connectionString: env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

let pass = 0,
  fail = 0;
const ok = (n, d = "") => (pass++, console.log(`  PASS  ${n}${d ? ` — ${d}` : ""}`));
const bad = (n, d = "") => (fail++, console.log(`  FAIL  ${n}${d ? ` — ${d}` : ""}`));

/** Run SQL inside a transaction impersonating `uid`, then roll back. */
async function asUser(uid, sql) {
  await db.query("begin");
  try {
    await db.query("select set_config('role','authenticated',true)");
    await db.query("select set_config('request.jwt.claims', $1, true)", [
      JSON.stringify({ sub: uid, role: "authenticated" }),
    ]);
    const r = await db.query(sql);
    await db.query("rollback");
    return { ok: true, rows: r.rows, rowCount: r.rowCount };
  } catch (e) {
    await db.query("rollback").catch(() => {});
    return { ok: false, code: e.code, message: e.message };
  }
}

/** Assert the statement is REFUSED (raises) or silently affects nothing. */
async function mustBlock(name, uid, sql, { allowZeroRows = true } = {}) {
  const r = await asUser(uid, sql);
  if (!r.ok) return ok(name, `blocked (${r.code})`);
  if (allowZeroRows && r.rowCount === 0) return ok(name, "0 rows affected");
  bad(name, `ALLOWED — ${r.rowCount} row(s)`);
}

async function mustAllow(name, uid, sql, expectRows = null) {
  const r = await asUser(uid, sql);
  if (!r.ok) return bad(name, `blocked (${r.code}) ${r.message}`);
  if (expectRows !== null && r.rows.length !== expectRows)
    return bad(name, `expected ${expectRows} rows, got ${r.rows.length}`);
  ok(name, `${r.rows.length} row(s)`);
}

const made = [];
async function makeAgent(email, commission_type, commission_value) {
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: "TempPassword123!x",
    email_confirm: true,
  });
  if (error) throw new Error(`${email}: ${error.message}`);
  await db.query(
    `insert into public.profiles
       (id, role, status, full_name, email, commission_type, commission_value, must_change_password)
     values ($1,'agent','active',$2,$3,$4,$5,true)`,
    [data.user.id, email.split("@")[0], email, commission_type, commission_value]
  );
  made.push(data.user.id);
  return data.user.id;
}

/**
 * Delete a test agent and everything attached to it.
 *
 * The commissions ledger is append-only (trg_commissions_no_delete), and
 * commissions.agent_id -> profiles is ON DELETE RESTRICT, so a commission
 * blocks deletion of the agent and, by cascade, of the auth user. That is
 * correct in production — you suspend an agent, you never delete one who has
 * earned — so the test harness has to disable the guard deliberately rather
 * than the schema being loosened to suit it.
 */
async function destroyAgent(id) {
  await db.query("alter table public.commissions disable trigger trg_commissions_no_delete");
  try {
    for (const stmt of [
      "delete from public.commissions where agent_id=$1",
      "delete from public.lead_stage_history where lead_id in (select id from public.leads where agent_id=$1)",
      "delete from public.leads where agent_id=$1",
      "delete from public.profiles where id=$1",
    ]) {
      await db.query(stmt, [id]).catch((e) => console.log("  cleanup:", e.message));
    }
  } finally {
    await db.query("alter table public.commissions enable trigger trg_commissions_no_delete");
  }
  const { error } = await sb.auth.admin.deleteUser(id);
  if (error) console.log("  cleanup: auth delete failed —", error.message);
}

/** Remove leftovers from an interrupted previous run so this is re-runnable. */
async function purgeLeftovers() {
  const { rows } = await db.query(
    "select id, email from public.profiles where email like 'rls-test-%'"
  );
  for (const r of rows) await destroyAgent(r.id);
  // Orphaned auth users (profile already gone) still block re-registration.
  const { data: list } = await sb.auth.admin.listUsers({ perPage: 200 });
  for (const u of list?.users ?? []) {
    if (u.email?.startsWith("rls-test-")) {
      await sb.auth.admin.deleteUser(u.id).catch(() => {});
    }
  }
  if (rows.length) console.log(`Purged ${rows.length} leftover test agent(s).`);
}

try {
  await db.connect();
  await purgeLeftovers();
  console.log("Setting up two agents…");
  const A = await makeAgent("rls-test-a@example.com", "flat", 10000);
  const B = await makeAgent("rls-test-b@example.com", "percent", 5);

  const firstStage = "new";
  const mk = async (agent, name) => {
    const r = await db.query(
      `insert into public.leads
         (vertical, agent_id, created_by, source, student_name, target_country, stage_key)
       values ('education',$1,$1,'agent',$2,'Canada',$3) returning id`,
      [agent, name, firstStage]
    );
    return r.rows[0].id;
  };
  const leadA = await mk(A, "Student Of A");
  const leadB = await mk(B, "Student Of B");

  console.log("\n── Tenant isolation ──");
  await mustAllow("agent A sees own lead", A, `select id from public.leads`, 1);
  await mustAllow(
    "agent A cannot see B's lead",
    A,
    `select id from public.leads where id='${leadB}'`,
    0
  );

  console.log("\n── Privilege escalation ──");
  await mustBlock(
    "agent cannot self-promote to admin",
    A,
    `update public.profiles set role='admin' where id='${A}'`,
    { allowZeroRows: false }
  );
  await mustBlock(
    "agent cannot raise own commission rate",
    A,
    `update public.profiles set commission_value=999999 where id='${A}'`,
    { allowZeroRows: false }
  );
  await mustBlock(
    "agent cannot clear must_change_password",
    A,
    `update public.profiles set must_change_password=false where id='${A}'`,
    { allowZeroRows: false }
  );
  await mustBlock("agent cannot read other profiles", A, `update public.profiles set full_name='x' where id='${B}'`);

  console.log("\n── Minting your own money ──");
  await mustBlock(
    "agent cannot promote own lead to enrolled",
    A,
    `update public.leads set stage_key='enrolled' where id='${leadA}'`,
    { allowZeroRows: false }
  );
  await mustBlock(
    "agent cannot set deal_value",
    A,
    `update public.leads set deal_value=500000 where id='${leadA}'`,
    { allowZeroRows: false }
  );
  await mustBlock(
    "agent cannot reassign a lead to themselves",
    A,
    `update public.leads set agent_id='${A}' where id='${leadB}'`
  );
  await mustBlock(
    "agent cannot insert a commission",
    A,
    `insert into public.commissions
       (lead_id, agent_id, vertical, commission_type, commission_value, amount, status)
     values ('${leadA}','${A}','education','flat',99999,99999,'paid')`
  );

  console.log("\n── Internal data stays internal ──");
  await mustAllow(
    "agent cannot read education_details of own lead",
    A,
    `select lead_id from public.education_details where lead_id='${leadA}'`,
    0
  );

  console.log("\n── Commission engine ──");
  await db.query(`update public.leads set stage_key='enrolled' where id='${leadA}'`);
  let c = await db.query(`select * from public.commissions where lead_id='${leadA}'`);
  c.rows.length === 1
    ? ok("enrolling mints exactly one commission", `amount=${c.rows[0].amount}`)
    : bad("enrolling mints exactly one commission", `${c.rows.length} rows`);
  Number(c.rows[0]?.amount) === 10000
    ? ok("flat agent amount is the flat rate", "10000")
    : bad("flat agent amount", `got ${c.rows[0]?.amount}`);

  await db.query(`update public.leads set stage_key='on_hold' where id='${leadA}'`);
  c = await db.query(`select status from public.commissions where lead_id='${leadA}'`);
  c.rows[0].status === "cancelled"
    ? ok("leaving the won stage cancels an unpaid commission")
    : bad("leaving the won stage", `status=${c.rows[0].status}`);

  await db.query(`update public.leads set stage_key='enrolled' where id='${leadA}'`);
  c = await db.query(
    `select count(*)::int as n, min(status) as status, min(amount) as amount
       from public.commissions where lead_id='${leadA}'`
  );
  c.rows[0].n === 1
    ? ok("stage bouncing does not mint a second commission")
    : bad("stage bouncing minted duplicates", `${c.rows[0].n} rows`);
  c.rows[0].status === "earned"
    ? ok("re-entering the won stage REINSTATES the commission", `amount=${c.rows[0].amount}`)
    : bad("commission not reinstated", `status=${c.rows[0].status} — agent would lose this payout`);

  console.log("\n── Snapshot immutability ──");
  await db.query(`update public.profiles set commission_value=77777 where id='${A}'`);
  c = await db.query(`select amount from public.commissions where lead_id='${leadA}'`);
  Number(c.rows[0].amount) === 10000
    ? ok("raising the agent's rate does not change money already owed", "still 10000")
    : bad("snapshot drifted", `now ${c.rows[0].amount}`);

  console.log("\n── Payout state machine ──");
  const cid = (
    await db.query(`select id from public.commissions where lead_id='${leadA}'`)
  ).rows[0].id;
  try {
    await db.query(`update public.commissions set status='paid' where id='${cid}'`);
    bad("earned -> paid must be refused", "it was allowed");
  } catch (e) {
    ok("earned -> paid refused (approval cannot be skipped)", e.code);
  }
  await db.query(`update public.commissions set status='approved' where id='${cid}'`);
  try {
    await db.query(`update public.commissions set status='paid' where id='${cid}'`);
    bad("paid without a payment reference must be refused", "it was allowed");
  } catch (e) {
    ok("paid without payment_reference refused", e.code);
  }
  await db.query(
    `update public.commissions set status='paid', payment_reference='UTR-TEST-1' where id='${cid}'`
  );
  try {
    await db.query(`delete from public.commissions where id='${cid}'`);
    bad("commission delete must be refused", "it was allowed");
  } catch (e) {
    ok("commission ledger is append-only", e.code);
  }

  console.log("\n── Reversal policy (paid money is never silently clawed back) ──");
  await db.query(`update public.leads set stage_key='lost' where id='${leadA}'`);
  const rev = (
    await db.query(
      `select status, stage_reverted_at is not null as flagged from public.commissions where id='${cid}'`
    )
  ).rows[0];
  rev.status === "paid" && rev.flagged
    ? ok("paid commission stays paid and is flagged for review")
    : bad("reversal handling", JSON.stringify(rev));

  console.log("\n── Percent agent with no deal value ──");
  await db.query(`update public.leads set stage_key='enrolled' where id='${leadB}'`);
  const pc = (
    await db.query(`select amount, status from public.commissions where lead_id='${leadB}'`)
  ).rows[0];
  pc && pc.amount === null
    ? ok("percent agent with no deal_value accrues NULL, not 0")
    : bad("percent accrual", JSON.stringify(pc));
  try {
    await db.query(
      `update public.commissions set status='approved' where lead_id='${leadB}'`
    );
    bad("approving a NULL-amount commission must be refused", "allowed");
  } catch (e) {
    ok("cannot approve until the admin sets an amount", e.code);
  }
} catch (err) {
  console.error("\nTEST HARNESS ERROR:", err.message);
  fail++;
} finally {
  console.log("\nCleaning up…");
  for (const id of made) await destroyAgent(id);
  await db.end().catch(() => {});
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
}
