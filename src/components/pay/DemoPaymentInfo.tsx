"use client";

import { useMemo } from "react";

type Props = {
  method: string; // e.g. "QRIS", "GoPay", "Transfer Bank" (case-insensitive)
  code: string; // order code, used as seed so the pattern is stable
  total: number;
};

const SIZE = 25;

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

// Small seeded PRNG so each order code gets the same fake pattern
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function inFinder(x: number, y: number) {
  const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
  return inBox(0, 0) || inBox(SIZE - 7, 0) || inBox(0, SIZE - 7);
}

function finderCell(x: number, y: number) {
  const local = (ox: number, oy: number) => {
    const lx = x - ox;
    const ly = y - oy;
    if (lx < 0 || ly < 0 || lx > 6 || ly > 6) return null;
    const ring = Math.max(Math.abs(lx - 3), Math.abs(ly - 3));
    return ring === 3 || ring <= 1; // outer ring + center 3x3
  };
  return local(0, 0) ?? local(SIZE - 7, 0) ?? local(0, SIZE - 7) ?? false;
}

function FakeQr({ code }: { code: string }) {
  const cells = useMemo(() => {
    const rand = mulberry32(hash(code));
    const out: { x: number; y: number }[] = [];
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        if (inFinder(x, y)) {
          if (finderCell(x, y)) out.push({ x, y });
        } else if (rand() > 0.52) {
          out.push({ x, y });
        }
      }
    }
    return out;
  }, [code]);

  return (
    // Inline white background on purpose: a QR must stay white-on-dark in both themes
    <div
      className="mx-auto w-fit rounded-xl p-3"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <svg
        viewBox={`-2 -2 ${SIZE + 4} ${SIZE + 4}`}
        className="h-44 w-44"
        role="img"
        aria-label="Contoh kode QRIS untuk demo, tidak dapat dipindai"
        shapeRendering="crispEdges"
      >
        <rect x="-2" y="-2" width={SIZE + 4} height={SIZE + 4} fill="#FFFFFF" />
        {cells.map((c) => (
          <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width="1" height="1" fill="#0F1B3D" />
        ))}
      </svg>
    </div>
  );
}

export default function DemoPaymentInfo({ method, code, total }: Props) {
  const m = method.toLowerCase();

  if (m.includes("qris")) {
    return (
      <div className="rounded-xl border border-line bg-surface p-4 text-center">
        <FakeQr code={code} />
        <p className="mt-3 text-sm font-medium text-ink">Scan QR di atas lewat aplikasi pembayaranmu</p>
        <p className="mt-1 text-sm text-muted">
          Contoh tampilan QRIS (data demo/fiktif). QR ini tidak bisa dipindai.
        </p>
        <p className="mt-2 font-heading text-lg text-space-navy">{rupiah(total)}</p>
      </div>
    );
  }

  if (m.includes("gopay")) {
    return (
      <div className="rounded-xl border border-line bg-surface p-4 text-center">
        <p className="text-sm font-medium text-ink">Buka aplikasi GoPay lalu setujui pembayaran</p>
        <p className="mt-1 text-sm text-muted">Contoh tampilan saja (data demo/fiktif).</p>
        <p className="mt-2 font-heading text-lg text-space-navy">{rupiah(total)}</p>
      </div>
    );
  }

  // Bank transfer: fake virtual account derived from the order code
  const va = `8808${String(hash(code)).padStart(10, "0").slice(0, 10)}`;
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-sm text-muted">Nomor Virtual Account (demo)</p>
      <p className="mt-1 font-heading text-xl tracking-wider text-space-navy">{va}</p>
      <p className="mt-2 text-sm text-muted">
        Contoh tampilan saja (data demo/fiktif). Nomor ini tidak valid.
      </p>
      <p className="mt-2 font-heading text-lg text-space-navy">{rupiah(total)}</p>
    </div>
  );
}