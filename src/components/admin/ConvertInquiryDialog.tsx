"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Check, GraduationCap, Loader2, X } from "lucide-react";

import { convertInquiryToLead } from "@/lib/actions/admin-leads";
import { STUDY_DESTINATIONS } from "@/lib/constants/countries";
import type { ActionResult } from "@/lib/actions/result";
import type { ContactInquiry } from "@/lib/types/inquiry";

const input =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#1e1b4b] outline-none transition focus:border-[#6355d8] focus:ring-2 focus:ring-[#6355d8]/15";
const labelCls = "text-[10px] font-bold uppercase tracking-wide text-slate-500";

type Result = ActionResult<{ id: string; alreadyConverted: boolean }>;

/** Best-effort guess at the destination country from the inquiry metadata. */
function guessCountry(inquiry: ContactInquiry): string {
  const meta = (inquiry.metadata ?? {}) as Record<string, unknown>;
  const raw = String(meta.target_country ?? meta.dest_country ?? meta.country ?? "");
  if (!raw) return "";
  return STUDY_DESTINATIONS.find((c) => c.toLowerCase().includes(raw.toLowerCase())) ?? "";
}

/**
 * Promote a website inquiry into a tracked student.
 *
 * The inquiry is kept as the original inbox record — this creates a linked
 * lead rather than moving the row, so spam never has to enter the pipeline
 * and the five existing inquiry pages keep working unchanged.
 */
export function ConvertInquiryDialog({
  inquiry,
  agents,
  onClose,
  onConverted,
}: {
  inquiry: ContactInquiry;
  agents: { id: string; full_name: string }[];
  onClose: () => void;
  onConverted?: () => void;
}) {
  const [state, action, pending] = useActionState<Result | null, FormData>(
    convertInquiryToLead,
    null
  );

  const done = state?.success ? state.data : null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-[#1e1b4b]/40 p-4 backdrop-blur-sm">
      <div className="mt-12 w-full max-w-lg rounded-3xl border border-slate-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0edff] text-[#6355d8]">
              <GraduationCap className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#1e1b4b]">Convert to student</h2>
              <p className="text-[11px] text-slate-400">
                Starts tracking them in the CRM pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-6">
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-600" />
              <div className="text-xs text-emerald-800">
                <p className="font-bold">{state?.success && state.message}</p>
                <p className="mt-0.5 text-emerald-700">
                  {done.alreadyConverted
                    ? "No duplicate was created — the existing student record is linked below."
                    : "The inquiry stays in your inbox, linked to this student."}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/admin/students/${done.id}`}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#6355d8] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#5244c7]"
              >
                Open student profile
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={() => {
                  onConverted?.();
                  onClose();
                }}
                className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:border-[#6355d8] hover:text-[#6355d8]"
              >
                Back to inquiries
              </button>
            </div>
          </div>
        ) : (
          <form action={action} className="px-6 py-5">
            <input type="hidden" name="inquiryId" value={inquiry.id ?? ""} />
            <input type="hidden" name="vertical" value="education" />

            {state && !state.success && (
              <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
                {state.error}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className={labelCls}>Student name *</span>
                <input
                  name="studentName"
                  required
                  defaultValue={inquiry.full_name}
                  className={input}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Phone</span>
                <input name="phone" defaultValue={inquiry.phone ?? ""} className={input} />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Email</span>
                <input
                  name="email"
                  type="email"
                  defaultValue={inquiry.email ?? ""}
                  className={input}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Country of interest</span>
                <select
                  name="targetCountry"
                  defaultValue={guessCountry(inquiry)}
                  className={`${input} cursor-pointer`}
                >
                  <option value="">Not decided</option>
                  {STUDY_DESTINATIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className={labelCls}>Credit an agent</span>
                <select name="agentId" defaultValue="" className={`${input} cursor-pointer`}>
                  <option value="">No agent — came in directly</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.full_name}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400">
                  Only if an agent genuinely referred them
                </span>
              </label>

              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className={labelCls}>Remarks</span>
                <textarea
                  name="remarks"
                  rows={3}
                  defaultValue={
                    [inquiry.subject, inquiry.message].filter(Boolean).join(" — ") || ""
                  }
                  className={`${input} resize-none`}
                />
                <span className="text-[11px] text-slate-400">
                  Pre-filled from their inquiry. Edit freely.
                </span>
              </label>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#6355d8] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#5244c7] disabled:opacity-60"
              >
                {pending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <GraduationCap className="h-3.5 w-3.5" />
                )}
                Convert
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
