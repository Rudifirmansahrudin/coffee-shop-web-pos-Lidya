import type { Metadata } from "next";
import { SITE } from "@/lib/site-config";

// Use in src/app/layout.tsx: export const metadata = siteMetadata;
export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | ${SITE.slogan}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["kopi", "matcha", "kedai kopi", "Sidareja", "Plaza Ono Sidareja", "pesan online"],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE.name,
    title: `${SITE.name} | ${SITE.slogan}`,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} | ${SITE.slogan}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};