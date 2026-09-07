import type {
  BmkgAreaInfo,
  BmkgForecastEntry,
  BmkgWeatherPeriod,
  ForecastItem,
  WeatherData,
} from '../types';
import { isFiniteNumber, safeString } from './format';
import { getWindDirection, toWindDestinationDegrees } from './wind';

export interface BmkgWeatherResult {
  weather: WeatherData;
  area?: BmkgAreaInfo;
}

type UnknownRecord = Record<string, unknown>;

function isObject(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function num(value: unknown): number | undefined {
  return isFiniteNumber(value) ? value : undefined;
}

function str(value: unknown): string | undefined {
  return safeString(value);
}

function asArea(value: unknown): BmkgAreaInfo | undefined {
  if (!isObject(value)) return undefined;
  const area: BmkgAreaInfo = {
    adm1: str(value.adm1),
    adm2: str(value.adm2),
    adm3: str(value.adm3),
    adm4: str(value.adm4),
    provinsi: str(value.provinsi),
    kotkab: str(value.kotkab),
    kecamatan: str(value.kecamatan),
    desa: str(value.desa),
    lon: num(value.lon),
    lat: num(value.lat),
    timezone: str(value.timezone),
    type: str(value.type),
  };
  return Object.values(area).some((item) => item !== undefined) ? area : undefined;
}

/** Ratakan matriks `cuaca[][]` menjadi daftar periode yang valid. */
function collectPeriods(entry: BmkgForecastEntry): BmkgWeatherPeriod[] {
  const matrix = Array.isArray(entry.cuaca) ? entry.cuaca : [];
  const periods = matrix.flat().filter(isObject);
  const parsed: Array<{ period: BmkgWeatherPeriod; time: number }> = [];

  for (const period of periods) {
    if (!isBmkgPeriod(period)) continue;
    const time = Date.parse(period.datetime ?? '');
    if (Number.isNaN(time)) continue;
    parsed.push({ period, time });
  }

  return parsed.sort((a, b) => a.time - b.time).map((item) => item.period);
}

function isBmkgPeriod(value: UnknownRecord): value is BmkgWeatherPeriod & UnknownRecord {
  return typeof value.datetime === 'string';
}

/**
 * Pilih periode prakiraan yang paling mewakili "saat ini":
 * periode dengan selisih waktu terkecil terhadap sekarang.
 */
function pickCurrentPeriod(periods: BmkgWeatherPeriod[]): BmkgWeatherPeriod | undefined {
  if (periods.length === 0) return undefined;
  const now = Date.now();
  let best = periods[0];
  let bestDiff = Number.POSITIVE_INFINITY;
  for (const period of periods) {
    const time = Date.parse(period.datetime ?? '');
    if (Number.isNaN(time)) continue;
    const diff = Math.abs(time - now);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = period;
    }
  }
  return best;
}

function toForecastItem(period: BmkgWeatherPeriod): ForecastItem {
  return {
    datetime: str(period.datetime),
    localDatetime: str(period.local_datetime),
    temperature: num(period.t),
    weatherDescription: str(period.weather_desc),
    iconUrl: str(period.image),
  };
}

function buildVisibility(period: BmkgWeatherPeriod): { visibility?: number; visibilityText?: string } {
  const vs = num(period.vs);
  const text = str(period.vs_text);
  if (text) return { visibility: vs, visibilityText: text };
  if (vs !== undefined) {
    return { visibility: vs, visibilityText: `${new Intl.NumberFormat('id-ID').format(Math.round(vs / 100) / 10)} km` };
  }
  return {};
}

/**
 * Parser response BMKG → model internal.
 * Aman terhadap field null/missing; tidak pernah melempar error untuk
 * data yang hilang (hanya menghasilkan field undefined).
 */
export function parseBmkgWeather(payload: unknown): BmkgWeatherResult {
  const root = isObject(payload) ? payload : {};
  const dataArr = Array.isArray(root.data) ? root.data.filter(isObject) : [];
  const firstEntry = (dataArr[0] ?? {}) as Partial<BmkgForecastEntry> & UnknownRecord;

  const area = asArea(root.lokasi) ?? asArea(firstEntry.lokasi);
  const periods = collectPeriods(firstEntry as BmkgForecastEntry);
  const current = pickCurrentPeriod(periods);

  const weather: WeatherData = {};

  if (current) {
    const visibilityInfo = buildVisibility(current);
    const wdDeg = num(current.wd_deg);
    // BMKG wd_deg = arah ASAL angin; simpan arah TUJUAN (0° = Utara = ke utara).
    const wdDestinationDeg = toWindDestinationDegrees(wdDeg);

    Object.assign(weather, {
      temperature: num(current.t),
      humidity: num(current.hu),
      windSpeed: num(current.ws),
      gusts: undefined, // Endpoint BMKG ini tidak menyediakan gust; field tetap didukung model.
      windDirectionDeg: wdDestinationDeg,
      windDirectionCardinal: str(current.wd)?.toUpperCase(),
      windDirectionText: getWindDirection(wdDestinationDeg),
      weatherCode: num(current.weather),
      weatherDescription: str(current.weather_desc),
      weatherDescriptionEn: str(current.weather_desc_en),
      cloudCover: num(current.tcc),
      precipitation: num(current.tp),
      iconUrl: str(current.image),
      observedAt: str(current.datetime),
      observedLocalTime: str(current.local_datetime),
      analysisDate: str(current.analysis_date),
      ...visibilityInfo,
    });

    const currentIndex = periods.indexOf(current);
    weather.forecast = periods
      .slice(currentIndex + 1, currentIndex + 5)
      .map(toForecastItem)
      .filter((item) => item.temperature !== undefined || item.weatherDescription !== undefined);

    if (weather.forecast.length === 0) delete weather.forecast;
  }

  // Buang key dengan nilai undefined agar "field kosong" benar-benar absen.
  const cleaned = Object.fromEntries(
    Object.entries(weather).filter(([, value]) => value !== undefined),
  ) as WeatherData;

  return { weather: cleaned, area: area ?? undefined };
}

/** Cek apakah objek WeatherData punya minimal satu informasi. */
export function hasWeatherInfo(weather: WeatherData): boolean {
  return Object.values(weather).some((value) => {
    if (value === undefined) return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  });
}
