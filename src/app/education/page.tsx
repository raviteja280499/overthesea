"use client";

import { useState, useEffect } from "react";
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

const CountryFlagSVG = ({ code }: { code: string }) => {
  switch (code) {
    case "US":
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#bd3d44" d="M0 0h640v480H0z"/>
          <path stroke="#fff" strokeWidth="37" d="M0 55.5h640M0 129.5h640M0 203.5h640M0 277.5h640M0 351.5h640M0 425.5h640"/>
          <path fill="#192f5d" d="M0 0h256v259H0z"/>
          <g fill="#fff">
            <path d="M24.5 14.5l1.6 4.9h5.1l-4.1 3 1.6 4.9-4.2-3-4.1 3 1.6-4.9-4.1-3h5.1z"/>
            <path d="M67.1 14.5l1.6 4.9h5.1l-4.1 3 1.6 4.9-4.2-3-4.1 3 1.6-4.9-4.1-3h5.1z"/>
            <path d="M109.7 14.5l1.6 4.9h5.1l-4.1 3 1.6 4.9-4.2-3-4.1 3 1.6-4.9-4.1-3h5.1z"/>
            <path d="M152.3 14.5l1.6 4.9h5.1l-4.1 3 1.6 4.9-4.2-3-4.1 3 1.6-4.9-4.1-3h5.1z"/>
          </g>
        </svg>
      );
    case "GB":
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#012169" d="M0 0h640v480H0z"/>
          <path stroke="#fff" strokeWidth="60" d="m0 0 640 480M0 480 640 0"/>
          <path stroke="#c8102e" strokeWidth="40" d="m0 0 640 480M0 480 640 0"/>
          <path stroke="#fff" strokeWidth="100" d="M320 0v480M0 240h640"/>
          <path stroke="#c8102e" strokeWidth="60" d="M320 0v480M0 240h640"/>
        </svg>
      );
    case "CA":
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#d80621" d="M0 0h160v480H0zm480 0h160v480H480z"/>
          <path fill="#fff" d="M160 0h320v480H160z"/>
          <path fill="#d80621" d="M356 261l31 34-11 8 4 39-26-14-16 23-18-42-18 42-16-23-26 14 4-39-11-8 31-34-31-15 15-4 1-27 25 15 11-20 11 20 25-15 1 27 15 4z"/>
        </svg>
      );
    case "AU":
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#00008b" d="M0 0h640v480H0z"/>
          <path stroke="#fff" strokeWidth="40" d="m0 0 320 240M0 240 320 0"/>
          <path stroke="#cc0000" strokeWidth="20" d="m0 0 320 240M0 240 320 0"/>
          <path stroke="#fff" strokeWidth="60" d="M160 0v240M0 120h320"/>
          <path stroke="#cc0000" strokeWidth="36" d="M160 0v240M0 120h320"/>
        </svg>
      );
    case "DE":
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#000" d="M0 0h640v160H0z"/>
          <path fill="#dd0000" d="M0 160h640v160H0z"/>
          <path fill="#ffce00" d="M0 320h640v160H0z"/>
        </svg>
      );
    case "IE":
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#169b62" d="M0 0h213.3v480H0z"/>
          <path fill="#fff" d="M213.3 0h213.4v480H213.3z"/>
          <path fill="#ff883e" d="M426.7 0H640v480H426.7z"/>
        </svg>
      );
    case "NL":
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#21468b" d="M0 0h640v480H0z"/>
          <path fill="#fff" d="M0 0h640v320H0z"/>
          <path fill="#ae1c28" d="M0 0h640v160H0z"/>
        </svg>
      );
    case "FR":
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#ed2939" d="M0 0h640v480H0z"/>
          <path fill="#fff" d="M0 0h426.7v480H0z"/>
          <path fill="#002395" d="M0 0h213.3v480H0z"/>
        </svg>
      );
    case "SE":
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#006aa7" d="M0 0h640v480H0z"/>
          <path fill="#fecc00" d="M160 0h96v480h-96zM0 192h640v96H0z"/>
        </svg>
      );
    case "SG":
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#fff" d="M0 0h640v480H0z"/>
          <path fill="#ed2939" d="M0 0h640v240H0z"/>
          <circle cx="120" cy="120" r="70" fill="#fff"/>
          <circle cx="145" cy="120" r="70" fill="#ed2939"/>
        </svg>
      );
    case "NZ":
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#00247d" d="M0 0h640v480H0z"/>
          <path stroke="#fff" strokeWidth="40" d="m0 0 320 240M0 240 320 0"/>
          <path stroke="#cc0000" strokeWidth="20" d="m0 0 320 240M0 240 320 0"/>
          <path stroke="#fff" strokeWidth="60" d="M160 0v240M0 120h320"/>
          <path stroke="#cc0000" strokeWidth="36" d="M160 0v240M0 120h320"/>
        </svg>
      );
    case "JP":
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#fff" d="M0 0h640v480H0z"/>
          <circle cx="320" cy="240" r="144" fill="#bc002d"/>
        </svg>
      );
    case "CN":
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#ee1c25" d="M0 0h640v480H0z"/>
          <path fill="#ffde00" d="M96 72l8 24 24 2-18 16 6 24-20-14-20 14 6-24-18-16 24-2z"/>
        </svg>
      );
    case "RU":
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#d52b1e" d="M0 0h640v480H0z"/>
          <path fill="#0039a6" d="M0 0h640v320H0z"/>
          <path fill="#fff" d="M0 0h640v160H0z"/>
        </svg>
      );
    case "EU":
      return (
        <svg className="w-6 h-4 rounded-sm shadow-sm shrink-0 border border-white/20" viewBox="0 0 640 480">
          <path fill="#003399" d="M0 0h640v480H0z"/>
          <g fill="#ffcc00">
            <path d="M320 80l2 6 6 1-5 4 2 6-5-4-5 4 2-6-5-4 6-1z"/>
            <path d="M400 101l2 6 6 1-5 4 2 6-5-4-5 4 2-6-5-4 6-1z"/>
            <path d="M440 160l2 6 6 1-5 4 2 6-5-4-5 4 2-6-5-4 6-1z"/>
            <path d="M460 240l2 6 6 1-5 4 2 6-5-4-5 4 2-6-5-4 6-1z"/>
            <path d="M320 400l2 6 6 1-5 4 2 6-5-4-5 4 2-6-5-4 6-1z"/>
            <path d="M180 240l2 6 6 1-5 4 2 6-5-4-5 4 2-6-5-4 6-1z"/>
          </g>
        </svg>
      );
    default:
      return null;
  }
};

