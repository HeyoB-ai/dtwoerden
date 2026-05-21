"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Map as MlMap, StyleSpecification } from "maplibre-gl";
import { WOERDEN_CENTER } from "@/lib/data/wijken";
import { cn } from "@/lib/utils";

interface MapCtx {
  map: MlMap | null;
}
const MapContext = createContext<MapCtx>({ map: null });
export const useMap = () => useContext(MapContext).map;

// Free dark OSM-based basemap (CARTO dark_all) — no API key required.
const DARK_STYLE: StyleSpecification = {
  version: 8,
  glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
    },
  },
  layers: [
    { id: "bg", type: "background", paint: { "background-color": "#0a0f1e" } },
    { id: "carto", type: "raster", source: "carto", paint: { "raster-opacity": 0.85 } },
  ],
};

interface WoerdenMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  interactive?: boolean;
  children?: ReactNode;
}

export function WoerdenMap({
  center = WOERDEN_CENTER,
  zoom = 12,
  className,
  interactive = true,
  children,
}: WoerdenMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MlMap | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let mapInstance: MlMap | null = null;

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !containerRef.current) return;
      mapInstance = new maplibregl.Map({
        container: containerRef.current,
        style: DARK_STYLE,
        center,
        zoom,
        interactive,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
      });
      mapInstance.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        "bottom-right",
      );
      if (interactive) {
        mapInstance.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          "top-right",
        );
      }
      mapInstance.on("load", () => {
        if (!cancelled) setMap(mapInstance);
      });
    })();

    return () => {
      cancelled = true;
      mapInstance?.remove();
      setMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-border", className)}>
      <div ref={containerRef} className="absolute inset-0" />
      {!map && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink/60">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-water border-t-transparent" />
            Kaart laden…
          </div>
        </div>
      )}
      <MapContext.Provider value={{ map }}>{map && children}</MapContext.Provider>
    </div>
  );
}
