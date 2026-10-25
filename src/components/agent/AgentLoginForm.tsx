"use client";

import { useActionState } from "react";
import { Cloud, Loader2, LogIn, ShieldCheck } from "lucide-react";

import { signIn } from "@/lib/auth/actions";
import type { ActionResult } from "@/lib/actions/result";

/**
 * Agent sign-in.
 *
 * Deliberately has no sign-up link or password-reset link: accounts are
 * created by an administrator, and with no SMTP configured an admin-issued
 * reset is the only recovery path.
 */
export function AgentLoginForm() {
  const [state, action, pending] = useActionState<
    ActionResult<{ redirectTo: string }> | null,
    FormData
  >(signIn, null);

  return (
    <div className="fixed inset-0 z-[100] flex w-full items-center justify-center overflow-y-auto bg-[#faf9ff] p-4 font-sans antialiased">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6355d8] text-white shadow-lg shadow-[#6355d8]/30">
            <Cloud className="h-6 w-6 fill-white" />
          </div>
          <h1 className="mt-4 text-lg font-extrabold tracking-tight text-[#1e1b4b]">
            Over The Sea
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#6355d8]">
            Agent Portal
          </p>
        </div>

        <form
          action={action}
          className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          {state && !state.success && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
              {state.error}
            </div>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Email
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="you@institute.in"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-[#1e1b4b] outline-none transition focus:border-[#6355d8] focus:ring-2 focus:ring-[#6355d8]/15"
            />
          </label>

          <label className="mt-4 flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Password
            </span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-[#1e1b4b] outline-none transition focus:border-[#6355d8] focus:ring-2 focus:ring-[#6355d8]/15"
            />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#6355d8] py-3 text-xs font-bold text-white transition-colors hover:bg-[#5244c7] disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-3.5 w-3.5" />
            )}
            {pending ? "Signing in…" : "Sign in"}
          </button>

          <p className="mt-5 flex items-start gap-2 border-t border-slate-100 pt-4 text-[11px] leading-relaxed text-slate-400">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
            Accounts are created by Over The Sea. If you have lost your password, contact
            your administrator for a new one.
          </p>
        </form>
      </div>
    </div>
  );
}
