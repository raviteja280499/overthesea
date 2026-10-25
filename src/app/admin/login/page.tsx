import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { verifySession } from "@/lib/auth/dal";

// Reads the session cookie to skip the form when already signed in.
export const dynamic = "force-dynamic";

export const metadata = { title: "Sign in · Over The Sea Admin" };

/**
 * Server wrapper whose only job is the "already signed in, skip the form"
 * shortcut.
 *
 * This check MUST live here rather than in proxy.ts. Proxy can only see that
 * a cookie exists; verifySession() actually verifies the JWT and the profile.
 * When proxy made this decision, a stale cookie made the two disagree and the
 * browser bounced between /admin and /admin/login until Chrome gave up with
 * ERR_TOO_MANY_REDIRECTS. One authority, one answer.
 */
export default async function AdminLoginPage() {
  const user = await verifySession();
  if (user) redirect(user.role === "admin" ? "/admin" : "/agent/dashboard");

  return <AdminLoginForm />;
}
