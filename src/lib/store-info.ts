import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DayHours = { label: string; open: string | null; close: string | null };

export type StoreStatus = { isOpen: boolean; todayIndex: number; text: string };

const DAYS = [
  { label: "Senin", aliases: ["senin", "mon"] },
  { label: "Selasa", aliases: ["selasa", "tue"] },
  { label: "Rabu", aliases: ["rabu", "wed"] },
  { label: "Kamis", aliases: ["kamis", "thu"] },
  { label: "Jumat", aliases: ["jumat", "jum'at", "fri"] },
  { label: "Sabtu", aliases: ["sabtu", "sat"] },
  { label: "Minggu", aliases: ["minggu", "sun"] },
];

const DEFAULT_RANGE = { open: "10:00", close: "22:00" };

export function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

export function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function getSiteContent(keys: string[]): Promise<Record<string, unknown>> {
  const map: Record<string, unknown> = {};
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("site_content").select("key, value").in("key", keys);
    for (const row of data ?? []) map[row.key as string] = row.value;
  } catch {
    // Fall back to defaults when the database is unreachable
  }
  return map;
}

const pad = (n: string) => n.padStart(2, "0");

// Returns null when the day is closed, undefined when the value is not understood
function parseRange(v: unknown): { open: string; close: string } | null | undefined {
  if (typeof v === "string") {
    if (/tutup|libur/i.test(v)) return null;
    const m = v.match(/(\d{1,2})[.:](\d{2})\s*[-–]\s*(\d{1,2})[.:](\d{2})/);
    if (m) return { open: `${pad(m[1])}:${m[2]}`, close: `${pad(m[3])}:${m[4]}` };
    return undefined;
  }
  const o = asRecord(v);
  if (o.closed === true) return null;
  const open = asString(o.open);
  const close = asString(o.close);
  if (open && close) return { open: open.replace(".", ":"), close: close.replace(".", ":") };
  return undefined;
}

function dayIndexOf(name: string): number {
  const n = name.toLowerCase();
  return DAYS.findIndex((d) => d.aliases.some((a) => n.startsWith(a)));
}

// Always returns 7 entries, Monday first
export function parseHours(raw: unknown): DayHours[] {
  const parsed: Array<{ open: string; close: string } | null | undefined> = Array(7).fill(undefined);

  if (Array.isArray(raw)) {
    for (const item of raw) {
      const rec = asRecord(item);
      const idx = dayIndexOf(asString(rec.day) || asString(rec.label));
      if (idx >= 0) parsed[idx] = parseRange(rec.hours ?? rec);
    }
  } else {
    for (const [key, value] of Object.entries(asRecord(raw))) {
      const idx = dayIndexOf(key);
      if (idx >= 0) parsed[idx] = parseRange(value);
    }
  }

  return DAYS.map((d, i) => {
    const p = parsed[i];
    if (p === null) return { label: d.label, open: null, close: null };
    const range = p ?? DEFAULT_RANGE;
    return { label: d.label, open: range.open, close: range.close };
  });
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export function getStoreStatus(hours: DayHours[], now: Date = new Date()): StoreStatus {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const nowMin = hour * 60 + minute;

  const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayIndex = Math.max(0, order.indexOf(weekday));
  const today = hours[todayIndex];

  if (!today.open || !today.close) {
    return { isOpen: false, todayIndex, text: "Tutup hari ini" };
  }

  const openMin = toMinutes(today.open);
  const closeMin = toMinutes(today.close);
  const isOpen =
    closeMin > openMin ? nowMin >= openMin && nowMin < closeMin : nowMin >= openMin || nowMin < closeMin;

  return {
    isOpen,
    todayIndex,
    text: isOpen ? `Buka sampai ${today.close}` : `Tutup, buka pukul ${today.open}`,
  };
}

export type ContactInfo = {
  address: string;
  unit: string;
  whatsapp: string; // digits only, e.g. 62812xxxx
  mapsQuery: string;
  instagram: string;
};

export function parseContact(rawContact: unknown, rawSocial: unknown): ContactInfo {
  const c = asRecord(rawContact);
  const s = asRecord(rawSocial);

  let wa = (asString(c.whatsapp) || asString(s.whatsapp)).replace(/\D/g, "");
  if (wa.startsWith("0")) wa = `62${wa.slice(1)}`;

  return {
    address: asString(c.address) || "Plaza Ono Sidareja, Lantai 3",
    unit: asString(c.unit),
    whatsapp: wa,
    mapsQuery: asString(c.maps_query) || "Plaza Ono Sidareja",
    instagram: asString(s.instagram),
  };
}