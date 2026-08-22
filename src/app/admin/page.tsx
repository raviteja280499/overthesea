"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Download,
  ExternalLink,
  LogOut,
  Layers,
  GraduationCap,
  Plane,
  Compass,
  BookOpen,
  MessageSquare,
  Sparkles,
  Database,
  ArrowUpDown,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactInquiry, ServiceCategory, InquiryStatus } from "@/lib/types/inquiry";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Check auth & load data
  useEffect(() => {
    const verifyAuthAndFetch = async () => {
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

    verifyAuthAndFetch();
  }, [router]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      let url = "/api/inquiries?";
      if (selectedCategory !== "all") url += `category=${encodeURIComponent(selectedCategory)}&`;
      if (selectedStatus !== "all") url += `status=${encodeURIComponent(selectedStatus)}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data) {
        setInquiries(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInquiries();
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedStatus, searchTerm]);

  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const res = await fetch(`/api/inquiries?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setInquiries((prev) => prev.filter((inq) => inq.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete inquiry:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const exportCSV = () => {
    if (inquiries.length === 0) return;
    const headers = ["ID", "Name", "Phone", "Email", "Category", "Subject", "Status", "Created At", "Message"];
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
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `overthesea_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics
  const totalCount = inquiries.length;
  const newCount = inquiries.filter((i) => i.status === "new").length;
  const eduCount = inquiries.filter((i) => i.service_category === "Overseas Education").length;
  const courierCount = inquiries.filter((i) => i.service_category === "Courier Logistics").length;
  const tourismCount = inquiries.filter((i) => i.service_category === "Tourism & Visa").length;

  const getCategoryBadge = (cat: ServiceCategory) => {
    switch (cat) {
      case "Overseas Education":
        return <Badge className="bg-sky-500/20 text-sky-300 border-sky-400/30">🎓 Education</Badge>;
      case "Courier Logistics":
        return <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30">📦 Courier</Badge>;
      case "Tourism & Visa":
        return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">✈️ Tourism & Visa</Badge>;
      case "Test Preparation Coaching":
        return <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">📚 Test Prep</Badge>;
      default:
        return <Badge className="bg-slate-700/50 text-slate-300 border-slate-600">💬 General</Badge>;
    }
  };

  const getStatusBadge = (status?: InquiryStatus) => {
    switch (status) {
      case "new":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-cyan-300 border border-cyan-400/30">🔵 New Lead</span>;
      case "contacted":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-yellow-500/20 text-amber-300 border border-amber-400/30">🟡 Contacted</span>;
      case "in_progress":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">🟣 In Progress</span>;
      case "resolved":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">🟢 Resolved</span>;
      case "archived":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">⚪ Archived</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-cyan-300">🔵 New</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-ocean p-6 sm:p-8 rounded-[32px] border border-sky-500/30 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-cyan-500/20 border border-sky-400/30 flex items-center justify-center text-cyan-300 shadow-md">
            <Database className="h-7 w-7 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">
                Admin Leads & Database Portal
              </h1>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] uppercase font-bold">
                Live Supabase Connected
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Project Reference: <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded">lrxsjuulqtldvnetdtof</code> • Managing all service contact submissions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchInquiries}
            variant="outline"
            size="sm"
            className="border-sky-800 text-sky-300 hover:bg-sky-950 rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>

          <Button
            onClick={exportCSV}
            variant="outline"
            size="sm"
            className="border-sky-800 text-cyan-300 hover:bg-sky-950 rounded-xl"
          >
            <Download className="h-4 w-4 mr-1.5" /> Export CSV
          </Button>

          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-rose-800/80 text-rose-300 hover:bg-rose-950 rounded-xl cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-1.5" /> Logout
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-ocean p-5 rounded-2xl border border-sky-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase">Total Leads</span>
            <Layers className="h-4 w-4 text-sky-400" />
          </div>
          <p className="text-3xl font-serif font-black text-white mt-2">{totalCount}</p>
        </div>

        <div className="glass-ocean p-5 rounded-2xl border border-cyan-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-cyan-300 font-bold uppercase">Action Required</span>
            <Sparkles className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-serif font-black text-cyan-300 mt-2">{newCount}</p>
        </div>

        <div className="glass-ocean p-5 rounded-2xl border border-sky-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-sky-300 font-bold uppercase">Education</span>
            <GraduationCap className="h-4 w-4 text-sky-400" />
          </div>
          <p className="text-3xl font-serif font-black text-sky-300 mt-2">{eduCount}</p>
        </div>

        <div className="glass-ocean p-5 rounded-2xl border border-amber-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-300 font-bold uppercase">Courier</span>
            <Plane className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-3xl font-serif font-black text-amber-300 mt-2">{courierCount}</p>
        </div>

        <div className="glass-ocean p-5 rounded-2xl border border-emerald-500/20 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-300 font-bold uppercase">Tourism & Visa</span>
            <Compass className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-serif font-black text-emerald-300 mt-2">{tourismCount}</p>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="glass-ocean p-6 rounded-[28px] border border-sky-500/20 shadow-xl flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by name, phone, message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-900 border-sky-900/80 text-white rounded-xl pl-10 text-xs h-11 focus:border-sky-400"
          />
        </div>

        {/* Category & Status Filter Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-sky-900/80 text-white rounded-xl text-xs h-11 px-3 focus:border-sky-400 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Overseas Education">Overseas Education</option>
              <option value="Courier Logistics">Courier Logistics</option>
              <option value="Tourism & Visa">Tourism & Visa</option>
              <option value="Test Preparation Coaching">Test Preparation Coaching</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 border border-sky-900/80 text-white rounded-xl text-xs h-11 px-3 focus:border-sky-400 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="new">🔵 New</option>
              <option value="contacted">🟡 Contacted</option>
              <option value="in_progress">🟣 In Progress</option>
              <option value="resolved">🟢 Resolved</option>
              <option value="archived">⚪ Archived</option>
            </select>
          </div>
        </div>

      </div>

      {/* Inquiries Cards & Table */}
      <div className="glass-ocean rounded-[32px] border border-sky-500/20 p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <span>Inquiries Database</span>
            <Badge className="bg-sky-500/20 text-sky-300 font-mono text-xs">{inquiries.length} results</Badge>
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-20 flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 text-sky-400 animate-spin" />
            <p className="text-xs text-slate-400">Loading submissions from database...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-sky-900/30 p-8 flex flex-col items-center gap-3">
            <AlertCircle className="h-10 w-10 text-slate-500" />
            <h3 className="text-lg font-bold text-white">No inquiries found</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              No records match your selected filters. Submit a test inquiry on any service page or clear your search term.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {inquiries.map((inq) => {
              const cleanPhone = (inq.phone || "").replace(/\D/g, "");
              const formattedDate = inq.created_at
                ? new Date(inq.created_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Recent";

              return (
                <div
                  key={inq.id}
                  className="bg-slate-900/70 hover:bg-slate-900 border border-sky-900/50 hover:border-sky-500/40 p-5 sm:p-6 rounded-2xl transition-all shadow-md flex flex-col gap-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-sky-950 pb-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                        {inq.full_name}
                      </h3>
                      {getCategoryBadge(inq.service_category)}
                      {getStatusBadge(inq.status)}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* Left: Contact Info & Subject */}
                    <div className="md:col-span-4 flex flex-col gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-sky-400 shrink-0" />
                        <a
                          href={`tel:${inq.phone}`}
                          className="font-mono text-white font-bold hover:underline"
                        >
                          {inq.phone}
                        </a>
                      </div>

                      {inq.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                          <a
                            href={`mailto:${inq.email}`}
                            className="text-slate-300 hover:underline truncate max-w-[200px]"
                          >
                            {inq.email}
                          </a>
                        </div>
                      )}

                      {inq.subject && (
                        <div className="mt-1 pt-2 border-t border-slate-800 text-[11px]">
                          <strong className="text-cyan-300 block font-semibold">Subject:</strong>
                          <span className="text-slate-300">{inq.subject}</span>
                        </div>
                      )}
                    </div>

                    {/* Middle: Message & Metadata */}
                    <div className="md:col-span-5 flex flex-col gap-2">
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-sky-950 text-xs text-slate-300 leading-relaxed font-light">
                        {inq.message || "No message body provided."}
                      </div>

                      {/* Metadata Chips if present */}
                      {inq.metadata && Object.keys(inq.metadata).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {Object.entries(inq.metadata).map(([key, val]) => (
                            <span
                              key={key}
                              className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400"
                            >
                              <strong className="text-sky-300">{key}:</strong> {String(val)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Status Changer & Actions */}
                    <div className="md:col-span-3 flex flex-col gap-2 sm:items-end">
                      <div className="w-full sm:w-auto">
                        <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                          Update Status:
                        </label>
                        <select
                          disabled={updatingId === inq.id}
                          value={inq.status || "new"}
                          onChange={(e) => handleStatusChange(inq.id!, e.target.value as InquiryStatus)}
                          className="w-full sm:w-40 h-9 px-2.5 bg-slate-950 border border-sky-800 rounded-xl text-xs text-white focus:border-sky-400 focus:outline-none"
                        >
                          <option value="new">🔵 New</option>
                          <option value="contacted">🟡 Contacted</option>
                          <option value="in_progress">🟣 In Progress</option>
                          <option value="resolved">🟢 Resolved</option>
                          <option value="archived">⚪ Archived</option>
                        </select>
                      </div>

                      {/* Fast Action Buttons */}
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          asChild
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-3 rounded-lg"
                        >
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${inq.full_name}! We received your inquiry regarding ${inq.service_category} at Over The Sea. How can we assist you today?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            WhatsApp
                          </a>
                        </Button>

                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-sky-800 text-sky-300 hover:bg-sky-950 text-xs h-8 px-3 rounded-lg"
                        >
                          <a href={`tel:${inq.phone}`}>Call</a>
                        </Button>

                        <button
                          onClick={() => inq.id && handleDelete(inq.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Delete Lead"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
