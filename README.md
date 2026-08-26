# LokaTV

Situs full-stack untuk menonton **TV siaran langsung dari seluruh dunia**. Katalog diambil dari [iptv-org](https://github.com/iptv-org/api), diputar lewat pemutar HLS, dan dilengkapi proksi media bertanda tangan di server.

## Fitur

- Ribuan saluran dari puluhan negara, dengan filter negara, kategori, dan pencarian
- Pemutar langsung (HLS) plus fallback ke sinyal cadangan
- Halaman beranda dengan baris rekomendasi (TV Thai, berita, olahraga, Jepang, Korea, dan lainnya)
- Favorit dan riwayat tontonan tersimpan di peramban
- UI gelap bergaya ruang sinema, siap desktop dan ponsel
- Bahasa antarmuka: Thai

## Menjalankan secara lokal

Butuh Node.js 20+.

```bash
npm install
npm run dev
```

Buka [http://127.0.0.1:43180](http://127.0.0.1:43180).

Produksi:

```bash
npm run build
npm start
```

## Variabel lingkungan

Salin `.env.example` ke `.env.local` jika ingin mengganti kunci penandatanganan proksi:

```
MEDIA_SIGNING_SECRET=ganti-dengan-rahasia-acak
```

Tanpa file ini, aplikasi tetap jalan memakai kunci pengembangan.

## Arsitektur

- **Next.js App Router** — halaman SSR + Route Handlers
- **Katalog server** — menggabungkan channels, streams, logos, countries, categories (cache memori 45 menit)
- **`/api/play/[id]`** — mengambil playlist saluran dari katalog
- **`/api/media`** — proksi segmen/playlist HLS dengan HMAC, proteksi SSRF, dan rewrite URL
- **hls.js** — pemutaran di peramban

Sinyal siaran bersifat publik dan bisa putus, dibatasi wilayah, atau tidak kompatibel CORS. LokaTV tidak terafiliasi dengan stasiun mana pun.

## Skrip

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan di port 43180 |
| `npm run build` | Build produksi |
| `npm start` | Jalankan hasil build |
| `npm run lint` | ESLint |
