import type { Insight } from "@/lib/types";

export const INSIGHTS: Insight[] = [
  {
    id: "insight-n198",
    titel: "Verkeersprobleem N198",
    domein: "verkeer",
    ernst: "hoog",
    analyse:
      "Tijdens de avondspits (16:00–18:00) loopt de wachttijd op het kruispunt Rondweg Noord / N198 op tot gemiddeld 4,2 minuten. De doorstroom daalt structureel onder 30 km/h, met terugslag tot op de Boerendijk.",
    aanbeveling:
      "Implementeer een dynamische, verkeersafhankelijke regeling op het kruispunt Rondweg en geef tijdens spits prioriteit aan de hoofdrichting. Verwachte reductie wachttijd: 35–45%.",
    budgetIndicatie: "€ 180.000 – € 240.000",
    vertrouwen: 87,
  },
  {
    id: "insight-waterstand",
    titel: "Waterstand risico komende week",
    domein: "water",
    ernst: "hoog",
    analyse:
      "Op basis van de neerslagverwachting (KNMI: 38 mm in 48 uur) en de huidige boezemstand stijgt het peil in Polder Bulwijk naar verwachting richting de verhoogde drempel binnen 60 uur.",
    aanbeveling:
      "Activeer Gemaal Woerden-Noord preventief op 60% capaciteit en verlaag het boezempeil met 8 cm vooruitlopend op de neerslag. Houd Gemaal Zuid in reserve.",
    budgetIndicatie: "€ 4.500 (energie + bediening)",
    vertrouwen: 91,
  },
  {
    id: "insight-a12-no2",
    titel: "Luchtkwaliteit A12-zone",
    domein: "lucht",
    ernst: "midden",
    analyse:
      "De NO₂-concentratie nabij de A12-corridor ligt structureel 28% boven het gemeentelijk gemiddelde en nadert tijdens spits de WHO-advieswaarde. Sensoren Middelland en A12-corridor pieken gelijktijdig.",
    aanbeveling:
      "Breid de groenbufferstrook langs de A12 uit met 1,2 ha en plant snelgroeiende fijnstofbindende beplanting. Onderzoek snelheidsverlaging A12 in samenwerking met Rijkswaterstaat.",
    budgetIndicatie: "€ 320.000 (groenstrook)",
    vertrouwen: 79,
  },
  {
    id: "insight-hitte-centrum",
    titel: "Hitte-eiland centrum",
    domein: "lucht",
    ernst: "midden",
    analyse:
      "Op zomerse dagen ligt de gevoelstemperatuur op de Markt tot 6,5 °C hoger dan in de omliggende polder. Het versteende centrum koelt 's nachts onvoldoende af; risicogroep ouderen in de binnenstad.",
    aanbeveling:
      "Plaats tijdelijke watervernevelaars op de Markt tijdens hittegolven en plant 24 schaduwbomen in de Kerkstraat. Onderzoek lichtgekleurde bestrating bij toekomstige herinrichting.",
    budgetIndicatie: "€ 95.000 (bomen + vernevelaars)",
    vertrouwen: 83,
  },
  {
    id: "insight-evenement",
    titel: "Evenement-impact Kaasmarkt",
    domein: "evenementen",
    ernst: "laag",
    analyse:
      "De wekelijkse Kaasmarkt (do, 5.200 bezoekers) zorgt voor 41% hogere parkeerdruk en verhoogde drukte op de Rijnstraat tussen 09:00 en 13:00. Geen structurele veiligheidsknelpunten.",
    aanbeveling:
      "Stel een vaste verkeersomleiding via de Rijnstraat in op donderdagochtend en activeer dynamische parkeerverwijzing naar P+R Station. Communiceer proactief naar bezoekers.",
    budgetIndicatie: "€ 12.000 (bebording + communicatie)",
    vertrouwen: 88,
  },
];
