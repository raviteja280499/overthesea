"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  Plane,
  ShieldCheck,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Send,
  MapPin,
  HelpCircle,
  PhoneCall,
  Globe,
  Award,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import canvasConfetti from "canvas-confetti";
import ScrollAnimate from "@/components/ui/ScrollAnimate";

// Vector SVG Flag Badges for Tourism Destinations
const TourismFlagSVG = ({ code }: { code: string }) => {
  switch (code) {
    case "TH": // Thailand
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#a51931" d="M0 0h640v480H0z"/>
          <path fill="#f4f5f8" d="M0 80h640v320H0z"/>
          <path fill="#2d2a4a" d="M0 160h640v160H0z"/>
        </svg>
      );
    case "KH": // Cambodia
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#032ea1" d="M0 0h640v480H0z"/>
          <path fill="#e00025" d="M0 120h640v240H0z"/>
          <path fill="#fff" d="M320 180l-20 40h40zm-40 40h80v20h-80z"/>
        </svg>
      );
    case "LA": // Laos
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#ce1126" d="M0 0h640v480H0z"/>
          <path fill="#002b7f" d="M0 120h640v240H0z"/>
          <circle cx="320" cy="240" r="80" fill="#fff"/>
        </svg>
      );
    case "PH": // Philippines
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#0038a8" d="M0 0h640v240H0z"/>
          <path fill="#ce1126" d="M0 240h640v240H0z"/>
          <path fill="#fff" d="M0 0l280 240L0 480z"/>
          <circle cx="90" cy="240" r="30" fill="#fcd116"/>
        </svg>
      );
    case "VN": // Vietnam
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#da251d" d="M0 0h640v480H0z"/>
          <path fill="#ff0" d="M320 140l24 72h76l-60 44 23 72-63-45-63 45 23-72-60-44h76z"/>
        </svg>
      );
    case "JP": // Japan
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#fff" d="M0 0h640v480H0z"/>
          <circle cx="320" cy="240" r="144" fill="#bc002d"/>
        </svg>
      );
    case "LK": // Sri Lanka
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#ffbe29" d="M0 0h640v480H0z"/>
          <path fill="#8d1538" d="M180 30h430v420H180z"/>
          <path fill="#eb7400" d="M30 30h60v420H30z"/>
          <path fill="#007f50" d="M100 30h60v420h-60z"/>
        </svg>
      );
    case "NP": // Nepal
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#dc143c" d="M0 0l240 200H0zm0 200l280 280H0z"/>
          <path fill="#fff" d="M60 100a30 30 0 0060 0zM70 360l20-30 20 30z"/>
        </svg>
      );
    case "AE": // Dubai UAE
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#00732f" d="M0 0h640v160H0z"/>
          <path fill="#fff" d="M0 160h640v160H0z"/>
          <path fill="#000" d="M0 320h640v160H0z"/>
          <path fill="#ff0000" d="M0 0h160v480H0z"/>
        </svg>
      );
    case "MY": // Malaysia
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#cc0000" d="M0 0h640v480H0z"/>
          <path stroke="#fff" strokeWidth="34" d="M0 34h640M0 102h640M0 170h640M0 238h640M0 306h640M0 374h640M0 442h640"/>
          <path fill="#000066" d="M0 0h320v272H0z"/>
          <circle cx="130" cy="136" r="70" fill="#ffcc00"/>
          <circle cx="150" cy="136" r="60" fill="#000066"/>
        </svg>
      );
    case "BT": // Bhutan
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#ff4e00" d="M0 480L640 0V480H0z"/>
          <path fill="#ffd100" d="M0 0h640L0 480V0z"/>
        </svg>
      );
    case "CH": // Switzerland
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#d52b1e" d="M0 0h640v480H0z"/>
          <path fill="#fff" d="M270 110h100v260H270zM190 190h260v100H190z"/>
        </svg>
      );
    default:
      return null;
  }
};

