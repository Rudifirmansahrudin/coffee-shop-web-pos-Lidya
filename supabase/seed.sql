-- Space Coffee and Matcha: seed data (REAL menu, prices in rupiah)
-- Run once after schema.sql. To reset, uncomment the next line first:
-- truncate order_items, orders, products, toppings, categories, faqs, site_content restart identity cascade;

insert into categories (name, slug, sort_order) values
  ('Coffee Series', 'coffee-series', 1),
  ('Non Coffee', 'non-coffee', 2),
  ('Matcha Series', 'matcha-series', 3),
  ('Chocolate Series', 'chocolate-series', 4);

insert into products (category_id, name, description, price, price_large, image_url, is_available, is_best_seller, stock_note)
select c.id, v.name, v.description, v.price, v.price_large, '/menu/default.svg', v.is_available, v.is_best_seller, v.stock_note
from (values
  -- Coffee Series
  ('coffee-series', 'Americano', 'Espresso klasik dengan air, segar dan ringan.', 10000, 14000, true, false, null),
  ('coffee-series', 'Iced Latte', 'Espresso dan susu dingin yang lembut.', 12000, 15000, true, false, null),
  ('coffee-series', 'Kakao Latte', 'Kopi susu dengan rasa kakao yang manis.', 15000, 17000, true, false, null),
  ('coffee-series', 'Creamy Latte', 'Latte creamy dengan tekstur halus.', 15000, 18000, true, false, null),
  ('coffee-series', 'Aren Latte', 'Kopi susu dengan gula aren yang wangi.', 15000, 18000, true, false, null),
  ('coffee-series', 'Caramel Latte', 'Latte dengan saus karamel manis.', 15000, 18000, true, false, null),
  ('coffee-series', 'Vanilla Latte', 'Latte dengan aroma vanila yang lembut.', 18000, 22000, true, false, null),
  ('coffee-series', 'Butterscotch', 'Kopi susu rasa butterscotch yang gurih manis.', 15000, 20000, true, true, null),
  ('coffee-series', 'Salted Caramel', 'Perpaduan karamel manis dan sedikit asin.', 15000, 20000, true, true, null),
  ('coffee-series', 'Red Velvet', 'Kopi susu rasa red velvet yang creamy.', 15000, 18000, true, false, null),
  -- Non Coffee
  ('non-coffee', 'Bluebarry', 'Minuman susu rasa blueberry yang segar.', 10000, 15000, true, false, null),
  ('non-coffee', 'Bubble Gum', 'Minuman susu rasa permen karet yang manis.', 10000, 15000, true, false, null),
  ('non-coffee', 'Taro', 'Minuman susu taro yang lembut dan manis.', 10000, 15000, true, false, null),
  ('non-coffee', 'Red Velvet', 'Minuman susu red velvet tanpa kopi.', 15000, 18000, true, false, null),
  -- Matcha Series
  ('matcha-series', 'Pure Matcha', 'Matcha murni dengan rasa khas yang pekat.', 14000, 18000, true, false, null),
  ('matcha-series', 'Matcha Latte', 'Matcha dengan susu yang creamy.', 15000, 18000, true, false, null),
  ('matcha-series', 'Cherry Blossom', 'Matcha dengan sentuhan rasa bunga sakura.', 15000, 18000, false, false, 'Habis hari ini'),
  ('matcha-series', 'Matcha Coffe', 'Perpaduan matcha dan espresso.', 17000, 22000, true, false, null),
  ('matcha-series', 'Matcha Blossom', 'Matcha spesial dengan aroma bunga.', 18000, 22000, true, false, null),
  -- Chocolate Series
  ('chocolate-series', 'Chocolate', 'Cokelat susu klasik yang manis.', 10000, 14000, true, false, null),
  ('chocolate-series', 'Cookies & Cream', 'Cokelat susu dengan remah cookies.', 15000, 18000, true, false, null),
  ('chocolate-series', 'Choco Milo', 'Cokelat susu dengan taburan Milo.', 15000, 18000, true, false, null)
) as v(slug, name, description, price, price_large, is_available, is_best_seller, stock_note)
join categories c on c.slug = v.slug;

insert into toppings (name, price) values
  ('Oreo Crumb', 2000),
  ('Milo', 4000),
  ('Extra Shot', 3000);

-- Site content (placeholder values are fictional, editable in Content Manager)
insert into site_content (key, value) values
  ('hero', '{
    "title": "Coffee That Takes You Further",
    "subtitle": "Setiap tegukan, satu langkah lebih dekat ke bintang",
    "cta_label": "Pesan Sekarang"
  }'::jsonb),
  ('promo', '{
    "active": true,
    "code": "SPACE",
    "title": "Selamat datang di Space",
    "text": "Tanyakan promo minggu ini ke kasir kami."
  }'::jsonb),
  ('about', '{
    "story": "Space Coffee and Matcha adalah kedai kecil di Plaza Ono Sidareja yang lahir dari kecintaan pada kopi dan matcha. Kami ingin setiap tegukan terasa seperti perjalanan kecil yang menyenangkan.",
    "vision": "Menjadi kedai kopi dan matcha favorit anak muda yang membawa pelanggan melangkah lebih jauh.",
    "mission": [
      "Menyajikan minuman berkualitas dengan harga bersahabat",
      "Memberikan pelayanan cepat dan ramah",
      "Menghadirkan suasana nyaman untuk bekerja dan bersantai"
    ]
  }'::jsonb),
  ('opening_hours', '{
    "timezone": "Asia/Jakarta",
    "days": {
      "mon": { "open": "10:00", "close": "22:00" },
      "tue": { "open": "10:00", "close": "22:00" },
      "wed": { "open": "10:00", "close": "22:00" },
      "thu": { "open": "10:00", "close": "22:00" },
      "fri": { "open": "10:00", "close": "22:00" },
      "sat": { "open": "10:00", "close": "22:00" },
      "sun": { "open": "10:00", "close": "22:00" }
    }
  }'::jsonb),
  ('contact', '{
    "mall": "Plaza Ono Sidareja",
    "floor": "Lantai 3",
    "unit": "",
    "whatsapp": "6281200000000",
    "maps_query": "Plaza Ono Sidareja",
    "lat": null,
    "lng": null
  }'::jsonb),
  ('social', '{
    "instagram": "https://instagram.com/spacecoffeeandmatcha",
    "whatsapp": "https://wa.me/6281200000000"
  }'::jsonb);

insert into faqs (question, answer, sort_order) values
  ('Di mana lokasi Space Coffee and Matcha?', 'Kami ada di Plaza Ono Sidareja, Lantai 3.', 1),
  ('Jam buka kedai kapan?', 'Kami buka setiap hari pukul 10:00 sampai 22:00 WIB. Jam bisa berubah, cek halaman Lokasi.', 2),
  ('Bagaimana cara memesan lewat website?', 'Pilih menu, tambahkan ke keranjang, isi nama di halaman checkout, lalu lakukan pembayaran.', 3),
  ('Metode pembayaran apa yang tersedia?', 'Pembayaran lewat QRIS, GoPay, atau transfer. Kasir akan mengonfirmasi pembayaranmu.', 4),
  ('Bagaimana cara melacak pesananku?', 'Setelah membayar, buka halaman Lacak Pesanan dengan kode SPC-XXXX. Statusnya berubah otomatis.', 5),
  ('Apakah data pribadiku aman?', 'Kami hanya menyimpan data seperlunya (nama dan nomor WhatsApp opsional) sesuai UU PDP No. 27 Tahun 2022. Lihat Kebijakan Privasi.', 6);