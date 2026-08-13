# tester.md — Guía de pruebas manuales, Biomaternal Backoffice

Checklist para probar la aplicación de punta a punta: landing pública, backoffice (staff/admin)
y portal del especialista. Está pensado para ir marcando cada caso y anotar lo que falle con
el detalle suficiente para reportarlo (ver plantilla al final).

**No se prueba en esta pasada** (features todavía no implementadas, ver `CLAUDE-biomaternal.md`
§9 Fase 2): exportar CSV, envío automático de correo al crear/confirmar una reserva, carga de
fotos de consultorio, copy de las páginas estáticas (`/servicios`, `/historia`, `/mision-vision`,
`/razones`, `/como-trabajamos`, `/privacidad` siguen con texto de agencia de talento, es
conocido y está pendiente).

## Antes de empezar

- **Cuenta admin**: `admin@biomaternal.local` / `Admin123!` (default de seed, cámbiala si nadie
  lo ha hecho todavía — está en producción).
- Ten a mano al menos **1 sucursal**, **1 consultorio activo** y **1 especialidad** ya cargados,
  o créalos tú mismo como parte de las pruebas (sección 2).
- Usa dos navegadores o una ventana normal + una de incógnito para probar sesión admin y sesión
  especialista al mismo tiempo sin pisarte la cookie.
- Antes de cada bloque revisa la consola del navegador (errores de red/JS) y, si algo falla sin
  explicación, anota el mensaje exacto — muchos errores de servidor llegan como texto genérico
  en pantalla pero el detalle real está en los logs de Vercel.

---

## 1. Landing pública (sin sesión)

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|---------------------|
| 1.1 | Home carga | Ir a `/` | Hero, especialidades, sucursales y especialistas destacados se muestran sin errores en consola |
| 1.2 | Directorio de especialistas | Ir a `/talentos` | Lista solo especialistas con `isPublic = true` y KYC `APPROVED`. Ningún dato privado visible (teléfono, notas internas, tarifas) |
| 1.3 | Filtros del directorio | En `/talentos`, filtrar por nombre, género y especialidad | La lista se actualiza correctamente; combinaciones sin resultados muestran estado vacío, no error |
| 1.4 | Perfil individual | Entrar a `/talentos/[id]` de un especialista público | Muestra foto, bio, especialidades, sucursal/ubicación. No expone teléfono ni notas internas |
| 1.5 | Perfil de especialista no público o no aprobado | Intentar acceder a `/talentos/[id]` con el id de un especialista `isPublic=false` o KYC no aprobado | 404, no se filtra información |
| 1.6 | Portafolio | Ir a `/portafolio` | Página carga (hoy sin fuente de datos real, verificar que no rompe) |
| 1.7 | Contacto | Ir a `/contacto`, enviar el formulario con datos válidos | Confirmación visible; revisar que llegue el correo si `resend` está configurado en el entorno probado |
| 1.8 | Contacto — validación | Enviar el formulario vacío o con email inválido | Errores de validación en español, sin submit |
| 1.9 | Páginas estáticas | Visitar `/servicios`, `/cobertura`, `/como-trabajamos`, `/razones`, `/historia`, `/mision-vision`, `/privacidad` | Cargan sin error 500 (el copy sigue siendo de agencia de talento — **no reportar eso como bug**, ya está en el roadmap) |

## 2. Registro público de especialista (`/registro`)

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|---------------------|
| 2.1 | Registro exitoso | Llenar el formulario completo con un correo nuevo y enviar | Mensaje de éxito ("recibimos tu información..."); en el backoffice aparece en `/app/verificacion` con estatus `PENDING` |
| 2.2 | Correo duplicado | Repetir el registro con el mismo correo que el punto 2.1 | Error explícito "Ya existe un registro con ese correo electrónico", no un 500 |
| 2.3 | Menor de edad | Poner una fecha de nacimiento de alguien menor de 18 años | Error de validación, no permite continuar |
| 2.4 | Contraseña corta | Poner una contraseña de menos de 8 caracteres | Error de validación específico |
| 2.5 | Sin especialidad | Enviar sin seleccionar ninguna especialidad | Error "Selecciona al menos una especialidad" |
| 2.6 | Foto de perfil | Subir una foto durante el registro | Se sube a S3 y se ve reflejada en la revisión del backoffice |
| 2.7 | Link de retroalimentación | Con una solicitud rechazada o que requiere cambios, entrar al link `/retro/[token]` correspondiente | Muestra el motivo/comentario y permite reenviar datos actualizados |

