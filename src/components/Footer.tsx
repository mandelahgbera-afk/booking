import Link from "next/link";
import { PlaneTakeoff } from "lucide-react";

const COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Airlines & partners", href: "/partners" },
      { label: "Contact", href: "/contact" },
      { label: "Reviews", href: "/reviews" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help center", href: "/contact" },
      { label: "Manage a booking", href: "/manage-booking" },
      { label: "Gift cards & wallet", href: "/gift-cards" },
    ],
  },
  {
    title: "Destinations",
    links: [
      { label: "United States", href: "/destinations?region=USA" },
      { label: "Asia", href: "/destinations?region=Asia" },
      { label: "United Kingdom", href: "/destinations?region=UK" },
      { label: "All routes", href: "/destinations" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white">
                <PlaneTakeoff size={18} strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-slate-900">AirFly</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-slate-500">
              A trusted third-party booking platform — we compare fares and
              help you book faster across the airlines you already know.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-slate-900">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate-500 transition-colors hover:text-orange-500"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 text-sm text-slate-400 sm:flex-row">
          <span>© 2026 AirFly. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-600">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-600">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
