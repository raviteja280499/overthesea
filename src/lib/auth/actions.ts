"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { assertSession } from "@/lib/auth/dal";
import { ok, fail, withAction, type ActionResult } from "@/lib/actions/result";
import { getServiceClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { changePasswordSchema, signInSchema } from "@/lib/validation/auth";

/**
 * Sign in. Used by both /admin/login and /agent — one credential path for
 * both roles, since admin and agent are now both Supabase Auth users.
 */
export async function signIn(
  _prev: ActionResult<{ redirectTo: string }> | null,
  formData: FormData
): Promise<ActionResult<{ redirectTo: string }>> {
  const result = await withAction(async () => {
    const parsed = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      next: formData.get("next") || undefined,
    });

    if (!parsed.success) {
      return fail("Check the details below.", z.flattenError(parsed.error).fieldErrors);
    }

    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    // Deliberately generic: never reveal whether the address exists.
    if (error || !data.user) {
      return fail("Invalid email or password.");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status, must_change_password")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!profile) {
      // Orphaned auth user: exists in GoTrue, no profile row. Do not leave a
      // half-authenticated session lying around.
      await supabase.auth.signOut();
      return fail("This account is not fully set up. Contact your administrator.");
    }

    if (profile.status !== "active") {
      await supabase.auth.signOut();
      return fail("This account has been suspended.");
    }

    if (profile.role === "agent" && profile.must_change_password) {
      return ok({ redirectTo: "/agent/change-password" });
    }

    const fallback = profile.role === "admin" ? "/admin" : "/agent/dashboard";
    const next = parsed.data.next;

    // Only honour a `next` that belongs to this user's own area, so the
    // parameter cannot be used to bounce an agent towards /admin.
    const area = profile.role === "admin" ? "/admin" : "/agent";
    const redirectTo = next && next.startsWith(area) ? next : fallback;

    return ok({ redirectTo });
  });

  if (result.success && result.data) redirect(result.data.redirectTo);
  return result;
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function signOutAgent(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/agent");
}

/**
 * Forced first-login password change.
 *
 * `allowPasswordChange: true` is what lets this one action run while the
 * must_change_password flag is still set — every other action is blocked by
 * assertAgent() until the flag clears.
 */
export async function changePassword(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const result = await withAction(async () => {
    const user = await assertSession({ allowPasswordChange: true });

    const parsed = changePasswordSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      return fail("Check the details below.", z.flattenError(parsed.error).fieldErrors);
    }

    const supabase = await createServerSupabase();

    // Re-authenticate rather than trusting the session alone, so a borrowed
    // open tab cannot be used to seize the account.
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.currentPassword,
    });
    if (reauthError) {
      return fail("Your current password is incorrect.", {
        currentPassword: ["Your current password is incorrect."],
      });
    }

    // USER-scoped client, so a live session is required to change a password.
    const { error: updateError } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
    });
    if (updateError) {
      return fail(updateError.message || "Could not update your password.");
    }

    // must_change_password is a privileged column (blocked for non-admins by
    // trg_profiles_guard), so clearing it needs the service-role client.
    const admin = getServiceClient();
    const { error: flagError } = await admin
      .from("profiles")
      .update({
        must_change_password: false,
        password_changed_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (flagError) {
      console.error("[changePassword] failed to clear flag", flagError);
      return fail(
        "Password changed, but your account state did not update. Contact your administrator."
      );
    }

    return ok(undefined, "Password updated.");
  });

  if (result.success) redirect("/agent/dashboard");
  return result;
}
