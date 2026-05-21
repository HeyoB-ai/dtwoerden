"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  Legend,
} from "recharts";

const AXIS = { stroke: "#3a4a60", fontSize: 11, tickLine: false };
const GRID = "#1a2434";

interface TooltipPayloadItem {
  color?: string;
  name?: string | number;
  value?: string | number;
  unit?: string;
}

function DarkTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <div className="mb-1 font-semibold text-foreground">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span>{p.name}:</span>
          <span className="font-medium text-foreground">
            {typeof p.value === "number" ? p.value.toLocaleString("nl-NL") : p.value}
            {unit ? ` ${unit}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

export interface Series {
  key: string;
  label: string;
  color: string;
  type?: "line" | "area";
  yAxis?: "left" | "right";
  dashed?: boolean;
}

export interface RefLine {
  y?: number;
  x?: string | number;
  axis?: "left" | "right";
  color: string;
  label?: string;
}

export interface RefBand {
  y1: number;
  y2: number;
  axis?: "left" | "right";
  color: string;
}

export function TimeSeriesChart({
  data,
  series,
  xKey,
  height = 220,
  unit,
  refLines = [],
  refBands = [],
  showLegend = false,
}: {
  data: Record<string, unknown>[];
  series: Series[];
  xKey: string;
  height?: number;
  unit?: string;
  refLines?: RefLine[];
  refBands?: RefBand[];
  showLegend?: boolean;
}) {
  const hasRight = series.some((s) => s.yAxis === "right");
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: hasRight ? 8 : 12, left: -16, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} {...AXIS} interval="preserveStartEnd" minTickGap={24} />
        <YAxis yAxisId="left" {...AXIS} width={44} />
        {hasRight && <YAxis yAxisId="right" orientation="right" {...AXIS} width={44} />}
        <Tooltip content={<DarkTooltip unit={unit} />} />
        {showLegend && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {refBands.map((b, i) => (
          <ReferenceArea
            key={`band-${i}`}
            yAxisId={b.axis ?? "left"}
            y1={b.y1}
            y2={b.y2}
            fill={b.color}
            fillOpacity={0.08}
            stroke="none"
          />
        ))}
        {refLines.map((r, i) => (
          <ReferenceLine
            key={`ref-${i}`}
            yAxisId={r.axis ?? "left"}
            y={r.y}
            x={r.x}
            stroke={r.color}
            strokeDasharray="4 4"
            label={{ value: r.label, fill: r.color, fontSize: 10, position: "insideTopRight" }}
          />
        ))}
        {series.map((s) =>
          s.type === "area" ? (
            <Area
              key={s.key}
              yAxisId={s.yAxis ?? "left"}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#g-${s.key})`}
              dot={false}
              isAnimationActive={false}
            />
          ) : (
            <Line
              key={s.key}
              yAxisId={s.yAxis ?? "left"}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? "5 4" : undefined}
              dot={false}
              isAnimationActive={false}
            />
          ),
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function BarsChart({
  data,
  bars,
  xKey,
  height = 220,
  unit,
  stacked = false,
}: {
  data: Record<string, unknown>[];
  bars: Series[];
  xKey: string;
  height?: number;
  unit?: string;
  stacked?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} {...AXIS} interval="preserveStartEnd" minTickGap={16} />
        <YAxis {...AXIS} width={44} />
        <Tooltip content={<DarkTooltip unit={unit} />} cursor={{ fill: "#ffffff08" }} />
        {bars.map((b) => (
          <Bar
            key={b.key}
            dataKey={b.key}
            name={b.label}
            fill={b.color}
            radius={[3, 3, 0, 0]}
            stackId={stacked ? "a" : undefined}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
