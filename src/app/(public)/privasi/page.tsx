import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, LegalSection } from "@/components/legal/LegalDoc";
import { SITE, WA_LINK } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi Space Coffee and Matcha sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.",
};

export default function PrivasiPage() {
  return (
    <LegalDoc
      title="Kebijakan Privasi"
      updated={SITE.lastUpdated}
      intro={`${SITE.name} ("kami") menghargai data pribadimu. Kebijakan ini menjelaskan data apa yang kami kumpulkan, untuk apa, berapa lama, dan hakmu sebagai pengguna, sesuai Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).`}
    >
      <LegalSection title="1. Data yang kami kumpulkan (data minimal)">
        <p>Kami hanya meminta data yang dibutuhkan untuk memproses pesananmu:</p>
        <ul>
          <li>Nama panggilan (wajib), dipakai untuk memanggilmu saat pesanan siap di kasir.</li>
          <li>Nomor WhatsApp (opsional), dipakai bila kedai perlu menghubungimu soal pesanan.</li>
          <li>Isi pesanan dan catatan pesanan (ukuran, topping, permintaan khusus).</li>
          <li>Waktu persetujuan privasi (consent_at) sebagai bukti persetujuanmu.</li>
          <li>Rating dan komentar yang kamu kirim sukarela setelah pesanan selesai.</li>
          <li>Statistik kunjungan halaman (alamat halaman dan waktu) tanpa identitas pribadi.</li>
        </ul>
        <p>Kami tidak meminta alamat rumah, email, atau data sensitif apa pun.</p>
      </LegalSection>

      <LegalSection title="2. Tujuan penggunaan">
        <ul>
          <li>Memproses, menyiapkan, dan melacak pesananmu.</li>
          <li>Menghubungimu terkait pesanan bila diperlukan.</li>
          <li>Meningkatkan menu dan layanan berdasarkan rating serta statistik agregat.</li>
        </ul>
        <p>Kami tidak menjual data pribadimu dan tidak memakainya untuk iklan pihak ketiga.</p>
      </LegalSection>

      <LegalSection title="3. Dasar pemrosesan: persetujuan">
        <p>
          Kami memproses datamu berdasarkan persetujuan eksplisit yang kamu berikan lewat
          kotak centang di halaman checkout. Tanpa persetujuan, pesanan tidak dapat dibuat.
          Kamu dapat menarik persetujuan kapan saja (lihat bagian Hak Pengguna).
        </p>
      </LegalSection>

      <LegalSection title="4. Pembayaran">
        <p>
          Pembayaran diproses oleh Midtrans. Data kartu, akun e-wallet, atau rekening
          tidak disimpan di sistem kami. Kami hanya menyimpan status dan referensi
          pembayaran. Pada mode demo, tidak ada pembayaran nyata dan Midtrans tidak
          dipanggil.
        </p>
      </LegalSection>

      <LegalSection title="5. Penyimpanan lokal dan cookie">
        <ul>
          <li>Isi keranjang disimpan di browsermu (localStorage) agar tidak hilang saat halaman dimuat ulang.</li>
          <li>Cookie sesi hanya dipakai untuk login staf admin dan bersifat httpOnly.</li>
          <li>Kami tidak memakai cookie pelacak iklan.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Penyimpanan dan keamanan">
        <ul>
          <li>Seluruh akses memakai HTTPS.</li>
          <li>Kunci rahasia hanya ada di server, tidak pernah dikirim ke browser.</li>
          <li>Database memakai Row Level Security dan akses admin berbasis peran (Owner, Kasir, Barista).</li>
          <li>Notifikasi pembayaran diverifikasi dengan tanda tangan digital (signature).</li>
          <li>Input divalidasi di server dan pembuatan pesanan dibatasi (rate limit).</li>
        </ul>
        <p>
          Data pesanan disimpan paling lama 12 bulan, setelah itu dihapus atau dianonimkan.
          Tidak ada sistem yang 100% aman. Bila terjadi kebocoran data pribadi, kami akan
          memberi tahu pengguna terdampak sesuai ketentuan yang berlaku.
        </p>
      </LegalSection>

      <LegalSection title="7. Hak pengguna">
        <p>Sesuai UU PDP, kamu berhak untuk:</p>
        <ul>
          <li>Mengetahui data apa yang kami simpan tentangmu dan meminta salinannya.</li>
          <li>Meminta perbaikan data yang keliru.</li>
          <li>Meminta penghapusan data pribadimu.</li>
          <li>Menarik persetujuan dan menyampaikan keberatan atas pemrosesan data.</li>
        </ul>
        <p>
          Sebutkan kode pesananmu (contoh SPC-XXXX) saat mengajukan permintaan. Kami akan
          menanggapi secepat mungkin.
        </p>
      </LegalSection>

      <LegalSection title="8. Anak-anak">
        <p>
          Layanan ini tidak ditujukan untuk anak di bawah umur tanpa pendampingan orang
          tua atau wali. Jika kamu orang tua dan menemukan data anakmu, hubungi kami untuk
          penghapusan.
        </p>
      </LegalSection>

      <LegalSection title="9. Data demo / fiktif">
        <p>
          Situs ini dibuat sebagai proyek akademik. Order dan data yang dibuat lewat panel
          demo adalah data fiktif (badge DUMMY) dan dapat direset kapan saja.
        </p>
      </LegalSection>

      <LegalSection title="10. Perubahan kebijakan">
        <p>
          Kebijakan ini dapat diperbarui. Tanggal pembaruan terbaru tertera di bagian atas
          halaman. Ketentuan lain ada di <Link href="/syarat">Syarat dan Ketentuan</Link>.
        </p>
      </LegalSection>

      <LegalSection title="11. Kontak">
        <ul>
          <li>Email: {SITE.contactEmail}</li>
          <li>
            WhatsApp:{" "}
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer">
              hubungi kedai
            </a>
          </li>
          <li>Lokasi: {SITE.address}</li>
        </ul>
      </LegalSection>
    </LegalDoc>
  );
}