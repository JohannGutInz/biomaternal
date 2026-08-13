-- Fase 1: dominio de clinicas (nucleo)
-- Model -> Specialist (sin atributos de talento ni geografia relacional),
-- Category/Activity -> Specialty, retira Country/State/Municipality/Asset/
-- ModelMedia; agrega Sucursal, Consultorio, ConsultorioFoto, Reservation,
-- Charge. La tabla "models" esta vacia en esta base (Biomaternal, separada
-- de la produccion vieja restaurada en Fase 0) — sin datos que respaldar.
--
-- Excluye a proposito: DROP de "eventos"/"portfolio_entries"/"portfolio_fotos"
-- — tablas huerfanas no declaradas en ninguna version de schema.prisma,
-- deuda tecnica preexistente sin relacion con este cambio (ver nota en
-- Fase 0). No se tocan aqui tampoco.

-- ---------- Enums nuevos ----------

CREATE TYPE "Genre" AS ENUM ('MALE', 'FEMALE');
CREATE TYPE "ReservationType" AS ENUM ('FULL_DAY', 'HOURLY');
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');
CREATE TYPE "ChargeStatus" AS ENUM ('PENDING', 'PAID', 'WAIVED');
CREATE TYPE "ChargeMethod" AS ENUM ('CASH', 'TRANSFER', 'CARD');

-- ---------- Retira el dominio de talento ----------

ALTER TABLE "_ActivityToModel" DROP CONSTRAINT "_ActivityToModel_A_fkey";
ALTER TABLE "_ActivityToModel" DROP CONSTRAINT "_ActivityToModel_B_fkey";
ALTER TABLE "_CategoryToModel" DROP CONSTRAINT "_CategoryToModel_A_fkey";
ALTER TABLE "_CategoryToModel" DROP CONSTRAINT "_CategoryToModel_B_fkey";
ALTER TABLE "assets" DROP CONSTRAINT "assets_model_id_fkey";
ALTER TABLE "model_media" DROP CONSTRAINT "model_media_model_id_fkey";
-- "eventos" is one of the orphaned tables not declared in schema.prisma (see
-- note above) — its FK to models blocks DROP TABLE models below. Drop just
-- the constraint; the eventos table and its rows are untouched.
ALTER TABLE "eventos" DROP CONSTRAINT "eventos_modelo_id_fkey";
ALTER TABLE "models" DROP CONSTRAINT "models_city_id_fkey";
ALTER TABLE "models" DROP CONSTRAINT "models_country_id_fkey";
ALTER TABLE "models" DROP CONSTRAINT "models_kyc_id_fkey";
ALTER TABLE "models" DROP CONSTRAINT "models_nationality_id_fkey";
ALTER TABLE "models" DROP CONSTRAINT "models_user_id_fkey";
ALTER TABLE "municipalities" DROP CONSTRAINT "municipalities_state_id_fkey";
ALTER TABLE "states" DROP CONSTRAINT "states_country_id_fkey";

DROP TABLE "_ActivityToModel";
DROP TABLE "_CategoryToModel";
DROP TABLE "activities";
DROP TABLE "assets";
DROP TABLE "categories";
DROP TABLE "countries";
DROP TABLE "model_media";
DROP TABLE "models";
DROP TABLE "municipalities";
DROP TABLE "states";

DROP TYPE "AssetType";
DROP TYPE "MediaType";
DROP TYPE "ModelGenre";
DROP TYPE "PantsSizeScale";
DROP TYPE "ShirtSize";

-- ---------- Catalogo de especialidades ----------

CREATE TABLE "specialties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "specialties_name_key" ON "specialties"("name");

-- ---------- Specialist ----------

CREATE TABLE "specialists" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "paternal_last_name" TEXT NOT NULL,
    "maternal_last_name" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "birth_date" DATE NOT NULL,
    "genre" "Genre" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "license_number" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "photo_url" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "internal_notes" TEXT,
    "kyc_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "specialists_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "specialists_email_key" ON "specialists"("email");
CREATE UNIQUE INDEX "specialists_kyc_id_key" ON "specialists"("kyc_id");
CREATE UNIQUE INDEX "specialists_user_id_key" ON "specialists"("user_id");

ALTER TABLE "specialists" ADD CONSTRAINT "specialists_kyc_id_fkey" FOREIGN KEY ("kyc_id") REFERENCES "kycs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "specialists" ADD CONSTRAINT "specialists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "_SpecialistToSpecialty" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SpecialistToSpecialty_AB_pkey" PRIMARY KEY ("A","B")
);

CREATE INDEX "_SpecialistToSpecialty_B_index" ON "_SpecialistToSpecialty"("B");

ALTER TABLE "_SpecialistToSpecialty" ADD CONSTRAINT "_SpecialistToSpecialty_A_fkey" FOREIGN KEY ("A") REFERENCES "specialists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_SpecialistToSpecialty" ADD CONSTRAINT "_SpecialistToSpecialty_B_fkey" FOREIGN KEY ("B") REFERENCES "specialties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------- Sucursal / Consultorio ----------

CREATE TABLE "sucursales" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/Mazatlan',
    "open_time" TEXT NOT NULL,
    "close_time" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sucursales_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "consultorios" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "floor" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "hourly_rate" INTEGER,
    "day_rate" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sucursal_id" TEXT NOT NULL,

    CONSTRAINT "consultorios_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "consultorios" ADD CONSTRAINT "consultorios_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "consultorio_fotos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consultorio_id" TEXT NOT NULL,

    CONSTRAINT "consultorio_fotos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "consultorio_fotos_consultorio_id_position_key" ON "consultorio_fotos"("consultorio_id", "position");

ALTER TABLE "consultorio_fotos" ADD CONSTRAINT "consultorio_fotos_consultorio_id_fkey" FOREIGN KEY ("consultorio_id") REFERENCES "consultorios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------- Reservation (con integridad de no-solape) ----------

CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "type" "ReservationType" NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "price_applied" INTEGER,
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consultorio_id" TEXT NOT NULL,
    "specialist_id" TEXT NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reservations_consultorio_id_idx" ON "reservations"("consultorio_id");
CREATE INDEX "reservations_specialist_id_idx" ON "reservations"("specialist_id");

ALTER TABLE "reservations" ADD CONSTRAINT "reservations_consultorio_id_fkey" FOREIGN KEY ("consultorio_id") REFERENCES "consultorios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_specialist_id_fkey" FOREIGN KEY ("specialist_id") REFERENCES "specialists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- btree_gist habilita EXCLUDE con igualdad (consultorio_id) combinada con
-- solape de rango (tsrange) en el mismo constraint.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Ninguna reserva PENDING/CONFIRMED puede solaparse con otra del mismo
-- consultorio en la misma franja [start_at, end_at). CANCELLED/COMPLETED/
-- NO_SHOW no cuentan — un consultorio vuelve a estar libre en esa franja.
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_no_overlap"
  EXCLUDE USING gist (
    "consultorio_id" WITH =,
    tsrange("start_at", "end_at") WITH &&
  ) WHERE ("status" IN ('PENDING', 'CONFIRMED'));

-- ---------- Charge ----------

CREATE TABLE "charges" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "method" "ChargeMethod" NOT NULL,
    "status" "ChargeStatus" NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMP(3),
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reservation_id" TEXT NOT NULL,

    CONSTRAINT "charges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "charges_reservation_id_key" ON "charges"("reservation_id");

ALTER TABLE "charges" ADD CONSTRAINT "charges_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
