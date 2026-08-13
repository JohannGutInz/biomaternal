import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { NuevoEspecialistaForm } from "@/components/specialists/NuevoEspecialistaForm";
import { getCurrentUser, listSpecialties, listConsultorios } from "@/lib/data";
import { APP_ROUTE } from "@/lib/routes";

export default async function NuevoEspecialistaPage() {
  await getCurrentUser();

  const [specialties, consultorios] = await Promise.all([listSpecialties(), listConsultorios()]);

  return (
    <div>
      <Link
        href={APP_ROUTE.app.specialists.index}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Especialistas
      </Link>

      <PageHeader
        title="Nuevo especialista"
        subtitle="Alta manual al directorio. La verificación se revisa por separado."
      />

      <div className="mt-8 max-w-2xl">
        <NuevoEspecialistaForm
          specialties={specialties}
          consultorios={consultorios
            .filter((c) => c.isActive)
            .map((c) => ({ id: c.id, name: `${c.name} · ${c.sucursal.name}` }))}
        />
      </div>
    </div>
  );
}
