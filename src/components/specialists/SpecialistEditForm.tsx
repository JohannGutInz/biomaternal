"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { MultiSelectPicker } from "@/components/ui/MultiSelectPicker";
import { Button } from "@/components/ui/Button";
import { SpecialistPhotoUpload, type SpecialistPhotoUploadHandle } from "@/components/specialists/SpecialistPhotoUpload";
import { updateSpecialistAction } from "@/lib/actions";
import { specialistEditSchema, type SpecialistEditData } from "@/lib/schemas";
import { APP_ROUTE } from "@/lib/routes";
import type { SpecialistWithRelations } from "@/lib/data";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface Option {
  id: string;
  name: string;
}

export function SpecialistEditForm({
  specialist,
  specialties,
}: {
  specialist: SpecialistWithRelations;
  specialties: Option[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const photoRef = useRef<SpecialistPhotoUploadHandle>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SpecialistEditData>({
    resolver: zodResolver(specialistEditSchema),
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
      isPublic: specialist.isPublic,
    },
  });

  const specialtyIds = watch("specialtyIds");
  const photoUrl = watch("photoUrl");

  async function onSubmit(data: SpecialistEditData) {
    setServerError(null);

    let resolvedPhotoUrl = data.photoUrl;
    try {
      resolvedPhotoUrl = await photoRef.current?.resolvePending(data.photoUrl);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Error al subir la foto.");
      return;
    }

    const result = await updateSpecialistAction(specialist.id, { ...data, photoUrl: resolvedPhotoUrl });
    if (result.status === "error") {
      setServerError(result.message);
      return;
    }
    router.push(`${APP_ROUTE.app.specialists.index}/${specialist.id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader title="Foto de perfil" />
        <div className="flex items-center gap-4 px-5 pb-5">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100">
            {photoUrl ? (
              <Image src={photoUrl} alt="Foto de perfil" fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-8 w-8 text-zinc-400" />
              </div>
            )}
          </div>
          <SpecialistPhotoUpload
            ref={photoRef}
            value={photoUrl}
            onChange={(url) => setValue("photoUrl", url, { shouldValidate: true })}
            label=""
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Datos de contacto" />
        <div className="grid grid-cols-1 gap-4 px-5 pb-5 sm:grid-cols-2">
          <Input label="Nombre(s)" {...register("firstName")} error={errors.firstName?.message} />
          <Input label="Apellido paterno" {...register("paternalLastName")} error={errors.paternalLastName?.message} />
          <Input label="Apellido materno" {...register("maternalLastName")} error={errors.maternalLastName?.message} />
          <Input label="Teléfono" {...register("phone")} error={errors.phone?.message} />
          <Input label="Ciudad / ubicación" {...register("location")} error={errors.location?.message} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Perfil profesional" />
        <div className="grid grid-cols-1 gap-4 px-5 pb-5">
          <Input label="Cédula profesional" {...register("licenseNumber")} error={errors.licenseNumber?.message} />
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

      <Card>
        <CardHeader title="Visibilidad" />
        <div className="px-5 pb-5">
          <Checkbox label="Mostrar este perfil en la landing pública" {...register("isPublic")} />
        </div>
      </Card>

      {serverError && <p className="text-sm text-rose-600">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
