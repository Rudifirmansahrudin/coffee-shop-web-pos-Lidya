"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  salesByDay: { label: string; revenue: number; orders: number }[];
  topProducts: { name: string; qty: number }[];
  busyHours: { label: string; orders: number }[];
  viewsByDay: { label: string; views: number }[];
};

const COLORS = { navy: "#0F1B3D", matcha: "#6E9B3F", gold: "#E0A526", line: "#E8E3D6", muted: "#6B7389" };

const rupiah = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
    .format(v)
    .replace(/\u00a0/g, " ");

function ChartCard({
  title,
  empty,
  children,
}: {
  title: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4 md:p-5">
      <h2 className="mb-3 font-heading text-base font-semibold text-ink">{title}</h2>
      {empty ? (
        <p className="flex h-56 items-center justify-center text-sm text-muted">Belum ada data.</p>
      ) : (
        <div className="h-56 w-full">{children}</div>
      )}
    </section>
  );
}

const axisProps = { tick: { fontSize: 12, fill: COLORS.muted }, stroke: COLORS.line };

export default function DashboardCharts({ salesByDay, topProducts, busyHours, viewsByDay }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="Penjualan 7 hari" empty={salesByDay.every((d) => d.revenue === 0)}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={salesByDay} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid stroke={COLORS.line} vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={(v: number) => `${Math.round(v / 1000)}rb`} />
            <Tooltip formatter={(v: number) => [rupiah(v), "Omzet"]} />
            <Bar dataKey="revenue" fill={COLORS.matcha} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Produk terlaris" empty={topProducts.length === 0}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topProducts} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
            <CartesianGrid stroke={COLORS.line} horizontal={false} />
            <XAxis type="number" allowDecimals={false} {...axisProps} />
            <YAxis type="category" dataKey="name" width={110} {...axisProps} />
            <Tooltip formatter={(v: number) => [v, "Terjual"]} />
            <Bar dataKey="qty" fill={COLORS.navy} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Jam ramai (7 hari)" empty={busyHours.every((h) => h.orders === 0)}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={busyHours} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={COLORS.line} vertical={false} />
            <XAxis dataKey="label" interval={1} {...axisProps} />
            <YAxis allowDecimals={false} {...axisProps} />
            <Tooltip formatter={(v: number) => [v, "Order"]} />
            <Bar dataKey="orders" fill={COLORS.gold} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Kunjungan halaman" empty={viewsByDay.every((v) => v.views === 0)}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={viewsByDay} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={COLORS.line} vertical={false} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis allowDecimals={false} {...axisProps} />
            <Tooltip formatter={(v: number) => [v, "Kunjungan"]} />
            <Line type="monotone" dataKey="views" stroke={COLORS.navy} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}