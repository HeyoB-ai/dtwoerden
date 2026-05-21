import { cn } from "@/lib/utils";

/** Stylized placeholder coat of arms for Gemeente Woerden (burcht/tower motif). */
export function CoatOfArms({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 56"
      className={cn("h-9 w-auto", className)}
      role="img"
      aria-label="Wapen Gemeente Woerden (placeholder)"
    >
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b3a6b" />
          <stop offset="100%" stopColor="#0e213f" />
        </linearGradient>
      </defs>
      <path
        d="M4 4 H44 V30 C44 44 34 50 24 54 C14 50 4 44 4 30 Z"
        fill="url(#shieldGrad)"
        stroke="#ff6b2b"
        strokeWidth="2"
      />
      {/* Tower / burcht */}
      <g fill="#f0f4f8">
        <rect x="18" y="20" width="12" height="18" rx="1" />
        <rect x="15" y="24" width="4" height="14" />
        <rect x="29" y="24" width="4" height="14" />
        {/* battlements */}
        <rect x="18" y="17" width="2.5" height="3" />
        <rect x="22.7" y="17" width="2.5" height="3" />
        <rect x="27.5" y="17" width="2.5" height="3" />
        {/* gate */}
        <path d="M21.5 38 V31 a2.5 2.5 0 0 1 5 0 V38 Z" fill="#0e213f" />
      </g>
      {/* water waves */}
      <g stroke="#0ea5e9" strokeWidth="1.6" fill="none" opacity="0.9">
        <path d="M10 43 q3 -2 6 0 t6 0 t6 0 t6 0" />
      </g>
    </svg>
  );
}
