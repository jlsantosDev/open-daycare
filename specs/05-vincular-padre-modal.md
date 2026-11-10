# SPEC 05 — Modal "Vincular padre" en el perfil del niño (UI + validación)

> **Estado:** Aprobado
> **Depende de:** SPEC 02 (SPEC 04 como referencia del patrón de modal)
> **Fecha:** 2026-11-10
> **Objetivo:** Implementar el mockup `references/pantallas/vincular-padre.dc.html` como un modal que abre el link "Vincular otro padre" de la tarjeta PADRES VINCULADOS en `/kids/[id]`, con nombre, email (con formato validado) y parentesco requeridos, código de invitación ficticio y cierre del modal al enviar válido, sin backend ni efectos sobre la lista de padres.

## Alcance

**Incluye:**

- **Modal sobre `/kids/[id]`** (decisión del usuario: solo desde el perfil; el badge VINCULAR de las tarjetas de `/kids` queda como está) con el diseño exacto del mockup `vincular-padre.dc.html`: tarjeta `#FBF4EC` con borde `#ECE0D0`, radio 24px, sombra `0 20px 50px -24px rgba(63,54,46,.35)`, ancho máx **480px**, cabecera con título "Vincular padre" (Fredoka, 18px, 600) + subtítulo "a {nombre del niño}" (13px, `#A89A8B`) y botón de cierre X (34px, fondo `#F0E6D8`, texto `#94887B`, radio 10px), borde inferior `#ECE0D0`.
- **Banner informativo** sobre el formulario: fondo `#E3ECFB`, radio 14px, icono de info en círculo (stroke `#4E72C8`), texto 13.5px `#3F5694`: "Le enviaremos un correo con un código para que active su cuenta. Solo verá el feed de {primer nombre del niño}."
- Campos con eyebrows del mockup (12px, 800, tracking 0.7px, `#94887B`) y estilos de campo (borde `1.5px #EADFD0`, radio 14px, fondo blanco, texto `#3F362E`, placeholder `#B6A99B`): **NOMBRE DEL PADRE/MADRE** (placeholder "Ej. Diego Fernández") y **EMAIL** (`type="email"`, placeholder "correo@ejemplo.com").
- **Campos requeridos con error visible** (estado que el mockup no prevé — mensajes como en SPEC 04): nombre y email vacíos muestran mensaje bajo el campo; EMAIL además **valida formato** mínimo `x@y.z` (decisión del usuario) con el regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Con error, el modal queda abierto y no se envía nada; el primer campo con error recibe focus (patrón SPEC 04).
- **PARENTESCO requerido y sin default** (decisión del usuario: los 3 chips abren deseleccionados, aunque el mockup preselecciona "Mamá" — divergencia documentada). Chips tipo pill (radio 999px, 14px, 800): **Mamá / Papá / Tutor/a** — seleccionado: fondo `#CCD8F4`, borde `#9FB8EC`, texto `#4E72C8`; no seleccionado: fondo `#FFFDF9`, borde `#ECE0D0`, texto `#6E6359`. Al enviar sin selección: error bajo la fila "Elegí el parentesco." y el envío se bloquea.
- **Código de invitación ficticio siempre visible** (decisión del usuario): caja amarilla desde la apertura del modal — fondo `#FBF1D6`, borde `1.5px dashed #E6D08A`, radio 16px, centrado, eyebrow "CÓDIGO DE INVITACIÓN" (`#A88526`), código **"7K4P9"** constante (Fredoka, 34px, 600, tracking 7px, `#8A7234`) y "Vence en 7 días" (13px, `#A88526`). Es puramente decorativo: la lógica real del código va en otro spec.
- **"Enviar invitación"** (degradado `#F4977E→#EE8164`, radio 14px, blanco, 15.5px/800, con icono de enviar): con errores muestra los mensajes y no cierra; **con todo válido solo cierra el modal** (decisión del usuario: no agrega el padre a la lista, no muestra toast ni confirmación — la invitación real va en otro spec).
- **Cierres del modal:** botón X, tecla Esc y click en el fondo oscurecido descartan sin cambios.
- **Responsividad:** en móvil (<768px) el modal ocupa casi todo el ancho con scroll interno del formulario; el overlay no genera overflow horizontal.

**Fuera de alcance (para specs futuros):**

