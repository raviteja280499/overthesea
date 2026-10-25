import Link from "next/link";
import { ArrowRight, GraduationCap, Plus, TrendingUp, Wallet } from "lucide-react";

import { requireAgent } from "@/lib/auth/dal";
import { getMyLeads, getMyStats } from "@/lib/data/agent-portal";
import { formatDate, formatMoney, describeCommission } from "@/lib/constants/crm";

export const metadata = { title: "Dashboard · Over The Sea Agent" };

export default async function AgentDashboardPage() {
  const user = await requireAgent();
  const [stats, leads] = await Promise.all([getMyStats(), getMyLeads()]);
  const recent = leads.slice(0, 6);

  const cards = [
    {
      label: "Students referred",
      value: String(stats.totalReferrals),
      sub: `${stats.inProgress} in progress`,
      icon: GraduationCap,
    },
    {
      label: "Enrolled",
      value: String(stats.enrolled),
      sub: "commission earned",
      icon: TrendingUp,
    },
    {
      label: "Awaiting payout",
      value: formatMoney(stats.earned + stats.approved),
      sub: `${formatMoney(stats.approved)} approved`,
      icon: Wallet,
    },
    {
      label: "Paid to you",
      value: formatMoney(stats.paid),
      sub: "settled",
      icon: Wallet,
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6 p-6 sm:p-8 lg:p-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4f46e5] via-[#6355d8] to-[#7c3aed] p-8">
        <div className="relative z-10">
          <h1 className="font-sans text-2xl font-extrabold text-white">
            Welcome back, {user.fullName.split(" ")[0]}
          </h1>
          <p className="mt-1 max-w-lg text-xs text-white/70">
            Your commission rate is{" "}
            <strong className="text-white">
              {describeCommission(user.commissionType, user.commissionValue)}
            </strong>
            , paid when a student you referred reaches Enrolled.
          </p>
          <Link
            href="/agent/students/new"
            className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#6355d8] transition-transform hover:scale-[1.02]"
          >
            <Plus className="h-3.5 w-3.5" />
            Refer a student
          </Link>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-2xl border border-slate-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  {c.label}
                </p>
                <Icon className="h-4 w-4 text-slate-300" />
              </div>
              <p className="mt-2 text-xl font-extrabold text-[#1e1b4b]">{c.value}</p>
              <p className="text-[11px] text-slate-400">{c.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-extrabold text-[#1e1b4b]">Recent referrals</h2>
          <Link
            href="/agent/students"
            className="flex items-center gap-1 text-[11px] font-bold text-[#6355d8] hover:underline"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <GraduationCap className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-[#1e1b4b]">No referrals yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Add a student and we will take it from there.
            </p>
            <Link
              href="/agent/students/new"
              className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#6355d8] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#5244c7]"
            >
              <Plus className="h-3.5 w-3.5" />
              Refer a student
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recent.map((l) => (
              <div key={l.id} className="grid grid-cols-12 items-center gap-3 px-6 py-3.5">
                <div className="col-span-5 min-w-0 sm:col-span-4">
                  <p className="truncate text-xs font-bold text-[#1e1b4b]">{l.student_name}</p>
                  <p className="truncate text-[10px] text-slate-400">{l.phone || "—"}</p>
                </div>
                <div className="col-span-3 truncate text-[11px] text-slate-600">
                  {l.target_country || "—"}
                </div>
                <div className="col-span-4 sm:col-span-3">
                  <span
                    className="rounded-full border px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      color: l.stage_accent ?? "#6355d8",
                      borderColor: `${l.stage_accent ?? "#6355d8"}33`,
                      backgroundColor: `${l.stage_accent ?? "#6355d8"}11`,
                    }}
                  >
                    {l.stage_label}
                  </span>
                </div>
                <div className="col-span-2 hidden text-right text-[10px] text-slate-400 sm:block">
                  {formatDate(l.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
