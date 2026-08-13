import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { listInbodySales, listClients } from "@/lib/data";
import { InbodyClient } from "./InbodyClient";

export default async function InbodyPage() {
  const [sales, clients] = await Promise.all([listInbodySales(), listClients()]);

  return (
    <div>
      <PageHeader title="Ventas InBody" subtitle="Estudios de composición corporal vendidos fuera de consulta." />
      <Card>
        <InbodyClient
          sales={sales.map((s) => ({
            id: s.id,
            date: s.date.toISOString(),
            clientId: s.clientId,
            clientName: s.client.name,
            clientPhone: s.client.phone,
            type: s.type,
            price: s.price,
            notes: s.notes,
          }))}
          clients={clients.map((c) => ({ id: c.id, name: c.name, phone: c.phone }))}
        />
      </Card>
    </div>
  );
}
