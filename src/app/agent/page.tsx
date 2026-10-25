import { redirect } from "next/navigation";

import { AgentLoginForm } from "@/components/agent/AgentLoginForm";
import { verifySession } from "@/lib/auth/dal";

// Reads the session cookie to skip the form when already signed in.
export const dynamic = "force-dynamic";

export const metadata = { title: "Agent sign in · Over The Sea" };

/**
 * Agent sign-in. Same reasoning as the admin login wrapper: the
 * already-signed-in shortcut is decided by verifySession(), never by
 * cookie presence in proxy, so a stale cookie cannot create a redirect loop.
 */
export default async function AgentLoginPage() {
  const user = await verifySession();
  if (user) {
    if (user.role === "admin") redirect("/admin");
    redirect(user.mustChangePassword ? "/agent/change-password" : "/agent/dashboard");
  }

  return <AgentLoginForm />;
}
