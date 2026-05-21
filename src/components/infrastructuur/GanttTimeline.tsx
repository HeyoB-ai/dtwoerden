"use client";

import { PROJECTS, PROJECT_CATEGORIE_KLEUR } from "@/lib/data/projects";
import { cn } from "@/lib/utils";

const START = new Date("2025-01-01").getTime();
const END = new Date("2031-01-01").getTime();
const SPAN = END - START;
const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];
const NOW = new Date("2026-05-21").getTime();

function pct(t: number) {
  return ((t - START) / SPAN) * 100;
}

export function GanttTimeline({
  onSelect,
  selectedId,
}: {
  onSelect?: (id: string) => void;
  selectedId?: string | null;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        {/* year header */}
        <div className="relative ml-[180px] h-6 border-b border-border">
          {YEARS.map((y) => (
            <div
              key={y}
              className="absolute top-0 text-[11px] text-muted-foreground"
              style={{ left: `${pct(new Date(`${y}-01-01`).getTime())}%` }}
            >
              <span className="border-l border-border pl-1">{y}</span>
            </div>
          ))}
          {/* today marker */}
          <div className="absolute top-0 z-10 h-[400px]" style={{ left: `${pct(NOW)}%` }}>
            <div className="h-full w-px bg-dutch-orange/60" />
            <span className="absolute -top-0 left-1 text-[10px] text-dutch-orange">nu</span>
          </div>
        </div>

        {/* rows */}
        <div className="mt-1 space-y-1.5">
          {PROJECTS.map((p) => {
            const left = pct(new Date(p.start).getTime());
            const width = pct(new Date(p.eind).getTime()) - left;
            const color = PROJECT_CATEGORIE_KLEUR[p.categorie];
            const active = selectedId === p.id;
            return (
              <div key={p.id} className="flex items-center gap-2">
                <button
                  onClick={() => onSelect?.(p.id)}
                  className={cn(
                    "w-[172px] shrink-0 truncate text-left text-[11px]",
                    active ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                  title={p.naam}
                >
                  {p.naam}
                </button>
                <div className="relative h-5 flex-1 rounded bg-card/40">
                  <button
                    onClick={() => onSelect?.(p.id)}
                    className={cn(
                      "absolute top-0 h-5 rounded transition-all hover:brightness-125",
                      active && "ring-2 ring-white/40",
                    )}
                    style={{ left: `${left}%`, width: `${Math.max(width, 1.5)}%`, background: `${color}55`, border: `1px solid ${color}` }}
                  >
                    <span
                      className="absolute inset-y-0 left-0 rounded-l"
                      style={{ width: `${p.voortgang}%`, background: color }}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
