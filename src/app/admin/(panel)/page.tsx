import { Lightbulb, Receipt, ShoppingBag, Timer, Wallet } from "lucide-react";
import DashboardCharts from "@/components/admin/DashboardCharts";
import { buildInsights, formatRupiah, getDashboardData } from "@/lib/dashboard-data";
import { ReviewsPanel } from "@/components/admin/ReviewsPanel";
import type { DashboardData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 md:p-5">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Icon className="h-4 w-4 text-matcha" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 font-heading text-xl font-semibold text-ink md:text-2xl">{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  let data: DashboardData | null = null;
  try {
    data = await getDashboardData();
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-ink">
        <h1 className="font-heading text-xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-sm text-muted">
          Data dashboard belum bisa dimuat. Pastikan tabel page_views sudah dibuat (supabase/p12_page_views.sql) lalu
          muat ulang halaman.
        </p>
      </div>
    );
  }

  const insights = buildInsights(data);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink md:text-2xl">Dashboard</h1>
        <p className="text-sm text-muted">Ringkasan penjualan dan kunjungan (zona waktu Asia/Jakarta).</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Omzet hari ini" value={formatRupiah(data.todayRevenue)} icon={Wallet} />
        <StatCard label="Jumlah order" value={String(data.todayOrders)} icon={ShoppingBag} />
        <StatCard label="Menunggu bayar" value={String(data.pendingCount)} icon={Timer} />
        <StatCard label="Rata-rata order" value={formatRupiah(data.avgOrder)} icon={Receipt} />
      </div>

      <section className="rounded-2xl border border-matcha/30 bg-matcha-soft p-4 md:p-5">
        <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-ink">
          <Lightbulb className="h-4 w-4 text-matcha" aria-hidden="true" />
          Insight
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
          {insights.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      </section>

      <DashboardCharts
        salesByDay={data.salesByDay}
        topProducts={data.topProducts}
        busyHours={data.busyHours}
        viewsByDay={data.viewsByDay}
      />

      <ReviewsPanel />
    </div>
  );
}