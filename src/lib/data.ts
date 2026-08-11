import { cookies } from "next/headers";
import { siteSettings, registrationApplications } from "./mock-data";
import type { RegistrationApplication, UserW } from "./types";
import { SESSION_COOKIE, verifySessionToken } from "./session";
import { prisma } from "@/db";
import { redirect } from "next/navigation";
import { APP_ROUTE } from "./routes";

// Data access layer. Models/KYC/categories/packages/convocatorias/EventoFoto
// read from Postgres via Prisma. The self-registration/moderation feedback
// flow still reads in-memory fixtures (mock-data.ts) — pages already call
// everything with `await`, ready to become real queries later.

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE);

  if (!token) {
    redirect(APP_ROUTE.app.login.index);
  }

  const parsedToken = await verifySessionToken(token.value);

  if (!parsedToken) {
    cookieStore.delete(SESSION_COOKIE);
    redirect(APP_ROUTE.app.login.index);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: parsedToken.sub
    },
    omit: {
      hashedPassword: true,
    },
  });


  if (!user) {
    cookieStore.delete(SESSION_COOKIE);
    redirect(APP_ROUTE.app.login.index);
  }

  return user satisfies UserW;
}

// ---------- Models ----------

const modelInclude = {
  categories: true,
  activities: true,
  country: true,
  city: { include: { state: true } },
  assets: true,
  media: true,
} as const;

export type ModelWithRelations = Awaited<ReturnType<typeof listModels>>[number];

export async function listModels() {
  return prisma.model.findMany({
    where: { kyc: { status: "APPROVED" } },
    include: modelInclude,
    orderBy: [{ paternalLastName: "asc" }, { firstName: "asc" }],
  });
}

export async function getModel(id: string) {
  return prisma.model.findFirst({
    where: { id, kyc: { status: "APPROVED" } },
    include: modelInclude,
  });
}

export type OwnModelWithKyc = Awaited<ReturnType<typeof getOwnModel>>;

export async function getOwnModel(userId: string) {
  return prisma.model.findUnique({
    where: { userId },
    include: { ...modelInclude, kyc: true },
  });
}

// ---------- Moderation / KYC ----------

const kycModelInclude = {
  kyc: true,
  categories: true,
  activities: true,
  country: true,
  city: { include: { state: true } },
  assets: true,
  media: true,
} as const;

export type ModelWithKyc = Awaited<ReturnType<typeof listModelsKyc>>[number];

export async function listModelsKyc() {
  // No isProfileComplete filter here on purpose: a submission missing
  // attributes still has a real Kyc record and needs to stay visible to
  // staff (flagged as incomplete in the UI) instead of silently disappearing
  // from the queue.
  return prisma.model.findMany({
    include: kycModelInclude,
    orderBy: { kyc: { createdAt: "desc" } },
  });
}

export async function getModelKyc(id: string) {
  return prisma.model.findUnique({
    where: { id },
    include: {
      ...kycModelInclude,
      kyc: { include: { reviewLogs: { orderBy: { reviewedAt: "desc" } } } },
    },
  });
}

// ---------- Moderation / feedback flow (mock, temporary token link) ----------

export async function getApplicationByToken(token: string): Promise<RegistrationApplication | undefined> {
  return registrationApplications.find((s) => s.reviewToken === token);
}

// ---------- Packages (real DB) ----------

export type PackageItem = Awaited<ReturnType<typeof listPackages>>[number];

export async function listPackages() {
  return prisma.package.findMany({
    include: { models: { select: { id: true, categories: { select: { id: true, name: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

export type PackageWithModels = Awaited<ReturnType<typeof getPaquete>>;

const packageModelInclude = {
  categories: { select: { name: true } },
  activities: { select: { name: true } },
  country: { select: { name: true } },
  city: { select: { name: true } },
  assets: true,
} as const;

export async function getPaquete(id: string) {
  return prisma.package.findUnique({
    where: { id },
    include: { models: { include: packageModelInclude } },
  });
}

// ---------- Site settings ----------

export async function getSiteSettings() {
  return siteSettings;
}

// ---------- Catalogs (categories) ----------

export async function listCategories() {
  return prisma.category.findMany({ where: { enabled: true }, orderBy: { name: "asc" } });
}

// ---------- Catalogs (activities) ----------

export async function listActivities() {
  return prisma.activity.findMany({ orderBy: { name: "asc" } });
}

// ---------- Dashboard stats ----------

export async function getDashboardStats() {
  const [pkgs, kycModels, mdls] = await Promise.all([
    listPackages(),
    listModelsKyc(),
    listModels(),
  ]);

  const pendingKyc = kycModels.filter((m) => m.kyc.status === "PENDING" || m.kyc.status === "REQUIRES_CHANGES").length;

  const pendingPackages = pkgs.filter((p) => p.status === "DRAFT" || p.status === "SENT");
  const pendingApplications = pendingKyc;
  const activeModels = mdls;

  return {
    pendingPackages: pendingPackages.length,
    pendingApplications: pendingApplications,
    activeModels: activeModels.length,
    draftPackages: pkgs.filter((p) => p.status === "DRAFT").length,
  };
}

// ---------- Geography ----------

export async function listGeografia() {
  const [countries, states, municipalities] = await Promise.all([
    prisma.country.findMany({ orderBy: { name: "asc" } }),
    prisma.state.findMany({ orderBy: { name: "asc" } }),
    prisma.municipality.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { countries, states, municipalities };
}

// ---------- Model portal: unread convocatoria count ----------

export async function getModelUnreadConvocatorias(userId: string): Promise<number> {
  const model = await prisma.model.findUnique({
    where: { userId },
    select: { convocatoriaVistas: { select: { convocatoriaId: true } } },
  });
  if (!model) return 0;
  const seenIds = model.convocatoriaVistas.map((v) => v.convocatoriaId);
  return prisma.convocatoria.count({
    where: {
      status: "OPEN",
      ...(seenIds.length > 0 ? { id: { notIn: seenIds } } : {}),
    },
  });
}

// ---------- Convocatorias ----------

export type ConvocatoriaItem = Awaited<ReturnType<typeof listConvocatorias>>[number];

export async function listConvocatorias() {
  return prisma.convocatoria.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getConvocatoria(id: string) {
  return prisma.convocatoria.findUnique({ where: { id } });
}

// ---------- EventoFoto (marketing gallery, admin) ----------
// All rows regardless of `published` — distinct from listEventosDestacados()
// in public-data.ts, which only returns published: true for the landing carousel.

export type EventoFotoItem = Awaited<ReturnType<typeof listEventoFotos>>[number];

export async function listEventoFotos() {
  return prisma.eventoFoto.findMany({
    orderBy: { position: "asc" },
  });
}
