"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Calculator,
  ChevronDown,
  Globe2,
  Loader2,
  Package,
  PhoneCall,
} from "lucide-react";

import CarrierLogo from "@/components/courier/CarrierLogo";
import CountrySelect, { Flag } from "@/components/courier/CountrySelect";
import ShipmentTypeSelect, {
  SHIPMENT_TYPES,
  type ShipmentType,
} from "@/components/courier/ShipmentTypeSelect";
import WeightInput, {
  MAX_WEIGHT_KG,
  MIN_WEIGHT_KG,
} from "@/components/courier/WeightInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COURIER_DESTINATION_NAMES } from "@/lib/constants/countries";
import { formatMoney } from "@/lib/constants/crm";
import type { CourierRateQuote, CourierRateResult } from "@/lib/types/courier-rate";

export interface BookRateRequest {
  subject: string;
  metadata: Record<string, unknown>;
}

interface RateCalculatorProps {
  onBookRate: (request: BookRateRequest) => void;
}

const WEIGHT_CHIPS = [0.5, 1, 2, 5, 10, 20];

type ProductFilter = "ALL" | "SPX" | "DOX";

function BreakdownRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: number;
  emphasis?: "subtotal" | "total";
}) {
  const edge = emphasis ? "border-t border-slate-200 pt-2 mt-1" : "";
  return (
    <>
      <dt
        className={`${
          emphasis === "total" ? "text-slate-900 font-bold" : "text-slate-500"
        } ${edge}`}
      >
        {label}
      </dt>
      <dd
        className={`text-right tabular-nums ${
          emphasis === "total" ? "text-amber-700 font-black" : "text-slate-800"
        } ${edge}`}
      >
        {formatMoney(value)}
      </dd>
    </>
  );
}

function RateCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5 animate-pulse"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="h-12 w-14 shrink-0 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-3 w-20 rounded bg-slate-200/70" />
        </div>
        <div className="h-7 w-24 shrink-0 rounded bg-slate-200" />
      </div>
      <div className="mt-4 h-9 rounded-xl border-t border-slate-200 bg-slate-100" />
    </div>
  );
}

