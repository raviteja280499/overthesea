import { AgentRoster } from "@/components/admin/AgentRoster";
import { countOrphanedAuthUsers, listAgents } from "@/lib/data/agents";

export const metadata = { title: "Agents · Over The Sea Admin" };

/**
 * Server Component: data is fetched here, behind the layout's requireAdmin()
 * guard, so there is no client-side fetch and no API URL to leave unguarded.
 */
export default async function AgentsPage() {
  const [agents, orphanCount] = await Promise.all([listAgents(), countOrphanedAuthUsers()]);

  return <AgentRoster agents={agents} orphanCount={orphanCount} />;
}
