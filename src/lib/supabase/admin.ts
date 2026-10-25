import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client. BYPASSES RLS ENTIRELY.
 *
 * Legitimate call sites are only:
 *   1. auth.admin.createUser / updateUserById / deleteUser  (agent provisioning)
 *   2. clearing profiles.must_change_password after a forced change
 *   3. the public POST /api/inquiries insert
 *   4. /api/admin/bootstrap
 *
 * Everything else must use createServerSupabase() so RLS applies.
 */
export function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Deliberately no fallback to the publishable key. The previous
  // `SERVICE_ROLE || PUBLIC` default meant a missing service key silently
  // produced an anon client, which with RLS enabled reads as "0 rows" rather
  // than as the configuration error it actually is.
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are required for administrative Supabase access."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
