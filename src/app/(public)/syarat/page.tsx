import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, LegalSection } from "@/components/legal/LegalDoc";
import { SITE, WA_LINK } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan",
  description:
    "Syarat dan ketentuan penggunaan layanan pemesanan online Space Coffee and Matcha.",
};

export default function SyaratPage() {
  return (
    <LegalDoc
      title="Syarat dan Ketentuan"
      updated={SITE.lastUpdated}
      intro={`Dengan memakai situs dan layanan pemesanan ${SITE.name}, kamu menyetujui syarat berikut. Ketentuan ini mengacu pada hukum Indonesia, termasuk UU Informasi dan Transaksi Elektronik (UU ITE) beserta perubahannya dan UU PDP.`}
    >
      <LegalSection title="1. Penggunaan layanan">
        <ul>
          <li>Layanan dipakai untuk memesan minuman di kedai kami, {SITE.address}.</li>
          <li>Kamu wajib memberi informasi yang benar, termasuk nama panggilan dan nomor WhatsApp bila diisi.</li>
          <li>Dilarang mengganggu sistem, mencoba mengakses area admin tanpa hak, mengirim pesanan palsu atau berulang secara berlebihan (spam), atau menyalahgunakan fitur rating.</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Pesanan dan harga">
        <ul>
          <li>Harga dalam Rupiah dan dihitung ulang oleh server berdasarkan data menu terbaru (ukuran dan topping). Harga di perangkatmu bukan penentu akhir.</li>
          <li>Produk berstatus Habis tidak dapat dipesan. Ketersediaan dapat berubah sewaktu-waktu.</li>
          <li>Pesanan diambil di kasir dan dipanggil lewat nama panggilan yang kamu isi.</li>
          <li>Foto produk bersifat ilustrasi dan dapat berbeda dari tampilan asli.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Pembayaran">
        <ul>
          <li>Pesanan mulai diracik setelah pembayaran terkonfirmasi.</li>
          <li>Pembayaran nyata diproses oleh Midtrans dan tunduk pada ketentuan Midtrans serta penyedia pembayaran yang kamu pilih.</li>
          <li>Pada mode demo, pembayaran hanya simulasi dan dikonfirmasi manual oleh kasir. Tidak ada uang yang berpindah.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Pembatalan">
        <p>
          Hubungi kedai lewat{" "}
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>{" "}
          secepatnya bila ingin membatalkan. Pesanan yang sudah masuk tahap Diracik
          tidak dapat dibatalkan. Pesanan yang tidak dibayar dalam waktu tertentu dapat
          kedaluwarsa otomatis.
        </p>
      </LegalSection>

      <LegalSection title="5. Rating dan komentar">
        <p>
          Kamu bertanggung jawab atas isi komentarmu. Komentar yang mengandung ujaran
          kebencian, ancaman, pencemaran nama baik, atau data pribadi orang lain dapat
          dihapus. Kami dapat menampilkan rating secara agregat.
        </p>
      </LegalSection>

      <LegalSection title="6. Hak kekayaan intelektual">
        <p>
          Nama, logo, ilustrasi, dan konten situs milik {SITE.name} atau dipakai dengan
          izin. Dilarang menyalin atau memakai ulang tanpa izin tertulis.
        </p>
      </LegalSection>

      <LegalSection title="7. Batasan tanggung jawab">
        <p>
          Kami berupaya menjaga layanan tetap berjalan, namun tidak menjamin situs bebas
          gangguan. Kami tidak bertanggung jawab atas kerugian akibat gangguan jaringan,
          kesalahan pihak ketiga (penyedia pembayaran, hosting), atau keadaan di luar
          kendali kami, sebatas yang diizinkan hukum.
        </p>
      </LegalSection>

      <LegalSection title="8. Data pribadi">
        <p>
          Pengelolaan data pribadimu dijelaskan di{" "}
          <Link href="/privasi">Kebijakan Privasi</Link>.
        </p>
      </LegalSection>

      <LegalSection title="9. Data demo / fiktif">
        <p>
          Situs ini adalah proyek tugas kuliah. Order bertanda DUMMY dan data dari panel
          demo adalah fiktif dan bukan transaksi sebenarnya.
        </p>
      </LegalSection>

      <LegalSection title="10. Hukum yang berlaku dan perubahan">
        <p>
          Ketentuan ini tunduk pada hukum Republik Indonesia. Kami dapat mengubah
          ketentuan ini; tanggal pembaruan tertera di atas halaman. Pertanyaan:{" "}
          {SITE.contactEmail}.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}