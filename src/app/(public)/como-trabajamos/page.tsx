import type { Metadata } from "next";
import { AccordionCard } from "@/components/public/AccordionCard";
import { BrandBackground } from "@/components/public/BrandBackground";
import { BrandPageHero } from "@/components/public/BrandPageHero";
import { WhatsAppRow } from "@/components/public/WhatsAppRow";

export const metadata: Metadata = {
  title: "¿Cómo trabajamos? - Glamour Models",
  description: "Proceso claro, rápido y sin sorpresas — así aseguramos que todo salga perfecto.",
};

const PASOS = [
  {
    title: "1 — Contáctanos por WhatsApp",
    text: "Contáctanos por WhatsApp. Respuesta rápida, sin formularios eternos ni vueltas innecesarias.",
  },
  {
    title: "2 — Te realizamos algunas preguntas",
    text: "Te realizaremos algunas preguntas para conocer los detalles de tu evento: fechas, tipo y cantidad de personal que necesitas, ciudad y horarios. Con esta información te enviaremos una cotización precisa y ajustada exactamente a lo que requieres.",
  },
  {
    title: "3 — Grupo exclusivo de WhatsApp",
    text: "Crearemos un grupo de WhatsApp exclusivo para tu evento. Ahí estará coordinación, supervisión y tú. Todo en un solo lugar, comunicación directa y en tiempo real.",
  },
  {
    title: "4 — Selección de perfiles",
    text: "En el grupo nuestro equipo de coordinación te presentará entre 4 y 6 fotografías de cada opción, junto con su nombre, edad, estatura y ciudad donde radica. Solo perfiles que cumplan exactamente con tu requerimiento, disponibles y comprometidos con tu evento.",
  },
  {
    title: "5 — Video de verificación",
    text: "Una vez que selecciones a las personas que quieres contratar, te enviaremos un video fechado de cada una de ellas. En el video, la persona dirá su nombre completo, edad, estatura, mostrará sus perfiles y mencionará la fecha exacta del evento. De esta forma tendrás la certeza de que quien se presente el día del evento es exactamente la misma persona que estás contratando.",
  },
  {
    title: "6 — El día del evento",
    text: "El día del evento iniciamos monitoreo desde dos horas antes. Verificamos que las personas ya estén alistadas, en camino y que lleguen con anticipación al lugar. De esta forma, si necesitan recibir algún vestuario especial o indicaciones de último minuto, puedan hacerlo tranquilamente y comenzar las actividades de manera puntual.",
  },
];

export default function ComoTrabajamosPage() {
  return (
    <div className="relative -mt-16 min-h-full bg-black pt-16">
      <BrandBackground />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <BrandPageHero
          eyebrow="Est. 2016 — México & Colombia"
          title={
            <>
              Te explicamos
              <br />
              cómo trabajamos
            </>
          }
          description="Proceso claro, rápido y sin sorpresas — así aseguramos que todo salga perfecto"
        />

        <div className="mx-auto grid w-full max-w-[1020px] grid-cols-1 items-start gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {PASOS.map((paso, i) => (
            <AccordionCard key={paso.title} title={paso.title} tone={i < 3 ? "solid-dark" : "solid-light"}>
              <p>{paso.text}</p>
            </AccordionCard>
          ))}
        </div>

        <WhatsAppRow />
      </div>
    </div>
  );
}
