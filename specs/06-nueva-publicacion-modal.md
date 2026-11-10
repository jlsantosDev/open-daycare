# SPEC 06 — Modal "Nueva publicación" en el feed (UI + validación + alta in-memory)

> **Estado:** Aprobado
> **Depende de:** SPEC 01 (feed), SPEC 02 (data de niños)
> **Fecha:** 2026-11-10
> **Objetivo:** Implementar el mockup `references/pantallas/crear-publicacion.dc.html` como un modal que abre la caja "Compartí un momento…" del feed, con selección multi-niños acumulativa excluyente con "Toda la sala", tipo entre 7 opciones, descripción y fotos decorativas, y que con todo válido publica el post nuevo in-memory arriba del feed, sin backend.

## Alcance

**Incluye:**

- **Modal sobre el feed `/`** con el diseño exacto del mockup: tarjeta `#FBF4EC` con borde `#ECE0D0`, radio **24px**, sombra `0 20px 50px -24px rgba(63,54,46,.35)`, ancho máximo **580px**; cabecera con link "Cancelar" (`#94887B`, 15px, bold), título "Nueva publicación" (Fredoka, 18px, 600) y acción "Publicar" (`#D9583C`, 15px, extrabold), separadas por borde inferior `#ECE0D0`.
- **PARA — selección multi-niños acumulativa (decisión del usuario):** un chip por cada niño de `data/kids.ts` (los 8, no solo los 3 del mockup). Formato del chip idéntico al mockup: pill (radio 999px, 14px bold) con círculo de avatar de 26px con la inicial del niño sobre `kid.avatarBg`/`kid.avatarText`. Los clicks **suman**: cada click en un niño lo selecciona sin deseleccionar a los ya elegidos; click sobre un niño ya seleccionado lo deselecciona (toggle individual). Seleccionado: fondo `#3F362E`, borde `#3F362E`, texto blanco. No seleccionado: fondo `#FFFDF9`, borde `#ECE0D0`, texto `#6E6359`.
- **"Toda la sala" con exclusión bidireccional (decisión del usuario):** chip sin avatar, mismo estilo base. Al activarlo **se limpia toda la selección de niños**; y al seleccionar cualquier niño después se desactiva "Toda la sala". Los dos estados son excluyentes porque representan destinos distintos.
- **TIPO — 7 chips del mockup:** Comida, Siesta, Actividad, Logro, Ánimo, Foto, Anuncio, abren todos **deseleccionados** (decisión del usuario; el mockup muestra "Comida" elegida por ser estado post-escritura — divergencia decidida). Pill de `8px 16px`, 13.5px extrabold, sin borde; cada chip usa los colores del mockup (sección Modelo de datos) y apilan con wrap. Sin default: Publicar sin tipo elegido muestra el error de sección (patrón de PARENTESCO en SPEC 05).
- **DESCRIPCIÓN:** textarea con placeholder "Contá cómo le fue hoy…" y estilos del mockup (borde `1.5px #EADFD0`, radio 14px, fondo blanco, 15px, min-height 120px, redimensionable). Abre vacía (decisión del usuario; el texto precargado del mockup es post-escritura).
- **FOTOS decorativas (decisión del usuario):** la sección se muestra con las dos cajas del mockup (rectángulo sólido de 96px con icono de cámara sobre `#F4ECE1` + tile "Agregar" dashed con "+" `#C5503A`), pero **"Agregar" no sube nada y no se puede adjuntar** (sin backend, mismo criterio que el código ficticio de SPEC 05).
- **Validación requerida (decisión del usuario):** Publicar exige (a) al menos un destinatario (algún niño **o** "Toda la sala"), (b) un tipo y (c) descripción con contenido (recortada). Errores visibles como mensajes bajo cada sección: "Elegí al menos un destinatario o \"Toda la sala\".", "Elegí el tipo de publicación.", "Escribí la descripción.". Con error el modal queda abierto, no se publica nada y el primer problema recibe foco (patrón SPEC 04).
- **Publicar con todo válido agrega el post al feed in-memory (decisión del usuario):** nueva tarjeta **primera** del listado de PUBLICADO HOY (encima de las existentes); se deriva `id`, `title`, `audience`, `time`, `type`, `text` según el mapeo siguiente. Se pierde al refrescar (alta en memoria, mismo criterio que SPEC 04). El modal se cierra.
- **Mapeo de datos del post creado:**
  - **1 niño:** `title` = primer nombre del niño (ej. "Mateo"), `audience` = "familia de {nombre}", `initial` = su inicial.
  - **N niños (N ≥ 2):** `title` = "{primer nombre del primero} y {N-1} más" (ej. "Mateo y 2 más"), `audience` = "familias de {N} niños", `initial` = inicial del primero.
  - **"Toda la sala":** `title` = "Anuncio general", `audience` = "toda la sala", sin `initial` (la tarjeta muestra el icono de megáfono).
  - `time` = hora real del momento de publicar formateada `HH:MM` 24h (decisión del usuario).
  - `text` = descripción tal como la escribió el usuario.
  - `likes` = 0, `comments` = 0, `photoCaption` vacío (no hay foto real).
