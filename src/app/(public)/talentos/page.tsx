import { BrandBackground } from "@/components/public/BrandBackground";
import { PublicSpecialistsGrid } from "@/components/public/PublicSpecialistsGrid";
import { listPublicSpecialists, listPublicSpecialties } from "@/lib/public-data";

export default async function TalentsPage() {
  const [specialists, specialties] = await Promise.all([
    listPublicSpecialists(),
    listPublicSpecialties(),
  ]);

  return (
    <div className="relative -mt-16 min-h-full bg-black pt-16">
      <BrandBackground />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-14 sm:py-16">
        <div className="mb-10 text-center">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.32em] text-white/50 uppercase">
            Especialistas verificados
          </p>
          <h1 className="text-4xl font-light tracking-[0.06em] text-white sm:text-5xl">
            Directorio de especialistas
          </h1>
          <div className="mx-auto mt-5 h-px w-12 bg-brand-500" />
          <p className="mx-auto mt-5 max-w-xl text-xs tracking-[0.08em] text-white/50 uppercase">
            Filtra por especialidad y género
          </p>
        </div>

        <PublicSpecialistsGrid specialists={specialists} specialties={specialties} />
      </div>
    </div>
  );
}
