"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Search, Phone, Info } from "lucide-react";

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Services", path: "/services", icon: Package },
  { name: "Track", path: "/tracking", icon: Search },
  { name: "Contact", path: "/contact", icon: Phone },
  { name: "About", path: "/about", icon: Info },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 w-full glass border-t border-border/40 px-2 lg:hidden flex justify-around items-center shadow-[0_-4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-bottom-4 duration-300">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.path}
            className="relative flex flex-col items-center justify-center flex-1 py-1 h-full select-none"
          >
            <div
              className={`p-1.5 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-primary/10 text-primary scale-110 shadow-sm"
                  : "text-muted-foreground hover:text-foreground active:scale-95"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span
              className={`text-[10px] font-semibold mt-0.5 tracking-wide transition-colors duration-300 ${
                isActive ? "text-primary font-bold" : "text-muted-foreground"
              }`}
            >
              {item.name}
            </span>
            
            {/* Active indicator dot */}
            {isActive && (
              <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary animate-in fade-in zoom-in-50 duration-300" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
