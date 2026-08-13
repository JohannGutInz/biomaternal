# Commit Convention

Do **not** add `Co-Authored-By: Claude` (or any Claude/Anthropic co-author trailer) to commit messages.

---

# Code Language Convention

**All code is written in English**: variable/function/type/component names, comments, file and directory names inside `src/`.

**Paths and similar stay in Spanish**: URL routes/folders under `src/app/`, and anything user-facing (UI copy, labels, zod validation messages, emails) — this is a Spanish-market product.

---

# UI Component Convention

Reusable UI primitives live in `src/components/ui/`. Before writing raw `<input>`, `<select>`, `<textarea>`, `<button>`, checkbox, color-picker, toggle-switch, or modal/dialog markup, check if one already exists here and use it.

Current primitives: `Input` · `Select` · `Textarea` · `Button` · `Checkbox` · `ColorInput` · `Switch` · `Card` · `Badge` · `Avatar` · `Field` · `Modal` · `PageHeader` · `SearchForm` · `StatCard` · `StatusTabs` · `Table` · `ImageUpload` · `VideoUpload` · `MultiSelectPicker` · `LinkListInput`.

**When to extract a new one**: once a raw HTML pattern (markup + Tailwind classes) repeats across 2+ files, pull it into `src/components/ui/` instead of copy-pasting. Match the established API shape: `forwardRef`, spread native HTML attrs (`React.<Tag>HTMLAttributes<...>`), optional `label`/`error` props, `cn()` for className merging, same border/focus/error styling as `Input.tsx`.

**Modals**: never build an overlay by hand (`fixed inset-0 z-50 ...`). Use `ui/Modal` — `open`/`onClose`, `title?`, `size?` (`sm | md | lg | full`), `dismissable?` (default true; set `false` for must-acknowledge dialogs), `footer?`.

---

# Project Resume

**Biomaternal Backoffice** — clinic/consultorio management platform for the Biomaternal clinics
(single client, not multi-tenant). Fase 0 (rebranding) and Fase 1 (core clinic domain — see
`CLAUDE-biomaternal.md` for the full roadmap) are done. Brand color is blue (`brand-*`,
`#17ACE3`) — the pre-pivot pink/magenta palette (`gold-*`/`glam-*`) is fully retired.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.9 (React 19) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Database | PostgreSQL via **Supabase** |
| Deployment | **Vercel** (`vercel-build` script runs migrations) |
| Auth | Custom JWT sessions — `jose` (HS256), cookie `biomaternal_session`, 8h TTL |
| Forms | `react-hook-form` + `zod` |
| Charts | `recharts` |
| Email | `resend` |
| Icons | `lucide-react` |
| Passwords | `bcrypt` |
| Utilities | `clsx`, `dotenv` |

## DB Models (Prisma)

`User` · `Specialist` · `Specialty` · `Kyc` · `KycReviewLog` · `Sucursal` · `Consultorio` ·
`ConsultorioFoto` · `Reservation` · `Charge`

`UserRole {ADMIN, STAFF, SPECIALIST}`. `Specialist` is the Fase 1 evolution of the old `Model`:
no talent-agency attributes (sizes, tattoos, passport/visa) and no relational geography — just
`location` free text, `licenseNumber`, `bio`, `photoUrl` (single photo, not a categorized
gallery), `specialties[]` (M:N with `Specialty`, which merges the old `Category`+`Activity`).

`ReservationType {FULL_DAY, HOURLY}` · `ReservationStatus {PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW}` ·
`ChargeStatus {PENDING, PAID, WAIVED}` · `ChargeMethod {CASH, TRANSFER, CARD}` ·
`KycStatus {PENDING, APPROVED, REJECTED, REQUIRES_CHANGES}`.

**Reservation overlap integrity** (two layers, both required, neither sufficient alone):
1. DB constraint `reservations_no_overlap` — `EXCLUDE USING gist` (needs `btree_gist`) on
   `(consultorio_id WITH =, tsrange(start_at, end_at) WITH &&)` for `PENDING`/`CONFIRMED` rows.
