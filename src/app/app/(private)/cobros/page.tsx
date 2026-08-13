import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { listCharges, listReservations } from "@/lib/data";
import { formatFullName } from "@/lib/utils";
import { CobrosClient } from "./CobrosClient";

export default async function CobrosPage() {
  const [charges, reservations] = await Promise.all([listCharges(), listReservations()]);

  const reservationsWithoutCharge = reservations
    .filter((r) => !r.charge && (r.status === "CONFIRMED" || r.status === "COMPLETED"))
    .map((r) => ({
      id: r.id,
      label: `${r.consultorio.name} · ${formatFullName(r.specialist)} · ${new Date(r.startAt).toLocaleDateString("es-MX")}`,
    }));

  return (
    <div>
      <PageHeader title="Cobros" subtitle="Registro manual y estatus de pago por reserva." />
      <Card>
        <CobrosClient
          charges={charges.map((c) => ({
            id: c.id,
            amount: c.amount,
            method: c.method,
            status: c.status,
            createdAt: c.createdAt.toISOString(),
            paidAt: c.paidAt?.toISOString() ?? null,
            consultorioName: c.reservation.consultorio.name,
            specialistName: formatFullName(c.reservation.specialist),
          }))}
          reservationsWithoutCharge={reservationsWithoutCharge}
        />
      </Card>
    </div>
  );
}
