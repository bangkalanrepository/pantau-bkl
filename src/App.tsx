import { useCallback, useEffect, useState } from "react";
import { MousePointerClick } from "lucide-react";
import { Header } from "./components/Header";
import { SummaryCards } from "./components/SummaryCards";
import { MapView } from "./components/MapView";
import { LocationDetail } from "./components/LocationDetail";
import { useWeatherData } from "./hooks/useWeatherData";
import { LOCATIONS } from "./config/locations";

/**
 * Pantau BKL — dashboard pemantauan cuaca & kualitas udara.
 *
 * Layout desktop : [ Sidebar Detail |        MAP        ]
 * Layout mobile  : [ MAP ] lalu [ Detail Lokasi ] di bawahnya.
 */
export default function App() {
  const { dataMap, isLoading, isRefreshing, lastUpdated, refresh } =
    useWeatherData(LOCATIONS);
  // Default terpilih: entri pertama di config lokasi (Kecamatan Bangkalan),
  // sehingga panel detail kiri langsung menampilkan data saat halaman dibuka.
  const [selectedId, setSelectedId] = useState<string | null>(
    LOCATIONS[0]?.id ?? null,
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);
  const handleClose = useCallback(() => {
    setSelectedId(null);
  }, []);

  const selectedEntry = selectedId !== null ? dataMap[selectedId] : undefined;

  // Di layar kecil, gulirkan tampilan ke panel detail saat lokasi dipilih.
  useEffect(() => {
    if (selectedId === null) return;
    const el = document.getElementById("panel-detail-mobile");
    if (el !== null && typeof el.scrollIntoView === "function") {
      // Hanya relevan pada layout mobile; di desktop elemen disembunyikan.
      if (!window.matchMedia("(min-width: 1024px)").matches) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [selectedId]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 lg:h-dvh lg:overflow-hidden">
      <Header
        onRefresh={refresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
      />

      <div className="shrink-0 px-3 pt-4 sm:px-4">
        <SummaryCards
          locations={LOCATIONS}
          dataMap={dataMap}
          isLoading={isLoading}
        />
      </div>

      <main className="flex min-h-0 w-full flex-1 flex-col gap-4 px-3 py-4 sm:px-4 lg:grid lg:grid-cols-[minmax(340px,400px)_minmax(0,1fr)]">
        {/* Sidebar detail — hanya desktop */}
        <div className="hidden min-h-0 lg:block">
          {selectedEntry !== undefined ? (
            <LocationDetail
              entry={selectedEntry}
              isLoading={isLoading}
              onClose={handleClose}
            />
          ) : (
            <div className="grid h-full place-items-center rounded-xl border-2 border-dashed border-slate-200 bg-white/60 p-6 text-center">
              <div className="max-w-xs space-y-2 text-slate-400">
                <MousePointerClick
                  className="mx-auto h-8 w-8"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium text-slate-600">
                  Pilih penanda di peta
                </p>
                <p className="text-xs leading-relaxed">
                  Klik salah satu titik lokasi untuk melihat detail cuaca,
                  kualitas udara, dan informasi wilayah.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Peta — bagian terbesar halaman */}
        <section
          aria-label="Peta pemantauan"
          className="h-[55vh] min-h-95 shrink-0 overflow-hidden rounded-xl border border-slate-200 shadow-sm lg:h-full lg:min-h-0"
        >
          <MapView
            locations={LOCATIONS}
            dataMap={dataMap}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </section>

        {/* Panel detail mobile — tampil di bawah peta */}
        {selectedEntry !== undefined && (
          <div id="panel-detail-mobile" className="h-[70vh] lg:hidden">
            <LocationDetail
              entry={selectedEntry}
              isLoading={isLoading}
              onClose={handleClose}
            />
          </div>
        )}
      </main>
    </div>
  );
}
