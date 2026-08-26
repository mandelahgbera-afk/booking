import { renderEmailShell, renderInfoCard, escapeHtml } from "../shell";
import { formatCurrency } from "@/lib/utils";

export function bookingConfirmationEmail({
  passengerName,
  reference,
  airline,
  flightNumber,
  from,
  to,
  departTime,
  arriveTime,
  cabin,
  seats,
  total,
  siteUrl,
}: {
  passengerName: string;
  reference: string;
  airline: string;
  flightNumber: string;
  from: string; // "JFK"
  to: string; // "LHR"
  departTime: string;
  arriveTime: string;
  cabin: string;
  seats: string[];
  total: number;
  siteUrl?: string;
}) {
  return {
    subject: `You're confirmed — ${from} → ${to} (${reference})`,
    html: renderEmailShell({
      preheader: `Booking ${reference} confirmed: ${from} → ${to} on ${airline} ${flightNumber}.`,
      icon: "ticket",
      title: "Booking confirmed",
      bodyHtml: `
        <div class="text-body" style="font-size:15px; color:#475569; line-height:1.6; max-width:420px; margin:0 auto;">
          Thanks, ${escapeHtml(passengerName)} — your e-ticket is ready. Here's your itinerary.
        </div>
        ${renderInfoCard([
          { label: "Reference", value: reference },
          { label: "Route", value: `${from} → ${to}` },
          { label: "Flight", value: `${airline} · ${flightNumber}` },
          { label: "Departs", value: departTime },
          { label: "Arrives", value: arriveTime },
          { label: "Cabin", value: cabin },
          { label: "Seats", value: seats.join(", ") || "—" },
          { label: "Total paid", value: formatCurrency(total) },
        ])}`,
      button: { label: "View booking", url: `${siteUrl ?? "https://airfly.example"}/flights` },
      footerNote: "Need to change or cancel? Manage this booking from your dashboard, or reply here.",
      siteUrl,
    }),
  };
}
