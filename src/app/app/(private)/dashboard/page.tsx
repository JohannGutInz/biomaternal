import { Building2, ClipboardCheck, ShieldCheck, UserPlus, UserRoundPlus, UsersRound } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { AlertList } from "@/components/dashboard/AlertList";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { getDashboardStats, getCurrentUser } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { formatLongDate, greetingForHour } from "@/lib/utils";

export default async function DashboardPage() {
  const [user, stats] = await Promise.all([getCurrentUser(), getDashboardStats()]);

  const now = new Date();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {greetingForHour(now)}, {user.username}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{formatLongDate(now)}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Especialistas activos"
          value={String(stats.activeSpecialists)}
          subtitle="Con verificación aprobada"
          icon={UsersRound}
          tone="zinc"
        />
        <StatCard
          title="Solicitudes pendientes"
          value={String(stats.pendingApplications)}
          subtitle="Esperando verificación"
          icon={UserPlus}
          tone="rose"
        />
        <StatCard
          title="Sucursales"
          value={String(stats.sucursalesCount)}
          subtitle="Registradas"
          icon={Building2}
          tone="zinc"
        />
        <StatCard
          title="Reservas pendientes"
          value={String(stats.pendingReservations)}
          subtitle="Por confirmar"
          icon={ClipboardCheck}
          tone="gold"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AlertList
          items={[
            {
              icon: UserPlus,
              tone: "rose",
              title: `${stats.pendingApplications} solicitudes pendientes`,
              subtitle: "Esperando verificación",
              href: APP_ROUTE.app.verification.index,
            },
          ]}
        />

        <QuickActions
          items={[
            { icon: UserRoundPlus, label: "Nuevo especialista", href: APP_ROUTE.app.specialists.new },
            { icon: ShieldCheck, label: "Revisar solicitudes", href: APP_ROUTE.app.verification.index },
          ]}
        />
      </div>
    </div>
  );
}
