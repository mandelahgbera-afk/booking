"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, PlaneTakeoff, TrainFront, Bus, MapPin, Star, Gift, User, Info, Mail, LogOut, Globe2 } from "lucide-react";
import { Button } from "@/components/Button";
import type { SiteUser } from "./AppChrome";

const LINKS = [
  { href: "/flights", label: "Flights", icon: PlaneTakeoff },
  { href: "/trains", label: "Trains", icon: TrainFront },
  { href: "/buses", label: "Buses", icon: Bus },
  { href: "/destinations", label: "Destinations", icon: MapPin },
  { href: "/gift-cards", label: "Gift cards & wallet", icon: Gift },
  { href: "/partners", label: "Airlines & partners", icon: Globe2 },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/about", label: "About us", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
];

// A bottom sheet, not a top-down dropdown — reads as an app modal instead of
// a shrunk desktop menu.
export const MobileMenu = ({
  open,
  onClose,
  user,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  user: SiteUser | null;
  onSignOut: () => void;
}) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 md:hidden"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[70] rounded-t-3xl bg-white p-5 shadow-2xl md:hidden"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)" }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-semibold text-slate-900">Menu</span>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                <X size={16} />
              </button>
            </div>

            {user && (
              <Link
                href="/dashboard"
                onClick={onClose}
                className="mb-2 flex items-center justify-between rounded-2xl gradient-primary px-4 py-3 text-sm font-semibold text-white"
              >
                Go to dashboard
                <span className="text-xs font-normal text-white/80">Hi, {user.name || user.email}</span>
              </Link>
            )}

            <div className="flex flex-col gap-1">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 active:bg-slate-50"
                >
                  <l.icon size={18} className="text-orange-500" />
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              {user ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                    Signed in as {user.name || user.email}
                  </span>
                  <Button variant="secondary" className="gap-2" onClick={onSignOut}>
                    <LogOut size={16} />
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link href="/login" onClick={onClose} className="flex-1">
                    <Button variant="secondary" className="w-full gap-2">
                      <User size={16} />
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={onClose} className="flex-1">
                    <Button className="w-full">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
