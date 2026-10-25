"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import {
  COURIER_DESTINATIONS,
  POPULAR_COURIER_DESTINATIONS,
  type CourierDestination,
} from "@/lib/constants/countries";

/**
 * Flag images rather than emoji.
 *
 * Regional-indicator emoji (\u{1F1FA}\u{1F1F8}) have no glyph in the fonts that
 * ship with Windows, so Chrome there renders them as the bare letters "US" —
 * which is exactly what a flag-less picker looked like. These 20px PNGs render
 * identically on every platform.
 */
export function Flag({ code, className = "" }: { code: string; className?: string }) {
  return (
    // A 20px decorative sprite from a flag CDN: next/image would need
    // remotePatterns config and optimises nothing at this size.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      alt=""
      aria-hidden
      width={20}
      height={15}
      loading="lazy"
      className={`h-[15px] w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-slate-900/15 ${className}`}
    />
  );
}

interface CountrySelectProps {
  value: string;
  onChange: (code: string) => void;
  id?: string;
  className?: string;
}

export default function CountrySelect({
  value,
  onChange,
  id = "country-select",
  className = "",
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = useMemo(
    () => COURIER_DESTINATIONS.find((d) => d.code === value),
    [value]
  );

  // With no query the popular destinations are pinned on top; once the user
  // types, ranking by match position beats keeping them pinned.
  const options = useMemo<CourierDestination[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      const pinned = new Set<string>(POPULAR_COURIER_DESTINATIONS);
      return [
        ...COURIER_DESTINATIONS.filter((d) => pinned.has(d.code)),
        ...COURIER_DESTINATIONS.filter((d) => !pinned.has(d.code)),
      ];
    }
    return COURIER_DESTINATIONS.filter(
      (d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase() === q
    ).sort((a, b) => {
      // A name that starts with the query outranks one that merely contains it,
      // so typing "ind" offers India-like prefixes before "West Indies".
      const ai = a.name.toLowerCase().indexOf(q);
      const bi = b.name.toLowerCase().indexOf(q);
      return ai - bi || a.name.localeCompare(b.name);
    });
  }, [query]);

  const popularCount = useMemo(() => {
    if (query.trim()) return 0;
    const pinned = new Set<string>(POPULAR_COURIER_DESTINATIONS);
    return COURIER_DESTINATIONS.filter((d) => pinned.has(d.code)).length;
  }, [query]);

  // Moving focus is a real DOM side effect, so it belongs in an effect. The
  // query/highlight resets that used to sit here do not — they are plain
  // consequences of opening, closing or typing, and doing them in the handlers
  // avoids the cascading render that setState-in-effect causes.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const openList = () => {
    setQuery("");
    setActive(0);
    setOpen(true);
  };

  const closeList = () => {
    setQuery("");
    setActive(0);
    setOpen(false);
  };

  // Close on an outside click or a focus escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closeList();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Keep the highlighted row visible while arrowing through a long list.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const commit = (code: string) => {
    onChange(code);
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
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => (options.length ? (i + 1) % options.length : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => (options.length ? (i - 1 + options.length) % options.length : 0));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(Math.max(0, options.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (options[active]) commit(options[active].code);
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

  return (
    <div ref={rootRef} className={`relative ${className}`}>
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
        {selected ? (
          <>
            <Flag code={selected.code} />
            <span className="flex-1 truncate">{selected.name}</span>
            <span className="text-[11px] font-bold text-slate-500 tabular-nums">
              {selected.code}
            </span>
          </>
        ) : (
          <span className="flex-1 text-slate-400">Select a country…</span>
        )}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-12px_rgba(2,10,49,0.35)] ring-1 ring-slate-900/5 overflow-hidden">
          <div className="flex items-center gap-2 px-3 border-b border-slate-200 bg-slate-50">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search 110+ destinations…"
              aria-autocomplete="list"
              aria-controls={`${id}-listbox`}
              className="flex-1 bg-transparent h-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
            />
            {query && (
              <span className="text-[11px] text-slate-500 tabular-nums shrink-0">
                {options.length}
              </span>
            )}
          </div>

          <ul
            ref={listRef}
            id={`${id}-listbox`}
            role="listbox"
            className="max-h-64 overflow-y-auto py-1"
          >
            {options.length === 0 && (
              <li className="px-4 py-6 text-center text-xs text-slate-400">
                No destination matches “{query}”.
              </li>
            )}

            {options.map((d, i) => {
              const isSelected = d.code === value;
              const isActive = i === active;
              return (
                <li key={d.code}>
                  {/* A divider rather than an optgroup: the pinned block only
                      exists while the list is unfiltered. */}
                  {popularCount > 0 && i === 0 && (
                    <p className="px-4 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-amber-400/70">
                      Popular destinations
                    </p>
                  )}
                  {popularCount > 0 && i === popularCount && (
                    <p className="px-4 pt-2.5 pb-1 mt-1 border-t border-amber-900/40 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      All destinations
                    </p>
                  )}
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-index={i}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => commit(d.code)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-semibold"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Flag code={d.code} />
                    <span className="flex-1 truncate">{d.name}</span>
                    <span
                      className={`text-[11px] font-bold tabular-nums ${
                        isActive ? "text-slate-900/70" : "text-slate-400"
                      }`}
                    >
                      {d.code}
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

          <p className="px-4 py-2 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-500">
            <kbd className="font-sans font-bold text-slate-600">↑↓</kbd> to browse ·{" "}
            <kbd className="font-sans font-bold text-slate-600">Enter</kbd> to select ·{" "}
            <kbd className="font-sans font-bold text-slate-600">Esc</kbd> to close
          </p>
        </div>
      )}
    </div>
  );
}
