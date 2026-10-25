import { NextResponse, type NextRequest } from "next/server";

import { getServiceClient } from "@/lib/supabase/admin";

/**
 * One-shot admin seed.
 *
 * Creates the Supabase Auth user and profile row for ADMIN_EMAIL /
 * ADMIN_PASSWORD. Admin and agents now share one identity provider, so the
 * admin must exist in auth.users for `auth.uid()` — and therefore every RLS
 * policy — to resolve for them.
 *
 * Idempotent: no-ops once any admin profile exists. Gated by
 * ADMIN_SECRET_TOKEN, which until now was declared in .env and referenced
 * nowhere.
 *
 *   curl -X POST http://localhost:3000/api/admin/bootstrap \
 *        -H "x-bootstrap-token: $ADMIN_SECRET_TOKEN"
 */
export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_SECRET_TOKEN;
  const provided = req.headers.get("x-bootstrap-token");

  if (!expected) {
    return NextResponse.json(
      { success: false, error: "ADMIN_SECRET_TOKEN is not configured." },
      { status: 500 }
    );
  }
  if (provided !== expected) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "ADMIN_EMAIL and ADMIN_PASSWORD must be set." },
      { status: 500 }
    );
  }

  try {
    const admin = getServiceClient();

    const { count, error: countError } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (countError) {
      console.error("[bootstrap] profile count failed", countError);
      return NextResponse.json(
        { success: false, error: "Could not read profiles. Has the schema been applied?" },
        { status: 500 }
      );
    }

    if ((count ?? 0) > 0) {
      return NextResponse.json({
        success: true,
        message: "An administrator already exists; nothing to do.",
      });
    }

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // no SMTP configured, so confirm inline
      app_metadata: { role: "admin" },
    });

    if (error || !data.user) {
      console.error("[bootstrap] createUser failed", error);
      return NextResponse.json(
        { success: false, error: "Could not create the administrator account." },
        { status: 500 }
      );
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: data.user.id,
      role: "admin",
      status: "active",
      full_name: "Over The Sea Administrator",
      email,
      must_change_password: false,
      password_changed_at: new Date().toISOString(),
    });

    if (profileError) {
      // There is no transaction spanning GoTrue and Postgres, so compensate
      // explicitly — an auth user with no profile can still sign in and would
      // sit in a permanently broken half-state.
      await admin.auth.admin.deleteUser(data.user.id);
      console.error("[bootstrap] profile insert failed, auth user rolled back", profileError);
      return NextResponse.json(
        { success: false, error: "Could not create the administrator profile." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Administrator provisioned for ${email}.`,
    });
  } catch (err) {
    console.error("[bootstrap]", err);
    return NextResponse.json(
      { success: false, error: "Bootstrap failed." },
      { status: 500 }
    );
  }
}
