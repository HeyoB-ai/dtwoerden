"use client";

import type { Gemaal, GemaalStatus } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Cog, Zap, Clock, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_META: Record<GemaalStatus, { label: string; color: string; dot: string }> = {
  standby: { label: "Standby", color: "text-traffic-green", dot: "bg-traffic-green" },
  actief: { label: "Actief", color: "text-water", dot: "bg-water" },
  storing: { label: "Storing", color: "text-destructive", dot: "bg-destructive" },
};

export function GemaalCard({
  gemaal,
  belasting,
  status,
}: {
  gemaal: Gemaal;
  belasting: number;
  status: GemaalStatus;
}) {
  const debiet = Math.round((gemaal.maxCapaciteit * belasting) / 100);
  const energie = Math.round(belasting * (gemaal.maxCapaciteit / 100) * 0.9 + (status === "actief" ? 8 : 2));
  const draaiuren = (gemaal.draaiurenVandaag + (belasting > 50 ? 3.5 : belasting > 10 ? 1.2 : 0)).toFixed(1);
  const meta = STATUS_META[status];

  return (
    <div className="rounded-lg border border-border bg-card/50 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cog className={cn("h-4 w-4", status === "actief" && "animate-spin-slow", meta.color)} />
          <span className="text-sm font-semibold">{gemaal.naam}</span>
        </div>
        <span className={cn("flex items-center gap-1.5 text-[11px] font-medium", meta.color)}>
          <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
          {meta.label}
        </span>
      </div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{gemaal.polder}</div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Belasting</span>
          <span className="tabular text-foreground">{belasting}%</span>
        </div>
        <Progress
          value={belasting}
          indicatorClassName={belasting >= 90 ? "bg-destructive" : belasting >= 60 ? "bg-alert-orange" : "bg-water"}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-sm font-bold tabular">{debiet}</div>
          <div className="text-[10px] text-muted-foreground">m³/min</div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-sm font-bold tabular">
            <Zap className="h-3 w-3 text-dutch-orange" />
            {energie}
          </div>
          <div className="text-[10px] text-muted-foreground">kW</div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-sm font-bold tabular">
            <Clock className="h-3 w-3 text-muted-foreground" />
            {draaiuren}
          </div>
          <div className="text-[10px] text-muted-foreground">draaiuren</div>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1 border-t border-border/60 pt-2 text-[10px] text-muted-foreground">
        <Wrench className="h-3 w-3" />
        Onderhoud: {new Date(gemaal.onderhoudsdatum).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
      </div>
    </div>
  );
}
