# Handoff: carrusel de "Eventos" en la landing → módulo de carga en el backoffice

Contexto para el dev backend. El frontend de la landing ya está terminado y
funcionando; falta la parte de backend: modelo de datos, endpoint de subida, y
UI en el backoffice para que el staff suba/gestione las fotos.

## ⚠️ Ojo: no confundir con el módulo "Eventos" que ya existe

Ya existe un módulo `/app/eventos` en el backoffice (`src/app/app/(private)/eventos/`,
`src/components/eventos/*Form.tsx`) — pero es para **gestión operativa de eventos
de booking** (cliente, fecha, venue, status planeado/confirmado/finalizado,
bookings asociados). Vive en `src/lib/mock-data.ts` (`AgencyEvent`), **no tiene
modelo en Prisma todavía**.

Esto que pide el cliente es otra cosa: **una galería de fotos de marketing**
para un carrusel en la landing pública ("Algunos de nuestros eventos"), sin
relación necesaria con ese módulo de booking. Recomiendo tratarlo como una
entidad nueva e independiente (ver "Modelo de datos sugerido" abajo) en vez de
intentar colgarlo del `AgencyEvent` existente — evita acoplar dos migraciones
distintas. Si más adelante quieren fotos por evento de booking específico, se
puede agregar esa relación después sin romper nada de esto.

## Qué ya está hecho (frontend)

- **`public/img/eventos/`** — carpeta creada (con `.gitkeep`). Punto de destino
  provisional: cualquier imagen que se suba ahí manualmente hoy aparece en el
  carrusel sin tocar código.
- **`src/lib/public-data.ts` → `listEventosDestacados()`** — función que hoy
  lee esa carpeta con `fs/promises.readdir` y devuelve:
  ```ts
  export interface EventoDestacado {
    id: string;
    imageUrl: string;
  }
  export async function listEventosDestacados(): Promise<EventoDestacado[]>
  ```
  Filtra por extensión de imagen, ordena alfabéticamente, mapea a
  `/img/eventos/<archivo>`. Si la carpeta no existe o está vacía, devuelve `[]`
  (nunca truena).
- **`src/components/public/EventosCarrusel.tsx`** — el carrusel ya construido:
  tarjetas 220×300 (móvil) / 260×360 (desktop), scroll infinito (CSS, keyframe
  `marquee-half` en `globals.css`), hover con lift + zoom + borde dorado, fade
  en los bordes. Recibe `eventos: EventoDestacado[]` y `agencyName: string`
  (para el `alt` de cada imagen). **No necesita ningún cambio.**
- **`src/app/(public)/page.tsx`** — ya llama `listEventosDestacados()` en el
  `Promise.all` inicial de la home y renderiza `<EventosCarrusel />` justo
  después de la sección "Clientes", **solo si `eventos.length > 0`** (si la
  carpeta está vacía, la sección simplemente no aparece — no hay estado vacío
  feo ni placeholder falso).

## El único punto que hay que tocar

Todo el contrato pasa por **una función, un archivo**:

```ts
// src/lib/public-data.ts
export async function listEventosDestacados(): Promise<EventoDestacado[]>
```

Para pasar a datos reales: reemplazar el cuerpo de esta función por una query
real (Prisma o lo que decidan), manteniendo el mismo tipo de retorno
(`{ id, imageUrl }[]`). Ni `EventosCarrusel` ni `page.tsx` necesitan cambiar.

## Modelo de datos sugerido

MVP simple, desacoplado del módulo de booking:

```prisma
model EventoFoto {
  id        String   @id @default(uuid())
  url       String
  position  Int      @default(0)
  published Boolean  @default(true)   // permite subir sin publicar de inmediato
  createdAt DateTime @default(now())

  @@map("evento_fotos")
}
```

- `position` para que el staff controle el orden del carrusel (drag-reorder en
  la UI, o simple `+`/`-` si no hay tiempo para drag & drop).
- `published` como filtro para no mostrar automáticamente todo lo que se sube
  (opcional pero recomendado — así pueden subir/curar antes de publicar).
- Si más adelante quieren ligarlo a un evento de booking real, se agrega
  `eventoId String?` opcional apuntando al futuro modelo `Evento` — no rompe
  nada de lo anterior.

`listEventosDestacados()` quedaría, por ejemplo:

```ts
export async function listEventosDestacados(): Promise<EventoDestacado[]> {
  const fotos = await prisma.eventoFoto.findMany({
    where: { published: true },
    orderBy: { position: "asc" },
    take: 20, // limitar, ver nota de performance abajo
  });
  return fotos.map((f) => ({ id: f.id, imageUrl: f.url }));
}
```

## Subida de imágenes — reusar el patrón que ya existe en el proyecto

Ya hay un flujo de upload a S3 completo y probado, hecho para las fotos de
modelos. Es el patrón a copiar, no reinventar:

