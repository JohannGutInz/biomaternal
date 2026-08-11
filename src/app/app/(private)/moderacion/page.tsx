import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { StatusTabs } from "@/components/ui/StatusTabs";
import { listModelsKyc } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { formatDate, formatFullName, isProfileComplete } from "@/lib/utils";
import type { KycStatus } from "@/generated/prisma/enums";

const PARAM_TO_STATUS: Record<string, KycStatus> = {
  pendiente: "PENDING",
  aprobado: "APPROVED",
  rechazado: "REJECTED",
  requiere_cambios: "REQUIRES_CHANGES",
};

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const active = estado ?? "todas";
  const models = await listModelsKyc();

  const counts: Record<string, number> = {
    todas: models.length,
    pendiente: models.filter((m) => m.kyc.status === "PENDING").length,
    requiere_cambios: models.filter((m) => m.kyc.status === "REQUIRES_CHANGES").length,
    aprobado: models.filter((m) => m.kyc.status === "APPROVED").length,
    rechazado: models.filter((m) => m.kyc.status === "REJECTED").length,
  };

  const filtered =
    active === "todas"
      ? models
      : models.filter((m) => m.kyc.status === PARAM_TO_STATUS[active]);

  return (
    <div>
      <PageHeader
        title="Moderación de registros"
        subtitle="Bandeja de auto-registro. Nada se publica sin aprobación del staff."
      />

      <StatusTabs
        basePath={APP_ROUTE.app.moderation.index}
        active={active}
        counts={counts}
        tabs={[
          { value: "todas", label: "Todas" },
          { value: "pendiente", label: "Pendiente" },
          { value: "requiere_cambios", label: "Requiere cambios" },
          { value: "aprobado", label: "Aprobado" },
          { value: "rechazado", label: "Rechazado" },
        ]}
      />

      <Card>
        <ul className="divide-y divide-zinc-100">
          {filtered.map((model) => (
            <li key={model.id}>
              <Link
                href={`${APP_ROUTE.app.moderation.index}/${model.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50"
              >
                <Avatar name={formatFullName(model)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{formatFullName(model)}</p>
                  <p className="truncate text-xs text-zinc-500">
                    {model.categories.map((c) => c.name).join(", ")} · Enviado el{" "}
                    {formatDate(model.kyc.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!isProfileComplete(model) && <Badge tone="warning">Perfil incompleto</Badge>}
                  <StatusBadge status={model.kyc.status} />
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" />
              </Link>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-5 py-16 text-center text-sm text-zinc-400">
              No hay registros en este estado.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
