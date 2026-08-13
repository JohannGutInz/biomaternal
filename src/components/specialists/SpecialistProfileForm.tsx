"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { MultiSelectPicker } from "@/components/ui/MultiSelectPicker";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SpecialistPhotoUpload, type SpecialistPhotoUploadHandle } from "@/components/specialists/SpecialistPhotoUpload";
import { updateOwnSpecialistProfileAction } from "@/lib/actions";
import { ownSpecialistProfileSchema, type OwnSpecialistProfileData } from "@/lib/schemas";
import type { OwnSpecialistWithKyc } from "@/lib/data";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const KYC_BADGE: Record<string, { label: string; className: string }> = {
  PENDING: { label: "En revisión", className: "bg-amber-50 text-amber-700 border-amber-200" },
  APPROVED: { label: "Aprobado", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Rechazado", className: "bg-rose-50 text-rose-700 border-rose-200" },
  REQUIRES_CHANGES: { label: "Requiere cambios", className: "bg-brand-50 text-brand-700 border-brand-200" },
};

interface Specialty {
  id: string;
  name: string;
}

export function SpecialistProfileForm({
  specialist,
  specialties,
}: {
  specialist: NonNullable<OwnSpecialistWithKyc>;
  specialties: Specialty[];
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [confirmApprovedSave, setConfirmApprovedSave] = useState<OwnSpecialistProfileData | null>(null);
  const photoRef = useRef<SpecialistPhotoUploadHandle>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OwnSpecialistProfileData>({
    resolver: zodResolver(ownSpecialistProfileSchema),
    defaultValues: {
      firstName: specialist.firstName,
      paternalLastName: specialist.paternalLastName,
      maternalLastName: specialist.maternalLastName ?? "",
      phone: specialist.phone,
      licenseNumber: specialist.licenseNumber ?? "",
      bio: specialist.bio ?? "",
      location: specialist.location ?? "",
      photoUrl: specialist.photoUrl ?? undefined,
      specialtyIds: specialist.specialties.map((s) => s.id),
    },
  });

  const firstName = watch("firstName");
  const paternalLastName = watch("paternalLastName");
  const specialtyIds = watch("specialtyIds");
  const photoUrl = watch("photoUrl");

  const kycBadge = KYC_BADGE[specialist.kyc.status] ?? KYC_BADGE.PENDING;

  async function doSave(data: OwnSpecialistProfileData) {
    setMessage(null);

    let resolvedPhotoUrl = data.photoUrl;
    try {
      resolvedPhotoUrl = await photoRef.current?.resolvePending(data.photoUrl);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al subir la foto.");
      return;
    }

    const result = await updateOwnSpecialistProfileAction({ ...data, photoUrl: resolvedPhotoUrl });
    setMessage(result.message);
    setConfirmApprovedSave(null);
  }

  async function onSubmit(data: OwnSpecialistProfileData) {
    if (specialist.kyc.status === "APPROVED") {
      setConfirmApprovedSave(data);
      return;
    }
    await doSave(data);
  }

  return (
    <>
    <Modal
      open={!!confirmApprovedSave}
      onClose={() => setConfirmApprovedSave(null)}
      size="sm"
      title="¿Guardar cambios?"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={() => setConfirmApprovedSave(null)}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => confirmApprovedSave && doSave(confirmApprovedSave)}>
            Sí, guardar
          </Button>
        </>
      }
    >
      <p className="text-sm text-zinc-500">
        Tu perfil ya está aprobado. Si guardas estos cambios, deberá aprobarse de nuevo por la administración.
      </p>
    </Modal>

    <form id="specialist-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-20 sm:pb-0">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="h-28 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700" />

        <div className="relative -mt-14 flex flex-col items-center px-6 pb-8">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-zinc-200 shadow-lg">
            {photoUrl ? (
              <Image src={photoUrl} alt="Foto de perfil" fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-10 w-10 text-zinc-400" />
              </div>
            )}
          </div>

          <div className="mt-3">
            <SpecialistPhotoUpload
              ref={photoRef}
              value={photoUrl}
              onChange={(url) => setValue("photoUrl", url, { shouldValidate: true })}
              label=""
            />
          </div>

          <h2 className="mt-3 text-xl font-semibold text-zinc-900">
            {(firstName || specialist.firstName)} {(paternalLastName || specialist.paternalLastName)}
          </h2>
          <p className="text-sm text-zinc-400">{specialist.email}</p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className={`rounded-full border px-3 py-0.5 text-xs font-medium ${kycBadge.className}`}>
              {kycBadge.label}
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs text-zinc-600">
              {specialist.genre === "FEMALE" ? "Mujer" : "Hombre"}
            </span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader title="Datos de contacto" />
        <div className="grid grid-cols-1 gap-4 px-5 pb-5 sm:grid-cols-2">
          <Input label="Nombre(s)" {...register("firstName")} error={errors.firstName?.message} />
          <Input label="Apellido paterno" {...register("paternalLastName")} error={errors.paternalLastName?.message} />
          <Input label="Apellido materno" {...register("maternalLastName")} error={errors.maternalLastName?.message} />
          <Input label="Correo" disabled value={specialist.email} />
          <Input label="Teléfono" {...register("phone")} error={errors.phone?.message} />
          <Input label="Ciudad / ubicación" {...register("location")} error={errors.location?.message} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Perfil profesional" />
        <div className="grid grid-cols-1 gap-4 px-5 pb-5">
          <Input
            label="Cédula profesional"
            {...register("licenseNumber")}
            error={errors.licenseNumber?.message}
          />
          <Textarea label="Biografía" rows={4} {...register("bio")} error={errors.bio?.message} />
          <Controller
            name="specialtyIds"
            control={control}
            render={() => (
              <MultiSelectPicker
                label="Especialidades"
                hint="(mínimo 1)"
                options={specialties}
                selectedIds={specialtyIds}
                onChange={(ids) => setValue("specialtyIds", ids, { shouldValidate: true })}
                error={errors.specialtyIds?.message}
              />
            )}
          />
        </div>
      </Card>

      {message && (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          {message}
        </p>
      )}

      <div className="hidden justify-end pb-4 sm:flex">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>

    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:hidden">
      <button
        type="submit"
        form="specialist-profile-form"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-zinc-950 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:pointer-events-none disabled:opacity-50"
      >
        {isSubmitting ? "Guardando…" : "Guardar cambios"}
      </button>
    </div>
    </>
  );
}
