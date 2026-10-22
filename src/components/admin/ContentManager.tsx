"use client";

import { useState } from "react";

export type FaqRow = { id: string; question: string; answer: string; sort_order: number };

const SECTIONS: { key: string; label: string; hint: string }[] = [
  { key: "hero", label: "Hero Beranda", hint: "Judul, subjudul, teks tombol." },
  { key: "promo", label: "Promo", hint: "Banner promo. Nonaktifkan lewat field aktif bila ada." },
  { key: "about", label: "Tentang Kami", hint: "Cerita brand, visi, misi." },
  { key: "opening_hours", label: "Jam Buka", hint: "Jam per hari." },
  { key: "contact", label: "Kontak", hint: "Alamat, WhatsApp, dan lainnya." },
  { key: "social", label: "Sosial Media", hint: "Link Instagram dan lainnya." },
];

type Props = {
  initialContent: Record<string, unknown>;
  initialFaqs: FaqRow[];
};

const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-matcha";
const primaryBtn =
  "min-h-[44px] rounded-xl bg-matcha px-4 text-sm font-semibold text-space-navy disabled:opacity-60";
const ghostBtn =
  "min-h-[44px] rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink disabled:opacity-60";

export default function ContentManager({ initialContent, initialFaqs }: Props) {
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      SECTIONS.map((s) => [s.key, JSON.stringify(initialContent[s.key] ?? {}, null, 2)])
    )
  );
  const [messages, setMessages] = useState<Record<string, { ok: boolean; text: string }>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const [faqs, setFaqs] = useState<FaqRow[]>(initialFaqs);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "", sort_order: initialFaqs.length + 1 });

  function setMessage(id: string, ok: boolean, text: string) {
    setMessages((m) => ({ ...m, [id]: { ok, text } }));
  }

  async function saveSection(key: string) {
    let value: unknown;
    try {
      value = JSON.parse(drafts[key]);
    } catch {
      setMessage(key, false, "Format JSON belum benar. Cek tanda kutip dan koma.");
      return;
    }
    setBusy(key);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json().catch(() => ({}));
      setMessage(key, res.ok, res.ok ? "Tersimpan." : data.error ?? "Gagal menyimpan.");
    } catch {
      setMessage(key, false, "Koneksi bermasalah. Coba lagi.");
    } finally {
      setBusy(null);
    }
  }

  async function addFaq() {
    setBusy("faq-new");
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFaq),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.faq) {
        setFaqs((list) => [...list, data.faq as FaqRow].sort((a, b) => a.sort_order - b.sort_order));
        setNewFaq({ question: "", answer: "", sort_order: faqs.length + 2 });
        setMessage("faq-new", true, "FAQ ditambahkan.");
      } else {
        setMessage("faq-new", false, data.error ?? "Gagal menambah FAQ.");
      }
    } catch {
      setMessage("faq-new", false, "Koneksi bermasalah. Coba lagi.");
    } finally {
      setBusy(null);
    }
  }

  async function saveFaq(faq: FaqRow) {
    setBusy(faq.id);
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faq),
      });
      const data = await res.json().catch(() => ({}));
      setMessage(faq.id, res.ok, res.ok ? "Tersimpan." : data.error ?? "Gagal menyimpan.");
    } catch {
      setMessage(faq.id, false, "Koneksi bermasalah. Coba lagi.");
    } finally {
      setBusy(null);
    }
  }

  async function deleteFaq(id: string) {
    if (!window.confirm("Hapus FAQ ini?")) return;
    setBusy(id);
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setFaqs((list) => list.filter((f) => f.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(id, false, data.error ?? "Gagal menghapus.");
      }
    } catch {
      setMessage(id, false, "Koneksi bermasalah. Coba lagi.");
    } finally {
      setBusy(null);
    }
  }

  function updateFaq(id: string, patch: Partial<FaqRow>) {
    setFaqs((list) => list.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function Feedback({ id }: { id: string }) {
    const m = messages[id];
    if (!m) return null;
    return (
      <p role="status" className={"text-sm " + (m.ok ? "text-ink" : "text-danger")}>
        {m.text}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-ink">Konten Halaman</h2>
        {SECTIONS.map((s) => (
          <div key={s.key} className="space-y-2 rounded-2xl border border-line bg-surface p-4">
            <label htmlFor={`content-${s.key}`} className="block font-heading text-base font-semibold text-ink">
              {s.label}
            </label>
            <p className="text-sm text-muted">{s.hint}</p>
            <textarea
              id={`content-${s.key}`}
              rows={8}
              spellCheck={false}
              value={drafts[s.key]}
              onChange={(e) => setDrafts((d) => ({ ...d, [s.key]: e.target.value }))}
              className={inputClass + " font-mono"}
            />
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className={primaryBtn} disabled={busy !== null} onClick={() => saveSection(s.key)}>
                {busy === s.key ? "Menyimpan..." : "Simpan"}
              </button>
              <Feedback id={s.key} />
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-ink">FAQ</h2>

        {faqs.length === 0 && <p className="text-sm text-muted">Belum ada FAQ. Tambahkan di bawah.</p>}

        {faqs.map((f) => (
          <div key={f.id} className="space-y-2 rounded-2xl border border-line bg-surface p-4">
            <label className="block text-sm font-semibold text-ink" htmlFor={`q-${f.id}`}>
              Pertanyaan
            </label>
            <input
              id={`q-${f.id}`}
              className={inputClass}
              value={f.question}
              onChange={(e) => updateFaq(f.id, { question: e.target.value })}
            />
            <label className="block text-sm font-semibold text-ink" htmlFor={`a-${f.id}`}>
              Jawaban
            </label>
            <textarea
              id={`a-${f.id}`}
              rows={3}
              className={inputClass}
              value={f.answer}
              onChange={(e) => updateFaq(f.id, { answer: e.target.value })}
            />
            <label className="block text-sm font-semibold text-ink" htmlFor={`o-${f.id}`}>
              Urutan
            </label>
            <input
              id={`o-${f.id}`}
              type="number"
              min={0}
              className={inputClass + " max-w-[120px]"}
              value={f.sort_order}
              onChange={(e) => updateFaq(f.id, { sort_order: Number(e.target.value) || 0 })}
            />
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className={primaryBtn} disabled={busy !== null} onClick={() => saveFaq(f)}>
                {busy === f.id ? "Menyimpan..." : "Simpan"}
              </button>
              <button type="button" className={ghostBtn} disabled={busy !== null} onClick={() => deleteFaq(f.id)}>
                Hapus
              </button>
              <Feedback id={f.id} />
            </div>
          </div>
        ))}

        <div className="space-y-2 rounded-2xl border border-dashed border-line bg-surface p-4">
          <h3 className="font-heading text-base font-semibold text-ink">Tambah FAQ</h3>
          <label className="block text-sm font-semibold text-ink" htmlFor="faq-new-q">
            Pertanyaan
          </label>
          <input
            id="faq-new-q"
            className={inputClass}
            value={newFaq.question}
            onChange={(e) => setNewFaq((n) => ({ ...n, question: e.target.value }))}
          />
          <label className="block text-sm font-semibold text-ink" htmlFor="faq-new-a">
            Jawaban
          </label>
          <textarea
            id="faq-new-a"
            rows={3}
            className={inputClass}
            value={newFaq.answer}
            onChange={(e) => setNewFaq((n) => ({ ...n, answer: e.target.value }))}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className={primaryBtn} disabled={busy !== null} onClick={addFaq}>
              {busy === "faq-new" ? "Menambah..." : "Tambah FAQ"}
            </button>
            <Feedback id="faq-new" />
          </div>
        </div>
      </section>
    </div>
  );
}