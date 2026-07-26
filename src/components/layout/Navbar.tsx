"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Package,
  GraduationCap,
  Home,
  Search,
  PhoneCall,
  ChevronRight,
  Compass,
  FileCheck,
  BookOpen,
  Calculator,
  HeartPulse,
  Truck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isEduPage = pathname.startsWith("/education");
  const isCourierPage = pathname.startsWith("/courier");

  return (
    <header className="sticky top-0 z-50 w-full pt-3 pb-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pointer-events-none">
      {/* BORDERLESS GLASS CAPSULE NAVBAR */}
      <div className="pointer-events-auto bg-transparent backdrop-blur-md border-0 sm:border sm:border-white/10 sm:bg-[rgb(1_7_34)]/40 rounded-full px-3 sm:px-5 py-2 flex justify-between items-center transition-all duration-300">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Image
              src="/logo.png"
              alt="Over the Sea Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-black text-lg sm:text-xl tracking-wider text-shine-effect uppercase leading-none">
              OVER THE SEA
            </span>
            <span className="font-sans text-[9px] tracking-[0.14em] uppercase text-sky-400 font-bold mt-0.5">
              {isEduPage
                ? "Education Portal"
                : isCourierPage
                  ? "Courier Logistics"
                  : "Services Gateway"}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-bold text-slate-200">
          <Link
            href="/"
            className={`transition-colors hover:text-sky-300 ${
              pathname === "/"
                ? "text-sky-300 font-extrabold bg-sky-500/20 px-3.5 py-1.5 rounded-full"
                : "hover:text-white"
            }`}
          >
            Home
          </Link>

          {isEduPage ? (
            /* SEPARATE GLASS NAV FOR EDUCATION CONSULTANCY */
            <>
              <Link
                href="/education#destinations"
                className="hover:text-sky-300 transition-colors"
              >
                Study Destinations
              </Link>
              <Link
                href="/education#process"
                className="hover:text-sky-300 transition-colors"
              >
                Visa Guidance
              </Link>
              <Link
                href="/education#coaching"
                className="hover:text-sky-300 transition-colors"
              >
                All Test Prep
              </Link>
              <Link
                href="/education#eligibility"
                className="text-sky-300 bg-sky-500/20 px-4 py-1.5 rounded-full hover:bg-sky-500/30 transition-all"
              >
                Free Profile Check
              </Link>
            </>
          ) : isCourierPage ? (
            /* SEPARATE GLASS NAV FOR GLOBAL COURIER SERVICES */
            <>
              <Link
                href="/courier#estimator"
                className="hover:text-amber-300 transition-colors"
              >
                Rate Calculator
              </Link>
              <Link
                href="/courier#medicine"
                className="hover:text-amber-300 transition-colors"
              >
                Medicine Shipping
              </Link>
              <Link
                href="/courier#baggage"
                className="hover:text-amber-300 transition-colors"
              >
                Student Baggage
              </Link>
              <Link
                href="/tracking"
                className="text-amber-300 bg-amber-500/20 px-4 py-1.5 rounded-full hover:bg-amber-500/30 transition-all"
              >
                Track AWB
              </Link>
            </>
          ) : (
            /* DEFAULT LANDING NAV */
            <>
              <Link
                href="/education"
                className="flex items-center gap-1.5 text-sky-300 bg-sky-500/20 px-3.5 py-1.5 rounded-full hover:bg-sky-500/30 transition-all text-xs font-bold"
              >
                <GraduationCap className="h-4 w-4 text-sky-400" />
                Educational Consultancy
              </Link>

              <Link
                href="/courier"
                className="flex items-center gap-1.5 text-amber-300 bg-amber-500/20 px-3.5 py-1.5 rounded-full hover:bg-amber-500/30 transition-all text-xs font-bold"
              >
                <Package className="h-4 w-4 text-amber-400" />
                Global Courier
              </Link>

              <Link
                href="/tourism"
                className="flex items-center gap-1.5 text-emerald-300 bg-emerald-500/20 px-3.5 py-1.5 rounded-full hover:bg-emerald-500/30 transition-all text-xs font-bold"
              >
                <Compass className="h-4 w-4 text-emerald-400" />
                Tourism & Travel
              </Link>
            </>
          )}
        </nav>

        {/* Action Switcher Button */}
        <div className="hidden lg:flex items-center gap-3">
          {isEduPage ? (
            <Button
              asChild
              size="sm"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full px-4 h-9 shadow-md cursor-pointer text-xs"
            >
              <Link href="/courier" className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" /> Courier Services
              </Link>
            </Button>
          ) : isCourierPage ? (
            <Button
              asChild
              size="sm"
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-full px-4 h-9 shadow-md cursor-pointer text-xs"
            >
              <Link href="/education" className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" /> Education Portal
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-full px-5 h-9 shadow-md cursor-pointer text-xs"
            >
              <Link href="/contact">Get In Touch</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Toggle & Animated Glass Drawer */}
        <div className="lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/15 rounded-full h-10 w-10 border border-sky-400/20"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[85vw] max-w-sm bg-slate-950/95 border-l-2 border-sky-400/30 text-slate-100 p-6 overflow-y-auto backdrop-blur-2xl shadow-[-10px_0_50px_rgba(0,0,0,0.8)] rounded-l-[32px]"
            >
              {/* Drawer Header */}
              <SheetHeader className="text-left pb-4 border-b border-sky-900/40">
                <SheetTitle className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 flex items-center justify-center">
                      <Image
                        src="/logo.png"
                        alt="Over the Sea Logo"
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif font-black text-base tracking-wider text-shine-effect uppercase leading-none">
                        OVER THE SEA
                      </span>
                      <span className="font-sans text-[8px] tracking-[0.15em] uppercase text-cyan-400 font-bold mt-0.5">
                        Services Gateway
                      </span>
                    </div>
                  </div>
                </SheetTitle>
              </SheetHeader>

              {/* Drawer Navigation Body */}
              <div className="flex flex-col gap-5 py-6">
                {/* Home Link */}
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-2xl font-bold text-sm transition-all ${
                    pathname === "/"
                      ? "bg-sky-500 text-slate-950 shadow-md"
                      : "text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Home Page</span>
                </Link>

                {/* Educational Consultancy Card & Sub-links */}
                <div className="bg-gradient-to-br from-sky-950/90 to-slate-900 border border-sky-500/30 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
                  <Link
                    href="/education"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between font-bold text-sm text-sky-300 hover:text-white"
                  >
                    <span className="flex items-center gap-2">
                      <GraduationCap className="h-4.5 w-4.5 text-cyan-400" />
                      Educational Consultancy
                    </span>
                    <ChevronRight className="h-4 w-4 text-sky-400" />
                  </Link>

                  <div className="flex flex-col gap-2 pl-6 pt-1 text-xs text-slate-300">
                    <Link
                      href="/education#destinations"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 hover:text-cyan-300 transition-colors py-1"
                    >
                      <Compass className="h-3.5 w-3.5 text-sky-400" /> Study
                      Destinations
                    </Link>
                    <Link
                      href="/education#process"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 hover:text-cyan-300 transition-colors py-1"
                    >
                      <FileCheck className="h-3.5 w-3.5 text-sky-400" />{" "}
                      Admissions & Visa Guidance
                    </Link>
                    <Link
                      href="/education#coaching"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 hover:text-cyan-300 transition-colors py-1"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-sky-400" /> All Test
                      Prep (IELTS, GRE, PTE, GMAT)
                    </Link>
                    <Link
                      href="/education#eligibility"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 hover:text-cyan-300 transition-colors py-1 font-bold text-cyan-300"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Free
                      Profile Assessment
                    </Link>
                  </div>
                </div>

                {/* Global Courier Services Card & Sub-links */}
                <div className="bg-gradient-to-br from-amber-950/90 to-slate-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
                  <Link
                    href="/courier"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between font-bold text-sm text-amber-300 hover:text-white"
                  >
                    <span className="flex items-center gap-2">
                      <Package className="h-4.5 w-4.5 text-amber-400" />
                      Global Courier Services
                    </span>
                    <ChevronRight className="h-4 w-4 text-amber-400" />
                  </Link>

                  <div className="flex flex-col gap-2 pl-6 pt-1 text-xs text-slate-300">
                    <Link
                      href="/courier#estimator"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 hover:text-amber-300 transition-colors py-1"
                    >
                      <Calculator className="h-3.5 w-3.5 text-amber-400" /> Rate
                      Calculator
                    </Link>
                    <Link
                      href="/courier#medicine"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 hover:text-amber-300 transition-colors py-1"
                    >
                      <HeartPulse className="h-3.5 w-3.5 text-amber-400" />{" "}
                      Prescription Medicine Shipping
                    </Link>
                    <Link
                      href="/courier#baggage"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 hover:text-amber-300 transition-colors py-1"
                    >
                      <Truck className="h-3.5 w-3.5 text-amber-400" /> Student
                      Excess Baggage
                    </Link>
                    <Link
                      href="/tracking"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 hover:text-amber-300 transition-colors py-1 font-bold text-amber-300"
                    >
                      <Search className="h-3.5 w-3.5 text-amber-400" /> Track
                      AWB Shipment
                    </Link>
                  </div>
                </div>

                {/* Vertical 3: Tourism & Travel */}
                <div className="flex flex-col gap-2 pt-2 border-t border-sky-900/40">
                  <Link
                    href="/tourism"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 font-bold hover:bg-emerald-900/90 shadow-lg"
                  >
                    <span className="flex items-center gap-2.5 text-sm">
                      <Compass className="h-4 w-4 text-emerald-400" />
                      Tourism & Travel Services
                    </span>
                    <ChevronRight className="h-4 w-4 text-emerald-400" />
                  </Link>
                </div>

                {/* WhatsApp Contact Button */}
                <div className="flex flex-col gap-2.5 pt-3 border-t border-sky-900/40 text-xs">
                  <a
                    href="https://wa.me/919052703561"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 font-bold hover:bg-emerald-900/90 shadow-lg"
                  >
                    <span className="flex items-center gap-2.5 text-sm">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366]">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.986-1.309A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.634 0-3.155-.447-4.46-1.222l-.32-.19-2.96.777.79-2.887-.208-.332A7.954 7.954 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
                      </svg>
                      WhatsApp
                    </span>
                    <span className="text-xs font-mono text-emerald-300">
                      +91 90527 03561
                    </span>
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
