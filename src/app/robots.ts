import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep admin, API, payment and order tracking pages out of search engines
      disallow: ["/admin", "/api", "/pay/", "/track/", "/checkout", "/cart"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}