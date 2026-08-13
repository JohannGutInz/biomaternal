import { z } from "zod";
import { calculateAge } from "./utils";

export const loginSchema = z.object({
  email: z.email("Correo electrónico inválido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

export const contactSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  company: z.string().optional(),
  email: z.email("Correo electrónico inválido."),
  message: z.string().min(1, "El mensaje es obligatorio."),
});

export const specialtySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
});

export const settingsSchema = z.object({
  agencyName: z.string().min(1, "El nombre es obligatorio."),
  primaryColor: z.string().min(1, "El color primario es obligatorio."),
  heroTitle: z.string().min(1, "El título es obligatorio."),
  heroSubtitle: z.string().min(1, "El subtítulo es obligatorio."),
});

export const resendApplicationSchema = z.object({
  fullName: z.string().min(1, "El nombre completo es obligatorio."),
  email: z.email("Correo electrónico inválido."),
  phone: z.string().min(1, "El teléfono es obligatorio."),
});

// Shared by the public registration form, the specialist's own profile
// portal, and the staff edit form — same professional attributes everywhere.
export const specialistFieldsSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio."),
  paternalLastName: z.string().min(1, "El apellido paterno es obligatorio."),
  maternalLastName: z.string().optional(),
  phone: z.string().min(1, "El teléfono es obligatorio."),
  licenseNumber: z.string().optional(),
  bio: z.string().max(2000, "La biografía es demasiado larga.").optional(),
  location: z.string().optional(),
  photoUrl: z.string().optional(),
  specialtyIds: z.array(z.string()).min(1, "Selecciona al menos una especialidad."),
});

export const registrationFormSchema = z.object({
  email: z.email("Correo electrónico inválido."),
  birthDate: z
    .string()
    .min(1, "La fecha de nacimiento es obligatoria.")
    .refine((v) => calculateAge(v) >= 18, "Solo aceptamos registros de personas mayores de 18 años."),
  gender: z.enum(["MALE", "FEMALE"], { error: "Selecciona un género." }),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  captchaAnswer: z.number({ error: "Ingresa la respuesta de verificación." }),
}).merge(specialistFieldsSchema);

export const registrationActionSchema = registrationFormSchema.omit({ captchaAnswer: true });

export const ownSpecialistProfileSchema = specialistFieldsSchema;

// active y defaultConsultorioId son operativos (recepción), no aplican al
// auto-registro público ni al perfil propio del especialista.
export const specialistEditSchema = specialistFieldsSchema.extend({
  isPublic: z.boolean(),
  active: z.boolean(),
  defaultConsultorioId: z.string().optional(),
});

export type LoginData = z.infer<typeof loginSchema>;
export type ContactData = z.infer<typeof contactSchema>;
export type SpecialtyData = z.infer<typeof specialtySchema>;
export type SettingsData = z.infer<typeof settingsSchema>;
export type ResendApplicationData = z.infer<typeof resendApplicationSchema>;
export type RegistrationFormData = z.infer<typeof registrationFormSchema>;
export type RegistrationActionData = z.infer<typeof registrationActionSchema>;
export type OwnSpecialistProfileData = z.infer<typeof ownSpecialistProfileSchema>;
export type SpecialistEditData = z.infer<typeof specialistEditSchema>;

export const nuevoEspecialistaAdminFormSchema = z.object({
  email: z.email("Correo electrónico inválido."),
  birthDate: z.string().min(1, "La fecha de nacimiento es obligatoria."),
  gender: z.enum(["MALE", "FEMALE"], { error: "Selecciona un género." }),
  defaultConsultorioId: z.string().optional(),
}).merge(specialistFieldsSchema);

export type NuevoEspecialistaAdminFormData = z.infer<typeof nuevoEspecialistaAdminFormSchema>;

// ---------- Sucursales / Consultorios ----------

export const sucursalSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  address: z.string().min(1, "La dirección es obligatoria."),
  phone: z.string().optional(),
  timezone: z.string().min(1, "La zona horaria es obligatoria."),
  openTime: z.string().min(1, "El horario de apertura es obligatorio."),
  closeTime: z.string().min(1, "El horario de cierre es obligatorio."),
  isActive: z.boolean(),
});

export type SucursalData = z.infer<typeof sucursalSchema>;

export const consultorioSchema = z.object({
  sucursalId: z.string().min(1, "Selecciona una sucursal."),
  name: z.string().min(1, "El nombre es obligatorio."),
  floor: z.string().optional(),
  description: z.string().optional(),
  hourlyRate: z.number().int().nonnegative().optional(),
  dayRate: z.number().int().nonnegative().optional(),
  isActive: z.boolean(),
});

export type ConsultorioData = z.infer<typeof consultorioSchema>;

// ---------- Reservas / Cobros ----------

