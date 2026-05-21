import type { ScenarioId } from "@/lib/types";

export interface ScenarioEffect {
  trafficSpeedMul: number; // achieved speed as fraction of free-flow
  doorstroomMul: number;
  voertuigenMul: number;
  no2Add: number;
  aqiAdd: number;
  waterTrendAdd: number; // cm/h added to base IJssel trend
  neerslagAdd: number; // mm/h
  tempAdd: number;
  energieMul: number;
}

const NEUTRAL: ScenarioEffect = {
  trafficSpeedMul: 1,
  doorstroomMul: 1,
  voertuigenMul: 1,
  no2Add: 0,
  aqiAdd: 0,
  waterTrendAdd: 0,
  neerslagAdd: 0,
  tempAdd: 0,
  energieMul: 1,
};

const EFFECTS: Record<ScenarioId, Partial<ScenarioEffect>> = {
  geen: {},
  // ── Verkeer ──
  ochtendspits: { trafficSpeedMul: 0.45, doorstroomMul: 0.55, voertuigenMul: 1.8, no2Add: 9, aqiAdd: 8, energieMul: 1.1 },
  "evenement-centrum": { trafficSpeedMul: 0.55, doorstroomMul: 0.6, voertuigenMul: 1.4, no2Add: 5, aqiAdd: 5 },
  "a12-afsluiting": { trafficSpeedMul: 0.3, doorstroomMul: 0.4, voertuigenMul: 1.6, no2Add: 14, aqiAdd: 12 },
  "brug-open": { trafficSpeedMul: 0.7, doorstroomMul: 0.75, voertuigenMul: 1.1 },
  "wegwerk-n198": { trafficSpeedMul: 0.65, doorstroomMul: 0.7, voertuigenMul: 1.15, no2Add: 3 },
  // ── Water ──
  "extreme-neerslag": { waterTrendAdd: 9, neerslagAdd: 40, energieMul: 1.4, doorstroomMul: 0.8, trafficSpeedMul: 0.8 },
  droogte: { waterTrendAdd: -2.2, neerslagAdd: 0, tempAdd: 2 },
  hoogwater: { waterTrendAdd: 6, energieMul: 1.3 },
  gemaalstoring: { waterTrendAdd: 4.5, energieMul: 0.85 },
  hittegolf: { tempAdd: 8, waterTrendAdd: -1.4, aqiAdd: 14, no2Add: 6, energieMul: 1.5 },
};

export function getScenarioEffect(id: ScenarioId): ScenarioEffect {
  return { ...NEUTRAL, ...EFFECTS[id] };
}

export interface GemaalResponse {
  id: string;
  naam: string;
  actie: string;
  belasting: number; // % of capacity
}

