import { BrandBackground } from "@/components/public/BrandBackground";
import { TalentsGrid } from "@/components/public/TalentsGrid";
import { listPublicModels, listPublicCategories, listPublicActivities, listPublicGeografia } from "@/lib/public-data";

export default async function TalentsPage() {
  const [models, categories, activities, geografia] = await Promise.all([
    listPublicModels(),
    listPublicCategories(),
    listPublicActivities(),
    listPublicGeografia(),
  ]);

  return (
    <div className="relative -mt-16 min-h-full bg-black pt-16">
      <BrandBackground />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-14 sm:py-16">
        <div className="mb-10 text-center">
          <p className="mb-3 text-[11px] font-semibold tracking-[0.32em] text-white/50 uppercase">
            México &amp; Colombia — Talento verificado
          </p>
          <h1 className="text-4xl font-light tracking-[0.06em] text-white sm:text-5xl">
            Catálogo de talento
          </h1>
          <div className="mx-auto mt-5 h-px w-12 bg-gold-500" />
          <p className="mx-auto mt-5 max-w-xl text-xs tracking-[0.08em] text-white/50 uppercase">
            Filtra por país, perfil, actividad y ubicación
          </p>
        </div>

        <TalentsGrid models={models} categories={categories} activities={activities} geografia={geografia} />
      </div>
    </div>
  );
}
