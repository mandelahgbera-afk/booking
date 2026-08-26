import { PartnersBrowser } from "@/components/partners/PartnersBrowser";
import { partnerNetwork } from "@/lib/partners";

export const metadata = { title: "Airlines, Rail & Bus Network" };

function countNames(key: "airlines" | "trains" | "buses") {
  return partnerNetwork.reduce(
    (sum, c) => sum + (c[key]?.reduce((s, g) => s + g.names.length, 0) ?? 0),
    0
  );
}

const totalAirlines = countNames("airlines");
const totalTrains = countNames("trains");
const totalBuses = countNames("buses");

export default function PartnersPage() {
  return (
    <div className="bg-slate-50">
      <div className="gradient-hero border-b border-slate-200 px-6 pb-16 pt-32 text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-orange-500">
          Our network
        </span>
        <h1 className="mx-auto mt-2 max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          We&apos;re not a carrier — we&apos;re how you book one
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-500">
          AirFly is a third-party booking platform. We compare fares across{" "}
          {totalAirlines}+ airlines, {totalTrains}+ rail operators, and{" "}
          {totalBuses}+ coach operators — spanning the United States, Canada,
          the United Kingdom, Germany, and the rest of Europe.
        </p>
      </div>

      <PartnersBrowser countries={partnerNetwork} />

      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <p className="text-xs leading-relaxed text-slate-400">
          Airline, rail, coach, and platform names are shown for informational
          purposes to describe the carriers and services within AirFly&apos;s
          search coverage. Trademarks and logos belong to their respective
          owners. AirFly is an independent booking platform and is not
          affiliated with, endorsed by, or an official partner of the
          companies listed above unless separately stated.
        </p>
      </section>
    </div>
  );
}
