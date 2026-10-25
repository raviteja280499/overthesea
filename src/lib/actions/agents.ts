"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assertAdmin } from "@/lib/auth/dal";
import { ok, fail, withAction, type ActionResult } from "@/lib/actions/result";
import { getServiceClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  createAgentSchema,
  resetAgentPasswordSchema,
  setAgentStatusSchema,
  updateAgentSchema,
} from "@/lib/validation/agent";

function formValues(formData: FormData) {
  return {
    id: formData.get("id"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    instituteName: formData.get("instituteName") ?? "",
    address: formData.get("address") ?? "",
    remarks: formData.get("remarks") ?? "",
    agentCode: formData.get("agentCode") ?? "",
    commissionType: formData.get("commissionType"),
    commissionValue: formData.get("commissionValue"),
    tempPassword: formData.get("tempPassword"),
    status: formData.get("status"),
  };
}

/**
 * Create an agent account.
 *
 * Returns the temporary password ONCE so the admin can pass it on. It is
 * never stored in our tables and never logged — GoTrue holds only the hash.
 */
export async function createAgent(
  _prev: ActionResult<{ email: string; tempPassword: string }> | null,
  formData: FormData
): Promise<ActionResult<{ email: string; tempPassword: string }>> {
  return withAction(async () => {
    await assertAdmin();

    const parsed = createAgentSchema.safeParse(formValues(formData));
    if (!parsed.success) {
      return fail("Check the details below.", z.flattenError(parsed.error).fieldErrors);
    }
    const input = parsed.data;

    const admin = getServiceClient();

    const { data, error } = await admin.auth.admin.createUser({
      email: input.email,
      password: input.tempPassword,
      email_confirm: true, // no SMTP configured, so confirm inline
      app_metadata: { role: "agent" },
    });

    if (error || !data.user) {
      const duplicate = /already|registered|exists/i.test(error?.message ?? "");
      return fail(
        duplicate
          ? "An account with that email already exists."
          : "Could not create the agent account.",
        duplicate ? { email: ["An account with that email already exists."] } : undefined
      );
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: data.user.id,
      role: "agent",
      status: "active",
      full_name: input.fullName,
      email: input.email,
      phone: input.phone || null,
      institute_name: input.instituteName,
      address: input.address,
      remarks: input.remarks,
      agent_code: input.agentCode,
      commission_type: input.commissionType,
      commission_value: input.commissionValue,
      must_change_password: true,
    });

    if (profileError) {
      // No transaction spans GoTrue and Postgres. Without this compensating
      // delete the auth user survives with no profile — able to sign in, and
      // permanently stuck, since verifySession() returns null for them.
      await admin.auth.admin.deleteUser(data.user.id);
      console.error("[createAgent] profile insert failed, auth user rolled back", profileError);

      const duplicateCode = /agent_code/i.test(profileError.message);
      return fail(
        duplicateCode
          ? "That agent code is already in use."
          : "Could not create the agent profile.",
        duplicateCode ? { agentCode: ["That agent code is already in use."] } : undefined
      );
    }

    revalidatePath("/admin/agents");
    return ok(
      { email: input.email, tempPassword: input.tempPassword },
      `${input.fullName} can now sign in at /agent.`
    );
  });
}

export async function updateAgent(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return withAction(async () => {
    await assertAdmin();

    const parsed = updateAgentSchema.safeParse(formValues(formData));
    if (!parsed.success) {
      return fail("Check the details below.", z.flattenError(parsed.error).fieldErrors);
    }
    const input = parsed.data;

    // Admin-scoped client: the profiles_all_admin policy covers this, so RLS
    // stays in force rather than being bypassed with the service key.
    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: input.fullName,
        phone: input.phone || null,
        institute_name: input.instituteName,
        address: input.address,
        remarks: input.remarks,
        agent_code: input.agentCode,
        commission_type: input.commissionType,
        commission_value: input.commissionValue,
      })
      .eq("id", input.id)
      .eq("role", "agent");

    if (error) {
      console.error("[updateAgent]", error);
      return fail(
        /agent_code/i.test(error.message)
          ? "That agent code is already in use."
          : "Could not update the agent."
      );
    }

    revalidatePath("/admin/agents");
    revalidatePath(`/admin/agents/${input.id}`);
    return ok(undefined, "Agent updated.");
  });
}

/**
 * Suspend or reactivate an agent.
 *
 * There is deliberately no delete: the commission ledger is append-only and
 * commissions.agent_id is ON DELETE RESTRICT, so an agent who has ever earned
 * cannot be removed. Suspension revokes access — verifySession() rejects a
 * non-active profile — while the payout history stays intact.
 */
export async function setAgentStatus(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  return withAction(async () => {
    await assertAdmin();

    const parsed = setAgentStatusSchema.safeParse(formValues(formData));
    if (!parsed.success) return fail("Invalid request.");

    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from("profiles")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.id)
      .eq("role", "agent");

    if (error) {
      console.error("[setAgentStatus]", error);
      return fail("Could not change the agent's status.");
    }

    revalidatePath("/admin/agents");
    revalidatePath(`/admin/agents/${parsed.data.id}`);
    return ok(
      undefined,
      parsed.data.status === "suspended" ? "Agent suspended." : "Agent reactivated."
    );
  });
}

/** The only password-recovery path, since there is no SMTP for self-serve reset. */
export async function resetAgentPassword(
  _prev: ActionResult<{ tempPassword: string }> | null,
  formData: FormData
): Promise<ActionResult<{ tempPassword: string }>> {
  return withAction(async () => {
    await assertAdmin();

    const parsed = resetAgentPasswordSchema.safeParse(formValues(formData));
    if (!parsed.success) {
      return fail("Check the details below.", z.flattenError(parsed.error).fieldErrors);
    }

    const admin = getServiceClient();

    const { data: profile } = await admin
      .from("profiles")
      .select("id, role")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (!profile || profile.role !== "agent") return fail("Agent not found.");

    const { error } = await admin.auth.admin.updateUserById(parsed.data.id, {
      password: parsed.data.tempPassword,
    });
    if (error) {
      console.error("[resetAgentPassword]", error);
      return fail("Could not reset the password.");
    }

    // Re-arm the forced change so the admin-chosen password is temporary.
    await admin
      .from("profiles")
      .update({ must_change_password: true })
      .eq("id", parsed.data.id);

    revalidatePath(`/admin/agents/${parsed.data.id}`);
    return ok(
      { tempPassword: parsed.data.tempPassword },
      "Password reset. The agent must change it at next sign-in."
    );
  });
}
