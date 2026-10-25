"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Plus, Search, UserCog } from "lucide-react";

import { AgentFormDialog } from "./AgentFormDialog";
import { describeCommission, formatMoney } from "@/lib/constants/crm";
import type { AgentSummary } from "@/lib/data/agents";

export function AgentRoster({
  agents,
  orphanCount,
}: {
  agents: AgentSummary[];
  orphanCount: number;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visible = q
    ? agents.filter((a) =>
        [a.full_name, a.email, a.institute_name, a.agent_code, a.phone]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      )
    : agents;

  const totalOwed = agents.reduce((n, a) => n + a.earned_total, 0);
  const totalPaid = agents.reduce((n, a) => n + a.paid_total, 0);

  return (
    <div className="flex w-full flex-col gap-6 p-6 sm:p-8 lg:p-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4f46e5] via-[#6355d8] to-[#7c3aed] p-8">
        <div className="relative z-10">
          <span className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/90">
            Referral Network
          </span>
          <h1 className="mt-3 font-sans text-2xl font-extrabold text-white">Agents</h1>
          <p className="mt-1 max-w-xl text-xs text-white/70">
            Agents refer students and earn commission when a student enrols. Accounts are
            created here — there is no public sign-up.
          </p>
          <div className="mt-5 flex flex-wrap gap-6">
            {[
              { label: "Agents", value: String(agents.length) },
              { label: "Active", value: String(agents.filter((a) => a.status === "active").length) },
              { label: "Owed", value: formatMoney(totalOwed) },
              { label: "Paid out", value: formatMoney(totalPaid) },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-lg font-extrabold text-white">{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      </div>

      {orphanCount > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-800">
            <strong>{orphanCount}</strong> sign-in account
            {orphanCount === 1 ? " has" : "s have"} no agent profile attached. They cannot
            use the system, but they do block that email from being re-registered. This
            happens if account creation is interrupted halfway.
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, institute, code…"
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#6355d8] focus:ring-2 focus:ring-[#6355d8]/15"
          />
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="ml-auto flex cursor-pointer items-center gap-2 rounded-xl bg-[#6355d8] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#5244c7]"
        >
          <Plus className="h-3.5 w-3.5" />
          Create Agent
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
        <div className="grid grid-cols-12 gap-3 border-b border-slate-100 px-6 py-3.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
          <div className="col-span-4 sm:col-span-3">Agent</div>
          <div className="col-span-3 hidden sm:block">Institute</div>
          <div className="col-span-3 sm:col-span-2">Commission</div>
          <div className="col-span-2 sm:col-span-1 text-center">Referred</div>
          <div className="col-span-2 text-right">Owed</div>
          <div className="col-span-1 text-right">Status</div>
        </div>

        <div className="divide-y divide-slate-50">
          {visible.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <UserCog className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-[#1e1b4b]">
                {agents.length === 0 ? "No agents yet" : "No agents match your search"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {agents.length === 0
                  ? "Create one to start tracking referrals and commission."
                  : "Try a different name, email or institute."}
              </p>
            </div>
          ) : (
            visible.map((a) => (
              <Link
                key={a.id}
                href={`/admin/agents/${a.id}`}
                className="grid cursor-pointer grid-cols-12 items-center gap-3 px-6 py-4 transition-colors hover:bg-[#faf9ff]"
              >
                <div className="col-span-4 min-w-0 sm:col-span-3">
                  <p className="truncate text-sm font-bold text-[#1e1b4b]">{a.full_name}</p>
                  <p className="truncate text-[11px] text-slate-400">{a.email}</p>
                </div>
                <div className="col-span-3 hidden min-w-0 sm:block">
                  <p className="truncate text-xs text-slate-600">{a.institute_name || "—"}</p>
                  {a.agent_code && (
                    <p className="truncate font-mono text-[10px] text-slate-400">{a.agent_code}</p>
                  )}
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <p className="text-xs font-semibold text-slate-700">
                    {describeCommission(a.commission_type, a.commission_value)}
                  </p>
                </div>
                <div className="col-span-2 text-center sm:col-span-1">
                  <p className="text-sm font-extrabold text-[#1e1b4b]">{a.lead_count}</p>
                  <p className="text-[10px] text-slate-400">{a.enrolled_count} enrolled</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-sm font-extrabold text-[#1e1b4b]">
                    {formatMoney(a.earned_total)}
                  </p>
                  <p className="text-[10px] text-slate-400">{formatMoney(a.paid_total)} paid</p>
                </div>
                <div className="col-span-1 text-right">
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                      a.status === "active"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-100 text-slate-500"
                    }`}
                  >
                    {a.status === "active" ? "Active" : "Suspended"}
                  </span>
                  {a.must_change_password && (
                    <p className="mt-1 text-[10px] font-semibold text-amber-600">Temp pwd</p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {dialogOpen && <AgentFormDialog onClose={() => setDialogOpen(false)} />}
    </div>
  );
}
