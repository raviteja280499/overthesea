import "server-only";

import { cache } from "react";

import { assertAdmin } from "@/lib/auth/dal";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Commission, Lead, Profile } from "@/lib/types/crm";

export interface AgentSummary extends Profile {
  lead_count: number;
  enrolled_count: number;
  earned_total: number;
  paid_total: number;
}

/**
 * Agent roster with referral and payout rollups.
 *
 * Reads go through the user-scoped client, so the admin's own RLS policy is
 * what grants visibility — the service-role key is reserved for provisioning.
 */
export const listAgents = cache(async (): Promise<AgentSummary[]> => {
  await assertAdmin();
  const supabase = await createServerSupabase();

  const [{ data: profiles }, { data: leads }, { data: commissions }] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "agent").order("created_at", { ascending: false }),
    supabase.from("leads").select("id, agent_id, stage_key").is("archived_at", null),
    supabase.from("commissions").select("agent_id, amount, status"),
  ]);

  const leadRows = (leads ?? []) as Pick<Lead, "id" | "agent_id" | "stage_key">[];
  const commissionRows = (commissions ?? []) as Pick<Commission, "agent_id" | "amount" | "status">[];

  return ((profiles ?? []) as Profile[]).map((p) => {
    const mine = leadRows.filter((l) => l.agent_id === p.id);
    const myCommissions = commissionRows.filter((c) => c.agent_id === p.id);

    const sum = (rows: typeof myCommissions) =>
      rows.reduce((acc, c) => acc + Number(c.amount ?? 0), 0);

    return {
      ...p,
      commission_value: Number(p.commission_value),
      lead_count: mine.length,
      enrolled_count: mine.filter((l) => l.stage_key === "enrolled").length,
      // "Owed" is everything not yet paid out and not cancelled.
      earned_total: sum(myCommissions.filter((c) => c.status === "earned" || c.status === "approved")),
      paid_total: sum(myCommissions.filter((c) => c.status === "paid")),
    };
  });
});

export interface AgentDetail {
  profile: Profile;
  leads: Lead[];
  commissions: Commission[];
}

export const getAgent = cache(async (id: string): Promise<AgentDetail | null> => {
  await assertAdmin();
  const supabase = await createServerSupabase();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "agent")
    .maybeSingle();

  if (!profile) return null;

  const [{ data: leads }, { data: commissions }] = await Promise.all([
    supabase.from("leads").select("*").eq("agent_id", id).order("created_at", { ascending: false }),
    supabase.from("commissions").select("*").eq("agent_id", id).order("earned_at", { ascending: false }),
  ]);

  return {
    profile: { ...profile, commission_value: Number(profile.commission_value) } as Profile,
    leads: (leads ?? []) as Lead[],
    commissions: (commissions ?? []) as Commission[],
  };
});

/**
 * Auth users with no profile row — the failure mode when createUser succeeds
 * but the profile insert does not. They can sign in but verifySession()
 * rejects them, so they are invisible everywhere else. Surfaced on the roster
 * so they can be cleaned up rather than silently accumulating.
 */
export const countOrphanedAuthUsers = cache(async (): Promise<number> => {
  await assertAdmin();
  const { getServiceClient } = await import("@/lib/supabase/admin");
  const admin = getServiceClient();

  const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (!data?.users?.length) return 0;

  const { data: profiles } = await admin.from("profiles").select("id");
  const known = new Set((profiles ?? []).map((p: { id: string }) => p.id));
  return data.users.filter((u) => !known.has(u.id)).length;
});
