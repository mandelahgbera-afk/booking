"use client";

import { cn } from "@/lib/utils";
import type { Airline } from "@/lib/mock-data";

export type Filters = {
  maxPrice: number;
  stops: Array<0 | 1 | 2>;
  cabins: string[];
  airlineCodes: string[];
};

const CABINS = ["Economy", "Premium Economy", "Business", "First"];

export const FiltersSidebar = ({
  filters,
  onChange,
  airlines,
  priceCeiling,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  airlines: Airline[];
  priceCeiling: number;
}) => {
  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <aside className="sticky top-28 flex h-fit flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Max price</h3>
        <input
          type="range"
          min={100}
          max={priceCeiling}
          step={10}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="mt-3 w-full accent-orange-500"
        />
        <div className="mt-1 text-sm font-medium text-slate-500">
          Up to ${filters.maxPrice}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Stops</h3>
        <div className="mt-3 flex flex-col gap-2">
          {[0, 1, 2].map((s) => (
            <label
              key={s}
              className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"
            >
              <input
                type="checkbox"
                checked={filters.stops.includes(s as 0 | 1 | 2)}
                onChange={() =>
                  onChange({ ...filters, stops: toggle(filters.stops, s as 0 | 1 | 2) })
                }
                className="h-4 w-4 rounded accent-orange-500"
              />
              {s === 0 ? "Nonstop" : `${s} stop${s > 1 ? "s" : ""}`}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Cabin</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {CABINS.map((c) => (
            <button
              key={c}
              onClick={() => onChange({ ...filters, cabins: toggle(filters.cabins, c) })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                filters.cabins.includes(c)
                  ? "border-orange-500 bg-orange-50 text-orange-600"
                  : "border-slate-200 text-slate-500 hover:border-slate-300"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Airlines</h3>
        <div className="mt-3 flex flex-col gap-2">
          {airlines.map((a) => (
            <label
              key={a.code}
              className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"
            >
              <input
                type="checkbox"
                checked={filters.airlineCodes.includes(a.code)}
                onChange={() =>
                  onChange({
                    ...filters,
                    airlineCodes: toggle(filters.airlineCodes, a.code),
                  })
                }
                className="h-4 w-4 rounded accent-orange-500"
              />
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: a.color }}
              />
              {a.name}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};
