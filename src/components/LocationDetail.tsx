import { AlertTriangle, X } from 'lucide-react';
import type { LocationWeatherData } from '../types';
import { WeatherPopup } from './WeatherPopup';
import { LoadingIndicator } from './LoadingState';

interface ErrorBannerProps {
  title: string;
  detail?: string;
}

/** Banner peringatan per-sumber; kegagalan satu API tidak menutup data sumber lain. */
function ErrorBanner({ title, detail }: ErrorBannerProps) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2" role="alert">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-amber-800">{title}</p>
        {detail !== undefined && <p className="text-xs text-amber-700">{detail}</p>}
      </div>
    </div>
  );
}

interface LocationDetailProps {
  entry?: LocationWeatherData;
  isLoading: boolean;
  onClose: () => void;
}

/**
 * Panel detail lokasi terpilih.
 * Desktop: sidebar di kiri peta. Mobile: panel di bawah peta.
 * Dapat ditutup dengan tombol X.
 */
export function LocationDetail({ entry, isLoading, onClose }: LocationDetailProps) {
  return (
    <aside
      aria-label={entry !== undefined ? `Detail lokasi ${entry.location.name}` : 'Detail lokasi'}
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-slate-900">
            {entry?.location.name ?? 'Detail Lokasi'}
          </h2>
          {entry?.location.description !== undefined && (
            <p className="truncate text-xs text-slate-500">{entry.location.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup panel detail"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {isLoading && entry === undefined && (
          <LoadingIndicator label="Memuat data lokasi..." />
        )}

        {entry === undefined ? null : (
          <>
            {entry.errors?.bmkg !== undefined && (
              <ErrorBanner title="Data cuaca gagal dimuat (BMKG)" detail={entry.errors.bmkg} />
            )}
            {entry.errors?.airQuality !== undefined && (
              <ErrorBanner title="Data kualitas udara sementara tidak tersedia" detail={entry.errors.airQuality} />
            )}
            <WeatherPopup entry={entry} />
          </>
        )}
      </div>
    </aside>
  );
}
