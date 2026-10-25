#!/usr/bin/env node
/**
 * Full referral lifecycle, end to end through the real rendered pages.
 *
 * The point of this suite is the privacy assertion: a secret counsellor note
 * is written to education_details, then the agent's own pages are fetched and
 * the raw HTML is searched for it. RLS and "we didn't select that column" both
 * look fine in isolation; only rendering the real page proves the data never
 * reaches the agent.
 *
 *   BASE=http://localhost:3001 node scripts/test-lifecycle-e2e.mjs
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
  const c = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
      setAll: (l) => l.forEach(({ name, value }) => jar.set(name, value)),
    },
  });
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`sign-in ${email}: ${error.message}`);
  return [...jar.entries()].map(([n, v]) => `${n}=${encodeURIComponent(v)}`).join("; ");
}

const html = async (path, cookie) => {
  const r = await fetch(`${BASE}${path}`, { headers: { cookie }, redirect: "manual" });
  return { status: r.status, body: r.status === 200 ? await r.text() : "" };
};

/** Run SQL as a given user, the way PostgREST would. */
async function asUser(uid, sql, params = []) {
  await db.query("begin");
  try {
    await db.query("select set_config('role','authenticated',true)");
    await db.query("select set_config('request.jwt.claims',$1,true)", [
      JSON.stringify({ sub: uid, role: "authenticated" }),
    ]);
    const r = await db.query(sql, params);
    await db.query("commit");
    return { ok: true, rows: r.rows };
  } catch (e) {
    await db.query("rollback").catch(() => {});
    return { ok: false, code: e.code, message: e.message };
  }
}

const EMAIL = "lifecycle-agent@example.com";
const PW = "TempPassword123!x";
const SECRET_NOTE = "ZZTOPSECRET-counsellor-note-9f3a";
const SECRET_BUDGET = 4242424;
const SECRET_SCORE = "8.88";

let agentId = null;

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