- Enviar la invitación de verdad: no se agrega ningún padre (ni in-memory), no cambia la tarjeta PADRES VINCULADOS, no hay persistencia.
- El badge VINCULAR de las tarjetas del grid `/kids` no abre este modal; las altas de SPEC 04 linkean a 404 igual que antes.
- Lógica real del código de invitación (generación, expiración, uso para activar) y el envío de correo.
- Reutilizar el modal para validar la relación con la cuenta del padre al activarse.

## Convenciones de idioma

- **Código en inglés:** archivos, componentes, props, handlers (`LinkParentModal`, `handleSubmit`, `relationOptions`, `isValidEmail`). Comentarios en español. Igual criterio que SPEC 01–04.
- **UI en español:** todo texto visible ("Vincular padre", "Enviar invitación", "NOMBRE DEL PADRE/MADRE", "EMAIL", "PARENTESCO", "CÓDIGO DE INVITACIÓN", "Vence en 7 días", mensajes de error y placeholders).

## Modelo de datos

Ninguna estructura nueva persiste. Solo constantes y estado efímero del modal:

```ts
// data/kids.ts — agregados
export const relationOptions = ["Mamá", "Papá", "Tutor/a"] as const;

// Código ficticio constante (otro spec lo hará real)
export const placeholderInvitation = { code: "7K4P9", expiresIn: "Vence en 7 días" } as const;
```

```ts
// components/LinkParentModal/LinkParentModal.tsx — estado interno (client)
type LinkParentErrors = { name?: string; email?: string; relation?: string };
// uncontrolled inputs: name, email; relation: string | null
```

## Estructura de archivos

```
components/
  LinkParentModal/
    LinkParentModal.tsx  ← client ("use client"): overlay + tarjeta mockup, validaciones, cierre
  ParentsCard/
    ParentsCard.tsx      ← modificación: pasa a client; el link muerto a /kids/[id]/link-parent
                            se reemplaza por <button> que monta/remonta el modal con el kid actual

data/
  kids.ts                ← modificación: relationOptions + placeholderInvitation

(sin cambios)
app/
  kids/[id]/page.tsx     ← server: sigue componiendo AppShell + KidProfile; ParentsCard ya
                            serializa bien (Kid es data plana)
```

- Patrón de SPEC 04: el dueño del estado (`ParentsCard`) monta `LinkParentModal` **condicionalmente** → reset del formulario por remount en cada apertura, sin effects de reset.
- `LinkParentModal` recibe `kidName` (para subtítulo y banner), `relationOptions` y `placeholderInvitation`; no conoce `ParentsCard`.

## Plan de implementación

1. `data/kids.ts`: exportar `relationOptions` y `placeholderInvitation`. **Validación:** `npx tsc --noEmit` pasa y `/kids/[id]` sigue idéntica.
2. `components/LinkParentModal/LinkParentModal.tsx` (estructura + estilos): overlay fijo, tarjeta del mockup con banner, los 3 campos, código ficticio y botón "Enviar invitación". Cerrar con X, Esc y click en el fondo. **Validación manual:** abre y cierra, fiel al mockup en desktop.
3. Validaciones en el mismo archivo: requeridos con mensajes bajo el campo, formato de email por regex, parentesco requerido sin default; submit bloqueado mientras haya errores y focus en el primer campo con error. **Validación manual:** enviar vacío muestra 3 errores; `pepe`, `pepe@` y `pepe@ejemplo` dan error de email; `pepe@ejemplo.com` pasa.
4. `components/ParentsCard/ParentsCard.tsx`: `"use client"`, reemplazar el `<Link>` muerto por el botón del mockup idéntico visualmente, que monta el modal. Enviar válido cierra el modal sin tocar la lista de padres. **Validación manual:** el flujo completo deja la tarjeta igual y el perfil sin cambios.
5. Responsividad y pulido: modal usable en 375px con scroll interno, sin overflow ni errores de consola.
6. `npm run lint` + `npx tsc --noEmit` limpios antes de cerrar.

## Criterios de aceptación

