"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Globe,
  Loader2,
  Sparkles,
  Building2,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Zap,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ServiceCategory } from "@/lib/types/inquiry";
import canvasConfetti from "canvas-confetti";

function ContactFormContent() {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<ServiceCategory>("General Inquiry");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (serviceParam) {
      const lower = serviceParam.toLowerCase();
      if (lower.includes("courier")) {
        setCategory("Courier Logistics");
      } else if (lower.includes("education") || lower.includes("study")) {
        setCategory("Overseas Education");
      } else if (lower.includes("tourism") || lower.includes("visa")) {
        setCategory("Tourism & Visa");
      } else if (lower.includes("coaching") || lower.includes("prep")) {
        setCategory("Test Preparation Coaching");
      }
    }
  }, [serviceParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          email: email || null,
          service_category: category,
          subject: `${category} Direct Contact Inquiry`,
          message,
          metadata: {
            source_page: "/contact",
            service_query: serviceParam || "none",
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit inquiry.");
      }

      setSubmitted(true);
      try {
        canvasConfetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch { }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send message. Please contact us via phone or WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 items-stretch w-full">

      {/* ========================================================================= */}
      {/* LEFT COLUMN (ON DESKTOP) / BOTTOM (ON MOBILE): OFFICIAL CONTACT INFO */}
      {/* ========================================================================= */}
      <div className="order-2 lg:order-1 lg:col-span-5 flex flex-col">
        <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/80 shadow-xl shadow-slate-200/50 flex flex-col justify-between h-full gap-8">

          <div className="flex flex-col gap-6">
            <div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e1b4b] tracking-tight">
                Contact Information
              </h2>

            </div>

            {/* Address Box */}
            <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-4 hover:border-sky-300 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-sky-100/80 text-sky-700 flex items-center justify-center shrink-0 mt-0.5 border border-sky-200 shadow-2xs">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="text-xs sm:text-sm">
                <strong className="text-slate-900 font-extrabold block text-sm mb-1">
                  S.R Nagar Office
                </strong>
                <p className="text-slate-600 leading-relaxed font-medium">
                  S1 Kavitha Apartment, Vengal Rao Nagar, A Block Rd, S.R Nagar Metro Station, Hyderabad, Telangana – 500038
                </p>
              </div>
            </div>

            {/* Direct Phone & WhatsApp Callouts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <a
                href="tel:+919052703560"
                className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 hover:border-sky-300 transition-all flex flex-col gap-1 group"
              >
                <div className="flex items-center gap-2 text-sky-700">
                  <Phone className="h-4 w-4" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">
                    Direct Phone
                  </span>
                </div>
                <span className="font-mono font-black text-sm text-slate-900 group-hover:text-sky-700 transition-colors mt-1">
                  +91 90527 03560
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Instant Counselor Call
                </span>
              </a>

              <a
                href="https://wa.me/919052703561"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 hover:border-emerald-300 transition-all flex flex-col gap-1 group"
              >
                <div className="flex items-center gap-2 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">
                    WhatsApp Chat
                  </span>
                </div>
                <span className="font-mono font-black text-sm text-slate-900 group-hover:text-emerald-700 transition-colors mt-1">
                  +91 90527 03561
                </span>
                <span className="text-[11px] text-emerald-600 font-bold">
                  Live Chat & Rates
                </span>
              </a>
            </div>

            {/* Email & Portal */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col gap-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  Email:
                </span>
                <a
                  href="mailto:overtheseaconsultancy@gmail.com"
                  className="font-bold text-slate-900 hover:text-sky-600 truncate transition-colors"
                >
                  overtheseaconsultancy@gmail.com
                </a>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-200/60">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" />
                  Website:
                </span>
                <a
                  href="https://www.overthesea.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-slate-900 hover:text-sky-600 transition-colors"
                >
                  www.overthesea.in
                </a>
              </div>
            </div>

          </div>

          {/* Working Hours Badge */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              Mon – Sat: 9:30 AM – 7:30 PM IST
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Office Open
            </span>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN (ON DESKTOP) / TOP (ON MOBILE): SEND MESSAGE FORM */}
      {/* ========================================================================= */}
      <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col">
        <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/80 shadow-xl shadow-slate-200/50 flex flex-col justify-between h-full">

          <div>
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1e1b4b] tracking-tight">
                Send Us a Direct Message
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Fill in your details below. Our Hyderabad team will respond within 15 minutes.
              </p>
            </div>

            {/* Submission Success View */}
            {submitted ? (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-8 text-center flex flex-col items-center gap-4 animate-in fade-in-0 my-6">
                <div className="h-14 w-14 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Message Sent & Logged Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed font-medium">
                  Thank you, <strong className="text-slate-900">{fullName}</strong>. Your inquiry for <strong className="text-sky-700">{category}</strong> has been logged in our database. Our Hyderabad counselor team will contact you on <strong className="text-slate-900">{phone}</strong> shortly.
                </p>
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setFullName("");
                    setPhone("");
                    setEmail("");
                    setMessage("");
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6 h-10 mt-2 shadow-md cursor-pointer text-xs sm:text-sm"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {errorMsg}
                  </div>
                )}

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Your Name *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl h-11 text-xs sm:text-sm focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20 shadow-2xs font-medium transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Phone / WhatsApp *
                    </label>
                    <Input
                      required
                      type="tel"
                      placeholder="+91 90527 03560"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl h-11 text-xs sm:text-sm focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20 shadow-2xs font-mono font-medium transition-all"
                    />
                  </div>
                </div>

                {/* Email Address & Service Category Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>Email Address</span>
                      <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="rahul@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl h-11 text-xs sm:text-sm focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20 shadow-2xs font-medium transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Select Service *
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 rounded-xl h-11 px-4 pr-10 text-xs sm:text-sm font-semibold focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20 shadow-2xs transition-all cursor-pointer outline-none"
                      >
                        <option value="Overseas Education">🎓 Overseas Education</option>
                        <option value="Courier Logistics">📦 Courier Logistics</option>
                        <option value="Tourism & Visa">✈️ Tourism & Visa</option>
                        <option value="Test Preparation Coaching">📚 Test Prep Coaching</option>
                        <option value="General Inquiry">💬 General Inquiry</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message / Requirement */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Your Requirement / Query *
                  </label>
                  <Textarea
                    required
                    rows={8}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you need help with (e.g. Masters in USA, Doorstep UK courier pickup, IELTS Coaching, or Schengen Tourist Visa)..."
                    className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl text-xs sm:text-sm focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20 shadow-2xs font-medium leading-relaxed transition-all resize-none"
                  />
                </div>

                {/* Submit CTA Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-sky-600 via-[#6355d8] to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-sm sm:text-base mt-2 cursor-pointer shadow-lg shadow-sky-600/20 transition-all hover:scale-[1.005] active:scale-[0.995]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Logging Inquiry...
                    </>
                  ) : (
                    <>
                      <span>Send Direct Message</span>
                      <Send className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}

          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Secure 256-Bit Data Encryption
            </span>
            <span className="flex items-center gap-1 text-slate-500 font-medium">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Fast Response
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f1f5f9] via-[#f8fafc] to-[#ffffff] text-slate-900 pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<div className="text-center text-slate-400 py-12 font-medium">Loading form...</div>}>
          <ContactFormContent />
        </Suspense>
      </div>
    </div>
  );
}
