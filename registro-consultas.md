# Especificación funcional — Sistema de Registro de Consultorios en Renta (BioMaternal)

> Documento de referencia para el equipo de desarrollo. Describe la estructura de datos, reglas de negocio, catálogos, validaciones y reportes derivados del sistema actualmente implementado en Excel. El objetivo es reconstruirlo como software (web/móvil) conservando exactamente la misma lógica.

---

## 1. Contexto del negocio

BioMaternal es un negocio de **renta de consultorios a especialistas** (médicos y nutricionales). El sistema debe llevar el control operativo diario y generar los reportes que se presentan en la **reunión semanal** del equipo (guía interna de 15 minutos: flujo de pacientes, conversión, InBody y flujo B2B).

Entidades centrales:
- **Especialistas** que rentan consultorios (catálogo maestro).
- **Consultorios** físicos, numerados del 1 al 6.
- **Citas** agendadas contra un especialista y un consultorio.
- **InBody**: estudio de composición corporal, se realiza en consulta o se vende por separado (público o corporativo).
- **Contactos** entrantes por llamada y por WhatsApp, con seguimiento de conversión.
- **Prospección B2B**: nuevos especialistas interesados en rentar.

El negocio opera en tres sucursales: Anaya, Primavera y Valle Alto.

---

## 2. Modelo de datos

A continuación cada entidad con sus campos, tipos, si es requerido, valores permitidos y notas. Los nombres de campo se dan en `snake_case` como sugerencia para la base de datos; la etiqueta visible es la de la columna del Excel.

### 2.1 Especialista (`especialistas`) — catálogo maestro

| Campo | Etiqueta | Tipo | Requerido | Valores / Notas |
|---|---|---|---|---|
| `id` | No. | int (PK, autoincremental) | sí | Autogenerado |
| `nombre` | Nombre del Especialista | string | sí | Único. Es la clave que referencian citas y agenda |
| `especialidad` | Especialidad | enum | sí | Ver catálogo 3.1 |
| `telefono` | Teléfono | string | no | Formato libre (ej. `667 100 0001`) |
| `consultorio_habitual` | Consultorio | int | no | 1–6 |
| `estatus` | Estatus | enum | sí | `Activo`, `Inactivo` |

Reglas:
- Solo los especialistas con `estatus = Activo` deberían aparecer como opciones al agendar (en Excel aparecen todos; el software puede filtrar por activos).
- El nombre funciona como identificador de negocio en el Excel. En el software, las citas y la agenda deben referenciar `especialista_id` (FK), no el texto del nombre.

### 2.2 Cita (`citas`)

| Campo | Etiqueta | Tipo | Requerido | Valores / Notas |
|---|---|---|---|---|
| `id` | No. | int (PK) | sí | Autogenerado |
| `fecha` | Fecha | date | sí | |
| `paciente` | Paciente | string | sí | Nombre del paciente |
| `especialista_id` | Especialista | FK → especialistas | sí | Seleccionado del catálogo |
| `especialidad` | Especialidad | enum | no | Ver 3.1. Puede autocompletarse desde el especialista |
| `hora_inicio` | Hora Inicio | time | no | |
| `hora_fin` | Hora Fin | time | no | |
| `horas` | Horas | decimal (calculado) | — | `= (hora_fin - hora_inicio)` en horas, 1 decimal. Ver 4.1 |
| `estatus` | Estatus Cita | enum | sí | `Realizada`, `Cancelada`, `Pospuesta` |
| `motivo_cancelacion` | Motivo Cancelacion | string | no | Requerido lógicamente si `estatus = Cancelada` |
| `inbody_en_consulta` | InBody en Consulta | enum | sí | `Si`, `No` |
| `consultorio` | Consultorio | int | sí | 1–6 |
| `tipo_pago` | Tipo de Pago | enum | no | `Efectivo`, `Transferencia`, `Tarjeta` |
| `costo_renta` | Costo Renta ($) | money | no | Monto que paga el especialista por la renta |
| `observaciones` | Observaciones | string | no | |

