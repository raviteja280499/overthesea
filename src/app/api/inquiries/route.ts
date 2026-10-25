import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/admin";
import { assertAdmin, AuthError } from "@/lib/auth/dal";
import { ContactInquiry, ServiceCategory, InquiryStatus } from "@/lib/types/inquiry";

// Supabase is the only store. A misconfigured or unreachable project must surface as an
// error rather than silently serving placeholder data.
function dbUnavailable(err: unknown) {
  // Logged server-side only. With RLS enabled, raw Postgres errors name
  // policies, columns and tables, so they must not reach the client.
  console.error("Supabase request failed:", err);
  return NextResponse.json(
    { success: false, error: "The database is temporarily unavailable. Please try again." },
    { status: 503 }
  );
}

// GET/PATCH/DELETE read and mutate every inquiry in the system using the
// service-role key, which bypasses RLS. They were previously unauthenticated.
function unauthorised(err: AuthError) {
  return NextResponse.json(
    { success: false, error: err.status === 401 ? "Not authenticated." : "Forbidden." },
    { status: err.status }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { full_name, email, phone, service_category, subject, message, metadata } = body;

    if (!full_name || !phone) {
      return NextResponse.json(
        { success: false, error: "Name and Phone number are required." },
        { status: 400 }
      );
    }

    const category: ServiceCategory = service_category || "General Inquiry";

    const inquiryPayload: ContactInquiry = {
      full_name: full_name.trim(),
      email: email ? email.trim() : null,
      phone: phone.trim(),
      service_category: category,
      subject: subject || null,
      message: message || null,
      metadata: metadata || {},
      status: "new",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("contact_inquiries")
      .insert([inquiryPayload])
      .select()
      .single();

    if (error) return dbUnavailable(error);

    return NextResponse.json({
      success: true,
      message: "Inquiry received successfully! Our team will contact you shortly.",
      data,
    });
  } catch (err: any) {
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 }
      );
    }
    return dbUnavailable(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    await assertAdmin();
  } catch (err) {
    if (err instanceof AuthError) return unauthorised(err);
    throw err;
  }

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const supabase = getServiceClient();
    let query = supabase
      .from("contact_inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (category && category !== "all") {
      query = query.eq("service_category", category);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) return dbUnavailable(error);

    let inquiries: ContactInquiry[] = data ?? [];

    // Text search filter
    if (search && search.trim() !== "") {
      const term = search.toLowerCase();
      inquiries = inquiries.filter(
        (i) =>
          i.full_name?.toLowerCase().includes(term) ||
          i.phone?.toLowerCase().includes(term) ||
          i.email?.toLowerCase().includes(term) ||
          i.message?.toLowerCase().includes(term) ||
          i.subject?.toLowerCase().includes(term)
      );
    }

    return NextResponse.json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (err: any) {
    return dbUnavailable(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await assertAdmin();
  } catch (err) {
    if (err instanceof AuthError) return unauthorised(err);
    throw err;
  }

  try {
    const body = await req.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Inquiry ID is required" },
        { status: 400 }
      );
    }

    const updates: Partial<ContactInquiry> = {
      updated_at: new Date().toISOString(),
    };
    if (status) updates.status = status as InquiryStatus;
    if (notes !== undefined) updates.notes = notes;

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("contact_inquiries")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return dbUnavailable(error);
    if (!data) {
      return NextResponse.json(
        { success: false, error: "Inquiry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Inquiry updated successfully",
      data,
    });
  } catch (err: any) {
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 }
      );
    }
    return dbUnavailable(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await assertAdmin();
  } catch (err) {
    if (err instanceof AuthError) return unauthorised(err);
    throw err;
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Inquiry ID is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();
    const { error } = await supabase.from("contact_inquiries").delete().eq("id", id);
    if (error) return dbUnavailable(error);

    return NextResponse.json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (err: any) {
    return dbUnavailable(err);
  }
}
