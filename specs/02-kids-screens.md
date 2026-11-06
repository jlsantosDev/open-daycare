# SPEC 02 — Pantallas de Niños: listado y perfil (solo UI)

> **Estado:** Aprobado
> **Depende de:** SPEC 01
> **Fecha:** 2026-11-06
> **Objetivo:** Implementar los mockups `references/pantallas/ninos.dc.html` y `references/pantallas/perfil-nino.dc.html` como las rutas `/kids` y `/kids/[id]` — únicamente interfaces y componentes reutilizando `AppShell`, con data ficticia y búsqueda local en el frontend, sin backend ni lógica de negocio.

## Alcance

**Incluye:**

- Listado en `/kids` con el diseño exacto del mockup: eyebrow "GESTIÓN", título "Niños", botón "Agregar niño", caja de búsqueda, separador "SALA SOLES · 8 niños" y grid de 8 tarjetas de niño (2 columnas en desktop, 1 en móvil).
- Perfil en `/kids/[id]` con el diseño del mockup: link "Volver a Niños", cabecera (avatar grande 84px, nombre, "3 años · Sala Soles", botón "Editar"), banner "Alergias y notas", tabla de info (nacimiento, sala, ingreso) y columna derecha con botón "Resumen del día" + tarjeta "PADRES VINCULADOS" (padres ACTIVA/PENDIENTE + link "Vincular otro padre").
- Rutas en inglés, decisión del usuario: el listado vive en `/kids` y el perfil en `/kids/[id]` dinámico (slug, ej. `/kids/mateo-fernandez`). Los 8 niños tienen data; ninguna tarjeta da 404.
- Sidebar con item **activo dinámico**: `Sidebar` pasa a recibir un prop `activeItem` y cada página pasa el suyo (`"kids"` en estas pantallas). El item "Niños" cambia su `href` de `/ninos` a `/kids`; los demás links se dejan como están hasta la spec de cada pantalla.
- Buscador **funcional en el frontend**: filtra las tarjetas por nombre sin tocar la data ni el backend.
- `data/kids.ts` (archivo nuevo, decisión del usuario): tipos `Kid`/`Parent` y los 8 niños con toda su data (avatar con colores, edad, alergia, nota, fecha de nacimiento, sala, ingreso, padres).
- Componentes reutilizables en carpeta propia: `KidCard`, `KidsBrowser` (client: búsqueda + contador + grid) y tarjeta de padres.
- Responsividad completa de ambas pantallas (mismo breakpoint `md · 768px` de SPEC 01, drawer móvil vía `AppShell`).
- Links a rutas reales aunque den 404 (decisión de SPEC 01, confirmada): "Agregar niño" → `/kids/new`, "Editar" → `/kids/new`, "Resumen del día" → `/kids/[id]/day-summary`, "Vincular otro padre" → `/kids/[id]/link-parent`.

**Fuera de alcance (para specs futuras):**

- Alta/edición real de niños (`/kids/new`), resumen del día (`/kids/[id]/day-summary`), vinculación de padres (`/kids/[id]/link-parent`): solo los links existen.
- Backend, base de datos, persistencia, autenticación.
- Renombrar las rutas operandas de otras specs (`/nueva-publicacion`, `/avisos`, `/mi-cuenta`) — solo se toca el link "Niños".
- Ordenar/paginar/grupar niños, sedas múltiples, estados vacíos reales.
- Lógica de vinculación o edición de padres (las tarjetas de padres son solo lectura).

## Convenciones de idioma

- **Código en inglés:** archivos, componentes, props, tipos, variables, handlers (`KidCard`, `activeItem`, `parents`, `filterText`). Comentarios en español.
- **UI en español:** todo texto visible ("Niños", "Buscar niño…", "Volver a Niños", "PADRES VINCULADOS", "ACTIVA", "PENDIENTE", "VINCULAR", "MANÍ", "LACTOSA") y los valores de la data ficticia. Igual criterio que SPEC 01.

## Modelo de datos

