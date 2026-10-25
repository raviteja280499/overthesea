/**
 * Study destinations Over The Sea actively supports.
 *
 * Extracted from the hardcoded `destinations` array in
 * src/app/education/page.tsx so the public site and the CRM forms cannot
 * drift apart. Order matches the public page.
 */
export const STUDY_DESTINATIONS = [
  "United States (USA)",
  "United Kingdom (UK)",
  "Canada",
  "Australia",
  "Germany",
  "Ireland",
  "Netherlands",
  "France",
  "Sweden",
  "Singapore",
  "New Zealand",
  "Japan",
  "China",
  "Russia",
  "European Union (EU Region)",
] as const;

export type StudyDestination = (typeof STUDY_DESTINATIONS)[number];

/** The five service categories used by contact_inquiries. */
export const SERVICE_CATEGORIES = [
  "Overseas Education",
  "Courier Logistics",
  "Tourism & Visa",
  "Test Preparation Coaching",
  "General Inquiry",
] as const;
