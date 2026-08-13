"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitRegistrationAction } from "@/lib/actions";
import { registrationFormSchema, type RegistrationFormData } from "@/lib/schemas";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { MultiSelectPicker } from "@/components/ui/MultiSelectPicker";
import { SpecialistPhotoUpload, type SpecialistPhotoUploadHandle } from "@/components/specialists/SpecialistPhotoUpload";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type Specialty = { id: string; name: string };

interface Props {
  maxDate: string;
  specialties: Specialty[];
}

// Shared field theme — the ui/ primitives are light by default (also used by
// the admin backoffice), so instead of editing them we override per-instance
// with Tailwind's `!important` modifier (cn() here is plain clsx, no
// tailwind-merge, so a plain override class wouldn't reliably win).
const fieldCls =
  "!border-white/14 !bg-white/6 !text-white placeholder:!text-white/30 focus:!border-brand-500 focus:!ring-brand-500";
const labelCls = "!text-[10.5px] !font-bold !tracking-[0.16em] !text-white/55 !uppercase";

function generateCaptcha() {
  return { a: 1 + Math.floor(Math.random() * 8), b: 1 + Math.floor(Math.random() * 8) };
}

export function RegistrationForm({ maxDate, specialties }: Props) {
  const [success, setSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState<{ a: number; b: number } | null>(null);
  const photoRef = useRef<SpecialistPhotoUploadHandle>(null);

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      specialtyIds: [],
      password: "",
    },
  });

  const specialtyIds = watch("specialtyIds");
  const photoUrl = watch("photoUrl");

  async function onSubmit(data: RegistrationFormData) {
    setServerError(null);
    if (!captcha) return;
    if (data.captchaAnswer !== captcha.a + captcha.b) {
      setServerError("La respuesta de verificación no es correcta. Intenta de nuevo.");
      return;
    }

    let resolvedPhotoUrl = data.photoUrl;
    try {
      resolvedPhotoUrl = await photoRef.current?.resolvePending(data.photoUrl);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Error al subir la foto.");
      return;
    }

    const result = await submitRegistrationAction({ ...data, photoUrl: resolvedPhotoUrl });
    if (result.status === "error") setServerError(result.message);
    else setSuccess(result.message);
  }

  if (success) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-300">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <p>{success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section>
        <SectionTitle>Datos personales</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Nombre(s)" labelClassName={labelCls} className={fieldCls} {...register("firstName")} error={errors.firstName?.message} />

          <Input
            label="Apellido paterno"
            labelClassName={labelCls}
            className={fieldCls}
            {...register("paternalLastName")}
            error={errors.paternalLastName?.message}
          />

          <div className="sm:col-span-2">
            <Input
              label="Apellido materno (opcional)"
              labelClassName={labelCls}
              className={fieldCls}
              {...register("maternalLastName")}
              error={errors.maternalLastName?.message}
            />
          </div>

          <Input label="Correo" type="email" labelClassName={labelCls} className={fieldCls} {...register("email")} error={errors.email?.message} />

          <Input label="Teléfono" labelClassName={labelCls} className={fieldCls} {...register("phone")} error={errors.phone?.message} />

          <div>
            <Input
              label="Contraseña"
              type="password"
              labelClassName={labelCls}
              className={fieldCls}
              {...register("password")}
              error={errors.password?.message}
            />
            <p className="mt-1 text-xs text-white/40">Úsala para acceder a tu perfil más adelante.</p>
          </div>

          <div>
            <Input
              label="Fecha de nacimiento"
              type="date"
              labelClassName={labelCls}
              className={fieldCls}
              {...register("birthDate")}
              max={maxDate}
              error={errors.birthDate?.message}
            />
            <p className="mt-1 text-xs text-white/40">Solo aceptamos mayores de edad.</p>
          </div>

          <Select
            label="Género"
            labelClassName={labelCls}
            className={fieldCls}
            {...register("gender")}
            defaultValue=""
            placeholder="Selecciona…"
            error={errors.gender?.message}
          >
            <option value="FEMALE">Femenino</option>
            <option value="MALE">Masculino</option>
          </Select>

          <Input label="Ciudad / ubicación" labelClassName={labelCls} className={fieldCls} {...register("location")} error={errors.location?.message} />
        </div>
      </section>

      <section>
        <SectionTitle>Perfil profesional</SectionTitle>
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Cédula profesional (opcional)"
            labelClassName={labelCls}
            className={fieldCls}
            {...register("licenseNumber")}
            error={errors.licenseNumber?.message}
          />
          <Textarea
            label="Biografía (opcional)"
            labelClassName={labelCls}
            className={fieldCls}
            rows={4}
            {...register("bio")}
            error={errors.bio?.message}
          />

          {specialties.length > 0 && (
            <div className="rounded-2xl border border-white/90 bg-white p-4">
              <Controller
                name="specialtyIds"
                control={control}
                render={() => (
                  <MultiSelectPicker
                    label="Especialidades"
                    hint="(mínimo 1 — puedes elegir varias)"
                    options={specialties}
                    selectedIds={specialtyIds}
                    onChange={(ids) => setValue("specialtyIds", ids, { shouldValidate: true })}
                    error={errors.specialtyIds?.message}
                    placeholder="Buscar especialidad…"
                  />
                )}
              />
            </div>
          )}
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

      {/* Captcha */}
      <div className="rounded-lg border border-white/14 bg-white/6 p-4">
        {captcha ? (
          <Input
            type="number"
            label={`Verificación: ¿cuánto es ${captcha.a} + ${captcha.b}?`}
            labelClassName={labelCls}
            className={`w-32 py-2 ${fieldCls}`}
            {...register("captchaAnswer", { valueAsNumber: true })}
            error={errors.captchaAnswer?.message}
          />
        ) : (
          <p className="text-sm text-white/40">Cargando verificación…</p>
        )}
      </div>

      {serverError && <p className="text-sm text-rose-400">{serverError}</p>}

      <Button
        type="submit"
        disabled={isSubmitting || !captcha}
        className="!w-full min-h-[48px] !rounded-full !bg-brand-500 px-5 hover:!bg-brand-600 sm:!w-auto"
      >
        {isSubmitting ? "Enviando…" : "Enviar registro"} <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 border-b border-white/15 pb-2 text-xs font-semibold tracking-widest text-white/50 uppercase">
      {children}
    </h2>
  );
}
