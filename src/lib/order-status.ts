export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled"
  | "expired";

// Short flow shown to customers: pay, received, done.
// "preparing" and "ready" still exist in the database for older orders (see stepKey).
export const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending_payment", label: "Menunggu Pembayaran" },
  { key: "paid", label: "Diterima" },
  { key: "completed", label: "Selesai" },
];

// Maps any status to the step that represents it in STEPS
export function stepKey(status: OrderStatus): OrderStatus {
  return status === "preparing" || status === "ready" ? "paid" : status;
}

export type TrackItem = {
  name: string;
  size: "REG" | "LRG" | null;
  toppings: string[];
  qty: number;
  price: number;
  note: string | null;
};

export type TrackData = {
  order: {
    code: string;
    customerName: string;
    status: OrderStatus;
    total: number;
    createdAt: string;
    paidAt: string | null;
  };
  items: TrackItem[];
  review: { rating: number; comment: string | null } | null;
  whatsapp: string | null;
};

// Simple time estimate text per status
export function getEstimate(status: OrderStatus): string {
  switch (status) {
    case "pending_payment":
      return "Selesaikan pembayaran agar pesananmu diproses.";
    case "paid":
      return "Pesananmu diterima. Estimasi sekitar 10-15 menit.";
    case "preparing":
      return "Sedang diracik. Estimasi sekitar 5-10 menit.";
    case "ready":
      return "Pesananmu siap! Ambil di kasir, kami panggil lewat namamu.";
    case "completed":
      return "Pesanan selesai. Terima kasih sudah mampir!";
    case "cancelled":
      return "Pesanan ini dibatalkan.";
    case "expired":
      return "Pesanan ini kedaluwarsa karena belum dibayar.";
  }
}