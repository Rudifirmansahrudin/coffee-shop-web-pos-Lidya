"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-cart-count";
import { EmptyState } from "@/components/space/EmptyState";
import { CartItemRow } from "./CartItemRow";
import { checkoutButtonClass, formatPrice } from "./cart-utils";

export function CartView() {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const tableNo = useCartStore((s) => s.tableNo);
  const total = useCartStore((s) => s.total());
  const count = useCartStore((s) => s.count());
  const clear = useCartStore((s) => s.clear);

  if (!hydrated) {
    return <p className="mt-8 text-sm text-muted">Memuat keranjang...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          title="Keranjangmu masih hampa udara."
          description="Yuk pilih minuman favoritmu dulu."
        />
        <div className="mx-auto mt-4 max-w-xs">
          <Link href="/menu" className={checkoutButtonClass}>
            Lihat Menu
          </Link>
        </div>
      </div>
    );
  }

  const handleClear = () => {
    if (window.confirm("Kosongkan semua item di keranjang?")) clear();
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <section aria-label="Daftar pesanan" className="rounded-2xl border border-line bg-surface px-4">
        <ul className="divide-y divide-line">
          {items.map((item) => (
            <CartItemRow key={item.key} item={item} showNote />
          ))}
        </ul>
      </section>

      <aside
        aria-label="Ringkasan pesanan"
        className="rounded-2xl border border-line bg-surface p-4 lg:sticky lg:top-20"
      >
        <h2 className="font-heading text-lg font-semibold text-space-navy">Ringkasan</h2>
        {tableNo && (
          <span className="mt-2 inline-flex min-h-[28px] items-center rounded-full bg-matcha-soft px-3 text-xs font-semibold text-space-navy">
            Meja {tableNo}
          </span>
        )}
        <dl className="mt-3 space-y-2 text-base">
          <div className="flex items-center justify-between">
            <dt className="text-muted">Jumlah item</dt>
            <dd className="font-medium text-ink">{count}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted">Total</dt>
            <dd className="font-heading text-xl font-bold text-ink">{formatPrice(total)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-muted">
          Total final dihitung ulang oleh server dari harga terbaru saat checkout.
        </p>
        <Link href="/checkout" className={`${checkoutButtonClass} mt-4`}>
          Lanjut ke Checkout
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <Link
            href="/menu"
            className="inline-flex min-h-[44px] items-center text-sm font-medium text-space-navy underline underline-offset-2"
          >
            Tambah menu lagi
          </Link>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex min-h-[44px] items-center rounded-xl px-2 text-sm font-medium text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy"
          >
            Kosongkan
          </button>
        </div>
      </aside>
    </div>
  );
}