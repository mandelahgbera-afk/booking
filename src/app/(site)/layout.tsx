import { AppChrome } from "@/components/AppChrome";
import { Footer } from "@/components/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppChrome />
      {/* pb leaves room for the fixed bottom tab bar on mobile */}
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      {/* Desktop-style footer is redundant once the bottom tab bar is the
          primary nav on mobile — keeping both reads as "shrunk desktop site"
          instead of an app. */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}
