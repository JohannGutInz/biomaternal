import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { listReservations, listConsultorios, listSpecialists, listClients } from "@/lib/data";
import { formatFullName } from "@/lib/utils";
import { ReservasClient } from "./ReservasClient";

export default async function ReservasPage() {
  const [reservations, consultorios, specialists, clients] = await Promise.all([
    listReservations(),
    listConsultorios(),
    listSpecialists(),
    listClients(),
  ]);

  return (
    <div>
      <PageHeader title="Reservas" subtitle="Listado de reservas por sucursal, consultorio, especialista y estado." />
      <Card>
        <ReservasClient
          reservations={reservations.map((r) => ({
            id: r.id,
            consultorioName: r.consultorio.name,
            sucursalName: r.consultorio.sucursal.name,
            specialistName: formatFullName(r.specialist),
            clientId: r.clientId,
            clientName: r.client?.name ?? null,
            type: r.type,
            startAt: r.startAt.toISOString(),
            endAt: r.endAt.toISOString(),
            status: r.status,
            priceApplied: r.priceApplied,
            hasCharge: !!r.charge,
          }))}
          consultorios={consultorios
            .filter((c) => c.isActive)
            .map((c) => ({ id: c.id, name: c.name, sucursalName: c.sucursal.name }))}
          specialists={specialists.filter((s) => s.active).map((s) => ({ id: s.id, name: formatFullName(s) }))}
          clients={clients.map((c) => ({ id: c.id, name: c.name, phone: c.phone }))}
        />
      </Card>
    </div>
  );
}
