import { requireAgent } from "@/lib/auth/dal";
import { ChangePasswordForm } from "@/components/agent/ChangePasswordForm";

export const metadata = { title: "Change password · Over The Sea" };

/**
 * Sits OUTSIDE the (portal) route group on purpose.
 *
 * The portal layout calls requireAgent(), which redirects here whenever
 * must_change_password is set — so if this page lived inside the group it
 * would redirect to itself forever. `allowPasswordChange` makes this the one
 * authenticated page reachable while the flag is still set.
 */
export default async function ChangePasswordPage() {
  const user = await requireAgent({ allowPasswordChange: true });

  return (
    <div className="fixed inset-0 z-[100] flex w-full items-center justify-center overflow-y-auto bg-[#faf9ff] p-4 font-sans antialiased">
      <ChangePasswordForm
        email={user.email}
        forced={user.mustChangePassword}
        fullName={user.fullName}
      />
    </div>
  );
}
