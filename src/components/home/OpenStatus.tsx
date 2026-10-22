"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { PromoBanner } from "@/components/home/PromoBanner";

type Range = { open: string; close: string };

const DEFAULT_RANGE: Range = { open: "10:00", close: "22:00" };

// Keys tried for each weekday (0 = Sunday), in order
const DAY_KEYS = [
  ["sun", "sunday", "minggu"],
  ["mon", "monday", "senin"],
  ["tue", "tuesday", "selasa"],
  ["wed", "wednesday", "rabu"],
  ["thu", "thursday", "kamis"],
  ["fri", "friday", "jumat"],
  ["sat", "saturday", "sabtu"],
];

function pad(value: string) {
  return value.length === 1 ? `0${value}` : value;
}

function parseRange(value: unknown): Range | null {
  if (typeof value === "string") {
    const match = value.match(/(\d{1,2})[.:](\d{2})\s*[-–—]\s*(\d{1,2})[.:](\d{2})/);
    if (!match) return null;
    return {
      open: `${pad(match[1])}:${match[2]}`,
      close: `${pad(match[3])}:${match[4]}`,
    };
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.open === "string" && typeof obj.close === "string") {
      return parseRange(`${obj.open}-${obj.close}`);
    }
  }
  return null;
}

function resolveRange(value: unknown, dayIndex: number): Range {
  const direct = parseRange(value);
  if (direct) return direct;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const lowered: Record<string, unknown> = {};
    Object.keys(obj).forEach((k) => (lowered[k.toLowerCase()] = obj[k]));
    for (const key of DAY_KEYS[dayIndex]) {
      const found = parseRange(lowered[key]);
      if (found) return found;
    }
  }
  return DEFAULT_RANGE;
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getJakartaNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return {
    dayIndex: dayIndex < 0 ? 0 : dayIndex,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

function formatTime(time: string) {
  return time.replace(":", ".");
}

export function OpenStatus({ hours }: { hours: unknown }) {
  const [state, setState] = useState<{ isOpen: boolean; range: Range } | null>(null);

  useEffect(() => {
    function update() {
      const { dayIndex, minutes } = getJakartaNow();
      const range = resolveRange(hours, dayIndex);
      const isOpen = minutes >= toMinutes(range.open) && minutes < toMinutes(range.close);
      setState({ isOpen, range });
    }
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [hours]);

  if (!state) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted" aria-busy="true">
        <Clock className="h-4 w-4" aria-hidden="true" />
        <span>Memuat jam buka...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-ink">
      <Clock className="h-4 w-4 text-muted" aria-hidden="true" />
      <span
        className={
          state.isOpen
            ? "rounded-full bg-matcha-soft px-2.5 py-0.5 font-semibold text-ink"
            : "rounded-full border border-line px-2.5 py-0.5 font-semibold text-muted"
        }
      >
        {state.isOpen ? "Buka" : "Tutup"}
      </span>
      <span className="text-muted">
        {state.isOpen
          ? `sampai ${formatTime(state.range.close)} WIB`
          : `buka ${formatTime(state.range.open)} WIB`}
      </span>
    </div>
  );
}