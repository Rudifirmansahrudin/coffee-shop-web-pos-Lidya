"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { MessageCircle } from "lucide-react";
import { StatusStepper } from "@/components/track/StatusStepper";
import { ReviewForm } from "@/components/track/ReviewForm";
import { getEstimate, type TrackData } from "@/lib/order-status";
import { sizeLabel } from "@/lib/size-label";

const formatRp = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(n)
    .replace(/\u00a0/g, " ");

const formatTime = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));

export function TrackClient({ code }: { code: string }) {
  const [data, setData] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/track/${code}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Gagal memuat pesanan.");
        return;
      }
      setData(json as TrackData);
      setError(null);
    } catch {
      setError("Koneksi bermasalah. Coba muat ulang.");
    } finally {
      setLoading(false);
    }
  }, [code]);

  // Initial fetch
  useEffect(() => {
    load();
  }, [load]);

  // Realtime: listen to the broadcast signal, then refetch through the API
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel(`order:${code}`)
      .on("broadcast", { event: "status" }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, code, load]);

  // Mobile browsers freeze background tabs: refetch as soon as the tab is visible again
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    window.addEventListener("pageshow", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
      window.removeEventListener("pageshow", refresh);
    };
  }, [load]);

  // Fallback polling while the order is still active
  const status = data?.order.status;
  useEffect(() => {
    if (!status || ["completed", "cancelled", "expired"].includes(status)) return;
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [status, load]);

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-24 animate-pulse rounded-2xl bg-line" />
        <div className="h-40 animate-pulse rounded-2xl bg-line" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div role="alert" className="rounded-2xl border border-line bg-surface p-6 text-center">
        <p className="font-heading font-semibold text-ink">{error}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            load();
          }}
          className="mt-4 min-h-[44px] rounded-xl bg-matcha px-6 font-semibold text-space-navy"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { order, items, review, whatsapp } = data;
  const isClosed = order.status === "cancelled" || order.status === "expired";
  const waText = encodeURIComponent(`Halo Space Coffee, saya mau tanya pesanan ${order.code} atas nama ${order.customerName}.`);

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-line bg-surface p-4">
        <p className="text-sm text-muted">Kode pesanan</p>
        <h1 className="font-heading text-2xl font-bold text-ink">{order.code}</h1>
        <p className="mt-1 text-sm text-muted">
          Atas nama {order.customerName} · {formatTime(order.createdAt)}
        </p>
      </header>

      <section aria-live="polite" className="rounded-2xl border border-line bg-surface p-4">
        {isClosed ? (
          <p className="rounded-xl bg-line p-3 font-semibold text-danger">
            {getEstimate(order.status)}
          </p>
        ) : (
          <>
            <StatusStepper status={order.status} />
            <p className="mt-5 rounded-xl bg-matcha-soft p-3 text-sm text-ink">
              {getEstimate(order.status)}
            </p>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-surface p-4">
        <h2 className="font-heading font-semibold text-ink">Ringkasan pesanan</h2>
        <ul className="mt-3 divide-y divide-line">
          {items.map((it, i) => (
            <li key={i} className="flex justify-between gap-3 py-2 text-sm">
              <div>
                <p className="font-medium text-ink">
                  {it.qty}x {it.name}
                  {it.size ? ` (${sizeLabel(it.size)})` : ""}
                </p>
                {it.toppings.length > 0 && (
                  <p className="text-muted">+ {it.toppings.join(", ")}</p>
                )}
                {it.note && <p className="text-muted">Catatan: {it.note}</p>}
              </div>
              <p className="shrink-0 text-ink">{formatRp(it.price * it.qty)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-line pt-3 font-semibold text-ink">
          <span>Total</span>
          <span>{formatRp(order.total)}</span>
        </div>
      </section>

      {order.status === "completed" && (
        <ReviewForm code={order.code} existing={review} onSaved={load} />
      )}

      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-matcha bg-surface px-4 font-semibold text-ink"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Hubungi Kedai
        </a>
      )}
    </div>
  );
}
