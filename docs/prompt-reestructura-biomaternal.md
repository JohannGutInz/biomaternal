# Prompt maestro — Reestructura Biomaternal (diseño + módulos + docs)

> Pégale este prompt al agente del proyecto padre (`CLAUDE.md` / `AGENTS.md`).
> Es la instrucción operativa para ejecutar la reestructura completa: **sistema de
> diseño azul + modales unificados**, **realineación de módulos/rutas a Fase 1** y
> **reescritura de los documentos `.md`**. La fuente de verdad del negocio es
> `CLAUDE-biomaternal.md`; este prompt no la reemplaza, la ejecuta.

---

## Objetivo

Migrar el backoffice del branding heredado "GlamourModels" (rosa/magenta, dominio de
agencia de talento) al producto real **Biomaternal** (azul, dominio de clínicas /
consultorios), dejando:

1. Un **sistema de diseño azul** consistente en todo el panel y la landing, alineado
   con el sitio público `https://clinicabiomaternal.com.mx/`.
2. Un **componente Modal unificado** en `src/components/ui/` que todos los modales
   reutilicen ("mismos modales" en toda la app).
3. Los **módulos y rutas** renombrados/creados según la Fase 1 del roadmap.
4. Los **documentos `.md`** (AGENTS, README, y el índice de rutas) actualizados y
   coherentes con el estado real del código.

**Restricción global:** no rompas build ni migraciones. Cada parte debe compilar
(`npm run build`) y pasar lint antes de considerarse terminada. Trabaja en cambios
pequeños y verificables.

---

## Convenciones que se respetan (de `AGENTS.md`)

- **Código en inglés**: nombres de variables, funciones, tipos, componentes, archivos
  y carpetas dentro de `src/`.
- **En español lo de cara al usuario**: rutas/carpetas bajo `src/app/`, copy de UI,
  labels, mensajes de validación zod y correos (producto para mercado mexicano).
- **Commits**: sin trailer `Co-Authored-By: Claude` ni similar.
- **Primitivos UI**: antes de escribir markup crudo, revisa `src/components/ui/` y
  reutiliza. Si un patrón se repite en 2+ archivos, extráelo como primitivo con la
  misma forma de API que `Input.tsx` (`forwardRef`, spread de attrs nativos, props
  opcionales `label`/`error`, `cn()` para merge de clases).

---

## PARTE A — Sistema de diseño azul + modal unificado

### A.1 Paleta de color (`src/app/globals.css`)

Hoy existen dos escalas rosas heredadas: `gold-*` (`#BA1B5D`, usada en el panel admin
y en `src/components/ui/`) y `glam-*` (`#E9006E`, usada en el sitio público
rediseñado). **Ambas deben desaparecer del uso visible** y reemplazarse por una escala
azul de marca.

Añade en el bloque `@theme inline` una escala **`brand-*`** (azul del logo Biomaternal)
y un acento **`accent-*`** (verde/lima del subrayado del logo). Valores propuestos —
ajusta `brand-500` al hex exacto muestreado del sitio público (el header ronda
`#17ACE3`):

```css
/* Azul de marca Biomaternal — reemplaza gold-*/glam-* */
--color-brand-50:  #eff9fe;
--color-brand-100: #d6f0fb;
--color-brand-200: #b0e3f8;
--color-brand-300: #7ad0f2;
--color-brand-400: #38b6e8;
--color-brand-500: #17ace3;  /* color primario (header/botones) */
--color-brand-600: #0d8bbd;
--color-brand-700: #0e6f97;
--color-brand-800: #125a7b;
--color-brand-900: #144c67;

/* Acento verde/lima del logo — usar con moderación (subrayados, badges de éxito) */
--color-accent-400: #a4ce4e;
--color-accent-500: #8cc63f;
--color-accent-600: #6ea62e;
```

Reglas:

- Reemplaza toda referencia `gold-*` y `glam-*` por su equivalente `brand-*` en `src/`
  (haz un grep exhaustivo: `gold-`, `glam-`, `#BA1B5D`, `#E9006E`, `bg-gold`, `text-glam`,
  etc.). El `::selection` que hoy usa `--color-gold-200` pasa a `--color-brand-200`.
- Cuando termines, **no debe quedar magenta/rosa** en la UI. Verifica con
  `grep -rn "gold-\|glam-\|BA1B5D\|E9006E" src/` → debe volver vacío.
- Actualiza también comentarios del CSS que mencionen "GlamourModels".
- Botón primario, foco de inputs, links activos del sidebar, tabs de estado activos y
  StatCards de acento pasan a `brand-500/600`.

