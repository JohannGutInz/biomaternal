import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@/generated/prisma/client";
import { hashPassword } from "@/lib/actions";

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL ?? "admin@biomaternal.local";
const DEFAULT_ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME ?? "Admin";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD ?? "Admin123!";

const COUNTRIES = [
  {
    name: "México",
    label: "MX",
    demonym: "Mexicano",
    states: [
      {
        name: "Sinaloa",
        label: "SIN",
        municipalities: [
          { name: "Culiacán", label: "CLN" },
          { name: "Mazatlán", label: "MZT" },
          { name: "Los Mochis", label: "LMO" },
          { name: "Guamúchil", label: "GMC" },
        ],
      },
      {
        name: "Ciudad de México",
        label: "CDMX",
        municipalities: [
          { name: "Álvaro Obregón", label: "AO" },
          { name: "Azcapotzalco", label: "AZC" },
          { name: "Benito Juárez", label: "BJ" },
          { name: "Cuauhtémoc", label: "CUH" },
        ],
      },
      {
        name: "Jalisco",
        label: "JAL",
        municipalities: [
          { name: "Guadalajara", label: "GDL" },
          { name: "Zapopan", label: "ZAP" },
          { name: "Tlaquepaque", label: "TLQ" },
        ],
      },
      {
        name: "Nuevo León",
        label: "NL",
        municipalities: [
          { name: "Monterrey", label: "MTY" },
          { name: "San Pedro Garza García", label: "SPGG" },
          { name: "San Nicolás de los Garza", label: "SNG" },
        ],
      },
    ],
  },
  {
    name: "Colombia",
    label: "COL",
    demonym: "Colombiano",
    states: [
      {
        name: "Antioquia",
        label: "ANT",
        municipalities: [
          { name: "Medellín", label: "MDE" },
          { name: "Bello", label: "BEL" },
        ],
      },
      {
        name: "Cundinamarca",
        label: "CUN",
        municipalities: [
          { name: "Bogotá", label: "BOG" },
          { name: "Soacha", label: "SOA" },
        ],
      },
    ],
  },
];

const CATEGORIES = [
  "Casual",
  "Pasarela",
  "Editorial",
  "Comercial",
  "Fitness",
  "Belleza",
  "Alternativo",
];

const ACTIVITIES = [
  "Demostradora",
  "Promotoria MX",
  "Promotoria COL",
  "Edecanía COL",
  "Modelo de protocolo MX",
  "G.O.",
  "G.O/Promotor Perfumería",
  "Volantero",
  "Staff eventos",
  "Supervisión",
  "Coordinación",
  "Animación por micrófono",
  "Maestro de ceremonias",
  "Conducción de eventos",
  "Modelo para fotografía",
  "Modelo para videos musicales",
  "Modelo para comerciales",
  "Pasarela",
  "Actor",
  "Actriz",
  "Extra/figurante",
  "Personal para limpieza",
  "Personal para seguridad",
];

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedGeography() {
  for (const countryData of COUNTRIES) {
    const country = await prisma.country.upsert({
      where: { label: countryData.label },
      create: {
        name: countryData.name,
        label: countryData.label,
        demonym: countryData.demonym,
      },
      update: {
        name: countryData.name,
        demonym: countryData.demonym,
      },
    });

    for (const stateData of countryData.states) {
      const state = await prisma.state.upsert({
        where: { label: stateData.label },
        create: {
          name: stateData.name,
          label: stateData.label,
          countryId: country.id,
        },
        update: { name: stateData.name },
      });

      await prisma.municipality.createMany({
        data: stateData.municipalities.map((m) => ({
          name: m.name,
          label: m.label,
          stateId: state.id,
        })),
        skipDuplicates: true,
      });
    }
  }
}

async function main() {
  console.log("Seeding geography...");
  await seedGeography();

  console.log("Seeding categories...");
  await prisma.category.createMany({
    data: CATEGORIES.map((name) => ({ name })),
    skipDuplicates: true,
  });

  console.log("Seeding activities...");
  await prisma.activity.createMany({
    data: ACTIVITIES.map((name) => ({ name })),
    skipDuplicates: true,
  });

  console.log("Creating admin user...");
  const hashedPassword = await hashPassword(DEFAULT_ADMIN_PASSWORD);
  await prisma.user.upsert({
    where: { email: DEFAULT_ADMIN_EMAIL },
    create: {
      email: DEFAULT_ADMIN_EMAIL,
      username: DEFAULT_ADMIN_USERNAME,
      hashedPassword,
      role: UserRole.ADMIN,
    },
    update: {
      username: DEFAULT_ADMIN_USERNAME,
      hashedPassword,
    },
  });

  console.log(`✓ Admin: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
  console.log(`✓ Countries: ${COUNTRIES.length}`);
  console.log(`✓ Categories: ${CATEGORIES.length}`);
  console.log(`✓ Activities: ${ACTIVITIES.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
