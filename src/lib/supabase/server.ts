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
  // Read cookies FIRST, before validating configuration.
  //
  // Order matters at build time. cookies() is a request-time API, and
  // touching it is what marks the route dynamic. When the env check threw
  // first, a deploy with missing variables never reached this line, so Next
  // still believed the route was static and turned a configuration problem
  // into a hard prerender failure:
  //   Error occurred prerendering page "/admin/agents"
  // Reading cookies first means a misconfigured deploy fails at request time
  // with a legible 500 instead of breaking the build.
  //
  // Next 16: cookies() is async-only — synchronous access was removed.
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

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
