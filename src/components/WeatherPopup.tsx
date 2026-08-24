import type { ReactNode } from 'react';
import { CloudSun, Gauge, Info, MapPinned } from 'lucide-react';
import type { BmkgAreaInfo, LocationWeatherData, WeatherData, AirQualityData } from '../types';
import { hasWeatherInfo } from '../utils/weather';
import { buildAirQualityInsight } from '../utils/airQualityInsight';
import { formatNumber, formatDateTime, formatTime, parseBmkgLocalDateTime } from '../utils/format';
import { AqiBadge } from './AqiBadge';
import { WindArrow } from './WindArrow';
import { WindDegreeGuide } from './WindDegreeGuide';

/**
 * WeatherPopup: renderer SECTION detail lengkap satu lokasi
 * (Informasi Cuaca / Kualitas Udara / Informasi Lokasi).
 * Dipakai oleh panel LocationDetail. Field yang null/undefined
 * otomatis disembunyikan — tidak pernah tampil "null/NaN/undefined".
 */

interface RowProps {
  label: string;
  value?: ReactNode;
  /** Node tambahan di samping label, mis. tombol bantuan. */
  action?: ReactNode;
}

function Row({ label, value, action }: RowProps) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <dt className="flex items-center gap-1 text-sm text-slate-500">
        {label}
        {action}
      </dt>
      <dd className="text-right text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}

interface SectionProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  aside?: ReactNode;
}

function Section({ icon, title, children, aside }: SectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          {icon}
          {title}
        </h3>
        {aside}
      </div>
      <div className="px-4 py-2">{children}</div>
    </section>
  );
}

/** Tampilkan ikon BMKG dengan fallback sembunyi bila gagal dimuat. */
function BmkgIcon({ src, alt }: { src?: string; alt?: string }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt ?? ''}
      width={40}
      height={40}
      loading="lazy"
      className="h-10 w-10 object-contain"
      onError={(event) => {
        event.currentTarget.style.display = 'none';
      }}
    />
  );
}

