import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight, MapPin, Phone } from "lucide-react";
import { BrandBackground } from "@/components/public/BrandBackground";
import { PublicSpecialistCard } from "@/components/public/PublicSpecialistCard";
import { WhatsAppRow } from "@/components/public/WhatsAppRow";
import { getSiteSettings } from "@/lib/data";
import { listFeaturedSpecialists, listPublicSucursales, listPublicSpecialties } from "@/lib/public-data";

export default async function HomePage() {
  const [config, featuredSpecialists, sucursales, specialties] = await Promise.all([
    getSiteSettings(),
    listFeaturedSpecialists(8),
    listPublicSucursales(),
    listPublicSpecialties(),
  ]);

  const ctas = [
    {
      href: "/contacto",
      label: "Agendar una cita",
      sub: "Contáctanos y te ayudamos a encontrar al especialista ideal",
      variant: "primary" as const,
    },
    {
      href: "/talentos",
      label: "Conoce a nuestros especialistas",
      sub: "Directorio verificado por especialidad",
      variant: "secondary" as const,
    },
    ...(config.publicRegistrationActive
      ? [
          {
            href: "/registro",
            label: "Soy especialista, quiero unirme",
            sub: "Registra tu perfil profesional",
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

        <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center">
          <Image
            src="/img/logo.png"
            alt={config.agencyName}
            width={260}
            height={260}
            priority
            className="-mt-[25px] mb-0 h-[170px] w-[170px] object-contain drop-shadow-[0_0_22px_rgba(23,172,227,0.5)] transition-transform duration-300 ease-out hover:scale-110 sm:h-[240px] sm:w-[240px]"
          />

          <h1 className="mt-4 text-5xl leading-none font-light tracking-[0.14em] text-white uppercase sm:text-7xl">
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
              {config.heroTitle}
            </p>
          )}

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
        </div>

        <a
          href="#sucursales"
          className="absolute bottom-8 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-brand-400 hover:text-brand-400"
        >
          <ArrowDown className="h-5 w-5" />
        </a>
      </section>

      {/* ── Especialidades ── */}
      {specialties.length > 0 && (
        <section className="relative z-10 border-t border-white/5 px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <p className="mb-2 text-center text-[11px] font-semibold tracking-[0.32em] text-white/50 uppercase">
              Áreas de atención
            </p>
            <h2 className="mb-10 text-center text-3xl font-light tracking-tight text-white">Especialidades</h2>
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
              {specialties.map((sp) => (
                <div
                  key={sp.id}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm font-medium text-white/85 transition-colors hover:border-brand-500/40 hover:bg-brand-500/10"
                >
                  {sp.name}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Sucursales ── */}
      {sucursales.length > 0 && (
        <section id="sucursales" className="relative z-10 scroll-mt-16 border-t border-white/5 px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <p className="mb-2 text-center text-[11px] font-semibold tracking-[0.32em] text-white/50 uppercase">
              Dónde estamos
            </p>
            <h2 className="mb-10 text-center text-3xl font-light tracking-tight text-white">Sucursales</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {sucursales.map((s) => (
                <div key={s.id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-white">{s.name}</h3>
                  <p className="mt-2 flex items-start gap-2 text-sm text-white/60">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" /> {s.address}
                  </p>
                  {s.phone && (
                    <p className="mt-1.5 flex items-center gap-2 text-sm text-white/60">
                      <Phone className="h-4 w-4 shrink-0 text-brand-400" /> {s.phone}
                    </p>
                  )}
                  <p className="mt-3 text-xs tracking-wide text-white/40 uppercase">
                    {s.openTime} – {s.closeTime}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Especialistas destacados ── */}
      {featuredSpecialists.length > 0 && (
        <section className="relative z-10 border-t border-white/5 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-[11px] font-semibold tracking-[0.32em] text-white/50 uppercase">
                  Directorio
                </p>
                <h2 className="text-3xl font-light tracking-tight text-white">Especialistas destacados</h2>
              </div>
              <Link
                href="/talentos"
                className="inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide text-brand-400 uppercase transition-colors hover:text-brand-300"
              >
                Ver directorio completo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
              {featuredSpecialists.map((specialist) => (
                <PublicSpecialistCard key={specialist.id} specialist={specialist} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── WhatsApp ── */}
      <div className="relative z-10 px-6 pb-14">
        <WhatsAppRow />
      </div>
    </div>
  );
}
