import type { AirQualityData, Location, OpenMeteoAirQualityResponse } from '../types';
import { requestJson, isAbortError } from './client';
import type { UnknownRecordLike } from './types';

/**
 * Service Open-Meteo Air Quality API (publik, mendukung CORS penuh,
 * tidak butuh API key → direct request dari browser).
 */

const BASE_URL = import.meta.env.VITE_OPEN_METEO_AQI_BASE ?? 'https://air-quality-api.open-meteo.com/v1/air-quality';

const CURRENT_PARAMS = [
  'european_aqi',
  'us_aqi',
  'pm10',
  'pm2_5',
  'carbon_monoxide',
  'nitrogen_dioxide',
  'sulphur_dioxide',
  'ozone',
  'dust',
  'uv_index',
  'aerosol_optical_depth',
  'ammonia',
] as const;

function isRecord(value: unknown): value is UnknownRecordLike {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Ambil number aman: tolak null/NaN/string. */
function num(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/** Parser response Open-Meteo → model internal yang aman (null → undefined). */
export function parseAirQuality(payload: unknown): AirQualityData {
  if (!isRecord(payload)) return {};
  const current = isRecord(payload.current) ? payload.current : undefined;

  const data: AirQualityData = {
    europeanAqi: num(current?.european_aqi),
    usAqi: num(current?.us_aqi),
    pm10: num(current?.pm10),
    pm25: num(current?.pm2_5),
    carbonMonoxide: num(current?.carbon_monoxide),
    nitrogenDioxide: num(current?.nitrogen_dioxide),
    sulphurDioxide: num(current?.sulphur_dioxide),
    ozone: num(current?.ozone),
    dust: num(current?.dust),
    uvIndex: num(current?.uv_index),
    aerosolOpticalDepth: num(current?.aerosol_optical_depth),
    ammonia: num(current?.ammonia),
    time: str(current?.time),
  };

  // Buang key undefined agar field kosong benar-benar tidak ada di UI.
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as AirQualityData;
}

export async function getAirQuality(location: Location, signal?: AbortSignal): Promise<AirQualityData> {
  const url = new URL(BASE_URL);
  url.searchParams.set('latitude', String(location.latitude));
  url.searchParams.set('longitude', String(location.longitude));
  url.searchParams.set('current', CURRENT_PARAMS.join(','));
  url.searchParams.set('timezone', 'auto');

  let payload: OpenMeteoAirQualityResponse;
  try {
    payload = await requestJson<OpenMeteoAirQualityResponse>(url.toString(), signal);
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw error;
  }
  return parseAirQuality(payload);
}
