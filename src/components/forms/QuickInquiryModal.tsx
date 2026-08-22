"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ServiceCategory } from "@/lib/types/inquiry";
import { Send, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import canvasConfetti from "canvas-confetti";

interface QuickInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: ServiceCategory;
  defaultSubject?: string;
  presetMetadata?: Record<string, any>;
  title?: string;
  subtitle?: string;
}

export default function QuickInquiryModal({
  isOpen,
  onClose,
  defaultCategory = "General Inquiry",
  defaultSubject = "",
  presetMetadata = {},
  title,
  subtitle,
}: QuickInquiryModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<ServiceCategory>(defaultCategory);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
          subject: defaultSubject || `${category} Inquiry`,
          message,
          metadata: {
            ...presetMetadata,
            submitted_from: typeof window !== "undefined" ? window.location.pathname : "",
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Submission failed");
      }

      setSubmitted(true);
      try {
        canvasConfetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please call us directly.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFullName("");
    setPhone("");
    setEmail("");
    setMessage("");
    setErrorMsg("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleReset()}>
      <DialogContent className="sm:max-w-lg bg-slate-950 border border-sky-500/30 text-white rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-sky-500/20 text-cyan-300 border border-sky-400/30 text-xs px-3 py-1 font-bold rounded-full">
              <Sparkles className="w-3 h-3 mr-1 text-cyan-400 inline" />
              {category}
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-serif font-black text-white">
            {title || `Connect for ${category}`}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-300">
            {subtitle || "Share your details below. Our Hyderabad specialist team will contact you within 15 minutes."}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center flex flex-col items-center gap-4 bg-sky-950/40 border border-sky-400/30 rounded-2xl p-6">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white">
              Inquiry Submitted Successfully!
            </h3>
            <p className="text-xs text-slate-300 max-w-sm">
              Thank you, <strong className="text-white">{fullName}</strong>. Your request for{" "}
              <span className="text-cyan-300 font-medium">{category}</span> has been logged. Our S.R Nagar office will connect with you shortly.
            </p>
            <Button
              onClick={handleReset}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-full px-8 mt-2"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Full Name *
                </label>
                <Input
                  required
                  placeholder="Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-slate-900 border-sky-900/80 text-white rounded-xl h-11 text-sm focus:border-sky-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Phone / WhatsApp *
                </label>
                <Input
                  required
                  type="tel"
                  placeholder="+91 90527 03560"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-slate-900 border-sky-900/80 text-white rounded-xl h-11 text-sm focus:border-sky-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900 border-sky-900/80 text-white rounded-xl h-11 text-sm focus:border-sky-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Service Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                  className="w-full h-11 px-3 bg-slate-900 border border-sky-900/80 rounded-xl text-xs text-white focus:border-sky-400 focus:outline-none"
                >
                  <option value="Overseas Education">Overseas Education</option>
                  <option value="Courier Logistics">Courier Logistics</option>
                  <option value="Tourism & Visa">Tourism & Visa</option>
                  <option value="Test Preparation Coaching">Test Preparation Coaching</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Message / Specific Requirements
              </label>
              <Textarea
                rows={3}
                placeholder="Tell us about your target university, parcel weight/pickup location, or travel destination..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-slate-900 border-sky-900/80 text-white rounded-xl text-sm focus:border-sky-400"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-extrabold rounded-xl h-12 text-sm shadow-lg cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting to Database...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Submit Direct Inquiry
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
