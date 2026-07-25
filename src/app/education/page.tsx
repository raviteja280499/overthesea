"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Award,
  Globe,
  FileCheck,
  CheckCircle2,
  Phone,
  Send,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  Compass,
  Building,
  Plane,
  BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import canvasConfetti from "canvas-confetti";
import ScrollAnimate from "@/components/ui/ScrollAnimate";

const destinations = [
  {
    country: "United States (USA)",
    flag: "🇺🇸",
    image: "/destinations/usa.png",
    intakes: "Fall (Aug/Sep), Spring (Jan/Feb)",
    workPermit: "OPT up to 3 Years (STEM), H1-B Pathway",
    popular: "Computer Science, Data Science, MBA, Biotech, Engineering",
    description: "Home to Ivy League universities and world-renowned research institutions with abundant post-study STEM OPT opportunities."
  },
  {
    country: "United Kingdom (UK)",
    flag: "🇬🇧",
    image: "/destinations/uk.png",
    intakes: "September, January",
    workPermit: "2-Year Graduate Route Post-Study Work Visa",
    popular: "Business Analytics, Finance, Law, AI, Healthcare",
    description: "1-Year Master's degrees from world top-ranked universities (Oxford, Cambridge, Imperial, LSE) with fast-track career entry."
  },
  {
    country: "Canada",
    flag: "🇨🇦",
    image: "/destinations/canada.png",
    intakes: "Fall (September), Winter (January), Summer (May)",
    workPermit: "Post-Graduation Work Permit (PGWP) up to 3 Years",
    popular: "Information Technology, Business Admin, Engineering, Health Sciences",
    description: "High quality of life, affordable tuition, and structured Express Entry permanent residency pathways for graduates."
  },
  {
    country: "Australia",
    flag: "🇦🇺",
    image: "/destinations/australia.png",
    intakes: "February, July, November",
    workPermit: "2 to 4-Year Temporary Graduate Visa (Subclass 485)",
    popular: "Cybersecurity, Project Management, Nursing, Public Health",
    description: "World-class universities (Group of 8), high standard of living, and strong post-graduation employment opportunities."
  },
  {
    country: "Germany",
    flag: "🇩🇪",
    image: "/destinations/germany.png",
    intakes: "Winter (October), Summer (April)",
    workPermit: "18-Month Job Seeking Visa Post Graduation",
    popular: "Automotive Engineering, Robotics, Renewable Energy, Tech",
    description: "Zero or low tuition fees at public universities, world leader in engineering, and robust industrial job market."
  },
  {
    country: "Ireland",
    flag: "🇮🇪",
    image: "/destinations/ireland.png",
    intakes: "September, January",
    workPermit: "2-Year Third Level Graduate Scheme (Stamp 1G)",
    popular: "Software Engineering, Pharmaceuticals, Cloud Computing",
    description: "European tech hub hosting global giants (Google, Apple, Meta, Pfizer) with attractive stay-back visas."
  }
];

const coreEducationServices = [
  {
    title: "Application and Admission Guidance",
    description: "Obtain assistance from our best study abroad consultants to complete an error-free application for your selected university, submit it, and keep you updated on its status.",
    image: "/services/admission-guidance.png"
  },
  {
    title: "Test Preparation",
    description: "Our comprehensive practice program is tailored to your exam needs, whether it is IELTS, TOEFL, ACT, GMAT, GRE, SAT, or any other test you may be taking. Through practice, our foreign education consultants will assist you in enhancing your abilities.",
    image: "/services/test-prep.png"
  },
  {
    title: "Visa Application",
    description: "With the assistance of our Visa experts, you will be able to fill out visa forms correctly and prepare your visa documentation in the correct order. Additionally, our foreign education consultants will help prepare for mock interviews and training sessions.",
    image: "/services/visa-application.png"
  },
  {
    title: "Pre-Departure Services",
    description: "Pre-departure briefings, insurances, currency conversions, accommodations and other services are all handled by our team before you land in your dream country.",
    image: "/services/pre-departure.png"
  },
  {
    title: "Financial AID and Scholarships",
    description: "After choosing one of the best study abroad programs, we can assist you find reliable educational loans to pursue further education abroad.",
    image: "/services/financial-aid.png"
  },
  {
    title: "Post Arrival Services",
    description: "As part of our foreign study abroad consultancy, we will take care of all details regarding your arrival in your dream country, including airport pickups, accommodation, and local city orientation.",
    image: "/services/post-arrival.png"
  }
];

