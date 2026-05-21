import type { Road, Intersection } from "@/lib/types";

export const ROADS: Road[] = [
  {
    id: "a12",
    naam: "A12 (Den Haag — Utrecht)",
    type: "snelweg",
    vrijeRijsnelheid: 120,
    voertuigenPerUur: 5400,
    vrachtAandeel: 18,
    coords: [
      [4.8, 52.0785],
      [4.84, 52.0762],
      [4.8883, 52.0735],
      [4.93, 52.0742],
      [4.985, 52.0768],
    ],
  },
  {
    id: "n198",
    naam: "N198 (Woerden — Kockengen)",
    type: "provinciaal",
    vrijeRijsnelheid: 80,
    voertuigenPerUur: 1450,
    vrachtAandeel: 9,
    coords: [
      [4.8883, 52.0883],
      [4.9, 52.097],
      [4.915, 52.106],
      [4.93, 52.116],
    ],
  },
  {
    id: "n11",
    naam: "N11 (Bodegraven — Alphen)",
    type: "provinciaal",
    vrijeRijsnelheid: 100,
    voertuigenPerUur: 2100,
    vrachtAandeel: 12,
    coords: [
      [4.84, 52.0762],
      [4.81, 52.07],
      [4.78, 52.062],
      [4.75, 52.055],
    ],
  },
  {
    id: "utrechtsestraatweg",
    naam: "Utrechtsestraatweg",
    type: "stedelijk",
    vrijeRijsnelheid: 50,
    voertuigenPerUur: 1200,
    vrachtAandeel: 6,
    coords: [
      [4.8883, 52.0883],
      [4.905, 52.0884],
      [4.925, 52.0884],
      [4.945, 52.0884],
    ],
  },
  {
    id: "rondweg-noord",
    naam: "Rondweg Noord / Parallelweg",
    type: "stedelijk",
    vrijeRijsnelheid: 50,
    voertuigenPerUur: 1650,
    vrachtAandeel: 8,
    coords: [
      [4.866, 52.092],
      [4.878, 52.0955],
      [4.892, 52.0958],
      [4.905, 52.0935],
    ],
  },
  {
    id: "boerendijk",
    naam: "Boerendijk / Molenvliet",
    type: "stedelijk",
    vrijeRijsnelheid: 50,
    voertuigenPerUur: 980,
    vrachtAandeel: 5,
    coords: [
      [4.872, 52.0905],
      [4.873, 52.083],
      [4.88, 52.078],
    ],
  },
];

export const ROAD_BY_ID: Record<string, Road> = Object.fromEntries(
  ROADS.map((r) => [r.id, r]),
);

export const INTERSECTIONS: Intersection[] = [
  { id: "a12-afrit", naam: "A12 afrit Woerden", center: [4.8883, 52.0735], road: "a12" },
  { id: "rondweg-parallel", naam: "Rondweg Noord / Parallelweg", center: [4.892, 52.0958], road: "rondweg-noord" },
  { id: "utrecht-steinhagen", naam: "Utrechtsestraatweg / Steinhagenseweg", center: [4.905, 52.0884], road: "utrechtsestraatweg" },
  { id: "station-omgeving", naam: "Station Woerden omgeving", center: [4.879, 52.0902], road: "rondweg-noord" },
  { id: "boerendijk-molenvliet", naam: "Boerendijk / Molenvliet", center: [4.873, 52.083], road: "boerendijk" },
];
