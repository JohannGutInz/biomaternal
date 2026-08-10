import type { Metadata } from "next";
import { AccordionCard } from "@/components/public/AccordionCard";
import { BulletList } from "@/components/public/BulletList";
import { BrandBackground } from "@/components/public/BrandBackground";
import { BrandPageHero } from "@/components/public/BrandPageHero";
import { WhatsAppRow } from "@/components/public/WhatsAppRow";

export const metadata: Metadata = {
  title: "Cobertura - Glamour Models",
  description:
    "Ciudades y municipios donde contamos con coordinación y personal local — no subcontratamos agencias.",
};

const CIUDADES_MX = [
  "Acaponeta, Nay.", "Actopan, Hgo.", "Aguascalientes, Ags.", "Altata, Sin.", "Arteaga, Coah.",
  "Boca del Río, Ver.", "Campeche, Camp.", "Cananea, Son.", "Cancún, Q.R.", "Cd. Juárez, Chih.",
  "Cd. Madero, Tamps.", "Cd. Obregón, Son.", "Cd. Victoria, Tamps.",
  "CDMX (Zona Metropolitana del Valle de México).", "Celaya, Gto.", "Chihuahua, Chi.",
  "Chilpancingo, Gro.", "Coatzacoalcos, Ver.", "Comalcalco, Tab.", "Cortazar, Gto.",
  "Cuautla, Mor.", "Cuernavaca, Mor.", "Culiacán, Sin.", "Durango, Dgo.", "Fresnillo, Zac.",
  "García, N.L.", "Gómez Palacio, Dgo.", "Guadalajara, Jal.", "Guamúchil, Sin.", "Guasave, Sin.",
  "Guaymas, Son.", "Hermosillo, Son.", "Huatabampo, Son.", "Huatulco, Oax.", "Irapuato, Gto.",
  "Juchitán, Oax.", "León, Gto.", "Los Mochis, Sin.", "Matehuala, S.L.P.", "Mazatlán, Sin.",
  "Mérida, Yuc.", "Mexicali, B.C.", "Monclova, Coah.", "Monterrey, N.L.", "Nacajuca, Tab.",
  "Navojoa, Son.", "Nogales, Son.", "Nuevo Laredo, Tamps.", "Oaxaca, Oax.", "Orizaba, Ver.",
  "Pachuca, Hgo.", "Pánuco, Ver.", "Piedras Negras, Coah.", "Playa Del Carmen, Q.R.",
  "Puebla, Pue.", "Puerto Peñasco, Son.", "Querétaro, Qro.", "Reynosa, Tamps.",
  "Salamanca, Gto.", "Saltillo, Coah.", "San Francisco del Rincón, Gto.", "San Juan del Río, Qro.",
  "San Luis Potosí, S.L.P.", "San Luis Río Colorado, Son.", "San Miguel de Allende, Gto.",
  "Tampico, Tamps.", "Tapachula, Chis.", "Tecate, B.C.", "Temixco, Mor.", "Tepic, Nay.",
  "Tijuana, B.C.", "Toluca, Mex.", "Torreón, Coah.", "Tulancingo, Hgo.", "Uruapan, Mich.",
  "Villahermosa, Tab.", "Xalapa, Ver.", "Zacatecas, Zac.", "Zamora, Mich.",
];

const MUNICIPIOS_CO = [
  "Barbosa.", "Bello.", "Caldas.", "Copacabana.", "Envigado.", "Girardota.",
  "Itagüí.", "La Estrella.", "Medellín.", "Río Negro.", "Sabaneta.",
];

export default function CoberturaPage() {
  return (
    <div className="relative -mt-16 min-h-full bg-black pt-16">
      <BrandBackground />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <BrandPageHero
          eyebrow="Est. 2016 — México & Colombia"
          title="Cobertura"
          description="Ciudades y municipios donde contamos con coordinación y personal local — no subcontratamos agencias"
        />

        <div className="mx-auto flex w-full max-w-[420px] flex-col gap-4">
          <AccordionCard title="México">
            <p className="mb-3 text-xs tracking-[0.08em] text-white/45 uppercase sm:text-sm">
              Estas son las más de {CIUDADES_MX.length} ciudades donde tenemos coordinadores locales y personal
              local (no subcontratamos agencias):
            </p>
            <BulletList items={CIUDADES_MX} />
          </AccordionCard>
          <AccordionCard title="Colombia">
            <p className="mb-3 text-xs tracking-[0.08em] text-white/45 uppercase sm:text-sm">
              Municipios en Antioquia donde contamos con coordinación y personal local:
            </p>
            <BulletList items={MUNICIPIOS_CO} />
          </AccordionCard>
        </div>

        <WhatsAppRow />
      </div>
    </div>
  );
}
