import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { listCallLogs, listClients } from "@/lib/data";
import { LlamadasClient } from "./LlamadasClient";

export default async function LlamadasPage() {
  const [calls, clients] = await Promise.all([listCallLogs(), listClients()]);

  return (
    <div>
      <PageHeader title="Llamadas y conversión" subtitle="Registro de llamadas entrantes/salientes y su conversión a citas." />
      <Card>
        <LlamadasClient
          calls={calls.map((c) => ({
            id: c.id,
            date: c.date.toISOString(),
            clientId: c.clientId,
            clientName: c.client.name,
            direction: c.direction,
            isNewContact: c.isNewContact,
            generatedAppointment: c.generatedAppointment,
            notes: c.notes,
          }))}
          clients={clients.map((c) => ({ id: c.id, name: c.name, phone: c.phone }))}
        />
      </Card>
    </div>
  );
}
