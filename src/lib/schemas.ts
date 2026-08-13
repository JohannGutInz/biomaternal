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

export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
});

export const settingsSchema = z.object({
  agencyName: z.string().min(1, "El nombre de la agencia es obligatorio."),
  primaryColor: z.string().min(1, "El color primario es obligatorio."),
  heroTitle: z.string().min(1, "El título es obligatorio."),
  heroSubtitle: z.string().min(1, "El subtítulo es obligatorio."),
});

export const resendApplicationSchema = z.object({
  fullName: z.string().min(1, "El nombre completo es obligatorio."),
  email: z.email("Correo electrónico inválido."),
  phone: z.string().min(1, "El teléfono es obligatorio."),
});

export const modelAttributesSchema = z.object({
  height: z.number({ error: "La estatura es obligatoria." }).int().positive(),
  currentWeight: z.number({ error: "El peso es obligatorio." }).int().positive(),
  hasVisibleTattoos: z.boolean(),
  shirtSize: z.enum(["XS", "S", "M", "L", "XL", "XXL"], { error: "Selecciona una talla de camisa." }),
  pantsSizeScale: z.enum(["MEN", "WOMEN"], { error: "Selecciona una escala de talla de pantalón." }),
  pantsSize: z.string().min(1, "La talla de pantalón es obligatoria."),
  travelAvailability: z.boolean(),
  hasPassport: z.boolean(),
  hasVisa: z.boolean(),
  categoryIds: z.array(z.string()).min(1, "Selecciona al menos una categoría."),
});

// Media fields shared by every place a model's gallery gets edited: the public
// registration form, the model's own profile portal, and the staff edit form.
export const modelMediaSchema = z.object({
  mainPhotoUrl: z.string().optional(),
  casualPhotoUrls: z.array(z.string()).max(5, "Máximo 5 fotos caseras."),
  bookPhotoUrls: z.array(z.string()).max(5, "Máximo 5 fotos de book."),
  eventPhotoUrls: z.array(z.string()).max(8, "Máximo 8 fotos de eventos."),
  presentationVideoUrl: z.string().optional(),
  campaignVideoLinks: z.array(z.string().min(1)).max(5, "Máximo 5 links de campañas."),
});

// The public registration form collects the full profile up front — same attributes,
// availability, categories, and media the staff edit form manages — so a submission
// is moderation-ready immediately instead of waiting on a later profile-completion step.
export const registrationFormSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio."),
  paternalLastName: z.string().min(1, "El apellido paterno es obligatorio."),
  maternalLastName: z.string().optional(),
  email: z.email("Correo electrónico inválido."),
  phone: z.string().min(1, "El teléfono es obligatorio."),
  birthDate: z
    .string()
    .min(1, "La fecha de nacimiento es obligatoria.")
    .refine((v) => calculateAge(v) >= 18, "Solo aceptamos registros de personas mayores de 18 años."),
  gender: z.enum(["MALE", "FEMALE"], { error: "Selecciona un género." }),
  countryId: z.string().min(1, "Selecciona un país."),
  nationalityId: z.string().min(1, "Selecciona una nacionalidad."),
  stateId: z.string().min(1, "Selecciona un estado."),
  cityId: z.string().min(1, "Selecciona una ciudad."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  captchaAnswer: z.number({ error: "Ingresa la respuesta de verificación." }),
}).merge(modelMediaSchema).merge(modelAttributesSchema);

export const registrationActionSchema = registrationFormSchema.omit({
  stateId: true,
  captchaAnswer: true,
});

// Shared by the model's own profile portal and the staff edit form — both present
// the same profile fields; staff additionally get admin-only controls like visibility.
export const modelProfileFieldsSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio."),
  paternalLastName: z.string().min(1, "El apellido paterno es obligatorio."),
  maternalLastName: z.string().optional(),
  phone: z.string().min(1, "El teléfono es obligatorio."),
}).merge(modelMediaSchema).merge(modelAttributesSchema);

export const ownModelProfileSchema = modelProfileFieldsSchema;

export const modelEditSchema = modelProfileFieldsSchema.extend({
  hiddenFromCatalog: z.boolean(),
});

export type LoginData = z.infer<typeof loginSchema>;
export type ContactData = z.infer<typeof contactSchema>;
export type CategoryData = z.infer<typeof categorySchema>;
export type SettingsData = z.infer<typeof settingsSchema>;
export type ResendApplicationData = z.infer<typeof resendApplicationSchema>;
export type RegistrationFormData = z.infer<typeof registrationFormSchema>;
export type RegistrationActionData = z.infer<typeof registrationActionSchema>;
export type ModelAttributesData = z.infer<typeof modelAttributesSchema>;
export type OwnModelProfileData = z.infer<typeof ownModelProfileSchema>;
export type ModelEditData = z.infer<typeof modelEditSchema>;

export const nuevoModeloAdminFormSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio."),
  lastNameP: z.string().min(1, "El apellido paterno es obligatorio."),
  lastNameM: z.string().optional(),
  artisticName: z.string().optional(),
  nationality: z.string().optional(),
  email: z.string().email("Correo inválido."),
  phone: z.string().min(1, "El teléfono es obligatorio."),
  fechaNacimiento: z.string().min(1, "La fecha de nacimiento es obligatoria."),
  genre: z.enum(["MALE", "FEMALE"]),
  countryId: z.string().min(1),
  stateId: z.string().optional(),
  cityId: z.string().min(1),
  nationalityId: z.string().min(1),
  categoryIds: z.array(z.string()).min(1, "Selecciona al menos una categoría."),
  availableToTravel: z.boolean(),
  hasPassport: z.boolean(),
  hasVisaUS: z.boolean(),
  hasVisibleTattoos: z.boolean(),
  height: z.string().optional(),
  weight: z.string().optional(),
  shirtSize: z.string().optional(),
  pantsSize: z.string().optional(),
});

export type NuevoModeloAdminFormData = z.infer<typeof nuevoModeloAdminFormSchema>;
