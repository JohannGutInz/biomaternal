# CLAUDE-biomaternal.md — Lógica de negocio y roadmap (v1)

> Documento para presentar al proyecto padre (`CLAUDE.md` / `AGENTS.md`). Define el pivote
> de **Backoffice Models** (agencia de talento) a **Biomaternal Backoffice** (administrador de
> clínicas). Un solo cliente, **no multi-tenant**. Fase 1 = **gestión de consultorios** (sin
> pacientes ni expediente clínico).

---

## 1. Qué estamos construyendo

Una plataforma a la medida para las clínicas **Biomaternal**, con dos frentes sobre un mismo backend:

1. **Landing pública** — presencia de la marca, sucursales, especialistas destacados y contacto.
2. **Backoffice (ERP)** — panel interno donde recepción y administración gestionan **sucursales, consultorios, especialistas, reservas y cobros**, y consultan **KPIs de uso**.

Además, **portal del especialista** (login propio) para que cada especialista consulte su agenda y **aparte o rente consultorios** (completo o por hora).

Este es el producto real, no un prototipo: prioriza corrección, seguridad y mantenibilidad. Se reutiliza al máximo la arquitectura existente (Next.js 16 + Prisma + PostgreSQL/Supabase + S3 + Vercel).

### Contexto operativo (reglas del negocio)

- **3 sucursales**. Cada sucursal tiene varios **consultorios**.
- **~40 especialistas** por el conjunto de clínicas.
- Un especialista puede **apartar un consultorio completo** (bloque/jornada, tarifa fija) **o rentarlo por hora**.
- El objetivo del sistema es **controlar la ocupación de consultorios ligada a los especialistas**, registrar **cobros**, y producir **KPIs**: uso por consultorio/sucursal, horas rentadas, ingresos, especialistas más activos, huecos de disponibilidad.

---

## 2. Alcance de la Fase 1 (acordado)

**Incluye:** sucursales, consultorios, especialistas, reservas (completa y por hora), cobros y KPIs; portal de especialista con login; landing pública.

**Fuera de Fase 1 (fase 2+, no construir ahora):** pacientes y agenda de citas médicas, expediente/notas clínicas, facturación fiscal (CFDI), pagos en línea/pasarela, cumplimiento NOM-024 de expediente, gestión documental de contratos de renta, reportes financieros avanzados, roles granulares por sucursal.

---

## 3. Principios de arquitectura (no negociables)

- **API central única.** Solo el backend (server actions / route handlers) toca la base de datos. Landing, backoffice y portal del especialista son clientes.
- **NO multi-tenant.** Se elimina el `agency_id` conceptual. La partición operativa real es por **`Sucursal`** (branch), no por tenant. No se introduce lógica SaaS.
- **Separación estricta público / privado.** La landing solo consume lecturas de datos marcados como públicos (p. ej. especialistas con perfil público, info de sucursales). Nunca expone datos privados: teléfono personal, tarifas internas, notas, cobros.
- **Curaduría humana.** El alta/verificación de un especialista (cédula profesional, documentos) pasa por aprobación del staff antes de figurar como activo/público.
- **Object storage para material pesado.** Fotos de especialistas, fotos de consultorios/sucursales y documentos van a S3 con URLs firmadas y expiración. En la BD solo la referencia.
- **Integridad de reservas.** Ninguna reserva puede solaparse en el mismo consultorio y franja horaria. La no-superposición se valida en la capa de servidor (constraint + verificación transaccional), no solo en UI.

---

## 4. Stack (sin cambios)

Se conserva el stack actual del repo: **Next.js 16.2.9 (React 19), TypeScript 5, Tailwind 4, Prisma 7 (`@prisma/adapter-pg`), PostgreSQL (Supabase), Vercel, JWT con `jose` + cookie de sesión, `react-hook-form` + `zod`, `recharts`, `resend`, `bcrypt`, `lucide-react`.**

Cambio menor recomendado: renombrar la cookie de sesión `glamour_session` → `biomaternal_session` (`src/lib/session.ts`).