function WeatherSection({ weather }: { weather: WeatherData }) {
  const observedDate = weather.observedAt !== undefined ? weather.observedAt : undefined;
  const localLabel = weather.observedLocalTime !== undefined ? formatTime(parseBmkgLocalDateTime(weather.observedLocalTime)?.toISOString()) : undefined;

  return (
    <Section
      icon={<CloudSun className="h-4 w-4 text-amber-600" aria-hidden="true" />}
      title="Informasi Cuaca"
      aside={
        <span className="inline-flex items-center gap-1">
          {localLabel && <span className="text-[11px] text-slate-400">{localLabel} WIB</span>}
          <BmkgIcon src={weather.iconUrl} alt={weather.weatherDescription} />
        </span>
      }
    >
      <dl className="divide-y divide-slate-50">
        <Row label="Suhu" value={weather.temperature !== undefined ? `${formatNumber(weather.temperature)} °C` : undefined} />
        <Row label="Kelembapan" value={weather.humidity !== undefined ? `${formatNumber(weather.humidity, 0)} %` : undefined} />
        <Row label="Kondisi Cuaca" value={weather.weatherDescription} />
        <Row label="Deskripsi (EN)" value={weather.weatherDescriptionEn} />
        <Row
          label="Arah Angin"
          action={<WindDegreeGuide degree={weather.windDirectionDeg} />}
          value={
            weather.windDirectionText !== undefined || weather.windDirectionDeg !== undefined ? (
              <span className="inline-flex items-center justify-end gap-1.5">
                <WindArrow degree={weather.windDirectionDeg} className="h-3.5 w-3.5 text-sky-700" />
                {weather.windDirectionText}
                {weather.windDirectionDeg !== undefined && (
                  <span className="font-normal text-slate-400">· {Math.round(weather.windDirectionDeg)}°</span>
                )}
              </span>
            ) : undefined
          }
        />
        <Row label="Kecepatan Angin" value={weather.windSpeed !== undefined ? `${formatNumber(weather.windSpeed)} km/j` : undefined} />
        <Row label="Hembusan (Gust)" value={weather.gusts !== undefined ? `${formatNumber(weather.gusts)} km/j` : undefined} />
        <Row label="Visibilitas" value={weather.visibilityText} />
        <Row label="Tutupan Awan" value={weather.cloudCover !== undefined ? `${formatNumber(weather.cloudCover, 0)} %` : undefined} />
        <Row label="Presipitasi" value={weather.precipitation !== undefined ? `${formatNumber(weather.precipitation)} mm` : undefined} />
        <Row label="Kode Cuaca" value={weather.weatherCode !== undefined ? String(weather.weatherCode) : undefined} />
        <Row label="Tanggal Analisis" value={formatDateTime(observedDate)} />
      </dl>

      {/* Atribusi sumber data cuaca */}
      <p className="py-2 text-[11px] leading-relaxed text-slate-400">
        Sumber data cuaca:{' '}
        <a
          href="https://www.bmkg.go.id"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-sky-700 underline-offset-2 hover:underline"
        >
          BMKG
        </a>{' '}
        (Badan Meteorologi, Klimatologi, dan Geofisika)
        {localLabel !== undefined && ` · prakiraan pukul ${localLabel}`}
      </p>

      {weather.forecast !== undefined && weather.forecast.length > 0 && (
        <div className="mt-2 mb-1">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Prakiraan Berikutnya</p>
          <div className="grid grid-cols-4 gap-2">
            {weather.forecast.map((item) => (
              <div key={item.datetime} className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-center">
                <p className="text-[11px] font-semibold text-slate-700">
                  {formatTime(parseBmkgLocalDateTime(item.localDatetime)?.toISOString()) ?? '–'}
                </p>
                <img
                  src={item.iconUrl}
                  alt=""
                  width={32}
                  height={32}
                  loading="lazy"
                  className="mx-auto h-8 w-8 object-contain"
                  onError={(event) => {
                    event.currentTarget.style.visibility = 'hidden';
                  }}
                />
                <p className="truncate text-[10px] leading-tight text-slate-500" title={item.weatherDescription}>
                  {item.weatherDescription ?? '–'}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-slate-800">
                  {item.temperature !== undefined ? `${Math.round(item.temperature)}°C` : '–'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

function AirQualitySection({ airQuality }: { airQuality: AirQualityData }) {
  const hasAny =
    Object.values(airQuality).some((value) => value !== undefined);
  if (!hasAny) return null;

  const insight = buildAirQualityInsight(airQuality);

  return (
    <Section
      icon={<Gauge className="h-4 w-4 text-emerald-600" aria-hidden="true" />}
      title="Kualitas Udara"
      aside={<AqiBadge aqi={airQuality.usAqi} scale="us" />}
    >
      {/* Kesimpulan bahasa awam dari data yang di-fetch */}
      <div className="mb-2 rounded-lg border border-sky-100 bg-sky-50/70 px-3 py-2.5" role="note">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-sky-900">
          <Info className="h-4 w-4 shrink-0 text-sky-600" aria-hidden="true" />
          {insight.headline}
        </p>
        <div className="mt-1 space-y-1">
          {insight.sentences.map((sentence, index) => (
            <p key={index} className="text-xs leading-relaxed text-slate-600">
              {sentence}
            </p>
          ))}
        </div>
      </div>

      <dl className="divide-y divide-slate-50">
        <Row
          label="US AQI"
          value={
            <span className="inline-flex items-center gap-2">
              {airQuality.usAqi !== undefined ? formatNumber(airQuality.usAqi, 0) : undefined}
              <AqiBadge aqi={airQuality.usAqi} scale="us" size="sm" />
            </span>
          }
        />
        <Row
          label="European AQI"
          value={
            <span className="inline-flex items-center gap-2">
              {airQuality.europeanAqi !== undefined ? formatNumber(airQuality.europeanAqi, 0) : undefined}
              <AqiBadge aqi={airQuality.europeanAqi} scale="europe" size="sm" />
            </span>
          }
        />
        <Row label="PM10" value={airQuality.pm10 !== undefined ? `${formatNumber(airQuality.pm10)} µg/m³` : undefined} />
        <Row label="PM2.5" value={airQuality.pm25 !== undefined ? `${formatNumber(airQuality.pm25)} µg/m³` : undefined} />
        <Row label="CO (Karbon Monoksida)" value={airQuality.carbonMonoxide !== undefined ? `${formatNumber(airQuality.carbonMonoxide, 0)} µg/m³` : undefined} />
        <Row label="NO₂ (Nitrogen Dioksida)" value={airQuality.nitrogenDioxide !== undefined ? `${formatNumber(airQuality.nitrogenDioxide)} µg/m³` : undefined} />
        <Row label="SO₂ (Sulfur Dioksida)" value={airQuality.sulphurDioxide !== undefined ? `${formatNumber(airQuality.sulphurDioxide)} µg/m³` : undefined} />
        <Row label="O₃ (Ozon)" value={airQuality.ozone !== undefined ? `${formatNumber(airQuality.ozone)} µg/m³` : undefined} />
        <Row label="Debu (Dust)" value={airQuality.dust !== undefined ? `${formatNumber(airQuality.dust)} µg/m³` : undefined} />
        <Row label="Indeks UV" value={airQuality.uvIndex !== undefined ? formatNumber(airQuality.uvIndex) : undefined} />
        <Row label="Aerosol Optical Depth" value={airQuality.aerosolOpticalDepth !== undefined ? formatNumber(airQuality.aerosolOpticalDepth, 2) : undefined} />
        <Row label="Amonia (NH₃)" value={airQuality.ammonia !== undefined ? `${formatNumber(airQuality.ammonia)} µg/m³` : undefined} />
      </dl>
      <p className="py-2 text-[11px] leading-relaxed text-slate-400">
        Sumber data kualitas udara:{' '}
        <a
          href="https://open-meteo.com"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-sky-700 underline-offset-2 hover:underline"
        >
          Open-Meteo
        </a>{' '}
        Air Quality API{airQuality.time !== undefined ? ` · pengukuran ${formatDateTime(airQuality.time)}` : ''}
        {' · '}ambang acuan ringkasan mengikuti pedoman harian WHO 2021.
      </p>
    </Section>
  );
}

function LocationInfoSection({ entry }: { entry: LocationWeatherData }) {
  const area: BmkgAreaInfo | undefined = entry.area;
  return (
    <Section
      icon={<MapPinned className="h-4 w-4 text-sky-700" aria-hidden="true" />}
      title="Informasi Lokasi"
    >
      <dl className="divide-y divide-slate-50">
        <Row label="Nama Daerah" value={entry.location.name} />
        {area?.desa !== undefined && <Row label="Desa/Kelurahan" value={area.desa} />}
        {area?.kecamatan !== undefined && <Row label="Kecamatan" value={area.kecamatan} />}
        {area?.kotkab !== undefined && <Row label="Kabupaten/Kota" value={area.kotkab} />}
        {area?.provinsi !== undefined && <Row label="Provinsi" value={area.provinsi} />}
        <Row label="Latitude" value={formatNumber(entry.location.latitude, 6)} />
        <Row label="Longitude" value={formatNumber(entry.location.longitude, 6)} />
        <Row label="Kode ADM4" value={entry.location.adm4} />
        <Row label="Waktu Update Data" value={formatDateTime(entry.updatedAt)} />
      </dl>
      {entry.location.description !== undefined && (
        <p className="py-2 text-xs leading-relaxed text-slate-500">{entry.location.description}</p>
      )}
    </Section>
  );
}

export interface WeatherPopupProps {
  entry: LocationWeatherData;
}

/** Seluruh isi detail (cuaca + kualitas udara + lokasi) untuk panel terpilih. */
export function WeatherPopup({ entry }: WeatherPopupProps) {
  const showWeather = hasWeatherInfo(entry.weather);
  return (
    <div className="space-y-3">
      {showWeather ? <WeatherSection weather={entry.weather} /> : null}
      <AirQualitySection airQuality={entry.airQuality} />
      <LocationInfoSection entry={entry} />
    </div>
  );
}
