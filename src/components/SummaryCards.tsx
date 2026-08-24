import { useMemo } from 'react';
import { ArrowDown, ArrowUp, Droplets, MapPin, Thermometer, Wind } from 'lucide-react';
import type { Location, LocationWeatherData } from '../types';
import { getAqiStatus } from '../utils/aqi';
import { formatNumber, formatPercent, isFiniteNumber } from '../utils/format';
import { SkeletonCard } from './LoadingState';

interface SummaryCardsProps {
  locations: readonly Location[];
  dataMap: Record<string, LocationWeatherData>;
  isLoading: boolean;
}

interface NumericSummary {
  average?: number;
  min?: number;
  max?: number;
}

/** Hitung ringkasan numerik dari lokasi yang BERHASIL mendapatkan data. */
function summarize(values: Array<number | undefined>): NumericSummary {
  const valid = values.filter(isFiniteNumber);
  if (valid.length === 0) return {};
  const total = valid.reduce((sum, value) => sum + value, 0);
  return {
    average: total / valid.length,
    min: Math.min(...valid),
    max: Math.max(...valid),
  };
}

function findLocationOfValue(
  dataMap: Record<string, LocationWeatherData>,
  pick: (entry: LocationWeatherData) => number | undefined,
  target: number,
): string | undefined {
  for (const entry of Object.values(dataMap)) {
    const value = pick(entry);
    if (value === target) return entry.location.name;
  }
  return undefined;
}

function StatCard({
  icon,
  iconClass,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${iconClass}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-lg font-semibold leading-tight text-slate-900">{value}</p>
        {sub !== undefined && <p className="mt-0.5 truncate text-xs text-slate-500">{sub}</p>}
      </div>
    </div>
  );
}

/** Kartu ringkasan di atas peta; data dihitung dari lokasi yang berhasil dimuat. */
export function SummaryCards({ locations, dataMap, isLoading }: SummaryCardsProps) {
  const entries = useMemo(() => Object.values(dataMap), [dataMap]);

  const temperature = useMemo(() => summarize(entries.map((e) => e.weather.temperature)), [entries]);
  const humidity = useMemo(() => summarize(entries.map((e) => e.weather.humidity)), [entries]);
  const aqi = useMemo(() => summarize(entries.map((e) => e.airQuality.usAqi)), [entries]);

  const aqiStatus = getAqiStatus(aqi.average);

  const maxTempLocation =
    temperature.max !== undefined
      ? findLocationOfValue(dataMap, (entry) => entry.weather.temperature, temperature.max)
      : undefined;
  const minTempLocation =
    temperature.min !== undefined
      ? findLocationOfValue(dataMap, (entry) => entry.weather.temperature, temperature.min)
      : undefined;

  if (isLoading && entries.length === 0) {
    return (
      <section aria-label="Ringkasan" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 sm:gap-3">
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </section>
    );
  }

  return (
    <section aria-label="Ringkasan" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 sm:gap-3">
      <StatCard
        icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
        iconClass="bg-sky-50 text-sky-700"
        label="Jumlah Lokasi"
        value={locations.length}
        sub={`${entries.length} loksi berdata`}
      />
      <StatCard
        icon={<Thermometer className="h-5 w-5" aria-hidden="true" />}
        iconClass="bg-amber-50 text-amber-700"
        label="Suhu Rata-rata"
        value={temperature.average !== undefined ? `${formatNumber(temperature.average)}°C` : '–'}
        sub={temperature.average !== undefined ? 'dari lokasi berdata' : undefined}
      />
      <StatCard
        icon={<ArrowUp className="h-5 w-5" aria-hidden="true" />}
        iconClass="bg-orange-50 text-orange-600"
        label="Suhu Tertinggi"
        value={temperature.max !== undefined ? `${formatNumber(temperature.max)}°C` : '–'}
        sub={maxTempLocation}
      />
      <StatCard
        icon={<ArrowDown className="h-5 w-5" aria-hidden="true" />}
        iconClass="bg-blue-50 text-blue-700"
        label="Suhu Terendah"
        value={temperature.min !== undefined ? `${formatNumber(temperature.min)}°C` : '–'}
        sub={minTempLocation}
      />
      <StatCard
        icon={<Droplets className="h-5 w-5" aria-hidden="true" />}
        iconClass="bg-cyan-50 text-cyan-700"
        label="Kelembapan Rata-rata"
        value={formatPercent(humidity.average) ?? '–'}
        sub={humidity.average !== undefined ? 'kelembapan relatif' : undefined}
      />
      <StatCard
        icon={<Wind className={`h-5 w-5 ${aqiStatus ? '' : 'text-slate-300'}`} aria-hidden="true" />}
        iconClass="bg-emerald-50 text-emerald-700"
        label="Kualitas Udara"
        value={
          aqiStatus ? (
            <span className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${aqiStatus.dot}`} aria-hidden="true" />
              {aqiStatus.label}
            </span>
          ) : (
            '–'
          )
        }
        sub={aqi.average !== undefined ? `Rata-rata US AQI ${formatNumber(aqi.average, 0)}` : undefined}
      />
    </section>
  );
}
