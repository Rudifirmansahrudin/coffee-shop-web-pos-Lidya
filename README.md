# Audit Manual - Space Coffee and Matcha

Uji di Chrome DevTools (Device Toolbar) dan HP asli. Centang saat lolos.

## 1. Kontras (min 4.5:1)
- [ ] Teks ink (#1B2236) di atas cream/surface terbaca jelas
- [ ] Teks muted (#6B7389) di atas cream: cek ukuran >= 14px (DevTools > Inspect > Contrast)
- [ ] Tombol matcha dengan teks navy terbaca
- [ ] Teks di section navy (krem/putih) terbaca
- [ ] Teks pada gambar banner promo terbaca di 360px

## 2. Alt text dan label
- [ ] Semua <Image> punya alt bermakna (dekoratif: alt="")
- [ ] SVG dekoratif (bintang, orbit, astronot) aria-hidden atau punya title
- [ ] Semua input punya label (checkout, pencarian menu, login admin, chatbot)
- [ ] Tombol ikon punya aria-label (keranjang, kirim, menu)

## 3. Tap target dan fokus
- [ ] Semua tombol/link utama >= 44x44px di HP
- [ ] Tab dengan keyboard: fokus selalu terlihat, urutan logis
- [ ] Dialog/bottom sheet bisa ditutup dengan Esc dan tombol Tutup

## 4. Scroll horizontal (tidak boleh ada)
- [ ] 360px: Beranda, Menu, Keranjang, Checkout, Pay, Lacak, Lokasi, Tentang, FAQ, Privasi, Syarat
- [ ] 390px: halaman yang sama
- [ ] 768px dan 1280px: halaman yang sama
- [ ] Admin 360px: Orders, Dashboard, Produk (tabel jadi kartu)
- Tips: Console > document.documentElement.scrollWidth > innerWidth harus false

## 5. Loading / error / empty state
- [ ] Menu: loading skeleton tampil saat dimuat
- [ ] Menu: pencarian tanpa hasil menampilkan empty state
- [ ] Keranjang kosong: "Keranjangmu masih hampa udara."
- [ ] Checkout: pesan error ramah bila validasi gagal atau server error
- [ ] Lacak: kode tidak ditemukan menampilkan pesan, bukan crash
- [ ] FAQ: kosong atau gagal muat menampilkan pesan
- [ ] Beranda: best seller kosong -> section tersembunyi

## 6. Keamanan dan hukum
- [ ] Checkbox persetujuan privasi wajib, consent_at tersimpan di orders
- [ ] Link Privasi dan Syarat di footer dan checkbox tidak 404
- [ ] Pernyataan UU PDP tampil di footer
- [ ] Tidak ada MIDTRANS_SERVER_KEY / SERVICE_ROLE_KEY di bundle client (cari di DevTools > Sources)
- [ ] /admin tanpa login diarahkan ke /admin/login
- [ ] Rate limit /api/orders: kirim berulang cepat ditolak

## 7. SEO
- [ ] /sitemap.xml dan /robots.txt terbuka
- [ ] Favicon tampil di tab browser
- [ ] /opengraph-image menampilkan gambar navy
- [ ] Judul tab per halaman sesuai (FAQ | Space Coffee and Matcha, dst.)