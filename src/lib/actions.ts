"use server";

import { cookies } from "next/headers";
import { redirect, unauthorized, forbidden } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import * as bcrypt from "bcrypt";
import { prisma } from "@/db";
import { siteSettings, registrationApplications } from "./mock-data";
import { SESSION_COOKIE, createSessionToken, verifySessionToken } from "./session";
import { toDateKey } from "./utils";
import { emailClientContact } from "./email";
import { APP_ROUTE } from "./routes";
import {
  ownSpecialistProfileSchema,
  specialistEditSchema,
  registrationActionSchema,
  nuevoEspecialistaAdminFormSchema,
  sucursalSchema,
  consultorioSchema,
  reservationSchema,
  reservationSelfSchema,
  chargeSchema,
} from "./schemas";
import { deleteObject, keyFromObjectUrl, getSignedDownloadUrl } from "./storage";
import z from "zod";
import type {
  LoginData,
  ContactData,
  SpecialtyData,
  SettingsData,
  ResendApplicationData,
  RegistrationActionData,
  OwnSpecialistProfileData,
  SpecialistEditData,
  NuevoEspecialistaAdminFormData,
  SucursalData,
  ConsultorioData,
  ReservationData,
  ReservationSelfData,
  ChargeData,
} from "./schemas";
import { UserRole } from "@/generated/prisma/enums";

export interface ActionState {
  status: "idle" | "success" | "error";
  message: string;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// Gate for every backoffice mutation action below. The `(private)` layout
// only protects page renders — a Server Action is invocable directly by its
// action id (POST + `Next-Action` header) without ever going through the
// layout, so each mutation must check the session itself.
async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE);
  const session = token ? await verifySessionToken(token.value) : null;

  if (!session) unauthorized();
  if (session.role !== "ADMIN") forbidden();

  return session;
}

// ---------- Staff session (backoffice) ----------

export async function loginAction(data: LoginData): Promise<ActionState> {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    return { status: "error", message: "Correo o contraseña incorrectos." };
  }

  const passwordMatches = await bcrypt.compare(data.password, user.hashedPassword);
  if (!passwordMatches) {
    return { status: "error", message: "Correo o contraseña incorrectos." };
  }

  const sessionToken = await createSessionToken({
    sub: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect(user.role === "SPECIALIST" ? APP_ROUTE.app.specialist.profile : APP_ROUTE.app.specialists.index);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect(APP_ROUTE.app.login.index);
}

// ---------- Public self-registration ----------

async function toPhotoKey(urlOrKey: string | undefined): Promise<string | null> {
  if (!urlOrKey) return null;
  return keyFromObjectUrl(urlOrKey) ?? urlOrKey;
}

export async function submitRegistrationAction(data: RegistrationActionData): Promise<ActionState> {
  const parsed = registrationActionSchema.safeParse(data);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
    console.error("[registro] validación fallida:", fields);
    return { status: "error", message: `Datos inválidos: ${fields}` };
  }
  const d = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: d.email } });
  if (existing) {
    return { status: "error", message: "Ya existe un registro con ese correo electrónico." };
  }

  const hashedPassword = await hashPassword(d.password);
  const photoKey = await toPhotoKey(d.photoUrl);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: d.email,
        username: `${d.firstName} ${d.paternalLastName}`,
        hashedPassword,
        role: UserRole.SPECIALIST,
      },
    });
    const kyc = await tx.kyc.create({ data: {} });
    await tx.specialist.create({
      data: {
        firstName: d.firstName,
        paternalLastName: d.paternalLastName,
        maternalLastName: d.maternalLastName || null,
        email: d.email,
        phone: d.phone,
        birthDate: new Date(d.birthDate),
        genre: d.gender,
        licenseNumber: d.licenseNumber || null,
        bio: d.bio || null,
        location: d.location || null,
        photoUrl: photoKey,
        kycId: kyc.id,
        userId: user.id,
        specialties: { connect: d.specialtyIds.map((id) => ({ id })) },
      },
    });
  });

  return {
    status: "success",
    message: "¡Gracias! Recibimos tu información y nuestro equipo la revisará pronto. Te avisaremos por correo.",
  };
}

