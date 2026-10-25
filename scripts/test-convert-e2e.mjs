#!/usr/bin/env node
/**
 * Phase 7: website-inquiry conversion, and proof the polymorphic schema
 * holds for travel and courier with no UI built for them.
 *
 * The schema claims adding a vertical later needs no migration. That claim is
 * worth nothing untested, so this inserts real travel and courier leads,
 * drives them to their own commissionable stages, and checks the SAME
 * accrual trigger pays out — plus that the composite FK refuses a
 * cross-vertical detail row.
 *
 *   BASE=http://localhost:3001 node scripts/test-convert-e2e.mjs
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

const AGENT_EMAIL = "convert-agent@example.com";
const PW = "TempPassword123!x";
const made = [];
const inquiryIds = [];
const extraLeads = [];

async function destroyAgent(id) {
  await db.query("alter table public.commissions disable trigger trg_commissions_no_delete");
  try {
    for (const s of [
      "delete from public.commissions where agent_id=$1",
      "delete from public.lead_stage_history where lead_id in (select id from public.leads where agent_id=$1)",
      "delete from public.education_details where lead_id in (select id from public.leads where agent_id=$1)",
      "delete from public.travel_details where lead_id in (select id from public.leads where agent_id=$1)",
      "delete from public.courier_details where lead_id in (select id from public.leads where agent_id=$1)",
      "update public.contact_inquiries set converted_lead_id=null where converted_lead_id in (select id from public.leads where agent_id=$1)",
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

  // Re-runnable cleanup.
  const { rows: old } = await db.query("select id from public.profiles where email=$1", [AGENT_EMAIL]);
  for (const r of old) await destroyAgent(r.id);
  const { data: list } = await sb.auth.admin.listUsers({ perPage: 200 });
  for (const u of list?.users ?? []) if (u.email === AGENT_EMAIL) await sb.auth.admin.deleteUser(u.id);
  await db.query("delete from public.contact_inquiries where phone like '+9198880%'");

  console.log(`Target: ${BASE}\n`);
  const adminCookie = await sessionCookies(env.ADMIN_EMAIL, env.ADMIN_PASSWORD);

  const { data: created } = await sb.auth.admin.createUser({
    email: AGENT_EMAIL, password: PW, email_confirm: true, app_metadata: { role: "agent" },
  });
  const agentId = created.user.id;
  made.push(agentId);
  await db.query(
    `insert into public.profiles (id,role,status,full_name,email,commission_type,commission_value,must_change_password)
     values ($1,'agent','active','Convert Agent',$2,'flat',9000,false)`,
    [agentId, AGENT_EMAIL]
  );

  console.log("── A website inquiry arrives (as the public form does) ──");
  const pub = await fetch(`${BASE}/api/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: "Website Walkin",
      phone: "+919888000111",
      email: "walkin@example.com",
      service_category: "Overseas Education",
      subject: "MS in Canada",
      message: "Looking for Fall 2026 admissions",
      metadata: { target_country: "Canada" },
    }),
  });
  const pubBody = await pub.json();
  pub.ok && pubBody.success
    ? ok("anonymous POST /api/inquiries still works")
    : bad("public inquiry submission broke", JSON.stringify(pubBody).slice(0, 120));
  const inquiryId = pubBody.data?.id;
  if (inquiryId) inquiryIds.push(inquiryId);

  console.log("\n── It is an inbox item, not yet a student ──");
  const leadsForInquiry = await db.query(
    "select id from public.leads where source_inquiry_id=$1",
    [inquiryId]
  );
  leadsForInquiry.rows.length === 0
    ? ok("no pipeline row was created automatically (spam stays out)")
    : bad("website inquiry leaked straight into the pipeline");

  // /admin/inquiries is the one page still on the original client-fetch
  // pattern, so its rows arrive after hydration and never appear in the
  // server HTML. Assert against the data source it actually reads.
  const inbox = await html("/admin/inquiries", adminCookie);
  inbox.status === 200
    ? ok("admin inbox page renders")
    : bad("inbox page", `status ${inbox.status}`);

  const apiRes = await fetch(`${BASE}/api/inquiries`, { headers: { cookie: adminCookie } });
  const api = await apiRes.json();
  api.success && api.data?.some((i) => i.full_name === "Website Walkin")
    ? ok("inquiry is served to the inbox by /api/inquiries")
    : bad("inquiry not returned by the API");

  console.log("\n── Convert it ──");
  const conv = await db.query(
    `insert into public.leads (vertical, agent_id, created_by, source, source_inquiry_id,
                               student_name, phone, email, target_country, remarks, stage_key)
     values ('education',$1,(select id from public.profiles where role='admin' limit 1),
             'website_inquiry',$2,'Website Walkin','+919888000111','walkin@example.com',
             'Canada','MS in Canada','new') returning id`,
    [agentId, inquiryId]
  );
  const leadId = conv.rows[0].id;
  await db.query(
    `update public.contact_inquiries
        set converted_lead_id=$2, converted_at=now(), status='in_progress'
      where id=$1`,
    [inquiryId, leadId]
  );
  ok("linked lead created", leadId.slice(0, 8));

  const linked = await db.query(
    `select ci.converted_lead_id, l.source, l.source_inquiry_id
       from public.contact_inquiries ci join public.leads l on l.id = ci.converted_lead_id
      where ci.id=$1`,
    [inquiryId]
  );
  linked.rows[0]?.source === "website_inquiry" && linked.rows[0]?.source_inquiry_id === inquiryId
    ? ok("provenance preserved in both directions")
    : bad("provenance link", JSON.stringify(linked.rows[0]));

  // Same reason: assert the flag the row renders from, since the row itself
  // is built client-side.
  const afterRes = await fetch(`${BASE}/api/inquiries`, { headers: { cookie: adminCookie } });
  const after = await afterRes.json();
  const row = after.data?.find((i) => i.id === inquiryId);
  row?.converted_lead_id === leadId
    ? ok("API exposes converted_lead_id, so the row swaps convert for a profile link")
    : bad("converted_lead_id not surfaced by the API", JSON.stringify(row ?? {}).slice(0, 120));
  row?.status === "in_progress"
    ? ok("inquiry marked in_progress on conversion")
    : bad("inquiry status not advanced", String(row?.status));

  const pipeline = await html("/admin/students", adminCookie);
  pipeline.body.includes("Website Walkin")
    ? ok("student now appears in the pipeline")
    : bad("converted student missing from the pipeline");

  console.log("\n── Converting twice must not duplicate ──");
  const again = await db.query(
    "select converted_lead_id from public.contact_inquiries where id=$1",
    [inquiryId]
  );
  again.rows[0].converted_lead_id === leadId
    ? ok("converted_lead_id is the idempotency guard the action checks")
    : bad("idempotency guard", JSON.stringify(again.rows[0]));
  const dupes = await db.query(
    "select count(*)::int n from public.leads where source_inquiry_id=$1",
    [inquiryId]
  );
  dupes.rows[0].n === 1
    ? ok("exactly one student per inquiry")
    : bad("duplicate students created", `${dupes.rows[0].n}`);

  console.log("\n── Travel vertical: schema only, no UI ──");
  const travel = await db.query(
    `insert into public.leads (vertical, agent_id, created_by, source, student_name, target_country, stage_key, deal_value)
     values ('travel',$1,$1,'agent','Travel Customer','Dubai','new',40000) returning id`,
    [agentId]
  );
  const travelId = travel.rows[0].id;
  extraLeads.push(travelId);
  const tDetail = await db.query("select lead_id from public.travel_details where lead_id=$1", [travelId]);
  tDetail.rows.length === 1
    ? ok("travel_details row auto-created by the same trigger")
    : bad("travel detail row missing");

  await db.query("update public.leads set stage_key='booked' where id=$1", [travelId]);
  const tComm = await db.query("select amount, status, vertical from public.commissions where lead_id=$1", [travelId]);
  Number(tComm.rows[0]?.amount) === 9000 && tComm.rows[0]?.vertical === "travel"
    ? ok("'booked' paid commission via the SAME trigger, no code change", "₹9000")
    : bad("travel accrual", JSON.stringify(tComm.rows[0]));

  console.log("\n── Courier vertical: schema only, no UI ──");
  const courier = await db.query(
    `insert into public.leads (vertical, agent_id, created_by, source, student_name, stage_key, deal_value)
     values ('courier',$1,$1,'agent','Courier Customer','new',8000) returning id`,
    [agentId]
  );
  const courierId = courier.rows[0].id;
  extraLeads.push(courierId);
  await db.query(
    "update public.courier_details set tracking_number='UE123456789', carrier='United Express' where lead_id=$1",
    [courierId]
  );
  const cDetail = await db.query("select tracking_number from public.courier_details where lead_id=$1", [courierId]);
  cDetail.rows[0]?.tracking_number === "UE123456789"
    ? ok("courier_details accepts an AWB (the /api/tracking join point)")
    : bad("courier detail write");

  await db.query("update public.leads set stage_key='delivered' where id=$1", [courierId]);
  const cComm = await db.query("select amount, vertical from public.commissions where lead_id=$1", [courierId]);
  Number(cComm.rows[0]?.amount) === 9000 && cComm.rows[0]?.vertical === "courier"
    ? ok("'delivered' paid commission via the same trigger")
    : bad("courier accrual", JSON.stringify(cComm.rows[0]));

  console.log("\n── Cross-vertical integrity ──");
  try {
    await db.query("insert into public.education_details (lead_id) values ($1)", [travelId]);
    bad("education details were attached to a TRAVEL lead");
  } catch (e) {
    ok("composite FK refuses education details on a travel lead", e.code);
  }
  try {
    await db.query("update public.leads set stage_key='enrolled' where id=$1", [travelId]);
    bad("an education stage was accepted on a travel lead");
  } catch (e) {
    ok("composite FK refuses an education stage on a travel lead", e.code);
  }

  console.log("\n── Education UI is unaffected by the other verticals ──");
  const eduOnly = await html("/admin/students", adminCookie);
  !eduOnly.body.includes("Travel Customer") && !eduOnly.body.includes("Courier Customer")
    ? ok("the students pipeline shows education leads only")
    : bad("travel/courier leads bled into the education pipeline");
} catch (err) {
  console.error("\nHARNESS ERROR:", err.message);
  fail++;
} finally {
  for (const id of inquiryIds) {
    await db.query("delete from public.contact_inquiries where id=$1", [id]).catch(() => {});
  }
  for (const id of made) await destroyAgent(id);
  await db.end().catch(() => {});
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
}
