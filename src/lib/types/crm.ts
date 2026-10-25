export type UserRole = "admin" | "agent";
export type UserStatus = "active" | "suspended";

export type LeadVertical = "education" | "travel" | "courier";
export type LeadSource = "agent" | "website_inquiry" | "admin_manual" | "walk_in";

export type CommissionType = "flat" | "percent";
export type CommissionStatus = "earned" | "approved" | "paid" | "cancelled";

/** Pipeline stage, loaded from the lead_stages table rather than hardcoded. */
export interface LeadStage {
  vertical: LeadVertical;
  key: string;
  label: string;
  sort_order: number;
  is_terminal: boolean;
  is_won: boolean;
  is_commissionable: boolean;
  accent: string | null;
}

export interface Profile {
  id: string;
  role: UserRole;
  status: UserStatus;
  full_name: string;
  email: string;
  phone: string | null;
  institute_name: string | null;
  address: string | null;
  remarks: string | null;
  agent_code: string | null;
  commission_type: CommissionType;
  commission_value: number;
  must_change_password: boolean;
  password_changed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  vertical: LeadVertical;
  agent_id: string | null;
  created_by: string | null;
  source: LeadSource;
  source_inquiry_id: string | null;
  student_name: string;
  phone: string | null;
  email: string | null;
  target_country: string | null;
  remarks: string | null;
  stage_key: string;
  deal_value: number | null;
  currency: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EducationDetails {
  lead_id: string;
  vertical: "education";

  date_of_birth: string | null;
  gender: string | null;
  passport_number: string | null;
  passport_expiry: string | null;
  current_address: string | null;
  city: string | null;
  state: string | null;

  highest_qualification: string | null;
  board_or_university: string | null;
  year_of_passing: number | null;
  percentage_or_cgpa: string | null;
  backlogs: number | null;

  english_test: string | null;
  english_test_score: string | null;
  english_test_date: string | null;
  gre_score: string | null;
  gmat_score: string | null;

  preferred_countries: string[] | null;
  preferred_intake: string | null;
  preferred_course: string | null;
  preferred_level: string | null;
  preferred_university: string | null;

  work_experience_years: number | null;
  work_experience_details: string | null;
  funding_source: string | null;
  budget_amount: number | null;
  sponsor_relation: string | null;
  visa_refusal_history: boolean | null;
  visa_refusal_details: string | null;

  application_university: string | null;
  application_course: string | null;
  application_submitted_on: string | null;
  offer_letter_date: string | null;
  offer_type: string | null;
  tuition_fee_amount: number | null;
  tuition_fee_currency: string | null;
  visa_applied_on: string | null;
  visa_decision_on: string | null;
  visa_outcome: string | null;

  counsellor_notes: string | null;
  documents: unknown[];

  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: string;
  lead_id: string;
  agent_id: string;
  vertical: LeadVertical;
  /** Snapshot taken at earn time — never recomputed from the agent's profile. */
  commission_type: CommissionType;
  commission_value: number;
  base_amount: number | null;
  currency: string;
  amount: number | null;
  status: CommissionStatus;
  earned_at: string;
  approved_at: string | null;
  approved_by: string | null;
  paid_at: string | null;
  paid_by: string | null;
  payment_reference: string | null;
  payment_method: string | null;
  payment_note: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  /** Set when the lead left the won stage after the money was already paid. */
  stage_reverted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadStageHistoryEntry {
  id: number;
  lead_id: string;
  from_stage: string | null;
  to_stage: string;
  changed_by: string | null;
  note: string | null;
  changed_at: string;
}

/** What an agent is allowed to see about their own referral. */
export interface AgentLeadView {
  id: string;
  student_name: string;
  phone: string | null;
  target_country: string | null;
  remarks: string | null;
  stage_key: string;
  stage_label: string;
  stage_accent: string | null;
  created_at: string;
  commission_status: CommissionStatus | null;
  commission_amount: number | null;
}
