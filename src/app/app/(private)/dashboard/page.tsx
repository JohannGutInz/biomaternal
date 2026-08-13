import { ShieldCheck, UserPlus, UserRoundPlus, UsersRound } from "lucide-react";
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          title="Modelos activos"
          value={String(stats.activeModels)}
          subtitle="Con KYC aprobado"
          icon={UsersRound}
          tone="zinc"
        />
        <StatCard
          title="Solicitudes pendientes"
          value={String(stats.pendingApplications)}
          subtitle="Esperando moderación"
          icon={UserPlus}
          tone="rose"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AlertList
          items={[
            {
              icon: UserPlus,
              tone: "rose",
              title: `${stats.pendingApplications} solicitudes pendientes`,
              subtitle: "Esperando moderación",
              href: APP_ROUTE.app.moderation.index,
            },
          ]}
        />

        <QuickActions
          items={[
            { icon: UserRoundPlus, label: "Nuevo modelo", href: APP_ROUTE.app.models.new },
            { icon: ShieldCheck, label: "Revisar solicitudes", href: APP_ROUTE.app.moderation.index },
          ]}
        />
      </div>
    </div>
  );
}
