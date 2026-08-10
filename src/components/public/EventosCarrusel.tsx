import Image from "next/image";
import type { EventoDestacado } from "@/lib/public-data";

const FADE_MASK =
  "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)";

export function EventosCarrusel({
  eventos,
  agencyName,
}: {
  eventos: EventoDestacado[];
  agencyName: string;
}) {
  const items = [...eventos, ...eventos];

  return (
    <section className="relative z-10 py-4">
      <div className="mx-auto mb-10 max-w-6xl px-6 text-center">
        <h2 className="text-2xl font-light tracking-tight text-white sm:text-3xl">
          Algunos de nuestros eventos
        </h2>
      </div>

      <div
        className="relative w-full overflow-hidden py-2"
        style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
      >
        <div className="flex w-max animate-[marquee-half_70s_linear_infinite] items-stretch gap-4 motion-reduce:animate-none">
          {items.map((evento, i) => (
            <div
              key={`${evento.id}-${i}`}
              className="group relative h-[300px] w-[220px] shrink-0 overflow-hidden rounded-2xl border border-white/12 bg-zinc-900 shadow-lg shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:border-glam-500/55 sm:h-[360px] sm:w-[260px]"
            >
              <Image
                src={evento.imageUrl}
                alt={evento.alt || `Evento realizado por ${agencyName}`}
                fill
                sizes="(max-width: 640px) 220px, 260px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
