import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_SITE_URL || "http://localhost:3000";

const routes = [
  "",
  "/flights",
  "/destinations",
  "/reviews",
  "/hotels",
  "/gift-cards",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
