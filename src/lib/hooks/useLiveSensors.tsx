"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import type { Alert, ScenarioId, SensorReading } from "@/lib/types";
import { generateReading } from "@/lib/simulation/sensorSimulator";
import { deriveAlerts } from "./useAlerts";

const HISTORY_LEN = 80;
const TICK_MS = 3000;

interface LiveDataValue {
  reading: SensorReading | null;
  history: SensorReading[];
  alerts: Alert[];
  verkeerScenario: ScenarioId;
  waterScenario: ScenarioId;
  setVerkeerScenario: (s: ScenarioId) => void;
  setWaterScenario: (s: ScenarioId) => void;
  activeScenario: ScenarioId;
}

const LiveDataContext = createContext<LiveDataValue | null>(null);

export function LiveDataProvider({ children }: { children: ReactNode }) {
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [verkeerScenario, setVerkeerScenario] = useState<ScenarioId>("geen");
  const [waterScenario, setWaterScenario] = useState<ScenarioId>("geen");

  const activeScenario: ScenarioId =
    waterScenario !== "geen" ? waterScenario : verkeerScenario;

  const prevRef = useRef<SensorReading | null>(null);
  const scenarioRef = useRef<ScenarioId>(activeScenario);
  scenarioRef.current = activeScenario;

  useEffect(() => {
    let mounted = true;
    const tick = () => {
      const next = generateReading(prevRef.current, new Date(), scenarioRef.current);
      prevRef.current = next;
      if (!mounted) return;
      setReading(next);
      setHistory((h) => {
        const arr = [...h, next];
        return arr.length > HISTORY_LEN ? arr.slice(arr.length - HISTORY_LEN) : arr;
      });
    };
    tick(); // immediate first reading
    const id = setInterval(tick, TICK_MS);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const alerts = useMemo(
    () => (reading ? deriveAlerts(reading, activeScenario) : []),
    [reading, activeScenario],
  );

  const value: LiveDataValue = {
    reading,
    history,
    alerts,
    verkeerScenario,
    waterScenario,
    setVerkeerScenario: useCallback((s: ScenarioId) => setVerkeerScenario(s), []),
    setWaterScenario: useCallback((s: ScenarioId) => setWaterScenario(s), []),
    activeScenario,
  };

  return <LiveDataContext.Provider value={value}>{children}</LiveDataContext.Provider>;
}

export function useLiveData(): LiveDataValue {
  const ctx = useContext(LiveDataContext);
  if (!ctx) throw new Error("useLiveData must be used within LiveDataProvider");
  return ctx;
}

/** Convenience: just the current reading (may be null until first tick). */
export function useLiveSensors(): SensorReading | null {
  return useLiveData().reading;
}
