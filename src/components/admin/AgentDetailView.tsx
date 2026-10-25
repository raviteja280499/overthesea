"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  KeyRound,
  Loader2,
  Pencil,
  RefreshCw,
  ShieldOff,
  ShieldCheck,
} from "lucide-react";

import { AgentFormDialog } from "./AgentFormDialog";
import { resetAgentPassword, setAgentStatus } from "@/lib/actions/agents";
import {
  COMMISSION_STATUS_STYLE,
  describeCommission,
  formatDate,
  formatMoney,
  suggestPassword,
} from "@/lib/constants/crm";
import type { ActionResult } from "@/lib/actions/result";
import type { AgentDetail } from "@/lib/data/agents";

export function AgentDetailView({ detail }: { detail: AgentDetail }) {
  const { profile, leads, commissions } = detail;
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const [statusState, statusAction, statusPending] = useActionState<
    ActionResult | null,
    FormData
  >(setAgentStatus, null);

  const owed = commissions
    .filter((c) => c.status === "earned" || c.status === "approved")
    .reduce((n, c) => n + Number(c.amount ?? 0), 0);
  const paid = commissions
    .filter((c) => c.status === "paid")
    .reduce((n, c) => n + Number(c.amount ?? 0), 0);
  const flagged = commissions.filter((c) => c.stage_reverted_at).length;

  return (
    <div className="flex w-full flex-col gap-6 p-6 sm:p-8 lg:p-10">
      <Link
        href="/admin/agents"
        className="flex w-fit items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-[#6355d8]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All agents
      </Link>

      <div className="flex flex-col gap-6 xl:flex-row">
        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <h1 className="truncate text-xl font-extrabold text-[#1e1b4b]">
                    {profile.full_name}
                  </h1>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                      profile.status === "active"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-100 text-slate-500"
                    }`}
                  >
                    {profile.status === "active" ? "Active" : "Suspended"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">{profile.email}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setEditOpen(true)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:border-[#6355d8] hover:text-[#6355d8]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>

                <button
                  onClick={() => setResetOpen(true)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:border-[#6355d8] hover:text-[#6355d8]"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Reset password
                </button>

                <form action={statusAction}>
                  <input type="hidden" name="id" value={profile.id} />
                  <input
                    type="hidden"
                    name="status"
                    value={profile.status === "active" ? "suspended" : "active"}
                  />
                  <button
                    type="submit"
                    disabled={statusPending}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[11px] font-bold transition-colors disabled:opacity-60 ${
                      profile.status === "active"
                        ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                        : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {statusPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : profile.status === "active" ? (
                      <ShieldOff className="h-3.5 w-3.5" />
                    ) : (
                      <ShieldCheck className="h-3.5 w-3.5" />
                    )}
                    {profile.status === "active" ? "Suspend" : "Reactivate"}
                  </button>
                </form>
              </div>
            </div>

            {statusState && (
              <p
                className={`mt-3 text-xs font-semibold ${
                  statusState.success ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {statusState.success ? statusState.message : statusState.error}
              </p>
            )}

            {profile.must_change_password && (
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-[11px] font-semibold text-amber-700">
                This agent still has a temporary password and must change it at next sign-in.
              </p>
            )}

            <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Institute", profile.institute_name || "—"],
                ["Phone", profile.phone || "—"],
                ["Agent code", profile.agent_code || "—"],
                ["Joined", formatDate(profile.created_at)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    {label}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-[#1e1b4b]">{value}</p>
                </div>
              ))}
            </div>

            {(profile.address || profile.remarks) && (
              <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                {profile.address && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Address
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">{profile.address}</p>
                  </div>
                )}
                {profile.remarks && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Remarks
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">{profile.remarks}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Referred students */}
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-sm font-extrabold text-[#1e1b4b]">
                Referred students
                <span className="ml-2 text-xs font-semibold text-slate-400">{leads.length}</span>
              </h2>
            </div>
            {leads.length === 0 ? (
              <p className="px-6 py-10 text-center text-xs text-slate-400">
                No referrals yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-50">
                {leads.map((l) => (
                  <Link
                    key={l.id}
                    href={`/admin/students/${l.id}`}
                    className="grid cursor-pointer grid-cols-12 items-center gap-3 px-6 py-3.5 transition-colors hover:bg-[#faf9ff]"
                  >
                    <div className="col-span-5 min-w-0">
                      <p className="truncate text-xs font-bold text-[#1e1b4b]">
                        {l.student_name}
                      </p>
                      <p className="truncate text-[10px] text-slate-400">{l.phone || "—"}</p>
                    </div>
                    <div className="col-span-3 truncate text-[11px] text-slate-600">
                      {l.target_country || "—"}
                    </div>
                    <div className="col-span-2 text-[11px] font-semibold text-slate-700">
                      {l.stage_key.replace(/_/g, " ")}
                    </div>
                    <div className="col-span-2 text-right text-[10px] text-slate-400">
                      {formatDate(l.created_at)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right rail */}
        <div className="flex w-full shrink-0 flex-col gap-6 xl:w-80">
          <div className="rounded-3xl border border-slate-100 bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Commission configuration
            </p>
            <p className="mt-1 text-lg font-extrabold text-[#1e1b4b]">
              {describeCommission(profile.commission_type, profile.commission_value)}
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              Applied when a referred student reaches <strong>Enrolled</strong>. Changing it
              affects future enrolments only — commissions already earned keep the rate that
              was in force at the time.
            </p>

            <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Owed</span>
                <span className="text-sm font-extrabold text-[#1e1b4b]">{formatMoney(owed)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Paid out</span>
                <span className="text-sm font-extrabold text-emerald-700">
                  {formatMoney(paid)}
                </span>
              </div>
              {flagged > 0 && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-700">
                  {flagged} paid commission{flagged === 1 ? "" : "s"} flagged — the student
                  later left the enrolled stage.
                </p>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
            <div className="border-b border-slate-100 px-5 py-3.5">
              <h2 className="text-xs font-extrabold text-[#1e1b4b]">Commission history</h2>
            </div>
            {commissions.length === 0 ? (
              <p className="px-5 py-8 text-center text-[11px] text-slate-400">
                Nothing earned yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-50">
                {commissions.map((c) => {
                  const style = COMMISSION_STATUS_STYLE[c.status];
                  return (
                    <div key={c.id} className="flex items-center justify-between px-5 py-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#1e1b4b]">
                          {formatMoney(c.amount, c.currency)}
                        </p>
                        <p className="text-[10px] text-slate-400">{formatDate(c.earned_at)}</p>
                      </div>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${style.className}`}
                      >
                        {style.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {editOpen && (
        <AgentFormDialog onClose={() => setEditOpen(false)} agent={profile} />
      )}
      {resetOpen && (
        <ResetPasswordDialog
          onClose={() => setResetOpen(false)}
          agentId={profile.id}
          email={profile.email}
        />
      )}
    </div>
  );
}

function ResetPasswordDialog({
  onClose,
  agentId,
  email,
}: {
  onClose: () => void;
  agentId: string;
  email: string;
}) {
  const [state, action, pending] = useActionState<
    ActionResult<{ tempPassword: string }> | null,
    FormData
  >(resetAgentPassword, null);
  // Lazy initialiser: the parent mounts this only while open, so each opening
  // gets a fresh suggestion without a state-resetting effect.
  const [password, setPassword] = useState(suggestPassword);
  const [copied, setCopied] = useState(false);

  const issued = state?.success ? state.data : null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-[#1e1b4b]/40 p-4 backdrop-blur-sm">
      <div className="mt-24 w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
        <h2 className="text-sm font-extrabold text-[#1e1b4b]">Reset password</h2>
        <p className="mt-1 text-[11px] text-slate-400">
          There is no email delivery configured, so you must pass this on directly. The
          agent will be forced to change it at next sign-in.
        </p>

        {issued ? (
          <>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-[#f8f9fd] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                New temporary password
              </p>
              <div className="mt-1 flex items-center gap-2">
                <p className="flex-1 font-mono text-sm font-bold text-[#1e1b4b]">
                  {issued.tempPassword}
                </p>
                <button
                  onClick={async () => {
                    await navigator.clipboard
                      .writeText(`Email: ${email}\nTemporary password: ${issued.tempPassword}`)
                      .then(() => setCopied(true))
                      .catch(() => setCopied(false));
                  }}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#6355d8] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#5244c7]"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="mt-4 w-full cursor-pointer rounded-xl bg-[#1e1b4b] py-2.5 text-xs font-bold text-white hover:bg-[#2d2a5e]"
            >
              Done
            </button>
          </>
        ) : (
          <form action={action} className="mt-4">
            <input type="hidden" name="id" value={agentId} />
            {state && !state.success && (
              <p className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">
                {state.error}
              </p>
            )}
            <div className="flex items-center gap-2">
              <input
                name="tempPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-[#6355d8] focus:ring-2 focus:ring-[#6355d8]/15"
              />
              <button
                type="button"
                onClick={() => setPassword(suggestPassword())}
                className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-[#6355d8] hover:text-[#6355d8]"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#6355d8] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#5244c7] disabled:opacity-60"
              >
                {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Reset
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