## 3. Login y sesión (`/app/login`)

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|---------------------|
| 3.1 | Login admin válido | Entrar con `admin@biomaternal.local` / `Admin123!` | Redirige a `/app/especialistas` o `/app/dashboard`; cookie `biomaternal_session` presente |
| 3.2 | Login inválido | Contraseña o correo incorrectos | "Correo o contraseña incorrectos", sin filtrar cuál de los dos falló |
| 3.3 | Login especialista | Con un usuario `SPECIALIST` (ver sección 8 para crear uno) | Redirige a `/app/especialista/perfil`, no al backoffice de staff |
| 3.4 | Ruta privada sin sesión | Ir directo a `/app/dashboard` en una ventana sin login | Redirige a `/app/login` |
| 3.5 | Ruta de especialista con sesión admin | Logueado como admin, ir a `/app/especialista/perfil` | Verificar qué pasa — confirmar que no rompe ni expone datos de otro rol |
| 3.6 | Ruta de admin con sesión especialista | Logueado como especialista, ir a `/app/especialistas` o cualquier ruta de staff | Debe bloquear el acceso (403/redirect), nunca mostrar el listado completo |
| 3.7 | Logout | Cerrar sesión desde el menú | Cookie eliminada, redirige a `/app/login`, rutas privadas vuelven a bloquear |
| 3.8 | Expiración de sesión | (Si es viable) esperar 8h o manipular el token | Sesión vencida fuerza nuevo login, no crashea la app |

## 4. Especialistas — alta desde backoffice (`/app/especialistas`)

> Este es el flujo que reportaste como roto. Ya está corregido (`crearEspecialistaAdminAction`
> no estaba implementado — commit `478376f`). Es el bloque más importante de re-probar.

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|---------------------|
| 4.1 | Alta completa | `/app/especialistas/nuevo`, llenar todos los campos obligatorios (nombre, apellido paterno, correo, teléfono, fecha de nacimiento, género, ≥1 especialidad) y guardar | Éxito, redirige al detalle del especialista recién creado (`/app/especialistas/[id]`) |
| 4.2 | Contraseña temporal | Al completar 4.1 | El mensaje de éxito muestra una contraseña temporal — anótala, se usa en la sección 8 para probar el login del especialista |
| 4.3 | Aparece en el listado | Después de 4.1, ir a `/app/especialistas` | El nuevo especialista aparece de inmediato en la lista (KYC queda auto-aprobado al darlo de alta el staff) |
| 4.4 | Correo duplicado | Repetir el alta con el mismo correo de 4.1 | Error explícito "Ya existe un usuario con ese correo electrónico", no un 500 ni "Not implemented" |
| 4.5 | Campos obligatorios vacíos | Enviar el formulario sin nombre/apellido/correo/teléfono/fecha/género | Errores de validación por campo, sin submit |
| 4.6 | Sin especialidad | Enviar sin marcar ninguna especialidad | Error "Selecciona al menos una especialidad" |
| 4.7 | Foto opcional | Guardar sin subir foto | Debe permitirlo (photoUrl es opcional) |
| 4.8 | Foto con subida | Subir una foto antes de guardar | Se sube a S3, queda asociada al especialista, se ve en el detalle |
| 4.9 | Cancelar | Click en "Cancelar" a medio llenar | Vuelve a `/app/especialistas` sin crear nada |
| 4.10 | Edición | Desde el detalle de un especialista, editar datos y especialidades | Guarda correctamente, refleja los cambios en el listado y en `/talentos/[id]` si es público |
| 4.11 | Visibilidad pública | Alternar "visible en landing" desde el detalle | Aparece/desaparece de `/talentos` según el toggle |
| 4.12 | Detalle | Abrir `/app/especialistas/[id]` de un especialista existente | Muestra todos sus datos, especialidades, estatus KYC, sin errores |

