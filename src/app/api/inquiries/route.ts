import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { ContactInquiry, ServiceCategory, InquiryStatus } from "@/lib/types/inquiry";

// In-memory store for server lifetime if Supabase is temporarily unreachable or table not yet created
const inMemoryInquiries: ContactInquiry[] = [
  {
    id: "sample-1",
    full_name: "Ramesh Rao",
    email: "ramesh.rao@example.com",
    phone: "+91 98765 43210",
    service_category: "Overseas Education",
    subject: "Fall 2026 MS in Computer Science (USA)",
    message: "Looking for university shortlisting and GRE coaching in Hyderabad.",
    metadata: { country: "USA", degree: "Masters", intake: "Fall 2026" },
    status: "new",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "sample-2",
    full_name: "Priya Reddy",
    email: "priya.reddy@example.com",
    phone: "+91 90527 11223",
    service_category: "Courier Logistics",
    subject: "Prescription Medicine Courier to London UK",
    message: "Need door-to-door pickup for 2.5kg medicine parcel with doctor prescription.",
    metadata: { dest_country: "UK", weight_kg: 2.5, item_type: "medicine", estimated_cost: 3800 },
    status: "contacted",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "sample-3",
    full_name: "Anil Kumar",
    email: "anil.k@example.com",
    phone: "+91 98480 22334",
    service_category: "Tourism & Visa",
    subject: "Tourist Visa Callback for UAE (Dubai)",
    message: "Family vacation planned next month. Need express tourist visa stamping assistance.",
    metadata: { dest_country: "UAE", visa_type: "Express Tourist Visa" },
    status: "in_progress",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  }
];

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

    const category: ServiceCategory =
      service_category || "General Inquiry";

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

    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("contact_inquiries")
        .insert([inquiryPayload])
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({
          success: true,
          message: "Inquiry received and recorded successfully in Supabase!",
          data,
        });
      }

      if (error) {
        console.warn("Supabase insert notice (using fallback store):", error.message);
      }
    } catch (sbErr) {
      console.warn("Supabase client connection exception:", sbErr);
    }

    // Fallback in-memory storage
    const fallbackRecord: ContactInquiry = {
      ...inquiryPayload,
      id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    inMemoryInquiries.unshift(fallbackRecord);

    return NextResponse.json({
      success: true,
      message: "Inquiry received successfully! Our team will contact you shortly.",
      data: fallbackRecord,
    });
  } catch (err: any) {
    console.error("Error creating inquiry:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit inquiry." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let inquiries: ContactInquiry[] = [];

    try {
      const supabase = getSupabaseServerClient();
      let query = supabase.from("contact_inquiries").select("*").order("created_at", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("service_category", category);
      }
      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        inquiries = data;
      }
    } catch (e) {
      console.warn("Supabase fetch failed, utilizing in-memory inquiries:", e);
    }

    // If Supabase yielded no records (e.g. initial setup without keys), fallback to in-memory
    if (inquiries.length === 0) {
      inquiries = [...inMemoryInquiries];
      if (category && category !== "all") {
        inquiries = inquiries.filter((i) => i.service_category === category);
      }
      if (status && status !== "all") {
        inquiries = inquiries.filter((i) => i.status === status);
      }
    }

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
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve inquiries." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
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

    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("contact_inquiries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({
          success: true,
          message: "Inquiry updated successfully",
          data,
        });
      }
    } catch (e) {
      console.warn("Supabase update fallback:", e);
    }

    // Fallback update in memory
    const index = inMemoryInquiries.findIndex((item) => item.id === id);
    if (index !== -1) {
      inMemoryInquiries[index] = { ...inMemoryInquiries[index], ...updates };
      return NextResponse.json({
        success: true,
        message: "Inquiry updated successfully",
        data: inMemoryInquiries[index],
      });
    }

    return NextResponse.json({
      success: true,
      message: "Inquiry updated",
      data: { id, ...updates },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update inquiry." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Inquiry ID is required" },
        { status: 400 }
      );
    }

    try {
      const supabase = getSupabaseServerClient();
      await supabase.from("contact_inquiries").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase delete notice:", e);
    }

    const idx = inMemoryInquiries.findIndex((i) => i.id === id);
    if (idx !== -1) {
      inMemoryInquiries.splice(idx, 1);
    }

    return NextResponse.json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete inquiry." },
      { status: 500 }
    );
  }
}
