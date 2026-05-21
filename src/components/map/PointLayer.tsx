"use client";

import { useEffect, useMemo, useRef } from "react";
import type { FeatureCollection, Point } from "geojson";
import type { GeoJSONSource } from "maplibre-gl";
import { useMap } from "./WoerdenMap";

export interface MapPoint {
  id: string;
  naam: string;
  center: [number, number];
  kleur: string;
}

export function PointLayer({
  id,
  points,
  onSelect,
  selectedId,
  radius = 6,
  labels = true,
  pulse = false,
}: {
  id: string;
  points: MapPoint[];
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  radius?: number;
  labels?: boolean;
  pulse?: boolean;
}) {
  const map = useMap();
  const onSelRef = useRef(onSelect);
  onSelRef.current = onSelect;

  const data = useMemo<FeatureCollection<Point>>(
    () => ({
      type: "FeatureCollection",
      features: points.map((p) => ({
        type: "Feature",
        properties: { id: p.id, naam: p.naam, kleur: p.kleur },
        geometry: { type: "Point", coordinates: p.center },
      })),
    }),
    [points],
  );

  const dotId = `${id}-dot`;
  const labelId = `${id}-label`;
  const selId = `${id}-sel`;
  const glowId = `${id}-glow`;

  useEffect(() => {
    if (!map) return;
    if (!map.getSource(id)) {
      map.addSource(id, { type: "geojson", data });
      if (pulse) {
        map.addLayer({
          id: glowId,
          type: "circle",
          source: id,
          paint: { "circle-radius": radius * 2.2, "circle-color": ["get", "kleur"], "circle-opacity": 0.18 },
        });
      }
      map.addLayer({
        id: selId,
        type: "circle",
        source: id,
        filter: ["==", ["get", "id"], "__none__"],
        paint: { "circle-radius": radius + 6, "circle-color": "#ffffff", "circle-opacity": 0.15 },
      });
      map.addLayer({
        id: dotId,
        type: "circle",
        source: id,
        paint: {
          "circle-radius": radius,
          "circle-color": ["get", "kleur"],
          "circle-stroke-color": "#0a0f1e",
          "circle-stroke-width": 1.5,
        },
      });
      if (labels) {
        map.addLayer({
          id: labelId,
          type: "symbol",
          source: id,
          layout: {
            "text-field": ["get", "naam"],
            "text-size": 9.5,
            "text-offset": [0, 1.3],
            "text-anchor": "top",
            "text-max-width": 9,
            "text-font": ["Open Sans Regular"],
          },
          paint: { "text-color": "#cbd5e1", "text-halo-color": "#0a0f1e", "text-halo-width": 1.2 },
        });
      }
      map.on("click", dotId, (e) => {
        const f = e.features?.[0];
        if (f && onSelRef.current) onSelRef.current(f.properties?.id as string);
      });
      map.on("mouseenter", dotId, () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", dotId, () => (map.getCanvas().style.cursor = ""));
    } else {
      (map.getSource(id) as GeoJSONSource).setData(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, data]);

  useEffect(() => {
    if (!map || !map.getLayer(selId)) return;
    map.setFilter(selId, ["==", ["get", "id"], selectedId ?? "__none__"]);
  }, [map, selectedId, selId]);

  return null;
}
