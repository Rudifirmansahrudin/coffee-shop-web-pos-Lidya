import type { ReactNode } from "react";

export function LegalDoc({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
      <h1 className="font-heading text-2xl font-bold text-space-navy md:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-muted">Terakhir diperbarui: {updated}</p>
      <div className="mt-4 rounded-2xl border border-line bg-matcha-soft p-4 text-sm text-ink">
        <strong>Catatan:</strong> Situs ini adalah proyek tugas kuliah (Sistem Informasi
        Manajemen). Data pada mode demo bersifat <strong>fiktif</strong> dan ditandai badge
        DUMMY di sistem.
      </div>
      {intro ? <p className="mt-6 leading-relaxed text-ink">{intro}</p> : null}
      <div className="mt-6 space-y-8">{children}</div>
    </article>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="[&_a]:text-space-navy [&_a]:underline [&_li]:leading-relaxed [&_p]:leading-relaxed [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
      <h2 className="font-heading text-lg font-semibold text-space-navy md:text-xl">{title}</h2>
      <div className="mt-2 space-y-2 text-ink">{children}</div>
    </section>
  );
}