import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ContactInquiry } from "./types/inquiry";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lrxsjuulqtldvnetdtof.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy_token_placeholder";

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

// Client-side browser Supabase client
let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return browserClient;
}

// Server-side administrative Supabase client
export function getSupabaseServerClient(): SupabaseClient {
  const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  return createClient(SUPABASE_URL, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// In-memory / localStorage fallback storage for inquiries when Supabase table is pending or in demo mode
const LOCAL_STORAGE_KEY = "overthesea_inquiries_db";

export function getLocalFallbackInquiries(): ContactInquiry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse local inquiries fallback:", err);
    return [];
  }
}

export function saveLocalFallbackInquiry(inquiry: ContactInquiry): ContactInquiry {
  const saved: ContactInquiry = {
    ...inquiry,
    id: inquiry.id || `inq_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    status: inquiry.status || "new",
    created_at: inquiry.created_at || new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const current = getLocalFallbackInquiries();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([saved, ...current]));
    } catch (err) {
      console.error("Failed to save local inquiry fallback:", err);
    }
  }
  return saved;
}