Reglas:
- `horas` es derivado; no se captura.
- El ingreso por renta solo cuenta cuando `estatus = Realizada` (ver reportes).
- `motivo_cancelacion` debe exigirse en UI cuando `estatus = Cancelada`.

### 2.3 Solicitud por WhatsApp (`agenda_whatsapp`)

| Campo | Etiqueta | Tipo | Requerido | Valores / Notas |
|---|---|---|---|---|
| `id` | No. | int (PK) | sí | |
| `fecha` | Fecha | date | sí | |
| `contacto` | Nombre / Telefono | string | sí | Nombre y/o teléfono del solicitante |
| `especialista_id` | Especialista Solicitado | FK → especialistas | no | Del catálogo |
| `se_concreto` | Se Concreto | enum | sí | `Si`, `No` |
| `motivo_no` | Motivo (si no) | string | no | Requerido lógicamente si `se_concreto = No` |
| `observaciones` | Observaciones | string | no | |

Reglas:
- `motivo_no` debe exigirse en UI cuando `se_concreto = No`.
- Idealmente, cuando `se_concreto = Si`, el sistema podría generar/enlazar una cita en `citas` (mejora sugerida, no existe en Excel).

### 2.4 Venta de InBody fuera de consulta (`ventas_inbody`)

| Campo | Etiqueta | Tipo | Requerido | Valores / Notas |
|---|---|---|---|---|
| `id` | No. | int (PK) | sí | |
| `fecha` | Fecha | date | sí | |
| `cliente` | Cliente | string | sí | |
| `tipo` | Tipo (Corporativo/Publico) | enum | sí | `Corporativo`, `Publico` |
| `precio` | Precio ($) | money | sí | |
| `observaciones` | Observaciones | string | no | |

### 2.5 Llamada / contacto (`llamadas`)

| Campo | Etiqueta | Tipo | Requerido | Valores / Notas |
|---|---|---|---|---|
| `id` | No. | int (PK) | sí | |
| `fecha` | Fecha | date | sí | |
| `nombre` | Nombre | string | sí | |
| `tipo` | Tipo | enum | sí | `Entrante`, `Saliente` |
| `contacto_nuevo` | Contacto Nuevo | enum | sí | `Si`, `No` |
| `genero_cita` | Genero Cita | enum | sí | `Si`, `No` |
| `observaciones` | Observaciones | string | no | |

### 2.6 Prospecto B2B (`flujo_b2b`)

| Campo | Etiqueta | Tipo | Requerido | Valores / Notas |
|---|---|---|---|---|
| `id` | No. | int (PK) | sí | |
| `fecha` | Fecha | date | sí | |
| `especialista_interesado` | Especialista Interesado | string | sí | Texto libre (aún no es del catálogo) |
| `especialidad` | Especialidad | enum | no | Ver 3.1 |
| `estatus` | Estatus | enum | sí | `Interesado`, `En negociacion`, `Confirmado`, `Descartado` |
| `incidencia_agenda` | Incidencia en Agenda | enum | sí | `Si`, `No` |
| `observaciones` | Observaciones | string | no | |

Regla de negocio sugerida: cuando un prospecto pasa a `Confirmado`, debería poder promoverse al catálogo `especialistas` como `Activo`.

---

## 3. Catálogos (enums)

### 3.1 Especialidades
`Nutriologa`, `Psicologa`, `Fisioterapia`, `Medicina General`, `Odontologia`, `Ginecologia`, `Pediatria`, `Dermatologia`, `Otra`

> El catálogo debe ser editable/extensible desde configuración. `Otra` es el comodín.

### 3.2 Estatus de cita
`Realizada`, `Cancelada`, `Pospuesta`

### 3.3 Tipo de pago
`Efectivo`, `Transferencia`, `Tarjeta`

### 3.4 Consultorios
`1`, `2`, `3`, `4`, `5`, `6` (fijo por infraestructura física)

