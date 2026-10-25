"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Info, Loader2, Plus, UserPlus } from "lucide-react";

import { createLeadAsAdmin } from "@/lib/actions/admin-leads";
import { STUDY_DESTINATIONS } from "@/lib/constants/countries";
import { describeCommission } from "@/lib/constants/crm";
import type { ActionResult } from "@/lib/actions/result";
import type { CommissionType } from "@/lib/types/crm";

const input =
  "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-[#1e1b4b] outline-none transition focus:border-[#6355d8] focus:ring-2 focus:ring-[#6355d8]/15";
const labelCls = "text-[10px] font-bold uppercase tracking-wide text-slate-500";

interface AgentOption {
  id: string;
  full_name: string;
  commission_type: CommissionType;
  commission_value: number;
}

export function AdminLeadForm({ agents }: { agents: AgentOption[] }) {
  const [state, action, pending] = useActionState<ActionResult<{ id: string }> | null, FormData>(
    createLeadAsAdmin,
    null
  );
  const [agentId, setAgentId] = useState("");

  const fieldErrors = state && !state.success ? state.fieldErrors : undefined;
  const err = (n: string) => fieldErrors?.[n]?.[0];

  const chosen = agents.find((a) => a.id === agentId);
  const createdId = state?.success ? state.data?.id : null;

  return (
    <div className="flex w-full flex-col gap-6 p-6 sm:p-8 lg:p-10">
      <Link
        href="/admin/students"
        className="flex w-fit items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-[#6355d8]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All students
      </Link>

      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0edff] text-[#6355d8]">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#1e1b4b]">Add student</h1>
            <p className="text-xs text-slate-400">
              The full study-abroad profile is filled in afterwards, on the student&apos;s page.
            </p>
          </div>
        </div>

        {createdId && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
            <div className="flex items-start gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <p className="text-xs font-bold text-emerald-800">{state?.success && state.message}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/admin/students/${createdId}`}
                className="cursor-pointer rounded-lg bg-emerald-600 px-3.5 py-2 text-[11px] font-bold text-white transition-colors hover:bg-emerald-700"
              >
                Open their profile
              </Link>
              <Link
                href="/admin/students"
                className="cursor-pointer rounded-lg border border-emerald-300 px-3.5 py-2 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                Back to pipeline
              </Link>
            </div>
          </div>
        )}

        {state && !state.success && (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
            {state.error}
          </div>
        )}

        <form
          action={action}
          hidden={Boolean(createdId)}
          className="mt-5 rounded-3xl border border-slate-100 bg-white p-6"
        >
          <input type="hidden" name="vertical" value="education" />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className={labelCls}>Student name *</span>
              <input name="studentName" required className={input} placeholder="Priya Sharma" />
              {err("studentName") && (
                <span className="text-[11px] font-semibold text-rose-600">{err("studentName")}</span>
              )}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Phone</span>
              <input name="phone" className={input} placeholder="+91 98765 43210" />
              {err("phone") && (
                <span className="text-[11px] font-semibold text-rose-600">{err("phone")}</span>
              )}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Email</span>
              <input name="email" type="email" className={input} placeholder="priya@example.com" />
              {err("email") && (
                <span className="text-[11px] font-semibold text-rose-600">{err("email")}</span>
              )}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Country of interest</span>
              <select name="targetCountry" defaultValue="" className={`${input} cursor-pointer`}>
                <option value="">Not decided</option>
                {STUDY_DESTINATIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Referred by</span>
              <select
                name="agentId"
                value={agentId}
                onChange={(ev) => setAgentId(ev.target.value)}
                className={`${input} cursor-pointer`}
              >
                <option value="">No agent — direct / walk-in</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.full_name}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400">
                {chosen
                  ? `Earns ${describeCommission(chosen.commission_type, chosen.commission_value)} on enrolment`
                  : "No commission will be recorded"}
              </span>
            </label>

            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className={labelCls}>
                Our service fee (₹){chosen?.commission_type === "percent" ? " — required" : ""}
              </span>
              <input type="number" name="dealValue" min="0" className={input} placeholder="50000" />
              <span className="text-[11px] text-slate-400">
                {chosen?.commission_type === "percent"
                  ? `${chosen.commission_value}% of this becomes their commission. Can be set later, but before the commission is approved.`
                  : "What Over The Sea charges. Optional — can be set later."}
              </span>
            </label>

            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className={labelCls}>Remarks</span>
              <textarea
                name="remarks"
                rows={3}
                className={`${input} resize-none`}
                placeholder="How they came in, course interest, timeline…"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#6355d8] py-3 text-xs font-bold text-white transition-colors hover:bg-[#5244c7] disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            {pending ? "Saving…" : "Add student"}
          </button>
        </form>

        <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-slate-400">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
          The student starts at the first pipeline stage. Commission is recorded automatically
          when you move them to Enrolled — and only if an agent is attributed.
        </p>
      </div>
    </div>
  );
}