// Edit + resend from the temporary token link (goes back to "pendiente").
export async function resendApplicationAction(token: string, data: ResendApplicationData): Promise<ActionState> {
  const application = registrationApplications.find((s) => s.reviewToken === token);
  if (!application) return { status: "error", message: "Enlace inválido." };

  application.fullName = data.fullName;
  application.email = data.email;
  application.phone = data.phone;
  application.status = "pendiente";
  application.updatedAt = toDateKey(new Date());

  revalidatePath("/moderacion");
  revalidatePath(`/retro/${token}`);

  return { status: "success", message: "¡Listo! Reenviamos tu información actualizada para una nueva revisión." };
}

// ---------- KYC (verificación) ----------

const moderateKycSchema = z.object({
  specialistId: z.string().uuid(),
  decision: z.enum(["APPROVED", "REJECTED", "REQUIRES_CHANGES"]),
  comment: z.string().max(2000).optional(),
  internalNote: z.string().max(2000).optional(),
});

export async function moderateKycAction(
  specialistId: string,
  decision: "APPROVED" | "REJECTED" | "REQUIRES_CHANGES",
  formData: FormData,
) {
  const session = await requireAdmin();

  const result = moderateKycSchema.safeParse({
    specialistId,
    decision,
    comment: String(formData.get("comment") ?? "").trim() || undefined,
    internalNote: String(formData.get("internalNote") ?? "").trim() || undefined,
  });

  if (!result.success) return;

  const specialist = await prisma.specialist.findUnique({
    where: { id: result.data.specialistId },
    select: { kycId: true },
  });
  if (!specialist) return;

  await prisma.$transaction([
    prisma.kyc.update({
      where: { id: specialist.kycId },
      data: {
        status: result.data.decision,
        comment: result.data.comment,
        internalNote: result.data.internalNote,
        reviewedAt: new Date(),
        ...(result.data.decision === "REJECTED" && { rejectedAt: new Date() }),
      },
    }),
    // Kyc only ever holds the latest decision/comment — this is the only
    // place a past review survives the next one, including whether it had a
    // comment at all.
    prisma.kycReviewLog.create({
      data: {
        id: crypto.randomUUID(),
        kycId: specialist.kycId,
        decision: result.data.decision,
        comment: result.data.comment ?? null,
        reviewedBy: session.username || session.email,
      },
    }),
  ]);

  revalidatePath(APP_ROUTE.app.verification.index);
  revalidatePath(`${APP_ROUTE.app.verification.index}/${result.data.specialistId}`);
  revalidatePath("/app/dashboard");
}

// ---------- Catálogo de especialidades ----------

export async function createSpecialtyAction(data: SpecialtyData): Promise<ActionState> {
  await requireAdmin();

  const existing = await prisma.specialty.findFirst({
    where: { name: { equals: data.name, mode: "insensitive" } },
  });
  if (existing) {
    return { status: "error", message: "Ya existe una especialidad con ese nombre." };
  }

  await prisma.specialty.create({ data: { name: data.name } });
  revalidatePath("/app/catalogs");

  return { status: "success", message: "Especialidad creada." };
}

export async function toggleSpecialtyEnabledAction(id: string, enabled: boolean): Promise<void> {
  await requireAdmin();

  await prisma.specialty.update({ where: { id }, data: { enabled } });
  revalidatePath("/app/catalogs");
}

// ---------- Site settings (backoffice) ----------

export async function saveSiteSettingsAction(data: SettingsData): Promise<void> {
  await requireAdmin();

  siteSettings.agencyName = data.agencyName;
  siteSettings.primaryColor = data.primaryColor;
  siteSettings.heroTitle = data.heroTitle;
  siteSettings.heroSubtitle = data.heroSubtitle;

  revalidatePath("/configuracion");
  revalidatePath("/");
  revalidatePath("/talentos");
  revalidatePath("/contacto");
}

