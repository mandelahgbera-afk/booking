"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, PlaneTakeoff, Hotel, MapPin, Star, Gift, User, Info, Mail } from "lucide-react";
import { Button } from "@/components/Button";

const LINKS = [
  { href: "/flights", label: "Flights", icon: PlaneTakeoff },
  { href: "/hotels", label: "Hotels", icon: Hotel },
  { href: "/destinations", label: "Destinations", icon: MapPin },
  { href: "/gift-cards", label: "Gift cards & wallet", icon: Gift },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/about", label: "About us", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
];

// A bottom sheet, not a top-down dropdown — reads as an app modal instead of
// a shrunk desktop menu.
export const MobileMenu = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
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

            <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4">
              <Button variant="secondary" className="flex-1 gap-2">
                <User size={16} />
                Sign in
              </Button>
              <Button className="flex-1">Sign up</Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
