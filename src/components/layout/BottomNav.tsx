"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Package, Compass } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Education",
      href: "/education",
      isActive: pathname === "/education" || pathname === "/",
      icon: GraduationCap,
      activePill: "bg-cyan-500/20 text-cyan-300 shadow-md shadow-cyan-500/20",
      activeIcon: "text-cyan-300",
    },
    {
      name: "Couriers",
      href: "/courier",
      isActive: pathname === "/courier",
      icon: Package,
      activePill: "bg-amber-500/20 text-amber-300 shadow-md shadow-amber-500/20",
      activeIcon: "text-amber-300",
    },
    {
      name: "Tourism",
      href: "/tourism",
      isActive: pathname === "/tourism",
      icon: Compass,
      activePill: "bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/20",
      activeIcon: "text-emerald-300",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 w-full bg-slate-950/95 backdrop-blur-2xl border-t border-x border-slate-800/80 rounded-t-[28px] px-2 sm:px-6 lg:hidden flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.85)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center justify-center gap-1.5 transition-all duration-300 ease-out select-none ${
              item.isActive
                ? `px-3.5 sm:px-4 py-2 rounded-full ${item.activePill} scale-[1.03]`
                : "px-2.5 sm:px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 rounded-full"
            }`}
          >
            <Icon
              className={`h-4.5 w-4.5 shrink-0 transition-transform duration-300 ${
                item.isActive ? item.activeIcon : "text-slate-400"
              }`}
            />

            {/* Text label ALWAYS visible for all tabs initially */}
            <span
              className={`text-xs font-bold tracking-tight whitespace-nowrap transition-colors ${
                item.isActive ? item.activeIcon : "text-slate-400"
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}


