# Pantau BKL

Dashboard pemantauan **cuaca** dan **kualitas udara** untuk titik-titik lokasi di Kabupaten Bangkalan (dan daerah lain yang mudah ditambahkan). Dibangun sebagai SPA React + Vite tanpa backend sendiri — data diambil langsung dari API publik **BMKG** dan **Open-Meteo**, dengan peta interaktif **Leaflet**.

![Stack](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple) ![Tailwind](https://img.shields.io/badge/TailwindCSS-4-cyan)

## Fitur

- Peta Leaflet + OpenStreetMap dengan marker berwarna sesuai status kualitas udara.
- Info ringkas **selalu terlihat** di setiap titik: nama daerah, suhu, kelembapan, arah & kecepatan angin.
- Klik marker → panel detail lengkap (Informasi Cuaca BMKG, Kualitas Udara Open-Meteo, Informasi Lokasi).
- Summary cards: jumlah lokasi, suhu rata-rata/tertinggi/terendah, kelembapan rata-rata, status kualitas udara.
- Kategori AQI resmi (Baik s.d. Berbahaya) lewat utilitas terpusat `getAqiStatus()`.
- Refresh manual + auto-refresh tiap 10 menit (konfigurable), lengkap dengan waktu pembaruan terakhir.
- Loading skeleton, error per-sumber (BMKG/Open-Meteo saling menggantikan bila salah satu gagal), responsive desktop & mobile.

## Teknologi

| Teknologi | Peran |
| --- | --- |
| React 19 + TypeScript (strict) | UI library |
| Vite 7 | Build tool & dev server |
| Tailwind CSS 4 | Styling |
| Leaflet + React Leaflet 5 | Peta |
| Lucide React | Icon |
| Native fetch + AbortController | HTTP request |

Tidak memakai Next.js. Output build adalah statis (`dist/`) sehingga deploy ke Vercel sangat sederhana.

## Struktur Project

```text
pantau-bkl/
├── api/
│   └── bmkg.ts              # Serverless function /api/bmkg (fallback CORS)
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   ├── bmkg.ts          # Service BMKG (direct request → fallback proxy)
│   │   ├── openMeteo.ts     # Service Open-Meteo Air Quality
│   │   ├── client.ts        # Helper fetch JSON aman + deteksi abort
│   │   ├── types.ts
│   │   └── index.ts
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── MapView.tsx
│   │   ├── LocationMarker.tsx
│   │   ├── WeatherPopup.tsx # Renderer section detail (cuaca/AQI/lokasi)
│   │   ├── LocationDetail.tsx
│   │   ├── SummaryCards.tsx
│   │   ├── AqiBadge.tsx
│   │   └── LoadingState.tsx
│   ├── config/
│   │   ├── locations.ts     # Daftar lokasi (lat/long/adm4)
│   │   └── appConfig.ts     # REFRESH_INTERVAL dll.
│   ├── hooks/
│   │   └── useWeatherData.ts
│   ├── types/
│   │   ├── location.ts
│   │   ├── weather.ts       # Tipe response BMKG + model cuaca internal
│   │   ├── airQuality.ts    # Tipe response Open-Meteo + model AQI internal
│   │   └── index.ts         # LocationWeatherData (data gabungan)
│   ├── utils/
│   │   ├── aqi.ts           # getAqiStatus() — kategori & warna AQI
│   │   ├── wind.ts          # getWindDirection() derajat → mata angin ID
│   │   ├── weather.ts       # Parser response BMKG → model internal
│   │   └── format.ts        # Format angka/tanggal locale id-ID, WIB
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── vercel.json
├── .env.example
└── package.json
```

## Menjalankan Secara Lokal

```bash
npm install
npm run dev      # http://localhost:5173
```

Build produksi:

```bash
npm run build    # tsc -b && vite build → dist/
npm run preview  # pratinjau hasil build
```

Cek tipe saja:

```bash
npm run typecheck
```

## Deploy ke Vercel

1. Push repository ini ke GitHub/GitLab/Bitbucket.
2. Import project di [vercel.com](https://vercel.com) — framework **Vite** terdeteksi otomatis.
3. Deploy. Tidak ada environment variable wajib.

Konfigurasi terkait sudah disiapkan:

- `vercel.json` — rewrite semua rute ke `index.html` (SPA refresh tetap bekerja) **kecuali** `/api/*`.
- `api/bmkg.ts` — serverless function `/api/bmkg?adm4=...` (lihat bagian CORS).

Atau via CLI:

```bash
npm i -g vercel
vercel        # staging
vercel --prod # produksi
```

## API yang Digunakan

### BMKG — Prakiraan Cuaca

```
https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=35.26.01.1001
```

Response berisi `lokasi` (info wilayah) dan `data[].cuaca[][]` — matriks periode prakiraan 3-hourly dengan field: `datetime`, `t` (suhu °C), `hu` (kelembapan %), `wd`/`wd_deg`/`wd_to` (arah angin), `ws` (kecepatan angin km/jam), `vs`/`vs_text` (visibilitas), `tcc` (tutupan awan %), `tp` (presipitasi mm), `weather`/`weather_desc`, `image` (ikon resmi BMKG), `local_datetime`, dst.

Parser ada di `src/utils/weather.ts` — dibuat berdasarkan response aktual dan aman terhadap field null/missing.

> Catatan penting: endpoint BMKG bersifat **per kode wilayah adm4** (desa/kelurahan). Setiap lokasi di `locations.ts` memiliki `adm4` masing-masing; fungsi `getBmkgWeather(location)` otomatis memakai `location.adm4`.

### Open-Meteo — Air Quality

```
https://air-quality-api.open-meteo.com/v1/air-quality?latitude=-7.04&longitude=112.74&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index,aerosol_optical_depth,ammonia&timezone=auto
```

Kedua API publik dan tidak butuh API key, sehingga tidak ada environment variable palsu.

## Cara Kerja Refresh Data

- `REFRESH_INTERVAL` di `src/config/appConfig.ts` (default `10 * 60 * 1000` = 10 menit).
- Interval dibuat **sekali** oleh `useWeatherData` (useEffect deps kosong), selalu di-`clearInterval` saat unmount, dan memakai ref agar tidak duplikat saat re-render.
- Tick auto-refresh dilewati saat tab tidak terlihat (`document.hidden`) dan dipicu ulang saat tab kembali aktif jika data sudah kedaluwarsa.
- Tombol **Refresh Data** di header memicu fetch manual; waktu pembaruan tampil di header.
- Semua fetch memakai `AbortController`; refresh baru membatalkan batch sebelumnya.

## Penanganan Error

- Fetch seluruh lokasi memakai `Promise.allSettled` → satu lokasi gagal tidak menghentikan lokasi lain.
- Di dalam satu lokasi pun BMKG & Open-Meteo diparalel dengan `allSettled`: jika BMKG gagal tapi Open-Meteo berhasil, data AQI tetap tampil (dan sebaliknya). Error per-sumber tampil sebagai banner kuning di panel detail, misalnya *"Data cuaca gagal dimuat (BMKG)"* atau *"Data kualitas udara sementara tidak tersedia"*.
- Field bernilai null/undefined **tidak pernah** dirender (`undefined/null/NaN` disembunyikan).

## Penanganan CORS

1. **Direct request** dari browser dicoba lebih dulu. Saat ini BMKG merespons `access-control-allow-origin: *` dan Open-Meteo mendukung penuh, jadi direct request bekerja.
2. **Fallback proxy** hanya jika direct gagal: service BMKG otomatis mengulang ke `/api/bmkg?adm4=...`.
   - Produksi: serverless function Vercel di `api/bmkg.ts` (satu repo tetap deploy langsung).
   - Development: path yang sama diteruskan Vite proxy ke `api.bmkg.go.id` (lihat `vite.config.ts`).
3. Tidak ada backend terpisah.

## Menambah / Mengubah Lokasi

Edit `src/config/locations.ts`:

```ts
{
  id: "bangkalan-01",            // unik
  name: "Bangkalan",
  latitude: -7.0,
  longitude: 112.7,
  adm4: "35.26.01.1001",         // kode wilayah desa/kelurahan versi BMKG
  description?: "Opsional"
}
```

- **Mengganti koordinat**: cukup ubah `latitude`/`longitude`. Koordinat dipakai untuk peta & Open-Meteo.
- **Mengganti kode ADM4 BMKG**: ubah `adm4`. Kode bisa diverifikasi dengan membuka
  `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=<kode>` di browser — pastikan `lokasi.desa` sesuai harapan.
- **Menambah lokasi baru**: duplikasi entri, ganti `id` (unik), nama, koordinat, dan `adm4` tujuan. Peta, summary, dan data akan menyesuaikan otomatis.
- Jika sebuah lokasi sengaja tanpa `adm4`, aplikasi tetap jalan: hanya data Open-Meteo yang tampil, dengan banner keterangan pada detailnya.

## Environment Variables

Lihat `.env.example`. Semua opsional — hanya untuk menimpa base URL API (misalnya saat testing mirror). Jangan commit file `.env`.

## Lisensi

Bebas digunakan untuk kebutuhan instansi/pemerintah. Data © BMKG dan © Open-Meteo, peta © OpenStreetMap contributors.
# pantau-bkl
