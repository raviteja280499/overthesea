#!/usr/bin/env node
/**
 * End-to-end auth routing tests against a running dev server.
 *
 * Session cookies are produced by @supabase/ssr itself (via createServerClient
 * with an in-memory cookie jar) rather than hand-built, so they are byte-identical
 * to what a real browser would carry — including base64 encoding and chunking.
 *
 *   BASE=http://localhost:3001 node scripts/test-auth-e2e.mjs
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
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const PUBKEY = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const sb = createClient(URL_, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const db = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });

let pass = 0, fail = 0;
const ok = (n, d = "") => (pass++, console.log(`  PASS  ${n}${d ? ` — ${d}` : ""}`));
const bad = (n, d = "") => (fail++, console.log(`  FAIL  ${n}${d ? ` — ${d}` : ""}`));

/** Sign in and capture the exact cookies @supabase/ssr would set. */
async function sessionCookies(email, password) {
  const jar = new Map();
  const client = createServerClient(URL_, PUBKEY, {
    cookies: {
      getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
      setAll: (list) => list.forEach(({ name, value }) => jar.set(name, value)),
    },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`sign-in failed for ${email}: ${error.message}`);
  return [...jar.entries()].map(([n, v]) => `${n}=${encodeURIComponent(v)}`).join("; ");
}

/** Follow no redirects: we care about the raw routing decision. */
async function visit(path, cookie) {
  const res = await fetch(`${BASE}${path}`, {
    redirect: "manual",
    headers: cookie ? { cookie } : {},
  });
  const body = res.status === 200 ? await res.text() : "";
  return {
    status: res.status,
    location: res.headers.get("location"),
    body,
  };
}

async function expectRedirect(name, path, cookie, toContains) {
  const r = await visit(path, cookie);
  if (r.status >= 300 && r.status < 400 && (r.location ?? "").includes(toContains)) {
    return ok(name, `${r.status} -> ${r.location}`);
  }
  bad(name, `got ${r.status} ${r.location ?? ""} (${r.body.length} bytes)`);
}

async function expectOk(name, path, cookie, mustContain) {
  const r = await visit(path, cookie);
  if (r.status !== 200) return bad(name, `got ${r.status} -> ${r.location ?? ""}`);
  if (mustContain && !r.body.includes(mustContain))
    return bad(name, `200 but missing "${mustContain}"`);
  ok(name, `200${mustContain ? `, contains "${mustContain}"` : ""}`);
}

const TEST_EMAIL = "e2e-agent@example.com";
const TEMP_PW = "TempPassword123!x";
let agentId = null;

async function destroyAgent(id) {
  await db.query("alter table public.commissions disable trigger trg_commissions_no_delete");
  try {
    for (const s of [
      "delete from public.commissions where agent_id=$1",
      "delete from public.lead_stage_history where lead_id in (select id from public.leads where agent_id=$1)",
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

  // Clean any leftovers so this is re-runnable.
  const { rows: old } = await db.query("select id from public.profiles where email=$1", [TEST_EMAIL]);
  for (const r of old) await destroyAgent(r.id);
  const { data: list } = await sb.auth.admin.listUsers({ perPage: 200 });
  for (const u of list?.users ?? []) if (u.email === TEST_EMAIL) await sb.auth.admin.deleteUser(u.id);

  console.log(`Target: ${BASE}\n`);

  // Mirrors exactly what the createAgent server action does.
  const { data: created, error } = await sb.auth.admin.createUser({
    email: TEST_EMAIL, password: TEMP_PW, email_confirm: true, app_metadata: { role: "agent" },
  });
  if (error) throw new Error(error.message);
  agentId = created.user.id;
  await db.query(
    `insert into public.profiles (id, role, status, full_name, email, commission_type, commission_value, must_change_password)
     values ($1,'agent','active','E2E Agent',$2,'flat',10000,true)`,
    [agentId, TEST_EMAIL]
  );

  const agentCookie = await sessionCookies(TEST_EMAIL, TEMP_PW);
  const adminCookie = await sessionCookies(env.ADMIN_EMAIL, env.ADMIN_PASSWORD);

  console.log("── Anonymous ──");
  await expectRedirect("anon /admin/agents -> login", "/admin/agents", null, "/admin/login");
  await expectRedirect("anon /agent/dashboard -> /agent", "/agent/dashboard", null, "/agent");
  await expectOk("anon /agent (login page) renders", "/agent", null, "Agent Portal");

  console.log("");
  console.log("-- Stale cookie must not cause a redirect loop --");
  // Regression. proxy once bounced any request carrying an sb-*-auth-token
  // off the login page, while the DAL judged that session invalid and bounced
  // it straight back: an infinite loop that surfaced as
  // ERR_TOO_MANY_REDIRECTS and made the whole admin area unreachable. The
  // already-signed-in shortcut now lives on the login pages, decided by
  // verifySession(), so the two can no longer disagree.
  const ref = new URL(URL_).hostname.split(".")[0];
  const stale = `sb-${ref}-auth-token=base64-eyJmYWtlIjoidG9rZW4ifQ`;

  for (const [label, path] of [
    ["/admin", "/admin"],
    ["/agent/dashboard", "/agent/dashboard"],
  ]) {
    // follow mode: a loop exhausts the redirect limit and throws/fails here
    const r = await fetch(`${BASE}${path}`, { headers: { cookie: stale } }).catch(() => null);
    r && r.ok
      ? ok(`${label} with a stale cookie settles on a login page`, `final ${r.status}`)
      : bad(`${label} with a stale cookie`, r ? `status ${r.status}` : "redirect loop");
  }

  for (const [label, path] of [
    ["/admin/login", "/admin/login"],
    ["/agent", "/agent"],
  ]) {
    const r = await fetch(`${BASE}${path}`, { headers: { cookie: stale }, redirect: "manual" });
    r.status === 200
      ? ok(`${label} still renders with a stale cookie`)
      : bad(`${label} with a stale cookie`, `status ${r.status} -> ${r.headers.get("location")}`);
  }

  console.log("");
  console.log("-- A valid session skips the login form --");
  {
    const r = await fetch(`${BASE}/admin/login`, {
      headers: { cookie: adminCookie },
      redirect: "manual",
    });
    r.status >= 300 && (r.headers.get("location") ?? "").includes("/admin")
      ? ok("signed-in admin is sent from /admin/login to the dashboard")
      : bad("already-signed-in shortcut", `status ${r.status}`);
  }


  console.log("\n── Agent with a temporary password ──");
  await expectRedirect("forced to change password", "/agent/dashboard", agentCookie, "/agent/change-password");
  await expectRedirect("every portal page is locked", "/agent/students", agentCookie, "/agent/change-password");
  await expectOk("change-password page itself renders", "/agent/change-password", agentCookie, "Set your password");

  console.log("\n── Role separation ──");
  await expectRedirect("agent cannot reach /admin", "/admin", agentCookie, "/agent");
  await expectRedirect("agent cannot reach /admin/agents", "/admin/agents", agentCookie, "/agent");

  console.log("\n── Admin ──");
  await expectOk("admin reaches the agents roster", "/admin/agents", adminCookie, "Referral Network");
  await expectOk("admin reaches the dashboard", "/admin", adminCookie, null);
  await expectRedirect("admin cannot use the agent portal", "/agent/dashboard", adminCookie, "/admin");

  console.log("\n── After the password is changed ──");
  await db.query("update public.profiles set must_change_password=false where id=$1", [agentId]);
  await expectOk("agent reaches their dashboard", "/agent/dashboard", agentCookie, "Welcome back");
  await expectOk("agent reaches My Students", "/agent/students", agentCookie, "My Students");
  await expectOk("agent reaches Commissions", "/agent/commissions", agentCookie, "Commissions");

  console.log("\n── Suspension revokes access immediately ──");
  await db.query("update public.profiles set status='suspended' where id=$1", [agentId]);
  await expectRedirect("suspended agent is locked out", "/agent/dashboard", agentCookie, "/agent");
} catch (err) {
  console.error("\nHARNESS ERROR:", err.message);
  fail++;
} finally {
  if (agentId) await destroyAgent(agentId);
  await db.end().catch(() => {});
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
}
