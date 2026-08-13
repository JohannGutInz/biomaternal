import { prisma } from "@/db";
import { calculateAge } from "./utils";
import { signPhotoUrl } from "./storage";

// Public boundary. Only returns specialists with approved KYC and isPublic.
// Never exposes internalNotes, phone, or anything KYC-internal.

const publicSpecialistInclude = {
  kyc: true,
  specialties: { select: { name: true } },
} as const;

type RawPublicSpecialist = NonNullable<
  Awaited<ReturnType<typeof prisma.specialist.findFirst<{ include: typeof publicSpecialistInclude }>>>
>;

export interface PublicSpecialist {
  id: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string | null;
  photoUrl: string | null;
  specialties: string[];
  genre: string;
  location: string | null;
  bio: string | null;
  licenseNumber: string | null;
  age: number;
  createdAt: Date;
}

async function toPublicSpecialist(s: RawPublicSpecialist): Promise<PublicSpecialist> {
  return {
    id: s.id,
    firstName: s.firstName,
    paternalLastName: s.paternalLastName,
    maternalLastName: s.maternalLastName,
    photoUrl: await signPhotoUrl(s.photoUrl),
    specialties: s.specialties.map((sp) => sp.name),
    genre: s.genre,
    location: s.location,
    bio: s.bio,
    licenseNumber: s.licenseNumber,
    age: calculateAge(s.birthDate),
    createdAt: s.createdAt,
  };
}

export async function listPublicSpecialists(): Promise<PublicSpecialist[]> {
  const specialists = await prisma.specialist.findMany({
    where: { kyc: { status: "APPROVED" }, isPublic: true },
    include: publicSpecialistInclude,
    orderBy: [{ paternalLastName: "asc" }, { firstName: "asc" }],
  });
  return Promise.all(specialists.map(toPublicSpecialist));
}

export async function getPublicSpecialist(id: string): Promise<PublicSpecialist | undefined> {
  const specialist = await prisma.specialist.findFirst({
    where: { id, kyc: { status: "APPROVED" }, isPublic: true },
    include: publicSpecialistInclude,
  });
  if (!specialist) return undefined;
  return toPublicSpecialist(specialist);
}

export async function listFeaturedSpecialists(limit = 4): Promise<PublicSpecialist[]> {
  const specialists = await prisma.specialist.findMany({
    where: { kyc: { status: "APPROVED" }, isPublic: true },
    include: publicSpecialistInclude,
    orderBy: [{ createdAt: "desc" }],
    take: limit,
  });
  return Promise.all(specialists.map(toPublicSpecialist));
}

// ---------- Sucursales (landing) ----------

export interface PublicSucursal {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  openTime: string;
  closeTime: string;
}

export async function listPublicSucursales(): Promise<PublicSucursal[]> {
  return prisma.sucursal.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, address: true, phone: true, openTime: true, closeTime: true },
  });
}

// ---------- Catálogo de especialidades (filtros públicos) ----------

export async function listPublicSpecialties() {
  return prisma.specialty.findMany({
    where: { enabled: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export interface PortfolioEntryPublico {
  id: string;
  marca: string;
  fecha: string;
  lugar: string;
  fotos: { url: string; isPortada: boolean }[];
}

export async function listPortfolioEntradas(): Promise<PortfolioEntryPublico[]> {
  return [];
}

export interface PortfolioEvent {
  id: string;
  name: string;
  type: string;
  venue: string;
  date: string;
  clientName: string;
}

// Stubbed to empty — no real data source (see git history for context on
// prior EventoFoto/AgencyEvent fixtures, retired in the Biomaternal pivot).
export async function listPortfolioEvents(): Promise<PortfolioEvent[]> {
  return [];
}
