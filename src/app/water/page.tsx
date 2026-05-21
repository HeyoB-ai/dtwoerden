"use client";

import { useMemo } from "react";
import { Droplets, Waves, AlertTriangle, Gauge as GaugeIcon, Activity } from "lucide-react";
import { useLiveData } from "@/lib/hooks/useLiveSensors";
import { Panel, MetricRow } from "@/components/shared/Panel";
import { Legend } from "@/components/shared/Legend";
import { ScenarioBar } from "@/components/shared/ScenarioBar";
import { Gauge } from "@/components/dashboard/Gauge";
import { GemaalCard } from "@/components/water/GemaalCard";
import { WoerdenMap } from "@/components/map/WoerdenMap";
import { WijkOverlay } from "@/components/map/WijkOverlay";
import { WaterLayer } from "@/components/map/WaterLayer";
import { TimeSeriesChart } from "@/components/charts/Charts";
import { WATER_SCENARIOS } from "@/lib/data/scenarios";
import { GEMALEN, POLDERS } from "@/lib/data/gemalen";
import { waterScenarioRespons } from "@/lib/simulation/scenarioEngine";
import { forecast72u, waterstatusIJssel, STATUS_KLEUR, STATUS_LABEL, polderStatus } from "@/lib/utils/waterstandCalculator";
import type { GemaalStatus } from "@/lib/types";

export default function WaterPage() {
  const { reading, waterScenario, setWaterScenario } = useLiveData();

  const respons = useMemo(() => waterScenarioRespons(waterScenario), [waterScenario]);
  const belastingMap = useMemo(
    () => Object.fromEntries(respons.gemalen.map((g) => [g.id, g.belasting])),
    [respons],
  );

  const forecast = useMemo(
    () =>
      reading
        ? forecast72u(reading.waterstandIJssel, reading.stijgsnelheid).map((p) => ({
            uur: `+${p.uur}u`,
            peil: p.peil,
          }))
        : [],
    [reading],
  );

  if (!reading) return null;
  const waterStatus = waterstatusIJssel(reading.waterstandIJssel);

  const gemaalStatus = (id: string): GemaalStatus => {
    const b = belastingMap[id] ?? 5;
    const r = respons.gemalen.find((g) => g.id === id);
    if (r?.actie.toUpperCase().includes("STORING")) return "storing";
    return b > 20 ? "actief" : "standby";
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-start gap-2 rounded-lg border border-water/20 bg-water/5 p-3 text-sm">
        <Waves className="mt-0.5 h-4 w-4 shrink-0 text-water" />
        <p className="text-muted-foreground">
          Woerden is een <span className="font-medium text-foreground">polderstad in het Groene Hart</span> — waterbeheer is
          existentieel. Peilbeheer en gemalen worden beheerd i.s.m. <span className="text-foreground">Hoogheemraadschap De Stichtse Rijnlanden (HDSR)</span>.
        </p>
      </div>

      <ScenarioBar scenarios={WATER_SCENARIOS} active={waterScenario} onChange={setWaterScenario} title="Klimaatscenario simuleren" />

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Waterinfrastructuur Woerden" icon={<Droplets className="h-4 w-4 text-water" />} bodyClassName="p-0">
          <div className="relative">
            <WoerdenMap zoom={11.5} height={460}>
              <WijkOverlay mode="water" />
              <WaterLayer showGemalen belasting={belastingMap} />
            </WoerdenMap>
            <div className="absolute left-3 top-3 z-10">
              <Legend
                title="Gemaalbelasting"
                items={[
                  { color: "#10b981", label: "Standby" },
                  { color: "#0ea5e9", label: "Actief" },
                  { color: "#f97316", label: "Hoog" },
                  { color: "#ef4444", label: "Storing" },
                ]}
              />
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Boezem & rivierpeil" icon={<GaugeIcon className="h-4 w-4 text-water" />}>
            <div className="flex justify-center">
              <Gauge value={reading.waterstandIJssel} min={-70} max={130} unit="cm NAP" color={STATUS_KLEUR[waterStatus]} />
            </div>
            <div className="text-center text-xs font-medium" style={{ color: STATUS_KLEUR[waterStatus] }}>
              Hollandse IJssel — {STATUS_LABEL[waterStatus]}
            </div>
            <div className="mt-3">
              <MetricRow label="Boezempeil" value={`${reading.boezempeil} cm NAP`} />
              <MetricRow label="Oude Rijn" value={`${reading.waterstandOudeRijn} cm NAP`} />
              <MetricRow
                label="Stijgsnelheid"
                value={`${reading.stijgsnelheid > 0 ? "+" : ""}${reading.stijgsnelheid} cm/u`}
                accent={reading.stijgsnelheid > 1 ? "#f97316" : reading.stijgsnelheid < -0.5 ? "#0ea5e9" : undefined}
              />
              <MetricRow label="Neerslag" value={`${reading.neerslag} mm/u`} />
            </div>
          </Panel>

          <Panel
            title="Scenario-respons"
            icon={<AlertTriangle className="h-4 w-4 text-dutch-orange" />}
          >
            <p className="text-xs leading-relaxed text-muted-foreground">{respons.samenvatting}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-border bg-card/50 p-2.5">
                <div className="text-[11px] text-muted-foreground">Verwacht piekpeil</div>
                <div className="text-lg font-bold tabular" style={{ color: respons.piekPeil > 20 ? "#ef4444" : "#0ea5e9" }}>
                  {respons.piekPeil} <span className="text-xs font-normal">cm NAP</span>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card/50 p-2.5">
                <div className="text-[11px] text-muted-foreground">Tijd tot kritiek</div>
                <div className="text-lg font-bold tabular" style={{ color: respons.uurTotKritiek !== null ? "#f97316" : "#10b981" }}>
                  {respons.uurTotKritiek !== null ? `~${respons.uurTotKritiek} u` : "n.v.t."}
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* Gemalen */}
      <div>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Activity className="h-4 w-4 text-water" /> Gemalen — live status
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {GEMALEN.map((g) => (
            <GemaalCard key={g.id} gemaal={g} belasting={belastingMap[g.id] ?? (g.status === "actief" ? 53 : 5)} status={gemaalStatus(g.id)} />
          ))}
        </div>
      </div>

      {/* Waterstand dashboard */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Waterstand Hollandse IJssel — voorspelling 72u" icon={<Droplets className="h-4 w-4 text-water" />}>
          <TimeSeriesChart
            data={forecast}
            xKey="uur"
            series={[{ key: "peil", label: "Verwacht peil", color: "#0ea5e9", type: "area" }]}
            refLines={[
              { y: 20, color: "#f97316", label: "Verhoogd" },
              { y: 60, color: "#ef4444", label: "Kritiek" },
            ]}
            unit="cm NAP"
            height={260}
          />
        </Panel>
        <Panel title="Polderpeilen & alarmgrenzen" icon={<GaugeIcon className="h-4 w-4 text-water" />}>
          <div className="space-y-2">
            {POLDERS.map((p) => {
              const st = polderStatus(p.huidigPeil, p.drempelVerhoogd, p.drempelKritiek);
              return (
                <div key={p.id} className="flex items-center justify-between rounded-md border border-border bg-card/40 px-3 py-2 text-sm">
                  <div>
                    <div>{p.naam}</div>
                    <div className="text-[11px] text-muted-foreground">streef {p.streefpeil} cm NAP</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular">{p.huidigPeil} cm</div>
                    <div className="text-[11px] font-medium" style={{ color: STATUS_KLEUR[st] }}>{STATUS_LABEL[st]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
