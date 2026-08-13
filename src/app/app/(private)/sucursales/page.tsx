import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { listSucursales } from "@/lib/data";
import { SucursalesClient } from "./SucursalesClient";

export default async function SucursalesPage() {
  const sucursales = await listSucursales();

  return (
    <div>
      <PageHeader title="Sucursales" subtitle="Alta y edición de sucursales, horarios y consultorios asociados." />
      <Card>
        <SucursalesClient
          sucursales={sucursales.map((s) => ({
            id: s.id,
            name: s.name,
            address: s.address,
            phone: s.phone ?? undefined,
            timezone: s.timezone,
            openTime: s.openTime,
            closeTime: s.closeTime,
            isActive: s.isActive,
            consultoriosCount: s.consultorios.length,
          }))}
        />
      </Card>
    </div>
  );
}
