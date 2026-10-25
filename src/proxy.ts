import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts` and the exported function
 * from `middleware` to `proxy`. The runtime is nodejs and is not
 * configurable (edge is unsupported here).
 *
 * This is an OPTIMISTIC gate only. It checks nothing but the presence of a
 * session cookie, because it runs on every matched request including
 * prefetches — the Next auth guide is explicit that proxy must not do data
 * work. A forged `sb-*-auth-token` cookie passes here and is then rejected by
 * the DAL (which verifies the JWT signature) and by Postgres RLS.
 */

// Supabase chunks oversized access tokens across `...-auth-token.0`, `.1`, …
const SUPABASE_AUTH_COOKIE = /^sb-.+-auth-token(\.\d+)?$/;

const ADMIN_LOGIN = "/admin/login";
const AGENT_LOGIN = "/agent";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasSession = request.cookies
    .getAll()
    .some((cookie) => SUPABASE_AUTH_COOKIE.test(cookie.name));

  const isAgentArea = pathname === "/agent" || pathname.startsWith("/agent/");
  const isLoginPage = pathname === ADMIN_LOGIN || pathname === AGENT_LOGIN;

  if (!hasSession) {
    if (isLoginPage) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = isAgentArea ? AGENT_LOGIN : ADMIN_LOGIN;
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // Deliberately NOT redirecting away from a login page when a cookie is
  // present.
  //
  // Doing so caused an infinite redirect loop: a stale or invalid
  // sb-*-auth-token satisfies this cookie-presence check, so proxy sent the
  // browser to /admin, while the DAL correctly judged the session invalid and
  // sent it back to /admin/login — for ever, with Chrome showing
  // ERR_TOO_MANY_REDIRECTS. Two authorities disagreeing about one question.
  //
  // The "already signed in, skip the form" nicety now lives on the login
  // pages themselves, where verifySession() decides — the same authority the
  // dashboards use, so the two can never contradict each other.
  return NextResponse.next();
}

// Must be a statically analysable constant — it cannot be built from env
// vars. Without a matcher, proxy would also run on _next/static and public/,
// redirecting the app's own CSS and images.
export const config = {
  matcher: ["/admin", "/admin/:path*", "/agent", "/agent/:path*"],
};