/** Human-readable water response for a scenario (used on Waterbeheer screen). */
export function waterScenarioRespons(id: ScenarioId): {
  samenvatting: string;
  gemalen: GemaalResponse[];
  uurTotKritiek: number | null;
  piekPeil: number; // cm NAP
} {
  switch (id) {
    case "extreme-neerslag":
      return {
        samenvatting:
          "40 mm/uur neerslag: alle gemalen schakelen binnen 8 minuten op. Boezempeil stijgt ~9 cm/uur; kritieke grens nadert binnen ~7 uur zonder ingreep.",
        gemalen: [
          { id: "gemaal-noord", naam: "Gemaal Woerden-Noord", actie: "Opgeschakeld → 100%", belasting: 100 },
          { id: "gemaal-zuid", naam: "Gemaal Woerden-Zuid", actie: "Opgeschakeld → 95%", belasting: 95 },
          { id: "gemaal-harmelen", naam: "Gemaal Harmelen", actie: "Opgeschakeld → 80%", belasting: 80 },
          { id: "gemaal-zegveld", naam: "Gemaal Zegveld", actie: "Opgeschakeld → 90%", belasting: 90 },
          { id: "gemaal-kamerik", naam: "Gemaal Kamerik-Mijzijde", actie: "Opgeschakeld → 75%", belasting: 75 },
        ],
        uurTotKritiek: 7,
        piekPeil: 78,
      };
    case "droogte":
      return {
        samenvatting:
          "14 dagen neerslagtekort: peilen zakken, gemalen grotendeels in standby. Wateraanvoer/inlaat vanuit boezem nodig om streefpeilen te handhaven.",
        gemalen: [
          { id: "gemaal-noord", naam: "Gemaal Woerden-Noord", actie: "Standby — inlaat actief", belasting: 10 },
          { id: "gemaal-zuid", naam: "Gemaal Woerden-Zuid", actie: "Minimaal", belasting: 20 },
          { id: "gemaal-harmelen", naam: "Gemaal Harmelen", actie: "Standby", belasting: 5 },
          { id: "gemaal-zegveld", naam: "Gemaal Zegveld", actie: "Standby — veendaling-monitoring", belasting: 12 },
          { id: "gemaal-kamerik", naam: "Gemaal Kamerik-Mijzijde", actie: "Standby", belasting: 5 },
        ],
        uurTotKritiek: null,
        piekPeil: -35,
      };
    case "hoogwater":
      return {
        samenvatting:
          "Verhoogde aanvoer Hollandse IJssel: boezempeil stijgt ~6 cm/uur. Gemalen draaien om polders te ontlasten; kritieke grens binnen ~11 uur.",
        gemalen: [
          { id: "gemaal-noord", naam: "Gemaal Woerden-Noord", actie: "Opgeschakeld → 90%", belasting: 90 },
          { id: "gemaal-zuid", naam: "Gemaal Woerden-Zuid", actie: "Opgeschakeld → 100%", belasting: 100 },
          { id: "gemaal-harmelen", naam: "Gemaal Harmelen", actie: "Opgeschakeld → 70%", belasting: 70 },
          { id: "gemaal-zegveld", naam: "Gemaal Zegveld", actie: "Opgeschakeld → 65%", belasting: 65 },
          { id: "gemaal-kamerik", naam: "Gemaal Kamerik-Mijzijde", actie: "Opgeschakeld → 60%", belasting: 60 },
        ],
        uurTotKritiek: 11,
        piekPeil: 64,
      };
    case "gemaalstoring":
      return {
        samenvatting:
          "Uitval Gemaal Woerden-Noord: capaciteit herverdeeld over Zuid en Harmelen. Polder Bulwijk loopt achter; kritieke grens binnen ~16 uur zonder herstel.",
        gemalen: [
          { id: "gemaal-noord", naam: "Gemaal Woerden-Noord", actie: "STORING — 0%", belasting: 0 },
          { id: "gemaal-zuid", naam: "Gemaal Woerden-Zuid", actie: "Overgenomen → 100%", belasting: 100 },
          { id: "gemaal-harmelen", naam: "Gemaal Harmelen", actie: "Opgeschakeld → 95%", belasting: 95 },
          { id: "gemaal-zegveld", naam: "Gemaal Zegveld", actie: "Normaal", belasting: 45 },
          { id: "gemaal-kamerik", naam: "Gemaal Kamerik-Mijzijde", actie: "Normaal", belasting: 30 },
        ],
        uurTotKritiek: 16,
        piekPeil: 52,
      };
    case "hittegolf":
      return {
        samenvatting:
          "Hittegolf: verhoogde verdamping en lage aanvoer. Peilen dalen; risico op veenoxidatie en blauwalg. Inlaat nodig, gemalen minimaal.",
        gemalen: [
          { id: "gemaal-noord", naam: "Gemaal Woerden-Noord", actie: "Standby — inlaat", belasting: 8 },
          { id: "gemaal-zuid", naam: "Gemaal Woerden-Zuid", actie: "Minimaal", belasting: 15 },
          { id: "gemaal-harmelen", naam: "Gemaal Harmelen", actie: "Standby", belasting: 5 },
          { id: "gemaal-zegveld", naam: "Gemaal Zegveld", actie: "Standby — veenmonitoring", belasting: 10 },
          { id: "gemaal-kamerik", naam: "Gemaal Kamerik-Mijzijde", actie: "Standby", belasting: 5 },
        ],
        uurTotKritiek: null,
        piekPeil: -28,
      };
    default:
      return {
        samenvatting:
          "Normale operatie. Peilen binnen streefwaarden, gemalen in regulier ritme.",
        gemalen: [
          { id: "gemaal-noord", naam: "Gemaal Woerden-Noord", actie: "Standby", belasting: 5 },
          { id: "gemaal-zuid", naam: "Gemaal Woerden-Zuid", actie: "Actief — regulier", belasting: 53 },
          { id: "gemaal-harmelen", naam: "Gemaal Harmelen", actie: "Standby", belasting: 5 },
          { id: "gemaal-zegveld", naam: "Gemaal Zegveld", actie: "Actief — regulier", belasting: 45 },
          { id: "gemaal-kamerik", naam: "Gemaal Kamerik-Mijzijde", actie: "Standby", belasting: 4 },
        ],
        uurTotKritiek: null,
        piekPeil: 8,
      };
  }
}
