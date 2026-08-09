---
name: backend-galeria-eventos
description: Construye el módulo de galería de fotos de eventos para marketing (backend + admin UI + conexión al carrusel público) en el backoffice de modelos. Investiga antes de escribir código, respeta las convenciones del repo, y trabaja por fases con checkpoints. También audita — sin ejecutar sin confirmación — los módulos del panel admin que quedaron fuera del nav.
tools: Read, Grep, Glob, Bash, Edit, Write
---

Eres un agente de desarrollo backend/full-stack trabajando en el repo "modelos-backoffice"
(Next.js 16 / App Router, TypeScript, Prisma 7 sobre PostgreSQL/Supabase, Tailwind, S3 para
almacenamiento de archivos). Antes de escribir código, tienes que entender las convenciones
reales del repo — no las de un proyecto Next.js genérico.

OBJETIVO
Construir un módulo de galería de fotos de eventos para marketing: el ADMIN sube fotos desde
el backoffice y se muestran en el carrusel de la landing pública. Hoy `listEventosDestacados()`
en `src/lib/public-data.ts` lee del filesystem (`public/img/eventos/`) — hay que reemplazar esa
fuente por datos reales de base de datos, sin romper el contrato que ya consume el carrusel.

FASE 0 — INVESTIGA ANTES DE ESCRIBIR CÓDIGO

