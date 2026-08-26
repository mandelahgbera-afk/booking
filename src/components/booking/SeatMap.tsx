"use client";

import { cn } from "@/lib/utils";

const ROWS = 8;
const COLS = ["A", "B", "C", "D", "E", "F"];

// Deterministic pseudo-random "taken" seats so the layout looks realistic
// but doesn't shift between renders.
function isTaken(row: number, col: string) {
  const seed = row * 7 + col.charCodeAt(0);
  return seed % 5 === 0;
}

export const SeatMap = ({
  count,
  selected,
  onChange,
}: {
  count: number;
  selected: string[];
  onChange: (seats: string[]) => void;
}) => {
  const toggle = (seat: string, taken: boolean) => {
    if (taken) return;
    if (selected.includes(seat)) {
      onChange(selected.filter((s) => s !== seat));
      return;
    }
    if (selected.length >= count) {
      onChange([...selected.slice(1), seat]);
      return;
    }
    onChange([...selected, seat]);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Select {count} seat{count > 1 ? "s" : ""}
        </h3>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-slate-100" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm gradient-primary" /> Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-slate-300" /> Taken
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-xs flex-col gap-2">
        {Array.from({ length: ROWS }).map((_, r) => {
          const row = r + 1;
          return (
            <div key={row} className="flex items-center justify-center gap-2">
              <span className="flex h-7 w-6 shrink-0 items-center justify-center rounded-md bg-slate-50 text-xs font-bold text-slate-500">
                {row}
              </span>
              {COLS.map((col, i) => {
                const seat = `${row}${col}`;
                const taken = isTaken(row, col);
                const isSelected = selected.includes(seat);
                return (
                  <button
                    key={seat}
                    type="button"
                    disabled={taken}
                    onClick={() => toggle(seat, taken)}
                    className={cn(
                      "h-7 w-7 rounded-md text-[10px] font-semibold transition-all",
                      i === 2 && "mr-2",
                      taken && "cursor-not-allowed bg-slate-200 text-slate-400",
                      !taken && !isSelected && "bg-slate-100 text-slate-500 hover:bg-slate-200",
                      isSelected && "gradient-primary scale-110 text-white shadow-md shadow-orange-500/30"
                    )}
                  >
                    {col}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