export default function RateCalculator({ onBookRate }: RateCalculatorProps) {
  // Form state — changing any of this fires nothing on its own.
  const [destinationCode, setDestinationCode] = useState("US");
  const [weightInput, setWeightInput] = useState("5");
  const [shipmentType, setShipmentType] = useState<ShipmentType>("general");
  const [productFilter, setProductFilter] = useState<ProductFilter>("ALL");
  const [formError, setFormError] = useState("");

  // Request state — only ever set by an explicit submit.
  const [request, setRequest] = useState<{
    code: string;
    weight: number;
    attempt: number;
  } | null>(null);
  const [outcome, setOutcome] = useState<{
    key: string;
    data?: CourierRateResult;
    error?: string;
  } | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const requestKey = request ? `${request.code}#${request.weight}#${request.attempt}` : "";

  // Loading is derived, as on the tracking page, so a slow earlier response
  // can never clear the spinner for a newer request.
  const loading = !!request && outcome?.key !== requestKey;
  const result = !loading ? outcome?.data ?? null : null;
  const error = !loading ? outcome?.error ?? null : null;

  useEffect(() => {
    if (!request) return;
    let cancelled = false;
    const key = `${request.code}#${request.weight}#${request.attempt}`;

    // Deliberately does NOT send a product filter: one call returns every rate
    // on the lane and the DOX/SPX split is applied below, so switching
    // shipment type re-filters instantly with no second round trip.
    fetch("/api/courier/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationCode: request.code, weightKg: request.weight }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        setOpenId(null);
        setOutcome(
          json?.success
            ? { key, data: json.data as CourierRateResult }
            : { key, error: json?.error || "Unable to fetch rates right now." }
        );
      })
      .catch(() => {
        if (cancelled) return;
        setOutcome({ key, error: "Network error. Check your connection and try again." });
      });

    return () => {
      cancelled = true;
    };
  }, [request]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = Number(weightInput);
    if (!Number.isFinite(weight) || weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
      setFormError(`Enter a weight between ${MIN_WEIGHT_KG} and ${MAX_WEIGHT_KG} kg.`);
      return;
    }
    setFormError("");
    setProductFilter(
      SHIPMENT_TYPES.find((t) => t.value === shipmentType)?.productCode === "DOX" ? "DOX" : "ALL"
    );
    setRequest((prev) => ({ code: destinationCode, weight, attempt: (prev?.attempt ?? 0) + 1 }));
  };

  const retry = () =>
    setRequest((prev) => (prev ? { ...prev, attempt: prev.attempt + 1 } : prev));

  // Memoised so it is referentially stable for the filter memo below.
  const allQuotes = useMemo(() => result?.quotes ?? [], [result]);

  // A filter must never manufacture an empty result: if the chosen product has
  // no rates on this lane, fall back to showing everything and say so.
  const { visibleQuotes, fellBack } = useMemo(() => {
    if (productFilter === "ALL") return { visibleQuotes: allQuotes, fellBack: false };
    const matching = allQuotes.filter((q) => q.productCode === productFilter);
    return matching.length > 0
      ? { visibleQuotes: matching, fellBack: false }
      : { visibleQuotes: allQuotes, fellBack: allQuotes.length > 0 };
  }, [allQuotes, productFilter]);

  const cheapestTotal = allQuotes[0]?.total ?? 0;
  const destinationName =
    COURIER_DESTINATION_NAMES[destinationCode] || result?.destinationName || destinationCode;

  const buildBooking = (q: CourierRateQuote): BookRateRequest => ({
    subject: `Courier Booking — ${q.carrier} to ${destinationName} (${
      result?.weightKg ?? weightInput
    } kg, ${formatMoney(q.total)})`,
    metadata: {
      // Original keys kept verbatim so anything already reading this metadata
      // in the CRM keeps working — estimated_cost now holds a real quote.
      destination_country: destinationName,
      weight_kg: result?.weightKg ?? Number(weightInput),
      parcel_type: shipmentType,
      estimated_cost: q.total,
      // The carrier the customer actually chose, and what it was quoted at.
      destination_code: destinationCode,
      carrier: q.carrier,
      carrier_code: q.carrierCode,
      service: q.service,
      product: q.product,
      product_code: q.productCode,
      quoted_total_inr: q.total,
      quoted_freight_inr: q.baseAmount,
      quoted_fuel_inr: q.fuel,
      quoted_other_charges_inr: q.otherCharges,
      quoted_tax_inr: q.tax,
      is_cheapest_option: q.id === result?.cheapestId,
      options_compared: allQuotes.length,
      quote_source: "united_express_getrate",
    },
  });

  const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider";

  return (
    // A light panel on the page's dark ground: amber-on-navy made the figures
    // hard to read, and the carrier logos are drawn for light backgrounds.
    // glass-ocean is deliberately not used here — it is unlayered CSS whose
    // 0.65-alpha navy no Tailwind bg-* class can override.
    <div className="bg-gradient-to-br from-white via-white to-amber-50 p-6 sm:p-8 lg:p-12 rounded-[32px] sm:rounded-[48px] border border-slate-200 shadow-[0_24px_80px_-20px_rgba(2,10,49,0.6)] relative">
      {/* Clipped here rather than on the card, so the country dropdown can
          still overflow the card's rounded edge. */}
      <div className="absolute inset-0 rounded-[32px] sm:rounded-[48px] overflow-hidden pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />
        <div className="absolute -top-28 -right-20 w-72 h-72 rounded-full bg-amber-200/50 blur-[110px]" />
        <div className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-orange-100/50 blur-[120px]" />
      </div>

      <div className="text-center max-w-2xl mx-auto mb-8 relative z-10">
        <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 border-0 text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
          Live Carrier Rates
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-serif font-black mt-3 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-700 bg-clip-text text-transparent leading-tight pb-1">
          Compare Real Courier Rates
        </h2>
        <div className="mx-auto mt-1 h-1 w-20 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
        <p className="text-slate-600 text-xs sm:text-sm mt-2">
          One search, every carrier. Live door-to-door pricing from DHL, FedEx, UPS and our
          express partners — GST included.
        </p>
      </div>

      <form onSubmit={submit} noValidate className="relative z-30">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1.2fr_auto] lg:items-end">
          <div className="flex flex-col gap-2">
            <label htmlFor="rate-destination" className={labelClass}>
              Destination Country
            </label>
            <CountrySelect
              id="rate-destination"
              value={destinationCode}
              onChange={setDestinationCode}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="rate-weight" className={labelClass}>
              Weight (kg)
            </label>
            <WeightInput id="rate-weight" value={weightInput} onChange={setWeightInput} />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="rate-type" className={labelClass}>
              Shipment Type
            </label>
            <ShipmentTypeSelect
              id="rate-type"
              value={shipmentType}
              onChange={setShipmentType}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full lg:w-auto bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold rounded-full px-8 h-12 shadow-lg shadow-orange-500/25 cursor-pointer disabled:opacity-70 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Fetching…
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Compare Rates
              </>
            )}
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-500 mr-1">Quick weight:</span>
          {WEIGHT_CHIPS.map((w) => {
            const active = Number(weightInput) === w;
            return (
              <button
                key={w}
                type="button"
                onClick={() => setWeightInput(String(w))}
                className={`h-7 px-2.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                  active
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 border-transparent shadow-sm"
                    : "border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400"
                }`}
              >
                {w} kg
              </button>
            );
          })}
        </div>

        {formError && (
          <p role="alert" className="mt-3 flex items-center gap-1.5 text-xs text-rose-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {formError}
          </p>
        )}
      </form>

      <div
        aria-live="polite"
        aria-busy={loading}
        className="mt-8 pt-8 relative z-10 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-slate-300 before:to-transparent"
      >
        {/* Idle — deliberately no price before the first search. */}
        {!request && !loading && (
          <div className="rounded-3xl bg-slate-50 border border-slate-200 p-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 text-center">
            <div className="flex items-center gap-2">
              {["DHL", "FDX", "UPS", "UXEX"].map((c) => (
                <CarrierLogo key={c} carrierCode={c} carrier={c} size="sm" />
              ))}
            </div>
            <p className="text-xs text-slate-600 max-w-sm">
              We compare DHL, FedEx, UPS and UXEX Express side by side. Pick a destination and
              hit <span className="text-amber-700 font-bold">Compare Rates</span>.
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            <p className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" />
              Comparing rates across carriers…
            </p>
            {[0, 1, 2].map((i) => (
              <RateCardSkeleton key={i} index={i} />
            ))}
          </div>
        )}

        {error && !loading && (
          <div
            role="alert"
            className="p-6 rounded-[28px] border border-rose-200 bg-rose-50 flex flex-wrap items-center gap-3 text-sm text-rose-700"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="flex-1">{error}</span>
            <Button
              onClick={retry}
              variant="outline"
              className="border-rose-300 text-rose-700 hover:bg-rose-100 rounded-full h-9 px-5 text-xs cursor-pointer"
            >
              Try again
            </Button>
          </div>
        )}

        {/* Lane exists but has no published rates — a sales moment, not an error. */}
        {result && !loading && allQuotes.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <Globe2 className="h-10 w-10 text-amber-600 mx-auto mb-3" />
            <h4 className="flex flex-wrap items-center justify-center gap-2 text-slate-900 font-serif font-black text-lg">
              No live rates published for
              <Flag code={destinationCode} className="h-[18px] w-6" />
              {destinationName}
            </h4>
            <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto">
              Many lanes are quoted manually by our Hyderabad desk. Send us the parcel details
              and we&apos;ll come back with a price — usually within the hour.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() =>
                  onBookRate({
                    subject: `Manual Rate Request — ${destinationName} (${result.weightKg} kg)`,
                    metadata: {
                      destination_country: destinationName,
                      destination_code: destinationCode,
                      weight_kg: result.weightKg,
                      parcel_type: shipmentType,
                      quote_source: "manual_request",
                    },
                  })
                }
                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold rounded-full h-11 px-6 text-sm cursor-pointer shadow-sm shadow-orange-500/25"
              >
                Request a Manual Quote <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <a
                href="tel:+919052703560"
                className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-bold"
              >
                <PhoneCall className="h-3.5 w-3.5" /> Talk to us
              </a>
            </div>
          </div>
        )}

        {result && !loading && allQuotes.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Flag code={destinationCode} />
                  {destinationName}
                </p>
                <p className="text-xs text-slate-500 tabular-nums">
                  {visibleQuotes.length} of {allQuotes.length} rates · {result.weightKg} kg ·
                  cheapest {formatMoney(cheapestTotal)}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {(["ALL", "SPX", "DOX"] as ProductFilter[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={productFilter === f}
                    onClick={() => setProductFilter(f)}
                    className={`h-7 px-3 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                      productFilter === f
                        ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 border-transparent shadow-sm"
                        : "border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400"
                    }`}
                  >
                    {f === "ALL" ? "All rates" : f === "SPX" ? "Parcel" : "Documents"}
                  </button>
                ))}
              </div>
            </div>

            {fellBack && (
              <p className="flex items-start gap-1.5 text-[11px] text-amber-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-px" />
                No {productFilter === "DOX" ? "document-only" : "parcel"} rates published for{" "}
                {destinationName} — showing all {allQuotes.length} available rates.
              </p>
            )}

            <div className="flex flex-col gap-4">
              {visibleQuotes.map((q) => {
                const isCheapest = q.id === result.cheapestId;
                const delta = q.total - cheapestTotal;
                const open = openId === q.id;
                return (
                  <div
                    key={q.id}
                    className={`relative rounded-3xl border p-4 sm:p-5 transition-all hover:-translate-y-0.5 ${
                      isCheapest
                        ? "border-amber-400 ring-1 ring-amber-300 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-[0_12px_38px_-10px_rgba(249,115,22,0.45)] pt-6 sm:pt-5"
                        : "border-slate-200 bg-white hover:border-amber-300 shadow-sm hover:shadow-md"
                    }`}
                  >
                    {isCheapest && (
                      <Badge className="absolute -top-2.5 left-5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 border-0 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg shadow-orange-500/30">
                        <BadgeCheck className="h-3 w-3 mr-1" />
                        BEST VALUE
                      </Badge>
                    )}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                      <CarrierLogo carrierCode={q.carrierCode} carrier={q.carrier} />

                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold text-slate-900 truncate">{q.carrier}</p>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          {q.service && <span className="truncate">{q.service}</span>}
                          <span aria-hidden>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {q.kind === "documents" ? "Documents" : "Parcel"}
                          </span>
                          {q.transitDays && (
                            <>
                              <span aria-hidden>·</span>
                              <span className="text-amber-700 font-semibold">{q.transitDays} days</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between gap-3 sm:flex-col sm:items-end sm:justify-center sm:text-right">
                        <p
                          className={`text-2xl sm:text-3xl font-sans font-black tracking-tight whitespace-nowrap tabular-nums ${
                            isCheapest
                              ? "bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"
                              : "text-slate-900"
                          }`}
                        >
                          {formatMoney(q.total)}
                        </p>
                        <div className="sm:mt-0.5">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400">
                            Incl. GST
                          </p>
                          {!isCheapest && delta > 0 && (
                            <p className="text-[11px] text-slate-500 tabular-nums">
                              +{formatMoney(delta)} vs cheapest
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : q.id)}
                        aria-expanded={open}
                        aria-controls={`breakdown-${q.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 uppercase tracking-wider hover:text-amber-800 cursor-pointer"
                      >
                        Cost breakdown
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </button>

                      <Button
                        onClick={() => onBookRate(buildBooking(q))}
                        className={`rounded-full h-10 px-5 text-xs font-bold shrink-0 cursor-pointer ${
                          isCheapest
                            ? "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-sm shadow-orange-500/25"
                            : "bg-white border border-amber-300 text-amber-700 hover:bg-amber-50"
                        }`}
                      >
                        Book this rate <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>

                    {/*
                      A grid-rows transition animates to the content's natural
                      height without measuring it. The ui/accordion primitive
                      would otherwise be the obvious choice, but it has no other
                      consumer in this repo and its content wrapper hard-binds
                      h-(--radix-accordion-content-height), which only resolves
                      during its own animation.
                    */}
                    <div
                      id={`breakdown-${q.id}`}
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        {/* Capped so the label and its amount stay visually paired; at the
                            card's full width they would sit far apart. */}
                        <dl className="grid grid-cols-[1fr_auto] gap-x-8 gap-y-2 text-xs pt-4 max-w-sm">
                          <BreakdownRow label="Base freight" value={q.baseAmount} />
                          {q.fuel > 0 && <BreakdownRow label="Fuel surcharge" value={q.fuel} />}
                          {q.otherCharges > 0 && (
                            <BreakdownRow label="Other charges" value={q.otherCharges} />
                          )}
                          <BreakdownRow label="Subtotal" value={q.subtotal} emphasis="subtotal" />
                          <BreakdownRow label="Tax (GST)" value={q.tax} />
                          <BreakdownRow label="Grand total" value={q.total} emphasis="total" />
                        </dl>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-3">
                          {q.effectiveFrom && <>Rates effective {q.effectiveFrom}. </>}
                          Indicative only — the final price depends on volumetric weight,
                          dimensions and customs duties at destination.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-400 text-center pt-2">
              Live rates from our carrier network · confirmed at pickup
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
