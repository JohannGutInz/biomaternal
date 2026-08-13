import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getClient } from "@/lib/data";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { Badge, statusTone } from "@/components/ui/Badge";
import { ClientDetailHeader } from "@/components/clients/ClientDetailHeader";
import { APP_ROUTE } from "@/lib/routes";
import { formatCurrency, formatFullName } from "@/lib/utils";

const RESERVATION_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Realizada",
  NO_SHOW: "No se presentó",
  POSTPONED: "Pospuesta",
};

const INBODY_TYPE_LABEL: Record<string, string> = { CORPORATE: "Corporativo", PUBLIC: "Público" };
const CALL_DIRECTION_LABEL: Record<string, string> = { INBOUND: "Entrante", OUTBOUND: "Saliente" };

function formatDate(iso: Date) {
  return iso.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(iso: Date) {
  return iso.toLocaleString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);

  if (!client) notFound();

  return (
    <div>
      <Link
        href={APP_ROUTE.app.clientes.index}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Clientes
      </Link>

      <ClientDetailHeader client={{ id: client.id, name: client.name, phone: client.phone ?? "", notes: client.notes ?? "" }} />

      {client.notes && (
        <Card className="mb-6 p-5">
          <p className="text-sm text-zinc-700">{client.notes}</p>
        </Card>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader title="Citas" subtitle={client.reservations.length === 0 ? "Sin citas registradas." : undefined} />
          {client.reservations.length > 0 && (
            <Table>
              <THead>
                <Th>Fecha</Th>
                <Th>Consultorio</Th>
                <Th>Especialista</Th>
                <Th>Estado</Th>
                <Th>Monto</Th>
              </THead>
              <tbody>
                {client.reservations.map((r) => (
                  <Tr key={r.id}>
                    <Td>{formatDateTime(r.startAt)}</Td>
                    <Td className="font-medium text-zinc-900">
                      {r.consultorio.name}
                      <span className="block text-xs text-zinc-400">{r.consultorio.sucursal.name}</span>
                    </Td>
                    <Td>{formatFullName(r.specialist)}</Td>
                    <Td>
                      <Badge tone={statusTone(r.status)}>{RESERVATION_STATUS_LABEL[r.status] ?? r.status}</Badge>
                    </Td>
                    <Td>{r.priceApplied != null ? formatCurrency(r.priceApplied) : "—"}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader title="Ventas InBody" subtitle={client.inbodySales.length === 0 ? "Sin ventas registradas." : undefined} />
          {client.inbodySales.length > 0 && (
            <Table>
              <THead>
                <Th>Fecha</Th>
                <Th>Tipo</Th>
                <Th>Precio</Th>
                <Th>Notas</Th>
              </THead>
              <tbody>
                {client.inbodySales.map((s) => (
                  <Tr key={s.id}>
                    <Td>{formatDate(s.date)}</Td>
                    <Td>
                      <Badge tone={s.type === "CORPORATE" ? "info" : "neutral"}>{INBODY_TYPE_LABEL[s.type] ?? s.type}</Badge>
                    </Td>
                    <Td>{formatCurrency(s.price)}</Td>
                    <Td className="text-zinc-500">{s.notes ?? "—"}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader title="Agenda WhatsApp" subtitle={client.whatsappRequests.length === 0 ? "Sin solicitudes registradas." : undefined} />
          {client.whatsappRequests.length > 0 && (
            <Table>
              <THead>
                <Th>Fecha</Th>
                <Th>Especialista solicitado</Th>
                <Th>Se concretó</Th>
                <Th>Detalle</Th>
              </THead>
              <tbody>
                {client.whatsappRequests.map((w) => (
                  <Tr key={w.id}>
                    <Td>{formatDate(w.date)}</Td>
                    <Td>{w.specialist ? formatFullName(w.specialist) : <span className="text-zinc-300">—</span>}</Td>
                    <Td>
                      <Badge tone={w.confirmed ? "success" : "danger"}>{w.confirmed ? "Sí" : "No"}</Badge>
                    </Td>
                    <Td className="text-zinc-500">{(w.confirmed ? w.notes : w.declineReason) ?? "—"}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader title="Llamadas" subtitle={client.callLogs.length === 0 ? "Sin llamadas registradas." : undefined} />
          {client.callLogs.length > 0 && (
            <Table>
              <THead>
                <Th>Fecha</Th>
                <Th>Tipo</Th>
                <Th>Contacto nuevo</Th>
                <Th>Generó cita</Th>
              </THead>
              <tbody>
                {client.callLogs.map((c) => (
                  <Tr key={c.id}>
                    <Td>{formatDate(c.date)}</Td>
                    <Td>{CALL_DIRECTION_LABEL[c.direction] ?? c.direction}</Td>
                    <Td>
                      <Badge tone={c.isNewContact ? "success" : "neutral"}>{c.isNewContact ? "Sí" : "No"}</Badge>
                    </Td>
                    <Td>
                      <Badge tone={c.generatedAppointment ? "success" : "neutral"}>{c.generatedAppointment ? "Sí" : "No"}</Badge>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
