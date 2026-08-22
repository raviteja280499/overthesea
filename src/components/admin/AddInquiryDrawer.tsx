"use client";

import { useState, useEffect } from "react";
import {
  X,
  PlusCircle,
  Send,
  Loader2,
  CheckCircle2,
  GraduationCap,
  Package,
  Compass,
  BookOpen,
  MessageSquare,
  Sparkles,
  Phone,
  Mail,
  User,
  Tag,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ContactInquiry, ServiceCategory, InquiryStatus } from "@/lib/types/inquiry";
import canvasConfetti from "canvas-confetti";

interface AddInquiryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultCategory?: ServiceCategory;
}

export default function AddInquiryDrawer({
  isOpen,
  onClose,
  onSuccess,
  defaultCategory = "Overseas Education",
}: AddInquiryDrawerProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<ServiceCategory>(defaultCategory);
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState<InquiryStatus>("new");
  const [message, setMessage] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [packageWeight, setPackageWeight] = useState("");
  const [examType, setExamType] = useState("IELTS");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleResetAndClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleResetAndClose = () => {
    setSubmitted(false);
    setFullName("");
    setPhone("");
    setEmail("");
    setCategory(defaultCategory);
    setSubject("");
    setStatus("new");
    setMessage("");
    setDestinationCountry("");
    setPackageWeight("");
    setErrorMsg("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const metadata: Record<string, any> = {
      created_by: "Admin Portal",
    };

    if (category === "Overseas Education" && destinationCountry) {
      metadata.target_country = destinationCountry;
    } else if (category === "Courier Logistics") {
      if (destinationCountry) metadata.dest_country = destinationCountry;
      if (packageWeight) metadata.weight_kg = parseFloat(packageWeight) || packageWeight;
    } else if (category === "Tourism & Visa" && destinationCountry) {
      metadata.dest_country = destinationCountry;
    } else if (category === "Test Preparation Coaching" && examType) {
      metadata.exam_type = examType;
    }

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          service_category: category,
          subject: subject.trim() || `${category} Lead`,
          message: message.trim() || null,
          status,
          metadata,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create inquiry");
      }

      setSubmitted(true);
      try {
        canvasConfetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}

      if (onSuccess) {
        onSuccess();
      }

      // Auto close after 1.5s
      setTimeout(() => {
        handleResetAndClose();
      }, 1400);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to record inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        onClick={handleResetAndClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in-0 cursor-pointer"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-50">
        <aside className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-100 transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right-full">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[#6355d8] text-white flex items-center justify-center shadow-md shadow-[#6355d8]/30">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-sans font-extrabold text-base text-[#1e1b4b]">
                  Add Inquiry
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Direct entry into Over The Sea live CRM database
                </p>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {submitted ? (
              <div className="py-12 text-center flex flex-col items-center gap-3 bg-[#f7f6ff] border border-[#ece8ff] rounded-3xl p-6 my-auto">
                <div className="h-16 w-16 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h3 className="text-lg font-extrabold text-[#1e1b4b]">
                  Inquiry Added Successfully!
                </h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Record for <strong className="text-[#1e1b4b]">{fullName}</strong> has been logged to the database and is live on your CRM dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {errorMsg && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {errorMsg}
                  </div>
                )}

                {/* Service Category */}
                <div>
                  <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                    Service Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#6355d8]/20 focus:border-[#6355d8] cursor-pointer"
                  >
                    <option value="Overseas Education">🎓 Overseas Education</option>
                    <option value="Courier Logistics">📦 Courier Logistics</option>
                    <option value="Tourism & Visa">✈️ Tourism & Visa</option>
                    <option value="Test Preparation Coaching">📚 Test Preparation Coaching</option>
                    <option value="General Inquiry">💬 General Inquiry</option>
                  </select>
                </div>

                {/* Client Full Name */}
                <div>
                  <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                    Client Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      required
                      placeholder="e.g. Ramesh Varma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl h-11 pl-10 text-xs sm:text-sm focus:border-[#6355d8] shadow-2xs"
                    />
                  </div>
                </div>

                {/* Phone & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                      Phone / WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        required
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl h-11 pl-10 text-xs sm:text-sm focus:border-[#6355d8] shadow-2xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="client@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl h-11 pl-10 text-xs sm:text-sm focus:border-[#6355d8] shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Subject & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                      Subject / Purpose
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="e.g. Fall '26 MS in USA"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl h-11 pl-10 text-xs sm:text-sm focus:border-[#6355d8] shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                      Initial Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as InquiryStatus)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#6355d8]/20 focus:border-[#6355d8] cursor-pointer"
                    >
                      <option value="new">🔵 New</option>
                      <option value="contacted">🟡 Contacted</option>
                      <option value="in_progress">🟣 In Progress</option>
                      <option value="resolved">🟢 Resolved</option>
                    </select>
                  </div>
                </div>

                {/* Category Dynamic Context Fields */}
                {category === "Overseas Education" && (
                  <div>
                    <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                      Target Destination Country
                    </label>
                    <Input
                      placeholder="e.g. USA, UK, Canada, Germany, Australia"
                      value={destinationCountry}
                      onChange={(e) => setDestinationCountry(e.target.value)}
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl h-11 text-xs sm:text-sm focus:border-[#6355d8] shadow-2xs"
                    />
                  </div>
                )}

                {category === "Courier Logistics" && (
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                        Destination Country
                      </label>
                      <Input
                        placeholder="e.g. United Kingdom"
                        value={destinationCountry}
                        onChange={(e) => setDestinationCountry(e.target.value)}
                        className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl h-11 text-xs sm:text-sm focus:border-[#6355d8] shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                        Weight (kg)
                      </label>
                      <Input
                        placeholder="e.g. 5.5"
                        value={packageWeight}
                        onChange={(e) => setPackageWeight(e.target.value)}
                        className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl h-11 text-xs sm:text-sm focus:border-[#6355d8] shadow-2xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {category === "Tourism & Visa" && (
                  <div>
                    <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                      Travel Destination / Visa Type
                    </label>
                    <Input
                      placeholder="e.g. Dubai Express Tourist Visa"
                      value={destinationCountry}
                      onChange={(e) => setDestinationCountry(e.target.value)}
                      className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl h-11 text-xs sm:text-sm focus:border-[#6355d8] shadow-2xs"
                    />
                  </div>
                )}

                {category === "Test Preparation Coaching" && (
                  <div>
                    <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                      Exam Type
                    </label>
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#6355d8]/20 focus:border-[#6355d8] cursor-pointer"
                    >
                      <option value="IELTS">IELTS Master Training</option>
                      <option value="GRE">GRE General Test</option>
                      <option value="PTE">PTE Academic</option>
                      <option value="TOEFL">TOEFL iBT</option>
                      <option value="Duolingo">Duolingo English Test</option>
                    </select>
                  </div>
                )}

                {/* Specific Notes & Message */}
                <div>
                  <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                    Detailed Inquiry / Internal Notes
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Enter customer specific requirements, call notes, or follow-up tasks..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl text-xs sm:text-sm focus:border-[#6355d8] shadow-2xs leading-relaxed"
                  />
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#6355d8] hover:bg-[#5244ca] text-white font-extrabold text-xs sm:text-sm h-11 rounded-xl shadow-md shadow-[#6355d8]/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving to Database...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" /> Save & Record Inquiry
                      </>
                    )}
                  </Button>
                </div>

              </form>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-[#faf9ff] flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span>Real-time database sync</span>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
          </div>

        </aside>
      </div>
    </div>
  );
}
