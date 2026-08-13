import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { StatusTabs } from "@/components/ui/StatusTabs";
import { listSpecialistsKyc } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";
import { formatDate, formatFullName } from "@/lib/utils";
import type { KycStatus } from "@/generated/prisma/enums";

const PARAM_TO_STATUS: Record<string, KycStatus> = {
  pendiente: "PENDING",
  aprobado: "APPROVED",
  rechazado: "REJECTED",
  requiere_cambios: "REQUIRES_CHANGES",
};

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const active = estado ?? "todas";
  const specialists = await listSpecialistsKyc();

  const counts: Record<string, number> = {
    todas: specialists.length,
    pendiente: specialists.filter((s) => s.kyc.status === "PENDING").length,
    requiere_cambios: specialists.filter((s) => s.kyc.status === "REQUIRES_CHANGES").length,
    aprobado: specialists.filter((s) => s.kyc.status === "APPROVED").length,
    rechazado: specialists.filter((s) => s.kyc.status === "REJECTED").length,
  };

  const filtered =
    active === "todas"
      ? specialists
      : specialists.filter((s) => s.kyc.status === PARAM_TO_STATUS[active]);

  return (
    <div>
      <PageHeader
        title="Verificación de especialistas"
        subtitle="Bandeja de auto-registro. Nada se publica sin aprobación de la administración."
      />

      <StatusTabs
        basePath={APP_ROUTE.app.verification.index}
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
          {filtered.map((specialist) => (
            <li key={specialist.id}>
              <Link
                href={`${APP_ROUTE.app.verification.index}/${specialist.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50"
              >
                <Avatar name={formatFullName(specialist)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{formatFullName(specialist)}</p>
                  <p className="truncate text-xs text-zinc-500">
                    {specialist.specialties.map((s) => s.name).join(", ") || "Sin especialidades"} · Enviado el{" "}
                    {formatDate(specialist.kyc.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={specialist.kyc.status} />
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
