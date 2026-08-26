"use client";

import { useMemo, useState } from "react";
import { Check, PlaneTakeoff } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { FlightOffer } from "@/lib/mock-data";
import type { PlatformSettingsRow } from "@/lib/supabase/types";
import { PassengerForm, type Passenger } from "./PassengerForm";
import { SeatMap } from "./SeatMap";
import { PaymentStep, type PaymentOutcome } from "./PaymentStep";
import { Confirmation } from "./Confirmation";
import { sendBookingEmails } from "@/app/(site)/booking/[id]/actions";

const STEPS = ["Travelers", "Seats", "Payment", "Done"] as const;

export const BookingFlow = ({
  offer,
  settings,
}: {
  offer: FlightOffer;
  settings: PlatformSettingsRow;
}) => {
  const [step, setStep] = useState(0);
  const [passengers, setPassengers] = useState<Passenger[]>([{ name: "", email: "" }]);
  const [seats, setSeats] = useState<string[]>([]);
  const [result, setResult] = useState<{ outcome: PaymentOutcome; reference: string } | null>(
    null
  );

  const serviceFee = settings.service_fee_percent / 100;
  const total = useMemo(
    () => Math.round(offer.price * passengers.length * (1 + serviceFee)),
    [offer.price, passengers.length, serviceFee]
  );

  const canContinue =
    (step === 0 && passengers.every((p) => p.name && p.email)) ||
    (step === 1 && seats.length === passengers.length) ||
    step === 2;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        {/* Stepper */}
        {step < 3 && (
          <div className="mb-8 flex items-center gap-2">
            {STEPS.slice(0, 3).map((label, i) => (
              <div key={label} className="flex flex-1 items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    i < step && "gradient-primary text-white",
                    i === step && "border-2 border-orange-500 text-orange-500",
                    i > step && "bg-slate-100 text-slate-400"
                  )}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span
                  className={cn(
                    "hidden text-sm font-medium sm:block",
                    i === step ? "text-slate-900" : "text-slate-400"
                  )}
                >
                  {label}
                </span>
                {i < 2 && <div className="mx-2 h-px flex-1 bg-slate-200" />}
              </div>
            ))}
          </div>
        )}

        {step === 0 && <PassengerForm passengers={passengers} onChange={setPassengers} />}
        {step === 1 && (
          <SeatMap count={passengers.length} selected={seats} onChange={setSeats} />
        )}
        {step === 2 && (
          <PaymentStep
            total={total}
            passengers={passengers}
            paymentMode={settings.payment_mode}
            onResult={(outcome, transactionId, method) => {
              const reference = transactionId.slice(4, 10).toUpperCase();
              setResult({ outcome, reference });
              setStep(3);

              if (outcome === "success") {
                sendBookingEmails({
                  offer,
                  passengers,
                  seats,
                  total,
                  reference,
                  method,
                  transactionId,
                });
              }
            }}
          />
        )}
        {step === 3 && result && (
          <Confirmation
            offer={offer}
            passengers={passengers}
            seats={seats}
            total={total}
            outcome={result.outcome}
            reference={result.reference}
          />
        )}

        {step < 2 && (
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 disabled:opacity-0"
            >
              Back
            </button>
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canContinue}
              className="gradient-primary rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}
      </div>

      {/* Summary sidebar */}
      {step < 3 && (
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: offer.airline.color }}
            >
              <PlaneTakeoff size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {offer.airline.name}
              </div>
              <div className="text-xs text-slate-400">{offer.flightNumber}</div>
            </div>
          </div>

          <div className="flex items-center justify-between py-4 text-sm">
            <div>
              <div className="text-lg font-bold text-slate-900">{offer.from.code}</div>
              <div className="text-xs text-slate-400">{offer.departTime}</div>
            </div>
            <PlaneTakeoff size={14} className="text-slate-300" />
            <div className="text-right">
              <div className="text-lg font-bold text-slate-900">{offer.to.code}</div>
              <div className="text-xs text-slate-400">{offer.arriveTime}</div>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 py-4 text-sm text-slate-500">
            <div className="flex justify-between">
              <span>Fare × {passengers.length}</span>
              <span>{formatCurrency(offer.price * passengers.length)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service fee ({settings.service_fee_percent}%)</span>
              <span>{formatCurrency(offer.price * passengers.length * serviceFee)}</span>
            </div>
          </div>

          <div className="flex justify-between border-t border-slate-100 pt-4 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </aside>
      )}
    </div>
  );
};
