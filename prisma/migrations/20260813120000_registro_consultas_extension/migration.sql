-- Extensión del dominio de reservas/especialistas + 4 entidades de seguimiento
-- de recepción, según registro-consultas.md (especificación del negocio real).
--
-- NOTA: el diff generado por `prisma migrate diff` también proponía
-- `DROP TABLE "eventos"`, `"portfolio_entries"`, `"portfolio_fotos"` — son
-- drift preexistente (tablas huérfanas de antes del pivote a Biomaternal, no
-- declaradas en ninguna versión de schema.prisma, ver AGENTS.md "Known
-- pre-existing drift"). Se excluyen a propósito de esta migración, igual que
-- en 20260813000000.

-- CreateEnum
CREATE TYPE "InbodyClientType" AS ENUM ('CORPORATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "CallDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "B2bStatus" AS ENUM ('INTERESTED', 'NEGOTIATING', 'CONFIRMED', 'DISCARDED');

-- AlterEnum
ALTER TYPE "ReservationStatus" ADD VALUE 'POSTPONED';

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "cancellation_reason" TEXT,
ADD COLUMN     "inbody_included" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "patient_name" TEXT,
ADD COLUMN     "patient_phone" TEXT;

-- AlterTable
ALTER TABLE "specialists" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "default_consultorio_id" TEXT;

-- CreateTable
CREATE TABLE "inbody_sales" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "client_name" TEXT NOT NULL,
    "client_phone" TEXT,
    "type" "InbodyClientType" NOT NULL,
    "price" INTEGER NOT NULL,
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inbody_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_requests" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "contact" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL,
    "decline_reason" TEXT,
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "specialist_id" TEXT,
    "reservation_id" TEXT,

    CONSTRAINT "whatsapp_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_logs" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "contact_name" TEXT NOT NULL,
    "direction" "CallDirection" NOT NULL,
    "is_new_contact" BOOLEAN NOT NULL,
    "generated_appointment" BOOLEAN NOT NULL,
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "b2b_prospects" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "specialist_name" TEXT NOT NULL,
    "status" "B2bStatus" NOT NULL DEFAULT 'INTERESTED',
    "schedule_incident" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "specialty_id" TEXT,

    CONSTRAINT "b2b_prospects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_requests_reservation_id_key" ON "whatsapp_requests"("reservation_id");

-- AddForeignKey
ALTER TABLE "specialists" ADD CONSTRAINT "specialists_default_consultorio_id_fkey" FOREIGN KEY ("default_consultorio_id") REFERENCES "consultorios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_requests" ADD CONSTRAINT "whatsapp_requests_specialist_id_fkey" FOREIGN KEY ("specialist_id") REFERENCES "specialists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_requests" ADD CONSTRAINT "whatsapp_requests_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "b2b_prospects" ADD CONSTRAINT "b2b_prospects_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
