import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

const ROUTES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/menu", priority: 0.9 },
  { path: "/lokasi", priority: 0.7 },
  { path: "/tentang", priority: 0.6 },
  { path: "/faq", priority: 0.5 },
  { path: "/privasi", priority: 0.3 },
  { path: "/syarat", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url.replace(/\/$/, "");
  return ROUTES.map(({ path, priority }) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority,
  }));
}