"use client";

import { useEffect, useMemo, useRef } from "react";
import type { FeatureCollection, Polygon } from "geojson";
import type { GeoJSONSource } from "maplibre-gl";
import { useMap } from "./WoerdenMap";
import { useLiveData } from "@/lib/hooks/useLiveSensors";
import { buildWijkPolygons } from "@/lib/data/geojson-woerden";
import { aqiColor, flowColor, heatColor, waterColor } from "@/lib/utils/colorScale";
import type { OverlayMode, WijkId, WijkReading } from "@/lib/types";

function colorFor(mode: OverlayMode, r: WijkReading | undefined): string {
  if (!r) return "#1e2a3a";
  switch (mode) {
    case "verkeer":
      return flowColor(r.doorstroom);
    case "lucht":
      return aqiColor(r.aqi);
    case "water":
      return waterColor(r.waterpeil);
    case "hitte":
      return heatColor(r.temperatuur);
    default:
      return "#243044";
  }
}

export function WijkOverlay({
  mode,
  onSelect,
  selected,
}: {
  mode: OverlayMode;
  onSelect?: (id: WijkId) => void;
  selected?: WijkId | null;
}) {
  const map = useMap();
  const { reading } = useLiveData();
  const base = useMemo(() => buildWijkPolygons(), []);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // add layers once
  useEffect(() => {
    if (!map) return;
    if (!map.getSource("wijken")) {
      map.addSource("wijken", { type: "geojson", data: base });
      map.addLayer({
        id: "wijken-fill",
        type: "fill",
        source: "wijken",
        paint: { "fill-color": ["get", "kleur"], "fill-opacity": 0.5 },
      });
      map.addLayer({
        id: "wijken-line",
        type: "line",
        source: "wijken",
        paint: { "line-color": "#2b3b52", "line-width": 1 },
      });
      map.addLayer({
        id: "wijken-selected",
        type: "line",
        source: "wijken",
        filter: ["==", ["get", "id"], "__none__"],
        paint: { "line-color": "#0ea5e9", "line-width": 3 },
      });
      map.addLayer({
        id: "wijken-label",
        type: "symbol",
        source: "wijken",
        layout: {
          "text-field": ["get", "naam"],
          "text-size": 11,
          "text-font": ["Open Sans Regular"],
        },
        paint: {
          "text-color": "#f0f4f8",
          "text-halo-color": "#0a0f1e",
          "text-halo-width": 1.3,
        },
      });

      map.on("click", "wijken-fill", (e) => {
        const f = e.features?.[0];
        if (f && onSelectRef.current) onSelectRef.current(f.properties?.id as WijkId);
      });
      map.on("mouseenter", "wijken-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "wijken-fill", () => {
        map.getCanvas().style.cursor = "";
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // recolor on reading / mode change
  useEffect(() => {
    if (!map || !reading) return;
    const src = map.getSource("wijken") as GeoJSONSource | undefined;
    if (!src) return;
    const colored: FeatureCollection<Polygon> = {
      type: "FeatureCollection",
      features: base.features.map((f) => ({
        ...f,
        properties: {
          ...f.properties,
          kleur: colorFor(mode, reading.perWijk[f.properties?.id as WijkId]),
        },
      })),
    };
    src.setData(colored);
    if (map.getLayer("wijken-fill")) {
      map.setPaintProperty("wijken-fill", "fill-opacity", mode === "geen" ? 0.12 : 0.5);
    }
  }, [map, reading, mode, base]);

  // selection highlight
  useEffect(() => {
    if (!map || !map.getLayer("wijken-selected")) return;
    map.setFilter("wijken-selected", ["==", ["get", "id"], selected ?? "__none__"]);
  }, [map, selected]);

  return null;
}
