import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { listReservationsInRange, listSucursales } from "@/lib/data";
import { formatFullName } from "@/lib/utils";
import { AgendaClient } from "./AgendaClient";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; sucursal?: string }>;
}) {
  const { desde, sucursal } = await searchParams;

  const from = desde ? new Date(`${desde}T00:00:00`) : new Date(new Date().setHours(0, 0, 0, 0));
  const to = new Date(from);
  to.setDate(to.getDate() + 7);

  const [reservations, sucursales] = await Promise.all([
    listReservationsInRange(from, to, sucursal || undefined),
    listSucursales(),
  ]);

  return (
    <div>
      <PageHeader title="Agenda" subtitle="Ocupación de consultorios por sucursal — próximos 7 días desde la fecha elegida." />
      <Card>
        <AgendaClient
          from={from.toISOString().slice(0, 10)}
          sucursalId={sucursal ?? ""}
          sucursales={sucursales.map((s) => ({ id: s.id, name: s.name }))}
          reservations={reservations.map((r) => ({
            id: r.id,
            consultorioName: r.consultorio.name,
            sucursalName: r.consultorio.sucursal.name,
            specialistName: formatFullName(r.specialist),
            startAt: r.startAt.toISOString(),
            endAt: r.endAt.toISOString(),
            status: r.status,
          }))}
        />
      </Card>
    </div>
  );
}
