"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { FlightCard } from "./FlightCard";
import { FiltersSidebar, type Filters } from "./FiltersSidebar";
import { RouteMap } from "./RouteMap";
import { cn } from "@/lib/utils";
import type { FlightOffer, Airline } from "@/lib/mock-data";

type SortKey = "price" | "duration" | "departure";

export const FlightResults = ({ offers }: { offers: FlightOffer[] }) => {
  const airlines: Airline[] = useMemo(() => {
    const seen = new Map<string, Airline>();
    offers.forEach((o) => seen.set(o.airline.code, o.airline));
    return [...seen.values()];
  }, [offers]);

  const priceCeiling = useMemo(
    () => Math.max(...offers.map((o) => o.price), 100) + 50,
    [offers]
  );

  const [filters, setFilters] = useState<Filters>({
    maxPrice: priceCeiling,
    stops: [],
    cabins: [],
    airlineCodes: [],
  });
  const [sort, setSort] = useState<SortKey>("price");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return offers
      .filter((o) => o.price <= filters.maxPrice)
      .filter((o) => filters.stops.length === 0 || filters.stops.includes(o.stops))
      .filter((o) => filters.cabins.length === 0 || filters.cabins.includes(o.cabin))
      .filter(
        (o) =>
          filters.airlineCodes.length === 0 ||
          filters.airlineCodes.includes(o.airline.code)
      )
      .sort((a, b) => {
        if (sort === "price") return a.price - b.price;
        if (sort === "duration") return a.durationMins - b.durationMins;
        return a.departTime.localeCompare(b.departTime);
      });
  }, [offers, filters, sort]);

  const first = offers[0];

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24">
      {first && (
        <div className="mb-8">
          <RouteMap from={first.from} to={first.to} />
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-900">{filtered.length}</span>{" "}
          flights found
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 lg:hidden"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 outline-none"
          >
            <option value="price">Cheapest</option>
            <option value="duration">Fastest</option>
            <option value="departure">Earliest departure</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <FiltersSidebar
            filters={filters}
            onChange={setFilters}
            airlines={airlines}
            priceCeiling={priceCeiling}
          />
        </div>

        <div className="flex flex-col gap-4">
          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-400">
              No flights match your filters. Try widening your search.
            </div>
          ) : (
            filtered.map((o) => <FlightCard key={o.id} offer={o} />)
          )}
        </div>
      </div>

      {/* Mobile filters drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileFiltersOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div
          onClick={() => setMobileFiltersOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/30 transition-opacity",
            mobileFiltersOpen ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 right-0 w-[85%] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl transition-transform",
            mobileFiltersOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Filters</h3>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>
          <FiltersSidebar
            filters={filters}
            onChange={setFilters}
            airlines={airlines}
            priceCeiling={priceCeiling}
          />
        </div>
      </div>
    </div>
  );
};
