import Link from "next/link";
import { Calendar, MapPin, ChevronRight } from "lucide-react";
import { listPublicConvocatorias } from "@/lib/public-data";
import { APP_ROUTE } from "@/lib/routes";
import { BrandBackground } from "@/components/public/BrandBackground";
import { BrandPageHero } from "@/components/public/BrandPageHero";

export default async function ConvocatoriasPublicasPage() {
  const convocatorias = await listPublicConvocatorias();

  return (
    <div className="relative -mt-16 min-h-full bg-black pt-16">
      <BrandBackground />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <BrandPageHero
          eyebrow="Talento activo"
          title="Convocatorias"
          description="Oportunidades de trabajo disponibles para talento registrado en la agencia"
        />

        {convocatorias.length === 0 ? (
          <p className="text-center text-sm text-white/55">No hay convocatorias activas en este momento. Vuelve pronto.</p>
        ) : (
          <ul className="space-y-4">
            {convocatorias.map((c) => (
              <li key={c.id}>
                <Link
                  href={APP_ROUTE.convocatorias.detail(c.id)}
                  className="group relative flex items-center gap-5 overflow-hidden rounded-xl border border-white/12 bg-black/75 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent" />
                  <div className="relative min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex rounded-full border border-white/14 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/70">
                        {c.tipo}
                      </span>
                    </div>
                    <p className="font-medium text-white group-hover:text-glam-400 truncate">{c.titulo}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-white/55">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {c.fechaEvento.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {c.ciudad}
                      </span>
                      <span className="font-medium text-white/70">{c.pago}</span>
                    </div>
                  </div>
                  <ChevronRight className="relative h-5 w-5 shrink-0 text-white/35 group-hover:text-glam-400" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
