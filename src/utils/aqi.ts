/**
 * Kategori status kualitas udara — SATU sumber kebenaran untuk warna & label.
 * Jangan hardcode warna AQI di komponen lain; selalu lewat getAqiStatus().
 */

export type AqiScale = 'us' | 'europe';

export interface AqiStatus {
  /** Urutan level 0 (terbaik) sampai 5 (terburuk). */
  level: number;
  label: string;
  description: string;
  /** Kelas Tailwind untuk badge (bg + text + border). */
  badge: string;
  /** Kelas Tailwind untuk titik indikator warna. */
  dot: string;
  /** Warna heks untuk kebutuhan non-Tailwind (marker peta). */
  color: string;
}

interface AqiBand {
  max: number;
  label: string;
  description: string;
  badge: string;
  dot: string;
  color: string;
}

const US_BANDS: readonly AqiBand[] = [
  {
    max: 50,
    label: 'Baik',
    description: 'Kualitas udara memuaskan, risiko polusi minim.',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    color: '#10b981',
  },
  {
    max: 100,
    label: 'Sedang',
    description: 'Dapat diterima; kelompok sangat sensitif perlu waspada.',
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-300',
    dot: 'bg-yellow-400',
    color: '#facc15',
  },
  {
    max: 150,
    label: 'Tidak Sehat bagi Kelompok Sensitif',
    description: 'Anak-anak, lansia, dan penderita penyakit pernapasan sebaiknya mengurangi aktivitas luar ruang.',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    color: '#f97316',
  },
  {
    max: 200,
    label: 'Tidak Sehat',
    description: 'Seluruh populasi dapat mulai terdampak; batasi aktivitas di luar ruang.',
    badge: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
    color: '#ef4444',
  },
  {
    max: 300,
    label: 'Sangat Tidak Sehat',
    description: 'Peringatan kesehatan; hindari aktivitas fisik di luar ruang.',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-600',
    color: '#9333ea',
  },
  {
    max: Number.POSITIVE_INFINITY,
    label: 'Berbahaya',
    description: 'Kondisi darurat kesehatan masyarakat; tetap di dalam ruangan.',
    badge: 'bg-rose-950 text-rose-100 border-rose-900',
    dot: 'bg-rose-800',
    color: '#9f1239',
  },
];

/** Band resmi European AQI (0–20 baik … >100 ekstrem buruk). */
const EUROPE_BANDS: readonly AqiBand[] = [
  {
    max: 20,
    label: 'Baik',
    description: 'Kualitas udara memuaskan, risiko polusi minimal.',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    color: '#10b981',
  },
  {
    max: 40,
    label: 'Cukup Baik',
    description: 'Kualitas udara dapat diterima.',
    badge: 'bg-lime-50 text-lime-700 border-lime-200',
    dot: 'bg-lime-500',
    color: '#84cc16',
  },
  {
    max: 60,
    label: 'Sedang',
    description: 'Kelompok sensitif perlu waspada.',
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-300',
    dot: 'bg-yellow-400',
    color: '#facc15',
  },
  {
    max: 80,
    label: 'Buruk',
    description: 'Kelompok sensitif dapat mengalami gejala kesehatan.',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    color: '#f97316',
  },
  {
    max: 100,
    label: 'Sangat Buruk',
    description: 'Pengaruh kesehatan dirasakan seluruh populasi.',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-600',
    color: '#9333ea',
  },
  {
    max: Number.POSITIVE_INFINITY,
    label: 'Ekstrem Buruk',
    description: 'Kondisi darurat kesehatan masyarakat.',
    badge: 'bg-rose-950 text-rose-100 border-rose-900',
    dot: 'bg-rose-800',
    color: '#9f1239',
  },
];

/**
 * Tentukan status kualitas udara dari nilai AQI.
 * @param aqi   Nilai AQI (boleh undefined → hasil undefined).
 * @param scale 'us' (default) atau 'europe'.
 */
export function getAqiStatus(aqi?: number, scale: AqiScale = 'us'): AqiStatus | undefined {
  if (typeof aqi !== 'number' || !Number.isFinite(aqi)) return undefined;
  const bands = scale === 'europe' ? EUROPE_BANDS : US_BANDS;
  const band = bands.find((item) => aqi <= item.max) ?? bands[bands.length - 1];
  return {
    level: bands.indexOf(band),
    label: band.label,
    description: band.description,
    badge: band.badge,
    dot: band.dot,
    color: band.color,
  };
}
