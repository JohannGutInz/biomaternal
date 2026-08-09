import { AccordionCard } from "@/components/public/AccordionCard";
import { BrandBackground } from "@/components/public/BrandBackground";
import { BrandPageHero } from "@/components/public/BrandPageHero";
import { WhatsAppRow } from "@/components/public/WhatsAppRow";

export default function MisionVisionPage() {
  return (
    <div className="relative -mt-16 min-h-full bg-black pt-16">
      <BrandBackground />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <BrandPageHero
          eyebrow="Est. 2016 — México & Colombia"
          title={
            <>
              Filosofía,
              <br />
              misión y visión
            </>
          }
          description="Lo que somos, lo que hacemos y hacia dónde vamos"
        />

        <div className="flex flex-col gap-4">
          <AccordionCard title="Nuestra filosofía" defaultOpen>
            <div className="flex flex-col gap-3">
              <p>En Glamour Models somos obsesivos con tres cosas:</p>
              <p className="leading-loose">
                1. Cumplir lo que prometemos.
                <br />
                2. Responder rápido.
                <br />
                3. Y enviar el personal correcto.
              </p>
              <p>
                No vendemos cuentos. Seleccionamos personal serio, responsable y con excelente presencia que llegue
                a tiempo y cumpla con su trabajo. Cuando el cliente lo requiere, coordinamos que el personal llegue
                con anticipación para recibir la capacitación específica de la marca. Porque entendemos que cada
                evento es diferente.
              </p>
            </div>
          </AccordionCard>

          <AccordionCard title="Nuestra misión" defaultOpen>
            <p>
              Brindar personal de imagen profesional con excelente presencia, puntualidad y actitud, ofreciendo a
              nuestros clientes un servicio rápido, confiable y de calidad en todo México y Colombia.
            </p>
          </AccordionCard>

          <AccordionCard title="Nuestra visión" defaultOpen>
            <p>
              Convertirnos en la agencia de referencia en México y Latinoamérica, reconocida por nuestra rapidez de
              respuesta, seriedad y por entregar siempre el perfil exacto que cada cliente necesita.
            </p>
          </AccordionCard>
        </div>

        <WhatsAppRow />
      </div>
    </div>
  );
}
