import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
import { BrandBackground } from "@/components/public/BrandBackground";
import { ClientesCarrusel } from "@/components/public/ClientesCarrusel";
import { EventosCarrusel } from "@/components/public/EventosCarrusel";
import { TalentCard } from "@/components/public/TalentCard";
import { getSiteSettings } from "@/lib/data";
import { listEventosDestacados, listFeaturedModels } from "@/lib/public-data";

export default async function HomePage() {
  const [config, featuredModels, eventos] = await Promise.all([
    getSiteSettings(),
    listFeaturedModels(8),
    listEventosDestacados(),
  ]);

  const ctas = [
    {
      href: "/contacto",
      label: "Deseo cotizar / contratar",
      sub: "Cotiza modelos y edecanes para tu evento",
      variant: "secondary" as const,
    },
    {
      href: "/talentos",
      label: "Conoce nuestro catálogo",
      sub: "Modelos y talento verificado, listo para tu marca",
      variant: "primary" as const,
    },
    ...(config.publicRegistrationActive
      ? [
          {
            href: "/registro",
            label: "Quiero ser parte del equipo",
            sub: "Únete al roster de modelos y edecanes",
            variant: "secondary" as const,
          },
        ]
      : []),
  ];

  const ctaGridColsClass = ctas.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";

  return (
    <div className="relative -mt-16 bg-black pt-16">
      <BrandBackground />

      {/* ── Hero ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24">
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />

        {/* Contenido */}
        <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center">
          <Image
            src="/img/logo.png"
            alt={config.agencyName}
            width={260}
            height={260}
            priority
            className="mb-5 h-[170px] w-[170px] object-contain drop-shadow-[0_0_22px_rgba(186,27,93,0.5)] transition-transform duration-300 ease-out hover:scale-110 sm:h-[240px] sm:w-[240px]"
          />

          <p className="mb-5 text-xs font-semibold tracking-[0.34em] text-white/65 uppercase">
            EST. 2016
          </p>

          <h1 className="text-5xl leading-none font-light tracking-[0.14em] text-white uppercase sm:text-7xl">
            {config.agencyName}
          </h1>

          {config.heroSubtitle && (
            <p className="mt-5 text-xs font-semibold tracking-[0.3em] text-white/55 uppercase sm:text-sm">
              {config.heroSubtitle}
            </p>
          )}

          <div className="mx-auto mt-8 h-px w-14 bg-gold-500 shadow-[0_0_18px_rgba(186,27,93,0.6)]" />

          {config.heroTitle && (
            <p className="mt-8 max-w-2xl text-3xl leading-snug font-light text-white sm:text-4xl">
              &ldquo;{config.heroTitle}&rdquo;
            </p>
          )}

          {/* CTAs */}
          <div className={`mt-14 grid w-full gap-4 ${ctaGridColsClass}`}>
            {ctas.map((cta) => (
              <Link
                key={cta.href}
                href={cta.href}
                className={`group relative flex flex-col items-center justify-center gap-2 rounded-2xl border px-7 py-9 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${
                  cta.variant === "primary"
                    ? "border-gold-400 bg-gradient-to-br from-gold-500/45 via-gold-600/25 to-black/50 shadow-[0_0_36px_rgba(186,27,93,0.4)] hover:shadow-[0_0_48px_rgba(186,27,93,0.55)]"
                    : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                <span className="absolute top-3.5 right-3.5 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-xs text-white/70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
                <span className="text-sm font-bold tracking-[0.12em] text-white uppercase sm:text-base">
                  {cta.label}
                </span>
                <span className="text-sm text-white/65">{cta.sub}</span>
              </Link>
            ))}
          </div>

          <p className="mt-10 max-w-2xl rounded-2xl border border-gold-500/50 bg-black/60 px-7 py-4 text-base leading-relaxed text-white shadow-[0_0_32px_rgba(186,27,93,0.3)] backdrop-blur-md sm:text-lg">
            Cubrimos más de <span className="font-bold text-gold-400">75 ciudades</span> en la República Mexicana y
            todo el Valle de Aburrá en Antioquia, Colombia.
          </p>
        </div>

        {/* Scroll arrow */}
        <a
          href="#clientes"
          className="absolute bottom-8 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-gold-400 hover:text-gold-400"
        >
          <ArrowDown className="h-5 w-5" />
        </a>
      </section>

      {/* ── Clientes ── */}
      <div id="clientes" className="relative z-10 scroll-mt-16">
        <ClientesCarrusel />
      </div>

      {/* ── Eventos ── */}
      {eventos.length > 0 && <EventosCarrusel eventos={eventos} agencyName={config.agencyName} />}

      {/* ── Talento destacado ── */}
      {/* {featuredModels.length > 0 && (
        <section className="relative z-10 border-t border-white/5 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-[11px] font-semibold tracking-[0.32em] text-white/50 uppercase">
                  Roster
                </p>
                <h2 className="text-3xl font-light tracking-tight text-white">Talento destacado</h2>
              </div>
              <Link
                href="/talentos"
                className="inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide text-gold-400 uppercase transition-colors hover:text-gold-300"
              >
                Ver catálogo completo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
              {featuredModels.map((model) => (
                <TalentCard key={model.id} model={model} />
              ))}
            </div>
          </div>
        </section>
      )} */}

      {/* ── CTA de cierre ── */}
      {/* <section className="relative z-10 overflow-hidden border-t border-white/5 px-6 py-20 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(186,27,93,0.18) 0%, transparent 65%)" }}
        />
        <div className="relative mx-auto max-w-xl">
          <h2 className="text-2xl font-light tracking-tight text-white sm:text-3xl">
            ¿Listo para tu próximo evento?
          </h2>
          <p className="mt-3 text-sm text-white/55">
            Cuéntanos qué necesitas y el equipo de booking te responde directamente.
          </p>
          <Link
            href="/contacto"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3 text-sm font-semibold tracking-wide text-white uppercase transition-colors hover:bg-gold-600"
          >
            Contactar a la agencia <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section> */}
    </div>
  );
}
