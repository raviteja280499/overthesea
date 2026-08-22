"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Grid, List, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContactInquiry } from "@/lib/types/inquiry";
import NotificationDrawer from "./NotificationDrawer";

interface AdminTopBarProps {
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  activeView?: "grid" | "list";
  inquiries?: ContactInquiry[];
  onRefresh?: () => void;
  showSearch?: boolean;
}

export default function AdminTopBar({
  searchTerm = "",
  onSearchChange,
  searchPlaceholder = "Search all inquiries, leads, phone...",
  activeView = "grid",
  inquiries = [],
  onRefresh,
  showSearch = true,
}: AdminTopBarProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Compute count of new / last week inquiries for badge
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const lastWeekNewCount = inquiries.filter((inq) => {
    const isNew = inq.status === "new" || !inq.status;
    if (!inq.created_at) return isNew;
    const time = new Date(inq.created_at).getTime();
    return isNew && (isNaN(time) || time >= oneWeekAgo);
  }).length;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full select-none">
        {/* Search Bar */}
        {showSearch ? (
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="bg-[#f8f9fd] border-transparent text-slate-900 placeholder:text-slate-400 rounded-2xl pl-10 pr-4 text-xs h-10 focus:border-[#6355d8] focus:bg-white transition-all shadow-2xs"
            />
          </div>
        ) : (
          <div className="hidden sm:block" />
        )}

        {/* Action Controls: Grid/List Toggle + Notification Bell + Avatar */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          {/* Grid / List Pill Toggle */}
          <div className="bg-[#f4f3ff] p-1 rounded-2xl flex items-center gap-1 border border-[#ece8ff]">
            <button
              onClick={() => {
                if (activeView !== "grid") {
                  router.push("/admin");
                }
              }}
              title="Overview Dashboard (Grid View)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === "grid"
                  ? "bg-white text-[#6355d8] shadow-xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Grid</span>
            </button>

            <button
              onClick={() => {
                if (activeView !== "list") {
                  router.push("/admin/inquiries");
                }
              }}
              title="Unified Inquiries (List View)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === "list"
                  ? "bg-white text-[#6355d8] shadow-xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>

          {/* Notification Bell Button (Opens Side Drawer) */}
          <button
            onClick={() => setDrawerOpen(true)}
            title="Notifications & Latest Applications (Last 7 Days)"
            aria-label="Notifications"
            className="h-10 w-10 rounded-2xl bg-[#f8f9fd] hover:bg-[#f0edff] text-slate-600 hover:text-[#6355d8] flex items-center justify-center transition-colors relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6355d8]/40"
          >
            <Bell className="h-4 w-4" />
            {lastWeekNewCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] absolute top-2.5 right-2.5 ring-2 ring-white animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Side Drawer Component */}
      <NotificationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        inquiries={inquiries}
        onRefresh={onRefresh}
      />
    </>
  );
}
