import { z } from "zod";

/** Indian mobile numbers, tolerant of +91, spaces and dashes. */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+?91[\s-]?)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

export const optionalPhone = z.union([phoneSchema, z.literal("")]).optional();

export const emailSchema = z.email("Enter a valid email address").trim().toLowerCase();

export const optionalEmail = z.union([emailSchema, z.literal("")]).optional();

export const uuidSchema = z.uuid("Invalid identifier");

export const moneySchema = z
  .number()
  .nonnegative("Amount cannot be negative")
  .max(99_999_999, "Amount is too large");

/** HTML date inputs submit "" when empty; normalise that to null. */
export const optionalDate = z
  .union([z.iso.date(), z.literal("")])
  .optional()
  .transform((v) => (v ? v : null));

/** Trimmed free text that becomes null rather than "" when blank. */
export const optionalText = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

/**
 * Coerces an empty form field to null, otherwise to a number.
 *
 * Note the preprocess: a `z.union([z.coerce.number(), z.literal("")])` looks
 * equivalent but is not — coercion matches "" first and yields 0, so empty
 * numeric inputs would silently save as zero instead of null.
 */
export const optionalNumber = z
  .preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().optional()
  )
  .transform((v) => (v === undefined ? null : v));

export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(72, "Passwords are limited to 72 characters");

export const leadVerticalSchema = z.enum(["education", "travel", "courier"]);
