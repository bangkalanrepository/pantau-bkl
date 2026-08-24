import type { Location } from '../types';

/**
 * Daftar titik lokasi pemantauan — seluruh kecamatan di Kabupaten Bangkalan.
 *
 * - `latitude` / `longitude`: titik lokasi resmi yang dipakai untuk peta
 *   dan permintaan Open-Meteo.
 * - `adm4`: kode wilayah BMKG tingkat desa/kelurahan sebagai representasi
 *   kecamatan tersebut. SEMUA kode di bawah sudah diverifikasi aktif di API
 *   BMKG (`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=<kode>`).
 * - Setiap lokasi WAJIB memiliki `adm4` sendiri — jangan dibagikan.
 *
 * Cara mengubah: cukup ganti koordinat/kode di entri terkait.
 * Cara menambah lokasi: duplikasi salah satu entri, lalu sesuaikan
 * `id`, `name`, `latitude`, `longitude`, dan `adm4`.
 */
export const LOCATIONS: Location[] = [
  {
    id: 'bangkalan',
    name: 'Bangkalan',
    latitude: -7.0293813,
    longitude: 112.7474965,
    adm4: '35.26.01.1001', // Kel. Mlajah, Kec. Bangkalan
  },
  {
    id: 'socah',
    name: 'Socah',
    latitude: -7.0904031,
    longitude: 112.705639,
    adm4: '35.26.02.2001', // Desa Socah, Kec. Socah
  },
  {
    id: 'burneh',
    name: 'Burneh',
    latitude: -7.0536669,
    longitude: 112.7810285,
    adm4: '35.26.03.2001', // Desa Burneh, Kec. Burneh
  },
  {
    id: 'kamal',
    name: 'Kamal',
    latitude: -7.1529061,
    longitude: 112.7134915,
    adm4: '35.26.04.2001', // Desa Kamal, Kec. Kamal
  },
  {
    id: 'arosbaya',
    name: 'Arosbaya',
    latitude: -6.9477397,
    longitude: 112.8384451,
    adm4: '35.26.05.2001', // Desa Arosbaya, Kec. Arosbaya
  },
  {
    id: 'geger',
    name: 'Geger',
    latitude: -6.989291,
    longitude: 112.8587953,
    adm4: '35.26.06.2001', // Desa Kombangan, Kec. Geger
  },
  {
    id: 'klampis',
    name: 'Klampis',
    latitude: -6.8948827,
    longitude: 112.9011271,
    adm4: '35.26.07.2001', // Desa Klampis Barat, Kec. Klampis
  },
  {
    id: 'sepulu',
    name: 'Sepulu',
    latitude: -6.8966041,
    longitude: 112.9560656,
    adm4: '35.26.08.2001', // Desa Sepulu, Kec. Sepulu
  },
  {
    id: 'tanjung-bumi',
    name: 'Tanjung Bumi',
    latitude: -6.8906954,
    longitude: 113.0721464,
    adm4: '35.26.09.2001', // Desa Paseseh, Kec. Tanjung Bumi
  },
  {
    id: 'kokop',
    name: 'Kokop',
    latitude: -6.9426713,
    longitude: 113.0274075,
    adm4: '35.26.10.2001', // Desa Dupok, Kec. Kokop
  },
  {
    id: 'kwanyar',
    name: 'Kwanyar',
    latitude: -7.155446,
    longitude: 112.8558943,
    adm4: '35.26.11.2001', // Desa Pesanggrahan, Kec. Kwanyar
  },
  {
    id: 'labang',
    name: 'Labang',
    latitude: -7.1573105,
    longitude: 112.8005697,
    adm4: '35.26.12.2001', // Desa Kesek, Kec. Labang
  },
  {
    id: 'tanah-merah',
    name: 'Tanah Merah',
    latitude: -7.0919194,
    longitude: 112.8868622,
    adm4: '35.26.13.2001', // Desa Tanah Merah Dajah, Kec. Tanah Merah
  },
  {
    id: 'tragah',
    name: 'Tragah',
    latitude: -7.1025096,
    longitude: 112.8278193,
    adm4: '35.26.14.2001', // Desa Soket Laok, Kec. Tragah
  },
  {
    id: 'blega',
    name: 'Blega',
    latitude: -7.1288453,
    longitude: 113.0592024,
    adm4: '35.26.15.2001', // Desa Blega, Kec. Blega
  },
  {
    id: 'modung',
    name: 'Modung',
    latitude: -7.210862,
    longitude: 113.0289454,
    adm4: '35.26.16.2001', // Desa Patereman, Kec. Modung
  },
  {
    id: 'konang',
    name: 'Konang',
    latitude: -7.0752731,
    longitude: 113.0860999,
    adm4: '35.26.17.2001', // Desa Bandung, Kec. Konang
  },
  {
    id: 'galis',
    name: 'Galis',
    latitude: -7.1127552,
    longitude: 112.9600067,
    adm4: '35.26.18.2001', // Desa Tellok, Kec. Galis
  },
];
