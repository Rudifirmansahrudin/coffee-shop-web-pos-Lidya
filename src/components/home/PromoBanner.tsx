import Image from "next/image";
import Link from "next/link";
import { StarField } from "@/components/space/StarField";

type Props = {
  imageUrl?: string | null;
  imageAlt?: string | null;
  badge?: string | null;
  headline?: string | null;
  text: string;
  code?: string | null;
};

// Promo banner: uses a designed image (e.g. from Canva) when provided, else a navy card
export function PromoBanner({ imageUrl, imageAlt, badge, headline, text, code }: Props) {
  const href = code ? `/menu?promo=${encodeURIComponent(code)}` : "/menu";

  if (imageUrl) {
    return (
      <Link
        href={href}
        className="block overflow-hidden rounded-2xl border border-line bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy"
      >
        {/* Same ratio as the source image (5:2, 1600x640), so nothing is cropped */}
        <div className="relative aspect-[5/2] w-full bg-matcha-soft">
          <Image
            src={imageUrl}
            alt={imageAlt || headline || text || "Promo Space Coffee"}
            fill
            unoptimized
            sizes="(min-width: 1200px) 1200px, 100vw"
            className="object-cover"
          />
        </div>
      </Link>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-space-navy p-5 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:p-8">
      <StarField count={4} />
      <div className="relative">
        {badge ? (
          <span className="inline-block rounded-full bg-star-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-space-navy">
            {badge}
          </span>
        ) : null}
        {headline ? (
          <h2 className="mt-3 font-heading text-2xl font-bold text-cream lg:text-3xl">{headline}</h2>
        ) : null}
        <p className={headline ? "mt-1 text-cream/85" : "mt-3 text-lg font-semibold text-cream"}>
          {text}
        </p>
        {code ? (
          <p className="mt-3 text-sm text-cream/80">
            Kode promo:{" "}
            <span className="rounded-md border border-dashed border-star-gold px-2 py-0.5 font-semibold text-star-gold">
              {code}
            </span>
          </p>
        ) : null}
      </div>
      <Link
        href={href}
        className="relative mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-matcha px-6 py-3 font-semibold text-space-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream lg:mt-0 lg:w-auto lg:shrink-0"
      >
        Pesan Sekarang
      </Link>
    </div>
  );
}