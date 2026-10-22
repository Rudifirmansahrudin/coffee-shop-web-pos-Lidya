"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-cart-count";
import { CartItemRow } from "./CartItemRow";
import { checkoutButtonClass, formatPrice } from "./cart-utils";

/** Sticky cart panel for lg screens, shown next to the menu. */
export function CartSidebar() {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const tableNo = useCartStore((s) => s.tableNo);
  const total = useCartStore((s) => s.total());

  const isEmpty = hydrated && items.length === 0;

  return (
    <aside
      aria-label="Ringkasan keranjang"
      className="hidden rounded-2xl border border-line bg-surface lg:sticky lg:top-20 lg:flex lg:max-h-[calc(100vh-6rem)] lg:flex-col"
    >
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <h2 className="font-heading text-lg font-semibold text-space-navy">Keranjang</h2>
        {tableNo && (
          <span className="inline-flex min-h-[28px] items-center rounded-full bg-matcha-soft px-3 text-xs font-semibold text-space-navy">
            Meja {tableNo}
          </span>
        )}
      </div>

      {!hydrated ? (
        <p className="p-4 text-sm text-muted">Memuat keranjang...</p>
      ) : isEmpty ? (
        <div className="p-6 text-center">
          <p className="font-heading text-base font-semibold text-ink">
            Keranjangmu masih hampa udara.
          </p>
          <p className="mt-1 text-sm text-muted">Pilih minuman favoritmu, lalu tambahkan ke sini.</p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-line overflow-y-auto px-4">
            {items.map((item) => (
              <CartItemRow key={item.key} item={item} />
            ))}
          </ul>
          <div className="border-t border-line p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-base text-muted">Total</span>
              <span className="font-heading text-xl font-bold text-ink">{formatPrice(total)}</span>
            </div>
            <Link href="/checkout" className={checkoutButtonClass}>
              Lanjut ke Checkout
            </Link>
            <Link
              href="/cart"
              className="mt-2 flex min-h-[44px] items-center justify-center text-sm font-medium text-space-navy underline underline-offset-2"
            >
              Tambah catatan di halaman keranjang
            </Link>
          </div>
        </>
      )}
    </aside>
  );
}