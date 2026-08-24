import { useCallback, useEffect, useRef, useState } from 'react';
import type { AirQualityData, Location, LocationWeatherData, WeatherData } from '../types';
import type { BmkgWeatherResult } from '../api';
import { getAirQuality, getBmkgWeather } from '../api';
import { isAbortError } from '../api/client';
import { REFRESH_INTERVAL } from '../config/appConfig';

export interface UseWeatherDataResult {
  /** Data per lokasi, key = location.id. */
  dataMap: Record<string, LocationWeatherData>;
  /** true saat pemanggilan pertama belum menghasilkan data sama sekali. */
  isLoading: boolean;
  /** true selama proses fetch berjalan (termasuk refresh). */
  isRefreshing: boolean;
  /** Stempel waktu ISO batch terakhir yang selesai. */
  lastUpdated: string | null;
  /** Picu fetch ulang semua lokasi secara manual. */
  refresh: () => void;
}

function errorMessage(error: unknown): string {
  if (isAbortError(error)) return 'Permintaan dibatalkan';
  if (error instanceof Error && error.message) return error.message;
  return 'Terjadi kesalahan tak terduga';
}

/** Gabungkan hasil BMKG + Open-Meteo untuk satu lokasi; satu sumber gagal tidak merusak sumber lain. */
async function loadLocationData(
  location: Location,
  signal?: AbortSignal,
): Promise<LocationWeatherData> {
  const bmkgTask: Promise<BmkgWeatherResult> =
    location.adm4 !== undefined
      ? getBmkgWeather(location, signal)
      : Promise.reject(new Error('Kode ADM4 belum dikonfigurasi'));
  const airQualityTask: Promise<AirQualityData> = getAirQuality(location, signal);

  const [bmkgResult, airResult] = await Promise.allSettled([bmkgTask, airQualityTask]);

  const errors: { bmkg?: string; airQuality?: string } = {};
  let weather: WeatherData = {};
  let area: LocationWeatherData['area'];
  let airQuality: AirQualityData = {};

  if (bmkgResult.status === 'fulfilled') {
    weather = bmkgResult.value.weather;
    area = bmkgResult.value.area;
  } else if (!isAbortError(bmkgResult.reason)) {
    errors.bmkg = errorMessage(bmkgResult.reason);
  }

  if (airResult.status === 'fulfilled') {
    airQuality = airResult.value;
  } else if (!isAbortError(airResult.reason)) {
    errors.airQuality = errorMessage(airResult.reason);
  }

  return {
    location,
    weather,
    airQuality,
    ...(area !== undefined ? { area } : {}),
    updatedAt: new Date().toISOString(),
    ...(Object.keys(errors).length > 0 ? { errors } : {}),
  };
}

/**
 * Hook utama pengambilan data semua lokasi.
 *
 * - Satu siklus fetch memakai Promise.allSettled → kegagalan satu
 *   lokasi/sumber tidak menghentikan yang lain.
 * - Auto-refresh berjalan SEKALI dibuat (deps []) dan di-cleanup oleh
 *   useEffect; tidak terduplikasi walau komponen re-render.
 * - Semua request dibatalkan lewat AbortController saat unmount/refresh.
 */
export function useWeatherData(locations: readonly Location[]): UseWeatherDataResult {
  const [dataMap, setDataMap] = useState<Record<string, LocationWeatherData>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const lastUpdatedRef = useRef<string | null>(null);

  const refresh = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setIsRefreshing(true);

    void (async () => {
      const settled = await Promise.allSettled(
        locations.map((location) => loadLocationData(location, controller.signal)),
      );
      if (controller.signal.aborted) return;

      const next: Record<string, LocationWeatherData> = {};
      settled.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          next[locations[index].id] = result.value;
        }
      });

      setDataMap(next);
      const stamp = new Date().toISOString();
      lastUpdatedRef.current = stamp;
      setLastUpdated(stamp);
      setIsRefreshing(false);
    })();
  }, [locations]);

  // Simpan refresh terbaru di ref agar interval tidak perlu dibuat ulang.
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  // Fetch awal + auto-refresh periodik. Deps kosong: hanya sekali.
  useEffect(() => {
    refreshRef.current();

    const timer = window.setInterval(() => {
      // Hemat kuota: lewati tick saat tab tidak terlihat.
      if (!document.hidden) refreshRef.current();
    }, REFRESH_INTERVAL);

    const handleVisibility = () => {
      if (document.hidden) return;
      const stamp = lastUpdatedRef.current;
      const stale = stamp === null || Date.now() - new Date(stamp).getTime() >= REFRESH_INTERVAL;
      if (stale) refreshRef.current();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Batalkan request yang masih berjalan saat unmount.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const isLoading = isRefreshing && Object.keys(dataMap).length === 0;

  return { dataMap, isLoading, isRefreshing, lastUpdated, refresh };
}
