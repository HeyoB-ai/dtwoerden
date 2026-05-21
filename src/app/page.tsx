"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Gauge as GaugeIcon,
  Wind,
  Droplets,
  CalendarDays,
  ClipboardList,
  Zap,
  Map as MapIcon,
  Boxes,
} from "lucide-react";
import { useLiveData } from "@/lib/hooks/useLiveSensors";
import { KPICard } from "@/components/dashboard/KPICard";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { Panel } from "@/components/shared/Panel";
import { Legend } from "@/components/shared/Legend";
import { WoerdenMap } from "@/components/map/WoerdenMap";
import { WijkOverlay } from "@/components/map/WijkOverlay";
import { WaterLayer } from "@/components/map/WaterLayer";
import { PointLayer } from "@/components/map/PointLayer";
import { POIS } from "@/lib/data/geojson-woerden";
import { WIJK_BY_ID } from "@/lib/data/wijken";
import { waterstatusIJssel, STATUS_LABEL } from "@/lib/utils/waterstandCalculator";
import { aqiCategory } from "@/lib/utils/aqiCalculator";
import type { OverlayMode, WijkId } from "@/lib/types";
import { cn } from "@/lib/utils";

const CityViz = dynamic(() => import("@/components/three/CityViz"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
      3D-model laden…
    </div>
  ),
});

const POI_KLEUR: Record<string, string> = {
  stadhuis: "#ff6b2b",
  station: "#3b82f6",
  centrum: "#eab308",
  bedrijven: "#a855f7",
};

const OVERLAYS: { id: OverlayMode; label: string }[] = [
  { id: "verkeer", label: "Verkeer" },
  { id: "lucht", label: "Luchtkwaliteit" },
  { id: "water", label: "Water" },
];

const LEGENDS: Record<string, { color: string; label: string }[]> = {
  verkeer: [
    { color: "#10b981", label: "Vlot" },
    { color: "#eab308", label: "Druk" },
    { color: "#f97316", label: "Stagnatie" },
    { color: "#ef4444", label: "File" },
  ],
  lucht: [
    { color: "#10b981", label: "Goed" },
    { color: "#eab308", label: "Matig" },
    { color: "#f97316", label: "Ongezond (gev.)" },
    { color: "#ef4444", label: "Ongezond" },
  ],
  water: [
    { color: "#10b981", label: "Normaal" },
    { color: "#f97316", label: "Verhoogd" },
    { color: "#ef4444", label: "Kritiek" },
  ],
};

export default function DashboardPage() {
  const { reading, history } = useLiveData();
  const [mode, setMode] = useState<OverlayMode>("water");
  const [selected, setSelected] = useState<WijkId | null>(null);

  const hist = useMemo(
    () => ({
      doorstroom: history.map((h) => h.doorstroomGemiddeld),
      aqi: history.map((h) => h.aqi),
      water: history.map((h) => h.waterstandIJssel),
      energie: history.map((h) => h.energieverbruik),
    }),
    [history],
  );

  const poiPoints = useMemo(
    () =>
      POIS.map((p) => ({ id: p.id, naam: p.naam, center: p.center, kleur: POI_KLEUR[p.type] ?? "#94a3b8" })),
    [],
  );

  if (!reading) return null;

  const waterStatus = waterstatusIJssel(reading.waterstandIJssel);
  const aqiCat = aqiCategory(reading.aqi);
  const selWijk = selected ? WIJK_BY_ID[selected] : null;
  const selReading = selected ? reading.perWijk[selected] : null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <KPICard
          label="Verkeer doorstroom"
          value={reading.doorstroomGemiddeld}
          unit="km/h"
          icon={GaugeIcon}
          accent="#10b981"
          sub="gem. snelheid"
          history={hist.doorstroom}
        />
        <KPICard
          label="Luchtkwaliteit"
          value={reading.aqi}
          unit="AQI"
          icon={Wind}
          accent={aqiCat.color}
          sub={aqiCat.label}
          history={hist.aqi}
        />
        <KPICard
          label="Hollandse IJssel"
          value={reading.waterstandIJssel}
          unit="cm NAP"
          icon={Droplets}
          accent="#0ea5e9"
          sub={STATUS_LABEL[waterStatus]}
          status={waterStatus}
          history={hist.water}
        />
        <KPICard
          label="Actieve evenementen"
          value={reading.actieveEvenementen}
          icon={CalendarDays}
          accent="#3b82f6"
          sub="vandaag gepland"
        />
        <KPICard
          label="Meldingen openb. ruimte"
          value={reading.meldingenOpen}
          icon={ClipboardList}
          accent="#f97316"
          sub={`${reading.meldingenGesloten} gesloten vandaag`}
        />
        <KPICard
          label="Energieverbruik"
          value={reading.energieverbruik}
          unit="MW"
          digits={1}
          icon={Zap}
          accent="#a855f7"
          sub="gemeentelijk net"
          history={hist.energie}
        />
      </div>

      {/* Map + side column */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Kaart gemeente Woerden"
          icon={<MapIcon className="h-4 w-4 text-water" />}
          action={
            <div className="flex gap-1 rounded-lg bg-secondary/60 p-0.5">
              {OVERLAYS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setMode(o.id)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    mode === o.id ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          }
          bodyClassName="p-0"
        >
          <div className="relative">
            <WoerdenMap zoom={11.5} className="h-[460px]">
              <WijkOverlay mode={mode} onSelect={setSelected} selected={selected} />
              <WaterLayer showGemalen={false} />
              <PointLayer id="pois" points={poiPoints} radius={5} pulse />
            </WoerdenMap>
            <div className="absolute left-3 top-3 z-10">
              <Legend items={LEGENDS[mode]} title={OVERLAYS.find((o) => o.id === mode)?.label} />
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          {selWijk && selReading ? (
            <Panel title={selWijk.naam} action={<button onClick={() => setSelected(null)} className="text-[11px] text-muted-foreground hover:text-foreground">sluiten</button>}>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Stat label="Doorstroom" value={`${selReading.doorstroom} km/h`} />
                <Stat label="AQI" value={`${selReading.aqi}`} />
                <Stat label="NO₂" value={`${selReading.no2} µg/m³`} />
                <Stat label="Temperatuur" value={`${selReading.temperatuur} °C`} />
                <Stat label="Polderpeil" value={`${selReading.waterpeil} cm NAP`} />
                <Stat label="CO₂" value={`${selReading.co2.toLocaleString("nl-NL")} t/j`} />
                <Stat label="Inwoners" value={selWijk.inwoners.toLocaleString("nl-NL")} />
                <Stat label="Oppervlakte" value={`${selWijk.oppervlakte} km²`} />
              </div>
            </Panel>
          ) : (
            <Panel title="Live alerts" icon={<span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />}>
              <AlertFeed max={5} />
            </Panel>
          )}

          <Panel title="Digital Twin model" icon={<Boxes className="h-4 w-4 text-water" />} bodyClassName="p-0">
            <div className="h-[200px] w-full">
              <CityViz />
            </div>
          </Panel>
        </div>
      </div>

      {!selWijk && (
        <Panel title="Live meldingenfeed" icon={<span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />}>
          <div className="grid gap-2 md:grid-cols-2">
            <AlertFeed max={6} />
          </div>
        </Panel>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-2.5">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-semibold tabular">{value}</div>
    </div>
  );
}