### A.2 Componente Modal unificado (`src/components/ui/Modal.tsx`)

Hoy los modales están hechos a mano y duplicados (`ImageCropModal.tsx`,
`KycFeedbackModal.tsx`) con el patrón `fixed inset-0 z-50 flex items-center
justify-center bg-zinc-950/60 backdrop-blur-sm` + panel `rounded-2xl bg-white p-6
shadow-xl`. Extrae ese patrón a un primitivo único y migra todos los modales a él.

Requisitos del `Modal`:

- API: `open`, `onClose`, `title?`, `size?` (`sm | md | lg`), `dismissable?`
  (backdrop-click + tecla `Escape`; por defecto `true`), `footer?` y `children`.
- Overlay `bg-zinc-950/60 backdrop-blur-sm`, panel `rounded-2xl bg-white shadow-xl`,
  cierre con foco atrapado (focus trap) y `role="dialog"` + `aria-modal`.
- Respeta casos como `KycFeedbackModal`, que hoy **no** permite cerrar con backdrop/Esc
  → se modela con `dismissable={false}`.
- Header con `title` y botón de cierre (icono `X` de `lucide-react`) en `brand-*`.

Migra a este primitivo: `ImageCropModal`, `KycFeedbackModal` (→ renómbralo al dominio,
ver Parte B) y cualquier confirmación/dialog nueva. A partir de aquí, **ningún modal
se escribe a mano**; todos usan `ui/Modal`.

### A.3 Sección de Especialistas y landing

- La sección **Especialistas** (backoffice y landing pública) usa tarjetas y modales de
  detalle con el mismo primitivo `Modal` y la paleta `brand-*`.
- La landing pública replica el tono del sitio real: header azul `brand-500`, tipografía
  clara, tarjetas de especialidad (Nutrición, Rehabilitación, Psicología, Pedagogía,
  Médicos y Salud Integral, Pediatría) y las 3 sucursales (Anaya, La Primavera,
  Valle Alto). Solo lectura de datos públicos (nunca teléfono personal, tarifas internas,
  notas ni cobros).
- Agrega los primitivos `ui/*` que falten (p. ej. un `Modal`, y si repites patrones de
  tarjeta de especialista, un componente reutilizable) siguiendo la convención de API.

---

## PARTE B — Reestructura de módulos y rutas (Fase 1)

Realinea el código a los módulos definidos en `CLAUDE-biomaternal.md §7`. Trabaja
entidad por entidad, con su migración Prisma, sin romper lo existente.

### B.1 Renombres de rutas y dominios (mantener redirects si aplica)

| Actual | Nuevo | Nota |
|---|---|---|
| `src/app/app/(private)/modelos` | `.../especialistas` | Lista + detalle + nuevo |
| `src/app/app/(private)/moderacion` | `.../verificacion` | Bandeja de verificación (cédula/docs) |
| `src/app/app/(model)/modelo/perfil` | `src/app/app/(specialist)/especialista/perfil` | Portal del especialista |
| Copys `modelo(s)/talento` en UI | `especialista(s)` | Solo copy de cara al usuario |

Actualiza `src/lib/nav-config.ts` con los nuevos módulos y etiquetas en español.

### B.2 Módulos nuevos (rutas backoffice)

Crea, siguiendo el patrón CRUD existente (server actions + `ui/Table`, `PageHeader`,
`StatusTabs`, `ImageUpload`, formularios `react-hook-form` + `zod`):

- **Sucursales** — `.../sucursales` (alta/edición, horarios, consultorios asociados).
- **Consultorios** — `.../consultorios` (alta/edición, tarifas, fotos S3, estado).
- **Agenda / Calendario** — `.../agenda` (ocupación por sucursal/consultorio, crear/mover
  reservas; adapta `calendar-utils`/`calendario` si existen).
- **Reservas** — `.../reservas` (listado + filtros por sucursal/consultorio/especialista/estado).
- **Cobros** — `.../cobros` (registro manual y estatus de pago por reserva).
- **Catálogos** — adapta `catalogs` a **especialidades médicas** (`Specialty`).

### B.3 Modelo de datos (Prisma)

Aplica el mapeo de `CLAUDE-biomaternal.md §5–6`. Por cada cambio, una migración:

- Renombra/adapta `Model` → **`Specialist`** con atributos profesionales
  (`licenseNumber` = cédula, `specialties[]` M:N con `Specialty`, `bio`, `status`,
  `isPublic`, `internalNotes`). Retira los atributos de talento que ya no aplican
  (tallas, tatuajes, pasaporte, etc.) o muévelos si algún dato debe conservarse.
