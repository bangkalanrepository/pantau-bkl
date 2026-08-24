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

/** Kembalikan nama arah angin; undefined bila input tidak valid. */
export function getWindDirection(degree?: number): string | undefined {
  if (typeof degree !== 'number' || !Number.isFinite(degree)) return undefined;
  const normalized = ((degree % 360) + 360) % 360;
  return COMPASS_POINTS[Math.round(normalized / 45) % COMPASS_POINTS.length];
}
