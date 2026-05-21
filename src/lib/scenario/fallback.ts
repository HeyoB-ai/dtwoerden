import { clamp } from "@/lib/utils";
import type {
  ScenarioAnalyse,
  ScenarioDomein,
  ScenarioParams,
  ImpactNiveau,
  DomeinImpact,
  TijdlijnTijd,
} from "./types";
import type { WijkId } from "@/lib/types";

function niveauVoorPct(pct: number): ImpactNiveau {
  if (pct >= 85) return "extreem";
  if (pct >= 60) return "kritiek";
  if (pct >= 35) return "verhoogd";
  if (pct >= 12) return "laag";
  return "geen";
}

const DUUR_FACTOR: Record<string, number> = {
  "1 uur": 0.7,
  "4 uur": 0.85,
  "12 uur": 1,
  "1 dag": 1.1,
  "3 dagen": 1.25,
  "7 dagen": 1.4,
};

const TIJDSTIP_VERKEER: Record<string, number> = {
  nacht: 0.5,
  ochtend: 1.1,
  spits: 1.4,
  weekend: 1.0,
};

/**
 * Deterministic local heuristic used when the Claude API key is not configured,
 * so the demo screen remains fully functional offline.
 */
export function lokaleAnalyse(scenario: string, params: ScenarioParams): ScenarioAnalyse {
  const t = scenario.toLowerCase();
  const base = clamp(params.omvang, 5, 100) * (DUUR_FACTOR[params.duur] ?? 1);
  const has = (...kw: string[]) => kw.some((k) => t.includes(k));

  const isWater = has("overstroom", "water", "ijssel", "peil", "dijk", "polder", "neerslag", "regen");
  const isDroogte = has("droogte", "hitte", "warm", "geen neerslag");
  const isBrand = has("brand", "rook", "vuur", "explosie");
  const isStroom = has("stroom", "elektric", "netbeheer", "spanning");
  const isInternet = has("internet", "glasvezel", "telefonie", "communicatie", "netwerk");
  const isSneeuw = has("sneeuw", "gladheid", "ijzel", "winter", "vorst");
  const isEvenement = has("evenement", "bezoekers", "festival", "markt", "kermis", "concert");

  const dom = (domein: ScenarioDomein, factor: number, beschrijving: string): DomeinImpact => {
    const pct = Math.round(clamp(base * factor, 0, 100));
    return { domein, impactNiveau: niveauVoorPct(pct), impactPct: pct, beschrijving };
  };

  const domeinen: DomeinImpact[] = [
    dom(
      "verkeer",
      (isSneeuw || isEvenement ? 1.1 : isWater ? 0.8 : 0.6) * (TIJDSTIP_VERKEER[params.tijdstip] ?? 1),
      isSneeuw
        ? "Gladheid en onbegaanbare wegen, OV-uitval."
        : isEvenement
          ? "Massale toestroom, afgesloten binnenstad, hoge parkeerdruk."
          : "Verhoogde druk en omleidingen op hoofdroutes.",
    ),
    dom(
      "water",
      isWater ? 1.3 : isDroogte ? 0.9 : 0.3,
      isWater
        ? "Stijgende peilen, gemalen op maximale capaciteit, polders onder druk."
        : isDroogte
          ? "Dalende peilen, veenoxidatie en verzilting."
          : "Beperkte impact op waterbeheer.",
    ),
    dom(
      "lucht",
      isBrand ? 1.3 : isDroogte ? 0.8 : 0.3,
      isBrand
        ? "Rookpluim en verhoogde fijnstof, gezondheidsrisico benedenwinds."
        : isDroogte
          ? "Verhoogde ozon- en fijnstofconcentraties."
          : "Luchtkwaliteit grotendeels stabiel.",
    ),
    dom(
      "energie",
      isStroom ? 1.4 : isSneeuw ? 0.7 : 0.4,
      isStroom
        ? "Stroomuitval: verkeerslichten, gemalen en datacommunicatie zonder voeding."
        : "Verhoogde belasting op het net.",
    ),
    dom(
      "openbare-ruimte",
      isEvenement ? 1.2 : isWater || isSneeuw ? 0.9 : 0.5,
      isEvenement
        ? "Hoge bezoekersdruk, afval en handhaving onder spanning."
        : "Toegenomen meldingen openbare ruimte.",
    ),
    dom(
      "hulpdiensten",
      isBrand || isWater || isSneeuw || isInternet ? 1.2 : 0.7,
      isInternet
        ? "Verstoorde communicatie (C2000/telefonie) bemoeilijkt coördinatie hulpdiensten."
        : "Opgeschaalde inzet en gecoördineerde crisisorganisatie (GRIP).",
    ),
  ];

  const stadsStress = Math.round(
    clamp(domeinen.reduce((s, d) => s + d.impactPct, 0) / domeinen.length + 8, 0, 100),
  );

  // map zones
  const getroffenWijken: WijkId[] = isEvenement
    ? ["centrum", "zuid"]
    : isWater
      ? ["centrum", "zuid", "snelrewaard", "zegveld"]
      : ["centrum", "noord", "zuid"];
  const overstroomdeWijken: WijkId[] = isWater ? ["snelrewaard", "zegveld", "waarder"] : [];
  const geblokkeerdeWegen = isSneeuw
    ? ["a12", "n198", "n11"]
    : isEvenement
      ? ["utrechtsestraatweg", "rondweg-noord"]
      : isWater
        ? ["n198", "boerendijk"]
        : ["a12"];

  const tijden: TijdlijnTijd[] = ["T+0", "T+1u", "T+4u", "T+12u", "T+24u", "T+72u"];
  const curve = [0.55, 1.0, 0.95, 0.7, 0.45, 0.2];
  const tijdlijn = tijden.map((tijd, i) => ({
    tijd,
    stress: Math.round(clamp(stadsStress * curve[i] + (i === 1 ? 5 : 0), 0, 100)),
  }));

  return {
    scenarioNaam:
      scenario.length > 60 ? scenario.slice(0, 57).trim() + "…" : scenario || "Aangepast scenario",
    stadsStress,
    domeinen,
    directeGevolgen: [
      "Meldkamer schaalt op; crisisteam gemeente bijeengeroepen.",
      isWater
        ? "Gemalen Noord en Zuid naar maximale capaciteit, peilen gemonitord."
        : isStroom
          ? "Noodaggregaten voor kritieke functies (gemalen, verkeerscentrale)."
          : "Verkeersregelaars en BOA's ingezet op knooppunten.",
      "Inwoners geïnformeerd via NL-Alert en gemeentelijke kanalen.",
    ],
    kettingreacties: [
      isStroom
        ? "Stroomuitval → verkeerslichten uit → opstoppingen → vertraagde hulpdiensten."
        : isWater
          ? "Peilstijging → gemalen overbelast → polder onder water → wegen onbereikbaar."
          : "Hoofdroute geblokkeerd → sluipverkeer → overbelasting stedelijk net.",
      "Toegenomen meldingen openbare ruimte vergroten druk op beheerorganisatie.",
    ],
    knelpunten: [
      isWater
        ? "Capaciteit gemalen rond Snelrewaard en Zegveld is de bottleneck."
        : isEvenement
          ? "Bereikbaarheid binnenstad voor hulpdiensten tijdens piekdrukte."
          : "Doorstroming A12-afrit Woerden en stedelijke ring.",
      "Coördinatie tussen gemeente, HDSR, Veiligheidsregio en Rijkswaterstaat.",
    ],
    acties: [
      { prioriteit: "hoog", actie: "Activeer crisisorganisatie (GRIP) en regionaal coördinatieteam." },
      {
        prioriteit: "hoog",
        actie: isWater
          ? "Schaal alle gemalen op en stel preventieve evacuatie laaggelegen polders voor."
          : isStroom
            ? "Plaats noodstroom bij gemalen en verkeerscentrale; prioriteer kwetsbare locaties."
            : "Stel omleidingen in en zet dynamische verkeersregeling in op kruispunten.",
      },
      { prioriteit: "midden", actie: "Communiceer proactief naar inwoners via NL-Alert en sociale media." },
      { prioriteit: "laag", actie: "Monitor en evalueer; schaal af zodra waarden normaliseren." },
    ],
    herstelprognose:
      stadsStress > 75
        ? "Volledige normalisatie verwacht binnen 3–7 dagen, afhankelijk van escalatie."
        : stadsStress > 45
          ? "Normalisatie verwacht binnen 24–72 uur na piek."
          : "Situatie normaliseert naar verwachting binnen 12–24 uur.",
    tijdlijn,
    kaart: { getroffenWijken, overstroomdeWijken, geblokkeerdeWegen },
    bron: "lokaal",
  };
}
