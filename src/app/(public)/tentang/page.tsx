import type { Metadata } from "next";
import Image from "next/image";
import { Coffee, Leaf, Smartphone, type LucideIcon } from "lucide-react";
import { asRecord, asString, getSiteContent } from "@/lib/store-info";

export const metadata: Metadata = {
  title: "Tentang Kami | Space Coffee and Matcha",
  description: "Cerita, visi, dan misi Space Coffee and Matcha. Coffee That Takes You Further.",
};

export const revalidate = 60;

const DEFAULT_STORY =
  "Space Coffee and Matcha lahir dari keinginan sederhana: secangkir minuman yang membuat harimu melangkah lebih jauh. " +
  "Dari kopi, matcha, sampai cokelat, setiap gelas kami racik dengan rasa yang konsisten dan harga yang ramah di kantong.";
const DEFAULT_VISION = "Menjadi kedai minuman favorit yang menemani setiap langkah pelanggan menuju harinya yang lebih baik.";
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

const DEFAULT_TEAM = [
  { name: "Nadia Pratama", role: "Founder & Head Barista" },
  { name: "Raka Wijaya", role: "Operations Manager" },
  { name: "Salsa Maharani", role: "Customer Experience" },
];

function stringList(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => asString(x)).filter(Boolean) : [];
}

export default async function TentangPage() {
  const content = await getSiteContent(["about"]);
  const about = asRecord(content.about);

  const story = asString(about.story) || DEFAULT_STORY;
  const vision = asString(about.vision) || DEFAULT_VISION;
  const missions = stringList(about.missions).length ? stringList(about.missions) : DEFAULT_MISSIONS;

  const teamRaw = Array.isArray(about.team) ? about.team : [];
  const teamFromDb = teamRaw
    .map((t) => ({ name: asString(asRecord(t).name), role: asString(asRecord(t).role) }))
    .filter((t) => t.name);
  const team = teamFromDb.length ? teamFromDb : DEFAULT_TEAM;

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6 lg:py-10">
      <header className="mb-8 max-w-2xl">
        <p className="text-sm font-semibold text-muted">Tentang Kami</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-space-navy md:text-4xl">
          Coffee That Takes You Further
        </h1>
        <p className="mt-3 text-ink">{story}</p>
      </header>

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

      <section className="mt-10" aria-label="Tim">
        <h2 className="font-heading text-xl font-semibold text-space-navy">Tim Kami</h2>
        <p className="mt-1 text-xs text-muted">Nama tim bersifat fiktif untuk keperluan demo.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {team.map((t) => (
            <div key={t.name} className="rounded-2xl border border-line bg-surface p-5 text-center">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy-bg font-heading text-xl font-bold text-cream"
                aria-hidden="true"
              >
                {t.name.charAt(0)}
              </div>
              <p className="mt-3 font-semibold text-ink">{t.name}</p>
              <p className="text-sm text-muted">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-label="Galeri">
        <h2 className="font-heading text-xl font-semibold text-space-navy">Galeri</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-matcha-soft">
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
    </main>
  );
}