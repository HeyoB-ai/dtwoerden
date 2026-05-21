"use client";

import { useMemo, useState } from "react";
import { Car, MapPin, Clock, Truck, Activity, TimerReset } from "lucide-react";
import { useLiveData } from "@/lib/hooks/useLiveSensors";
import { Panel, MetricRow } from "@/components/shared/Panel";
import { Legend } from "@/components/shared/Legend";
import { ScenarioBar } from "@/components/shared/ScenarioBar";
import { WoerdenMap } from "@/components/map/WoerdenMap";
import { TrafficLayer } from "@/components/map/TrafficLayer";
import { TimeSeriesChart, BarsChart } from "@/components/charts/Charts";
import { ROAD_BY_ID, INTERSECTIONS } from "@/lib/data/roads";
import { roadMetrics } from "@/lib/utils/traffic";
import { dagVerkeerProfiel } from "@/lib/simulation/sensorSimulator";
import { VERKEER_SCENARIOS } from "@/lib/data/scenarios";
import { cn } from "@/lib/utils";

const WEEK = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

export default function VerkeerPage() {
  const { reading, verkeerScenario, setVerkeerScenario } = useLiveData();
  const [roadId, setRoadId] = useState<string | null>("a12");

  const dagProfiel = useMemo(() => dagVerkeerProfiel(verkeerScenario), [verkeerScenario]);

  const weekData = useMemo(
    () =>
      WEEK.map((d, i) => {
        const weekend = i >= 5;
        const base = weekend ? 28000 : 47000;
        return {
          dag: d,
          "deze week": Math.round(base * (0.92 + Math.sin(i) * 0.06)),
          "vorige week": Math.round(base * (0.88 + Math.cos(i) * 0.05)),
        };
      }),
    [],
  );

  if (!reading) return null;

  const road = roadId ? ROAD_BY_ID[roadId] : null;
  const m = road ? roadMetrics(road, reading) : null;
  const normalisatie = m ? Math.max(0, Math.round((1 - m.ratio) * 55)) : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      <ScenarioBar
        scenarios={VERKEER_SCENARIOS}
        active={verkeerScenario}
        onChange={setVerkeerScenario}
        title="Verkeersscenario simuleren"
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Wegennet & live doorstroming"
          icon={<Car className="h-4 w-4 text-water" />}
          bodyClassName="p-0"
        >
          <div className="relative">
            <WoerdenMap zoom={11.5} height={480}>
              <TrafficLayer onSelectRoad={setRoadId} />
            </WoerdenMap>
            <div className="absolute left-3 top-3 z-10">
              <Legend
                title="Congestie"
                items={[
                  { color: "#10b981", label: "Vlot" },
                  { color: "#eab308", label: "Druk" },
                  { color: "#f97316", label: "Stagnatie" },
                  { color: "#ef4444", label: "File" },
                ]}
              />
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title={road ? road.naam : "Selecteer een weg"} icon={<MapPin className="h-4 w-4 text-water" />}>
            {road && m ? (
              <div className="space-y-1">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex-1 rounded-lg border border-border bg-card/50 p-3 text-center">
                    <div className="text-[11px] text-muted-foreground">Actuele snelheid</div>
                    <div
                      className={cn(
                        "text-2xl font-bold tabular",
                        m.ratio > 0.7 ? "text-traffic-green" : m.ratio > 0.4 ? "text-alert-orange" : "text-destructive",
                      )}
                    >
                      {m.achterspoed.toFixed(0)}
                    </div>
                    <div className="text-[11px] text-muted-foreground">van {road.vrijeRijsnelheid} km/h</div>
                  </div>
                  <div className="flex-1 rounded-lg border border-border bg-card/50 p-3 text-center">
                    <div className="text-[11px] text-muted-foreground">Vertraging</div>
                    <div className="text-2xl font-bold tabular text-foreground">+{m.vertraging.toFixed(1)}</div>
                    <div className="text-[11px] text-muted-foreground">minuten</div>
                  </div>
                </div>
                <MetricRow label={<><Activity className="mr-1 inline h-3.5 w-3.5" />Voertuigen per uur</>} value={m.voertuigenPerUur.toLocaleString("nl-NL")} />
                <MetricRow label={<><Truck className="mr-1 inline h-3.5 w-3.5" />Vrachtwagen aandeel</>} value={`${road.vrachtAandeel}%`} />
                <MetricRow label="Trajectlengte" value={`${m.lengthKm.toFixed(1)} km`} />
                <MetricRow
                  label={<><TimerReset className="mr-1 inline h-3.5 w-3.5" />Verwachte normalisatie</>}
                  value={normalisatie === 0 ? "Stabiel" : `~${normalisatie} min`}
                  accent={normalisatie > 30 ? "#ef4444" : undefined}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Klik op een weg in de kaart voor details.</p>
            )}
          </Panel>

          <Panel title="Gemonitorde kruispunten" icon={<Clock className="h-4 w-4 text-water" />}>
            <div className="space-y-1.5">
              {INTERSECTIONS.map((i) => {
                const r = ROAD_BY_ID[i.road];
                const mm = r ? roadMetrics(r, reading) : null;
                const busy = mm ? mm.ratio < 0.55 : false;
                return (
                  <button
                    key={i.id}
                    onClick={() => setRoadId(i.road)}
                    className="flex w-full items-center justify-between rounded-md border border-border bg-card/40 px-3 py-2 text-left text-xs hover:border-water/40"
                  >
                    <span className="text-foreground">{i.naam}</span>
                    <span className={cn("flex items-center gap-1.5", busy ? "text-destructive" : "text-traffic-green")}>
                      <span className={cn("h-2 w-2 rounded-full", busy ? "bg-destructive" : "bg-traffic-green")} />
                      {busy ? "Druk" : "Vlot"}
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="24-uurs verkeersintensiteit" icon={<Activity className="h-4 w-4 text-water" />}>
          <p className="mb-2 text-[11px] text-muted-foreground">
            Voertuigen/uur — ochtendspits 07–09u, avondspits 16–18u
          </p>
          <BarsChart
            data={dagProfiel}
            xKey="uur"
            bars={[{ key: "intensiteit", label: "Voertuigen/uur", color: "#0ea5e9" }]}
            unit="vtg/u"
            height={220}
          />
        </Panel>

        <Panel title="Weekoverzicht & vergelijking" icon={<Activity className="h-4 w-4 text-water" />}>
          <p className="mb-2 text-[11px] text-muted-foreground">Totaal voertuigen per dag — deze week vs. vorige week</p>
          <TimeSeriesChart
            data={weekData}
            xKey="dag"
            series={[
              { key: "deze week", label: "Deze week", color: "#0ea5e9", type: "area" },
              { key: "vorige week", label: "Vorige week", color: "#8b9ab0", type: "line", dashed: true },
            ]}
            height={220}
            showLegend
            unit="vtg"
          />
        </Panel>
      </div>
    </div>
  );
}
