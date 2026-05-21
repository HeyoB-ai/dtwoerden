"use client";

import { useState } from "react";
import { HardHat, Map as MapIcon, CalendarRange, Building2, Euro, User, CheckCircle2, XCircle, FileText } from "lucide-react";
import { Panel, MetricRow } from "@/components/shared/Panel";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { WoerdenMap } from "@/components/map/WoerdenMap";
import { ProjectLayer } from "@/components/map/ProjectLayer";
import { GanttTimeline } from "@/components/infrastructuur/GanttTimeline";
import { PROJECTS, PROJECT_CATEGORIE_LABEL, PROJECT_CATEGORIE_KLEUR } from "@/lib/data/projects";
import type { ProjectCategorie } from "@/lib/types";
import { cn, nlNumber } from "@/lib/utils";

const ALL_CATS = Object.keys(PROJECT_CATEGORIE_LABEL) as ProjectCategorie[];

const HINDER_BADGE: Record<string, "secondary" | "warning" | "danger" | "success"> = {
  geen: "success",
  laag: "secondary",
  midden: "warning",
  hoog: "danger",
};

export default function InfrastructuurPage() {
  const [visible, setVisible] = useState<Set<ProjectCategorie>>(new Set(ALL_CATS));
  const [selectedId, setSelectedId] = useState<string | null>("utrechtsestraatweg-fase2");

  const toggle = (c: ProjectCategorie) => {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const project = PROJECTS.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* category toggles */}
      <div className="flex flex-wrap gap-2">
        {ALL_CATS.map((c) => {
          const on = visible.has(c);
          const color = PROJECT_CATEGORIE_KLEUR[c];
          return (
            <button
              key={c}
              onClick={() => toggle(c)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                on ? "text-foreground" : "text-muted-foreground opacity-50",
              )}
              style={{ borderColor: on ? color : "#1e2a3a", background: on ? `${color}1a` : "transparent" }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
              {PROJECT_CATEGORIE_LABEL[c]}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Projecten op de kaart" icon={<MapIcon className="h-4 w-4 text-water" />} bodyClassName="p-0">
          <WoerdenMap zoom={11.5} className="h-[460px]">
            <ProjectLayer visible={visible} onSelect={setSelectedId} selectedId={selectedId} />
          </WoerdenMap>
        </Panel>

        <Panel title={project ? "Projectdetails" : "Selecteer een project"} icon={<HardHat className="h-4 w-4 text-water" />}>
          {project ? (
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: PROJECT_CATEGORIE_KLEUR[project.categorie] }} />
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {PROJECT_CATEGORIE_LABEL[project.categorie]}
                  </span>
                </div>
                <h3 className="mt-1 text-base font-semibold leading-tight">{project.naam}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{project.beschrijving}</p>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Voortgang</span>
                  <span className="tabular text-foreground">{project.voortgang}%</span>
                </div>
                <Progress value={project.voortgang} indicatorClassName="bg-water" />
                <p className="mt-1 text-[11px] text-muted-foreground">{project.status}</p>
              </div>

              <div className="space-y-0.5">
                <MetricRow label={<><Building2 className="mr-1 inline h-3.5 w-3.5" />Opdrachtgever</>} value={project.opdrachtgever} />
                <MetricRow label={<><User className="mr-1 inline h-3.5 w-3.5" />Aannemer</>} value={project.aannemer} />
                <MetricRow label={<><Euro className="mr-1 inline h-3.5 w-3.5" />Budget</>} value={`€ ${nlNumber(project.budget)}`} />
                <MetricRow label={<><CalendarRange className="mr-1 inline h-3.5 w-3.5" />Planning</>} value={`${fmt(project.start)} – ${fmt(project.eind)}`} />
                <MetricRow
                  label="Verkeershinder"
                  value={<Badge variant={HINDER_BADGE[project.verkeershinder]}>{project.verkeershinder}</Badge>}
                />
                <MetricRow
                  label="Omwonenden geïnformeerd"
                  value={
                    project.omwonendenGeinformeerd ? (
                      <span className="flex items-center gap-1 text-traffic-green"><CheckCircle2 className="h-3.5 w-3.5" />Ja</span>
                    ) : (
                      <span className="flex items-center gap-1 text-alert-orange"><XCircle className="h-3.5 w-3.5" />Nee</span>
                    )
                  }
                />
              </div>

              <button className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card/60 py-2 text-xs text-muted-foreground hover:text-foreground">
                <FileText className="h-3.5 w-3.5" /> Documenten (placeholder)
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Klik op een project in de kaart of tijdlijn.</p>
          )}
        </Panel>
      </div>

      <Panel title="Tijdlijn projecten 2025–2030" icon={<CalendarRange className="h-4 w-4 text-water" />}>
        <GanttTimeline onSelect={setSelectedId} selectedId={selectedId} />
      </Panel>
    </div>
  );
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("nl-NL", { month: "short", year: "numeric" });
}
