import { z } from "zod";

import { emailSchema, passwordSchema } from "./common";

export const signInSchema = z.object({
  email: emailSchema,
  // Not `passwordSchema`: existing passwords predate the length rule, and a
  // minimum-length error on sign-in would leak that the rule exists.
  password: z.string().min(1, "Enter your password"),
  next: z.string().startsWith("/").optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    message: "Choose a password different from your temporary one",
    path: ["newPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
