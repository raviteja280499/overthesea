import { InquiriesWorkspace } from "@/components/admin/InquiriesWorkspace";
import { listAgents } from "@/lib/data/agents";

export const metadata = { title: "All Inquiries · Over The Sea Admin" };

/**
 * Thin server wrapper around the existing client workspace.
 *
 * Its only job is supplying the agent list for the convert-to-student dialog.
 * Fetching it here rather than from a new API route means no extra public URL
 * that someone has to remember to guard.
 */
export default async function InquiriesPage() {
  const agents = await listAgents();

  return (
    <InquiriesWorkspace
      agents={agents
        .filter((a) => a.status === "active")
        .map((a) => ({ id: a.id, full_name: a.full_name }))}
    />
  );
}
