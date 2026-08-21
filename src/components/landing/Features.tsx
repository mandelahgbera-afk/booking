import { BadgeCheck, Clock3, ShieldCheck, Wallet } from "lucide-react";

const FEATURES = [
  {
    icon: Wallet,
    title: "Best price guarantee",
    description:
      "We compare fares across airlines in real time so you never overpay for a seat.",
  },
  {
    icon: Clock3,
    title: "Free cancellation, 24h",
    description:
      "Plans change. Cancel within 24 hours of booking on select fares, no questions asked.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    description:
      "Every booking and payment is encrypted end-to-end, with fraud checks built in.",
  },
  {
    icon: BadgeCheck,
    title: "Verified reviews",
    description:
      "Real feedback from real travelers, so you know exactly what to expect on board.",
  },
];

export const Features = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-orange-500">
          Why AirFly
        </span>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Built for travelers who expect more
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5"
          >
            <div className="interactive-icon flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-white shadow-lg shadow-orange-500/30">
              <f.icon size={22} />
            </div>
            <h3 className="mt-5 text-base font-semibold text-slate-900">
              {f.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
