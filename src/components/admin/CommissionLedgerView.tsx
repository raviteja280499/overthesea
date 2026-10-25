"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Ban,
  BadgeCheck,
  Banknote,
  Check,
  Download,
  Loader2,
  TriangleAlert,
  Wallet,
} from "lucide-react";

import {
  approveCommissions,
  cancelCommission,
  recordPayment,
  setCommissionAmount,
} from "@/lib/actions/commissions";
import {
  COMMISSION_STATUS_STYLE,
  describeCommission,
  formatDate,
  formatMoney,
} from "@/lib/constants/crm";
import type { ActionResult } from "@/lib/actions/result";
import type { CommissionRow, CommissionTotals } from "@/lib/data/commissions";

const input =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#1e1b4b] outline-none transition focus:border-[#6355d8] focus:ring-2 focus:ring-[#6355d8]/15";
const labelCls = "text-[10px] font-bold uppercase tracking-wide text-slate-500";

const TABS = [
  { key: "earned", label: "Awaiting approval" },
  { key: "approved", label: "Awaiting payment" },
  { key: "paid", label: "Paid" },
  { key: "cancelled", label: "Cancelled" },
  { key: "all", label: "All" },
] as const;

export function CommissionLedgerView({
  rows,
  totals,
  counts,
  status,
}: {
  rows: CommissionRow[];
  totals: CommissionTotals;
  counts: Record<string, number>;
  status: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [navigating, startTransition] = useTransition();

  const [selected, setSelected] = useState<string[]>([]);
  const [payFor, setPayFor] = useState<CommissionRow | null>(null);
  const [cancelFor, setCancelFor] = useState<CommissionRow | null>(null);
  const [amountFor, setAmountFor] = useState<CommissionRow | null>(null);

  const [approveState, approveAction, approving] = useActionState<
    ActionResult<{ approved: number }> | null,
    FormData
  >(approveCommissions, null);

  const go = (next: string) =>
    startTransition(() => router.replace(`${pathname}?status=${next}`));

  const selectable = rows.filter((r) => r.status === "earned" && !r.needs_amount);
  const allSelected = selectable.length > 0 && selected.length === selectable.length;

  const toggleAll = () =>
    setSelected(allSelected ? [] : selectable.map((r) => r.id));
  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const exportCsv = () => {
    const header = [
      "Student", "Agent", "Amount", "Currency", "Status", "Rate at earn time",
      "Service fee", "Earned", "Approved", "Paid", "Reference",
    ];
    const body = rows.map((r) => [
      r.student_name, r.agent_name, r.amount ?? "", r.currency, r.status,
      r.commission_type === "flat" ? `flat ${r.commission_value}` : `${r.commission_value}%`,
      r.base_amount ?? "",
      r.earned_at?.slice(0, 10) ?? "",
      r.approved_at?.slice(0, 10) ?? "",
      r.paid_at?.slice(0, 10) ?? "",
      r.payment_reference ?? "",
    ]);
    const csv = [header, ...body]
      .map((row) => row.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `commissions-${status}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex w-full flex-col gap-6 p-6 sm:p-8 lg:p-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4f46e5] via-[#6355d8] to-[#7c3aed] p-8">
        <div className="relative z-10">
          <span className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/90">
            Agent Payouts
          </span>
          <h1 className="mt-3 font-sans text-2xl font-extrabold text-white">Commissions</h1>
          <p className="mt-1 max-w-xl text-xs text-white/70">
            Earned on enrolment, then approved and paid by you. Amounts are locked to the
            rate that applied when they were earned.
          </p>
          <div className="mt-5 flex flex-wrap gap-6">
            {[
              { label: "Awaiting approval", value: formatMoney(totals.earned) },
              { label: "Awaiting payment", value: formatMoney(totals.approved) },
              { label: "Paid out", value: formatMoney(totals.paid) },
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

      {/*
        Stalled payouts. A percent agent whose student enrolled before a
        service fee was recorded accrues a null amount, which the database
        refuses to approve. Without this banner that payout would sit
        invisible and the agent would simply never be paid.
      */}
      {totals.needsAmount > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3.5">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="text-xs text-amber-900">
            <p className="font-bold">
              {totals.needsAmount} commission{totals.needsAmount === 1 ? "" : "s"} cannot be
              approved yet
            </p>
            <p className="mt-0.5 text-amber-800">
              These agents are paid a percentage, but no service fee has been recorded for
              their student — so there is nothing to calculate from. Set the fee on the
              student&apos;s page, or enter the amount directly below.
            </p>
          </div>
        </div>
      )}

      {totals.flagged > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3.5">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
          <div className="text-xs text-slate-700">
            <p className="font-bold">
              {totals.flagged} paid commission{totals.flagged === 1 ? "" : "s"} flagged for
              review
            </p>
            <p className="mt-0.5 text-slate-600">
              The student later left the enrolled stage. The payment was deliberately not
              reversed — settle these manually with the agent.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const active = status === t.key;
          const n = counts[t.key] ?? 0;
          return (
            <button
              key={t.key}
              onClick={() => go(t.key)}
              className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition-colors ${
                active
                  ? "border-[#6355d8] bg-[#f0edff] text-[#6355d8]"
                  : "border-slate-200 text-slate-500 hover:border-[#6355d8] hover:text-[#6355d8]"
              }`}
            >
              {t.label}
              {n > 0 && <span className="ml-1.5 text-slate-400">{n}</span>}
            </button>
          );
        })}
        {navigating && <Loader2 className="h-4 w-4 animate-spin text-[#6355d8]" />}
        <button
          onClick={exportCsv}
          disabled={rows.length === 0}
          className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-[11px] font-bold text-slate-600 transition-colors hover:border-[#6355d8] hover:text-[#6355d8] disabled:opacity-40"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      </div>

      {approveState && (
        <p
          className={`rounded-xl border px-3.5 py-2.5 text-[11px] font-semibold ${
            approveState.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {approveState.success ? approveState.message : approveState.error}
        </p>
      )}

      {/* Bulk bar: ONE action over an array of ids, because actions dispatch
          sequentially per client — Promise.all over N actions would serialise. */}
      {selected.length > 0 && (
        <form
          action={approveAction}
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#6355d8]/30 bg-[#f0edff] px-4 py-3"
        >
          {selected.map((id) => (
            <input key={id} type="hidden" name="ids" value={id} />
          ))}
          <p className="text-xs font-bold text-[#1e1b4b]">
            {selected.length} selected ·{" "}
            {formatMoney(
              rows.filter((r) => selected.includes(r.id)).reduce((n, r) => n + Number(r.amount ?? 0), 0)
            )}
          </p>
          <button
            type="submit"
            disabled={approving}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#6355d8] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#5244c7] disabled:opacity-60"
          >
            {approving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BadgeCheck className="h-3.5 w-3.5" />}
            Approve selected
          </button>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="cursor-pointer text-[11px] font-bold text-slate-500 hover:text-slate-700"
          >
            Clear
          </button>
        </form>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
        <div className="grid grid-cols-12 items-center gap-3 border-b border-slate-100 px-6 py-3.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
          <div className="col-span-1">
            {status === "earned" && selectable.length > 0 && (
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                aria-label="Select all approvable"
                className="h-3.5 w-3.5 cursor-pointer accent-[#6355d8]"
              />
            )}
          </div>
          <div className="col-span-4 sm:col-span-3">Student / Agent</div>
          <div className="col-span-3 sm:col-span-2">Amount</div>
          <div className="col-span-2 hidden sm:block">Rate</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Wallet className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-[#1e1b4b]">Nothing here</p>
            <p className="mt-1 text-xs text-slate-400">
              Commissions appear automatically when a referred student reaches Enrolled.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {rows.map((r) => {
              const style = COMMISSION_STATUS_STYLE[r.status];
              return (
                <div
                  key={r.id}
                  className={`grid grid-cols-12 items-center gap-3 px-6 py-4 ${
                    r.needs_amount ? "bg-amber-50/40" : ""
                  }`}
                >
                  <div className="col-span-1">
                    {r.status === "earned" && !r.needs_amount && (
                      <input
                        type="checkbox"
                        checked={selected.includes(r.id)}
                        onChange={() => toggle(r.id)}
                        aria-label={`Select commission for ${r.student_name}`}
                        className="h-3.5 w-3.5 cursor-pointer accent-[#6355d8]"
                      />
                    )}
                  </div>

                  <div className="col-span-4 min-w-0 sm:col-span-3">
                    <Link
                      href={`/admin/students/${r.lead_id}`}
                      className="truncate text-sm font-bold text-[#1e1b4b] hover:text-[#6355d8] hover:underline"
                    >
                      {r.student_name}
                    </Link>
                    <Link
                      href={`/admin/agents/${r.agent_id}`}
                      className="block truncate text-[11px] text-slate-400 hover:text-[#6355d8]"
                    >
                      {r.agent_name}
                    </Link>
                  </div>

                  <div className="col-span-3 sm:col-span-2">
                    {r.needs_amount ? (
                      <button
                        onClick={() => setAmountFor(r)}
                        className="cursor-pointer rounded-lg border border-amber-300 bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800 transition-colors hover:bg-amber-200"
                      >
                        Set amount
                      </button>
                    ) : (
                      <p className="text-sm font-extrabold text-[#1e1b4b]">
                        {formatMoney(r.amount, r.currency)}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 hidden sm:block">
                    <p className="text-[11px] text-slate-500">
                      {describeCommission(r.commission_type, r.commission_value)}
                    </p>
                    {r.base_amount !== null && (
                      <p className="text-[10px] text-slate-400">
                        fee {formatMoney(r.base_amount)}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${style.className}`}
                    >
                      {style.label}
                    </span>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {r.status === "paid"
                        ? formatDate(r.paid_at)
                        : r.status === "approved"
                          ? formatDate(r.approved_at)
                          : formatDate(r.earned_at)}
                    </p>
                    {r.stage_reverted_at && (
                      <p className="text-[10px] font-bold text-amber-600">⚠ reverted</p>
                    )}
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    {r.status === "earned" && !r.needs_amount && (
                      <form action={approveAction}>
                        <input type="hidden" name="ids" value={r.id} />
                        <button
                          type="submit"
                          title="Approve"
                          className="cursor-pointer rounded-lg border border-slate-200 p-1.5 text-slate-500 transition-colors hover:border-sky-300 hover:text-sky-600"
                        >
                          <BadgeCheck className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    )}
                    {r.status === "approved" && (
                      <button
                        onClick={() => setPayFor(r)}
                        title="Record payment"
                        className="flex cursor-pointer items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-emerald-700"
                      >
                        <Banknote className="h-3 w-3" />
                        Pay
                      </button>
                    )}
                    {(r.status === "earned" || r.status === "approved") && (
                      <button
                        onClick={() => setCancelFor(r)}
                        title="Cancel"
                        className="cursor-pointer rounded-lg border border-slate-200 p-1.5 text-slate-400 transition-colors hover:border-rose-300 hover:text-rose-600"
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {r.status === "paid" && r.payment_reference && (
                      <span className="truncate font-mono text-[10px] text-slate-400">
                        {r.payment_reference}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {payFor && <PayDialog row={payFor} onClose={() => setPayFor(null)} />}
      {cancelFor && <CancelDialog row={cancelFor} onClose={() => setCancelFor(null)} />}
      {amountFor && <AmountDialog row={amountFor} onClose={() => setAmountFor(null)} />}
    </div>
  );
}

function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-[#1e1b4b]/40 p-4 backdrop-blur-sm">
      <div className="mt-20 w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
        <h2 className="text-sm font-extrabold text-[#1e1b4b]">{title}</h2>
        <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

function PayDialog({ row, onClose }: { row: CommissionRow; onClose: () => void }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    recordPayment,
    null
  );
  const err = (n: string) => (state && !state.success ? state.fieldErrors?.[n]?.[0] : undefined);

  if (state?.success) {
    return (
      <Shell title="Payment recorded" subtitle={`${row.agent_name} · ${row.student_name}`}>
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700">
          <Check className="h-4 w-4" />
          {state.message}
        </p>
        <button
          onClick={onClose}
          className="mt-4 w-full cursor-pointer rounded-xl bg-[#1e1b4b] py-2.5 text-xs font-bold text-white hover:bg-[#2d2a5e]"
        >
          Done
        </button>
      </Shell>
    );
  }

  return (
    <Shell
      title={`Pay ${formatMoney(row.amount, row.currency)}`}
      subtitle={`${row.agent_name} · for ${row.student_name}`}
    >
      <form action={action} className="mt-4">
        <input type="hidden" name="id" value={row.id} />

        {state && !state.success && !state.fieldErrors && (
          <p className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">
            {state.error}
          </p>
        )}

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Payment reference *</span>
          <input name="paymentReference" required className={input} placeholder="UTR / cheque no." />
          {err("paymentReference") ? (
            <span className="text-[11px] font-semibold text-rose-600">
              {err("paymentReference")}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">
              Required — a payout must stay traceable.
            </span>
          )}
        </label>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Method</span>
            <select name="paymentMethod" defaultValue="" className={`${input} cursor-pointer`}>
              <option value="">—</option>
              <option value="UPI">UPI</option>
              <option value="NEFT">NEFT / IMPS</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Paid on</span>
            <input type="date" name="paidAt" className={input} />
            <span className="text-[11px] text-slate-400">Blank = today</span>
          </label>
        </div>

        <label className="mt-3 flex flex-col gap-1.5">
          <span className={labelCls}>Note</span>
          <textarea name="paymentNote" rows={2} className={`${input} resize-none`} />
        </label>

        <p className="mt-3 rounded-xl border border-slate-200 bg-[#f8f9fd] px-3 py-2 text-[10px] leading-relaxed text-slate-500">
          This is final — a paid commission cannot be reverted or edited.
        </p>

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
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Banknote className="h-3.5 w-3.5" />}
            Record payment
          </button>
        </div>
      </form>
    </Shell>
  );
}

function CancelDialog({ row, onClose }: { row: CommissionRow; onClose: () => void }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    cancelCommission,
    null
  );

  if (state?.success) {
    return (
      <Shell title="Commission cancelled" subtitle={row.student_name}>
        <button
          onClick={onClose}
          className="mt-4 w-full cursor-pointer rounded-xl bg-[#1e1b4b] py-2.5 text-xs font-bold text-white hover:bg-[#2d2a5e]"
        >
          Done
        </button>
      </Shell>
    );
  }

  return (
    <Shell
      title="Cancel this commission"
      subtitle={`${formatMoney(row.amount, row.currency)} · ${row.agent_name}`}
    >
      <form action={action} className="mt-4">
        <input type="hidden" name="id" value={row.id} />
        {state && !state.success && (
          <p className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">
            {state.error}
          </p>
        )}
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Reason *</span>
          <textarea
            name="reason"
            rows={3}
            required
            className={`${input} resize-none`}
            placeholder="Why this payout is not owed…"
          />
        </label>
        <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
          The record is kept, not deleted — the ledger is append-only. The agent will see it
          as Cancelled.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100"
          >
            Keep it
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
            Cancel commission
          </button>
        </div>
      </form>
    </Shell>
  );
}

function AmountDialog({ row, onClose }: { row: CommissionRow; onClose: () => void }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    setCommissionAmount,
    null
  );

  if (state?.success) {
    return (
      <Shell title="Amount saved" subtitle={row.student_name}>
        <button
          onClick={onClose}
          className="mt-4 w-full cursor-pointer rounded-xl bg-[#1e1b4b] py-2.5 text-xs font-bold text-white hover:bg-[#2d2a5e]"
        >
          Done
        </button>
      </Shell>
    );
  }

  return (
    <Shell
      title="Set the commission amount"
      subtitle={`${row.agent_name} · ${row.student_name}`}
    >
      <form action={action} className="mt-4">
        <input type="hidden" name="id" value={row.id} />
        {state && !state.success && (
          <p className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">
            {state.error}
          </p>
        )}
        <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
          This agent earns {describeCommission(row.commission_type, row.commission_value)}, but
          no service fee was recorded for this student, so the amount could not be calculated.
        </p>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Amount (₹) *</span>
          <input type="number" name="amount" min="0" required className={input} />
          <span className="text-[11px] text-slate-400">
            Can only be changed before approval. Setting the student&apos;s service fee instead
            keeps the calculation auditable.
          </span>
        </label>
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
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Save amount
          </button>
        </div>
      </form>
    </Shell>
  );
}
