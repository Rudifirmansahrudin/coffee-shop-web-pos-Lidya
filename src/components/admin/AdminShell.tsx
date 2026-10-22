"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  Coffee,
  FileText,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import {
  ADMIN_NAV,
  ROLES,
  ROLE_LABELS,
  type AdminNavItem,
  type Role,
} from "@/lib/admin-nav";

type Props = {
  role: Role;
  name: string;
  mode: "demo" | "auth";
  children: React.ReactNode;
};

const ICONS: Record<AdminNavItem["icon"], React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  orders: ClipboardList,
  products: Coffee,
  content: FileText,
  demo: FlaskConical,
};

function SidebarNav({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = ADMIN_NAV.filter((item) => item.roles.includes(role));

  return (
    <nav aria-label="Menu admin" className="flex-1 space-y-1 px-3 py-4">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy ${
              active ? "bg-matcha-soft text-space-navy" : "text-ink hover:bg-cream"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminShell({ role, name, mode, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Close drawer on route change and on Escape.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  async function switchRole(next: Role) {
    if (next === role) return;
    setBusy(true);
    try {
      await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "demo", role: next }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  const brand = (
    <div className="flex h-14 items-center border-b border-line px-5">
      <span className="font-heading text-lg font-bold text-space-navy">Mission Control</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* Fixed sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
        {brand}
        <SidebarNav role={role} />
      </aside>

      {/* Drawer (mobile) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu admin">
          <button
            type="button"
            aria-label="Tutup menu"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-surface shadow-lg">
            <div className="flex h-14 items-center justify-between border-b border-line px-5">
              <span className="font-heading text-lg font-bold text-space-navy">Mission Control</span>
              <button
                type="button"
                aria-label="Tutup menu"
                onClick={() => setDrawerOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-cream"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav role={role} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-surface px-3 lg:ml-64 lg:px-6">
        <button
          type="button"
          aria-label="Buka menu"
          onClick={() => setDrawerOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-cream lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-heading text-base font-bold text-space-navy lg:hidden">Mission Control</span>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-sm text-muted sm:inline">{name}</span>
          {mode === "demo" ? (
            <select
              aria-label="Ganti peran"
              value={role}
              disabled={busy}
              onChange={(e) => void switchRole(e.target.value as Role)}
              className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          ) : (
            <span className="rounded-full bg-matcha-soft px-3 py-1 text-xs font-semibold text-space-navy">
              {ROLE_LABELS[role]}
            </span>
          )}
          <button
            type="button"
            aria-label="Keluar"
            disabled={busy}
            onClick={() => void logout()}
            className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-cream disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="px-4 py-6 lg:ml-64 lg:px-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}