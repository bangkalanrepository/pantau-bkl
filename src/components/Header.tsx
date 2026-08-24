import { Activity, RefreshCw } from 'lucide-react';
import { APP_NAME, APP_SUBTITLE } from '../config/appConfig';
import { formatClock } from '../utils/format';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: string | null;
}

/** Header aplikasi: nama, subtitle, waktu pembaruan terakhir, dan tombol refresh. */
export function Header({ onRefresh, isRefreshing, lastUpdated }: HeaderProps) {
  const clock = formatClock(lastUpdated ?? undefined);

  return (
    <header className="sticky top-0 z-[1200] shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-3 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-700 text-white shadow-sm">
            <Activity className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold leading-tight tracking-tight text-slate-900 sm:text-lg">
              {APP_NAME}
            </h1>
            <p className="hidden truncate text-xs text-slate-500 sm:block">{APP_SUBTITLE}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh Data"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-800 active:bg-sky-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
          <span className="hidden text-[11px] leading-none text-slate-400 md:block" aria-live="polite">
            {clock ? `Diperbarui ${clock}` : 'Belum ada pembaruan'}
          </span>
        </div>
      </div>
    </header>
  );
}
