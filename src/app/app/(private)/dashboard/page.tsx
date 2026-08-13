import { Building2, ClipboardCheck, ShieldCheck, UserPlus, UserRoundPlus, UsersRound } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { AlertList } from "@/components/dashboard/AlertList";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { OccupancyBars } from "@/components/charts/OccupancyBars";
import { StatusDonutChart } from "@/components/charts/StatusDonutChart";
import { getDashboardStats, getDashboardKpis, getCurrentUser } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { formatCurrency, formatLongDate, greetingForHour } from "@/lib/utils";

export default async function DashboardPage() {
  const [user, stats, kpis] = await Promise.all([getCurrentUser(), getDashboardStats(), getDashboardKpis()]);

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

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <CardHeader title="Ocupación por sucursal" subtitle="Últimos 7 días" className="p-0 pb-4" />
          <OccupancyBars data={kpis.occupancy} />
        </Card>

        <Card className="p-5">
          <CardHeader title="Ingresos por cobros" subtitle="Pagado vs. pendiente" className="p-0 pb-2" />
          <StatusDonutChart
            data={[
              { status: "pagado", total: kpis.revenue.paid },
              { status: "pendiente", total: kpis.revenue.pending },
            ]}
          />
          <p className="mt-2 text-center text-xs text-zinc-500">
            {formatCurrency(kpis.revenue.paid)} cobrados · {formatCurrency(kpis.revenue.pending)} por cobrar
          </p>
        </Card>

        <Card className="p-5">
          <CardHeader title="Especialistas más activos" subtitle="Últimos 30 días" className="p-0 pb-4" />
          {kpis.topSpecialists.length === 0 ? (
            <p className="text-sm text-zinc-400">Sin reservas registradas aún.</p>
          ) : (
            <ul className="space-y-3">
              {kpis.topSpecialists.map((s, i) => (
                <li key={s.specialistId} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-zinc-700">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-500">
                      {i + 1}
                    </span>
                    {s.name}
                  </span>
                  <span className="font-medium text-zinc-900">{s.reservationsCount}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
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
