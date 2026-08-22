"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Settings,
  Share2,
  Globe,
  LogOut,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function AdminAvatarButton() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }
    router.push("/admin/login");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button-sized Avatar */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        title="Admin Profile & Settings"
        aria-label="Admin Profile & Settings"
        className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#6355d8] to-[#ec4899] p-0.5 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#6355d8]/40"
      >
        <div className="w-full h-full bg-[#1e1b4b] hover:bg-[#272363] rounded-[14px] flex items-center justify-center text-white font-extrabold text-xs transition-colors">
          OS
        </div>
      </button>

      {/* Profile Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150 select-none">
          {/* Admin Header */}
          <div className="p-3 border-b border-slate-100 flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-[#6355d8] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
              OS
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-xs text-[#1e1b4b] block truncate">
                Over The Sea Admin
              </span>
              <span className="text-[10px] text-slate-400 font-medium block truncate">
                admin@overthesea.in
              </span>
            </div>
          </div>

          {/* Database Live Sync Status Chip */}
          <div className="mx-2 my-2 px-3 py-1.5 rounded-xl bg-[#f7f6ff] border border-[#ece8ff] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-[#6355d8]">Supabase Live</span>
            </div>
            <code className="text-[9px] font-mono text-purple-700 bg-purple-100/60 px-1.5 py-0.5 rounded">
              lrxsjuul
            </code>
          </div>

          {/* Links */}
          <div className="py-1 space-y-0.5">
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#6355d8] transition-colors"
            >
              <User className="h-4 w-4 text-slate-400" />
              <span>Overview Dashboard</span>
            </Link>

            <Link
              href="/admin/inquiries"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#6355d8] transition-colors"
            >
              <Share2 className="h-4 w-4 text-slate-400" />
              <span>All Inquiries CRM</span>
            </Link>

            <Link
              href="/admin/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#6355d8] transition-colors"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Database & Settings</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#6355d8] transition-colors"
            >
              <Globe className="h-4 w-4 text-slate-400" />
              <span>View Public Website</span>
            </Link>
          </div>

          {/* Sign Out Button */}
          <div className="pt-1 border-t border-slate-100 mt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
