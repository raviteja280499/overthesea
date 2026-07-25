"use client";

import { Phone } from "lucide-react";

// Official WhatsApp Logo SVG
const WhatsAppLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.986-1.309A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.634 0-3.155-.447-4.46-1.222l-.32-.19-2.96.777.79-2.887-.208-.332A7.954 7.954 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
  </svg>
);

export default function FloatingCall() {
  return (
    <div className="fixed z-40 right-4 bottom-20 lg:bottom-6 lg:right-6 flex flex-col gap-3.5 items-end">
      {/* Official WhatsApp Floating Button */}
      <a
        href="https://wa.me/919052703561"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 group cursor-pointer select-none"
        aria-label="Chat on WhatsApp (+91 90527 03561)"
      >
        <span className="hidden md:inline-block max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold py-2 px-3.5 rounded-full shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100">
          WhatsApp Business: +91 90527 03561
        </span>
        
        <div className="relative h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-[0_10px_25px_rgba(37,211,102,0.4)] hover:scale-110 transition-all duration-300">
          <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping opacity-75 pointer-events-none" />
          <WhatsAppLogo className="text-white drop-shadow-md" />
        </div>
      </a>

      {/* Phone Call Floating Button */}
      <a
        href="tel:+919052703560"
        className="flex items-center gap-2 group cursor-pointer select-none"
        aria-label="Call Customer Support (+91 90527 03560)"
      >
        <span className="hidden md:inline-block max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out bg-slate-900 border border-sky-500/40 text-sky-300 text-xs font-bold py-2 px-3.5 rounded-full shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100">
          Direct Call: +91 90527 03560
        </span>
        
        <div className="relative h-13 w-13 rounded-full bg-[#0488FB] hover:bg-[#36A0FC] text-white flex items-center justify-center shadow-[0_10px_25px_rgba(4,136,251,0.4)] hover:scale-110 transition-all duration-300">
          <span className="absolute inset-0 rounded-full bg-[#0488FB]/40 animate-pulse pointer-events-none" />
          <Phone className="h-6 w-6 text-white" />
        </div>
      </a>
    </div>
  );
}
