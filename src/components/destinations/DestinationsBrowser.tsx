"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Destination } from "@/lib/mock-data";

const REGIONS = ["All", "North America", "South America", "Europe", "Africa", "Asia", "Middle East", "Oceania"] as const;

export const DestinationsBrowser = ({
  destinations,
  initialRegion = "All",
}: {
  destinations: Destination[];
  initialRegion?: (typeof REGIONS)[number];
}) => {
  const [region, setRegion] = useState<(typeof REGIONS)[number]>(initialRegion);
  const filtered =
    region === "All" ? destinations : destinations.filter((d) => d.region === region);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex justify-center gap-2 rounded-full border border-slate-200 bg-white p-1 w-fit mx-auto">
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              region === r ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((d) => (
          <a
            key={d.iata}
            href={`/flights?from=JFK&to=${d.iata}`}
            className="group relative overflow-hidden rounded-3xl bg-slate-100 shadow-sm transition-shadow hover:shadow-xl"
          >
            <div className="relative h-64 w-full overflow-hidden">
              <Image
                src={d.image}
                alt={`${d.city}, ${d.country}`}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
              <div>
                <div className="text-xs font-medium text-white/70">{d.country}</div>
                <div className="text-xl font-bold">{d.city}</div>
                <div className="mt-1 text-sm text-white/90">from {formatCurrency(d.fromPrice)}</div>
              </div>
              <span className="interactive-icon flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                <ArrowUpRight size={18} />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