const destinations = [
  {
    country: "United States (USA)",
    code: "US",
    image: "/destinations/usa.png",
    intakes: "Fall (Aug/Sep), Spring (Jan/Feb)",
    workPermit: "OPT up to 3 Years (STEM), H1-B Pathway",
    popular: "Computer Science, Data Science, MBA, Biotech, Engineering",
    description: "Home to Ivy League universities and world-renowned research institutions with abundant post-study STEM OPT opportunities.",
    cardGradient: "bg-gradient-to-br from-sky-950/90 via-blue-950/60 to-slate-950",
    accentText: "text-sky-300",
    badgeBg: "bg-sky-950/90 border border-sky-400/30 text-sky-300",
    btnStyle: "bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-400/30"
  },
  {
    country: "United Kingdom (UK)",
    code: "GB",
    image: "/destinations/uk.png",
    intakes: "September, January",
    workPermit: "2-Year Graduate Route Post-Study Work Visa",
    popular: "Business Analytics, Finance, Law, AI, Healthcare",
    description: "1-Year Master's degrees from world top-ranked universities (Oxford, Cambridge, Imperial, LSE) with fast-track career entry.",
    cardGradient: "bg-gradient-to-br from-red-950/80 via-sky-950/50 to-slate-950",
    accentText: "text-red-300",
    badgeBg: "bg-red-950/90 border border-red-400/30 text-red-300",
    btnStyle: "bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-slate-950 border border-red-400/30"
  },
  {
    country: "Canada",
    code: "CA",
    image: "/destinations/canada.png",
    intakes: "Fall (September), Winter (January), Summer (May)",
    workPermit: "Post-Graduation Work Permit (PGWP) up to 3 Years",
    popular: "Information Technology, Business Admin, Engineering, Health Sciences",
    description: "High quality of life, affordable tuition, and structured Express Entry permanent residency pathways for graduates.",
    cardGradient: "bg-gradient-to-br from-rose-950/80 via-red-950/50 to-slate-950",
    accentText: "text-rose-300",
    badgeBg: "bg-rose-950/90 border border-rose-400/30 text-rose-300",
    btnStyle: "bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-slate-950 border border-rose-400/30"
  },
  {
    country: "Australia",
    code: "AU",
    image: "/destinations/australia.png",
    intakes: "February, July, November",
    workPermit: "2 to 4-Year Temporary Graduate Visa (Subclass 485)",
    popular: "Cybersecurity, Project Management, Nursing, Public Health",
    description: "World-class universities (Group of 8), high standard of living, and strong post-graduation employment opportunities.",
    cardGradient: "bg-gradient-to-br from-amber-950/80 via-emerald-950/50 to-slate-950",
    accentText: "text-amber-300",
    badgeBg: "bg-amber-950/90 border border-amber-400/30 text-amber-300",
    btnStyle: "bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-400/30"
  },
  {
    country: "Germany",
    code: "DE",
    image: "/destinations/germany.png",
    intakes: "Winter (October), Summer (April)",
    workPermit: "18-Month Job Seeking Visa Post Graduation",
    popular: "Automotive Engineering, Robotics, Renewable Energy, Tech",
    description: "Zero or low tuition fees at public universities, world leader in engineering, and robust industrial job market.",
    cardGradient: "bg-gradient-to-br from-yellow-950/80 via-amber-950/40 to-slate-950",
    accentText: "text-yellow-300",
    badgeBg: "bg-yellow-950/90 border border-yellow-400/30 text-yellow-300",
    btnStyle: "bg-yellow-500/20 hover:bg-yellow-500 text-yellow-300 hover:text-slate-950 border border-yellow-400/30"
  },
  {
    country: "Ireland",
    code: "IE",
    image: "/destinations/ireland.png",
    intakes: "September, January",
    workPermit: "2-Year Third Level Graduate Scheme (Stamp 1G)",
    popular: "Software Engineering, Pharmaceuticals, Cloud Computing",
    description: "European tech hub hosting global giants (Google, Apple, Meta, Pfizer) with attractive stay-back visas.",
    cardGradient: "bg-gradient-to-br from-emerald-950/80 via-teal-950/50 to-slate-950",
    accentText: "text-emerald-300",
    badgeBg: "bg-emerald-950/90 border border-emerald-400/30 text-emerald-300",
    btnStyle: "bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-400/30"
  },
  {
    country: "Netherlands",
    code: "NL",
    image: "/destinations/netherlands.png",
    intakes: "September, February",
    workPermit: "1-Year Orientation Year Visa (Zoekjaar)",
    popular: "International Business, AI, Water Management, Data Science",
    description: "Top English-taught programs in Europe (TU Delft, Amsterdam, Leiden) with high innovation and strong career prospects.",
    cardGradient: "bg-gradient-to-br from-orange-950/80 via-blue-950/50 to-slate-950",
    accentText: "text-orange-300",
    badgeBg: "bg-orange-950/90 border border-orange-400/30 text-orange-300",
    btnStyle: "bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-slate-950 border border-orange-400/30"
  },
  {
    country: "France",
    code: "FR",
    image: "/destinations/france.png",
    intakes: "September, January",
    workPermit: "2-Year Post-Study Work Visa (APS scheme)",
    popular: "Luxury Brand Management, Fashion, Business, Engineering",
    description: "World-renowned business schools (HEC, INSEAD) and subsidized public university tuition with rich cultural heritage.",
    cardGradient: "bg-gradient-to-br from-blue-950/80 via-indigo-950/50 to-slate-950",
    accentText: "text-indigo-300",
    badgeBg: "bg-indigo-950/90 border border-indigo-400/30 text-indigo-300",
    btnStyle: "bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-slate-950 border border-indigo-400/30"
  },
  {
    country: "Sweden",
    code: "SE",
    image: "/destinations/sweden.png",
    intakes: "August, January",
    workPermit: "1-Year Post-Study Work Permit for Job Hunting",
    popular: "Sustainable Tech, Green Energy, Mechanical Engineering, IT",
    description: "Innovation hub home to Spotify, Volvo, and IKEA with world-class research labs and high quality of living.",
    cardGradient: "bg-gradient-to-br from-sky-950/80 via-amber-950/30 to-slate-950",
    accentText: "text-amber-300",
    badgeBg: "bg-sky-950/90 border border-amber-400/30 text-amber-300",
    btnStyle: "bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-400/30"
  },
  {
    country: "Singapore",
    code: "SG",
    image: "/destinations/singapore.png",
    intakes: "August, January",
    workPermit: "Employment Pass / S-Pass Pathways",
    popular: "Fintech, Global Logistics, Computer Science, MBA",
    description: "Asia's financial capital with top global universities (NUS, NTU) offering unparalleled global corporate exposure.",
    cardGradient: "bg-gradient-to-br from-rose-950/80 via-red-950/40 to-slate-950",
    accentText: "text-rose-300",
    badgeBg: "bg-rose-950/90 border border-rose-400/30 text-rose-300",
    btnStyle: "bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-slate-950 border border-rose-400/30"
  },
  {
    country: "New Zealand",
    code: "NZ",
    image: "/destinations/new-zealand.png",
    intakes: "February, July",
    workPermit: "Up to 3-Year Post-Study Work Visa",
    popular: "Environmental Science, Agriculture, Hospitality, Software Tech",
    description: "Scenic beauty, 100% accredited universities (Auckland, Otago), and welcoming permanent residence pathways.",
    cardGradient: "bg-gradient-to-br from-teal-950/80 via-blue-950/50 to-slate-950",
    accentText: "text-teal-300",
    badgeBg: "bg-teal-950/90 border border-teal-400/30 text-teal-300",
    btnStyle: "bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-slate-950 border border-teal-400/30"
  },
  {
    country: "Japan",
    code: "JP",
    image: "/destinations/japan.png",
    intakes: "April, October",
    workPermit: "Designated Activities Work Visa / Highly Skilled Visa",
    popular: "Robotics, Electronics, AI, Automotive, Mechanical Design",
    description: "Global technological powerhouse (Univ of Tokyo, Kyoto) offering MEXT government scholarships and tech career entry.",
    cardGradient: "bg-gradient-to-br from-red-950/80 via-slate-900 to-slate-950",
    accentText: "text-red-300",
    badgeBg: "bg-red-950/90 border border-red-400/30 text-red-300",
    btnStyle: "bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-slate-950 border border-red-400/30"
  },
  {
    country: "China",
    code: "CN",
    image: "/destinations/china.png",
    intakes: "September, March",
    workPermit: "Z-Visa Work Permit Pathways for Top Grads",
    popular: "MBBS Medicine, Global Trade, AI, Telecom, Civil Engineering",
    description: "World-class ranking universities (Tsinghua, Peking) with generous CSC government scholarships and medical degrees.",
    cardGradient: "bg-gradient-to-br from-red-950/80 via-amber-950/40 to-slate-950",
    accentText: "text-amber-300",
    badgeBg: "bg-red-950/90 border border-amber-400/30 text-amber-300",
    btnStyle: "bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-400/30"
  },
  {
    country: "Russia",
    code: "RU",
    image: "/destinations/russia.png",
    intakes: "September, October",
    workPermit: "Student Work Rights + 3-Year Specialist Visa",
    popular: "MBBS General Medicine, Aerospace Engineering, Nuclear Physics",
    description: "Affordable WHO/NMC recognized medical degrees (Moscow State, Kazan) with zero entrance exam requirements.",
    cardGradient: "bg-gradient-to-br from-blue-950/80 via-red-950/40 to-slate-950",
    accentText: "text-sky-300",
    badgeBg: "bg-blue-950/90 border border-sky-400/30 text-sky-300",
    btnStyle: "bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-400/30"
  },
  {
    country: "European Union (EU Region)",
    code: "EU",
    image: "/destinations/eu.png",
    intakes: "September, October, February",
    workPermit: "EU Blue Card & Schengen 27-Country Mobility",
    popular: "International Law, Fashion, Biomedical Science, Architecture",
    description: "Gateway to 27 Schengen countries including Italy, Spain, Switzerland, Poland, Austria, and Finland with low-cost tuition.",
    cardGradient: "bg-gradient-to-br from-amber-950/80 via-blue-950/60 to-slate-950",
    accentText: "text-amber-300",
    badgeBg: "bg-blue-950/90 border border-amber-400/30 text-amber-300",
    btnStyle: "bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-400/30"
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

const allTestPrepCatalog = [
  {
    name: "IELTS",
    fullName: "International English Language Testing System",
    category: "English Proficiency",
    format: "Academic & General Training",
    duration: "4 - 8 Weeks",
    target: "7.5+ Band Target",
    description: "Master Listening, Reading, Writing & Speaking with certified master trainers, daily mock tests, and 1-on-1 speaking evaluation.",
    badge: "Most Popular",
    cardGradient: "bg-gradient-to-br from-cyan-950/90 via-sky-950/60 to-slate-950 border-cyan-500/40",
    accentText: "text-cyan-300",
    badgeStyle: "bg-cyan-950/80 text-cyan-300 border-cyan-400/40",
    btnStyle: "bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border-cyan-400/40"
  },
  {
    name: "GRE",
    fullName: "Graduate Record Examinations",
    category: "Graduate Entrance",
    format: "Computer-Based Shorter GRE",
    duration: "6 - 12 Weeks",
    target: "320+ Score Target",
    description: "Comprehensive Verbal Reasoning, Quantitative Reasoning & Analytical Writing preparation with adaptive test series.",
    badge: "Top Rated",
    cardGradient: "bg-gradient-to-br from-amber-950/90 via-orange-950/60 to-slate-950 border-amber-500/40",
    accentText: "text-amber-300",
    badgeStyle: "bg-amber-950/80 text-amber-300 border-amber-400/40",
    btnStyle: "bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border-amber-400/40"
  },
  {
    name: "TOEFL iBT",
    fullName: "Test of English as a Foreign Language",
    category: "English Proficiency",
    format: "Computer-Delivered Test",
    duration: "4 - 6 Weeks",
    target: "100+ Score Target",
    description: "Intensive training on accent comprehension, structured essay templates, and timed academic listening exercises.",
    badge: "USA Preferred",
    cardGradient: "bg-gradient-to-br from-emerald-950/90 via-teal-950/60 to-slate-950 border-emerald-500/40",
    accentText: "text-emerald-300",
    badgeStyle: "bg-emerald-950/80 text-emerald-300 border-emerald-400/40",
    btnStyle: "bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border-emerald-400/40"
  },
  {
    name: "PTE Academic",
    fullName: "Pearson Test of English Academic",
    category: "English Proficiency",
    format: "AI Scored Computer Test",
    duration: "3 - 5 Weeks",
    target: "79+ Score Target",
    description: "AI-scoring algorithm strategies, template mastery, and full-length simulated mock tests with instant score reports.",
    badge: "Fast Results",
    cardGradient: "bg-gradient-to-br from-purple-950/90 via-indigo-950/60 to-slate-950 border-purple-500/40",
    accentText: "text-purple-300",
    badgeStyle: "bg-purple-950/80 text-purple-300 border-purple-400/40",
    btnStyle: "bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-slate-950 border-purple-400/40"
  },
  {
    name: "Duolingo (DET)",
    fullName: "Duolingo English Test",
    category: "English Proficiency",
    format: "Online On-Demand Test",
    duration: "2 - 4 Weeks",
    target: "125+ Score Target",
    description: "Fast-track training for 1-hour online exam accepted by 4,000+ top universities across USA, UK, and Canada.",
    badge: "1-Hour Exam",
    cardGradient: "bg-gradient-to-br from-lime-950/90 via-emerald-950/60 to-slate-950 border-lime-500/40",
    accentText: "text-lime-300",
    badgeStyle: "bg-lime-950/80 text-lime-300 border-lime-400/40",
    btnStyle: "bg-lime-500/20 hover:bg-lime-500 text-lime-300 hover:text-slate-950 border-lime-400/40"
  },
  {
    name: "GMAT Focus",
    fullName: "Graduate Management Admission Test",
    category: "Business School",
    format: "Focus Edition (2h 15m)",
    duration: "8 - 12 Weeks",
    target: "685+ Score Target",
    description: "Data Insights, Quantitative, and Verbal Reasoning coaching specifically designed for top MBA & Masters admissions.",
    badge: "MBA Gateway",
    cardGradient: "bg-gradient-to-br from-rose-950/90 via-pink-950/60 to-slate-950 border-rose-500/40",
    accentText: "text-rose-300",
    badgeStyle: "bg-rose-950/80 text-rose-300 border-rose-400/40",
    btnStyle: "bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-slate-950 border-rose-400/40"
  },
  {
    name: "Digital SAT",
    fullName: "Scholastic Assessment Test",
    category: "Undergraduate Entrance",
    format: "Digital Adaptive Test",
    duration: "6 - 10 Weeks",
    target: "1450+ Score Target",
    description: "Digital SAT Reading & Writing and Math modules training with Desmos calculator strategies and practice drills.",
    badge: "Undergrad USA",
    cardGradient: "bg-gradient-to-br from-sky-950/90 via-blue-950/60 to-slate-950 border-sky-500/40",
    accentText: "text-sky-300",
    badgeStyle: "bg-sky-950/80 text-sky-300 border-sky-400/40",
    btnStyle: "bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border-sky-400/40"
  },
  {
    name: "ACT",
    fullName: "American College Testing",
    category: "Undergraduate Entrance",
    format: "Computer-Based Test",
    duration: "6 - 10 Weeks",
    target: "32+ Score Target",
    description: "English, Mathematics, Reading, and Science reasoning section coaching with speed strategies and diagnostic analytics.",
    badge: "Undergrad Prep",
    cardGradient: "bg-gradient-to-br from-orange-950/90 via-amber-950/60 to-slate-950 border-orange-500/40",
    accentText: "text-orange-300",
    badgeStyle: "bg-orange-950/80 text-orange-300 border-orange-400/40",
    btnStyle: "bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-slate-950 border-orange-400/40"
  }
];

const fivePillarProcess = [
  {
    step: "01",
    title: "Profile Evaluation",
    icon: Compass,
    description: "In-depth review of academic transcripts, GPA, test scores & budget to curate a personalized shortlist of target universities.",
    color: "bg-gradient-to-br from-cyan-950/80 via-sky-950/40 to-slate-950",
    accent: "text-cyan-300",
    badgeBg: "bg-cyan-950/90 border border-cyan-400/30 text-cyan-300",
    highlights: ["Transcript Audit", "Country Match", "Scholarships"]
  },
  {
    step: "02",
    title: "Admissions & SOP",
    icon: FileCheck,
    description: "Professional SOP, LOR, and resume drafting by senior editors to make your profile stand out to admission committees.",
    color: "bg-gradient-to-br from-sky-950/80 via-blue-950/40 to-slate-950",
    accent: "text-sky-300",
    badgeBg: "bg-sky-950/90 border border-sky-400/30 text-sky-300",
    highlights: ["1-on-1 SOP Writing", "LOR Editing", "Error-free Filing"]
  },
  {
    step: "03",
    title: "Test Preparation",
    icon: BookOpen,
    description: "Structured coaching for IELTS, GRE, TOEFL, PTE, GMAT & Duolingo with daily diagnostic tests and master trainer feedback.",
    color: "bg-gradient-to-br from-amber-950/80 via-orange-950/40 to-slate-950",
    accent: "text-amber-300",
    badgeBg: "bg-amber-950/90 border border-amber-400/30 text-amber-300",
    highlights: ["Live Classes", "Mock Tests", "Band Booster"]
  },
  {
    step: "04",
    title: "Student Visa Filing",
    icon: ShieldCheck,
    description: "100% guidance on visa forms, financial proofing, I-20 / CAS processing, and realistic 1-on-1 mock visa interview drills.",
    color: "bg-gradient-to-br from-emerald-950/80 via-teal-950/40 to-slate-950",
    accent: "text-emerald-300",
    badgeBg: "bg-emerald-950/90 border border-emerald-400/30 text-emerald-300",
    highlights: ["DS-160 & CAS Filing", "Financial Audit", "Mock Visa Drills"]
  },
  {
    step: "05",
    title: "Pre-Departure & Baggage",
    icon: Plane,
    description: "Foreign exchange, student travel insurance, housing booking, airport pickup, and discounted excess baggage courier.",
    color: "bg-gradient-to-br from-purple-950/80 via-indigo-950/40 to-slate-950",
    accent: "text-purple-300",
    badgeBg: "bg-purple-950/90 border border-purple-400/30 text-purple-300",
    highlights: ["Forex & Housing", "Flight Briefing", "Doorstep Baggage"]
  }
];

export default function EducationalConsultancyPage() {
  const [studentName, setStudentName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [targetCountry, setTargetCountry] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [heroIndex, setHeroIndex] = useState(0);
  const heroPhrases = [
    "Study in USA, UK & Canada ✈️",
    "100% Student Visa Approval Rate 🛡️",
    "Ivy League & Top Global Campuses 🏛️",
    "Zero Tuition Public German Universities 🇩🇪",
    "IELTS 7.5+ Band & GRE 320+ Score Boosters 🚀"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroPhrases.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

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
      {/* FULL-WIDTH ANIME ANIMATED HERO SECTION WITH FADE-IN ENTRANCE */}
      {/* ========================================================================= */}
      <ScrollAnimate delay={0}>
        <section className="relative w-full gradient-ocean-hero border-b border-sky-900/40 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-1000 ease-out">
          
          {/* Animated ambient lighting orbs */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-sky-500/15 blur-[160px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: "6s" }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:pt-20 md:pb-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Left Column: Text & CTAs */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              <div className="inline-flex items-center gap-2 bg-sky-950/80 border border-sky-400/30 text-sky-300 text-xs px-4 py-1.5 rounded-full backdrop-blur-md w-fit shadow-lg">
                <Sparkles className="h-4 w-4 text-amber-300 animate-spin" style={{ animationDuration: "8s" }} />
                <span className="font-bold uppercase tracking-wider text-[11px]">
                  Over the Sea Overseas Education Portal
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl text-white leading-tight">
                  Study Abroad with <br />
                  <span className="bg-gradient-to-r from-sky-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    World-Class Guidance
                  </span>
                </h1>

                {/* Robust Live Animated Phrase Banner (Fits 75% & 100% Zoom) */}
                <div className="min-h-[42px] flex items-center pt-1">
                  <div key={heroIndex} className="bg-sky-950/70 border border-sky-400/30 px-3.5 py-1.5 rounded-full backdrop-blur-md text-cyan-300 font-bold text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-2 duration-500 flex items-center gap-2.5 shadow-md max-w-full">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
                    </span>
                    <span className="truncate">{heroPhrases[heroIndex]}</span>
                  </div>
                </div>
              </div>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
                Your gateway to top universities across the USA, UK, Canada, Australia, Germany, and Ireland. End-to-end support for profile evaluation, admissions, SOP/LOR drafting, 100% visa filing, and test coaching.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button asChild size="lg" className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-full h-12 px-8 shadow-lg shadow-sky-500/25 transition-all hover:scale-105">
                  <a href="#eligibility">
                    Book Free Counselling <ArrowRight className="h-4 w-4 ml-1" />
                  </a>
                </Button>

                <Button asChild variant="outline" size="lg" className="border-sky-400/40 text-sky-300 hover:bg-sky-950/50 font-bold rounded-full h-12 px-8 transition-all hover:scale-105">
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

            {/* Right Column: Animated Image with Anime Floating Cards */}
            <div className="lg:col-span-5 flex justify-center relative">
              
              {/* Anime Floating Badge 1 (Top Right) */}
              <div className="absolute -top-4 -right-2 sm:right-2 z-20 animate-float-slow bg-slate-950/90 backdrop-blur-md border border-cyan-400/40 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-lg">
                  🏆
                </div>
                <div>
                  <p className="text-xs font-black text-white">#1 Overseas Partner</p>
                  <p className="text-[10px] text-slate-400">10,000+ Placed Students</p>
                </div>
              </div>

              {/* Anime Floating Badge 2 (Bottom Left) */}
              <div className="absolute -bottom-4 -left-2 sm:left-2 z-20 animate-float-reverse bg-slate-950/90 backdrop-blur-md border border-sky-400/40 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-lg">
                  ⚡
                </div>
                <div>
                  <p className="text-xs font-black text-white">Fast-Track I-20 / CAS</p>
                  <p className="text-[10px] text-slate-300">Direct University Entry</p>
                </div>
              </div>

              {/* Main Hero Stadium Image Container */}
              <div className="relative w-full max-w-md h-96 sm:h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-sky-500/20 group">
                <Image
                  src="/educational-consultancy.png"
                  alt="Educational & Foreign Consultancy"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 bg-slate-950/85 backdrop-blur-md p-4 rounded-2xl text-center shadow-xl border border-sky-400/30">
                  <span className="text-sm font-extrabold text-cyan-300 block mb-0.5">
                    🎓 Direct Admissions Gateway
                  </span>
                  <span className="text-xs text-slate-300">Fast-Track Student Visa & Scholarship Assistance</span>
                </div>
              </div>

            </div>

          </div>
        </section>
      </ScrollAnimate>

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
      {/* 5-PILLAR OVERSEAS EDUCATION PROCESS (CONNECTED MODERN STEP PIPELINE) */}
      {/* ========================================================================= */}
      <ScrollAnimate>
        <section id="process" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
              Our 5-Pillar Overseas Process
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-serif font-black text-white mt-3">
              From Hyderabad to Top Global Campuses
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2 font-light">
              Structured end-to-end roadmap designed for guaranteed university admissions & student visa approvals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative">
            {/* Desktop Connecting Beam Line */}
            <div className="hidden lg:block absolute top-12 left-10 right-10 h-0.5 bg-gradient-to-r from-cyan-500 via-emerald-500 to-purple-500 z-0 opacity-40" />

            {fivePillarProcess.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className={`relative z-10 p-6 rounded-2xl ${item.color} flex flex-col justify-between hover:-translate-y-2 transition-all duration-300 shadow-2xl group border-0`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-md ${item.badgeBg}`}>
                        Step {item.step}
                      </span>
                      <div className={`h-10 w-10 rounded-xl bg-slate-900/80 flex items-center justify-center ${item.accent} border border-white/10 group-hover:scale-110 transition-transform`}>
                        <IconComp className="h-5 w-5" />
                      </div>
                    </div>

                    <h3 className={`text-xl font-serif font-bold text-white mb-2 group-hover:${item.accent} transition-colors`}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-300 font-light leading-relaxed mb-4">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10">
                      {item.highlights.map((h, i) => (
                        <span key={i} className="text-[10px] font-medium text-slate-300 bg-slate-900/60 px-2 py-0.5 rounded-sm border border-white/5">
                          ✓ {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold group-hover:text-white transition-colors">Phase {idx + 1}</span>
                    <ArrowRight className={`h-3.5 w-3.5 ${item.accent} group-hover:translate-x-1 transition-transform`} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </ScrollAnimate>

      {/* ========================================================================= */}
      {/* ALL STUDY ABROAD TEST PREPARATION CATALOG (#coaching - HORIZONTAL AUTO MOVABLE) */}
      {/* ========================================================================= */}
      <ScrollAnimate delay={100}>
        <section id="coaching" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-5xl font-serif font-black text-white mt-3">
              Test Preparation Coaching Hub
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-2 font-light">
              Hover any test card to pause auto-scroll. Master IELTS, GRE, TOEFL, PTE, Duolingo, GMAT, SAT & ACT with certified master trainers.
            </p>
          </div>

          {/* Seamless Infinite Auto-Movable Horizontal Track */}
          <div className="relative w-full overflow-hidden no-scrollbar py-4">
            {/* Ambient edge fade masks */}
            <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee-horizontal flex gap-6">
              {[...allTestPrepCatalog, ...allTestPrepCatalog].map((test, index) => (
                <div
                  key={index}
                  className={`w-[320px] sm:w-[350px] shrink-0 p-6 rounded-3xl ${test.cardGradient} flex flex-col justify-between transition-all duration-300 hover:scale-105 shadow-2xl group`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${test.badgeStyle}`}>
                        {test.badge}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {test.category}
                      </span>
                    </div>

                    <h3 className={`text-2xl font-serif font-bold text-white group-hover:${test.accentText} transition-colors`}>
                      {test.name}
                    </h3>
                    <p className={`text-xs font-medium mb-3 ${test.accentText}`}>
                      {test.fullName}
                    </p>

                    <p className="text-xs text-slate-300 font-light leading-relaxed mb-4">
                      {test.description}
                    </p>

                    <div className="flex flex-col gap-2 text-xs text-slate-300 border-t border-white/10 pt-4">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Target Score:</span>
                        <strong className={test.accentText}>{test.target}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Duration:</span>
                        <strong className="text-white">{test.duration}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Format:</span>
                        <strong className="text-slate-200">{test.format}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/10">
                    <Button asChild className={`w-full font-bold rounded-full transition-all text-xs ${test.btnStyle}`}>
                      <a href="#eligibility">Enroll for {test.name} Coaching</a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollAnimate>

      {/* ========================================================================= */}
      {/* DESTINATIONS EXPLORER (STADIUM CARDS WITH SMALL BORDER RADIUS) */}
      {/* ========================================================================= */}
      <ScrollAnimate delay={100}>
        <section id="destinations" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-900/40 rounded-2xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs px-4 py-1.5 rounded-md font-bold uppercase tracking-wider">
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
              className={`rounded-2xl overflow-hidden ${d.cardGradient} flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-2xl group`}
            >
              {/* Destination University Image with Dedicated Border Radius */}
              <div className="relative w-full h-52 overflow-hidden rounded-t-2xl">
                <Image
                  src={d.image}
                  alt={`Study in ${d.country}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                <div className={`absolute top-4 left-4 flex items-center gap-2 backdrop-blur-md px-3 py-1.5 rounded-md ${d.badgeBg} shadow-md`}>
                  <CountryFlagSVG code={d.code} />
                  <span className="text-xs font-bold uppercase tracking-wider">{d.country}</span>
                </div>
              </div>

              <div className="p-7 flex flex-col justify-between flex-1">
                <div>
                  <h3 className={`text-2xl font-serif font-bold text-white mb-2 group-hover:${d.accentText} transition-colors`}>
                    Study in {d.country}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4 font-light">
                    {d.description}
                  </p>

                  <div className="flex flex-col gap-2.5 text-xs text-slate-300 border-t border-white/10 pt-4">
                    <div>
                      <strong className={d.accentText}>Intakes:</strong> {d.intakes}
                    </div>
                    <div>
                      <strong className={d.accentText}>Work Permit:</strong> {d.workPermit}
                    </div>
                    <div>
                      <strong className={d.accentText}>Popular Fields:</strong> {d.popular}
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10">
                  <Button asChild className={`w-full font-bold rounded-lg transition-all ${d.btnStyle}`}>
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
