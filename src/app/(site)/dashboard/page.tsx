import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getWalletBalance } from "@/app/gift-cards/actions";
import { DashboardView, type DashboardBooking } from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-lg px-6 py-32 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard needs Supabase</h1>
        <p className="mt-2 text-sm text-slate-500">
          Set up your Supabase env vars to enable accounts and this dashboard.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = (user.user_metadata?.full_name as string) || null;
  const email = user.email ?? "";

  const [balance, bookingsRes] = await Promise.all([
    getWalletBalance(email),
    supabase
      .from("bookings")
      .select("reference, status, total_amount, created_at, cabin, seats, flight_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const flightIds = [...new Set((bookingsRes.data ?? []).map((b) => b.flight_id))];
  const { data: flights } = flightIds.length
    ? await supabase
        .from("flights")
        .select("id, flight_number, from_code, to_code, depart_at, airline_code")
        .in("id", flightIds)
    : { data: [] as never[] };

  const bookings: DashboardBooking[] = (bookingsRes.data ?? []).map((b) => {
    const flight = flights?.find((f) => f.id === b.flight_id);
    return {
      reference: b.reference,
      status: b.status,
      total: Number(b.total_amount),
      createdAt: b.created_at,
      cabin: b.cabin,
      seats: b.seats,
      route: flight ? `${flight.from_code} → ${flight.to_code}` : "Route unavailable",
      flightNumber: flight?.flight_number ?? "—",
    };
  });

  return <DashboardView name={name} email={email} balance={balance} bookings={bookings} />;
}