---

## 5. Mapeo de entidades: de Models a Biomaternal

La estrategia es **reutilizar y renombrar** donde el concepto es análogo, **añadir** el dominio de consultorios/reservas, y **retirar** lo específico de la agencia de talento.

| Actual (Models) | Biomaternal | Acción |
|---|---|---|
| `Model` (talento) | `Specialist` (especialista) | **Reutilizar y adaptar** atributos |
| `User` + `UserRole {ADMIN, USER, MODEL}` | `User` + `UserRole {ADMIN, STAFF, SPECIALIST}` | **Reutilizar**, renombrar roles |
| `Kyc` + `KycReviewLog` (moderación) | Verificación de especialista (cédula, docs) | **Reutilizar** el flujo de estados y bitácora |
| `Asset` / `ModelMedia` (fotos/video) | Foto de especialista, fotos de consultorio/sucursal | **Reutilizar** subida S3 |
| `Category` / `Activity` | `Specialty` (especialidad médica) | **Reutilizar** como catálogo |
| `Country`/`State`/`Municipality` | Direcciones de sucursal | **Simplificar** (dirección libre por sucursal) |
| `Package` / `ConvocatoriaVista` | — | **Retirar** |
| `Convocatoria` | — | **Retirar** |
| `EventoFoto` (carrusel) | Fotos de landing (opcional) | **Retirar o repurposar** |
| — | `Sucursal` (branch) | **Nuevo** |
| — | `Consultorio` (room) | **Nuevo** |
| — | `Reservation` (apartado/renta) | **Nuevo** |
| — | `Charge` (cobro) | **Nuevo** |
| — | `PricingRule` (tarifas por consultorio/hora/jornada) | **Nuevo** |

---

## 6. Modelo de datos (entidades núcleo Fase 1)

### `Sucursal` (branch)
`id, name, address, phone, timezone, openTime, closeTime, isActive, createdAt`
Relaciones: tiene muchos `Consultorio`. Horario base para validar reservas.

### `Consultorio` (room)
`id, sucursalId, name/number, floor?, description, isActive, hourlyRate?, dayRate?, createdAt`
Un consultorio pertenece a una sucursal. Tarifas pueden vivir aquí (simple) o en `PricingRule` (flexible). Fotos vía `Asset`.

### `Specialist` (especialista) — evolución de `Model`
- Identidad: `firstName, paternalLastName, maternalLastName, email (unique), phone, birthDate, genre`.
- Profesional: `licenseNumber` (cédula profesional), `specialties[]` (M:N con `Specialty`), `bio`, `photo` (Asset).
- Operativo (solo backoffice): `status` (borrador/activo), `isPublic` (aparece en landing), `internalNotes`.
- Verificación: relación 1:1 con `Kyc` (reusar estados `PENDING/APPROVED/REJECTED/REQUIRES_CHANGES`).
- Cuenta: relación 1:1 con `User` (rol `SPECIALIST`) para el portal.

### `Reservation` (reserva) — **entidad núcleo nueva**
`id, consultorioId, specialistId, type {FULL_DAY | HOURLY}, startAt, endAt, status {PENDING | CONFIRMED | CANCELLED | COMPLETED | NO_SHOW}, priceApplied, notes, createdBy, createdAt`
Reglas:
- Una reserva ocupa un `Consultorio` en una franja `[startAt, endAt)`.
- **No se permite solape** con otra reserva activa (CONFIRMED/PENDING) del mismo consultorio.
- `FULL_DAY` = jornada completa según horario de la sucursal; `HOURLY` = franja por horas.
- Origen: la crea el especialista (portal) o el staff (backoffice).

### `Charge` (cobro)
`id, reservationId, amount, currency, method {CASH | TRANSFER | CARD}, status {PENDING | PAID | WAIVED}, paidAt?, createdBy, createdAt`
Un cobro se liga a una reserva. En Fase 1 es **registro manual** (no pasarela). Base para KPIs de ingresos.

