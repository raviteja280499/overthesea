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

/* ------------------------------------------------------------------------- */
/* Courier destinations                                                      */
/* ------------------------------------------------------------------------- */

/**
 * Destinations the United Express rate API actually quotes for.
 *
 * Verified by probing GetRate across 111 ISO-3166-1 alpha-2 codes. There is no
 * upstream country-list endpoint to read this from (GetCountry / GetCountries /
 * GetDestination / GetCountryList all 404), hence the static list.
 *
 * Treat this as a picker convenience, NOT a statement of coverage. Rate cards
 * come and go upstream: Bulgaria returned "No Record Found" during the initial
 * probe and was quoting eight rates an hour later. That is also why the route
 * validates the code shape only and never against this list — a lane added
 * upstream must not be blocked here — and why a lane with no rates renders an
 * empty state rather than an error.
 *
 * `code` is what the API wants in DestinationCode. `name` is ours — upstream's
 * own labels are inconsistent and sometimes truncated ("Netherlands, The",
 * "Lao Peoples Democratic Republi"), so we show clean names and let the API
 * echo back whatever it likes.
 *
 * India is deliberately excluded: DestinationCode "IN" returns "No Record
 * Found" with or without a pincode. This lane is international only.
 */
export interface CourierDestination {
  code: string;
  name: string;
}

/** Surfaced in a pinned group above the full list. */
export const POPULAR_COURIER_DESTINATIONS = [
  "US",
  "GB",
  "AE",
  "CA",
  "AU",
  "DE",
  "SG",
  "NZ",
  "SA",
  "QA",
] as const;

export const COURIER_DESTINATIONS: readonly CourierDestination[] = [
  { code: "AF", name: "Afghanistan" },
  { code: "DZ", name: "Algeria" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BT", name: "Bhutan" },
  { code: "BG", name: "Bulgaria" },
  { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" },
  { code: "KH", name: "Cambodia" },
  { code: "CA", name: "Canada" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "CR", name: "Costa Rica" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EG", name: "Egypt" },
  { code: "EE", name: "Estonia" },
  { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "GT", name: "Guatemala" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KR", name: "Korea, South" },
  { code: "KW", name: "Kuwait" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "MT", name: "Malta" },
  { code: "MU", name: "Mauritius" },
  { code: "MX", name: "Mexico" },
  { code: "MN", name: "Mongolia" },
  { code: "MA", name: "Morocco" },
  { code: "MM", name: "Myanmar" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NG", name: "Nigeria" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PA", name: "Panama" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russian Federation" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ZA", name: "South Africa" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" },
  { code: "TW", name: "Taiwan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States of America" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
];

export const COURIER_DESTINATION_NAMES: Record<string, string> = Object.fromEntries(
  COURIER_DESTINATIONS.map((d) => [d.code, d.name])
);
