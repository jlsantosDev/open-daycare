# SPEC 04 — Modal "Agregar niño" en /kids (UI + validación)

> **Estado:** Implementado
> **Depende de:** SPEC 02
> **Fecha:** 2026-11-08
> **Objetivo:** Implementar el mockup `references/pantallas/agregar-nino.dc.html` como un modal que abre el botón "Agregar niño" de `/kids`, con nombre, fecha de nacimiento (formato dd/mm/aaaa validado como fecha real) y sala requeridos, salas predefinidas y alta del niño en la lista visible, sin backend.

## Alcance

**Incluye:**

- **Modal sobre `/kids`** con el diseño exacto del mockup `agregar-nino.dc.html`: tarjeta `#FBF4EC` con borde `#ECE0D0`, radio 24px, sombra grande, ancho máx 520px, cabecera con link "Cancelar" (`#94887B`), título "Agregar niño" (Fredoka, 18px, semibold) y acción "Guardar" (`#D9583C`, extrabold), separadas por borde inferior `#ECE0D0`.
- Secciones del formulario con los eyebrows del mockup y estilos de campo (borde `1.5px #EADFD0`, radio 14px, fondo blanco, placeholder `#B6A99B`): NOMBRE COMPLETO (placeholder "Ej. Martina López"), FECHA DE NACIMIENTO (placeholder "dd/mm/aaaa") + SALA en la misma fila (2 columnas), ALERGIAS (ETIQUETAS) (placeholder "Ej. Maní, Lactosa") y NOTAS MÉDICAS (textarea "Indicaciones, medicación, contactos…").
- **Campos requeridos con error visible:** nombre, fecha y sala. Si "Guardar" se pulsa con alguno vacío, el campo se marca en error y se muestra un mensaje bajo él; el modal queda abierto y no se agrega ningún niño.
- **Validación de fecha dd/mm/aaaa como fecha real completa** (decisión del usuario): día 1–31 según el mes real, mes 1–12 y bisiestos. Falla `32/01/2026`, `13/…` y también `30/02/2026` o `29/02/2025`; pasa `29/02/2024`. Todo lo que no matchee `dd/mm/aaaa` de 4 dígitos también falla.
- **Desplegable de sala** (nativo `<select>`, estilizado como los demás campos con chevron del mockup) que arranca **vacío con placeholder** (decisión del usuario) y contiene exactamente 6 opciones predefinidas: **Sol, Luna, Tierra, Marte, Saturno, Jupiter**.
- **"Guardar" con formulario válido agrega el niño a la grid de `/kids`** (decisión del usuario): estado client in-memory sobre los 8 niños estáticos; se pierde al refrescar. Al guardar se cierra el modal y el nuevo niño aparece (el contador "N niños" de `KidsBrowser` se actualiza solo).
- **Datos derivados para el niño nuevo** (sin inventar campos que el usuario no cargó): `id` slug único desde el nombre (con sufijo `-2`, `-3`… si colisiona con un id existente), `initial` = primera letra del nombre, `avatarBg`/`avatarText` de una paleta fija rotando por nombre, `age` = edad calculada al momento del alta ("X años", o "N meses" si tiene menos de 1), `room` = sala elegida, `birthDate` = fecha con formato del proyecto ("12 mar 2022"), `parents: []` (la tarjeta muestra el badge "VINCULAR"), `allergyBadge` = primera etiqueta de alergias en mayúsculas (si cargó), `allergyNote` = notas médicas (si cargó).
- **Alergias y notas son opcionales** (como en el mockup, sin mensaje de error).
- **Cierres del modal:** link "Cancelar", tecla Esc y click en el fondo oscurecido descartan sin agregar nada.
- El botón "Agregar niño" de `/kids` (mismo look degradado que hoy) **abre el modal en vez de navegar** (decisión del usuario: no existe la ruta `/kids/new`).
- Responsividad: en móvil (<768px) el modal ocupa casi todo el ancho con scroll interno del formulario; el overlay no genera overflow horizontal.

**Fuera de alcance (para specs futuros):**

