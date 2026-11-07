import Image from "next/image";
import { Plus } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import type { MenuProduct } from "./types";

interface ProductCardProps {
  product: MenuProduct;
  // Opens the preview overlay (tap on image / name, or "Lihat" for sold-out products)
  onPreview: (product: MenuProduct) => void;
  // Opens the options overlay directly (size, topping, note, qty)
  onAdd: (product: MenuProduct) => void;
}

export function ProductCard({ product, onPreview, onAdd }: ProductCardProps) {
  return (
    <li className="relative flex gap-3 rounded-2xl border border-line bg-surface p-3 lg:flex-col lg:gap-0 lg:overflow-hidden lg:p-0">
      {/* Frame is locked to 1:1 (same as the product artwork) so object-cover never crops it */}
      <div
        className={`relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-matcha-soft lg:w-full lg:rounded-none ${
          product.is_available ? "" : "opacity-60 grayscale"
        }`}
      >
        <Image
          src={product.image_url || "/menu/default.svg"}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 280px, (min-width: 1024px) 30vw, 96px"
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 lg:p-4">
        <div className="flex flex-wrap gap-1.5">
          {product.is_available ? (
            <span className="rounded-full bg-matcha-soft px-2 py-0.5 text-xs font-medium text-space-navy">
              Tersedia
            </span>
          ) : (
            <span className="rounded-full border border-danger px-2 py-0.5 text-xs font-medium text-danger">
              Habis
            </span>
          )}
          {product.is_best_seller && (
            // Fixed dark text: space-navy turns white in dark mode, which is unreadable on gold
            <span className="rounded-full bg-star-gold px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              Best Seller
            </span>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="font-heading text-base font-semibold leading-snug text-ink">
            {/* Stretched button: tapping the image or anywhere on the card opens the preview */}
            <button
              type="button"
              onClick={() => onPreview(product)}
              aria-label={`Lihat detail ${product.name}`}
              className="text-left after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-ink"
            >
              {product.name}
            </button>
          </h3>
          {product.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted">{product.description}</p>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2">
          <p className="text-sm font-semibold text-ink">{formatRupiah(product.price)}</p>
          {/* z-10 keeps this button above the stretched preview button */}
          <button
            type="button"
            onClick={() => (product.is_available ? onAdd(product) : onPreview(product))}
            aria-label={
              product.is_available
                ? `Tambah ${product.name}`
                : `Lihat detail ${product.name} (sedang habis)`
            }
            className={`relative z-10 inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-xl px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
              product.is_available
                ? "bg-matcha text-primary-foreground hover:brightness-95"
                : "border border-line bg-transparent text-muted hover:bg-matcha-soft"
            }`}
          >
            {product.is_available ? (
              <>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Tambah
              </>
            ) : (
              "Lihat"
            )}
          </button>
        </div>
      </div>
    </li>
  );
}
