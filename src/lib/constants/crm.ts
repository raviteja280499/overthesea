import type { CommissionStatus } from "@/lib/types/crm";

/** Indian-format currency, e.g. ₹1,00,000. Amount may be null for an unpriced percent commission. */
export function formatMoney(amount: number | null | undefined, currency = "INR"): string {
  if (amount === null || amount === undefined) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  } catch {
    return `${currency} ${Number(amount).toLocaleString("en-IN")}`;
  }
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export const COMMISSION_STATUS_STYLE: Record<
  CommissionStatus,
  { label: string; className: string }
> = {
  earned: { label: "Earned", className: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Approved", className: "bg-sky-50 text-sky-700 border-sky-200" },
  paid: { label: "Paid", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-500 border-slate-200" },
};

/** Describes an agent's commission configuration in one line. */
export function describeCommission(type: "flat" | "percent", value: number): string {
  return type === "flat" ? `${formatMoney(value)} flat` : `${value}% of service fee`;
}

/**
 * Suggests a readable temporary password the admin can pass on verbally.
 * Deliberately avoids look-alike characters (0/O, 1/l/I).
 */
export function suggestPassword(): string {
  const words = ["Ocean", "Harbour", "Voyage", "Compass", "Monsoon", "Lantern", "Summit", "Quartz"];
  const chars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const pick = <T,>(arr: T[] | string): T | string =>
    arr[Math.floor(Math.random() * arr.length)];
  const tail = Array.from({ length: 4 }, () => pick(chars)).join("");
  return `${pick(words)}-${pick(words)}-${tail}`;
}
