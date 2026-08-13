// Domain model v1 — talent agency backoffice, mid-pivot to Biomaternal
// (clinic operator, single client — see CLAUDE-biomaternal.md). `agencyId`
// is legacy scaffolding from the pre-pivot codebase, not a real tenant key.

import { User } from "@/generated/prisma/browser";

export type ModelStatus = "activo" | "borrador" | "inactivo";

export type ModelCategory =
  | "moda"
  | "comercial"
  | "editorial"
  | "fitness"
  | "promocional"
  | "influencer";

export interface Model {
  id: string;
  agencyId: string;
  modelNumber: string;
  stageName: string;
  legalName: string;
  birthDate: string;
  gender: "femenino" | "masculino" | "no binario";
  nationality: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    socialMedia?: string;
  };
  physical?: {
    heightCm?: number;
    measurements?: string;
    sizes?: string;
    hairColor?: string;
    eyeColor?: string;
    skinTone?: string;
  };
  category: ModelCategory;
  tags: string[];
  experienceLevel: "nuevo" | "intermedio" | "experimentado";
  mainPhotoUrl: string;
  bookUrls: string[];
  status: ModelStatus;
  featured: boolean;
  // Explicit curation: a model can be "activo" to operate bookings
  // without yet being ready/approved to show up in the public showcase.
  publicOnLanding: boolean;
  availability: "disponible" | "ocupado" | "no disponible";
  baseRate: number;
  internalNotes?: string;
  consent?: {
    accepted: boolean;
    date: string;
    documentVersion: string;
    scope: string;
  };
  createdAt: string;
}

export type ApplicationStatus =
  | "pendiente"
  | "requiere_cambios"
  | "aprobado"
  | "rechazado";

export interface RegistrationApplication {
  id: string;
  agencyId: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: Model["gender"];
  nationality: string;
  location: string;
  category: ModelCategory;
  photoUrl: string;
  status: ApplicationStatus;
  internalNote?: string;
  feedbackForModel?: string;
  submittedAt: string;
  updatedAt: string;
  reviewToken: string;
  rejectedAt?: string;
}

export type StaffRole = "admin" | "booker" | "moderador" | "finanzas";

export interface StaffUser {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  role: StaffRole;
  avatarInitials: string;
}

export interface SiteSettings {
  agencyId: string;
  agencyName: string;
  logoUrl: string;
  primaryColor: string;
  heroTitle: string;
  heroSubtitle: string;
  publicRegistrationActive: boolean;
  registrationLinkSlug: string;
}

// UserWithoutPassword
export type UserW = Omit<User, "hashedPassword">;
