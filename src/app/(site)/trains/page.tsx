import { getFlightOffers } from "@/lib/data";
import { FlightResults } from "@/components/flights/FlightResults";
import { SearchWidget } from "@/components/landing/SearchWidget";

// Public data only (no cookies) — page is statically generated and
// revalidated in the background every 60s, same pattern as /flights.
export const revalidate = 60;

export const metadata = { title: "Trains" };

export default async function TrainsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  const offers = await getFlightOffers({ from, to, mode: "train" });

  return (
    <div className="bg-slate-50">
      <div className="gradient-hero border-b border-slate-200 px-6 pb-10 pt-32">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Train search results
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {offers[0]
              ? `${offers[0].from.city} (${offers[0].from.code}) → ${offers[0].to.city} (${offers[0].to.code})`
              : from && to
                ? `No trains found for ${from} → ${to} — try a different route below.`
                : "City-to-city rail across Germany, France, the UK, and beyond."}
          </p>
          <div className="mt-6">
            <SearchWidget mode="trains" defaultFrom={from || "BER"} defaultTo={to || "MUC"} />
          </div>
        </div>
      </div>

      <div className="pt-10">
        <FlightResults offers={offers} resultNoun="trains" />
      </div>
    </div>
  );
}
