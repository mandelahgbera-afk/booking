import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const title = "AirFly | Flight Booking Platform";
const description =
  "Compare and book flights across the USA, Asia, and the UK. Real-time fares, split payments, gift cards, and instant e-tickets.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | AirFly",
  },
  description,
  keywords: [
    "flight booking",
    "cheap flights",
    "book flights online",
    "flights to Asia",
    "flights to the UK",
    "flights to the USA",
    "travel gift cards",
  ],
  applicationName: "AirFly",
  authors: [{ name: "AirFly" }],
  category: "travel",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "AirFly",
    title,
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
