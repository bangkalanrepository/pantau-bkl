import { ArrowUp } from 'lucide-react';
import { getWindDirection } from '../utils/wind';

interface WindArrowProps {
  /** Arah angin dalam derajat dari data (field wd_deg BMKG, utara = 0°). */
  degree?: number;
  className?: string;
}

/**
 * Panah arah angin dengan acuan peta standar: UTARA = ATAS.
 *
 * Rotasi di-SNAP ke 8 penjuru mata angin sehingga panah PERSIS mengarah
 * seperti teks yang tampil di sebelahnya (bukan derajat mentah):
 *   Utara      → atas          Selatan     → bawah
 *   Timur Laut → kanan atas    Barat Daya  → kiri bawah
 *   Timur      → kanan         Barat       → kiri
 *   Tenggara   → kanan bawah   Barat Laut  → kiri atas
 */
export function WindArrow({ degree, className = '' }: WindArrowProps) {
  if (typeof degree !== 'number' || !Number.isFinite(degree)) return null;

  const normalized = ((degree % 360) + 360) % 360;
  // Snap ke kelipatan 45° agar konsisten dengan label 8 penjuru.
  const snapped = (Math.round(normalized / 45) * 45) % 360;
  const fromLabel = getWindDirection(normalized);

  return (
    <span
      className={`inline-flex shrink-0 ${className}`}
      role="img"
      aria-label={`Arah angin dari ${fromLabel ?? `${Math.round(degree)} derajat`}`}
      title={`Arah angin: ${fromLabel ?? ''} (${Math.round(degree)}°)`}
    >
      <ArrowUp
        className="h-full w-full"
        style={{ transform: `rotate(${snapped}deg)` }}
        strokeWidth={2.5}
        aria-hidden="true"
      />
    </span>
  );
}