export async function togglePublicRegistrationAction(active: boolean) {
  await requireAdmin();

  siteSettings.publicRegistrationActive = active;
  revalidatePath("/configuracion");
  revalidatePath("/");
}

export async function regenerateRegistrationLinkAction() {
  await requireAdmin();

  siteSettings.registrationLinkSlug = `registro-biomaternal-${Math.random().toString(36).slice(2, 8)}`;
  revalidatePath("/configuracion");
  revalidatePath("/");
  return siteSettings.registrationLinkSlug;
}

// ---------- Client contact (public landing) ----------

export async function submitContactAction(data: ContactData): Promise<ActionState> {
  await emailClientContact({
    name: data.name,
    company: data.company ?? "",
    email: data.email,
    message: data.message,
  });

  return { status: "success", message: "¡Gracias por tu mensaje! Te responderemos a la brevedad." };
}

// ---------- Specialist portal (self-service) ----------

async function deleteRemovedPhoto(oldKey: string | null, newKey: string | null) {
  if (oldKey && oldKey !== newKey) {
    await deleteObject(oldKey).catch((err) => {
      console.error("[deleteRemovedPhoto] failed to delete", oldKey, err);
    });
  }
}

export async function updateOwnSpecialistProfileAction(data: OwnSpecialistProfileData): Promise<ActionState> {
  const result = ownSpecialistProfileSchema.safeParse(data);
  if (!result.success) {
    return { status: "error", message: "Datos inválidos." };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE);
  const session = token ? await verifySessionToken(token.value) : null;

  if (!session || session.role !== "SPECIALIST") {
    redirect(APP_ROUTE.app.login.index);
  }

  const current = await prisma.specialist.findUnique({
    where: { userId: session.sub },
    select: { id: true, kycId: true, kyc: { select: { status: true } }, photoUrl: true },
  });
  if (!current) redirect(APP_ROUTE.app.login.index);

  // Editing is locked while a review is pending and after a rejection — the
  // UI already hides the form in these states, but that's cosmetic only:
  // this action is reachable directly, so the real gate has to live here too.
  if (current.kyc.status === "PENDING") {
    return {
      status: "error",
      message: "Tu perfil está en revisión. No puedes editarlo hasta que sea aprobado.",
    };
  }
  if (current.kyc.status === "REJECTED") {
    return {
      status: "error",
      message: "Tu perfil fue rechazado y ya no admite ediciones. Contacta a la administración si crees que es un error.",
    };
  }

  const newPhotoKey = await toPhotoKey(result.data.photoUrl);

  await prisma.specialist.update({
    where: { userId: session.sub },
    data: {
      firstName: result.data.firstName,
      paternalLastName: result.data.paternalLastName,
      maternalLastName: result.data.maternalLastName || null,
      phone: result.data.phone,
      licenseNumber: result.data.licenseNumber || null,
      bio: result.data.bio || null,
      location: result.data.location || null,
      photoUrl: newPhotoKey,
      specialties: { set: result.data.specialtyIds.map((id) => ({ id })) },
    },
  });

  if (current.kyc.status === "APPROVED") {
    await prisma.kyc.update({
      where: { id: current.kycId },
      data: { status: "PENDING" },
    });
  }

  await deleteRemovedPhoto(current.photoUrl, newPhotoKey);

  revalidatePath(APP_ROUTE.app.specialist.profile);
  revalidatePath(APP_ROUTE.app.verification.index);
  revalidatePath(`${APP_ROUTE.app.verification.index}/${current.id}`);
  revalidatePath("/app/dashboard");

  return {
    status: "success",
    message:
      current.kyc.status === "APPROVED"
        ? "Perfil actualizado. Tu verificación vuelve a estar pendiente de aprobación."
        : "Perfil actualizado.",
  };
}

// ---------- Specialist admin edit ----------

