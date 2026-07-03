"use client";

import { Phone } from "lucide-react";

export default function FloatingCall() {
  return (
    <a
      href="tel:+919052703561"
      className="fixed z-40 right-4 bottom-20 lg:bottom-6 lg:right-6 flex items-center gap-2 group cursor-pointer select-none"
      aria-label="Call Customer Support (+91 9052703561)"
    >
      {/* Slide-out tooltip label (hidden on small viewports, shows on hover on medium+) */}
      <span className="hidden md:inline-block max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out bg-white dark:bg-slate-900 border border-border/40 text-slate-800 dark:text-slate-100 text-xs font-bold py-2 px-3 rounded-full shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100">
        Call Support: +91 9052703561
      </span>
      
      {/* Call Button Icon */}
      <div className="relative h-14 w-14 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 active:scale-95 group-hover:scale-110">
        {/* Pulsing Outer Rings */}
        <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping opacity-75 pointer-events-none" />
        <span className="absolute inset-[-4px] rounded-full border border-primary/20 animate-pulse pointer-events-none" />
        
        {/* Bouncing Phone Icon */}
        <Phone className="h-6 w-6 animate-bounce" style={{ animationDuration: "2.5s" }} />
      </div>
    </a>
  );
}
