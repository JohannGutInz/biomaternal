import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
import { BrandBackground } from "@/components/public/BrandBackground";
import { PublicSpecialistCard } from "@/components/public/PublicSpecialistCard";
import { WhatsAppRow } from "@/components/public/WhatsAppRow";
import { getSiteSettings } from "@/lib/data";
import { listFeaturedSpecialists } from "@/lib/public-data";

export default async function HomePage() {
  const [config, featuredModels] = await Promise.all([
    getSiteSettings(),
    listFeaturedSpecialists(8),
  ]);

  const ctas = [
    {
      href: "/contacto",
      label: "Deseo cotizar / contratar",
      sub: "Cotiza modelos y edecanes para tu evento",
      variant: "primary" as const,
    },
    {
      href: "/talentos",
      label: "Conoce nuestro catálogo",
      sub: "Modelos y talento verificado, listo para tu marca",
      variant: "secondary" as const,
    },
    ...(config.publicRegistrationActive
      ? [
          {
            href: "/registro",
            label: "Quiero ser parte del equipo",
            sub: "Únete al roster de modelos y edecanes",
            variant: "primary" as const,
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
            className="-mt-[25px] mb-0 h-[170px] w-[170px] object-contain drop-shadow-[0_0_22px_rgba(23,172,227,0.5)] transition-transform duration-300 ease-out hover:scale-110 sm:h-[240px] sm:w-[240px]"
          />

          <p className="mb-3 text-xs font-semibold tracking-[0.34em] text-white/65 uppercase">
            EST. 2016
          </p>

          <h1 className="text-5xl leading-none font-light tracking-[0.14em] text-white uppercase sm:text-7xl">
            {config.agencyName}
          </h1>

          {config.heroSubtitle && (
            <p className="mt-2 text-xs font-semibold tracking-[0.3em] text-white/55 uppercase sm:text-sm">
              {config.heroSubtitle}
            </p>
          )}

          <div className="mx-auto mt-4 h-px w-14 bg-brand-500 shadow-[0_0_18px_rgba(23,172,227,0.6)]" />

          {config.heroTitle && (
            <p className="mt-4 max-w-2xl text-3xl leading-snug font-light text-white sm:text-4xl">
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
                    ? "border-brand-400 bg-gradient-to-br from-brand-500/45 via-brand-600/25 to-black/50 shadow-[0_0_36px_rgba(23,172,227,0.4)] hover:shadow-[0_0_48px_rgba(23,172,227,0.55)]"
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

          <p className="mt-10 max-w-2xl rounded-2xl border border-brand-500/50 bg-black/60 px-7 py-4 text-base leading-relaxed text-white shadow-[0_0_32px_rgba(23,172,227,0.3)] backdrop-blur-md sm:text-lg">
            Cubrimos más de <span className="font-bold text-brand-400">75 ciudades</span> en la República Mexicana y
            todo el Valle de Aburrá en Antioquia, Colombia.
          </p>
        </div>

        {/* Scroll arrow */}
        <a
          href="#whatsapp"
          className="absolute bottom-8 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-brand-400 hover:text-brand-400"
        >
          <ArrowDown className="h-5 w-5" />
        </a>
      </section>

      {/* ── WhatsApp, pegado al final antes del footer ── */}
      <div id="whatsapp" className="relative z-10 scroll-mt-16 px-6 pb-14">
        <WhatsAppRow />
      </div>

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
                className="inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide text-brand-400 uppercase transition-colors hover:text-brand-300"
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
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(23,172,227,0.18) 0%, transparent 65%)" }}
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
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-500 px-7 py-3 text-sm font-semibold tracking-wide text-white uppercase transition-colors hover:bg-brand-600"
          >
            Contactar a la agencia <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section> */}
    </div>
  );
}
