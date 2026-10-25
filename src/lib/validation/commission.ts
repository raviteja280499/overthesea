import { z } from "zod";

import { moneySchema, optionalText, uuidSchema } from "./common";

/**
 * Bulk approve takes an ARRAY in one action.
 *
 * Server Actions dispatch sequentially per client, so firing N actions with
 * Promise.all would queue them one behind the other rather than running them
 * in parallel. One action over a list is both faster and atomic from the
 * operator's point of view.
 */
export const approveCommissionsSchema = z.object({
  ids: z.array(uuidSchema).min(1, "Select at least one commission").max(100),
});

export const recordPaymentSchema = z.object({
  id: uuidSchema,
  // The DB also enforces this: `paid_requires_reference` refuses a paid row
  // with no reference, so an untraceable payout cannot be recorded.
  paymentReference: z
    .string()
    .trim()
    .min(3, "Enter the UTR, cheque number or transfer reference")
    .max(80),
  paymentMethod: optionalText(40),
  paymentNote: optionalText(500),
  paidAt: z
    .union([z.iso.date(), z.literal("")])
    .optional()
    .transform((v) => (v ? v : null)),
});

/**
 * Correcting the amount before approval. The guard trigger locks `amount`
 * once a commission leaves 'earned', so this is only ever valid while the
 * payout is still pending.
 */
export const setCommissionAmountSchema = z.object({
  id: uuidSchema,
  amount: moneySchema,
});

export const cancelCommissionSchema = z.object({
  id: uuidSchema,
  reason: z.string().trim().min(3, "Give a reason").max(300),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
