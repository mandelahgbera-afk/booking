"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PlaneTakeoff, LogOut, ShieldCheck, Menu, X } from "lucide-react";
import { adminNav } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

export const AdminSidebar = ({ adminEmail }: { adminEmail: string | null }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Don't let the page behind the drawer scroll under it.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await createClient().auth.signOut();
    }
    router.push("/admin/login");
    router.refresh();
  };

  const current = adminNav.find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
  );

  const navList = (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {adminNav.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                // Generous tap target — the desktop-only original used py-2.5,
                // below the ~44px minimum for reliable touch.
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors lg:py-2.5",
                active
                  ? "bg-orange-50 text-orange-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={17} className="shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-slate-100 p-3">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 lg:py-2.5"
        >
          <LogOut size={17} />
          Exit to site
        </Link>
        {adminEmail && (
          <button
            onClick={signOut}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-500 hover:bg-red-50 lg:py-2.5"
          >
            <LogOut size={17} />
            Sign out
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar — the console previously had no navigation at all
          below lg, making it unusable on a phone. */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
          className="-ml-1 flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 active:bg-slate-100"
        >
          <Menu size={22} />
        </button>
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg gradient-primary text-white">
            <PlaneTakeoff size={14} strokeWidth={2.5} />
          </div>
          <span className="truncate text-sm font-semibold text-slate-900">
            {current?.label ?? "Admin"}
          </span>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-slate-900/40 transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0"
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-2xl transition-transform duration-200",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between px-5 py-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white">
                <PlaneTakeoff size={18} strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">AirFly</div>
                <div className="text-[11px] text-slate-400">Admin console</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close admin menu"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"
            >
              <X size={16} />
            </button>
          </div>

          {adminEmail && (
            <div className="mx-3 mb-2 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <ShieldCheck size={14} className="shrink-0 text-emerald-500" />
              <span className="truncate text-xs font-medium text-slate-600">{adminEmail}</span>
            </div>
          )}

          {navList}
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white">
            <PlaneTakeoff size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">AirFly</div>
            <div className="text-[11px] text-slate-400">Admin console</div>
          </div>
        </div>

        {adminEmail && (
          <div className="mx-3 mb-2 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
            <ShieldCheck size={14} className="shrink-0 text-emerald-500" />
            <span className="truncate text-xs font-medium text-slate-600">{adminEmail}</span>
          </div>
        )}

        {navList}
      </aside>
    </>
  );
};
