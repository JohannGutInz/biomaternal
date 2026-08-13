import { getCurrentUser, getOwnSpecialist, listOwnReservations, listConsultorios, listClients } from "@/lib/data";
import { notFound } from "next/navigation";
import { AgendaEspecialistaClient } from "./AgendaEspecialistaClient";

export default async function EspecialistaAgendaPage() {
  const user = await getCurrentUser();
  const specialist = await getOwnSpecialist(user.id);
  if (!specialist) notFound();

  const [reservations, consultorios, clients] = await Promise.all([
    listOwnReservations(specialist.id),
    listConsultorios(),
    listClients(),
  ]);

  const canReserve = specialist.kyc.status === "APPROVED";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {!canReserve && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Tu perfil debe estar aprobado para poder apartar o rentar un consultorio.
        </div>
      )}

      <AgendaEspecialistaClient
        canReserve={canReserve}
        reservations={reservations.map((r) => ({
          id: r.id,
          consultorioName: r.consultorio.name,
          sucursalName: r.consultorio.sucursal.name,
          clientName: r.client?.name ?? null,
          type: r.type,
          startAt: r.startAt.toISOString(),
          endAt: r.endAt.toISOString(),
          status: r.status,
          priceApplied: r.priceApplied,
          chargeStatus: r.charge?.status ?? null,
        }))}
        consultorios={consultorios
          .filter((c) => c.isActive)
          .map((c) => ({ id: c.id, name: c.name, sucursalName: c.sucursal.name }))}
        clients={clients.map((c) => ({ id: c.id, name: c.name, phone: c.phone }))}
      />
    </div>
  );
}
