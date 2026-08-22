"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Grid,
  List,
  Bell,
  PlusCircle,
  MoreHorizontal,
  ChevronDown,
  Phone,
  GraduationCap,
  Package,
  Compass,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Download,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactInquiry, ServiceCategory, InquiryStatus } from "@/lib/types/inquiry";
import AdminTopBar from "@/components/admin/AdminTopBar";
import AddInquiryDrawer from "@/components/admin/AddInquiryDrawer";

export default function AdminOverviewDashboard() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [addInquiryDrawerOpen, setAddInquiryDrawerOpen] = useState(false);

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
      let url = "/api/inquiries";
      if (searchTerm) url += `?search=${encodeURIComponent(searchTerm)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data) {
        setInquiries(data.data);
        if (data.data.length > 0 && !selectedInquiry) {
          setSelectedInquiry(data.data[0]);
        }
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
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
    link.setAttribute("download", `overthesea_all_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCount = inquiries.length;
  const eduCount = inquiries.filter((i) => i.service_category === "Overseas Education").length;
  const courierCount = inquiries.filter((i) => i.service_category === "Courier Logistics").length;
  const tourismCount = inquiries.filter((i) => i.service_category === "Tourism & Visa").length;
  const coachingCount = inquiries.filter((i) => i.service_category === "Test Preparation Coaching").length;
  const generalCount = inquiries.filter((i) => i.service_category === "General Inquiry").length;

  const getFileBadgeIcon = (category: ServiceCategory) => {
    switch (category) {
      case "Overseas Education":
        return (
          <div className="h-9 w-9 rounded-xl bg-[#e0e7ff] text-[#4f46e5] flex items-center justify-center font-black text-xs shadow-2xs shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
        );
      case "Courier Logistics":
        return (
          <div className="h-9 w-9 rounded-xl bg-[#fef3c7] text-[#d97706] flex items-center justify-center font-black text-xs shadow-2xs shrink-0">
            <Package className="h-5 w-5" />
          </div>
        );
      case "Tourism & Visa":
        return (
          <div className="h-9 w-9 rounded-xl bg-[#dcfce7] text-[#16a34a] flex items-center justify-center font-black text-xs shadow-2xs shrink-0">
            <Compass className="h-5 w-5" />
          </div>
        );
      case "Test Preparation Coaching":
        return (
          <div className="h-9 w-9 rounded-xl bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center font-black text-xs shadow-2xs shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
        );
      default:
        return (
          <div className="h-9 w-9 rounded-xl bg-[#fee2e2] text-[#ef4444] flex items-center justify-center font-black text-xs shadow-2xs shrink-0">
            <MessageSquare className="h-5 w-5" />
          </div>
        );
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 flex flex-col xl:flex-row gap-8 w-full min-h-full">

      {/* ========================================================================= */}
      {/* CENTER COLUMN: OVERVIEW DASHBOARD WITH CORNER IMAGES */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col gap-8 min-w-0">

        {/* Top Header: Search Bar + Grid/List Toggle + Notification Drawer + Button-sized Avatar */}
        <AdminTopBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search all inquiries, leads, phone..."
          activeView="grid"
          inquiries={inquiries}
          onRefresh={fetchInquiries}
        />

        {/* Section Heading + Add Inquiry Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-sans font-black text-2xl sm:text-3xl text-[#1e1b4b]">
              Overview Dashboard
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Live executive summary across all Over The Sea branches and services.
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

        {/* ========================================================================= */}
        {/* 3 SIGNATURE SERVICE CARDS WITH RESPECTIVE RIGHT-CORNER IMAGES */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Card 1: Overseas Education (With Graduation/Consultancy Right-Corner Image) */}
          <Link
            href="/admin/education"
            className="bg-[#6355d8] text-white p-6 rounded-3xl shadow-xl shadow-[#6355d8]/25 flex flex-col justify-between h-56 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group border border-[#6355d8]"
          >
            {/* Smooth Fill Glow Layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#7264e3] to-[#5143cb] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Right Corner Image */}
            <div className="absolute -right-2 -bottom-2 w-28 h-28 opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-300 pointer-events-none rounded-2xl overflow-hidden">
              <Image
                src="/educational-consultancy.png"
                alt="Overseas Education"
                fill
                className="object-contain"
              />
            </div>

            <div className="flex items-start justify-between relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-white text-[#6355d8] flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105">
                <GraduationCap className="h-6 w-6 text-[#6355d8]" />
              </div>

              <span className="text-[11px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors">
                <span>View</span>
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>

            <div className="relative z-10">
              <h3 className="font-extrabold text-lg text-white mb-4 flex items-center gap-2">
                <span>Overseas Education</span>
              </h3>

              <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden flex mb-2">
                <div
                  className="bg-[#fb923c] h-1.5 transition-all duration-700"
                  style={{ width: `${totalCount > 0 ? (eduCount / totalCount) * 100 : 45}%` }}
                />
                <div className="bg-white h-1.5 flex-1" />
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-white/90">
                <span>{eduCount} Active Leads</span>
                <span>Fall &apos;26 Admissions</span>
              </div>
            </div>
          </Link>

          {/* Card 2: Global Courier Logistics (With Courier Right-Corner Image & Amber Hover Fill) */}
          <Link
            href="/admin/courier"
            className="bg-white text-slate-900 p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/80 flex flex-col justify-between h-56 transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden hover:shadow-xl hover:shadow-[#f59e0b]/25 hover:border-[#f59e0b]/40"
          >
            {/* Category Amber Filling Layer on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b] to-[#d97706] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Right Corner Image */}
            <div className="absolute -right-2 -bottom-2 w-28 h-28 opacity-25 group-hover:opacity-40 group-hover:scale-110 transition-all duration-300 pointer-events-none rounded-2xl overflow-hidden">
              <Image
                src="/global-courier.png"
                alt="Courier Logistics"
                fill
                className="object-contain"
              />
            </div>

            <div className="flex items-start justify-between relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-[#fffbeb] text-[#d97706] group-hover:bg-white group-hover:text-[#d97706] group-hover:shadow-md flex items-center justify-center transition-all duration-300">
                <Package className="h-6 w-6" />
              </div>

              <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 group-hover:bg-white/20 group-hover:text-white group-hover:border-transparent px-2.5 py-1 rounded-full flex items-center gap-1 transition-all duration-300">
                <span>View</span>
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>

            <div className="relative z-10">
              <h3 className="font-extrabold text-lg text-[#1e1b4b] group-hover:text-white mb-4 transition-colors duration-300">
                Courier Logistics
              </h3>

              <div className="w-full bg-[#f1f5f9] group-hover:bg-white/25 rounded-full h-1.5 overflow-hidden flex mb-2 transition-colors duration-300">
                <div
                  className="bg-[#f59e0b] group-hover:bg-white h-1.5 transition-all duration-700"
                  style={{ width: `${totalCount > 0 ? (courierCount / totalCount) * 100 : 35}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white/90 transition-colors duration-300">
                <span className="text-slate-700 group-hover:text-white font-bold">{courierCount} Shipments</span>
                <span>190+ Countries</span>
              </div>
            </div>
          </Link>

          {/* Card 3: Tourism & Express Visa (With Tourism Right-Corner Image & Emerald Hover Fill) */}
          <Link
            href="/admin/tourism"
            className="bg-white text-slate-900 p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/80 flex flex-col justify-between h-56 transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden hover:shadow-xl hover:shadow-[#059669]/25 hover:border-[#059669]/40"
          >
            {/* Category Emerald Filling Layer on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#059669] to-[#047857] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Right Corner Image */}
            <div className="absolute -right-2 -bottom-2 w-28 h-28 opacity-25 group-hover:opacity-40 group-hover:scale-110 transition-all duration-300 pointer-events-none rounded-2xl overflow-hidden">
              <Image
                src="/tourism/hero.png"
                alt="Tourism & Visa"
                fill
                className="object-contain"
              />
            </div>

            <div className="flex items-start justify-between relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-[#ecfdf5] text-[#059669] group-hover:bg-white group-hover:text-[#059669] group-hover:shadow-md flex items-center justify-center transition-all duration-300">
                <Compass className="h-6 w-6" />
              </div>

              <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 group-hover:bg-white/20 group-hover:text-white group-hover:border-transparent px-2.5 py-1 rounded-full flex items-center gap-1 transition-all duration-300">
                <span>View</span>
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>

            <div className="relative z-10">
              <h3 className="font-extrabold text-lg text-[#1e1b4b] group-hover:text-white mb-4 transition-colors duration-300">
                Tourism & Visa
              </h3>

              <div className="w-full bg-[#f1f5f9] group-hover:bg-white/25 rounded-full h-1.5 overflow-hidden flex mb-2 transition-colors duration-300">
                <div
                  className="bg-[#10b981] group-hover:bg-white h-1.5 transition-all duration-700"
                  style={{ width: `${totalCount > 0 ? (tourismCount / totalCount) * 100 : 20}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white/90 transition-colors duration-300">
                <span className="text-slate-700 group-hover:text-white font-bold">{tourismCount} Visa Filings</span>
                <span>99.4% Approval</span>
              </div>
            </div>
          </Link>

        </div>

        {/* ========================================================================= */}
        {/* RECENT INQUIRIES STREAM */}
        {/* ========================================================================= */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 cursor-pointer select-none">
              <h3 className="font-sans font-extrabold text-base text-[#1e1b4b]">
                Recent Inquiries & Leads
              </h3>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>

            <Link
              href="/admin/inquiries"
              className="text-xs font-bold text-[#6355d8] hover:underline flex items-center gap-1"
            >
              <span>View All Records</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 px-6 py-3.5 bg-white text-xs font-bold text-slate-400 border-b border-slate-100">
              <div className="col-span-6 flex items-center gap-1">
                <span>Client & Service</span>
                <span className="text-[10px]">↑</span>
              </div>
              <div className="col-span-3">Contact Phone</div>
              <div className="col-span-2">Received Date</div>
              <div className="col-span-1 text-right"></div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <RefreshCw className="h-6 w-6 text-[#6355d8] animate-spin" />
                <span>Loading live inquiries...</span>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No inquiries found.
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {inquiries.slice(0, 7).map((inq) => {
                  const cleanPhone = (inq.phone || "").replace(/\D/g, "");
                  const isSelected = selectedInquiry?.id === inq.id;
                  const dateText = inq.created_at
                    ? new Date(inq.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "Today";

                  return (
                    <div
                      key={inq.id}
                      onClick={() => setSelectedInquiry(inq)}
                      className={`
                        grid grid-cols-12 items-center px-6 py-4 transition-colors cursor-pointer group
                        ${isSelected ? "bg-[#f8f7ff]" : "hover:bg-[#faf9ff]"}
                      `}
                    >
                      <div className="col-span-6 flex items-center gap-3.5 min-w-0 pr-2">
                        {getFileBadgeIcon(inq.service_category)}
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-[#1e1b4b] block truncate group-hover:text-[#6355d8] transition-colors">
                            {inq.full_name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium truncate block">
                            {inq.subject || inq.service_category}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-3 text-xs text-slate-500 font-medium truncate font-mono">
                        {inq.phone}
                      </div>

                      <div className="col-span-2 text-xs text-slate-400 font-medium">
                        {dateText}
                      </div>

                      <div className="col-span-1 flex items-center justify-end gap-1.5">
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${inq.full_name}! Regarding your inquiry for ${inq.service_category} at Over The Sea:`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-lg"
                          title="WhatsApp"
                        >
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: LEAD VOLUME & CATEGORY SUBPAGE SHORTCUTS */}
      {/* ========================================================================= */}
      <div className="w-full xl:w-80 flex flex-col gap-6 select-none shrink-0">

        <h2 className="font-sans font-black text-lg text-[#1e1b4b] text-center xl:text-left">
          Lead Volume & Capacity
        </h2>

        {/* Semi-Circle Gauge Donut Graphic */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center shadow-xs">
          <div className="relative w-48 h-28 flex items-end justify-center overflow-hidden">
            <svg className="w-48 h-48 -rotate-180" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="12"
                strokeDasharray="251.2"
                strokeDashoffset="125.6"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#f97316"
                strokeWidth="12"
                strokeDasharray="251.2"
                strokeDashoffset="160"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="mt-2">
            <h3 className="font-extrabold text-2xl text-[#1e1b4b]">
              {totalCount} Leads
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              98.4% Response Rate
            </p>
          </div>
        </div>

        {/* Category Item Cards (Stacked with corner thumbnails and links to separate pages) */}
        <div className="flex flex-col gap-3">

          <Link
            href="/admin/education"
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between hover:bg-[#f0edff]/80 hover:border-[#6355d8]/30 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#e0e7ff] text-[#4f46e5] group-hover:bg-[#6355d8] group-hover:text-white flex items-center justify-center transition-colors">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-[#1e1b4b] group-hover:text-[#6355d8] transition-colors">
                  Overseas Education
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">{eduCount} Total files</p>
              </div>
            </div>
            <span className="font-extrabold text-xs text-slate-700 group-hover:text-[#6355d8] transition-colors">{eduCount} Leads</span>
          </Link>

          <Link
            href="/admin/courier"
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between hover:bg-[#fffbeb]/80 hover:border-[#f59e0b]/30 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#fef3c7] text-[#d97706] group-hover:bg-[#f59e0b] group-hover:text-white flex items-center justify-center transition-colors">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-[#1e1b4b] group-hover:text-[#d97706] transition-colors">
                  Courier Logistics
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">{courierCount} Total files</p>
              </div>
            </div>
            <span className="font-extrabold text-xs text-slate-700 group-hover:text-[#d97706] transition-colors">{courierCount} Leads</span>
          </Link>

          <Link
            href="/admin/tourism"
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between hover:bg-[#ecfdf5]/80 hover:border-[#10b981]/30 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#dcfce7] text-[#16a34a] group-hover:bg-[#059669] group-hover:text-white flex items-center justify-center transition-colors">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-[#1e1b4b] group-hover:text-[#059669] transition-colors">
                  Tourism & Visa
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">{tourismCount} Total files</p>
              </div>
            </div>
            <span className="font-extrabold text-xs text-slate-700 group-hover:text-[#059669] transition-colors">{tourismCount} Leads</span>
          </Link>

          <Link
            href="/admin/coaching"
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between hover:bg-[#faf5ff]/80 hover:border-[#9333ea]/30 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#f3e8ff] text-[#9333ea] group-hover:bg-[#9333ea] group-hover:text-white flex items-center justify-center transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-[#1e1b4b] group-hover:text-[#9333ea] transition-colors">
                  Test Preparation
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">{coachingCount} Total files</p>
              </div>
            </div>
            <span className="font-extrabold text-xs text-slate-700 group-hover:text-[#9333ea] transition-colors">{coachingCount} Leads</span>
          </Link>

        </div>

        <button
          onClick={exportCSV}
          className="w-full py-2.5 rounded-2xl border border-dashed border-slate-200 text-xs font-bold text-slate-500 hover:text-[#6355d8] hover:border-[#6355d8] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export All Leads Report</span>
        </button>

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
