"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, Minus, Plus, X } from "lucide-react";
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
const MAX_NOTE = 100;
const QUICK_NOTES = ["Less sugar", "No sugar", "Less ice", "No ice"] as const;

type Step = "detail" | "options";

export function AddToCartDialog({ product, toppings, onClose, onAdded }: AddToCartDialogProps) {
  const addItem = useCartStore((s) => s.addItem);

  // Step 1 = preview only, step 2 = size / topping / note / qty
  const [step, setStep] = useState<Step>("detail");
  const [size, setSize] = useState<CartSize>("REG");
  const [selected, setSelected] = useState<string[]>([]);
  const [quick, setQuick] = useState<string[]>([]);
  const [noteText, setNoteText] = useState("");
  const [qty, setQty] = useState(1);

  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const hasLarge = product.price_large !== null;
  const available = product.is_available;

  // Lock body scroll, close on Escape, keep focus inside the dialog
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

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

  // On every step change: scroll to top and move focus to the first control
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    firstFocusRef.current?.focus();
  }, [step]);

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

  // "No sugar" and "Less sugar" (and the ice pair) exclude each other
  function toggleQuick(label: string) {
    setQuick((prev) => {
      if (prev.includes(label)) return prev.filter((x) => x !== label);
      const group = label.endsWith("sugar") ? "sugar" : "ice";
      return [...prev.filter((x) => !x.endsWith(group)), label];
    });
  }

  function handleAdd() {
    if (!available) return;
    const note = [...quick, noteText.trim()].filter(Boolean).join(", ").slice(0, MAX_NOTE);
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.image_url,
      size,
      toppings: chosenToppings.map((t) => ({ id: t.id, name: t.name, price: t.price })),
      unitPrice,
      qty,
      note,
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
        className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-[rgb(var(--c-popover))] shadow-xl md:max-w-md md:rounded-2xl"
      >
        {step === "detail" ? (
          /* ---------- STEP 1: preview ---------- */
          <>
            <button
              ref={firstFocusRef}
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[rgb(var(--c-popover)/0.9)] text-ink shadow-md hover:bg-matcha-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              <div className="relative aspect-[4/3] w-full bg-matcha-soft">
                <Image
                  src={product.image_url || "/menu/default.svg"}
                  alt={product.name}
                  fill
                  sizes="(min-width: 768px) 448px, 100vw"
                  className={`object-cover ${available ? "" : "opacity-60 grayscale"}`}
                  unoptimized
                />
              </div>

              <div className="p-4">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {available ? (
                    <span className="rounded-full bg-matcha-soft px-2 py-0.5 text-xs font-medium text-space-navy">
                      Tersedia
                    </span>
                  ) : (
                    <span className="rounded-full border border-danger px-2 py-0.5 text-xs font-medium text-danger">
                      Habis
                    </span>
                  )}
                  {product.is_best_seller && (
                    <span className="rounded-full bg-star-gold px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                      Best Seller
                    </span>
                  )}
                </div>
                <h2 id="add-dialog-title" className="font-heading text-xl font-semibold text-ink">
                  {product.name}
                </h2>
                <p className="mt-1 text-base font-semibold text-ink">
                  {formatRupiah(product.price)}
                  {hasLarge && (
                    <span className="font-normal text-muted">
                      {" "}
                      / {formatRupiah(product.price_large as number)}
                    </span>
                  )}
                </p>
                {product.description && (
                  <p className="mt-2 text-sm text-muted">{product.description}</p>
                )}
                {!available && (
                  <p
                    role="status"
                    className="mt-4 rounded-xl border border-danger px-3 py-3 text-sm text-danger"
                  >
                    Menu ini sedang habis. Coba lagi nanti atau pilih menu lain.
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-line p-4">
              <button
                type="button"
                onClick={() => setStep("options")}
                disabled={!available}
                className="flex min-h-[48px] w-full items-center justify-center gap-1 rounded-xl bg-matcha px-4 text-base font-semibold text-[rgb(var(--c-primary-fg))] hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy disabled:cursor-not-allowed disabled:bg-line disabled:text-muted disabled:hover:brightness-100"
              >
                {available ? (
                  <>
                    <Plus className="h-5 w-5" aria-hidden="true" />
                    Tambah
                  </>
                ) : (
                  "Sedang habis"
                )}
              </button>
            </div>
          </>
        ) : (
          /* ---------- STEP 2: options ---------- */
          <>
            <div className="flex items-center gap-2 border-b border-line p-3">
              <button
                ref={firstFocusRef}
                type="button"
                onClick={() => setStep("detail")}
                aria-label="Kembali ke detail menu"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink hover:bg-matcha-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="min-w-0 flex-1">
                <h2
                  id="add-dialog-title"
                  className="truncate font-heading text-lg font-semibold text-ink"
                >
                  {product.name}
                </h2>
                <p className="text-sm text-muted">Pilih ukuran, topping, dan catatan</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink hover:bg-matcha-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-4">
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
                  <p className="rounded-xl bg-matcha-soft px-3 py-3 text-sm text-ink">
                    Hanya tersedia ukuran {sizeLabel("REG")} ({formatRupiah(product.price)})
                  </p>
                )}
              </fieldset>

              {toppings.length > 0 && (
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-ink">
                    Topping (opsional)
                  </legend>
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

              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-ink">Catatan (gratis)</legend>
                <div className="mb-2 flex flex-wrap gap-2">
                  {QUICK_NOTES.map((label) => {
                    const on = quick.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleQuick(label)}
                        className={`inline-flex min-h-[44px] items-center rounded-full border px-4 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy ${
                          on
                            ? "border-matcha bg-matcha font-semibold text-[rgb(var(--c-primary-fg))]"
                            : "border-line text-ink hover:bg-matcha-soft"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <label htmlFor="add-note" className="sr-only">
                  Catatan tambahan
                </label>
                <input
                  id="add-note"
                  type="text"
                  value={noteText}
                  maxLength={60}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Catatan lain, mis. es dipisah"
                  className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-base text-ink placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy"
                />
              </fieldset>

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
                  <output
                    aria-live="polite"
                    className="w-8 text-center text-base font-semibold text-ink"
                  >
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
                className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-matcha px-4 text-base font-semibold text-[rgb(var(--c-primary-fg))] hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy"
              >
                Tambah ke keranjang · {formatRupiah(lineTotal)}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}