- **Cierres del modal:** link "Cancelar", tecla Esc y click en el fondo oscurecido descartan sin publicar.
- **Trigger:** la caja "Compartí un momento…" de `/` pasa a `<button>` con **misma visual** y abre el modal (patrón SPEC 04/05: la ruta `/nueva-publicacion` nunca existió, no hay página que borrar).
- Responsividad: en móvil (<768px) el modal ocupa casi todo el ancho con scroll interno del formulario; sin overflow horizontal.

**Fuera de alcance (para specs futuros):**

- Subida real de fotos o preview local: FOTOS es solo visual (decisión del usuario).
- Persistencia de las publicaciones (localStorage/BD/backend): viven solo en memoria del cliente.
- Edición/eliminación de posts existentes: el botón "Editar" de las tarjetas queda como está.
- Detalle de publicación funcional (`/detalle-publicacion`) y el link muerto `/foto`.
- Flujo de publicación disparado desde otro lugar (ej. perfil del niño).

## Convenciones de idioma

- **Código en inglés:** archivos, componentes, props, handlers (`NewPostModal`, `FeedSection`, `handleSubmit`, `typeOptions`, `buildPostFromDraft`). Comentarios en español. Igual criterio que SPEC 01–05.
- **UI en español:** todo texto visible ("Nueva publicación", "Cancelar", "Publicar", "PARA", "TIPO", "DESCRIPCIÓN", "FOTOS", "Agregar", "Toda la sala", nombres de tipos, mensajes de error y placeholders).

## Modelo de datos

```ts
// data/mock.ts — cambios
export type PostType = "logro" | "actividad" | "anuncio" | "comida" | "siesta" | "animo" | "foto";

// Label con acento para el badge de la tarjeta (se muestra en uppercase)
export const postTypeLabel: Record<PostType, string> = {
  logro: "Logro", actividad: "Actividad", anuncio: "Anuncio",
  comida: "Comida", siesta: "Siesta", animo: "Ánimo", foto: "Foto",
};
```

```ts
// components/NewPostModal/NewPostModal.tsx — estado interno (client)
type NewPostErrors = { recipients?: string; type?: string; description?: string };

// recipients: { mode: "kids"; ids: Set<string> } | { mode: "wholeClass" }
// typeId: PostType | null
// description: string (textarea controlada)
```

```ts
// Colores de los chips TIPO del modal (paleta del mockup crear-publicacion.dc.html)
const typeChipStyles: Record<PostType, { bg: string; text: string }> = {
  comida: { bg: "#9A7B1E", text: "#ffffff" },
  siesta: { bg: "#E7DCF6", text: "#7B5FC0" },
  actividad: { bg: "#2E89A6", text: "#ffffff" },
  logro: { bg: "#CFEBD8", text: "#3E9B6C" },
  animo: { bg: "#F9D2DE", text: "#C56486" },
  foto: { bg: "#FBD8CC", text: "#D9684A" },
  anuncio: { bg: "#CCD8F4", text: "#4E72C8" },
};
```

