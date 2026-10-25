"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowLeft,
  Banknote,
  Check,
  History,
  Loader2,
  Save,
  TriangleAlert,
  UserCheck,
} from "lucide-react";

import {
  archiveLead,
  assignAgent,
  changeLeadStage,
  setDealValue,
  updateEducationDetails,
  updateLeadBasics,
} from "@/lib/actions/admin-leads";
import { STUDY_DESTINATIONS } from "@/lib/constants/countries";
import {
  COMMISSION_STATUS_STYLE,
  describeCommission,
  formatDate,
  formatMoney,
} from "@/lib/constants/crm";
import type { ActionResult } from "@/lib/actions/result";
import type { LeadDetail } from "@/lib/data/leads";

const input =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#1e1b4b] outline-none transition focus:border-[#6355d8] focus:ring-2 focus:ring-[#6355d8]/15";
const labelCls = "text-[10px] font-bold uppercase tracking-wide text-slate-500";

function F({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${wide ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

function Banner({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  return (
    <p
      className={`rounded-xl border px-3.5 py-2 text-[11px] font-semibold ${
        state.success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      {state.success ? (state.message ?? "Saved.") : state.error}
    </p>
  );
}

const TABS = ["Basic", "Academics", "Tests", "Preferences", "Application", "Internal"] as const;
type Tab = (typeof TABS)[number];

export function StudentDetailView({ detail }: { detail: LeadDetail }) {
  const { lead, education, stages, history, commission, agent, agents } = detail;
  const [tab, setTab] = useState<Tab>("Basic");

  const [basicsState, basicsAction, basicsPending] = useActionState<ActionResult | null, FormData>(
    updateLeadBasics,
    null
  );
  const [eduState, eduAction, eduPending] = useActionState<ActionResult | null, FormData>(
    updateEducationDetails,
    null
  );
  const [stageState, stageAction, stagePending] = useActionState<ActionResult | null, FormData>(
    changeLeadStage,
    null
  );
  const [agentState, agentAction, agentPending] = useActionState<ActionResult | null, FormData>(
    assignAgent,
    null
  );
  const [feeState, feeAction, feePending] = useActionState<ActionResult | null, FormData>(
    setDealValue,
    null
  );
  const [archState, archAction, archPending] = useActionState<ActionResult | null, FormData>(
    archiveLead,
    null
  );

  const stage = stages.find((s) => s.key === lead.stage_key);
  const e = education;

  // A percentage agent cannot be paid until a service fee exists.
  const needsFee =
    agent?.commission_type === "percent" && lead.deal_value === null;

  return (
    <div className="flex w-full flex-col gap-6 p-6 sm:p-8 lg:p-10">
      <Link
        href="/admin/students"
        className="flex w-fit items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-[#6355d8]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All students
      </Link>

      <div className="flex flex-col gap-6 xl:flex-row">
        {/* ─────────── Main column ─────────── */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {/* Header + stage control */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="truncate text-xl font-extrabold text-[#1e1b4b]">
                    {lead.student_name}
                  </h1>
                  <span
                    className="rounded-full border px-2.5 py-1 text-[10px] font-bold"
                    style={{
                      color: stage?.accent ?? "#6355d8",
                      borderColor: `${stage?.accent ?? "#6355d8"}33`,
                      backgroundColor: `${stage?.accent ?? "#6355d8"}11`,
                    }}
                  >
                    {stage?.label ?? lead.stage_key}
                  </span>
                  {lead.archived_at && (
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                      Archived
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                  {lead.target_country || "Country undecided"} ·{" "}
                  {lead.source === "agent"
                    ? `Referred by ${agent?.full_name ?? "an agent"}`
                    : lead.source === "website_inquiry"
                      ? "From a website inquiry"
                      : "Added directly"}{" "}
                  · {formatDate(lead.created_at)}
                </p>
              </div>

              <form action={archAction}>
                <input type="hidden" name="id" value={lead.id} />
                <input type="hidden" name="archive" value={lead.archived_at ? "false" : "true"} />
                <button
                  type="submit"
                  disabled={archPending}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-[11px] font-bold text-slate-500 transition-colors hover:border-rose-300 hover:text-rose-600 disabled:opacity-60"
                >
                  {archPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Archive className="h-3.5 w-3.5" />
                  )}
                  {lead.archived_at ? "Restore" : "Archive"}
                </button>
              </form>
            </div>

            {archState && <div className="mt-3"><Banner state={archState} /></div>}

            {/* Stage change */}
            <form
              action={stageAction}
              className="mt-5 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-5"
            >
              <input type="hidden" name="id" value={lead.id} />
              <label className="flex min-w-48 flex-1 flex-col gap-1.5">
                <span className={labelCls}>Move to stage</span>
                <select name="stageKey" defaultValue={lead.stage_key} className={`${input} cursor-pointer`}>
                  {stages.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                      {s.is_commissionable ? " — pays commission" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex min-w-48 flex-[2] flex-col gap-1.5">
                <span className={labelCls}>Note (optional)</span>
                <input name="note" className={input} placeholder="Why the stage changed…" />
              </label>
              <button
                type="submit"
                disabled={stagePending}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#6355d8] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#5244c7] disabled:opacity-60"
              >
                {stagePending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Update stage
              </button>
            </form>
            {stageState && <div className="mt-3"><Banner state={stageState} /></div>}
          </div>

          {/* Basic details */}
          <form action={basicsAction} className="rounded-3xl border border-slate-100 bg-white p-6">
            <input type="hidden" name="id" value={lead.id} />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#1e1b4b]">Contact details</h2>
              <button
                type="submit"
                disabled={basicsPending}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:border-[#6355d8] hover:text-[#6355d8] disabled:opacity-60"
              >
                {basicsPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <F label="Student name *">
                <input name="studentName" required defaultValue={lead.student_name} className={input} />
              </F>
              <F label="Phone">
                <input name="phone" defaultValue={lead.phone ?? ""} className={input} />
              </F>
              <F label="Email">
                <input name="email" type="email" defaultValue={lead.email ?? ""} className={input} />
              </F>
              <F label="Target country">
                <select
                  name="targetCountry"
                  defaultValue={lead.target_country ?? ""}
                  className={`${input} cursor-pointer`}
                >
                  <option value="">Not decided</option>
                  {STUDY_DESTINATIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </F>
              <F label="Remarks" wide>
                <textarea
                  name="remarks"
                  rows={2}
                  defaultValue={lead.remarks ?? ""}
                  className={`${input} resize-none`}
                />
              </F>
            </div>
            {basicsState && <div className="mt-4"><Banner state={basicsState} /></div>}
          </form>

          {/* ─── The big study-abroad profile ─── */}
          <form action={eduAction} className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
            <input type="hidden" name="leadId" value={lead.id} />

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
              <h2 className="text-sm font-extrabold text-[#1e1b4b]">Study-abroad profile</h2>
              <button
                type="submit"
                disabled={eduPending}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#6355d8] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#5244c7] disabled:opacity-60"
              >
                {eduPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save profile
              </button>
            </div>

            {/* Tabs. Panels are hidden rather than unmounted so every field
                stays in the form and one Save commits all six sections. */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-100 px-6 py-3">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${
                    tab === t
                      ? "bg-[#f0edff] text-[#6355d8]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#6355d8]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="p-6">
              <div hidden={tab !== "Basic"} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <F label="Date of birth">
                  <input type="date" name="dateOfBirth" defaultValue={e?.date_of_birth ?? ""} className={input} />
                </F>
                <F label="Gender">
                  <select name="gender" defaultValue={e?.gender ?? ""} className={`${input} cursor-pointer`}>
                    <option value="">—</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </F>
                <F label="Passport number">
                  <input name="passportNumber" defaultValue={e?.passport_number ?? ""} className={input} />
                </F>
                <F label="Passport expiry">
                  <input type="date" name="passportExpiry" defaultValue={e?.passport_expiry ?? ""} className={input} />
                </F>
                <F label="City">
                  <input name="city" defaultValue={e?.city ?? ""} className={input} />
                </F>
                <F label="State">
                  <input name="state" defaultValue={e?.state ?? ""} className={input} />
                </F>
                <F label="Current address" wide>
                  <textarea
                    name="currentAddress"
                    rows={2}
                    defaultValue={e?.current_address ?? ""}
                    className={`${input} resize-none`}
                  />
                </F>
              </div>

              <div hidden={tab !== "Academics"} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <F label="Highest qualification">
                  <input name="highestQualification" defaultValue={e?.highest_qualification ?? ""} className={input} placeholder="B.Tech CSE" />
                </F>
                <F label="Board / university">
                  <input name="boardOrUniversity" defaultValue={e?.board_or_university ?? ""} className={input} placeholder="JNTU Hyderabad" />
                </F>
                <F label="Year of passing">
                  <input type="number" name="yearOfPassing" defaultValue={e?.year_of_passing ?? ""} className={input} placeholder="2025" />
                </F>
                <F label="Percentage / CGPA">
                  <input name="percentageOrCgpa" defaultValue={e?.percentage_or_cgpa ?? ""} className={input} placeholder="7.8 CGPA" />
                </F>
                <F label="Backlogs">
                  <input type="number" name="backlogs" min="0" defaultValue={e?.backlogs ?? ""} className={input} />
                </F>
                <F label="Work experience (years)">
                  <input type="number" step="0.5" min="0" name="workExperienceYears" defaultValue={e?.work_experience_years ?? ""} className={input} />
                </F>
                <F label="Work experience details" wide>
                  <textarea name="workExperienceDetails" rows={2} defaultValue={e?.work_experience_details ?? ""} className={`${input} resize-none`} />
                </F>
              </div>

              <div hidden={tab !== "Tests"} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <F label="English test">
                  <select name="englishTest" defaultValue={e?.english_test ?? ""} className={`${input} cursor-pointer`}>
                    <option value="">—</option>
                    <option value="IELTS">IELTS</option>
                    <option value="TOEFL">TOEFL</option>
                    <option value="PTE">PTE</option>
                    <option value="DUOLINGO">Duolingo</option>
                    <option value="MOI">Medium of Instruction</option>
                    <option value="NONE">Not taken</option>
                  </select>
                </F>
                <F label="English score">
                  <input name="englishTestScore" defaultValue={e?.english_test_score ?? ""} className={input} placeholder="7.5" />
                </F>
                <F label="Test date">
                  <input type="date" name="englishTestDate" defaultValue={e?.english_test_date ?? ""} className={input} />
                </F>
                <F label="GRE score">
                  <input name="greScore" defaultValue={e?.gre_score ?? ""} className={input} placeholder="318" />
                </F>
                <F label="GMAT score">
                  <input name="gmatScore" defaultValue={e?.gmat_score ?? ""} className={input} placeholder="680" />
                </F>
              </div>

              <div hidden={tab !== "Preferences"} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <F label="Preferred countries" wide>
                  <select
                    name="preferredCountries"
                    multiple
                    defaultValue={e?.preferred_countries ?? []}
                    className={`${input} h-32 cursor-pointer`}
                  >
                    {STUDY_DESTINATIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </F>
                <F label="Intake">
                  <input name="preferredIntake" defaultValue={e?.preferred_intake ?? ""} className={input} placeholder="Fall 2026" />
                </F>
                <F label="Level">
                  <select name="preferredLevel" defaultValue={e?.preferred_level ?? ""} className={`${input} cursor-pointer`}>
                    <option value="">—</option>
                    <option value="Bachelors">Bachelors</option>
                    <option value="Masters">Masters</option>
                    <option value="PhD">PhD</option>
                    <option value="Diploma">Diploma</option>
                  </select>
                </F>
                <F label="Course / field">
                  <input name="preferredCourse" defaultValue={e?.preferred_course ?? ""} className={input} placeholder="MS Computer Science" />
                </F>
                <F label="Shortlisted universities" wide>
                  <textarea name="preferredUniversity" rows={2} defaultValue={e?.preferred_university ?? ""} className={`${input} resize-none`} placeholder="One per line or comma separated" />
                </F>
                <F label="Funding source">
                  <select name="fundingSource" defaultValue={e?.funding_source ?? ""} className={`${input} cursor-pointer`}>
                    <option value="">—</option>
                    <option value="Self">Self funded</option>
                    <option value="Education loan">Education loan</option>
                    <option value="Scholarship">Scholarship</option>
                    <option value="Sponsor">Sponsor</option>
                  </select>
                </F>
                <F label="Budget (₹)">
                  <input type="number" name="budgetAmount" min="0" defaultValue={e?.budget_amount ?? ""} className={input} />
                </F>
                <F label="Sponsor relation">
                  <input name="sponsorRelation" defaultValue={e?.sponsor_relation ?? ""} className={input} placeholder="Father" />
                </F>
              </div>

              <div hidden={tab !== "Application"} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <F label="University applied to">
                  <input name="applicationUniversity" defaultValue={e?.application_university ?? ""} className={input} />
                </F>
                <F label="Course applied for">
                  <input name="applicationCourse" defaultValue={e?.application_course ?? ""} className={input} />
                </F>
                <F label="Application submitted">
                  <input type="date" name="applicationSubmittedOn" defaultValue={e?.application_submitted_on ?? ""} className={input} />
                </F>
                <F label="Offer letter date">
                  <input type="date" name="offerLetterDate" defaultValue={e?.offer_letter_date ?? ""} className={input} />
                </F>
                <F label="Offer type">
                  <select name="offerType" defaultValue={e?.offer_type ?? ""} className={`${input} cursor-pointer`}>
                    <option value="">—</option>
                    <option value="Unconditional">Unconditional</option>
                    <option value="Conditional">Conditional</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </F>
                <F label="Tuition fee">
                  <input type="number" name="tuitionFeeAmount" min="0" defaultValue={e?.tuition_fee_amount ?? ""} className={input} />
                </F>
                <F label="Tuition currency">
                  <input name="tuitionFeeCurrency" maxLength={3} defaultValue={e?.tuition_fee_currency ?? ""} className={input} placeholder="USD" />
                </F>
                <F label="Visa applied on">
                  <input type="date" name="visaAppliedOn" defaultValue={e?.visa_applied_on ?? ""} className={input} />
                </F>
                <F label="Visa decision on">
                  <input type="date" name="visaDecisionOn" defaultValue={e?.visa_decision_on ?? ""} className={input} />
                </F>
                <F label="Visa outcome">
                  <select name="visaOutcome" defaultValue={e?.visa_outcome ?? ""} className={`${input} cursor-pointer`}>
                    <option value="">—</option>
                    <option value="Approved">Approved</option>
                    <option value="Refused">Refused</option>
                    <option value="Pending">Pending</option>
                  </select>
                </F>
              </div>

              <div hidden={tab !== "Internal"} className="grid gap-4">
                <p className="flex items-start gap-2 rounded-xl border border-slate-200 bg-[#f8f9fd] px-3.5 py-2.5 text-[11px] leading-relaxed text-slate-500">
                  <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  This whole profile is admin-only. Agents cannot read it — the database
                  grants them no access to these tables at all, so none of it appears in the
                  agent portal.
                </p>
                <label className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    name="visaRefusalHistory"
                    defaultChecked={Boolean(e?.visa_refusal_history)}
                    className="h-4 w-4 cursor-pointer accent-[#6355d8]"
                  />
                  <span className="text-xs font-semibold text-[#1e1b4b]">
                    Has a previous visa refusal
                  </span>
                </label>
                <F label="Visa refusal details">
                  <textarea name="visaRefusalDetails" rows={2} defaultValue={e?.visa_refusal_details ?? ""} className={`${input} resize-none`} />
                </F>
                <F label="Counsellor notes">
                  <textarea name="counsellorNotes" rows={6} defaultValue={e?.counsellor_notes ?? ""} className={`${input} resize-none`} placeholder="Internal commentary, follow-ups, concerns…" />
                </F>
              </div>
            </div>

            {eduState && <div className="px-6 pb-6"><Banner state={eduState} /></div>}
          </form>
        </div>

        {/* ─────────── Right rail ─────────── */}
        <div className="flex w-full shrink-0 flex-col gap-6 xl:w-80">
          {/* Referring agent */}
          <form action={agentAction} className="rounded-3xl border border-slate-100 bg-white p-6">
            <input type="hidden" name="id" value={lead.id} />
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-slate-300" />
              <p className={labelCls}>Referring agent</p>
            </div>

            {commission && commission.status !== "cancelled" ? (
              <>
                <p className="mt-2 text-sm font-extrabold text-[#1e1b4b]">
                  {agent?.full_name ?? "—"}
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                  Locked: a commission has already been recorded against this student, so
                  attribution can no longer change.
                </p>
              </>
            ) : (
              <>
                <select
                  name="agentId"
                  defaultValue={lead.agent_id ?? ""}
                  className={`${input} mt-2 cursor-pointer`}
                >
                  <option value="">No agent (direct)</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.full_name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={agentPending}
                  className="mt-3 w-full cursor-pointer rounded-xl border border-slate-200 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:border-[#6355d8] hover:text-[#6355d8] disabled:opacity-60"
                >
                  {agentPending ? "Saving…" : "Update attribution"}
                </button>
              </>
            )}
            {agent && (
              <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                Rate: {describeCommission(agent.commission_type, agent.commission_value)}
              </p>
            )}
            {agentState && <div className="mt-3"><Banner state={agentState} /></div>}
          </form>

          {/* Service fee */}
          <form action={feeAction} className="rounded-3xl border border-slate-100 bg-white p-6">
            <input type="hidden" name="id" value={lead.id} />
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-slate-300" />
              <p className={labelCls}>Our service fee</p>
            </div>
            <input
              type="number"
              name="dealValue"
              min="0"
              defaultValue={lead.deal_value ?? ""}
              className={`${input} mt-2`}
              placeholder="50000"
            />
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              What Over The Sea charges this student. Percentage commissions are a share of
              this figure.
            </p>
            {needsFee && (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-700">
                Required: this student&apos;s agent is on a percentage, so no commission
                amount can be calculated until a fee is set.
              </p>
            )}
            <button
              type="submit"
              disabled={feePending}
              className="mt-3 w-full cursor-pointer rounded-xl border border-slate-200 py-2 text-[11px] font-bold text-slate-600 transition-colors hover:border-[#6355d8] hover:text-[#6355d8] disabled:opacity-60"
            >
              {feePending ? "Saving…" : "Save fee"}
            </button>
            {feeState && <div className="mt-3"><Banner state={feeState} /></div>}
          </form>

          {/* Commission */}
          {commission && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6">
              <p className={labelCls}>Commission</p>
              <p className="mt-1 text-lg font-extrabold text-[#1e1b4b]">
                {formatMoney(commission.amount, commission.currency)}
              </p>
              <span
                className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                  COMMISSION_STATUS_STYLE[commission.status].className
                }`}
              >
                {COMMISSION_STATUS_STYLE[commission.status].label}
              </span>
              <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-[11px]">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Earned</dt>
                  <dd className="font-semibold text-slate-600">{formatDate(commission.earned_at)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Rate at the time</dt>
                  <dd className="font-semibold text-slate-600">
                    {describeCommission(commission.commission_type, commission.commission_value)}
                  </dd>
                </div>
                {commission.paid_at && (
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Paid</dt>
                    <dd className="font-semibold text-slate-600">{formatDate(commission.paid_at)}</dd>
                  </div>
                )}
              </dl>
              {commission.stage_reverted_at && (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-700">
                  This student later left the enrolled stage after the commission was settled.
                  Flagged for review — the payment was not reversed.
                </p>
              )}
              <Link
                href="/admin/commissions"
                className="mt-3 block text-[11px] font-bold text-[#6355d8] hover:underline"
              >
                Manage payouts →
              </Link>
            </div>
          )}

          {/* History */}
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
              <History className="h-3.5 w-3.5 text-slate-300" />
              <h2 className="text-xs font-extrabold text-[#1e1b4b]">Stage history</h2>
            </div>
            {history.length === 0 ? (
              <p className="px-5 py-6 text-center text-[11px] text-slate-400">No changes yet.</p>
            ) : (
              <ol className="divide-y divide-slate-50">
                {history.map((h) => {
                  const to = stages.find((s) => s.key === h.to_stage);
                  return (
                    <li key={h.id} className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: to?.accent ?? "#cbd5e1" }}
                        />
                        <p className="text-[11px] font-bold text-[#1e1b4b]">
                          {to?.label ?? h.to_stage}
                        </p>
                      </div>
                      <p className="ml-3.5 text-[10px] text-slate-400">
                        {h.from_stage
                          ? `from ${stages.find((s) => s.key === h.from_stage)?.label ?? h.from_stage} · `
                          : "created · "}
                        {formatDate(h.changed_at)}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
