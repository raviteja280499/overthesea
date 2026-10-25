"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  GraduationCap,
  Package,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Globe,
  Award,
  Users,
  Truck,
  CheckCircle2,
  Sparkles,
  Compass,
  Plane,
  ShieldCheck,
  Building,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import OceanWaveCanvas from "@/components/ui/OceanWaveCanvas";
import ScrollAnimate from "@/components/ui/ScrollAnimate";

const PHRASES = [
  "Worldwide Services Gateway",
  "Educational & Foreign Consultancy",
  "Global Express Courier Logistics",
  "Tourism & Tourist Visa Services",
  "S.R Nagar & Hyderabad Hub"
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Animated Typing Effect
  useEffect(() => {
    const fullText = PHRASES[phraseIndex];
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      timer = setTimeout(() => {
        setTypedText((prev) => prev.substring(0, prev.length - 1));
      }, 35);
    } else {
      timer = setTimeout(() => {
        setTypedText((prev) => fullText.substring(0, prev.length + 1));
      }, 70);
    }

    if (!isDeleting && typedText === fullText) {
      timer = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && typedText === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, phraseIndex]);

  // Auto-play carousel every 6 seconds across 3 slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? 2 : prev - 1));
  };

  return (
    <div className="relative overflow-hidden min-h-screen bg-slate-950 text-slate-100">
      
      {/* ========================================================================= */}
      {/* ULTRA-MODERN VIBRANT OCEAN HERO SECTION WITH WORLD MAP */}
      {/* ========================================================================= */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        
        {/* 3D Wave Animated Canvas Background Layer */}
        <OceanWaveCanvas />

        {/* Organic Ambient Glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-dodger-blue-500/20 blur-[180px] pointer-events-none" />
        <div className="absolute bottom-0 right-[-10%] w-[600px] h-[600px] rounded-full bg-icy-blue-400/15 blur-[160px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-5 max-w-4xl mx-auto">
          
          {/* Floating Pill Tag */}
          <div className="inline-flex items-center gap-2 bg-dodger-blue-950/80 text-dodger-blue-300 text-xs px-5 py-2 rounded-full backdrop-blur-md shadow-lg border-0">
            <Sparkles className="h-4 w-4 text-bright-lemon-400 animate-pulse" />
            <span className="font-extrabold uppercase tracking-widest text-[11px]">
              Global Gateway Portal
            </span>
          </div>
          
          <h1 className="font-serif font-black text-4xl sm:text-6xl md:text-7xl leading-tight">
            <span className="italic font-serif font-black text-shine-effect tracking-wider block drop-shadow-[0_4px_35px_rgba(4,136,251,0.6)]">
              OVER THE SEA
            </span>
            <span className="bg-gradient-to-r from-icy-blue-200 via-dodger-blue-300 to-bright-lemon-300 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(4,136,251,0.7)] text-2xl sm:text-4xl md:text-5xl inline-block mt-2 min-h-[60px] font-sans font-extrabold">
              {typedText}
              <span className="inline-block w-1 h-8 sm:h-10 ml-1 bg-bright-lemon-400 animate-pulse align-middle" />
            </span>
          </h1>

          <p className="hidden md:block text-slate-200 text-base sm:text-xl max-w-2xl font-light leading-relaxed drop-shadow-sm">
            Premier Overseas Education & Foreign Consultancy, Global Express Courier Logistics, and International Tourism & Travel Services.
          </p>

          {/* Quick Triple Service Pill Shortcuts */}
          <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
            <Link
              href="/education"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-dodger-blue-500 hover:bg-dodger-blue-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-dodger-blue-500/30 transition-all hover:scale-105"
            >
              <GraduationCap className="h-4 w-4" />
              1. Educational Consultancy
            </Link>

            <Link
              href="/courier"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-school-bus-yellow-500 hover:bg-school-bus-yellow-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-school-bus-yellow-500/30 transition-all hover:scale-105"
            >
              <Package className="h-4 w-4" />
              2. Global Courier Services
            </Link>

            <Link
              href="/tourism"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/30 transition-all hover:scale-105"
            >
              <Compass className="h-4 w-4" />
              3. Tourism & Travel Services
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BORDERLESS MODERN CAROUSEL FEATURING STADIUM IMAGE CONTAINERS */}
      {/* ========================================================================= */}
      <ScrollAnimate>
        <section className="relative -mt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-20">
        
        {/* Carousel Card Outer Container */}
        <div className="relative group">
          
          {/* Previous Slide Control Arrow */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 z-40 h-13 w-13 rounded-full bg-slate-900/80 text-dodger-blue-300 hover:bg-dodger-blue-500 hover:text-slate-950 flex items-center justify-center shadow-2xl transition-all cursor-pointer hover:scale-110"
            aria-label="Previous Service"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>

          {/* Next Slide Control Arrow */}
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 z-40 h-13 w-13 rounded-full bg-slate-900/80 text-dodger-blue-300 hover:bg-dodger-blue-500 hover:text-slate-950 flex items-center justify-center shadow-2xl transition-all cursor-pointer hover:scale-110"
            aria-label="Next Service"
          >
            <ChevronRight className="h-7 w-7" />
          </button>

          {/* BORDERLESS Slide Window with Organic Curved Outer Frame */}
          <div className="overflow-hidden rounded-[36px] sm:rounded-[48px] bg-slate-900/70 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
            
            {/* SLIDE 0: EDUCATIONAL & FOREIGN CONSULTANCY SERVICES */}
            {currentSlide === 0 && (
              <div className="animate-in fade-in slide-in-from-right-6 duration-500 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
                
                {/* Visual Stadium Frame Container */}
                <div className="lg:col-span-5 relative flex justify-center">
                  <div className="relative w-full max-w-sm h-80 sm:h-96 rounded-3xl overflow-hidden shadow-2xl transition-all">
                    <Image
                      src="/educational-consultancy.png"
                      alt="Educational & Foreign Consultancy Services"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                    
                    {/* Floating Glass Badge inside Stadium Frame */}
                    <div className="absolute bottom-6 left-6 right-6 bg-slate-950/80 backdrop-blur-md p-4 rounded-3xl text-center shadow-xl">
                      <span className="text-xs font-extrabold text-dodger-blue-300 uppercase tracking-wider block">
                        🎓 Over the Sea Study Abroad
                      </span>
                      <span className="text-[11px] text-slate-300">USA • UK • Canada • Australia</span>
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div className="lg:col-span-7 flex flex-col gap-6 text-left">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-dodger-blue-500/20 text-dodger-blue-300 text-xs px-3.5 py-1 rounded-full font-bold border-0">
                      Service Vertical 1 of 3
                    </Badge>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-serif font-black text-white leading-tight">
                    Educational & Foreign Consultancy Services
                  </h2>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
                    Full-service foreign education consultancy by Over the Sea. Get personalized study abroad counselling, university & course selection, SOP/LOR editing, 100% student visa filing support, and test prep coaching.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200 font-medium">
                    <span className="flex items-center gap-2 bg-slate-950/70 p-3 rounded-2xl text-dodger-blue-200 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-dodger-blue-400 shrink-0" /> Study Abroad Profile Evaluation
                    </span>
                    <span className="flex items-center gap-2 bg-slate-950/70 p-3 rounded-2xl text-dodger-blue-200 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-dodger-blue-400 shrink-0" /> 500+ Universities (USA, UK, Canada)
                    </span>
                    <span className="flex items-center gap-2 bg-slate-950/70 p-3 rounded-2xl text-dodger-blue-200 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-dodger-blue-400 shrink-0" /> Student Visa Filing & Mock Interviews
                    </span>
                    <span className="flex items-center gap-2 bg-slate-950/70 p-3 rounded-2xl text-dodger-blue-200 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-dodger-blue-400 shrink-0" /> Free Overseas Eligibility Check
                    </span>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs font-bold text-dodger-blue-300 uppercase tracking-wider">
                      Tap button to open Education Portal
                    </span>
                    <Button asChild size="lg" className="w-full sm:w-auto bg-dodger-blue-500 hover:bg-dodger-blue-400 text-slate-950 font-bold rounded-full h-12 px-8 shadow-lg shadow-dodger-blue-500/30 cursor-pointer">
                      <Link href="/education" className="flex items-center justify-center gap-2">
                        Open Education Portal <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

              </div>
            )}

            {/* SLIDE 1: GLOBAL COURIER SERVICES */}
            {currentSlide === 1 && (
              <div className="animate-in fade-in slide-in-from-right-6 duration-500 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
                
                {/* Visual Stadium Frame Container */}
                <div className="lg:col-span-5 relative flex justify-center">
                  <div className="relative w-full max-w-sm h-80 sm:h-96 rounded-3xl overflow-hidden shadow-2xl transition-all">
                    <Image
                      src="/global-courier.png"
                      alt="Global Courier Services"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                    
                    {/* Floating Glass Badge inside Stadium Frame */}
                    <div className="absolute bottom-6 left-6 right-6 bg-slate-950/80 backdrop-blur-md p-4 rounded-3xl text-center shadow-xl">
                      <span className="text-xs font-extrabold text-school-bus-yellow-400 uppercase tracking-wider block">
                        📦 Express Worldwide Logistics
                      </span>
                      <span className="text-[11px] text-slate-300">190+ Countries • Prescription Medicine • Baggage</span>
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div className="lg:col-span-7 flex flex-col gap-6 text-left">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-school-bus-yellow-500/20 text-school-bus-yellow-300 text-xs px-3.5 py-1 rounded-full font-bold border-0">
                      Service Vertical 2 of 3
                    </Badge>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-serif font-black text-white leading-tight">
                    Global Courier Services
                  </h2>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
                    Worldwide express parcel and freight shipping engine. Access instant shipping rate calculators, live AWB consignment tracking, doctor-prescription medicine courier, student excess baggage, and vacuum-sealed food transport.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200 font-medium">
                    <span className="flex items-center gap-2 bg-slate-950/70 p-3 rounded-2xl text-school-bus-yellow-200 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-school-bus-yellow-400 shrink-0" /> Live AWB Consignment Tracking
                    </span>
                    <span className="flex items-center gap-2 bg-slate-950/70 p-3 rounded-2xl text-school-bus-yellow-200 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-school-bus-yellow-400 shrink-0" /> Doctor Prescription Medicine Express
                    </span>
                    <span className="flex items-center gap-2 bg-slate-950/70 p-3 rounded-2xl text-school-bus-yellow-200 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-school-bus-yellow-400 shrink-0" /> Student Excess Baggage Logistics
                    </span>
                    <span className="flex items-center gap-2 bg-slate-950/70 p-3 rounded-2xl text-slate-950/70 p-3 rounded-2xl text-school-bus-yellow-200 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-school-bus-yellow-400 shrink-0" /> Free Doorstep Pickup (S.R Nagar, Hyd)
                    </span>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs font-bold text-school-bus-yellow-300 uppercase tracking-wider">
                      Tap button to open Courier Portal
                    </span>
                    <Button asChild size="lg" className="w-full sm:w-auto bg-school-bus-yellow-500 hover:bg-school-bus-yellow-400 text-slate-950 font-bold rounded-full h-12 px-8 shadow-lg shadow-school-bus-yellow-500/30 cursor-pointer">
                      <Link href="/courier" className="flex items-center justify-center gap-2">
                        Open Courier Portal <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

              </div>
            )}

            {/* SLIDE 2: TOURISM & TRAVEL SERVICES */}
            {currentSlide === 2 && (
              <div className="animate-in fade-in slide-in-from-right-6 duration-500 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
                
                {/* Visual Stadium Frame Container */}
                <div className="lg:col-span-5 relative flex justify-center">
                  <div className="relative w-full max-w-sm h-80 sm:h-96 rounded-3xl overflow-hidden shadow-2xl transition-all">
                    <Image
                      src="/tourism/hero.png"
                      alt="Tourism & Travel Services"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                    
                    {/* Floating Glass Badge inside Stadium Frame */}
                    <div className="absolute bottom-6 left-6 right-6 bg-slate-950/80 backdrop-blur-md p-4 rounded-3xl text-center shadow-xl">
                      <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider block">
                        ✈️ Worldwide Tourist Visas & Travel
                      </span>
                      <span className="text-[11px] text-slate-300">Thailand • Dubai • Japan • Vietnam • Singapore</span>
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div className="lg:col-span-7 flex flex-col gap-6 text-left">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-300 text-xs px-3.5 py-1 rounded-full font-bold border-0">
                      Service Vertical 3 of 3
                    </Badge>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-serif font-black text-white leading-tight">
                    Tourism & Travel Services
                  </h2>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
                    Full-service international tourist visa processing and holiday package guidance by Over the Sea. Fast-track e-Visas, sticker visas, flight booking assistance, and customized holiday itineraries for 12 top global destinations.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200 font-medium">
                    <span className="flex items-center gap-2 bg-slate-950/70 p-3 rounded-2xl text-emerald-200 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> 100% Tourist Visa Filing Assistance
                    </span>
                    <span className="flex items-center gap-2 bg-slate-950/70 p-3 rounded-2xl text-emerald-200 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> 12 Asian & Schengen Destinations
                    </span>
                    <span className="flex items-center gap-2 bg-slate-950/70 p-3 rounded-2xl text-emerald-200 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> Express EVisa & Visa on Arrival
                    </span>
                    <span className="flex items-center gap-2 bg-slate-950/70 p-3 rounded-2xl text-emerald-200 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> Flight & Customized Tour Packages
                    </span>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Tap button to open Tourism Portal
                    </span>
                    <Button asChild size="lg" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-full h-12 px-8 shadow-lg shadow-emerald-500/30 cursor-pointer">
                      <Link href="/tourism" className="flex items-center justify-center gap-2">
                        Open Tourism Portal <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Bottom Carousel Service Selection Buttons */}
          <div className="flex justify-center items-center gap-3 mt-8 flex-wrap">
            <button
              onClick={() => setCurrentSlide(0)}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                currentSlide === 0
                  ? "bg-dodger-blue-500 text-slate-950 shadow-lg shadow-dodger-blue-500/40 scale-105"
                  : "bg-slate-900/80 text-slate-400 hover:text-white"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" /> 1. Educational Consultancy
            </button>

            <button
              onClick={() => setCurrentSlide(1)}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                currentSlide === 1
                  ? "bg-school-bus-yellow-500 text-slate-950 shadow-lg shadow-school-bus-yellow-500/40 scale-105"
                  : "bg-slate-900/80 text-slate-400 hover:text-white"
              }`}
            >
              <Package className="h-3.5 w-3.5" /> 2. Global Courier Services
            </button>

            <button
              onClick={() => setCurrentSlide(2)}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                currentSlide === 2
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40 scale-105"
                  : "bg-slate-900/80 text-slate-400 hover:text-white"
              }`}
            >
              <Compass className="h-3.5 w-3.5" /> 3. Tourism & Travel
            </button>
          </div>

          {/* Bottom Carousel Dots */}
          <div className="flex justify-center items-center gap-2.5 mt-6">
            <button
              onClick={() => setCurrentSlide(0)}
              className={`h-3 rounded-full transition-all cursor-pointer ${
                currentSlide === 0 ? "w-10 bg-dodger-blue-400" : "w-3 bg-slate-700 hover:bg-slate-600"
              }`}
              aria-label="Go to Education Portal"
            />
            <button
              onClick={() => setCurrentSlide(1)}
              className={`h-3 rounded-full transition-all cursor-pointer ${
                currentSlide === 1 ? "w-10 bg-school-bus-yellow-400" : "w-3 bg-slate-700 hover:bg-slate-600"
              }`}
              aria-label="Go to Courier Portal"
            />
            <button
              onClick={() => setCurrentSlide(2)}
              className={`h-3 rounded-full transition-all cursor-pointer ${
                currentSlide === 2 ? "w-10 bg-emerald-400" : "w-3 bg-slate-700 hover:bg-slate-600"
              }`}
              aria-label="Go to Tourism Portal"
            />
          </div>

        </div>
      </section>
      </ScrollAnimate>

      {/* ========================================================================= */}
      {/* GLOBAL TRUST STATISTICS BANNER WITH GLASS CARDS */}
      {/* ========================================================================= */}
      <ScrollAnimate delay={100}>
        <section className="bg-slate-900/80 py-16 text-white px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          
          <div className="glass-ocean p-6 rounded-3xl border border-sky-500/20 flex flex-col items-center gap-2 shadow-xl">
            <Globe className="h-10 w-10 text-sky-400 animate-pulse" />
            <strong className="text-3xl sm:text-4xl font-black text-white">190+</strong>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Countries Connected</span>
          </div>

          <div className="glass-ocean p-6 rounded-3xl border border-sky-500/20 flex flex-col items-center gap-2 shadow-xl">
            <GraduationCap className="h-10 w-10 text-sky-400" />
            <strong className="text-3xl sm:text-4xl font-black text-white">10,000+</strong>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Students Counseled</span>
          </div>

          <div className="glass-ocean p-6 rounded-3xl border border-amber-500/20 flex flex-col items-center gap-2 shadow-xl">
            <Truck className="h-10 w-10 text-amber-400" />
            <strong className="text-3xl sm:text-4xl font-black text-white">50,000+</strong>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Parcels Shipped</span>
          </div>

          <div className="glass-ocean p-6 rounded-3xl border border-amber-500/20 flex flex-col items-center gap-2 shadow-xl">
            <Award className="h-10 w-10 text-amber-400" />
            <strong className="text-3xl sm:text-4xl font-black text-white">15+</strong>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Years Excellence</span>
          </div>

        </div>
      </section>
      </ScrollAnimate>

    </div>
  );
}
