import { cookies } from "next/headers";
import { siteSettings, registrationApplications } from "./mock-data";
import type { RegistrationApplication, UserW } from "./types";
import { SESSION_COOKIE, verifySessionToken } from "./session";
import { prisma } from "@/db";
import { redirect } from "next/navigation";
import { APP_ROUTE } from "./routes";

// Data access layer. Models/KYC/categories read from Postgres via Prisma. The
// self-registration/moderation feedback flow still reads in-memory fixtures
// (mock-data.ts) — pages already call everything with `await`, ready to
// become real queries later.

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
  const [kycModels, mdls] = await Promise.all([listModelsKyc(), listModels()]);

  const pendingKyc = kycModels.filter((m) => m.kyc.status === "PENDING" || m.kyc.status === "REQUIRES_CHANGES").length;

  return {
    pendingApplications: pendingKyc,
    activeModels: mdls.length,
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

