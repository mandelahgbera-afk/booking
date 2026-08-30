import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// Admin pages show live operational data (bookings, revenue, logs) — always
// render fresh, never serve a cached/stale copy from Vercel's edge or ISR.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let adminEmail: string | null = null;
  let unprotected = false;

  if (!isSupabaseConfigured) {
    // No backend to authenticate against yet — see the banner below. Once
    // Supabase is wired up (supabase/schema.sql run + env vars set), this
    // whole panel requires a signed-in admin, same as everywhere else.
    unprotected = true;
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/admin/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") redirect("/admin/login?error=not_admin");
    adminEmail = user.email ?? null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar adminEmail={adminEmail} />
      {/* pt-14 clears the fixed mobile top bar; the desktop sidebar is a
          left offset instead. */}
      <div className="pt-14 lg:pt-0 lg:pl-64">
        {unprotected && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-2.5 text-center text-xs font-medium text-amber-700">
            Supabase isn&apos;t configured yet — this admin console is unprotected in preview
            mode. Set up Supabase and it will require an admin login automatically.
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
