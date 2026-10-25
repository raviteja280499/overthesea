import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createServerSupabase } from "@/lib/supabase/server";
import type { CommissionType, UserRole, UserStatus } from "@/lib/types/crm";

/**
 * Data Access Layer.
 *
 * This — not src/proxy.ts — is the authorization boundary. The proxy only
 * checks whether a session cookie is present, because it runs on prefetches
 * too; a forged cookie gets past it and is rejected here, where the JWT
 * signature is actually verified. RLS in Postgres is the final backstop.
 */

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  fullName: string;
  mustChangePassword: boolean;
  commissionType: CommissionType;
  commissionValue: number;
}

/**
 * Resolve the current user, or null.
 *
 * Memoized with React `cache()`, so a page whose layout and three components
 * each need the session pays for one verification per render pass. This is
 * deliberately NOT `unstable_cache` — that would cache one user's session and
 * hand it to the next request.
 */
export const verifySession = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createServerSupabase();

  // getClaims() verifies the JWT locally against the project's signing key.
  // (On projects still using legacy HS256 shared secrets it falls back to a
  // network getUser() call — enable asymmetric JWT signing keys in the
  // Supabase dashboard to keep this local.)
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || !userId) return null;

  // Read through the user's own JWT so profiles_select_self RLS applies.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id, email, role, status, full_name, must_change_password, commission_type, commission_value"
    )
    .eq("id", userId)
    .maybeSingle();

  // No profile => an orphaned auth user (GoTrue created, profile insert
  // failed). Treated as unauthenticated rather than as a partial admin.
  if (profileError || !profile) return null;
  if (profile.status !== "active") return null;

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    status: profile.status,
    fullName: profile.full_name,
    mustChangePassword: profile.must_change_password,
    commissionType: profile.commission_type,
    commissionValue: Number(profile.commission_value),
  };
});

/** For pages and layouts: redirects. */
export const requireAdmin = cache(async (): Promise<SessionUser> => {
  const user = await verifySession();
  if (!user) redirect("/admin/login");
  if (user.role !== "admin") redirect("/agent/dashboard");
  return user;
});

/** For pages and layouts: redirects. */
export async function requireAgent(
  opts: { allowPasswordChange?: boolean } = {}
): Promise<SessionUser> {
  const user = await verifySession();
  if (!user) redirect("/agent");
  if (user.role !== "agent") redirect("/admin");
  if (user.mustChangePassword && !opts.allowPasswordChange) {
    redirect("/agent/change-password");
  }
  return user;
}

/** For Server Actions and Route Handlers: throws instead of redirecting. */
export async function assertAdmin(): Promise<SessionUser> {
  const user = await verifySession();
  if (!user) throw new AuthError("Not authenticated", 401);
  if (user.role !== "admin") throw new AuthError("Forbidden", 403);
  return user;
}

/**
 * For Server Actions and Route Handlers: throws instead of redirecting.
 *
 * The must_change_password check lives here as well as in requireAgent so it
 * gates every action, not just a page render — otherwise an agent could skip
 * the change-password screen and POST actions directly while the temporary
 * password is still live.
 */
export async function assertAgent(
  opts: { allowPasswordChange?: boolean } = {}
): Promise<SessionUser> {
  const user = await verifySession();
  if (!user) throw new AuthError("Not authenticated", 401);
  if (user.role !== "agent") throw new AuthError("Forbidden", 403);
  if (user.mustChangePassword && !opts.allowPasswordChange) {
    throw new AuthError("Password change required", 403);
  }
  return user;
}

/** Either role; used by the change-password action. */
export async function assertSession(
  opts: { allowPasswordChange?: boolean } = {}
): Promise<SessionUser> {
  const user = await verifySession();
  if (!user) throw new AuthError("Not authenticated", 401);
  if (user.mustChangePassword && !opts.allowPasswordChange) {
    throw new AuthError("Password change required", 403);
  }
  return user;
}
