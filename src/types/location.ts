export interface Location {
  /** ID unik internal, dipakai sebagai key dan identitas data. */
  id: string;
  /** Nama daerah yang tampil di UI. */
  name: string;
  latitude: number;
  longitude: number;
  /**
   * Kode wilayah BMKG tingkat desa/kelurahan (adm4).
   * Setiap lokasi memiliki kode berbeda — jangan dibagikan antar lokasi.
   * Contoh: "35.26.01.1001".
   */
  adm4?: string;
  /** Keterangan singkat opsional yang tampil di panel detail. */
  description?: string;
}
