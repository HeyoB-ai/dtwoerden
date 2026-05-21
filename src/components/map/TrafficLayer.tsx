"use client";

import { useEffect, useMemo, useRef } from "react";
import type { FeatureCollection, LineString, Point } from "geojson";
import type { GeoJSONSource } from "maplibre-gl";
import { useMap } from "./WoerdenMap";
import { useLiveData } from "@/lib/hooks/useLiveSensors";
import { ROADS, INTERSECTIONS } from "@/lib/data/roads";
import { roadMetrics } from "@/lib/utils/traffic";
import { rampColor } from "@/lib/utils/colorScale";

const FLOW_STOPS = ["#10b981", "#84cc16", "#eab308", "#f97316", "#ef4444"];

export function TrafficLayer({ onSelectRoad }: { onSelectRoad?: (id: string) => void }) {
  const map = useMap();
  const { reading } = useLiveData();
  const onSelRef = useRef(onSelectRoad);
  onSelRef.current = onSelectRoad;

  const roadsBase: FeatureCollection<LineString> = useMemo(
    () => ({
      type: "FeatureCollection",
      features: ROADS.map((r) => ({
        type: "Feature",
        properties: { id: r.id, naam: r.naam, type: r.type, kleur: "#10b981" },
        geometry: { type: "LineString", coordinates: r.coords },
      })),
    }),
    [],
  );

  const intersectionsData: FeatureCollection<Point> = useMemo(
    () => ({
      type: "FeatureCollection",
      features: INTERSECTIONS.map((i) => ({
        type: "Feature",
        properties: { id: i.id, naam: i.naam },
        geometry: { type: "Point", coordinates: i.center },
      })),
    }),
    [],
  );

  useEffect(() => {
    if (!map) return;
    if (!map.getSource("roads")) {
      map.addSource("roads", { type: "geojson", data: roadsBase });
      map.addLayer({
        id: "roads-casing",
        type: "line",
        source: "roads",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#0a0f1e", "line-width": 8, "line-opacity": 0.7 },
      });
      map.addLayer({
        id: "roads-line",
        type: "line",
        source: "roads",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": ["get", "kleur"], "line-width": 5 },
      });
      map.addLayer({
        id: "roads-arrows",
        type: "symbol",
        source: "roads",
        layout: {
          "symbol-placement": "line",
          "symbol-spacing": 70,
          "text-field": "▶",
          "text-size": 12,
          "text-keep-upright": false,
          "text-font": ["Noto Sans Regular"],
        },
        paint: { "text-color": "#0a0f1e", "text-halo-color": "#ffffff", "text-halo-width": 0.4 },
      });

      map.addSource("intersections", { type: "geojson", data: intersectionsData });
      map.addLayer({
        id: "intersections-pulse",
        type: "circle",
        source: "intersections",
        paint: {
          "circle-radius": 10,
          "circle-color": "#3b82f6",
          "circle-opacity": 0.2,
        },
      });
      map.addLayer({
        id: "intersections-dot",
        type: "circle",
        source: "intersections",
        paint: {
          "circle-radius": 4,
          "circle-color": "#3b82f6",
          "circle-stroke-color": "#0a0f1e",
          "circle-stroke-width": 1.5,
        },
      });

      map.on("click", "roads-line", (e) => {
        const f = e.features?.[0];
        if (f && onSelRef.current) onSelRef.current(f.properties?.id as string);
      });
      map.on("mouseenter", "roads-line", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "roads-line", () => (map.getCanvas().style.cursor = ""));
    }

    // animate intersection pulse
    let raf = 0;
    const start = performance.now();
    const pulse = (t: number) => {
      const phase = ((t - start) % 1800) / 1800;
      if (map.getLayer("intersections-pulse")) {
        map.setPaintProperty("intersections-pulse", "circle-radius", 6 + phase * 16);
        map.setPaintProperty("intersections-pulse", "circle-opacity", 0.35 * (1 - phase));
      }
      raf = requestAnimationFrame(pulse);
    };
    raf = requestAnimationFrame(pulse);
    return () => cancelAnimationFrame(raf);
  }, [map, roadsBase, intersectionsData]);

  // recolor by congestion
  useEffect(() => {
    if (!map || !reading) return;
    const src = map.getSource("roads") as GeoJSONSource | undefined;
    if (!src) return;
    const colored: FeatureCollection<LineString> = {
      type: "FeatureCollection",
      features: ROADS.map((r) => {
        const m = roadMetrics(r, reading);
        return {
          type: "Feature",
          properties: { id: r.id, naam: r.naam, type: r.type, kleur: rampColor(1 - m.ratio, FLOW_STOPS) },
          geometry: { type: "LineString", coordinates: r.coords },
        };
      }),
    };
    src.setData(colored);
  }, [map, reading]);

  return null;
}
