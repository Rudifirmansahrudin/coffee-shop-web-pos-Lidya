import type { Metadata } from "next";
import Image from "next/image";
import {
  BarChart3,
  Code,
  Coffee,
  Headphones,
  Leaf,
  Megaphone,
  Package,
  ShoppingBag,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { AstronautHero } from "@/components/space/AstronautHero";
import { asRecord, asString, getSiteContent } from "@/lib/store-info";

export const metadata: Metadata = {
  title: "Tentang Kami | Space Coffee and Matcha",
  description: "Cerita, visi, misi, dan tim Space Coffee and Matcha. Coffee That Takes You Further.",
};

export const revalidate = 60;

const DEFAULT_STORY =
  "Space Coffee and Matcha lahir dari keinginan sederhana: secangkir minuman yang membuat harimu melangkah lebih jauh. " +
  "Dari kopi, matcha, sampai cokelat, setiap gelas kami racik dengan rasa yang konsisten dan harga yang ramah di kantong.";
const DEFAULT_VISION =
  "Menjadi kedai minuman favorit yang menemani setiap langkah pelanggan menuju harinya yang lebih baik.";
const DEFAULT_MISSIONS = [
  "Menyajikan minuman berkualitas dengan rasa yang konsisten.",
  "Memberi pelayanan ramah dan pemesanan yang mudah lewat HP.",
  "Menjaga harga tetap terjangkau untuk semua kalangan.",
];

type Advantage = { title: string; text: string; icon: LucideIcon };
const ADVANTAGES: Advantage[] = [
  { title: "Racikan Berkarakter", text: "Kopi, matcha, dan cokelat dengan rasa khas yang konsisten di setiap gelas.", icon: Coffee },
  { title: "Bebas Pilih", text: "Pilih ukuran Regular atau Large dan tambahkan topping sesukamu.", icon: Leaf },
  { title: "Pesan Cepat dari HP", text: "Pesan, bayar, dan lacak pesananmu tanpa antre panjang.", icon: Smartphone },
];

// ---------------------------------------------------------------------------
// TEAM: edit names / roles / photos here (photo is optional, e.g. "/team/budi.jpg")
// ---------------------------------------------------------------------------
type Member = { name: string; role: string; nim?: string; photo?: string };

const DEVELOPER: Member = {
  name: "Rudi Firmansahrudin",
  role: "Lead Developer & System Architect",
  nim: "2407030108",
};

// Developer is shown in the "Di Balik Layar" box, so the other 5 are listed here
const MEMBERS: Member[] = [
  { name: "Lidya Salsa Azzafira", role: "Business Owner", nim: "2407030068" },
  { name: "Prabu Haidar Sulthoni Prasojo", role: "Consultant", nim: "2407030389" },
  { name: "Adrie Najjia Abdillah", role: "Consultant", nim: "2407030274" },
  { name: "Dwi Nur Laeli", role: "Consultant", nim: "2407030260" },
  { name: "Zakia Zahwa Mawalia", role: "Designer", nim: "2407030084" },
];

const TECH_STACK = ["Next.js 14", "TypeScript", "Tailwind CSS", "Supabase", "Midtrans Snap", "Vercel"];

const BUILT_ITEMS = [
  "Pemesanan, keranjang, dan checkout",
  "Pembayaran (mode demo dan sandbox Midtrans)",
  "Lacak pesanan realtime",
  "Mission Control: antrean, dashboard, produk, konten",
  "Keamanan: validasi, rate limit, hak akses peran",
];

type Activity = { title: string; text: string; icon: LucideIcon };
const ACTIVITIES: Activity[] = [
  { title: "Pemasaran", text: "Promo, QR, SEO, sosial", icon: Megaphone },
  { title: "Penjualan", text: "Order dan pembayaran", icon: ShoppingBag },
  { title: "Layanan", text: "Lacak, FAQ, WA, rating", icon: Headphones },
  { title: "Stok", text: "Tersedia atau Habis", icon: Package },
  { title: "Keputusan", text: "Dashboard dan insight", icon: BarChart3 },
];

function stringList(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => asString(x)).filter(Boolean) : [];
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

// Fixed hex colors (SPEC tokens) so this look does not flip in dark mode:
// navy #0F1B3D, cream #FAF7F0
function Avatar({ member, size }: { member: Member; size: "md" | "lg" }) {
  const box = size === "lg" ? "h-24 w-24 text-3xl" : "h-16 w-16 text-xl";
  if (member.photo) {
    return (
      <div className={`relative mx-auto overflow-hidden rounded-full ${box}`}>
        <Image src={member.photo} alt={`Foto ${member.name}`} fill sizes="96px" className="object-cover" />
      </div>
    );
  }
  return (
    <div
      className={`mx-auto flex items-center justify-center rounded-full bg-[#0F1B3D] font-heading font-bold text-[#FAF7F0] ring-1 ring-white/25 ${box}`}
      aria-hidden="true"
    >
      {initials(member.name)}
    </div>
  );
}

// Thin orbit line used as a section separator (decorative only)
function OrbitLine() {
  return (
    <svg
      viewBox="0 0 600 40"
      className="mx-auto my-10 h-8 w-full max-w-md text-line"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="300" cy="20" rx="290" ry="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="300" cy="8" r="4" className="fill-star-gold" />
    </svg>
  );
}

export default async function TentangPage() {
  const content = await getSiteContent(["about"]);
  const about = asRecord(content.about);

  const story = asString(about.story) || DEFAULT_STORY;
  const vision = asString(about.vision) || DEFAULT_VISION;
  const missions = stringList(about.missions).length ? stringList(about.missions) : DEFAULT_MISSIONS;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6 lg:py-10">
      {/* Hero: two columns on lg */}
      <header className="grid items-center gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-muted">Tentang Kami</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-space-navy md:text-4xl">
            Coffee That Takes You Further
          </h1>
          <p className="mt-3 text-ink">{story}</p>
          <p className="mt-3 text-sm text-muted">Setiap tegukan, satu langkah lebih dekat ke bintang.</p>
        </div>
        <AstronautHero className="mx-auto h-44 w-auto md:h-56 lg:h-72" />
      </header>

      <OrbitLine />

      <section className="grid gap-4 md:grid-cols-2" aria-label="Visi dan misi">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-heading text-lg font-semibold text-space-navy">Visi</h2>
          <p className="mt-2 text-ink">{vision}</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-heading text-lg font-semibold text-space-navy">Misi</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-ink">
            {missions.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10" aria-label="Keunggulan">
        <h2 className="font-heading text-xl font-semibold text-space-navy">Kenapa Space?</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {ADVANTAGES.map(({ title, text, icon: Icon }) => (
            <div key={title} className="rounded-2xl bg-matcha-soft p-5">
              <Icon className="h-6 w-6 text-space-navy" aria-hidden="true" />
              <h3 className="mt-3 font-heading font-semibold text-space-navy">{title}</h3>
              <p className="mt-1 text-sm text-ink">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <OrbitLine />

      {/* Team: flex + centered so an odd number of cards stays balanced */}
      <section aria-label="Tim">
        <h2 className="font-heading text-xl font-semibold text-space-navy">Kru Misi Space</h2>
        <p className="mt-1 text-sm text-muted">Tim di balik website dan sistem pemesanan ini.</p>

        <div className="mt-4 flex flex-wrap justify-center gap-3 md:gap-4">
          {MEMBERS.map((m) => (
            <div
              key={m.nim ?? m.name}
              className="w-[calc(50%-0.375rem)] rounded-2xl border border-line bg-surface p-4 text-center md:w-[calc((100%-2rem)/3)] md:p-5"
            >
              <Avatar member={m} size="md" />
              <p className="mt-3 text-sm font-semibold text-ink md:text-base">{m.name}</p>
              <p className="text-xs text-muted md:text-sm">{m.role}</p>
              {m.nim ? <p className="mt-1 text-xs text-muted">{m.nim}</p> : null}
            </div>
          ))}
        </div>
      </section>

      {/* Special section: developer spotlight (fixed navy + cream, same in light and dark mode) */}
      <section
        className="mt-10 overflow-hidden rounded-2xl border border-white/20 bg-[#0F1B3D] p-5 text-[#FAF7F0] shadow-lg md:p-8"
        aria-label="Di balik layar"
      >
        <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:gap-10">
          <div className="text-center">
            <div className="relative inline-block">
              <Avatar member={DEVELOPER} size="lg" />
              {/* Small gold stars, kept few on purpose */}
              <span className="absolute -right-3 top-0 text-star-gold" aria-hidden="true">
                ✦
              </span>
              <span className="absolute -left-4 bottom-2 text-xs text-star-gold" aria-hidden="true">
                ✦
              </span>
            </div>
            <p className="mt-3 font-heading text-lg font-semibold text-[#FAF7F0]">{DEVELOPER.name}</p>
            <p className="text-sm text-[#FAF7F0]/80">{DEVELOPER.role}</p>
            {DEVELOPER.nim ? <p className="mt-1 text-xs text-[#FAF7F0]/70">{DEVELOPER.nim}</p> : null}
          </div>

          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#FAF7F0]/30 px-3 py-1 text-xs font-semibold text-[#FAF7F0]">
              <Code className="h-3.5 w-3.5" aria-hidden="true" />
              Di Balik Layar
            </p>
            <h2 className="mt-3 font-heading text-xl font-semibold text-[#FAF7F0] md:text-2xl">
              Cerita dibalik web ini
            </h2>
            <p className="mt-2 text-sm text-[#FAF7F0]/85">
              Dari tampilan menu sampai Mission Control untuk kasir dan barista, semuanya dibangun sebagai satu sistem
              terpadu yang menghubungkan pemasaran, penjualan, layanan, stok, dan keputusan berbasis data.
            </p>

            <ul className="mt-4 grid gap-1.5 text-sm text-[#FAF7F0]/90 sm:grid-cols-2">
              {BUILT_ITEMS.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-star-gold" aria-hidden="true">
                    ✦
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2" aria-label="Teknologi yang dipakai">
              {TECH_STACK.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-[#FAF7F0]/30 px-3 py-1 text-xs font-medium text-[#FAF7F0]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Business integration strip (useful for the presentation) */}
      <section className="mt-10" aria-label="Integrasi aktivitas bisnis">
        <h2 className="font-heading text-xl font-semibold text-space-navy">Satu sistem, lima aktivitas bisnis</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          {ACTIVITIES.map(({ title, text, icon: Icon }) => (
            <div key={title} className="rounded-2xl border border-line bg-surface p-4">
              <Icon className="h-5 w-5 text-matcha" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-ink">{title}</p>
              <p className="text-xs text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-label="Galeri">
        <h2 className="font-heading text-xl font-semibold text-space-navy">Galeri</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-matcha-soft"
            >
              <Image
                src="/menu/default.svg"
                alt={`Foto kedai Space Coffee (placeholder ${n})`}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-contain p-6"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
