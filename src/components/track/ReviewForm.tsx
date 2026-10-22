"use client";

import { useState } from "react";
import { Star } from "lucide-react";

type Props = {
  code: string;
  existing: { rating: number; comment: string | null } | null;
  onSaved: () => void;
};

export function ReviewForm({ code, existing, onSaved }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (existing) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-4">
        <p className="font-heading font-semibold text-ink">Terima kasih atas ratingmu!</p>
        <div className="mt-2 flex gap-1" aria-label={`Rating ${existing.rating} dari 5`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={`h-5 w-5 ${
                n <= existing.rating ? "fill-star-gold text-star-gold" : "text-line"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
        {existing.comment && <p className="mt-2 text-sm text-muted">{existing.comment}</p>}
      </div>
    );
  }

  async function handleSubmit() {
    if (rating < 1) {
      setError("Pilih rating 1-5 bintang dulu ya.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/track/${code}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Gagal menyimpan rating.");
        return;
      }
      onSaved();
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <h2 className="font-heading font-semibold text-ink">Bagaimana pesananmu?</h2>

      <div role="radiogroup" aria-label="Rating bintang" className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} bintang`}
            onClick={() => setRating(n)}
            className="flex h-11 w-11 items-center justify-center rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-matcha"
          >
            <Star
              className={`h-7 w-7 ${
                n <= rating ? "fill-star-gold text-star-gold" : "text-line"
              }`}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>

      <label htmlFor="review-comment" className="mt-3 block text-sm font-medium text-ink">
        Komentar (opsional)
      </label>
      <textarea
        id="review-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        rows={3}
        className="mt-1 w-full rounded-xl border border-line bg-surface p-3 text-base text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-matcha"
        placeholder="Ceritakan pengalamanmu"
      />

      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-3 min-h-[44px] w-full rounded-xl bg-matcha px-4 font-semibold text-space-navy disabled:opacity-60"
      >
        {submitting ? "Menyimpan..." : "Kirim Rating"}
      </button>
    </div>
  );
}