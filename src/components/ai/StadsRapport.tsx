"use client";

import type { SensorReading } from "@/lib/types";
import { INSIGHTS } from "@/lib/data/insights";
import { waterstatusIJssel, STATUS_LABEL, STATUS_KLEUR } from "@/lib/utils/waterstandCalculator";
import { aqiCategory } from "@/lib/utils/aqiCalculator";
import { FileText, AlertTriangle, ListChecks, Grid3x3 } from "lucide-react";

const DOMEIN_LABEL: Record<string, string> = {
  verkeer: "Verkeer & Mobiliteit",
  lucht: "Klimaat & Luchtkwaliteit",
  water: "Waterbeheer",
  energie: "Energie",
  evenementen: "Evenementen",
};

function statusChip(label: string, kleur: string) {
  return (
    <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: `${kleur}22`, color: kleur }}>
      {label}
    </span>
  );
}

export function StadsRapport({ reading }: { reading: SensorReading }) {
  const waterSt = waterstatusIJssel(reading.waterstandIJssel);
  const aqiCat = aqiCategory(reading.aqi);
  const verkeerOk = reading.doorstroomGemiddeld > 32;

  const domeinen = [
    {
      key: "verkeer",
      status: verkeerOk ? "Goed" : "Aandacht",
      kleur: verkeerOk ? "#10b981" : "#f97316",
      tekst: `Gemiddelde doorstroom ${reading.doorstroomGemiddeld} km/h, A12 ${reading.verkeerSnelheidA12} km/h.`,
    },
    {
      key: "lucht",
      status: aqiCat.label,
      kleur: aqiCat.color,
      tekst: `AQI ${reading.aqi}, NO₂ ${reading.no2} µg/m³ (m.n. nabij A12).`,
    },
    {
      key: "water",
      status: STATUS_LABEL[waterSt],
      kleur: STATUS_KLEUR[waterSt],
      tekst: `Hollandse IJssel ${reading.waterstandIJssel} cm NAP, stijgsnelheid ${reading.stijgsnelheid} cm/u.`,
    },
    {
      key: "energie",
      status: "Binnen norm",
      kleur: "#10b981",
      tekst: `Gemeentelijk verbruik ${reading.energieverbruik} MW.`,
    },
    {
      key: "evenementen",
      status: `${reading.actieveEvenementen} actief`,
      kleur: "#3b82f6",
      tekst: `${reading.meldingenOpen} open meldingen openbare ruimte.`,
    },
  ];

  const top3 = [...INSIGHTS]
    .sort((a, b) => ({ hoog: 0, midden: 1, laag: 2 }[a.ernst] - { hoog: 0, midden: 1, laag: 2 }[b.ernst]))
    .slice(0, 3);

  // risk matrix cells: rows = impact (hoog→laag), cols = kans (laag→hoog)
  const matrix: { x: number; y: number; label: string; kleur: string }[] = [
    { x: 2, y: 0, label: "Hoogwater", kleur: "#ef4444" },
    { x: 1, y: 0, label: "Luchtkw. A12", kleur: "#f97316" },
    { x: 2, y: 1, label: "Spitsfile", kleur: "#f97316" },
    { x: 1, y: 1, label: "Hitte centrum", kleur: "#eab308" },
    { x: 0, y: 2, label: "Gemaalstoring", kleur: "#10b981" },
    { x: 1, y: 2, label: "Evenementdrukte", kleur: "#3b82f6" },
  ];
  const cellLabels = { impact: ["Hoog", "Midden", "Laag"], kans: ["Laag", "Midden", "Hoog"] };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <FileText className="h-5 w-5 text-water" />
        <div>
          <h3 className="text-base font-bold">Stadsrapport — week 21, 2026</h3>
          <p className="text-[11px] text-muted-foreground">
            Automatisch gegenereerd op basis van digital-twin data · {new Date().toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" })}
          </p>
        </div>
      </div>

      {/* Samenvatting */}
      <section>
        <h4 className="mb-2 text-sm font-semibold">1. Samenvatting status alle domeinen</h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {domeinen.map((d) => (
            <div key={d.key} className="flex items-start justify-between gap-2 rounded-lg border border-border bg-card/40 p-3">
              <div>
                <div className="text-sm font-medium">{DOMEIN_LABEL[d.key]}</div>
                <div className="text-[11px] text-muted-foreground">{d.tekst}</div>
              </div>
              {statusChip(d.status, d.kleur)}
            </div>
          ))}
        </div>
      </section>

      {/* Top 3 */}
      <section>
        <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <AlertTriangle className="h-4 w-4 text-alert-orange" /> 2. Top 3 aandachtspunten
        </h4>
        <ol className="space-y-2">
          {top3.map((t, i) => (
            <li key={t.id} className="flex gap-3 rounded-lg border border-border bg-card/40 p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-alert-orange/15 text-xs font-bold text-alert-orange">
                {i + 1}
              </span>
              <div>
                <div className="text-sm font-medium">{t.titel}</div>
                <div className="text-[11px] text-muted-foreground">{t.analyse}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Acties */}
      <section>
        <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <ListChecks className="h-4 w-4 text-traffic-green" /> 3. Aanbevolen acties &amp; budget
        </h4>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-card/60 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Prioriteit</th>
                <th className="px-3 py-2 font-medium">Actie</th>
                <th className="px-3 py-2 text-right font-medium">Budgetindicatie</th>
              </tr>
            </thead>
            <tbody>
              {INSIGHTS.map((ins, i) => (
                <tr key={ins.id} className="border-t border-border/60">
                  <td className="px-3 py-2">
                    {statusChip(i < 2 ? "Hoog" : i < 4 ? "Midden" : "Laag", i < 2 ? "#ef4444" : i < 4 ? "#f97316" : "#10b981")}
                  </td>
                  <td className="px-3 py-2 text-foreground">{ins.aanbeveling.split(".")[0]}.</td>
                  <td className="px-3 py-2 text-right tabular text-foreground">{ins.budgetIndicatie}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Risicomatrix */}
      <section>
        <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Grid3x3 className="h-4 w-4 text-water" /> 4. Risicomatrix
        </h4>
        <div className="flex gap-2">
          <div className="flex flex-col justify-around py-6 text-[10px] text-muted-foreground">
            <span className="-rotate-90 whitespace-nowrap">Impact →</span>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-1">
              {[0, 1, 2].map((y) =>
                [0, 1, 2].map((x) => {
                  const items = matrix.filter((m) => m.x === x && m.y === y);
                  const intensity = (x + (2 - y)) / 4; // higher right-top
                  const bg = `rgba(239,68,68,${0.06 + intensity * 0.14})`;
                  return (
                    <div key={`${x}-${y}`} className="min-h-[58px] rounded border border-border p-1.5" style={{ background: bg }}>
                      {items.map((it) => (
                        <span key={it.label} className="mb-1 block rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ background: `${it.kleur}33`, color: it.kleur }}>
                          {it.label}
                        </span>
                      ))}
                    </div>
                  );
                }),
              )}
            </div>
            <div className="mt-1 grid grid-cols-3 gap-1 text-center text-[10px] text-muted-foreground">
              {cellLabels.kans.map((k) => (<span key={k}>{k}</span>))}
            </div>
            <div className="mt-0.5 text-center text-[10px] text-muted-foreground">Kans →</div>
          </div>
        </div>
      </section>
    </div>
  );
}
