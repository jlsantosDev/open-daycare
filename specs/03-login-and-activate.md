# SPEC 03 — Pantallas de acceso: Login y Activar cuenta (solo UI)

> **Estado:** Implementado
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-11-08
> **Objetivo:** Implementar los mockups `references/pantallas/login.dc.html` y `references/pantallas/activar-cuenta.dc.html` como las rutas standalone `/login` y `/activate-account` — únicamente interfaces con data ficticia, sin backend, autenticación ni validación real, y eliminando del login el selector "Ingreso como" (Personal/Familia).

## Alcance

**Incluye:**

- Login en `/login` con el diseño exacto del mockup, en dos columnas (≥768px): panel izquierdo con degradado coral `linear-gradient(155deg, #F6A98E → #F2937A 45% → #EC7E62)`, logo "OpenDayCare" con ícono sol, claim "El día de cada niño, compartido con su familia.", texto de apoyo, pie "🌿 Guardería Sala Soles" y los dos círculos decorativos translúcidos; columna derecha con título "Iniciar sesión", subtítulo, campos EMAIL (vacío) y CONTRASEÑA, link "¿Olvidaste tu contraseña?", botón "Iniciar sesión" y pie "¿Te invitó la guardería? Activá tu cuenta".
- **Sin selector "Ingreso como"** (decisión del usuario): la sección "INGRESO COMO" y los dos botones Personal/Familia del mockup se eliminan. El formulario empieza directamente en EMAIL.
- El botón "Iniciar sesión" navega siempre a `/feed` (decisión del usuario: todo ingreso va al feed staff). Es un link, sin validación de email ni contraseña (decisión del usuario, mismo criterio solo-UI de SPEC 01/02).
- El campo EMAIL viene **precargado con `caro@opendaycare.com`** (revisión del usuario durante `/spec-impl`: el spec original decía "de momento vacío" y se cambió a precarga). CONTRASEÑA con placeholder "••••••••".
- Activar cuenta en `/activate-account` con el diseño exacto del mockup: pill del logo con sombra, título "Bienvenida a OpenDayCare", texto de invitación, tarjeta blanca "Te invitaron a seguir a **Mateo · Sala Soles**" con avatar circular de inicial "M" (colores de Mateo en `data/kids.ts`: `#A9D9E8`/`#1F7A93`), campos CÓDIGO DE INVITACIÓN ("7K4P9", tipografía Fredoka, letter-spacing 3px), EMAIL ("lucia.fernandez@gmail.com") y CREAR CONTRASEÑA precargados, checkbox de consentimiento de fotos (caja `#FBF1D6`, check verde `#5FB97E`) y botón "Activar mi cuenta".
- El checkbox de consentimiento **bloquea el botón** (decisión del usuario): arranca sin tildar y "Activar mi cuenta" queda deshabilitado (opacidad reducida + `cursor-not-allowed`); al tildarlo se habilita y navega a `/familia-feed` (ruta futura, 404 momentáneo).
- Los links cruzados operan como en el mockup: login → "Activá tu cuenta" a `/activate-account`; activar cuenta → "Iniciar sesión" a `/login`.
- "¿Olvidaste tu contraseña?" queda como link simple (decisión del usuario: su pantalla va en otro spec; 404 momentáneo).
- Páginas **standalone sin `AppShell`**: ninguna de las dos pantallas muestra sidebar ni header móvil (el mockup es pantalla completa, flujo previo a la sesión).
- El item del `Sidebar` que ya apunta a `/login` (SPEC 01) pasa de 404 a funcionar **sin tocar código** de `Sidebar`.
- Responsividad: en <768px ambas pantallas se apilan a una columna (panel degradado arriba, compacto); el pie "🌿 Guardería Sala Soles" se oculta en el panel compacto. Sin overflow horizontal ni errores de consola en ningún viewport.

**Fuera de alcance (para specs futuras):**

- Autenticación real: backend, sesiones, cookies, guardas de rutas, redirecciones por rol.
- Pantalla "¿Olvidaste tu contraseña?" (solo el link existe).
- Pantalla de feed de familias (`/familia-feed`): solo el destino del botón de activación apunta ahí.
- Lógica real de invitaciones, códigos o datos de la guardería: la tarjeta de invitación y los valores de los campos son estáticos.
- Validación de email/contraseña y estados de error del formulario.

## Convenciones de idioma

