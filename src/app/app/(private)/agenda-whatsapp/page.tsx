import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { listWhatsappRequests, listSpecialists, listClients } from "@/lib/data";
import { formatFullName } from "@/lib/utils";
import { WhatsappClient } from "./WhatsappClient";

export default async function AgendaWhatsappPage() {
  const [requests, specialists, clients] = await Promise.all([
    listWhatsappRequests(),
    listSpecialists(),
    listClients(),
  ]);

  return (
    <div>
      <PageHeader title="Agenda WhatsApp" subtitle="Solicitudes de cita entrantes por WhatsApp y su conversión." />
      <Card>
        <WhatsappClient
          requests={requests.map((r) => ({
            id: r.id,
            date: r.date.toISOString(),
            clientId: r.clientId,
            clientName: r.client.name,
            specialistName: r.specialist ? formatFullName(r.specialist) : null,
            confirmed: r.confirmed,
            declineReason: r.declineReason,
            notes: r.notes,
          }))}
          specialists={specialists.filter((s) => s.active).map((s) => ({ id: s.id, name: formatFullName(s) }))}
          clients={clients.map((c) => ({ id: c.id, name: c.name, phone: c.phone }))}
        />
      </Card>
    </div>
  );
}
