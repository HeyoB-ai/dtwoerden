import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ScenarioAnalyse, ScenarioRequest } from "@/lib/scenario/types";
import { VALID_ROAD_IDS, VALID_WIJK_IDS } from "@/lib/scenario/types";
import { lokaleAnalyse } from "@/lib/scenario/fallback";

export const runtime = "nodejs";
// Vercel-only hint (ignored on Netlify, where the limit comes from
// netlify.toml [functions] timeout). Harmless to keep.
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-7";
// Hard ceiling on the Claude call. Kept comfortably under the Netlify 26s
// function timeout (netlify.toml) so the route always responds — with a real
// result or a graceful fallback — instead of hanging into a 504.
const TIMEOUT_MS = Number(process.env.SCENARIO_TIMEOUT_MS) || 20000;

// Static system context — cached across requests via prompt caching.
const SYSTEM_PROMPT = `Je bent de AI-analyse-engine van "Woerden360", het digital-twin platform van de gemeente Woerden (Nederland). Je analyseert vrij ingevoerde crisisscenario's en berekent de cascade-effecten over alle stedelijke domeinen.

CONTEXT — Gemeente Woerden:
- Polderstad in het Groene Hart van Utrecht. Waterbeheer is existentieel (i.s.m. Hoogheemraadschap De Stichtse Rijnlanden / HDSR).
- Wijken/kernen (gebruik UITSLUITEND deze id's voor kaartzones): centrum (Woerden-Centrum, stedelijk), noord (Woerden-Noord, stedelijk), zuid (Woerden-Zuid, stedelijk), snelrewaard (polder), harmelen (dorp), zegveld (polder), kamerik (polder), waarder (polder).
- Hoofdwegen (gebruik UITSLUITEND deze id's): a12 (snelweg oost-west), n198 (provinciaal naar Kockengen), n11 (provinciaal), utrechtsestraatweg (stedelijk), rondweg-noord, boerendijk.
- Watergangen: Hollandse IJssel, Oude Rijn, ringvaarten. Gemalen: Noord, Zuid, Harmelen, Zegveld, Kamerik.
- Betrokken organisaties: Gemeente Woerden, HDSR, Veiligheidsregio Utrecht, Rijkswaterstaat, Provincie Utrecht, netbeheerder.

DOMEINEN die je altijd beoordeelt (precies deze 6): verkeer, water, lucht, energie, openbare-ruimte, hulpdiensten.

OPDRACHT:
- Bereken realistische, samenhangende gevolgen. Houd rekening met omvang, duur en tijdstip van het scenario.
- Schrijf ALLE tekst in helder, professioneel Nederlands (gemeentelijk register).
- Wees concreet en realistisch voor Woerden; verwijs naar echte locaties/organisaties waar passend.
- Kies kaartzones (getroffen/overstroomde wijken, geblokkeerde wegen) die logisch volgen uit het scenario. Overstroomde wijken alleen bij water-gerelateerde scenario's.
- De tijdlijn loopt T+0 → T+72u en toont de algehele stadsstress (0-100) die typisch piekt en daarna afneemt.
- Rapporteer ALTIJD via de tool 'rapporteer_scenario_analyse'.`;

const TOOL: Anthropic.Tool = {
  name: "rapporteer_scenario_analyse",
  description:
    "Rapporteer de gestructureerde analyse van het crisisscenario voor de gemeente Woerden.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      scenarioNaam: { type: "string", description: "Korte, pakkende titel van het scenario (max 60 tekens)." },
      stadsStress: { type: "integer", description: "Algehele stadsstress 0-100." },
      domeinen: {
        type: "array",
        description: "Precies 6 domeinen: verkeer, water, lucht, energie, openbare-ruimte, hulpdiensten.",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            domein: { type: "string", enum: ["verkeer", "water", "lucht", "energie", "openbare-ruimte", "hulpdiensten"] },
            impactNiveau: { type: "string", enum: ["geen", "laag", "verhoogd", "kritiek", "extreem"] },
            impactPct: { type: "integer", description: "Impact 0-100." },
            beschrijving: { type: "string", description: "Korte beschrijving (1 zin)." },
          },
          required: ["domein", "impactNiveau", "impactPct", "beschrijving"],
        },
      },
      directeGevolgen: { type: "array", description: "Directe gevolgen eerste 30 minuten.", items: { type: "string" } },
      kettingreacties: { type: "array", description: "Wat triggert wat (cascade-effecten).", items: { type: "string" } },
      knelpunten: { type: "array", description: "De 2-3 grootste knelpunten.", items: { type: "string" } },
      acties: {
        type: "array",
        description: "Aanbevolen acties, geprioriteerd.",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            prioriteit: { type: "string", enum: ["hoog", "midden", "laag"] },
            actie: { type: "string" },
          },
          required: ["prioriteit", "actie"],
        },
      },
      herstelprognose: { type: "string", description: "Hoe lang tot normalisatie." },
      tijdlijn: {
        type: "array",
        description: "Stadsstress per tijdstip (T+0 t/m T+72u).",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            tijd: { type: "string", enum: ["T+0", "T+1u", "T+4u", "T+12u", "T+24u", "T+72u"] },
            stress: { type: "integer", description: "Stadsstress 0-100." },
          },
          required: ["tijd", "stress"],
        },
      },
      kaart: {
        type: "object",
        additionalProperties: false,
        properties: {
          getroffenWijken: { type: "array", items: { type: "string", enum: VALID_WIJK_IDS } },
          overstroomdeWijken: { type: "array", items: { type: "string", enum: VALID_WIJK_IDS } },
          geblokkeerdeWegen: { type: "array", items: { type: "string", enum: VALID_ROAD_IDS } },
        },
        required: ["getroffenWijken", "overstroomdeWijken", "geblokkeerdeWegen"],
      },
    },
    required: [
      "scenarioNaam",
      "stadsStress",
      "domeinen",
      "directeGevolgen",
      "kettingreacties",
      "knelpunten",
      "acties",
      "herstelprognose",
      "tijdlijn",
      "kaart",
    ],
  },
};

