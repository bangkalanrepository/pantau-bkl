/** Konfigurasi global aplikasi. */

export const APP_NAME = 'Pantau BKL';
export const APP_SUBTITLE = 'Pemantauan Cuaca & Kualitas Udara Kabupaten Bangkalan';

/**
 * Interval auto-refresh data (milidetik). Default: 10 menit.
 * Interval dikelola sekali di `useWeatherData` — tidak dibuat ulang saat
 * komponen re-render, dan selalu di-cleanup oleh useEffect.
 */
export const REFRESH_INTERVAL = 10 * 60 * 1000;

/** Pusat peta default sebelum fitBounds aktif (centroid seluruh lokasi). */
export const DEFAULT_MAP_CENTER: [number, number] = [-7.0513, 112.8948];
export const DEFAULT_MAP_ZOOM = 10;

export const MAP_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

/** Zona waktu yang dipakai untuk menampilkan waktu (WIB). */
export const DISPLAY_TIME_ZONE = 'Asia/Jakarta';
