"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import Link from "next/link";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ClientFormModal, type ClientFormValues } from "@/components/clients/ClientFormModal";
import { APP_ROUTE } from "@/lib/routes";

type ClientRow = ClientFormValues & {
  id: string;
  reservationsCount: number;
  inbodySalesCount: number;
  whatsappRequestsCount: number;
  callLogsCount: number;
};

export function ClientesClient({ clients }: { clients: ClientRow[] }) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ClientFormValues | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => c.name.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q));
  }, [clients, query]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-0">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o teléfono…"
          className="w-64"
        />
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Nuevo cliente
        </Button>
      </div>

      <div className="mt-4">
        <Table>
          <THead>
            <Th>Nombre</Th>
            <Th>Teléfono</Th>
            <Th>Citas</Th>
            <Th>InBody</Th>
            <Th>WhatsApp</Th>
            <Th>Llamadas</Th>
            <Th>{""}</Th>
          </THead>
          <tbody>
            {filtered.map((c) => (
              <Tr key={c.id}>
                <Td className="font-medium text-zinc-900">
                  <Link href={APP_ROUTE.app.clientes.detail(c.id)} className="hover:underline">
                    {c.name}
                  </Link>
                </Td>
                <Td>{c.phone || <span className="text-zinc-300">—</span>}</Td>
                <Td>{c.reservationsCount}</Td>
                <Td>{c.inbodySalesCount}</Td>
                <Td>{c.whatsappRequestsCount}</Td>
                <Td>{c.callLogsCount}</Td>
                <Td className="text-right">
                  <button
                    type="button"
                    onClick={() => setEditing(c)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-brand-600"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </button>
                </Td>
              </Tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <Td className="py-10 text-center text-zinc-400">
                  {clients.length === 0 ? "Sin clientes todavía." : "Sin resultados."}
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <ClientFormModal open={creating} onClose={() => setCreating(false)} />
      <ClientFormModal open={!!editing} onClose={() => setEditing(null)} client={editing ?? undefined} />
    </>
  );
}
