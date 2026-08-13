"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { ClientPicker, type ClientOption } from "@/components/clients/ClientPicker";
import { crearWhatsappRequestAction } from "@/lib/actions";
import { whatsappRequestSchema, type WhatsappRequestData } from "@/lib/schemas";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function WhatsappRequestFormModal({
  open,
  onClose,
  specialists,
  clients,
}: {
  open: boolean;
  onClose: () => void;
  specialists: { id: string; name: string }[];
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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WhatsappRequestData>({
    resolver: zodResolver(whatsappRequestSchema),
    defaultValues: { date: todayInputValue(), confirmed: true },
  });

  const confirmed = watch("confirmed");

  async function onSubmit(data: WhatsappRequestData) {
    setServerError(null);
    const result = await crearWhatsappRequestAction(data);
    if (result.status === "error") {
      setServerError(result.message);
      return;
    }
    reset({ date: todayInputValue(), confirmed: true, clientId: "", specialistId: "", declineReason: "", notes: "" });
    onClose();
    router.refresh();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar solicitud de WhatsApp"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="whatsapp-request-form" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Registrar"}
          </Button>
        </>
      }
    >
      <form id="whatsapp-request-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input type="date" label="Fecha" {...register("date")} error={errors.date?.message} />
        <Controller
          name="clientId"
          control={control}
          render={({ field }) => (
            <ClientPicker
              label="Contacto"
              clients={localClients}
              value={field.value}
              onChange={field.onChange}
              onClientCreated={(c) => setLocalClients((prev) => [...prev, c])}
              error={errors.clientId?.message}
            />
          )}
        />
        <Select label="Especialista solicitado (opcional)" {...register("specialistId")} error={errors.specialistId?.message}>
          <option value="">Sin especificar</option>
          {specialists.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
        <Checkbox label="Se concretó la cita" {...register("confirmed")} />
        {!confirmed && (
          <Textarea
            label="Motivo (no se concretó)"
            rows={2}
            {...register("declineReason")}
            error={errors.declineReason?.message}
          />
        )}
        <Textarea label="Notas (opcional)" rows={2} {...register("notes")} error={errors.notes?.message} />
        {serverError && <p className="text-sm text-rose-600">{serverError}</p>}
      </form>
    </Modal>
  );
}
