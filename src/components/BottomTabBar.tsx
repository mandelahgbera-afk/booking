"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlaneTakeoff, Gift, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/flights", label: "Flights", icon: PlaneTakeoff },
  { href: "/gift-cards", label: "Wallet", icon: Gift },
] as const;

// App-shell bottom nav — the primary way to move around on mobile, the way
// a real app would, instead of relying on the desktop-style top nav shrunk
// down. Only rendered below the md breakpoint (see (site)/layout.tsx).
export const BottomTabBar = ({ onMoreClick }: { onMoreClick: () => void }) => {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex items-stretch justify-around border-t border-slate-200 bg-white/90 backdrop-blur-lg md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium"
          >
            <tab.icon
              size={20}
              strokeWidth={active ? 2.5 : 2}
              className={cn(active ? "text-orange-500" : "text-slate-400")}
            />
            <span className={cn(active ? "text-orange-500" : "text-slate-400")}>{tab.label}</span>
          </Link>
        );
      })}
      <button
        onClick={onMoreClick}
        className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-slate-400"
      >
        <Menu size={20} />
        More
      </button>
    </nav>
  );
};
