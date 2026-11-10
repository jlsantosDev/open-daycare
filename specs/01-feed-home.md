# SPEC 01 — Home: feed siguiendo el mockup

> **Estado:** Implementado
> **Depende de:** —
> **Fecha:** 2026-11-04
> **Objetivo:** Implementar el mockup `references/pantallas/feed.dc.html` como pantalla home `/` con contenido estático de data ficticia, responsivo con menú hamburguesa en pantallas pequeñas y estilo idéntico al mockup, sin autenticación ni base de datos.

## Alcance

**Incluye:**

- Reemplazo del starter en `app/page.tsx` por la pantalla de feed.
- Identidad visual global: Fredoka + Nunito vía `next/font/google`, fondo `#F6ECDF`, texto `#3F362E`, scrollbar del mockup. Tokens en `@theme` de `app/globals.css`.
- Data ficticia en `data/mock.ts`: usuario, sala y 3 posts (logro, actividad con placeholder de foto, anuncio).
- Sidebar y posts con links a rutas reales aunque las pantallas aún no existan (404 momentáneo): `/nueva-publicacion`, `/ninos`, `/avisos`, `/mi-cuenta`, `/login`, `/detalle-publicacion`, `/foto`.
- Responsividad completa de la pantalla feed.
- `components/AppShell/AppShell.tsx` (client component): compone sidebar de escritorio + header móvil + drawer; wrapper reutilizable por las pantallas futuras.
- Breakpoint `md` (768px): sidebar oculto y hamburguesa en móvil, sidebar visible en ≥768px.
- Header móvil sticky (`md:hidden`): logo compacto OpenDayCare a la izquierda, botón hamburguesa a la derecha, fondo `#FFFDF9` con borde `#ECE0D0`.
- Drawer móvil: el mismo Sidebar dentro de un panel overlay fijo que desliza desde la izquierda, con backdrop; se cierra con click en el backdrop, en el botón cerrar (X) o al navegar a un link.
- Contenido fluido: padding horizontal reducido en móvil, tarjetas full-width, tipografías del mockup intactas.

**Fuera de alcance (para specs futuras):**

- Login / autenticación, sesión real, logout funcional.
- Base de datos o persistencia de cualquier tipo.
- Las pantallas ninos, avisos, crear-publicación, detalle-publicación, mi-cuenta, foto (specs propios).
- Interactividad de corazones / comentarios (solo contadores estáticos del mockup).
- Animaciones sofisticadas (transiciones del mockup). Un `transition` simple del drawer alcanza.

## Convenciones de idioma

- **Código en inglés:** todo identificador — nombres de archivos y carpetas, componentes, props, variables, funciones, tipos, handlers, clases — se escribe en inglés (`AppShell`, `menuOpen`, `badgeStyles`, `classroom`). Los comentarios pueden ir en español.
- **Aplicación en español:** todo el texto visible de la UI (labels, botones, títulos del feed, badges "LOGRO / ACTIVIDAD / ANUNCIO", placeholder de foto) y los valores de la data ficticia (`"logro" | "actividad" | "anuncio"`, nombres de niños, captions) quedan en español: es producto, no código.
- Regla del `AGENTS.md` ("Usar código limpio, nombres, funciones, variables, etc en inglés") + UI del proyecto en español.

## Modelo de datos

```ts
// data/mock.ts
type PostType = "logro" | "actividad" | "anuncio";

type Post = {
  id: string;
  title: string;         // "Mateo" | "Anuncio general"
  initial?: string;      // inicial del avatar del niño; si falta, el post es un anuncio (icono megáfono)
  time: string;          // "14:20"
  type: PostType;        // elige el color del badge
  audience: string;      // "familia de Mateo" | "toda la sala"
  text: string;
  likes: number;
  comments: number;
  photoCaption?: string; // "Foto · pintando con témperas" → placeholder dashed
};

export const user = { name: "Caro Giménez", role: "Maestra · Soles", initial: "C" };
export const classroom = { name: "Sala Soles", summary: "12 niños · martes 17 jun" };
export const posts: Post[] = [ /* los 3 posts del mockup */ ];
```

```tsx
// app/page.tsx
export default function Home() {
  return (
    <AppShell>
      {/* saludo + caja "Compartí un momento…" + separador "PUBLICADO HOY" desde data/mock.ts */}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </AppShell>
  );
}
```

