import { COLOMBIA_MAP, MEXICO_MAP, type CountryMap } from "@/lib/geo-map";

function MiniMap({ country, maxWidth }: { country: CountryMap; maxWidth: string }) {
  return (
    <svg
      viewBox={`0 0 ${country.width} ${country.height}`}
      className="h-auto w-full"
      style={{ maxWidth }}
      role="img"
      aria-label="Mapa de presencia"
    >
      {country.states.map((state) => (
        <path
          key={state.name}
          d={state.d}
          strokeWidth={1}
          className={state.present ? "fill-brand-500 stroke-zinc-950" : "fill-zinc-800 stroke-zinc-700"}
        >
          <title>{state.present ? `${state.name}: ${state.cities.join(", ")}` : state.name}</title>
        </path>
      ))}
    </svg>
  );
}

export function PresenceSection() {
  return (
    <section className="border-t border-white/10 bg-zinc-950 text-zinc-300">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-white">
          Contamos con presencia en
        </h2>

        <div className="mt-12 grid grid-cols-1 items-center gap-10 sm:grid-cols-3">
          <div className="flex flex-col items-center sm:col-span-2">
            <MiniMap country={MEXICO_MAP} maxWidth="520px" />
            <p className="mt-4 text-sm font-medium text-white">🇲🇽 México</p>
          </div>
          <div className="flex flex-col items-center sm:col-span-1">
            <MiniMap country={COLOMBIA_MAP} maxWidth="220px" />
            <p className="mt-4 text-sm font-medium text-white">
              🇨🇴 Colombia <span className="text-zinc-500">— Valle de Aburrá, Antioquia</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
