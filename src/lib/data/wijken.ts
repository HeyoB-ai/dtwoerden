import type { Wijk, WijkId } from "@/lib/types";

export const WOERDEN_CENTER: [number, number] = [4.8883, 52.0883];

export const WIJKEN: Wijk[] = [
  {
    id: "centrum",
    naam: "Woerden-Centrum",
    center: [4.8883, 52.0883],
    inwoners: 9800,
    oppervlakte: 1.9,
    type: "stedelijk",
  },
  {
    id: "noord",
    naam: "Woerden-Noord",
    center: [4.882, 52.095],
    inwoners: 14200,
    oppervlakte: 3.4,
    type: "stedelijk",
  },
  {
    id: "zuid",
    naam: "Woerden-Zuid",
    center: [4.89, 52.081],
    inwoners: 12600,
    oppervlakte: 3.1,
    type: "stedelijk",
  },
  {
    id: "snelrewaard",
    naam: "Snelrewaard",
    center: [4.87, 52.075],
    inwoners: 540,
    oppervlakte: 6.8,
    type: "polder",
  },
  {
    id: "harmelen",
    naam: "Harmelen",
    center: [4.95, 52.0883],
    inwoners: 8900,
    oppervlakte: 9.2,
    type: "dorp",
  },
  {
    id: "zegveld",
    naam: "Zegveld",
    center: [4.84, 52.11],
    inwoners: 2300,
    oppervlakte: 11.4,
    type: "polder",
  },
  {
    id: "kamerik",
    naam: "Kamerik",
    center: [4.92, 52.105],
    inwoners: 3700,
    oppervlakte: 13.1,
    type: "polder",
  },
  {
    id: "waarder",
    naam: "Waarder",
    center: [4.91, 52.065],
    inwoners: 1900,
    oppervlakte: 8.6,
    type: "polder",
  },
];

export const WIJK_BY_ID: Record<WijkId, Wijk> = Object.fromEntries(
  WIJKEN.map((w) => [w.id, w]),
) as Record<WijkId, Wijk>;

export const WIJK_IDS: WijkId[] = WIJKEN.map((w) => w.id);

export const TOTAAL_INWONERS = WIJKEN.reduce((s, w) => s + w.inwoners, 0);
