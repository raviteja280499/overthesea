import { notFound } from "next/navigation";

import { AgentDetailView } from "@/components/admin/AgentDetailView";
import { getAgent } from "@/lib/data/agents";

export const metadata = { title: "Agent · Over The Sea Admin" };

/**
 * Next 16: `params` is a Promise — synchronous access was removed in this
 * major, so it must be awaited.
 */
export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getAgent(id);
  if (!detail) notFound();

  return <AgentDetailView detail={detail} />;
}