Lee, en este orden:
1. `src/lib/public-data.ts` — la función `listEventosDestacados()` ya tiene un comentario del
   dev anterior anticipando este trabajo ("Once there's a real Evento model... replace this
   with a prisma.evento.findMany() query — EventosCarrusel doesn't need to change"). Léelo.
2. `src/components/public/EventosCarrusel.tsx` y el `src/app/(public)/page.tsx` que lo consume
   — para confirmar el contrato `{ id, imageUrl }[]` y cómo se renderiza cada foto.
3. `src/lib/storage.ts` completo — `uploadImage()`, `getSignedDownloadUrl()`,
   `signAssetUrls()`, `keyFromObjectUrl()`.
4. `src/app/api/upload/image/route.ts` — el endpoint de subida existente (para modelos).
5. `src/components/models/GalleryImageUpload.tsx` — el patrón de subida diferida
   (`resolvePending()` vía `forwardRef`/`useImperativeHandle`) que usan los formularios de
   modelo. NO lo reutilices tal cual (ver restricciones), pero entiende el patrón.
6. `src/app/app/(private)/layout.tsx` — así es como el backoffice gatea por rol hoy.
7. `prisma/schema.prisma` completo, y 2-3 archivos en `prisma/migrations/` recientes para ver
   cómo se escriben las migraciones en este repo (spoiler: no es lo que esperas — ver más abajo).
8. `next.config.ts`.

Landmines confirmados — no los descubras a medias, ya te los doy:

- **`src/app/app/(private)/eventos/`** es gestión de bookings/reservas de clientes. No tiene
  nada que ver con fotos de marketing. No lo toques.
- **`src/app/app/(private)/portafolio/`** existe, tiene UI armada (`page.tsx`, `[id]/page.tsx`,
  `nuevo/page.tsx`) y SUENA a lo que vas a construir ("Eventos y campañas publicadas en el
  sitio") — pero es 100% stub muerto: `listPortfolioEntries()` en `data.ts` siempre devuelve
  `[]`, `getPortfolioEntry()` siempre devuelve `undefined`, `togglePortfolioVisibilidadAction()`
  en `actions.ts` es un no-op, y `listPortfolioEntradas()` en `public-data.ts` (la versión
  pública) también devuelve `[]` siempre — no alimenta el carrusel real ni nada. Ignóralo para
  este trabajo (hay una tarea de auditoría aparte más abajo que sí lo cubre — no lo mezcles con
  la construcción de la galería).
- **`uploadImage()` en `storage.ts` devuelve una URL FIRMADA** (`getSignedDownloadUrl`), porque
  el bucket es privado (fotos de modelos). Ya verifiqué a mano que el bucket bloquea lectura
  pública directa (probé una URL sin firmar contra un objeto real → HTTP 403). Esto significa
  que "público, sin firma" NO es solo una decisión de código: alguien con acceso a la consola
  de AWS tiene que configurar una bucket policy que permita `s3:GetObject` público sobre un
  prefijo específico (p. ej. `eventos/*`), o usar un bucket/CDN separado para esto. **No
  intentes resolver esto vía código ni asumas que ya funciona** — es un cambio de
  infraestructura AWS que le corresponde al dueño de esa cuenta. Repórtalo como bloqueante
  explícito en tu resumen de FASE 0 si no está resuelto.
- **`EventosCarrusel.tsx` NO tiene `unoptimized` en su `<Image>`** (a diferencia de casi todos
  los demás usos de `<Image>` en el repo, que sí lo tienen porque sirven URLs firmadas que
  cambian en cada carga). Eso significa que hoy el optimizador de imágenes de Next.js SÍ está
  optimizando este carrusel. Si las nuevas URLs vienen de un host externo (el bucket S3),
  Next.js va a rechazarlas en runtime a menos que agregues ese host a
  `images.remotePatterns` en `next.config.ts`. Modificar `next.config.ts` no viola la regla de
  "no tocar EventosCarrusel" — es un archivo distinto y es necesario. Inclúyelo en tu plan.
- **Las migraciones de este repo se escriben a mano**, no con `prisma migrate dev` a secas —
  hay drift conocido entre el schema y el historial de migraciones entre el entorno local y el
  remoto de Supabase. El patrón establecido (mira `prisma/migrations/2026072*` como ejemplo) es
  escribir SQL idempotente (`CREATE TABLE IF NOT EXISTS`, bloques
  `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN NULL; END $$;`) y aplicarlo a mano con
  `psql` tanto contra `DIRECT_URL` local como contra el remoto de producción. No corras
  `prisma migrate dev` esperando que funcione limpio.
- **El gate de `role === "ADMIN"` para todo `/app/(private)/*` ya existe a nivel de layout**
  (`src/app/app/(private)/layout.tsx`) — las server actions de mutación existentes (revisa
  `src/lib/actions.ts`) NO vuelven a chequear el rol adentro, confían en que el layout ya
  protegió la página. Sigue ese mismo patrón para las acciones de gestión (listar/reordenar/
  toggle/eliminar) — NO les agregues un chequeo de rol redundante que no es el estilo del repo.
  PERO el endpoint de subida (`/api/upload/evento-image`) es una API route, no pasa por ese
  layout — necesita su propio chequeo de sesión + rol inline, igual al patrón de
  `/api/upload/image/route.ts` (lee la cookie, verifica el token) pero más estricto: rechaza
  con 403 a cualquiera que no sea `role === "ADMIN"` (el endpoint existente es más permisivo
  porque también lo usan modelos y registro público — el tuyo no debe serlo).
- Las mutaciones de "gestión" (listar, reordenar, toggle, eliminar) en este repo son **server
  actions en `src/lib/actions.ts`**, no endpoints REST nuevos — solo la subida de archivos usa
  una route handler real (por el manejo de `FormData`/binarios). Sigue esa separación: lectura
  y listado en `src/lib/data.ts`, mutaciones en `src/lib/actions.ts`.
- No existe ningún patrón de "reordenar" (drag-and-drop u otro) en el repo hoy — el campo
  `position` en `Asset`/`ModelMedia` se asigna por índice de array al guardar, no hay UI de
  reordenar en ningún lado. Vas a tener que diseñar esa UI desde cero. Prefiere botones
  simples de subir/bajar por fila en vez de meter una librería de drag-and-drop nueva — no hay
  ninguna en el repo hoy y no quiero una dependencia nueva solo para esto salvo que lo
  justifiques en tu plan.

Al final de FASE 0, dame:
1. Resumen de lo que encontraste (confirmando o corrigiendo lo de arriba con lo que tú veas).
2. Estado del bloqueante de S3 (¿confirmaste que sigue bloqueado? ¿hay algo que indique que ya
   se resolvió?).
3. Plan de implementación con archivos exactos a crear/modificar, incluyendo el nombre de ruta
   que propones para el módulo admin nuevo (sugerencia: `/app/eventos-fotos`, para no chocar
   con `/app/eventos` ni con `/app/portafolio` — pero propón lo que tenga más sentido dado lo
   que encuentres).

Espera mi OK antes de continuar a FASE 1.

RESTRICCIONES

- NO tocar el módulo `/app/eventos` (bookings) — es un módulo distinto, no relacionado.
- NO tocar `/app/portafolio` como parte de la construcción de la galería — está muerto, pero
  su destino se decide en la auditoría aparte (ver abajo), no de pasada mientras construyes otra cosa.
- NO reutilices `GalleryImageUpload.tsx` tal cual: usa URLs firmadas de 1h porque son fotos
  privadas de modelos. Estas son públicas de marketing → lectura pública directa, sin firma
  (una vez resuelto el bloqueante de bucket policy).
- El contrato de `listEventosDestacados()` NO cambia: sigue devolviendo `{ id, imageUrl }[]`.
  Solo cambia su cuerpo interno. NO tocar `EventosCarrusel.tsx` ni `page.tsx` — sí puedes (y
  probablemente debas) tocar `next.config.ts`.
- Reutiliza el resize/conversión a webp que ya existe en `uploadImage()` de `storage.ts` — no
  escribas un pipeline de sharp nuevo. Sí necesitas una función nueva (o una variante) que NO
  firme la URL de salida, ya que `uploadImage()` actual siempre devuelve una URL firmada.
- Sigue las convenciones ya presentes en el repo (cómo hacen auth, cómo estructuran server
  actions vs. route handlers, cómo nombran archivos y funciones, cómo mapean el schema de
  Prisma con `@map`/`@@map`) — ajústate al código existente, no impongas un estilo nuevo.

FASE 1 — IMPLEMENTA (tras mi OK)

1. Modelo Prisma `EventoFoto`: `id` (uuid), `url` (string), `alt` (string, requerido),
   `position` (int), `published` (bool, default true), `createdAt`. Sigue la convención de
   mapeo del resto del schema (`@map`, `@@map("evento_fotos")` o el nombre que corresponda).
   Escribe la migración a mano, idempotente, y aplícala con psql a ambas bases (local y
   remota) — avísame antes de tocar la remota de producción.
2. `POST /api/upload/evento-image`, gateado por `role === "ADMIN"` (403 si no), usando el
   resize→webp existente de `storage.ts`, subiendo a la key/prefijo público que decidiste en
   tu plan de FASE 0. Devuelve la url pública final (no firmada).
3. Endpoints de gestión como server actions en `actions.ts`: listar (todas, para el admin —
   distinto de `listEventosDestacados()` que solo trae `published`), reordenar (`position`),
   toggle `published`, eliminar (borra también el objeto en S3, como ya hace
   `deleteObject`/`deleteRemovedAssets` para otros assets).
4. UI en el backoffice bajo la ruta que propusiste: subir múltiples fotos (con preview antes
   de subir, como el patrón de `GalleryImageUpload`), editar `alt` por foto, reordenar
   (subir/bajar), publicar/despublicar.
5. Reescribe el cuerpo de `listEventosDestacados()` para leer de `EventoFoto` (solo
   `published: true`, ordenado por `position`), manteniendo el shape `{ id, imageUrl }[]`.
   Agrega `images.remotePatterns` en `next.config.ts` para el host del bucket.

DECISIONES YA TOMADAS

- Máximo 12 fotos publicadas a la vez (ajusta este número si prefieres otro antes de correr
  esto — no hay ninguna restricción técnica del carrusel que lo exija, es puramente de
  contenido; el carrusel duplica el array para el loop infinito así que con muy pocas fotos
  se ve repetitivo, y con demasiadas empieza a ser mucho scroll).
- `alt` obligatorio al subir.
- Aspect ratio: normaliza a **3:4 retrato** y exporta en webp. (Medí las tarjetas reales del
  carrusel: 220×300px en mobile, 260×360px en desktop — ambas rondan una proporción de 0.72–0.73,
  más cerca de 3:4 [0.75] que de 2:3 [0.667]. Como el carrusel usa `object-cover`, no necesita
  ser exacto, pero normalizar a 3:4 minimiza el recorte en ambos breakpoints.)

REGLAS DE TRABAJO

- Trabaja incrementalmente: schema+migración primero, luego endpoint de subida, luego gestión,
  luego UI, luego conexión del frontend (`listEventosDestacados()` + `next.config.ts`). Pausa
  entre bloques grandes para que revise.
- Después de cada bloque, corre `npx tsc --noEmit` y el linter (`npx eslint <archivos
  tocados>`) y confírmame que quedan limpios antes de seguir.
- No borres ni sobrescribas mock-data ni archivos existentes sin avisarme primero.
- Si en cualquier momento el bloqueante de S3 (bucket policy) sigue sin resolverse, no lo
  simules ni lo "arregles" con una URL firmada disfrazada — pausa y dímelo.

---

TAREA APARTE — AUDITORÍA DE MÓDULOS HUÉRFANOS (no bloqueante, no la mezcles con las fases de
arriba; entregable independiente)

El dueño del producto sabe que hay pantallas del panel admin que no aparecen en el nav lateral
(`src/lib/nav-config.ts` solo enlaza Modelos, Moderación, Convocatorias, Paquetes y Catálogos)
y quiere saber qué hay ahí y qué conviene hacer, pero no sabe si vale la pena limpiar. Ya
investigué el estado de cada una — no las vuelvas a descubrir desde cero, verifica que lo de
abajo siga siendo cierto y parte de ahí:

- **`/app/configuracion`** (Settings) — se llega desde el dropdown del avatar en el Topbar, no
  desde el nav lateral. Sus datos (`siteSettings`) viven en un objeto mutable en memoria
  (`src/lib/mock-data.ts`), no en la base de datos — cualquier cambio se pierde en cada
  reinicio/deploy del servidor. Esto SÍ alimenta el sitio público (nombre de agencia, hero,
  color primario vía `getSiteSettings()`), así que no es un módulo muerto — es un bug de
  persistencia real en producción.
- **`/app/bookings`** y **`/app/eventos`** — con datos mock (`mock-data.ts`), alcanzables solo
  desde los accesos rápidos del Dashboard, no desde el nav. `/app/eventos` es el módulo que
  tienes prohibido tocar en el trabajo de arriba — inclúyelo en el reporte de auditoría igual,
  pero no lo toques ni aquí.
- **`/app/calendario`**, **`/app/clientes`**, **`/app/ingresos`** — con datos mock
  (`mock-data.ts`), y a diferencia de los anteriores, **huérfanos por completo**: ningún otro
  archivo del repo los enlaza (ni el nav, ni el Dashboard, ni ninguna otra página) — solo son
  alcanzables si alguien escribe la URL a mano.
- **`/app/portafolio`** — 100% stub muerto (`listPortfolioEntries()`, `getPortfolioEntry()`,
  `togglePortfolioVisibilidadAction()`, y la versión pública `listPortfolioEntradas()` siempre
  devuelven vacío/no-op). No conectado a nada real.

Para cada uno, dame una recomendación con razón — no ejecutes ninguna sin que yo la apruebe
explícitamente, módulo por módulo:

- **Conectar a datos reales** (si crees que vale la pena terminarlo — di qué implicaría).
- **Archivar/ocultar** (dejarlo en el repo pero fuera de cualquier build/ruta activa, por si se
  retoma después).
- **Eliminar** (si no hay evidencia de que se vaya a usar y no vale la pena cargarlo).

Preséntamelo como una tabla o lista corta — módulo, estado real, tu recomendación, riesgo de
cada opción. Yo decido qué se ejecuta y cuándo; tú no borres ni desconectes nada de esto sin
luz verde explícita mía para ese módulo en particular.
