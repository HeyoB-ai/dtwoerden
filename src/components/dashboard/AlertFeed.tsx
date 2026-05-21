"use client";

import { useLiveData } from "@/lib/hooks/useLiveSensors";
import type { Alert } from "@/lib/types";
import { AlertTriangle, Info, Siren } from "lucide-react";
import { cn } from "@/lib/utils";

function meta(n: Alert["niveau"]) {
  switch (n) {
    case "kritiek":
      return { Icon: Siren, cls: "text-destructive", bg: "bg-destructive/10 border-destructive/30" };
    case "waarschuwing":
      return { Icon: AlertTriangle, cls: "text-alert-orange", bg: "bg-alert-orange/10 border-alert-orange/30" };
    default:
      return { Icon: Info, cls: "text-water", bg: "bg-water/5 border-water/20" };
  }
}

function fmt(t: number) {
  return new Intl.DateTimeFormat("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Amsterdam",
  }).format(new Date(t));
}

export function AlertFeed({ max = 6 }: { max?: number }) {
  const { alerts } = useLiveData();
  const sorted = [...alerts].sort((a, b) => {
    const order = { kritiek: 0, waarschuwing: 1, info: 2 };
    return order[a.niveau] - order[b.niveau];
  });

  return (
    <div className="space-y-2">
      {sorted.slice(0, max).map((a) => {
        const { Icon, cls, bg } = meta(a.niveau);
        return (
          <div key={a.id} className={cn("flex items-start gap-2.5 rounded-lg border p-2.5", bg)}>
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", cls)} />
            <div className="min-w-0 flex-1">
              <p className="text-xs leading-snug text-foreground">{a.bericht}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                {a.domein} · {fmt(a.tijd)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
