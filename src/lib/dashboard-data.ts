import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const PAID_STATUSES = ["paid", "preparing", "ready", "completed"];

export type DashboardData = {
  todayRevenue: number;
  todayOrders: number;
  todayPaidOrders: number;
  avgOrder: number;
  pendingCount: number;
  yesterdayRevenue: number;
  weekOrders: number;
  weekViews: number;
  salesByDay: { label: string; revenue: number; orders: number }[];
  topProducts: { name: string; qty: number }[];
  busyHours: { label: string; orders: number }[];
  viewsByDay: { label: string; views: number }[];
};

type OrderRow = { id: string; total: number; status: string; created_at: string };
type ItemRow = { name: string; qty: number };

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/\u00a0/g, " ");
}

function toJakarta(d: Date): Date {
  return new Date(d.getTime() + JAKARTA_OFFSET_MS);
}

function dayKey(d: Date): string {
  return toJakarta(d).toISOString().slice(0, 10);
}

function startOfJakartaDay(d: Date): Date {
  const j = toJakarta(d);
  j.setUTCHours(0, 0, 0, 0);
  return new Date(j.getTime() - JAKARTA_OFFSET_MS);
}

function dayLabel(key: string): string {
  return `${key.slice(8, 10)}/${key.slice(5, 7)}`;
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const todayStart = startOfJakartaDay(now);
  const weekStart = new Date(todayStart.getTime() - 6 * DAY_MS);

  // 7 day starts, oldest first
  const dayStarts = Array.from({ length: 7 }, (_, i) => new Date(weekStart.getTime() + i * DAY_MS));
  const dayKeys = dayStarts.map(dayKey);
  const todayKey = dayKey(now);
  const yesterdayKey = dayKeys[5];

  const [ordersRes, pendingRes, ...viewRes] = await Promise.all([
    supabase
      .from("orders")
      .select("id,total,status,created_at")
      .gte("created_at", weekStart.toISOString())
      .in("status", [...PAID_STATUSES, "pending_payment"]),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_payment"),
    ...dayStarts.map((start) =>
      supabase
        .from("page_views")
        .select("id", { count: "exact", head: true })
        .gte("created_at", start.toISOString())
        .lt("created_at", new Date(start.getTime() + DAY_MS).toISOString())
    ),
  ]);

  if (ordersRes.error) throw new Error(ordersRes.error.message);
  if (pendingRes.error) throw new Error(pendingRes.error.message);
  for (const r of viewRes) if (r.error) throw new Error(r.error.message);

  const orders = (ordersRes.data ?? []) as OrderRow[];
  const paid = orders.filter((o) => PAID_STATUSES.includes(o.status));

  // Sales per day
  const byDay = new Map<string, { revenue: number; orders: number }>();
  dayKeys.forEach((k) => byDay.set(k, { revenue: 0, orders: 0 }));
  for (const o of paid) {
    const bucket = byDay.get(dayKey(new Date(o.created_at)));
    if (bucket) {
      bucket.revenue += o.total;
      bucket.orders += 1;
    }
  }
  const salesByDay = dayKeys.map((k) => ({
    label: dayLabel(k),
    revenue: byDay.get(k)!.revenue,
    orders: byDay.get(k)!.orders,
  }));

  // Today stats
  const today = byDay.get(todayKey) ?? { revenue: 0, orders: 0 };
  const todayOrders = orders.filter((o) => dayKey(new Date(o.created_at)) === todayKey).length;
  const avgOrder = today.orders > 0 ? Math.round(today.revenue / today.orders) : 0;
  const yesterdayRevenue = byDay.get(yesterdayKey)?.revenue ?? 0;

  // Busy hours (Asia/Jakarta), 07.00 - 22.00
  const hourCounts = new Array<number>(24).fill(0);
  for (const o of paid) hourCounts[toJakarta(new Date(o.created_at)).getUTCHours()] += 1;
  const busyHours = Array.from({ length: 16 }, (_, i) => i + 7).map((h) => ({
    label: `${String(h).padStart(2, "0")}.00`,
    orders: hourCounts[h],
  }));

  // Top products
  let topProducts: { name: string; qty: number }[] = [];
  if (paid.length > 0) {
    const itemsRes = await supabase
      .from("order_items")
      .select("name,qty")
      .in("order_id", paid.map((o) => o.id));
    if (itemsRes.error) throw new Error(itemsRes.error.message);
    const qtyMap = new Map<string, number>();
    for (const it of (itemsRes.data ?? []) as ItemRow[]) {
      qtyMap.set(it.name, (qtyMap.get(it.name) ?? 0) + it.qty);
    }
    topProducts = Array.from(qtyMap.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }

  // Page views
  const viewsByDay = dayKeys.map((k, i) => ({
    label: dayLabel(k),
    views: viewRes[i].count ?? 0,
  }));

  return {
    todayRevenue: today.revenue,
    todayOrders,
    todayPaidOrders: today.orders,
    avgOrder,
    pendingCount: pendingRes.count ?? 0,
    yesterdayRevenue,
    weekOrders: paid.length,
    weekViews: viewsByDay.reduce((s, v) => s + v.views, 0),
    salesByDay,
    topProducts,
    busyHours,
    viewsByDay,
  };
}

// Simple rule-based insights
export function buildInsights(d: DashboardData): string[] {
  const out: string[] = [];

  if (d.pendingCount > 0) {
    out.push(`Ada ${d.pendingCount} pesanan menunggu konfirmasi pembayaran. Cek menu Pesanan.`);
  }

  if (d.yesterdayRevenue > 0) {
    const diff = Math.round(((d.todayRevenue - d.yesterdayRevenue) / d.yesterdayRevenue) * 100);
    out.push(
      diff >= 0
        ? `Omzet hari ini sejauh ini naik ${diff}% dibanding kemarin.`
        : `Omzet hari ini sejauh ini turun ${Math.abs(diff)}% dibanding kemarin.`
    );
  }

  if (d.topProducts.length > 0) {
    const top = d.topProducts[0];
    out.push(`${top.name} paling laris minggu ini (${top.qty} terjual). Pastikan stoknya aman.`);
  }

  const peak = d.busyHours.reduce((a, b) => (b.orders > a.orders ? b : a), d.busyHours[0]);
  if (peak && peak.orders > 0) {
    out.push(`Jam paling ramai sekitar ${peak.label}. Siapkan barista lebih awal.`);
  }

  if (d.weekViews > 0 && d.weekOrders > 0) {
    const rate = Math.round((d.weekOrders / d.weekViews) * 100);
    out.push(`Dari ${d.weekViews} kunjungan halaman minggu ini, ${d.weekOrders} jadi pesanan (sekitar ${rate}%).`);
  }

  if (out.length === 0) {
    out.push("Belum ada data cukup untuk insight. Coba Generate data 7 hari di Panel Demo atau buat beberapa pesanan.");
  }
  return out;
}