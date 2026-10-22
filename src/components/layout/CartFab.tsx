"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCartCount } from "@/lib/use-cart-count";

// Pages where a floating cart button would be redundant
const HIDDEN_PREFIXES = ["/cart", "/checkout", "/pay", "/track"];

export function CartFab() {
  const pathname = usePathname();
  const count = useCartCount();

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

  return (
    <Link
      href="/cart"
      aria-label={`Keranjang, ${count} item`}
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-matcha text-space-navy shadow-lg md:hidden"
    >
      <ShoppingBag className="h-6 w-6" aria-hidden="true" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-space-navy px-1 text-xs font-semibold text-cream">
          {count}
        </span>
      ) : null}
    </Link>
  );
}