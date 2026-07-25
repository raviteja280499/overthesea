"use client";

import { useState } from "react";
import { Search, Package, CheckCircle2, Clock, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function TrackingPage() {
  const [awb, setAwb] = useState("");
  const [result, setResult] = useState<any | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awb) return;

    if (awb.toUpperCase() === "OTS-12345") {
      setResult({
        awb: "OTS-12345",
        status: "Out for Delivery",
        origin: "Hyderabad, India",
        destination: "London, UK",
        eta: "Today by 6:00 PM",
        timeline: [
          { status: "Shipment Picked Up - Begumpet Hub", time: "Jul 22, 10:30 AM", done: true },
          { status: "Customs Cleared - RGI Airport", time: "Jul 23, 04:15 PM", done: true },
          { status: "In Transit - Heathrow Hub", time: "Jul 24, 09:00 AM", done: true },
          { status: "Out for Delivery - London Depot", time: "Jul 25, 08:30 AM", done: true }
        ]
      });
    } else {
      setResult({
        awb: awb.toUpperCase(),
        status: "In Transit",
        origin: "Hyderabad, India",
        destination: "Dallas, Texas, USA",
        eta: "Jul 27, 2026",
        timeline: [
          { status: "Shipment Picked Up - Hyderabad", time: "Jul 24, 11:00 AM", done: true },
          { status: "Customs Clearance In Progress", time: "Jul 25, 02:00 PM", done: true },
          { status: "Departed International Hub", time: "Pending", done: false }
        ]
      });
    }
  };

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

      <form onSubmit={handleTrack} className="glass-ocean p-4 rounded-full border-2 border-amber-400/40 shadow-2xl flex items-center gap-2">
        <Search className="h-5 w-5 text-amber-400 ml-3 shrink-0" />
        <Input
          placeholder="Enter AWB Number (e.g. OTS-12345 or OTS-67890)"
          value={awb}
          onChange={(e) => setAwb(e.target.value)}
          className="bg-transparent border-none text-white placeholder:text-slate-400 focus-visible:ring-0 text-sm"
        />
        <Button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full px-8 h-12 shrink-0 shadow-lg cursor-pointer">
          Track Status
        </Button>
      </form>

      {result && (
        <div className="glass-ocean p-8 rounded-[36px] border-2 border-amber-400/50 shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="flex flex-wrap justify-between items-center gap-4 pb-6 border-b border-amber-900/40">
            <div>
              <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">Consignment Number</span>
              <h3 className="text-2xl font-black text-white">{result.awb}</h3>
            </div>
            <Badge className="bg-amber-500 text-slate-950 font-bold text-sm px-4 py-1.5 rounded-full">
              {result.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-amber-900/40 text-xs">
            <div>
              <span className="text-slate-400">Origin:</span>
              <p className="font-bold text-white text-sm">{result.origin}</p>
            </div>
            <div>
              <span className="text-slate-400">Destination:</span>
              <p className="font-bold text-white text-sm">{result.destination}</p>
            </div>
            <div>
              <span className="text-slate-400">Estimated Delivery:</span>
              <p className="font-bold text-amber-300 text-sm">{result.eta}</p>
            </div>
          </div>

          <div className="pt-6">
            <h4 className="font-bold text-sm text-white mb-4">Milestone Timeline</h4>
            <div className="flex flex-col gap-3">
              {result.timeline.map((step: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <CheckCircle2 className={`h-5 w-5 ${step.done ? "text-amber-400" : "text-slate-600"}`} />
                  <span className={step.done ? "text-white font-medium" : "text-slate-500"}>{step.status}</span>
                  <span className="ml-auto text-slate-400">{step.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
