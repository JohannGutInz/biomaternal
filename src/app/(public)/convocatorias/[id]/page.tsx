import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, MapPin, MessageCircle, ChevronLeft } from "lucide-react";
import { getPublicConvocatoria } from "@/lib/public-data";
import { APP_ROUTE } from "@/lib/routes";
import { BrandBackground } from "@/components/public/BrandBackground";

export default async function ConvocatoriaPublicaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conv = await getPublicConvocatoria(id);
  if (!conv) notFound();

  const waLink = `https://wa.me/${conv.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola, me interesa la convocatoria: ${conv.titulo}`)}`;

  return (
    <div className="relative -mt-16 min-h-full bg-black pt-16">
      <BrandBackground />
      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <Link
          href={APP_ROUTE.convocatorias.index}
          className="mb-8 inline-flex items-center gap-1 text-sm text-white/55 hover:text-white/85"
        >
          <ChevronLeft className="h-4 w-4" /> Todas las convocatorias
        </Link>

        <div className="mb-2">
          <span className="inline-flex rounded-full border border-white/14 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/70">
            {conv.tipo}
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-white">{conv.titulo}</h1>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/55">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {conv.fechaEvento.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {conv.horario}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {conv.lugar}, {conv.ciudad}
          </span>
        </div>

        <div className="mt-8 space-y-6">
          <section>
            <h2 className="text-xs font-semibold tracking-wider text-white/45 uppercase">Funciones</h2>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-white/75">{conv.funciones}</p>
          </section>

          <hr className="border-white/10" />

          <section>
            <h2 className="text-xs font-semibold tracking-wider text-white/45 uppercase">Perfil requerido</h2>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-white/75">{conv.perfil}</p>
          </section>

          <hr className="border-white/10" />

          <section>
            <h2 className="text-xs font-semibold tracking-wider text-white/45 uppercase">Pago</h2>
            <p className="mt-2 text-sm font-medium text-white">{conv.pago}</p>
          </section>

          {conv.cuerpo && (
            <>
              <hr className="border-white/10" />
              <section>
                <h2 className="text-xs font-semibold tracking-wider text-white/45 uppercase">Información adicional</h2>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-white/75">{conv.cuerpo}</p>
              </section>
            </>
          )}
        </div>

        <div className="mt-10 rounded-xl border border-white/12 bg-black/75 p-5 backdrop-blur-xl">
          <p className="text-sm text-white/70">
            Si te interesa esta convocatoria, escríbenos por WhatsApp para confirmar tu participación o resolver dudas.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1ebe5d]"
          >
            <MessageCircle className="h-4 w-4" />
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
