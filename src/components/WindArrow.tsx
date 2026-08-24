import { ArrowUp } from 'lucide-react';
import { getWindDirection } from '../utils/wind';

interface WindArrowProps {
  /** Arah angin dalam derajat dari data (field wd_deg BMKG, utara = 0°). */
  degree?: number;
  className?: string;
}

/**
 * Panah arah angin dengan acuan peta standar: UTARA = ATAS.
 * Basis ikon ArrowUp (menunjuk utara pada 0°), diputar PRESISI sesuai
 * derajat dari data — tanpa pembulatan:
 *   0° → atas    90° → kanan    180° → bawah    270° → kiri
 */
export function WindArrow({ degree, className = '' }: WindArrowProps) {
  if (typeof degree !== 'number' || !Number.isFinite(degree)) return null;

  const normalized = ((degree % 360) + 360) % 360;
  const fromLabel = getWindDirection(normalized);

  return (
    <span
      className={`inline-flex shrink-0 ${className}`}
      role="img"
      aria-label={`Arah angin ${fromLabel ?? ''} (${normalized.toFixed(0)}°)`}
      title={`Arah angin: ${fromLabel ?? ''} · ${normalized.toFixed(1)}°`}
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
