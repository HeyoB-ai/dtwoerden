"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Map as MapIcon, Users, Car, ParkingSquare, Shield, Trash2, Droplets, ClipboardList } from "lucide-react";
import { Panel, MetricRow } from "@/components/shared/Panel";
import { Legend } from "@/components/shared/Legend";
import { WoerdenMap } from "@/components/map/WoerdenMap";
import { PointLayer } from "@/components/map/PointLayer";
import { EVENTS } from "@/lib/data/events";
import { MELDINGEN } from "@/lib/data/meldingen";
import type { EventItem, Prioriteit, MeldingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const EVENT_KLEUR: Record<EventItem["categorie"], string> = {
  markt: "#eab308",
  festival: "#ff6b2b",
  sport: "#10b981",
  feestdag: "#3b82f6",
  cultuur: "#a855f7",
};

const PRIO_KLEUR: Record<Prioriteit, string> = {
  laag: "#10b981",
  midden: "#eab308",
  hoog: "#f97316",
  spoed: "#ef4444",
};

const STATUS_KLEUR: Record<MeldingStatus, string> = {
  nieuw: "#3b82f6",
  "in behandeling": "#f97316",
  opgelost: "#10b981",
};

const IMPACT_KLEUR: Record<string, string> = { laag: "#10b981", midden: "#f97316", hoog: "#ef4444" };

export default function EvenementenPage() {
  const [layer, setLayer] = useState<"events" | "meldingen">("events");
  const [eventId, setEventId] = useState<string | null>("kaasmarkt");
  const [meldingId, setMeldingId] = useState<string | null>(null);

  const eventPoints = useMemo(
    () => EVENTS.map((e) => ({ id: e.id, naam: e.naam, center: e.center, kleur: EVENT_KLEUR[e.categorie] })),
    [],
  );
  const meldingPoints = useMemo(
    () => MELDINGEN.map((m) => ({ id: m.id, naam: m.type, center: m.center, kleur: PRIO_KLEUR[m.prioriteit] })),
    [],
  );

  const event = EVENTS.find((e) => e.id === eventId) ?? null;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Kaart — evenementen & openbare ruimte"
          icon={<MapIcon className="h-4 w-4 text-water" />}
          action={
            <div className="flex gap-1 rounded-lg bg-secondary/60 p-0.5">
              <button onClick={() => setLayer("events")} className={cn("rounded-md px-2.5 py-1 text-xs font-medium", layer === "events" ? "bg-card text-foreground shadow" : "text-muted-foreground")}>Evenementen</button>
              <button onClick={() => setLayer("meldingen")} className={cn("rounded-md px-2.5 py-1 text-xs font-medium", layer === "meldingen" ? "bg-card text-foreground shadow" : "text-muted-foreground")}>Meldingen</button>
            </div>
          }
          bodyClassName="p-0"
        >
          <div className="relative">
            <WoerdenMap zoom={11.5} height={460}>
              {layer === "events" ? (
                <PointLayer id="events" points={eventPoints} radius={7} pulse onSelect={setEventId} selectedId={eventId} />
              ) : (
                <PointLayer id="meldingen" points={meldingPoints} radius={6} pulse onSelect={setMeldingId} selectedId={meldingId} />
              )}
            </WoerdenMap>
            <div className="absolute left-3 top-3 z-10">
              {layer === "events" ? (
                <Legend
                  title="Categorie"
                  items={[
                    { color: "#eab308", label: "Markt" },
                    { color: "#ff6b2b", label: "Festival" },
                    { color: "#10b981", label: "Sport" },
                    { color: "#3b82f6", label: "Feestdag" },
                    { color: "#a855f7", label: "Cultuur" },
                  ]}
                />
              ) : (
                <Legend
                  title="Prioriteit"
                  items={[
                    { color: "#10b981", label: "Laag" },
                    { color: "#eab308", label: "Midden" },
                    { color: "#f97316", label: "Hoog" },
                    { color: "#ef4444", label: "Spoed" },
                  ]}
                />
              )}
            </div>
          </div>
        </Panel>

        <Panel title={event ? "Evenement-impact" : "Selecteer evenement"} icon={<CalendarDays className="h-4 w-4 text-water" />}>
          {event ? (
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: EVENT_KLEUR[event.categorie] }} />
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{event.datum}</span>
                </div>
                <h3 className="mt-1 text-base font-semibold leading-tight">{event.naam}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{event.beschrijving}</p>
              </div>
              <div className="rounded-lg border border-border bg-card/50 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-2xl font-bold tabular">
                  <Users className="h-5 w-5 text-water" />
                  {event.bezoekers.toLocaleString("nl-NL")}
                </div>
                <div className="text-[11px] text-muted-foreground">verwachte bezoekers</div>
              </div>
              <div className="space-y-0.5">
                <MetricRow label={<><Car className="mr-1 inline h-3.5 w-3.5" />Verkeersimpact</>} value={<span style={{ color: IMPACT_KLEUR[event.verkeersimpact] }} className="font-medium capitalize">{event.verkeersimpact}</span>} />
                <MetricRow label={<><ParkingSquare className="mr-1 inline h-3.5 w-3.5" />Parkeerdruk</>} value={<span style={{ color: IMPACT_KLEUR[event.parkeerdruk] }} className="font-medium capitalize">{event.parkeerdruk}</span>} />
                <MetricRow label={<><Shield className="mr-1 inline h-3.5 w-3.5" />BOA / handhaving</>} value={`${event.boaInzet} fte`} />
                <MetricRow label={<><Trash2 className="mr-1 inline h-3.5 w-3.5" />Afvalbeheer</>} value={<span className="text-right text-xs">{event.afvalInzet}</span>} />
                <MetricRow label={<><Droplets className="mr-1 inline h-3.5 w-3.5" />Impact water</>} value={<span className="text-right text-xs">{event.waterimpact}</span>} />
              </div>
              <div>
                <div className="mb-1 text-[11px] font-medium text-muted-foreground">Afgesloten wegen</div>
                <div className="flex flex-wrap gap-1.5">
                  {event.afgeslotenWegen.map((w) => (
                    <span key={w} className="rounded bg-destructive/15 px-2 py-0.5 text-[11px] text-destructive">{w}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Klik op een evenement.</p>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Evenementenagenda Woerden" icon={<CalendarDays className="h-4 w-4 text-water" />}>
          <div className="space-y-1.5">
            {EVENTS.map((e) => (
              <button
                key={e.id}
                onClick={() => { setEventId(e.id); setLayer("events"); }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors",
                  eventId === e.id ? "border-water/40 bg-water/5" : "border-border bg-card/40 hover:border-water/30",
                )}
              >
                <span className="h-8 w-1 rounded-full" style={{ background: EVENT_KLEUR[e.categorie] }} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{e.naam}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{e.datum} · {e.locatie}</div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Users className="h-3 w-3" />{(e.bezoekers / 1000).toFixed(0)}k
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Meldingen openbare ruimte" icon={<ClipboardList className="h-4 w-4 text-water" />}>
          <div className="space-y-1.5">
            {MELDINGEN.map((m) => (
              <button
                key={m.id}
                onClick={() => { setMeldingId(m.id); setLayer("meldingen"); }}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-md border px-3 py-2 text-left transition-colors",
                  meldingId === m.id ? "border-water/40 bg-water/5" : "border-border bg-card/40 hover:border-water/30",
                )}
              >
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PRIO_KLEUR[m.prioriteit] }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{m.type}</span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{m.tijd}</span>
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">{m.locatie} · {m.toegewezen}</div>
                </div>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: `${STATUS_KLEUR[m.status]}22`, color: STATUS_KLEUR[m.status] }}>
                  {m.status}
                </span>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
