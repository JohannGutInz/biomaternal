import { PageHeader } from "@/components/ui/PageHeader";
import { getReporteSemanal, getReportePorEspecialista, listSucursales } from "@/lib/data";
import { ReportesClient } from "./ReportesClient";

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string; sucursal?: string }>;
}) {
  const { desde, hasta, sucursal } = await searchParams;

  const hastaStr = hasta ?? toDateStr(new Date());
  const desdeStr =
    desde ??
    (() => {
      const d = new Date(`${hastaStr}T00:00:00`);
      d.setDate(d.getDate() - 6);
      return toDateStr(d);
    })();

  const from = new Date(`${desdeStr}T00:00:00`);
  const toExclusive = new Date(`${hastaStr}T00:00:00`);
  toExclusive.setDate(toExclusive.getDate() + 1);

  const [semanal, porEspecialista, sucursales] = await Promise.all([
    getReporteSemanal(from, toExclusive, sucursal || undefined),
    getReportePorEspecialista(from, toExclusive),
    listSucursales(),
  ]);

  return (
    <div>
      <PageHeader title="Reportes" subtitle="Reporte semanal y por especialista — para la reunión de equipo." />
      <ReportesClient
        desde={desdeStr}
        hasta={hastaStr}
        sucursalId={sucursal ?? ""}
        sucursales={sucursales.map((s) => ({ id: s.id, name: s.name }))}
        semanal={semanal}
        porEspecialista={porEspecialista}
      />
    </div>
  );
}