```ts
// components/PostCard/PostCard.tsx — entradas nuevas de badgeStyles (Post ya de 7 tipos)
comida: { card: "bg-[#EFE8CB] text-[#9A7B1E]", dot: "bg-[#9A7B1E]" },
siesta: { card: "bg-[#E7DCF6] text-[#7B5FC0]", dot: "bg-[#7B5FC0]" },
animo: { card: "bg-[#F9D2DE] text-[#C56486]", dot: "bg-[#C56486]" },
foto: { card: "bg-[#FBD8CC] text-[#D9684A]", dot: "bg-[#D9684A]" },
```

Ninguna estructura persiste. `Post` no cambia de forma (solo se ensancha el dominio de `PostType`); el modal reusa `data/kids.ts` (los 8 niños con `name`, `initial`, `avatarBg`, `avatarText`). Los fondos pastel de los badges nuevos derivan de la paleta del mockup: donde el chip del mockup ya es pastel (siesta/ánimo/foto) se reusa directamente; comida en el mockup es sólido (`#9A7B1E`), así que su pastel se deriva (`#EFE8CB`).

## Estructura de archivos

```
components/
  NewPostModal/
    NewPostModal.tsx   ← client ("use client"): overlay + tarjeta del mockup, selección
                         de destinatarios, validaciones, derivación y cierre
  FeedSection/
    FeedSection.tsx    ← client: trigger "Compartí un momento…" (button) + separador
                         PUBLICADO HOY + listado de posts (reusa PostCard)
                         + montaje condicional del modal, dueño del estado de posts
  PostCard/
    PostCard.tsx        ← modificación: badgeStyles para comida/siesta/ánimo/foto
                         + badge con postTypeLabel[post.type] en uppercase

data/
  mock.ts               ← modificación: ensancha PostType + postTypeLabel

app/
  page.tsx              ← server: sigue componiendo AppShell + encabezado del saludo;
                          delega caja + separador + feed a <FeedSection/>
```

- Patrón de SPEC 04/05: el dueño del estado (`FeedSection`) es un client component que también renderiza el trigger, para que modal y listado compartan el estado.
- `FeedSection` monta `NewPostModal` **condicionalmente** → reset del formulario por remount en cada apertura, sin effects de reset (decisión ya asentada en SPEC 04; evita también la regla ESLint `set-state-in-effect`).
- `NewPostModal` recibe `kids`, `typeOptions` y `onPublish(post)`; no conoce `FeedSection`.
- `PostCard` sigue siendo server component: solo cambia el mapa de estilos y el label del badge.

## Plan de implementación

1. `data/mock.ts`: ensanchar `PostType` (4 claves nuevas) y exportar `postTypeLabel`. **Validación:** `npx tsc --noEmit` pasa (fallará `PostCard` hasta el paso 2 por el `Record` exhaustivo; se corrige en el mismo corte o en pantalla de 2 pasos seguidos).
2. `components/PostCard/PostCard.tsx`: completar `badgeStyles` con los 4 tipos nuevos y mostrar `postTypeLabel[post.type].toUpperCase()` en el badge. **Validación manual:** el feed sigue idéntico (Logro/Actividad/Anuncio de hoy, con "LOGRO"/"ACTIVIDAD"/"ANUNCIO" como antes).
3. `components/NewPostModal/NewPostModal.tsx` (estructura + estilos): overlay, tarjeta del mockup (máx 580px), cabecera Cancelar/título/Publicar, sección PARA con los 8 chips + "Toda la sala", TIPO con los 7 chips, DESCRIPCIÓN y FOTOS visual. Cerrar con Cancelar, Esc y click en el fondo. **Validación manual:** abre y cierra, fiel al mockup en desktop.
4. Lógica de destinatarios en el mismo archivo: suma acumulativa de niños con toggle individual y exclusión bidireccional con "Toda la sala". **Validación manual:** marcar 3 niños y activar "Toda la sala" limpia; elegir un niño después desactiva "Toda la sala" y se vuelve a acumular.
5. Validaciones y derivación: submit vacío muestra los 3 mensajes de sección y no publica; validación por contenido recortado; submit válido construye el `Post` (título/audiencia/initial/time/type/text/likes/comments) y lo antepone al listado. **Validación manual:** publicar con 1 niño; con 2+ niños ("{primero} y N más"); con "Toda la sala" ("Anuncio general" sin avatar); refrescar pierde el post.
6. `components/FeedSection/FeedSection.tsx` + `app/page.tsx`: mover trigger y listado a `FeedSection` (estado `posts` inicial = `posts` de data), mantener el header del saludo en `page.tsx`. **Validación manual:** flujo completo abrir → armar → publicar → tarjeta nueva arriba → Cancelar/Esc descartan sin cambios.
7. Responsividad y pulido: modal usable en 375px (scroll interno del formulario, sin overflow horizontal ni errores de consola).
8. `npm run lint` + `npx tsc --noEmit` limpios antes de cerrar.

