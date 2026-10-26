"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Star, Sun } from "lucide-react";

export function MobileTopBar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: theme is only known on the client
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-background/95 px-4 backdrop-blur md:hidden">
      <Link
        href="/"
        className="flex min-h-[44px] items-center gap-2 font-heading text-base font-semibold text-foreground"
      >
        <Star className="h-4 w-4 fill-star-gold text-star-gold" aria-hidden="true" />
        Space Coffee
      </Link>

      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-matcha"
      >
        {isDark ? (
          <Sun className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Moon className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    </header>
  );
}

export default MobileTopBar;