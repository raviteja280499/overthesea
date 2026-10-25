"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assertAgent } from "@/lib/auth/dal";
import { ok, fail, withAction, type ActionResult } from "@/lib/actions/result";
import { createServerSupabase } from "@/lib/supabase/server";
import { agentLeadSchema } from "@/lib/validation/lead";

/**
 * Agent refers a student.
 *
 * The insert is written through the AGENT's own client, so
 * `leads_agent_insert_own` validates it: agent_id and created_by must be the
 * caller, source must be 'agent', deal_value must be null, and stage_key must
 * be the vertical's first stage. Forging any of those in the request body
 * fails at the database, not merely in this function.
 */
export async function createLeadAsAgent(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  return withAction(async () => {
    const user = await assertAgent();

    const parsed = agentLeadSchema.safeParse({
      studentName: formData.get("studentName"),
      phone: formData.get("phone") ?? "",
      targetCountry: formData.get("targetCountry") ?? "",
      remarks: formData.get("remarks") ?? "",
    });

    if (!parsed.success) {
      return fail("Check the details below.", z.flattenError(parsed.error).fieldErrors);
    }

    const supabase = await createServerSupabase();

    // Resolve the first stage from lead_stages rather than hardcoding 'new',
    // so renaming or reordering a pipeline stays a data change.
    const { data: firstStage } = await supabase
      .from("lead_stages")
      .select("key")
      .eq("vertical", "education")
      .order("sort_order")
      .limit(1)
      .maybeSingle();

    if (!firstStage) return fail("The education pipeline is not configured.");

    const { data, error } = await supabase
      .from("leads")
      .insert({
        vertical: "education",
        agent_id: user.id,
        created_by: user.id,
        source: "agent",
        student_name: parsed.data.studentName,
        phone: parsed.data.phone || null,
        target_country: parsed.data.targetCountry,
        remarks: parsed.data.remarks,
        stage_key: firstStage.key,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[createLeadAsAgent]", error);
      return fail("Could not save this referral. Please try again.");
    }

    revalidatePath("/agent/students");
    revalidatePath("/agent/dashboard");
    return ok({ id: data.id }, `${parsed.data.studentName} has been referred.`);
  });
}

/**
 * Agent edits their own referral.
 *
 * Only contact details and their own remarks. `guard_lead_fields` raises
 * 42501 if stage, ownership or deal value are touched.
 */
export async function updateMyLead(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return withAction(async () => {
    const user = await assertAgent();

    const id = String(formData.get("id") ?? "");
    const parsed = agentLeadSchema.safeParse({
      studentName: formData.get("studentName"),
      phone: formData.get("phone") ?? "",
      targetCountry: formData.get("targetCountry") ?? "",
      remarks: formData.get("remarks") ?? "",
    });

    if (!id) return fail("Invalid request.");
    if (!parsed.success) {
      return fail("Check the details below.", z.flattenError(parsed.error).fieldErrors);
    }

    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("leads")
      .update({
        student_name: parsed.data.studentName,
        phone: parsed.data.phone || null,
        target_country: parsed.data.targetCountry,
        remarks: parsed.data.remarks,
      })
      .eq("id", id)
      .eq("agent_id", user.id);

    if (error) {
      console.error("[updateMyLead]", error);
      return fail("Could not update this referral.");
    }

    revalidatePath("/agent/students");
    return ok(undefined, "Saved.");
  });
}
