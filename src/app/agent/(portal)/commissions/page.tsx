import { Wallet } from "lucide-react";

import { requireAgent } from "@/lib/auth/dal";
import { getMyCommissions, getMyLeads, getMyStats } from "@/lib/data/agent-portal";
import {
  COMMISSION_STATUS_STYLE,
  describeCommission,
  formatDate,
  formatMoney,
} from "@/lib/constants/crm";

export const metadata = { title: "Commissions · Over The Sea Agent" };

export default async function AgentCommissionsPage() {
  const user = await requireAgent();
  const [commissions, leads, stats] = await Promise.all([
    getMyCommissions(),
    getMyLeads(),
    getMyStats(),
  ]);

  const nameByLead = new Map(leads.map((l) => [l.id, l.student_name]));

  return (
    <div className="flex w-full flex-col gap-6 p-6 sm:p-8 lg:p-10">
      <div>
        <h1 className="text-xl font-extrabold text-[#1e1b4b]">Commissions</h1>
        <p className="text-xs text-slate-400">
          Your rate: {describeCommission(user.commissionType, user.commissionValue)} · recorded
          automatically when a student reaches Enrolled
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Earned", value: stats.earned, hint: "awaiting approval", tone: "amber" },
          { label: "Approved", value: stats.approved, hint: "awaiting payment", tone: "sky" },
          { label: "Paid", value: stats.paid, hint: "settled", tone: "emerald" },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-100 bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {c.label}
            </p>
            <p
              className={`mt-2 text-xl font-extrabold ${
                c.tone === "emerald" ? "text-emerald-700" : "text-[#1e1b4b]"
              }`}
            >
              {formatMoney(c.value)}
            </p>
            <p className="text-[11px] text-slate-400">{c.hint}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
        <div className="grid grid-cols-12 gap-3 border-b border-slate-100 px-6 py-3.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
          <div className="col-span-4">Student</div>
          <div className="col-span-3 sm:col-span-2">Amount</div>
          <div className="col-span-3 sm:col-span-2">Status</div>
          <div className="col-span-2 hidden sm:block">Earned</div>
          <div className="col-span-2 hidden text-right sm:block">Paid</div>
        </div>

        {commissions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Wallet className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-[#1e1b4b]">No commissions yet</p>
            <p className="mt-1 text-xs text-slate-400">
              A commission appears here as soon as a student you referred enrols.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {commissions.map((c) => {
              const style = COMMISSION_STATUS_STYLE[c.status];
              return (
                <div key={c.id} className="grid grid-cols-12 items-center gap-3 px-6 py-4">
                  <div className="col-span-4 min-w-0">
                    <p className="truncate text-sm font-bold text-[#1e1b4b]">
                      {nameByLead.get(c.lead_id) ?? "Student"}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {c.commission_type === "flat"
                        ? "Flat rate"
                        : `${c.commission_value}% of service fee`}
                    </p>
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <p className="text-sm font-extrabold text-[#1e1b4b]">
                      {formatMoney(c.amount, c.currency)}
                    </p>
                    {c.amount === null && (
                      <p className="text-[10px] text-amber-600">being calculated</p>
                    )}
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${style.className}`}
                    >
                      {style.label}
                    </span>
                  </div>
                  <div className="col-span-2 hidden text-[11px] text-slate-500 sm:block">
                    {formatDate(c.earned_at)}
                  </div>
                  <div className="col-span-2 hidden text-right sm:block">
                    <p className="text-[11px] text-slate-500">{formatDate(c.paid_at)}</p>
                    {c.payment_reference && (
                      <p className="truncate font-mono text-[10px] text-slate-400">
                        {c.payment_reference}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-[11px] leading-relaxed text-slate-400">
        Commission status is set by Over The Sea: <strong>Earned</strong> when your student
        enrols, <strong>Approved</strong> once verified, and <strong>Paid</strong> when the
        payment has been made.
      </p>
    </div>
  );
}
