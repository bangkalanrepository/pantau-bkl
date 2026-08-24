/**
 * Struktur response BMKG Prakiraan Cuaca (api.bmkg.go.id/publik/prakiraan-cuaca).
 * Nama field mengikuti response aktual API, BUKAN asumsi.
 */

export interface BmkgAreaInfo {
  adm1?: string;
  adm2?: string;
  adm3?: string;
  adm4?: string;
  provinsi?: string;
  kotkab?: string;
  kecamatan?: string;
  desa?: string;
  lon?: number;
  lat?: number;
  timezone?: string;
  type?: string;
}

export interface BmkgWeatherPeriod {
  /** ISO UTC, contoh: "2026-08-24T05:00:00Z" */
  datetime?: string;
  /** Suhu (°C) */
  t?: number;
  /** Total cloud cover (%) */
  tcc?: number;
  /** Presipitasi (mm) */
  tp?: number;
  /** Kode cuaca numerik BMKG */
  weather?: number;
  weather_desc?: string;
  weather_desc_en?: string;
  /** Arah angin dalam derajat (arah asal) */
  wd_deg?: number;
  /** Arah angin kardinal (asal), contoh: "E" */
  wd?: string;
  /** Arah tiupan menuju, contoh: "W" */
  wd_to?: string;
  /** Kecepatan angin (km/jam) */
  ws?: number;
  /** Kelembapan relatif (%) */
  hu?: number;
  /** Visibilitas (meter) */
  vs?: number;
  vs_text?: string;
  time_index?: string;
  analysis_date?: string;
  image?: string;
  utc_datetime?: string;
  local_datetime?: string;
}

/** Satu entri data[] berisi lokasi + matriks periode cuaca per hari. */
export interface BmkgForecastEntry {
  lokasi?: BmkgAreaInfo;
  cuaca?: BmkgWeatherPeriod[][];
}

export interface BmkgApiResponse {
  lokasi?: BmkgAreaInfo;
  data?: BmkgForecastEntry[];
}

/** Satu item prakiraan ringkas untuk ditampilkan di UI. */
export interface ForecastItem {
  datetime?: string;
  localDatetime?: string;
  temperature?: number;
  weatherDescription?: string;
  iconUrl?: string;
}

/** Model internal data cuaca hasil parsing yang aman. */
export interface WeatherData {
  temperature?: number;
  humidity?: number;
  /** Kecepatan angin (km/jam). */
  windSpeed?: number;
  /** Hembusan (gust) bila tersedia dari sumber manapun. */
  gusts?: number;
  /** Arah asal angin dalam derajat (0–360). */
  windDirectionDeg?: number;
  /** Kardinal versi API (EN), contoh: "E". */
  windDirectionCardinal?: string;
  /** Kardinal versi Bahasa Indonesia, contoh: "Timur". */
  windDirectionText?: string;
  weatherCode?: number;
  weatherDescription?: string;
  weatherDescriptionEn?: string;
  /** Visibilitas dalam meter. */
  visibility?: number;
  /** Teks visibilitas dari BMKG, contoh: "> 10 km". */
  visibilityText?: string;
  /** Tutupan awan (%). */
  cloudCover?: number;
  /** Presipitasi (mm). */
  precipitation?: number;
  /** URL ikon cuaca resmi BMKG. */
  iconUrl?: string;
  /** Waktu periode prakiraan terpilih (ISO UTC). */
  observedAt?: string;
  /** Waktu lokal versi BMKG, contoh: "2026-08-24 12:00:00". */
  observedLocalTime?: string;
  analysisDate?: string;
  /** Prakiraan beberapa periode setelah waktu terpilih. */
  forecast?: ForecastItem[];
}
