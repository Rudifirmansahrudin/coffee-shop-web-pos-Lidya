"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";

/** True only after the first client render, so persisted cart data never causes an SSR mismatch. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}

/** Total quantity in the cart. Always 0 on the server and during the first client render. */
export function useCartCount(): number {
  const count = useCartStore((s) => s.count());
  const hydrated = useHydrated();
  return hydrated ? count : 0;
}