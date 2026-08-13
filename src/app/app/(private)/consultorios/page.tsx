import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { listConsultorios, listSucursales } from "@/lib/data";
import { ConsultoriosClient } from "./ConsultoriosClient";

export default async function ConsultoriosPage() {
  const [consultorios, sucursales] = await Promise.all([listConsultorios(), listSucursales()]);

  return (
    <div>
      <PageHeader title="Consultorios" subtitle="Alta y edición de consultorios, tarifas y estado." />
      <Card>
        <ConsultoriosClient
          consultorios={consultorios.map((c) => ({
            id: c.id,
            sucursalId: c.sucursalId,
            sucursalName: c.sucursal.name,
            name: c.name,
            floor: c.floor ?? "",
            description: c.description ?? "",
            hourlyRate: c.hourlyRate ?? undefined,
            dayRate: c.dayRate ?? undefined,
            isActive: c.isActive,
          }))}
          sucursales={sucursales.map((s) => ({ id: s.id, name: s.name }))}
        />
      </Card>
    </div>
  );
}