## Criterios de aceptación

- [ ] `npm run dev` renderiza `/` sin errores de build ni de consola, con el feed (header, trigger, 3 posts) idéntico al actual.
- [ ] La caja "Compartí un momento…" es un `<button>` con la misma visual y abre el modal del mockup: tarjeta `#FBF4EC` máx 580px radio 24px, cabecera Cancelar / "Nueva publicación" (Fredoka 18px/600) / Publicar `#D9583C`, overlay oscuro que oscurece el feed detrás.
- [ ] La fila PARA muestra 8 chips (uno por niño de `data/kids.ts`) con avatar circular de 26px (inicial sobre `avatarBg`/`avatarText` del niño) más el chip "Toda la sala" sin avatar.
- [ ] Suma acumulativa: click en Mateo lo selecciona (fondo `#3F362E`, texto blanco); click en Sofía mantiene a Mateo; click sobre Sofía la deselecciona a ella sola y Mateo sigue seleccionado.
- [ ] Al activar "Toda la sala" se limpia la selección de niños y queda seleccionada; al hacer click en un niño después, "Toda la sala" se desactiva (exclusión bidireccional).
- [ ] Los 7 chips de TIPO (Comida, Siesta, Actividad, Logro, Ánimo, Foto, Anuncio) abren deseleccionados con los colores de fondo/texto del mockup; elegir uno lo deja seleccionado y elegir otro lo reemplaza.
- [ ] Publicar con el modal recién abierto (nada elegido, descripción vacía) muestra los 3 mensajes de error (destinatarios, tipo, descripción), no cierra el modal y no agrega tarjeta al feed.
- [ ] Publicar con destinatarios elegidos muestra solo los mensajes de tipo y descripción (2 errores; el de destinatarios desapareció).
- [ ] Publicar todo válido con 1 niño cierra el modal y antepone la tarjeta: título "{primer nombre}", avatar con su inicial, audiencia "familia de {nombre}", hora actual `HH:MM`, badge del tipo elegido con sus colores, texto de la descripción y 0 likes / 0 comentarios.
- [ ] Publicar con 3 niños crea la tarjeta con título "{primero} y 2 más" y audiencia "familias de 3 niños".
- [ ] Publicar con "Toda la sala" crea la tarjeta "Anuncio general" con icono de megáfono (sin avatar) y audiencia "toda la sala".
- [ ] Una publicación con un tipo nuevo (ej. Siesta) muestra el badge con el label acentuado correcto ("SIESTA") y los colores asignados (`#E7DCF6`/`#7B5FC0`); los 3 posts existentes siguen mostrando LOGRO/ACTIVIDAD/ANUNCIO sin cambio visual.
- [ ] Refrescar la página pierde las publicaciones creadas (in-memory) y vuelve al estado de 3 posts.
- [ ] Cancelar, Esc y click en el fondo cierran el modal sin publicar; la próxima apertura muestra todo limpio (sin selección de ningún niño ni "Toda la sala", tipo deseleccionado, descripción vacía).
- [ ] La sección FOTOS muestra las dos cajas del mockup (96px sólida con cámara + tile dashed "Agregar" con "+") y el click en "Agregar" no dispara ninguna acción ni abre picker de archivos (es un elemento decorativo, no un input).
- [ ] En 375px el modal se ve completo con scroll interno, sin overflow horizontal ni errores de consola.
- [ ] `npm run lint` pasa sin errores y `npx tsc --noEmit` no reporta errores de tipos.
- [ ] Comparado lado a lado con `references/pantallas/crear-publicacion.dc.html`, no hay diferencias visibles de tipografía, colores ni layout (más las divergencias deliberadas documentadas de estado inicial).

