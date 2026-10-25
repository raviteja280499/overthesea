"use client";

import { useEffect, useRef, useState } from "react";
import { Apple, Box, Check, ChevronDown, FileText, Luggage, Pill } from "lucide-react";

/**
 * Themed replacement for the native <select>.
 *
 * A native select renders its option list with the OS widget — system-blue
 * highlight, OS font, fixed metrics — which cannot be styled at all. This keeps
 * the trigger, rows and keyboard behaviour on the card's own theme.
 *
 * Order and values are deliberate: General Parcel first and default, Documents
 * second, and `value` strings unchanged from the original estimator so existing
 * metadata.parcel_type in the CRM stays comparable.
 */
export const SHIPMENT_TYPES = [
  { value: "general", label: "General Parcel", productCode: "SPX", Icon: Box },
  { value: "documents", label: "Documents / Papers", productCode: "DOX", Icon: FileText },
  { value: "medicine", label: "Prescription Medicine", productCode: "SPX", Icon: Pill },
  { value: "baggage", label: "Student Baggage", productCode: "SPX", Icon: Luggage },
  { value: "food", label: "Vacuum Packed Foods", productCode: "SPX", Icon: Apple },
] as const;

export type ShipmentType = (typeof SHIPMENT_TYPES)[number]["value"];

interface ShipmentTypeSelectProps {
  value: ShipmentType;
  onChange: (value: ShipmentType) => void;
  id?: string;
}

export default function ShipmentTypeSelect({
  value,
  onChange,
  id = "shipment-type",
}: ShipmentTypeSelectProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = SHIPMENT_TYPES.find((t) => t.value === value) ?? SHIPMENT_TYPES[0];

  const openList = () => {
    setActive(SHIPMENT_TYPES.findIndex((t) => t.value === value));
    setOpen(true);
  };

  const closeList = () => {
    setActive(0);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closeList();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const commit = (v: ShipmentType) => {
    onChange(v);
    closeList();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        openList();
      }
      return;
    }
    const last = SHIPMENT_TYPES.length - 1;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => (i + 1) % SHIPMENT_TYPES.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => (i - 1 + SHIPMENT_TYPES.length) % SHIPMENT_TYPES.length);
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(last);
        break;
      case "Enter":
        e.preventDefault();
        commit(SHIPMENT_TYPES[active].value);
        break;
      case "Escape":
        e.preventDefault();
        closeList();
        break;
      case "Tab":
        closeList();
        break;
    }
  };

  const SelectedIcon = selected.Icon;

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={`${id}-listbox`}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={onKeyDown}
        className="w-full bg-white border border-slate-300 text-slate-900 rounded-2xl h-12 px-4 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 hover:border-slate-400 transition-colors flex items-center gap-2.5 text-left cursor-pointer"
      >
        <SelectedIcon className="h-4 w-4 shrink-0 text-amber-600" />
        <span className="flex-1 truncate">{selected.label}</span>
        <span className="text-[10px] font-bold text-slate-400 shrink-0">
          {selected.productCode}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-12px_rgba(2,10,49,0.35)] ring-1 ring-slate-900/5 overflow-hidden py-1"
        >
          {SHIPMENT_TYPES.map((t, i) => {
            const isSelected = t.value === value;
            const isActive = i === active;
            const { Icon } = t;
            return (
              <li key={t.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => commit(t.value)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-semibold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? "text-slate-900" : "text-amber-600"
                    }`}
                  />
                  <span className="flex-1 truncate">{t.label}</span>
                  <span
                    className={`text-[10px] font-bold ${
                      isActive ? "text-slate-900/70" : "text-slate-400"
                    }`}
                  >
                    {t.productCode}
                  </span>
                  {isSelected && (
                    <Check
                      className={`h-3.5 w-3.5 ${
                        isActive ? "text-slate-900" : "text-amber-600"
                      }`}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
