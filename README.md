# Biomaternal Backoffice

Plataforma de gestión para las clínicas Biomaternal: administración de sucursales,
consultorios, especialistas médicos, reservas y cobros, con un portal público de
especialistas y un portal propio para que cada especialista gestione su perfil y agenda.

Un solo cliente, sin multi-tenant. Ver `CLAUDE-biomaternal.md` para la lógica de negocio y el
roadmap por fases completo.

## Stack

Next.js 16 (React 19, App Router) · TypeScript · Tailwind CSS 4 · Prisma 7 (`@prisma/adapter-pg`)
· PostgreSQL (Supabase) · Vercel · JWT (`jose`) · `react-hook-form` + `zod` · S3 (AWS o
compatible) para fotos.

## Desarrollo local

### 1. Variables de entorno

Copia `.env.example` a `.env` y completa:

```bash
# Supabase — dos connection strings distintas:
# Transaction pooler (6543), la usa la app en runtime — requiere ?pgbouncer=true
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Session pooler / conexión directa (5432), la usa Prisma solo para migrar
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"

# Sesión — genera uno nuevo por entorno, nunca reutilices el de otro despliegue
SESSION_JWT_SECRET=

# Storage (S3 o compatible) — bucket privado, forcePathStyle
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_ENDPOINT=https://s3.<region>.amazonaws.com
STORAGE_PUBLIC_URL=https://s3.<region>.amazonaws.com
STORAGE_REGION=<region>
STORAGE_BUCKET=<bucket>

# Opcionales — sin ellos el código cae a un fallback razonable
RESEND_API_KEY=
EMAIL_FROM=
STAFF_EMAIL=
SITE_URL=http://localhost:3000
CRON_SECRET=
```

### 2. Base de datos

```bash
npx prisma migrate deploy   # aplica todas las migraciones
npx tsx prisma/seed.ts      # especialidades base, 3 sucursales, usuario admin
```

### 3. Levantar la app

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | `prisma generate && next build` |
| `npm run lint` | ESLint |
| `npm run vercel-build` | `prisma migrate deploy && prisma generate && next build` — usado en Vercel |

## Estructura

- `src/app/(public)/` — landing, directorio público de especialistas, registro, contacto
- `src/app/app/(private)/` — backoffice (staff/admin): especialistas, verificación,
  sucursales, consultorios, agenda, reservas, cobros, catálogos, configuración
- `src/app/app/(specialist)/` — portal del especialista (perfil propio)
- `src/lib/actions.ts` / `data.ts` / `public-data.ts` — única capa que toca la base de datos
- `src/components/ui/` — primitivos de UI compartidos (incluye `Modal`, único primitivo
  de diálogo/overlay en todo el proyecto)
- `prisma/schema.prisma` — modelo de datos

Ver `AGENTS.md` para convenciones de código y el estado detallado de rutas/modelos.