const tourismDestinations = [
  {
    country: "Bangkok & Thailand",
    code: "TH",
    image: "/tourism/thailand.png",
    visaType: "Free Visa on Arrival / e-Visa (60 Days)",
    processingTime: "24 - 48 Hours",
    fee: "Free VoA / ₹2,100 e-Visa",
    requirements: ["Passport (6-month validity)", "Confirmed flight ticket", "Hotel voucher", "20,000 THB funds proof"],
    popularAttractions: "Grand Palace Bangkok, Wat Arun, Floating Markets, Phuket, Phi Phi Islands",
    description: "Vibrant capital & tropical paradise famous for ornate golden temples, bustling night street markets, Chao Phraya river cruises, and island beach resorts.",
    cardGradient: "bg-gradient-to-br from-emerald-950/90 via-teal-950/60 to-slate-950",
    accentText: "text-emerald-300",
    badgeBg: "bg-emerald-950/90 border border-emerald-400/30 text-emerald-300",
    btnStyle: "bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-400/30"
  },
  {
    country: "Dubai (UAE)",
    code: "AE",
    image: "/tourism/hero.png",
    visaType: "14 / 30 / 60 Days Express Tourist e-Visa",
    processingTime: "24 - 72 Hours",
    fee: "₹6,800 (30 Days)",
    requirements: ["Passport front & back scan", "Passport size photo", "PAN card copy", "Hotel or host details"],
    popularAttractions: "Burj Khalifa, Dubai Mall, Desert Safari, Palm Jumeirah, Museum of the Future",
    description: "Ultra-modern luxury metropolis featuring iconic skyscrapers, desert safari adventures, and world-class shopping festivals.",
    cardGradient: "bg-gradient-to-br from-amber-950/90 via-orange-950/60 to-slate-950",
    accentText: "text-amber-300",
    badgeBg: "bg-amber-950/90 border border-amber-400/30 text-amber-300",
    btnStyle: "bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-400/30"
  },
  {
    country: "Japan",
    code: "JP",
    image: "/tourism/japan.png",
    visaType: "Single & Multiple Entry Tourist eVisa",
    processingTime: "5 - 7 Business Days",
    fee: "₹3,500 + VFS Fee",
    requirements: ["Passport", "ITR (3 Years)", "Bank Statement (6 Months)", "Schedule of Stay Itinerary"],
    popularAttractions: "Mount Fuji, Kyoto Fushimi Inari, Tokyo Shibuya, Osaka Castle, Cherry Blossoms",
    description: "Land of the rising sun combining ancient shrines, bullet trains, neon Tokyo skylines, and world-renowned gastronomy.",
    cardGradient: "bg-gradient-to-br from-red-950/90 via-slate-900 to-slate-950",
    accentText: "text-red-300",
    badgeBg: "bg-red-950/90 border border-red-400/30 text-red-300",
    btnStyle: "bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-slate-950 border border-red-400/30"
  },
  {
    country: "Vietnam",
    code: "VN",
    image: "/tourism/cambodia.png",
    visaType: "90-Day Single & Multiple Entry e-Visa",
    processingTime: "3 - 5 Business Days",
    fee: "₹2,400 e-Visa Fee",
    requirements: ["Passport scan", "Digital portrait photo", "Travel dates & hotel voucher"],
    popularAttractions: "Ha Long Bay, Hoi An Ancient Town, Da Nang Golden Bridge, Hanoi Old Quarter",
    description: "Emerald limestone bays, historic French colonial streets, lush rice terraces, and captivating coffee culture.",
    cardGradient: "bg-gradient-to-br from-rose-950/90 via-red-950/60 to-slate-950",
    accentText: "text-rose-300",
    badgeBg: "bg-rose-950/90 border border-rose-400/30 text-rose-300",
    btnStyle: "bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-slate-950 border border-rose-400/30"
  },
  {
    country: "Cambodia",
    code: "KH",
    image: "/tourism/cambodia.png",
    visaType: "30-Day Official Tourist e-Visa / VoA",
    processingTime: "3 Business Days",
    fee: "₹2,900 ($36 USD)",
    requirements: ["Passport", "Digital photo", "Credit card / online fee", "Return flight ticket"],
    popularAttractions: "Angkor Wat Temple Complex, Bayon Stone Smiles, Phnom Penh Palace, Tonle Sap",
    description: "Home to the magnificent 12th-century Angkor Wat temple complex, ancient Khmer heritage, and warm hospitality.",
    cardGradient: "bg-gradient-to-br from-sky-950/90 via-blue-950/60 to-slate-950",
    accentText: "text-sky-300",
    badgeBg: "bg-sky-950/90 border border-sky-400/30 text-sky-300",
    btnStyle: "bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-400/30"
  },
  {
    country: "Malaysia",
    code: "MY",
    image: "/tourism/thailand.png",
    visaType: "Visa-Free Entry (MDAC Online Registration)",
    processingTime: "Instant Online MDAC",
    fee: "Free Entry",
    requirements: ["Passport valid 6 months", "MDAC Arrival Card", "Return flight ticket", "Hotel voucher"],
    popularAttractions: "Petronas Twin Towers, Batu Caves, Langkawi Island Cable Car, Penang Food Street",
    description: "Diverse multicultural hub with iconic skyscraper architecture, tropical rainforests, and island beach resorts.",
    cardGradient: "bg-gradient-to-br from-yellow-950/90 via-amber-950/60 to-slate-950",
    accentText: "text-yellow-300",
    badgeBg: "bg-yellow-950/90 border border-yellow-400/30 text-yellow-300",
    btnStyle: "bg-yellow-500/20 hover:bg-yellow-500 text-yellow-300 hover:text-slate-950 border border-yellow-400/30"
  },
  {
    country: "Laos",
    code: "LA",
    image: "/tourism/laos.png",
    visaType: "30-Day Tourist eVisa / Visa on Arrival",
    processingTime: "3 Business Days",
    fee: "₹3,200 ($50 USD)",
    requirements: ["Passport copy", "Passport photo", "Flight itinerary", "Hotel reservation"],
    popularAttractions: "Luang Prabang Waterfalls, Vang Vieng Karst Hills, Vientiane That Luang Stupa",
    description: "Tranquil landlocked jewel in Southeast Asia famous for misty waterfalls, French-Lao heritage, and Buddhist spirituality.",
    cardGradient: "bg-gradient-to-br from-cyan-950/90 via-teal-950/60 to-slate-950",
    accentText: "text-cyan-300",
    badgeBg: "bg-cyan-950/90 border border-cyan-400/30 text-cyan-300",
    btnStyle: "bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-400/30"
  },
  {
    country: "Philippines",
    code: "PH",
    image: "/tourism/thailand.png",
    visaType: "9a Tourist Visa (Sticker / e-Visa)",
    processingTime: "7 - 10 Business Days",
    fee: "₹3,800 + Processing",
    requirements: ["Passport", "Bank statement (₹1 Lakh balance)", "ITR 3 years", "Employment proof"],
    popularAttractions: "El Nido Palawan Lagoons, Boracay White Beach, Chocolate Hills Bohol, Cebu Diving",
    description: "Archipelago of over 7,000 tropical islands featuring world-class turquoise lagoons, coral reefs, and white sand beaches.",
    cardGradient: "bg-gradient-to-br from-indigo-950/90 via-blue-950/60 to-slate-950",
    accentText: "text-indigo-300",
    badgeBg: "bg-indigo-950/90 border border-indigo-400/30 text-indigo-300",
    btnStyle: "bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-slate-950 border border-indigo-400/30"
  },
  {
    country: "Sri Lanka",
    code: "LK",
    image: "/tourism/laos.png",
    visaType: "Free Tourist eTA (Electronic Travel Authorization)",
    processingTime: "Instant / 24 Hours",
    fee: "Free Entry eTA",
    requirements: ["Passport copy", "Return ticket", "Hotel booking", "Sufficient funds ($30/day)"],
    popularAttractions: "Sigiriya Lion Rock, Ella Nine Arches Bridge, Kandy Tooth Relic Temple, Galle Fort",
    description: "Teardrop island of Asia filled with ancient rock fortresses, tea plantations, wild elephant safaris, and coastal beaches.",
    cardGradient: "bg-gradient-to-br from-orange-950/90 via-amber-950/60 to-slate-950",
    accentText: "text-orange-300",
    badgeBg: "bg-orange-950/90 border border-orange-400/30 text-orange-300",
    btnStyle: "bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-slate-950 border border-orange-400/30"
  },
  {
    country: "Nepal",
    code: "NP",
    image: "/tourism/hero.png",
    visaType: "Visa-Free Entry for Indian Passport / Voter ID",
    processingTime: "Instant at Airport / Border",
    fee: "Free Entry",
    requirements: ["Valid Indian Passport OR Election Voter ID Card", "Passport photos"],
    popularAttractions: "Kathmandu Durbar Square, Pokhara Phewa Lake, Everest Base Camp Trek, Lumbini",
    description: "Himalayan kingdom offering world-famous trekking routes, sacred temples, Mount Everest vistas, and serene lakes.",
    cardGradient: "bg-gradient-to-br from-purple-950/90 via-indigo-950/60 to-slate-950",
    accentText: "text-purple-300",
    badgeBg: "bg-purple-950/90 border border-purple-400/30 text-purple-300",
    btnStyle: "bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-slate-950 border border-purple-400/30"
  },
  {
    country: "Bhutan",
    code: "BT",
    image: "/tourism/cambodia.png",
    visaType: "Entry Permit for Indian Nationals (SDF Fee Applies)",
    processingTime: "3 - 5 Business Days",
    fee: "SDF ₹1,200/day + Permit",
    requirements: ["Passport / Voter ID", "Mandatory Bhutanese Tour Guide", "Hotel Booking", "SDF Fee receipt"],
    popularAttractions: "Paro Tiger's Nest Monastery, Punakha Dzong Palace, Thimphu Buddha Dordenma",
    description: "The Kingdom of Gross National Happiness nestled in eastern Himalayas, famous for mountain monasteries and fortress dongs.",
    cardGradient: "bg-gradient-to-br from-lime-950/90 via-emerald-950/60 to-slate-950",
    accentText: "text-lime-300",
    badgeBg: "bg-lime-950/90 border border-lime-400/30 text-lime-300",
    btnStyle: "bg-lime-500/20 hover:bg-lime-500 text-lime-300 hover:text-slate-950 border border-lime-400/30"
  },
  {
    country: "Switzerland",
    code: "CH",
    image: "/destinations/eu.png",
    visaType: "Schengen Tourist Visa (Type C - 90 Days)",
    processingTime: "10 - 15 Business Days",
    fee: "€80 (~₹7,200) + VFS Fee",
    requirements: ["Valid passport (3 months post stay)", "Schengen travel insurance (€30k)", "Bank statement (₹2.5L balance)", "ITR 3 years & Hotel voucher"],
    popularAttractions: "Matterhorn Zermatt, Jungfraujoch Top of Europe, Lake Geneva, Lucerne Chapel Bridge, Interlaken",
    description: "Alpine paradise famous for snow-capped mountain peaks, glacier lakes, luxury watches, chocolates, and scenic train journeys.",
    cardGradient: "bg-gradient-to-br from-red-950/90 via-rose-950/60 to-slate-950",
    accentText: "text-red-300",
    badgeBg: "bg-red-950/90 border border-red-400/30 text-red-300",
    btnStyle: "bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-slate-950 border border-red-400/30"
  }
];

