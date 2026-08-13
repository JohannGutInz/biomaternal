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

export const specialistEditSchema = specialistFieldsSchema.extend({
  isPublic: z.boolean(),
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
  notes: z.string().optional(),
});

const endAfterStartRefinement = {
  check: (d: { startAt: string; endAt: string }) => new Date(d.endAt) > new Date(d.startAt),
  message: "La hora de fin debe ser posterior a la de inicio.",
} as const;

export const reservationSchema = reservationBaseSchema.refine(endAfterStartRefinement.check, {
  message: endAfterStartRefinement.message,
  path: ["endAt"],
});

export type ReservationData = z.infer<typeof reservationSchema>;

// Portal del especialista: mismo formulario sin specialistId — se deriva de
// la sesión en el servidor, nunca se confía en lo que mande el cliente.
export const reservationSelfSchema = reservationBaseSchema.omit({ specialistId: true }).refine(endAfterStartRefinement.check, {
  message: endAfterStartRefinement.message,
  path: ["endAt"],
});

export type ReservationSelfData = z.infer<typeof reservationSelfSchema>;

export const chargeSchema = z.object({
  reservationId: z.string().min(1),
  amount: z.number().int().positive("El monto debe ser mayor a cero."),
  method: z.enum(["CASH", "TRANSFER", "CARD"], { error: "Selecciona un método de pago." }),
});

export type ChargeData = z.infer<typeof chargeSchema>;
