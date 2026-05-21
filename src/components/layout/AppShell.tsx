"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { AlertTicker } from "./AlertTicker";
import { LoadingScreen } from "./LoadingScreen";
import { useLiveData } from "@/lib/hooks/useLiveSensors";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

const ROUTE_TITLE: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Woerden360 Digital Twin", subtitle: "Executive dashboard — realtime status alle domeinen" },
  "/verkeer": { title: "Verkeer & Mobiliteit", subtitle: "Live verkeerssimulatie wegennet Woerden" },
  "/klimaat": { title: "Klimaat & Milieu", subtitle: "Luchtkwaliteit · hitte · waterstanden · duurzaamheid" },
  "/water": { title: "Waterbeheer", subtitle: "Polderpeilen, gemalen en klimaatscenario's — i.s.m. HDSR" },
  "/infrastructuur": { title: "Infrastructuur & Ontwikkelingen", subtitle: "Actieve en geplande projecten 2025–2030" },
  "/evenementen": { title: "Evenementen & Openbare Ruimte", subtitle: "Agenda, impact en meldingen openbare ruimte" },
  "/ai-advies": { title: "AI Stadsadvies", subtitle: "Woerden Insights — datagedreven aanbevelingen" },
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { reading } = useLiveData();
  const meta = ROUTE_TITLE[pathname] ?? { title: "Woerden360", subtitle: "Digital Twin Platform" };

  return (
    <div className="flex h-screen overflow-hidden bg-ink grid-glow">
      {!reading && <LoadingScreen />}
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={meta.title} subtitle={meta.subtitle} />

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card/40 px-2 py-2 lg:hidden">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs",
                  active ? "bg-primary/15 text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
        </nav>

        <main className="relative flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1600px] p-4 lg:p-6">{children}</div>
          {/* persistent demo watermark */}
          <div className="pointer-events-none fixed bottom-12 right-3 z-20 select-none rounded-md border border-alert-orange/20 bg-ink/70 px-2 py-1 text-[10px] text-alert-orange/70 backdrop-blur">
            DEMO DATA — Niet gekoppeld aan live systemen
          </div>
        </main>

        <AlertTicker />
      </div>
    </div>
  );
}
