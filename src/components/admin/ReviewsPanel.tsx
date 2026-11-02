import { unstable_noStore as noStore } from "next/cache";
import { Star } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface OrderRef {
  code: string;
  customer_name: string;
}

interface ReviewRow {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  // Supabase may return the joined row as an object or a one-item array
  orders: OrderRef | OrderRef[] | null;
}

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={`${size} ${
            n <= Math.round(value) ? "fill-star-gold text-star-gold" : "text-line"
          }`}
        />
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

export async function ReviewsPanel() {
  // Always read fresh data (avoid Next.js fetch cache)
  noStore();

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, orders(code, customer_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <section className="rounded-2xl border border-line bg-surface p-4">
        <h2 className="font-heading text-lg font-semibold text-ink">Ulasan Pelanggan</h2>
        <p className="mt-2 text-sm text-danger">Ulasan belum bisa dimuat. Coba muat ulang halaman.</p>
      </section>
    );
  }

  const rows = (data ?? []) as unknown as ReviewRow[];
  const total = rows.length;
  const average = total > 0 ? rows.reduce((sum, r) => sum + r.rating, 0) / total : 0;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: rows.filter((r) => r.rating === star).length,
  }));
  const latest = rows.slice(0, 5);

  return (
    <section className="rounded-2xl border border-line bg-surface p-4 lg:p-5">
      <h2 className="font-heading text-lg font-semibold text-ink">Ulasan Pelanggan</h2>

      {total === 0 ? (
        <p className="mt-3 text-sm text-muted">
          Belum ada ulasan. Ulasan muncul setelah pelanggan menilai pesanan yang sudah selesai.
        </p>
      ) : (
        <div className="mt-4 grid gap-5 lg:grid-cols-[220px_1fr]">
          <div>
            <p className="font-heading text-4xl font-semibold text-ink">{average.toFixed(1)}</p>
            <Stars value={average} size="h-5 w-5" />
            <p className="mt-1 text-sm text-muted">{total} ulasan</p>

            <ul className="mt-3 space-y-1.5">
              {distribution.map(({ star, count }) => (
                <li key={star} className="flex items-center gap-2 text-xs text-muted">
                  <span className="w-3 text-ink">{star}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                    <span
                      className="block h-full rounded-full bg-star-gold"
                      style={{ width: `${(count / total) * 100}%` }}
                    />
                  </span>
                  <span className="w-5 text-right">{count}</span>
                </li>
              ))}
            </ul>
          </div>

          <ul className="space-y-3">
            {latest.map((r) => {
              const order = Array.isArray(r.orders) ? r.orders[0] : r.orders;
              return (
                <li key={r.id} className="rounded-xl border border-line p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Stars value={r.rating} />
                    <span className="text-xs text-muted">{formatDate(r.created_at)}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink">
                    {r.comment?.trim() ? r.comment : <span className="text-muted">Tanpa komentar</span>}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {order ? `${order.customer_name} · ${order.code}` : "Pesanan tidak ditemukan"}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}