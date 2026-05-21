"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { CoatOfArms } from "./CoatOfArms";
import { Droplets, ShieldCheck } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/40 lg:flex">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <CoatOfArms className="h-10" />
        <div className="leading-tight">
          <div className="text-base font-bold tracking-tight">
            Woerden<span className="text-water">360</span>
          </div>
          <div className="text-[11px] text-muted-foreground">Gemeente Digital Twin</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md border transition-colors",
                  active
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-card/60 text-muted-foreground group-hover:text-foreground",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="flex flex-col">
                <span className="font-medium leading-tight">{item.label}</span>
                <span className="text-[11px] text-muted-foreground/80">{item.sub}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border px-4 py-4 text-[11px] text-muted-foreground">
        <div className="flex items-start gap-2 rounded-lg border border-water/20 bg-water/5 p-2.5">
          <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-water" />
          <span>
            <span className="font-medium text-foreground">Polderstad</span> — waterbeheer is existentieel.
            Data i.s.m. HDSR.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-traffic-green" />
          <span>v1.0 · gemeentelijk platform</span>
        </div>
      </div>
    </aside>
  );
}
