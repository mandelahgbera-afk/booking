"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftRight, Bus, Calendar, MapPin, PlaneTakeoff, Search, TrainFront, Users } from "lucide-react";
import { Button } from "@/components/Button";
import { AirportPicker } from "./AirportPicker";
import { cn } from "@/lib/utils";

const MODES = [
  { key: "flights", label: "Flights", icon: PlaneTakeoff, href: "/flights" },
  { key: "trains", label: "Trains", icon: TrainFront, href: "/trains" },
  { key: "buses", label: "Buses", icon: Bus, href: "/buses" },
] as const;

type ModeKey = (typeof MODES)[number]["key"];

const TABS = [
  { key: "oneway", label: "One Way" },
  { key: "roundtrip", label: "Round Trip" },
  { key: "multicity", label: "Multi City" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export const SearchWidget = ({
  mode = "flights",
  defaultFrom = "JFK",
  defaultTo = "LHR",
}: {
  mode?: ModeKey;
  defaultFrom?: string;
  defaultTo?: string;
}) => {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("roundtrip");
  const [fromCode, setFromCode] = useState(defaultFrom);
  const [toCode, setToCode] = useState(defaultTo);
  const [departDate, setDepartDate] = useState("2026-09-14");
  const [returnDate, setReturnDate] = useState("2026-09-21");
  const [travelers, setTravelers] = useState("1");

  const swap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  const search = () => {
    const params = new URLSearchParams({
      from: fromCode,
      to: toCode,
      depart: departDate,
      pax: travelers,
    });
    if (tab === "roundtrip") params.set("return", returnDate);
    router.push(`/${mode}?${params.toString()}`);
  };

  const modeNoun = MODES.find((m) => m.key === mode)?.label ?? "Flights";

  return (
    <div className="mx-auto w-full max-w-4xl glass-card rounded-3xl p-3 sm:p-4">
      <div className="mb-1 flex flex-wrap items-center gap-1 border-b border-slate-200/70 px-2 pb-3">
        {MODES.map((m) => {
          const active = m.key === mode;
          return (
            <Link
              key={m.key}
              href={m.href}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                active ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <m.icon size={14} />
              {m.label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 px-2 pb-3 pt-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "gradient-primary text-white shadow-sm shadow-orange-500/30"
                : "text-slate-500 hover:bg-slate-100"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 rounded-2xl bg-white/70 p-2 sm:grid-cols-[1fr_auto_1fr_auto_auto_auto] sm:items-stretch">
        <AirportPicker
          label="From"
          icon={<MapPin size={16} />}
          code={fromCode}
          onSelect={(a) => setFromCode(a.code)}
        />

        <div className="hidden items-center justify-center sm:flex">
          <button
            onClick={swap}
            aria-label="Swap origin and destination"
            className="interactive-icon flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-orange-500 shadow-sm"
          >
            <ArrowLeftRight size={16} />
          </button>
        </div>

        <AirportPicker
          label="To"
          icon={<MapPin size={16} />}
          code={toCode}
          onSelect={(a) => setToCode(a.code)}
        />

        <Field label="Departing" icon={<Calendar size={16} />}>
          <input
            type="date"
            value={departDate}
            onChange={(e) => setDepartDate(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
          />
        </Field>

        {tab === "roundtrip" && (
          <Field label="Returning" icon={<Calendar size={16} />}>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
            />
          </Field>
        )}

        <Field label="Travelers" icon={<Users size={16} />}>
          <select
            value={travelers}
            onChange={(e) => setTravelers(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
          >
            <option value="1">1 Adult</option>
            <option value="2">2 Adults</option>
            <option value="3">2 Adults, 1 Child</option>
            <option value="4">Family (4)</option>
          </select>
        </Field>
      </div>

      <div className="flex justify-end px-2 pt-3">
        <Button size="lg" className="w-full gap-2 sm:w-auto" onClick={search}>
          <Search size={18} />
          Search {modeNoun}
        </Button>
      </div>
    </div>
  );
};

const Field = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="min-w-0 rounded-xl px-3 py-2 transition-colors hover:bg-white">
    <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
      {icon}
      {label}
    </div>
    {children}
  </div>
);
