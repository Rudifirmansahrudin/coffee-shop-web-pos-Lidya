"use client";

import { useState } from "react";

type DemoAction = {
  id: string;
  label: string;
  hint: string;
  url: string;
  body?: { action: string };
  confirmText?: string;
  danger?: boolean;
};

const ACTIONS: DemoAction[] = [
  {
    id: "seed5",
    label: "Generate 5 order dummy",
    hint: "Membuat 5 order pending untuk demo antrean.",
    url: "/api/admin/seed-orders",
  },
  {
    id: "confirm",
    label: "Konfirmasi semua pending",
    hint: "Mengubah semua order dummy pending menjadi Dibayar.",
    url: "/api/admin/demo",
    body: { action: "confirm-pending" },
  },
  {
    id: "week",
    label: "Generate data 7 hari",
    hint: "Mengisi dashboard dengan order selesai selama 7 hari.",
    url: "/api/admin/demo",
    body: { action: "seed-week" },
  },
  {
    id: "reset",
    label: "Reset data demo",
    hint: "Menghapus semua order bertanda DUMMY. Order asli aman.",
    url: "/api/admin/demo",
    body: { action: "reset" },
    confirmText: "Hapus semua data demo? Tindakan ini tidak bisa dibatalkan.",
    danger: true,
  },
];

export default function DemoPanel() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  async function run(action: DemoAction) {
    if (action.confirmText && !window.confirm(action.confirmText)) return;
    setBusyId(action.id);
    setResult(null);
    try {
      const res = await fetch(action.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action.body ?? {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult({ ok: false, text: data.error ?? "Terjadi kesalahan. Coba lagi." });
      } else {
        setResult({ ok: true, text: data.message ?? "Berhasil." });
      }
    } catch {
      setResult({ ok: false, text: "Koneksi bermasalah. Coba lagi." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <ul className="grid gap-3 md:grid-cols-2">
        {ACTIONS.map((a) => (
          <li key={a.id} className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-heading text-base font-semibold text-ink">{a.label}</p>
            <p className="mt-1 text-sm text-muted">{a.hint}</p>
            <button
              type="button"
              onClick={() => run(a)}
              disabled={busyId !== null}
              className={
                "mt-3 min-h-[44px] w-full rounded-xl px-4 text-sm font-semibold disabled:opacity-60 " +
                (a.danger
                  ? "border border-danger bg-surface text-danger"
                  : "bg-matcha text-space-navy")
              }
            >
              {busyId === a.id ? "Memproses..." : a.label}
            </button>
          </li>
        ))}
      </ul>

      {result && (
        <p
          role="status"
          className={
            "rounded-xl border px-4 py-3 text-sm " +
            (result.ok
              ? "border-matcha bg-matcha-soft text-ink"
              : "border-danger bg-surface text-danger")
          }
        >
          {result.text}
        </p>
      )}
    </div>
  );
}