### `Specialty` (catálogo) — evolución de `Category/Activity`
`id, name (unique), enabled`. M:N con `Specialist`.

### Enums nuevos/renombrados
`UserRole {ADMIN, STAFF, SPECIALIST}` · `ReservationType {FULL_DAY, HOURLY}` · `ReservationStatus {PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW, POSTPONED}` · `ChargeStatus {PENDING, PAID, WAIVED}` · `ChargeMethod {CASH, TRANSFER, CARD}`. Se conserva `KycStatus` para verificación.

### Seguimiento de recepción (`registro-consultas.md`, ver Fase 2.5)

`Reservation` se extendió con `patientName`, `patientPhone`, `cancellationReason`, `inbodyIncluded`
(la cita con paciente vive en la misma tabla que la reserva del consultorio, no en una entidad
aparte — ver decisión en Fase 2.5). Cuatro entidades nuevas, independientes de `Reservation`:
`InbodySale`, `WhatsappRequest`, `CallLog`, `B2bProspect`. `Specialist` ganó `active` (estatus
operativo) y `defaultConsultorioId` (consultorio habitual). El detalle campo por campo está en
`registro-consultas.md`, que es la especificación funcional que se siguió al pie de la letra —
este documento no la duplica.

---

## 7. Módulos del backoffice (Fase 1)

- **Dashboard** — KPIs y pendientes (reutiliza `dashboard/` + `recharts`).
- **Sucursales** — alta/edición, horarios, consultorios asociados (nuevo).
- **Consultorios** — alta/edición, tarifas, fotos, estado (nuevo).
- **Especialistas** — alta manual + verificación; perfil, especialidades, visibilidad pública (adapta módulo `modelos`).
- **Verificación** — bandeja de aprobación de especialistas con estados y bitácora (adapta `moderacion`).
- **Agenda / Calendario** — vista de ocupación por sucursal y consultorio; crear/mover reservas (adapta `calendario` + `calendar-utils.ts`).
- **Reservas** — listado, filtros por sucursal/consultorio/especialista/estado (nuevo, base en `bookings`).
- **Cobros** — registro y estatus de pagos por reserva (adapta `ingresos`).
- **Catálogos** — especialidades (adapta `catalogs`).
- **Configuración** — datos de marca, textos de landing, visibilidad del registro (adapta `configuracion`).

### Portal del especialista (`(model)` → `(specialist)`)
- Ver su agenda (sus reservas por sucursal/consultorio).
- **Apartar/rentar** un consultorio: elegir sucursal → consultorio → tipo (jornada/hora) → franja disponible → confirmar.
- Ver el costo estimado (tarifa aplicada) y el estatus del cobro.
- Editar su perfil público (foto, bio, especialidades) sujeto a re-verificación.

---

## 8. KPIs (objetivo del sistema)

Calculables sobre `Reservation` + `Charge` + `Consultorio` + `Sucursal`:

- **Ocupación** por consultorio y por sucursal (% de horas reservadas vs. disponibles, por día/semana/mes).
- **Horas rentadas** y **jornadas apartadas** por periodo.
- **Ingresos** por sucursal, por consultorio y por especialista; cobrado vs. pendiente.
- **Especialistas más activos** (reservas y horas).
- **Huecos de disponibilidad** (franjas libres por consultorio) para maximizar uso.
- **No-shows / cancelaciones** por especialista y consultorio.

---

## 9. Roadmap por fases

### Fase 0 — Rebranding y limpieza (base) ✅ completa
1. ✅ Renombrar proyecto, cookie de sesión y copys `glamour/models` → `biomaternal`.
2. ✅ Ajustar `UserRole` (`MODEL`→`SPECIALIST`, `USER`→`STAFF`).
3. ✅ Retirar entidades y rutas de agencia: `Package`, `Convocatoria`, `ConvocatoriaVista`, `EventoFoto`; módulos `paquetes`, `convocatorias`, `eventos`, carruseles de clientes.
4. ✅ Migración Prisma inicial + limpiar seed/`mock-data.ts`.

