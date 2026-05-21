"use client";

import { useMemo, useState } from "react";
import { Wind, Thermometer, Droplets, Leaf, Gauge as GaugeIcon } from "lucide-react";
import { useLiveData } from "@/lib/hooks/useLiveSensors";
import { Panel, MetricRow } from "@/components/shared/Panel";
import { Legend } from "@/components/shared/Legend";
import { WindCompass } from "@/components/shared/WindCompass";
import { Gauge } from "@/components/dashboard/Gauge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { WoerdenMap } from "@/components/map/WoerdenMap";
import { WijkOverlay } from "@/components/map/WijkOverlay";
import { PointLayer } from "@/components/map/PointLayer";
import { TimeSeriesChart } from "@/components/charts/Charts";
import { SENSOR_LOCATIES } from "@/lib/data/geojson-woerden";
import { WIJKEN } from "@/lib/data/wijken";
import { aqiCategory, NORMEN } from "@/lib/utils/aqiCalculator";
import { forecast72u, waterstatusIJssel, STATUS_LABEL, STATUS_KLEUR } from "@/lib/utils/waterstandCalculator";
import { POLDERS } from "@/lib/data/gemalen";
import { seededRandom } from "@/lib/utils";
import type { WijkId } from "@/lib/types";

const DUURZAAMHEID: Record<WijkId, { zon: number; groeneDaken: number; warmtenet: number }> = {
  centrum: { zon: 18, groeneDaken: 12, warmtenet: 4 },
  noord: { zon: 34, groeneDaken: 9, warmtenet: 28 },
  zuid: { zon: 41, groeneDaken: 7, warmtenet: 11 },
  snelrewaard: { zon: 52, groeneDaken: 3, warmtenet: 0 },
  harmelen: { zon: 38, groeneDaken: 5, warmtenet: 2 },
  zegveld: { zon: 47, groeneDaken: 2, warmtenet: 0 },
  kamerik: { zon: 44, groeneDaken: 3, warmtenet: 0 },
  waarder: { zon: 49, groeneDaken: 2, warmtenet: 0 },
};

const DAGEN_KORT = ["7d", "6d", "5d", "4d", "3d", "2d", "gisteren"];

