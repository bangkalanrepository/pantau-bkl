import type { AirQualityData } from '../types';
import { getAqiStatus } from './aqi';
import { formatNumber } from './format';

/**
 * Ringkasan kualitas udara BERBAHASA AWAM, dibangun dari data hasil fetch
 * (bukan teks statis): identifikasi polutan dominan, bandingkan dengan
 * pedoman kualitas udara, lalu susun kesimpulan + saran aktivitas.
 */

export interface DominantPollutant {
  label: string;
  value: number;
  /** Ambang acuan dalam satuan yang sama (µg/m³). */
  threshold: number;
  /** true bila nilai melewati ambang acuan. */
  exceeds: boolean;
}

export interface AirQualityInsight {
  /** Judul singkat, contoh: "Kualitas udara: Sedang (US AQI 88)". */
  headline: string;
  /** Kalimat-kalimat penjelasan siap tampil. */
  sentences: string[];
}

/**
 * Spesifikasi polutan + ambang acuan harian (µg/m³).
 * Acuan mengikuti pedoman kualitas udara harian WHO 2021
 * (O₃: rujukan puncak 8 jam, CO: 24 jam) agar mudah dijelaskan ke publik.
 */
interface PollutantSpec {
  key: string;
  label: string;
  value: (data: AirQualityData) => number | undefined;
  threshold: number;
}

const POLLUTANT_SPECS: readonly PollutantSpec[] = [
  { key: 'pm25', label: 'PM2.5', value: (d) => d.pm25, threshold: 15 },
  { key: 'pm10', label: 'PM10', value: (d) => d.pm10, threshold: 45 },
  { key: 'ozone', label: 'Ozon (O₃)', value: (d) => d.ozone, threshold: 100 },
  { key: 'no2', label: 'Nitrogen Dioksida (NO₂)', value: (d) => d.nitrogenDioxide, threshold: 25 },
  { key: 'so2', label: 'Sulfur Dioksida (SO₂)', value: (d) => d.sulphurDioxide, threshold: 40 },
  { key: 'co', label: 'Karbon Monoksida (CO)', value: (d) => d.carbonMonoxide, threshold: 4000 },
];

/** Polutan dengan rasio tertinggi terhadap ambang = polutan paling menonjol. */
function findDominant(data: AirQualityData): DominantPollutant | undefined {
  let best: { spec: PollutantSpec; value: number } | undefined;

  for (const spec of POLLUTANT_SPECS) {
    const value = spec.value(data);
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;
    const ratio = value / spec.threshold;
    const bestRatio =
      best === undefined ? Number.NEGATIVE_INFINITY : best.value / best.spec.threshold;
    if (ratio > bestRatio) {
      best = { spec, value };
    }
  }

  if (best === undefined) return undefined;
  return {
    label: best.spec.label,
    value: best.value,
    threshold: best.spec.threshold,
    exceeds: best.value > best.spec.threshold,
  };
}

function uvLabel(uv: number): string | undefined {
  if (!Number.isFinite(uv)) return undefined;
  if (uv < 3) return 'rendah';
  if (uv < 6) return 'sedang';
  if (uv < 8) return 'tinggi';
  if (uv < 11) return 'sangat tinggi';
  return 'ekstrem';
}

function adviceFor(level: number | undefined): string {
  switch (level) {
    case 0:
      return 'Aman untuk beraktivitas di luar ruang tanpa batasan.';
    case 1:
      return 'Masih aman bagi kebanyakan orang; hanya kelompok yang sangat sensitif perlu waspada bila beraktivitas luar ruang dalam waktu lama.';
    case 2:
      return 'Anak-anak, lansia, ibu hamil, serta penderita asma atau penyakit jantung sebaiknya mengurangi aktivitas fisik di luar ruangan.';
    case 3:
      return 'Sebaiknya kurangi aktivitas di luar ruang; gunakan masker bila harus beraktivitas di luar.';
    case 4:
      return 'Hindari aktivitas di luar ruang dan manfaatkan pemurni udara bila tersedia.';
    case 5:
      return 'Kondisi darurat: tetap berada di dalam ruangan dan ikuti imbauan otoritas kesehatan.';
    default:
      return 'Pantau perkembangan kualitas udara secara berkala.';
  }
}

/** Bangun kesimpulan awam dari data kualitas udara satu lokasi. */
export function buildAirQualityInsight(data: AirQualityData): AirQualityInsight {
  const status = getAqiStatus(data.usAqi);
  const sentences: string[] = [];

  // Judul
  const aqiText = data.usAqi !== undefined ? formatNumber(data.usAqi, 0) : undefined;
  const headline =
    status !== undefined
      ? `Kualitas udara: ${status.label}${aqiText !== undefined ? ` (US AQI ${aqiText})` : ''}`
      : aqiText !== undefined
        ? `US AQI ${aqiText}`
        : 'Kualitas Udara';

  // Polutan dominan
  const dominant = findDominant(data);
  if (dominant !== undefined) {
    const valueText = `${formatNumber(dominant.value)} µg/m³`;
    if (dominant.exceeds) {
      sentences.push(
        `Polutan paling menonjol saat ini adalah ${dominant.label} sebesar ${valueText}, sudah melewati ambang acuan harian (${formatNumber(dominant.threshold)} µg/m³).`,
      );
    } else {
      sentences.push(
        `Polutan paling menonjol saat ini adalah ${dominant.label} sebesar ${valueText} — masih di bawah ambang acuan harian (${formatNumber(dominant.threshold)} µg/m³).`,
      );
    }
  } else if (status === undefined) {
    sentences.push('Data parameter polutan belum tersedia saat ini.');
  }

  // Konteks kategori bila ada polutan dominan
  if (status !== undefined && dominant !== undefined) {
    if (status.level <= 1 && !dominant.exceeds) {
      sentences.push('Secara umum udara masih tergolong bersih dan nyaman untuk ditarik napas.');
    } else if (dominant.exceeds && status.level >= 2) {
      sentences.push(
        `Artinya, orang yang sensitif bisa mulai merasakan gangguan seperti batuk atau sesak ketika terlalu lama di luar ruangan.`,
      );
    }
  }

  // Peringatan UV dari data yang sama
  if (data.uvIndex !== undefined && data.uvIndex >= 6) {
    const label = uvLabel(data.uvIndex);
    sentences.push(
      `Indeks UV saat ini tergolong ${label ?? ''} (${formatNumber(data.uvIndex)}) — gunakan pelindung matahari bila beraktivitas di luar ruang.`.replace(/\s+/g, ' ').trim(),
    );
  }

  // Saran aktivitas
  const level = status?.level;
  sentences.push(adviceFor(level));

  return { headline, sentences };
}
