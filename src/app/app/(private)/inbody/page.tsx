import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { listInbodySales } from "@/lib/data";
import { InbodyClient } from "./InbodyClient";

export default async function InbodyPage() {
  const sales = await listInbodySales();

  return (
    <div>
      <PageHeader title="Ventas InBody" subtitle="Estudios de composición corporal vendidos fuera de consulta." />
      <Card>
        <InbodyClient
          sales={sales.map((s) => ({
            id: s.id,
            date: s.date.toISOString(),
            clientName: s.clientName,
            clientPhone: s.clientPhone,
            type: s.type,
            price: s.price,
            notes: s.notes,
          }))}
        />
      </Card>
    </div>
  );
}
