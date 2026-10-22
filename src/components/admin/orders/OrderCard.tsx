"use client";

import { Loader2 } from "lucide-react";
import {
  actionsFor,
  formatClock,
  formatIDR,
  COLUMN_TITLE,
  type ActiveStatus,
  type AdminOrder,
  type AdminRole,
  type OrderAction,
} from "@/lib/admin-orders";

type Props = {
  order: AdminOrder;
  role: AdminRole;
  now: number | null;
  highlighted: boolean;
  busy: boolean;
  onAction: (order: AdminOrder, action: OrderAction) => void;
};

const BADGE: Record<ActiveStatus, string> = {
  pending_payment: "bg-star-gold/20 text-ink",
  paid: "bg-matcha-soft text-ink",
  preparing: "bg-space-navy/10 text-space-navy",
  ready: "bg-matcha text-space-navy",
};

function minutesAgo(iso: string, now: number | null): string | null {
  if (now === null) return null;
  const mins = Math.max(0, Math.floor((now - Date.parse(iso)) / 60000));
  return mins < 1 ? "baru saja" : `${mins} mnt lalu`;
}

export function OrderCard({ order, role, now, highlighted, busy, onAction }: Props) {
  const status = order.status as ActiveStatus;
  const actions = actionsFor(role, status);
  const primary = actions.find((a) => a.primary);
  const cancel = actions.find((a) => a.action === "cancelled");
  const ago = minutesAgo(order.created_at, now);

  return (
    <article
      className={`rounded-2xl border bg-surface p-4 transition-shadow duration-500 ${
        highlighted ? "border-matcha ring-2 ring-matcha" : "border-line"
      }`}
      aria-label={`Pesanan ${order.code}`}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-heading text-base font-semibold text-space-navy">{order.code}</p>
          <p className="truncate text-sm text-ink">{order.customer_name}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${BADGE[status]}`}>
            {COLUMN_TITLE[status]}
          </span>
          {order.is_dummy && (
            <span className="rounded-full border border-line px-2 py-0.5 text-[11px] font-semibold tracking-wide text-muted">
              DUMMY
            </span>
          )}
        </div>
      </header>

      <p className="mt-1 text-xs text-muted">
        {formatClock(order.created_at)} WIB{ago ? ` · ${ago}` : ""}
      </p>

      <ul className="mt-3 space-y-2 border-t border-line pt-3">
        {order.order_items.map((item) => (
          <li key={item.id} className="text-sm text-ink">
            <div className="flex items-baseline justify-between gap-2">
              <span>
                <span className="font-semibold">{item.qty}×</span> {item.name}
                {item.size ? (
                  <span className="ml-1.5 rounded-md bg-matcha-soft px-1.5 py-0.5 text-xs font-medium">
                    {item.size}
                  </span>
                ) : null}
              </span>
            </div>
            {item.toppings.length > 0 && (
              <p className="text-xs text-muted">+ {item.toppings.map((t) => t.name).join(", ")}</p>
            )}
            {item.note ? <p className="text-xs italic text-muted">“{item.note}”</p> : null}
          </li>
        ))}
      </ul>

      {order.note ? (
        <p className="mt-3 rounded-xl bg-cream px-3 py-2 text-xs text-ink">Catatan: {order.note}</p>
      ) : null}

      <p className="mt-3 text-right text-sm font-semibold text-ink">{formatIDR(order.total)}</p>

      {actions.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {primary && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onAction(order, primary.action)}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-matcha px-4 text-sm font-semibold text-space-navy transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {primary.label}
            </button>
          )}
          {cancel && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onAction(order, cancel.action)}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-line bg-surface px-4 text-sm font-medium text-danger transition-colors hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-space-navy disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancel.label}
            </button>
          )}
        </div>
      )}
    </article>
  );
}