export async function updateSpecialistAction(specialistId: string, data: SpecialistEditData): Promise<ActionState> {
  await requireAdmin();

  const result = specialistEditSchema.safeParse(data);
  if (!result.success) {
    return { status: "error", message: "Datos inválidos." };
  }

  const current = await prisma.specialist.findUnique({
    where: { id: specialistId },
    select: { photoUrl: true },
  });
  if (!current) {
    return { status: "error", message: "Especialista no encontrado." };
  }

  const newPhotoKey = await toPhotoKey(result.data.photoUrl);

  await prisma.specialist.update({
    where: { id: specialistId },
    data: {
      firstName: result.data.firstName,
      paternalLastName: result.data.paternalLastName,
      maternalLastName: result.data.maternalLastName || null,
      phone: result.data.phone,
      licenseNumber: result.data.licenseNumber || null,
      bio: result.data.bio || null,
      location: result.data.location || null,
      photoUrl: newPhotoKey,
      isPublic: result.data.isPublic,
      specialties: { set: result.data.specialtyIds.map((id) => ({ id })) },
    },
  });

  await deleteRemovedPhoto(current.photoUrl, newPhotoKey);

  revalidatePath(`${APP_ROUTE.app.specialists.index}/${specialistId}`);
  revalidatePath(APP_ROUTE.app.specialists.index);

  return { status: "success", message: "Especialista actualizado." };
}

export async function toggleSpecialistVisibilityAction(specialistId: string, isPublic: boolean): Promise<ActionState> {
  await requireAdmin();

  await prisma.specialist.update({
    where: { id: specialistId },
    data: { isPublic },
  });

  revalidatePath(`${APP_ROUTE.app.specialists.index}/${specialistId}`);
  revalidatePath(APP_ROUTE.app.specialists.index);

  return { status: "success", message: isPublic ? "Perfil visible en la landing." : "Perfil oculto de la landing." };
}

export async function crearEspecialistaAdminAction(
  data: NuevoEspecialistaAdminFormData,
): Promise<ActionState & { specialistId?: string }> {
  await requireAdmin();

  const parsed = nuevoEspecialistaAdminFormSchema.safeParse(data);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
    return { status: "error", message: `Datos inválidos: ${fields}` };
  }
  const d = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: d.email } });
  if (existing) {
    return { status: "error", message: "Ya existe un usuario con ese correo electrónico." };
  }

  // El alta la hace el staff directamente (no pasa por el flujo de
  // auto-registro), así que la verificación queda aprobada de una vez y el
  // especialista aparece de inmediato en /app/especialistas.
  const tempPassword = randomBytes(9).toString("base64url");
  const hashedPassword = await hashPassword(tempPassword);
  const photoKey = await toPhotoKey(d.photoUrl);

  const specialist = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: d.email,
        username: `${d.firstName} ${d.paternalLastName}`,
        hashedPassword,
        role: UserRole.SPECIALIST,
      },
    });
    const kyc = await tx.kyc.create({ data: { status: "APPROVED", reviewedAt: new Date() } });
    return tx.specialist.create({
      data: {
        firstName: d.firstName,
        paternalLastName: d.paternalLastName,
        maternalLastName: d.maternalLastName || null,
        email: d.email,
        phone: d.phone,
        birthDate: new Date(d.birthDate),
        genre: d.gender,
        licenseNumber: d.licenseNumber || null,
        bio: d.bio || null,
        location: d.location || null,
        photoUrl: photoKey,
        kycId: kyc.id,
        userId: user.id,
        specialties: { connect: d.specialtyIds.map((id) => ({ id })) },
      },
    });
  });

  revalidatePath(APP_ROUTE.app.specialists.index);
  revalidatePath(APP_ROUTE.app.verification.index);
  revalidatePath("/app/dashboard");

  return {
    status: "success",
    message: `Especialista creado. Contraseña temporal para su acceso al portal: ${tempPassword}`,
    specialistId: specialist.id,
  };
}

// ---------- Sucursales ----------

