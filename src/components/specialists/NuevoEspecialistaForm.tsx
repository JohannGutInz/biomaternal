"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { MultiSelectPicker } from "@/components/ui/MultiSelectPicker";
import { crearEspecialistaAdminAction } from "@/lib/actions";
import { nuevoEspecialistaAdminFormSchema, type NuevoEspecialistaAdminFormData } from "@/lib/schemas";
import { APP_ROUTE } from "@/lib/routes";
import { SpecialistPhotoUpload, type SpecialistPhotoUploadHandle } from "@/components/specialists/SpecialistPhotoUpload";

type Specialty = { id: string; name: string };

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 border-b border-zinc-200 pb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
      {children}
    </h2>
  );
}

export function NuevoEspecialistaForm({ specialties }: { specialties: Specialty[] }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const photoRef = useRef<SpecialistPhotoUploadHandle>(null);

  const today = new Date();
  today.setFullYear(today.getFullYear() - 18);
  const maxFecha = today.toISOString().split("T")[0];

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NuevoEspecialistaAdminFormData>({
    resolver: zodResolver(nuevoEspecialistaAdminFormSchema),
    defaultValues: { specialtyIds: [] },
  });

  const specialtyIds = watch("specialtyIds");
  const photoUrl = watch("photoUrl");

  async function onSubmit(data: NuevoEspecialistaAdminFormData) {
    setServerError(null);

    let resolvedPhotoUrl = data.photoUrl;
    try {
      resolvedPhotoUrl = await photoRef.current?.resolvePending(data.photoUrl);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Error al subir la foto.");
      return;
    }

    const result = await crearEspecialistaAdminAction({ ...data, photoUrl: resolvedPhotoUrl });
    if (result.status === "error") {
      setServerError(result.message);
    } else if (result.specialistId) {
      router.push(`${APP_ROUTE.app.specialists.index}/${result.specialistId}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      <section>
        <SectionTitle>Datos personales</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Nombre(s)" required {...register("firstName")} error={errors.firstName?.message} />
          <div />
          <Input label="Apellido paterno" required {...register("paternalLastName")} error={errors.paternalLastName?.message} />
          <Input label="Apellido materno" {...register("maternalLastName")} error={errors.maternalLastName?.message} />
          <Input label="Correo electrónico" type="email" required {...register("email")} error={errors.email?.message} />
          <Input label="Teléfono" required {...register("phone")} error={errors.phone?.message} />
          <Input label="Fecha de nacimiento" type="date" max={maxFecha} required {...register("birthDate")} error={errors.birthDate?.message} />
          <Select label="Género" required defaultValue="" {...register("gender")} error={errors.gender?.message}>
            <option value="" disabled>Selecciona…</option>
            <option value="FEMALE">Femenino</option>
            <option value="MALE">Masculino</option>
          </Select>
          <Input label="Ciudad / ubicación" {...register("location")} error={errors.location?.message} />
        </div>
      </section>

      <section>
        <SectionTitle>Perfil profesional</SectionTitle>
        <div className="grid grid-cols-1 gap-4">
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
      </section>

      <section>
        <SectionTitle>Foto de perfil</SectionTitle>
        <SpecialistPhotoUpload
          ref={photoRef}
          value={photoUrl}
          onChange={(url) => setValue("photoUrl", url, { shouldValidate: true })}
        />
      </section>

      {serverError && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {serverError}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-6">
        <a
          href={APP_ROUTE.app.specialists.index}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
        >
          {isSubmitting ? (
            "Guardando…"
          ) : (
            <>
              <Save className="h-4 w-4" /> Guardar especialista
            </>
          )}
        </button>
      </div>
    </form>
  );
}