- **Código en inglés:** archivos, componentes, props, variables, handlers (`LoginPanel`, `ActivateForm`...). Comentarios en español. Igual criterio que SPEC 01/02.
- **UI en español:** todo texto visible ("Iniciar sesión", "EMAIL", "CONTRASEÑA", "¿Olvidaste tu contraseña?", "Activá tu cuenta", "Bienvenida a OpenDayCare", "CÓDIGO DE INVITACIÓN", "CREAR CONTRASEÑA", "Autorizo a la guardería a tomar y compartir fotos de mi hijo dentro de la app."). Solo las rutas van en inglés (decisión de SPEC 02 reutilizada).

## Modelo de datos

Este spec no introduce estructuras de datos nuevas con archivo propio. Reutiliza a Mateo de SPEC 02 (`data/kids.ts`: nombre "Mateo Fernández", sala "Soles", avatar `#A9D9E8`/`#1F7A93`, madre Lucía ACTIVA) para la tarjeta de invitación y el email `lucia.fernandez@gmail.com` del mockup.

Los valores visibles (código `7K4P9`, email, contraseña, texto de autorización) son literales del mockup, sin archivo de data. El único estado es el del checkbox:

```ts
// ActivateForm.tsx (client component)
const [consent, setConsent] = useState(false); // false → botón deshabilitado
```

## Estructura de archivos

```
app/
  login/
    page.tsx                 ← composición standalone: LoginPanel + LoginForm
  activate-account/
    page.tsx                 ← composición standalone: ActivateForm

components/
  LoginPanel/
    LoginPanel.tsx           ← server: panel degradado (logo, claim, pie, círculos decorativos)
  LoginForm/
    LoginForm.tsx            ← server: título, campo email (vacío), contraseña, botón /feed, footer link
  ActivateForm/
    ActivateForm.tsx         ← client ("use client"): pill de logo, invitación de Mateo, campos precargados, checkbox de consentimiento, botón deshabilitado/habilitado, footer link
```

- Las tres piezas nuevas siguen la convención de carpeta propia de `components/` (un componente por carpeta, como `KidCard`, `ParentsCard`).
- `LoginForm` y `app/login/page.tsx` son server components (los inputs son no controlados y todo navega por links): cero JS extra. `ActivateForm` es el único client component nuevo del spec, por el estado del checkbox.
- Los círculos decorativos del panel son JSX/CSS (`div` absolute con `border-radius` completo y `bg-white/12`/`bg-white/10`), no imágenes.

## Plan de implementación

1. `components/LoginPanel/LoginPanel.tsx`: panel degradado izquierdo con logo + claim + pie y los dos círculos decorativos. **Validación:** se ve solo en `/login`, a mitad de pantalla el degradado es coral y el texto blanco legible.
2. `components/LoginForm/LoginForm.tsx`: título "Iniciar sesión", campos EMAIL (vacío) y CONTRASEÑA (placeholder "••••••••"), link "¿Olvidaste tu contraseña?" → `/forgot-password` (404 momentáneo), botón "Iniciar sesión" con degradado `#F4977E → #EE8164` y sombra del mockup, como `<Link href="/feed">`, y pie "¿Te invitó la guardería?" con link a `/activate-account`. **Validación:** el botón navega a `/feed` y el pie lleva a `/activate-account`.
3. `app/login/page.tsx`: composición standalone `LoginPanel` + `LoginForm` en grid `1.05fr 1fr` del mockup, breakpoint `md` de 768px. **Validación:** desktop = mockup lado a lado; <768px = apilado.
4. `components/ActivateForm/ActivateForm.tsx`: pill de logo, título de bienvenida, tarjeta de invitación de Mateo (inicial "M", colores de `data/kids.ts`), tres campos con `defaultValue` (`7K4P9`, `lucia.fernandez@gmail.com`, contraseña), checkbox `consent` de consentimiento y botón "Activar mi cuenta" deshabilitado hasta tildar; al tildar navega a `/familia-feed`. Pie con link "Iniciar sesión" → `/login`. **Validación:** el botón arranca deshabilitado; tildar lo habilita y el click va a `/familia-feed` (404 momentáneo).
5. `app/activate-account/page.tsx`: composición standalone centrada con máx 440px. **Validación:** desktop = mockup centrado; <768px = sin overflow horizontal.
6. `npx tsc --noEmit` + `npm run lint` sin errores antes de cerrar el spec.

## Criterios de aceptación

