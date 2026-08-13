import { cookies } from "next/headers";
import { siteSettings, registrationApplications } from "./mock-data";
import type { RegistrationApplication, UserW } from "./types";
import { SESSION_COOKIE, verifySessionToken } from "./session";
import { prisma } from "@/db";
import { redirect } from "next/navigation";
import { APP_ROUTE } from "./routes";

// Data access layer. Specialists/KYC/specialties/sucursales/consultorios/
// reservations/charges read from Postgres via Prisma. The self-registration/
// moderation feedback flow still reads in-memory fixtures (mock-data.ts).

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

// ---------- Specialists ----------

const specialistInclude = {
  specialties: true,
} as const;

export type SpecialistWithRelations = Awaited<ReturnType<typeof listSpecialists>>[number];

export async function listSpecialists() {
  return prisma.specialist.findMany({
    where: { kyc: { status: "APPROVED" } },
    include: specialistInclude,
    orderBy: [{ paternalLastName: "asc" }, { firstName: "asc" }],
  });
}

export async function getSpecialist(id: string) {
  return prisma.specialist.findFirst({
    where: { id, kyc: { status: "APPROVED" } },
    include: specialistInclude,
  });
}

export type OwnSpecialistWithKyc = Awaited<ReturnType<typeof getOwnSpecialist>>;

export async function getOwnSpecialist(userId: string) {
  return prisma.specialist.findUnique({
    where: { userId },
    include: { ...specialistInclude, kyc: true },
  });
}

// ---------- Verificación / KYC ----------

const kycSpecialistInclude = {
  kyc: true,
  specialties: true,
} as const;

export type SpecialistWithKyc = Awaited<ReturnType<typeof listSpecialistsKyc>>[number];

export async function listSpecialistsKyc() {
  // No isProfileComplete filter here on purpose: a submission missing
  // attributes still has a real Kyc record and needs to stay visible to
  // staff (flagged as incomplete in the UI) instead of silently disappearing
  // from the queue.
  return prisma.specialist.findMany({
    include: kycSpecialistInclude,
    orderBy: { kyc: { createdAt: "desc" } },
  });
}

