"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { crearClienteAction, actualizarClienteAction } from "@/lib/actions";
import { clientSchema, type ClientData } from "@/lib/schemas";

export interface ClientFormValues extends ClientData {
  id?: string;
}

export function ClientFormModal({
  open,
  onClose,
  client,
}: {
  open: boolean;
  onClose: () => void;
  client?: ClientFormValues;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientData>({
    resolver: zodResolver(clientSchema),
    values: {
      name: client?.name ?? "",
      phone: client?.phone ?? "",
      notes: client?.notes ?? "",
    },
  });

  async function onSubmit(data: ClientData) {
    setServerError(null);
    const result = client?.id ? await actualizarClienteAction(client.id, data) : await crearClienteAction(data);
    if (result.status === "error") {
      setServerError(result.message);
      return;
    }
    reset();
    onClose();
    router.refresh();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={client?.id ? "Editar cliente" : "Nuevo cliente"}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="client-form" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar"}
          </Button>
        </>
      }
    >
      <form id="client-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Nombre" {...register("name")} error={errors.name?.message} />
        <Input label="Teléfono (opcional)" {...register("phone")} error={errors.phone?.message} />
        <Textarea label="Notas (opcional)" rows={3} {...register("notes")} error={errors.notes?.message} />
        {serverError && <p className="text-sm text-rose-600">{serverError}</p>}
      </form>
    </Modal>
  );
}
