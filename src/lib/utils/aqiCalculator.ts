// Simplified air-quality index calculation (US-EPA style breakpoints),
// tuned for typical Dutch background concentrations.

interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

const PM25_BP: Breakpoint[] = [
  { cLow: 0, cHigh: 12, iLow: 0, iHigh: 50 },
  { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
  { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
];

const PM10_BP: Breakpoint[] = [
  { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
  { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
  { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
  { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
];

function subIndex(c: number, bps: Breakpoint[]): number {
  const bp = bps.find((b) => c >= b.cLow && c <= b.cHigh) ?? bps[bps.length - 1];
  return Math.round(
    ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (c - bp.cLow) + bp.iLow,
  );
}

export function computeAQI(pm25: number, pm10: number, no2: number): number {
  const i25 = subIndex(pm25, PM25_BP);
  const i10 = subIndex(pm10, PM10_BP);
  // NO2 contribution (µg/m³ → light influence; EU jaargem norm 40)
  const iNo2 = Math.round((no2 / 40) * 50);
  return Math.max(i25, i10, iNo2);
}

export interface AqiCategory {
  label: string;
  color: string;
  advies: string;
}

export function aqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50)
    return { label: "Goed", color: "#10b981", advies: "Luchtkwaliteit is goed." };
  if (aqi <= 100)
    return { label: "Matig", color: "#eab308", advies: "Acceptabel; gevoelige groepen alert." };
  if (aqi <= 150)
    return {
      label: "Ongezond (gevoelig)",
      color: "#f97316",
      advies: "Gevoelige groepen inspanning beperken.",
    };
  if (aqi <= 200)
    return { label: "Ongezond", color: "#ef4444", advies: "Beperk langdurige inspanning buiten." };
  return { label: "Zeer ongezond", color: "#a855f7", advies: "Vermijd inspanning buiten." };
}

// RIVM / EU reference norms (jaargemiddelde, µg/m³)
export const NORMEN = {
  pm25: { eu: 25, who: 5, label: "PM2.5" },
  pm10: { eu: 40, who: 15, label: "PM10" },
  no2: { eu: 40, who: 10, label: "NO₂" },
  o3: { eu: 120, who: 100, label: "O₃ (8-uurs)" },
} as const;