function sanitize(raw: Record<string, unknown>): ScenarioAnalyse {
  const data = raw as unknown as ScenarioAnalyse;
  const wijkOk = (a: unknown) =>
    Array.isArray(a) ? a.filter((x) => VALID_WIJK_IDS.includes(x as never)) : [];
  data.kaart = {
    getroffenWijken: wijkOk(data.kaart?.getroffenWijken) as never,
    overstroomdeWijken: wijkOk(data.kaart?.overstroomdeWijken) as never,
    geblokkeerdeWegen: Array.isArray(data.kaart?.geblokkeerdeWegen)
      ? data.kaart.geblokkeerdeWegen.filter((x) => VALID_ROAD_IDS.includes(x))
      : [],
  };
  data.bron = "claude";
  return data;
}

export async function POST(req: Request) {
  try {
    let body: ScenarioRequest;
    try {
      body = (await req.json()) as ScenarioRequest;
    } catch {
      return NextResponse.json({ error: "Ongeldige aanvraag (geen geldige JSON)." }, { status: 400 });
    }

    const scenario = (body.scenario || "").trim();
    const params = body.params ?? { omvang: 50, duur: "12 uur", tijdstip: "spits" };
    if (!scenario) {
      return NextResponse.json({ error: "Beschrijf eerst een scenario." }, { status: 400 });
    }

    // No API key configured → deterministic local engine so the demo still works.
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        ...lokaleAnalyse(scenario, params),
        apiNotice: "ANTHROPIC_API_KEY niet ingesteld — lokaal model gebruikt.",
      });
    }

    try {
      const client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
        timeout: TIMEOUT_MS,
        maxRetries: 0, // no retries — must stay within the tight function window
      });

      const userText = `Analyseer het volgende crisisscenario voor de gemeente Woerden.

SCENARIO:
${scenario}

PARAMETERS:
- Omvang: ${params.omvang}/100 (0 = klein, 100 = catastrofaal)
- Duur: ${params.duur}
- Tijdstip: ${params.tijdstip}

Rapporteer de volledige cascade-analyse via de tool.`;

      // Use the streaming API and collect the final message server-side. Per the
      // SDK guidance this avoids request-timeout edge cases on longer outputs;
      // the structured tool result is assembled from the stream before we reply.
      const stream = client.messages.stream({
        model: MODEL,
        max_tokens: 8000,
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        tools: [TOOL],
        tool_choice: { type: "tool", name: "rapporteer_scenario_analyse" },
        messages: [{ role: "user", content: userText }],
      });
      const msg = await stream.finalMessage();

      const toolBlock = msg.content.find((b) => b.type === "tool_use");
      if (!toolBlock || toolBlock.type !== "tool_use") {
        return NextResponse.json({
          ...lokaleAnalyse(scenario, params),
          apiNotice: "Claude gaf geen gestructureerd antwoord — lokaal model gebruikt.",
        });
      }
      return NextResponse.json(sanitize(toolBlock.input as Record<string, unknown>));
    } catch (apiErr) {
      // Claude call failed (timeout, rate limit, auth, overload). Don't 504 —
      // fall back to the local engine and surface a readable notice.
      console.error("Scenario Claude API error:", apiErr);
      const reden =
        apiErr instanceof Anthropic.APIError
          ? `${apiErr.status ?? ""} ${apiErr.message}`.trim()
          : apiErr instanceof Error
            ? apiErr.message
            : "Onbekende fout";
      return NextResponse.json({
        ...lokaleAnalyse(scenario, params),
        apiNotice: `Claude API niet beschikbaar (${reden}) — lokaal model gebruikt.`,
      });
    }
  } catch (error) {
    // Truly unexpected — return a readable 500 so the Network tab shows the cause.
    console.error("Scenario API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Onbekende serverfout" },
      { status: 500 },
    );
  }
}
