import { Loader2 } from 'lucide-react';

/** Garis skeleton dengan lebar variatif. */
export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} aria-hidden="true" />;
}

/** Kartu skeleton untuk summary cards saat pemuatan awal. */
export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <SkeletonLine className="h-3 w-16" />
      <SkeletonLine className="mt-2 h-6 w-20" />
      <SkeletonLine className="mt-2 h-3 w-24" />
    </div>
  );
}

/** Indikator loading inline dengan teks "Memuat data...". */
export function LoadingIndicator({ label = 'Memuat data...', className = '' }: { label?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-sm text-slate-500 ${className}`} role="status">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

/** Placeholder konten detail berisi beberapa garis skeleton. */
export function DetailSkeleton({ rows = 8 }: { rows?: number }) {
  const widths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/6', 'w-1/2', 'w-3/4', 'w-2/3', 'w-1/2', 'w-5/6'];
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <SkeletonLine key={index} className={`h-4 ${widths[index % widths.length]}`} />
      ))}
    </div>
  );
}

/** Pembungkus generik untuk area yang sedang memuat. */
export function LoadingBlock({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-slate-400">
      <LoadingIndicator label={label} />
    </div>
  );
}
