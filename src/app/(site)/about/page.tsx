import Image from "next/image";
import Link from "next/link";
import { stats } from "@/lib/mock-data";
import { partnerNetwork } from "@/lib/partners";
import { Compass, HeartHandshake, ShieldCheck, Sparkles, ArrowRight, Globe2 } from "lucide-react";

export const metadata = { title: "About" };

const VALUES = [
  {
    icon: Compass,
    title: "Clarity over clutter",
    description: "Every fare, fee, and policy shown upfront — no surprises at checkout.",
  },
  {
    icon: ShieldCheck,
    title: "Built to be trusted",
    description: "Bank-grade encryption on every booking, and a support team that answers.",
  },
  {
    icon: HeartHandshake,
    title: "Travelers first",
    description: "We build for the person booking a trip, not the airline selling the seat.",
  },
];

const TEAM = [
  { name: "Priya Nair", role: "CEO & Co-founder", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop" },
  { name: "Marcus Webb", role: "Head of Engineering", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop" },
  { name: "Yuki Sato", role: "Head of Design", photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=300&auto=format&fit=crop" },
  { name: "Emeka Chukwu", role: "Head of Operations", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop" },
];

export default function AboutPage() {
  return (
    <div className="bg-slate-50">
      <div className="gradient-hero border-b border-slate-200 px-6 pb-20 pt-32 text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-orange-500">
          Our story
        </span>
        <h1 className="mx-auto mt-2 max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          We built the flight booking site we always wanted to use
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-500">
          AirFly started as a frustration with clunky, ad-choked booking
          sites — and grew into a platform travelers actually enjoy using,
          across the USA, Asia, and the UK.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm font-medium text-slate-400">
          Important: we&apos;re a booking platform, not an airline — we don&apos;t
          operate flights ourselves.
        </p>
      </div>

      <section className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 py-16 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl font-bold text-slate-900">{s.value}</div>
            <div className="mt-1 text-xs text-slate-500 sm:text-sm">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          What we believe
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary text-white">
                <v.icon size={20} />
              </div>
              <h3 className="mt-5 text-base font-semibold text-slate-900">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-orange-500">
                <Globe2 size={14} /> Our network
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                A trusted third party, not a single carrier
              </h2>
              <p className="mt-2 max-w-lg text-sm text-slate-500">
                We compare and book across major airlines, rail operators, and
                coach companies in the United States, Canada, the United
                Kingdom, Germany, and the rest of Europe — so you don&apos;t
                have to check a dozen sites yourself.
              </p>
            </div>
            <Link
              href="/partners"
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30"
            >
              View full network <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {partnerNetwork
              .flatMap((c) => [
                ...(c.airlines ?? []).flatMap((g) => g.names),
                ...(c.trains ?? []).flatMap((g) => g.names),
                ...(c.buses ?? []).flatMap((g) => g.names),
              ])
              .slice(0, 16)
              .map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                >
                  {name}
                </span>
              ))}
            <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">
              +
              {partnerNetwork.reduce(
                (s, c) =>
                  s +
                  (c.airlines ?? []).reduce((n, g) => n + g.names.length, 0) +
                  (c.trains ?? []).reduce((n, g) => n + g.names.length, 0) +
                  (c.buses ?? []).reduce((n, g) => n + g.names.length, 0),
                0
              ) - 16}{" "}
              more
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-orange-500">
            <Sparkles size={14} /> Leadership
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            The people behind AirFly
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {TEAM.map((t) => (
            <div key={t.name} className="text-center">
              <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full">
                <Image src={t.photo} alt={t.name} fill className="object-cover" />
              </div>
              <div className="mt-3 text-sm font-semibold text-slate-900">{t.name}</div>
              <div className="text-xs text-slate-500">{t.role}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
