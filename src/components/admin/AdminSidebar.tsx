"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PlaneTakeoff, LogOut, ShieldCheck } from "lucide-react";
import { adminNav } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

export const AdminSidebar = ({ adminEmail }: { adminEmail: string | null }) => {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await createClient().auth.signOut();
    }
    router.push("/admin/login");
    router.refresh();
  };

  return (
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

      <nav className="flex-1 space-y-1 px-3">
        {adminNav.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-orange-50 text-orange-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-slate-100 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        >
          <LogOut size={17} />
          Exit to site
        </Link>
        {adminEmail && (
          <button
            onClick={signOut}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-red-50"
          >
            <LogOut size={17} />
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
};