## 5. Verificación / KYC (`/app/verificacion`)

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|---------------------|
| 5.1 | Bandeja de pendientes | Con al menos una solicitud del punto 2.1 | Aparece en la lista con estatus `PENDING` |
| 5.2 | Filtros por estatus | Cambiar entre pendiente / aprobado / rechazado / requiere cambios | La lista se filtra correctamente |
| 5.3 | Aprobar | Entrar al detalle, click "Aprobar" | Estatus pasa a `APPROVED`; el especialista ahora aparece en `/app/especialistas` y, si `isPublic`, en `/talentos` |
| 5.4 | Rechazar | Click "Rechazar" con comentario | Estatus pasa a `REJECTED`; el especialista deja de ser visible/activo |
| 5.5 | Requiere cambios | Click "Requiere cambios" con comentario | Estatus pasa a `REQUIRES_CHANGES`; el link `/retro/[token]` (o el flujo equivalente) permite corregir y reenviar |
| 5.6 | Bitácora | Revisar el historial de revisiones del especialista tras 2-3 decisiones | Cada decisión queda registrada con fecha y quién la tomó (`KycReviewLog`) |
| 5.7 | Re-verificación tras edición | Un especialista `APPROVED` edita su perfil desde el portal (sección 8) | KYC vuelve a `PENDING` automáticamente y reaparece en la bandeja |

## 6. Sucursales (`/app/sucursales`)

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|---------------------|
| 6.1 | Alta | Crear una sucursal con nombre, dirección, horario de apertura/cierre, zona horaria | Se guarda y aparece en el listado |
| 6.2 | Edición | Cambiar horario o dirección de una sucursal existente | Se refleja en el listado y afecta el cálculo de ocupación del dashboard |
| 6.3 | Activar/desactivar | Alternar `isActive` | Una sucursal inactiva no debería ofrecerse como opción al crear consultorios/reservas nuevas (confirmar) |
| 6.4 | Validación | Enviar el formulario sin nombre o sin dirección | Error de validación, sin submit |
| 6.5 | Consultorios asociados | Ver el detalle/listado de una sucursal con consultorios | Muestra correctamente cuántos consultorios tiene |

## 7. Consultorios (`/app/consultorios`)

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|---------------------|
| 7.1 | Alta | Crear un consultorio ligado a una sucursal, con tarifa por hora y/o por jornada | Se guarda, aparece en el listado con su sucursal |
| 7.2 | Tarifas opcionales | Crear uno sin `hourlyRate` ni `dayRate` | Debe permitirlo; al reservar ese tipo, el precio estimado queda `null` en vez de romper |
| 7.3 | Edición de tarifas | Cambiar `hourlyRate`/`dayRate` de un consultorio existente | Las reservas futuras usan la tarifa nueva; las reservas ya creadas conservan su `priceApplied` original |
| 7.4 | Activar/desactivar | Alternar `isActive` | Un consultorio inactivo no debe aparecer como opción al crear una reserva nueva (ni desde staff ni desde el portal del especialista) |
| 7.5 | Validación | Enviar sin nombre o sin sucursal seleccionada | Error de validación |

## 8. Portal del especialista