export default function EducationalConsultancyPage() {
  const [studentName, setStudentName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [targetCountry, setTargetCountry] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !phone || !targetCountry) return;

    setBookingSuccess(true);
    canvasConfetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.7 }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* ========================================================================= */}
      {/* ULTRA-MODERN HERO SECTION WITH STADIUM IMAGE CONTAINER */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto gradient-ocean-hero rounded-b-[40px] md:rounded-b-[80px] shadow-2xl border-b border-sky-900/40 overflow-hidden">
        
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-sky-500/15 blur-[160px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 bg-sky-950/80 border border-sky-400/30 text-sky-300 text-xs px-4 py-1.5 rounded-full backdrop-blur-md w-fit">
              <GraduationCap className="h-4 w-4 text-cyan-400" />
              <span className="font-bold uppercase tracking-wider text-[11px]">
                Over the Sea Overseas Education Portal
              </span>
            </div>

            <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl text-white leading-tight">
              Study Abroad with <br />
              <span className="bg-gradient-to-r from-sky-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                World-Class Guidance
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
              Your gateway to top universities across the USA, UK, Canada, Australia, Germany, and Ireland. End-to-end support for profile evaluation, admissions, SOP/LOR drafting, 100% visa filing, and test coaching.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button asChild size="lg" className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-full h-12 px-8 shadow-lg shadow-sky-500/25">
                <a href="#eligibility">
                  Book Free Counselling <ArrowRight className="h-4 w-4 ml-1" />
                </a>
              </Button>

              <Button asChild variant="outline" size="lg" className="border-sky-400/40 text-sky-300 hover:bg-sky-950/50 font-bold rounded-full h-12 px-8">
                <a href="#destinations">
                  Explore Destinations
                </a>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-sky-900/40 grid grid-cols-3 gap-4 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan-400 shrink-0" />
                <span>100% Visa Filing Assistance</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-cyan-400 shrink-0" />
                <span>500+ Partner Universities</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-cyan-400 shrink-0" />
                <span>15+ Years Excellence</span>
              </div>
            </div>
          </div>

          {/* Right Column: Borderless Rounded Image */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md h-96 sm:h-[450px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/educational-consultancy.png"
                alt="Educational & Foreign Consultancy"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              
              <div className="absolute bottom-8 left-6 right-6 bg-slate-950/80 backdrop-blur-md p-4 rounded-3xl text-center shadow-xl">
                <span className="text-sm font-extrabold text-cyan-300 block">
                  🎓 Direct Admissions Gateway
                </span>
                <span className="text-xs text-slate-300">Fast-Track Student Visa & Scholarship Assistance</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SERVICES WE ARE PROVIDING (6 CORE SERVICES GRID) */}
      {/* ========================================================================= */}
      <ScrollAnimate>
        <section id="services-providing" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
              Comprehensive Overseas Consultancy
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-serif font-black text-white mt-3">
              Services We Are Providing
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2 font-light">
              End-to-end guidance from admission application to post-arrival support in your dream country.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreEducationServices.map((service, idx) => (
              <div
                key={idx}
                className="glass-ocean rounded-3xl overflow-hidden border border-sky-500/20 hover:border-sky-400/60 transition-all duration-300 hover:-translate-y-1.5 flex flex-col shadow-2xl group"
              >
                {/* Generated Service Image */}
                <div className="relative w-full h-56 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  <span className="absolute top-4 left-4 bg-sky-950/80 backdrop-blur-md text-cyan-300 font-extrabold text-xs px-3 py-1 rounded-full border border-sky-400/30 shadow-lg">
                    Service 0{idx + 1}
                  </span>
                </div>

                {/* Content Details */}
                <div className="p-7 flex flex-col justify-between flex-1 gap-4">
                  <div className="flex flex-col gap-2.5">
                    <h3 className="text-xl font-serif font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-sky-900/40">
                    <Button asChild size="sm" className="w-full bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 font-bold rounded-full border border-sky-400/30 transition-all">
                      <a href="#eligibility">Enquire About {service.title}</a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </ScrollAnimate>

      {/* ========================================================================= */}
      {/* 5-PILLAR OVERSEAS EDUCATION PROCESS (CURVED GLASS CARDS) */}
      {/* ========================================================================= */}
      <ScrollAnimate>
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
            Our 5-Pillar Overseas Process
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-white mt-3">
            From Hyderabad to Top Global Campuses
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Structured step-by-step roadmap for your dream university admission and student visa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          
          <div className="glass-ocean p-6 rounded-[32px] border border-sky-500/20 flex flex-col gap-4 hover:border-sky-400/60 transition-all hover:-translate-y-1">
            <div className="h-12 w-12 rounded-2xl bg-sky-500/20 text-cyan-300 flex items-center justify-center font-bold text-xl">
              1
            </div>
            <h3 className="font-bold text-lg text-white">Profile Evaluation</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              In-depth review of academic transcripts, test scores, work experience, and career goals to shortlist dream universities.
            </p>
          </div>

          <div className="glass-ocean p-6 rounded-[32px] border border-sky-500/20 flex flex-col gap-4 hover:border-sky-400/60 transition-all hover:-translate-y-1">
            <div className="h-12 w-12 rounded-2xl bg-sky-500/20 text-cyan-300 flex items-center justify-center font-bold text-xl">
              2
            </div>
            <h3 className="font-bold text-lg text-white">Admissions & SOP</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Professional crafting & editing of Statement of Purpose (SOP), Letters of Recommendation (LORs), and resume.
            </p>
          </div>

          <div className="glass-ocean p-6 rounded-[32px] border border-sky-500/20 flex flex-col gap-4 hover:border-sky-400/60 transition-all hover:-translate-y-1">
            <div className="h-12 w-12 rounded-2xl bg-sky-500/20 text-cyan-300 flex items-center justify-center font-bold text-xl">
              3
            </div>
            <h3 className="font-bold text-lg text-white">Student Visa Filing</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              100% guidance on visa documentation, DS-160/CAS processing, financial proofing, and mock visa interview sessions.
            </p>
          </div>

          <div className="glass-ocean p-6 rounded-[32px] border border-sky-500/20 flex flex-col gap-4 hover:border-sky-400/60 transition-all hover:-translate-y-1">
            <div className="h-12 w-12 rounded-2xl bg-sky-500/20 text-cyan-300 flex items-center justify-center font-bold text-xl">
              4
            </div>
            <h3 className="font-bold text-lg text-white">Test Prep Coaching</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Expert coaching for IELTS, TOEFL, PTE, GRE, and GMAT with structured study modules and mock exams.
            </p>
          </div>

          <div className="glass-ocean p-6 rounded-[32px] border border-sky-500/20 flex flex-col gap-4 hover:border-sky-400/60 transition-all hover:-translate-y-1">
            <div className="h-12 w-12 rounded-2xl bg-sky-500/20 text-cyan-300 flex items-center justify-center font-bold text-xl">
              5
            </div>
            <h3 className="font-bold text-lg text-white">Baggage & Courier</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Integrated discounted student excess baggage courier services directly to your overseas university dorm or apartment.
            </p>
          </div>

        </div>
      </section>
      </ScrollAnimate>

      {/* ========================================================================= */}
      {/* DESTINATIONS EXPLORER (STADIUM CARDS) */}
      {/* ========================================================================= */}
      <ScrollAnimate delay={100}>
        <section id="destinations" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-900/60 rounded-[40px] border border-slate-800">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
            Study Destinations
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-serif font-black text-white mt-3">
            Top Global Education Hubs
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Explore key intake timelines, post-study work permits, and popular courses across major countries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((d, index) => (
            <div
              key={index}
              className="glass-ocean rounded-[36px] overflow-hidden border border-sky-500/20 flex flex-col justify-between hover:border-sky-400/60 transition-all hover:-translate-y-1 shadow-2xl group"
            >
              {/* Destination University Image */}
              <div className="relative w-full h-52 overflow-hidden">
                <Image
                  src={d.image}
                  alt={`Study in ${d.country}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-sky-400/30 text-white shadow-md">
                  <span className="text-xl">{d.flag}</span>
                  <span className="text-xs font-bold uppercase tracking-wider">{d.country}</span>
                </div>
              </div>

              <div className="p-7 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    Study in {d.country}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4 font-light">
                    {d.description}
                  </p>

                  <div className="flex flex-col gap-2.5 text-xs text-slate-300 border-t border-sky-900/40 pt-4">
                    <div>
                      <strong className="text-sky-300">Intakes:</strong> {d.intakes}
                    </div>
                    <div>
                      <strong className="text-sky-300">Work Permit:</strong> {d.workPermit}
                    </div>
                    <div>
                      <strong className="text-sky-300">Popular Fields:</strong> {d.popular}
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-sky-900/40">
                  <Button asChild className="w-full bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 font-bold rounded-full border border-sky-400/30 transition-all">
                    <a href="#eligibility">Assess My Eligibility for {d.country}</a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      </ScrollAnimate>

      {/* ========================================================================= */}
      {/* FREE OVERSEAS ELIGIBILITY CHECK FORM (GLASS MORPHISM) */}
      {/* ========================================================================= */}
      <ScrollAnimate delay={100}>
        <section id="eligibility" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="glass-ocean p-8 sm:p-12 rounded-[48px] border-2 border-sky-500/30 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-sky-500/10 blur-[100px] pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-8">
            <Badge className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
              Free Eligibility Assessment
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-white mt-3">
              Get Your Overseas Study Plan
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2">
              Fill in your details to receive a free profile evaluation and university shortlist from our senior counsellors.
            </p>
          </div>

          {bookingSuccess ? (
            <div className="bg-sky-950/90 border border-sky-400/40 rounded-3xl p-8 text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="h-16 w-16 text-cyan-400" />
              <h3 className="text-2xl font-bold text-white">Assessment Request Received!</h3>
              <p className="text-slate-300 text-sm max-w-md">
                Thank you, <strong className="text-cyan-300">{studentName}</strong>. Our senior overseas education consultant will call you shortly at <strong className="text-cyan-300">{phone}</strong> for your profile review.
              </p>
              <Button onClick={() => setBookingSuccess(false)} variant="outline" className="border-sky-400/40 text-sky-300 hover:bg-sky-900 rounded-full font-bold mt-2">
                Submit Another Request
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-sky-300 uppercase tracking-wider">Student Name *</label>
                  <Input
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="bg-slate-900/80 border-sky-800/80 text-white rounded-2xl h-12 text-sm focus:border-sky-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-sky-300 uppercase tracking-wider">Phone Number *</label>
                  <Input
                    required
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-slate-900/80 border-sky-800/80 text-white rounded-2xl h-12 text-sm focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-sky-300 uppercase tracking-wider">Email Address</label>
                  <Input
                    type="email"
                    placeholder="rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-900/80 border-sky-800/80 text-white rounded-2xl h-12 text-sm focus:border-sky-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-sky-300 uppercase tracking-wider">Preferred Study Country *</label>
                  <Select onValueChange={setTargetCountry} required>
                    <SelectTrigger className="bg-slate-900/80 border-sky-800/80 text-white rounded-2xl h-12 text-sm">
                      <SelectValue placeholder="Select Target Country" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 text-white border-slate-800">
                      <SelectItem value="USA">United States (USA)</SelectItem>
                      <SelectItem value="UK">United Kingdom (UK)</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="Ireland">Ireland</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-full h-14 text-base shadow-lg shadow-sky-500/25 mt-4 cursor-pointer">
                Submit Free Profile Assessment <Send className="h-5 w-5 ml-2" />
              </Button>
            </form>
          )}

        </div>
      </section>
      </ScrollAnimate>

    </div>
  );
}