export default function TourismPage() {
  const [passengerName, setPassengerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [targetDestination, setTargetDestination] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [heroIndex, setHeroIndex] = useState(0);
  const heroPhrases = [
    "Switzerland Schengen Tourist Visa Filing 🇨🇭",
    "Bangkok & Thailand 60-Day Free Visa on Arrival 🇹🇭",
    "Dubai Express 24-Hour e-Visa Approval 🇦🇪",
    "Japan Tourist e-Visa & Multiple Entry 🇯🇵",
    "Vietnam 90-Day e-Visa Processing 🇻🇳",
    "Malaysia Visa-Free MDAC Assistance 🇲🇾"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroPhrases.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName || !phone || !targetDestination) return;

    setBookingSuccess(true);
    canvasConfetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.7 }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* ========================================================================= */}
      {/* FULL-WIDTH TOURISM HERO SECTION WITH FADE-IN ENTRANCE */}
      {/* ========================================================================= */}
      <ScrollAnimate delay={0}>
        <section className="relative w-full gradient-ocean-hero border-b border-sky-900/40 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-1000 ease-out">
          
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-emerald-500/15 blur-[160px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full bg-teal-500/10 blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: "6s" }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:pt-20 md:pb-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Left Column: Text & CTAs */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-400/30 text-emerald-300 text-xs px-4 py-1.5 rounded-full backdrop-blur-md w-fit shadow-lg">
                <Sparkles className="h-4 w-4 text-amber-300 animate-spin" style={{ animationDuration: "8s" }} />
                <span className="font-bold uppercase tracking-wider text-[11px]">
                  Over the Sea International Tourism Portal
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl text-white leading-tight">
                  Explore the World with <br />
                  <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                    Hassle-Free Tourist Visas
                  </span>
                </h1>

                {/* Animated Typewriter Phrase Banner */}
                <div className="min-h-[42px] flex items-center pt-1">
                  <div key={heroIndex} className="bg-emerald-950/70 border border-emerald-400/30 px-3.5 py-1.5 rounded-full backdrop-blur-md text-emerald-300 font-bold text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-2 duration-500 flex items-center gap-2.5 shadow-md max-w-full">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
                    </span>
                    <span className="truncate">{heroPhrases[heroIndex]}</span>
                  </div>
                </div>
              </div>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
                Your trusted gateway for express e-Visas, sticker visa filing, flight bookings, and customized holiday packages across Thailand, Dubai, Japan, Vietnam, Cambodia, Laos, Philippines, Sri Lanka, Nepal, Malaysia, Bhutan, and Switzerland.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-full h-12 px-8 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105">
                  <a href="#apply-visa">
                    Apply Tourist Visa Now <ArrowRight className="h-4 w-4 ml-1" />
                  </a>
                </Button>

                <Button asChild variant="outline" size="lg" className="border-emerald-400/40 text-emerald-300 hover:bg-emerald-950/50 font-bold rounded-full h-12 px-8 transition-all hover:scale-105">
                  <a href="#destinations">
                    View 12 Destinations
                  </a>
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-emerald-900/40 grid grid-cols-3 gap-4 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>100% Visa Assistance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>24-Hour Express EVisa</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>15+ Years Travel Expertise</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Image with Anime Floating Badges */}
            <div className="lg:col-span-5 flex justify-center relative">
              
              {/* Floating Badge 1 */}
              <div className="absolute -top-4 -right-2 sm:right-2 z-20 animate-float-slow bg-slate-950/90 backdrop-blur-md border border-emerald-400/40 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-lg">
                  🌴
                </div>
                <div>
                  <p className="text-xs font-black text-white">12 Top Destinations</p>
                  <p className="text-[10px] text-slate-400">Global & Schengen Packages</p>
                </div>
              </div>

              {/* Floating Badge 2 */}
              <div className="absolute -bottom-4 -left-2 sm:left-2 z-20 animate-float-reverse bg-slate-950/90 backdrop-blur-md border border-teal-400/40 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-lg">
                  ✈️
                </div>
                <div>
                  <p className="text-xs font-black text-white">Express e-Visa Portal</p>
                  <p className="text-[10px] text-slate-300">Fast Doorstep Approval</p>
                </div>
              </div>

              {/* Hero Image Container */}
              <div className="relative w-full max-w-md h-96 sm:h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20 group">
                <Image
                  src="/tourism/hero.png"
                  alt="International Tourism & Travel"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 bg-slate-950/85 backdrop-blur-md p-4 rounded-2xl text-center shadow-xl border border-emerald-400/30">
                  <span className="text-sm font-extrabold text-emerald-300 block mb-0.5">
                    🌏 Over the Sea Tourism Hub
                  </span>
                  <span className="text-xs text-slate-300">Fast-Track Tourist Visas & Customized Tour Itineraries</span>
                </div>
              </div>

            </div>

          </div>
        </section>
      </ScrollAnimate>

      {/* ========================================================================= */}
      {/* 12 TOP TOURISM DESTINATIONS GRID */}
      {/* ========================================================================= */}
      <ScrollAnimate>
        <section id="destinations" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
              Top Global Travel Destinations
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-serif font-black text-white mt-3">
              Explore 12 Popular Holiday Hubs
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2 font-light">
              Complete visa process guidelines, processing timelines, requirements, and top attractions for Indian travelers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tourismDestinations.map((dest, idx) => (
              <div
                key={idx}
                className={`group relative rounded-xl border-0 overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between ${dest.cardGradient}`}
              >
                <div>
                  {/* Top Stadium Image Container */}
                  <div className="relative h-52 w-full rounded-t-2xl overflow-hidden">
                    <Image
                      src={dest.image}
                      alt={dest.country}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                    
                    {/* Country Header & Vector SVG Flag */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                      <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                        <TourismFlagSVG code={dest.code} />
                        <span className="text-xs font-black text-white">{dest.country}</span>
                      </div>
                      <Badge className={dest.badgeBg}>
                        {dest.processingTime}
                      </Badge>
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed font-light">
                      {dest.description}
                    </p>

                    <div className="space-y-2.5 pt-2 border-t border-white/10 text-xs">
                      <div className="flex items-start gap-2 text-slate-200">
                        <FileText className={`h-4 w-4 shrink-0 mt-0.5 ${dest.accentText}`} />
                        <div>
                          <strong className="text-slate-400 block text-[10px] uppercase font-bold">Visa Type:</strong>
                          <span className="font-semibold">{dest.visaType}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-slate-200">
                        <Clock className={`h-4 w-4 shrink-0 mt-0.5 ${dest.accentText}`} />
                        <div>
                          <strong className="text-slate-400 block text-[10px] uppercase font-bold">Processing Fee:</strong>
                          <span className="font-semibold">{dest.fee}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-slate-200">
                        <MapPin className={`h-4 w-4 shrink-0 mt-0.5 ${dest.accentText}`} />
                        <div>
                          <strong className="text-slate-400 block text-[10px] uppercase font-bold">Top Attractions:</strong>
                          <span className="font-light text-slate-300">{dest.popularAttractions}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action CTA */}
                <div className="p-6 pt-0">
                  <Button asChild className={`w-full font-bold rounded-xl h-10 ${dest.btnStyle}`}>
                    <a href="#apply-visa">
                      Apply Tourist Visa <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </ScrollAnimate>

      {/* ========================================================================= */}
      {/* 4-STEP TOURIST VISA APPLICATION PIPELINE */}
      {/* ========================================================================= */}
      <ScrollAnimate>
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-emerald-900/40">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
              Simple 4-Step Visa Process
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-serif font-black text-white mt-3">
              How We Get Your Tourist Visa
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2 font-light">
              Smooth, hassle-free visa processing from document verification to doorstep delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            <div className="bg-slate-900/80 border border-emerald-500/20 p-6 rounded-2xl flex flex-col gap-4 text-left shadow-xl relative group hover:border-emerald-400/50 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-xl">
                01
              </div>
              <h3 className="text-lg font-bold text-white">Select Country</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Choose your destination country and select single, multiple entry, or express e-Visa options.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-emerald-500/20 p-6 rounded-2xl flex flex-col gap-4 text-left shadow-xl relative group hover:border-emerald-400/50 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-black text-xl">
                02
              </div>
              <h3 className="text-lg font-bold text-white">Submit Documents</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Upload or hand over your passport, photo, bank proof, and travel dates to our S.R Nagar team.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-emerald-500/20 p-6 rounded-2xl flex flex-col gap-4 text-left shadow-xl relative group hover:border-emerald-400/50 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-black text-xl">
                03
              </div>
              <h3 className="text-lg font-bold text-white">Embassy Filing</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Our visa specialists file your application directly on embassy e-Visa portals or VFS submission hubs.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-emerald-500/20 p-6 rounded-2xl flex flex-col gap-4 text-left shadow-xl relative group hover:border-emerald-400/50 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black text-xl">
                04
              </div>
              <h3 className="text-lg font-bold text-white">Visa Approved!</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Receive your approved e-Visa PDF or stamped passport along with travel Insurance & flight guidance.
              </p>
            </div>

          </div>
        </section>
      </ScrollAnimate>

      {/* ========================================================================= */}
      {/* TOURIST VISA APPLICATION FORM SECTION */}
      {/* ========================================================================= */}
      <ScrollAnimate>
        <section id="apply-visa" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
            <div className="text-center max-w-xl mx-auto mb-10">
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-4 py-1 rounded-full font-bold uppercase tracking-wider mb-2">
                Fast-Track Tourist Visa Inquiry
              </Badge>
              <h2 className="text-3xl font-serif font-black text-white">
                Book Your Tourist Visa Counselling
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 font-light">
                Fill out the quick form below and our Hyderabad visa specialists will contact you within 15 minutes!
              </p>
            </div>

            {bookingSuccess ? (
              <div className="bg-emerald-950/80 border border-emerald-500/40 p-8 rounded-2xl text-center space-y-4">
                <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-300 text-3xl">
                  🎉
                </div>
                <h3 className="text-2xl font-bold text-white">Visa Inquiry Submitted!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you <span className="font-bold text-emerald-300">{passengerName}</span>! Our Over the Sea travel specialist will call you at <span className="font-bold text-emerald-300">{phone}</span> to guide your visa documents.
                </p>
                <Button
                  onClick={() => setBookingSuccess(false)}
                  variant="outline"
                  className="border-emerald-400/40 text-emerald-300 hover:bg-emerald-950 font-bold rounded-full px-6"
                >
                  Submit Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 text-left">
                    <Label className="text-xs font-bold text-slate-200">Full Name *</Label>
                    <Input
                      placeholder="Enter your full name"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      required
                      className="bg-slate-950 border-slate-800 focus:border-emerald-400 text-slate-100 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <Label className="text-xs font-bold text-slate-200">Phone / WhatsApp Number *</Label>
                    <Input
                      placeholder="+91 90527 03561"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="bg-slate-950 border-slate-800 focus:border-emerald-400 text-slate-100 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 text-left">
                    <Label className="text-xs font-bold text-slate-200">Email Address</Label>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-950 border-slate-800 focus:border-emerald-400 text-slate-100 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <Label className="text-xs font-bold text-slate-200">Target Country *</Label>
                    <select
                      value={targetDestination}
                      onChange={(e) => setTargetDestination(e.target.value)}
                      required
                      className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-emerald-400 focus:outline-none"
                    >
                      <option value="">Select Destination Country</option>
                      {tourismDestinations.map((d, i) => (
                        <option key={i} value={d.country}>{d.country} ({d.visaType})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl h-12 text-sm shadow-xl shadow-emerald-500/25"
                >
                  <Send className="h-4 w-4 mr-2" /> Request Express Tourist Visa Callback
                </Button>
              </form>
            )}
          </div>
        </section>
      </ScrollAnimate>

    </div>
  );
}
