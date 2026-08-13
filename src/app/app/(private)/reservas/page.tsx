import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { listReservations, listConsultorios, listSpecialists } from "@/lib/data";
import { formatFullName } from "@/lib/utils";
import { ReservasClient } from "./ReservasClient";

export default async function ReservasPage() {
  const [reservations, consultorios, specialists] = await Promise.all([
    listReservations(),
    listConsultorios(),
    listSpecialists(),
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
            type: r.type,
            startAt: r.startAt.toISOString(),
            endAt: r.endAt.toISOString(),
            status: r.status,
            hasCharge: !!r.charge,
          }))}
          consultorios={consultorios
            .filter((c) => c.isActive)
            .map((c) => ({ id: c.id, name: c.name, sucursalName: c.sucursal.name }))}
          specialists={specialists.map((s) => ({ id: s.id, name: formatFullName(s) }))}
        />
      </Card>
    </div>
  );
}
