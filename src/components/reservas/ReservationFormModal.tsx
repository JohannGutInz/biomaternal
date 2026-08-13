"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { crearReservationAction } from "@/lib/actions";
import { reservationSchema, type ReservationData } from "@/lib/schemas";

export function ReservationFormModal({
  open,
  onClose,
  consultorios,
  specialists,
}: {
  open: boolean;
  onClose: () => void;
  consultorios: { id: string; name: string; sucursalName: string }[];
  specialists: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReservationData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { type: "HOURLY" },
  });

  async function onSubmit(data: ReservationData) {
    setServerError(null);
    const result = await crearReservationAction(data);
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
      title="Nueva reserva"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="reservation-form" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Crear reserva"}
          </Button>
        </>
      }
    >
      <form id="reservation-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select label="Consultorio" {...register("consultorioId")} error={errors.consultorioId?.message}>
          <option value="">Selecciona…</option>
          {consultorios.map((c) => (
            <option key={c.id} value={c.id}>{c.name} · {c.sucursalName}</option>
          ))}
        </Select>
        <Select label="Especialista" {...register("specialistId")} error={errors.specialistId?.message}>
          <option value="">Selecciona…</option>
          {specialists.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
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
        <Textarea label="Notas (opcional)" rows={3} {...register("notes")} error={errors.notes?.message} />
        {serverError && <p className="text-sm text-rose-600">{serverError}</p>}
      </form>
    </Modal>
  );
}