- El mapa `badgeStyles` (colores del badge según `PostType`) vive en `PostCard`, no en la página ni en la data.
- `AppShell` no recibe props de data: importa `user` y `classroom` directamente de `data/mock.ts`.
- `AppShell` es `"use client"` (gestiona `useState` para el drawer); la página y `PostCard` siguen siendo server components.
- Un único `<Sidebar>` para desktop (`hidden md:flex`) y para el drawer móvil.
- Este spec introduce única y exclusivamente esta data ficticia. No cambia modelos existentes (no hay).

## Estructura de archivos

```
components/                    ← minúscula, decisión del usuario
  AppShell/
    AppShell.tsx               ← client: sidebar desktop + header móvil + drawer
    Sidebar.tsx                ← nav, la reusa desktop y drawer
  PostCard/
    PostCard.tsx               ← server: card de post (badge, avatar, likes)

app/
  layout.tsx                   ← fuentes Fredoka/Nunito + metadata
  globals.css                  ← identidad visual en @theme
  page.tsx                     ← feed: recorre posts y compone los componentes

data/
  mock.ts                      ← user, classroom, posts
```

## Plan de implementación

1. `app/globals.css`: reemplazar los valores del starter por la identidad visual (variables de fondo, texto, scrollbar del mockup, tokens `@theme`). La app compila y muestra el fondo crema aunque la home siga siendo el starter. **Validación:** `npm run dev`, fondo `#F6ECDF`.
2. `app/layout.tsx`: cargar Fredoka y Nunito con `next/font/google` (pesos 400–700 Fredoka; 400–800 + italic Nunito), exponerlas como variables CSS, metadata (`title: "OpenDayCare"`), `lang="es"`.
3. `data/mock.ts`: tipos y datos del usuario (`user`), la sala (`classroom`) y los 3 posts, tal cual el mockup.
4. `components/AppShell/Sidebar.tsx`: sidebar del mockup (logo OpenDayCare, botón "Nueva publicación", nav de 4 items con "Feed" activo, usuario con botón cerrar sesión) apuntando a las rutas reales.
5. `components/AppShell/AppShell.tsx`: client component — `<Sidebar>` desktop (`hidden md:flex`), header móvil sticky (`md:hidden`) con logo + hamburguesa, drawer con backdrop al abrir. **Validación manual:** en viewport <768px el sidebar desaparece, aparece la barra con hamburguesa y abre/cierra el menú.
6. `components/PostCard/PostCard.tsx`: card de post con badge LOGRO / ACTIVIDAD / ANUNCIO y placeholder de foto dashed cuando `photoCaption` existe.
7. `app/page.tsx`: composición — `<AppShell>` → saludo, caja "Compartí un momento…", separador "PUBLICADO HOY" y `posts.map(PostCard)`, con `max-w-[760px]` y padding adaptativo (`px-4 sm:px-10`), sin scroll horizontal en móvil. **Validación manual:** viewport móvil y desktop comparados contra el mockup.

## Criterios de aceptación

- [x] `npm run dev` renderiza `/` sin errores de build ni de consola.
- [x] El body usa Nunito; los títulos/tarjetas usan Fredoka; el fondo es `#F6ECDF`.
- [x] Aparecen 3 posts en el orden del mockup, con sus badges: LOGRO (verde), ACTIVIDAD (celeste), ANUNCIO (azul).
- [x] El post de actividad muestra el placeholder de foto dashed `#DBCDBA` con el caption "Foto · pintando con témperas".
- [x] El sidebar muestra "Nueva publicación" con el degradado del mockup y "Feed" como item activo; los links van a rutas reales (`/nueva-publicacion`, `/ninos`, `/avisos`, `/mi-cuenta`, `/login`).
- [x] Los links de cada post apuntan a `/detalle-publicacion` y "Editar" a `/nueva-publicacion`; el placeholder de foto a `/foto`. Mostrar 404 al momento es aceptable: las pantallas son de las próximas specs.
- [x] En un viewport <768px el sidebar izquierdo no es visible y aparece el header móvil sticky con el logo OpenDayCare y el botón hamburguesa.
- [x] Al pulsar el botón hamburguesa se abre el menú lateral que desliza desde la izquierda con backdrop; se cierra con click en el backdrop, el botón X, o cualquier link del menú.
- [x] En ≥768px el header móvil no aparece, el sidebar es visible con estilo del mockup y el botón hamburguesa no existe en el DOM visible.
- [x] En móvil no hay scroll horizontal: las tarjetas de posts ocupan el ancho disponible y los paddings se reducen respecto a los 40px del desktop.
- [x] El header móvil se mantiene fijo (sticky) mientras se hace scroll del feed.
- [x] `npm run lint` pasa sin errores y `npx tsc --noEmit` no reporta errores de tipos.
- [x] Comparado lado a lado con `references/pantallas/feed.dc.html` en navegador, no hay diferencias visibles de tipografía, colores ni layout.
  > Nota de verificación: comparado contra la captura `references/screenshots/feed.png` (el MCP de Playwright bloquea `file://`, no se pudo abrir el `.dc.html` en navegador). Tipografía, colores y layout coinciden. Micro-diferencias de microcopy (no de tipografía/color/layout): el eyebrow de la app usa "GUARDERÍA · SALA SOLES" (punto medio) mientras el mockup usa "GUARDERÍA - SALA SOLES" (guion), y el role del usuario es "Maestra · Soles" en la app (valor fijado por este spec) vs "Maestra · Sala Soles" en el mockup. Capturas de evidencia en `.playwright-mcp/`.