- Edición de niños: el botón "Editar" de `/kids/[id]` queda como está (SPEC 02); el modal no se reutiliza para editar.
- Persistencia real (localStorage/BD/backend, sesiones): el alta vive solo en memoria del cliente.
- Perfil del niño agregado: `/kids/[id]` se prerenderiza con los 8 estáticos; el link de la tarjeta de un niño agregado da 404 (limitación documentada).
- CRUD de salas o salas dinámicas: la lista es una constante fija; la discrepancia con "Sala Soles" de la data actual queda documentada, sin unificar.
- Limpieza del separador "SALA SOLES · N niños" cuando haya niños de otra sala (queda estático como hoy).

## Convenciones de idioma

- **Código en inglés:** archivos, componentes, props, handlers (`AddKidModal`, `handleSubmit`, `roomOptions`, `parseBirthDate`). Comentarios en español. Igual criterio que SPEC 01/02/03.
- **UI en español:** todo texto visible ("Agregar niño", "Cancelar", "Guardar", "NOMBRE COMPLETO", "FECHA DE NACIMIENTO", "SALA", "ALERGIAS (ETIQUETAS)", "NOTAS MÉDICAS", mensajes de error y placeholders).

## Modelo de datos

```ts
// data/kids.ts — cambios
export type Kid = {
  // ...igual que SPEC 02, con un ensanchamiento para el alta:
  allergyBadge?: { label: string };  // era "MANÍ" | "LACTOSA"; el alta puede crear cualquier etiqueta
  // room ya es string; birthDate sigue siendo display string
};

// Salas predefinidas del desplegable (decisión literal del usuario)
export const roomOptions = ["Sol", "Luna", "Tierra", "Marte", "Saturno", "Jupiter"] as const;
```

```ts
// components/AddKidModal/AddKidModal.tsx — estado interno (client component)
type AddKidErrors = { name?: string; birthDate?: string; room?: string };

// uncontrolled inputs: name, birthDate, allergies, medicalNotes
// room: select controlado con "" inicial
```

La validación de fecha es una función pura del modal: regex `^\d{2}/\d{2}/\d{4}$` + chequeo de fecha real (constructor `Date` y verificación de que día/mes no se hayan "redondeado"): `31/02` y `29/02/2025` fallan.

## Estructura de archivos

```
components/
  AddKidModal/
    AddKidModal.tsx    ← client ("use client"): overlay + tarjeta mockup, validaciones, cierre
  KidsSection/
    KidsSection.tsx    ← client: eyebrow + título + botón "Agregar niño", estado kids
                         (8 estáticos + altas), búsqueda/grid (reusa KidsBrowser)
  KidsBrowser/
    KidsBrowser.tsx    ← sin cambios funcionales: sigue recibiendo `kids` por props

data/
  kids.ts              ← modificación: `allergyBadge.label` → string + `roomOptions`

app/
  kids/
    page.tsx           ← modificación: delega el encabezado/botón/browser a <KidsSection/>
```

- El estado de la lista debe vivir en un client component que además renderice el botón, por eso se introduce `KidsSection` como único dueño del estado; `app/kids/page.tsx` queda server component componiendo `AppShell` + `KidsSection` (cero JS extra fuera de los dos client components).
- `AddKidModal` recibe `roomOptions` (del propio módulo `kids.ts`), `existingIds` y `onAdd(kid)`; no conoce `KidsBrowser`.

## Plan de implementación

