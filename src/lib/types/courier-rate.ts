/**
 * Owned DTOs for the United Express rate API.
 *
 * The upstream payload uses PascalCase keys, several of them containing
 * spaces ("Grand Total", "Other Charges", "From Date"). Nothing of that shape
 * leaks past src/app/api/courier/rate/route.ts — the same containment
 * TrackingResult gives the tracking endpoint.
 */

/** Upstream splits every lane into documents (DOX) and parcels (SPX). */
export type ShipmentKind = "parcel" | "documents";

export const PRODUCT_CODE_BY_KIND: Record<ShipmentKind, string> = {
  parcel: "SPX",
  documents: "DOX",
};

export interface CourierRateQuote {
  /**
   * Carrier + product is NOT unique upstream — a single lane can return
   * SELF/SPX "SELF" alongside SELF/SPX "DUTY PAID" — so the service name is
   * part of the identity.
   */
  id: string;
  /** Shown verbatim, e.g. "UPS EXPRESS", "FEDEX", "SELF". */
  carrier: string;
  carrierCode: string;
  /** The specific offer, e.g. "YOUR PACKAGING", "DUTY PAID". */
  service: string;
  product: string;
  productCode: string;
  kind: ShipmentKind;
  /** Base freight. */
  baseAmount: number;
  otherCharges: number;
  fuel: number;
  /** baseAmount + otherCharges + fuel, as computed upstream. */
  subtotal: number;
  /** GST. */
  tax: number;
  /** subtotal + tax. The headline price. */
  total: number;
  /** Usually empty — upstream rarely populates transit time. */
  transitDays: string;
  effectiveFrom: string;
}

export interface CourierRateResult {
  destinationCode: string;
  destinationName: string;
  weightKg: number;
  /** Ascending by total, so the first entry is the cheapest. */
  quotes: CourierRateQuote[];
  /** null when the lane has no rates at all. */
  cheapestId: string | null;
}
