import { getAdminFlights, getAirlines, getAirports } from "@/lib/data";
import { AddRouteForm } from "@/components/admin/AddRouteForm";
import { RouteTable } from "@/components/admin/RouteTable";

export default async function AdminFlightsPage() {
  const [routes, airlines, airports] = await Promise.all([
    getAdminFlights(),
    getAirlines(),
    getAirports(),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Flights, Trains &amp; Buses</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Every route across all three travel modes, scheduled or cancelled. Add a route below —
            no SQL required. Cancelling a route pulls it from search immediately without touching
            any booking that already used it.
          </p>
        </div>
        <AddRouteForm airlines={airlines} airports={airports} />
      </div>

      <RouteTable routes={routes} />
    </div>
  );
}
