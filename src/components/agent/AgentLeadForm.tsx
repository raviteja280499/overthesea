"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Info, Loader2, Plus, UserPlus } from "lucide-react";

import { createLeadAsAgent } from "@/lib/actions/leads";
import { STUDY_DESTINATIONS } from "@/lib/constants/countries";
import type { ActionResult } from "@/lib/actions/result";

const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-[#1e1b4b] outline-none transition focus:border-[#6355d8] focus:ring-2 focus:ring-[#6355d8]/15";

export function AgentLeadForm() {
  const [state, action, pending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(createLeadAsAgent, null);

  // Remount key for the form, bumped from a click handler rather than an
  // effect watching `state` (which would be a cascading render).
  const [formKey, setFormKey] = useState(0);

  // Which result the agent has already acknowledged. Compared by identity:
  // useActionState hands back a NEW object per submission, so the next
  // referral re-shows the confirmation while dismissing the current one
  // sticks. A counter would not work here — it would drift back into
  // alignment and hide the form permanently.
  const [acknowledged, setAcknowledged] = useState<ActionResult<{ id: string }> | null>(null);

  const fieldErrors = state && !state.success ? state.fieldErrors : undefined;
  const err = (n: string) => fieldErrors?.[n]?.[0];

  const justSaved = Boolean(state?.success) && acknowledged !== state;

  const referAnother = () => {
    setFormKey((k) => k + 1);
    setAcknowledged(state);
  };

  return (
    <div className="flex w-full flex-col gap-6 p-6 sm:p-8 lg:p-10">
      <Link
        href="/agent/students"
        className="flex w-fit items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-[#6355d8]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        My students
      </Link>

      <div className="max-w-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0edff] text-[#6355d8]">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#1e1b4b]">Refer a student</h1>
            <p className="text-xs text-slate-400">
              Just the basics — our counsellors take it from here.
            </p>
          </div>
        </div>

        {justSaved && state?.success && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
            <div className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div className="text-xs text-emerald-800">
                <p className="font-bold">{state.message}</p>
                <p className="mt-0.5 text-emerald-700">
                  You can track their progress under My Students.
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={referAnother}
                className="cursor-pointer rounded-lg bg-emerald-600 px-3.5 py-2 text-[11px] font-bold text-white transition-colors hover:bg-emerald-700"
              >
                Refer another student
              </button>
              <Link
                href="/agent/students"
                className="cursor-pointer rounded-lg border border-emerald-300 px-3.5 py-2 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                View my students
              </Link>
            </div>
          </div>
        )}

        {state && !state.success && !justSaved && (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
            {state.error}
          </div>
        )}

        <form
          key={formKey}
          action={action}
          hidden={justSaved}
          className="mt-5 rounded-3xl border border-slate-100 bg-white p-6"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Student name *
            </span>
            <input name="studentName" required className={inputCls} placeholder="Priya Sharma" />
            {err("studentName") && (
              <span className="text-[11px] font-semibold text-rose-600">{err("studentName")}</span>
            )}
          </label>

          <label className="mt-4 flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Phone
            </span>
            <input name="phone" className={inputCls} placeholder="+91 98765 43210" />
            {err("phone") ? (
              <span className="text-[11px] font-semibold text-rose-600">{err("phone")}</span>
            ) : (
              <span className="text-[11px] text-slate-400">
                So our team can reach them quickly.
              </span>
            )}
          </label>

          <label className="mt-4 flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Which country to study
            </span>
            <select name="targetCountry" className={`${inputCls} cursor-pointer`} defaultValue="">
              <option value="">Not decided yet</option>
              {STUDY_DESTINATIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {err("targetCountry") && (
              <span className="text-[11px] font-semibold text-rose-600">
                {err("targetCountry")}
              </span>
            )}
          </label>

          <label className="mt-4 flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Remarks
            </span>
            <textarea
              name="remarks"
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Course interest, when they plan to go, how you know them…"
            />
            {err("remarks") && (
              <span className="text-[11px] font-semibold text-rose-600">{err("remarks")}</span>
            )}
          </label>

          <button
            type="submit"
            disabled={pending}
            className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#6355d8] py-3 text-xs font-bold text-white transition-colors hover:bg-[#5244c7] disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            {pending ? "Saving…" : "Submit referral"}
          </button>
        </form>

        <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-slate-400">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
          Your commission is recorded automatically once this student reaches the Enrolled
          stage. You will see it under Commissions.
        </p>
      </div>
    </div>
  );
}
