"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartSize = "REG" | LRG;

export interface CartTopping {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  /** Unique key: product_id + size + sorted topping ids (SPEC 6b) */
  key: string;
  productId: string;
  name: string;
  imageUrl: string | null;
  size: CartSize;
  toppings: CartTopping[];
  /** Display only. The server always recalculates prices from the DB. */
  unitPrice: number;
  qty: number;
  note: string;
}

export interface AddItemInput {
  productId: string;
  name: string;
  imageUrl: string | null;
  size: CartSize;
  toppings: CartTopping[];
  unitPrice: number;
  qty: number;
  note?: string;
}

interface CartState {
  items: CartItem[];
  tableNo: string | null;
  addItem: (input: AddItemInput) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  setNote: (key: string, note: string) => void;
  clear: () => void;
  setTableNo: (tableNo: string | null) => void;
  total: () => number;
  count: () => number;
}

const MAX_QTY = 99;

export function buildCartKey(
  productId: string,
  size: CartSize,
  toppingIds: string[]
): string {
  return `${productId}|${size}|${[...toppingIds].sort().join(",")}`;
}

const clampQty = (qty: number) => Math.min(MAX_QTY, Math.max(1, Math.floor(qty)));

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableNo: null,

      addItem: (input) => {
        const toppings = [...input.toppings].sort((a, b) => a.id.localeCompare(b.id));
        const key = buildCartKey(
          input.productId,
          input.size,
          toppings.map((t) => t.id)
        );
        const existing = get().items.find((i) => i.key === key);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.key === key ? { ...i, qty: clampQty(i.qty + input.qty) } : i
            ),
          });
          return;
        }
        set({
          items: [
            ...get().items,
            {
              key,
              productId: input.productId,
              name: input.name,
              imageUrl: input.imageUrl,
              size: input.size,
              toppings,
              unitPrice: input.unitPrice,
              qty: clampQty(input.qty),
              note: input.note ?? "",
            },
          ],
        });
      },

      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),

      setQty: (key, qty) =>
        set({
          items: get().items.map((i) => (i.key === key ? { ...i, qty: clampQty(qty) } : i)),
        }),

      setNote: (key, note) =>
        set({
          items: get().items.map((i) => (i.key === key ? { ...i, note } : i)),
        }),

      clear: () => set({ items: [] }),

      setTableNo: (tableNo) => set({ tableNo }),

      total: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0),

      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    {
      name: "space-coffee-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, tableNo: state.tableNo }),
    }
  )
);