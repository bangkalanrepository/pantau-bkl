/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL endpoint BMKG (opsional; ada default). */
  readonly VITE_BMKG_API_BASE?: string;
  /** Base URL endpoint Open-Meteo Air Quality (opsional; ada default). */
  readonly VITE_OPEN_METEO_AQI_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
