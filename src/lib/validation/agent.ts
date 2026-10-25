import { z } from "zod";

import {
  emailSchema,
  optionalPhone,
  optionalText,
  passwordSchema,
  uuidSchema,
} from "./common";

/**
 * Single object + superRefine rather than `.and(commissionConfig)`: zod
 * intersections combine the *output* of each half, and these fields carry
 * `.transform()`s that turn "" into null, which an intersection has to
 * re-run and reconcile. One flat schema keeps the inferred types honest.
 */
const commissionFields = {
  commissionType: z.enum(["flat", "percent"]),
  commissionValue: z.coerce
    .number()
    .nonnegative("Commission cannot be negative")
    .max(99_999_999, "That commission is implausibly large"),
};

const agentProfileFields = {
  fullName: z.string().trim().min(2, "Enter the agent's name").max(120),
  phone: optionalPhone,
  instituteName: optionalText(160),
  address: optionalText(500),
  remarks: optionalText(1000),
  agentCode: optionalText(40),
};

/** A percentage above 100 would pay out more than the deal is worth. */
const percentCeiling = (
  v: { commissionType: string; commissionValue: number },
  ctx: z.RefinementCtx
) => {
  if (v.commissionType === "percent" && v.commissionValue > 100) {
    ctx.addIssue({
      code: "custom",
      message: "A percentage cannot exceed 100",
      path: ["commissionValue"],
    });
  }
};

/** Admin creates the agent; there is no public signup path. */
export const createAgentSchema = z
  .object({
    ...agentProfileFields,
    ...commissionFields,
    email: emailSchema,
    tempPassword: passwordSchema,
  })
  .superRefine(percentCeiling);

/**
 * Email is absent by design: it is the auth identity. Changing it would need
 * auth.admin.updateUserById plus a profile update plus a forced re-login,
 * for no business gain.
 */
export const updateAgentSchema = z
  .object({
    ...agentProfileFields,
    ...commissionFields,
    id: uuidSchema,
  })
  .superRefine(percentCeiling);

export const setAgentStatusSchema = z.object({
  id: uuidSchema,
  status: z.enum(["active", "suspended"]),
});

/**
 * With no SMTP configured, this admin-driven reset is the only password
 * recovery path there is.
 */
export const resetAgentPasswordSchema = z.object({
  id: uuidSchema,
  tempPassword: passwordSchema,
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