- `Category`/`Activity` → **`Specialty`** (catálogo, M:N con `Specialist`).
- Nuevas entidades: **`Sucursal`**, **`Consultorio`**, **`Reservation`**, **`Charge`**
  (+ `PricingRule` si se opta por tarifas flexibles; Fase 1 puede dejarlas fijas en
  `Consultorio`).
- Enums nuevos: `ReservationType {FULL_DAY, HOURLY}`,
  `ReservationStatus {PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW}`,
  `ChargeStatus {PENDING, PAID, WAIVED}`, `ChargeMethod {CASH, TRANSFER, CARD}`.
  Conserva `KycStatus` para verificación.
- Simplifica `Country/State/Municipality` a dirección libre por sucursal (evalúa
  retirarlos si ya nada los usa; respalda datos antes de dropear, como en Fase 0).
- **Integridad de reservas (crítico):** ninguna reserva puede solaparse en el mismo
  consultorio y franja `[startAt, endAt)`. Implementa constraint a nivel BD
  (`EXCLUDE USING gist` con rango temporal) **y** verificación transaccional en el
  servicio. No confíes solo en la UI.

### B.4 Capa de servidor

- Extiende `src/lib/actions.ts`, `data.ts` / `public-data.ts` y `schemas.ts` para las
  nuevas entidades, manteniendo el principio de **API central única** (solo el backend
  toca la BD; landing/backoffice/portal son clientes).
- **Separación público/privado estricta**: `public-data.ts` solo devuelve datos marcados
  como públicos.

---

## PARTE C — Reescritura de documentos `.md`

Deja la documentación coherente con el estado real tras A y B:

- **`AGENTS.md`**
  - Sección *Project Resume*: refleja Fase 1 aplicada (entidades y rutas nuevas).
  - Tabla *DB Models*: sustituye `Model/Category/Activity/Country/...` por
    `Specialist/Specialty/Sucursal/Consultorio/Reservation/Charge` y los enums nuevos.
  - Tablas *Routes*: actualiza a `especialistas`, `verificacion`, `sucursales`,
    `consultorios`, `agenda`, `reservas`, `cobros`, `(specialist)/especialista/perfil`.
  - *UI Component Convention*: añade **`Modal`** a la lista de primitivos.
- **`README.md`**: descripción del producto = plataforma de gestión de clínicas /
  consultorios Biomaternal (no agencia de talento); instrucciones de setup con
  Supabase (`DATABASE_URL` pooler 6543 + `?pgbouncer=true`, `DIRECT_URL` session
  pooler 5432) y S3.
- **`CLAUDE-biomaternal.md`**: se mantiene como fuente de verdad del negocio; solo
  actualiza el estado de cada fase (marca lo ya ejecutado) si cambia.
- Elimina/actualiza referencias remanentes a "GlamourModels", "models", "talento",
  "agencia" y "convocatorias" en cualquier `.md` (incluye `docs/`).

---

## Entregables y criterios de aceptación

1. `grep -rn "gold-\|glam-\|BA1B5D\|E9006E" src/` → **vacío**; UI en azul `brand-*`.
2. Existe `src/components/ui/Modal.tsx` y **todos** los modales lo usan (sin overlays
   hechos a mano).
3. Rutas renombradas + módulos nuevos presentes en `nav-config.ts` y navegables.
4. Schema Prisma migrado (`Specialist`, `Specialty`, `Sucursal`, `Consultorio`,
   `Reservation`, `Charge` + enums); `prisma migrate deploy` corre limpio.
5. **No-solape de reservas** garantizado por constraint BD + servicio transaccional
   (con prueba que intente crear un solape y sea rechazado).
6. Landing pública muestra sucursales y especialistas públicos sin datos privados.
7. `AGENTS.md` y `README.md` reescritos y sin menciones al branding anterior.
8. `npm run build` y lint pasan.

## Orden sugerido de ejecución

1. **A.1** paleta azul (bajo riesgo, alto impacto visual) → build.
2. **A.2** `Modal` unificado + migrar modales existentes → build.
3. **B.3** schema Prisma + migraciones (entidad por entidad) → `migrate deploy`.
4. **B.1/B.2** renombre de rutas + módulos nuevos + `nav-config` → build.
5. **B.4** server actions/data/schemas + no-solape (con prueba).
6. **A.3** landing/Especialistas con la nueva paleta y modales.
7. **PARTE C** reescritura de `.md`.
8. Verificación final: los 8 criterios de aceptación.

> Al terminar cada bloque, corre `npm run build` + lint y haz un commit atómico
> (sin trailer de co-autoría). Si un paso rompe algo, detente y repórtalo antes de seguir.
