-- Fase 0: Rebranding Backoffice Models -> Biomaternal Backoffice
-- Written by hand (not `prisma migrate dev`) because:
--   1) UserRole value rename (USER->STAFF, MODEL->SPECIALIST) needs a data-safe
--      conversion, not a blind enum recreate.
--   2) The live DB already had untracked drift on `packages`/`_ModelToPackage`
--      (token vs public_token) from a prior manual change, which made the
--      shadow-DB diff in `migrate dev` refuse to run. Since this migration
--      drops those tables outright, the drift is moot.
-- A full data backup of packages/convocatorias/convocatoria_vistas/evento_fotos
-- was exported to backups/fase0-pre-migration-backup.json before this ran.

-- ---------- 1. UserRole: USER -> STAFF, MODEL -> SPECIALIST ----------

ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;

CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'STAFF', 'SPECIALIST');

ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING (
  CASE role::text
    WHEN 'MODEL' THEN 'SPECIALIST'
    WHEN 'USER' THEN 'STAFF'
    ELSE role::text
  END
)::"UserRole_new";

DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";

ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STAFF';

-- ---------- 2. Retire agency-specific modules ----------
-- Package, Convocatoria, ConvocatoriaVista, EventoFoto: out of scope for
-- Biomaternal (see CLAUDE-biomaternal.md section 5). Drop children before
-- parents to satisfy FK constraints.

DROP TABLE IF EXISTS "convocatoria_vistas";
DROP TABLE IF EXISTS "convocatorias";
DROP TABLE IF EXISTS "_ModelToPackage";
DROP TABLE IF EXISTS "packages";
DROP TABLE IF EXISTS "evento_fotos";

DROP TYPE IF EXISTS "ConvocatoriaStatus";
DROP TYPE IF EXISTS "PackageStatus";