Usa la cuenta creada en la sección 4 (correo + contraseña temporal del paso 4.2), o una
aprobada vía sección 5.

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|---------------------|
| 8.1 | Login con contraseña temporal | Entrar con el correo y la contraseña temporal generada en 4.2 | Login exitoso, redirige a `/app/especialista/perfil` |
| 8.2 | Ver perfil propio | `/app/especialista/perfil` | Muestra sus propios datos, foto, especialidades y estatus de verificación |
| 8.3 | Editar perfil | Cambiar bio, especialidades o foto | Guarda correctamente; si estaba `APPROVED`, vuelve a `PENDING` (ver 5.7) |
| 8.4 | Ver agenda propia | `/app/especialista/agenda` | Lista solo sus propias reservas, ninguna de otros especialistas |
| 8.5 | Auto-reservar (KYC aprobado) | Con KYC `APPROVED`, click "Apartar consultorio", llenar consultorio/tipo/fecha-hora | Reserva creada, aparece en su agenda con el precio estimado |
| 8.6 | Auto-reservar bloqueado (KYC no aprobado) | Con un especialista `PENDING`/`REQUIRES_CHANGES`, ir a `/app/especialista/agenda` | Aviso ámbar de perfil no aprobado, botón de reservar deshabilitado |
| 8.7 | Solape rechazado | Intentar reservar el mismo consultorio y franja horaria que otra reserva `PENDING`/`CONFIRMED` ya existente | Error claro de solape, no crea la reserva ni rompe con un 500 |
| 8.8 | Fin antes que inicio | Poner una hora de fin anterior a la de inicio | Error de validación "La hora de fin debe ser posterior a la de inicio" |
| 8.9 | No puede elegir a otro especialista | Revisar el formulario de auto-reserva | No debe existir ningún campo para elegir "especialista" — siempre es el propio, tomado de la sesión, nunca del cliente |
| 8.10 | Sin acceso a datos de otros | Intentar (vía URL directa u otra vía) ver reservas o cobros de otro especialista | Debe estar bloqueado a nivel de datos, no solo de UI |

## 9. Agenda / ocupación (staff) (`/app/agenda`)

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|---------------------|
| 9.1 | Vista general | Entrar a `/app/agenda` | Muestra reservas agrupadas por día |
| 9.2 | Filtro por sucursal | Filtrar por una sucursal específica | Solo muestra reservas de consultorios de esa sucursal |
| 9.3 | Filtro por fecha | Cambiar el rango/fecha | La vista se actualiza sin recargar toda la página con errores |
| 9.4 | Reserva creada desde el portal aparece aquí | Crear una reserva como especialista (8.5) y volver como staff | Debe aparecer igual que las creadas por staff, sin diferencias |

## 10. Reservas (staff) (`/app/reservas`)

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|---------------------|
| 10.1 | Listado | `/app/reservas` | Lista todas las reservas con estatus, consultorio, especialista |
| 10.2 | Filtro por estatus | Filtrar `PENDING`/`CONFIRMED`/`CANCELLED`/`COMPLETED`/`NO_SHOW` | Filtra correctamente |
| 10.3 | Crear reserva (staff, a nombre de un especialista) | Modal de nueva reserva, elegir especialista + consultorio + horario | Se crea correctamente, respeta el mismo chequeo de no-solape que el portal |
| 10.4 | Solape rechazado (staff) | Repetir 8.7 pero desde el formulario de staff | Mismo resultado: error claro, no se crea |
| 10.5 | Cambiar estatus | Cambiar una reserva de `PENDING` a `CONFIRMED`, luego a `COMPLETED` o `CANCELLED` | Transiciones reflejadas correctamente; verificar qué pasa con el cobro asociado al cancelar |
| 10.6 | No-show | Marcar una reserva pasada como `NO_SHOW` | Se guarda, y debería dejar de contar como "activa" para el chequeo de solape |

## 11. Cobros (`/app/cobros`)

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|---------------------|
| 11.1 | Registrar cobro | Sobre una reserva sin cobro, registrar uno con monto y método (efectivo/transferencia/tarjeta) | Se crea con estatus `PENDING` o `PAID` según el flujo del formulario |
| 11.2 | Marcar como pagado | Cambiar un cobro `PENDING` a `PAID` | Refleja el cambio; debería impactar el KPI de ingresos del dashboard (ver 13) |
| 11.3 | Monto inválido | Intentar registrar un cobro con monto ≤ 0 | Error de validación "El monto debe ser mayor a cero" |
| 11.4 | Cobro condonado | Marcar un cobro como `WAIVED` (si la UI lo permite) | Se refleja correctamente y no cuenta como pendiente ni como pagado en los KPIs |

