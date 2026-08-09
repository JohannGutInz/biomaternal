# Pendiente: recuperación de contraseña + verificación de correo

Estado: **no implementado, decidido posponer** (conversación del 2026-08-08). Este
documento es el contexto completo para retomarlo después, sin tener que re-investigar
desde cero.

## Estado actual (lo que hay hoy)

- El link "¿Olvidaste tu contraseña?" en `src/components/forms/LoginForm.tsx` existe
  visualmente pero apunta a `href="#"` — no hace nada.
- El modelo `User` en `prisma/schema.prisma` no tiene ningún campo relacionado
  (ni token de reset, ni `emailVerified`, nada).
- No existe ninguna forma de cambiar contraseña estando logueado, ni para modelo ni
  para admin. Hoy, si alguien la olvida, la única salida es que alguien con acceso a
  la base de datos se la resetee a mano.
- No hay verificación de correo al registrarse — `submitRegistrationAction` crea el
  usuario y guarda el hash de la contraseña directo, sin confirmar que el correo sea
  real.

## Bloqueante compartido: el envío de correos reales no está activo en ningún lado

Esto es más urgente que la feature en sí, y aplica a *todo* lo que dependa de correo,
no solo a esto — `src/lib/email.ts` tiene un fallback a propósito:

```ts
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
// Sin RESEND_API_KEY, sendEmail() solo hace console.log — "correo simulado"
```

`RESEND_API_KEY` no está configurado ni en `.env` local ni en las variables de
Vercel (se revisaron ambas). Esto significa que **ahora mismo, en producción,
tampoco se están mandando de verdad** las notificaciones de KYC
(`emailApplicationReceived`, `emailNewApplicationStaff`, `emailApplicationDecision`),
el aviso de convocatoria publicada, ni el formulario de contacto — todos caen al
`console.log` simulado.

### Qué hace falta para activarlo (no es gasto obligatorio)

1. Crear una cuenta de Resend (el plan gratuito alcanza de sobra a esta escala).
2. Verificar un dominio propio en Resend (registros DNS tipo SPF/DKIM) — depende de
   tener acceso al DNS del dominio real que se vaya a usar. Sin esto, o no sale el
   correo o cae en spam; hoy el `FROM` está hardcodeado a un dominio de demo
   (`glamourmodels.demo`).
3. Agregar `RESEND_API_KEY` y `EMAIL_FROM` a `.env` y a las variables de entorno de
   Vercel (mismo proceso que se usó para `DATABASE_URL`/`STORAGE_*`/`SESSION_JWT_SECRET`).

## Complejidad de construir la feature (una vez resuelto lo anterior): baja-media

El patrón "token en URL → validar → dejar hacer algo" **ya existe y funciona** en el
repo — es exactamente lo que hace `/retro/[token]` hoy (reenvío de solicitud cuando
el KYC se rechaza). Recuperación de contraseña es el mismo patrón aplicado a otro
propósito, no algo nuevo que diseñar desde cero.

Piezas ya disponibles para reutilizar:
- `bcrypt` / `hashPassword()` (ya usado en `submitRegistrationAction`).
- El patrón de formularios (`react-hook-form` + `zod` + primitivos de `src/components/ui/`).
- La estructura de `src/lib/email.ts` (ver `emailApplicationDecision` como referencia
  de estilo para una nueva función `emailPasswordReset`).

Estimado: medio día a un día para ambas cosas (recuperación + verificación),
asumiendo que el correo real ya esté conectado.

### Plan técnico sugerido

**Schema** (nuevos campos en `User`, o modelo aparte `PasswordResetToken` — decidir
al implementar; campos aparte es más fácil de expirar/limpiar):
```prisma
resetToken          String?   @unique
resetTokenExpiresAt DateTime?
```

**Flujo de recuperación**:
1. Página "olvidé mi contraseña" → formulario de correo → server action genera un
   token aleatorio (`crypto.randomUUID()` o `randomBytes`), lo guarda con expiración
   corta (p. ej. 1 hora), manda correo con link `/reset-password/[token]`.
2. Responder siempre con el mismo mensaje genérico exista o no el correo (evitar que
   se pueda usar para adivinar qué correos están registrados).
3. Página `/reset-password/[token]` → valida que el token exista, no haya expirado y
   no se haya usado → formulario de contraseña nueva → hashea con `bcrypt`, actualiza
   `hashedPassword`, invalida el token.

**Verificación de correo** (menor prioridad — no bloquea el acceso de nadie, es más
bien calidad de dato):
- Agregar `emailVerified Boolean @default(false)` a `User`.
- Token de verificación al registrar, correo con link de confirmación.
- Decidir si debe ser obligatorio para poder loguear, o solo informativo.

## Prioridad

Recuperación de contraseña primero (bloqueante real para quien se quede sin acceso).
Verificación de correo después, y solo si de verdad se necesita — hoy el flujo de
moderación manual del KYC ya filtra correos claramente falsos/no revisables.
