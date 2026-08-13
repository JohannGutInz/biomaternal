"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SucursalFormModal, type SucursalFormValues } from "@/components/sucursales/SucursalFormModal";

export function SucursalesClient({ sucursales }: { sucursales: (SucursalFormValues & { id: string; consultoriosCount: number })[] }) {
  const [editing, setEditing] = useState<SucursalFormValues | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between gap-4 p-5 pb-0">
        <p className="text-xs text-zinc-500">{sucursales.length} sucursales</p>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Nueva sucursal
        </Button>
      </div>

      <div className="mt-4">
        <Table>
          <THead>
            <Th>Nombre</Th>
            <Th>Dirección</Th>
            <Th>Horario</Th>
            <Th>Consultorios</Th>
            <Th>Estado</Th>
            <Th>{""}</Th>
          </THead>
          <tbody>
            {sucursales.map((s) => (
              <Tr key={s.id}>
                <Td className="font-medium text-zinc-900">{s.name}</Td>
                <Td>{s.address}</Td>
                <Td>{s.openTime} – {s.closeTime}</Td>
                <Td>{s.consultoriosCount}</Td>
                <Td>
                  <Badge tone={s.isActive ? "success" : "neutral"}>{s.isActive ? "Activa" : "Inactiva"}</Badge>
                </Td>
                <Td className="text-right">
                  <button
                    type="button"
                    onClick={() => setEditing(s)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-brand-600"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </button>
                </Td>
              </Tr>
            ))}
            {sucursales.length === 0 && (
              <tr>
                <Td className="py-10 text-center text-zinc-400">Sin sucursales todavía.</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <SucursalFormModal open={creating} onClose={() => setCreating(false)} />
      <SucursalFormModal open={!!editing} onClose={() => setEditing(null)} sucursal={editing ?? undefined} />
    </>
  );
}
