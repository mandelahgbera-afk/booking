import { Search, CreditCard, Ticket } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Search & compare",
    description:
      "Enter your route and dates — we compare fares across airlines instantly, no hidden fees tucked into checkout.",
  },
  {
    icon: CreditCard,
    title: "Book & pay your way",
    description:
      "Pay by card, wallet, or gift card credit. Traveling with others? Split the total across everyone on the booking.",
  },
  {
    icon: Ticket,
    title: "Fly with confidence",
    description:
      "Your e-ticket, seat, and booking reference land instantly — manage or cancel it anytime from your dashboard.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-orange-500">
          How it works
        </span>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Booking a flight, simplified
        </h2>
      </div>

      <div className="relative mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
        <div
          aria-hidden
          className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent sm:block"
        />
        {STEPS.map((s, i) => (
          <div key={s.title} className="relative flex flex-col items-center text-center">
            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-white shadow-lg shadow-orange-500/30">
              <s.icon size={22} />
            </div>
            <span className="absolute -top-2 right-[calc(50%-3.25rem)] flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white sm:right-auto sm:left-[calc(50%+1.6rem)]">
              {i + 1}
            </span>
            <h3 className="mt-5 text-base font-semibold text-slate-900">{s.title}</h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
              {s.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
