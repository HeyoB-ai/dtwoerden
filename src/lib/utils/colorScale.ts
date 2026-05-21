import { clamp } from "@/lib/utils";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Interpolate across an arbitrary set of color stops. t in [0,1]. */
export function rampColor(t: number, stops: string[]): string {
  const x = clamp(t, 0, 1) * (stops.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  if (i >= stops.length - 1) return stops[stops.length - 1];
  const a = hexToRgb(stops[i]);
  const b = hexToRgb(stops[i + 1]);
  return rgbToHex(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f);
}

const GREEN_RED = ["#10b981", "#84cc16", "#eab308", "#f97316", "#ef4444"];
const BLUE_RED = ["#0ea5e9", "#22d3ee", "#84cc16", "#f97316", "#ef4444"];

/** Air quality index → color (low good = green, high bad = red). */
export function aqiColor(aqi: number): string {
  return rampColor(aqi / 150, GREEN_RED);
}

/** Traffic flow speed → color (low = red, high = green). */
export function flowColor(kmh: number): string {
  return rampColor(1 - clamp((kmh - 12) / 38, 0, 1), GREEN_RED);
}

/** Temperature → color (cool blue → hot red), tuned 0..32 °C. */
export function heatColor(temp: number): string {
  return rampColor(clamp((temp - 2) / 30, 0, 1), BLUE_RED);
}

/** Polder water level (cm NAP) → risk color relative to thresholds. */
export function waterColor(peil: number, verhoogd = -180, kritiek = -140): string {
  // higher (less negative) = wetter = more risk
  const t = clamp((peil - (verhoogd - 60)) / (kritiek - (verhoogd - 60)), 0, 1);
  return rampColor(t, GREEN_RED);
}
