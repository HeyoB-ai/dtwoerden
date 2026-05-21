"use client";

import type { Insight } from "@/lib/types";
import { Car, Wind, Droplets, CalendarDays, Zap, Lightbulb, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

const DOMEIN_ICON = {
  verkeer: Car,
  lucht: Wind,
  water: Droplets,
  evenementen: CalendarDays,
  energie: Zap,
  meldingen: Lightbulb,
} as const;

const ERNST = {
  laag: { label: "Laag", color: "#10b981" },
  midden: { label: "Midden", color: "#f97316" },
  hoog: { label: "Hoog", color: "#ef4444" },
};

export function InsightCard({ insight }: { insight: Insight }) {
  const Icon = DOMEIN_ICON[insight.domein] ?? Lightbulb;
  const ernst = ERNST[insight.ernst];
  return (
    <Card className="flex flex-col p-4 transition-colors hover:border-water/40">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-water/10 text-water">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold leading-tight">{insight.titel}</h3>
            <span className="text-[11px] capitalize text-muted-foreground">{insight.domein}</span>
          </div>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: `${ernst.color}22`, color: ernst.color }}
        >
          {ernst.label}
        </span>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{insight.analyse}</p>

      <div className="mt-3 rounded-lg border border-water/20 bg-water/5 p-2.5">
        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-water">
          <Lightbulb className="h-3.5 w-3.5" /> Aanbeveling
        </div>
        <p className="text-xs leading-relaxed text-foreground">{insight.aanbeveling}</p>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px]">
        <span className="text-muted-foreground">
          Budget: <span className="font-medium text-foreground">{insight.budgetIndicatie}</span>
        </span>
        <span className="flex items-center gap-1 text-traffic-green">
          <TrendingUp className="h-3.5 w-3.5" />
          {insight.vertrouwen}% vertrouwen
        </span>
      </div>
    </Card>
  );
}
