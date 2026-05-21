"use client";

/** Compass showing wind direction (degrees, meteorological "from") + force. */
export function WindCompass({ richting, kracht }: { richting: number; kracht: number }) {
  // arrow points in the direction the wind blows TO
  const to = (richting + 180) % 360;
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 80 80" className="h-20 w-20">
        <circle cx="40" cy="40" r="36" fill="#0a0f1e" stroke="#1e2a3a" strokeWidth="2" />
        {["N", "O", "Z", "W"].map((d, i) => {
          const a = (i * 90 - 90) * (Math.PI / 180);
          return (
            <text
              key={d}
              x={40 + Math.cos(a) * 28}
              y={40 + Math.sin(a) * 28 + 3}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 9 }}
            >
              {d}
            </text>
          );
        })}
        <g transform={`rotate(${to} 40 40)`} className="transition-transform duration-700">
          <polygon points="40,14 34,44 40,38 46,44" fill="#0ea5e9" />
          <polygon points="40,66 34,44 40,50 46,44" fill="#3a4a60" />
        </g>
        <circle cx="40" cy="40" r="3" fill="#f0f4f8" />
      </svg>
      <div className="leading-tight">
        <div className="text-lg font-bold tabular">{kracht} Bft</div>
        <div className="text-xs text-muted-foreground">{Math.round(richting)}° ZW-dominant</div>
      </div>
    </div>
  );
}
