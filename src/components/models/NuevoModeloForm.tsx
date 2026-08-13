"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { crearModeloAdminAction } from "@/lib/actions";
import { nuevoModeloAdminFormSchema, type NuevoModeloAdminFormData } from "@/lib/schemas";
import { APP_ROUTE } from "@/lib/routes";
import { MediaSection } from "./MediaSection";

type Country = { id: string; name: string };
type State = { id: string; name: string; countryId: string };
type Municipality = { id: string; name: string; stateId: string };
type Category = { id: string; name: string };

interface Props {
  countries: Country[];
  states: State[];
  municipalities: Municipality[];
  categories: Category[];
}

const INPUT =
  "w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400";
const SELECT =
  "w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-brand-500 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400";

const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 border-b border-zinc-200 pb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
      {children}
    </h2>
  );
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-rose-600">{msg}</p>;
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
  );
}

export function NuevoModeloForm({ countries, states, municipalities, categories }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [categoryPickerId, setCategoryPickerId] = useState("");

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
  } = useForm<NuevoModeloAdminFormData>({
    resolver: zodResolver(nuevoModeloAdminFormSchema),
    defaultValues: {
      countryId: "",
      stateId: "",
      cityId: "",
      categoryIds: [],
      availableToTravel: false,
      hasPassport: false,
      hasVisaUS: false,
      hasVisibleTattoos: false,
    },
  });

  const selectedCountryId = watch("countryId");
  const selectedStateId = watch("stateId");
  const categoryIds = watch("categoryIds");

  const filteredStates = states.filter((s) => s.countryId === selectedCountryId);
  const filteredMunicipalities = municipalities.filter((m) => m.stateId === selectedStateId);
  const pickedCategories = categories.filter((c) => categoryIds.includes(c.id));

  async function onSubmit(data: NuevoModeloAdminFormData) {
    setServerError(null);
    const { stateId: _s, ...actionData } = data;
    const result = await crearModeloAdminAction(actionData);
    if (result.status === "error") {
      setServerError(result.message);
    } else if (result.modelId) {
      router.push(`${APP_ROUTE.app.models.index}/${result.modelId}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {/* Datos personales */}
      <section>
        <SectionTitle>Datos personales</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label required>Nombres</Label>
            <input {...register("firstName")} placeholder="Juan Pablo" className={INPUT} />
            <Err msg={errors.firstName?.message} />
          </div>
          <div />
          <div>
            <Label required>Apellido paterno</Label>
            <input {...register("lastNameP")} className={INPUT} />
            <Err msg={errors.lastNameP?.message} />
          </div>
          <div>
            <Label>Apellido materno</Label>
            <input {...register("lastNameM")} className={INPUT} />
          </div>
          <div>
            <Label>Nombre artístico</Label>
            <input {...register("artisticName")} placeholder="Nombre para catálogo" className={INPUT} />
          </div>
          <div>
            <Label>Nacionalidad</Label>
            <input {...register("nationality")} placeholder="Mexicana" className={INPUT} />
          </div>
          <div>
            <Label required>Correo electrónico</Label>
            <input type="email" {...register("email")} className={INPUT} />
            <Err msg={errors.email?.message} />
          </div>
          <div>
            <Label required>Teléfono</Label>
            <input {...register("phone")} placeholder="+52 667 000 0000" className={INPUT} />
            <Err msg={errors.phone?.message} />
          </div>
          <div>
            <Label required>Fecha de nacimiento</Label>
            <input type="date" {...register("fechaNacimiento")} max={maxFecha} className={INPUT} />
            <Err msg={errors.fechaNacimiento?.message} />
          </div>
          <div>
            <Label required>Género</Label>
            <select {...register("genre")} defaultValue="" className={SELECT}>
              <option value="" disabled>Selecciona…</option>
              <option value="FEMALE">Femenino</option>
              <option value="MALE">Masculino</option>
            </select>
            <Err msg={errors.genre?.message} />
          </div>
        </div>
      </section>

      {/* Ubicación */}
      <section>
        <SectionTitle>Ubicación</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label required>País</Label>
            <Controller
              name="countryId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setValue("stateId", "");
                    setValue("cityId", "");
                  }}
                  className={SELECT}
                >
                  <option value="" disabled>Selecciona un país…</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            />
            <Err msg={errors.countryId?.message} />
          </div>
          <div>
            <Label>Estado</Label>
            <Controller
              name="stateId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={!selectedCountryId}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setValue("cityId", "");
                  }}
                  className={SELECT}
                >
                  <option value="" disabled>
                    {selectedCountryId ? "Selecciona un estado…" : "Primero selecciona un país"}
                  </option>
                  {filteredStates.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}
            />
          </div>
          <div>
            <Label required>Ciudad / Municipio</Label>
            <select {...register("cityId")} disabled={!selectedStateId} defaultValue="" className={SELECT}>
              <option value="" disabled>
                {selectedStateId ? "Selecciona una ciudad…" : "Primero selecciona un estado"}
              </option>
              {filteredMunicipalities.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <Err msg={errors.cityId?.message} />
          </div>
        </div>
      </section>

      {/* Datos físicos */}
      <section>
        <SectionTitle>Datos físicos</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Estatura (cm)</Label>
            <input
              type="number"
              {...register("height")}
              placeholder="170"
              min={100}
              max={220}
              className={INPUT}
            />
          </div>
          <div>
            <Label>Peso (kg)</Label>
            <input
              type="number"
              {...register("weight")}
              placeholder="60"
              step="0.1"
              min={30}
              max={200}
              className={INPUT}
            />
          </div>
          <div>
            <Label>Talla de camisa</Label>
            <select {...register("shirtSize")} defaultValue="" className={SELECT}>
              <option value="">Sin especificar</option>
              {SHIRT_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Talla de pantalón</Label>
            <input {...register("pantsSize")} placeholder="28, 30, M…" className={INPUT} />
          </div>
          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                {...register("hasVisibleTattoos")}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <span className="text-sm font-medium text-zinc-700">Tiene tatuajes visibles</span>
            </label>
          </div>
        </div>
      </section>

      {/* Disponibilidad */}
      <section>
        <SectionTitle>Disponibilidad y documentos</SectionTitle>
        <div className="space-y-3">
          {(
            [
              { name: "availableToTravel", label: "Disponible para viajar" },
              { name: "hasPassport", label: "Tiene pasaporte" },
              { name: "hasVisaUS", label: "Tiene visa para Estados Unidos" },
            ] as const
          ).map(({ name, label }) => (
            <label key={name} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                {...register(name)}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <span className="text-sm font-medium text-zinc-700">{label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Categorías */}
      {categories.length > 0 && (
        <section>
          <SectionTitle>Categorías</SectionTitle>
          <div className="flex gap-2">
            <select
              value={categoryPickerId}
              onChange={(e) => setCategoryPickerId(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm outline-none focus:border-brand-500"
            >
              <option value="" disabled>Selecciona una categoría…</option>
              {categories
                .filter((c) => !categoryIds.includes(c.id))
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
            <button
              type="button"
              disabled={!categoryPickerId}
              onClick={() => {
                if (categoryPickerId) {
                  setValue("categoryIds", [...categoryIds, categoryPickerId]);
                  setCategoryPickerId("");
                }
              }}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              + Agregar
            </button>
          </div>
          {pickedCategories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {pickedCategories.map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
                >
                  {cat.name}
                  <button
                    type="button"
                    onClick={() =>
                      setValue(
                        "categoryIds",
                        categoryIds.filter((id) => id !== cat.id),
                      )
                    }
                    className="text-zinc-400 hover:text-zinc-700"
                    aria-label={`Quitar ${cat.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Multimedia */}
      <section>
        <MediaSection />
      </section>

      {serverError && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {serverError}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-6">
        <a
          href={APP_ROUTE.app.models.index}
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
              <Save className="h-4 w-4" /> Guardar modelo
            </>
          )}
        </button>
      </div>
    </form>
  );
}
