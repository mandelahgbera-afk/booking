"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createRoute, type CreateRouteInput } from "@/app/admin/(dashboard)/flights/actions";
import type { Airline, Airport } from "@/lib/mock-data";

const MODES = [
  { key: "flight", label: "Flight" },
  { key: "train", label: "Train" },
  { key: "bus", label: "Bus" },
] as const;

const NEW = "__new__";
const REGIONS = ["USA", "Asia", "UK", "Other"] as const;

type LocationDraft = {
  code: string;
  city: string;
  name: string;
  country: string;
  region: (typeof REGIONS)[number];
  latLng: string; // "lat,lng", optional — parsed on submit, only feeds the route map
};

const emptyLocation: LocationDraft = { code: "", city: "", name: "", country: "", region: "Other", latLng: "" };

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400";

export const AddRouteForm = ({ airlines, airports }: { airlines: Airline[]; airports: Airport[] }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const [mode, setMode] = useState<CreateRouteInput["mode"]>("flight");
  const [flightNumber, setFlightNumber] = useState("");
  const [airlineCode, setAirlineCode] = useState("");
  const [newAirlineName, setNewAirlineName] = useState("");
  const [newAirlineColor, setNewAirlineColor] = useState("#f97316");
  const [newAirlineCodeState, setNewAirlineCodeState] = useState("");

  const [fromCode, setFromCode] = useState("");
  const [newFrom, setNewFrom] = useState<LocationDraft>(emptyLocation);
  const [toCode, setToCode] = useState("");
  const [newTo, setNewTo] = useState<LocationDraft>(emptyLocation);

  const [departAt, setDepartAt] = useState("");
  const [arriveAt, setArriveAt] = useState("");
  const [cabin, setCabin] = useState<CreateRouteInput["cabin"]>("Economy");
  const [price, setPrice] = useState("");
  const [seatsTotal, setSeatsTotal] = useState("");
  const [stops, setStops] = useState("0");

  const reset = () => {
    setMode("flight");
    setFlightNumber("");
    setAirlineCode("");
    setNewAirlineName("");
    setNewAirlineColor("#f97316");
    setNewAirlineCodeState("");
    setFromCode("");
    setNewFrom(emptyLocation);
    setToCode("");
    setNewTo(emptyLocation);
    setDepartAt("");
    setArriveAt("");
    setCabin("Economy");
    setPrice("");
    setSeatsTotal("");
    setStops("0");
  };

  const parseLatLng = (raw: string): { lat: number; lng: number } => {
    const [lat, lng] = raw.split(",").map((n) => Number(n.trim()));
    return { lat: Number.isFinite(lat) ? lat : 0, lng: Number.isFinite(lng) ? lng : 0 };
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const input: CreateRouteInput = {
      mode,
      flightNumber,
      airlineCode: airlineCode === NEW ? newAirlineCodeState.trim().toUpperCase() : airlineCode,
      fromCode: fromCode === NEW ? newFrom.code : fromCode,
      toCode: toCode === NEW ? newTo.code : toCode,
      departAt,
      arriveAt,
      cabin,
      price: Number(price),
      seatsTotal: Number(seatsTotal),
      stops: Number(stops) as 0 | 1 | 2,
    };

    if (airlineCode === NEW) {
      input.newAirline = { name: newAirlineName, color: newAirlineColor };
    }
    if (fromCode === NEW) {
      const { lat, lng } = parseLatLng(newFrom.latLng);
      input.newFrom = { city: newFrom.city, name: newFrom.name, country: newFrom.country, region: newFrom.region, lat, lng };
    }
    if (toCode === NEW) {
      const { lat, lng } = parseLatLng(newTo.latLng);
      input.newTo = { city: newTo.city, name: newTo.name, country: newTo.country, region: newTo.region, lat, lng };
    }

    startTransition(async () => {
      const res = await createRoute(input);
      setFeedback(res);
      if (res.ok) {
        reset();
        router.refresh();
      }
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl gradient-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20"
      >
        <Plus size={16} /> Add route
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-200 bg-white p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Add a new route</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Mode">
          <select value={mode} onChange={(e) => setMode(e.target.value as CreateRouteInput["mode"])} className={inputClass}>
            {MODES.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Route number">
          <input
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            placeholder="e.g. AF 712"
            className={inputClass}
            required
          />
        </Field>

        <Field label="Cabin">
          <select
            value={cabin}
            onChange={(e) => setCabin(e.target.value as CreateRouteInput["cabin"])}
            className={inputClass}
          >
            {["Economy", "Premium Economy", "Business", "First"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Operator">
            <select value={airlineCode} onChange={(e) => setAirlineCode(e.target.value)} className={inputClass} required>
              <option value="" disabled>
                Choose an operator
              </option>
              {airlines.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.name} ({a.code})
                </option>
              ))}
              <option value={NEW}>+ Add a new operator…</option>
            </select>
          </Field>
          {airlineCode === NEW && (
            <div className="mt-2 grid grid-cols-1 gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-3">
              <input
                value={newAirlineCodeState}
                onChange={(e) => setNewAirlineCodeState(e.target.value)}
                placeholder="Code (e.g. XY)"
                maxLength={4}
                className={inputClass}
                required
              />
              <input
                value={newAirlineName}
                onChange={(e) => setNewAirlineName(e.target.value)}
                placeholder="Operator name"
                className={inputClass}
                required
              />
              <input
                type="color"
                value={newAirlineColor}
                onChange={(e) => setNewAirlineColor(e.target.value)}
                className="h-[38px] w-full rounded-lg border border-slate-200"
              />
            </div>
          )}
        </div>

        <LocationField label="From" airports={airports} value={fromCode} onChange={setFromCode} draft={newFrom} onDraftChange={setNewFrom} />
        <LocationField label="To" airports={airports} value={toCode} onChange={setToCode} draft={newTo} onDraftChange={setNewTo} />

        <Field label="Departs">
          <input
            type="datetime-local"
            value={departAt}
            onChange={(e) => setDepartAt(e.target.value)}
            className={inputClass}
            required
          />
        </Field>
        <Field label="Arrives">
          <input
            type="datetime-local"
            value={arriveAt}
            onChange={(e) => setArriveAt(e.target.value)}
            className={inputClass}
            required
          />
        </Field>
        <Field label="Stops">
          <select value={stops} onChange={(e) => setStops(e.target.value)} className={inputClass}>
            <option value="0">Nonstop</option>
            <option value="1">1 stop</option>
            <option value="2">2 stops</option>
          </select>
        </Field>

        <Field label="Price (USD)">
          <input
            type="number"
            min="1"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
            required
          />
        </Field>
        <Field label="Total seats">
          <input
            type="number"
            min="1"
            step="1"
            value={seatsTotal}
            onChange={(e) => setSeatsTotal(e.target.value)}
            className={inputClass}
            required
          />
        </Field>
      </div>

      {feedback && (
        <div className={cn("mt-4 rounded-xl px-4 py-2.5 text-sm", feedback.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600")}>
          {feedback.message}
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded-xl gradient-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 disabled:opacity-50"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          {pending ? "Adding…" : "Add route"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-400 hover:text-slate-600">
          Cancel
        </button>
      </div>
    </form>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
    {children}
  </div>
);

const LocationField = ({
  label,
  airports,
  value,
  onChange,
  draft,
  onDraftChange,
}: {
  label: string;
  airports: Airport[];
  value: string;
  onChange: (v: string) => void;
  draft: LocationDraft;
  onDraftChange: (d: LocationDraft) => void;
}) => (
  <div>
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} required>
        <option value="" disabled>
          Choose a location
        </option>
        {airports.map((a) => (
          <option key={a.code} value={a.code}>
            {a.city} ({a.code})
          </option>
        ))}
        <option value={NEW}>+ Add a new location…</option>
      </select>
    </Field>
    {value === NEW && (
      <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3">
        <input
          value={draft.code}
          onChange={(e) => onDraftChange({ ...draft, code: e.target.value })}
          placeholder="Code (e.g. LYO)"
          maxLength={4}
          className={inputClass}
          required
        />
        <input
          value={draft.city}
          onChange={(e) => onDraftChange({ ...draft, city: e.target.value })}
          placeholder="City"
          className={inputClass}
          required
        />
        <input
          value={draft.name}
          onChange={(e) => onDraftChange({ ...draft, name: e.target.value })}
          placeholder="Station/airport name (optional)"
          className={cn(inputClass, "col-span-2")}
        />
        <input
          value={draft.country}
          onChange={(e) => onDraftChange({ ...draft, country: e.target.value })}
          placeholder="Country"
          className={inputClass}
          required
        />
        <select
          value={draft.region}
          onChange={(e) => onDraftChange({ ...draft, region: e.target.value as LocationDraft["region"] })}
          className={inputClass}
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <input
          value={draft.latLng}
          onChange={(e) => onDraftChange({ ...draft, latLng: e.target.value })}
          placeholder="lat,lng (optional — for the route map)"
          className={cn(inputClass, "col-span-2")}
        />
      </div>
    )}
  </div>
);
