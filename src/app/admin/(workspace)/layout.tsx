import { requireAdmin } from "@/lib/auth/dal";
import { AdminWorkspaceShell } from "@/components/admin/AdminWorkspaceShell";

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
 * Server Component guard for the whole admin workspace.
 *
 * `/admin/login` deliberately lives OUTSIDE this (workspace) route group, so
 * it never hits this guard and cannot redirect-loop. Everything under the
 * group is authenticated by the time it renders — individual pages no longer
 * need their own `useEffect` auth check, and no admin HTML is ever streamed
 * to an anonymous request.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <AdminWorkspaceShell user={{ fullName: user.fullName, email: user.email }}>
      {children}
    </AdminWorkspaceShell>
  );
}
