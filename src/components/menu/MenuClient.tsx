"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { AddToCartDialog } from "./AddToCartDialog";
import { ProductCard } from "./ProductCard";
import type { MenuCategory, MenuProduct, MenuTopping } from "./types";

interface MenuClientProps {
  categories: MenuCategory[];
  products: MenuProduct[];
  toppings: MenuTopping[];
  tableNo: string | null;
}

export function MenuClient({ categories, products, toppings, tableNo }: MenuClientProps) {
  const setTableNo = useCartStore((s) => s.setTableNo);

  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selected, setSelected] = useState<MenuProduct | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Remember table number from QR link (?meja=N)
  useEffect(() => {
    if (tableNo) setTableNo(tableNo);
  }, [tableNo, setTableNo]);

  // Auto-hide the "added" notice
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 2200);
    return () => clearTimeout(t);
  }, [notice]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const visible = products.filter((p) => {
      if (onlyAvailable && !p.is_available) return false;
      if (active !== "all" && p.category_id !== active) return false;
      if (q && !`${p.name} ${p.description ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
    return categories
      .map((category) => ({
        category,
        items: visible.filter((p) => p.category_id === category.id),
      }))
      .filter((g) => g.items.length > 0);
  }, [categories, products, active, query, onlyAvailable]);

  const pillBase =
    "inline-flex min-h-[44px] shrink-0 items-center rounded-full border px-4 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy";

  // Active category pill: navy in light mode, matcha with navy text in dark mode
  const pillActive =
    "border-transparent bg-navy-bg text-cream dark:border-matcha dark:bg-matcha dark:font-semibold dark:text-[rgb(var(--c-primary-fg))]";
  const pillIdle = "border-line bg-surface text-ink";

  return (
    <>
      <div className="sticky top-0 z-30 -mx-4 border-b border-line bg-cream px-4 py-3 md:top-16">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <label htmlFor="menu-search" className="sr-only">
              Cari menu
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id="menu-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari menu..."
              className="h-11 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-base text-ink placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy"
            />
          </div>

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              aria-pressed={active === "all"}
              onClick={() => setActive("all")}
              className={`${pillBase} ${active === "all" ? pillActive : pillIdle}`}
            >
              Semua
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={active === c.id}
                onClick={() => setActive(c.id)}
                className={`${pillBase} ${active === c.id ? pillActive : pillIdle}`}
              >
                {c.name}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={onlyAvailable}
              onClick={() => setOnlyAvailable((v) => !v)}
              className={`${pillBase} ${
                onlyAvailable
                  ? "border-matcha bg-matcha-soft text-space-navy"
                  : pillIdle
              }`}
            >
              {onlyAvailable ? "✓ " : ""}Tersedia saja
            </button>
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center">
          <p className="font-heading text-base font-semibold text-ink">Menu tidak ditemukan</p>
          <p className="mt-1 text-sm text-muted">
            Coba kata kunci lain atau matikan filter &quot;Tersedia saja&quot;.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {groups.map(({ category, items }) => (
            <section key={category.id} aria-labelledby={`cat-${category.id}`}>
              <h2
                id={`cat-${category.id}`}
                className="mb-3 font-heading text-xl font-semibold text-space-navy"
              >
                {category.name}
              </h2>
              {/* Fewer columns than before: the cart sidebar takes the right side on lg */}
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4 xl:grid-cols-3">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} onAdd={setSelected} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {selected && (
        <AddToCartDialog
          key={selected.id}
          product={selected}
          toppings={toppings}
          onClose={() => setSelected(null)}
          onAdded={(name) => setNotice(`${name} masuk keranjang`)}
        />
      )}

      {notice && (
        <div
          role="status"
          className="fixed bottom-36 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-navy-bg px-4 py-2 text-sm font-medium text-cream shadow-lg dark:bg-matcha dark:text-[rgb(var(--c-primary-fg))] md:bottom-24 lg:bottom-8"
        >
          {notice}
        </div>
      )}
    </>
  );
}