import type { SensorReading, ScenarioId, WijkId, WijkReading } from "@/lib/types";
import { WIJKEN } from "@/lib/data/wijken";
import { getScenarioEffect } from "./scenarioEngine";
import { computeAQI } from "@/lib/utils/aqiCalculator";
import { clamp } from "@/lib/utils";

const MONTH_TEMP = [4, 5, 8, 11, 15, 18, 21, 21, 17, 13, 8, 5];

function noise(amp: number): number {
  return (Math.random() - 0.5) * 2 * amp;
}

/** Diurnal rush-hour intensity 0..1 (morning 7-9, evening 16-18). */
function rushFactor(hour: number, minute: number): number {
  const h = hour + minute / 60;
  const morning = Math.exp(-Math.pow(h - 8, 2) / 1.1);
  const evening = Math.exp(-Math.pow(h - 17, 2) / 1.4);
  return clamp(Math.max(morning, evening * 0.95), 0, 1);
}

/** Daytime activity factor 0..1 for energy/temperature diurnal cycle. */
function dayFactor(hour: number): number {
  return clamp(0.45 + 0.55 * Math.sin(((hour - 6) / 24) * Math.PI * 2), 0, 1);
}

// Per-wijk static character: airOffset (proximity to A12/industry), heatOffset (urban heat island)
const WIJK_PROFILE: Record<WijkId, { air: number; heat: number; flowMul: number }> = {
  centrum: { air: 6, heat: 2.8, flowMul: 0.78 },
  noord: { air: 2, heat: 1.6, flowMul: 0.92 },
  zuid: { air: 9, heat: 2.2, flowMul: 0.85 },
  snelrewaard: { air: 7, heat: -0.4, flowMul: 1.05 },
  harmelen: { air: 3, heat: 0.6, flowMul: 1.0 },
  zegveld: { air: -3, heat: -1.4, flowMul: 1.08 },
  kamerik: { air: -2, heat: -1.1, flowMul: 1.06 },
  waarder: { air: -1, heat: -0.9, flowMul: 1.04 },
};

