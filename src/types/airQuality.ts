/**
 * Struktur response Open-Meteo Air Quality API.
 * Semua field opsional — nilai polutan bisa null tergantung model data
 * yang tersedia untuk koordinat tersebut.
 */

export interface OpenMeteoCurrentUnits {
  time?: string;
  interval?: string;
  pm10?: string;
  pm2_5?: string;
  carbon_monoxide?: string;
  nitrogen_dioxide?: string;
  sulphur_dioxide?: string;
  ozone?: string;
  european_aqi?: string;
  us_aqi?: string;
  dust?: string;
  uv_index?: string;
  aerosol_optical_depth?: string;
  ammonia?: string;
  [key: string]: string | undefined;
}

export interface OpenMeteoCurrent extends Record<string, unknown> {
  time?: string;
  interval?: number;
  pm10?: number | null;
  pm2_5?: number | null;
  carbon_monoxide?: number | null;
  nitrogen_dioxide?: number | null;
  sulphur_dioxide?: number | null;
  ozone?: number | null;
  european_aqi?: number | null;
  us_aqi?: number | null;
  dust?: number | null;
  uv_index?: number | null;
  aerosol_optical_depth?: number | null;
  ammonia?: number | null;
}

export interface OpenMeteoAirQualityResponse {
  latitude?: number;
  longitude?: number;
  timezone?: string;
  current_units?: OpenMeteoCurrentUnits;
  current?: OpenMeteoCurrent;
}

/** Model internal hasil parsing yang aman (null → undefined). */
export interface AirQualityData {
  europeanAqi?: number;
  usAqi?: number;
  pm10?: number;
  pm25?: number;
  carbonMonoxide?: number;
  nitrogenDioxide?: number;
  sulphurDioxide?: number;
  ozone?: number;
  dust?: number;
  uvIndex?: number;
  aerosolOpticalDepth?: number;
  ammonia?: number;
  /** Waktu pengukuran (ISO lokal sesuai zona lokasi). */
  time?: string;
}
