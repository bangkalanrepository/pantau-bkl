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
 * Panah menunjuk persis ke penjuru mata angin pada data:
 *   0°   → atas    (Utara)
 *   90°  → kanan   (Timur)
 *   180° → bawah   (Selatan)
 *   270° → kiri    (Barat)
 *
 * Rotasi = nilai derajat apa adanya sehingga selalu konsisten dengan
 * teks arah yang ditampilkan di sampingnya.
 */
export function WindArrow({ degree, className = '' }: WindArrowProps) {
  if (typeof degree !== 'number' || !Number.isFinite(degree)) return null;

  const normalized = ((degree % 360) + 360) % 360;
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
        style={{ transform: `rotate(${normalized}deg)` }}
        strokeWidth={2.5}
        aria-hidden="true"
      />
    </span>
  );
}