export async function getSpecialistKyc(id: string) {
  return prisma.specialist.findUnique({
    where: { id },
    include: {
      ...kycSpecialistInclude,
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

// ---------- Catálogo de especialidades ----------

export async function listSpecialties() {
  return prisma.specialty.findMany({ where: { enabled: true }, orderBy: { name: "asc" } });
}

// ---------- Sucursales / Consultorios ----------

export type SucursalWithConsultorios = Awaited<ReturnType<typeof listSucursales>>[number];

export async function listSucursales() {
  return prisma.sucursal.findMany({
    include: { consultorios: true },
    orderBy: { name: "asc" },
  });
}

export async function getSucursal(id: string) {
  return prisma.sucursal.findUnique({ where: { id }, include: { consultorios: true } });
}

export type ConsultorioWithSucursal = Awaited<ReturnType<typeof listConsultorios>>[number];

export async function listConsultorios() {
  return prisma.consultorio.findMany({
    include: { sucursal: true, fotos: true },
    orderBy: { name: "asc" },
  });
}

export async function getConsultorio(id: string) {
  return prisma.consultorio.findUnique({
    where: { id },
    include: { sucursal: true, fotos: { orderBy: { position: "asc" } } },
  });
}

// ---------- Reservas ----------

const reservationInclude = {
  consultorio: { include: { sucursal: true } },
  specialist: true,
  charge: true,
} as const;

export type ReservationWithRelations = Awaited<ReturnType<typeof listReservations>>[number];

export async function listReservations() {
  return prisma.reservation.findMany({
    include: reservationInclude,
    orderBy: { startAt: "desc" },
  });
}

export async function getReservation(id: string) {
  return prisma.reservation.findUnique({ where: { id }, include: reservationInclude });
}

// Portal del especialista: solo sus propias reservas.
export async function listOwnReservations(specialistId: string) {
  return prisma.reservation.findMany({
    where: { specialistId },
    include: { consultorio: { include: { sucursal: true } }, charge: true },
    orderBy: { startAt: "desc" },
  });
}

// Occupancy view for the calendar/agenda: reservations in a date window,
// optionally scoped to one sucursal.
export async function listReservationsInRange(from: Date, to: Date, sucursalId?: string) {
  return prisma.reservation.findMany({
    where: {
      startAt: { lt: to },
      endAt: { gt: from },
      status: { in: ["PENDING", "CONFIRMED"] },
      ...(sucursalId ? { consultorio: { sucursalId } } : {}),
    },
    include: reservationInclude,
    orderBy: { startAt: "asc" },
  });
}

// ---------- Cobros ----------

export type ChargeWithReservation = Awaited<ReturnType<typeof listCharges>>[number];

export async function listCharges() {
  return prisma.charge.findMany({
    include: { reservation: { include: { consultorio: true, specialist: true } } },
    orderBy: { createdAt: "desc" },
  });
}

// ---------- Dashboard stats ----------

export async function getDashboardStats() {
  const [kycSpecialists, specialists, sucursales, reservations] = await Promise.all([
    listSpecialistsKyc(),
    listSpecialists(),
    listSucursales(),
    listReservations(),
  ]);

  const pendingKyc = kycSpecialists.filter(
    (s) => s.kyc.status === "PENDING" || s.kyc.status === "REQUIRES_CHANGES",
  ).length;

  const pendingReservations = reservations.filter((r) => r.status === "PENDING").length;

  return {
    pendingApplications: pendingKyc,
    activeSpecialists: specialists.length,
    sucursalesCount: sucursales.length,
    pendingReservations,
  };
}

// ---------- Dashboard KPIs (§8 CLAUDE-biomaternal.md) ----------

export interface OccupancyKpi {
  sucursalId: string;
  sucursalName: string;
  occupancyPct: number;
}

export interface TopSpecialistKpi {
  specialistId: string;
  name: string;
  reservationsCount: number;
}

export async function getDashboardKpis() {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const [sucursales, occupiedWindow, charges, recentReservations] = await Promise.all([
    prisma.sucursal.findMany({ include: { consultorios: { where: { isActive: true } } } }),
    prisma.reservation.findMany({
      where: { startAt: { lt: now }, endAt: { gt: weekAgo }, status: { in: ["CONFIRMED", "COMPLETED"] } },
      select: { startAt: true, endAt: true, consultorio: { select: { sucursalId: true } } },
    }),
    prisma.charge.findMany({ select: { amount: true, status: true } }),
    prisma.reservation.findMany({
      where: { startAt: { gte: monthAgo }, status: { not: "CANCELLED" } },
      select: { specialistId: true, specialist: { select: { firstName: true, paternalLastName: true } } },
    }),
  ]);

  // Ocupación % por sucursal, últimos 7 días: horas reservadas (recortadas a la
  // ventana) / horas disponibles (consultorios activos x horario x 7 días).
  const occupancy: OccupancyKpi[] = sucursales.map((s) => {
    const [openH, openM] = s.openTime.split(":").map(Number);
    const [closeH, closeM] = s.closeTime.split(":").map(Number);
    const dailyHours = Math.max(closeH + closeM / 60 - (openH + openM / 60), 0);
    const availableHours = dailyHours * s.consultorios.length * 7;

    const reservedHours = occupiedWindow
      .filter((r) => r.consultorio.sucursalId === s.id)
      .reduce((sum, r) => {
        const start = r.startAt < weekAgo ? weekAgo : r.startAt;
        const end = r.endAt > now ? now : r.endAt;
        return sum + Math.max((end.getTime() - start.getTime()) / (1000 * 60 * 60), 0);
      }, 0);

    return {
      sucursalId: s.id,
      sucursalName: s.name,
      occupancyPct: availableHours > 0 ? Math.min(Math.round((reservedHours / availableHours) * 100), 100) : 0,
    };
  });

  const revenue = {
    paid: charges.filter((c) => c.status === "PAID").reduce((sum, c) => sum + c.amount, 0),
    pending: charges.filter((c) => c.status === "PENDING").reduce((sum, c) => sum + c.amount, 0),
  };

  const bySpecialist = new Map<string, TopSpecialistKpi>();
  for (const r of recentReservations) {
    const existing = bySpecialist.get(r.specialistId);
    if (existing) {
      existing.reservationsCount += 1;
    } else {
      bySpecialist.set(r.specialistId, {
        specialistId: r.specialistId,
        name: `${r.specialist.firstName} ${r.specialist.paternalLastName}`,
        reservationsCount: 1,
      });
    }
  }
  const topSpecialists = Array.from(bySpecialist.values())
    .sort((a, b) => b.reservationsCount - a.reservationsCount)
    .slice(0, 5);

  return { occupancy, revenue, topSpecialists };
}
