import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  CourierRateQuote,
  CourierRateResult,
  PRODUCT_CODE_BY_KIND,
  ShipmentKind,
} from "@/lib/types/courier-rate";

const UNITED_EXPRESS_RATE_URL = "https://go.unitedexpress.in/api/v1/Services/GetRate";

type UpstreamRecord = Record<string, unknown>;

interface UpstreamResponse {
  Response?: {
    StatusCode?: string;
    Message?: string;
    RespList?: UpstreamRecord[] | null;
  };
}

const requestSchema = z.object({
  destinationCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, "Choose a destination country")
    .transform((v) => v.toUpperCase()),
  weightKg: z
    .number("Enter the shipment weight")
    .positive("Weight must be greater than zero")
    .max(1000, "For shipments over 1000 kg please contact us directly"),
  kind: z.enum(["parcel", "documents"]).optional(),
});

const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** Upstream sends amounts as JSON numbers today, but has string-typed fields elsewhere. */
const num = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message || "Invalid rate request." },
      { status: 400 }
    );
  }
  const { destinationCode, weightKg, kind } = parsed.data;

  // Rating uses a different United Express account from tracking: the tracking
  // credentials are rejected by GetRate with "Invalid User ID / Password".
  // CustomerCode is part of that credential triple, not a free-form field —
  // blanking it produces the same auth error even with a valid UserID and
  // Password — so it lives in the environment alongside them rather than
  // being hardcoded.
  const userId = process.env.UNITED_EXPRESS_RATE_USER_ID;
  const password = process.env.UNITED_EXPRESS_RATE_PASSWORD;
  const customerCode = process.env.UNITED_EXPRESS_RATE_CUSTOMER_CODE;
  if (!userId || !password || !customerCode) {
    console.error(
      "Rates not configured: UNITED_EXPRESS_RATE_USER_ID / UNITED_EXPRESS_RATE_PASSWORD / UNITED_EXPRESS_RATE_CUSTOMER_CODE missing"
    );
    return NextResponse.json(
      { success: false, error: "Rate service is not configured." },
      { status: 500 }
    );
  }

  let payload: UpstreamResponse;
  try {
    const res = await fetch(UNITED_EXPRESS_RATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Empty vendor/product/service asks for every rate on the lane; we rank
      // and filter them ourselves rather than letting upstream pick one.
      body: JSON.stringify({
        UserID: userId,
        Password: password,
        CustomerCode: customerCode,
        VendorCode: "",
        ProductCode: "",
        DestinationCode: destinationCode,
        ConsigneePincode: "",
        Service: "",
        Weight: weightKg,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    payload = (await res.json()) as UpstreamResponse;
  } catch (err) {
    console.error("United Express rate request failed:", err);
    return NextResponse.json(
      { success: false, error: "Rate service is unavailable right now. Please try again shortly." },
      { status: 502 }
    );
  }

  const response = payload?.Response;
  const message = str(response?.Message);

  // Upstream signals everything over HTTP 200, so the envelope is the contract.
  if (!response || response.StatusCode !== "0") {
    // "No Record Found." means the lane simply isn't serviced — a real answer,
    // not a failure. Returning it as an empty success lets the UI keep the
    // destination and weight it needs for the enquiry fallback.
    if (/no record/i.test(message)) {
      const empty: CourierRateResult = {
        destinationCode,
        destinationName: "",
        weightKg,
        quotes: [],
        cheapestId: null,
      };
      return NextResponse.json({ success: true, data: empty });
    }
    return NextResponse.json(
      { success: false, error: message || "Could not fetch rates for this destination." },
      { status: 400 }
    );
  }

  const wantedProduct = kind ? PRODUCT_CODE_BY_KIND[kind] : null;

  const quotes: CourierRateQuote[] = (response.RespList || [])
    .map((row) => {
      const productCode = str(row.Prod_Code).toUpperCase();
      const carrier = str(row.Vendor);
      const carrierCode = str(row.Vendor_Code) || carrier;
      const service = str(row.Service);
      return {
        id: `${carrierCode}-${productCode}-${service}`.replace(/\s+/g, "_"),
        carrier,
        carrierCode,
        service,
        product: str(row.Product),
        productCode,
        kind: (productCode === "DOX" ? "documents" : "parcel") as ShipmentKind,
        baseAmount: num(row.Amount),
        otherCharges: num(row["Other Charges"]),
        fuel: num(row.Fuel),
        subtotal: num(row.Total),
        tax: num(row.Tax),
        total: num(row["Grand Total"]),
        transitDays: str(row["Display Days"]),
        effectiveFrom: str(row["From Date"]),
      };
    })
    .filter((q) => q.total > 0 && (!wantedProduct || q.productCode === wantedProduct))
    .sort((a, b) => a.total - b.total);

  const firstRow = (response.RespList || [])[0];

  const data: CourierRateResult = {
    destinationCode,
    destinationName: str(firstRow?.Destination) || str(firstRow?.Country),
    weightKg,
    quotes,
    cheapestId: quotes[0]?.id ?? null,
  };

  return NextResponse.json({ success: true, data });
}
