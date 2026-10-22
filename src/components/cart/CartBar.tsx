"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-cart-count";
import { CartItemRow } from "./CartItemRow";
import { checkoutButtonClass, formatPrice } from "./cart-utils";

/** Floating cart summary for screens below lg. Opens a bottom sheet. */
export function CartBar() {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const tableNo = useCartStore((s) => s.tableNo);
  const count = useCartStore((s) => s.count());
  const total = useCartStore((s) => s.total());
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close the sheet when the last item is removed
  useEffect(() => {
    if (count === 0) setOpen(false);
  }, [count]);

  // Lock body scroll, close on Escape, move focus into the sheet
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!hydrated || count === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="fixed bottom-20 left-4 right-4 z-40 flex min-h-[56px] items-center justify-between rounded-2xl bg-matcha px-4 text-space-navy shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy md:bottom-4 md:left-1/2 md:right-auto md:w-[28rem] md:-translate-x-1/2 lg:hidden"
      >
        <span className="flex items-center gap-2 font-semibold">
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          {count} item · Lihat keranjang
        </span>
        <span className="font-heading font-bold">{formatPrice(total)}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-sheet-title"
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Tutup keranjang"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-space-navy/40"
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-surface md:inset-x-auto md:left-1/2 md:w-[32rem] md:-translate-x-1/2">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="flex items-center gap-2">
                <h2 id="cart-sheet-title" className="font-heading text-lg font-semibold text-space-navy">
                  Keranjang
                </h2>
                {tableNo && (
                  <span className="inline-flex min-h-[28px] items-center rounded-full bg-matcha-soft px-3 text-xs font-semibold text-space-navy">
                    Meja {tableNo}
                  </span>
                )}
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup keranjang"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <ul className="divide-y divide-line overflow-y-auto px-4">
              {items.map((item) => (
                <CartItemRow key={item.key} item={item} />
              ))}
            </ul>

            <div className="border-t border-line px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
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
                Buka halaman keranjang untuk menambah catatan
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}