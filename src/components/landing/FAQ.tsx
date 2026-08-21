"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Can I cancel or change my booking?",
    a: "Most fares can be cancelled free within 24 hours of booking. After that, your fare rules (shown before checkout) determine any change or cancellation fee.",
  },
  {
    q: "How do gift cards and wallet credit work?",
    a: "Buy or redeem a gift card on the Gift Cards page — credit lands in your wallet instantly and can be applied toward any future booking, partial or full.",
  },
  {
    q: "When will I get my confirmation?",
    a: "Immediately. Your e-ticket, seat assignment, and booking reference are generated the moment payment completes — no waiting.",
  },
  {
    q: "Can I split payment with other travelers?",
    a: "Yes — at checkout, toggle \"split payment\" to divide the total evenly across everyone on the booking.",
  },
  {
    q: "Which regions do you cover?",
    a: "We currently fly routes across the USA, Asia, and the UK, with new destinations added regularly.",
  },
];

export const FAQ = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <div className="text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-orange-500">FAQ</span>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Questions, answered
        </h2>
      </div>

      <div className="mt-10 flex flex-col gap-3">
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.q}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold text-slate-900">{item.q}</span>
                <ChevronDown
                  size={16}
                  className={cn(
                    "shrink-0 text-slate-400 transition-transform",
                    isOpen && "rotate-180 text-orange-500"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm leading-relaxed text-slate-500">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
