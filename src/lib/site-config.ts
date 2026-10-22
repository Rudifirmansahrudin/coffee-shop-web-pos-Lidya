// Central site constants. Replace placeholder contact values before presenting.
export const SITE = {
  name: "Space Coffee and Matcha",
  shortName: "Space Coffee",
  slogan: "Coffee That Takes You Further",
  tagline: "Setiap tegukan, satu langkah lebih dekat ke bintang",
  description:
    "Pesan kopi, matcha, dan minuman favoritmu dari Space Coffee and Matcha, Plaza Ono Sidareja Lantai 3. Pesan dari HP, bayar, lalu lacak pesananmu langsung.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: "halo@spacecoffee.example", // TODO: ganti email asli kedai
  whatsapp: "6281234567890", // TODO: ganti nomor WA asli (format 62..., tanpa +)
  address: "Plaza Ono Sidareja, Lantai 3",
  lastUpdated: "22 Oktober 2026",
} as const;

export const WA_LINK = `https://wa.me/${SITE.whatsapp}`;