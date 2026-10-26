import Image from "next/image";
import Link from "next/link";
import { OrbitDivider } from "@/components/space/OrbitDivider";
import { StarField } from "@/components/space/StarField";
import { DESKTOP_LINKS } from "@/components/layout/nav-links";

const LEGAL_LINKS = [
  { href: "/faq", label: "FAQ" },
  { href: "/privasi", label: "Kebijakan Privasi" },
  { href: "/syarat", label: "Syarat & Ketentuan" },
];

// Small spaced uppercase heading in gold, same style as the nav
const HEADING = "font-heading text-xs font-semibold uppercase tracking-[0.28em] text-star-gold";
const LINK =
  "flex min-h-[44px] items-center text-white/80 transition-colors hover:text-star-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-star-gold";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    // Fixed navy background and white text in both themes (readable on light and dark pages)
    <footer className="relative overflow-hidden border-t-2 border-matcha/60 bg-[rgb(var(--c-navy-bg))] text-white">
      <StarField count={5} />
      <div className="relative mx-auto max-w-[1200px] px-4 pb-24 pt-10 md:px-6 md:pb-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand with round logo */}
          <div className="flex items-center gap-4 md:items-start">
            <Image
              src="/ornaments/logo.jpg"
              alt="Logo Space Coffee and Matcha"
              width={84}
              height={84}
              className="h-[84px] w-[84px] shrink-0 rounded-full object-cover ring-1 ring-white/25 shadow-[0_0_40px_rgba(224,165,38,0.25)]"
            />
            <div>
              <p className="font-heading text-xl font-bold">Space Coffee and Matcha</p>
              <p className="mt-1 text-white/80">Coffee That Takes You Further</p>
              <p className="mt-1 text-sm text-white/70">
                Setiap tegukan, satu langkah lebih dekat ke bintang
              </p>
            </div>
          </div>

          {/* Navigation (desktop only, mobile has bottom nav) */}
          <div className="hidden md:block">
            <p className={HEADING}>Jelajahi</p>
            <ul className="mt-2">
              {DESKTOP_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={LINK}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Location (desktop only) */}
          <div className="hidden md:block">
            <p className={HEADING}>Kunjungi Kami</p>
            <p className="mt-2 text-white/80">Plaza Ono Sidareja, Lantai 3</p>
            <Link
              href="/lokasi"
              className="mt-1 flex min-h-[44px] items-center font-semibold text-matcha underline underline-offset-4 hover:text-star-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-star-gold"
            >
              Lihat jam buka & peta
            </Link>
          </div>

          {/* Legal */}
          <div>
            <p className={`hidden md:block ${HEADING}`}>Informasi</p>
            <ul className="flex flex-wrap gap-x-5 md:mt-2 md:block">
              {LEGAL_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={LINK}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <OrbitDivider className="my-6 text-white/20" />

        <p className="text-sm text-white/80">
          Kami memproses data pribadi sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi
          (UU PDP). Seluruh data pada situs ini adalah data demo/fiktif untuk tugas kuliah.
        </p>
        <p className="mt-2 text-sm text-white/80">
          &copy; {year} Space Coffee and Matcha. Plaza Ono Sidareja, Lantai 3.
        </p>
      </div>
    </footer>
  );
}