- [x] La estructura de directorios es exactamente `components/AppShell/`, `components/PostCard/` y `data/mock.ts`; `page.tsx` no contiene JSX de posts ni de nav — solo la composición y el `map`.

## Decisiones

- **Sí:** Tailwind con tokens `@theme` en `globals.css` (decisión del usuario; idioma idiomático del stack — Tailwind 4 CSS-first), con valores exactos al mockup.
- **No:** estilos inline tal cual el mockup. Migrar a clases evita divergencias en pantallas futuras.
- **Sí:** fonts vía `next/font/google` (auto-hosting, evita el flash del `<link>` de Google Fonts del mockup). Visualmente iso: mismas familias y pesos.
- **Sí:** links a rutas reales aunque den 404 (decisión del usuario). Prepara navegación para las próximas specs.
- **Sí:** data ficticia centralizada en `data/mock.ts` (decisión del usuario) en lugar de HTML hardcodeado en la página.
- **Sí:** breakpoint `md · 768px` (decisión confirmada). Es el límite donde los 248px del sidebar empiezan a apretar el contenido.
- **Sí:** drawer con backdrop + reutilización del mismo Sidebar y `AppShell` como client component. El contenido del feed sigue server-rendered; solo el shell paga el costo del JS de interactividad.
- **Sí:** header móvil sticky con logo + hamburguesa (decisión confirmada), sobre un botón flotante suelto.
- **Sí:** carpeta raíz `components/` en minúscula con subcarpeta por componente (decisión del usuario). Alineado con la convención habitual de Next; no cambia nada en rutas.
- **Sí:** `PostCard` extraído a carpeta propia (decisión del usuario) porque lo reutilizarán las pantallas futuras (detalle, ninos).
- **No:** acordeón bajo la cabecera ni sidebar condensado de iconos. Menos fiel al estilo visual del mockup.
- **No:** librerías de UI (headlessui, etc.). Un drawer con `useState` y clases condicionales alcanza sin agregar dependencias.
- **No:** `next/image` / foto real. El placeholder dashed es parte del diseño del mockup, no un asset.
- **No:** estado dinámico (likes, comentarios, fecha del sistema). El pedido es reproducción idéntica y estática del mockup.
- **Sí:** identificadores de código (variables, funciones, tipos, props, archivos) en inglés según la regla de código limpio del proyecto; texto visible de la UI y valores de la data ficticia en español porque son producto. Ver *Convenciones de idioma* arriba.
- **Sí:** renombrar `studentName`/`authorInitial` a `title`/`initial` (opcional): el post de anuncio no tiene niño asociado, muestra el icono megáfono y el título "Anuncio general".
- **Sí:** renombrar la prop `for` a `audience`: evita usar una palabra reservada del lenguaje como nombre de propiedad y es más expresivo.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Pesos de fuente que Google Fonts ofrece de forma distinta en `next/font` | Declarar pesos explícitos 400–700 (Fredoka) y 400–800 + italic (Nunito) |
| Rutas 404 al click pueden confundir en la revisión manual | Documentado en alcance: esas pantallas son specs siguientes |
| El drawer reutiliza el Sidebar y puede arrastrar estilos de desktop (position sticky, etc.) | El shell renderiza dos instancias con clases de contexto distintas; la del drawer con estilos de overlay fijos |

## Qué **no** está en este spec

- Autenticación o sesión real (el botón cerrar sesión es solo visual).
- Base de datos o persistencia.
- Las demás pantallas del set de mockups (cada una, en su propio spec).
- Interactividad (likes, comentarios).

Cada ítem, si entra, entra en su propio spec.