### Fase 1 — Dominio de clínicas (núcleo) ✅ completa
5. ✅ Entidades nuevas: `Sucursal`, `Consultorio`, `ConsultorioFoto`, `Specialty`; migraciones.
6. ✅ Módulo **Sucursales** y **Consultorios** (CRUD con modal + tarifas). Fotos de consultorio: entidad lista (`ConsultorioFoto`), falta la UI de carga.
7. ✅ Adaptar `Model` → `Specialist` (atributos profesionales, cédula, `photoUrl` único) y su verificación (`Kyc`, renombrada a "Verificación" en el backoffice).
8. ✅ **Reservas**: entidad `Reservation` + no-solape verificado en dos capas — constraint `EXCLUDE USING gist` en BD + chequeo transaccional en `crearReservationAction`, probado con solapes reales rechazados.
9. ✅ **Agenda**: vista de ocupación agrupada por día, filtrable por sucursal/fecha, con creación de reservas.
10. ✅ **Portal del especialista**: edición de perfil propio (foto, bio, especialidades) + auto-reserva (`/app/especialista/agenda`, `crearReservationEspecialistaAction`), bloqueada hasta que el KYC esté aprobado. Usa el mismo chequeo de no-solape en dos capas que las reservas creadas por staff.
11. ✅ **Cobros**: `Charge` ligado a reserva, registro manual y cambio de estatus (pendiente/pagado).

### Fase 2 — KPIs y pulido
12. ✅ Dashboard con KPIs de ocupación (%, últimos 7 días por sucursal), ingresos (cobrado vs. pendiente) y especialistas más activos (últimos 30 días), con recharts (`getDashboardKpis` en `lib/data.ts`).
13. Reportes exportables (CSV) por sucursal/periodo.
14. ✅ (adelantado en Fase 1) Landing pública: sucursales + directorio de especialistas públicos + contacto. Copy de páginas estáticas (`/servicios`, `/historia`, etc.) sigue pendiente de reescritura.
15. Correo transaccional: confirmación/recordatorio de reserva (`resend`) — el helper de correo existe pero no hay trigger automático en `crearReservationAction` todavía.

### Fase 2.5 — Seguimiento de recepción (registro-consultas.md) ✅ completa

Especificación funcional formal entregada por el cliente (`registro-consultas.md`), reconstruye
1:1 el Excel operativo real de recepción. Decisiones de integración con lo ya construido en Fase 1
(confirmadas antes de implementar, ver histórico de la conversación):

16. ✅ `Reservation` se extiende (no una tabla `Cita` aparte) con `patientName`/`patientPhone`
    (obligatorio en UI solo cuando `type = HOURLY`), `cancellationReason` (exigido al cancelar) e
    `inbodyIncluded`. Se conserva el flujo `PENDING/CONFIRMED` de apartado anticipado; se agrega
    `POSTPONED` junto a los 5 estados existentes.
17. ✅ El precio (`priceApplied`) dejó de calcularse solo por tarifa de consultorio — se captura a
    mano al marcar la cita como Realizada (varía por especialista/promoción en el negocio real, no
    hay `PricingRule` construido). Al capturarlo junto con método de pago se genera el `Charge`
    automáticamente; el flujo pendiente→pagado de Cobros no cambia.
18. ✅ `InbodySale` (ventas fuera de consulta), `WhatsappRequest` (agenda WhatsApp),
    `CallLog` (llamadas y conversión), `B2bProspect` (prospección B2B) — cuatro módulos nuevos en
    el backoffice, agrupados bajo "Recepción" en el sidebar.
19. ✅ Especialistas: `active` (estatus operativo) y `defaultConsultorioId` (consultorio habitual)
    expuestos en alta/edición; el selector de especialista al reservar solo lista activos.
20. ✅ Página **Reportes** (`/app/reportes`): reporte semanal completo (flujo de pacientes, agenda
    WhatsApp, conversión de llamadas, InBody, flujo B2B, ingreso total) y reporte por especialista,
    con filtro de rango de fechas y sucursal.
