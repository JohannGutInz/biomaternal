import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { getPublicModel } from "@/lib/public-data";
import { Avatar } from "@/components/ui/Avatar";
import { BrandBackground } from "@/components/public/BrandBackground";
import { BookGallery } from "@/components/public/BookGallery";
import { VideoEmbed } from "@/components/public/VideoEmbed";
import { formatFullName } from "@/lib/utils";

const GENRE_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
};

export default async function TalentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const model = await getPublicModel(id);

  if (!model) notFound();
  if (model.kycStatus !== "APPROVED") redirect("/");

  const name = formatFullName(model);

  return (
    <div className="relative -mt-16 min-h-full bg-black pt-16">
      <BrandBackground />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-14">
        <Link
          href="/talentos"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a Talentos
        </Link>

        {/* Hero */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main photo */}
          <div className="lg:col-span-1">
            <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black shadow-xl">
              {model.mainPhotoUrl ? (
                <Image
                  src={model.mainPhotoUrl}
                  alt={name}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
              ) : (
                <Avatar name={name} size="xl" />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-2">
            {model.categories.length > 0 && (
              <p className="text-xs font-semibold tracking-[0.2em] text-glam-400 uppercase">
                {model.categories.join(" · ")}
              </p>
            )}
            <h1 className="mt-2 text-3xl font-light tracking-tight text-white break-words sm:text-4xl">{name}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-2.5 text-sm text-white/50">
              <span>{GENRE_LABEL[model.genre] ?? model.genre}</span>
              <span className="text-white/20">·</span>
              <span>{model.age} años</span>
              {model.location && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {model.location}
                  </span>
                </>
              )}
              <span className="text-white/20">·</span>
              <span>{model.nationality}</span>
            </div>

            {/* Stats grid */}
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-3">
              {model.height && (
                <div>
                  <dt className="text-xs font-medium text-white/45">Estatura</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-white">{model.height} cm</dd>
                </div>
              )}
              {model.currentWeight && (
                <div>
                  <dt className="text-xs font-medium text-white/45">Peso</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-white">{model.currentWeight} kg</dd>
                </div>
              )}
              {model.shirtSize && (
                <div>
                  <dt className="text-xs font-medium text-white/45">Talla de camisa</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-white">{model.shirtSize}</dd>
                </div>
              )}
              {model.pantsSize && (
                <div>
                  <dt className="text-xs font-medium text-white/45">Talla de pantalón</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-white">
                    {model.pantsSize}{" "}
                    {model.pantsSizeScale && (
                      <span className="font-normal text-white/50">
                        ({model.pantsSizeScale === "MEN" ? "Hombre" : "Mujer"})
                      </span>
                    )}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium text-white/45">Tatuajes visibles</dt>
                <dd className="mt-0.5 text-sm font-semibold text-white">{model.hasVisibleTattoos ? "Sí" : "No"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-white/45">Disponibilidad para viajar</dt>
                <dd className="mt-0.5 text-sm font-semibold text-white">{model.travelAvailability ? "Sí" : "No"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-white/45">Pasaporte</dt>
                <dd className="mt-0.5 text-sm font-semibold text-white">{model.hasPassport ? "Sí" : "No"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-white/45">Visa</dt>
                <dd className="mt-0.5 text-sm font-semibold text-white">{model.hasVisa ? "Sí" : "No"}</dd>
              </div>
            </dl>

            {/* CTA */}
            <Link
              href={`/contacto?modelo=${encodeURIComponent(name)}`}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-glam-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-glam-600"
            >
              Contactar a la agencia sobre {model.firstName}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Book photos */}
        {model.photoUrls.length > 0 && (
          <div className="mt-16 border-t border-white/10 pt-10">
            <h2 className="mb-5 text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">
              Book fotográfico
            </h2>
            <BookGallery photoUrls={model.photoUrls} modelName={name} />
          </div>
        )}

        {/* Casual photos */}
        {model.casualPhotoUrls.length > 0 && (
          <div className="mt-16 border-t border-white/10 pt-10">
            <h2 className="mb-5 text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">
              Fotos casuales
            </h2>
            <BookGallery photoUrls={model.casualPhotoUrls} modelName={name} />
          </div>
        )}

        {/* Event photos */}
        {model.eventPhotoUrls.length > 0 && (
          <div className="mt-16 border-t border-white/10 pt-10">
            <h2 className="mb-5 text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">
              En eventos
            </h2>
            <BookGallery photoUrls={model.eventPhotoUrls} modelName={name} />
          </div>
        )}

        {/* Presentation video — full width, maximized */}
        {model.videoUrls.length > 0 && (
          <div className="mt-16 border-t border-white/10 pt-10">
            <h2 className="mb-5 text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">
              Video de presentación
            </h2>
            <div className="space-y-5">
              {model.videoUrls.map((url, i) => (
                <div key={url} className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-lg">
                  <video
                    src={url}
                    controls
                    aria-label={`Video de presentación ${i + 1} de ${name}`}
                    className="w-full"
                    style={{ maxHeight: "70vh" }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campaign video links — YouTube / Vimeo embeds */}
        {model.campaignVideoLinks.length > 0 && (
          <div className="mt-16 border-t border-white/10 pt-10">
            <h2 className="mb-5 text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">
              Videos de campañas
            </h2>
            <div className={model.campaignVideoLinks.length === 1 ? "w-full" : "grid grid-cols-1 gap-5 sm:grid-cols-2"}>
              {model.campaignVideoLinks.map((url, i) => (
                <VideoEmbed key={url} url={url} label={`Video de campaña ${i + 1} de ${name}`} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
