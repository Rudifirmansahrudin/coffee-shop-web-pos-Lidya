"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, type CartItem } from "@/lib/cart-store";
import { formatPrice } from "./cart-utils";

interface CartItemRowProps {
  item: CartItem;
  /** Show the per-item note input (used on the /cart page). */
  showNote?: boolean;
}

const stepButton =
  "inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-ink transition hover:bg-matcha-soft disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy";

export function CartItemRow({ item, showNote = false }: CartItemRowProps) {
  const setQty = useCartStore((s) => s.setQty);
  const setNote = useCartStore((s) => s.setNote);
  const removeItem = useCartStore((s) => s.removeItem);

  const toppingText = item.toppings.map((t) => t.name).join(", ");

  return (
    <li className="py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading text-base font-semibold text-ink">{item.name}</p>
          <p className="mt-0.5 text-sm text-muted">
            Ukuran {item.size}
            {toppingText ? ` · + ${toppingText}` : ""}
          </p>
          <p className="mt-0.5 text-sm text-muted">{formatPrice(item.unitPrice)} / item</p>
        </div>
        <p className="shrink-0 text-base font-semibold text-ink">
          {formatPrice(item.unitPrice * item.qty)}
        </p>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={stepButton}
            aria-label={`Kurangi jumlah ${item.name}`}
            disabled={item.qty <= 1}
            onClick={() => setQty(item.key, item.qty - 1)}
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span
            className="min-w-[32px] text-center text-base font-semibold text-ink"
            aria-live="polite"
          >
            {item.qty}
          </span>
          <button
            type="button"
            className={stepButton}
            aria-label={`Tambah jumlah ${item.name}`}
            disabled={item.qty >= 99}
            onClick={() => setQty(item.key, item.qty + 1)}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => removeItem(item.key)}
          aria-label={`Hapus ${item.name} dari keranjang`}
          className="inline-flex min-h-[44px] items-center gap-1 rounded-xl px-3 text-sm font-medium text-danger transition hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Hapus
        </button>
      </div>

      {showNote && (
        <div className="mt-2">
          <label htmlFor={`note-${item.key}`} className="sr-only">
            Catatan untuk {item.name}
          </label>
          <input
            id={`note-${item.key}`}
            type="text"
            value={item.note}
            maxLength={100}
            onChange={(e) => setNote(item.key, e.target.value)}
            placeholder="Catatan (opsional), mis. less sugar"
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-base text-ink placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy"
          />
        </div>
      )}
    </li>
  );
}