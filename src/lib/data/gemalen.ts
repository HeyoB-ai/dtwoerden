import type { Gemaal, Polder } from "@/lib/types";

// Pumping stations — beheer: Hoogheemraadschap De Stichtse Rijnlanden (HDSR)
export const GEMALEN: Gemaal[] = [
  {
    id: "gemaal-noord",
    naam: "Gemaal Woerden-Noord",
    polder: "Polder Bulwijk",
    center: [4.881, 52.098],
    maxCapaciteit: 240,
    status: "standby",
    debiet: 0,
    energieverbruik: 12,
    draaiurenVandaag: 2.4,
    onderhoudsdatum: "2026-08-14",
  },
  {
    id: "gemaal-zuid",
    naam: "Gemaal Woerden-Zuid",
    polder: "Polder Rietveld",
    center: [4.892, 52.076],
    maxCapaciteit: 180,
    status: "actief",
    debiet: 96,
    energieverbruik: 64,
    draaiurenVandaag: 6.1,
    onderhoudsdatum: "2026-06-30",
  },
  {
    id: "gemaal-harmelen",
    naam: "Gemaal Harmelen",
    polder: "Harmelerwaard",
    center: [4.952, 52.085],
    maxCapaciteit: 150,
    status: "standby",
    debiet: 0,
    energieverbruik: 8,
    draaiurenVandaag: 1.2,
    onderhoudsdatum: "2026-09-22",
  },
  {
    id: "gemaal-zegveld",
    naam: "Gemaal Zegveld",
    polder: "Polder Zegveld",
    center: [4.841, 52.112],
    maxCapaciteit: 130,
    status: "actief",
    debiet: 58,
    energieverbruik: 41,
    draaiurenVandaag: 4.7,
    onderhoudsdatum: "2026-07-08",
  },
  {
    id: "gemaal-kamerik",
    naam: "Gemaal Kamerik-Mijzijde",
    polder: "Polder Kamerik",
    center: [4.918, 52.107],
    maxCapaciteit: 120,
    status: "standby",
    debiet: 0,
    energieverbruik: 6,
    draaiurenVandaag: 0.8,
    onderhoudsdatum: "2026-10-03",
  },
];

export const POLDERS: Polder[] = [
  { id: "bulwijk", naam: "Polder Bulwijk", streefpeil: -185, huidigPeil: -182, drempelVerhoogd: -160, drempelKritiek: -130 },
  { id: "rietveld", naam: "Polder Rietveld", streefpeil: -210, huidigPeil: -204, drempelVerhoogd: -185, drempelKritiek: -150 },
  { id: "harmelerwaard", naam: "Harmelerwaard", streefpeil: -175, huidigPeil: -172, drempelVerhoogd: -150, drempelKritiek: -120 },
  { id: "zegveld", naam: "Polder Zegveld", streefpeil: -245, huidigPeil: -238, drempelVerhoogd: -215, drempelKritiek: -180 },
  { id: "kamerik", naam: "Polder Kamerik", streefpeil: -230, huidigPeil: -226, drempelVerhoogd: -205, drempelKritiek: -170 },
];

export const SLUIZEN = [
  { id: "verlaat", naam: "Woerdense Verlaat", center: [4.86, 52.123] as [number, number], status: "operationeel" },
  { id: "stadssluis", naam: "Stadssluis Woerden", center: [4.886, 52.087] as [number, number], status: "operationeel" },
];
