"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assertAdmin } from "@/lib/auth/dal";
import { ok, fail, withAction, type ActionResult } from "@/lib/actions/result";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  adminLeadSchema,
  archiveLeadSchema,
  assignAgentSchema,
  convertInquirySchema,
  educationDetailsSchema,
  setDealValueSchema,
  stageChangeSchema,
  updateLeadBasicsSchema,
} from "@/lib/validation/lead";

const str = (fd: FormData, k: string) => fd.get(k) ?? "";

function revalidateLead(id: string) {
  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${id}`);
  revalidatePath("/admin/commissions");
  revalidatePath("/admin/agents");
}

/** Admin creates a lead directly (walk-in, phone call, or manual entry). */
export async function createLeadAsAdmin(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  return withAction(async () => {
    const admin = await assertAdmin();

    const parsed = adminLeadSchema.safeParse({
      vertical: formData.get("vertical") || "education",
      studentName: formData.get("studentName"),
      phone: str(formData, "phone"),
      email: str(formData, "email"),
      targetCountry: str(formData, "targetCountry"),
      remarks: str(formData, "remarks"),
      agentId: str(formData, "agentId"),
      dealValue: str(formData, "dealValue"),
    });

    if (!parsed.success) {
      return fail("Check the details below.", z.flattenError(parsed.error).fieldErrors);
    }
    const input = parsed.data;

    const supabase = await createServerSupabase();

    const { data: firstStage } = await supabase
      .from("lead_stages")
      .select("key")
      .eq("vertical", input.vertical)
      .order("sort_order")
      .limit(1)
      .maybeSingle();

    if (!firstStage) return fail("That pipeline is not configured.");

    const { data, error } = await supabase
      .from("leads")
      .insert({
        vertical: input.vertical,
        agent_id: input.agentId || null,
        created_by: admin.id,
        // Attributing it to an agent means the referral is theirs; otherwise
        // it is a direct walk-in and no commission will ever accrue.
        source: input.agentId ? "agent" : "admin_manual",
        student_name: input.studentName,
        phone: input.phone || null,
        email: input.email || null,
        target_country: input.targetCountry,
        remarks: input.remarks,
        stage_key: firstStage.key,
        deal_value: input.dealValue,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[createLeadAsAdmin]", error);
      return fail("Could not create this student record.");
    }

    revalidateLead(data.id);
    return ok({ id: data.id }, `${input.studentName} added.`);
  });
}

export async function updateLeadBasics(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return withAction(async () => {
    await assertAdmin();

    const parsed = updateLeadBasicsSchema.safeParse({
      id: formData.get("id"),
      studentName: formData.get("studentName"),
      phone: str(formData, "phone"),
      email: str(formData, "email"),
      targetCountry: str(formData, "targetCountry"),
      remarks: str(formData, "remarks"),
    });

    if (!parsed.success) {
      return fail("Check the details below.", z.flattenError(parsed.error).fieldErrors);
    }

    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("leads")
      .update({
        student_name: parsed.data.studentName,
        phone: parsed.data.phone || null,
        email: parsed.data.email || null,
        target_country: parsed.data.targetCountry,
        remarks: parsed.data.remarks,
      })
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[updateLeadBasics]", error);
      return fail("Could not save these details.");
    }

    revalidateLead(parsed.data.id);
    return ok(undefined, "Saved.");
  });
}

/**
 * Move a lead through the pipeline.
 *
 * This is the action that can create money: the `accrue_commission` trigger
 * fires on the stage change itself, inside the same transaction. Nothing here
 * writes to `commissions` — if it did, there would be two places that mint
 * payouts and one of them would eventually drift.
 */
export async function changeLeadStage(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return withAction(async () => {
    await assertAdmin();

    const parsed = stageChangeSchema.safeParse({
      id: formData.get("id"),
      stageKey: formData.get("stageKey"),
      note: str(formData, "note"),
    });

    if (!parsed.success) return fail("Invalid stage change.");

    const supabase = await createServerSupabase();

    const { data: lead } = await supabase
      .from("leads")
      .select("id, vertical, agent_id, deal_value, stage_key")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (!lead) return fail("Student not found.");
    if (lead.stage_key === parsed.data.stageKey) return ok(undefined, "Already at that stage.");

    const { data: stage } = await supabase
      .from("lead_stages")
      .select("key, label, is_commissionable")
      .eq("vertical", lead.vertical)
      .eq("key", parsed.data.stageKey)
      .maybeSingle();

    if (!stage) return fail("That stage does not belong to this pipeline.");

    const { error } = await supabase
      .from("leads")
      .update({ stage_key: stage.key })
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[changeLeadStage]", error);
      return fail("Could not change the stage.");
    }

    revalidateLead(parsed.data.id);

    // Warn rather than block: a percent agent with no deal value accrues a
    // null amount, which the approved_requires_amount CHECK will later refuse
    // to approve. Better to say so now than to let a payout stall silently.
    if (stage.is_commissionable && lead.agent_id && lead.deal_value === null) {
      const { data: agent } = await supabase
        .from("profiles")
        .select("commission_type")
        .eq("id", lead.agent_id)
        .maybeSingle();

      if (agent?.commission_type === "percent") {
        return ok(
          undefined,
          `Moved to ${stage.label}. Set a service fee for this student — their agent is on a percentage, so the commission amount cannot be calculated yet.`
        );
      }
    }

    return ok(undefined, `Moved to ${stage.label}.`);
  });
}

/** The big study-abroad form. One UPDATE: the detail row is created by trigger. */
export async function updateEducationDetails(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return withAction(async () => {
    await assertAdmin();

    const parsed = educationDetailsSchema.safeParse({
      leadId: formData.get("leadId"),
      dateOfBirth: str(formData, "dateOfBirth"),
      gender: str(formData, "gender"),
      passportNumber: str(formData, "passportNumber"),
      passportExpiry: str(formData, "passportExpiry"),
      currentAddress: str(formData, "currentAddress"),
      city: str(formData, "city"),
      state: str(formData, "state"),
      highestQualification: str(formData, "highestQualification"),
      boardOrUniversity: str(formData, "boardOrUniversity"),
      yearOfPassing: str(formData, "yearOfPassing"),
      percentageOrCgpa: str(formData, "percentageOrCgpa"),
      backlogs: str(formData, "backlogs"),
      englishTest: str(formData, "englishTest"),
      englishTestScore: str(formData, "englishTestScore"),
      englishTestDate: str(formData, "englishTestDate"),
      greScore: str(formData, "greScore"),
      gmatScore: str(formData, "gmatScore"),
      preferredCountries: formData.getAll("preferredCountries").map(String).filter(Boolean),
      preferredIntake: str(formData, "preferredIntake"),
      preferredCourse: str(formData, "preferredCourse"),
      preferredLevel: str(formData, "preferredLevel"),
      preferredUniversity: str(formData, "preferredUniversity"),
      workExperienceYears: str(formData, "workExperienceYears"),
      workExperienceDetails: str(formData, "workExperienceDetails"),
      fundingSource: str(formData, "fundingSource"),
      budgetAmount: str(formData, "budgetAmount"),
      sponsorRelation: str(formData, "sponsorRelation"),
      visaRefusalHistory: str(formData, "visaRefusalHistory"),
      visaRefusalDetails: str(formData, "visaRefusalDetails"),
      applicationUniversity: str(formData, "applicationUniversity"),
      applicationCourse: str(formData, "applicationCourse"),
      applicationSubmittedOn: str(formData, "applicationSubmittedOn"),
      offerLetterDate: str(formData, "offerLetterDate"),
      offerType: str(formData, "offerType"),
      tuitionFeeAmount: str(formData, "tuitionFeeAmount"),
      tuitionFeeCurrency: str(formData, "tuitionFeeCurrency"),
      visaAppliedOn: str(formData, "visaAppliedOn"),
      visaDecisionOn: str(formData, "visaDecisionOn"),
      visaOutcome: str(formData, "visaOutcome"),
      counsellorNotes: str(formData, "counsellorNotes"),
    });

    if (!parsed.success) {
      return fail("Check the details below.", z.flattenError(parsed.error).fieldErrors);
    }
    const d = parsed.data;

    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("education_details")
      .update({
        date_of_birth: d.dateOfBirth,
        gender: d.gender,
        passport_number: d.passportNumber,
        passport_expiry: d.passportExpiry,
        current_address: d.currentAddress,
        city: d.city,
        state: d.state,
        highest_qualification: d.highestQualification,
        board_or_university: d.boardOrUniversity,
        year_of_passing: d.yearOfPassing,
        percentage_or_cgpa: d.percentageOrCgpa,
        backlogs: d.backlogs,
        english_test: d.englishTest,
        english_test_score: d.englishTestScore,
        english_test_date: d.englishTestDate,
        gre_score: d.greScore,
        gmat_score: d.gmatScore,
        preferred_countries: d.preferredCountries?.length ? d.preferredCountries : null,
        preferred_intake: d.preferredIntake,
        preferred_course: d.preferredCourse,
        preferred_level: d.preferredLevel,
        preferred_university: d.preferredUniversity,
        work_experience_years: d.workExperienceYears,
        work_experience_details: d.workExperienceDetails,
        funding_source: d.fundingSource,
        budget_amount: d.budgetAmount,
        sponsor_relation: d.sponsorRelation,
        visa_refusal_history: d.visaRefusalHistory,
        visa_refusal_details: d.visaRefusalDetails,
        application_university: d.applicationUniversity,
        application_course: d.applicationCourse,
        application_submitted_on: d.applicationSubmittedOn,
        offer_letter_date: d.offerLetterDate,
        offer_type: d.offerType,
        tuition_fee_amount: d.tuitionFeeAmount,
        tuition_fee_currency: d.tuitionFeeCurrency,
        visa_applied_on: d.visaAppliedOn,
        visa_decision_on: d.visaDecisionOn,
        visa_outcome: d.visaOutcome,
        counsellor_notes: d.counsellorNotes,
      })
      .eq("lead_id", d.leadId);

    if (error) {
      console.error("[updateEducationDetails]", error);
      return fail("Could not save the student profile.");
    }

    revalidateLead(d.leadId);
    return ok(undefined, "Profile saved.");
  });
}

/** Attribute (or un-attribute) a lead to an agent. */
export async function assignAgent(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return withAction(async () => {
    await assertAdmin();

    const parsed = assignAgentSchema.safeParse({
      id: formData.get("id"),
      agentId: str(formData, "agentId"),
    });
    if (!parsed.success) return fail("Invalid request.");

    const supabase = await createServerSupabase();

    // Changing attribution after a commission exists would mean the snapshot
    // names one agent while the lead names another.
    const { data: existing } = await supabase
      .from("commissions")
      .select("id, status")
      .eq("lead_id", parsed.data.id)
      .maybeSingle();

    if (existing && existing.status !== "cancelled") {
      return fail(
        "This student already has a commission recorded, so the referring agent can no longer be changed."
      );
    }

    const { error } = await supabase
      .from("leads")
      .update({
        agent_id: parsed.data.agentId || null,
        source: parsed.data.agentId ? "agent" : "admin_manual",
      })
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[assignAgent]", error);
      return fail("Could not change the referring agent.");
    }

    revalidateLead(parsed.data.id);
    return ok(undefined, parsed.data.agentId ? "Agent assigned." : "Agent removed.");
  });
}

/** The service fee a percentage commission is calculated from. */
export async function setDealValue(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return withAction(async () => {
    await assertAdmin();

    const parsed = setDealValueSchema.safeParse({
      id: formData.get("id"),
      dealValue: str(formData, "dealValue"),
    });
    if (!parsed.success) return fail("Enter a valid amount.");

    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("leads")
      .update({ deal_value: parsed.data.dealValue })
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[setDealValue]", error);
      return fail("Could not save the service fee.");
    }

    revalidateLead(parsed.data.id);
    return ok(
      undefined,
      "Service fee saved. Existing commissions keep the amount they were calculated with."
    );
  });
}

/**
 * Soft delete. Leads are never hard-deleted: commissions.lead_id is ON DELETE
 * RESTRICT, so a lead that has ever earned cannot be removed anyway.
 */
export async function archiveLead(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return withAction(async () => {
    await assertAdmin();

    const parsed = archiveLeadSchema.safeParse({
      id: formData.get("id"),
      archive: formData.get("archive"),
    });
    if (!parsed.success) return fail("Invalid request.");

    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("leads")
      .update({ archived_at: parsed.data.archive === "true" ? new Date().toISOString() : null })
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[archiveLead]", error);
      return fail("Could not archive this student.");
    }

    revalidateLead(parsed.data.id);
    return ok(undefined, parsed.data.archive === "true" ? "Archived." : "Restored.");
  });
}

/**
 * Promote a website inquiry into a tracked student.
 *
 * The two tables stay separate on purpose: contact_inquiries must accept
 * INSERT from anonymous visitors, while `leads` carries commission-bearing
 * rows and grants anon nothing. Converting links them rather than merging
 * them, so spam and wrong numbers never enter the pipeline.
 *
 * Idempotent: a second conversion returns the existing lead instead of
 * creating a duplicate student. Two counsellors clicking the same button is a
 * realistic race, and the cost of getting it wrong is a double commission.
 */
type ConvertResult = { id: string; alreadyConverted: boolean };

export async function convertInquiryToLead(
  _prev: ActionResult<ConvertResult> | null,
  formData: FormData
): Promise<ActionResult<ConvertResult>> {
  return withAction<ConvertResult>(async () => {
    const admin = await assertAdmin();

    const parsed = convertInquirySchema.safeParse({
      inquiryId: formData.get("inquiryId"),
      vertical: formData.get("vertical") || "education",
      studentName: formData.get("studentName"),
      phone: str(formData, "phone"),
      email: str(formData, "email"),
      targetCountry: str(formData, "targetCountry"),
      remarks: str(formData, "remarks"),
      agentId: str(formData, "agentId"),
    });

    if (!parsed.success) {
      return fail("Check the details below.", z.flattenError(parsed.error).fieldErrors);
    }
    const input = parsed.data;

    const supabase = await createServerSupabase();

    const { data: inquiry } = await supabase
      .from("contact_inquiries")
      .select("id, converted_lead_id")
      .eq("id", input.inquiryId)
      .maybeSingle();

    if (!inquiry) return fail("That inquiry no longer exists.");

    if (inquiry.converted_lead_id) {
      const existing: ConvertResult = {
        id: inquiry.converted_lead_id,
        alreadyConverted: true,
      };
      return ok(existing, "This inquiry has already been converted.");
    }

    const { data: firstStage } = await supabase
      .from("lead_stages")
      .select("key")
      .eq("vertical", input.vertical)
      .order("sort_order")
      .limit(1)
      .maybeSingle();

    if (!firstStage) return fail("That pipeline is not configured.");

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        vertical: input.vertical,
        agent_id: input.agentId || null,
        created_by: admin.id,
        // Provenance is preserved even when an agent is credited, so
        // reporting can still tell a website lead from a cold referral.
        source: "website_inquiry",
        source_inquiry_id: input.inquiryId,
        student_name: input.studentName,
        phone: input.phone || null,
        email: input.email || null,
        target_country: input.targetCountry,
        remarks: input.remarks,
        stage_key: firstStage.key,
      })
      .select("id")
      .single();

    if (error || !lead) {
      console.error("[convertInquiryToLead]", error);
      return fail("Could not create the student record.");
    }

    // Back-link and mark the inbox item handled. If this fails the lead still
    // exists, so the button would offer a second conversion — hence the
    // converted_lead_id check above being the real guard.
    const { error: linkError } = await supabase
      .from("contact_inquiries")
      .update({
        converted_lead_id: lead.id,
        converted_at: new Date().toISOString(),
        converted_by: admin.id,
        status: "in_progress",
      })
      .eq("id", input.inquiryId);

    if (linkError) {
      console.error("[convertInquiryToLead] back-link failed", linkError);
    }

    revalidateLead(lead.id);
    revalidatePath("/admin/inquiries");

    const converted: ConvertResult = { id: lead.id, alreadyConverted: false };
    return ok(converted, `${input.studentName} is now tracked as a student.`);
  });
}
