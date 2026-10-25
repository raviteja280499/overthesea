import { CommissionLedgerView } from "@/components/admin/CommissionLedgerView";
import { getCommissionCounts, listCommissions } from "@/lib/data/commissions";

export const metadata = { title: "Commissions · Over The Sea Admin" };

export default async function CommissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "earned";

  const [{ rows, totals }, counts] = await Promise.all([
    listCommissions(status),
    getCommissionCounts(),
  ]);

  return (
    <CommissionLedgerView rows={rows} totals={totals} counts={counts} status={status} />
  );
}
