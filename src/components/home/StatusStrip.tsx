"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin } from "lucide-react";

type Props = {
  open: string; // "10:00"
  close: string; // "22:00"
  daysLabel: string; // e.g. "Setiap hari"
  place: string; // e.g. "Plaza Ono Sidareja"
  detail: string; // e.g. "Lantai 3"
};

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
};

// Current minutes since midnight in Asia/Jakarta
function jakartaMinutes() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

export default function StatusStrip({ open, close, daysLabel, place, detail }: Props) {
  const [minutes, setMinutes] = useState<number | null>(null);

  // Compute on the client so the status is never stale from caching
  useEffect(() => {
    setMinutes(jakartaMinutes());
    const id = setInterval(() => setMinutes(jakartaMinutes()), 60000);
    return () => clearInterval(id);
  }, []);

  const isOpen =
    minutes !== null && minutes >= toMinutes(open) && minutes < toMinutes(close);
  const fmt = (t: string) => t.replace(":", ".");

  let label = "Memeriksa jam…";
  let sub = "Zona waktu WIB (Asia/Jakarta)";
  if (minutes !== null) {
    if (isOpen) {
      label = "Sedang buka";
      sub = `Tutup pukul ${fmt(close)} WIB`;
    } else {
      label = "Sedang tutup";
      sub = minutes < toMinutes(open) ? `Buka hari ini pukul ${fmt(open)} WIB` : `Buka lagi besok pukul ${fmt(open)} WIB`;
    }
  }

  return (
    <div
      role="status"
      className="mx-auto grid max-w-[1200px] overflow-hidden rounded-2xl border border-line bg-surface md:grid-cols-3"
    >
      <div className="flex items-center gap-3 border-b border-line p-4 md:border-b-0 md:border-r">
        <span
          aria-hidden="true"
          className={`h-2.5 w-2.5 shrink-0 rounded-full ring-4 ${
            isOpen ? "bg-matcha ring-matcha/25" : "bg-danger ring-danger/25"
          }`}
        />
        <div className="min-w-0">
          <p className="font-heading text-[15px] font-semibold text-ink">{label}</p>
          <p className="text-sm text-muted">{sub}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b border-line p-4 md:border-b-0 md:border-r">
        <Clock className="h-5 w-5 shrink-0 text-matcha" aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-heading text-[15px] font-semibold text-ink">
            {fmt(open)} – {fmt(close)}
          </p>
          <p className="text-sm text-muted">{daysLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4">
        <MapPin className="h-5 w-5 shrink-0 text-matcha" aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-heading text-[15px] font-semibold text-ink">{detail}</p>
          <p className="truncate text-sm text-muted">{place}</p>
        </div>
      </div>
    </div>
  );
}