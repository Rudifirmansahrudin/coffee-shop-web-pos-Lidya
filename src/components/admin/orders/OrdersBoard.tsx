"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Loader2, RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/space/EmptyState";
import { OrderCard } from "@/components/admin/orders/OrderCard";
import {
  ACTIVE_STATUSES,
  COLUMN_TITLE,
  type ActiveStatus,
  type AdminOrder,
  type AdminRole,
  type OrderAction,
} from "@/lib/admin-orders";

type Props = {
  initialOrders: AdminOrder[];
  role: AdminRole;
  initialError: boolean;
};

type Message = { type: "error" | "ok"; text: string } | null;
type Filter = ActiveStatus | "all";

export function OrdersBoard({ initialOrders, role, initialError }: Props) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [filter, setFilter] = useState<Filter>("all");
  const [highlight, setHighlight] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [live, setLive] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [message, setMessage] = useState<Message>(
    initialError ? { type: "error", text: "Gagal memuat pesanan. Tekan Muat ulang." } : null
  );

  // id -> status of the last known list, used to detect new/changed orders
  const snapshot = useRef<Map<string, string>>(new Map(initialOrders.map((o) => [o.id, o.status])));

  const applyOrders = useCallback((next: AdminOrder[]) => {
    const changed: string[] = [];
    for (const o of next) {
      if (snapshot.current.get(o.id) !== o.status) changed.push(o.id);
    }
    snapshot.current = new Map(next.map((o) => [o.id, o.status]));
    setOrders(next);

    if (changed.length > 0) {
      setHighlight((prev) => Array.from(new Set(prev.concat(changed))));
      setTimeout(() => {
        setHighlight((prev) => prev.filter((id) => !changed.includes(id)));
      }, 3000);
    }
  }, []);

  const refetch = useCallback(
    async (silent = true) => {
      if (!silent) setRefreshing(true);
      try {
        const res = await fetch("/api/admin/orders", { cache: "no-store" });
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        if (!res.ok) throw new Error("fetch failed");
        const json = (await res.json()) as { orders: AdminOrder[] };
        applyOrders(json.orders);
        if (!silent) setMessage(null);
      } catch {
        if (!silent) setMessage({ type: "error", text: "Gagal memuat pesanan. Coba lagi." });
      } finally {
        if (!silent) setRefreshing(false);
      }
    },
    [applyOrders]
  );

  // Clock for relative times
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  // Realtime: listen to the public broadcast channel "admin:orders" (fed by the SQL trigger)
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    let timer: ReturnType<typeof setTimeout> | undefined;

    const channel = client
      .channel("admin:orders")
      .on("broadcast", { event: "*" }, () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => void refetch(), 300);
      })
      .subscribe((status) => {
        setLive(status === "SUBSCRIBED");
      });

    return () => {
      if (timer) clearTimeout(timer);
      void client.removeChannel(channel);
    };
  }, [refetch]);

  // Backup polling: fast when realtime is down, slow safety net when it is up
  useEffect(() => {
    const id = setInterval(
      () => {
        if (document.visibilityState === "visible") void refetch();
      },
      live ? 30000 : 8000
    );
    return () => clearInterval(id);
  }, [live, refetch]);

  async function runAction(order: AdminOrder, action: OrderAction) {
    if (action === "cancelled" && !window.confirm(`Batalkan pesanan ${order.code}?`)) return;

    setBusyId(order.id);
    setMessage(null);
    try {
      const res =
        action === "confirm"
          ? await fetch("/api/admin/confirm-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: order.code, orderId: order.id }),
            })
          : await fetch(`/api/admin/orders/${order.id}/status`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action }),
            });

      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMessage({ type: "error", text: json.error ?? "Aksi gagal. Coba lagi." });
      }
      await refetch();
    } catch {
      setMessage({ type: "error", text: "Koneksi bermasalah. Coba lagi." });
    } finally {
      setBusyId(null);
    }
  }

  async function seedOrders() {
    setSeeding(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/seed-orders", { method: "POST" });
      const json = (await res.json().catch(() => ({}))) as { error?: string; created?: string[] };
      if (!res.ok) {
        setMessage({ type: "error", text: json.error ?? "Gagal membuat order dummy." });
      } else {
        setMessage({ type: "ok", text: `${json.created?.length ?? 0} order dummy dibuat.` });
      }
      await refetch();
    } catch {
      setMessage({ type: "error", text: "Koneksi bermasalah. Coba lagi." });
    } finally {
      setSeeding(false);
    }
  }

  const byStatus = useMemo(() => {
    const map: Record<ActiveStatus, AdminOrder[]> = {
      pending_payment: [],
      paid: [],
      preparing: [],
      ready: [],
    };
    for (const o of orders) {
      if (o.status in map) map[o.status as ActiveStatus].push(o);
    }
    return map;
  }, [orders]);

  const mobileList = filter === "all" ? orders : byStatus[filter];

  function renderCard(order: AdminOrder) {
    return (
      <OrderCard
        key={order.id}
        order={order}
        role={role}
        now={now}
        highlighted={highlight.includes(order.id)}
        busy={busyId === order.id}
        onAction={runAction}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          <span
            className={`mr-2 inline-block h-2 w-2 rounded-full ${live ? "bg-matcha" : "bg-star-gold"}`}
            aria-hidden
          />
          {live ? "Realtime aktif" : "Mode polling (cek tiap 8 detik)"}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void refetch(false)}
            disabled={refreshing}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-medium text-ink hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
            Muat ulang
          </button>
          {role === "owner" && (
            <button
              type="button"
              onClick={() => void seedOrders()}
              disabled={seeding}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-matcha px-4 text-sm font-semibold text-space-navy hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy disabled:opacity-60"
            >
              {seeding ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Generate 5 order dummy
            </button>
          )}
        </div>
      </div>

      {message && (
        <div
          role={message.type === "error" ? "alert" : "status"}
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.type === "error"
              ? "border-danger/40 bg-danger/10 text-danger"
              : "border-matcha/40 bg-matcha-soft text-ink"
          }`}
        >
          {message.text}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-6">
          <EmptyState
            title="Belum ada pesanan"
            description={
              role === "owner"
                ? "Antrean kosong. Tekan “Generate 5 order dummy” untuk mencoba alurnya."
                : "Antrean kosong. Pesanan baru akan muncul di sini otomatis."
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop (lg): 4 column kanban */}
          <div className="hidden items-start gap-4 lg:grid lg:grid-cols-4">
            {ACTIVE_STATUSES.map((status) => (
              <section key={status} aria-label={COLUMN_TITLE[status]} className="rounded-2xl bg-matcha-soft/60 p-3">
                <h2 className="mb-3 flex items-center justify-between px-1 font-heading text-sm font-semibold text-space-navy">
                  {COLUMN_TITLE[status]}
                  <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">
                    {byStatus[status].length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {byStatus[status].length === 0 ? (
                    <p className="px-1 py-4 text-center text-xs text-muted">Kosong</p>
                  ) : (
                    byStatus[status].map(renderCard)
                  )}
                </div>
              </section>
            ))}
          </div>

          {/* Mobile / tablet: filter + card list */}
          <div className="space-y-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter status">
              <FilterPill active={filter === "all"} onClick={() => setFilter("all")} label={`Semua (${orders.length})`} />
              {ACTIVE_STATUSES.map((status) => (
                <FilterPill
                  key={status}
                  active={filter === status}
                  onClick={() => setFilter(status)}
                  label={`${COLUMN_TITLE[status]} (${byStatus[status].length})`}
                />
              ))}
            </div>

            {mobileList.length === 0 ? (
              <p className="rounded-2xl border border-line bg-surface p-6 text-center text-sm text-muted">
                Tidak ada pesanan di status ini.
              </p>
            ) : (
              <div className="space-y-3">{mobileList.map(renderCard)}</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`min-h-[44px] shrink-0 rounded-full border px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy ${
        active ? "border-matcha bg-matcha text-space-navy" : "border-line bg-surface text-ink hover:bg-cream"
      }`}
    >
      {label}
    </button>
  );
}