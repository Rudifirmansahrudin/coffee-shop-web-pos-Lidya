// Shared (client + server) types, status config and permission rules for the admin order queue.

export type AdminRole = "owner" | "cashier" | "barista";

// Accepts a string, or an object like { role: "owner" }, and maps aliases to AdminRole.
export function normalizeRole(raw: unknown): AdminRole | null {
  let value: unknown = raw;
  if (value && typeof value === "object" && "role" in value) {
    value = (value as { role: unknown }).role;
  }
  if (typeof value !== "string") return null;

  switch (value.trim().toLowerCase()) {
    case "owner":
      return "owner";
    case "cashier":
    case "kasir":
      return "cashier";
    case "barista":
      return "barista";
    default:
      return null;
  }
}

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled"
  | "expired";

export const ACTIVE_STATUSES = ["pending_payment", "paid", "preparing", "ready"] as const;
export type ActiveStatus = (typeof ACTIVE_STATUSES)[number];

// "confirm" goes through /api/admin/confirm-payment; the others through /api/admin/orders/[id]/status
export type OrderAction = "confirm" | "preparing" | "ready" | "completed" | "cancelled";
export type StatusAction = Exclude<OrderAction, "confirm">;

export const COLUMN_TITLE: Record<ActiveStatus, string> = {
  pending_payment: "Pending",
  paid: "Dibayar",
  preparing: "Diracik",
  ready: "Siap",
};

// Valid source statuses for each status action
export const ALLOWED_FROM: Record<StatusAction, OrderStatus[]> = {
  preparing: ["paid"],
  ready: ["preparing"],
  completed: ["ready"],
  cancelled: ["pending_payment", "paid", "preparing", "ready"],
};

const PERMISSIONS: Record<AdminRole, OrderAction[]> = {
  owner: ["confirm", "preparing", "ready", "completed", "cancelled"],
  cashier: ["confirm", "preparing", "ready", "completed", "cancelled"],
  barista: ["preparing", "ready"],
};

export function canDo(role: AdminRole, action: OrderAction): boolean {
  return PERMISSIONS[role]?.includes(action) ?? false;
}

const MAIN_ACTION: Record<ActiveStatus, { action: OrderAction; label: string }> = {
  pending_payment: { action: "confirm", label: "Konfirmasi Pembayaran" },
  paid: { action: "preparing", label: "Mulai Racik" },
  preparing: { action: "ready", label: "Tandai Siap" },
  ready: { action: "completed", label: "Selesaikan" },
};

export type OrderActionButton = { action: OrderAction; label: string; primary: boolean };

export function actionsFor(role: AdminRole, status: ActiveStatus): OrderActionButton[] {
  const list: OrderActionButton[] = [];
  const main = MAIN_ACTION[status];
  if (canDo(role, main.action)) list.push({ ...main, primary: true });
  if (canDo(role, "cancelled")) list.push({ action: "cancelled", label: "Batalkan", primary: false });
  return list;
}

export type AdminOrderItem = {
  id: string;
  name: string;
  size: "REG" | LRG | null;
  toppings: { id: string; name: string; price: number }[];
  price: number;
  qty: number;
  note: string | null;
};

export type AdminOrder = {
  id: string;
  code: string;
  customer_name: string;
  total: number;
  status: OrderStatus;
  note: string | null;
  is_dummy: boolean;
  created_at: string;
  order_items: AdminOrderItem[];
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatIDR(value: number): string {
  // Intl gives "Rp 25.000" (with a non-breaking space); normalise to a normal space
  return rupiah.format(value).replace(/\u00A0/g, " ");
}

const clock = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

export function formatClock(iso: string): string {
  return clock.format(new Date(iso));
}