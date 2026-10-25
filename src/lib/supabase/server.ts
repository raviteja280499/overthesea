import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * User-scoped Supabase client backed by the request's session cookies.
 *
 * This is the default for every CRM read and write: it carries the signed-in
 * user's JWT, so `auth.uid()` resolves inside Postgres and RLS actually
 * applies. The service-role client (./admin) bypasses RLS and is reserved for
 * the handful of provisioning calls that genuinely need it.
 */
export async function createServerSupabase(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  // Next 16: cookies() is async-only — synchronous access was removed.
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Writing cookies is only legal inside a Server Action or Route
          // Handler. During a Server Component render the store is read-only
          // and this throws, which is expected and harmless: the refreshed
          // token is persisted by the next action or route handler, and the
          // proxy refreshes on navigation.
        }
      },
    },
  });
}
