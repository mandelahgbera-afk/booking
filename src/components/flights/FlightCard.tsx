import Link from "next/link";
import { PlaneTakeoff, Clock, Luggage } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { FlightOffer } from "@/lib/mock-data";

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export const FlightCard = ({ offer }: { offer: FlightOffer }) => {
  return (
    <div className="group flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white"
          style={{ backgroundColor: offer.airline.color }}
        >
          <PlaneTakeoff size={18} />
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">{offer.departTime}</div>
            <div className="text-xs font-medium text-slate-400">{offer.from.code}</div>
          </div>

          <div className="flex flex-col items-center px-1 text-slate-300 sm:px-3">
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock size={12} /> {formatDuration(offer.durationMins)}
            </span>
            <div className="relative my-1 h-px w-16 bg-slate-200 sm:w-24">
              <PlaneTakeoff
                size={12}
                className="absolute -top-1.5 right-0 text-orange-400"
              />
            </div>
            <span className="text-[11px] text-slate-400">
              {offer.stops === 0 ? "Nonstop" : `${offer.stops} stop`}
            </span>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">{offer.arriveTime}</div>
            <div className="text-xs font-medium text-slate-400">{offer.to.code}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 sm:border-t-0 sm:pt-0">
        <div className="flex flex-col text-xs text-slate-400 sm:items-end">
          <span className="font-medium text-slate-600">
            {offer.airline.name} · {offer.flightNumber}
          </span>
          <span className="flex items-center gap-1">
            <Luggage size={12} /> {offer.cabin} · {offer.seatsLeft} seats left
          </span>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-xl font-bold text-slate-900">
            {formatCurrency(offer.price)}
          </div>
          <Link
            href={`/booking/${offer.id}`}
            className="gradient-primary rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/50 hover:brightness-110 active:scale-95"
          >
            Select
          </Link>
        </div>
      </div>
    </div>
  );
};