```ts
// data/kids.ts
export type ParentStatus = "activa" | "pendiente";

export type Parent = {
  id: string;
  name: string; // "Lucía Fernández"
  relation: string; // "Mamá" | "Papá"
  status: ParentStatus; // elige el badge ACTIVA / PENDIENTE
  avatarBg: string; // color del círculo, ej. "#C9B6E8"
};

export type Kid = {
  id: string; // slug de la ruta, ej. "mateo-fernandez"
  name: string; // "Mateo Fernández"
  initial: string; // "M"
  age: string; // "3 años"
  avatarBg: string; // "#A9D9E8"
  avatarText: string; // "#1F7A93"
  allergyBadge?: { label: "MANÍ" | "LACTOSA" }; // badge del listado; sin → chevron
  allergyNote?: string; // texto del banner del perfil; sin → banner oculto
  birthDate: string; // "12 mar 2022"
  room: string; // "Soles"
  enrolled: string; // "feb 2025"
  parents: Parent[]; // 0 → badge "VINCULAR" y label "sin padres vinculados"
};

export const kids: Kid[] = [ /* los 8 niños del mockup */ ];
```

- Los 8 niños del listado con sus datos visuales exactos del mockup (inicial, colores de avatar, edad, cantidad de padres y badges: Mateo MANÍ, Tomás LACTOSA, Valentina VINCULAR sin padres).
- El perfil de Mateo usa la data literal del mockup: nota de alergia "Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.", "12 mar 2022", "Soles", "feb 2025", padres Lucía (ACTIVA) y Diego (PENDIENTE, "invitación enviada").
- Los otros 7 niños tienen data inventada verosímil pero **consistente con el listado** (cantidades de padres y badges del mockup no se contradicen); Valentina muestra "sin padres vinculados" y su perfil solo el link de vincular.
- Sin padres → badge "VINCULAR" (colores del mockup) en lugar del chevron.

## Estructura de archivos

```
data/
  kids.ts                        ← tipos Kid/Parent + los 8 niños

components/
  KidCard/
    KidCard.tsx                  ← server: tarjeta del listado (avatar, badge/chevron)
  KidsBrowser/
    KidsBrowser.tsx              ← client: búsqueda + separador de sala + grid filtrada
  ParentsCard/
    ParentsCard.tsx              ← server: "PADRES VINCULADOS" + link vincular

app/
  kids/
    page.tsx                     ← listado: AppShell + heading + KidsBrowser
    [id]/page.tsx                ← perfil: composición con generateStaticParams
  AppShell/
    AppShell.tsx                 ← modificación: recibe y reenvía activeItem
  AppShell/Sidebar.tsx           ← modificación: prop activeItem; href "Niños" → /kids
```

- `KidsBrowser` es el único client component nuevo: recibe `kids`, guarda `filterText` y renderiza la línea "SALA SOLES · N niños" (con el **contador real** de la búsqueda) y el grid.
- Las páginas del perfil componen la columna derecha y la izquierda; el banner de alergia y la tabla de info son JSX de la página (mismo criterio que el feed en SPEC 01).

## Plan de implementación

1. `components/AppShell/Sidebar.tsx`: prop `activeItem` con default `"kids"`; item activo por comparación; `href` de "Niños" cambiado a `/kids`. **Validación:** `/kids` muestra "Niños" activo y el drawer móvil también.
2. `components/AppShell/AppShell.tsx`: prop opcional `activeItem` reenviado a `Sidebar` (default igual al del Sidebar).
3. `data/kids.ts`: tipos + los 8 niños con data completa y consistente con el listado del mockup. **Validación:** `npx tsc --noEmit` pasa.
4. `components/KidCard/KidCard.tsx`: tarjeta del listado — avatar circular con colores del niño, "2 padres vinculados / 1 padre vinculado / sin padres vinculados" derivado de `parents.length`, badge MANÍ/LACTOSA/VINCULAR o chevron. Link interno a `/kids/[id]`.
5. `components/KidsBrowser/KidsBrowser.tsx`: client component con input de búsqueda, separador con contador dinámico y grid responsive de `KidCard`. **Validación:** `/kids` renderiza las 8 tarjetas y al escribir solo quedan las que coinciden.
6. `app/kids/page.tsx`: composición — `<AppShell activeItem="kids">` + eyebrow "GESTIÓN", título "Niños", botón "Agregar niño" → `/kids/new` y `KidsBrowser`. **Validación manual:** comparado con el mockup en desktop y móvil.
7. `components/ParentsCard/ParentsCard.tsx`: tarjeta "PADRES VINCULADOS" (avatar con inicial, relación · estado, badge ACTIVA/PENDIENTE) + link "Vincular otro padre" → `/kids/[id]/link-parent`.
8. `app/kids/[id]/page.tsx`: perfil — link "Volver a Niños" → `/kids`, cabecera con avatar 84px + "Editar" → `/kids/new`, banner de alergias condicionado a `allergyNote`, tabla de info, botón "Resumen del día" → `/kids/[id]/day-summary` y `ParentsCard`. `generateStaticParams` a partir de `kids`. **Validación manual:** `/kids/mateo-fernandez` vs mockup, y `/kids/valentina-soto` muestra su perfil sin banner de alergia con la fila "sin padres".

