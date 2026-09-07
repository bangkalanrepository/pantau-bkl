import { ArrowUp } from 'lucide-react';
import { getWindDirection, normalizeDegrees } from '../utils/wind';

interface WindArrowProps {
  /**
   * Arah TUJUAN angin (ke mana) dalam derajat, 0° = Utara.
   * Nilai ini sudah dikonversi dari wd_deg BMKG (arah asal) oleh lapisan data.
   */
  degree?: number;
  className?: string;
}

/**
 * Panah arah angin dengan acuan peta standar: UTARA = ATAS.
 * Basis ikon ArrowUp (menunjuk utara pada 0°), diputar PRESISI sesuai
 * derajat tujuan angin — tanpa pembulatan:
 *   0° → atas    90° → kanan    180° → bawah    270° → kiri
 */
export function WindArrow({ degree, className = '' }: WindArrowProps) {
  if (typeof degree !== 'number' || !Number.isFinite(degree)) return null;

  const normalized = normalizeDegrees(degree);
  const toLabel = getWindDirection(normalized);

  return (
    <span
      className={`inline-flex shrink-0 ${className}`}
      role="img"
      aria-label={`Angin menuju ${toLabel ?? ''} (${normalized.toFixed(0)}°)`}
      title={`Angin menuju: ${toLabel ?? ''} · ${normalized.toFixed(1)}°`}
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
