"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cloud,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { signOutAgent } from "@/lib/auth/actions";

const NAV = [
  { label: "Dashboard", href: "/agent/dashboard", icon: LayoutDashboard, exact: true },
  { label: "My Students", href: "/agent/students", icon: Users },
  { label: "Commissions", href: "/agent/commissions", icon: Wallet },
];

export function AgentPortalShell({
  user,
  children,
}: {
  user: { fullName: string; email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const initials = user.fullName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-[100] m-0 flex h-full w-full flex-col overflow-hidden bg-white p-0 font-sans antialiased md:flex-row">
      {/* Mobile header */}
      <div className="z-20 flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6355d8] text-white">
            <Cloud className="h-4 w-4 fill-white" />
          </div>
          <span className="text-sm font-extrabold text-[#1e1b4b]">Agent Portal</span>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="cursor-pointer rounded-xl p-2 text-slate-600 hover:bg-slate-100"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } fixed bottom-0 left-0 top-0 z-30 flex h-full w-68 shrink-0 select-none flex-col justify-between border-r border-slate-100 bg-white p-6 transition-transform duration-300 ease-in-out md:relative md:w-72 md:translate-x-0 sm:p-7`}
      >
        <div className="flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <Link href="/agent/dashboard" className="group flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6355d8] text-white shadow-md shadow-[#6355d8]/30 transition-transform group-hover:scale-105">
                <Cloud className="h-5 w-5 fill-white" />
              </div>
              <div>
                <span className="block text-lg font-extrabold leading-tight tracking-tight text-[#1e1b4b]">
                  Over The Sea
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#6355d8]">
                  Agent Portal
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:text-slate-600 md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-2.5">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`group relative flex items-center gap-3.5 overflow-hidden rounded-lg px-3.5 py-3 text-[13px] font-bold transition-all duration-200 ${
                    active
                      ? "bg-[#f0edff] text-[#6355d8] shadow-2xs"
                      : "text-slate-600 hover:text-[#6355d8]"
                  }`}
                >
                  {!active && (
                    <span className="pointer-events-none absolute inset-0 -z-0 scale-95 rounded-lg bg-gradient-to-r from-[#f5f3ff] via-[#f0edff] to-[#eae5ff] opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100" />
                  )}
                  <span
                    className={`absolute left-0 top-1/2 w-1 -translate-y-1/2 rounded-r-full transition-all duration-200 ${
                      active ? "h-5 bg-[#6355d8]" : "h-0 bg-[#6355d8]/40 group-hover:h-3"
                    }`}
                  />
                  <Icon
                    className={`relative z-10 h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-105 ${
                      active ? "text-[#6355d8]" : "text-slate-400 group-hover:text-[#6355d8]"
                    }`}
                  />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between gap-2.5 rounded-lg border border-slate-100 bg-[#f8f9fd] p-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#6355d8] text-xs font-bold text-white shadow-xs">
                {initials || "AG"}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-xs font-extrabold leading-tight text-[#1e1b4b]">
                  {user.fullName}
                </span>
                <span className="block truncate text-[10px] font-medium text-slate-400">
                  {user.email}
                </span>
              </div>
            </div>
            <button
              onClick={async () => {
                setSigningOut(true);
                await signOutAgent();
              }}
              disabled={signingOut}
              title="Sign out"
              className="shrink-0 cursor-pointer rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              {signingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </button>
          </div>
          <Link
            href="/agent/change-password"
            className="mt-2 block px-1 text-[10px] font-semibold text-slate-400 transition-colors hover:text-[#6355d8]"
          >
            Change password
          </Link>
        </div>
      </aside>

      <main className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto border-l border-slate-100 bg-white">
        {children}
      </main>
    </div>
  );
}
