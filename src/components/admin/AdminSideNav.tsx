"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Cloud,
  Share2,
  GraduationCap,
  Package,
  Compass,
  BookOpen,
  X,
  LogOut,
  Loader2,
  Users,
  UserCog,
  Wallet,
} from "lucide-react";
import { signOut } from "@/lib/auth/actions";

export function AdminSideNav({
  mobileMenuOpen,
  setMobileMenuOpen,
  user,
}: {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  user: { fullName: string; email: string };
}) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      matchExact: true,
    },
    {
      label: "Education Leads",
      href: "/admin/education",
      icon: GraduationCap,
    },
    {
      label: "Courier Logistics",
      href: "/admin/courier",
      icon: Package,
    },
    {
      label: "Tourism & Visa",
      href: "/admin/tourism",
      icon: Compass,
    },
    {
      label: "Test Preparation",
      href: "/admin/coaching",
      icon: BookOpen,
    },
    {
      label: "All Inquiries",
      href: "/admin/inquiries",
      icon: Share2,
    },
    {
      label: "Students (CRM)",
      href: "/admin/students",
      icon: Users,
    },
    {
      label: "Agents",
      href: "/admin/agents",
      icon: UserCog,
    },
    {
      label: "Commissions",
      href: "/admin/commissions",
      icon: Wallet,
    },
  ];

  const [loggingOut, setLoggingOut] = useState(false);
  // A monotonic counter rather than Date.now(): the React Compiler rules flag
  // impure calls here, and two ripples fired in the same millisecond would
  // otherwise collide on their key.
  const rippleId = useRef(0);
  const [ripples, setRipples] = useState<Record<string, Array<{ x: number; y: number; size: number; id: number }>>>({});

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.6;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const newRipple = { x, y, size, id: ++rippleId.current };

    setRipples((prev) => ({
      ...prev,
      [href]: [...(prev[href] || []).slice(-2), newRipple],
    }));

    setTimeout(() => {
      setRipples((prev) => ({
        ...prev,
        [href]: (prev[href] || []).filter((r) => r.id !== newRipple.id),
      }));
    }, 650);

    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    // Server action: clears the Supabase session cookies server-side and
    // redirects. The old DELETE /api/admin/auth endpoint is gone.
    await signOut();
  };

  return (
    <aside
      className={`
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 transition-transform duration-300 ease-in-out
        fixed md:relative top-0 bottom-0 left-0 z-30
        w-68 sm:w-72 bg-white flex flex-col justify-between p-6 sm:p-7 select-none border-r border-slate-100 h-full shrink-0
      `}
    >
      {/* Brand Logo & Navigation */}
      <div className="flex flex-col gap-10 sm:gap-12">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-[#6355d8] text-white flex items-center justify-center shadow-md shadow-[#6355d8]/30 group-hover:scale-105 transition-transform">
              <Cloud className="h-5 w-5 fill-white" />
            </div>
            <div>
              <span className="font-sans font-extrabold text-lg text-[#1e1b4b] tracking-tight block leading-tight">
                Over The Sea
              </span>
              <span className="text-[10px] font-bold text-[#6355d8] uppercase tracking-wider block">
                Admin Workspace
              </span>
            </div>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Navigation Menu with Filling Background Hover & Ripple Animation */}
        <nav className="flex flex-col gap-2 sm:gap-2.5">
          {navItems.map((item) => {
            const isActive = item.matchExact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`
                  relative overflow-hidden group flex items-center gap-3.5 px-3.5 py-3 rounded-lg text-[13px] font-bold transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#f0edff] text-[#6355d8] shadow-2xs"
                      : "text-slate-600 hover:text-[#6355d8]"
                  }
                `}
              >
                {/* Smooth Filling Hover Background Layer */}
                {!isActive && (
                  <span className="absolute inset-0 bg-gradient-to-r from-[#f5f3ff] via-[#f0edff] to-[#eae5ff] opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg -z-0 pointer-events-none scale-95 group-hover:scale-100" />
                )}

                {/* Left Accent Pill Indicator */}
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-200 ${
                    isActive
                      ? "h-5 bg-[#6355d8]"
                      : "h-0 bg-[#6355d8]/40 group-hover:h-3"
                  }`}
                />

                {/* Dynamic Ripple Wave Elements */}
                {(ripples[item.href] || []).map((r) => (
                  <span
                    key={r.id}
                    className="absolute rounded-full bg-[#6355d8]/25 pointer-events-none animate-ripple z-0"
                    style={{
                      left: r.x,
                      top: r.y,
                      width: r.size,
                      height: r.size,
                    }}
                  />
                ))}

                <Icon
                  className={`h-4.5 w-4.5 relative z-10 transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? "text-[#6355d8]" : "text-slate-400 group-hover:text-[#6355d8]"
                  }`}
                />
                <span className="relative z-10 font-bold transition-colors">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Account Profile & Logout Row */}
      <div className="mt-auto pt-6 border-t border-slate-100">
        <div className="bg-[#f8f9fd] p-2.5 rounded-lg border border-slate-100 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="h-8 w-8 rounded-md bg-[#6355d8] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                OS
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-extrabold text-xs text-[#1e1b4b] truncate block leading-tight">
                {user.fullName}
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate block">
                {user.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            disabled={loggingOut}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer shrink-0 focus:outline-none"
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