export function generateReading(
  prev: SensorReading | null,
  now: Date,
  scenario: ScenarioId = "geen",
): SensorReading {
  const fx = getScenarioEffect(scenario);
  const month = now.getMonth();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const rush = rushFactor(hour, minute);
  const day = dayFactor(hour);

  // ── Temperature ──
  const baseTemp = MONTH_TEMP[month] + (day - 0.5) * 7 + fx.tempAdd;
  const temperatuur = +(baseTemp + noise(0.6)).toFixed(1);
  const luchtvochtigheid = +clamp(78 - (temperatuur - 12) * 1.2 + noise(4), 45, 97).toFixed(0);

  // ── Wind (SW dominant) ──
  const windkracht = +clamp(4 + noise(1.4) + (fx.neerslagAdd > 0 ? 1.5 : 0), 2, 8).toFixed(0);
  const windSnelheid = +(windkracht * windkracht * 1.6 + noise(3)).toFixed(0);
  const windrichting = +clamp(225 + noise(35), 150, 300).toFixed(0);

  // ── Air quality ──
  const pm25 = +clamp(7 + rush * 6 + fx.aqiAdd * 0.35 + noise(1.4), 3, 90).toFixed(1);
  const pm10 = +clamp(13 + rush * 9 + fx.aqiAdd * 0.5 + noise(2), 6, 130).toFixed(1);
  const no2 = +clamp(16 + rush * 16 + fx.no2Add + noise(2.5), 6, 120).toFixed(1);
  const o3 = +clamp(40 + (MONTH_TEMP[month] - 8) * 2.5 + day * 18 + noise(5), 10, 160).toFixed(0);
  const co = +clamp(0.25 + rush * 0.25 + noise(0.04), 0.1, 1.2).toFixed(2);
  const aqi = clamp(computeAQI(pm25, pm10, no2) + Math.round(fx.aqiAdd * 0.3), 10, 240);

  // ── Traffic ──
  const verkeerSnelheidA12 = +clamp(120 * (1 - 0.74 * rush) * fx.trafficSpeedMul + noise(4), 18, 130).toFixed(0);
  const doorstroomGemiddeld = +clamp(43 * (1 - 0.42 * rush) * fx.doorstroomMul + noise(1.5), 12, 50).toFixed(0);
  const voertuigenPerUur = Math.round(clamp(2600 * (0.5 + rush) * fx.voertuigenMul + noise(150), 400, 9000));

  // ── Water ──
  const baseTarget = -18 + fx.waterTrendAdd * 9;
  let waterstandIJssel = prev ? prev.waterstandIJssel : -18;
  waterstandIJssel += (baseTarget - waterstandIJssel) * 0.05 + noise(0.4);
  waterstandIJssel = +clamp(waterstandIJssel, -70, 130).toFixed(1);
  const stijgsnelheid = +clamp(fx.waterTrendAdd + (baseTarget - waterstandIJssel) * 0.02 + noise(0.15), -6, 12).toFixed(1);
  const waterstandOudeRijn = +(waterstandIJssel * 0.7 - 6 + noise(0.5)).toFixed(1);
  const boezempeil = +(waterstandIJssel * 0.6 - 24 + noise(0.4)).toFixed(1);

  // ── Energy ──
  const energieverbruik = +clamp(16 + day * 10 + rush * 3 + noise(0.8), 8, 42).toFixed(1) * fx.energieMul;

  // ── Events / reports ──
  const actieveEvenementen = 2 + (now.getDay() === 4 ? 1 : 0) + (month >= 3 && month <= 8 ? 1 : 0);
  const meldingenOpen = clamp(5 + Math.round(rush * 4) + Math.round(noise(1.5)), 2, 18);
  const meldingenGesloten = 23 + Math.round(day * 6);

  // ── Per-wijk ──
  const perWijk = {} as Record<WijkId, WijkReading>;
  for (const w of WIJKEN) {
    const p = WIJK_PROFILE[w.id];
    const wNo2 = +clamp(no2 + p.air + noise(2), 4, 130).toFixed(1);
    const wPm25 = +clamp(pm25 + p.air * 0.4 + noise(1), 2, 95).toFixed(1);
    const wPm10 = +clamp(pm10 + p.air * 0.6 + noise(1.5), 4, 135).toFixed(1);
    perWijk[w.id] = {
      doorstroom: +clamp(doorstroomGemiddeld * p.flowMul + noise(2), 8, 55).toFixed(0),
      aqi: clamp(computeAQI(wPm25, wPm10, wNo2) + Math.round(fx.aqiAdd * 0.3), 8, 245),
      no2: wNo2,
      temperatuur: +(temperatuur + p.heat + noise(0.3)).toFixed(1),
      waterpeil: +(waterstandIJssel * 0.5 + p.heat * -2 - 180 + noise(2)).toFixed(0),
      co2: Math.round(w.inwoners * 4.1 + w.oppervlakte * 120),
    };
  }

  return {
    timestamp: now.getTime(),
    waterstandIJssel,
    waterstandOudeRijn,
    boezempeil,
    stijgsnelheid,
    temperatuur,
    gevoelstemperatuur: +(temperatuur - windkracht * 0.6 + (luchtvochtigheid > 80 && temperatuur > 24 ? 3 : 0)).toFixed(1),
    neerslag: +clamp(fx.neerslagAdd + (fx.neerslagAdd > 0 ? noise(4) : Math.max(0, noise(1.2))), 0, 60).toFixed(1),
    windrichting,
    windkracht,
    windSnelheid,
    luchtvochtigheid,
    aqi,
    pm25,
    pm10,
    no2,
    o3,
    co,
    verkeerSnelheidA12,
    doorstroomGemiddeld,
    voertuigenPerUur,
    energieverbruik: +energieverbruik.toFixed(1),
    actieveEvenementen,
    meldingenOpen,
    meldingenGesloten,
    perWijk,
  };
}

/** Build a plausible 24-hour traffic-intensity curve (vehicles/hour). */
export function dagVerkeerProfiel(scenario: ScenarioId = "geen"): { uur: string; intensiteit: number; snelheid: number }[] {
  const fx = getScenarioEffect(scenario);
  const out = [];
  for (let h = 0; h < 24; h++) {
    const rush = rushFactor(h, 0);
    const intensiteit = Math.round(2600 * (0.4 + rush) * fx.voertuigenMul + (h >= 9 && h <= 16 ? 900 : 0));
    const snelheid = Math.round(clamp(120 * (1 - 0.74 * rush) * fx.trafficSpeedMul, 20, 120));
    out.push({ uur: `${String(h).padStart(2, "0")}:00`, intensiteit, snelheid });
  }
  return out;
}
