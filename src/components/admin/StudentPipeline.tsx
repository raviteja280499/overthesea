"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Archive,
  Download,
  GraduationCap,
  Loader2,
  Plus,
  Search,
  Users,
} from "lucide-react";

import { COMMISSION_STATUS_STYLE, formatDate, formatMoney } from "@/lib/constants/crm";
import type { LeadListRow } from "@/lib/data/leads";
import type { LeadStage } from "@/lib/types/crm";

export function StudentPipeline({
  leads,
  stages,
  counts,
  agents,
  filters,
}: {
  leads: LeadListRow[];
  stages: LeadStage[];
  counts: Record<string, number>;
  agents: { id: string; full_name: string }[];
  filters: { stage: string; agent: string; q: string; archived: boolean };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.q);

  /** All filters are URL state, so a filtered pipeline can be shared as a link. */
  const setFilter = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams();
    const next = {
      stage: filters.stage,
      agent: filters.agent,
      q: filters.q,
      archived: filters.archived ? "1" : "",
      ...patch,
    };
    for (const [k, v] of Object.entries(next)) {
      if (v && v !== "all") params.set(k, v);
    }
    startTransition(() => {
      router.replace(params.toString() ? `${pathname}?${params}` : pathname);
    });
  };

  const exportCsv = () => {
    const header = [
      "Student",
      "Phone",
      "Email",
      "Country",
      "Stage",
      "Referred by",
      "Service fee",
      "Commission",
      "Commission status",
      "Added",
    ];
    const rows = leads.map((l) => [
      l.student_name,
      l.phone ?? "",
      l.email ?? "",
      l.target_country ?? "",
      l.stage_label,
      l.agent_name ?? "Direct",
      l.deal_value ?? "",
      l.commission_amount ?? "",
      l.commission_status ?? "",
      new Date(l.created_at).toISOString().slice(0, 10),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalFee = leads.reduce((n, l) => n + Number(l.deal_value ?? 0), 0);
  const enrolled = leads.filter((l) => l.is_won).length;

  return (
    <div className="flex w-full flex-col gap-6 p-6 sm:p-8 lg:p-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4f46e5] via-[#6355d8] to-[#7c3aed] p-8">
        <div className="relative z-10">
          <span className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/90">
            Overseas Education
          </span>
          <h1 className="mt-3 font-sans text-2xl font-extrabold text-white">Students</h1>
          <p className="mt-1 max-w-xl text-xs text-white/70">
            The full study-abroad pipeline. Moving a student to{" "}
            <strong className="text-white">Enrolled</strong> records their agent&apos;s
            commission automatically.
          </p>
          <div className="mt-5 flex flex-wrap gap-6">
            {[
              { label: filters.archived ? "Archived" : "In pipeline", value: String(leads.length) },
              { label: "Enrolled", value: String(enrolled) },
              { label: "Service fees", value: formatMoney(totalFee) },
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

      {/* Stage strip */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter({ stage: "all" })}
          className={`cursor-pointer rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors ${
            filters.stage === "all"
              ? "border-[#6355d8] bg-[#f0edff] text-[#6355d8]"
              : "border-slate-200 text-slate-500 hover:border-[#6355d8] hover:text-[#6355d8]"
          }`}
        >
          All stages
        </button>
        {stages.map((s) => {
          const active = filters.stage === s.key;
          const n = counts[s.key] ?? 0;
          return (
            <button
              key={s.key}
              onClick={() => setFilter({ stage: s.key })}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors ${
                active ? "text-white" : "border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
              style={
                active
                  ? { backgroundColor: s.accent ?? "#6355d8", borderColor: s.accent ?? "#6355d8" }
                  : undefined
              }
            >
              {s.label}
              {n > 0 && (
                <span className={active ? "ml-1.5 text-white/70" : "ml-1.5 text-slate-400"}>
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setFilter({ q: search });
          }}
          className="relative w-full sm:w-72"
        >
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email, country…"
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#6355d8] focus:ring-2 focus:ring-[#6355d8]/15"
          />
        </form>

        <select
          value={filters.agent}
          onChange={(e) => setFilter({ agent: e.target.value })}
          className="cursor-pointer rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 outline-none focus:border-[#6355d8]"
        >
          <option value="all">All sources</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.full_name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setFilter({ archived: filters.archived ? "" : "1" })}
          className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-[11px] font-bold transition-colors ${
            filters.archived
              ? "border-[#6355d8] bg-[#f0edff] text-[#6355d8]"
              : "border-slate-200 text-slate-500 hover:border-[#6355d8] hover:text-[#6355d8]"
          }`}
        >
          <Archive className="h-3.5 w-3.5" />
          Archived
        </button>

        {pending && <Loader2 className="h-4 w-4 animate-spin text-[#6355d8]" />}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={exportCsv}
            disabled={leads.length === 0}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-[11px] font-bold text-slate-600 transition-colors hover:border-[#6355d8] hover:text-[#6355d8] disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <Link
            href="/admin/students/new"
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#6355d8] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#5244c7]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Student
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
        <div className="grid grid-cols-12 gap-3 border-b border-slate-100 px-6 py-3.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
          <div className="col-span-4 sm:col-span-3">Student</div>
          <div className="col-span-2 hidden sm:block">Country</div>
          <div className="col-span-4 sm:col-span-2">Stage</div>
          <div className="col-span-2 hidden sm:block">Referred by</div>
          <div className="col-span-4 sm:col-span-2">Commission</div>
          <div className="col-span-1 hidden text-right sm:block">Added</div>
        </div>

        {leads.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <GraduationCap className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-[#1e1b4b]">
              {filters.q || filters.stage !== "all" || filters.agent !== "all"
                ? "No students match these filters"
                : filters.archived
                  ? "Nothing archived"
                  : "No students yet"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Students arrive from agent referrals, converted website inquiries, or are added
              here directly.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {leads.map((l) => {
              const cs = l.commission_status ? COMMISSION_STATUS_STYLE[l.commission_status] : null;
              return (
                <Link
                  key={l.id}
                  href={`/admin/students/${l.id}`}
                  className="grid cursor-pointer grid-cols-12 items-center gap-3 px-6 py-4 transition-colors hover:bg-[#faf9ff]"
                >
                  <div className="col-span-4 min-w-0 sm:col-span-3">
                    <p className="truncate text-sm font-bold text-[#1e1b4b]">{l.student_name}</p>
                    <p className="truncate text-[11px] text-slate-400">{l.phone || "—"}</p>
                  </div>
                  <div className="col-span-2 hidden truncate text-xs text-slate-600 sm:block">
                    {l.target_country || "—"}
                  </div>
                  <div className="col-span-4 sm:col-span-2">
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
                  <div className="col-span-2 hidden min-w-0 sm:block">
                    {l.agent_name ? (
                      <p className="flex items-center gap-1 truncate text-[11px] font-semibold text-slate-600">
                        <Users className="h-3 w-3 shrink-0 text-slate-300" />
                        {l.agent_name}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400">Direct</p>
                    )}
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    {cs ? (
                      <div>
                        <p className="text-xs font-extrabold text-[#1e1b4b]">
                          {formatMoney(l.commission_amount)}
                        </p>
                        <span
                          className={`inline-block rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${cs.className}`}
                        >
                          {cs.label}
                        </span>
                      </div>
                    ) : l.agent_id ? (
                      <span className="text-[11px] text-slate-400">Pending enrolment</span>
                    ) : (
                      <span className="text-[11px] text-slate-300">—</span>
                    )}
                  </div>
                  <div className="col-span-1 hidden text-right text-[10px] text-slate-400 sm:block">
                    {formatDate(l.created_at)}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
