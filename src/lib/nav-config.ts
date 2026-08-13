import { List, ShieldCheck, UsersRound, type LucideIcon } from "lucide-react";
import { APP_ROUTE } from "@/lib/routes";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Talento",
    items: [
      { label: "Modelos", href: APP_ROUTE.app.models.index, icon: UsersRound },
      { label: "Moderación", href: APP_ROUTE.app.moderation.index, icon: ShieldCheck },
    ],
  },
  {
    label: "Configuración",
    items: [
      { label: "Catálogos", href: APP_ROUTE.app.catalogs.index, icon: List },
    ],
  },
];
