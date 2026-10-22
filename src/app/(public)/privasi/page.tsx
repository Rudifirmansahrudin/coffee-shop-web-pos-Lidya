import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | Space Coffee and Matcha",
};

export default function PrivasiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:py-12">
      <h1 className="font-heading text-2xl text-space-navy">Kebijakan Privasi</h1>
      <p className="mt-2 text-sm text-muted">
        Versi ringkas. Isi lengkap menyusul. Website ini memakai data demo/fiktif untuk
        keperluan tugas kuliah.
      </p>

      <div className="mt-6 space-y-5 text-ink">
        <section>
          <h2 className="font-heading text-lg text-space-navy">Data yang kami kumpulkan</h2>
          <p className="mt-1">
            Hanya data minimal untuk memproses pesanan: nama panggilan, nomor WhatsApp
            (opsional), dan catatan. Kami tidak meminta alamat atau email.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-lg text-space-navy">Tujuan penggunaan</h2>
          <p className="mt-1">
            Data dipakai untuk menyiapkan, melacak, dan memanggil pelanggan terkait
            pesanan. Waktu persetujuanmu kami simpan sebagai bukti consent.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-lg text-space-navy">Pembayaran</h2>
          <p className="mt-1">
            Data pembayaran diproses oleh Midtrans dan tidak disimpan di sistem kami.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-lg text-space-navy">Dasar hukum</h2>
          <p className="mt-1">
            Pemrosesan data mengacu pada UU Pelindungan Data Pribadi No. 27 Tahun 2022.
          </p>
        </section>
      </div>
    </div>
  );
}