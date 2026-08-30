import { getDestinations } from "@/lib/data";
import { DestinationsBrowser } from "@/components/destinations/DestinationsBrowser";

export const revalidate = 3600;

const VALID_REGIONS = ["North America", "South America", "Europe", "Africa", "Asia", "Middle East", "Oceania"] as const;

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const { region } = await searchParams;
  const destinations = await getDestinations();
  const initialRegion = VALID_REGIONS.includes(region as (typeof VALID_REGIONS)[number])
    ? (region as (typeof VALID_REGIONS)[number])
    : "All";

  return (
    <div className="bg-slate-50">
      <div className="gradient-hero border-b border-slate-200 px-6 pb-16 pt-32 text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-orange-500">
          Where to next
        </span>
        <h1 className="mx-auto mt-2 max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Every destination we fly
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-500">
          {destinations.length} cities across six continents — browse by region and
          jump straight into live fares.
        </p>
      </div>

      <DestinationsBrowser destinations={destinations} initialRegion={initialRegion} />
    </div>
  );
}
