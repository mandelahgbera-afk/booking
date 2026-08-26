import { SearchWidget } from "./SearchWidget";
import { stats } from "@/lib/mock-data";

export const Hero = () => {
  return (
    <section className="gradient-hero relative overflow-hidden pb-28 pt-36 sm:pt-44">
      <div
        aria-hidden
        className="animate-float absolute -left-24 top-24 h-72 w-72 rounded-full bg-secondary-100/60 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-float-delayed absolute -right-16 top-52 h-80 w-80 rounded-full bg-primary-100/70 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 text-center">
        <span className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-600">
          ✈️ Booking across 50+ airlines · Not affiliated with any single carrier
        </span>

        <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl">
          Fly anywhere, <span className="text-gradient">book with confidence</span>
        </h1>

        <p className="mt-5 max-w-xl text-base text-slate-500 sm:text-lg">
          We&apos;re a trusted third-party booking platform — compare real-time fares
          across the USA, Asia, and the UK from the airlines you already know, then
          book, split payment, and manage every trip from one beautifully simple place.
        </p>

        <div className="mt-10 w-full">
          <SearchWidget />
        </div>

        <div className="mt-14 grid w-full max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-slate-500 sm:text-sm">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
