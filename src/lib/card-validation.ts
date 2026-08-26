// Real client-side validation for the mock card form — the payment outcome
// is simulated (see PaymentStep), but the form itself should behave like a
// real one: reject garbage input, catch typos, and never let you submit an
// expired or invalid-looking card. Nothing here calls a network — it's pure
// format/checksum validation, the same class of check every real checkout
// runs before it ever talks to a payment processor.

export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "unknown";

const BRAND_PATTERNS: { brand: CardBrand; pattern: RegExp; lengths: number[]; cvcLength: number }[] = [
  { brand: "amex", pattern: /^3[47]/, lengths: [15], cvcLength: 4 },
  { brand: "visa", pattern: /^4/, lengths: [13, 16, 19], cvcLength: 3 },
  { brand: "mastercard", pattern: /^(5[1-5]|2[2-7])/, lengths: [16], cvcLength: 3 },
  { brand: "discover", pattern: /^6(011|5)/, lengths: [16], cvcLength: 3 },
];

export function detectCardBrand(digitsOnly: string): CardBrand {
  const match = BRAND_PATTERNS.find((b) => b.pattern.test(digitsOnly));
  return match?.brand ?? "unknown";
}

function cvcLengthFor(brand: CardBrand): number {
  return BRAND_PATTERNS.find((b) => b.brand === brand)?.cvcLength ?? 3;
}

// Standard Luhn checksum — catches typos/transpositions, the same first-line
// check every real card form runs before it even contacts a processor.
export function luhnCheck(digitsOnly: string): boolean {
  if (!/^\d+$/.test(digitsOnly)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digitsOnly.length - 1; i >= 0; i--) {
    let digit = Number(digitsOnly[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 19);
  const brand = detectCardBrand(digits);
  if (brand === "amex") {
    // 4-6-5
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)]
      .filter(Boolean)
      .join(" ");
  }
  return digits.match(/.{1,4}/g)?.join(" ") ?? digits;
}

export type FieldValidation = { valid: boolean; message?: string };

export function validateCardNumber(formatted: string): FieldValidation {
  const digits = formatted.replace(/\D/g, "");
  if (!digits) return { valid: false, message: "Card number is required" };
  if (!/^\d+$/.test(digits)) return { valid: false, message: "Digits only" };

  const brand = detectCardBrand(digits);
  const spec = BRAND_PATTERNS.find((b) => b.brand === brand);

  if (digits.length < 12) return { valid: false, message: "Card number is too short" };
  if (spec && !spec.lengths.includes(digits.length)) {
    return { valid: false, message: `${brandLabel(brand)} cards are ${spec.lengths.join("/")} digits` };
  }
  if (!luhnCheck(digits)) return { valid: false, message: "That card number looks invalid" };

  return { valid: true };
}

export function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function validateExpiry(formatted: string): FieldValidation {
  const match = formatted.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return { valid: false, message: "Use MM/YY" };

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return { valid: false, message: "Invalid month" };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { valid: false, message: "This card has expired" };
  }
  if (year > currentYear + 15) return { valid: false, message: "Check the expiry year" };

  return { valid: true };
}

export function validateCVC(digits: string, brand: CardBrand): FieldValidation {
  const cleaned = digits.replace(/\D/g, "");
  const expected = cvcLengthFor(brand);
  if (!cleaned) return { valid: false, message: "CVC is required" };
  if (cleaned.length !== expected) {
    return { valid: false, message: `${expected} digits for ${brandLabel(brand)}` };
  }
  return { valid: true };
}

export function validateCardholderName(name: string): FieldValidation {
  const trimmed = name.trim();
  if (trimmed.length < 2) return { valid: false, message: "Name is required" };
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return { valid: false, message: "Letters only" };
  return { valid: true };
}

export function brandLabel(brand: CardBrand): string {
  switch (brand) {
    case "visa":
      return "Visa";
    case "mastercard":
      return "Mastercard";
    case "amex":
      return "Amex";
    case "discover":
      return "Discover";
    default:
      return "Card";
  }
}
