export type ServiceCategory =
  | "Overseas Education"
  | "Courier Logistics"
  | "Tourism & Visa"
  | "Test Preparation Coaching"
  | "General Inquiry";

export type InquiryStatus =
  | "new"
  | "contacted"
  | "in_progress"
  | "resolved"
  | "archived";

export interface ContactInquiry {
  id?: string;
  full_name: string;
  email?: string | null;
  phone: string;
  service_category: ServiceCategory;
  subject?: string | null;
  message?: string | null;
  metadata?: Record<string, any> | null;
  status?: InquiryStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  /** Set once this inquiry has been promoted into a CRM lead. */
  converted_lead_id?: string | null;
  converted_at?: string | null;
  converted_by?: string | null;
}

export interface InquiryResponse {
  success: boolean;
  message: string;
  data?: ContactInquiry | ContactInquiry[];
  error?: string;
}
