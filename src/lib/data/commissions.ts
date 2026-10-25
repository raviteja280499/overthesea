import "server-only";

import { cache } from "react";

import { assertAdmin } from "@/lib/auth/dal";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Commission, CommissionStatus, Lead, Profile } from "@/lib/types/crm";

export interface CommissionRow extends Commission {
  agent_name: string;
  agent_email: string;
  student_name: string;
  /** True when a percent commission has no amount yet — it blocks approval. */
  needs_amount: boolean;
}

export interface CommissionTotals {
  earned: number;
  approved: number;
  paid: number;
  cancelled: number;
  needsAmount: number;
  flagged: number;
}

export interface CommissionLedger {
  rows: CommissionRow[];
  totals: CommissionTotals;
}

export const listCommissions = cache(
  async (status?: string): Promise<CommissionLedger> => {
    await assertAdmin();
    const supabase = await createServerSupabase();

    // Always load every row: the tab counts and totals have to reflect the
    // whole ledger, not just the slice currently being viewed.
    const [{ data: commissions }, { data: profiles }, { data: leads }] = await Promise.all([
      supabase.from("commissions").select("*").order("earned_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, email"),
      supabase.from("leads").select("id, student_name"),
    ]);

    const agentById = new Map(
      ((profiles ?? []) as Pick<Profile, "id" | "full_name" | "email">[]).map((p) => [p.id, p])
    );
    const studentById = new Map(
      ((leads ?? []) as Pick<Lead, "id" | "student_name">[]).map((l) => [l.id, l.student_name])
    );

    const all: CommissionRow[] = ((commissions ?? []) as Commission[]).map((c) => {
      const amount = c.amount === null ? null : Number(c.amount);
      const agent = agentById.get(c.agent_id);
      return {
        ...c,
        amount,
        commission_value: Number(c.commission_value),
        base_amount: c.base_amount === null ? null : Number(c.base_amount),
        agent_name: agent?.full_name ?? "Unknown agent",
        agent_email: agent?.email ?? "",
        student_name: studentById.get(c.lead_id) ?? "Unknown student",
        needs_amount: c.status === "earned" && amount === null,
      };
    });

    const sum = (s: CommissionStatus) =>
      all.filter((c) => c.status === s).reduce((n, c) => n + Number(c.amount ?? 0), 0);

    const totals: CommissionTotals = {
      earned: sum("earned"),
      approved: sum("approved"),
      paid: sum("paid"),
      cancelled: sum("cancelled"),
      needsAmount: all.filter((c) => c.needs_amount).length,
      flagged: all.filter((c) => c.stage_reverted_at).length,
    };

    const rows =
      status && status !== "all" ? all.filter((c) => c.status === status) : all;

    return { rows, totals };
  }
);

/** Counts per status, for the tab labels. */
export const getCommissionCounts = cache(
  async (): Promise<Record<string, number>> => {
    await assertAdmin();
    const supabase = await createServerSupabase();

    const { data } = await supabase.from("commissions").select("status");
    const counts: Record<string, number> = { all: 0 };
    for (const row of (data ?? []) as { status: string }[]) {
      counts.all += 1;
      counts[row.status] = (counts[row.status] ?? 0) + 1;
    }
    return counts;
  }
);
