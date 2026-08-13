import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { listClients } from "@/lib/data";
import { ClientesClient } from "./ClientesClient";

export default async function ClientesPage() {
  const clients = await listClients();

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Pacientes y contactos, vinculados directamente a citas, ventas InBody, WhatsApp y llamadas."
      />
      <Card>
        <ClientesClient
          clients={clients.map((c) => ({
            id: c.id,
            name: c.name,
            phone: c.phone ?? undefined,
            notes: c.notes ?? undefined,
            reservationsCount: c._count.reservations,
            inbodySalesCount: c._count.inbodySales,
            whatsappRequestsCount: c._count.whatsappRequests,
            callLogsCount: c._count.callLogs,
          }))}
        />
      </Card>
    </div>
  );
}
