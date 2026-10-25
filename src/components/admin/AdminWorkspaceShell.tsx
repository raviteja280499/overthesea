"use client";

import { useState } from "react";
import { Cloud, Menu, X } from "lucide-react";

import { AdminSideNav } from "./AdminSideNav";

/**
 * Client half of the admin shell: mobile menu state and the responsive
 * chrome. The auth check lives in the Server Component layout that renders
 * this, so nothing here is a security boundary.
 */
export function AdminWorkspaceShell({
  user,
  children,
}: {
  user: { fullName: string; email: string };
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-white w-full h-full flex flex-col md:flex-row overflow-hidden antialiased font-sans m-0 p-0">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 z-20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-[#6355d8] text-white flex items-center justify-center shadow-xs">
            <Cloud className="h-4 w-4 fill-white" />
          </div>
          <span className="font-extrabold text-sm text-[#1e1b4b]">
            Over The Sea
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AdminSideNav
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        user={user}
      />

      {/* Main Full-Width Content Canvas */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-white border-l border-slate-100 h-full">
        {children}
      </main>
    </div>
  );
}
