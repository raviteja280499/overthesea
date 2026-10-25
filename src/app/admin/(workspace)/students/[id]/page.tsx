import { notFound } from "next/navigation";

import { StudentDetailView } from "@/components/admin/StudentDetailView";
import { getLead } from "@/lib/data/leads";

export const metadata = { title: "Student · Over The Sea Admin" };

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getLead(id);
  if (!detail) notFound();

  return <StudentDetailView detail={detail} />;
}
