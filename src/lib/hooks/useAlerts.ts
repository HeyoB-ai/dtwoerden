import type { Alert, SensorReading, ScenarioId } from "@/lib/types";
import { waterstatusIJssel } from "@/lib/utils/waterstandCalculator";

/** Derive the active alert feed from the current reading + scenario. */
export function deriveAlerts(r: SensorReading, scenario: ScenarioId): Alert[] {
  const alerts: Alert[] = [];
  const t = r.timestamp;

  const waterStatus = waterstatusIJssel(r.waterstandIJssel);
  if (waterStatus === "verhoogd") {
    alerts.push({
      id: "a-water-verhoogd",
      bericht: `Waterstand Hollandse IJssel nadert verhoogd niveau (${r.waterstandIJssel.toFixed(0)} cm NAP)`,
      niveau: "waarschuwing",
      domein: "water",
      tijd: t,
    });
  } else if (waterStatus === "kritiek") {
    alerts.push({
      id: "a-water-kritiek",
      bericht: `KRITIEK: Waterstand Hollandse IJssel ${r.waterstandIJssel.toFixed(0)} cm NAP — gemalen op maximale capaciteit`,
      niveau: "kritiek",
      domein: "water",
      tijd: t,
    });
  }

  if (r.no2 > 38) {
    alerts.push({
      id: "a-no2",
      bericht: `Verhoogde NO₂-waarden gemeten nabij A12 (${r.no2.toFixed(0)} µg/m³)`,
      niveau: "waarschuwing",
      domein: "lucht",
      tijd: t,
    });
  }

  if (r.verkeerSnelheidA12 < 55) {
    const file = Math.round((1 - r.verkeerSnelheidA12 / 120) * 8);
    alerts.push({
      id: "a-verkeer",
      bericht: `Verkeershinder A12 afrit Woerden — file ${file} km, snelheid ${r.verkeerSnelheidA12.toFixed(0)} km/h`,
      niveau: file > 5 ? "kritiek" : "waarschuwing",
      domein: "verkeer",
      tijd: t,
    });
  }

  if (r.gevoelstemperatuur > 30) {
    alerts.push({
      id: "a-hitte",
      bericht: `Hittewaarschuwing: gevoelstemperatuur ${r.gevoelstemperatuur.toFixed(0)} °C verwacht`,
      niveau: r.gevoelstemperatuur > 35 ? "kritiek" : "waarschuwing",
      domein: "lucht",
      tijd: t,
    });
  }

  if (r.neerslag > 10) {
    alerts.push({
      id: "a-neerslag",
      bericht: `Hevige neerslag gemeten: ${r.neerslag.toFixed(0)} mm/uur — verhoogde belasting riool & gemalen`,
      niveau: "waarschuwing",
      domein: "water",
      tijd: t,
    });
  }

  // Baseline informational alerts so the ticker is never empty
  alerts.push(
    {
      id: "a-gemaal",
      bericht: `Gemaal Woerden-Zuid draait regulier — ${Math.round(53 + (r.timestamp % 7))}% capaciteit`,
      niveau: "info",
      domein: "water",
      tijd: t,
    },
    {
      id: "a-melding",
      bericht: `Melding openbare ruimte: prioriteit hoog — Kerkstraat (wateroverlast riool)`,
      niveau: "info",
      domein: "meldingen",
      tijd: t,
    },
    {
      id: "a-energie",
      bericht: `Energieverbruik gemeente ${r.energieverbruik.toFixed(1)} MW — binnen verwachting`,
      niveau: "info",
      domein: "energie",
      tijd: t,
    },
  );

  if (scenario !== "geen") {
    alerts.unshift({
      id: "a-scenario",
      bericht: `SCENARIO ACTIEF — digital twin draait gesimuleerde situatie`,
      niveau: "waarschuwing",
      domein: "verkeer",
      tijd: t,
    });
  }

  return alerts;
}