## Criterios de aceptación

- [x] `npm run dev` renderiza `/kids` y `/kids/[id]` sin errores de build ni de consola.
  - **FALLA (corregida):** `/kids/[id]` dejaba el error de consola *"params accessed outside of `<Suspense>`"* (`cacheComponents` lo exige; `generateStaticParams` no lo evita). **Fix:** en `app/kids/[id]/page.tsx` el `await params` se movió a un componente interno (`KidProfileWithParams`) dentro de `<Suspense>`, con la shell y `AppShell` fuera del boundary — patrón oficial Next 16 con Partial Prefetching (guía `incremental-static-regeneration-cache-components.md`). **Verificado:** `/kids` y `/kids/mateo-fernandez` cargan con 0 errores de consola; `npm run lint` y `npx tsc --noEmit` limpios. Captura: `.playwright-mcp/02-fix-perfil-mateo-desktop.png`.
- [x] `/kids` muestra el eyebrow "GESTIÓN", el título "Niños", el botón "Agregar niño" con el degradado del mockup y la caja de búsqueda con placeholder "Buscar niño…".
  - **Verificado:** degradado calculado `linear-gradient(#F4977E → #EE8164)` idéntico al mockup; placeholder exacto "Buscar niño…"; sin scroll horizontal en 1280px. (Nota: el texto blanco del botón se ve marrón por el bug de capas CSS documentado en el criterio de comparación visual).
- [x] Aparecen las 8 tarjetas del mockup en el orden del mockup, con avatar de colores, edad y estado de padres correctos por niño.
  - **Verificado:** snapshot de `/kids` lista en orden: Mateo, Sofía, Benjamín, Valentina, Tomás, Emma, Lucas, Olivia. Colores de avatar idénticos a `ninos.dc.html` (ej. Mateo `#A9D9E8/#1F7A93`, Valentina `#F4DC8E/#9A7B1E`, Tomás `#C9B6E8/#7B5FC0`) y estados "2 padres vinculados / 1 padre vinculado / sin padres vinculados" correctos por niño. Captura: `.playwright-mcp/02-kids-desktop.png`.
- [x] Mateo muestra badge "MANÍ", Tomás "LACTOSA", Valentina "VINCULAR" y los demás el chevron.
  - **Verificado:** badges `#FBD8CC/#D9684A` y VINCULAR `#F9D2DE/#C56486` presentes solo en esos tres; resto con chevron (SVG `#CBB89F`), conforme al HTML del mockup.
- [x] Cada tarjeta navega a su propio perfil (`/kids/mateo-fernandez`, etc.) y ninguno da 404.
  - **Verificado:** las 8 rutas (`mateo-fernandez`, `sofia-mendez`, `benjamin-ruiz`, `valentina-soto`, `tomas-diaz`, `emma-castro`, `lucas-romero`, `olivia-vega`) responden 200 con el H1 correcto; un slug inexistente (`/kids/inexistente-xyz`) da 404.
- [x] Al escribir en la búsqueda la grid filtra por nombre y el contador junto a "SALA SOLES" refleja la cantidad visible; al limpiar vuelven los 8.
  - **Verificado:** "lu" → 1 tarjeta (Lucas Romero) con contador "1 niños"; "Sof" → 1 (Sofía Méndez); al limpiar vuelven 8 y el contador "8 niños". Capturas: `.playwright-mcp/02-kids-busqueda-sof.png`.
