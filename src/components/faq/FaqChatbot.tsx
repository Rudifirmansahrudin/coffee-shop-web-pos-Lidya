"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { SITE, WA_LINK } from "@/lib/site-config";

type Reply = {
  text: string;
  link?: { href: string; label: string; external?: boolean };
};
type Rule = { id: string; label: string; keywords: string[]; reply: Reply };
type Message = { id: number; from: "bot" | "user"; reply: Reply };

// Rule-based answers (no AI). Opening hours live in site_content, so we point to /lokasi.
const RULES: Rule[] = [
  {
    id: "order",
    label: "Cara memesan",
    keywords: ["pesan", "order", "beli", "cara", "checkout", "keranjang"],
    reply: {
      text: "Buka Menu, pilih ukuran (REG/LRG) dan topping, lalu masuk Keranjang dan Checkout. Isi nama panggilan, setujui kebijakan privasi, lalu bayar. Ambil pesanan di kasir saat namamu dipanggil.",
      link: { href: "/menu", label: "Buka Menu" },
    },
  },
  {
    id: "payment",
    label: "Cara bayar",
    keywords: ["bayar", "pembayaran", "qris", "gopay", "transfer", "midtrans"],
    reply: {
      text: "Pembayaran lewat Midtrans (QRIS, GoPay, transfer). Kami tidak menyimpan data kartu atau akun pembayaranmu. Pesanan mulai diracik setelah pembayaran terkonfirmasi. Pada mode demo, kasir yang mengonfirmasi.",
    },
  },
  {
    id: "track",
    label: "Lacak pesanan",
    keywords: ["lacak", "status", "track", "kode", "spc", "siap", "sudah jadi"],
    reply: {
      text: "Setelah checkout kamu diarahkan ke halaman pesanan dengan kode SPC-XXXX. Status berubah otomatis: Diterima, Diracik, Siap Diambil, Selesai. Simpan kodenya ya.",
    },
  },
  {
    id: "hours",
    label: "Jam buka",
    keywords: ["jam", "buka", "tutup", "operasional"],
    reply: {
      text: "Jam buka per hari ada di halaman Lokasi, lengkap dengan status Buka/Tutup saat ini.",
      link: { href: "/lokasi", label: "Lihat jam buka" },
    },
  },
  {
    id: "location",
    label: "Lokasi kedai",
    keywords: ["lokasi", "alamat", "dimana", "di mana", "mall", "plaza", "lantai", "arah"],
    reply: {
      text: `Kami ada di ${SITE.address}. Peta dan tombol Petunjuk Arah tersedia di halaman Lokasi.`,
      link: { href: "/lokasi", label: "Lihat lokasi" },
    },
  },
  {
    id: "size",
    label: "Ukuran dan topping",
    keywords: ["ukuran", "reg", "lrg", "large", "topping", "oreo", "milo", "shot", "harga"],
    reply: {
      text: "Mayoritas minuman tersedia ukuran REG dan LRG. Topping opsional: Oreo Crumb (Rp 2.000), Extra Shot (Rp 3.000), Milo (Rp 4.000). Harga akhir dihitung ulang server saat checkout.",
    },
  },
  {
    id: "soldout",
    label: "Produk habis",
    keywords: ["habis", "stok", "tersedia", "kosong"],
    reply: {
      text: "Produk berlabel Habis tidak bisa dipesan dan tombol tambahnya nonaktif. Gunakan filter Tersedia saja di Menu untuk melihat yang bisa dipesan.",
      link: { href: "/menu", label: "Buka Menu" },
    },
  },
  {
    id: "cancel",
    label: "Batalkan pesanan",
    keywords: ["batal", "cancel", "ubah", "ganti pesanan"],
    reply: {
      text: "Hubungi kedai lewat WhatsApp secepatnya. Pesanan yang sudah masuk tahap Diracik tidak dapat dibatalkan.",
      link: { href: WA_LINK, label: "Chat WhatsApp", external: true },
    },
  },
  {
    id: "privacy",
    label: "Data pribadiku",
    keywords: ["privasi", "data", "pribadi", "aman", "hapus", "pdp"],
    reply: {
      text: "Kami hanya meminta nama panggilan dan WhatsApp (opsional). Data pembayaran diproses Midtrans dan tidak kami simpan. Kamu bisa meminta akses atau penghapusan data kapan saja.",
      link: { href: "/privasi", label: "Baca Kebijakan Privasi" },
    },
  },
  {
    id: "contact",
    label: "Hubungi kedai",
    keywords: ["kontak", "hubungi", "wa", "whatsapp", "telepon", "admin"],
    reply: {
      text: `Kamu bisa menghubungi kami lewat WhatsApp atau email ${SITE.contactEmail}.`,
      link: { href: WA_LINK, label: "Chat WhatsApp", external: true },
    },
  },
];