- [ ] `npm run dev` renderiza `/login` y `/activate-account` sin errores de build ni de consola.
- [ ] `/login` replica el mockup en dos columnas: panel corporativo degradado (logo, claim en dos líneas con `<br>`, pie "🌿 Guardería Sala Soles", dos círculos decorativos translúcidos) y formulario a la derecha.
- [ ] `/login` NO muestra la sección "INGRESO COMO" ni los botones Personal/Familia (eliminados por decisión del usuario).
- [ ] El campo EMAIL de `/login` llega precargado con `caro@opendaycare.com` y CONTRASEÑA se muestra con placeholder "••••••••".
- [ ] El botón "Iniciar sesión" de `/login` navega siempre a `/feed`, sin importar lo que contengan los campos.
- [ ] "¿Olvidaste tu contraseña?" existe como link (a `/forgot-password`, 404 momentáneo) sin pantalla propia.
- [ ] En `/activate-account` la tarjeta de invitación dice "Te invitaron a seguir a Mateo · Sala Soles" con avatar de inicial "M" en los colores de Mateo (`#A9D9E8` fondo, `#1F7A93` texto).
- [ ] En `/activate-account` los tres campos llegan precargados: código `7K4P9` (Fredoka, letter-spacing 3px), email `lucia.fernandez@gmail.com` y contraseña.
- [ ] En `/activate-account` el checkbox de consentimiento arranca sin tildar y el botón "Activar mi cuenta" está deshabilitado (sin navegar); al tildar se habilita y navega a `/familia-feed` (404 momentáneo).
- [ ] Los links cruzados funcionan: desde `/login` "Activá tu cuenta" lleva a `/activate-account`; desde `/activate-account` "Iniciar sesión" lleva a `/login`.
- [ ] El item del sidebar que apunta a `/login` (desde `/`, `/kids`, `/kids/[id]`) ya no da 404: `Sidebar` queda sin cambios de código.
- [ ] En <768px ambas pantallas se apilan a una columna, el pie del panel degradado se oculta, y no hay scroll horizontal (probar 375px).
- [ ] `npm run lint` pasa sin errores y `npx tsc --noEmit` no reporta errores de tipos.
- [ ] Comparado lado a lado con los mockups en navegador, no hay diferencias visibles de tipografía, colores ni layout. Capturas de evidencia en `.playwright-mcp/`.

## Decisiones

- **Sí:** quitar el selector "Ingreso como" Personal/Familia (decisión explícita del usuario en el pedido de este spec). El login único va contra el feed staff.
- **Sí:** botón "Iniciar sesión" como link directo a `/feed` sin validación (decisión del usuario 2.a). Consistente con los flujos solo-UI de SPEC 01/02.
- **Sí:** email precargado con `caro@opendaycare.com`. El spec original decía "de momento vacío" y el usuario lo cambió durante la implementación (`/spec-impl`, antes del Paso 3): es el email demo del personal del mockup original. Documentado en Alcance y en el criterio de aceptación correspondiente.
- **Sí:** checkbox de consentimiento bloquea el botón (4.a): es el único estado de esta pantalla y hace el gating de consentimiento visible.
- **Sí:** rutas `/login` y `/activate-account` (5.a), siguiendo la decisión de SPEC 02 (rutas únicamente en inglés). El sidebar ya apuntaba a `/login`.
- **Sí:** "¿Olvidaste tu contraseña?" como link simple a 404 (6, patrón de SPEC 02 con `/kids/new`, etc.).
- **Sí:** páginas standalone sin `AppShell`: la app tiene sidebar como interior de sesión; estas pantallas son el flujo previo, y el mockup no muestra navegación.
- **Sí:** reutilizar Mateo de `data/kids.ts` para la invitación: el mockup ya es el Mateo de SPEC 02. El código `7K4P9` es literal del mockup, sin data propia.
- **No:** selector Personal/Familia oculto pero presente en el DOM. El pedido fue quitarlo, no ocultarlo.
- **No:** validación client o credenciales demo. Sin backend, validar email solo agrega estados de error que ningún mockup tiene.
- **No:** pantallas de familia (`/familia-feed`) ni de reset de contraseña: specs futuras.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El `<br>` del claim solo funciona en desktop; en el apilado móvil quedaría raro | el `<br>` se oculta en <768px y el texto fluye a ancho libre |
| El gating del checkbox depende de JS (`ActivateForm` client) | es el único client component del flujo, sin hidratación de terceros; sin interacción el botón sigue sin navegar |
| `/familia-feed` no existe y "Activar mi cuenta" da 404 | decisión documentada (link válido, pantalla en otra spec); es igual al patrón de SPEC 02 |

## Qué **no** está en este spec

- Autenticación, backend y sesiones.
- Pantalla para recuperar contraseña (`/forgot-password`).
- Feed de familias (`/familia-feed`).
- Cualquier lógica real de invitaciones o códigos.

Cada uno de esos, si entra, va en su propio spec.
