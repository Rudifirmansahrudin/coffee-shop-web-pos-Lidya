"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { DESKTOP_LINKS, isActivePath } from "@/components/layout/nav-links";
import { useCartCount } from "@/lib/use-cart-count";

export function TopNav() {
  const pathname = usePathname();
  const count = useCartCount();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-line bg-cream/90 backdrop-blur md:block">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Link
          href="/"
          className="flex min-h-[44px] items-center gap-2 font-heading text-xl font-bold text-space-navy"
        >
          <Star className="h-5 w-5 fill-star-gold text-star-gold" aria-hidden="true" />
          Space Coffee
        </Link>

        <nav aria-label="Navigasi utama" className="flex items-center gap-1">
          {DESKTOP_LINKS.map(({ href, label }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[44px] items-center rounded-xl px-4 text-sm font-medium text-ink hover:bg-matcha-soft",
                  active && "bg-matcha-soft font-semibold text-space-navy"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/cart"
          aria-label={`Keranjang, ${count} item`}
          className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-matcha px-4 text-space-navy"
        >
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          {count > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-space-navy px-1 text-xs font-semibold text-cream">
              {count}
            </span>
          ) : null}
        </Link>
      </div>
    </header>
  );
}