const reservationBaseSchema = z.object({
  consultorioId: z.string().min(1, "Selecciona un consultorio."),
  specialistId: z.string().min(1, "Selecciona un especialista."),
  type: z.enum(["FULL_DAY", "HOURLY"], { error: "Selecciona el tipo de reserva." }),
  startAt: z.string().min(1, "La fecha/hora de inicio es obligatoria."),
  endAt: z.string().min(1, "La fecha/hora de fin es obligatoria."),
  // Una reserva HOURLY es una cita con un paciente puntual; una FULL_DAY es
  // la jornada completa de un especialista (varios pacientes), por eso el
  // paciente no aplica ahí — se exige solo cuando type = HOURLY (ver refine).
  patientName: z.string().optional(),
  patientPhone: z.string().optional(),
  inbodyIncluded: z.boolean(),
  notes: z.string().optional(),
});

const endAfterStartRefinement = {
  check: (d: { startAt: string; endAt: string }) => new Date(d.endAt) > new Date(d.startAt),
  message: "La hora de fin debe ser posterior a la de inicio.",
} as const;

const patientRequiredForHourlyRefinement = {
  check: (d: { type: string; patientName?: string }) => d.type !== "HOURLY" || !!d.patientName?.trim(),
  message: "El nombre del paciente es obligatorio para una cita por hora.",
} as const;

export const reservationSchema = reservationBaseSchema
  .refine(endAfterStartRefinement.check, { message: endAfterStartRefinement.message, path: ["endAt"] })
  .refine(patientRequiredForHourlyRefinement.check, { message: patientRequiredForHourlyRefinement.message, path: ["patientName"] });

export type ReservationData = z.infer<typeof reservationSchema>;

// Portal del especialista: mismo formulario sin specialistId — se deriva de
// la sesión en el servidor, nunca se confía en lo que mande el cliente.
export const reservationSelfSchema = reservationBaseSchema
  .omit({ specialistId: true })
  .refine(endAfterStartRefinement.check, { message: endAfterStartRefinement.message, path: ["endAt"] })
  .refine(patientRequiredForHourlyRefinement.check, { message: patientRequiredForHourlyRefinement.message, path: ["patientName"] });

export type ReservationSelfData = z.infer<typeof reservationSelfSchema>;

export const cancelReservationSchema = z.object({
  reservationId: z.string().min(1),
  cancellationReason: z.string().min(1, "El motivo de cancelación es obligatorio."),
});

export type CancelReservationData = z.infer<typeof cancelReservationSchema>;

// Al marcar una reserva como Realizada se puede capturar/ajustar el monto
// acordado y, si ya se cobró, generar el cobro correspondiente de una vez.
// Ambos campos son opcionales; el formulario normaliza "" / NaN a undefined
// vía `setValueAs` antes de que llegue aquí (ver CompleteReservationModal).
export const completeReservationSchema = z.object({
  reservationId: z.string().min(1),
  priceApplied: z.number().int().nonnegative().optional(),
  chargeMethod: z.enum(["CASH", "TRANSFER", "CARD"]).optional(),
});

export type CompleteReservationData = z.infer<typeof completeReservationSchema>;

export const chargeSchema = z.object({
  reservationId: z.string().min(1),
  amount: z.number().int().positive("El monto debe ser mayor a cero."),
  method: z.enum(["CASH", "TRANSFER", "CARD"], { error: "Selecciona un método de pago." }),
});

export type ChargeData = z.infer<typeof chargeSchema>;

// ---------- Seguimiento de recepción (InBody, WhatsApp, llamadas, B2B) ----------

export const inbodySaleSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria."),
  clientName: z.string().min(1, "El nombre del cliente es obligatorio."),
  clientPhone: z.string().optional(),
  type: z.enum(["CORPORATE", "PUBLIC"], { error: "Selecciona el tipo de cliente." }),
  price: z.number().int().nonnegative("El precio no puede ser negativo."),
  notes: z.string().optional(),
});

export type InbodySaleData = z.infer<typeof inbodySaleSchema>;

const whatsappRequestBaseSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria."),
  contact: z.string().min(1, "El nombre o teléfono del contacto es obligatorio."),
  specialistId: z.string().optional(),
  confirmed: z.boolean(),
  declineReason: z.string().optional(),
  notes: z.string().optional(),
});

export const whatsappRequestSchema = whatsappRequestBaseSchema.refine(
  (d) => d.confirmed || !!d.declineReason?.trim(),
  { message: "Indica el motivo si no se concretó la cita.", path: ["declineReason"] },
);

export type WhatsappRequestData = z.infer<typeof whatsappRequestSchema>;

export const callLogSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria."),
  contactName: z.string().min(1, "El nombre es obligatorio."),
  direction: z.enum(["INBOUND", "OUTBOUND"], { error: "Selecciona el tipo de llamada." }),
  isNewContact: z.boolean(),
  generatedAppointment: z.boolean(),
  notes: z.string().optional(),
});

export type CallLogData = z.infer<typeof callLogSchema>;

export const b2bProspectSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria."),
  specialistName: z.string().min(1, "El nombre del especialista interesado es obligatorio."),
  specialtyId: z.string().optional(),
  status: z.enum(["INTERESTED", "NEGOTIATING", "CONFIRMED", "DISCARDED"], { error: "Selecciona un estatus." }),
  scheduleIncident: z.boolean(),
  notes: z.string().optional(),
});

export type B2bProspectData = z.infer<typeof b2bProspectSchema>;
