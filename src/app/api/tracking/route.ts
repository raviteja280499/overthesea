import { NextRequest, NextResponse } from "next/server";
import { TrackingResult } from "@/lib/types/tracking";

const UNITED_EXPRESS_TRACKING_URL = "https://go.unitedexpress.in/api/v1/Tracking/Tracking";

type UpstreamRecord = Record<string, unknown>;

interface UpstreamResponse {
  Response?: {
    ErrorCode?: string;
    ErrorDisc?: string;
    Tracking?: UpstreamRecord[] | null;
    Events?: UpstreamRecord[] | null;
  };
}

const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export async function GET(req: NextRequest) {
  const awb = (new URL(req.url).searchParams.get("awb") || "").trim();

  if (!/^[A-Za-z0-9-]{1,30}$/.test(awb)) {
    return NextResponse.json(
      { success: false, error: "Please enter a valid AWB number." },
      { status: 400 }
    );
  }

  const userId = process.env.UNITED_EXPRESS_USER_ID;
  const password = process.env.UNITED_EXPRESS_PASSWORD;
  if (!userId || !password) {
    console.error("Tracking not configured: UNITED_EXPRESS_USER_ID / UNITED_EXPRESS_PASSWORD missing");
    return NextResponse.json(
      { success: false, error: "Tracking service is not configured." },
      { status: 500 }
    );
  }

  let payload: UpstreamResponse;
  try {
    const res = await fetch(UNITED_EXPRESS_TRACKING_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ UserID: userId, Password: password, AWBNo: awb, Type: "A" }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    payload = (await res.json()) as UpstreamResponse;
  } catch (err) {
    console.error("United Express tracking request failed:", err);
    return NextResponse.json(
      { success: false, error: "Tracking service is unavailable right now. Please try again shortly." },
      { status: 502 }
    );
  }

  const response = payload?.Response;
  const shipment = response?.Tracking?.[0];
  if (!response || response.ErrorCode !== "0" || !shipment) {
    return NextResponse.json(
      { success: false, error: str(response?.ErrorDisc) || "No shipment found for this AWB number." },
      { status: 404 }
    );
  }

  const deliveredOn = [str(shipment.DeliveryDate1), str(shipment.DeliveryTime1)].filter(Boolean).join(", ");

  const data: TrackingResult = {
    awb: str(shipment.AWBNo) || awb,
    status: str(shipment.Status),
    bookedOn: str(shipment.BookingDate1) || str(shipment.BookingDate),
    origin: str(shipment.Origin),
    originCountry: str(shipment.Origin_Country),
    destination: str(shipment.Destination),
    destinationCountry: str(shipment.Destination_Country),
    consignee: str(shipment.Consignee),
    shipper: str(shipment.Shipper_Name),
    service: str(shipment.ServiceName),
    carrier: str(shipment.VendorName),
    carrierAwb: str(shipment.VendorAWBNo1),
    weight: str(shipment.Weight),
    deliveredOn,
    receiverName: str(shipment.ReceiverName),
    expectedDelivery: str(shipment.ExpectedDeliveryDate),
    events: (response.Events || []).map((e) => ({
      date: str(e.EventDate1) || str(e.EventDate),
      time: str(e.EventTime1) || str(e.EventTime),
      location: str(e.Location),
      status: str(e.Status),
    })),
  };

  return NextResponse.json({ success: true, data });
}
