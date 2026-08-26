import { notFound } from "next/navigation";
import { getFlightOffer, getPlatformSettings } from "@/lib/data";
import { BookingFlow } from "@/components/booking/BookingFlow";

// Public data only (no cookies) — each flight id gets its own statically
// cached page, revalidated every 30s so payment-mode/maintenance changes
// from the admin settings page show up quickly without going fully dynamic.
export const revalidate = 30;

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ retry?: string }>;
}) {
  const { id } = await params;
  const { retry } = await searchParams;
  const [offer, settings] = await Promise.all([
    getFlightOffer(id),
    getPlatformSettings(),
  ]);

  if (!offer) notFound();

  if (settings.maintenance_mode || !settings.booking_enabled) {
    return (
      <div className="mx-auto max-w-lg px-6 py-32 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Booking paused</h1>
        <p className="mt-2 text-sm text-slate-500">
          New bookings are temporarily unavailable. Please check back shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 px-6 pb-24 pt-32">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-2xl font-bold tracking-tight text-slate-900">
          Complete your booking
        </h1>
        <BookingFlow offer={offer} settings={settings} isRetry={retry === "wallet"} />
      </div>
    </div>
  );
}
