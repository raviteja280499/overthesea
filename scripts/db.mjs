#!/usr/bin/env node
/**
 * Minimal SQL runner against SUPABASE_DB_URL from .env.local.
 *
 *   node scripts/db.mjs apply supabase/apply_all.sql   # run a .sql file
 *   node scripts/db.mjs q "select 1"                   # run an inline query
 *
 * Kept out of the Next build: this is a local operations tool, not app code.
 */
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

function loadEnv(file = ".env.local") {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

const env = { ...loadEnv(), ...process.env };
const connectionString = env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error(
    "SUPABASE_DB_URL is not set in .env.local.\n" +
      "Dashboard > Connect > Session pooler (port 5432), with your DB password substituted in."
  );
  process.exit(2);
}

const [, , cmd, arg] = process.argv;

let sql;
if (cmd === "apply") {
  if (!arg) {
    console.error("usage: node scripts/db.mjs apply <file.sql>");
    process.exit(2);
  }
  sql = fs.readFileSync(path.resolve(arg), "utf8");
  console.log(`Applying ${arg} (${sql.split("\n").length} lines)…`);
} else if (cmd === "q") {
  if (!arg) {
    console.error('usage: node scripts/db.mjs q "select 1"');
    process.exit(2);
  }
  sql = arg;
} else {
  console.error("usage: node scripts/db.mjs <apply <file.sql> | q <sql>>");
  process.exit(2);
}

const client = new pg.Client({
  connectionString,
  // Supabase terminates TLS with its own CA; verification is off here because
  // this is a local admin tool, not an app code path.
  ssl: { rejectUnauthorized: false },
  statement_timeout: 120_000,
});

try {
  await client.connect();
  const res = await client.query(sql);
  const results = Array.isArray(res) ? res : [res];

  for (const r of results) {
    if (r.rows?.length) console.table(r.rows);
    else if (r.command) console.log(`${r.command} ${r.rowCount ?? ""}`.trim());
  }
  console.log("OK");
} catch (err) {
  console.error(`\n${err.severity ?? "ERROR"}: ${err.message}`);
  if (err.position && typeof sql === "string") {
    const upto = sql.slice(0, Number(err.position));
    const line = upto.split("\n").length;
    console.error(`  at line ${line}`);
    console.error(`  > ${sql.split("\n")[line - 1]?.trim()}`);
  }
  if (err.detail) console.error(`  detail: ${err.detail}`);
  if (err.hint) console.error(`  hint: ${err.hint}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
