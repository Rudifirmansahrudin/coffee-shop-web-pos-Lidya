"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { sizeLabel } from "@/lib/size-label";
import { useCartStore, type CartSize } from "@/lib/cart-store";
import type { MenuProduct, MenuTopping } from "./types";

interface AddToCartDialogProps {
  product: MenuProduct;
  toppings: MenuTopping[];
  onClose: () => void;
  onAdded: (productName: string) => void;
}

const MAX_QTY = 20;

export function AddToCartDialog({ product, toppings, onClose, onAdded }: AddToCartDialogProps) {
  const addItem = useCartStore((s) => s.addItem);

  const [size, setSize] = useState<CartSize>("REG");
  const [selected, setSelected] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const hasLarge = product.price_large !== null;

  // Lock body scroll, close on Escape, keep focus inside the dialog
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = panelRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled])"
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const chosenToppings = useMemo(
    () => toppings.filter((t) => selected.includes(t.id)),
    [toppings, selected]
  );

  const basePrice = size === "LRG" && hasLarge ? (product.price_large as number) : product.price;
  const unitPrice = basePrice + chosenToppings.reduce((sum, t) => sum + t.price, 0);
  const lineTotal = unitPrice * qty;

  function toggleTopping(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.image_url,
      size,
      toppings: chosenToppings.map((t) => ({ id: t.id, name: t.name, price: t.price })),
      unitPrice,
      qty,
    });
    onAdded(product.name);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-4">
      <div className="absolute inset-0 bg-navy-bg/50" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-dialog-title"
        className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-surface shadow-xl md:max-w-md md:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line p-4">
          <div className="min-w-0">
            <h2 id="add-dialog-title" className="font-heading text-lg font-semibold text-ink">
              {product.name}
            </h2>
            <p className="text-sm text-muted">Pilih ukuran dan topping</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-ink">Ukuran</legend>
            {hasLarge ? (
              <div className="grid grid-cols-2 gap-2">
                {(["REG", "LRG"] as const).map((s) => {
                  const price = s === "LRG" ? (product.price_large as number) : product.price;
                  return (
                    <label key={s} className="relative block cursor-pointer">
                      <input
                        type="radio"
                        name="size"
                        value={s}
                        checked={size === s}
                        onChange={() => setSize(s)}
                        className="peer sr-only"
                      />
                      <span className="flex min-h-[56px] flex-col justify-center rounded-xl border-2 border-line px-3 py-2 peer-checked:border-matcha peer-checked:bg-matcha-soft peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-space-navy">
                        <span className="text-sm font-semibold text-ink">{sizeLabel(s)}</span>
                        <span className="text-sm text-muted">{formatRupiah(price)}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-xl bg-cream px-3 py-3 text-sm text-ink">
                Hanya tersedia ukuran {sizeLabel("REG")} ({formatRupiah(product.price)})
              </p>
            )}
          </fieldset>

          {toppings.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-ink">Topping (opsional)</legend>
              <div className="space-y-2">
                {toppings.map((t) => (
                  <label key={t.id} className="relative block cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.includes(t.id)}
                      onChange={() => toggleTopping(t.id)}
                      className="peer sr-only"
                    />
                    <span className="flex min-h-[48px] items-center justify-between rounded-xl border-2 border-line px-3 peer-checked:border-matcha peer-checked:bg-matcha-soft peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-space-navy">
                      <span className="text-sm text-ink">{t.name}</span>
                      <span className="text-sm text-muted">+ {formatRupiah(t.price)}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">Jumlah</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Kurangi jumlah"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line text-ink disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <output aria-live="polite" className="w-8 text-center text-base font-semibold text-ink">
                {qty}
              </output>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
                disabled={qty >= MAX_QTY}
                aria-label="Tambah jumlah"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line text-ink disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-line p-4">
          <button
            type="button"
            onClick={handleAdd}
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-matcha px-4 text-base font-semibold text-space-navy hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy"
          >
            Tambah ke keranjang · {formatRupiah(lineTotal)}
          </button>
        </div>
      </div>
    </div>
  );
}