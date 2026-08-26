"use client";

import { useState } from "react";
import { PlaneTakeoff, Globe2, TrainFront, Bus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PartnerCategoryGroup, PartnerCountry } from "@/lib/partners";

const PANELS: {
  key: keyof Pick<PartnerCountry, "airlines" | "platforms" | "trains" | "buses">;
  title: string;
  subtitle: (name: string) => string;
  icon: LucideIcon;
  iconClass: string;
}[] = [
  {
    key: "airlines",
    title: "Airlines",
    subtitle: (name) => `Carriers in our ${name} search coverage`,
    icon: PlaneTakeoff,
    iconClass: "gradient-primary text-white",
  },
  {
    key: "trains",
    title: "Trains",
    subtitle: (name) => `Rail operators & booking sites for ${name}`,
    icon: TrainFront,
    iconClass: "bg-blue-500 text-white",
  },
  {
    key: "buses",
    title: "Buses & coaches",
    subtitle: (name) => `Coach operators & booking sites for ${name}`,
    icon: Bus,
    iconClass: "bg-purple-500 text-white",
  },
  {
    key: "platforms",
    title: "Booking platforms",
    subtitle: (name) => `Fares are compared alongside these in ${name}`,
    icon: Globe2,
    iconClass: "bg-slate-900 text-white",
  },
];

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

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {PANELS.filter((p) => country[p.key] && country[p.key]!.length > 0).map((panel) => (
          <PanelCard
            key={panel.key}
            title={panel.title}
            subtitle={panel.subtitle(country.name)}
            icon={panel.icon}
            iconClass={panel.iconClass}
            groups={country[panel.key]!}
          />
        ))}
      </div>
    </section>
  );
};

const PanelCard = ({
  title,
  subtitle,
  icon: Icon,
  iconClass,
  groups,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconClass: string;
  groups: PartnerCategoryGroup[];
}) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6">
    <div className="mb-5 flex items-center gap-3">
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", iconClass)}>
        <Icon size={18} />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>

    <div className="flex flex-col gap-5">
      {groups.map((group) => (
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
);