### 3.5 Tipo de InBody externo
`Corporativo`, `Publico`

### 3.6 Tipo de llamada
`Entrante`, `Saliente`

### 3.7 Estatus B2B
`Interesado`, `En negociacion`, `Confirmado`, `Descartado`

### 3.8 Estatus de especialista
`Activo`, `Inactivo`

### 3.9 Sí/No (booleano de negocio)
`Si`, `No` — aplica a: `inbody_en_consulta`, `se_concreto`, `contacto_nuevo`, `genero_cita`, `incidencia_agenda`.

> En base de datos conviene modelar estos como `boolean`. La UI muestra "Sí/No".

---

## 4. Reglas de cálculo

### 4.1 Horas de una cita
```
horas = (hora_fin - hora_inicio) convertido a horas decimales, redondeado a 1 decimal
```
Si falta `hora_inicio` u `hora_fin`, `horas` queda vacío/null. No se captura manualmente.

### 4.2 Ingreso por renta (solo citas realizadas)
```
ingreso_renta = SUMA(costo_renta) donde estatus = 'Realizada'
```

### 4.3 Ingreso total del negocio
```
ingreso_total = ingreso_renta_realizadas + SUMA(ventas_inbody.precio)
```

### 4.4 Tasa de conversión (llamadas)
```
tasa_conversion = citas_generadas_por_llamada / contactos_nuevos
donde citas_generadas_por_llamada = COUNT(genero_cita = 'Si')
      contactos_nuevos            = COUNT(contacto_nuevo = 'Si')
```
Proteger contra división entre cero (resultado 0 si denominador = 0). Formato porcentaje.

### 4.5 Tasa de cierre de WhatsApp
```
tasa_cierre_whatsapp = COUNT(se_concreto = 'Si') / COUNT(solicitudes_whatsapp)
```
Proteger contra división entre cero. Formato porcentaje.

### 4.6 Total InBody
```
total_inbody = COUNT(citas.inbody_en_consulta = 'Si') + COUNT(ventas_inbody)
```

---

## 5. Reportes

Todos los reportes son **derivados en tiempo real** de las tablas base (en Excel son fórmulas; en software deben ser consultas/agregaciones). Deben poder filtrarse por rango de fechas (semana, mes, sucursal si aplica). Los rangos actuales del Excel son fijos por capacidad; en software no debe haber límite de filas.

### 5.1 Reporte semanal (dashboard principal)

**Flujo de pacientes**
- Citas agendadas = total de citas
- Citas efectivas (realizadas) = `estatus = Realizada`
- Cancelaciones = `estatus = Cancelada`
- Pospuestas = `estatus = Pospuesta`
- Horas rentadas = suma de `horas`
- Ingreso por renta = ver 4.2

**Agenda WhatsApp**
- Solicitudes por WhatsApp = total
- Concretadas = `se_concreto = Si`
- No concretadas = `se_concreto = No`
- Tasa de cierre WhatsApp = ver 4.5

**Conversión (llamadas)**
- Total de llamadas
- Contactos nuevos = `contacto_nuevo = Si`
- Citas generadas por llamada = `genero_cita = Si`
- Tasa de conversión = ver 4.4

**InBody**
- InBody realizados en consulta = `citas.inbody_en_consulta = Si`
- InBody corporativos (externos) = `ventas_inbody.tipo = Corporativo`
- InBody públicos (externos) = `ventas_inbody.tipo = Publico`
- Ingreso InBody externos = suma de `ventas_inbody.precio`
- Total InBody = ver 4.6

**Flujo B2B**
- Especialistas interesados = `estatus = Interesado`
- En negociación = `estatus = En negociacion`
- Confirmados = `estatus = Confirmado`
- Incidencias en agenda = `incidencia_agenda = Si`

**Ingreso total**
- Ingreso total del negocio = ver 4.3 (métrica destacada)

### 5.2 Reporte por especialista

