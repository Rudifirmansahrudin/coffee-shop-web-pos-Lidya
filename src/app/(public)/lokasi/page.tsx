import type { Metadata } from "next";
import { Clock, ExternalLink, MapPin, MessageCircle, Navigation } from "lucide-react";
import { getSiteContent, getStoreStatus, parseContact, parseHours } from "@/lib/store-info";

export const metadata: Metadata = {
  title: "Lokasi | Space Coffee and Matcha",
  description: "Temukan Space Coffee and Matcha di Plaza Ono Sidareja, Lantai 3.",
};

export const revalidate = 60;

export default async function LokasiPage() {
  const content = await getSiteContent(["opening_hours", "contact", "social"]);
  const hours = parseHours(content.opening_hours);
  const contact = parseContact(content.contact, content.social);
  const status = getStoreStatus(hours);

  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(contact.mapsQuery)}&output=embed`;
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.mapsQuery)}`;
  const waLink = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent("Halo Space Coffee, saya mau tanya.")}`
    : "";

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6 lg:py-10">
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-space-navy md:text-3xl">Lokasi</h1>
        <p className="mt-1 text-muted">Mampir ke kedai kami, pesanan dipanggil lewat nama panggilanmu.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr] lg:items-stretch">
        {/* Map first on mobile, right side on desktop */}
        <section className="order-1 lg:order-2" aria-label="Peta lokasi">
          <div className="h-full min-h-[260px] overflow-hidden rounded-2xl border border-line bg-surface">
            <iframe
              title="Peta Space Coffee and Matcha di Plaza Ono Sidareja"
              src={mapEmbed}
              className="aspect-[4/3] h-full w-full border-0 lg:aspect-auto lg:min-h-[520px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </section>

        <section className="order-2 space-y-4 lg:order-1">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-space-navy" aria-hidden="true" />
              <div>
                <p className="font-semibold text-ink">{contact.address}</p>
                {contact.unit && <p className="text-sm text-muted">Unit {contact.unit}</p>}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span
                className={`inline-flex min-h-8 items-center rounded-full px-3 text-sm font-semibold ${
                  status.isOpen ? "bg-matcha-soft text-space-navy" : "bg-line text-ink"
                }`}
              >
                {status.isOpen ? "Buka" : "Tutup"}
              </span>
              <span className="text-sm text-muted">{status.text}</span>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <a
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-matcha px-4 font-semibold text-space-navy"
              >
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Petunjuk Arah
              </a>
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 font-semibold text-ink"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                </a>
              )}
              {contact.instagram && (
                <a
                  href={contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 font-semibold text-ink"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Instagram
                </a>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold text-space-navy">
              <Clock className="h-5 w-5" aria-hidden="true" />
              Jam Buka
            </h2>
            <ul className="divide-y divide-line">
              {hours.map((d, i) => (
                <li
                  key={d.label}
                  className={`flex min-h-11 items-center justify-between text-sm ${
                    i === status.todayIndex ? "font-semibold text-space-navy" : "text-ink"
                  }`}
                >
                  <span>
                    {d.label}
                    {i === status.todayIndex && <span className="ml-2 text-xs text-muted">(hari ini)</span>}
                  </span>
                  <span>{d.open && d.close ? `${d.open} - ${d.close}` : "Tutup"}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">Zona waktu WIB (Asia/Jakarta).</p>
          </div>
        </section>
      </div>
    </main>
  );
}