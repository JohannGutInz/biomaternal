"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ClientPicker, type ClientOption } from "@/components/clients/ClientPicker";
import { crearInbodySaleAction } from "@/lib/actions";
import { inbodySaleSchema, type InbodySaleData } from "@/lib/schemas";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function InbodySaleFormModal({
  open,
  onClose,
  clients,
}: {
  open: boolean;
  onClose: () => void;
  clients: ClientOption[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [localClients, setLocalClients] = useState(clients);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InbodySaleData>({
    resolver: zodResolver(inbodySaleSchema),
    defaultValues: { date: todayInputValue(), type: "PUBLIC" },
  });

  async function onSubmit(data: InbodySaleData) {
    setServerError(null);
    const result = await crearInbodySaleAction(data);
    if (result.status === "error") {
      setServerError(result.message);
      return;
    }
    reset({ date: todayInputValue(), type: "PUBLIC", clientId: "", price: undefined, notes: "" });
    onClose();
    router.refresh();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar venta de InBody"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="inbody-sale-form" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Registrar"}
          </Button>
        </>
      }
    >
      <form id="inbody-sale-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input type="date" label="Fecha" {...register("date")} error={errors.date?.message} />
        <Controller
          name="clientId"
          control={control}
          render={({ field }) => (
            <ClientPicker
              label="Cliente"
              clients={localClients}
              value={field.value}
              onChange={field.onChange}
              onClientCreated={(c) => setLocalClients((prev) => [...prev, c])}
              error={errors.clientId?.message}
            />
          )}
        />
        <Select label="Tipo" {...register("type")} error={errors.type?.message}>
          <option value="PUBLIC">Público</option>
          <option value="CORPORATE">Corporativo</option>
        </Select>
        <Input
          type="number"
          label="Precio"
          {...register("price", { setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)) })}
          error={errors.price?.message}
        />
        <Textarea label="Notas (opcional)" rows={3} {...register("notes")} error={errors.notes?.message} />
        {serverError && <p className="text-sm text-rose-600">{serverError}</p>}
      </form>
    </Modal>
  );
}
