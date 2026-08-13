import {
  Activity,
  BarChart3,
  Building2,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  Contact,
  DoorOpen,
  Handshake,
  List,
  MessageCircle,
  Phone,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
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
    label: "Especialistas",
    items: [
      { label: "Especialistas", href: APP_ROUTE.app.specialists.index, icon: UsersRound },
      { label: "Verificación", href: APP_ROUTE.app.verification.index, icon: ShieldCheck },
    ],
  },
  {
    label: "Clínicas",
    items: [
      { label: "Sucursales", href: APP_ROUTE.app.sucursales.index, icon: Building2 },
      { label: "Consultorios", href: APP_ROUTE.app.consultorios.index, icon: DoorOpen },
      { label: "Agenda", href: APP_ROUTE.app.agenda.index, icon: CalendarDays },
      { label: "Reservas", href: APP_ROUTE.app.reservas.index, icon: ClipboardCheck },
      { label: "Cobros", href: APP_ROUTE.app.cobros.index, icon: CircleDollarSign },
      { label: "Reportes", href: APP_ROUTE.app.reportes.index, icon: BarChart3 },
    ],
  },
  {
    label: "Recepción",
    items: [
      { label: "Clientes", href: APP_ROUTE.app.clientes.index, icon: Contact },
      { label: "Ventas InBody", href: APP_ROUTE.app.inbody.index, icon: Activity },
      { label: "Agenda WhatsApp", href: APP_ROUTE.app.whatsapp.index, icon: MessageCircle },
      { label: "Llamadas", href: APP_ROUTE.app.llamadas.index, icon: Phone },
      { label: "Prospectos B2B", href: APP_ROUTE.app.b2b.index, icon: Handshake },
    ],
  },
  {
    label: "Configuración",
    items: [
      { label: "Catálogos", href: APP_ROUTE.app.catalogs.index, icon: List },
    ],
  },
];
