"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Star } from "lucide-react";
import { DESKTOP_LINKS, isActivePath } from "@/components/layout/nav-links";
import { useCartCount } from "@/lib/use-cart-count";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function TopNav() {
  const pathname = usePathname();
  const count = useCartCount();

  return (
    // keep-dark: stays dark on light-surface pages (menu, checkout, track) in dark mode
    // "!sticky" so no custom CSS class can override the position
    <header className="keep-dark nav-surface !sticky top-0 z-40 hidden border-b md:block">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Link
          href="/"
          className="flex min-h-[44px] items-center gap-2 font-heading text-xl font-bold tracking-[0.04em] text-ink"
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
                className="nav-link"
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/cart"
            aria-label={`Keranjang, ${count} item`}
            className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-matcha px-4 text-primary-foreground"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {count > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-star-gold px-1 text-xs font-semibold text-[#241a00]">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}