"use client";

import type { Scenario, ScenarioId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Zap, RotateCcw } from "lucide-react";

export function ScenarioBar({
  scenarios,
  active,
  onChange,
  title = "Scenario simulatie",
}: {
  scenarios: Scenario[];
  active: ScenarioId;
  onChange: (id: ScenarioId) => void;
  title?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Zap className="h-3.5 w-3.5 text-dutch-orange" />
          {title}
        </span>
        {active !== "geen" && (
          <button
            onClick={() => onChange("geen")}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {scenarios.map((s) => {
          const on = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onChange(on ? "geen" : s.id)}
              title={s.beschrijving}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                on
                  ? "border-dutch-orange bg-dutch-orange/15 text-dutch-orange"
                  : "border-border bg-card text-muted-foreground hover:border-water/40 hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      {active !== "geen" && (
        <p className="mt-2 text-[11px] text-dutch-orange/80">
          {scenarios.find((s) => s.id === active)?.beschrijving}
        </p>
      )}
    </div>
  );
}
