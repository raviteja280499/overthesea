"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Package } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const isEduActive = pathname === "/education";
  const isCourierActive = pathname === "/courier";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 w-full bg-[rgb(1_7_34)]/95 backdrop-blur-xl border-t border-white/10 px-4 lg:hidden flex justify-center items-center gap-3 shadow-[0_-4px_25px_rgba(0,0,0,0.5)]">
      {/* Service 1 Button: Educational & Foreign Consultancy */}
      <Link
        href="/education"
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs shadow-md transition-all ${
          isEduActive
            ? "bg-sky-500 text-white ring-2 ring-sky-300 shadow-sky-500/30"
            : "bg-sky-950/80 text-sky-300 border border-sky-800/80 hover:bg-sky-900"
        }`}
      >
        <GraduationCap className="h-4 w-4 text-sky-400 shrink-0" />
        <span className="truncate">Education</span>
      </Link>

      {/* Service 2 Button: Global Courier Services */}
      <Link
        href="/courier"
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs shadow-md transition-all ${
          isCourierActive
            ? "bg-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-amber-500/30"
            : "bg-amber-950/80 text-amber-300 border border-amber-800/80 hover:bg-amber-900"
        }`}
      >
        <Package className="h-4 w-4 text-amber-400 shrink-0" />
        <span className="truncate">Couriers</span>
      </Link>
    </nav>
  );
}


