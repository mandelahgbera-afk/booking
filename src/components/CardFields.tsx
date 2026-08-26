"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  validateCardNumber,
  validateCardholderName,
  validateCVC,
  validateExpiry,
  brandLabel,
  type FieldValidation,
} from "@/lib/card-validation";

export type CardValue = { name: string; number: string; expiry: string; cvc: string };

const EMPTY_VALID: FieldValidation = { valid: true };

export const CardFields = ({
  value,
  onChange,
  onValidChange,
}: {
  value: CardValue;
  onChange: (value: CardValue) => void;
  onValidChange: (valid: boolean) => void;
}) => {
  const [touched, setTouched] = useState<Record<keyof CardValue, boolean>>({
    name: false,
    number: false,
    expiry: false,
    cvc: false,
  });

  const digits = value.number.replace(/\D/g, "");
  const brand = detectCardBrand(digits);

  const nameV = touched.name ? validateCardholderName(value.name) : EMPTY_VALID;
  const numberV = touched.number ? validateCardNumber(value.number) : EMPTY_VALID;
  const expiryV = touched.expiry ? validateExpiry(value.expiry) : EMPTY_VALID;
  const cvcV = touched.cvc ? validateCVC(value.cvc, brand) : EMPTY_VALID;

  const allValid =
    validateCardholderName(value.name).valid &&
    validateCardNumber(value.number).valid &&
    validateExpiry(value.expiry).valid &&
    validateCVC(value.cvc, brand).valid;

  useEffect(() => {
    onValidChange(allValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allValid]);

  const markTouched = (field: keyof CardValue) => setTouched((t) => ({ ...t, [field]: true }));

  return (
    <div className="flex flex-col gap-3">
      <div>
        <input
          required
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          onBlur={() => markTouched("name")}
          placeholder="Name on card"
          className={cn(
            "w-full rounded-xl border px-3 py-2.5 text-sm outline-none",
            !nameV.valid ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-orange-400"
          )}
        />
        {!nameV.valid && <p className="mt-1 text-xs text-red-500">{nameV.message}</p>}
      </div>

      <div>
        <div className="relative">
          <input
            required
            value={value.number}
            onChange={(e) => onChange({ ...value, number: formatCardNumber(e.target.value) })}
            onBlur={() => markTouched("number")}
            placeholder="4242 4242 4242 4242"
            inputMode="numeric"
            maxLength={23}
            className={cn(
              "w-full rounded-xl border px-3 py-2.5 pr-20 text-sm font-mono outline-none",
              !numberV.valid ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-orange-400"
            )}
          />
          {brand !== "unknown" && (
            <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-500">
              <CreditCard size={12} />
              {brandLabel(brand)}
            </span>
          )}
        </div>
        {!numberV.valid && <p className="mt-1 text-xs text-red-500">{numberV.message}</p>}
      </div>

      <div className="flex gap-3">
        <div className="w-1/2">
          <input
            required
            value={value.expiry}
            onChange={(e) => onChange({ ...value, expiry: formatExpiry(e.target.value) })}
            onBlur={() => markTouched("expiry")}
            placeholder="MM/YY"
            inputMode="numeric"
            maxLength={5}
            className={cn(
              "w-full rounded-xl border px-3 py-2.5 text-sm font-mono outline-none",
              !expiryV.valid ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-orange-400"
            )}
          />
          {!expiryV.valid && <p className="mt-1 text-xs text-red-500">{expiryV.message}</p>}
        </div>
        <div className="w-1/2">
          <input
            required
            value={value.cvc}
            onChange={(e) => onChange({ ...value, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
            onBlur={() => markTouched("cvc")}
            placeholder="CVC"
            inputMode="numeric"
            maxLength={4}
            className={cn(
              "w-full rounded-xl border px-3 py-2.5 text-sm font-mono outline-none",
              !cvcV.valid ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-orange-400"
            )}
          />
          {!cvcV.valid && <p className="mt-1 text-xs text-red-500">{cvcV.message}</p>}
        </div>
      </div>
    </div>
  );
};