try {
  await db.connect();

  const { rows: old } = await db.query("select id from public.profiles where email=$1", [EMAIL]);
  for (const r of old) await destroyAgent(r.id);
  const { data: list } = await sb.auth.admin.listUsers({ perPage: 200 });
  for (const u of list?.users ?? []) if (u.email === EMAIL) await sb.auth.admin.deleteUser(u.id);

  console.log(`Target: ${BASE}\n`);

  const { data: created, error } = await sb.auth.admin.createUser({
    email: EMAIL, password: PW, email_confirm: true, app_metadata: { role: "agent" },
  });
  if (error) throw new Error(error.message);
  agentId = created.user.id;
  await db.query(
    `insert into public.profiles (id,role,status,full_name,email,commission_type,commission_value,must_change_password)
     values ($1,'agent','active','Lifecycle Agent',$2,'flat',15000,false)`,
    [agentId, EMAIL]
  );

  const agentCookie = await sessionCookies(EMAIL, PW);
  const adminCookie = await sessionCookies(env.ADMIN_EMAIL, env.ADMIN_PASSWORD);

  console.log("── Agent refers a student (through RLS, as the agent) ──");
  const ins = await asUser(
    agentId,
    `insert into public.leads (vertical, agent_id, created_by, source, student_name, phone, target_country, remarks, stage_key)
     values ('education',$1,$1,'agent','Lifecycle Student','+919000000001','Canada','met at college fair','new')
     returning id`,
    [agentId]
  );
  if (!ins.ok) throw new Error(`agent insert blocked: ${ins.code} ${ins.message}`);
  const leadId = ins.rows[0].id;
  ok("agent can create their own referral", leadId.slice(0, 8));

  const det = await db.query("select lead_id from public.education_details where lead_id=$1", [leadId]);
  det.rows.length === 1
    ? ok("detail row was materialised by trigger")
    : bad("detail row missing", "the admin form would have nothing to UPDATE");

  console.log("\n── Admin records internal data ──");
  await db.query(
    `update public.education_details
        set counsellor_notes=$2, budget_amount=$3, passport_number='X1234567', english_test='IELTS', english_test_score=$4
      where lead_id=$1`,
    [leadId, SECRET_NOTE, SECRET_BUDGET, SECRET_SCORE]
  );
  ok("counsellor notes, budget, passport and scores saved");

  console.log("\n── Admin sees the student ──");
  const adminList = await html("/admin/students", adminCookie);
  adminList.status === 200 && adminList.body.includes("Lifecycle Student")
    ? ok("student appears in the admin pipeline")
    : bad("admin pipeline", `status ${adminList.status}`);
  adminList.body.includes("Lifecycle Agent")
    ? ok("referring agent is attributed in the list")
    : bad("agent attribution missing from the pipeline list");

  const adminDetail = await html(`/admin/students/${leadId}`, adminCookie);
  adminDetail.status === 200 && adminDetail.body.includes(SECRET_NOTE)
    ? ok("admin CAN see the counsellor note")
    : bad("admin cannot see their own note", `status ${adminDetail.status}`);
  adminDetail.body.includes(String(SECRET_BUDGET))
    ? ok("admin CAN see the budget")
    : bad("admin cannot see the budget");

  console.log("\n── The privacy boundary: agent's own pages ──");
  const agentList = await html("/agent/students", agentCookie);
  agentList.status === 200 && agentList.body.includes("Lifecycle Student")
    ? ok("agent sees their referral")
    : bad("agent cannot see their referral", `status ${agentList.status}`);
  agentList.body.includes("met at college fair")
    ? ok("agent sees their own remarks")
    : bad("agent's own remarks missing");

  for (const [what, needle] of [
    ["counsellor note", SECRET_NOTE],
    ["budget", String(SECRET_BUDGET)],
    ["passport number", "X1234567"],
    // Needles must be distinctive. A bare "7.5" matches Tailwind spacing
    // classes (px-7.5), and "IELTS" matched the public footer's coaching link
    // back when the marketing chrome rendered inside the portal — both would
    // report a leak that was not one. Assert on the stored VALUE instead.
    ["english test score", SECRET_SCORE],
  ]) {
    const i = agentList.body.indexOf(needle);
    i === -1
      ? ok(`agent page does not expose the ${what}`)
      : bad(
          `LEAK: agent page exposes the ${what}`,
          `…${agentList.body.slice(Math.max(0, i - 60), i + needle.length + 40).replace(/\s+/g, " ")}…`
        );
  }

  const agentDash = await html("/agent/dashboard", agentCookie);
  !agentDash.body.includes(SECRET_NOTE)
    ? ok("agent dashboard does not expose the counsellor note")
    : bad("LEAK: agent dashboard exposes the counsellor note");

  console.log("\n── Enrolment mints the commission ──");
  await db.query("update public.leads set stage_key='enrolled' where id=$1", [leadId]);
  const c = await db.query("select amount, status from public.commissions where lead_id=$1", [leadId]);
  c.rows.length === 1 && Number(c.rows[0].amount) === 15000
    ? ok("commission created at the agent's flat rate", `₹${c.rows[0].amount} ${c.rows[0].status}`)
    : bad("commission accrual", JSON.stringify(c.rows));

  const agentComm = await html("/agent/commissions", agentCookie);
  agentComm.status === 200 && agentComm.body.includes("15,000")
    ? ok("agent sees the commission amount on their ledger")
    : bad("agent commission ledger", `status ${agentComm.status}`);
  agentComm.body.includes("Earned")
    ? ok("agent sees it as Earned, not payable yet")
    : bad("commission status not shown to the agent");

  console.log("\n── Attribution locks once money exists ──");
  const relink = await db
    .query("update public.leads set agent_id=null where id=$1", [leadId])
    .then(() => "allowed-at-db")
    .catch((e) => e.code);
  // The DB permits it for an admin; the guard is in the action, so assert the
  // UI reflects the lock instead.
  await db.query("update public.leads set agent_id=$2 where id=$1", [leadId, agentId]);
  const detail2 = await html(`/admin/students/${leadId}`, adminCookie);
  detail2.body.includes("attribution can no longer change")
    ? ok("admin UI locks agent re-attribution after a commission exists")
    : bad("re-attribution lock not shown", `db said: ${relink}`);

  console.log("\n── Stage history is recorded automatically ──");
  const hist = await db.query(
    "select from_stage, to_stage from public.lead_stage_history where lead_id=$1 order by changed_at",
    [leadId]
  );
  hist.rows.length >= 2 && hist.rows.at(-1).to_stage === "enrolled"
    ? ok("history captured creation and the enrolment", `${hist.rows.length} entries`)
    : bad("stage history", JSON.stringify(hist.rows));
} catch (err) {
  console.error("\nHARNESS ERROR:", err.message);
  fail++;
} finally {
  if (agentId) await destroyAgent(agentId);
  await db.end().catch(() => {});
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
}
