#!/usr/bin/env node
/**
 * Payout lifecycle through the rendered admin ledger and agent portal.
 *
 * The headline risk this covers: a percentage agent whose student enrols
 * before a service fee is recorded accrues a NULL amount. The database
 * refuses to approve it, so unless the UI shouts about it the agent simply
 * never gets paid and nobody notices. These tests assert the warning is
 * actually on the page, not merely that the constraint exists.
 *
 *   BASE=http://localhost:3001 node scripts/test-payout-e2e.mjs
 */
import fs from "node:fs";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const env = {};
for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

const BASE = process.env.BASE || "http://localhost:3001";
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const db = new pg.Client({
  connectionString: env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

let pass = 0, fail = 0;
const ok = (n, d = "") => (pass++, console.log(`  PASS  ${n}${d ? ` — ${d}` : ""}`));
const bad = (n, d = "") => (fail++, console.log(`  FAIL  ${n}${d ? ` — ${d}` : ""}`));

async function sessionCookies(email, password) {
  const jar = new Map();
  const c = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
        setAll: (l) => l.forEach(({ name, value }) => jar.set(name, value)),
      },
    }
  );
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`sign-in ${email}: ${error.message}`);
  return [...jar.entries()].map(([n, v]) => `${n}=${encodeURIComponent(v)}`).join("; ");
}

const html = async (path, cookie) => {
  const r = await fetch(`${BASE}${path}`, { headers: { cookie }, redirect: "manual" });
  return { status: r.status, body: r.status === 200 ? await r.text() : "" };
};

const PERCENT_EMAIL = "payout-percent@example.com";
const FLAT_EMAIL = "payout-flat@example.com";
const PW = "TempPassword123!x";
const made = [];

async function destroyAgent(id) {
  await db.query("alter table public.commissions disable trigger trg_commissions_no_delete");
  try {
    for (const s of [
      "delete from public.commissions where agent_id=$1",
      "delete from public.lead_stage_history where lead_id in (select id from public.leads where agent_id=$1)",
      "delete from public.education_details where lead_id in (select id from public.leads where agent_id=$1)",
      "delete from public.leads where agent_id=$1",
      "delete from public.profiles where id=$1",
    ]) await db.query(s, [id]).catch(() => {});
  } finally {
    await db.query("alter table public.commissions enable trigger trg_commissions_no_delete");
  }
  await sb.auth.admin.deleteUser(id).catch(() => {});
}

async function makeAgent(email, type, value) {
  const { data, error } = await sb.auth.admin.createUser({
    email, password: PW, email_confirm: true, app_metadata: { role: "agent" },
  });
  if (error) throw new Error(`${email}: ${error.message}`);
  await db.query(
    `insert into public.profiles (id,role,status,full_name,email,commission_type,commission_value,must_change_password)
     values ($1,'agent','active',$2,$3,$4,$5,false)`,
    [data.user.id, email.split("@")[0], email, type, value]
  );
  made.push(data.user.id);
  return data.user.id;
}

async function makeLead(agentId, name, dealValue) {
  const r = await db.query(
    `insert into public.leads (vertical, agent_id, created_by, source, student_name, target_country, stage_key, deal_value)
     values ('education',$1,$1,'agent',$2,'Canada','new',$3) returning id`,
    [agentId, name, dealValue]
  );
  return r.rows[0].id;
}

