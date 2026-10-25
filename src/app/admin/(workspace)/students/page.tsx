import { StudentPipeline } from "@/components/admin/StudentPipeline";
import { getPipelineCounts, listLeads, getStages } from "@/lib/data/leads";
import { listAgents } from "@/lib/data/agents";

export const metadata = { title: "Students · Over The Sea Admin" };

/**
 * Filters live in the URL, not component state: the Server Component
 * re-queries on navigation, which removes the loading-state machinery and
 * makes a filtered view linkable and bookmarkable.
 *
 * Next 16: searchParams is a Promise and must be awaited.
 */
export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; agent?: string; q?: string; archived?: string }>;
}) {
  const sp = await searchParams;
  const archived = sp.archived === "1";

  const [leads, stages, counts, agents] = await Promise.all([
    listLeads({
      stage: sp.stage,
      agentId: sp.agent,
      q: sp.q,
      archived,
    }),
    getStages("education"),
    getPipelineCounts("education"),
    listAgents(),
  ]);

  return (
    <StudentPipeline
      leads={leads}
      stages={stages}
      counts={counts}
      agents={agents.map((a) => ({ id: a.id, full_name: a.full_name }))}
      filters={{
        stage: sp.stage ?? "all",
        agent: sp.agent ?? "all",
        q: sp.q ?? "",
        archived,
      }}
    />
  );
}