Una fila por **cada** especialista del catálogo (se genera automáticamente al dar de alta un especialista). Columnas:

| Métrica | Cálculo |
|---|---|
| Especialista | nombre |
| Especialidad | del catálogo |
| Citas Agendadas | COUNT citas del especialista |
| Realizadas | COUNT citas `estatus = Realizada` |
| Canceladas | COUNT citas `estatus = Cancelada` |
| Pospuestas | COUNT citas `estatus = Pospuesta` |
| Horas | SUMA de `horas` del especialista |
| Ingreso Renta ($) | SUMA `costo_renta` donde `estatus = Realizada` |
| Citas WhatsApp | COUNT solicitudes WhatsApp dirigidas al especialista |

---

## 6. Validaciones de UI (obligatorias)

- Todos los campos enum se presentan como **listas desplegables** (nunca texto libre).
- El campo **Especialista** en Citas y en Agenda WhatsApp se alimenta del **catálogo de especialistas** (no se escribe a mano). Al agregar un especialista al catálogo, aparece automáticamente en esas listas y en el reporte por especialista.
- `motivo_cancelacion` requerido cuando `estatus = Cancelada`.
- `motivo_no` requerido cuando `se_concreto = No`.
- `hora_fin` debe ser posterior a `hora_inicio`.
- Montos ≥ 0.
- Fechas no futuras para registros de eventos ya ocurridos (configurable).

---

## 7. Relaciones (resumen para el modelo)

```
especialistas (1) ──< (N) citas            [citas.especialista_id]
especialistas (1) ──< (N) agenda_whatsapp  [agenda_whatsapp.especialista_id]
consultorios (1–6, fijo) ──< (N) citas     [citas.consultorio]

ventas_inbody, llamadas, flujo_b2b : entidades independientes (sin FK a especialistas en el modelo actual)
```

Mejoras sugeridas (no presentes en el Excel, pero deseables en software):
- `flujo_b2b.especialista` → promover a `especialistas` al confirmar.
- `agenda_whatsapp` concretada → generar cita en `citas`.
- Agregar dimensión **sucursal** a citas/ventas/llamadas para segmentar reportes por las tres sucursales.
- Historial/auditoría (quién capturó y cuándo).

---

## 8. Estructura actual del archivo Excel (referencia 1:1)

El Excel entregado tiene 8 hojas, en este orden:

1. **Catalogo Especialistas** — tabla maestra (`especialistas`). Los nombres capturados aquí alimentan los desplegables de las demás hojas.
2. **Registro de Citas** — tabla `citas`. Columna `Horas` calculada; `Especialista` es desplegable desde el catálogo.
3. **Agenda WhatsApp** — tabla `agenda_whatsapp`.
4. **Ventas InBody** — tabla `ventas_inbody`.
5. **Llamadas y Conversion** — tabla `llamadas`.
6. **Flujo B2B** — tabla `flujo_b2b`.
7. **Reporte Semanal** — dashboard agregado (sección 5.1).
8. **Por Especialista** — reporte por especialista autollenado desde el catálogo (sección 5.2).

Convenciones visuales (identidad BioMaternal, opcionales para el software):
- Azul marino `#0A2E6C`, verde `#7FB03C`, azules claros para filas alternadas.
- Encabezado con logo BioMaternal y subtítulo "Especialidades Médicas y Nutricionales".
- Pie con datos de las tres sucursales.

---

## 9. Notas finales para el desarrollador

- Las capacidades de fila del Excel (500 citas, 300 llamadas, etc.) son limitaciones del formato, **no** reglas de negocio: el software no debe imponerlas.
- Toda métrica de los reportes es **derivada**; no se almacena, se calcula al vuelo desde las tablas base.
- Los enums deben ser configurables desde una pantalla de administración, especialmente **Especialidades** y **Consultorios** (por si el negocio crece).
- Prioridad de la lógica: catálogo de especialistas como fuente única de verdad para los nombres; reportes reactivos a los datos capturados.
