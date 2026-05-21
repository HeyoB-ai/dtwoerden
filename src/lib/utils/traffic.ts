import type { Road, SensorReading } from "@/lib/types";
import { clamp } from "@/lib/utils";

/** Approximate length of a road polyline in km (haversine sum). */
export function roadLengthKm(coords: [number, number][]): number {
  let km = 0;
  for (let i = 1; i < coords.length; i++) {
    const [lng1, lat1] = coords[i - 1];
    const [lng2, lat2] = coords[i];
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    km += 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  return km;
}

export interface RoadMetrics {
  achterspoed: number; // achieved speed km/h
  ratio: number; // achieved / free
  vertraging: number; // delay minutes over the segment
  voertuigenPerUur: number;
  lengthKm: number;
}

export function roadMetrics(road: Road, reading: SensorReading): RoadMetrics {
  const congestion = clamp(reading.doorstroomGemiddeld / 43, 0.22, 1.05);
  const achterspoed =
    road.type === "snelweg"
      ? clamp(reading.verkeerSnelheidA12, 16, road.vrijeRijsnelheid)
      : clamp(road.vrijeRijsnelheid * congestion, 8, road.vrijeRijsnelheid);
  const ratio = clamp(achterspoed / road.vrijeRijsnelheid, 0, 1);
  const lengthKm = Math.max(1, roadLengthKm(road.coords));
  const tFree = (lengthKm / road.vrijeRijsnelheid) * 60;
  const t = (lengthKm / achterspoed) * 60;
  const vertraging = Math.max(0, t - tFree);
  const voertuigenPerUur = Math.round(
    road.voertuigenPerUur * (reading.voertuigenPerUur / 2600),
  );
  return { achterspoed, ratio, vertraging, voertuigenPerUur, lengthKm };
}
