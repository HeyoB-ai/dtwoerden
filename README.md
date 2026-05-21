# Woerden360 — Gemeente Digital Twin Platform

Een interactief **digital-twin demoplatform** voor de gemeente Woerden (NL). Het visualiseert
realtime (gesimuleerde) gegevens over verkeer, klimaat, water, infrastructuur, evenementen en
AI-gestuurd stadsadvies in één samenhangend, donker gemeentelijk dashboard.

> ⚠️ **DEMO DATA** — Niet gekoppeld aan live systemen. Alle waarden worden lokaal gesimuleerd.

## Schermen

1. **Executive Dashboard** — KPI-overzicht, kaart met wijk-overlays, live alerts, 3D-twinmodel.
2. **Verkeer & Mobiliteit** — live verkeerssimulatie, kruispunten, 24-uurs/week grafieken, scenario's.
3. **Klimaat & Milieu** — luchtkwaliteit, hitte-eiland, waterstanden, bodem & duurzaamheid.
4. **Waterbeheer** — polderpeilen, gemalen, klimaatscenario's (i.s.m. HDSR). _Existentieel voor een polderstad._
5. **Infrastructuur & Ontwikkelingen** — projecten op kaart + Gantt-tijdlijn 2025–2030.
6. **Evenementen & Openbare Ruimte** — agenda, impactanalyse, meldingenfeed.
7. **AI Stadsadvies** — "Woerden Insights" + automatisch gegenereerd stadsrapport.
8. **Scenario Simulator** — vrij ingevoerd crisisscenario → AI berekent cascade-effecten over alle domeinen, projecteert op de kaart. Aangedreven door de Anthropic Claude API.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + shadcn-stijl UI-componenten
- **MapLibre GL JS** met OpenStreetMap (CARTO dark) tiles
- **Three.js / React Three Fiber** voor het 3D-twinmodel
- **Recharts** voor grafieken en tijdlijnen

## Architectuur

```
src/
  app/                 # routes per scherm (App Router)
  components/
    layout/            # Sidebar, Header, AlertTicker, AppShell, LoadingScreen
    map/               # WoerdenMap (+ context) en herbruikbare laag-componenten
    dashboard/         # KPICard, Gauge, AlertFeed
    charts/            # Recharts wrappers (time-series, bars)
    water/ ai/ infrastructuur/  # scherm-specifieke onderdelen
    ui/                # shadcn-stijl primitives
  lib/
    data/              # wijken, roads, gemalen, projects, events, meldingen, geojson
    simulation/        # sensorSimulator + scenarioEngine
    hooks/             # LiveDataProvider (3s-tick) + alerts
    utils/             # aqi, waterstand, traffic, kleurschalen
```

De live data komt uit één gedeelde `LiveDataProvider` die elke 3 seconden een nieuwe,
realistische meting genereert (seizoens- en spitsafhankelijk) en scenario-modifiers toepast.

## Lokaal draaien

```bash
npm install
cp .env.example .env.local   # vul ANTHROPIC_API_KEY in voor de Scenario Simulator
npm run dev      # http://localhost:3000
npm run build    # productiebuild
npm start        # productieserver
```

### Scenario Simulator (Claude API)

Het scherm `/scenarios` roept de **Anthropic Claude API** aan (`src/app/api/scenario/route.ts`)
met forced tool use voor gestructureerde output en prompt caching op de statische Woerden-context.
Zet `ANTHROPIC_API_KEY` in `.env.local`. Zonder key valt de simulator terug op een lokaal
heuristisch model, zodat de demo blijft werken. Model is in te stellen via `ANTHROPIC_MODEL`
(standaard `claude-opus-4-7`).

Alle teksten zijn in het **Nederlands**. Kaart-tiles vereisen internettoegang
(OpenStreetMap via OpenFreeMap).
