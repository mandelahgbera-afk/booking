import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { flightOffers } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export const PopularRoutes = () => {
  // Multiple offers can share a route (e.g. two airlines flying JFK→LHR) —
  // dedupe to one row per route, keeping the cheapest fare, so keys stay
  // unique and "popular routes" doesn't show the same city pair twice.
  const byRoute = new Map<string, (typeof flightOffers)[number]>();
  for (const o of flightOffers) {
    const key = `${o.from.code}-${o.to.code}`;
    const existing = byRoute.get(key);
    if (!existing || o.price < existing.price) byRoute.set(key, o);
  }
  const routes = [...byRoute.values()].map((o) => ({
    from: o.from,
    to: o.to,
    price: o.price,
    airline: o.airline.name,
    durationMins: o.durationMins,
  }));

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-orange-500">
              <TrendingUp size={14} /> Trending
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Popular routes this week
            </h2>
          </div>
          <Link
            href="/destinations"
            className="flex items-center gap-1 text-sm font-semibold text-orange-500 hover:underline"
          >
            Browse all destinations <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-400">
                <th className="px-6 py-3 font-medium">Route</th>
                <th className="hidden px-6 py-3 font-medium sm:table-cell">Airline</th>
                <th className="hidden px-6 py-3 font-medium sm:table-cell">Duration</th>
                <th className="px-6 py-3 font-medium">From</th>
                <th className="px-6 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={`${r.from.code}-${r.to.code}`} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">
                      {r.from.city} <span className="text-slate-300">→</span> {r.to.city}
                    </div>
                    <div className="text-xs text-slate-400">
                      {r.from.code} → {r.to.code}
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 text-slate-500 sm:table-cell">{r.airline}</td>
                  <td className="hidden px-6 py-4 text-slate-500 sm:table-cell">
                    {Math.floor(r.durationMins / 60)}h {r.durationMins % 60}m
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {formatCurrency(r.price)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/flights?from=${r.from.code}&to=${r.to.code}`}
                      className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-orange-300 hover:text-orange-500"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
