"use client";

import { useEffect, useMemo } from "react";
import type { FeatureCollection, Polygon, LineString, Point } from "geojson";
import type { GeoJSONSource } from "maplibre-gl";
import { useMap, MAP_FONT } from "./WoerdenMap";
import { buildWijkPolygons } from "@/lib/data/geojson-woerden";
import { WIJK_BY_ID } from "@/lib/data/wijken";
import { ROAD_BY_ID } from "@/lib/data/roads";
import type { ScenarioKaart } from "@/lib/scenario/types";
import type { WijkId } from "@/lib/types";

const A12_EXIT: [number, number] = [4.8883, 52.0735];

export function ScenarioMapLayer({ kaart }: { kaart: ScenarioKaart | null }) {
  const map = useMap();
  const base = useMemo(() => buildWijkPolygons(), []);

  // Build all feature collections from the scenario map data.
  const data = useMemo(() => {
    const getroffen = new Set<WijkId>(kaart?.getroffenWijken ?? []);
    const overstroomd = new Set<WijkId>(kaart?.overstroomdeWijken ?? []);

    const wijken: FeatureCollection<Polygon> = {
      type: "FeatureCollection",
      features: base.features
        .filter((f) => getroffen.has(f.properties?.id as WijkId) || overstroomd.has(f.properties?.id as WijkId))
        .map((f) => ({
          ...f,
          properties: {
            ...f.properties,
            kind: overstroomd.has(f.properties?.id as WijkId) ? "overstroomd" : "getroffen",
          },
        })),
    };

    const roads: FeatureCollection<LineString> = {
      type: "FeatureCollection",
      features: (kaart?.geblokkeerdeWegen ?? [])
        .map((id) => ROAD_BY_ID[id])
        .filter(Boolean)
        .map((r) => ({
          type: "Feature",
          properties: { naam: r.naam },
          geometry: { type: "LineString", coordinates: r.coords },
        })),
    };

    // evacuation routes: from each affected wijk center toward the A12 exit
    const evac: FeatureCollection<LineString> = {
      type: "FeatureCollection",
      features: Array.from(getroffen)
        .slice(0, 4)
        .map((id) => WIJK_BY_ID[id])
        .filter(Boolean)
        .map((w) => ({
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: [w.center, A12_EXIT] },
        })),
    };

    // emergency posts: command post at stadhuis + posts near affected wijken
    const posts: { naam: string; center: [number, number] }[] = [
      { naam: "Commandopost", center: [4.8836, 52.0858] },
      ...Array.from(getroffen)
        .slice(0, 3)
        .map((id) => WIJK_BY_ID[id])
        .filter(Boolean)
        .map((w) => ({ naam: "Hulppost", center: w.center })),
    ];
    const emergency: FeatureCollection<Point> = {
      type: "FeatureCollection",
      features: posts.map((p) => ({
        type: "Feature",
        properties: { naam: p.naam },
        geometry: { type: "Point", coordinates: p.center },
      })),
    };

    return { wijken, roads, evac, emergency };
  }, [kaart, base]);

  useEffect(() => {
    if (!map) return;

    if (!map.getSource("scenario-wijken")) {
      map.addSource("scenario-wijken", { type: "geojson", data: data.wijken });
      map.addLayer({
        id: "scenario-wijken-fill",
        type: "fill",
        source: "scenario-wijken",
        paint: {
          "fill-color": ["match", ["get", "kind"], "overstroomd", "#0ea5e9", "#f97316"],
          "fill-opacity": 0.45,
        },
      });
      map.addLayer({
        id: "scenario-wijken-line",
        type: "line",
        source: "scenario-wijken",
        paint: {
          "line-color": ["match", ["get", "kind"], "overstroomd", "#38bdf8", "#fb923c"],
          "line-width": 2,
        },
      });

      map.addSource("scenario-evac", { type: "geojson", data: data.evac });
      map.addLayer({
        id: "scenario-evac-line",
        type: "line",
        source: "scenario-evac",
        layout: { "line-cap": "round" },
        paint: { "line-color": "#10b981", "line-width": 3, "line-dasharray": [2, 1.5] },
      });
      map.addLayer({
        id: "scenario-evac-arrow",
        type: "symbol",
        source: "scenario-evac",
        layout: {
          "symbol-placement": "line",
          "symbol-spacing": 60,
          "text-field": "▶",
          "text-size": 11,
          "text-keep-upright": false,
          "text-font": MAP_FONT,
        },
        paint: { "text-color": "#10b981", "text-halo-color": "#0a0f1e", "text-halo-width": 1 },
      });

      map.addSource("scenario-roads", { type: "geojson", data: data.roads });
      map.addLayer({
        id: "scenario-roads-line",
        type: "line",
        source: "scenario-roads",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#ef4444", "line-width": 5, "line-dasharray": [1, 0.6] },
      });

      map.addSource("scenario-emergency", { type: "geojson", data: data.emergency });
      map.addLayer({
        id: "scenario-emergency-dot",
        type: "circle",
        source: "scenario-emergency",
        paint: {
          "circle-radius": 6,
          "circle-color": "#ef4444",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "scenario-emergency-label",
        type: "symbol",
        source: "scenario-emergency",
        layout: {
          "text-field": ["get", "naam"],
          "text-size": 10,
          "text-offset": [0, 1.3],
          "text-anchor": "top",
          "text-font": MAP_FONT,
        },
        paint: { "text-color": "#fecaca", "text-halo-color": "#0a0f1e", "text-halo-width": 1.2 },
      });
    } else {
      (map.getSource("scenario-wijken") as GeoJSONSource).setData(data.wijken);
      (map.getSource("scenario-evac") as GeoJSONSource).setData(data.evac);
      (map.getSource("scenario-roads") as GeoJSONSource).setData(data.roads);
      (map.getSource("scenario-emergency") as GeoJSONSource).setData(data.emergency);
    }
  }, [map, data]);

  return null;
}
