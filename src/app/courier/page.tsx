"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Search,
  Truck,
  Plane,
  ShieldCheck,
  HeartPulse,
  Apple,
  FileText,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  Calculator,
  Sparkles,
  PhoneCall,
  DollarSign,
  BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ScrollAnimate from "@/components/ui/ScrollAnimate";

export default function GlobalCourierPage() {
  const [awbQuery, setAwbQuery] = useState("");
  const [trackingResult, setTrackingResult] = useState<any | null>(null);

  // Rate calculator state
  const [destCountry, setDestCountry] = useState("USA");
  const [weightKg, setWeightKg] = useState("5");
  const [itemType, setItemType] = useState("medicine");
  const [estimatedCost, setEstimatedCost] = useState<number | null>(3450);

  const [heroIndex, setHeroIndex] = useState(0);
  const heroPhrases = [
    "Medicine & Doctor Prescription Shipping 💊",
    "Student Baggage Excess Weight Express 🧳",
    "Free Doorstep Pickup Across Hyderabad 🚚",
    "Vacuum-Sealed Homemade Foods & Sweets 🍲",
    "190+ Overseas Countries Customs Cleared ✈️"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroPhrases.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const mockTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awbQuery) return;

    if (awbQuery.toUpperCase() === "OTS-12345") {
      setTrackingResult({
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
      setTrackingResult({
        awb: awbQuery.toUpperCase(),
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

  const calculateRates = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(weightKg) || 1;
    let baseRate = 850; // per kg

    if (destCountry === "USA") baseRate = 950;
    if (destCountry === "UK") baseRate = 780;
    if (destCountry === "Canada") baseRate = 920;
    if (destCountry === "Australia") baseRate = 1050;

    if (itemType === "medicine") baseRate += 200;
    if (itemType === "food") baseRate += 150;

    setEstimatedCost(Math.round(weight * baseRate));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* ========================================================================= */}
      {/* FULL-WIDTH COURIER HERO SECTION WITH ANIME ENTRANCE & ROTATING BEACON */}
      {/* ========================================================================= */}
      <ScrollAnimate delay={0}>
        <section className="relative w-full gradient-ocean-hero border-b border-amber-900/40 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-1000 ease-out">
          
          {/* Animated Ambient Lighting Orbs */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-amber-500/15 blur-[160px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full bg-yellow-500/10 blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: "6s" }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:pt-20 md:pb-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Left Column: Text & AWB Fast Tracker */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              <div className="inline-flex items-center gap-2 bg-amber-950/80 border border-amber-400/30 text-amber-300 text-xs px-4 py-1.5 rounded-full backdrop-blur-md w-fit shadow-lg">
                <Sparkles className="h-4 w-4 text-amber-300 animate-spin" style={{ animationDuration: "8s" }} />
                <span className="font-bold uppercase tracking-wider text-[11px]">
                  Worldwide Door-to-Door Courier Engine
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl text-white leading-tight">
                  Express International <br />
                  <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    Courier & Logistics
                  </span>
                </h1>

                {/* Animated Typewriter Phrase Banner */}
                <div className="min-h-[42px] flex items-center pt-1">
                  <div key={heroIndex} className="bg-amber-950/70 border border-amber-400/30 px-3.5 py-1.5 rounded-full backdrop-blur-md text-amber-300 font-bold text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-2 duration-500 flex items-center gap-2.5 shadow-md max-w-full">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
                    </span>
                    <span className="truncate">{heroPhrases[heroIndex]}</span>
                  </div>
                </div>
              </div>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
                Doorstep pickup in Hyderabad ➔ Express customs clearance ➔ Overseas doorstep delivery across 190+ countries. Specialized in doctor-prescription medicine shipping, student baggage, and vacuum-sealed food parcels.
              </p>

              {/* Quick Live AWB Tracking Bar */}
              <form onSubmit={mockTrack} className="glass-ocean p-3 rounded-full border-2 border-amber-400/40 shadow-2xl flex items-center gap-2 max-w-xl">
                <Search className="h-5 w-5 text-amber-400 ml-3 shrink-0" />
                <Input
                  placeholder="Enter AWB Number (Try: OTS-12345 or OTS-67890)"
                  value={awbQuery}
                  onChange={(e) => setAwbQuery(e.target.value)}
                  className="bg-transparent border-none text-white placeholder:text-slate-400 focus-visible:ring-0 text-sm"
                />
                <Button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full px-6 h-11 shrink-0 shadow-lg cursor-pointer">
                  Track AWB
                </Button>
              </form>

              <div className="flex items-center gap-4 text-xs text-slate-400 pl-4">
                <span>Quick Demos:</span>
                <button type="button" onClick={() => { setAwbQuery("OTS-12345"); setTrackingResult(null); }} className="text-amber-400 hover:underline">
                  OTS-12345 (UK)
                </button>
                <span>•</span>
                <button type="button" onClick={() => { setAwbQuery("OTS-67890"); setTrackingResult(null); }} className="text-amber-400 hover:underline">
                  OTS-67890 (USA)
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-amber-900/40 grid grid-cols-3 gap-4 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
                  <span>100% Customs Cleared</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-amber-400 shrink-0" />
                  <span>Free Hyderabad Pickups</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-amber-400 shrink-0" />
                  <span>190+ Global Express Hubs</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Cargo Image with Anime Floating Cards */}
            <div className="lg:col-span-5 flex justify-center relative">
              
              {/* Anime Floating Badge 1 (Top Right) */}
              <div className="absolute -top-4 -right-2 sm:right-2 z-20 animate-float-slow bg-slate-950/90 backdrop-blur-md border border-amber-400/40 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-lg">
                  📦
                </div>
                <div>
                  <p className="text-xs font-black text-white">190+ Express Hubs</p>
                  <p className="text-[10px] text-slate-400">FedEx, DHL & Aramex Partner</p>
                </div>
              </div>

              {/* Anime Floating Badge 2 (Bottom Left) */}
              <div className="absolute -bottom-4 -left-2 sm:left-2 z-20 animate-float-reverse bg-slate-950/90 backdrop-blur-md border border-yellow-400/40 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-lg">
                  ⚡
                </div>
                <div>
                  <p className="text-xs font-black text-white">24-72 Hours Delivery</p>
                  <p className="text-[10px] text-slate-300">USA, UK, Gulf & Australia</p>
                </div>
              </div>

              {/* Main Cargo Image Container */}
              <div className="relative w-full max-w-md h-96 sm:h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-amber-500/20 group">
                <Image
                  src="/global-courier.png"
                  alt="Global Express Courier Services"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 bg-slate-950/85 backdrop-blur-md p-4 rounded-2xl text-center shadow-xl border border-amber-400/30">
                  <span className="text-sm font-extrabold text-amber-300 block mb-0.5">
                    ✈️ 190+ Global Express Channels
                  </span>
                  <span className="text-xs text-slate-300">Customs Clearance & Free Doorstep Pickup</span>
                </div>
              </div>

            </div>

          </div>
        </section>
      </ScrollAnimate>

      {/* ========================================================================= */}
      {/* LIVE AWB TRACKING RESULT MODAL/CARD */}
      {/* ========================================================================= */}
      {trackingResult && (
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="glass-ocean p-8 rounded-[36px] border-2 border-amber-400/50 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex flex-wrap justify-between items-center gap-4 pb-6 border-b border-amber-900/40">
              <div>
                <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">Consignment Number</span>
                <h3 className="text-2xl font-black text-white">{trackingResult.awb}</h3>
              </div>
              <Badge className="bg-amber-500 text-slate-950 font-bold text-sm px-4 py-1.5 rounded-full">
                {trackingResult.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-amber-900/40 text-xs">
              <div>
                <span className="text-slate-400">Origin:</span>
                <p className="font-bold text-white text-sm">{trackingResult.origin}</p>
              </div>
              <div>
                <span className="text-slate-400">Destination:</span>
                <p className="font-bold text-white text-sm">{trackingResult.destination}</p>
              </div>
              <div>
                <span className="text-slate-400">Estimated Delivery:</span>
                <p className="font-bold text-amber-300 text-sm">{trackingResult.eta}</p>
              </div>
            </div>

            <div className="pt-6">
              <h4 className="font-bold text-sm text-white mb-4">Milestone Timeline</h4>
              <div className="flex flex-col gap-3">
                {trackingResult.timeline.map((step: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <CheckCircle2 className={`h-5 w-5 ${step.done ? "text-amber-400" : "text-slate-600"}`} />
                    <span className={step.done ? "text-white font-medium" : "text-slate-500"}>{step.status}</span>
                    <span className="ml-auto text-slate-400">{step.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SHIPPING RATE CALCULATOR (GLASS MORPHISM CARD) */}
      {/* ========================================================================= */}
      <ScrollAnimate>
        <section id="estimator" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="glass-ocean p-8 sm:p-12 rounded-[48px] border-2 border-amber-500/30 shadow-2xl relative overflow-hidden">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
              Instant Rate Estimator
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-white mt-3">
              Calculate Shipping Costs
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2">
              Select destination and consignment weight to get instant door-to-door courier rates.
            </p>
          </div>

          <form onSubmit={calculateRates} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider">Destination Country</label>
              <select
                value={destCountry}
                onChange={(e) => setDestCountry(e.target.value)}
                className="bg-slate-900 border border-amber-800/80 text-white rounded-2xl h-12 px-4 text-sm focus:border-amber-400"
              >
                <option value="USA">United States (USA)</option>
                <option value="UK">United Kingdom (UK)</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="UAE">UAE / Dubai</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider">Weight (kg)</label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="bg-slate-900 border border-amber-800/80 text-white rounded-2xl h-12 text-sm focus:border-amber-400"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider">Parcel Type</label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="bg-slate-900 border border-amber-800/80 text-white rounded-2xl h-12 px-4 text-sm focus:border-amber-400"
              >
                <option value="medicine">Prescription Medicine</option>
                <option value="baggage">Student Baggage</option>
                <option value="food">Vacuum Packed Foods</option>
                <option value="general">General Documents / Parcel</option>
              </select>
            </div>
          </form>

          {estimatedCost && (
            <div className="mt-8 pt-8 border-t border-amber-900/40 flex flex-wrap justify-between items-center gap-4 bg-slate-900/60 p-6 rounded-3xl">
              <div>
                <span className="text-xs text-slate-400 font-medium">Estimated Door-to-Door Price:</span>
                <h3 className="text-3xl font-serif font-black text-amber-400">
                  ₹{estimatedCost.toLocaleString()} <span className="text-xs font-sans text-slate-300">(All Inclusive)</span>
                </h3>
              </div>
              <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full px-8 h-12 cursor-pointer shadow-lg">
                <Link href="/contact?service=courier">Book Pickup Now <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>
          )}

        </div>
      </section>
      </ScrollAnimate>

      {/* ========================================================================= */}
      {/* SPECIALIZED SHIPPING CHANNELS (CURVED ORGANIC CARDS) */}
      {/* ========================================================================= */}
      <ScrollAnimate delay={100}>
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
            Specialized Express Channels
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-white mt-3">
            Tailored Logistics for Every Need
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-ocean p-8 rounded-[36px] border border-amber-500/20 flex flex-col justify-between hover:border-amber-400/60 transition-all hover:-translate-y-1">
            <div>
              <HeartPulse className="h-10 w-10 text-amber-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Prescription Medicine Express</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Specialized channel for doctor-prescribed medicines, Ayurvedic formulations, and health supplements with complete customs declaration and temperature compliance.
              </p>
              <ul className="flex flex-col gap-2 text-xs text-amber-200">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Doctor Prescription Approval</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Original Pharmacy Invoice Packing</li>
              </ul>
            </div>
            <Button asChild variant="outline" className="mt-6 border-amber-400/30 text-amber-300 hover:bg-amber-900 rounded-full font-bold">
              <Link href="/contact?type=medicine">Ship Medicine</Link>
            </Button>
          </div>

          <div className="glass-ocean p-8 rounded-[36px] border border-amber-500/20 flex flex-col justify-between hover:border-amber-400/60 transition-all hover:-translate-y-1">
            <div>
              <Truck className="h-10 w-10 text-amber-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Student Excess Baggage</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Subsidized student rates for overseas University dorm moves. Send clothes, books, and study essentials at up to 50% lower cost than airport excess baggage.
              </p>
              <ul className="flex flex-col gap-2 text-xs text-amber-200">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Free Doorstep Packing Boxes</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Direct Dorm / Apartment Handover</li>
              </ul>
            </div>
            <Button asChild variant="outline" className="mt-6 border-amber-400/30 text-amber-300 hover:bg-amber-900 rounded-full font-bold">
              <Link href="/contact?type=baggage">Ship Baggage</Link>
            </Button>
          </div>

          <div className="glass-ocean p-8 rounded-[36px] border border-amber-500/20 flex flex-col justify-between hover:border-amber-400/60 transition-all hover:-translate-y-1">
            <div>
              <Apple className="h-10 w-10 text-amber-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Vacuum Sealed Foods & Sweets</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Send homemade pickles, sweets, spices, and snacks packed in commercial food-grade vacuum sealing to retain freshness across international transit.
              </p>
              <ul className="flex flex-col gap-2 text-xs text-amber-200">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Commercial Vacuum Sealing Service</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400" /> International Customs Clearance</li>
              </ul>
            </div>
            <Button asChild variant="outline" className="mt-6 border-amber-400/30 text-amber-300 hover:bg-amber-900 rounded-full font-bold">
              <Link href="/contact?type=food">Ship Homemade Foods</Link>
            </Button>
          </div>

        </div>
      </section>
      </ScrollAnimate>

    </div>
  );
}
