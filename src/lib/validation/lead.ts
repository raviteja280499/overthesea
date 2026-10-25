import { z } from "zod";

import {
  leadVerticalSchema,
  optionalDate,
  optionalEmail,
  optionalNumber,
  optionalPhone,
  optionalText,
  uuidSchema,
} from "./common";

/**
 * What an agent submits. Deliberately four fields.
 *
 * Note what is absent: stage, deal_value and agent_id. Those are set by the
 * server and, even if forged into the request, are rejected by the
 * `leads_agent_insert_own` policy and the `guard_lead_fields` trigger.
 */
export const agentLeadSchema = z.object({
  studentName: z.string().trim().min(2, "Enter the student's name").max(120),
  phone: optionalPhone,
  targetCountry: optionalText(80),
  remarks: optionalText(1000),
});

/** Admin-side creation: can attribute to an agent and set a deal value. */
export const adminLeadSchema = z.object({
  vertical: leadVerticalSchema.default("education"),
  studentName: z.string().trim().min(2, "Enter the student's name").max(120),
  phone: optionalPhone,
  email: optionalEmail,
  targetCountry: optionalText(80),
  remarks: optionalText(1000),
  agentId: z.union([uuidSchema, z.literal("")]).optional(),
  dealValue: z
    .preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.coerce.number().nonnegative().optional()
    )
    .transform((v) => (v === undefined ? null : v)),
});

export const updateLeadBasicsSchema = z.object({
  id: uuidSchema,
  studentName: z.string().trim().min(2).max(120),
  phone: optionalPhone,
  email: optionalEmail,
  targetCountry: optionalText(80),
  remarks: optionalText(1000),
});

export const stageChangeSchema = z.object({
  id: uuidSchema,
  stageKey: z.string().trim().min(1).max(60),
  note: optionalText(500),
});

export type AgentLeadInput = z.infer<typeof agentLeadSchema>;
export type AdminLeadInput = z.infer<typeof adminLeadSchema>;

/**
 * The big admin-only study-abroad form.
 *
 * Every field is optional: a counsellor fills this in progressively as the
 * student provides documents, so a half-complete record must always save.
 * The helpers in ./common normalise "" to null, so clearing a field actually
 * clears it rather than writing an empty string.
 */
export const educationDetailsSchema = z.object({
  leadId: uuidSchema,

  // identity
  dateOfBirth: optionalDate,
  gender: optionalText(30),
  passportNumber: optionalText(40),
  passportExpiry: optionalDate,
  currentAddress: optionalText(400),
  city: optionalText(80),
  state: optionalText(80),

  // academics
  highestQualification: optionalText(120),
  boardOrUniversity: optionalText(160),
  yearOfPassing: optionalNumber,
  percentageOrCgpa: optionalText(20),
  backlogs: optionalNumber,

  // tests
  englishTest: z
    .union([z.enum(["IELTS", "TOEFL", "PTE", "DUOLINGO", "MOI", "NONE"]), z.literal("")])
    .optional()
    .transform((v) => (v ? v : null)),
  englishTestScore: optionalText(20),
  englishTestDate: optionalDate,
  greScore: optionalText(20),
  gmatScore: optionalText(20),

  // preferences
  preferredCountries: z.array(z.string().trim().max(80)).max(10).optional().default([]),
  preferredIntake: optionalText(40),
  preferredCourse: optionalText(160),
  preferredLevel: optionalText(60),
  preferredUniversity: optionalText(200),

  // experience and funding
  workExperienceYears: optionalNumber,
  workExperienceDetails: optionalText(1000),
  fundingSource: optionalText(80),
  budgetAmount: optionalNumber,
  sponsorRelation: optionalText(80),
  visaRefusalHistory: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")])
    .optional()
    .transform((v) => v === "on" || v === "true"),
  visaRefusalDetails: optionalText(1000),

  // application tracking
  applicationUniversity: optionalText(200),
  applicationCourse: optionalText(200),
  applicationSubmittedOn: optionalDate,
  offerLetterDate: optionalDate,
  offerType: optionalText(60),
  tuitionFeeAmount: optionalNumber,
  tuitionFeeCurrency: optionalText(3),
  visaAppliedOn: optionalDate,
  visaDecisionOn: optionalDate,
  visaOutcome: optionalText(60),

  counsellorNotes: optionalText(4000),
});

export const assignAgentSchema = z.object({
  id: uuidSchema,
  agentId: z.union([uuidSchema, z.literal("")]).optional(),
});

export const setDealValueSchema = z.object({
  id: uuidSchema,
  dealValue: optionalNumber,
});

export const archiveLeadSchema = z.object({
  id: uuidSchema,
  archive: z.union([z.literal("true"), z.literal("false")]),
});

export type EducationDetailsInput = z.infer<typeof educationDetailsSchema>;

/**
 * Promoting a website inquiry into a tracked student.
 *
 * The inquiry stays in the inbox as the original record; the lead becomes the
 * CRM entity, linked back via leads.source_inquiry_id and
 * contact_inquiries.converted_lead_id.
 */
export const convertInquirySchema = z.object({
  inquiryId: uuidSchema,
  vertical: leadVerticalSchema.default("education"),
  studentName: z.string().trim().min(2, "Enter the student's name").max(120),
  phone: optionalPhone,
  email: optionalEmail,
  targetCountry: optionalText(80),
  remarks: optionalText(1000),
  agentId: z.union([uuidSchema, z.literal("")]).optional(),
});
