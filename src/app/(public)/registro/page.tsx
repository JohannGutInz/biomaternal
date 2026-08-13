import { RegistrationForm } from "@/components/public/RegistrationForm";
import { BrandBackground } from "@/components/public/BrandBackground";
import { getSiteSettings } from "@/lib/data";
import { listPublicSpecialties } from "@/lib/public-data";
import { toDateKey } from "@/lib/utils";

export default async function RegistrationPage() {
  const [config, specialties] = await Promise.all([
    getSiteSettings(),
    listPublicSpecialties(),
  ]);

  return (
    <div className="relative -mt-16 min-h-full bg-black pt-16">
      <BrandBackground />
      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <div className="mb-10 text-center">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.32em] text-white/50 uppercase">
            Únete al equipo
          </p>
          <h1 className="text-4xl font-light tracking-[0.06em] text-white sm:text-5xl">{config.agencyName}</h1>
          <div className="mx-auto mt-5 h-px w-12 bg-brand-500" />
          <p className="mx-auto mt-5 max-w-xl text-sm text-white/60">
            Completa tus datos. Nuestro equipo revisará tu información y te contactará por correo.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-[20px] border border-white/14 bg-black/82 p-6 backdrop-blur-xl sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent" />
          <div className="relative">
            <RegistrationForm maxDate={toDateKey(new Date())} specialties={specialties} />
          </div>
        </div>
      </div>
    </div>
  );
}
