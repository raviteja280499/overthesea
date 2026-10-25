import { requireAgent } from "@/lib/auth/dal";
import { AgentPortalShell } from "@/components/agent/AgentPortalShell";

/**
 * Never prerender or cache this subtree.
 *
 * Every page under it is per-user and auth-gated, so a cached copy would be
 * both wrong and a data leak. Declaring it explicitly also stops a build
 * ever attempting to statically generate these routes, which is what turned
 * missing environment variables into a failed deploy rather than a runtime
 * error.
 */
export const dynamic = "force-dynamic";

/**
 * Server Component guard for the agent portal.
 *
 * requireAgent() enforces three things before anything renders: a valid
 * session, the agent role (an admin landing here is bounced to /admin), and
 * an already-changed password — a temporary one redirects to
 * /agent/change-password, which lives outside this group so it can render.
 */
export default async function AgentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAgent();

  return (
    <AgentPortalShell user={{ fullName: user.fullName, email: user.email }}>
      {children}
    </AgentPortalShell>
  );
}
