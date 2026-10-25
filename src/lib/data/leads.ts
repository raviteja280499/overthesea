import "server-only";

import { cache } from "react";

import { assertAdmin } from "@/lib/auth/dal";
import { createServerSupabase } from "@/lib/supabase/server";
import type {
  Commission,
  EducationDetails,
  Lead,
  LeadStage,
  LeadStageHistoryEntry,
  LeadVertical,
  Profile,
} from "@/lib/types/crm";

export const getStages = cache(
  async (vertical: LeadVertical = "education"): Promise<LeadStage[]> => {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from("lead_stages")
      .select("*")
      .eq("vertical", vertical)
      .order("sort_order");
    return (data ?? []) as LeadStage[];
  }
);

export interface LeadListRow extends Lead {
  stage_label: string;
  stage_accent: string | null;
  is_won: boolean;
  agent_name: string | null;
  commission_status: Commission["status"] | null;
  commission_amount: number | null;
}

export interface LeadFilters {
  vertical?: LeadVertical;
  stage?: string;
  agentId?: string;
  q?: string;
  archived?: boolean;
}

export const listLeads = cache(
  async (filters: LeadFilters = {}): Promise<LeadListRow[]> => {
    await assertAdmin();
    const supabase = await createServerSupabase();

    const vertical = filters.vertical ?? "education";

    let query = supabase.from("leads").select("*").eq("vertical", vertical);

    query = filters.archived
      ? query.not("archived_at", "is", null)
      : query.is("archived_at", null);

    if (filters.stage && filters.stage !== "all") query = query.eq("stage_key", filters.stage);
    if (filters.agentId && filters.agentId !== "all") query = query.eq("agent_id", filters.agentId);

    // Server-side search across the columns a counsellor actually types into,
    // rather than fetching every row and filtering in JS the way
    // /api/inquiries does.
    if (filters.q) {
      const term = filters.q.replace(/[%,()]/g, " ").trim();
      if (term) {
        query = query.or(
          [
            `student_name.ilike.%${term}%`,
            `phone.ilike.%${term}%`,
            `email.ilike.%${term}%`,
            `target_country.ilike.%${term}%`,
          ].join(",")
        );
      }
    }

    const [{ data: leads }, stages, { data: agents }, { data: commissions }] = await Promise.all([
      query.order("created_at", { ascending: false }).limit(500),
      getStages(vertical),
      supabase.from("profiles").select("id, full_name").eq("role", "agent"),
      supabase.from("commissions").select("lead_id, status, amount"),
    ]);

    const stageByKey = new Map(stages.map((s) => [s.key, s]));
    const agentById = new Map(
      ((agents ?? []) as Pick<Profile, "id" | "full_name">[]).map((a) => [a.id, a.full_name])
    );
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
        ...l,
        deal_value: l.deal_value === null ? null : Number(l.deal_value),
        stage_label: stage?.label ?? l.stage_key.replace(/_/g, " "),
        stage_accent: stage?.accent ?? null,
        is_won: stage?.is_won ?? false,
        agent_name: l.agent_id ? (agentById.get(l.agent_id) ?? "Unknown agent") : null,
        commission_status: commission?.status ?? null,
        commission_amount:
          commission?.amount === null || commission?.amount === undefined
            ? null
            : Number(commission.amount),
      };
    });
  }
);

export interface LeadDetail {
  lead: Lead;
  education: EducationDetails | null;
  stages: LeadStage[];
  history: LeadStageHistoryEntry[];
  commission: Commission | null;
  agent: Pick<Profile, "id" | "full_name" | "email" | "commission_type" | "commission_value"> | null;
  agents: Pick<Profile, "id" | "full_name">[];
}

export const getLead = cache(async (id: string): Promise<LeadDetail | null> => {
  await assertAdmin();
  const supabase = await createServerSupabase();

  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (!lead) return null;

  const [
    { data: education },
    stages,
    { data: history },
    { data: commission },
    { data: agents },
  ] = await Promise.all([
    supabase.from("education_details").select("*").eq("lead_id", id).maybeSingle(),
    getStages(lead.vertical),
    supabase
      .from("lead_stage_history")
      .select("*")
      .eq("lead_id", id)
      .order("changed_at", { ascending: false }),
    supabase.from("commissions").select("*").eq("lead_id", id).maybeSingle(),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "agent")
      .eq("status", "active")
      .order("full_name"),
  ]);

  let agent: LeadDetail["agent"] = null;
  if (lead.agent_id) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, commission_type, commission_value")
      .eq("id", lead.agent_id)
      .maybeSingle();
    if (data) agent = { ...data, commission_value: Number(data.commission_value) };
  }

  return {
    lead: { ...lead, deal_value: lead.deal_value === null ? null : Number(lead.deal_value) } as Lead,
    education: (education ?? null) as EducationDetails | null,
    stages,
    history: (history ?? []) as LeadStageHistoryEntry[],
    commission: commission
      ? ({
          ...commission,
          amount: commission.amount === null ? null : Number(commission.amount),
          commission_value: Number(commission.commission_value),
        } as Commission)
      : null,
    agent,
    agents: (agents ?? []) as Pick<Profile, "id" | "full_name">[],
  };
});

/** Counts per stage for the pipeline strip, ignoring the active filters. */
export const getPipelineCounts = cache(
  async (vertical: LeadVertical = "education"): Promise<Record<string, number>> => {
    await assertAdmin();
    const supabase = await createServerSupabase();

    const { data } = await supabase
      .from("leads")
      .select("stage_key")
      .eq("vertical", vertical)
      .is("archived_at", null);

    const counts: Record<string, number> = {};
    for (const row of (data ?? []) as { stage_key: string }[]) {
      counts[row.stage_key] = (counts[row.stage_key] ?? 0) + 1;
    }
    return counts;
  }
);