- [ ] `npm run dev` renderiza `/kids/[id]` (ej. `/kids/mateo-fernandez`) sin errores de build ni de consola, con la tarjeta PADRES VINCULADOS como antes.
- [ ] "Vincular otro padre" abre el modal con el diseño del mockup: tarjeta `#FBF4EC` máx 480px radio 24px, cabecera con X (34px `#F0E6D8`), título "Vincular padre" (Fredoka 18px/600) y subtítulo "a {nombre del niño}"; overlay oscurece el perfil detrás.
- [ ] El banner informativo muestra el texto del mockup con el primer nombre real del niño ("Solo verá el feed de Mateo.").
- [ ] Los chips de parentesco abren los 3 deseleccionados (bg `#FFFDF9`); al elegir uno queda seleccionado (bg `#CCD8F4`, texto `#4E72C8`) y al elegir otro lo reemplaza.
- [ ] Enviar con el formulario vacío muestra errores en nombre, email y parentesco, no cierra el modal y el primer campo con error recibe focus.
- [ ] `pepe`, `pepe@` y `pepe@ejemplo` muestran error de formato de email; `pepe@ejemplo.com` no produce error de email.
- [ ] La caja del código (fondo `#FBF1D6`, borde dashed `#E6D08A`) es visible desde que abre el modal con código "7K4P9" (Fredoka 34px, tracking 7px, `#8A7234`) y "Vence en 7 días".
- [ ] Enviar con nombre + email válido + parentesco elegido cierra el modal; la tarjeta PADRES VINCULADOS y el perfil quedan exactamente como antes (no se agrega ningún padre).
- [ ] X, Esc y click en el fondo cierran el modal sin cambios; la próxima apertura muestra el formulario limpio (chips deseleccionados, campos vacíos).
- [ ] En 375px el modal se ve completo con scroll interno, sin overflow horizontal ni errores de consola.
- [ ] `npm run lint` pasa sin errores y `npx tsc --noEmit` no reporta errores de tipos.
- [ ] Comparado lado a lado con `references/pantallas/vincular-padre.dc.html`, no hay diferencias visibles de tipografía, colores ni layout. Capturas en `.playwright-mcp/`.

## Decisiones

- **Sí:** modal sobre el perfil del niño en vez de la ruta `/kids/[id]/link-parent` (decisión del usuario, alineado con el patrón de SPEC 04). El link muerto que dejaba SPEC 02 se reemplaza por el disparador del modal; la ruta nunca existió.
- **Sí:** solo desde `ParentsCard` del perfil; el badge VINCULAR del grid no abre el modal (decisión del usuario).
- **Sí:** "Enviar invitación" con formulario válido **solo cierra** el modal: sin alta de padre, sin toast (decisión del usuario: "de momento no hace nada… más adelante añadiremos funcionalidad"). La validación sí corre.
- **Sí:** código de invitación ficticio constante "7K4P9" y siempre visible (decisión del usuario); la lógica real del código va en otro spec.
- **Sí:** parentesco requerido, los 3 chips abren deseleccionados (decisión del usuario; el mockup muestra "Mamá" preseleccionada — divergencia decidida y documentada).
- **Sí:** email con validación de formato mínimo (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) además de requerido (decisión del usuario).
- **Sí:** cerrar también con Esc y click en el fondo además de la X: patrón estándar de modales, no contradice el mockup.
- **No:** agregar el padre a la lista (ni siquiera como PENDIENTE), persistencia, generación real de código o envío de correo: el usuario lo pospuso explícitamente; cada uno va en su propio spec.
- **No:** los mensajes de validación son una adición deliberada que el mockup no prevé (mismo criterio que SPEC 04).

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `ParentsCard` pasa de server a client: prop `kid` debe serializar | `Kid` es data plana (strings), sin funciones ni objetos de fecha; `npx tsc` + smoke con `cacheComponents` |
| El mockup muestra "Mamá" seleccionada y el código como estado post-envío, diferencias con el modal real | Divergencias decididas con el usuario y documentadas (parentesco sin default; código siempre visible y constante) |
| El input `type="email"` nativo puede bloquear el submit con su tooltip antes de mostrar el error propio | `noValidate` en el form, validación propia (patrón del SPEC 04) |
| La X del mockup es un `<a href>` a perfil; en un modal es cacofónico | Se implementa como `<button>` con el mismo look; el cierre reemplaza la navegación |

## Qué **no** está en este spec

- Envío real de la invitación, alta de padre en la tarjeta (in-memory o persistente).
- Generación real del código, expiración y su uso en `/activate-account`.
- Modal de vinculación desde el grid `/kids` (badge VINCULAR de tarjetas).
- Edición/remoción de padres ya vinculados.

Cada uno de esos, si entra, va en su propio spec.