2. Transactional check in `crearReservationAction` (`src/lib/actions.ts`) — explicit
   `findFirst` before insert, catches the DB exclusion-constraint error (`23P01`) as the
   race-condition fallback, and turns both into one readable message.

Retired in Fase 0 (data backed up to `backups/fase0-pre-migration-backup.json`, gitignored):
`Package`, `Convocatoria`, `ConvocatoriaVista`, `EventoFoto`. Retired in Fase 1 (no real data
existed for these on the Biomaternal DB — see git history if the old shape is ever needed):
`Model`, `Category`, `Activity`, `Country`, `State`, `Municipality`, `Asset`, `ModelMedia`.

**Known pre-existing drift**: `eventos`, `portfolio_entries`, `portfolio_fotos` tables exist in
the DB but are declared in no version of `schema.prisma` — orphaned from migration history
predating the Biomaternal pivot. Not touched by either Fase 0 or Fase 1 migrations.

## Routes

### Public (`src/app/(public)/`)

| Path | Description |
|---|---|
| `/` | Landing — hero, especialidades, sucursales, especialistas destacados |
| `/talentos` | Public specialist directory (filters: name, gender, specialty) |
| `/talentos/[id]` | Individual specialist profile |
| `/portafolio` | Portfolio (stubbed, no data source yet) |
| `/registro` | Specialist self-registration form |
| `/contacto` | Contact form |
| `/retro/[token]` | Feedback page for rejected/requires-changes registrations |
| `/servicios`, `/cobertura`, `/como-trabajamos`, `/razones`, `/historia`, `/mision-vision`, `/privacidad` | Static marketing pages — still talent-agency copy, pending a full content rewrite |

### Private (`src/app/app/(private)/`) — requires auth (STAFF/ADMIN)

| Path | Description |
|---|---|
| `/app/login` | Login |
| `/app/dashboard` | Dashboard (specialists, verification, sucursales, reservations stats) |
| `/app/especialistas` | Specialists list |
| `/app/especialistas/[id]` | Specialist detail |
| `/app/especialistas/nuevo`, `/app/especialistas/[id]/editar` | Create/edit specialist |
| `/app/verificacion` | KYC/verification queue |
| `/app/verificacion/[id]` | Verification review detail |
| `/app/sucursales` | Sucursales CRUD (modal create/edit) |
| `/app/consultorios` | Consultorios CRUD (modal create/edit, rates) |
| `/app/agenda` | Occupancy view, grouped by day, filterable by sucursal/date |
| `/app/reservas` | Reservations list, filter by status, create (modal), change status |
| `/app/cobros` | Manual charge registration per reservation, mark as paid |
| `/app/catalogs` | Specialty catalog |
| `/app/configuracion` | Site/brand settings |

### Specialist portal (`src/app/app/(specialist)/`) — requires auth (SPECIALIST)

| Path | Description |
|---|---|
| `/app/especialista/perfil` | Own profile (photo, specialties, bio, KYC-gated editing) |

### API

| Path | Description |
|---|---|
| `/api/cron/purge-rechazados` | Cron — purge stale rejected registrations |
| `/api/upload/image`, `/api/upload/video-presign` | S3 upload endpoints |

## Key Files

- `src/db.ts` — Prisma client singleton (pg adapter)
- `src/lib/session.ts` — JWT session helpers
- `src/lib/actions.ts` — Server actions (all mutations; every one calls `requireAdmin()` or checks the session itself)
- `src/lib/data.ts` — DB query helpers (private/backoffice)
- `src/lib/public-data.ts` — DB query helpers (public — never exposes phone, internal notes, rates, charges)
- `src/lib/schemas.ts` — Zod schemas
- `src/components/ui/Modal.tsx` — Unified modal primitive
- `prisma/schema.prisma` — DB schema
- `vercel.json` — Vercel config
