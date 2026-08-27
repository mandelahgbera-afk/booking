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
  validateAddressLine,
  validateCity,
  validatePostalCode,
  validateCountry,
  brandLabel,
  type FieldValidation,
} from "@/lib/card-validation";

export type CardValue = {
  name: string;
  number: string;
  expiry: string;
  cvc: string;
  // Billing address — standard on any real card form, required here too.
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

export const EMPTY_CARD: CardValue = {
  name: "",
  number: "",
  expiry: "",
  cvc: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
};

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Netherlands",
  "Belgium",
  "Austria",
  "Ireland",
  "Spain",
  "Italy",
  "Australia",
  "Japan",
  "Singapore",
  "United Arab Emirates",
  "Other",
];

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
    address: false,
    city: false,
    postalCode: false,
    country: false,
  });

  const digits = value.number.replace(/\D/g, "");
  const brand = detectCardBrand(digits);

  const nameV = touched.name ? validateCardholderName(value.name) : EMPTY_VALID;
  const numberV = touched.number ? validateCardNumber(value.number) : EMPTY_VALID;
  const expiryV = touched.expiry ? validateExpiry(value.expiry) : EMPTY_VALID;
  const cvcV = touched.cvc ? validateCVC(value.cvc, brand) : EMPTY_VALID;
  const addressV = touched.address ? validateAddressLine(value.address) : EMPTY_VALID;
  const cityV = touched.city ? validateCity(value.city) : EMPTY_VALID;
  const postalV = touched.postalCode ? validatePostalCode(value.postalCode) : EMPTY_VALID;
  const countryV = touched.country ? validateCountry(value.country) : EMPTY_VALID;

  const allValid =
    validateCardholderName(value.name).valid &&
    validateCardNumber(value.number).valid &&
    validateExpiry(value.expiry).valid &&
    validateCVC(value.cvc, brand).valid &&
    validateAddressLine(value.address).valid &&
    validateCity(value.city).valid &&
    validatePostalCode(value.postalCode).valid &&
    validateCountry(value.country).valid;

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
          autoComplete="cc-name"
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
            autoComplete="cc-number"
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
            autoComplete="cc-exp"
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
            autoComplete="cc-csc"
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

      <div className="mt-1 border-t border-slate-100 pt-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Billing address
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <input
              required
              value={value.address}
              onChange={(e) => onChange({ ...value, address: e.target.value })}
              onBlur={() => markTouched("address")}
              autoComplete="billing street-address"
              placeholder="Street address"
              className={cn(
                "w-full rounded-xl border px-3 py-2.5 text-sm outline-none",
                !addressV.valid ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-orange-400"
              )}
            />
            {!addressV.valid && <p className="mt-1 text-xs text-red-500">{addressV.message}</p>}
          </div>

          <div className="flex gap-3">
            <div className="w-1/2">
              <input
                required
                value={value.city}
                onChange={(e) => onChange({ ...value, city: e.target.value })}
                onBlur={() => markTouched("city")}
                autoComplete="billing address-level2"
                placeholder="City"
                className={cn(
                  "w-full rounded-xl border px-3 py-2.5 text-sm outline-none",
                  !cityV.valid ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-orange-400"
                )}
              />
              {!cityV.valid && <p className="mt-1 text-xs text-red-500">{cityV.message}</p>}
            </div>
            <div className="w-1/2">
              <input
                required
                value={value.postalCode}
                onChange={(e) => onChange({ ...value, postalCode: e.target.value })}
                onBlur={() => markTouched("postalCode")}
                autoComplete="billing postal-code"
                placeholder="Postal code"
                className={cn(
                  "w-full rounded-xl border px-3 py-2.5 text-sm outline-none",
                  !postalV.valid ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-orange-400"
                )}
              />
              {!postalV.valid && <p className="mt-1 text-xs text-red-500">{postalV.message}</p>}
            </div>
          </div>

          <div>
            <select
              required
              value={value.country}
              onChange={(e) => onChange({ ...value, country: e.target.value })}
              onBlur={() => markTouched("country")}
              autoComplete="billing country-name"
              className={cn(
                "w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none",
                !countryV.valid ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-orange-400",
                !value.country && "text-slate-400"
              )}
            >
              <option value="" disabled>
                Country
              </option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c} className="text-slate-900">
                  {c}
                </option>
              ))}
            </select>
            {!countryV.valid && <p className="mt-1 text-xs text-red-500">{countryV.message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
