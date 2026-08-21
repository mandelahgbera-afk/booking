const PARTNERS = [
  "Visa",
  "Mastercard",
  "Amex",
  "Apple Pay",
  "Google Pay",
  "PayPal",
];

export const PaymentPartners = () => {
  return (
    <section className="border-y border-slate-200 bg-white py-14">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
          Secure payments from all major platforms
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {PARTNERS.map((p) => (
            <span
              key={p}
              className="text-lg font-semibold tracking-tight text-slate-300 transition-colors hover:text-slate-500"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
