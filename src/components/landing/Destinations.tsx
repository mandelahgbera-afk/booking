"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { destinations } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const REGIONS = ["All", "USA", "Asia", "UK"] as const;

export const Destinations = () => {
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All");

  const filtered =
    region === "All"
      ? destinations
      : destinations.filter((d) => d.region === region);

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-orange-500">
            Explore
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Top destinations right now
          </h2>
        </div>

        <div className="flex gap-2 rounded-full border border-slate-200 bg-white p-1">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                region === r
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((d) => (
          <a
            key={d.iata}
            href={`/flights?from=JFK&to=${d.iata}`}
            className="group relative overflow-hidden rounded-3xl bg-slate-100 shadow-sm transition-shadow hover:shadow-xl"
          >
            <div className="relative h-56 w-full overflow-hidden">
              <Image
                src={d.image}
                alt={`${d.city}, ${d.country}`}
                fill
                sizes="(max-width: 640px) 100vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            </div>

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white">
              <div>
                <div className="text-xs font-medium text-white/70">
                  {d.country}
                </div>
                <div className="text-lg font-bold">{d.city}</div>
                <div className="mt-1 text-sm text-white/90">
                  from {formatCurrency(d.fromPrice)}
                </div>
              </div>
              <span className="interactive-icon flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                <ArrowUpRight size={16} />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
