import "server-only";

import { AuthError } from "@/lib/auth/dal";

/**
 * Mirrors the `{ success, data, error }` envelope the existing API routes and
 * client components already use, so UI code ports across without rewriting
 * its `if (!res.success) throw new Error(res.error)` handling.
 */
export type ActionResult<T = undefined> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export function ok<T>(data?: T, message?: string): ActionResult<T> {
  return { success: true, data, message };
}

export function fail(
  error: string,
  fieldErrors?: Record<string, string[]>
): ActionResult<never> {
  return { success: false, error, fieldErrors };
}

/**
 * Single error funnel for every Server Action.
 *
 * Raw database text never reaches the browser: the previous `dbUnavailable()`
 * helper echoed Postgres messages straight out, which with RLS enabled would
 * start leaking policy names, column names and table structure. The real
 * error is logged server-side; the client gets a generic string.
 */
export async function withAction<T>(
  fn: () => Promise<ActionResult<T>>
): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AuthError) {
      return fail(
        err.status === 401
          ? "Your session has expired. Please sign in again."
          : "You are not allowed to perform this action."
      );
    }

    // redirect() and notFound() signal via a thrown control-flow error that
    // must be allowed to propagate.
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest?: unknown }).digest === "string" &&
      ((err as { digest: string }).digest.startsWith("NEXT_REDIRECT") ||
        (err as { digest: string }).digest === "NEXT_NOT_FOUND")
    ) {
      throw err;
    }

    console.error("[action]", err);
    return fail("Something went wrong. Please try again.");
  }
}
