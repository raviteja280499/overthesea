import Link from "next/link";
import { GraduationCap, Plus } from "lucide-react";

import { requireAgent } from "@/lib/auth/dal";
import { getMyLeads } from "@/lib/data/agent-portal";
import { COMMISSION_STATUS_STYLE, formatDate, formatMoney } from "@/lib/constants/crm";

export const metadata = { title: "My Students · Over The Sea Agent" };

export default async function MyStudentsPage() {
  await requireAgent();
  const leads = await getMyLeads();

  return (
    <div className="flex w-full flex-col gap-6 p-6 sm:p-8 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[#1e1b4b]">My Students</h1>
          <p className="text-xs text-slate-400">
            {leads.length} referral{leads.length === 1 ? "" : "s"} · status updates come from
            the Over The Sea team
          </p>
        </div>
        <Link
          href="/agent/students/new"
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#6355d8] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#5244c7]"
        >
          <Plus className="h-3.5 w-3.5" />
          Refer a student
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
        <div className="grid grid-cols-12 gap-3 border-b border-slate-100 px-6 py-3.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
          <div className="col-span-4 sm:col-span-4">Student</div>
          <div className="col-span-3 hidden sm:block">Country</div>
          <div className="col-span-4 sm:col-span-3">Stage</div>
          <div className="col-span-4 sm:col-span-2">Commission</div>
        </div>

        {leads.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <GraduationCap className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-[#1e1b4b]">No students yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Refer your first student to start earning commission.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {leads.map((l) => {
              const style = l.commission_status
                ? COMMISSION_STATUS_STYLE[l.commission_status]
                : null;
              return (
                <div key={l.id} className="grid grid-cols-12 items-center gap-3 px-6 py-4">
                  <div className="col-span-4 min-w-0 sm:col-span-4">
                    <p className="truncate text-sm font-bold text-[#1e1b4b]">
                      {l.student_name}
                    </p>
                    <p className="truncate text-[11px] text-slate-400">
                      {l.phone || "—"} · added {formatDate(l.created_at)}
                    </p>
                    {/* The agent's own remarks. Admin-side notes live in
                        education_details, which agents have no access to. */}
                    {l.remarks && (
                      <p className="mt-1 line-clamp-2 text-[11px] italic text-slate-500">
                        &ldquo;{l.remarks}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="col-span-3 hidden truncate text-xs text-slate-600 sm:block">
                    {l.target_country || "—"}
                  </div>
                  <div className="col-span-4 sm:col-span-3">
                    <span
                      className="inline-block rounded-full border px-2.5 py-1 text-[10px] font-bold"
                      style={{
                        color: l.stage_accent ?? "#6355d8",
                        borderColor: `${l.stage_accent ?? "#6355d8"}33`,
                        backgroundColor: `${l.stage_accent ?? "#6355d8"}11`,
                      }}
                    >
                      {l.stage_label}
                    </span>
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    {style ? (
                      <div>
                        <p className="text-xs font-extrabold text-[#1e1b4b]">
                          {formatMoney(l.commission_amount)}
                        </p>
                        <span
                          className={`inline-block rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${style.className}`}
                        >
                          {style.label}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">Not yet earned</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {leads.length > 0 && (
        <p className="text-[11px] leading-relaxed text-slate-400">
          Need something corrected on a student? Contact the Over The Sea team — stage
          changes and student details are managed by our counsellors.
        </p>
      )}
    </div>
  );
}