21. ⏳ Diferido a propósito (mejoras sugeridas en el propio documento, no en el Excel original):
    promoción automática de un `B2bProspect` confirmado a `Specialist`, y enlace automático de un
    `WhatsappRequest` concretado a la `Reservation` que genera. Hoy son manuales.

### Fase 3 — Extensiones (fuera de este alcance)
Expediente clínico y cumplimiento NOM-024, citas médicas más allá de agenda/contacto, facturación CFDI, pagos en línea, roles por sucursal.

---

## 10. Reutilización directa (ya existe en el repo)

Aprovechar sin reescribir: auth JWT (`lib/session.ts`), server actions (`lib/actions.ts`), helpers de datos (`lib/data.ts` / `public-data.ts`), subida a S3 (`lib/storage.ts`, `api/upload/*`), primitivas UI (`components/ui/*`: `Table, Card, StatCard, StatusTabs, PageHeader, ImageUpload`, etc.), shell del backoffice (`layout/AppShell, Sidebar, Topbar`, `nav-config.ts`), charts (`components/charts/*`), cron (`api/cron/*`), esquemas zod (`lib/schemas.ts`).

---

## 11. Riesgos y decisiones abiertas

- **No-solape de reservas**: definir si se bloquea a nivel BD (`EXCLUDE USING gist` con rango temporal) o solo en servicio. Recomendado: constraint + verificación transaccional. ✅ **Resuelto** — ambas capas, en producción desde Fase 1, sin cambios en Fase 2.5.
- **Tarifas por especialista y plan**: ✅ **Resuelto** — `registro-consultas.md` confirma que `costo_renta` se captura a mano (no hay `PricingRule` de planes tipo HAPPY HOUR/GOLDEN TICKET). Se implementó captura manual al completar la cita. Si en el futuro el negocio quiere automatizar tarifas por plan, ahí sí haría falta diseñar `PricingRule` desde cero.
- **Citas de 1 hora en horas fijas**: `registro-consultas.md` (la especificación formal) **no** exige esta restricción — `hora_inicio`/`hora_fin` son libres, solo se valida `hora_fin > hora_inicio`. No se implementó como regla dura; si en la práctica el negocio sí necesita horas fijas en grid, hay que pedirlo explícitamente.
- **"Hora fija" vs. "hora variable"**: no aparece como distinción en la especificación formal — se mantiene el `ReservationType {FULL_DAY, HOURLY}` existente sin un tercer tipo.
- **Cancelaciones y cobros**: política de cobro ante cancelación tardía / no-show (afecta KPIs e ingresos). Sigue sin definirse — hoy cancelar solo pide motivo, no genera ningún cargo.
- **Zona horaria**: fijar por sucursal para cálculo correcto de ocupación. Hoy `Sucursal.timezone` existe en el schema pero no se usa en ningún cálculo (KPIs de ocupación corren en hora del servidor). **Sigue sin resolverse.**
- **Verificación de especialista**: alcance de documentos requeridos (cédula, título, identificación).
- **Dimensión sucursal en InBody/WhatsApp/Llamadas/B2B**: ninguna de las 4 entidades de recepción tiene sucursal (ni la tenía el Excel original — mejora sugerida en `registro-consultas.md` §7, no implementada). El filtro de sucursal en Reportes solo afecta las métricas de reservas.

---

## 12. Criterios de aceptación (Fase 1)

- CRUD de sucursales y consultorios operativo, con fotos y tarifas.
- Alta y verificación de especialistas con estados y bitácora.
- Portal del especialista permite apartar jornada y rentar por hora, **sin solapes**.
- Staff puede crear/mover/cancelar reservas y registrar cobros.
- Dashboard muestra ocupación e ingresos por sucursal y consultorio.
- Landing pública muestra sucursales y especialistas públicos, sin datos privados.
- Separación de permisos verificable: la landing y el portal del especialista no acceden a cobros ni notas internas.
