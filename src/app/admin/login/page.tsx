"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Cloud,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Package,
  Compass,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  tag: string;
  icon: any;
  gradient: string;
  accentBadge: string;
  stats: { label: string; value: string }[];
}

const SERVICE_SLIDES: ServiceSlide[] = [
  {
    id: "education",
    title: "Overseas Education",
    subtitle: "Fall '26 Admissions & Global Visas",
    description:
      "Direct admissions across 500+ top universities in USA, UK, Canada, Australia & Europe with comprehensive visa counseling.",
    image: "/educational-consultancy.png",
    tag: "500+ Global Universities",
    icon: GraduationCap,
    gradient: "from-[#4f46e5] via-[#6355d8] to-[#7c3aed]",
    accentBadge: "bg-indigo-400/20 text-indigo-200 border-indigo-300/30",
    stats: [
      { label: "Visa Success", value: "99.2%" },
      { label: "Global Partners", value: "500+" },
      { label: "Admissions", value: "Fall '26" },
    ],
  },
  {
    id: "courier",
    title: "Global Courier Logistics",
    subtitle: "Door-to-Door Worldwide Delivery",
    description:
      "Express air cargo, prescription medicine dispatches, excess student baggage, and live tracking across 190+ countries worldwide.",
    image: "/global-courier.png",
    tag: "190+ Countries Worldwide",
    icon: Package,
    gradient: "from-[#d97706] via-[#ea580c] to-[#b45309]",
    accentBadge: "bg-amber-400/20 text-amber-200 border-amber-300/30",
    stats: [
      { label: "Countries", value: "190+" },
      { label: "Express Dispatch", value: "24-48h" },
      { label: "Doorstep Pickup", value: "Free" },
    ],
  },
  {
    id: "tourism",
    title: "Tourism & Express Visas",
    subtitle: "Customized International Holidays",
    description:
      "Hassle-free tourist and business visas for Dubai, Europe, UK, Singapore, flight bookings, and tailored travel itineraries.",
    image: "/tourism/hero.png",
    tag: "99.4% Tourist Visa Success",
    icon: Compass,
    gradient: "from-[#059669] via-[#0d9488] to-[#047857]",
    accentBadge: "bg-emerald-400/20 text-emerald-200 border-emerald-300/30",
    stats: [
      { label: "Visa Approval", value: "99.4%" },
      { label: "Popular Route", value: "UAE / Schengen" },
      { label: "Support", value: "24/7 Concierge" },
    ],
  },
  {
    id: "coaching",
    title: "Test Preparation Coaching",
    subtitle: "IELTS • GRE • PTE • TOEFL",
    description:
      "Master high-yield exam strategies with certified trainers, simulated full-length mocks, and personalized faculty score mentorship.",
    image: "/services/test-prep.png",
    tag: "Certified Master Trainers",
    icon: BookOpen,
    gradient: "from-[#9333ea] via-[#7c3aed] to-[#6b21a8]",
    accentBadge: "bg-purple-400/20 text-purple-200 border-purple-300/30",
    stats: [
      { label: "IELTS Target", value: "8.0+ Band" },
      { label: "GRE Target", value: "320+" },
      { label: "Mock Tests", value: "Unlimited" },
    ],
  },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto slide effect
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SERVICE_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid administrator credentials");
      }

      router.push("/admin");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const activeSlide = SERVICE_SLIDES[currentSlide];
  const IconComponent = activeSlide.icon;

  return (
    <div className="h-screen h-dvh w-full bg-white flex flex-col lg:flex-row select-none overflow-hidden antialiased">
      
      {/* ========================================================================= */}
      {/* LEFT COLUMN: MODERN AUTO-CAROUSEL OF SERVICES IMAGES */}
      {/* ========================================================================= */}
      <div
        className="w-full lg:w-[52%] xl:w-[56%] h-full p-4 sm:p-5 lg:p-6 xl:p-8 flex items-center justify-center bg-[#faf9ff] relative overflow-hidden order-2 lg:order-1"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        
        {/* Ambient Decorative Background Glows */}
        <div className="w-96 h-96 rounded-full bg-[#6355d8]/10 absolute -top-16 -left-16 blur-3xl pointer-events-none" />
        <div className="w-96 h-96 rounded-full bg-amber-500/10 absolute -bottom-16 -right-16 blur-3xl pointer-events-none" />

        {/* Main Carousel Card Container */}
        <div className="w-full h-full rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl relative flex flex-col justify-between p-6 sm:p-8 md:p-9 text-white transition-all duration-700">
          
          {/* Active Gradient Mesh Layer */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${activeSlide.gradient} transition-all duration-700 z-0`}
          />

          {/* Subtle Texture Overlay */}
          <div className="absolute inset-0 bg-black/15 z-0" />

          {/* Right Corner Conforming Image with Smooth Rounded Design */}
          <div className="absolute right-4 bottom-4 sm:right-6 sm:bottom-6 md:right-8 md:bottom-8 w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 opacity-40 pointer-events-none rounded-3xl sm:rounded-[36px] overflow-hidden shadow-2xl border border-white/25 transition-all duration-700">
            <Image
              key={activeSlide.id}
              src={activeSlide.image}
              alt={activeSlide.title}
              fill
              className="object-cover object-center rounded-3xl sm:rounded-[36px] transition-opacity duration-700 animate-in fade-in-0"
              priority
            />
          </div>

          {/* Top Carousel Navigation & Tag Bar */}
          <div className="relative z-10 flex items-center justify-between">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md ${activeSlide.accentBadge}`}>
              <IconComponent className="h-4 w-4" />
              <span>{activeSlide.tag}</span>
            </div>

            {/* Previous / Next Arrow Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setCurrentSlide(
                    (prev) => (prev - 1 + SERVICE_SLIDES.length) % SERVICE_SLIDES.length
                  )
                }
                title="Previous Service"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <button
                onClick={() =>
                  setCurrentSlide((prev) => (prev + 1) % SERVICE_SLIDES.length)
                }
                title="Next Service"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          {/* Center / Bottom Slide Text & Stats */}
          <div className="relative z-10 max-w-xl my-auto py-4 sm:py-6">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/80 block mb-1">
              {activeSlide.subtitle}
            </span>
            <h2 className="font-sans font-black text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-white tracking-tight leading-tight mb-3 drop-shadow-md">
              {activeSlide.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-lg mb-5 font-medium">
              {activeSlide.description}
            </p>

            {/* Quick Stat Chips */}
            <div className="grid grid-cols-3 gap-2.5 max-w-md">
              {activeSlide.stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white/15 backdrop-blur-md border border-white/20 p-2.5 sm:p-3 rounded-2xl"
                >
                  <span className="font-black text-sm sm:text-base lg:text-lg text-white block leading-tight">
                    {stat.value}
                  </span>
                  <span className="text-[10px] sm:text-xs text-white/80 font-medium block">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Progress Bars & Indicators */}
          <div className="relative z-10 pt-2 flex flex-col gap-2">
            {/* Progress Bars */}
            <div className="grid grid-cols-4 gap-2">
              {SERVICE_SLIDES.map((slide, idx) => {
                const isActive = idx === currentSlide;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(idx)}
                    className="group flex flex-col gap-1 text-left cursor-pointer"
                  >
                    <div className="w-full bg-white/25 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 bg-white transition-all duration-500 rounded-full ${
                          isActive ? "w-full" : "w-0 group-hover:w-1/3"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-bold truncate transition-colors ${
                        isActive ? "text-white" : "text-white/60 hover:text-white/90"
                      }`}
                    >
                      {slide.title.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: MODERN CLEAN AUTHENTICATION FORM */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[48%] xl:w-[44%] h-full flex flex-col justify-between p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 bg-white relative z-10 order-1 lg:order-2 overflow-hidden">
        
        {/* Brand Header */}
        <div className="flex items-center justify-start shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-[#6355d8] text-white flex items-center justify-center shadow-md shadow-[#6355d8]/30">
              <Cloud className="h-5 w-5 sm:h-6 sm:w-6 fill-white" />
            </div>
            <div>
              <span className="font-sans font-black text-lg sm:text-xl text-[#1e1b4b] tracking-tight block leading-tight">
                Over The Sea
              </span>
              <span className="text-[10px] font-bold text-[#6355d8] uppercase tracking-wider block">
                Admin Workspace
              </span>
            </div>
          </div>
        </div>

        {/* Form Center */}
        <div className="my-auto py-2 sm:py-4 max-w-md w-full mx-auto">
          
          <div className="mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0edff] text-[#6355d8] text-xs font-bold mb-2.5 border border-[#ece8ff]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Secure Administrator Portal</span>
            </div>
            <h1 className="font-sans font-black text-2xl sm:text-3xl xl:text-4xl text-[#1e1b4b] tracking-tight">
              Sign in to Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed font-medium">
              Enter your administrator credentials to manage unified customer inquiries, leads, and cross-vertical analytics.
            </p>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in-0">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-3.5">
            
            {/* Email Field */}
            <div>
              <label className="text-xs font-bold text-slate-800 mb-1 block">
                Admin Email
              </label>
              <input
                required
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@overthesea.in"
                className="w-full h-11 px-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6355d8]/20 focus:border-[#6355d8] transition-all bg-white shadow-2xs"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs font-bold text-slate-800 mb-1 block">
                Password
              </label>

              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6355d8]/20 focus:border-[#6355d8] transition-all bg-white shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 sm:h-12 bg-[#6355d8] hover:bg-[#5244ca] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-[#6355d8]/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-3"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>

          </form>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-center text-center text-xs text-slate-400 font-medium pt-3 border-t border-slate-100 shrink-0">
          <p className="text-[11px] text-slate-400">
            Over The Sea International CRM • All rights reserved &copy; {new Date().getFullYear()}
          </p>
        </div>

      </div>

    </div>
  );
}
