// ── Core domain types for Woerden360 Digital Twin ──────────────────────────

export type WijkId =
  | "centrum"
  | "noord"
  | "zuid"
  | "snelrewaard"
  | "harmelen"
  | "zegveld"
  | "kamerik"
  | "waarder";

export interface Wijk {
  id: WijkId;
  naam: string;
  /** [lng, lat] */
  center: [number, number];
  inwoners: number;
  oppervlakte: number; // km²
  type: "stedelijk" | "dorp" | "polder";
}

export type KpiKey =
  | "verkeer"
  | "lucht"
  | "water"
  | "evenementen"
  | "meldingen"
  | "energie";

export type OverlayMode = "verkeer" | "lucht" | "water" | "hitte" | "geen";

export type StatusLevel = "normaal" | "verhoogd" | "kritiek";

// ── Live sensor data ───────────────────────────────────────────────────────

export interface WijkReading {
  doorstroom: number; // km/h
  aqi: number;
  no2: number;
  temperatuur: number; // °C
  waterpeil: number; // cm NAP (polder)
  co2: number; // ton/jaar (static-ish)
}

export interface SensorReading {
  timestamp: number;
  // Water
  waterstandIJssel: number; // cm NAP
  waterstandOudeRijn: number; // cm NAP
  boezempeil: number; // cm NAP
  stijgsnelheid: number; // cm/uur
  // Climate
  temperatuur: number; // °C
  gevoelstemperatuur: number; // °C
  neerslag: number; // mm/uur
  windrichting: number; // degrees (0 = N)
  windkracht: number; // Bft
  windSnelheid: number; // km/h
  luchtvochtigheid: number; // %
  // Air quality (city avg)
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  co: number; // mg/m³
  // Traffic
  verkeerSnelheidA12: number; // km/h
  doorstroomGemiddeld: number; // km/h
  voertuigenPerUur: number;
  // Energy
  energieverbruik: number; // MW
  // Events / reports
  actieveEvenementen: number;
  meldingenOpen: number;
  meldingenGesloten: number;
  perWijk: Record<WijkId, WijkReading>;
}

// ── Roads ──────────────────────────────────────────────────────────────────

export interface Road {
  id: string;
  naam: string;
  type: "snelweg" | "provinciaal" | "stedelijk";
  vrijeRijsnelheid: number; // km/h
  voertuigenPerUur: number; // baseline at free flow
  vrachtAandeel: number; // %
  coords: [number, number][]; // [lng, lat][]
}

export interface Intersection {
  id: string;
  naam: string;
  center: [number, number];
  road: string;
}

// ── Water management ───────────────────────────────────────────────────────

export type GemaalStatus = "standby" | "actief" | "storing";

export interface Gemaal {
  id: string;
  naam: string;
  polder: string;
  center: [number, number];
  maxCapaciteit: number; // m³/min
  status: GemaalStatus;
  debiet: number; // m³/min (current)
  energieverbruik: number; // kW
  draaiurenVandaag: number;
  onderhoudsdatum: string;
}

export interface Polder {
  id: string;
  naam: string;
  streefpeil: number; // cm NAP
  huidigPeil: number; // cm NAP
  drempelVerhoogd: number;
  drempelKritiek: number;
}

// ── Infrastructure projects ────────────────────────────────────────────────

export type ProjectCategorie =
  | "actief"
  | "gepland"
  | "toekomst"
  | "nieuwbouw"
  | "utiliteit";

export interface Project {
  id: string;
  naam: string;
  beschrijving: string;
  categorie: ProjectCategorie;
  center: [number, number];
  opdrachtgever: string;
  aannemer: string;
  budget: number; // €
  start: string; // ISO date
  eind: string; // ISO date
  voortgang: number; // %
  status: string;
  verkeershinder: "geen" | "laag" | "midden" | "hoog";
  omwonendenGeinformeerd: boolean;
}

// ── Events & public space reports ──────────────────────────────────────────

export interface EventItem {
  id: string;
  naam: string;
  beschrijving: string;
  locatie: string;
  center: [number, number];
  datum: string; // human readable / recurring
  bezoekers: number;
  verkeersimpact: "laag" | "midden" | "hoog";
  afgeslotenWegen: string[];
  parkeerdruk: "laag" | "midden" | "hoog";
  boaInzet: number;
  afvalInzet: string;
  waterimpact: string;
  categorie: "markt" | "festival" | "sport" | "feestdag" | "cultuur";
}

export type MeldingStatus = "nieuw" | "in behandeling" | "opgelost";
export type Prioriteit = "laag" | "midden" | "hoog" | "spoed";

export interface Melding {
  id: string;
  type: string;
  locatie: string;
  center: [number, number];
  status: MeldingStatus;
  prioriteit: Prioriteit;
  toegewezen: string;
  tijd: string;
  wijk: WijkId;
}

// ── Alerts & AI insights ───────────────────────────────────────────────────

export type AlertNiveau = "info" | "waarschuwing" | "kritiek";

export interface Alert {
  id: string;
  bericht: string;
  niveau: AlertNiveau;
  domein: KpiKey;
  tijd: number; // epoch ms
}

export interface Insight {
  id: string;
  titel: string;
  domein: KpiKey;
  ernst: "laag" | "midden" | "hoog";
  analyse: string;
  aanbeveling: string;
  budgetIndicatie: string;
  vertrouwen: number; // %
}

// ── Scenarios ──────────────────────────────────────────────────────────────

export type ScenarioId =
  | "geen"
  // verkeer
  | "ochtendspits"
  | "evenement-centrum"
  | "a12-afsluiting"
  | "brug-open"
  | "wegwerk-n198"
  // water
  | "extreme-neerslag"
  | "droogte"
  | "hoogwater"
  | "gemaalstoring"
  | "hittegolf";

export interface Scenario {
  id: ScenarioId;
  label: string;
  beschrijving: string;
  domein: "verkeer" | "water";
}
