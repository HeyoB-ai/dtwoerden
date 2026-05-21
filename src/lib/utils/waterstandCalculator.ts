import type { StatusLevel } from "@/lib/types";

// Hollandse IJssel reference thresholds in cm NAP.
export const IJSSEL_DREMPELS = {
  normaalMax: 20, // ≤ +20 cm NAP normaal
  verhoogdMax: 60, // +20..+60 verhoogd
  // > +60 kritiek
} as const;

export function waterstatusIJssel(cm: number): StatusLevel {
  if (cm <= IJSSEL_DREMPELS.normaalMax) return "normaal";
  if (cm <= IJSSEL_DREMPELS.verhoogdMax) return "verhoogd";
  return "kritiek";
}

export function polderStatus(
  cm: number,
  drempelVerhoogd: number,
  drempelKritiek: number,
): StatusLevel {
  if (cm >= drempelKritiek) return "kritiek";
  if (cm >= drempelVerhoogd) return "verhoogd";
  return "normaal";
}

export const STATUS_KLEUR: Record<StatusLevel, string> = {
  normaal: "#10b981",
  verhoogd: "#f97316",
  kritiek: "#ef4444",
};

export const STATUS_LABEL: Record<StatusLevel, string> = {
  normaal: "Normaal",
  verhoogd: "Verhoogd",
  kritiek: "Kritiek",
};

export interface ForecastPoint {
  uur: number; // hours from now
  peil: number; // cm NAP
  ondergrens: number;
  bovengrens: number;
}

/**
 * Project a 72-hour water-level forecast from current level + trend (cm/h).
 * Adds a damped decay toward streefpeil and a widening uncertainty band.
 */
export function forecast72u(
  huidig: number,
  trendPerUur: number,
  streefpeil = -10,
): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  let peil = huidig;
  let trend = trendPerUur;
  for (let uur = 0; uur <= 72; uur += 3) {
    if (uur > 0) {
      // trend decays, level relaxes toward streefpeil
      trend *= 0.86;
      peil += trend * 3 + (streefpeil - peil) * 0.04 * 3;
    }
    const band = 4 + uur * 0.55;
    points.push({
      uur,
      peil: +peil.toFixed(1),
      ondergrens: +(peil - band).toFixed(1),
      bovengrens: +(peil + band).toFixed(1),
    });
  }
  return points;
}

/** Hours until a rising level reaches a critical threshold (null if not rising). */
export function uurTotKritiek(
  huidig: number,
  trendPerUur: number,
  drempel: number,
): number | null {
  if (trendPerUur <= 0.01 || huidig >= drempel) return huidig >= drempel ? 0 : null;
  return +((drempel - huidig) / trendPerUur).toFixed(1);
}