1. **`src/lib/storage.ts`** — `uploadImage(buffer, key)`: redimensiona +
   convierte a WebP con `sharp`, sube a S3 (`PutObjectCommand`), devuelve una
   URL firmada de descarga. Usa envs ya configurados:
   `STORAGE_ENDPOINT`, `STORAGE_REGION`, `STORAGE_ACCESS_KEY`,
   `STORAGE_SECRET_KEY`, `STORAGE_BUCKET` — mismos que ya usa el resto del
   proyecto, no hay que dar de alta infraestructura nueva.
2. **`src/app/api/upload/image/route.ts`** — Route Handler que recibe
   `FormData` con un `file`, valida tipo (`image/jpeg|png|webp|gif`) y tamaño
   (máx 10 MB), arma la `key` de S3, llama `uploadImage`, devuelve
   `{ url }`. **Está scopeado a fotos de modelo** (key
   `modelos/{modelId}/photos/{uuid}.webp`) y su chequeo de sesión asume
   `MODEL` o staff autenticado subiendo para un modelo — **no reusar tal
   cual**, mejor un endpoint nuevo (ver siguiente punto).
3. **`src/components/models/GalleryImageUpload.tsx`** — el componente cliente
   de referencia para una galería multi-imagen con crop: selecciona archivo →
   abre `ImageCropModal` (aspect ratio fijo) → guarda el `File` recortado en
   memoria → al enviar el form, sube por `fetch("/api/upload/…", { method:
   "POST", body: formData })` → reemplaza el blob-preview local por la URL
   real que devuelve el endpoint. **Este es el componente a clonar** para el
   uploader de fotos de eventos (mismo patrón, aspect ratio ~220/300 para que
   combine con las tarjetas del carrusel).

### Recomendación concreta

- **Endpoint nuevo**: `src/app/api/upload/evento-image/route.ts` (no tocar el
  existente de modelos). Mismo body que el de modelos pero:
  - Requiere `session.role === "ADMIN"` (así gatea todo `/app/(private)`, ver
    `src/app/app/(private)/layout.tsx:17`) — nada de lógica de modelo/público.
  - Key en S3: algo como `eventos/{uuid}.webp`.
  - Después de subir, crear el registro `EventoFoto` (o hacerlo en una server
    action separada desde el form, como ya hace el resto del admin — ver
    `src/lib/actions.ts` para el estilo de server actions del proyecto).
- **Como son fotos de marketing (no privadas como las de modelo), no hace
  falta que sean URLs firmadas con expiración.** El flujo actual de
  `getSignedDownloadUrl` firma por 1 hora por default — funciona porque la
  home es `force-dynamic` y regenera la URL en cada render, pero es
  desperdicio de firmas y nada cacheable/CDN-friendly para algo que va a vivir
  meses en la landing. Mejor: bucket/prefix `eventos/` con lectura pública
  (bucket policy), y guardar/devolver la URL pública directa. Si prefieren
  mantener todo el bucket privado por consistencia, al menos usar un
  `expiresIn` largo (días) y no el default de 1h.
- **UI admin**: nueva página bajo `src/app/app/(private)/`, por ejemplo
  `configuracion/eventos-landing/` o donde tenga más sentido en el árbol de
  navegación actual — lista de fotos (grid con reorder + toggle
  publicado/oculto + eliminar) + botón de subir. Estructura de referencia:
  cualquiera de las páginas de `(private)/eventos/` o `(private)/catalogs/`
  para el layout general (Card, PageHeader, Table/grid ya en
  `src/components/ui/`).

## Otros detalles a decidir con el backend/producto

- **Límite de fotos visibles** en el carrusel: hoy no hay tope (muestra todo
  lo que hay en la carpeta). Recomiendo poner un `take` razonable (12–20) en
  la query — la referencia del cliente mostraba ~6 fotos en loop.
- **Alt text**: hoy es genérico (`Evento realizado por ${agencyName}`) para
  todas las fotos. Si quieren accesibilidad real por foto, agregar un campo
  `caption`/`alt` opcional al modelo y pasarlo a través de
  `EventoDestacado`/`EventosCarrusel` (cambio menor, avisen si lo quieren y lo
  agrego yo del lado frontend).
- **Aspect ratio**: las tarjetas son verticales (~11:15). Recomiendo forzar
  crop a esa proporción al subir (como ya hace `ImageCropModal` para las fotos
  de modelo) para que el carrusel se vea parejo en vez de fotos recortadas
  automáticamente por `object-cover` sin control del usuario.

## Resumen para copiar/pegar al ticket

> Frontend del carrusel de eventos ya está listo y en producción-ready. Falta:
> 1. Modelo `EventoFoto` en Prisma (ver propuesta en
>    `docs/eventos-carousel-handoff.md`).
> 2. Endpoint de subida `POST /api/upload/evento-image` (clonar
>    `src/app/api/upload/image/route.ts`, gate por `role === "ADMIN"`, key S3
>    `eventos/{uuid}.webp`, idealmente lectura pública sin firmar).
> 3. UI admin para subir/reordenar/publicar fotos (clonar
>    `src/components/models/GalleryImageUpload.tsx` como base del uploader).
> 4. Reemplazar el cuerpo de `listEventosDestacados()` en
>    `src/lib/public-data.ts` por la query real — es el único punto de
>    integración con el frontend, no hay que tocar nada más.
