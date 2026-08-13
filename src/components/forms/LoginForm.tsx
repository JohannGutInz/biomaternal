"use client";

import { loginAction } from "@/lib/actions";
import { loginSchema, type LoginData } from "@/lib/schemas";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginData) {
    setServerError(null);
    const result = await loginAction(data);
    if (result.status === "error") setServerError(result.message);
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[55%] flex-col justify-between overflow-hidden bg-zinc-950 px-16 py-14 text-white lg:flex">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative text-2xl font-semibold tracking-tight">
          Bio<span className="text-brand-400">maternal</span>
        </div>
        <div className="relative max-w-md">
          <p className="text-3xl leading-tight font-light text-zinc-100">
            La plataforma que ordena consultorios, especialistas y cobros de tus clínicas
            <span className="text-brand-400">.</span>
          </p>
          <p className="mt-6 text-sm text-zinc-500">
            Backoffice interno — acceso restringido al staff de la clínica.
          </p>
        </div>
        <p className="relative text-xs text-zinc-600">© {new Date().getFullYear()} Biomaternal. Todos los derechos reservados.</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <span className="text-2xl font-semibold tracking-tight text-zinc-950">
              Bio<span className="text-brand-500">maternal</span>
            </span>
          </div>

          <h1 className="text-xl font-semibold text-zinc-900">Inicia sesión</h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Ingresa el correo y la contraseña de un usuario registrado.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <Input
              id="email"
              label="Correo"
              icon={<Mail />}
              {...register("email")}
              type="email"
              placeholder="tu@agencia.com"
              error={errors.email?.message}
            />

            <Input
              id="password"
              label="Contraseña"
              icon={<Lock />}
              {...register("password")}
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
            />

            {serverError && <p className="text-sm text-rose-600">{serverError}</p>}

            <div className="flex items-center justify-between pt-1 text-sm">
              <Checkbox defaultChecked label="Recordarme" />
              <a href="#" className="font-medium text-zinc-500 hover:text-brand-600">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
              {isSubmitting ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-zinc-400">
            Acceso exclusivo para staff autorizado de la agencia.
          </p>
        </div>
      </div>
    </div>
  );
}
