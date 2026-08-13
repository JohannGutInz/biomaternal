import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { SpecialistsGrid } from "@/components/specialists/SpecialistsGrid";
import { listSpecialists } from "@/lib/data";
import { signPhotoUrl } from "@/lib/storage";
import { APP_ROUTE } from "@/lib/routes";

export default async function SpecialistsPage() {
  const rawSpecialists = await listSpecialists();
  const specialists = await Promise.all(
    rawSpecialists.map(async (s) => ({ ...s, photoUrl: await signPhotoUrl(s.photoUrl) })),
  );

  return (
    <div>
      <PageHeader
        title="Especialistas"
        subtitle="Alta interna y aprobados desde registro."
        actions={
          <LinkButton href={APP_ROUTE.app.specialists.new}>
            <Plus className="h-4 w-4" /> Nuevo especialista
          </LinkButton>
        }
      />
      <SpecialistsGrid specialists={specialists} />
    </div>
  );
}
