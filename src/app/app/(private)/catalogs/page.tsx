import { PageHeader } from "@/components/ui/PageHeader";
import { CatalogForm } from "@/components/catalogs/CatalogForm";
import { CatalogList } from "@/components/catalogs/CatalogList";
import { listSpecialties } from "@/lib/data";
import { createSpecialtyAction, toggleSpecialtyEnabledAction } from "@/lib/actions";

export default async function CatalogsPage() {
  const specialties = await listSpecialties();

  return (
    <div>
      <PageHeader
        title="Catálogos"
        subtitle="Administra las especialidades disponibles para los especialistas."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CatalogForm
          title="Nueva especialidad"
          subtitle="Agrega una especialidad disponible para los especialistas."
          action={createSpecialtyAction}
          placeholder="Ej. Nutrición, Pediatría, Psicología…"
        />
        <CatalogList title="Especialidades registradas" items={specialties} onToggle={toggleSpecialtyEnabledAction} />
      </div>
    </div>
  );
}
