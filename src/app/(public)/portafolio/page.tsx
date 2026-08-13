import { Sparkles } from "lucide-react";
import { listPortfolioEvents } from "@/lib/public-data";
import { formatDate } from "@/lib/utils";

export default async function PortfolioPage() {
  const events = await listPortfolioEvents();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 max-w-xl">
        <h1 className="text-3xl font-light tracking-tight text-zinc-950">Eventos y portafolio</h1>
        <p className="mt-2 text-sm text-zinc-500">Una muestra de campañas, pasarelas y producciones recientes.</p>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-zinc-400">Aún no hay trabajo publicado en el portafolio.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <div className="flex h-40 items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-brand-400">
                <Sparkles className="h-7 w-7" />
              </div>
              <div className="p-5">
                <p className="text-xs font-medium tracking-wide text-brand-700 uppercase">{event.type}</p>
                <p className="mt-1.5 text-base font-semibold text-zinc-900">{event.name}</p>
                <p className="mt-1 text-sm text-zinc-500">{event.clientName}</p>
                <p className="mt-3 text-xs text-zinc-400">
                  {event.venue} · {formatDate(event.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
