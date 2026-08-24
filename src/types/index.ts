import type { Location } from './location';
import type {
  BmkgApiResponse,
  BmkgAreaInfo,
  BmkgForecastEntry,
  BmkgWeatherPeriod,
  ForecastItem,
  WeatherData,
} from './weather';
import type { AirQualityData, OpenMeteoAirQualityResponse } from './airQuality';

/**
 * Data gabungan satu lokasi: cuaca (BMKG) + kualitas udara (Open-Meteo).
 * Semua field data bersifat opsional karena API bisa gagal/null secara
 * independen; error tiap sumber dicatat di `errors`.
 */
export interface LocationWeatherData {
  location: Location;
  weather: WeatherData;
  airQuality: AirQualityData;
  /** Info wilayah tambahan hasil parsing response BMKG. */
  area?: BmkgAreaInfo;
  /** Waktu data gabungan ini selesai dimuat (ISO UTC). */
  updatedAt?: string;
  errors?: {
    bmkg?: string;
    airQuality?: string;
  };
}

/** Alias sesuai penamaan konsep "data gabungan". */
export type CombinedWeatherData = LocationWeatherData;

export type { Location };
export type { BmkgAreaInfo, BmkgApiResponse, BmkgForecastEntry, BmkgWeatherPeriod, ForecastItem, WeatherData };
export type { AirQualityData, OpenMeteoAirQualityResponse };
