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
  client: true,
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
    include: { consultorio: { include: { sucursal: true } }, client: true, charge: true },
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

// ---------- Ventas InBody ----------

export async function listInbodySales() {
  return prisma.inbodySale.findMany({ include: { client: true }, orderBy: { date: "desc" } });
}

// ---------- Agenda WhatsApp ----------

export async function listWhatsappRequests() {
  return prisma.whatsappRequest.findMany({
    include: { specialist: true, client: true },
    orderBy: { date: "desc" },
  });
}

// ---------- Llamadas y conversión ----------

export async function listCallLogs() {
  return prisma.callLog.findMany({ include: { client: true }, orderBy: { date: "desc" } });
}

// ---------- Clientes ----------

export type ClientWithRelations = Awaited<ReturnType<typeof listClients>>[number];

export async function listClients() {
  return prisma.client.findMany({
    include: {
      _count: { select: { reservations: true, inbodySales: true, whatsappRequests: true, callLogs: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getClient(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      reservations: {
        include: { consultorio: { include: { sucursal: true } }, specialist: true, charge: true },
        orderBy: { startAt: "desc" },
      },
      inbodySales: { orderBy: { date: "desc" } },
      whatsappRequests: { include: { specialist: true }, orderBy: { date: "desc" } },
      callLogs: { orderBy: { date: "desc" } },
    },
  });
}

// ---------- Flujo B2B ----------

export async function listB2bProspects() {
  return prisma.b2bProspect.findMany({
    include: { specialty: true },
    orderBy: { date: "desc" },
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

// ---------- Reporte semanal / por especialista (registro-consultas.md §5) ----------

function safeRatio(numerator: number, denominator: number): number {
  return denominator > 0 ? numerator / denominator : 0;
}

function hoursBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

// La dimensión sucursal solo aplica a reservas: InBody, WhatsApp, llamadas y
// B2B no tienen sucursal en el modelo (el propio documento de referencia lo
// marca como mejora sugerida, §7 — no existe hoy ni en el Excel original).
export async function getReporteSemanal(from: Date, to: Date, sucursalId?: string) {
  const [reservations, whatsappRequests, callLogs, inbodySales, b2bProspects] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        startAt: { gte: from, lt: to },
        ...(sucursalId ? { consultorio: { sucursalId } } : {}),
      },
      select: { status: true, startAt: true, endAt: true, priceApplied: true, inbodyIncluded: true },
    }),
    prisma.whatsappRequest.findMany({ where: { date: { gte: from, lt: to } } }),
    prisma.callLog.findMany({ where: { date: { gte: from, lt: to } } }),
    prisma.inbodySale.findMany({ where: { date: { gte: from, lt: to } } }),
    prisma.b2bProspect.findMany({ where: { date: { gte: from, lt: to } } }),
  ]);

  const realizadas = reservations.filter((r) => r.status === "COMPLETED");

  const flujoPacientes = {
    citasAgendadas: reservations.length,
    citasEfectivas: realizadas.length,
    cancelaciones: reservations.filter((r) => r.status === "CANCELLED").length,
    pospuestas: reservations.filter((r) => r.status === "POSTPONED").length,
    horasRentadas: realizadas.reduce((sum, r) => sum + hoursBetween(r.startAt, r.endAt), 0),
    ingresoRenta: realizadas.reduce((sum, r) => sum + (r.priceApplied ?? 0), 0),
  };

  const whatsappConcretadas = whatsappRequests.filter((w) => w.confirmed).length;
  const agendaWhatsapp = {
    solicitudes: whatsappRequests.length,
    concretadas: whatsappConcretadas,
    noConcretadas: whatsappRequests.length - whatsappConcretadas,
    tasaCierre: safeRatio(whatsappConcretadas, whatsappRequests.length),
  };

  const contactosNuevos = callLogs.filter((c) => c.isNewContact).length;
  const citasGeneradas = callLogs.filter((c) => c.generatedAppointment).length;
  const conversion = {
    totalLlamadas: callLogs.length,
    contactosNuevos,
    citasGeneradas,
    tasaConversion: safeRatio(citasGeneradas, contactosNuevos),
  };

  const inbodyEnConsulta = reservations.filter((r) => r.inbodyIncluded).length;
  const inbodyCorporativo = inbodySales.filter((v) => v.type === "CORPORATE").length;
  const inbodyPublico = inbodySales.filter((v) => v.type === "PUBLIC").length;
  const ingresoInbodyExternos = inbodySales.reduce((sum, v) => sum + v.price, 0);
  const inbody = {
    enConsulta: inbodyEnConsulta,
    corporativo: inbodyCorporativo,
    publico: inbodyPublico,
    ingresoExternos: ingresoInbodyExternos,
    total: inbodyEnConsulta + inbodySales.length,
  };

  const flujoB2b = {
    interesados: b2bProspects.filter((p) => p.status === "INTERESTED").length,
    enNegociacion: b2bProspects.filter((p) => p.status === "NEGOTIATING").length,
    confirmados: b2bProspects.filter((p) => p.status === "CONFIRMED").length,
    incidenciasAgenda: b2bProspects.filter((p) => p.scheduleIncident).length,
  };

  return {
    flujoPacientes,
    agendaWhatsapp,
    conversion,
    inbody,
    flujoB2b,
    ingresoTotal: flujoPacientes.ingresoRenta + ingresoInbodyExternos,
  };
}

export interface ReportePorEspecialistaRow {
  specialistId: string;
  name: string;
  specialtyNames: string;
  citasAgendadas: number;
  realizadas: number;
  canceladas: number;
  pospuestas: number;
  horas: number;
  ingresoRenta: number;
  citasWhatsapp: number;
}

export async function getReportePorEspecialista(from: Date, to: Date): Promise<ReportePorEspecialistaRow[]> {
  const [specialists, reservations, whatsappRequests] = await Promise.all([
    prisma.specialist.findMany({
      include: { specialties: true },
      orderBy: [{ paternalLastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.reservation.findMany({
      where: { startAt: { gte: from, lt: to } },
      select: { specialistId: true, status: true, startAt: true, endAt: true, priceApplied: true },
    }),
    prisma.whatsappRequest.findMany({
      where: { date: { gte: from, lt: to }, specialistId: { not: null } },
      select: { specialistId: true },
    }),
  ]);

  return specialists.map((s) => {
    const own = reservations.filter((r) => r.specialistId === s.id);
    const realizadas = own.filter((r) => r.status === "COMPLETED");

    return {
      specialistId: s.id,
      name: `${s.firstName} ${s.paternalLastName}`,
      specialtyNames: s.specialties.map((sp) => sp.name).join(", "),
      citasAgendadas: own.length,
      realizadas: realizadas.length,
      canceladas: own.filter((r) => r.status === "CANCELLED").length,
      pospuestas: own.filter((r) => r.status === "POSTPONED").length,
      horas: realizadas.reduce((sum, r) => sum + hoursBetween(r.startAt, r.endAt), 0),
      ingresoRenta: realizadas.reduce((sum, r) => sum + (r.priceApplied ?? 0), 0),
      citasWhatsapp: whatsappRequests.filter((w) => w.specialistId === s.id).length,
    };
  });
}
