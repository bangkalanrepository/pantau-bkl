import { useCallback, useEffect, useRef, useState } from 'react';
import { CircleHelp, X } from 'lucide-react';
import { WIND_SECTORS } from '../utils/wind';
import { getWindDirection } from '../utils/wind';

interface WindDegreeGuideProps {
  /** Derajat angin lokasi terkait; bila ada, kompas menampilkan panah posisi saat ini. */
  degree?: number;
  /** 'icon' = tombol kecil di baris tabel; 'chip' = tombol mengambang di peta. */
  variant?: 'icon' | 'chip';
}

/** Kompas SVG: utara di atas, garis tiap 45°, dan panah presisi derajat (opsional). */
function CompassDial({ degree }: { degree?: number }) {
  const ticks = WIND_SECTORS.map((sector) => {
    const rad = ((sector.ideal - 90) * Math.PI) / 180;
    const x1 = 80 + Math.cos(rad) * 54;
    const y1 = 80 + Math.sin(rad) * 54;
    const x2 = 80 + Math.cos(rad) * 64;
    const y2 = 80 + Math.sin(rad) * 64;
    return <line key={sector.name} x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-slate-300" strokeWidth={2} />;
  });

  const labels = [
    { text: 'U', deg: 0 },
    { text: 'TL', deg: 45 },
    { text: 'T', deg: 90 },
    { text: 'TG', deg: 135 },
    { text: 'S', deg: 180 },
    { text: 'BD', deg: 225 },
    { text: 'B', deg: 270 },
    { text: 'BL', deg: 315 },
  ].map(({ text, deg }) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return (
      <text
        key={text}
        x={80 + Math.cos(rad) * 74}
        y={80 + Math.sin(rad) * 74}
        textAnchor="middle"
        dominantBaseline="central"
        className={`fill-slate-500 ${text.length === 1 ? 'text-[11px] font-bold' : 'text-[9px] font-medium'}`}
      >
        {text}
      </text>
    );
  });

  return (
    <svg viewBox="0 0 160 160" className="mx-auto h-40 w-40" role="img" aria-label="Diagram kompas arah angin">
      <circle cx="80" cy="80" r="64" className="fill-sky-50 stroke-slate-200" strokeWidth={1.5} />
      {ticks}
      {labels}
      {degree !== undefined && (
        <g transform={`rotate(${degree} 80 80)`}>
          {/* Panah presisi: kepala di tepi luar, ekor di pusat */}
          <line x1="80" y1="84" x2="80" y2="52" className="stroke-sky-600" strokeWidth={4} strokeLinecap="round" />
          <polygon points="80,32 89,54 71,54" className="fill-sky-600" />
        </g>
      )}
      <circle cx="80" cy="80" r="4" className="fill-slate-700" />
    </svg>
  );
}

/** Tombol bantuan + modal panduan derajat arah angin. */
export function WindDegreeGuide({ degree, variant = 'icon' }: WindDegreeGuideProps) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  const currentLabel = typeof degree === 'number' && Number.isFinite(degree) ? getWindDirection(degree) : undefined;

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Panduan derajat arah angin"
          title="Panduan derajat arah angin"
          className="grid h-4.5 w-4.5 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-sky-700"
        >
          <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-sky-800"
        >
          <CircleHelp className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
          Panduan Angin
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={close}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Panduan derajat arah angin"
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-bold text-slate-900">Panduan Derajat Arah Angin</h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                aria-label="Tutup panduan"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </header>

            <div className="space-y-3 px-4 py-3">
              <CompassDial degree={degree} />

              {typeof degree === 'number' && Number.isFinite(degree) && (
                <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs leading-relaxed text-sky-900">
                  Saat ini angin lokasi ini berasal dari{' '}
                  <strong>{currentLabel ?? `${Math.round(degree)}°`}</strong> ({degree.toFixed(1)}°) — lihat posisi
                  panah pada kompas.
                </p>
              )}

              <p className="text-xs leading-relaxed text-slate-600">
                Panah berputar <strong>presisi sesuai derajat data</strong> dengan acuan{' '}
                <strong>utara = atas</strong>. Sementara label teks memakai 8 penjuru mata angin hasil pembulatan
                kelipatan 45° (rentang ±22,5°):
              </p>

              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400">
                    <th className="py-1.5 font-medium">Arah</th>
                    <th className="py-1.5 font-medium">Derajat ideal</th>
                    <th className="py-1.5 font-medium">Rentang label</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {WIND_SECTORS.map((sector) => (
                    <tr key={sector.name}>
                      <td className="py-1.5 font-medium text-slate-700">{sector.name}</td>
                      <td className="py-1.5 text-slate-500">{sector.ideal}°</td>
                      <td className="py-1.5 text-slate-500">{sector.range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="text-[11px] leading-relaxed text-slate-400">
                Catatan: nilai derajat dari BMKG (<code>wd_deg</code>) adalah arah <strong>asal</strong> angin.
                Arahkan kursor ke panah mana pun untuk melihat derajatnya.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
