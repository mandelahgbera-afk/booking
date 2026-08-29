import { renderEmailShell, renderInfoCard, escapeHtml } from "../shell";
import { formatCurrency } from "@/lib/utils";

const MODE_NOUN = { flight: "Flight", train: "Train", bus: "Coach" } as const;
const MODE_PATH = { flight: "/flights", train: "/trains", bus: "/buses" } as const;

export function bookingConfirmationEmail({
  passengerName,
  reference,
  airline,
  flightNumber,
  mode = "flight",
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
  // Rail and coach bookings run through this same template — without it a
  // bus trip is labelled "Flight" and links to the wrong search page.
  mode?: "flight" | "train" | "bus";
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
          { label: MODE_NOUN[mode], value: `${airline} · ${flightNumber}` },
          { label: "Departs", value: departTime },
          { label: "Arrives", value: arriveTime },
          { label: "Cabin", value: cabin },
          { label: "Seats", value: seats.join(", ") || "—" },
          { label: "Total paid", value: formatCurrency(total) },
        ])}`,
      button: { label: "View booking", url: `${siteUrl ?? "https://airfly.example"}${MODE_PATH[mode]}` },
      footerNote: "Need to change or cancel? Manage this booking from your dashboard, or reply here.",
      siteUrl,
    }),
  };
}
