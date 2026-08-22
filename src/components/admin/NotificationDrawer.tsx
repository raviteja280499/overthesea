"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  X,
  Bell,
  GraduationCap,
  Package,
  Compass,
  BookOpen,
  MessageSquare,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import { ContactInquiry, ServiceCategory, InquiryStatus } from "@/lib/types/inquiry";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inquiries?: ContactInquiry[];
  onRefresh?: () => void;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  inquiries: initialInquiries,
  onRefresh,
}: NotificationDrawerProps) {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>(initialInquiries || []);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Sync inquiries if passed as prop
  useEffect(() => {
    if (initialInquiries && initialInquiries.length > 0) {
      setInquiries(initialInquiries);
    } else if (isOpen) {
      fetchLatestInquiries();
    }
  }, [initialInquiries, isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const fetchLatestInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inquiries");
      const data = await res.json();
      if (data.success && data.data) {
        setInquiries(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch notification inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: InquiryStatus) => {
    try {
      const res = await fetch("/api/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Filter inquiries from the last 7 days
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const lastWeekInquiries = inquiries.filter((inq) => {
    if (!inq.created_at) return true;
    const time = new Date(inq.created_at).getTime();
    return isNaN(time) || time >= oneWeekAgo;
  });

  // Fallback: If no records match exact last 7 days timestamp, show top latest inquiries
  const displayInquiries = lastWeekInquiries.length > 0 ? lastWeekInquiries : inquiries;

  // Filter based on active drawer category
  const filteredList = displayInquiries.filter((inq) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "new") return inq.status === "new";
    return inq.service_category === activeFilter;
  });

  const newCount = displayInquiries.filter((i) => i.status === "new" || !i.status).length;

  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return "Recent";
    const date = new Date(dateString).getTime();
    if (isNaN(date)) return "Recent";
    const diffSec = Math.floor((Date.now() - date) / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getCategoryBadge = (category: ServiceCategory) => {
    switch (category) {
      case "Overseas Education":
        return {
          icon: <GraduationCap className="h-4 w-4" />,
          bgColor: "bg-indigo-50 text-indigo-600 border-indigo-100",
          iconBg: "bg-indigo-100 text-indigo-600",
          label: "Education",
        };
      case "Courier Logistics":
        return {
          icon: <Package className="h-4 w-4" />,
          bgColor: "bg-amber-50 text-amber-700 border-amber-100",
          iconBg: "bg-amber-100 text-amber-700",
          label: "Courier",
        };
      case "Tourism & Visa":
        return {
          icon: <Compass className="h-4 w-4" />,
          bgColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
          iconBg: "bg-emerald-100 text-emerald-700",
          label: "Tourism & Visa",
        };
      case "Test Preparation Coaching":
        return {
          icon: <BookOpen className="h-4 w-4" />,
          bgColor: "bg-purple-50 text-purple-700 border-purple-100",
          iconBg: "bg-purple-100 text-purple-700",
          label: "Coaching",
        };
      default:
        return {
          icon: <MessageSquare className="h-4 w-4" />,
          bgColor: "bg-slate-50 text-slate-700 border-slate-200",
          iconBg: "bg-slate-100 text-slate-600",
          label: "General",
        };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in-0 cursor-pointer"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-50">
        <aside className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-100 transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right-full">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[#6355d8] text-white flex items-center justify-center shadow-md shadow-[#6355d8]/30">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-sans font-extrabold text-base text-[#1e1b4b]">
                    Latest New Applications
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#6355d8] text-white">
                    {newCount} New
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Last 7 days new inquiries & apply stream
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={fetchLatestInquiries}
                title="Refresh List"
                className="p-2 rounded-xl text-slate-400 hover:text-[#6355d8] hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="px-5 py-3 bg-[#faf9ff] border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === "all"
                  ? "bg-[#6355d8] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-100"
              }`}
            >
              All ({displayInquiries.length})
            </button>
            <button
              onClick={() => setActiveFilter("new")}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === "new"
                  ? "bg-[#6355d8] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-100"
              }`}
            >
              🔵 New ({newCount})
            </button>
            <button
              onClick={() => setActiveFilter("Overseas Education")}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === "Overseas Education"
                  ? "bg-[#6355d8] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-100"
              }`}
            >
              🎓 Education
            </button>
            <button
              onClick={() => setActiveFilter("Courier Logistics")}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === "Courier Logistics"
                  ? "bg-[#6355d8] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-100"
              }`}
            >
              📦 Courier
            </button>
            <button
              onClick={() => setActiveFilter("Tourism & Visa")}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === "Tourism & Visa"
                  ? "bg-[#6355d8] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-100"
              }`}
            >
              ✈️ Visa
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5 divide-y divide-slate-50">
            {loading ? (
              <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <RefreshCw className="h-6 w-6 text-[#6355d8] animate-spin" />
                <span>Loading latest applications...</span>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <Sparkles className="h-8 w-8 text-slate-300" />
                <span className="font-bold text-slate-600">No applications found</span>
                <span>No new applications received for this filter.</span>
              </div>
            ) : (
              filteredList.map((inq) => {
                const badge = getCategoryBadge(inq.service_category);
                const cleanPhone = (inq.phone || "").replace(/\D/g, "");
                const isNew = inq.status === "new" || !inq.status;

                return (
                  <div
                    key={inq.id || inq.phone}
                    className={`pt-3.5 first:pt-0 p-3.5 rounded-2xl border transition-all ${
                      isNew
                        ? "bg-[#fcfbff] border-[#ece8ff] shadow-xs"
                        : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${badge.iconBg}`}
                        >
                          {badge.icon}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-[#1e1b4b] truncate">
                            {inq.full_name}
                          </h4>
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bgColor}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 shrink-0">
                        <Clock className="h-3 w-3" />
                        <span>{getRelativeTime(inq.created_at)}</span>
                      </div>
                    </div>

                    {/* Subject & Message Preview */}
                    {inq.subject && (
                      <p className="text-xs font-semibold text-slate-700 mb-1 line-clamp-1">
                        {inq.subject}
                      </p>
                    )}
                    {inq.message && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                        {inq.message}
                      </p>
                    )}

                    {/* Contact & Status Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <div className="flex items-center gap-2 text-slate-600 font-mono text-[11px]">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{inq.phone}</span>
                      </div>

                      {/* Status Dropdown/Selector */}
                      <select
                        value={inq.status || "new"}
                        onChange={(e) =>
                          inq.id && handleUpdateStatus(inq.id, e.target.value as InquiryStatus)
                        }
                        className={`text-[10px] font-bold rounded-lg px-2 py-1 border cursor-pointer focus:outline-none ${
                          inq.status === "resolved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : inq.status === "in_progress"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : inq.status === "contacted"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        <option value="new">🔵 New</option>
                        <option value="contacted">🟡 Contacted</option>
                        <option value="in_progress">🟣 In Progress</option>
                        <option value="resolved">🟢 Resolved</option>
                      </select>
                    </div>

                    {/* Quick Direct Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                          `Hi ${inq.full_name}! Thank you for reaching out to Over The Sea regarding ${inq.service_category}. How can we assist you today?`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
                        </svg>
                        <span>WhatsApp</span>
                      </a>

                      <a
                        href={`tel:${inq.phone}`}
                        className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Phone className="h-3 w-3" />
                        <span>Call</span>
                      </a>

                      <button
                        onClick={() => {
                          onClose();
                          router.push(`/admin/inquiries?search=${encodeURIComponent(inq.phone || inq.full_name)}`);
                        }}
                        className="py-1.5 px-3 rounded-xl bg-[#6355d8]/10 hover:bg-[#6355d8] text-[#6355d8] hover:text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Open CRM</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-100 bg-[#faf9ff] flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Showing {filteredList.length} of {displayInquiries.length} recent
            </span>

            <button
              onClick={() => {
                onClose();
                router.push("/admin/inquiries");
              }}
              className="py-2 px-4 rounded-xl bg-[#6355d8] hover:bg-[#5244ca] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#6355d8]/20 transition-all hover:scale-102 cursor-pointer"
            >
              <span>View All Inquiries in CRM</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </aside>
      </div>
    </div>
  );
}
