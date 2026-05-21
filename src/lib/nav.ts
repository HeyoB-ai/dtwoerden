import {
  LayoutDashboard,
  Car,
  CloudSun,
  Droplets,
  HardHat,
  CalendarDays,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  sub: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Executive Dashboard", sub: "Overzicht", icon: LayoutDashboard },
  { href: "/verkeer", label: "Verkeer & Mobiliteit", sub: "Doorstroming", icon: Car },
  { href: "/klimaat", label: "Klimaat & Milieu", sub: "Lucht · Hitte · Bodem", icon: CloudSun },
  { href: "/water", label: "Waterbeheer", sub: "Peilen · Gemalen", icon: Droplets },
  { href: "/infrastructuur", label: "Infrastructuur", sub: "Projecten", icon: HardHat },
  { href: "/evenementen", label: "Evenementen", sub: "Openbare ruimte", icon: CalendarDays },
  { href: "/ai-advies", label: "AI Stadsadvies", sub: "Woerden Insights", icon: Sparkles },
];
