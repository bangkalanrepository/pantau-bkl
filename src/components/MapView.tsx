import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { Location, LocationWeatherData } from '../types';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  MAP_TILE_ATTRIBUTION,
  MAP_TILE_URL,
} from '../config/appConfig';
import { LocationMarker } from './LocationMarker';
import { WindDegreeGuide } from './WindDegreeGuide';

/** Sesuaikan viewport peta agar semua lokasi terlihat. */
function FitBounds({ locations }: { locations: readonly Location[] }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length === 0) return;
    const bounds = L.latLngBounds(
      locations.map((location) => [location.latitude, location.longitude] as [number, number]),
    );
    map.fitBounds(bounds.pad(0.18), { animate: false });
  }, [map, locations]);
  return null;
}

/**
 * Panggil invalidateSize saat ukuran container berubah (sidebar buka/tutup,
 * rotasi layar) agar tile peta tidak terpotong.
 */
function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize({ animate: false }));
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}

interface MapViewProps {
  locations: readonly Location[];
  dataMap: Record<string, LocationWeatherData>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** Peta utama Leaflet + marker seluruh lokasi. */
export function MapView({ locations, dataMap, selectedId, onSelect }: MapViewProps) {
  return (
    <div className="relative h-full w-full">
      {/* Tombol bantuan mengambang: panduan derajat arah angin */}
      <div className="absolute bottom-14 left-3 z-[1100] sm:bottom-16">
        <WindDegreeGuide variant="chip" />
      </div>
      <MapContainer
        center={DEFAULT_MAP_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        scrollWheelZoom
        className="z-0 h-full w-full"
        attributionControl
      >
        <TileLayer url={MAP_TILE_URL} attribution={MAP_TILE_ATTRIBUTION} />
        <FitBounds locations={locations} />
        <ResizeHandler />
        {locations.map((location) => (
          <LocationMarker
            key={location.id}
            location={location}
            data={dataMap[location.id]}
            selected={selectedId === location.id}
            onSelect={onSelect}
          />
        ))}
      </MapContainer>
    </div>
  );
}