export async function crearSucursalAction(data: SucursalData): Promise<ActionState & { sucursalId?: string }> {
  await requireAdmin();

  const parsed = sucursalSchema.safeParse(data);
  if (!parsed.success) return { status: "error", message: "Datos inválidos." };

  const sucursal = await prisma.sucursal.create({ data: parsed.data });
  revalidatePath(APP_ROUTE.app.sucursales.index);

  return { status: "success", message: "Sucursal creada.", sucursalId: sucursal.id };
}

export async function actualizarSucursalAction(sucursalId: string, data: SucursalData): Promise<ActionState> {
  await requireAdmin();

  const parsed = sucursalSchema.safeParse(data);
  if (!parsed.success) return { status: "error", message: "Datos inválidos." };

  await prisma.sucursal.update({ where: { id: sucursalId }, data: parsed.data });
  revalidatePath(APP_ROUTE.app.sucursales.index);
  revalidatePath(`${APP_ROUTE.app.sucursales.index}/${sucursalId}`);

  return { status: "success", message: "Sucursal actualizada." };
}

// ---------- Consultorios ----------

export async function crearConsultorioAction(data: ConsultorioData): Promise<ActionState & { consultorioId?: string }> {
  await requireAdmin();

  const parsed = consultorioSchema.safeParse(data);
  if (!parsed.success) return { status: "error", message: "Datos inválidos." };

  const consultorio = await prisma.consultorio.create({ data: parsed.data });
  revalidatePath(APP_ROUTE.app.consultorios.index);

  return { status: "success", message: "Consultorio creado.", consultorioId: consultorio.id };
}

export async function actualizarConsultorioAction(consultorioId: string, data: ConsultorioData): Promise<ActionState> {
  await requireAdmin();

  const parsed = consultorioSchema.safeParse(data);
  if (!parsed.success) return { status: "error", message: "Datos inválidos." };

  await prisma.consultorio.update({ where: { id: consultorioId }, data: parsed.data });
  revalidatePath(APP_ROUTE.app.consultorios.index);
  revalidatePath(`${APP_ROUTE.app.consultorios.index}/${consultorioId}`);

  return { status: "success", message: "Consultorio actualizado." };
}

export async function toggleConsultorioActiveAction(consultorioId: string, isActive: boolean): Promise<void> {
  await requireAdmin();

  await prisma.consultorio.update({ where: { id: consultorioId }, data: { isActive } });
  revalidatePath(APP_ROUTE.app.consultorios.index);
}

// ---------- Reservas ----------
// Integridad de no-solape en dos capas: constraint EXCLUDE USING gist a
// nivel BD (fuente de verdad, ver prisma/migrations) + este chequeo
// transaccional, que además de servir de defensa en profundidad, convierte
// el error crudo de Postgres en un mensaje de negocio legible.

class ReservationOverlapError extends Error {}

function estimatePrice(
  type: "FULL_DAY" | "HOURLY",
  startAt: Date,
  endAt: Date,
  rates: { hourlyRate: number | null; dayRate: number | null },
): number | null {
  if (type === "FULL_DAY") return rates.dayRate ?? null;
  if (!rates.hourlyRate) return null;
  const hours = (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60);
  return Math.round(rates.hourlyRate * hours);
}

