"use client";

import { clamp } from "@/lib/utils";

interface GaugeProps {
  value: number;
  min: number;
  max: number;
  label?: string;
  unit?: string;
  color?: string;
  digits?: number;
  size?: number;
}

/** Semicircular gauge (240° sweep) rendered as SVG. */
export function Gauge({
  value,
  min,
  max,
  label,
  unit,
  color = "#0ea5e9",
  digits = 0,
  size = 150,
}: GaugeProps) {
  const r = 56;
  const cx = 80;
  const cy = 80;
  const startAngle = 150;
  const endAngle = 390; // 240° sweep
  const t = clamp((value - min) / (max - min), 0, 1);
  const angle = startAngle + t * (endAngle - startAngle);

  const polar = (a: number) => {
    const rad = (a * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const arc = (a0: number, a1: number) => {
    const [x0, y0] = polar(a0);
    const [x1, y1] = polar(a1);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)}`;
  };
  const [nx, ny] = polar(angle);

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg viewBox="0 0 160 130" style={{ width: size }}>
        <path d={arc(startAngle, endAngle)} fill="none" stroke="#1e2a3a" strokeWidth="12" strokeLinecap="round" />
        <path d={arc(startAngle, angle)} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" />
        <circle cx={nx} cy={ny} r="6" fill="#0a0f1e" stroke={color} strokeWidth="3" />
        <text x={cx} y={cy + 2} textAnchor="middle" className="fill-foreground" style={{ fontSize: 26, fontWeight: 700 }}>
          {new Intl.NumberFormat("nl-NL", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value)}
        </text>
        {unit && (
          <text x={cx} y={cy + 20} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 11 }}>
            {unit}
          </text>
        )}
      </svg>
      {label && <div className="-mt-1 text-center text-xs text-muted-foreground">{label}</div>}
    </div>
  );
}
