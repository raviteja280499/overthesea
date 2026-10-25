import "server-only";

import { cache } from "react";

import { assertAgent } from "@/lib/auth/dal";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Commission, Lead, LeadStage } from "@/lib/types/crm";

/**
 * Every query here runs through the agent's own JWT, so the
 * `leads_agent_select_own` / `comm_agent_select_own` policies scope the rows.
 * The `.eq("agent_id", …)` filters below are belt-and-braces for intent, not
 * the security boundary — if they were deleted the database would still
 * return only this agent's rows.
 *
 * Internal data (test scores, budget, counsellor notes) lives in
 * education_details, which has no agent policy at all, so it is unreachable
 * from here by construction rather than by careful column selection.
 */

export interface AgentLeadRow {
  id: string;
  student_name: string;
  phone: string | null;
  email: string | null;
  target_country: string | null;
  remarks: string | null;
  stage_key: string;
  stage_label: string;
  stage_accent: string | null;
  is_won: boolean;
  created_at: string;
  commission_status: Commission["status"] | null;
  commission_amount: number | null;
}

export const getStages = cache(async (vertical = "education"): Promise<LeadStage[]> => {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("lead_stages")
    .select("*")
    .eq("vertical", vertical)
    .order("sort_order");
  return (data ?? []) as LeadStage[];
});

export const getMyLeads = cache(async (): Promise<AgentLeadRow[]> => {
  const user = await assertAgent();
  const supabase = await createServerSupabase();

  const [{ data: leads }, { data: commissions }, stages] = await Promise.all([
    supabase
      .from("leads")
      .select("*")
      .eq("agent_id", user.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    supabase.from("commissions").select("lead_id, status, amount").eq("agent_id", user.id),
    getStages(),
  ]);

  const stageByKey = new Map(stages.map((s) => [s.key, s]));
  const commissionByLead = new Map(
    ((commissions ?? []) as Pick<Commission, "lead_id" | "status" | "amount">[]).map((c) => [
      c.lead_id,
      c,
    ])
  );

  return ((leads ?? []) as Lead[]).map((l) => {
    const stage = stageByKey.get(l.stage_key);
    const commission = commissionByLead.get(l.id);
    return {
      id: l.id,
      student_name: l.student_name,
      phone: l.phone,
      email: l.email,
      target_country: l.target_country,
      remarks: l.remarks,
      stage_key: l.stage_key,
      stage_label: stage?.label ?? l.stage_key.replace(/_/g, " "),
      stage_accent: stage?.accent ?? null,
      is_won: stage?.is_won ?? false,
      created_at: l.created_at,
      commission_status: commission?.status ?? null,
      commission_amount:
        commission?.amount === null || commission?.amount === undefined
          ? null
          : Number(commission.amount),
    };
  });
});

export const getMyCommissions = cache(async (): Promise<Commission[]> => {
  const user = await assertAgent();
  const supabase = await createServerSupabase();

  const { data } = await supabase
    .from("commissions")
    .select("*")
    .eq("agent_id", user.id)
    .order("earned_at", { ascending: false });

  return ((data ?? []) as Commission[]).map((c) => ({
    ...c,
    amount: c.amount === null ? null : Number(c.amount),
    commission_value: Number(c.commission_value),
  }));
});

export interface AgentStats {
  totalReferrals: number;
  enrolled: number;
  inProgress: number;
  earned: number;
  approved: number;
  paid: number;
}

export const getMyStats = cache(async (): Promise<AgentStats> => {
  const [leads, commissions] = await Promise.all([getMyLeads(), getMyCommissions()]);

  const sum = (status: Commission["status"]) =>
    commissions
      .filter((c) => c.status === status)
      .reduce((n, c) => n + Number(c.amount ?? 0), 0);

  return {
    totalReferrals: leads.length,
    enrolled: leads.filter((l) => l.is_won).length,
    inProgress: leads.filter((l) => !l.is_won).length,
    earned: sum("earned"),
    approved: sum("approved"),
    paid: sum("paid"),
  };
});
