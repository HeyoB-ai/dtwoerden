import type { Feature, FeatureCollection, Polygon, LineString, Point } from "geojson";
import { WIJKEN } from "./wijken";
import type { WijkId } from "@/lib/types";
import { seededRandom } from "@/lib/utils";

// Approximate polygon radius (km) per wijk — urban kernels small, polders large.
const RADIUS_KM: Record<WijkId, number> = {
  centrum: 0.85,
  noord: 1.15,
  zuid: 1.05,
  snelrewaard: 1.5,
  harmelen: 1.9,
  zegveld: 2.4,
  kamerik: 2.3,
  waarder: 1.9,
};

function makePolygonRing(
  center: [number, number],
  radiusKm: number,
  seed: number,
  n = 16,
): [number, number][] {
  const [lng, lat] = center;
  const latK = radiusKm / 111;
  const lngK = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  const ring: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2;
    const jitter = 0.72 + 0.5 * seededRandom(seed * 13.37 + i * 2.1);
    ring.push([
      +(lng + Math.cos(ang) * lngK * jitter).toFixed(5),
      +(lat + Math.sin(ang) * latK * jitter).toFixed(5),
    ]);
  }
  ring.push(ring[0]);
  return ring;
}

/** Build the base wijk polygon FeatureCollection (geometry only). */
export function buildWijkPolygons(): FeatureCollection<Polygon> {
  return {
    type: "FeatureCollection",
    features: WIJKEN.map((w, idx): Feature<Polygon> => ({
      type: "Feature",
      properties: { id: w.id, naam: w.naam, type: w.type },
      geometry: {
        type: "Polygon",
        coordinates: [makePolygonRing(w.center, RADIUS_KM[w.id], idx + 1)],
      },
    })),
  };
}

// ── Waterways (Woerden is a polderstad) ────────────────────────────────────

export const WATERWAYS: FeatureCollection<LineString> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { naam: "Hollandse IJssel", type: "rivier", breedte: 4 },
      geometry: {
        type: "LineString",
        coordinates: [
          [4.835, 52.062],
          [4.857, 52.07],
          [4.872, 52.078],
          [4.884, 52.0855],
          [4.898, 52.09],
          [4.915, 52.094],
          [4.94, 52.097],
          [4.965, 52.101],
        ],
      },
    },
    {
      type: "Feature",
      properties: { naam: "Oude Rijn", type: "rivier", breedte: 3 },
      geometry: {
        type: "LineString",
        coordinates: [
          [4.82, 52.0885],
          [4.85, 52.088],
          [4.875, 52.0878],
          [4.8883, 52.0883],
          [4.905, 52.0884],
          [4.93, 52.0884],
          [4.96, 52.0886],
          [4.99, 52.089],
        ],
      },
    },
    {
      type: "Feature",
      properties: { naam: "Grecht", type: "boezem", breedte: 2 },
      geometry: {
        type: "LineString",
        coordinates: [
          [4.86, 52.088],
          [4.852, 52.1],
          [4.845, 52.112],
          [4.84, 52.124],
        ],
      },
    },
    {
      type: "Feature",
      properties: { naam: "Ringvaart Woerden", type: "ringvaart", breedte: 2 },
      geometry: {
        type: "LineString",
        coordinates: [
          [4.862, 52.078],
          [4.86, 52.09],
          [4.872, 52.099],
          [4.892, 52.101],
          [4.908, 52.095],
          [4.905, 52.082],
          [4.89, 52.075],
          [4.872, 52.074],
          [4.862, 52.078],
        ],
      },
    },
  ],
};

// ── Points of interest ─────────────────────────────────────────────────────

export interface POI {
  id: string;
  naam: string;
  type: "stadhuis" | "station" | "centrum" | "bedrijven" | "gemaal" | "sensor";
  center: [number, number];
}

export const POIS: POI[] = [
  { id: "stadhuis", naam: "Stadhuis Woerden", type: "stadhuis", center: [4.8836, 52.0858] },
  { id: "station", naam: "Station Woerden", type: "station", center: [4.878, 52.0905] },
  { id: "markt", naam: "Markt / Centrum", type: "centrum", center: [4.8847, 52.0857] },
  { id: "middelland", naam: "Bedrijventerrein Middelland", type: "bedrijven", center: [4.868, 52.083] },
  { id: "polanen", naam: "Bedrijventerrein Polanen", type: "bedrijven", center: [4.905, 52.078] },
];

export const SENSOR_LOCATIES: POI[] = [
  { id: "sensor-station", naam: "Sensor Station", type: "sensor", center: [4.8785, 52.0902] },
  { id: "sensor-a12", naam: "Sensor A12-corridor", type: "sensor", center: [4.886, 52.0735] },
  { id: "sensor-centrum", naam: "Sensor Centrum", type: "sensor", center: [4.886, 52.0865] },
  { id: "sensor-middelland", naam: "Sensor Middelland", type: "sensor", center: [4.869, 52.0825] },
];

export const POI_TO_GEOJSON = (pois: POI[]): FeatureCollection<Point> => ({
  type: "FeatureCollection",
  features: pois.map((p) => ({
    type: "Feature",
    properties: { id: p.id, naam: p.naam, type: p.type },
    geometry: { type: "Point", coordinates: p.center },
  })),
});
