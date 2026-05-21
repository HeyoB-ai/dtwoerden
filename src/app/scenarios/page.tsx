"use client";

import { useState } from "react";
import {
  Sparkles, Loader2, RotateCcw, ArrowRight, Car, Droplets, Wind, Zap,
  ClipboardList, Siren, AlertTriangle, GitBranch, Flame, ListChecks, Clock, Map as MapIcon, Cpu,
} from "lucide-react";
import { Panel } from "@/components/shared/Panel";
import { Legend } from "@/components/shared/Legend";
import { WoerdenMap } from "@/components/map/WoerdenMap";
import { ScenarioMapLayer } from "@/components/map/ScenarioMapLayer";
import {
  PRESETS, DUUR_OPTIES, TIJDSTIP_OPTIES, DOMEIN_LABEL, IMPACT_KLEUR, IMPACT_LABEL,
  type ScenarioAnalyse, type ScenarioDomein,
} from "@/lib/scenario/types";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Status = "idle" | "analyzing" | "active" | "error";

const DOMEIN_ICON: Record<ScenarioDomein, LucideIcon> = {
  verkeer: Car, water: Droplets, lucht: Wind, energie: Zap, "openbare-ruimte": ClipboardList, hulpdiensten: Siren,
};

function stressColor(s: number) {
  if (s >= 80) return "#ef4444";
  if (s >= 60) return "#f97316";
  if (s >= 35) return "#eab308";
  return "#10b981";
}

