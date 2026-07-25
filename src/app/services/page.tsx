"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plane, 
  Truck, 
  HeartPulse, 
  GraduationCap, 
  Apple, 
  FileText, 
  AlertOctagon, 
  ShieldCheck, 
  Clock, 
  Info,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-12">
      
      {/* Page Header Header */}
      <div className="text-center flex flex-col gap-4 max-w-3xl mx-auto">
        <Badge className="w-fit self-center bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs px-4 py-1.5 font-bold rounded-full uppercase tracking-wider">
          Complete Services Catalog
        </Badge>
        <h1 className="font-serif font-black text-4xl sm:text-6xl text-white leading-tight">
          Worldwide Express Shipping & Education Services
        </h1>
        <p className="text-base sm:text-lg text-slate-300 font-light leading-relaxed">
          From prescription medicines to student excess baggage, study abroad counselling to university visa filing, explore our complete service catalog below.
        </p>
      </div>

      {/* Main Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Service Card 1: Educational Consultancy */}
        <div className="glass-ocean p-8 rounded-[40px] border border-sky-500/30 flex flex-col justify-between gap-6 hover:border-sky-400/60 transition-all hover:-translate-y-1">
          <div className="flex flex-col gap-4">
            <div className="h-14 w-14 rounded-2xl bg-sky-500/20 text-cyan-300 flex items-center justify-center">
              <GraduationCap className="h-8 w-8" />
            </div>

            <Badge className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs px-3 py-1 rounded-full w-fit">
              Service Vertical 1
            </Badge>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Educational & Foreign Consultancy Services
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-light">
              Premier Over the Sea overseas study guidance for USA, UK, Canada, Australia, Germany, and Ireland.
            </p>

            <div className="flex flex-col gap-2.5 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Free Profile Assessment & University Shortlisting</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> SOP / LOR Editing & Admissions Support</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> 100% Student Visa Filing & Mock Interviews</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> IELTS, TOEFL, GRE, GMAT Test Prep Coaching</span>
            </div>
          </div>

          <Button asChild size="lg" className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-full h-12 shadow-lg shadow-sky-500/25">
            <Link href="/education">
              Explore Educational Consultancy <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        {/* Service Card 2: Global Courier Services */}
        <div className="glass-ocean p-8 rounded-[40px] border border-amber-500/30 flex flex-col justify-between gap-6 hover:border-amber-400/60 transition-all hover:-translate-y-1">
          <div className="flex flex-col gap-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Plane className="h-8 w-8" />
            </div>

            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs px-3 py-1 rounded-full w-fit">
              Service Vertical 2
            </Badge>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Global Express Courier & Cargo
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-light">
              Doorstep pickup in Hyderabad ➔ Worldwide express doorstep delivery across 190+ countries.
            </p>

            <div className="flex flex-col gap-2.5 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Doctor Prescription Medicine Express</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Subsidized Student Excess Baggage Shipping</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Commercial Vacuum Packed Foods & Sweets</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Instant Rate Estimator & Live AWB Tracking</span>
            </div>
          </div>

          <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full h-12 shadow-lg shadow-amber-500/25">
            <Link href="/courier">
              Explore Courier Services <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

      </div>

    </div>
  );
}
