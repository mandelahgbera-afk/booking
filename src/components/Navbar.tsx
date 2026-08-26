import React from "react";
import Link from "next/link";
import { PlaneTakeoff, User, LogOut, Menu } from "lucide-react";
import { Button } from "./Button";
import type { SiteUser } from "./AppChrome";

export const Navbar = ({
  user,
  onSignOut,
  onMenuClick,
}: {
  user: SiteUser | null;
  onSignOut: () => void;
  onMenuClick?: () => void;
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 md:py-6 pointer-events-none">
      <div className="flex items-center">
        <Link href="/" className="pointer-events-auto flex items-center gap-2 group interactive-icon">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
            <PlaneTakeoff size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            AirFly
          </span>
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-8 pointer-events-auto glass-card px-8 py-3 rounded-full">
        <Link href="/flights" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">Flights</Link>
        <Link href="/trains" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">Trains</Link>
        <Link href="/buses" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">Buses</Link>
        <Link href="/destinations" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">Destinations</Link>
        <Link href="/gift-cards" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">Gift Cards</Link>
        <Link href="/partners" className="text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">Partners</Link>
      </nav>

      <div className="flex items-center gap-4 pointer-events-auto">
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="max-w-[10rem] truncate text-sm font-medium text-slate-600 hover:text-orange-500"
              >
                Hi, {user.name || user.email}
              </Link>
              <Button variant="ghost" className="gap-2" onClick={onSignOut}>
                <LogOut size={16} />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="gap-2">
                  <User size={18} />
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl glass text-slate-800 interactive-icon"
        >
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
};