## 12. Catálogo de especialidades (`/app/catalogs`)

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|---------------------|
| 12.1 | Alta de especialidad | Crear una especialidad nueva | Aparece disponible al crear/editar especialistas |
| 12.2 | Nombre duplicado | Crear una con un nombre ya existente | Error claro, no un 500 (el campo es `@unique` en BD) |
| 12.3 | Deshabilitar | Marcar `enabled = false` en una especialidad en uso | Deja de ofrecerse en formularios nuevos, pero no rompe a los especialistas que ya la tenían asignada |

## 13. Dashboard (`/app/dashboard`)

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|---------------------|
| 13.1 | Conteos básicos | Entrar al dashboard | Especialistas activos, solicitudes pendientes, sucursales y reservas pendientes coinciden con lo real en ese momento |
| 13.2 | Ocupación por sucursal | Con reservas `CONFIRMED`/`COMPLETED` en los últimos 7 días | La barra de % de ocupación por sucursal sube de forma coherente con las horas reservadas |
| 13.3 | Ingresos | Registrar cobros `PAID` y `PENDING` (sección 11) | La dona de "cobrado vs. pendiente" y el texto de montos reflejan los totales correctos |
| 13.4 | Especialistas más activos | Con varias reservas de distintos especialistas en los últimos 30 días | El ranking muestra el orden correcto por número de reservas |
| 13.5 | Sin datos | Probar el dashboard en un estado con cero reservas/cobros (o revisar visualmente qué pasa) | No debe crashear — debe mostrar 0%, "sin registros" o listas vacías, nunca un error |

## 14. Configuración (`/app/configuracion`)

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|---------------------|
| 14.1 | Editar datos de marca | Cambiar nombre, color primario, textos del hero | Se guarda y se refleja en la landing pública |
| 14.2 | Registro público activo/inactivo | Alternar el toggle de registro público | Con el registro desactivado, `/registro` debe reflejarlo (bloquear o avisar, confirmar comportamiento real) |
| 14.3 | Regenerar link de registro | Si aplica | Genera un nuevo link/token sin romper los anteriores en curso |

## 15. Seguridad y límites transversales

Estos casos no son de un módulo específico, pero son los que más importan en una app con datos
reales de un cliente en producción.

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|---------------------|
| 15.1 | Server actions sin sesión | Llamar directamente (ej. con curl/Postman replicando el POST) a una acción de mutación sin cookie de sesión | 401/`unauthorized()`, nunca ejecuta la mutación |
| 15.2 | Server action con rol incorrecto | Con sesión de `SPECIALIST`, intentar invocar una acción que requiere `requireAdmin()` (ej. `crearSucursalAction`) | 403/`forbidden()` |
| 15.3 | Fotos privadas | Confirmar que las URLs de fotos en S3 son firmadas y expiran, no públicas permanentes | Una URL de foto copiada debe dejar de funcionar pasado su tiempo de expiración |
| 15.4 | Datos privados fuera del boundary público | Inspeccionar las respuestas de las páginas públicas (`/`, `/talentos`, `/talentos/[id]`) en el Network tab | Nunca debe viajar `phone`, `internalNotes`, tarifas de consultorio, ni datos de `Charge`/`Reservation` |
| 15.5 | Doble reserva simultánea (race condition) | Si es posible, disparar dos reservas para el mismo consultorio/franja casi al mismo tiempo desde dos pestañas | Solo una debe tener éxito; la otra debe fallar con el mensaje de solape, no crear un registro corrupto |

---

## Plantilla para reportar un hallazgo

Cuando algo falle, copia esto y llénalo — así se puede reproducir y arreglar sin ir y venir:

```
Módulo / caso: (ej. "4.1 Alta completa")
Rol de sesión: admin / staff / especialista / sin sesión
Pasos exactos:
1.
2.
3.
Resultado esperado:
Resultado real (mensaje de error exacto, o captura):
¿Se repite consistentemente?: sí / no / a veces
```

Un error "no explícito" (como el que motivó este documento) casi siempre significa que el
mensaje mostrado en pantalla no es el error real — cuando eso pase, avísame con el módulo y los
pasos y reviso directamente el server action / los logs de Vercel en vez de adivinar desde el
mensaje genérico.
