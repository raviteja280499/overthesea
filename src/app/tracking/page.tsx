"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Package, CheckCircle2, MapPin, ArrowRight, Loader2, AlertCircle, Truck, Scale, User, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrackingResult } from "@/lib/types/tracking";

const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

function TrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const awbParam = searchParams.get("awb") || "";

  const [awb, setAwb] = useState(awbParam);
  // Bumped to re-track the AWB already in the URL.
  const [attempt, setAttempt] = useState(0);
  const [outcome, setOutcome] = useState<{ key: string; result?: TrackingResult; error?: string } | null>(null);

  const requestKey = `${awbParam}#${attempt}`;
  const loading = !!awbParam && outcome?.key !== requestKey;
  const result = !loading ? outcome?.result ?? null : null;
  const error = !loading ? outcome?.error ?? null : null;

  useEffect(() => {
    if (!awbParam) return;
    let cancelled = false;
    fetch(`/api/tracking?awb=${encodeURIComponent(awbParam)}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        setOutcome(
          json.success
            ? { key: requestKey, result: json.data }
            : { key: requestKey, error: json.error || "Unable to track this shipment." }
        );
      })
      .catch(() => {
        if (!cancelled) setOutcome({ key: requestKey, error: "Network error. Please check your connection and try again." });
      });
    return () => {
      cancelled = true;
    };
  }, [awbParam, requestKey]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const number = awb.trim();
    if (!number) return;
    if (number === awbParam) {
      setAttempt((n) => n + 1);
    } else {
      router.replace(`/tracking?awb=${encodeURIComponent(number)}`, { scroll: false });
    }
  };

  const delivered = !!result?.deliveredOn;

  return (
    <>
      <form onSubmit={handleTrack} className="glass-ocean p-4 rounded-full border-2 border-amber-400/40 shadow-2xl flex items-center gap-2">
        <Search className="h-5 w-5 text-amber-400 ml-3 shrink-0" />
        <Input
          placeholder="Enter AWB Number"
          value={awb}
          onChange={(e) => setAwb(e.target.value)}
          className="bg-transparent border-none text-white placeholder:text-slate-400 focus-visible:ring-0 text-sm"
        />
        <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full px-8 h-12 shrink-0 shadow-lg cursor-pointer">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track Status"}
        </Button>
      </form>

      {error && (
        <div className="glass-ocean p-6 rounded-[28px] border-2 border-red-400/40 flex items-center gap-3 text-sm text-red-200 animate-in fade-in duration-300">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="glass-ocean p-6 sm:p-8 rounded-[36px] border-2 border-amber-400/50 shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="flex flex-wrap justify-between items-center gap-4 pb-6 border-b border-amber-900/40">
            <div>
              <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">Consignment Number</span>
              <h3 className="text-2xl font-black text-white">{result.awb}</h3>
            </div>
            <Badge className={`${delivered ? "bg-emerald-500" : "bg-amber-500"} text-slate-950 font-bold text-sm px-4 py-1.5 rounded-full whitespace-normal text-center`}>
              {result.status ? titleCase(result.status) : "Booked"}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 py-6 border-b border-amber-900/40">
            <div className="flex-1 min-w-[140px]">
              <span className="text-xs text-slate-400">Origin</span>
              <p className="font-bold text-white text-sm">{titleCase(result.origin)}</p>
              {result.originCountry && <p className="text-xs text-slate-400">{titleCase(result.originCountry)}</p>}
            </div>
            <ArrowRight className="h-5 w-5 text-amber-400 shrink-0" />
            <div className="flex-1 min-w-[140px] text-right">
              <span className="text-xs text-slate-400">Destination</span>
              <p className="font-bold text-white text-sm">{titleCase(result.destination)}</p>
              {result.destinationCountry && <p className="text-xs text-slate-400">{titleCase(result.destinationCountry)}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-b border-amber-900/40 text-xs">
            {result.bookedOn && (
              <Detail icon={CalendarDays} label="Booked On" value={result.bookedOn} />
            )}
            {(result.deliveredOn || result.expectedDelivery) && (
              <Detail
                icon={CheckCircle2}
                label={delivered ? "Delivered On" : "Expected Delivery"}
                value={result.deliveredOn || result.expectedDelivery}
                highlight
              />
            )}
            {(result.service || result.carrier) && (
              <Detail
                icon={Truck}
                label="Service"
                value={[result.service, result.carrierAwb && `${result.carrier} AWB: ${result.carrierAwb}`].filter(Boolean).join(" · ")}
              />
            )}
            {result.weight && <Detail icon={Scale} label="Weight" value={`${parseFloat(result.weight)} kg`} />}
            {result.consignee && <Detail icon={User} label="Consignee" value={titleCase(result.consignee)} />}
            {result.receiverName && <Detail icon={Package} label="Received By" value={result.receiverName} />}
          </div>

          <div className="pt-6">
            <h4 className="font-bold text-sm text-white mb-4">Shipment Timeline</h4>
            {result.events.length === 0 ? (
              <p className="text-xs text-slate-400">No tracking events yet.</p>
            ) : (
              <ol className="relative flex flex-col gap-5 border-l border-amber-900/50 ml-2.5">
                {result.events.map((ev, idx) => (
                  <li key={idx} className="pl-6 relative">
                    <span
                      className={`absolute -left-[9px] top-0.5 h-4 w-4 rounded-full border-2 ${
                        idx === 0 ? "bg-amber-400 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.7)]" : "bg-slate-800 border-amber-700"
                      }`}
                    />
                    <p className={`text-sm ${idx === 0 ? "text-white font-bold" : "text-slate-200 font-medium"}`}>{titleCase(ev.status)}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                      <span>{ev.date}{ev.time && `, ${ev.time}`}</span>
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-amber-400" /> {titleCase(ev.location)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
      <div>
        <span className="text-slate-400">{label}</span>
        <p className={`font-bold text-sm ${highlight ? "text-amber-300" : "text-white"}`}>{value}</p>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col gap-10">
      <div className="text-center flex flex-col gap-3">
        <Badge className="w-fit self-center bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs px-4 py-1.5 font-bold rounded-full uppercase tracking-wider">
          Consignment Tracking Engine
        </Badge>
        <h1 className="font-serif font-black text-3xl sm:text-5xl text-white">
          Track Your AWB Shipment
        </h1>
        <p className="text-slate-400 text-sm sm:text-base font-light">
          Real-time consignment status tracking across worldwide logistics channels.
        </p>
      </div>

      <Suspense fallback={<div className="glass-ocean h-20 rounded-full border-2 border-amber-400/40" />}>
        <TrackingContent />
      </Suspense>
    </div>
  );
}