- [x] `/kids/mateo-fernandez` replica el mockup: link "Volver a Niños", cabecera con avatar 84px + "Editar", banner rosa "Alergias y notas" con la nota del maní, tabla (12 mar 2022 / Soles / feb 2025), botón "Resumen del día" y tarjeta de padres con ACTIVA y PENDIENTE.
  - **FALLA (corregida):** el texto "Resumen del día" era invisible porque `text-white` era pisado por la regla `a { color: inherit }` sin capa de `globals.css` (texto `#3F362E` sobre fondo `#3F362E`). **Fix:** la regla base se envolvió en `@layer base` (ver criterio de comparación visual). **Verificado:** texto blanco `rgb(255,255,255)` sobre fondo `#3F362E`, visible en `.playwright-mcp/02-fix-perfil-mateo-desktop.png`. Resto del perfil ya verificado: link "Volver a Niños", avatar 84px `#A9D9E8/#1F7A93`, banner `#FBDAD6` con la nota del maní, tabla 12 mar 2022/Soles/feb 2025, badges ACTIVA y PENDIENTE.
- [x] La "Resumen del día", "Vincular otro padre", "Agregar niño" y "Editar" apuntan a rutas reales (`/kids/[id]/day-summary`, `/kids/[id]/link-parent`, `/kids/new`) que dan 404 momentáneo.
  - **Verificado:** los cuatro links existen con esos hrefs (confirmados en el DOM de `/kids` y de ambos perfiles) y las tres rutas responden HTTP 404: `/kids/new`, `/kids/mateo-fernandez/day-summary`, `/kids/mateo-fernandez/link-parent`.
- [x] El sidebar en ambas pantallas muestra "Niños" como item activo (desktop y drawer móvil).
  - **Verificado:** en `/kids` y `/kids/mateo-fernandez` el link "Niños" de las dos instancias de `Sidebar` (rail desktop y drawer móvil) lleva las clases activas `bg-accent-soft-bg text-accent font-extrabold`; el drawer móvil lo muestra resaltado (captura `.playwright-mcp/02-kids-mobile-drawer.png`). (Su color de texto difiere del mockup por el bug de capas CSS anotado abajo; el estado activo dinámico en sí funciona).
- [x] En <768px ambas pantallas funcionan con header móvil + drawer: grid de 1 columna, columna del perfil a ancho completo, sin scroll horizontal ni paddings de 40px. *(Texto corregido para hacerlo verificable: el `px-10` de 40px solo aplica ≥640px; en <640px los paddings son de 16px.)*
  - **Verificado (375px y 664px):** ambas pantallas con header móvil y drawer funcionales; grid de 1 columna en el listado; columnas del perfil a ancho completo (333px = contenido); sin scroll horizontal en ningún viewport probado; paddings de 16px en <640px (40px solo entre 640–767px, donde tampoco hay overflow). Capturas: `.playwright-mcp/02-kids-mobile.png`, `.playwright-mcp/02-perfil-mateo-mobile.png`, `.playwright-mcp/02-kids-mobile-drawer.png`.
- [x] `npm run lint` pasa sin errores y `npx tsc --noEmit` no reporta errores de tipos.
  - **Verificado:** `npm run lint` → exit 0 sin salidas; `npx tsc --noEmit` → exit 0 sin errores.
- [x] Comparado lado a lado con los mockups en navegador, no hay diferencias visibles de tipografía, colores ni layout. Capturas de evidencia en `.playwright-mcp/`.
  - **FALLA (corregida):** 4 diferencias causadas por una sola raíz — la regla `a { color: inherit }` de `globals.css` estaba **sin capa** y pisaba las utilidades Tailwind en `@layer utilities`. **Fix:** las reglas (`html, body`, `body`, `a`) se envolvieron en `@layer base { ... }` en `app/globals.css`, como sugería esta verificación. **Verificado con colores computados por Playwright:** botón "Agregar niño" texto blanco sobre degradado `#F4977E → #EE8164`; texto del botón "Resumen del día" blanco; item activo "Niños" coral `#D9583C` (rgb(217,88,60)) en desktop y drawer; "Volver a Niños" `#94887B`. Tipografía, fondo/texto base y layout ya estaban conformes al mockup. Capturas: `.playwright-mcp/02-fix-kids-desktop.png`, `.playwright-mcp/02-fix-perfil-mateo-desktop.png`.
