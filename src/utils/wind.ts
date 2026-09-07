/**
 * Konversi derajat ke arah mata angin (8 penjuru) dalam Bahasa Indonesia.
 *
 *   0 → Utara, 45 → Timur Laut, 90 → Timur, 135 → Tenggara,
 *   180 → Selatan, 225 → Barat Daya, 270 → Barat, 315 → Barat Laut
 */
const COMPASS_POINTS = [
  'Utara',
  'Timur Laut',
  'Timur',
  'Tenggara',
  'Selatan',
  'Barat Daya',
  'Barat',
  'Barat Laut',
] as const;

/** Normalisasi derajat ke rentang 0–360. */
export function normalizeDegrees(degree: number): number {
  return ((degree % 360) + 360) % 360;
}

/**
 * Ubah derajat arah ASAL (BMKG `wd_deg`) menjadi derajat arah TUJUAN angin
 * (ke mana) dengan menambahkan 180°. Contoh: asal Utara (0°) → tujuan Selatan (180°).
 */
export function toWindDestinationDegrees(degree?: number): number | undefined {
  if (typeof degree !== 'number' || !Number.isFinite(degree)) return undefined;
  return normalizeDegrees(degree + 180);
}

/** Kembalikan nama arah angin; undefined bila input tidak valid. */
export function getWindDirection(degree?: number): string | undefined {
  if (typeof degree !== 'number' || !Number.isFinite(degree)) return undefined;
  const normalized = normalizeDegrees(degree);
  return COMPASS_POINTS[Math.round(normalized / 45) % COMPASS_POINTS.length];
}

export interface WindSector {
  name: string;
  /** Derajat ideal penjuru ini. */
  ideal: number;
  /** Rentang label dalam teks siap tampil (pembulatan ±22,5°). */
  range: string;
}

/** Rentang derajat tiap penjuru untuk tampilan panduan. */
export const WIND_SECTORS: readonly WindSector[] = [
  { name: 'Utara', ideal: 0, range: '337,5° – 22,5°' },
  { name: 'Timur Laut', ideal: 45, range: '22,5° – 67,5°' },
  { name: 'Timur', ideal: 90, range: '67,5° – 112,5°' },
  { name: 'Tenggara', ideal: 135, range: '112,5° – 157,5°' },
  { name: 'Selatan', ideal: 180, range: '157,5° – 202,5°' },
  { name: 'Barat Daya', ideal: 225, range: '202,5° – 247,5°' },
  { name: 'Barat', ideal: 270, range: '247,5° – 292,5°' },
  { name: 'Barat Laut', ideal: 315, range: '292,5° – 337,5°' },
];
