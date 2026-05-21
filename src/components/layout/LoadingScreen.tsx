"use client";

/** Boot splash with a Woerden skyline silhouette (stadhuistoren) + loading bar. */
export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink grid-glow">
      <svg viewBox="0 0 320 120" className="w-[320px] max-w-[70vw]">
        {/* water reflection line */}
        <line x1="0" y1="100" x2="320" y2="100" stroke="#0ea5e9" strokeWidth="1.5" opacity="0.5" />
        {/* skyline silhouette */}
        <g fill="#1e2a3a">
          <rect x="10" y="70" width="26" height="30" />
          <rect x="40" y="58" width="20" height="42" />
          {/* church / stadhuis tower */}
          <rect x="150" y="30" width="20" height="70" />
          <polygon points="150,30 160,8 170,30" fill="#0ea5e9" opacity="0.9" />
          <rect x="156" y="44" width="8" height="12" fill="#0a0f1e" />
          <rect x="64" y="64" width="30" height="36" />
          <rect x="98" y="50" width="16" height="50" />
          <rect x="118" y="72" width="26" height="28" />
          <rect x="178" y="62" width="22" height="38" />
          <rect x="204" y="54" width="18" height="46" />
          <rect x="226" y="74" width="30" height="26" />
          <rect x="260" y="60" width="20" height="40" />
          <rect x="284" y="70" width="26" height="30" />
        </g>
        {/* animated water */}
        <path
          d="M0 108 q20 -5 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="2"
          opacity="0.6"
          strokeDasharray="6 6"
          className="animate-flow"
        />
      </svg>
      <div className="mt-8 text-center">
        <div className="text-lg font-semibold tracking-tight text-foreground">
          Woerden<span className="text-water">360</span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">Digital Twin Platform — initialiseren…</div>
      </div>
      <div className="mt-5 h-1 w-56 max-w-[60vw] overflow-hidden rounded-full bg-secondary">
        <div className="h-full w-1/3 animate-ticker bg-gradient-to-r from-transparent via-water to-transparent" />
      </div>
    </div>
  );
}