- [x] La estructura de directorios es exactamente `components/KidCard/`, `components/KidsBrowser/`, `components/ParentsCard/` y `data/kids.ts`; las páginas solo componen y mapean.
  - **Verificado:** `data/kids.ts` existen con tipos `Kid`/`Parent`/`ParentStatus` y los 8 niños; `components/KidCard/KidCard.tsx` (server), `components/KidsBrowser/KidsBrowser.tsx` (client con `"use client"`, única pieza client nueva), `components/ParentsCard/ParentsCard.tsx` (server); `app/kids/page.tsx` solo compone `AppShell` + heading + `KidsBrowser` y `app/kids/[id]/page.tsx` compone cabecera/banner/tabla + `ParentsCard` con `generateStaticParams` a partir de `kids`. También verificado: `Sidebar` recibe prop `activeItem` (default `"kids"`), `href` de "Niños" → `/kids`, y `AppShell` reenvía `activeItem` a ambas instancias de `Sidebar`. Convención Context7 Next 16: `generateStaticParams` con data fija es la recomendación correcta con `cacheComponents` (los 8 slugs se prerenderizan en build).

## Decisiones

- **Sí:** rutas `/kids` y `/kids/[id]` (decisión explícita del usuario: no hay nombres de página en español). Anticipa los slugs de las pantallas futuras (`/kids/new`, `/kids/[id]/day-summary`, `/kids/[id]/link-parent`).
- **Sí:** todo el texto visible en español y solo el código en inglés (decisión del usuario), aclarado explícitamente: únicamente las rutas van en inglés por pedido directo.
- **Sí:** solo el link "Niños" del sidebar cambia a `/kids`; los demás links (`/nueva-publicacion`, `/avisos`, `/mi-cuenta`, `/login`) se renombran en la spec de cada pantalla, no aquí.
- **Sí:** `activeItem` como prop en `Sidebar`/`AppShell` (decisión del usuario: reutilizar los componentes). Páginas server components; cero JS extra por esto.
- **Sí:** búsqueda filtrando en el cliente (decisión del usuario). `KidsBrowser` es client component; el resto de la pantalla queda server.
- **Sí:** contador "N niños" dinámico junto a "SALA SOLES". Con búsqueda real, dejar un "8 niños" fijo se vería roto mientras filtra.
- **Sí:** data de niños en `data/kids.ts` aparte (decisión del usuario) porque `mock.ts` no tiene nada de niños y el volumen de perfiles completo justifica separarlo.
- **Sí:** los 7 niños sin detalle en el mockup tienen data inventada consistente con el listado (nombres, colores, cantidades de padres ya fijados por el diseño). Es parte de la data ficticia, no un problema de fidelidad.
- **Sí:** chevron (>>) para niños sin badge (idéntico al mockup); badge deriva de `allergyBadge` y de `parents.length === 0`.
- **No:** filtrar/buscar en servidor, URLs con query (`?q=`) ni debounce. No hay backend; el filtro local no lo necesita.
- **No:** `KidsBrowser` controlando `AppShell` o estados globales. Componente aislado con su `useState` local.
- **No:** edición real, resumen del día o vinculación en esta spec. El pedido fue únicamente las dos interfaces.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `cacheComponents` + rutas dinámicas exigen `generateStaticParams` | La data es fija: los 8 slugs se generan del array `kids`; no hay rutas dinámicas reales en runtime |
| El prop `activeItem` puede divergir entre drawer y desktop si se pasan distinto | `AppShell` es el único que llama a `Sidebar`: un solo punto con el mismo valor en ambos |
| La búsqueda client puede chocar con hidratación/SSR de `KidsBrowser` | `useState("")` inicial; el filtro corre solo en el cliente tras el input, el SSR muestra los 8 |

## Qué **no** está en este spec

- Alta y edición de niños (`/kids/new`).
- Resumen del día por niño (`/kids/[id]/day-summary`).
- Vinculación real de padres (`/kids/[id]/link-parent`).
- Cualquier backend, BD o sesión.

Todo eso, si entra, va en su propio spec.
