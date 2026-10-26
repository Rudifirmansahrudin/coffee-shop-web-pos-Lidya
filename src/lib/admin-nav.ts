// Shared (edge-safe) admin constants: roles, cookie names, and sidebar menu.
// "barista" stays in the type so older code still type-checks, but it is no longer selectable.
export type Role = "owner" | "cashier" | "barista";

// A small cafe only needs two active roles
export const ROLES: Role[] = ["owner", "cashier"];

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  cashier: "Kasir",
  barista: "Barista",
};

export const DEMO_COOKIE = "sc_demo_role";
export const TOKEN_COOKIE = "sc_admin_token";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: "dashboard" | "orders" | "products" | "content" | "demo";
  roles: Role[];
};

// Owner sees everything; cashier only what the daily work needs.
export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", roles: ["owner", "cashier"] },
  { href: "/admin/orders", label: "Pesanan", icon: "orders", roles: ["owner", "cashier"] },
  { href: "/admin/products", label: "Produk & Stok", icon: "products", roles: ["owner", "cashier"] },
  { href: "/admin/content", label: "Konten", icon: "content", roles: ["owner"] },
  { href: "/admin/demo", label: "Panel Demo", icon: "demo", roles: ["owner"] },
];