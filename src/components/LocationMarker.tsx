import { useMemo } from 'react';
import L from 'leaflet';
import { Marker, Tooltip } from 'react-leaflet';
import { Droplets, Thermometer, Wind } from 'lucide-react';
import type { Location, LocationWeatherData } from '../types';
import { getAqiStatus } from '../utils/aqi';
import { formatPercent, formatTemperatureShort, formatWithUnit } from '../utils/format';
import { WindArrow } from './WindArrow';

interface LocationMarkerProps {
  location: Location;
  data?: LocationWeatherData;
  selected: boolean;
  onSelect: (id: string) => void;
}

/** Ikon marker titik (divIcon) — warna mengikuti status AQI bila tersedia. */
function createPinIcon(color: string, selected: boolean): L.DivIcon {
  return L.divIcon({
    className: 'pantau-marker',
    html: `<span class="pantau-pin${selected ? ' pantau-pin-selected' : ''}" style="--pin-color:${color}"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

/**
 * Marker satu lokasi.
 * - Tooltip PERMANEN: informasi ringkas selalu terlihat sebelum diklik
 *   (nama, suhu, kelembapan, arah & kecepatan angin).
 * - Klik marker → buka panel detail lengkap.
 */
export function LocationMarker({ location, data, selected, onSelect }: LocationMarkerProps) {
  const weather = data?.weather;
  const aqiStatus = getAqiStatus(data?.airQuality.usAqi);
  const pinColor = selected ? '#0c4a6e' : (aqiStatus?.color ?? '#0284c7');

  const icon = useMemo(() => createPinIcon(pinColor, selected), [pinColor, selected]);
  const handleClick = useMemo(() => () => onSelect(location.id), [onSelect, location.id]);

  const hasWeather = weather !== undefined && weather.temperature !== undefined;
  const hasError = data !== undefined && data.errors !== undefined && !hasWeather;

  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={icon}
      zIndexOffset={selected ? 1000 : 0}
      eventHandlers={{ click: handleClick }}
    >
      <Tooltip
        permanent
        direction="top"
        offset={[0, -12]}
        opacity={1}
        className="pantau-tooltip"
        interactive={false}
      >
        <div className="min-w-[7.5rem] text-left">
          <div className="flex items-center gap-1.5">
            {aqiStatus && (
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: aqiStatus.color }}
                aria-hidden="true"
              />
            )}
            <span className="text-[13px] font-semibold leading-tight text-slate-900">{location.name}</span>
          </div>

          {!data ? (
            <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-sky-700">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" aria-hidden="true" />
              Memuat data...
            </div>
          ) : hasError ? (
            <div className="mt-1 text-[11px] font-medium text-red-600">Data gagal dimuat</div>
          ) : (
            <div className="mt-1 space-y-0.5">
              <div className="flex items-center gap-1 text-[11px] leading-tight text-slate-700">
                <Thermometer className="h-3 w-3 text-amber-600" aria-hidden="true" />
                {formatTemperatureShort(weather?.temperature) ?? '–'}
                <span className="mx-0.5 text-slate-300" aria-hidden="true">|</span>
                <Droplets className="h-3 w-3 text-cyan-600" aria-hidden="true" />
                {formatPercent(weather?.humidity) ?? '–'}
              </div>
              <div className="flex items-center gap-1 text-[11px] leading-tight text-slate-700">
                <Wind className="h-3 w-3 text-sky-600" aria-hidden="true" />
                {formatWithUnit(weather?.windSpeed, 'km/j') ?? '–'}
                {(weather?.windDirectionText || weather?.windDirectionDeg !== undefined) && (
                  <>
                    <span className="mx-0.5 text-slate-300" aria-hidden="true">|</span>
                    <WindArrow degree={weather?.windDirectionDeg} className="h-3 w-3 text-slate-500" />
                    {weather?.windDirectionText}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </Tooltip>
    </Marker>
  );
}
