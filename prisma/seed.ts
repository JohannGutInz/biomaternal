import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@/generated/prisma/client";
import { hashPassword } from "@/lib/actions";

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL ?? "admin@biomaternal.local";
const DEFAULT_ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME ?? "Admin";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD ?? "Admin123!";

// Especialidades del sitio publico real (clinicabiomaternal.com.mx).
const SPECIALTIES = ["Nutrición", "Rehabilitación", "Psicología", "Pedagogía", "Médicos y Salud Integral", "Pediatría"];

const SUCURSALES = [
  { name: "Anaya", address: "Por definir", openTime: "09:00", closeTime: "20:00" },
  { name: "La Primavera", address: "Por definir", openTime: "09:00", closeTime: "20:00" },
  { name: "Valle Alto", address: "Por definir", openTime: "09:00", closeTime: "20:00" },
];

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding specialties...");
  await prisma.specialty.createMany({
    data: SPECIALTIES.map((name) => ({ name })),
    skipDuplicates: true,
  });

  console.log("Seeding sucursales...");
  for (const sucursal of SUCURSALES) {
    const existing = await prisma.sucursal.findFirst({ where: { name: sucursal.name } });
    if (!existing) await prisma.sucursal.create({ data: sucursal });
  }

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
  console.log(`✓ Specialties: ${SPECIALTIES.length}`);
  console.log(`✓ Sucursales: ${SUCURSALES.length}`);
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
