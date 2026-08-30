import { getAdminFlights, getAirlines, getAirports } from "@/lib/data";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AddRouteForm } from "@/components/admin/AddRouteForm";
import { RouteStatusToggle } from "@/components/admin/RouteStatusToggle";
import { formatCurrency } from "@/lib/utils";

const MODE_LABEL: Record<string, string> = { flight: "Flight", train: "Train", bus: "Bus" };

export default async function AdminFlightsPage() {
  const [routes, airlines, airports] = await Promise.all([getAdminFlights(), getAirlines(), getAirports()]);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Flights, Trains & Buses</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Every route across all three travel modes, scheduled or cancelled. Add a route below —
            no SQL required. Cancelling a route pulls it from search immediately without touching
            any booking that already used it.
          </p>
        </div>
        <AddRouteForm airlines={airlines} airports={airports} />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-2">
        <div className="overflow-x-auto">
          <table className="w-full md:min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="p-4 font-medium">Route</th>
                <th className="hidden md:table-cell p-4 font-medium">Mode</th>
                <th className="hidden md:table-cell p-4 font-medium">Operator</th>
                <th className="p-4 font-medium">From → To</th>
                <th className="hidden md:table-cell p-4 font-medium">Departs</th>
                <th className="hidden md:table-cell p-4 font-medium">Cabin</th>
                <th className="p-4 font-medium">Price</th>
                <th className="hidden md:table-cell p-4 font-medium">Seats left</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="p-4 font-mono text-xs font-semibold text-slate-700">{r.flightNumber}</td>
                  <td className="hidden md:table-cell p-4 text-slate-500">{MODE_LABEL[r.mode] ?? r.mode}</td>
                  <td className="hidden md:table-cell p-4 text-slate-500">{r.airline.name}</td>
                  <td className="p-4 text-slate-700">
                    {r.from.code} → {r.to.code}
                  </td>
                  <td className="hidden md:table-cell p-4 text-slate-500">{new Date(r.departAt).toLocaleString()}</td>
                  <td className="hidden md:table-cell p-4 text-slate-500">{r.cabin}</td>
                  <td className="p-4 font-semibold text-slate-900">{formatCurrency(r.price)}</td>
                  <td className="hidden md:table-cell p-4 text-slate-500">
                    {r.seatsLeft} / {r.seatsTotal}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="p-4">
                    <RouteStatusToggle id={r.id} status={r.status} />
                  </td>
                </tr>
              ))}
              {routes.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-sm text-slate-400">
                    No routes yet — add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
