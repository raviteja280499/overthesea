"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assertAdmin } from "@/lib/auth/dal";
import { ok, fail, withAction, type ActionResult } from "@/lib/actions/result";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  approveCommissionsSchema,
  cancelCommissionSchema,
  recordPaymentSchema,
  setCommissionAmountSchema,
} from "@/lib/validation/commission";

function revalidateAll() {
  revalidatePath("/admin/commissions");
  revalidatePath("/admin/agents");
  revalidatePath("/admin/students");
}

/**
 * Approve one or many commissions.
 *
 * Takes an array deliberately: Server Actions dispatch sequentially per
 * client, so `Promise.all` over N single-id actions would serialise anyway.
 *
 * Note what this does NOT do: it never sets approved_at or approved_by. The
 * `guard_commission_write` trigger stamps those from auth.uid() and refuses
 * any transition other than earned -> approved, so the audit trail cannot be
 * back-dated or attributed to someone else from here.
 */
export async function approveCommissions(
  _prev: ActionResult<{ approved: number }> | null,
  formData: FormData
): Promise<ActionResult<{ approved: number }>> {
  return withAction(async () => {
    await assertAdmin();

    const parsed = approveCommissionsSchema.safeParse({
      ids: formData.getAll("ids").map(String).filter(Boolean),
    });
    if (!parsed.success) {
      return fail("Select at least one commission to approve.");
    }

    const supabase = await createServerSupabase();

    const { data: rows } = await supabase
      .from("commissions")
      .select("id, status, amount")
      .in("id", parsed.data.ids);

    const candidates = (rows ?? []) as { id: string; status: string; amount: number | null }[];

    // A percent commission with no service fee has a null amount. The
    // approved_requires_amount CHECK would reject it, so filter these out and
    // name them rather than letting the whole batch fail.
    const missingAmount = candidates.filter((c) => c.status === "earned" && c.amount === null);
    const approvable = candidates.filter((c) => c.status === "earned" && c.amount !== null);

    if (approvable.length === 0) {
      return fail(
        missingAmount.length > 0
          ? `${missingAmount.length} of these have no amount yet. Set each student's service fee first.`
          : "Nothing to approve — those commissions are not awaiting approval."
      );
    }

    const { error } = await supabase
      .from("commissions")
      .update({ status: "approved" })
      .in(
        "id",
        approvable.map((c) => c.id)
      )
      .eq("status", "earned");

    if (error) {
      console.error("[approveCommissions]", error);
      return fail("Could not approve these commissions.");
    }

    revalidateAll();

    const note =
      missingAmount.length > 0
        ? ` ${missingAmount.length} skipped — no amount set yet.`
        : "";
    return ok(
      { approved: approvable.length },
      `${approvable.length} commission${approvable.length === 1 ? "" : "s"} approved.${note}`
    );
  });
}

/**
 * Record an actual payment. This is the final state — the guard trigger
 * refuses paid -> anything, so it cannot be rewound.
 */
export async function recordPayment(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return withAction(async () => {
    await assertAdmin();

    const parsed = recordPaymentSchema.safeParse({
      id: formData.get("id"),
      paymentReference: formData.get("paymentReference"),
      paymentMethod: formData.get("paymentMethod") ?? "",
      paymentNote: formData.get("paymentNote") ?? "",
      paidAt: formData.get("paidAt") ?? "",
    });

    if (!parsed.success) {
      return fail("Check the details below.", z.flattenError(parsed.error).fieldErrors);
    }

    const supabase = await createServerSupabase();

    const { error } = await supabase
      .from("commissions")
      .update({
        status: "paid",
        payment_reference: parsed.data.paymentReference,
        payment_method: parsed.data.paymentMethod,
        payment_note: parsed.data.paymentNote,
        // Backdating a payment is legitimate — the transfer may have gone out
        // yesterday. paid_by is still stamped by the trigger as whoever
        // recorded it.
        paid_at: parsed.data.paidAt
          ? new Date(parsed.data.paidAt).toISOString()
          : new Date().toISOString(),
      })
      .eq("id", parsed.data.id)
      .eq("status", "approved");

    if (error) {
      console.error("[recordPayment]", error);
      return fail(
        /Illegal commission transition/i.test(error.message)
          ? "This commission has to be approved before it can be paid."
          : "Could not record this payment."
      );
    }

    revalidateAll();
    return ok(undefined, "Payment recorded.");
  });
}

/** Correct the amount while the commission is still pending approval. */
export async function setCommissionAmount(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return withAction(async () => {
    await assertAdmin();

    const parsed = setCommissionAmountSchema.safeParse({
      id: formData.get("id"),
      amount: Number(formData.get("amount")),
    });
    if (!parsed.success) {
      return fail("Enter a valid amount.", z.flattenError(parsed.error).fieldErrors);
    }

    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("commissions")
      .update({ amount: parsed.data.amount })
      .eq("id", parsed.data.id)
      .eq("status", "earned");

    if (error) {
      console.error("[setCommissionAmount]", error);
      return fail(
        /locked once/i.test(error.message)
          ? "The amount cannot change once the commission has been approved."
          : "Could not save the amount."
      );
    }

    revalidateAll();
    return ok(undefined, "Amount saved.");
  });
}

/** Cancel instead of deleting — the ledger is append-only. */
export async function cancelCommission(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return withAction(async () => {
    await assertAdmin();

    const parsed = cancelCommissionSchema.safeParse({
      id: formData.get("id"),
      reason: formData.get("reason"),
    });
    if (!parsed.success) {
      return fail("Give a reason for cancelling.", z.flattenError(parsed.error).fieldErrors);
    }

    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("commissions")
      .update({ status: "cancelled", cancel_reason: parsed.data.reason })
      .eq("id", parsed.data.id)
      .in("status", ["earned", "approved"]);

    if (error) {
      console.error("[cancelCommission]", error);
      return fail(
        /Illegal commission transition/i.test(error.message)
          ? "A commission that has already been paid cannot be cancelled."
          : "Could not cancel this commission."
      );
    }

    revalidateAll();
    return ok(undefined, "Commission cancelled.");
  });
}
