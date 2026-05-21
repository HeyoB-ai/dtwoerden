"use client";

import { useLiveData } from "@/lib/hooks/useLiveSensors";
import type { Alert } from "@/lib/types";
import { AlertTriangle, Info, Siren } from "lucide-react";
import { cn } from "@/lib/utils";

function niveauStyle(n: Alert["niveau"]) {
  switch (n) {
    case "kritiek":
      return { Icon: Siren, cls: "text-destructive" };
    case "waarschuwing":
      return { Icon: AlertTriangle, cls: "text-alert-orange" };
    default:
      return { Icon: Info, cls: "text-water" };
  }
}

export function AlertTicker() {
  const { alerts } = useLiveData();
  if (!alerts.length) return null;

  // duplicate the list so the marquee loops seamlessly
  const items = [...alerts, ...alerts];

  return (
    <div className="flex items-center gap-3 border-t border-border bg-card/60 px-3 py-2">
      <div className="flex shrink-0 items-center gap-1.5 rounded bg-destructive/15 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-destructive">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
        </span>
        Live meldingen
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="flex w-max animate-ticker items-center gap-8 whitespace-nowrap will-change-transform">
          {items.map((a, i) => {
            const { Icon, cls } = niveauStyle(a.niveau);
            return (
              <span key={`${a.id}-${i}`} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className={cn("h-3.5 w-3.5 shrink-0", cls)} />
                <span className={cn(a.niveau === "kritiek" && "font-semibold text-foreground")}>
                  {a.bericht}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