1. `data/kids.ts`: ensanchar `allergyBadge.label` a `string` y exportar `roomOptions`. **Validación:** `npx tsc --noEmit` pasa y `/kids` sigue idéntica.
2. `components/AddKidModal/AddKidModal.tsx` (estructura + estilos): overlay oscuro fijo, tarjeta del mockup con los 4 campos, cabecera Cancelar/título/Guardar. Cerrar con Cancelar, Esc y click en el fondo. **Validación manual:** abre y cierra, fiel al mockup en desktop.
3. Validaciones en el mismo archivo: requeridos con mensajes bajo el campo y submit bloqueado mientras haya errores; regex + fecha real para dd/mm/aaaa, saltando al campo con focus. **Validación manual:** `32/01/2026`, `12/13/2026`, `30/02/2026`, `29/02/2025` dan error; `29/02/2024` y `15/06/2026` pasan; guardar vacío muestra 3 errores.
4. `components/KidsSection/KidsSection.tsx`: mover eyebrow/título/botón desde `page.tsx`, estado `kids` (inicia con los estáticos) + `AddKidModal`; Guardar válido deriva el `Kid` (slug único, colores por paleta, edad, `birthDate` formateada, badge de alergia) y lo agrega. `app/kids/page.tsx` queda componiendo `AppShell` + `KidsSection`. **Validación manual:** agregar "Martina López" / `15/06/2022` / Sol → aparece tarjeta nueva con contador 9; refrescar vuelve a 8.
5. Responsividad y pulido: modal usable en 375px (scroll interno, campos de fecha y sala apilados si el mockup lo exige a 2 columnas), sin overflow ni errores de consola.
6. `npm run lint` + `npx tsc --noEmit` limpios antes de cerrar.

## Criterios de aceptación

- [x] `npm run dev` renderiza `/kids` sin errores de build ni de consola, con las 8 tarjetas como antes.
  - **Verificado:** /kids con las 8 tarjetas y contador "8 niños"; consola con 0 errores y 0 warnings tras todo el flujo. Captura: `.playwright-mcp/04-alta-lista-9.png`.
