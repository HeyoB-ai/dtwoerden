import type { WijkId } from "@/lib/types";

export type ScenarioDomein =
  | "verkeer"
  | "water"
  | "lucht"
  | "energie"
  | "openbare-ruimte"
  | "hulpdiensten";

export type ImpactNiveau = "geen" | "laag" | "verhoogd" | "kritiek" | "extreem";

export type TijdlijnTijd = "T+0" | "T+1u" | "T+4u" | "T+12u" | "T+24u" | "T+72u";

export interface DomeinImpact {
  domein: ScenarioDomein;
  impactNiveau: ImpactNiveau;
  impactPct: number; // 0-100
  beschrijving: string;
}

export interface ScenarioActie {
  prioriteit: "hoog" | "midden" | "laag";
  actie: string;
}

export interface TijdlijnPunt {
  tijd: TijdlijnTijd;
  stress: number; // 0-100
}

export interface ScenarioKaart {
  getroffenWijken: WijkId[];
  overstroomdeWijken: WijkId[];
  geblokkeerdeWegen: string[]; // road ids
}

export interface ScenarioAnalyse {
  scenarioNaam: string;
  stadsStress: number; // 0-100
  domeinen: DomeinImpact[];
  directeGevolgen: string[];
  kettingreacties: string[];
  knelpunten: string[];
  acties: ScenarioActie[];
  herstelprognose: string;
  tijdlijn: TijdlijnPunt[];
  kaart: ScenarioKaart;
  bron: "claude" | "lokaal";
  /** Optional notice surfaced when the Claude API was unavailable and the local engine was used. */
  apiNotice?: string;
}

export interface ScenarioParams {
  omvang: number; // 0-100 (klein → catastrofaal)
  duur: string; // "1 uur" | "4 uur" | "12 uur" | "1 dag" | "3 dagen" | "7 dagen"
  tijdstip: string; // "nacht" | "ochtend" | "spits" | "weekend"
}

export interface ScenarioRequest {
  scenario: string;
  params: ScenarioParams;
}

export const DOMEIN_LABEL: Record<ScenarioDomein, string> = {
  verkeer: "Verkeer",
  water: "Waterbeheer",
  lucht: "Luchtkwaliteit",
  energie: "Energie",
  "openbare-ruimte": "Openbare ruimte",
  hulpdiensten: "Hulpdiensten",
};

export const IMPACT_KLEUR: Record<ImpactNiveau, string> = {
  geen: "#6b7280",
  laag: "#10b981",
  verhoogd: "#eab308",
  kritiek: "#f97316",
  extreem: "#ef4444",
};

export const IMPACT_LABEL: Record<ImpactNiveau, string> = {
  geen: "Geen",
  laag: "Laag",
  verhoogd: "Verhoogd",
  kritiek: "Kritiek",
  extreem: "Extreem",
};

export const VALID_WIJK_IDS: WijkId[] = [
  "centrum",
  "noord",
  "zuid",
  "snelrewaard",
  "harmelen",
  "zegveld",
  "kamerik",
  "waarder",
];

export const VALID_ROAD_IDS = [
  "a12",
  "n198",
  "n11",
  "utrechtsestraatweg",
  "rondweg-noord",
  "boerendijk",
];

export const PRESETS: {
  id: string;
  emoji: string;
  titel: string;
  omschrijving: string;
  prompt: string;
  omvang: number;
  duur: string;
  tijdstip: string;
}[] = [
  {
    id: "evenement",
    emoji: "🎪",
    titel: "Groot evenement",
    omschrijving: "50.000 bezoekers · Centrum Woerden",
    prompt:
      "Een groot meerdaags evenement in het centrum van Woerden trekt 50.000 bezoekers. Massale toestroom van auto's en openbaar vervoer, volledige afsluiting van de binnenstad.",
    omvang: 70,
    duur: "1 dag",
    tijdstip: "weekend",
  },
  {
    id: "overstroming",
    emoji: "🌊",
    titel: "Overstroming",
    omschrijving: "Hollandse IJssel +180cm NAP",
    prompt:
      "De Hollandse IJssel stijgt naar +180 cm NAP door extreme aanvoer en falende kering. Polders rond Woerden dreigen onder te lopen, gemalen draaien op maximale capaciteit.",
    omvang: 90,
    duur: "3 dagen",
    tijdstip: "nacht",
  },
  {
    id: "droogte",
    emoji: "☀️",
    titel: "Extreme droogte",
    omschrijving: "14 dagen geen neerslag · hittegolf",
    prompt:
      "Een aanhoudende hittegolf met 14 dagen zonder neerslag. Temperaturen boven 35°C, dalende waterpeilen, veenoxidatie en bodemdaling in het Groene Hart, hittestress onder kwetsbare bewoners.",
    omvang: 65,
    duur: "7 dagen",
    tijdstip: "spits",
  },
  {
    id: "internetstoring",
    emoji: "📡",
    titel: "Internetstoring",
    omschrijving: "Glasvezelbreuk · regio platgelegd",
    prompt:
      "Een grote glasvezelbreuk legt internet en telefonie in de hele regio Woerden plat. Pinverkeer, verkeersregelinstallaties, en communicatie van hulpdiensten zijn verstoord.",
    omvang: 60,
    duur: "12 uur",
    tijdstip: "ochtend",
  },
  {
    id: "sneeuw",
    emoji: "❄️",
    titel: "Extreme sneeuw",
    omschrijving: "30cm sneeuwval · min 12°C",
    prompt:
      "Een hevige sneeuwstorm dumpt 30 cm sneeuw met temperaturen tot -12°C. Wegen worden onbegaanbaar, gladheid, uitval van openbaar vervoer en verhoogde druk op hulpdiensten.",
    omvang: 70,
    duur: "1 dag",
    tijdstip: "spits",
  },
  {
    id: "stroomstoring",
    emoji: "🔌",
    titel: "Stroomstoring",
    omschrijving: "Netbeheerder storing · 8 uur",
    prompt:
      "Een grootschalige storing bij de netbeheerder legt de stroomvoorziening in Woerden 8 uur plat. Verkeerslichten, gemalen, datacommunicatie en verwarming vallen uit.",
    omvang: 75,
    duur: "12 uur",
    tijdstip: "spits",
  },
];

export const DUUR_OPTIES = ["1 uur", "4 uur", "12 uur", "1 dag", "3 dagen", "7 dagen"];
export const TIJDSTIP_OPTIES = ["nacht", "ochtend", "spits", "weekend"];
