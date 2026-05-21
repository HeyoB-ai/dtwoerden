"use client";

import { useEffect } from "react";
import type { GeoJSONSource } from "maplibre-gl";
import { useMap } from "./WoerdenMap";
import { WATERWAYS } from "@/lib/data/geojson-woerden";
import { GEMALEN, SLUIZEN } from "@/lib/data/gemalen";
import type { FeatureCollection, Point } from "geojson";

const DASH_SEQ = [
  [0, 4, 3],
  [1, 4, 2],
  [2, 4, 1],
  [3, 4, 0],
  [0, 1, 3, 3],
  [0, 2, 3, 2],
  [0, 3, 3, 1],
];

function gemaalColor(belasting: number, status: string): string {
  if (status === "storing") return "#ef4444";
  if (belasting >= 70) return "#f97316";
  if (belasting >= 20) return "#0ea5e9";
  return "#10b981";
}

export function WaterLayer({
  showGemalen = true,
  belasting,
}: {
  showGemalen?: boolean;
  belasting?: Record<string, number>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    let raf = 0;

    if (!map.getSource("waterways")) {
      map.addSource("waterways", { type: "geojson", data: WATERWAYS });
      map.addLayer({
        id: "water-base",
        type: "line",
        source: "waterways",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#0ea5e9",
          "line-width": ["interpolate", ["linear"], ["get", "breedte"], 2, 2.5, 4, 6],
          "line-opacity": 0.55,
        },
      });
      map.addLayer({
        id: "water-flow",
        type: "line",
        source: "waterways",
        layout: { "line-cap": "round" },
        paint: {
          "line-color": "#7dd3fc",
          "line-width": 1.8,
          "line-dasharray": [0, 4, 3],
        },
      });
    }

    // animate flow
    let step = 0;
    let last = 0;
    const animate = (t: number) => {
      if (t - last > 90) {
        step = (step + 1) % DASH_SEQ.length;
        if (map.getLayer("water-flow")) {
          map.setPaintProperty("water-flow", "line-dasharray", DASH_SEQ[step]);
        }
        last = t;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(raf);
  }, [map]);

  // gemalen + sluizen
  useEffect(() => {
    if (!map || !showGemalen) return;
    const data: FeatureCollection<Point> = {
      type: "FeatureCollection",
      features: [
        ...GEMALEN.map((g) => ({
          type: "Feature" as const,
          properties: {
            id: g.id,
            naam: g.naam,
            kind: "gemaal",
            kleur: gemaalColor(belasting?.[g.id] ?? (g.status === "actief" ? 53 : 5), g.status),
          },
          geometry: { type: "Point" as const, coordinates: g.center },
        })),
        ...SLUIZEN.map((s) => ({
          type: "Feature" as const,
          properties: { id: s.id, naam: s.naam, kind: "sluis", kleur: "#94a3b8" },
          geometry: { type: "Point" as const, coordinates: s.center },
        })),
      ],
    };
    if (!map.getSource("gemalen")) {
      map.addSource("gemalen", { type: "geojson", data });
      map.addLayer({
        id: "gemalen-glow",
        type: "circle",
        source: "gemalen",
        paint: {
          "circle-radius": 12,
          "circle-color": ["get", "kleur"],
          "circle-opacity": 0.18,
        },
      });
      map.addLayer({
        id: "gemalen-dot",
        type: "circle",
        source: "gemalen",
        paint: {
          "circle-radius": 5,
          "circle-color": ["get", "kleur"],
          "circle-stroke-color": "#0a0f1e",
          "circle-stroke-width": 1.5,
        },
      });
      map.addLayer({
        id: "gemalen-label",
        type: "symbol",
        source: "gemalen",
        layout: {
          "text-field": ["get", "naam"],
          "text-size": 10,
          "text-offset": [0, 1.3],
          "text-anchor": "top",
          "text-font": ["Open Sans Regular"],
        },
        paint: { "text-color": "#cbd5e1", "text-halo-color": "#0a0f1e", "text-halo-width": 1.2 },
      });
    } else {
      (map.getSource("gemalen") as GeoJSONSource).setData(data);
    }
  }, [map, showGemalen, belasting]);

  return null;
}
