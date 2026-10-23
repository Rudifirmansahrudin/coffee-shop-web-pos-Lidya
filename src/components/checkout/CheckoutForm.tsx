"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { sizeLabel } from "@/lib/size-label";
import { orderSchema } from "@/lib/validators/order";

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const inputClass =
  "min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 text-base text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-matcha";

export default function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);

  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Wait for persisted cart to hydrate to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const total = items.reduce((sum, it) => sum + it.unitPrice * it.qty, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setServerError("");

    // Client sends only ids, size, qty and note. Server recalculates prices.
    const payload = {
      customerName: name,
      customerPhone: phone,
      note,
      consent,
      items: items.map((it) => ({
        productId: it.productId,
        size: it.size,
        toppingIds: it.toppings.map((t) => t.id),
        qty: it.qty,
        note: it.note || undefined,
      })),
    };

    const result = orderSchema.safeParse(payload);
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setServerError(data.error ?? "Terjadi kesalahan. Coba lagi.");
        setSubmitting(false);
        return;
      }

      clear();
      router.push(`/pay/${data.code}`);
    } catch {
      setServerError("Koneksi bermasalah. Periksa internetmu lalu coba lagi.");
      setSubmitting(false);
    }
  }

  if (!mounted) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <div className="h-8 w-40 animate-pulse rounded-xl bg-line" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-line" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1200px] flex-col items-center px-4 py-16 text-center">
        <p className="font-heading text-xl text-space-navy">
          Keranjangmu masih hampa udara.
        </p>
        <p className="mt-2 text-muted">Pilih minuman dulu sebelum checkout.</p>
        <Link
          href="/menu"
          className="mt-6 inline-flex min-h-[44px] items-center rounded-xl bg-matcha px-6 font-semibold text-space-navy"
        >
          Lihat Menu
        </Link>
      </div>
    );
  }

  const summaryList = (
    <ul className="divide-y divide-line">
      {items.map((it) => (
        <li key={it.key} className="flex justify-between gap-3 py-3 text-sm">
          <div className="min-w-0">
            <p className="font-medium text-ink">
              {it.qty}x {it.name} ({sizeLabel(it.size)})
            </p>
            {it.toppings.length > 0 && (
              <p className="text-muted">+ {it.toppings.map((t) => t.name).join(", ")}</p>
            )}
            {it.note && <p className="text-muted">Catatan: {it.note}</p>}
          </div>
          <p className="shrink-0 text-ink">{rupiah(it.unitPrice * it.qty)}</p>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 lg:py-10">
      <h1 className="font-heading text-2xl text-space-navy">Checkout</h1>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Mobile: collapsible summary */}
        <details className="rounded-2xl border border-line bg-surface p-4 lg:hidden">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between">
            <span className="font-medium text-ink">
              Ringkasan pesanan ({items.length} item)
            </span>
            <span className="flex items-center gap-2 font-semibold text-space-navy">
              {rupiah(total)}
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </span>
          </summary>
          <div className="mt-2">{summaryList}</div>
        </details>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 rounded-2xl border border-line bg-surface p-4 sm:p-6 lg:col-start-1 lg:row-start-1"
        >
          <div>
            <label htmlFor="customerName" className="mb-1 block text-sm font-medium text-ink">
              Nama panggilan <span className="text-danger">*</span>
            </label>
            <input
              id="customerName"
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="nickname"
              maxLength={40}
              aria-invalid={!!errors.customerName}
              aria-describedby={errors.customerName ? "err-name" : "hint-name"}
              placeholder="Contoh: For Her"
            />
            <p id="hint-name" className="mt-1 text-sm text-muted">
              Dipakai untuk memanggilmu saat pesanan siap diambil.
            </p>
            {errors.customerName && (
              <p id="err-name" className="mt-1 text-sm text-danger">{errors.customerName}</p>
            )}
          </div>

          <div>
            <label htmlFor="customerPhone" className="mb-1 block text-sm font-medium text-ink">
              WhatsApp (opsional)
            </label>
            <input
              id="customerPhone"
              type="tel"
              inputMode="tel"
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              aria-invalid={!!errors.customerPhone}
              aria-describedby="hint-phone"
              placeholder="081234567890"
            />
            <p id="hint-phone" className="mt-1 text-sm text-muted">
              Dipakai hanya bila kedai perlu menghubungimu soal pesanan.
            </p>
            {errors.customerPhone && (
              <p className="mt-1 text-sm text-danger">{errors.customerPhone}</p>
            )}
          </div>

          <div>
            <label htmlFor="note" className="mb-1 block text-sm font-medium text-ink">
              Catatan (opsional)
            </label>
            <textarea
              id="note"
              rows={3}
              className={`${inputClass} py-2`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              placeholder="Contoh: less sugar"
            />
            {errors.note && <p className="mt-1 text-sm text-danger">{errors.note}</p>}
          </div>

          <div>
            <label className="flex min-h-[44px] cursor-pointer items-start gap-3 py-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-matcha"
                aria-invalid={!!errors.consent}
              />
              <span>
                Saya menyetujui{" "}
                <Link
                  href="/privasi"
                  target="_blank"
                  className="font-medium text-space-navy underline"
                >
                  Kebijakan Privasi
                </Link>{" "}
                dan pemrosesan data pesanan saya.
              </span>
            </label>
            {errors.consent && <p className="text-sm text-danger">{errors.consent}</p>}
          </div>

          {errors.items && <p className="text-sm text-danger">{errors.items}</p>}
          {serverError && (
            <p role="alert" className="rounded-xl bg-cream p-3 text-sm text-danger">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-matcha px-6 font-semibold text-space-navy disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {submitting ? "Memproses..." : `Buat Pesanan • ${rupiah(total)}`}
          </button>
          <p className="text-center text-xs text-muted">
            Total final dihitung ulang oleh sistem dari harga terbaru.
          </p>
        </form>

        {/* Desktop: sticky summary */}
        <aside className="hidden lg:col-start-2 lg:row-start-1 lg:block">
          <div className="sticky top-24 rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-heading text-lg text-space-navy">Ringkasan pesanan</h2>
            <div className="mt-2">{summaryList}</div>
            <div className="mt-3 flex justify-between border-t border-line pt-3 font-semibold text-space-navy">
              <span>Total</span>
              <span>{rupiah(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}