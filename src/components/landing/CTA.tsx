import { Button } from "@/components/Button";

export const CTA = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="relative overflow-hidden rounded-[2.5rem] gradient-primary px-8 py-16 text-center sm:px-16">
        <div
          aria-hidden
          className="absolute -left-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-16 -right-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        />
        <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready for your next trip?
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-white/90">
          Join 1.8M+ travelers booking smarter fares across the USA, Asia, and
          the UK — every day.
        </p>
        <div className="relative mt-8 flex justify-center">
          <Button
            variant="secondary"
            size="lg"
            className="shadow-xl shadow-black/10"
          >
            Search flights now
          </Button>
        </div>
      </div>
    </section>
  );
};
