"use client";

import { useState } from "react";
import { PlaneTakeoff, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PartnerCountry } from "@/lib/partners";

export const PartnersBrowser = ({ countries }: { countries: PartnerCountry[] }) => {
  const [active, setActive] = useState(countries[0].code);
  const country = countries.find((c) => c.code === active) ?? countries[0];

  return (
    <section className="mx-auto max-w-5xl px-6 pb-20">
      <div className="mx-auto flex w-fit flex-wrap justify-center gap-2 rounded-full border border-slate-200 bg-white p-1.5">
        {countries.map((c) => (
          <button
            key={c.code}
            onClick={() => setActive(c.code)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              active === c.code ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            <span>{c.flag}</span>
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-primary text-white">
              <PlaneTakeoff size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Airlines</h2>
              <p className="text-xs text-slate-400">Carriers in our {country.name} search coverage</p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {country.airlines.map((group) => (
              <div key={group.category}>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {group.category}
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.names.map((name) => (
                    <span
                      key={name}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Globe2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Booking platforms</h2>
              <p className="text-xs text-slate-400">Fares are compared alongside these in {country.name}</p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {country.platforms.map((group) => (
              <div key={group.category}>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {group.category}
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.names.map((name) => (
                    <span
                      key={name}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
