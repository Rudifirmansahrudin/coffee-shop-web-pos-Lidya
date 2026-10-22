// Shared (edge-safe) admin constants: roles, cookie names, and sidebar menu.
export type Role = "owner" | "cashier" | "barista";

export const ROLES: Role[] = ["owner", "cashier", "barista"];

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

// Owner sees everything; cashier and barista only what their role needs.
export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", roles: ["owner", "cashier", "barista"] },
  { href: "/admin/orders", label: "Pesanan", icon: "orders", roles: ["owner", "cashier", "barista"] },
  { href: "/admin/products", label: "Produk & Stok", icon: "products", roles: ["owner", "cashier", "barista"] },
  { href: "/admin/content", label: "Konten", icon: "content", roles: ["owner"] },
  { href: "/admin/demo", label: "Panel Demo", icon: "demo", roles: ["owner"] },
];