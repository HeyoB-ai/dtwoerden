"use client";

import { useEffect, useRef, useState } from "react";

/** Smoothly tweens to a target number when it changes. */
export function AnimatedNumber({
  value,
  digits = 0,
  className,
}: {
  value: number;
  digits?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    const dur = 600;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
      else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return (
    <span className={className}>
      {new Intl.NumberFormat("nl-NL", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(display)}
    </span>
  );
}
