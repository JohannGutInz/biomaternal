# Commit Convention

Do **not** add `Co-Authored-By: Claude` (or any Claude/Anthropic co-author trailer) to commit messages.

---

# Code Language Convention

**All code is written in English**: variable/function/type/component names, comments, file and directory names inside `src/`.

**Paths and similar stay in Spanish**: URL routes/folders under `src/app/`, and anything user-facing (UI copy, labels, zod validation messages, emails) — this is a Spanish-market product.

---

# UI Component Convention

Reusable UI primitives live in `src/components/ui/`. Before writing raw `<input>`, `<select>`, `<textarea>`, `<button>`, checkbox, color-picker, or toggle-switch markup, check if one already exists here and use it.

Current primitives: `Input` · `Select` · `Textarea` · `Button` · `Checkbox` · `ColorInput` · `Switch` · `Card` · `Badge` · `Avatar` · `Field` · `PageHeader` · `SearchForm` · `StatCard` · `StatusTabs` · `Table` · `ImageUpload` · `VideoUpload` · `MultiSelectPicker` · `LinkListInput`.

**When to extract a new one**: once a raw HTML pattern (markup + Tailwind classes) repeats across 2+ files, pull it into `src/components/ui/` instead of copy-pasting. Match the established API shape: `forwardRef`, spread native HTML attrs (`React.<Tag>HTMLAttributes<...>`), optional `label`/`error` props, `cn()` for className merging, same border/focus/error styling as `Input.tsx`.

---

# Project Resume

**Biomaternal Backoffice** — clinic/consultorio management platform for the Biomaternal clinics
(single client, not multi-tenant). Mid-pivot from a prior talent-agency codebase
("Backoffice Models") — see `CLAUDE-biomaternal.md` for the full pivot doc and phased roadmap.
Fase 0 (rebranding + retiring agency-only modules) is done; `Sucursal`/`Consultorio`/
`Reservation`/`Charge` and the `Model`→`Specialist` entity rename land in Fase 1.

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

`User` · `Model` · `Kyc` · `Category` · `Activity` · `Country` · `State` · `Municipality` · `Asset` · `ModelMedia`

`UserRole {ADMIN, STAFF, SPECIALIST}` — renamed from `{ADMIN, USER, MODEL}` in Fase 0.
`Model` still carries its pre-pivot talent-agency attributes; renaming it to `Specialist` with
professional attributes (`licenseNumber`, specialties, etc.) is Fase 1 scope.

KYC statuses: `PENDING` · `APPROVED` · `REJECTED` · `REQUIRES_CHANGES`

Retired in Fase 0 (tables dropped, data backed up to `backups/fase0-pre-migration-backup.json`,
gitignored): `Package`, `Convocatoria`, `ConvocatoriaVista`, `EventoFoto`.

## Routes

### Public (`src/app/(public)/`)

| Path | Description |
|---|---|
| `/` | Landing page |
| `/portafolio` | Portfolio (stubbed, no data source yet) |
| `/talentos` | Public talent grid |
| `/talentos/[id]` | Individual talent profile |
| `/registro` | Model self-registration form |
| `/contacto` | Contact form |
| `/retro/[token]` | Feedback page for rejected/requires-changes models |
| `/servicios`, `/cobertura`, `/como-trabajamos`, `/razones`, `/historia`, `/mision-vision`, `/privacidad` | Static marketing pages — still talent-agency copy, pending Fase 2 landing rewrite |

### Private (`src/app/app/(private)/`) — requires auth (STAFF/ADMIN)

| Path | Description |
|---|---|
| `/app/login` | Login |
| `/app/dashboard` | Dashboard (stats, alerts, quick actions) |
| `/app/modelos` | Models list |
| `/app/modelos/[id]` | Model detail |
| `/app/moderacion` | KYC moderation queue |
| `/app/moderacion/[id]` | KYC review detail |
| `/app/catalogs` | Catalogs |
| `/app/configuracion` | Site/brand settings |

### Specialist portal (`src/app/app/(model)/`) — requires auth (SPECIALIST)

| Path | Description |
|---|---|
| `/app/modelo/perfil` | Own profile (photos, categories, KYC-gated editing) |

### API

| Path | Description |
|---|---|
| `/api/cron/purge-rechazados` | Cron — purge stale rejected models |
| `/api/upload/image`, `/api/upload/video-presign` | S3 upload endpoints |

## Key Files

- `src/db.ts` — Prisma client singleton (pg adapter)
- `src/lib/session.ts` — JWT session helpers
- `src/lib/actions.ts` — Server actions
- `src/lib/data.ts` — DB query helpers (private)
- `src/lib/public-data.ts` — DB query helpers (public)
- `src/lib/schemas.ts` — Zod schemas
- `prisma/schema.prisma` — DB schema
- `vercel.json` — Vercel config