async function createReservationTx(d: {
  consultorioId: string;
  specialistId: string;
  type: "FULL_DAY" | "HOURLY";
  startAt: string;
  endAt: string;
  notes?: string;
  createdBy?: string;
}): Promise<ActionState & { reservationId?: string }> {
  try {
    const reservation = await prisma.$transaction(async (tx) => {
      const overlapping = await tx.reservation.findFirst({
        where: {
          consultorioId: d.consultorioId,
          status: { in: ["PENDING", "CONFIRMED"] },
          startAt: { lt: new Date(d.endAt) },
          endAt: { gt: new Date(d.startAt) },
        },
        select: { id: true },
      });
      if (overlapping) throw new ReservationOverlapError();

      const consultorio = await tx.consultorio.findUnique({
        where: { id: d.consultorioId },
        select: { hourlyRate: true, dayRate: true },
      });
      const priceApplied = consultorio
        ? estimatePrice(d.type, new Date(d.startAt), new Date(d.endAt), consultorio)
        : null;

      return tx.reservation.create({
        data: {
          consultorioId: d.consultorioId,
          specialistId: d.specialistId,
          type: d.type,
          startAt: new Date(d.startAt),
          endAt: new Date(d.endAt),
          notes: d.notes || null,
          priceApplied,
          createdBy: d.createdBy,
        },
      });
    });

    revalidatePath(APP_ROUTE.app.reservas.index);
    revalidatePath(APP_ROUTE.app.agenda.index);
    revalidatePath(APP_ROUTE.app.specialist.agenda);

    return { status: "success", message: "Reserva creada.", reservationId: reservation.id };
  } catch (err) {
    // The findFirst check above catches the common case; the DB's EXCLUDE
    // constraint (code 23P01) is the real guarantee under concurrent writes
    // — two requests can both pass the check and race to insert.
    const isOverlap =
      err instanceof ReservationOverlapError ||
      (err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "23P01");
    if (isOverlap) {
      return { status: "error", message: "Ese consultorio ya está reservado en esa franja horaria." };
    }
    throw err;
  }
}

export async function crearReservationAction(data: ReservationData): Promise<ActionState & { reservationId?: string }> {
  const session = await requireAdmin();

  const parsed = reservationSchema.safeParse(data);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  return createReservationTx({ ...parsed.data, createdBy: session.username || session.email });
}

// Portal del especialista: apartar/rentar un consultorio. El especialista
// nunca elige a nombre de quién reserva — specialistId sale de su propia
// sesión, no del formulario.
export async function crearReservationEspecialistaAction(
  data: ReservationSelfData,
): Promise<ActionState & { reservationId?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE);
  const session = token ? await verifySessionToken(token.value) : null;

  if (!session || session.role !== "SPECIALIST") {
    redirect(APP_ROUTE.app.login.index);
  }

  const parsed = reservationSelfSchema.safeParse(data);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const specialist = await prisma.specialist.findUnique({
    where: { userId: session.sub },
    select: { id: true, kyc: { select: { status: true } } },
  });
  if (!specialist) redirect(APP_ROUTE.app.login.index);
  if (specialist.kyc.status !== "APPROVED") {
    return { status: "error", message: "Solo puedes reservar consultorios con tu perfil ya aprobado." };
  }

  return createReservationTx({
    ...parsed.data,
    specialistId: specialist.id,
    createdBy: session.username || session.email,
  });
}

export async function cambiarStatusReservationAction(
  reservationId: string,
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW",
): Promise<ActionState> {
  await requireAdmin();

  await prisma.reservation.update({ where: { id: reservationId }, data: { status } });
  revalidatePath(APP_ROUTE.app.reservas.index);
  revalidatePath(APP_ROUTE.app.agenda.index);

  return { status: "success", message: "Reserva actualizada." };
}

// ---------- Cobros ----------

export async function crearChargeAction(data: ChargeData): Promise<ActionState> {
  await requireAdmin();

  const parsed = chargeSchema.safeParse(data);
  if (!parsed.success) return { status: "error", message: "Datos inválidos." };

  await prisma.charge.create({
    data: {
      reservationId: parsed.data.reservationId,
      amount: parsed.data.amount,
      method: parsed.data.method,
      status: "PENDING",
    },
  });
  revalidatePath(APP_ROUTE.app.cobros.index);

  return { status: "success", message: "Cobro registrado." };
}

export async function actualizarChargeStatusAction(
  chargeId: string,
  status: "PENDING" | "PAID" | "WAIVED",
): Promise<ActionState> {
  await requireAdmin();

  await prisma.charge.update({
    where: { id: chargeId },
    data: { status, paidAt: status === "PAID" ? new Date() : null },
  });
  revalidatePath(APP_ROUTE.app.cobros.index);

  return { status: "success", message: "Cobro actualizado." };
}
