"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Database,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
  HardDrive,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminTopBar from "@/components/admin/AdminTopBar";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [copiedSql, setCopiedSql] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
    } catch (err) {
      console.error("Logout error:", err);
      router.push("/admin/login");
    }
  };

  const schemaSQL = `-- =========================================================
-- OVER THE SEA: CONTACT & SERVICE INQUIRIES DATABASE SCHEMA
-- =========================================================

CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  service_category TEXT NOT NULL CHECK (
    service_category IN (
      'Overseas Education',
      'Courier Logistics',
      'Tourism & Visa',
      'Test Preparation Coaching',
      'General Inquiry'
    )
  ),
  subject TEXT,
  message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'new' CHECK (
    status IN ('new', 'contacted', 'in_progress', 'resolved', 'archived')
  ),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast dashboard querying
CREATE INDEX IF NOT EXISTS idx_inquiries_category ON public.contact_inquiries(service_category);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.contact_inquiries(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous form submissions
CREATE POLICY "Allow public form submissions"
ON public.contact_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated admins to view/manage inquiries
CREATE POLICY "Allow authenticated read and manage"
ON public.contact_inquiries
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(schemaSQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto w-full flex flex-col gap-8 min-h-full">
      
      {/* Top Header: Grid/List Toggle + Notification Bell + Avatar */}
      <AdminTopBar
        showSearch={false}
        activeView="grid"
      />

      {/* Header */}
      <div>
        <h1 className="font-sans font-black text-2xl sm:text-3xl text-[#1e1b4b]">
          Database & Workspace Settings
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Configure Supabase PostgreSQL connections, SQL schema migrations, and admin sessions.
        </p>
      </div>

      {/* Supabase Connection Status Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#6355d8]/10 text-[#6355d8] flex items-center justify-center">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#1e1b4b]">
                Supabase Cloud PostgreSQL
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Project Reference: <code className="font-mono text-[#6355d8] font-bold">lrxsjuulqtldvnetdtof</code>
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connected</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#f8f9fd] border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Table Name
            </span>
            <span className="text-xs font-mono font-bold text-[#1e1b4b]">
              public.contact_inquiries
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9fd] border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Security Protocol
            </span>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> RLS Enabled
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8f9fd] border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Real-Time Sync
            </span>
            <span className="text-xs font-bold text-[#6355d8] flex items-center gap-1">
              <Zap className="h-4 w-4" /> Active
            </span>
          </div>
        </div>
      </div>

      {/* SQL Migration Script */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#1e1b4b]">
              Database Schema Script
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Run this in your Supabase SQL Editor if you ever need to re-initialize tables.
            </p>
          </div>

          <button
            onClick={copyToClipboard}
            className="px-4 py-2 rounded-xl bg-[#6355d8] hover:bg-[#5244ca] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            {copiedSql ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copiedSql ? "Copied SQL" : "Copy SQL"}</span>
          </button>
        </div>

        <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono overflow-x-auto max-h-80 leading-relaxed">
          {schemaSQL}
        </pre>
      </div>

      {/* Admin Session & Sign Out */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-[#1e1b4b]">
            Administrator Session
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Logged in as <code className="font-mono text-slate-700 font-bold">admin@overthesea.in</code>
          </p>
        </div>

        <Button
          onClick={handleLogout}
          disabled={loggingOut}
          variant="destructive"
          className="rounded-2xl text-xs font-bold h-10 px-5 cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-1.5" />
          <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
        </Button>
      </div>

    </div>
  );
}
