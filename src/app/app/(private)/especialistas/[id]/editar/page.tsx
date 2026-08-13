import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSpecialist, listSpecialties } from "@/lib/data";
import { signPhotoUrl } from "@/lib/storage";
import { SpecialistEditForm } from "@/components/specialists/SpecialistEditForm";
import { APP_ROUTE } from "@/lib/routes";
import { formatFullName } from "@/lib/utils";

export default async function SpecialistEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [specialist, specialties] = await Promise.all([
    getSpecialist(id),
    listSpecialties(),
  ]);

  if (!specialist) notFound();

  const photoUrl = await signPhotoUrl(specialist.photoUrl);

  return (
    <div>
      <Link
        href={`${APP_ROUTE.app.specialists.index}/${specialist.id}`}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a {formatFullName(specialist)}
      </Link>

      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900">Editar especialista</h1>

      <div className="max-w-2xl">
        <SpecialistEditForm specialist={{ ...specialist, photoUrl }} specialties={specialties} />
      </div>
    </div>
  );
}
