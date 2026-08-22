"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  RefreshCw,
  Phone,
  Compass,
  Download,
  PlusCircle,
  MoreHorizontal,
  ChevronDown,
  Trash2,
  MapPin,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactInquiry, InquiryStatus } from "@/lib/types/inquiry";
import AdminTopBar from "@/components/admin/AdminTopBar";

export default function TourismLeadsPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const authRes = await fetch("/api/admin/auth");
        if (!authRes.ok) {
          router.push("/admin/login");
          return;
        }
        await fetchLeads();
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/admin/login");
      }
    };
    checkAuthAndFetch();
  }, [router]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let url = `/api/inquiries?category=${encodeURIComponent("Tourism & Visa")}`;
      if (statusFilter !== "all") url += `&status=${encodeURIComponent(statusFilter)}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data) {
        setInquiries(data.data);
        if (data.data.length > 0 && !selectedInquiry) {
          setSelectedInquiry(data.data[0]);
        }
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchLeads(), 250);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
    try {
      const res = await fetch("/api/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
        );
        if (selectedInquiry?.id === id) {
          setSelectedInquiry((prev) => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this visa inquiry?")) return;
    try {
      const res = await fetch(`/api/inquiries?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setInquiries((prev) => prev.filter((i) => i.id !== id));
        if (selectedInquiry?.id === id) setSelectedInquiry(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportCSV = () => {
    if (inquiries.length === 0) return;
    const headers = ["ID", "Name", "Phone", "Email", "Subject", "Status", "Date", "Visa Notes"];
    const rows = inquiries.map((i) => [
      i.id || "",
      `"${(i.full_name || "").replace(/"/g, '""')}"`,
      `"${i.phone || ""}"`,
      `"${i.email || ""}"`,
      `"${(i.subject || "").replace(/"/g, '""')}"`,
      `"${i.status || ""}"`,
      `"${i.created_at || ""}"`,
      `"${(i.message || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `tourism_visa_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCount = inquiries.length;

  return (
    <div className="p-6 sm:p-8 lg:p-10 flex flex-col xl:flex-row gap-8 w-full min-h-full">
      
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        
        {/* Top Header: Search Bar + Grid/List Toggle + Notification Bell + Avatar */}
        <AdminTopBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search traveler, destination, phone..."
          activeView="grid"
          inquiries={inquiries}
          onRefresh={fetchLeads}
        />

        {/* Top Hero Banner with Transparent Right Corner Image Conforming to Border Radius */}
        <div className="bg-gradient-to-r from-[#059669] to-[#10b981] text-white p-8 rounded-3xl shadow-xl shadow-emerald-500/20 relative overflow-hidden flex items-center justify-between min-h-[160px]">
          
          <div className="max-w-lg relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3 backdrop-blur-xs">
              <Compass className="h-4 w-4" />
              <span>99.4% Tourist Visa Success</span>
            </div>
            <h1 className="font-sans font-black text-2xl sm:text-3xl leading-tight">
              Tourism & Express Visas
            </h1>
            <p className="text-xs text-white/90 font-medium mt-2 leading-relaxed">
              Express tourist visas, customized family holiday itineraries, flight bookings, and travel insurance.
            </p>
          </div>

          {/* Transparent Border Radius Based Right Corner Image */}
          <div className="absolute -right-2 -bottom-2 sm:right-0 sm:bottom-0 w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 opacity-30 sm:opacity-35 pointer-events-none rounded-br-3xl overflow-hidden select-none">
            <Image
              src="/tourism/hero.png"
              alt="Tourism & Visa Banner"
              fill
              className="object-contain object-bottom-right"
            />
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search traveler, destination, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#f8f9fd] border-transparent text-slate-900 placeholder:text-slate-400 rounded-2xl pl-10 pr-4 text-xs h-10 focus:border-[#059669] focus:bg-white transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="bg-[#ecfdf5] p-1 rounded-2xl flex items-center gap-1 border border-[#a7f3d0]">
              {["all", "new", "in_progress", "resolved"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-white text-[#059669] shadow-xs"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>

            <button
              onClick={fetchLeads}
              title="Refresh"
              className="h-10 w-10 rounded-2xl bg-[#f8f9fd] hover:bg-[#ecfdf5] text-slate-600 hover:text-[#059669] flex items-center justify-center transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={exportCSV}
              className="h-10 px-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="h-4 w-4 text-[#059669]" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Tourism Leads Table */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 px-6 py-3.5 bg-white text-xs font-bold text-slate-400 border-b border-slate-100">
            <div className="col-span-5 flex items-center gap-1">
              <span>Traveler & Destination</span>
              <span className="text-[10px]">↑</span>
            </div>
            <div className="col-span-3">Phone / Contact</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6 text-[#059669] animate-spin" />
              <span>Loading tourist visa applicants...</span>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No visa inquiries match your filters.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {inquiries.map((inq) => {
                const cleanPhone = (inq.phone || "").replace(/\D/g, "");
                const isSelected = selectedInquiry?.id === inq.id;

                return (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedInquiry(inq)}
                    className={`
                      grid grid-cols-12 items-center px-6 py-4 transition-colors cursor-pointer group
                      ${isSelected ? "bg-[#ecfdf5]/60" : "hover:bg-[#faf9ff]"}
                    `}
                  >
                    <div className="col-span-5 flex items-center gap-3.5 min-w-0 pr-2">
                      <div className="h-9 w-9 rounded-xl bg-[#dcfce7] text-[#16a34a] flex items-center justify-center font-bold text-xs shrink-0">
                        <Compass className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-[#1e1b4b] block truncate group-hover:text-[#059669] transition-colors">
                          {inq.full_name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium truncate block">
                          {inq.subject || inq.message || "Express Tourist Visa Lead"}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-3 text-xs text-slate-500 font-medium truncate font-mono">
                      {inq.phone}
                    </div>

                    <div className="col-span-2">
                      <select
                        value={inq.status || "new"}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(inq.id!, e.target.value as InquiryStatus)}
                        className="h-7 px-2 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 focus:border-[#059669] focus:outline-none shadow-2xs cursor-pointer"
                      >
                        <option value="new">🔵 New</option>
                        <option value="contacted">🟡 Contacted</option>
                        <option value="in_progress">🟣 Processing</option>
                        <option value="resolved">🟢 Approved</option>
                      </select>
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${inq.full_name}! Reaching out regarding your Tourist Visa Inquiry at Over The Sea:`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-lg transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
                        </svg>
                      </a>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          inq.id && handleDelete(inq.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Right Column: Top Destinations & Inspector */}
      <div className="w-full xl:w-80 flex flex-col gap-6 select-none shrink-0">
        
        {selectedInquiry && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-4">
            <h3 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-2">
              Traveler Inspector
            </h3>

            <div>
              <h4 className="font-extrabold text-base text-[#1e1b4b]">
                {selectedInquiry.full_name}
              </h4>
              <p className="text-xs text-[#059669] font-semibold mt-0.5">
                {selectedInquiry.email || "Tourist Visa Applicant"}
              </p>
            </div>

            <div className="bg-[#ecfdf5] p-3.5 rounded-2xl text-xs space-y-2 text-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono font-bold">{selectedInquiry.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span>{selectedInquiry.created_at ? new Date(selectedInquiry.created_at).toLocaleDateString() : "Today"}</span>
              </div>
            </div>

            {selectedInquiry.message && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Trip / Visa Requirements
                </span>
                <p className="text-xs text-slate-600 bg-[#f8f9fd] p-3 rounded-xl border border-slate-100 leading-relaxed font-light">
                  {selectedInquiry.message}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href={`https://wa.me/${(selectedInquiry.phone || "").replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 bg-[#25D366] text-white rounded-xl text-xs font-bold text-center shadow-xs"
              >
                WhatsApp
              </a>
              <a
                href={`tel:${selectedInquiry.phone}`}
                className="py-2.5 bg-[#1e1b4b] text-white rounded-xl text-xs font-bold text-center shadow-xs"
              >
                Call
              </a>
            </div>
          </div>
        )}

        {/* Top Visa Destinations */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-3">
          <h3 className="font-extrabold text-sm text-[#1e1b4b] flex items-center justify-between">
            <span>Popular Holiday Visas</span>
            <Compass className="h-4 w-4 text-[#059669]" />
          </h3>

          <div className="space-y-2.5 text-xs pt-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ecfdf5]">
              <span className="font-bold text-slate-800">🇦🇪 Dubai & Abu Dhabi</span>
              <span className="font-mono font-bold text-[#059669]">24-48 Hrs</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ecfdf5]">
              <span className="font-bold text-slate-800">🇸🇬 Singapore e-Visa</span>
              <span className="font-mono font-bold text-[#059669]">3-4 Days</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ecfdf5]">
              <span className="font-bold text-slate-800">🇹🇭 Thailand Tourist</span>
              <span className="font-mono font-bold text-[#059669]">Instant</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ecfdf5]">
              <span className="font-bold text-slate-800">🇪🇺 Schengen Europe</span>
              <span className="font-mono font-bold text-[#059669]">10-15 Days</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
