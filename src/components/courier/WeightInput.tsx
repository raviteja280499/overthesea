"use client";

import { Minus, Plus } from "lucide-react";

/**
 * Weight field with its own steppers.
 *
 * The native number input stepped to 21.1 / 22.6 rather than clean half-kilos
 * because an <input type="number"> anchors its step sequence to `min`: with
 * min=0.1 and step=0.5 the only valid values are 0.1, 0.6, 1.1, 1.6 … which is
 * where 21.1 and 22.6 came from. The fix is a half-kilo-aligned minimum plus
 * steppers that own the arithmetic, so a hand-typed 21.1 snaps back onto the
 * grid instead of carrying its offset forever.
 */

export const WEIGHT_STEP = 0.5;
export const MIN_WEIGHT_KG = 0.5;
export const MAX_WEIGHT_KG = 1000;

/** Avoids 0.30000000000000004 creeping into the displayed value. */
const tidy = (n: number) => Math.round(n * 100) / 100;

const clamp = (n: number) => Math.min(MAX_WEIGHT_KG, Math.max(MIN_WEIGHT_KG, n));

/** Moves one half-kilo in `direction`, snapping an off-grid value on the way. */
function step(current: number, direction: 1 | -1) {
  const units = current / WEIGHT_STEP;
  const onGrid = Number.isInteger(tidy(units));
  // An off-grid value (a hand-typed 21.1) snaps to the next grid point in the
  // direction pressed rather than to the nearest one — rounding to nearest
  // would make "+" on 21.1 produce 21.0, a decrease.
  const next = onGrid
    ? (Math.round(units) + direction) * WEIGHT_STEP
    : (direction === 1 ? Math.ceil(units) : Math.floor(units)) * WEIGHT_STEP;
  return tidy(clamp(next));
}

interface WeightInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export default function WeightInput({ value, onChange, id = "weight" }: WeightInputProps) {
  const numeric = Number(value);
  const valid = Number.isFinite(numeric);

  const nudge = (direction: 1 | -1) =>
    onChange(String(step(valid ? numeric : MIN_WEIGHT_KG, direction)));

  const atMin = valid && numeric <= MIN_WEIGHT_KG;
  const atMax = valid && numeric >= MAX_WEIGHT_KG;

  const btn =
    "h-8 w-8 shrink-0 rounded-lg flex items-center justify-center border transition-all cursor-pointer " +
    "border-slate-300 text-slate-600 bg-white opacity-70 " +
    "group-hover:opacity-100 group-focus-within:opacity-100 " +
    "hover:bg-gradient-to-br hover:from-amber-400 hover:to-orange-500 " +
    "hover:text-slate-950 hover:border-transparent hover:scale-105 " +
    "active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed " +
    "disabled:hover:bg-none disabled:hover:bg-white disabled:hover:border-slate-300 " +
    "disabled:hover:text-slate-600 disabled:hover:scale-100";

  return (
    <div className="group relative flex items-center gap-1.5 w-full bg-white border border-slate-300 rounded-2xl h-12 px-2 transition-colors focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 hover:border-slate-400">
      <button
        type="button"
        onClick={() => nudge(-1)}
        disabled={atMin}
        aria-label={`Decrease weight by ${WEIGHT_STEP} kg`}
        className={btn}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={MIN_WEIGHT_KG}
        max={MAX_WEIGHT_KG}
        step={WEIGHT_STEP}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          // Own the arrow keys too, so they follow the same half-kilo grid as
          // the buttons rather than the native min-anchored sequence.
          if (e.key === "ArrowUp") {
            e.preventDefault();
            nudge(1);
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            nudge(-1);
          }
        }}
        onBlur={() => {
          if (!valid || value.trim() === "") return onChange(String(MIN_WEIGHT_KG));
          onChange(String(tidy(clamp(numeric))));
        }}
        className="flex-1 min-w-0 bg-transparent text-center text-sm font-bold text-slate-900 tabular-nums outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      <span className="text-[11px] font-bold text-slate-400 shrink-0 pointer-events-none">
        kg
      </span>

      <button
        type="button"
        onClick={() => nudge(1)}
        disabled={atMax}
        aria-label={`Increase weight by ${WEIGHT_STEP} kg`}
        className={btn}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
