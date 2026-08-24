import type { Location } from '../types';
import type { BmkgApiResponse } from '../types/weather';
import { requestJson, ApiRequestError, isAbortError } from './client';
import { parseBmkgWeather } from '../utils/weather';
import type { BmkgWeatherResult } from '../utils/weather';

/**
 * Service BMKG.
 *
 * Strategi (lihat README bagian CORS):
 * 1. Direct request ke api.bmkg.go.id — saat ini API sudah mengirim
 *    `access-control-allow-origin: *` sehingga berjalan dari browser.
 * 2. Jika direct gagal (CORS/jaringan), fallback ke proxy Vercel:
 *    `/api/bmkg?adm4=...` (serverless function `api/bmkg.ts`; di dev
 *    dilayani Vite proxy dengan konfigurasi yang sama).
 */

const DIRECT_BASE = import.meta.env.VITE_BMKG_API_BASE ?? 'https://api.bmkg.go.id/publik/prakiraan-cuaca';
const PROXY_PATH = '/api/bmkg';

async function fetchBmkgResponse(adm4: string, signal?: AbortSignal): Promise<BmkgApiResponse> {
  const directUrl = `${DIRECT_BASE}?adm4=${encodeURIComponent(adm4)}`;
  try {
    return await requestJson<BmkgApiResponse>(directUrl, signal);
  } catch (error) {
    if (isAbortError(error)) throw error;
    // Fallback: lewat proxy serverless (Vercel) / proxy dev (Vite).
    return requestJson<BmkgApiResponse>(`${PROXY_PATH}?adm4=${encodeURIComponent(adm4)}`, signal);
  }
}

/**
 * Ambil data cuaca BMKG untuk satu lokasi.
 * Otomatis memakai `location.adm4` — kode wilayah BMKG bersifat per lokasi.
 */
export async function getBmkgWeather(location: Location, signal?: AbortSignal): Promise<BmkgWeatherResult> {
  if (!location.adm4) {
    throw new ApiRequestError('Kode ADM4 belum dikonfigurasi untuk lokasi ini');
  }
  const payload = await fetchBmkgResponse(location.adm4, signal);
  return parseBmkgWeather(payload);
}
