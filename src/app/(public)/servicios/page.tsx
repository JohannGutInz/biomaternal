import { AccordionCard } from "@/components/public/AccordionCard";
import { BulletList } from "@/components/public/BulletList";
import { BrandBackground } from "@/components/public/BrandBackground";
import { BrandPageHero } from "@/components/public/BrandPageHero";
import { WhatsAppRow } from "@/components/public/WhatsAppRow";

const SERVICIOS_MX = [
  "G.O´s A, AA, AAA y AAA+.",
  "Edecanes A, AA, AA+ y AAA.",
  "Hostess y anfitriones(as).",
  "Promotores(as), demostradores(as), demoedecanes, demovendedoras, promoedecanes.",
  "Supervisores con o sin vehículo.",
  "Coordinación de proyectos y activaciones.",
  "Conductores de eventos, maestros de ceremonias, animadores.",
  "Staffs y runners.",
  "Modelos comerciales, videos, pasarelas y fotografía.",
  "Extras (figurantes) para cine, series y telenovelas.",
  "Dirección de casting.",
];

const SERVICIOS_CO = [
  "Modelos de Protocolo (Hombres y Mujeres).",
  "Hostess y anfitriones(as).",
  "Promotores(as), demostradores(as), demovendedoras.",
  "Supervisores con o sin vehículo.",
  "Coordinación de proyectos y activaciones.",
  "Conductores de eventos, maestros de ceremonias, animadores.",
  "Staffs.",
  "Runners.",
  "Modelos de todas las edades y estaturas para videos, comerciales, pasarelas y fotografía fija.",
  "Extras (figurantes) para series, telenovelas, películas.",
  "Dirección de casting.",
];

export default function ServiciosPage() {
  return (
    <div className="relative -mt-16 min-h-full bg-black pt-16">
      <BrandBackground />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <BrandPageHero
          eyebrow="Est. 2016 — México & Colombia"
          title="Servicios"
          description="Selecciona tu país para ver el catálogo completo de servicios que ofrecemos"
        />

        <div className="flex flex-col gap-4">
          <AccordionCard title="México" defaultOpen>
            <BulletList items={SERVICIOS_MX} />
          </AccordionCard>
          <AccordionCard title="Colombia" defaultOpen>
            <BulletList items={SERVICIOS_CO} />
          </AccordionCard>
        </div>

        <WhatsAppRow />
      </div>
    </div>
  );
}
