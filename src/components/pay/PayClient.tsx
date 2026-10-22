"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export type PayItem = {
  name: string;
  size: "REG" | "LRG" | null;
  qty: number;
  price: number;
  toppings: string[];
};

type Props = {
  code: string;
  customerName: string;
  total: number;
  items: PayItem[];
};

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: () => void;
          onPending?: () => void;
          onError?: () => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const METHODS = ["QRIS", "GoPay", "Transfer Bank"] as const;
const SNAP_SRC = "https://app.sandbox.midtrans.com/snap/snap.js";

function loadSnapScript(clientKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.snap) return resolve();
    let script = document.getElementById("midtrans-snap") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "midtrans-snap";
      script.src = SNAP_SRC;
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("snap load failed")));
  });
}

export default function PayClient({ code, customerName, total, items }: Props) {
  const router = useRouter();
  const mode = process.env.NEXT_PUBLIC_PAYMENT_MODE === "sandbox" ? "sandbox" : "demo";

  const [demoOpen, setDemoOpen] = useState(false);
  const [method, setMethod] = useState<(typeof METHODS)[number]>("QRIS");
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // While waiting, re-fetch the server page; it redirects to /track when status changes
  useEffect(() => {
    if (!waiting) return;
    const id = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(id);
  }, [waiting, router]);

  // Close demo modal with Escape
  useEffect(() => {
    if (!demoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDemoOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [demoOpen]);

  async function handlePay() {
    setError(null);
    if (mode === "demo") {
      setDemoOpen(true);
      return;
    }

    setLoading(true);
    try {
      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
      if (!clientKey) throw new Error("missing client key");

      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !json.token) throw new Error(json.error ?? "create failed");

      await loadSnapScript(clientKey);
      window.snap?.pay(json.token, {
        onSuccess: () => setWaiting(true),
        onPending: () => setWaiting(true),
        onError: () => setError("Pembayaran gagal. Silakan coba lagi."),
        onClose: () => setLoading(false),
      });
    } catch {
      setError("Tidak bisa membuka pembayaran. Periksa koneksi lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function handleDemoPaid() {
    setDemoOpen(false);
    setWaiting(true);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-sm text-muted">Kode pesanan</p>
        <h1 className="font-heading text-2xl font-semibold text-space-navy">{code}</h1>
        <p className="mt-1 text-sm text-muted">Atas nama {customerName}</p>

        <ul className="mt-4 divide-y divide-line">
          {items.map((item, idx) => (
            <li key={idx} className="flex justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium text-ink">
                  {item.name}
                  {item.size ? ` (${item.size})` : ""} x {item.qty}
                </p>
                {item.toppings.length > 0 && (
                  <p className="text-sm text-muted">+ {item.toppings.join(", ")}</p>
                )}
              </div>
              <p className="shrink-0 text-ink">{rupiah.format(item.price * item.qty)}</p>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex items-center justify-between border-t border-line pt-4">
          <span className="font-medium text-ink">Total</span>
          <span className="font-heading text-xl font-semibold text-space-navy">
            {rupiah.format(total)}
          </span>
        </div>
      </div>

      {waiting ? (
        <div
          role="status"
          className="rounded-2xl border border-line bg-matcha-soft p-5 text-center"
        >
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-space-navy" aria-hidden="true" />
          <p className="mt-2 font-semibold text-space-navy">Menunggu konfirmasi pembayaran</p>
          <p className="mt-1 text-sm text-muted">
            Halaman ini akan berpindah otomatis setelah kasir mengonfirmasi.
          </p>
        </div>
      ) : (
        <>
          {error && (
            <p role="alert" className="rounded-xl border border-danger/40 bg-surface p-3 text-sm text-danger">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handlePay}
            disabled={loading}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-matcha px-5 font-semibold text-space-navy disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Bayar {rupiah.format(total)}
          </button>
          {mode === "demo" && (
            <p className="text-center text-xs text-muted">
              Mode demo: tidak ada uang sungguhan yang diproses.
            </p>
          )}
        </>
      )}

      {demoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-space-navy/40 p-0 md:items-center md:p-4"
          onClick={() => setDemoOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-pay-title"
            className="w-full max-w-md rounded-t-2xl bg-surface p-5 md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="demo-pay-title" className="font-heading text-lg font-semibold text-space-navy">
              Pilih metode pembayaran
            </h2>
            <p className="text-sm text-muted">Simulasi tampilan Snap (data demo/fiktif)</p>

            <div className="mt-4 space-y-2" role="radiogroup" aria-label="Metode pembayaran">
              {METHODS.map((m) => (
                <label
                  key={m}
                  className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border px-4 ${
                    method === m ? "border-matcha bg-matcha-soft" : "border-line"
                  }`}
                >
                  <input
                    type="radio"
                    name="demo-method"
                    value={m}
                    checked={method === m}
                    onChange={() => setMethod(m)}
                    className="accent-[#6E9B3F]"
                  />
                  <span className="text-ink">{m}</span>
                </label>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-ink">
              <span>Total</span>
              <span className="font-semibold">{rupiah.format(total)}</span>
            </div>

            <button
              type="button"
              onClick={handleDemoPaid}
              className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-matcha px-5 font-semibold text-space-navy"
            >
              Saya sudah bayar
            </button>
            <button
              type="button"
              onClick={() => setDemoOpen(false)}
              className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl px-5 text-muted"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}