"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Check,
  Copy,
  KeyRound,
  Loader2,
  RefreshCw,
  UserPlus,
  X,
} from "lucide-react";

import { createAgent, updateAgent } from "@/lib/actions/agents";
import { suggestPassword } from "@/lib/constants/crm";
import type { ActionResult } from "@/lib/actions/result";
import type { Profile } from "@/lib/types/crm";

type CreateResult = ActionResult<{ email: string; tempPassword: string }>;

function Field({
  label,
  name,
  errors,
  children,
  hint,
}: {
  label: string;
  name: string;
  errors?: Record<string, string[]>;
  children: React.ReactNode;
  hint?: string;
}) {
  const error = errors?.[name]?.[0];
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
        {label}
      </span>
      {children}
      {error ? (
        <span className="text-[11px] font-semibold text-rose-600">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-slate-400">{hint}</span>
      ) : null}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#1e1b4b] outline-none focus:border-[#6355d8] focus:ring-2 focus:ring-[#6355d8]/15 transition";

/**
 * Create / edit an agent.
 *
 * On create the temporary password is shown ONCE in a success panel. It is
 * never persisted in our tables and never logged, so if the admin closes this
 * without copying it the only way back is a password reset.
 */
export function AgentFormDialog({
  onClose,
  agent,
}: {
  onClose: () => void;
  agent?: Profile | null;
}) {
  const isEdit = Boolean(agent);

  const [createState, createAction, creating] = useActionState<CreateResult | null, FormData>(
    createAgent,
    null
  );
  const [editState, editAction, editing] = useActionState<ActionResult | null, FormData>(
    updateAgent,
    null
  );

  const state = isEdit ? editState : createState;
  const pending = isEdit ? editing : creating;
  const fieldErrors = state && !state.success ? state.fieldErrors : undefined;

  // Lazy initialisers, not an open-effect: the parent mounts this component
  // only while it is open, so fresh state per opening comes for free and
  // there is no cascading render.
  const [tempPassword, setTempPassword] = useState(suggestPassword);
  const [commissionType, setCommissionType] = useState<"flat" | "percent">(
    agent?.commission_type ?? "flat"
  );
  const [copied, setCopied] = useState(false);

  // Close automatically after an edit; a create stays open so the admin can
  // copy the password.
  useEffect(() => {
    if (isEdit && editState?.success) {
      const t = setTimeout(onClose, 900);
      return () => clearTimeout(t);
    }
  }, [isEdit, editState, onClose]);

  const created = !isEdit && createState?.success ? createState.data : null;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-[#1e1b4b]/40 p-4 backdrop-blur-sm">
      <div className="mt-8 w-full max-w-2xl rounded-3xl border border-slate-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0edff] text-[#6355d8]">
              <UserPlus className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#1e1b4b]">
                {isEdit ? "Edit Agent" : "Create Agent"}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isEdit
                  ? "Email cannot be changed — it is the sign-in identity."
                  : "The agent must change this password at first sign-in."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {created ? (
          <div className="px-6 py-6">
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-600" />
              <div className="text-xs text-emerald-800">
                <p className="font-bold">Agent created.</p>
                <p className="mt-0.5 text-emerald-700">
                  Share these credentials directly. This password is shown{" "}
                  <strong>once</strong> and is not stored anywhere — if you lose it you
                  will have to reset it.
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-[#f8f9fd] p-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Sign-in page
                </span>
                <p className="font-mono text-sm font-bold text-[#1e1b4b]">/agent</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Email
                </span>
                <p className="font-mono text-sm font-bold text-[#1e1b4b]">{created.email}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Temporary password
                </span>
                <div className="flex items-center gap-2">
                  <p className="flex-1 font-mono text-sm font-bold text-[#1e1b4b]">
                    {created.tempPassword}
                  </p>
                  <button
                    onClick={() =>
                      copy(
                        `Over The Sea agent login\nURL: /agent\nEmail: ${created.email}\nTemporary password: ${created.tempPassword}`
                      )
                    }
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#6355d8] px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-[#5244c7]"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy all"}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-5 w-full cursor-pointer rounded-xl bg-[#1e1b4b] py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#2d2a5e]"
            >
              Done
            </button>
          </div>
        ) : (
          <form action={isEdit ? editAction : createAction} className="px-6 py-5">
            {agent && <input type="hidden" name="id" value={agent.id} />}

            {state && !state.success && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
                {state.error}
              </div>
            )}
            {isEdit && editState?.success && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700">
                Saved.
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name *" name="fullName" errors={fieldErrors}>
                <input
                  name="fullName"
                  required
                  defaultValue={agent?.full_name ?? ""}
                  className={inputCls}
                  placeholder="Ramesh Kumar"
                />
              </Field>

              <Field
                label="Email *"
                name="email"
                errors={fieldErrors}
                hint={isEdit ? "Sign-in identity — cannot be changed" : undefined}
              >
                <input
                  name="email"
                  type="email"
                  required={!isEdit}
                  disabled={isEdit}
                  defaultValue={agent?.email ?? ""}
                  className={`${inputCls} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
                  placeholder="agent@institute.in"
                />
              </Field>

              <Field label="Phone" name="phone" errors={fieldErrors}>
                <input
                  name="phone"
                  defaultValue={agent?.phone ?? ""}
                  className={inputCls}
                  placeholder="+91 98765 43210"
                />
              </Field>

              <Field label="Institute name" name="instituteName" errors={fieldErrors}>
                <input
                  name="instituteName"
                  defaultValue={agent?.institute_name ?? ""}
                  className={inputCls}
                  placeholder="Sunrise Degree College"
                />
              </Field>

              <Field label="Agent code" name="agentCode" errors={fieldErrors} hint="Optional, must be unique">
                <input
                  name="agentCode"
                  defaultValue={agent?.agent_code ?? ""}
                  className={inputCls}
                  placeholder="OTS-AG-012"
                />
              </Field>

              <Field label="Commission type *" name="commissionType" errors={fieldErrors}>
                <select
                  name="commissionType"
                  value={commissionType}
                  onChange={(e) => setCommissionType(e.target.value as "flat" | "percent")}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="flat">Flat amount per enrolment</option>
                  <option value="percent">Percentage of service fee</option>
                </select>
              </Field>

              <Field
                label={commissionType === "flat" ? "Amount (₹) *" : "Percentage (%) *"}
                name="commissionValue"
                errors={fieldErrors}
                hint={
                  commissionType === "flat"
                    ? "Paid per enrolled student"
                    : "Share of Over The Sea's service fee"
                }
              >
                <input
                  name="commissionValue"
                  type="number"
                  step={commissionType === "flat" ? "100" : "0.5"}
                  min="0"
                  max={commissionType === "percent" ? "100" : undefined}
                  required
                  defaultValue={agent?.commission_value ?? ""}
                  className={inputCls}
                  placeholder={commissionType === "flat" ? "10000" : "5"}
                />
              </Field>

              <Field label="Address" name="address" errors={fieldErrors}>
                <input
                  name="address"
                  defaultValue={agent?.address ?? ""}
                  className={inputCls}
                  placeholder="Ameerpet, Hyderabad"
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Remarks" name="remarks" errors={fieldErrors}>
                <textarea
                  name="remarks"
                  rows={2}
                  defaultValue={agent?.remarks ?? ""}
                  className={`${inputCls} resize-none`}
                  placeholder="How you know them, territory, referral source…"
                />
              </Field>
            </div>

            {!isEdit && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-[#f8f9fd] p-4">
                <Field
                  label="Temporary password *"
                  name="tempPassword"
                  errors={fieldErrors}
                  hint="At least 10 characters. The agent is forced to change it at first sign-in."
                >
                  <div className="flex items-center gap-2">
                    <input
                      name="tempPassword"
                      required
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      className={`${inputCls} font-mono`}
                    />
                    <button
                      type="button"
                      onClick={() => setTempPassword(suggestPassword())}
                      title="Generate another"
                      className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:border-[#6355d8] hover:text-[#6355d8]"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </Field>
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#6355d8] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#5244c7] disabled:opacity-60"
              >
                {pending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isEdit ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <KeyRound className="h-3.5 w-3.5" />
                )}
                {isEdit ? "Save changes" : "Create agent"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
