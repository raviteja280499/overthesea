import { Plane } from "lucide-react";

/**
 * Carrier brand marks, drawn in CSS/SVG with each carrier's own brand colours
 * rather than shipped as image files — nothing to download, nothing to keep in
 * sync, and they stay crisp at any size.
 *
 * Swap these for official artwork if the business licenses it; the component
 * API (carrierCode + size) would not change.
 *
 * Keyed on Vendor_Code as the rate API returns it. The live set is DHL, FDX,
 * UPS, SELF and UXEX; anything new falls back to initials so an unfamiliar
 * carrier still renders as part of the system.
 */

type Size = "sm" | "md";

const TILE: Record<Size, string> = {
  sm: "h-9 w-11 rounded-lg",
  md: "h-12 w-14 rounded-xl",
};

const TEXT: Record<Size, string> = {
  sm: "text-[11px]",
  md: "text-sm",
};

function Tile({
  size,
  className,
  children,
}: {
  size: Size;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden
      className={`${TILE[size]} ${className} shrink-0 flex items-center justify-center overflow-hidden shadow-sm`}
    >
      {children}
    </div>
  );
}

export function CarrierLogo({
  carrierCode,
  carrier,
  size = "md",
}: {
  carrierCode: string;
  carrier: string;
  size?: Size;
}) {
  const code = carrierCode.toUpperCase();
  const t = TEXT[size];

  // DHL — red wordmark on the brand yellow.
  if (code === "DHL") {
    return (
      <Tile size={size} className="bg-[#FFCC00]">
        <span
          className={`${t} font-black italic tracking-tighter text-[#D40511] leading-none`}
        >
          DHL
        </span>
      </Tile>
    );
  }

  // FedEx — the two-tone wordmark, purple "Fed" and orange "Ex".
  if (code === "FDX" || code.startsWith("FED")) {
    return (
      <Tile size={size} className="bg-white border border-slate-200">
        <span className={`${t} font-black italic tracking-tighter leading-none`}>
          <span className="text-[#4D148C]">Fed</span>
          <span className="text-[#FF6600]">Ex</span>
        </span>
      </Tile>
    );
  }

  // UPS — the brown shield with its gold knot and lowercase wordmark. Drawn as
  // a real silhouette: a rounded rectangle only ever read as a brown blob.
  if (code === "UPS") {
    return (
      <Tile size={size} className="bg-white border border-slate-200">
        <svg
          viewBox="0 0 72 80"
          className={size === "sm" ? "h-7" : "h-9"}
          role="presentation"
        >
          <path
            d="M6 16C6 10 20 4 36 4s30 6 30 12c0 28-6 46-30 60C12 62 6 44 6 16Z"
            fill="#351C15"
          />
          {/* The package-tie knot that sits at the crown of the shield. */}
          <path
            d="M36 11c4 0 7 2 8 5-2 2-5 3-8 3s-6-1-8-3c1-3 4-5 8-5Z"
            fill="#FFB500"
          />
          <text
            x="36"
            y="56"
            textAnchor="middle"
            fill="#FFB500"
            fontSize="30"
            fontStyle="italic"
            fontWeight="700"
            fontFamily="Georgia, 'Times New Roman', serif"
          >
            ups
          </text>
        </svg>
      </Tile>
    );
  }

  // UXEX Express — the carrier network's own express product.
  if (code === "UXEX") {
    return (
      <Tile size={size} className="bg-gradient-to-br from-amber-400 to-amber-600">
        <span className={`${t} font-black tracking-tighter text-slate-950 leading-none`}>
          UXEX
        </span>
      </Tile>
    );
  }

  // SELF — the in-house desk rather than a third-party carrier.
  if (code === "SELF") {
    return (
      <Tile
        size={size}
        className="bg-amber-50 border border-amber-300 flex-col gap-0.5"
      >
        <Plane
          className={`text-amber-600 ${size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"}`}
        />
        <span className="text-[8px] font-black uppercase tracking-wider text-amber-700 leading-none">
          Express
        </span>
      </Tile>
    );
  }

  const initials =
    carrier
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase() || "??";

  return (
    <Tile size={size} className="bg-slate-100 border border-slate-300">
      <span className={`${t} font-black tracking-tight text-slate-700 leading-none`}>
        {initials}
      </span>
    </Tile>
  );
}

export default CarrierLogo;
