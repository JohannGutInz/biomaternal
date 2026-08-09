"use client";

const CLIENTES = [
  "Prada", "Nissan", "Armani", "Liverpool", "Nike",
  "Samsung", "Corona", "BBVA", "Telcel", "Cinépolis",
  "Bimbo", "Coca-Cola", "Elektra", "Palacio de Hierro", "Heineken",
];

const FADE_MASK =
  "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)";

export function ClientesCarrusel() {
  const items = [...CLIENTES, ...CLIENTES];

  return (
    <section className="py-20">
      <div className="mx-auto mb-10 max-w-6xl px-6 text-center">
        <h2 className="text-2xl font-light tracking-tight text-white sm:text-3xl">
         Clientes
        </h2>
      </div>

      <div
        className="relative w-full overflow-hidden py-2"
        style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
      >
        <div className="flex w-max animate-[marquee-half_38s_linear_infinite] items-center gap-16 motion-reduce:animate-none">
          {items.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="inline-flex shrink-0 items-center text-2xl font-bold tracking-[0.08em] text-white/55 uppercase transition-colors select-none hover:text-white sm:text-4xl"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
