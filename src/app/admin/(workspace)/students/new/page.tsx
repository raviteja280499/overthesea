import { AdminLeadForm } from "@/components/admin/AdminLeadForm";
import { listAgents } from "@/lib/data/agents";

export const metadata = { title: "Add Student · Over The Sea Admin" };

export default async function NewStudentPage() {
  const agents = await listAgents();

  return (
    <AdminLeadForm
      agents={agents
        .filter((a) => a.status === "active")
        .map((a) => ({
          id: a.id,
          full_name: a.full_name,
          commission_type: a.commission_type,
          commission_value: a.commission_value,
        }))}
    />
  );
}