## Decisiones

- **Sí:** modal sobre el feed en vez de la ruta `/nueva-publicacion` (decisión del usuario: "como un modal"). El link muerto se reemplaza por el disparador del modal; la ruta nunca existió, no hay página que borrar.
- **Sí:** selección multi-niños **acumulativa** con toggle individual + exclusión bidireccional con "Toda la sala" (base del pedido, decisión del usuario).
- **Sí:** los 8 niños de `data/kids.ts` como chips (decisión del usuario, opción recomendada elegida); el mockup muestra solo 3 por ser ilustrativo.
- **Sí:** Publicar agrega el post **in-memory** al feed, primero de PUBLICADO HOY (decisión del usuario, opción recomendada elegida; sigue el patrón de alta del SPEC 04). Se pierde al refrescar.
- **Sí:** los 7 tipos son publicables, ensanchando `PostType` y agregando badges para los 4 nuevos (decisión del usuario). El modal usa la paleta del mockup; los fondos pastel de los badges nuevos derivan de esa misma paleta.
- **Sí:** validación con 3 requeridos y mensajes de sección (no uno por chip ni por niño): el mensaje describe el estado de la sección completa, no cada control ausente.
- **Sí:** FOTOS decorativa (decisión del usuario: no sube nada); el tile no es un `<input type="file">`.
- **Sí:** estado inicial vacío (niños, "Toda la sala", tipo y descripción) (decisión del usuario); el estado precargado del mockup es post-escritura, coherente con la divergencia decidida en SPEC 05.
- **Sí:** título multi "{primer nombre} y N más" (decisión del usuario, opción recomendada), "Anuncio general" para toda la sala (herencia del patrón de la data).
- **Sí:** hora del post tomada al momento de publicar en `HH:MM` (decisión del usuario, opción recomendada).
- **Sí:** label del badge con acento correcto vía `postTypeLabel` ("ÁNIMO", no "ANIMO"); para los 3 tipos existentes el resultado visual no cambia (ya se mostraban en uppercase).
- **Sí:** reset del modal por **remount condicional** (FeedSection lo monta solo cuando está abierto): patrón asentado en SPEC 04/05, evita además la regla ESLint `set-state-in-effect`.
- **No:**`Record<PostType, ...>` parcial: el mapa de estilos debe cubrir las 7 claves para que el build valide la exhaustividad.
- **No:** subida/preview de fotos, persistencia, edición/borrado de posts, detalle funcional, flujo desde perfil. Cada uno va en su propio spec si entra.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `Link` → `button` en la caja "Compartí un momento…": la visual debe quedar idéntica | Se conservan las clases tal cual (el mockup del trigger no cambia); verificación lado a lado contra el estado previo |
| `badgeStyles` es `Record<PostType, …>`: ensanchar el dominio rompe el build | `tsc` atrapa la clave faltante (errores de exhaustividad cambio controlado); pasos 1–2 se corrigen juntos |
| Movimiento de estado de `page.tsx` (server) a `FeedSection` (client) con `cacheComponents` | `page.tsx` sigue componiendo `AppShell` + header serializable; el estado queda encapsulado en un único client wrapper (patrón KidsSection de SPEC 04) |
| La derivación de title/audience/time no coincide con lo que el usuario espera | La derivación es una función pura dentro del modal y está descripta en el spec con ejemplos; los casos 1 niño / N niños / toda la sala están en los criterios de aceptación |

## Qué **no** está en este spec

- Subida o preview de adjuntos en FOTOS.
- Persistencia de posts (localStorage/BD/backend) o sesión.
- Editar/eliminar posts existentes (trigger "Editar" de la tarjeta).
- Detalle de publicación funcional (`/detalle-publicacion`).
- Flujo de publicación disparado desde otro lugar (ej. perfil del niño).

Cada uno de esos, si entra, va en su propio spec.
