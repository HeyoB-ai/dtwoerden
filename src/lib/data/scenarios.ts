import type { Scenario } from "@/lib/types";

export const VERKEER_SCENARIOS: Scenario[] = [
  {
    id: "ochtendspits",
    label: "Ochtendspits simuleren",
    beschrijving: "Verhoogde verkeersdruk 7:00–9:00 op alle hoofdroutes.",
    domein: "verkeer",
  },
  {
    id: "evenement-centrum",
    label: "Evenement centrum actief",
    beschrijving: "Afsluitingen binnenstad, omleidingen, hoge parkeerdruk.",
    domein: "verkeer",
  },
  {
    id: "a12-afsluiting",
    label: "A12 afsluiting (incident)",
    beschrijving: "Incident A12 — sluipverkeer drukt op N198 en stedelijk net.",
    domein: "verkeer",
  },
  {
    id: "brug-open",
    label: "Brug Hollandse IJssel open",
    beschrijving: "Brugopening — tijdelijke wachtrijen rondom centrum.",
    domein: "verkeer",
  },
  {
    id: "wegwerk-n198",
    label: "Wegwerkzaamheden N198",
    beschrijving: "Versmalling N198 — capaciteit −40%.",
    domein: "verkeer",
  },
];

export const WATER_SCENARIOS: Scenario[] = [
  {
    id: "extreme-neerslag",
    label: "Extreme neerslag (40mm/uur)",
    beschrijving: "Hevige bui — snelle peilstijging, gemalen schakelen op.",
    domein: "water",
  },
  {
    id: "droogte",
    label: "Aanhoudende droogte (+14 dagen)",
    beschrijving: "Langdurig neerslagtekort — dalende peilen, inlaatbehoefte.",
    domein: "water",
  },
  {
    id: "hoogwater",
    label: "Hoogwater Hollandse IJssel",
    beschrijving: "Verhoogde aanvoer — boezempeil stijgt richting kritiek.",
    domein: "water",
  },
  {
    id: "gemaalstoring",
    label: "Gemaalstoring scenario",
    beschrijving: "Uitval Gemaal Noord — herverdeling over overige gemalen.",
    domein: "water",
  },
  {
    id: "hittegolf",
    label: "Hittegolf effect op waterpeil",
    beschrijving: "Verdamping + lage aanvoer — peilbeheersing onder druk.",
    domein: "water",
  },
];
