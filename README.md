# Pantau BKL

Dashboard pemantauan **cuaca** dan **kualitas udara** untuk seluruh **18 kecamatan di Kabupaten Bangkalan** (dan daerah lain yang mudah ditambahkan). Dibangun sebagai SPA React + Vite tanpa backend sendiri — data diambil langsung dari API publik **BMKG** dan **Open-Meteo**, dengan peta interaktif **Leaflet**.

![Stack](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple) ![Tailwind](https://img.shields.io/badge/TailwindCSS-4-cyan)

## Fitur

### Peta & Marker
- Peta Leaflet + OpenStreetMap; marker tiap lokasi **berwarna sesuai status kualitas udara** (satu sumber warna: `getAqiStatus()`).
- Info ringkas **selalu terlihat** di setiap titik: nama daerah, suhu, kelembapan, arah & kecepatan angin.
- Panah arah angin **menunjuk ke arah angin menuju** (ke mana) dan **berputar presisi sesuai derajat yang ditampilkan**, acuan utara = atas (0° = utara).
- Viewport peta memakai `DEFAULT_MAP_ZOOM` (11.5) dan `DEFAULT_MAP_CENTER` langsung — tanpa `fitBounds`.
- Klik marker → panel detail lengkap; **Kecamatan Bangkalan tampil sebagai default** saat halaman dibuka.

### Panel Detail
- **Informasi Cuaca (BMKG)**: suhu, kelembapan, kondisi & deskripsi cuaca, arah angin (+derajat), kecepatan angin, gust, visibilitas, tutupan awan, presipitasi, kode cuaca, waktu analisis, ikon resmi BMKG, dan prakiraan 4 periode berikutnya.
- **Kualitas Udara (Open-Meteo)**: US AQI & European AQI, PM10, PM2.5, CO, NO₂, SO₂, O₃, debu, indeks UV, aerosol optical depth, amonia.
- **Kesimpulan bahasa awam**: identifikasi polutan dominan dibandingkan ambang acuan harian WHO 2021 + saran aktivitas per kategori (dibangun dari data hasil fetch, bukan teks statis).
- **Atribusi sumber**: tautan BMKG pada fakta cuaca dan Open-Meteo pada kualitas udara.
- Field null/kosong **tidak pernah dirender** (`undefined/null/NaN` disembunyikan).

### Panduan Derajat Arah Angin
- Tombol bantuan ❔ di baris "Arah Angin" dan chip "Panduan Angin" di pojok peta (chip mengikuti derajat lokasi yang sedang terpilih).
- Membuka modal berisi kompas visual (panah menunjuk arah tujuan lokasi terkait), ringkasan *menuju/asal*, tabel rentang 8 penjuru (±22,5° per sektor), dan catatan konvensi: derajat tampil = arah tujuan, kebalikan dari `wd_deg` BMKG (arah asal).

### Dashboard
- Summary cards: jumlah lokasi, suhu rata-rata/tertinggi/terendah (+nama lokasinya), kelembapan rata-rata, status kualitas udara agregat.
- Refresh manual + auto-refresh tiap 10 menit (konfigurable) dengan stempel waktu pembaruan.
- Loading skeleton, banner error per-sumber — BMKG dan Open-Meteo saling menggantikan bila salah satu gagal.
- Responsive: sidebar detail di desktop, panel di bawah peta pada mobile.
- Layout **full width** (tanpa batas `max-width`) — header, ringkasan, dan konten mengisi seluruh lebar layar.

## Teknologi

| Teknologi | Peran |
| --- | --- |
| React 19 + TypeScript (strict, tanpa `any`) | UI library |
| Vite 7 | Build tool & dev server |
| Tailwind CSS 4 | Styling |
| Leaflet + React Leaflet 5 | Peta |
| Lucide React | Icon |
| Native fetch + AbortController | HTTP request |

Tidak memakai Next.js. Output build statis (`dist/`) sehingga deploy ke Vercel sangat sederhana.

## Struktur Project

```text
pantau-bkl/
├── api/
│   └── bmkg.ts              # Serverless function /api/bmkg (fallback CORS)
├── public/
│   ├── favicon.svg
│   └── icon.png             # Logo header
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
│   │   ├── WeatherPopup.tsx     # Renderer section detail (cuaca/AQI/lokasi)
│   │   ├── LocationDetail.tsx
│   │   ├── SummaryCards.tsx
│   │   ├── AqiBadge.tsx
│   │   ├── WindArrow.tsx        # Panah arah angin presisi derajat
│   │   ├── WindDegreeGuide.tsx  # Modal panduan derajat arah angin
│   │   └── LoadingState.tsx
│   ├── config/
│   │   ├── locations.ts     # 18 kecamatan Bangkalan (lat/long/adm4)
│   │   └── appConfig.ts     # REFRESH_INTERVAL dll.
│   ├── hooks/
│   │   └── useWeatherData.ts
│   ├── types/
│   │   ├── location.ts
│   │   ├── weather.ts       # Tipe response BMKG + model cuaca internal
│   │   ├── airQuality.ts    # Tipe response Open-Meteo + model AQI internal
│   │   └── index.ts         # LocationWeatherData (data gabungan)
│   ├── utils/
│   │   ├── aqi.ts               # getAqiStatus() — kategori & warna AQI
│   │   ├── airQualityInsight.ts # Kesimpulan bahasa awam dari data fetch
│   │   ├── wind.ts              # getWindDirection(), normalizeDegrees/toWindDestinationDegrees, WIND_SECTORS
│   │   ├── weather.ts           # Parser response BMKG → model internal
│   │   └── format.ts            # Format angka/tanggal id-ID, WIB
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
https://air-quality-api.open-meteo.com/v1/air-quality?latitude=-7.03&longitude=112.75&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index,aerosol_optical_depth,ammonia&timezone=auto
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

## Penanganan CORS

1. **Direct request** dari browser dicoba lebih dulu. Saat ini BMKG merespons `access-control-allow-origin: *` dan Open-Meteo mendukung penuh, jadi direct request bekerja.
2. **Fallback proxy** hanya jika direct gagal: service BMKG otomatis mengulang ke `/api/bmkg?adm4=...`.
   - Produksi: serverless function Vercel di `api/bmkg.ts` (satu repo tetap deploy langsung).
   - Development: path yang sama diteruskan Vite proxy ke `api.bmkg.go.id` (lihat `vite.config.ts`).
3. Tidak ada backend terpisah.

## Data Lokasi & Menambah Lokasi Baru

Seluruh **18 kecamatan Kabupaten Bangkalan sudah dikonfigurasi** di `src/config/locations.ts` dengan koordinat titik resmi dan kode `adm4` yang **sudah diverifikasi aktif** di API BMKG.

Format entri:

```ts
{
  id: "bangkalan",          // unik
  name: "Bangkalan",
  latitude: -7.0293813,
  longitude: 112.7474965,
  adm4: "35.26.01.1001",    // kode desa/kelurahan versi BMKG
}
```

- **Mengganti koordinat**: cukup ubah `latitude`/`longitude`. Koordinat dipakai untuk peta & Open-Meteo.
- **Mengganti kode ADM4 BMKG**: ubah `adm4`. Verifikasi dengan membuka
  `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=<kode>` — pastikan `lokasi.desa` sesuai harapan.
- **Menambah lokasi baru**: duplikasi entri, ganti `id` (unik), nama, koordinat, dan `adm4` tujuan. Peta, summary, dan data menyesuaikan otomatis.
- **Lokasi default panel detail**: entri **pertama** pada array `LOCATIONS` (saat ini Bangkalan) otomatis menjadi lokasi terpilih saat halaman dibuka.
- Jika sebuah lokasi sengaja tanpa `adm4`, aplikasi tetap jalan: hanya data Open-Meteo yang tampil, dengan banner keterangan pada detailnya.

## Konvensi Arah Angin

- `wd_deg` dari BMKG adalah **arah asal** angin (derajat, utara = 0°).
- Aplikasi menambahkan 180° sehingga derajat yang **tampil** adalah arah **tujuan** angin (ke mana): 0° = utara = angin menuju utara. Panah berputar presisi mengikuti nilai ini, utara di atas.
- Label teks membulatkan derajat ke 8 penjuru mata angin (rentang ±22,5° per penjuru) — rincian tersedia lewat tombol **Panduan Angin** di aplikasi.

## Environment Variables

Lihat `.env.example`. Semua opsional — hanya untuk menimpa base URL API (misalnya saat testing mirror). Jangan commit file `.env`.

## Lisensi

Bebas digunakan untuk kebutuhan instansi/pemerintah. Data © BMKG dan © Open-Meteo, peta © OpenStreetMap contributors.
