import Image from "next/image";
import Link from "next/link";
import { Camera, Coffee, MapPin, MessageCircle, Smartphone, Wallet } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AstronautHero } from "@/components/space/AstronautHero";
import { OrbitDivider } from "@/components/space/OrbitDivider";
import { StarField } from "@/components/space/StarField";
import { OpenStatus } from "@/components/home/OpenStatus";
import { PromoBanner } from "@/components/home/PromoBanner";

export const revalidate = 60;

type BestSeller = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
};

type Json = Record<string, unknown>;

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatPrice(value: number) {
  // Intl gives "Rp 25.000" with a non-breaking space; normalize it
  return priceFormatter.format(value).replace(/\s/g, " ");
}

function asObject(value: unknown): Json {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Json) : {};
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function buildWhatsAppUrl(raw: string | null) {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  return digits ? `https://wa.me/${digits}` : null;
}

function buildInstagramUrl(raw: string | null) {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  return `https://instagram.com/${raw.replace(/^@/, "")}`;
}

const ADVANTAGES = [
  {
    icon: Coffee,
    title: "Racikan Konsisten",
    text: "Kopi, matcha, dan cokelat dibuat dengan takaran yang sama di setiap gelas.",
  },
  {
    icon: Smartphone,
    title: "Pesan Tanpa Antre",
    text: "Pesan dari HP, bayar, lalu pantau status pesananmu secara langsung.",
  },
  {
    icon: Wallet,
    title: "Harga Bersahabat",
    text: "Mulai dari Rp 10.000 dengan pilihan ukuran Reguler atau Large.",
  },
];

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const [bestSellerRes, contentRes] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, price, image_url, is_available")
      .eq("is_best_seller", true)
      .order("created_at", { ascending: true })
      .limit(4),
    supabase
      .from("site_content")
      .select("key, value")
      .in("key", ["hero", "promo", "opening_hours", "contact", "social"]),
  ]);

  const bestSellers = (bestSellerRes.data ?? []) as BestSeller[];
  const content: Record<string, unknown> = {};
  (contentRes.data ?? []).forEach((row: { key: string; value: unknown }) => {
    content[row.key] = row.value;
  });

  const hero = asObject(content.hero);
  const promo = asObject(content.promo);
  const contact = asObject(content.contact);
  const social = asObject(content.social);

  const heroTitle = asString(hero.title) ?? "Coffee That Takes You Further";
  const heroSubtitle =
    asString(hero.subtitle) ?? "Setiap tegukan, satu langkah lebih dekat ke bintang.";

  const promoText = asString(promo.text) ?? asString(promo.title);
  const promoCode = asString(promo.code);
  const promoBadge = asString(promo.badge);
  const promoHeadline = asString(promo.headline);
  const promoImage = asString(promo.image_url);
  const promoImageAlt = asString(promo.image_alt);
  // Active when explicitly not disabled and has either text or an image
  const promoActive =
    promo.active !== false && promo.is_active !== false && (!!promoText || !!promoImage);

  const whatsappUrl = buildWhatsAppUrl(asString(contact.whatsapp) ?? asString(contact.phone));
  const instagramUrl = buildInstagramUrl(asString(social.instagram));

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="mx-auto grid max-w-[1200px] gap-8 px-4 pb-8 pt-8 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-6 lg:pb-16 lg:pt-14">
        <div>
          <h1 className="font-heading text-3xl font-bold leading-tight text-space-navy lg:text-5xl">
            {heroTitle}
          </h1>
          <p className="mt-4 text-base text-muted lg:text-lg">{heroSubtitle}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/menu"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-matcha px-6 py-3 font-semibold text-space-navy transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy"
            >
              Pesan Sekarang
            </Link>
            <Link
              href="/lokasi"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-surface px-6 py-3 font-semibold text-ink transition-colors hover:bg-matcha-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy"
            >
              Lihat Lokasi
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[260px] lg:max-w-[420px]">
          <AstronautHero />
        </div>
      </section>

      {/* Info strip */}
      <section aria-label="Info kedai" className="mx-auto max-w-[1200px] px-4 lg:px-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <OpenStatus hours={content.opening_hours} />
          <div className="flex items-center gap-2 text-sm text-muted">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            <span>Plaza Ono Sidareja, Lantai 3</span>
          </div>
        </div>
      </section>

      {/* Promo banner */}
      {promoActive && (
        <section aria-label="Promo" className="mx-auto mt-6 max-w-[1200px] px-4 lg:px-6">
          <PromoBanner
            imageUrl={promoImage}
            imageAlt={promoImageAlt}
            badge={promoBadge}
            headline={promoHeadline}
            text={promoText ?? ""}
            code={promoCode}
          />
        </section>
      )}

      <div className="mx-auto mt-8 max-w-[1200px] px-4 lg:px-6">
        <OrbitDivider />
      </div>

      {/* Best sellers (hidden when empty) */}
      {bestSellers.length > 0 && (
        <section aria-labelledby="best-seller-title" className="mx-auto max-w-[1200px] px-4 py-8 lg:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 id="best-seller-title" className="font-heading text-2xl font-bold text-space-navy">
              Best Seller
            </h2>
            <Link href="/menu" className="min-h-11 py-2 text-sm font-semibold text-ink underline underline-offset-4">
              Lihat semua menu
            </Link>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {bestSellers.map((product) => (
              <li key={product.id}>
                <Link
                  href="/menu"
                  className="block h-full overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy"
                >
                  <div className="relative aspect-square bg-matcha-soft">
                    <Image
                      src={product.image_url || "/menu/default.svg"}
                      alt={`Minuman ${product.name}`}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-heading font-semibold text-ink">{product.name}</p>
                    <p className="mt-1 text-sm text-muted">{formatPrice(product.price)}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-star-gold/20 px-2 py-0.5 text-xs font-semibold text-ink">
                        Best Seller
                      </span>
                      {!product.is_available && (
                        <span className="rounded-full border border-line px-2 py-0.5 text-xs font-semibold text-muted">
                          Habis
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Navy section: advantages */}
      <section className="relative overflow-hidden bg-space-navy">
        <StarField />
        <div className="relative mx-auto max-w-[1200px] px-4 py-12 lg:px-6 lg:py-16">
          <h2 className="font-heading text-2xl font-bold text-cream">Kenapa Space?</h2>
          <ul className="mt-6 grid gap-6 md:grid-cols-3">
            {ADVANTAGES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-4 md:block">
                <Icon className="h-7 w-7 shrink-0 text-star-gold md:mb-3" aria-hidden="true" />
                <div>
                  <h3 className="font-heading text-lg font-semibold text-cream">{title}</h3>
                  <p className="mt-1 text-sm text-cream/80">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Location teaser */}
      <section aria-labelledby="lokasi-title" className="mx-auto max-w-[1200px] px-4 py-10 lg:px-6 lg:py-14">
        <div className="rounded-2xl border border-line bg-surface p-5 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:p-8">
          <div>
            <h2 id="lokasi-title" className="font-heading text-2xl font-bold text-space-navy">
              Mampir ke Space
            </h2>
            <p className="mt-2 flex items-center gap-2 text-muted">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              Plaza Ono Sidareja, Lantai 3
            </p>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:mt-0">
            <Link
              href="/lokasi"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-matcha px-6 py-3 font-semibold text-space-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy"
            >
              Petunjuk Lokasi
            </Link>
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line px-5 py-3 font-semibold text-ink hover:bg-matcha-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy"
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
                Instagram
              </a>
            )}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line px-5 py-3 font-semibold text-ink hover:bg-matcha-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}