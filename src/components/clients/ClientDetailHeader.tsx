"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ClientFormModal, type ClientFormValues } from "@/components/clients/ClientFormModal";

export function ClientDetailHeader({ client }: { client: ClientFormValues & { id: string } }) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{client.name}</h1>
          {client.phone && <p className="mt-1 text-sm text-zinc-500">{client.phone}</p>}
        </div>
        <Button variant="secondary" onClick={() => setEditing(true)}>
          <Pencil className="h-4 w-4" /> Editar
        </Button>
      </div>

      <ClientFormModal open={editing} onClose={() => setEditing(false)} client={client} />
    </>
  );
}
