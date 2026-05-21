"use client";

import { useState } from "react";
import { Sparkles, FileText, Loader2, RefreshCw } from "lucide-react";
import { useLiveData } from "@/lib/hooks/useLiveSensors";
import { Panel } from "@/components/shared/Panel";
import { InsightCard } from "@/components/ai/InsightCard";
import { StadsRapport } from "@/components/ai/StadsRapport";
import { INSIGHTS } from "@/lib/data/insights";

type RapportState = "idle" | "generating" | "done";

export default function AiAdviesPage() {
  const { reading } = useLiveData();
  const [state, setState] = useState<RapportState>("idle");

  const generate = () => {
    setState("generating");
    setTimeout(() => setState("done"), 1900);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-3 rounded-lg border border-water/20 bg-gradient-to-r from-water/10 to-transparent p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-water/15 text-water">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-bold">Woerden Insights</h2>
            <p className="text-xs text-muted-foreground">
              AI-gestuurde gemeentelijke intelligentie — analyses en aanbevelingen op basis van de digital twin.
            </p>
          </div>
        </div>
        <button
          onClick={generate}
          disabled={state === "generating"}
          className="flex items-center justify-center gap-2 rounded-lg bg-water px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-water/90 disabled:opacity-70"
        >
          {state === "generating" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Rapport genereren…</>
          ) : state === "done" ? (
            <><RefreshCw className="h-4 w-4" /> Opnieuw genereren</>
          ) : (
            <><FileText className="h-4 w-4" /> Genereer Stadsrapport</>
          )}
        </button>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Actuele inzichten</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {INSIGHTS.map((ins) => (
            <InsightCard key={ins.id} insight={ins} />
          ))}
        </div>
      </div>

      {state !== "idle" && (
        <Panel title="Stadsrapport" icon={<FileText className="h-4 w-4 text-water" />}>
          {state === "generating" || !reading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-water" />
              <p className="text-sm">Digital-twin data analyseren over alle domeinen…</p>
              <div className="h-1 w-64 max-w-[70vw] overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-1/3 animate-ticker bg-gradient-to-r from-transparent via-water to-transparent" />
              </div>
            </div>
          ) : (
            <StadsRapport reading={reading} />
          )}
        </Panel>
      )}
    </div>
  );
}