const FALLBACK: Reply = {
  text: "Maaf, aku belum paham pertanyaan itu. Coba pilih salah satu pertanyaan cepat di atas atau tanya langsung ke kedai lewat WhatsApp.",
  link: { href: WA_LINK, label: "Chat WhatsApp", external: true },
};

const GREETING: Reply = {
  text: "Halo, aku asisten Space Coffee. Pilih pertanyaan cepat di bawah atau ketik pertanyaanmu.",
};

function findReply(input: string): Reply {
  const text = input.toLowerCase();
  let best: Rule | null = null;
  let bestScore = 0;
  for (const rule of RULES) {
    const score = rule.keywords.filter((k) => text.includes(k)).length;
    if (score > bestScore) {
      best = rule;
      bestScore = score;
    }
  }
  return best ? best.reply : FALLBACK;
}

export default function FaqChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: "bot", reply: GREETING },
  ]);
  const [input, setInput] = useState("");
  const nextId = useRef(1);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function ask(question: string, reply: Reply) {
    const a = nextId.current++;
    const b = nextId.current++;
    setMessages((prev) => [
      ...prev,
      { id: a, from: "user", reply: { text: question } },
      { id: b, from: "bot", reply },
    ]);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    ask(q, findReply(q));
    setInput("");
  }

  return (
    <section
      aria-labelledby="chatbot-title"
      className="rounded-2xl border border-line bg-surface p-4"
    >
      <h2 id="chatbot-title" className="font-heading text-lg font-semibold text-space-navy">
        Tanya Asisten Space
      </h2>
      <p className="mt-1 text-sm text-muted">Dijawab berdasarkan aturan, bukan AI.</p>

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label="Percakapan dengan asisten"
        className="mt-3 h-72 space-y-2 overflow-y-auto rounded-xl bg-cream p-3"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={m.from === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                m.from === "user"
                  ? "max-w-[85%] rounded-2xl bg-space-navy px-3 py-2 text-sm text-cream"
                  : "max-w-[85%] rounded-2xl border border-line bg-surface px-3 py-2 text-sm text-ink"
              }
            >
              <p className="leading-relaxed">{m.reply.text}</p>
              {m.reply.link ? (
                m.reply.link.external ? (
                  <a
                    href={m.reply.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex min-h-[44px] items-center font-semibold text-space-navy underline"
                  >
                    {m.reply.link.label}
                  </a>
                ) : (
                  <Link
                    href={m.reply.link.href}
                    className="mt-1 inline-flex min-h-[44px] items-center font-semibold text-space-navy underline"
                  >
                    {m.reply.link.label}
                  </Link>
                )
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2" aria-label="Pertanyaan cepat">
        {RULES.map((rule) => (
          <button
            key={rule.id}
            type="button"
            onClick={() => ask(rule.label, rule.reply)}
            className="min-h-[44px] rounded-full border border-line bg-matcha-soft px-4 text-sm text-ink hover:border-matcha focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy"
          >
            {rule.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <label htmlFor="chat-input" className="sr-only">
          Ketik pertanyaanmu
        </label>
        <input
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={120}
          placeholder="Ketik pertanyaan..."
          className="min-h-[44px] flex-1 rounded-xl border border-line bg-surface px-3 text-base text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy"
        />
        <button
          type="submit"
          aria-label="Kirim pertanyaan"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-matcha text-space-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-space-navy"
        >
          <Send className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}