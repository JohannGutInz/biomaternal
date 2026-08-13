import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { getPublicSpecialist } from "@/lib/public-data";
import { Avatar } from "@/components/ui/Avatar";
import { BrandBackground } from "@/components/public/BrandBackground";
import { formatFullName } from "@/lib/utils";

const GENRE_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
};

export default async function SpecialistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const specialist = await getPublicSpecialist(id);

  if (!specialist) notFound();

  const name = formatFullName(specialist);

  return (
    <div className="relative -mt-16 min-h-full bg-black pt-16">
      <BrandBackground />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-14">
        <Link
          href="/talentos"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al directorio
        </Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black shadow-xl">
              {specialist.photoUrl ? (
                <Image src={specialist.photoUrl} alt={name} fill className="object-cover" unoptimized priority />
              ) : (
                <Avatar name={name} size="xl" />
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {specialist.specialties.length > 0 && (
              <p className="text-xs font-semibold tracking-[0.2em] text-brand-400 uppercase">
                {specialist.specialties.join(" · ")}
              </p>
            )}
            <h1 className="mt-2 text-3xl font-light tracking-tight text-white break-words sm:text-4xl">{name}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-2.5 text-sm text-white/50">
              <span>{GENRE_LABEL[specialist.genre] ?? specialist.genre}</span>
              <span className="text-white/20">·</span>
              <span>{specialist.age} años</span>
              {specialist.location && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {specialist.location}
                  </span>
                </>
              )}
              {specialist.licenseNumber && (
                <>
                  <span className="text-white/20">·</span>
                  <span>Cédula {specialist.licenseNumber}</span>
                </>
              )}
            </div>

            {specialist.bio && (
              <p className="mt-6 max-w-2xl border-t border-white/10 pt-6 text-sm leading-relaxed text-white/70 whitespace-pre-wrap">
                {specialist.bio}
              </p>
            )}

            <Link
              href={`/contacto?especialista=${encodeURIComponent(name)}`}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Contactar sobre {specialist.firstName}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
