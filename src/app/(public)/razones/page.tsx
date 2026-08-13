import type { Metadata } from "next";
import { AccordionCard } from "@/components/public/AccordionCard";
import { BrandBackground } from "@/components/public/BrandBackground";
import { BrandPageHero } from "@/components/public/BrandPageHero";
import { WhatsAppRow } from "@/components/public/WhatsAppRow";

export const metadata: Metadata = {
  title: "¿Por qué elegir a Glamour Models? - Glamour Models",
  description: "4 razones claras + garantía real. Sin letras chiquitas.",
};

const RAZONES = [
  {
    title: "1 — Atención inmediata 24/7",
    text: "Respondemos rápido, sin importar el día ni la hora. Cuando nos necesitas, ahí estamos. Sin burocracia, sin esperas eternas.",
  },
  {
    title: "2 — Cotizaciones en minutos",
    text: "En promedio te entregamos tu cotización en menos de 30 minutos. Precios claros, desglosados y ajustados exactamente a lo que requieres.",
  },
  {
    title: "3 — Precios altamente competitivos",
    text: "La mejor relación calidad-precio del mercado. Personal profesional, puntual y con excelente presencia, sin pagar de más.",
  },
  {
    title: "4 — Garantía real de satisfacción",
    text: "Cumplimos con los objetivos de tu evento o ajustamos lo necesario. No te dejamos a medias. Si algo no sale como acordamos, lo corregimos.",
  },
];

export default function RazonesPage() {
  return (
    <div className="relative -mt-16 min-h-full bg-black pt-16">
      <BrandBackground />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <BrandPageHero
          eyebrow="Est. 2016 — México & Colombia"
          title={
            <>
              ¿Por qué elegir
              <br />a Glamour Models?
            </>
          }
          description="4 razones claras + garantía real. Sin letras chiquitas"
        />

        <div className="mx-auto grid w-full max-w-[860px] grid-cols-1 items-start gap-[18px] sm:grid-cols-2">
          {RAZONES.map((razon, i) => (
            <AccordionCard key={razon.title} title={razon.title} tone={i < 2 ? "solid-dark" : "solid-light"}>
              <p>{razon.text}</p>
            </AccordionCard>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center gap-4 text-center">
          <p className="text-[42px] leading-[0.9] font-light tracking-[0.14em] text-white uppercase [text-shadow:0_0_40px_rgba(23,172,227,0.5)] sm:text-6xl">
            ¡Garantizado!
          </p>
          <div className="h-px w-12 bg-brand-500 shadow-[0_0_18px_rgba(23,172,227,0.5)]" />
          <p className="max-w-lg text-sm leading-relaxed tracking-[0.1em] text-white/60 uppercase sm:text-base">
            Tu evento en manos profesionales. Respuesta rápida, perfiles verificados y coordinación real el día del
            evento.
          </p>
        </div>

        <WhatsAppRow />
      </div>
    </div>
  );
}
