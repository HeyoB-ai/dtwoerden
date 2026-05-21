"use client";

import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { Sparkline } from "@/components/shared/Sparkline";
import { cn } from "@/lib/utils";

export interface KPICardProps {
  label: string;
  value: number;
  unit?: string;
  digits?: number;
  icon: LucideIcon;
  accent?: string;
  sub?: string;
  trend?: number;
  history?: number[];
  status?: "normaal" | "verhoogd" | "kritiek";
}

const STATUS_DOT: Record<string, string> = {
  normaal: "bg-traffic-green",
  verhoogd: "bg-alert-orange",
  kritiek: "bg-destructive",
};

export function KPICard({
  label,
  value,
  unit,
  digits = 0,
  icon: Icon,
  accent = "#0ea5e9",
  sub,
  trend,
  history,
  status,
}: KPICardProps) {
  const TrendIcon = trend === undefined ? Minus : trend > 0.2 ? TrendingUp : trend < -0.2 ? TrendingDown : Minus;
  return (
    <Card className="relative overflow-hidden p-4 transition-colors hover:border-water/40">
      <div
        className="absolute right-0 top-0 h-20 w-20 rounded-full opacity-10 blur-2xl"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-md"
            style={{ background: `${accent}1f`, color: accent }}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
        {status && <span className={cn("h-2 w-2 rounded-full", STATUS_DOT[status])} />}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <AnimatedNumber value={value} digits={digits} className="text-2xl font-bold tracking-tight tabular" />
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>

      <div className="mt-1 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{sub}</span>
        {trend !== undefined && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-[11px] font-medium",
              trend > 0.2 ? "text-alert-orange" : trend < -0.2 ? "text-traffic-green" : "text-muted-foreground",
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {Math.abs(trend).toFixed(1)}
          </span>
        )}
      </div>

      {history && history.length > 1 && (
        <div className="mt-2 -mx-1">
          <Sparkline data={history} color={accent} height={30} />
        </div>
      )}
    </Card>
  );
}