- [x] El botón "Agregar niño" abre el modal con el diseño del mockup (tarjeta `#FBF4EC` máx 520px, cabecera Cancelar / "Agregar niño" / Guardar `#D9583C`, eyebrows y estilos de campo del mockup), y el overlay oscurece `/kids` detrás.
  - **Nota de re-verificación (2026-11-10):** los valores `1.5px` de borde declarados en el CSS son correctos (regla ganadora `.border-[1.5px] { border-width: 1.5px }` en CSSOM); `getComputedStyle` reporta 1px porque el navegador redondea el ancho usado del borde a píxel entero en DPR 1 (ocurre incluso con estilo inline `border: 1.5px`). No es desvío de la implementación.
  - **Verificado:** colores computados — tarjeta `rgb(251,244,236)`, radio 24px, max-width 520px; Guardar `rgb(217,88,60)` (#D9583C); Cancelar y eyebrows `#94887B`; título Fredoka 18px/600; tracking de eyebrow 0.7px. Captura: `.playwright-mcp/04-modal-desktop.png`.
- [x] Guardar con el formulario vacío muestra mensajes de error en nombre, fecha y sala, no agrega tarjetas y no cierra el modal.
  - **Verificado:** snapshot tras Guardar vacío muestra 3 `[invalid]` con los párrafos "Ingresá el nombre completo.", "Ingresá la fecha de nacimiento en formato dd/mm/aaaa." y "Elegí la sala."; contador permanece en 8 y el modal sigue abierto con foco en nombre.
- [x] El desplegable de sala arranca vacío (sin opción elegida) y contiene exactamente Sol, Luna, Tierra, Marte, Saturno y Jupiter.
  - **Verificado:** `<select>` controlado en `""` con placeholder "Seleccioná sala…" (disabled+hidden); opciones computadas exactas: Sol, Luna, Tierra, Marte, Saturno, Jupiter.
- [x] `32/01/2026`, `01/13/2026`, `30/02/2026`, `29/02/2025` y textos que no sean `dd/mm/aaaa` muestran error de fecha y bloquean el guardado.
  - **Corrección del ejemplo (especificación):** el criterio original usaba `13/01/2026` para "mes 13", pero en dd/mm/aaaa eso es día 13 + mes 1 (fecha real). El mes fuera de rango va en la **2ª posición**: `01/13/2026`/`08/13/2026`. Documentado también en Decisiones.
  - **Verificado:** errores de fecha con `32/01/2026`, `08/13/2026`, `30/02/2026`, `29/02/2025`, `12-05-2026` (texto no dd/mm); en todos el contador no cambia y el modal queda abierto.
- [x] `29/02/2024` se acepta como fecha válida; `29/02/2025` se rechaza (bisiesto correcto).
  - **Verificado:** `29/02/2024` no produce error de fecha (avanza al error de sala); `29/02/2025` muestra "Ingresá una fecha dd/mm/aaaa real: día y mes dentro del calendario.".
- [x] Guardar con "Martina López" + `15/06/2022` + Sol cierra el modal y la grid pasa a 9 tarjetas con la nueva ("0 padres vinculados" → badge VINCULAR, inicial "M", sala Sol, edad "4 años").
  - **Verificado:** modal cerrado, contador "9 niños", tarjeta "Martina López / 4 años · sin padres vinculados / VINCULAR / inicial M / avatar violeta (#C9B6E8)"; el alta deriva además el id `martina-lopez`. Captura: `.playwright-mcp/04-alta-lista-9.png`.
- [x] La fila "SALA SOLES · N niños" refleja el nuevo total (9) tras el alta y vuelve a 8 tras refrescar (alta in-memory).
  - **Verificado:** "9 niños" tras el alta; tras recargar la página vuelve a "8 niños" y las tarjetas de altas desaparecen (in-memory, sin persistencia).
- [x] Si se cargan alergias ("Maní, Lactosa"), la tarjeta nueva muestra el badge de la primera etiqueta en mayúsculas; sin alergias muestra VINCULAR/chevron según padres.
  - **Verificado:** alta con "Maní, Lactosa" muestra badge "MANÍ" (fallback de color aplicado; el alta genera id `martina-lopez-2` ante la colisión del slug ✔). Sin alergias: VINCULAR.
- [x] Cancelar, Esc y click en el fondo cierran el modal sin alterar la lista.
  - **Verificado:** las tres rutas de cierre cierran el modal con la lista en 8; el click en fondo se probó con mouse en coordenada fuera de la tarjeta (`page.mouse.click(20, 320)`); con draft cargado Esc no guarda (el padre monta el modal por remount → siguiente apertura limpia).
- [x] En 375px el modal se ve completo con scroll interno, sin overflow horizontal ni errores.
  - **Verificado:** scrollWidth 365 = clientWidth 365 (0 overflow), tarjeta 333px, fecha y sala apiladas (`grid-cols-1` <640px). Captura: `.playwright-mcp/04-modal-mobile-375.png`.
- [x] `npm run lint` pasa sin errores y `npx tsc --noEmit` no reporta errores de tipos.
  - **Nota de re-verificación (2026-11-10):** en un checkout limpio (CI) hay que correr `npm install` y `npx next typegen` antes: sin deps `eslint` no existe y sin tipos generados `PageProps`/`LayoutProps` (globales de Next 16) fallan en `app/kids/[id]/page.tsx` y `app/layout.tsx`. Con ambos pasos, ambos comandos exit 0.
  - **Verificado:** ambos exit 0 (corridos tras los pasos y al cerrar).
- [x] Comparado lado a lado con `references/pantallas/agregar-nino.dc.html`, no hay diferencias visibles de tipografía, colores ni layout. Capturas en `.playwright-mcp/`.
  - **Verificado:** capturas `.playwright-mcp/04-modal-desktop.png`, `04-modal-mobile-375.png`, `04-alta-lista-9.png`; colores y fuentes computados idénticos (Fredoka título, Nunito cuerpo, paleta del mockup). Únicas diferencias deliberadas: selección de sala nativa (`<select>`) en vez del widget falso del mockup y mensajes de error que el mockup no prevé.
  - Re-verificación lado a lado 2026-11-10: mockup en `references/pantallas/agregar-nino.dc.html` vs app — capturas nuevas `.playwright-mcp/04-verif-modal-desktop.png` y `04-verif-mockup-desktop.png`; tipografía, colores y layout coinciden.
  - **Verificado:** capturas `.playwright-mcp/04-modal-desktop.png`, `04-modal-mobile-375.png`, `04-alta-lista-9.png`; colores y fuentes computados idénticos (Fredoka título, Nunito cuerpo, paleta del mockup). Únicas diferencias deliberadas: selección de sala nativa (`<select>`) en vez del widget falso del mockup y mensajes de error que el mockup no prevé.

## Decisiones

- **Sí:** modal sobre `/kids` en vez de la ruta `/kids/new` (decisión explícita del usuario: "como un modal"). SPEC 02 dejaba el link previsto para esa ruta; se reemplaza por el disparador del modal. No hay página que borrar (nunca existió).
- **Sí:** las 6 salas literales Sol, Luna, Tierra, Marte, Saturno, Jupiter ("por ahora" y predefinidas, decisión del usuario). La data actual dice "Soles": discrepancia documentada, no se unifica en este spec.
- **Sí:** validar fecha como fecha real completa (decisión del usuario eligió el alcance estricto): día ≤ días del mes real, mes 1–12, bisiestos.
- **Sí:** Guardar agrega el niño a la lista visible, en memoria (decisión del usuario, opción recomendada elegida). Refrescar lo pierde: aceptado.
- **Sí:** sala con placeholder vacío para que el "requerido" tenga sentido (decisión del usuario).
- **Sí:** solo "Agregar"; el botón "Editar" del perfil queda fuera (decisión del usuario). Reutilizar el modal para edición iría en otro spec.
- **Sí:** edad calculada desde la fecha al alta ("X años" / "N meses" si <1) en lugar de campo de edad manual: una sola fuente de verdad de la edad.
- **Sí:** `enrolled` del niño nuevo = mes/año del alta (ej. "nov 2026"): el tipo `Kid` exige la fecha de ingreso y el form no la captura. Ambigüedad del spec resuelta con el usuario durante `/spec-impl` (Paso 4).
- **Sí:** cerrar también con Esc y click en el fondo, además del link "Cancelar": patrón estándar de modales, no contradice el mockup.
- **No:** persistencia local (localStorage) del alta: lo pedido es in-memory; el guardado real iría con backend en otro spec.
- **No:** `<input type="date">` nativo: el pedido exige dd/mm/aaaa tipeado con ese formato y errores por día/mes fuera de rango; el date picker nativo no da ese feedback textual.
- **No:** rooms como dominio nuevo (`data/rooms.ts`): son 6 strings fijos, `roomOptions` en `data/kids.ts` alcanza.
- **Corrección (durante `/spec-impl`):** el criterio original usaba `13/01/2026` para "mes 13", pero en dd/mm/aaaa esa cadena es día 13 + mes 1 y es válida. Implementación reformulada al caso correcto (`08/13/2026`; "mes 13 o 18" según el pedido original). El código siempre estuvo bien: era un error del ejemplo del spec.
- **Sí:** reset del modal por **remount condicional** (el padre monta `AddKidModal` solo cuando está abierto) en vez de un effect de reset: `react-hooks/set-state-in-effect` de ESLint prohíbe el `setState` en efecto y el remount garantiza formularios limpios en cada apertura sin código extra.
- **Sí:** fallback de color en `KidCard` para badges de etiquetas nuevas: tras ensanchar `AllergyBadgeLabel` a `string`, una etiqueta no mapeada (ej. "SOJA") daba `className undefined`; usa los mismos colores del mockup (`#FBD8CC`/`#D9684A`).

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| La tarjeta de un niño agregado enlaza a `/kids/[id]` que no existe (prerender solo con los 8 estáticos) → 404 al hacer click | Limitación documentada en el alcance; el perfil dinámico para altas va en un spec futuro |
| Colisión de slug si se agrega un niño con nombre idéntico a uno existente | Sufijo incremental (`mateo-fernandez-2`) en la derivación del id |
| El estado del alta vive en el cliente: el separador "SALA SOLES" queda estático aunque el nuevo niño sea de otra sala | Criterio solo-UI del proyecto; unificar salas/agrupación va en otro spec |
| `cacheComponents` + movimientos de client/server al introducir `KidsSection` | `page.tsx` sigue server componiendo `AppShell`; el estado queda encapsulado en un único client wrapper |

## Qué **no** está en este spec

- Edición de niños (botón "Editar" del perfil).
- Persistencia del alta entre sesiones (localStorage/BD) o backend.
- Página `/kids/new` como ruta.
- Perfil funcional de niños agregados en runtime.
- Salas dinámicas o CRUD de salas; unificar "Sol" con la data "Soles".

Cada uno de esos, si entra, va en su propio spec.
