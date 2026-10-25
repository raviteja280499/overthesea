import fs from "node:fs";
const report = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const mine = ["lib/auth", "lib/actions", "lib/data", "lib/validation", "lib/supabase",
  "lib/constants", "components/agent", "AgentForm", "AgentRoster", "AgentDetail",
  "AdminSideNav", "AdminWorkspaceShell", "app/agent", "agents", "bootstrap", "proxy.ts"];
let n = 0;
for (const f of report) {
  const p = f.filePath.replaceAll("\\", "/");
  if (!mine.some((m) => p.includes(m)) || !f.messages.length) continue;
  console.log("\n" + (p.split("/src/")[1] ?? p));
  for (const m of f.messages) {
    n++;
    console.log(`  ${m.severity === 2 ? "ERROR" : "warn "} ${m.line}:${m.column} ${m.message} (${m.ruleId})`);
  }
}
console.log(`\nissues in new code: ${n}`);
