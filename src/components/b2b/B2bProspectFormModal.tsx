"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { crearB2bProspectAction } from "@/lib/actions";
import { b2bProspectSchema, type B2bProspectData } from "@/lib/schemas";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function B2bProspectFormModal({
  open,
  onClose,
  specialties,
}: {
  open: boolean;
  onClose: () => void;
  specialties: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<B2bProspectData>({
    resolver: zodResolver(b2bProspectSchema),
    defaultValues: { date: todayInputValue(), status: "INTERESTED", scheduleIncident: false },
  });

  async function onSubmit(data: B2bProspectData) {
    setServerError(null);
    const result = await crearB2bProspectAction(data);
    if (result.status === "error") {
      setServerError(result.message);
      return;
    }
    reset({
      date: todayInputValue(),
      status: "INTERESTED",
      scheduleIncident: false,
      specialistName: "",
      specialtyId: "",
      notes: "",
    });
    onClose();
    router.refresh();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar prospecto B2B"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="b2b-prospect-form" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Registrar"}
          </Button>
        </>
      }
    >
      <form id="b2b-prospect-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input type="date" label="Fecha" {...register("date")} error={errors.date?.message} />
        <Input label="Especialista interesado" {...register("specialistName")} error={errors.specialistName?.message} />
        <Select label="Especialidad (opcional)" {...register("specialtyId")} error={errors.specialtyId?.message}>
          <option value="">Sin especificar</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
        <Select label="Estatus" {...register("status")} error={errors.status?.message}>
          <option value="INTERESTED">Interesado</option>
          <option value="NEGOTIATING">En negociación</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="DISCARDED">Descartado</option>
        </Select>
        <Checkbox label="Tiene incidencia de agenda" {...register("scheduleIncident")} />
        <Textarea label="Notas (opcional)" rows={2} {...register("notes")} error={errors.notes?.message} />
        {serverError && <p className="text-sm text-rose-600">{serverError}</p>}
      </form>
    </Modal>
  );
}
