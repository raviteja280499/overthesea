"use client";

import { useActionState } from "react";
import { KeyRound, Loader2, ShieldAlert } from "lucide-react";

import { changePassword } from "@/lib/auth/actions";
import type { ActionResult } from "@/lib/actions/result";

const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-[#1e1b4b] outline-none transition focus:border-[#6355d8] focus:ring-2 focus:ring-[#6355d8]/15";

export function ChangePasswordForm({
  email,
  fullName,
  forced,
}: {
  email: string;
  fullName: string;
  forced: boolean;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    changePassword,
    null
  );
  const fieldErrors = state && !state.success ? state.fieldErrors : undefined;

  const err = (name: string) => fieldErrors?.[name]?.[0];

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6355d8] text-white shadow-lg shadow-[#6355d8]/30">
          <KeyRound className="h-5.5 w-5.5" />
        </div>
        <h1 className="mt-4 text-lg font-extrabold tracking-tight text-[#1e1b4b]">
          {forced ? "Set your password" : "Change password"}
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Signed in as {fullName} · {email}
        </p>
      </div>

      <form action={action} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        {forced && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
            <p className="text-[11px] leading-relaxed text-amber-800">
              You are using a temporary password issued by your administrator. Choose your
              own before continuing — the rest of the portal is locked until you do.
            </p>
          </div>
        )}

        {state && !state.success && !fieldErrors && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
            {state.error}
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            {forced ? "Temporary password" : "Current password"}
          </span>
          <input
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className={inputCls}
          />
          {err("currentPassword") && (
            <span className="text-[11px] font-semibold text-rose-600">
              {err("currentPassword")}
            </span>
          )}
        </label>

        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            New password
          </span>
          <input
            name="newPassword"
            type="password"
            required
            autoComplete="new-password"
            className={inputCls}
          />
          {err("newPassword") ? (
            <span className="text-[11px] font-semibold text-rose-600">{err("newPassword")}</span>
          ) : (
            <span className="text-[11px] text-slate-400">At least 10 characters.</span>
          )}
        </label>

        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Confirm new password
          </span>
          <input
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className={inputCls}
          />
          {err("confirmPassword") && (
            <span className="text-[11px] font-semibold text-rose-600">
              {err("confirmPassword")}
            </span>
          )}
        </label>

        <button
          type="submit"
          disabled={pending}
          className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#6355d8] py-3 text-xs font-bold text-white transition-colors hover:bg-[#5244c7] disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
