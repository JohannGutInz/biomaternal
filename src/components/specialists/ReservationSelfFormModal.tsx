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
import { crearReservationEspecialistaAction } from "@/lib/actions";
import { reservationSelfSchema, type ReservationSelfData } from "@/lib/schemas";

export function ReservationSelfFormModal({
  open,
  onClose,
  consultorios,
  clients,
}: {
  open: boolean;
  onClose: () => void;
  consultorios: { id: string; name: string; sucursalName: string }[];
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
  } = useForm<ReservationSelfData>({
    resolver: zodResolver(reservationSelfSchema),
    defaultValues: { type: "HOURLY", inbodyIncluded: false },
  });

  const type = watch("type");

  async function onSubmit(data: ReservationSelfData) {
    setServerError(null);
    const result = await crearReservationEspecialistaAction(data);
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
      title="Apartar / rentar consultorio"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="reservation-self-form" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Confirmar reserva"}
          </Button>
        </>
      }
    >
      <form id="reservation-self-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select label="Consultorio" {...register("consultorioId")} error={errors.consultorioId?.message}>
          <option value="">Selecciona…</option>
          {consultorios.map((c) => (
            <option key={c.id} value={c.id}>{c.name} · {c.sucursalName}</option>
          ))}
        </Select>
        <Select label="Tipo" {...register("type")} error={errors.type?.message}>
          <option value="HOURLY">Por hora</option>
          <option value="FULL_DAY">Jornada completa</option>
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input type="datetime-local" label="Inicio" {...register("startAt")} error={errors.startAt?.message} />
          <Input type="datetime-local" label="Fin" {...register("endAt")} error={errors.endAt?.message} />
        </div>
        {type === "HOURLY" && (
          <Controller
            name="clientId"
            control={control}
            render={({ field }) => (
              <ClientPicker
                label="Paciente"
                clients={localClients}
                value={field.value}
                onChange={field.onChange}
                onClientCreated={(c) => setLocalClients((prev) => [...prev, c])}
                error={errors.clientId?.message}
              />
            )}
          />
        )}
        <Checkbox label="Incluye InBody en la consulta" {...register("inbodyIncluded")} />
        <Textarea label="Notas (opcional)" rows={3} {...register("notes")} error={errors.notes?.message} />
        <p className="text-xs text-zinc-400">
          El costo de la renta lo confirma recepción cuando se marca la cita como realizada.
        </p>
        {serverError && <p className="text-sm text-rose-600">{serverError}</p>}
      </form>
    </Modal>
  );
}
