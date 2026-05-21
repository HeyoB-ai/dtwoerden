"use client";

import { useEffect, useMemo, useRef } from "react";
import type { FeatureCollection, Point } from "geojson";
import { useMap } from "./WoerdenMap";
import { PROJECTS, PROJECT_CATEGORIE_KLEUR } from "@/lib/data/projects";
import type { ProjectCategorie } from "@/lib/types";

export function ProjectLayer({
  visible,
  onSelect,
  selectedId,
}: {
  visible: Set<ProjectCategorie>;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
}) {
  const map = useMap();
  const onSelRef = useRef(onSelect);
  onSelRef.current = onSelect;

  const data = useMemo<FeatureCollection<Point>>(
    () => ({
      type: "FeatureCollection",
      features: PROJECTS.map((p) => ({
        type: "Feature",
        properties: { id: p.id, naam: p.naam, categorie: p.categorie, kleur: PROJECT_CATEGORIE_KLEUR[p.categorie] },
        geometry: { type: "Point", coordinates: p.center },
      })),
    }),
    [],
  );

  useEffect(() => {
    if (!map) return;
    if (!map.getSource("projects")) {
      map.addSource("projects", { type: "geojson", data });
      map.addLayer({
        id: "projects-selected",
        type: "circle",
        source: "projects",
        filter: ["==", ["get", "id"], "__none__"],
        paint: { "circle-radius": 14, "circle-color": "#ffffff", "circle-opacity": 0.15 },
      });
      map.addLayer({
        id: "projects-dot",
        type: "circle",
        source: "projects",
        paint: {
          "circle-radius": 7,
          "circle-color": ["get", "kleur"],
          "circle-stroke-color": "#0a0f1e",
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "projects-label",
        type: "symbol",
        source: "projects",
        layout: {
          "text-field": ["get", "naam"],
          "text-size": 9.5,
          "text-offset": [0, 1.4],
          "text-anchor": "top",
          "text-max-width": 9,
          "text-font": ["Open Sans Regular"],
        },
        paint: { "text-color": "#cbd5e1", "text-halo-color": "#0a0f1e", "text-halo-width": 1.2 },
      });

      map.on("click", "projects-dot", (e) => {
        const f = e.features?.[0];
        if (f && onSelRef.current) onSelRef.current(f.properties?.id as string);
      });
      map.on("mouseenter", "projects-dot", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "projects-dot", () => (map.getCanvas().style.cursor = ""));
    }
  }, [map, data]);

  // category visibility
  useEffect(() => {
    if (!map || !map.getLayer("projects-dot")) return;
    const filter = ["in", ["get", "categorie"], ["literal", Array.from(visible)]] as unknown as never;
    map.setFilter("projects-dot", filter);
    map.setFilter("projects-label", filter);
  }, [map, visible]);

  // selection highlight
  useEffect(() => {
    if (!map || !map.getLayer("projects-selected")) return;
    map.setFilter("projects-selected", ["==", ["get", "id"], selectedId ?? "__none__"]);
  }, [map, selectedId]);

  return null;
}
