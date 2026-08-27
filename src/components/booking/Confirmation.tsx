import { AlertTriangle, CheckCircle2, Clock, PlaneTakeoff, TrainFront, Bus, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { formatCurrency } from "@/lib/utils";
import type { FlightOffer } from "@/lib/mock-data";
import type { Passenger } from "./PassengerForm";
import type { PaymentOutcome } from "./PaymentStep";

export const Confirmation = ({
  offer,
  passengers,
  seats,
  total,
  outcome,
  reference,
  emailWarning,
}: {
  offer: FlightOffer;
  passengers: Passenger[];
  seats: string[];
  total: number;
  outcome: PaymentOutcome;
  reference: string;
  emailWarning?: string;
}) => {
  const statusMeta = {
    success: {
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      title: "Booking confirmed",
      body: "Your e-ticket has been generated. A confirmation email is on its way.",
    },
    pending: {
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50",
      title: "Payment pending",
      body: "We're waiting on confirmation from your payment provider — this usually clears within minutes.",
    },
    fail: {
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50",
      title: "Payment failed",
      body: "Your card was not charged. Please try again or use a different payment method.",
    },
  }[outcome];

  const Icon = statusMeta.icon;
  const ModeIcon = offer.mode === "train" ? TrainFront : offer.mode === "bus" ? Bus : PlaneTakeoff;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-10 text-center">
      <div className={`flex h-16 w-16 items-center justify-center rounded-full ${statusMeta.bg}`}>
        <Icon size={32} className={statusMeta.color} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{statusMeta.title}</h2>
        <p className="mt-2 text-sm text-slate-500">{statusMeta.body}</p>
      </div>

      {emailWarning && (
        <div className="flex w-full items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-left text-sm text-amber-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          {emailWarning}
        </div>
      )}

      {outcome !== "fail" && (
        <div className="w-full overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
          <div className="flex items-center justify-between p-5">
            <div>
              <div className="text-xs text-white/50">Booking reference</div>
              <div className="font-mono text-lg font-bold tracking-wider">{reference}</div>
            </div>
            <ModeIcon className="text-orange-400" />
          </div>

          <div className="flex items-center justify-between px-5 pb-5">
            <div className="text-left">
              <div className="text-xl font-bold">{offer.from.code}</div>
              <div className="text-xs text-white/50">{offer.departTime}</div>
            </div>
            <div className="flex-1 px-3">
              <div className="h-px w-full border-t border-dashed border-white/20" />
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{offer.to.code}</div>
              <div className="text-xs text-white/50">{offer.arriveTime}</div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-white/5 px-5 py-4">
            <div className="grid grid-cols-3 gap-2 text-left text-xs">
              <div>
                <div className="text-white/40">Flight</div>
                <div className="font-semibold">{offer.flightNumber}</div>
              </div>
              <div>
                <div className="text-white/40">Cabin</div>
                <div className="font-semibold">{offer.cabin}</div>
              </div>
              <div>
                <div className="text-white/40">Seats</div>
                <div className="font-semibold">{seats.join(", ") || "—"}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-dashed border-white/10 px-5 py-4 text-left">
            {passengers.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span>{p.name || `Passenger ${i + 1}`}</span>
                <span className="text-white/50">{seats[i] ?? "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-5 py-4">
        <span className="text-sm text-slate-500">Total paid</span>
        <span className="text-lg font-bold text-slate-900">{formatCurrency(total)}</span>
      </div>

      <div className="flex w-full gap-3">
        <Link href="/flights" className="flex-1">
          <Button variant="secondary" className="w-full">
            Book another flight
          </Button>
        </Link>
        <Link href="/" className="flex-1">
          <Button className="w-full">Back home</Button>
        </Link>
      </div>
    </div>
  );
};
