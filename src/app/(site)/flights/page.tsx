import { getFlightOffers } from "@/lib/data";
import { FlightResults } from "@/components/flights/FlightResults";
import { SearchWidget } from "@/components/landing/SearchWidget";

// Public data only (no cookies) — page is statically generated and
// revalidated in the background every 60s instead of rendering on every
// request, which is what keeps this cheap on Vercel's serverless functions.
export const revalidate = 60;

export default async function FlightsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  const offers = await getFlightOffers({ from, to });

  return (
    <div className="bg-slate-50">
      <div className="gradient-hero border-b border-slate-200 px-6 pb-10 pt-32">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Flight search results
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {offers[0]
              ? `${offers[0].from.city} (${offers[0].from.code}) → ${offers[0].to.city} (${offers[0].to.code})`
              : from && to
                ? `No flights found for ${from} → ${to} — try a different route below.`
                : "Adjust your search below"}
          </p>
          <div className="mt-6">
            <SearchWidget defaultFrom={from || "JFK"} defaultTo={to || "LHR"} />
          </div>
        </div>
      </div>

      <div className="pt-10">
        <FlightResults offers={offers} />
      </div>
    </div>
  );
}
