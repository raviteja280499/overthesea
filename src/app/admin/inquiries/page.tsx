"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  Phone,
  Share2,
  Download,
  PlusCircle,
  MoreHorizontal,
  ChevronDown,
  Trash2,
  Filter,
  GraduationCap,
  Package,
  Compass,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactInquiry, ServiceCategory, InquiryStatus } from "@/lib/types/inquiry";
import AdminTopBar from "@/components/admin/AdminTopBar";
import AddInquiryDrawer from "@/components/admin/AddInquiryDrawer";

export default function AllInquiriesCRMPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [addInquiryDrawerOpen, setAddInquiryDrawerOpen] = useState(false);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const authRes = await fetch("/api/admin/auth");
        if (!authRes.ok) {
          router.push("/admin/login");
          return;
        }
        await fetchInquiries();
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/admin/login");
      }
    };
    checkAuthAndFetch();
  }, [router]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      let url = "/api/inquiries?";
      if (categoryFilter !== "all") url += `category=${encodeURIComponent(categoryFilter)}&`;
      if (statusFilter !== "all") url += `status=${encodeURIComponent(statusFilter)}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

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
    const timer = setTimeout(() => fetchInquiries(), 250);
    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter, statusFilter]);

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
    if (!confirm("Are you sure you want to delete this record?")) return;
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
    const headers = ["ID", "Name", "Phone", "Email", "Category", "Subject", "Status", "Date", "Notes"];
    const rows = inquiries.map((i) => [
      i.id || "",
      `"${(i.full_name || "").replace(/"/g, '""')}"`,
      `"${i.phone || ""}"`,
      `"${i.email || ""}"`,
      `"${i.service_category || ""}"`,
      `"${(i.subject || "").replace(/"/g, '""')}"`,
      `"${i.status || ""}"`,
      `"${i.created_at || ""}"`,
      `"${(i.message || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `overthesea_all_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadge = (cat: ServiceCategory) => {
    switch (cat) {
      case "Overseas Education":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">🎓 Education</span>;
      case "Courier Logistics":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800">📦 Courier</span>;
      case "Tourism & Visa":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">✈️ Visa</span>;
      case "Test Preparation Coaching":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800">📚 Coaching</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">💬 General</span>;
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 flex flex-col xl:flex-row gap-8 w-full min-h-full">
      
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        
        {/* Top Header: Search Bar + Grid/List Toggle + Notification Bell + Avatar */}
        <AdminTopBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search across all leads, phone, email..."
          activeView="list"
          inquiries={inquiries}
          onRefresh={fetchInquiries}
        />

        {/* Top Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-sans font-black text-2xl sm:text-3xl text-[#1e1b4b]">
              All Unified Inquiries
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Complete customer inquiries, live database records, and cross-vertical leads.
            </p>
          </div>

          <Button
            onClick={() => setAddInquiryDrawerOpen(true)}
            className="bg-[#6355d8] hover:bg-[#5244ca] text-white font-bold text-xs h-10 px-5 rounded-2xl shadow-md shadow-[#6355d8]/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Inquiry</span>
          </Button>
        </div>

        {/* Global Multi-Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f8f9fd] p-3 rounded-2xl border border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 pl-2">
              <Filter className="h-3.5 w-3.5 text-[#6355d8]" />
              <span>Filters:</span>
            </span>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Overseas Education">🎓 Overseas Education</option>
              <option value="Courier Logistics">📦 Courier Logistics</option>
              <option value="Tourism & Visa">✈️ Tourism & Visa</option>
              <option value="Test Preparation Coaching">📚 Test Preparation</option>
              <option value="General Inquiry">💬 General Inquiries</option>
            </select>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="new">🔵 New</option>
              <option value="contacted">🟡 Contacted</option>
              <option value="in_progress">🟣 In Progress</option>
              <option value="resolved">🟢 Resolved</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchInquiries}
              title="Refresh"
              className="h-9 w-9 rounded-xl bg-white hover:bg-[#f0edff] text-slate-600 hover:text-[#6355d8] border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={exportCSV}
              className="h-9 px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="h-4 w-4 text-[#6355d8]" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Master Records Table */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 px-6 py-3.5 bg-white text-xs font-bold text-slate-400 border-b border-slate-100">
            <div className="col-span-5 flex items-center gap-1">
              <span>Client Name</span>
              <span className="text-[10px]">↑</span>
            </div>
            <div className="col-span-3">Category</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6 text-[#6355d8] animate-spin" />
              <span>Loading records...</span>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No inquiries found for selected criteria.
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
                      ${isSelected ? "bg-[#f8f7ff]" : "hover:bg-[#faf9ff]"}
                    `}
                  >
                    <div className="col-span-5 flex items-center gap-3.5 min-w-0 pr-2">
                      <div className="h-9 w-9 rounded-xl bg-[#1e1b4b] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {inq.full_name?.slice(0, 2).toUpperCase() || "CL"}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-[#1e1b4b] block truncate group-hover:text-[#6355d8] transition-colors">
                          {inq.full_name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono truncate block">
                          {inq.phone}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-3">
                      {getCategoryBadge(inq.service_category)}
                    </div>

                    <div className="col-span-2">
                      <select
                        value={inq.status || "new"}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(inq.id!, e.target.value as InquiryStatus)}
                        className="h-7 px-2 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 focus:border-[#6355d8] focus:outline-none shadow-2xs cursor-pointer"
                      >
                        <option value="new">🔵 New</option>
                        <option value="contacted">🟡 Contacted</option>
                        <option value="in_progress">🟣 In Progress</option>
                        <option value="resolved">🟢 Resolved</option>
                      </select>
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${inq.full_name}! Regarding your inquiry for ${inq.service_category} at Over The Sea:`)}`}
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

      {/* Right Column: Record Detail Inspector */}
      <div className="w-full xl:w-80 flex flex-col gap-6 select-none shrink-0">
        {selectedInquiry ? (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-4">
            <h3 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-2">
              Inquiry Dossier
            </h3>

            <div>
              <h4 className="font-extrabold text-base text-[#1e1b4b]">
                {selectedInquiry.full_name}
              </h4>
              <p className="text-xs text-[#6355d8] font-semibold mt-0.5">
                {selectedInquiry.service_category}
              </p>
            </div>

            <div className="bg-[#f8f9fd] p-3.5 rounded-2xl text-xs space-y-2 text-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono font-bold">{selectedInquiry.phone}</span>
              </div>
              {selectedInquiry.email && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="truncate max-w-[150px]">{selectedInquiry.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span>{selectedInquiry.created_at ? new Date(selectedInquiry.created_at).toLocaleDateString() : "Today"}</span>
              </div>
            </div>

            {selectedInquiry.subject && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Subject
                </span>
                <p className="text-xs font-semibold text-slate-800 bg-[#f8f9fd] p-2.5 rounded-xl border border-slate-100">
                  {selectedInquiry.subject}
                </p>
              </div>
            )}

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Client Message / Requirements
              </span>
              <p className="text-xs text-slate-600 bg-[#f8f9fd] p-3 rounded-xl border border-slate-100 leading-relaxed font-light">
                {selectedInquiry.message || "No additional message."}
              </p>
            </div>

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
                Call Phone
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center text-xs text-slate-400">
            Select any inquiry to inspect full record details.
          </div>
        )}
      </div>

      {/* Add Inquiry Side Drawer */}
      <AddInquiryDrawer
        isOpen={addInquiryDrawerOpen}
        onClose={() => setAddInquiryDrawerOpen(false)}
        onSuccess={fetchInquiries}
      />

    </div>
  );
}
