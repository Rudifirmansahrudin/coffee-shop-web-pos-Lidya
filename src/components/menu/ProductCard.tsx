import Image from "next/image";
import { Plus } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import type { MenuProduct } from "./types";

interface ProductCardProps {
  product: MenuProduct;
  onAdd: (product: MenuProduct) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <li className="flex gap-3 rounded-2xl border border-line bg-surface p-3 lg:flex-col lg:gap-0 lg:overflow-hidden lg:p-0">
      <div
        className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-matcha-soft lg:aspect-[4/3] lg:h-auto lg:w-full lg:rounded-none ${
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
            <span className="rounded-full border border-danger bg-surface px-2 py-0.5 text-xs font-medium text-danger">
              Habis
            </span>
          )}
          {product.is_best_seller && (
            <span className="rounded-full bg-star-gold px-2 py-0.5 text-xs font-semibold text-space-navy">
              Best Seller
            </span>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="font-heading text-base font-semibold leading-snug text-ink">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted">{product.description}</p>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2">
          <p className="text-sm font-semibold text-ink">{formatRupiah(product.price)}</p>
          <button
            type="button"
            disabled={!product.is_available}
            onClick={() => onAdd(product)}
            aria-label={
              product.is_available
                ? `Tambah ${product.name}`
                : `${product.name} sedang habis`
            }
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-xl bg-matcha px-3 text-sm font-semibold text-space-navy transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
          >
            {product.is_available ? (
              <>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Tambah
              </>
            ) : (
              "Habis"
            )}
          </button>
        </div>
      </div>
    </li>
  );
}