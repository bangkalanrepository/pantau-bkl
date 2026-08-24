import { DISPLAY_TIME_ZONE } from '../config/appConfig';

/** Pengecek angka aman: hanya number berhingga (bukan NaN/Infinity). */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Ambil string hanya jika benar-benar string non-kosong. */
export function safeString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

/** Format angka dengan locale Indonesia; undefined bila input tidak valid. */
export function formatNumber(value?: number, maximumFractionDigits = 1): string | undefined {
  if (!isFiniteNumber(value)) return undefined;
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits }).format(value);
}

/** Gabungkan angka + unit dalam satu string aman, contoh: "12 km/j". */
export function formatWithUnit(value: number | undefined, unit: string, digits = 1): string | undefined {
  const num = formatNumber(value, digits);
  return num === undefined ? undefined : `${num} ${unit}`;
}

/** Suhu ringkas untuk marker/popup, contoh: "30°C". */
export function formatTemperatureShort(value?: number): string | undefined {
  if (!isFiniteNumber(value)) return undefined;
  return `${Math.round(value)}°C`;
}

/** Persentase ringkas, contoh: "72%". */
export function formatPercent(value?: number): string | undefined {
  if (!isFiniteNumber(value)) return undefined;
  return `${Math.round(value)}%`;
}

function formatOptions(dateStyle: 'short' | 'long', timeStyle?: 'short' | 'medium'): Intl.DateTimeFormatOptions {
  return {
    dateStyle,
    ...(timeStyle ? { timeStyle } : {}),
    timeZone: DISPLAY_TIME_ZONE,
    localeMatcher: 'lookup',
  };
}

/** Tanggal+jam panjang, contoh: "24 Agustus 2026 pukul 12.00". */
export function formatDateTime(iso?: string): string | undefined {
  const raw = safeString(iso);
  if (raw === undefined) return undefined;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return undefined;
  try {
    return new Intl.DateTimeFormat('id-ID', formatOptions('long', 'short')).format(date);
  } catch {
    return undefined;
  }
}

/** Jam singkat, contoh: "12.00 WIB". */
export function formatTime(iso?: string): string | undefined {
  const raw = safeString(iso);
  if (raw === undefined) return undefined;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return undefined;
  try {
    const time = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: DISPLAY_TIME_ZONE,
    }).format(date);
    return `${time} WIB`;
  } catch {
    return undefined;
  }
}

/** Jam+detik untuk stempel pembaruan, contoh: "10.32.05 WIB". */
export function formatClock(iso?: string): string | undefined {
  const raw = safeString(iso);
  if (raw === undefined) return undefined;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return undefined;
  try {
    const time = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: DISPLAY_TIME_ZONE,
    }).format(date);
    return `${time} WIB`;
  } catch {
    return undefined;
  }
}

/**
 * Parse `local_datetime` BMKG yang naive ("2026-08-24 12:00:00") sebagai
 * waktu WIB (+07:00) agar konsisten di semua perangkat.
 */
export function parseBmkgLocalDateTime(value?: string): Date | undefined {
  const raw = safeString(value);
  if (!raw) return undefined;
  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const withOffset = /[Zz]|[+-]\d{2}:?\d{2}$/.test(normalized) ? normalized : `${normalized}+07:00`;
  const date = new Date(withOffset);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