try {
  await db.connect();

  // Re-runnable cleanup.
  const { rows: old } = await db.query(
    "select id from public.profiles where email = any($1)",
    [[PERCENT_EMAIL, FLAT_EMAIL]]
  );
  for (const r of old) await destroyAgent(r.id);
  const { data: list } = await sb.auth.admin.listUsers({ perPage: 200 });
  for (const u of list?.users ?? []) {
    if (u.email === PERCENT_EMAIL || u.email === FLAT_EMAIL) await sb.auth.admin.deleteUser(u.id);
  }

  console.log(`Target: ${BASE}\n`);

  const adminCookie = await sessionCookies(env.ADMIN_EMAIL, env.ADMIN_PASSWORD);

  const percentAgent = await makeAgent(PERCENT_EMAIL, "percent", 5);
  const flatAgent = await makeAgent(FLAT_EMAIL, "flat", 12000);
  const percentCookie = await sessionCookies(PERCENT_EMAIL, PW);

  console.log("── A percent commission with no service fee stalls ──");
  const stalledLead = await makeLead(percentAgent, "Stalled Student", null);
  await db.query("update public.leads set stage_key='enrolled' where id=$1", [stalledLead]);

  const stalled = await db.query(
    "select id, amount, status from public.commissions where lead_id=$1",
    [stalledLead]
  );
  stalled.rows[0]?.amount === null
    ? ok("accrued with a NULL amount, not a silent zero")
    : bad("percent accrual", JSON.stringify(stalled.rows[0]));

  const ledger = await html("/admin/commissions", adminCookie);
  ledger.status === 200
    ? ok("ledger page renders")
    : bad("ledger page", `status ${ledger.status}`);
  ledger.body.includes("cannot be approved yet")
    ? ok("the stalled payout is announced at the top of the ledger")
    : bad("STALLED PAYOUT IS INVISIBLE — the agent would never be paid");
  ledger.body.includes("Set amount")
    ? ok("a Set amount control is offered on the row")
    : bad("no way to fix the stalled amount from the ledger");
  ledger.body.includes("Stalled Student")
    ? ok("the stalled commission is listed")
    : bad("stalled commission missing from the list");

  console.log("\n── The database refuses to approve it ──");
  try {
    await db.query("update public.commissions set status='approved' where id=$1", [
      stalled.rows[0].id,
    ]);
    bad("approving a NULL-amount commission was allowed");
  } catch (e) {
    ok("approval blocked by the amount constraint", e.code);
  }

  console.log("\n── Normal flow: earned → approved → paid ──");
  const goodLead = await makeLead(flatAgent, "Paid Student", 60000);
  await db.query("update public.leads set stage_key='enrolled' where id=$1", [goodLead]);
  const good = await db.query(
    "select id, amount, status from public.commissions where lead_id=$1",
    [goodLead]
  );
  Number(good.rows[0]?.amount) === 12000
    ? ok("flat commission accrued at the agent's rate", "₹12000")
    : bad("flat accrual", JSON.stringify(good.rows[0]));

  const earnedTab = await html("/admin/commissions?status=earned", adminCookie);
  earnedTab.body.includes("Paid Student")
    ? ok("appears under Awaiting approval")
    : bad("not shown in the earned tab");

  await db.query("update public.commissions set status='approved' where id=$1", [good.rows[0].id]);
  const stamped = await db.query(
    "select approved_at, approved_by from public.commissions where id=$1",
    [good.rows[0].id]
  );
  stamped.rows[0].approved_at
    ? ok("approved_at stamped by the trigger, not the caller")
    : bad("approved_at not stamped");

  const approvedTab = await html("/admin/commissions?status=approved", adminCookie);
  approvedTab.body.includes("Paid Student") && approvedTab.body.includes("Pay")
    ? ok("moves to Awaiting payment with a Pay action")
    : bad("approved tab missing the row or the Pay action");

  console.log("\n── A payout must stay traceable ──");
  try {
    await db.query("update public.commissions set status='paid' where id=$1", [good.rows[0].id]);
    bad("paid without a payment reference was allowed");
  } catch (e) {
    ok("payment reference is required by the database", e.code);
  }

  await db.query(
    "update public.commissions set status='paid', payment_reference='UTR-PH6-001', payment_method='NEFT' where id=$1",
    [good.rows[0].id]
  );
  const paidTab = await html("/admin/commissions?status=paid", adminCookie);
  paidTab.body.includes("UTR-PH6-001")
    ? ok("payment reference is shown on the paid row")
    : bad("payment reference not displayed");

  console.log("\n── The agent sees status, never a control ──");
  const agentLedger = await html("/agent/commissions", percentCookie);
  agentLedger.status === 200
    ? ok("agent ledger renders")
    : bad("agent ledger", `status ${agentLedger.status}`);
  agentLedger.body.includes("Stalled Student")
    ? ok("agent sees their own stalled referral")
    : bad("agent cannot see their own commission");
  !agentLedger.body.includes("Record payment") &&
  !agentLedger.body.includes("Approve selected") &&
  !agentLedger.body.includes("Set amount")
    ? ok("no approve / pay / amount controls on the agent page")
    : bad("agent page exposes a payout control");
  !agentLedger.body.includes("Paid Student")
    ? ok("agent cannot see another agent's commission")
    : bad("CROSS-TENANT LEAK: other agent's commission visible");

  console.log("\n── Cancelling keeps the record ──");
  await db.query(
    "update public.commissions set status='cancelled', cancel_reason='test' where id=$1",
    [stalled.rows[0].id]
  );
  const after = await db.query("select status from public.commissions where id=$1", [
    stalled.rows[0].id,
  ]);
  after.rows.length === 1 && after.rows[0].status === "cancelled"
    ? ok("cancelled rather than deleted")
    : bad("cancel behaviour", JSON.stringify(after.rows));

  const cancelledTab = await html("/admin/commissions?status=cancelled", adminCookie);
  cancelledTab.body.includes("Stalled Student")
    ? ok("visible under Cancelled")
    : bad("cancelled row missing from its tab");
} catch (err) {
  console.error("\nHARNESS ERROR:", err.message);
  fail++;
} finally {
  for (const id of made) await destroyAgent(id);
  await db.end().catch(() => {});
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
}
