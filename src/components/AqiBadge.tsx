import { getAqiStatus } from '../utils/aqi';
import type { AqiScale } from '../utils/aqi';
import { formatNumber } from '../utils/format';

interface AqiBadgeProps {
  /** Nilai AQI; komponen merender null bila tidak tersedia (jangan tampilkan kosong). */
  aqi?: number;
  scale?: AqiScale;
  size?: 'sm' | 'lg';
  showDescription?: boolean;
}

/**
 * Badge status kualitas udara: nilai + kategori + warna.
 * Warna/kategori diambil dari satu utilitas getAqiStatus() —
 * jangan hardcode warna di tempat lain.
 */
export function AqiBadge({ aqi, scale = 'us', size = 'sm', showDescription = false }: AqiBadgeProps) {
  const status = getAqiStatus(aqi, scale);
  if (!status) return null;

  const value = formatNumber(aqi, 0);
  const isLarge = size === 'lg';

  return (
    <div className={showDescription ? 'space-y-1' : undefined}>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${status.badge} ${
          isLarge ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'
        }`}
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`} aria-hidden="true" />
        {status.label}
        {value !== undefined && (
          <span className={`font-semibold ${isLarge ? 'text-sm' : 'text-xs'}`} aria-hidden="true">
            · {value}
          </span>
        )}
      </span>
      {showDescription && <p className="text-xs leading-relaxed text-slate-500">{status.description}</p>}
    </div>
  );
}
