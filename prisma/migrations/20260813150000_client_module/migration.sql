-- Módulo de Clientes: normaliza el "paciente"/"contacto" de texto libre en
-- Reservation/InbodySale/WhatsappRequest/CallLog hacia una entidad Client
-- compartida, vinculando directamente citas, ventas InBody, WhatsApp y
-- llamadas a la misma persona.
--
-- Tablas afectadas estaban vacías o sin datos de paciente al momento de
-- escribir esta migración (reservations: 2 filas de prueba FULL_DAY sin
-- patient_name; inbody_sales/whatsapp_requests/call_logs: 0 filas) — no
-- se necesita backfill de datos.
--
-- NOTA: el diff generado también proponía `DROP TABLE "eventos"`,
-- `"portfolio_entries"`, `"portfolio_fotos"` — drift preexistente no
-- declarado en ningún schema.prisma (ver AGENTS.md "Known pre-existing
-- drift"). Se excluyen a propósito, igual que en migraciones anteriores.

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "reservations" DROP COLUMN "patient_name",
DROP COLUMN "patient_phone",
ADD COLUMN     "client_id" TEXT;

-- AlterTable
ALTER TABLE "inbody_sales" DROP COLUMN "client_name",
DROP COLUMN "client_phone",
ADD COLUMN     "client_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "whatsapp_requests" DROP COLUMN "contact",
ADD COLUMN     "client_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "call_logs" DROP COLUMN "contact_name",
ADD COLUMN     "client_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "reservations_client_id_idx" ON "reservations"("client_id");

-- CreateIndex
CREATE INDEX "inbody_sales_client_id_idx" ON "inbody_sales"("client_id");

-- CreateIndex
CREATE INDEX "whatsapp_requests_client_id_idx" ON "whatsapp_requests"("client_id");

-- CreateIndex
CREATE INDEX "call_logs_client_id_idx" ON "call_logs"("client_id");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbody_sales" ADD CONSTRAINT "inbody_sales_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_requests" ADD CONSTRAINT "whatsapp_requests_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