export default function KlimaatPage() {
  const { reading, waterScenario, setWaterScenario } = useLiveData();
  const [selWijk, setSelWijk] = useState<WijkId | null>(null);

  const luchtTijdlijn = useMemo(
    () =>
      DAGEN_KORT.map((d, i) => ({
        dag: d,
        "PM2.5": +(7 + seededRandom(i + 1) * 8).toFixed(1),
        PM10: +(13 + seededRandom(i + 9) * 12).toFixed(1),
        "NO₂": +(16 + seededRandom(i + 17) * 18).toFixed(1),
      })),
    [],
  );

  const tempTijdlijn = useMemo(() => {
    const base = reading?.temperatuur ?? 14;
    return DAGEN_KORT.map((d, i) => ({
      dag: d,
      max: +(base + 4 + seededRandom(i + 3) * 4).toFixed(1),
      min: +(base - 5 + seededRandom(i + 21) * 3).toFixed(1),
      gemiddeld: +(base + seededRandom(i + 33) * 2 - 1).toFixed(1),
      historisch: +(base - 1.5 + seededRandom(i + 41)).toFixed(1),
    }));
  }, [reading?.temperatuur]);

  const waterForecast = useMemo(
    () =>
      reading
        ? forecast72u(reading.waterstandIJssel, reading.stijgsnelheid).map((p) => ({
            uur: `+${p.uur}u`,
            peil: p.peil,
            band: [p.ondergrens, p.bovengrens],
          }))
        : [],
    [reading],
  );

  const sensorPoints = useMemo(
    () => SENSOR_LOCATIES.map((s) => ({ id: s.id, naam: s.naam, center: s.center, kleur: "#0ea5e9" })),
    [],
  );

  if (!reading) return null;
  const aqiCat = aqiCategory(reading.aqi);
  const waterStatus = waterstatusIJssel(reading.waterstandIJssel);

  return (
    <div className="animate-fade-in">
      <Tabs defaultValue="lucht">
        <TabsList className="flex-wrap">
          <TabsTrigger value="lucht"><Wind className="mr-1.5 h-4 w-4" />Luchtkwaliteit</TabsTrigger>
          <TabsTrigger value="hitte"><Thermometer className="mr-1.5 h-4 w-4" />Temperatuur & Hitte</TabsTrigger>
          <TabsTrigger value="water"><Droplets className="mr-1.5 h-4 w-4" />Waterstanden</TabsTrigger>
          <TabsTrigger value="bodem"><Leaf className="mr-1.5 h-4 w-4" />Bodem & Duurzaamheid</TabsTrigger>
        </TabsList>

        {/* ── LUCHTKWALITEIT ── */}
        <TabsContent value="lucht">
          <div className="grid gap-4 xl:grid-cols-3">
            <Panel className="xl:col-span-2" title="Luchtkwaliteit per wijk (AQI)" icon={<Wind className="h-4 w-4 text-water" />} bodyClassName="p-0">
              <div className="relative">
                <WoerdenMap zoom={11.5} height={420}>
                  <WijkOverlay mode="lucht" onSelect={setSelWijk} selected={selWijk} />
                  <PointLayer id="sensoren" points={sensorPoints} radius={5} pulse />
                </WoerdenMap>
                <div className="absolute left-3 top-3 z-10">
                  <Legend title="AQI" items={[
                    { color: "#10b981", label: "Goed" },
                    { color: "#eab308", label: "Matig" },
                    { color: "#f97316", label: "Ongezond (gev.)" },
                    { color: "#ef4444", label: "Ongezond" },
                  ]} />
                </div>
              </div>
            </Panel>

            <div className="space-y-4">
              <Panel title="Stedelijk gemiddelde" icon={<GaugeIcon className="h-4 w-4 text-water" />}>
                <div className="flex items-center justify-center">
                  <Gauge value={reading.aqi} min={0} max={150} unit={`AQI · ${aqiCat.label}`} color={aqiCat.color} />
                </div>
                <p className="mt-1 text-center text-xs text-muted-foreground">{aqiCat.advies}</p>
              </Panel>
              <Panel title="Parameters vs. RIVM/EU-norm" icon={<Wind className="h-4 w-4 text-water" />}>
                <ParamRow label={NORMEN.pm25.label} value={reading.pm25} unit="µg/m³" norm={NORMEN.pm25.eu} />
                <ParamRow label={NORMEN.pm10.label} value={reading.pm10} unit="µg/m³" norm={NORMEN.pm10.eu} />
                <ParamRow label={NORMEN.no2.label} value={reading.no2} unit="µg/m³" norm={NORMEN.no2.eu} />
                <ParamRow label="O₃" value={reading.o3} unit="µg/m³" norm={NORMEN.o3.eu} />
                <ParamRow label="CO" value={reading.co} unit="mg/m³" norm={4} digits={2} />
              </Panel>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Panel className="lg:col-span-2" title="Tijdlijn afgelopen 7 dagen" icon={<Wind className="h-4 w-4 text-water" />}>
              <TimeSeriesChart
                data={luchtTijdlijn}
                xKey="dag"
                series={[
                  { key: "PM2.5", label: "PM2.5", color: "#0ea5e9" },
                  { key: "PM10", label: "PM10", color: "#a855f7" },
                  { key: "NO₂", label: "NO₂", color: "#f97316" },
                ]}
                unit="µg/m³"
                showLegend
                height={220}
              />
            </Panel>
            <Panel title="Windrichting & verspreiding" icon={<Wind className="h-4 w-4 text-water" />}>
              <div className="flex flex-col items-center gap-3 py-2">
                <WindCompass richting={reading.windrichting} kracht={reading.windkracht} />
                <p className="text-center text-xs text-muted-foreground">
                  Dominante ZW-wind voert fijnstof vanaf de A12-corridor richting het centrum. Verspreidingssnelheid {reading.windSnelheid} km/h.
                </p>
              </div>
            </Panel>
          </div>
        </TabsContent>

        {/* ── HITTE ── */}
        <TabsContent value="hitte">
          <div className="grid gap-4 xl:grid-cols-3">
            <Panel className="xl:col-span-2" title="Hitte-eiland effect" icon={<Thermometer className="h-4 w-4 text-alert-orange" />} bodyClassName="p-0">
              <div className="relative">
                <WoerdenMap zoom={11.5} height={420}>
                  <WijkOverlay mode="hitte" onSelect={setSelWijk} selected={selWijk} />
                </WoerdenMap>
                <div className="absolute left-3 top-3 z-10">
                  <Legend title="Temperatuur" items={[
                    { color: "#0ea5e9", label: "Koel" },
                    { color: "#84cc16", label: "Mild" },
                    { color: "#f97316", label: "Warm" },
                    { color: "#ef4444", label: "Heet" },
                  ]} />
                </div>
              </div>
            </Panel>
            <div className="space-y-4">
              <Panel title="Actuele temperatuur" icon={<Thermometer className="h-4 w-4 text-alert-orange" />}>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <Stat label="Gemeten" value={`${reading.temperatuur.toFixed(1)} °C`} />
                  <Stat label="Gevoel" value={`${reading.gevoelstemperatuur.toFixed(1)} °C`} />
                  <Stat label="Luchtvochtigheid" value={`${reading.luchtvochtigheid}%`} />
                  <Stat label="Wind" value={`${reading.windkracht} Bft`} />
                </div>
              </Panel>
              <Panel title="Hittestress-risico zones" icon={<Thermometer className="h-4 w-4 text-alert-orange" />}>
                <div className="space-y-2 text-sm">
                  <RiskRow zone="Centrum / Markt" niveau={reading.gevoelstemperatuur > 28 ? "hoog" : "midden"} reden="versteend, kwetsbare bewoners" />
                  <RiskRow zone="A12-corridor" niveau="midden" reden="weerkaatsing asfalt" />
                  <RiskRow zone="Bedrijventerreinen" niveau="midden" reden="weinig groen" />
                  <RiskRow zone="Groene Hart polder" niveau="laag" reden="open water & groen" />
                </div>
              </Panel>
            </div>
          </div>
          <div className="mt-4">
            <Panel title="Temperatuur — 7 dagen vs. historisch gemiddelde" icon={<Thermometer className="h-4 w-4 text-alert-orange" />}>
              <TimeSeriesChart
                data={tempTijdlijn}
                xKey="dag"
                series={[
                  { key: "max", label: "Max", color: "#ef4444" },
                  { key: "gemiddeld", label: "Gemiddeld", color: "#f97316", type: "area" },
                  { key: "min", label: "Min", color: "#0ea5e9" },
                  { key: "historisch", label: "Historisch gem.", color: "#8b9ab0", dashed: true },
                ]}
                unit="°C"
                showLegend
                height={240}
              />
            </Panel>
          </div>
        </TabsContent>

        {/* ── WATERSTANDEN ── */}
        <TabsContent value="water">
          <div className="grid gap-4 lg:grid-cols-4">
            <Panel title="Hollandse IJssel" icon={<Droplets className="h-4 w-4 text-water" />}>
              <div className="flex justify-center">
                <Gauge value={reading.waterstandIJssel} min={-70} max={130} unit="cm NAP" color={STATUS_KLEUR[waterStatus]} />
              </div>
              <p className="text-center text-xs" style={{ color: STATUS_KLEUR[waterStatus] }}>{STATUS_LABEL[waterStatus]}</p>
            </Panel>
            <Panel title="Kerncijfers" className="lg:col-span-1">
              <MetricRow label="Oude Rijn" value={`${reading.waterstandOudeRijn} cm NAP`} />
              <MetricRow label="Boezempeil" value={`${reading.boezempeil} cm NAP`} />
              <MetricRow label="Stijgsnelheid" value={`${reading.stijgsnelheid > 0 ? "+" : ""}${reading.stijgsnelheid} cm/u`} accent={reading.stijgsnelheid > 1 ? "#f97316" : undefined} />
              <MetricRow label="Neerslag" value={`${reading.neerslag} mm/u`} />
            </Panel>
            <Panel title="Polderpeilen" className="lg:col-span-2">
              <div className="space-y-1">
                {POLDERS.slice(0, 5).map((p) => (
                  <MetricRow key={p.id} label={p.naam} value={`${p.huidigPeil} / ${p.streefpeil} cm NAP`} />
                ))}
              </div>
            </Panel>
          </div>
          <div className="mt-4">
            <Panel
              title="Waterstand Hollandse IJssel — historie & voorspelling 72u"
              icon={<Droplets className="h-4 w-4 text-water" />}
              action={
                <button
                  onClick={() => setWaterScenario(waterScenario === "hoogwater" ? "geen" : "hoogwater")}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium ${waterScenario === "hoogwater" ? "border-destructive bg-destructive/15 text-destructive" : "border-border text-muted-foreground hover:text-foreground"}`}
                >
                  Hoogwater scenario
                </button>
              }
            >
              <TimeSeriesChart
                data={waterForecast}
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
          </div>
        </TabsContent>

        {/* ── BODEM & DUURZAAMHEID ── */}
        <TabsContent value="bodem">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="CO₂-uitstoot & duurzaamheid per wijk" icon={<Leaf className="h-4 w-4 text-traffic-green" />}>
              <div className="space-y-3">
                {WIJKEN.map((w) => {
                  const d = DUURZAAMHEID[w.id];
                  const co2 = reading.perWijk[w.id]?.co2 ?? 0;
                  return (
                    <div key={w.id} className="rounded-lg border border-border bg-card/40 p-3">
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-medium">{w.naam}</span>
                        <span className="text-xs text-muted-foreground">{co2.toLocaleString("nl-NL")} t CO₂/jaar</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="w-24">Zonnepanelen</span>
                        <Progress value={d.zon} indicatorClassName="bg-traffic-green" className="h-1.5 flex-1" />
                        <span className="w-8 text-right tabular">{d.zon}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
            <div className="space-y-4">
              <Panel title="Verduurzaming gemeente" icon={<Leaf className="h-4 w-4 text-traffic-green" />}>
                <div className="grid grid-cols-2 gap-3">
                  <BigStat label="Zonnepanelen-adoptie" value="39%" sub="gemiddeld over wijken" color="#10b981" />
                  <BigStat label="Groene daken" value="5,4%" sub="van geschikt dakopp." color="#84cc16" />
                  <BigStat label="Warmtenet-aansluitingen" value="1.240" sub="huishoudens" color="#0ea5e9" />
                  <BigStat label="Vergunningen duurzaamheid" value="312" sub="dit jaar verleend" color="#3b82f6" />
                </div>
              </Panel>
              <Panel title="Bodemkwaliteit Groene Hart" icon={<Leaf className="h-4 w-4 text-traffic-green" />}>
                <p className="text-sm text-muted-foreground">
                  Het veenweidegebied rond Woerden is gevoelig voor <span className="text-foreground">bodemdaling</span> en
                  <span className="text-foreground"> veenoxidatie</span>. Peilbeheer (zie Waterbeheer) is bepalend voor de
                  CO₂-uitstoot uit veen. Actief gemonitord i.s.m. HDSR en Provincie Utrecht.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <Stat label="Bodemdaling" value="6 mm/jr" />
                  <Stat label="Veenoxidatie" value="hoog" />
                  <Stat label="Grondwater" value="−45 cm" />
                </div>
              </Panel>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ParamRow({ label, value, unit, norm, digits = 0 }: { label: string; value: number; unit: string; norm: number; digits?: number }) {
  const over = value > norm;
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-medium tabular" style={{ color: over ? "#f97316" : "#10b981" }}>
          {value.toFixed(digits)} {unit}
        </span>
        <span className="text-[11px] text-muted-foreground">norm {norm}</span>
      </span>
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

function BigStat({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-card/40 p-3">
      <div className="text-2xl font-bold tabular" style={{ color }}>{value}</div>
      <div className="text-xs font-medium">{label}</div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function RiskRow({ zone, niveau, reden }: { zone: string; niveau: "laag" | "midden" | "hoog"; reden: string }) {
  const kleur = niveau === "hoog" ? "#ef4444" : niveau === "midden" ? "#f97316" : "#10b981";
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-card/40 px-3 py-2">
      <div>
        <div className="text-sm">{zone}</div>
        <div className="text-[11px] text-muted-foreground">{reden}</div>
      </div>
      <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: `${kleur}22`, color: kleur }}>
        {niveau}
      </span>
    </div>
  );
}
