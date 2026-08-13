import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { listCallLogs } from "@/lib/data";
import { LlamadasClient } from "./LlamadasClient";

export default async function LlamadasPage() {
  const calls = await listCallLogs();

  return (
    <div>
      <PageHeader title="Llamadas y conversión" subtitle="Registro de llamadas entrantes/salientes y su conversión a citas." />
      <Card>
        <LlamadasClient
          calls={calls.map((c) => ({
            id: c.id,
            date: c.date.toISOString(),
            contactName: c.contactName,
            direction: c.direction,
            isNewContact: c.isNewContact,
            generatedAppointment: c.generatedAppointment,
            notes: c.notes,
          }))}
        />
      </Card>
    </div>
  );
}
