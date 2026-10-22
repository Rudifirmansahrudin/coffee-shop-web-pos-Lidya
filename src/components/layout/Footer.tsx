import Link from "next/link";
import { OrbitDivider } from "@/components/space/OrbitDivider";
import { StarField } from "@/components/space/StarField";
import { DESKTOP_LINKS } from "@/components/layout/nav-links";

const LEGAL_LINKS = [
  { href: "/privasi", label: "Kebijakan Privasi" },
  { href: "/syarat", label: "Syarat & Ketentuan" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-space-navy text-cream">
      <StarField count={5} />
      <div className="relative mx-auto max-w-[1200px] px-4 pb-24 pt-10 md:px-6 md:pb-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <p className="font-heading text-xl font-bold">Space Coffee and Matcha</p>
            <p className="mt-2 text-cream/80">Coffee That Takes You Further</p>
            <p className="mt-1 text-sm text-cream/80">
              Setiap tegukan, satu langkah lebih dekat ke bintang
            </p>
          </div>

          {/* Navigation (desktop only, mobile has bottom nav) */}
          <div className="hidden md:block">
            <p className="font-heading font-semibold">Jelajahi</p>
            <ul className="mt-2">
              {DESKTOP_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="flex min-h-[44px] items-center text-cream/80 hover:text-cream">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Location (desktop only) */}
          <div className="hidden md:block">
            <p className="font-heading font-semibold">Kunjungi Kami</p>
            <p className="mt-2 text-cream/80">Plaza Ono Sidareja, Lantai 3</p>
            <Link href="/lokasi" className="mt-1 flex min-h-[44px] items-center text-cream underline">
              Lihat jam buka & peta
            </Link>
          </div>

          {/* Legal */}
          <div>
            <p className="hidden font-heading font-semibold md:block">Informasi</p>
            <ul className="flex flex-wrap gap-x-5 md:mt-2 md:block">
              {LEGAL_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="flex min-h-[44px] items-center text-cream/80 hover:text-cream">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <OrbitDivider className="my-6 text-cream/20" />

        <p className="text-sm text-cream/80">
          Kami memproses data pribadi sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi
          (UU PDP). Seluruh data pada situs ini adalah data demo/fiktif untuk tugas kuliah.
        </p>
        <p className="mt-2 text-sm text-cream/80">
          &copy; {year} Space Coffee and Matcha. Plaza Ono Sidareja, Lantai 3.
        </p>
      </div>
    </footer>
  );
}