export default function ScenariosPage() {
  const [presetId, setPresetId] = useState<string | null>(null);
  const [scenario, setScenario] = useState("");
  const [omvang, setOmvang] = useState(50);
  const [duurIndex, setDuurIndex] = useState(2);
  const [tijdstip, setTijdstip] = useState("spits");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ScenarioAnalyse | null>(null);
  const [error, setError] = useState("");

  const selectPreset = (p: (typeof PRESETS)[number]) => {
    setPresetId(p.id);
    setScenario(p.prompt);
    setOmvang(p.omvang);
    setDuurIndex(Math.max(0, DUUR_OPTIES.indexOf(p.duur)));
    setTijdstip(p.tijdstip);
  };

  const analyze = async () => {
    if (!scenario.trim()) return;
    setStatus("analyzing");
    setError("");
    try {
      const res = await fetch("/api/scenario", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scenario, params: { omvang, duur: DUUR_OPTIES[duurIndex], tijdstip } }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Analyse mislukt.");
        setStatus("error");
        return;
      }
      setResult(data as ScenarioAnalyse);
      setStatus("active");
    } catch {
      setError("Kon de analyse-service niet bereiken.");
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setPresetId(null);
    setScenario("");
    setOmvang(50);
    setDuurIndex(2);
    setTijdstip("spits");
  };

  return (
    <div className="grid gap-4 animate-fade-in lg:grid-cols-[380px_1fr]">
      {/* ── LEFT: input ── */}
      <div className="space-y-4">
        <div className="rounded-lg border border-water/20 bg-gradient-to-br from-water/10 to-transparent p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-water/15 text-water">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold">Scenario Simulator</h2>
              <p className="text-[11px] text-muted-foreground">
                Beschrijf een situatie en zie de consequenties voor Woerden
              </p>
            </div>
          </div>
        </div>

        <Panel title="Preset scenario's" icon={<Cpu className="h-4 w-4 text-water" />}>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPreset(p)}
                className={cn(
                  "flex flex-col gap-1 rounded-lg border p-2.5 text-left transition-colors",
                  presetId === p.id ? "border-water/50 bg-water/10" : "border-border bg-card/40 hover:border-water/30",
                )}
              >
                <span className="text-lg leading-none">{p.emoji}</span>
                <span className="text-xs font-semibold leading-tight">{p.titel}</span>
                <span className="text-[10px] leading-tight text-muted-foreground">{p.omschrijving}</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Eigen scenario" icon={<Sparkles className="h-4 w-4 text-water" />}>
          <textarea
            value={scenario}
            onChange={(e) => { setScenario(e.target.value); setPresetId(null); }}
            placeholder="Bijv: Een grote brand op bedrijventerrein Middelland met rookontwikkeling richting de wijk..."
            rows={4}
            className="w-full resize-none rounded-md border border-border bg-ink/60 p-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-water/50 focus:outline-none focus:ring-1 focus:ring-water/40"
          />

          {scenario.trim().length > 0 && (
            <div className="mt-3 space-y-3">
              <SliderRow label="Omvang" value={`${omvang}/100`} hint="klein → catastrofaal">
                <input type="range" min={0} max={100} value={omvang}
                  onChange={(e) => setOmvang(Number(e.target.value))}
                  className="w-full accent-dutch-orange" />
              </SliderRow>
              <SliderRow label="Duur" value={DUUR_OPTIES[duurIndex]} hint="1 uur → 7 dagen">
                <input type="range" min={0} max={DUUR_OPTIES.length - 1} value={duurIndex}
                  onChange={(e) => setDuurIndex(Number(e.target.value))}
                  className="w-full accent-water" />
              </SliderRow>
              <div>
                <div className="mb-1 text-[11px] font-medium text-muted-foreground">Tijdstip</div>
                <div className="flex gap-1 rounded-lg bg-secondary/60 p-0.5">
                  {TIJDSTIP_OPTIES.map((t) => (
                    <button key={t} onClick={() => setTijdstip(t)}
                      className={cn("flex-1 rounded-md px-2 py-1 text-xs capitalize transition-colors",
                        tijdstip === t ? "bg-card text-foreground shadow" : "text-muted-foreground")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={analyze}
            disabled={status === "analyzing" || !scenario.trim()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-water px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-water/90 disabled:opacity-50"
          >
            {status === "analyzing" ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Analyseren…</>
            ) : (
              <>Analyseer scenario <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </Panel>
      </div>

      {/* ── RIGHT: analysis ── */}
      <div className="space-y-4">
        {/* status bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/50 px-4 py-3">
          {status === "analyzing" ? (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-water" /> Cascade-effecten berekenen…
            </span>
          ) : status === "active" && result ? (
            <>
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-dutch-orange opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-dutch-orange" />
                </span>
                <div>
                  <div className="text-sm font-semibold">Scenario actief: {result.scenarioNaam}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Bron: {result.bron === "claude" ? "Claude AI" : "lokaal model (geen API-key)"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Stadsstress</div>
                  <div className="text-xl font-bold tabular" style={{ color: stressColor(result.stadsStress) }}>
                    {result.stadsStress}<span className="text-xs font-normal text-muted-foreground">/100</span>
                  </div>
                </div>
                <button onClick={reset} className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
              </div>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">
              {status === "error" ? <span className="text-destructive">{error}</span> : "Selecteer of beschrijf een scenario om de simulatie te starten."}
            </span>
          )}
        </div>

        {result && status === "active" ? (
          <>
            {/* domain cards */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {result.domeinen.map((d) => {
                const Icon = DOMEIN_ICON[d.domein] ?? AlertTriangle;
                const color = IMPACT_KLEUR[d.impactNiveau];
                return (
                  <div key={d.domein} className="rounded-lg border border-border bg-card/50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-medium">
                        <Icon className="h-4 w-4 text-muted-foreground" /> {DOMEIN_LABEL[d.domein]}
                      </span>
                      <span className="text-sm font-bold tabular" style={{ color }}>{d.impactPct}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full transition-all" style={{ width: `${d.impactPct}%`, background: color }} />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="rounded-full px-1.5 py-0.5 text-[10px] font-medium" style={{ background: `${color}22`, color }}>
                        {IMPACT_LABEL[d.impactNiveau]}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{d.beschrijving}</p>
                  </div>
                );
              })}
            </div>

            {/* map */}
            <Panel title="Impact op de kaart" icon={<MapIcon className="h-4 w-4 text-water" />} bodyClassName="p-0">
              <div className="relative">
                <WoerdenMap zoom={11.5} height={380}>
                  <ScenarioMapLayer kaart={result.kaart} />
                </WoerdenMap>
                <div className="absolute left-3 top-3 z-10">
                  <Legend title="Scenario" items={[
                    { color: "#f97316", label: "Getroffen zone" },
                    { color: "#0ea5e9", label: "Overstroming" },
                    { color: "#ef4444", label: "Geblokkeerde weg" },
                    { color: "#10b981", label: "Evacuatieroute" },
                  ]} />
                </div>
              </div>
            </Panel>

            {/* analysis sections */}
            <div className="grid gap-3 lg:grid-cols-2">
              <Section icon={<AlertTriangle className="h-4 w-4 text-alert-orange" />} title="Directe gevolgen (eerste 30 min)" items={result.directeGevolgen} />
              <Section icon={<GitBranch className="h-4 w-4 text-water" />} title="Kettingreacties" items={result.kettingreacties} />
              <Section icon={<Flame className="h-4 w-4 text-destructive" />} title="Kritieke knelpunten" items={result.knelpunten} />
              <Panel title="Aanbevolen acties" icon={<ListChecks className="h-4 w-4 text-traffic-green" />}>
                <ol className="space-y-2">
                  {result.acties.map((a, i) => {
                    const kleur = a.prioriteit === "hoog" ? "#ef4444" : a.prioriteit === "midden" ? "#f97316" : "#10b981";
                    return (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold capitalize" style={{ background: `${kleur}22`, color: kleur }}>
                          {a.prioriteit}
                        </span>
                        <span className="text-muted-foreground">{a.actie}</span>
                      </li>
                    );
                  })}
                </ol>
              </Panel>
            </div>

            {/* timeline */}
            <Panel title="Tijdlijn — stadsstress over tijd" icon={<Clock className="h-4 w-4 text-water" />}>
              <div className="flex items-end justify-between gap-2">
                {result.tijdlijn.map((p) => {
                  const color = stressColor(p.stress);
                  return (
                    <div key={p.tijd} className="flex flex-1 flex-col items-center gap-1.5">
                      <span className="text-xs font-bold tabular" style={{ color }}>{p.stress}</span>
                      <div className="flex h-28 w-full items-end overflow-hidden rounded-md bg-secondary/40">
                        <div className="w-full rounded-md transition-all duration-700" style={{ height: `${Math.max(4, p.stress)}%`, background: color }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{p.tijd}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> Herstelprognose: <span className="text-foreground">{result.herstelprognose}</span>
              </p>
            </Panel>
          </>
        ) : (
          status !== "analyzing" && (
            <Panel title="Consequentie-analyse" icon={<Sparkles className="h-4 w-4 text-water" />}>
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
                <Cpu className="h-10 w-10 text-water/40" />
                <p className="max-w-sm text-sm">
                  Kies een preset of beschrijf zelf een scenario. De AI berekent de cascade-effecten over
                  verkeer, water, lucht, energie, openbare ruimte en hulpdiensten — en projecteert deze op de kaart.
                </p>
              </div>
            </Panel>
          )
        )}
      </div>
    </div>
  );
}

function SliderRow({ label, value, hint, children }: { label: string; value: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
        <span className="text-[11px] font-semibold tabular text-foreground">{value}</span>
      </div>
      {children}
      <div className="mt-0.5 text-[10px] text-muted-foreground/70">{hint}</div>
    </div>
  );
}

function Section({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <Panel title={title} icon={icon}>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-water" />
            {it}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
