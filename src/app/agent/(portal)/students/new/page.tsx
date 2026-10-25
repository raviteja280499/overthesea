import { requireAgent } from "@/lib/auth/dal";
import { AgentLeadForm } from "@/components/agent/AgentLeadForm";

export const metadata = { title: "Refer a student · Over The Sea Agent" };

export default async function NewStudentPage() {
  await requireAgent();
  return <AgentLeadForm />;
}
