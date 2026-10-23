"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  function handleToggle() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="Ganti tema terang atau gelap"
      className="inline-flex h-11 w-11 items-center justify-center rounded-button border border-line bg-surface text-ink transition-colors hover:bg-matcha-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha"
    >
      {/* Icon is chosen by CSS (dark: variant), so server and client markup always match */}
      <Moon className="h-5 w-5 dark:hidden" aria-hidden="true" />
      <Sun className="hidden h-5 w-5 dark:block" aria-hidden="true" />
    </button>
  );
}