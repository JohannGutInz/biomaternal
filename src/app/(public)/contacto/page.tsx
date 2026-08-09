import { ContactForm } from "@/components/public/ContactForm";
import { BrandBackground } from "@/components/public/BrandBackground";
import { BrandPageHero } from "@/components/public/BrandPageHero";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ modelo?: string }>;
}) {
  const { modelo } = await searchParams;
  const defaultMessage = modelo ? `Hola, me interesa saber más sobre ${modelo} para un proyecto.` : undefined;

  return (
    <div className="relative -mt-16 min-h-full bg-black pt-16">
      <BrandBackground />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <BrandPageHero
          eyebrow="Hablemos"
          title="Contacto"
          description="Cuéntanos sobre tu proyecto o el talento que buscas — el equipo de booking te responde directamente."
        />
        <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-black/75 p-6 backdrop-blur-xl sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent" />
          <div className="relative">
            <ContactForm defaultMessage={defaultMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}
