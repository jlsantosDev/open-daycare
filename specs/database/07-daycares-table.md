# SPEC 07 — Tabla `daycares` en Supabase (migración + RLS + seed de 4 guarderías)

> **Estado:** Implementado
> **Depende de:** ninguno (primer spec de base de datos)
> **Fecha:** 2026-11-13
> **Objetivo:** Crear la tabla `daycares` en el proyecto Supabase remoto mediante el patrón de migraciones (archivo SQL versionado en el repo, aplicado vía MCP), con RLS activa sin políticas y 4 guarderías de ejemplo con "Guardería Sala Soles" como principal.

## Alcance

**Incluye:**

- **Archivo de migración en el repo:** `supabase/migrations/20261113120000_create_daycares.sql`, con el DDL de la tabla, la activación de RLS y los inserts de ejemplo. Es el espejo exacto de lo que se aplica al proyecto remoto, para que el patrón de migraciones quede versionado en el repo desde el día 1.
- **Tabla `public.daycares`** según el doc de referencia (`../07-DB-Schema/opendaycare-database-schema.md`, sección 1) con una extensión decidida: `id uuid` PK default `gen_random_uuid()`, `name text NOT NULL`, **`address text NOT NULL`** (nueva columna, decisión del usuario), `created_at timestamptz NOT NULL default now()`. Sin `updated_at` (el doc de referencia no la define para esta tabla).
- **RLS activa sin políticas** (decisión del usuario): `ALTER TABLE public.daycares ENABLE ROW LEVEL SECURITY;` y nada más. La tabla queda blindada desde el día 1; las políticas llegan cuando exista la tabla `users` con roles.
- **Seed de 4 guarderías en la misma migración** (decisión del usuario), con **UUIDs fijos** para que specs futuros puedan referenciarlas de forma determinista, y "Guardería Sala Soles" primera (la "principal"). Direcciones inventadas (decisión del usuario: "puedes inventártela"). "Principal" es **conceptual, sin columna** (decisión del usuario: no se agrega `is_default`).
- **Aplicación vía Supabase MCP** (`apply_migration`, nombre `create_daycares`): queda registrada en el historial de migraciones del proyecto remoto (decisión del usuario; no hay CLI ni Docker instalados).
- **Actualización del doc de referencia** (`../07-DB-Schema/opendaycare-database-schema.md`): agregar la fila `address text NOT NULL` a la tabla `daycares` para que siga siendo la fuente de verdad.
- **Verificación post-aplicación** contra el proyecto remoto: estructura de la tabla, RLS activa, y las 4 filas.

**Fuera de alcance (para specs futuros):**

- Crear enums (`user_role`, `post_type`, etc.) o cualquier otra tabla (`users`, `rooms`, `children`…).
- Migrar los mocks existentes de `data/` a la base.
- Conectar la app a Supabase (`supabase-js`, env vars, queries): la app sigue con mocks.
- UI para gestionar guarderías (CRUD, pantalla "mi cuenta", selección de guardería).
- Instalar Supabase CLI / Docker / stack local: la sincronización con CLI se resuelve en otro spec cuando toque.
- Políticas RLS: requieren el modelo de `users`.

## Convenciones de idioma

- **Base de datos en inglés:** nombres de tabla, columnas y SQL (`daycares`, `address`, `created_at`). El doc de referencia lo exige; los datos demo son nombres propios en español, que es contenido, no esquema.
- **SQL en snake_case**, sin cambios de esquema en la app: código de la app no se toca.

## Modelo de datos

```sql
-- supabase/migrations/20261113120000_create_daycares.sql
create table public.daycares (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  address    text not null,               -- nueva columna (decisión del usuario)
  created_at timestamptz not null default now()
);

alter table public.daycares enable row level security;
-- Sin políticas aún: llegan con el spec de users/roles.

insert into public.daycares (id, name, address) values
  ('3f6c2e1a-7d94-4b8e-9a2c-5e1d3f7a8b90', 'Guardería Sala Soles',       'Calle de los Cedros 142, Col. Jardines del Norte'),
  ('7e2a9c4d-1b53-4f60-8e7a-9c0b2d4e6f81', 'Guardería Estrellitas',     'Av. Insurgentes Sur 1183, Col. Del Valle'),
  ('a1d4e8b2-6c37-49f5-b8a0-2e9d7c1f3a64', 'Guardería Pequeños Genios', 'Calle Tulipanes 88, Col. Las Flores'),
  ('c9e7f3d1-5a28-4b6e-9d3f-8b1c4e2a7d95', 'Guardería Mundo Feliz',     'Av. Siempreviva 305, Col. Primavera');
```

Notas:

- `gen_random_uuid()` es nativo desde Postgres 13 — los proyectos Supabase actuales lo traen; no se necesita `pgcrypto` ni extensiones.
- No hay `updated_at`: el doc de referencia solo define `created_at` para `daycares`.
- Los 4 UUIDs son fijos y válidos; "Sala Soles" es la primera fila (la que la app tratará como principal más adelante).

## Estructura de archivos

```
supabase/
  migrations/
    20261113120000_create_daycares.sql   ← nuevo: DDL + RLS + seed (espejo de lo aplicado)

../07-DB-Schema/
  opendaycare-database-schema.md         ← modificación: fila `address text NOT NULL`
                                           en la tabla `daycares`

(sin cambios en la app: app/, components/, data/ quedan intactos)
```

## Plan de implementación

1. Crear `supabase/migrations/20261113120000_create_daycares.sql` con el DDL, RLS y los 4 inserts del modelo de datos. **Validación:** el SQL refleja 1 a 1 el doc de referencia (más `address`).
2. Aplicar la migración al proyecto remoto vía Supabase MCP: `apply_migration` con nombre `create_daycares`. **Validación:** `list_migrations` la muestra en el historial del proyecto.
3. Verificar contra el remoto con SQL vía MCP: (a) la tabla existe con las 4 columnas y tipos correctos (catálogo `pg_catalog` o `information_schema`), (b) `relrowsecurity = true` y **cero** políticas en `pg_policies`, (c) `select * from daycares` devuelve exactamente 4 filas, con "Guardería Sala Soles" y las 4 direcciones. **Validación manual:** los 3 checks pasan.
4. Actualizar `../07-DB-Schema/opendaycare-database-schema.md`: agregar `address text NOT NULL` a la sección de `daycares` con nota "(agregado en SPEC 07)". **Validación:** el doc y la base coinciden.
5. Verificación final de contención: no existen tablas/enums nuevos además de `daycares`, y `npm run lint` + `npx tsc --noEmit` siguen limpios (la app no cambió).

## Criterios de aceptación

Verificado el 2026-11-13 por spec-verifier. Evidencia bajo cada check.

- [x] Existe `supabase/migrations/20261113120000_create_daycares.sql` en el repo con el DDL, la activación de RLS y los 4 inserts.
  - *Evidencia:* leído el archivo (21 líneas): `create table public.daycares` (id/name/address/created_at), `alter table ... enable row level security`, y los 4 inserts con los mismos UUIDs, nombres y direcciones del SQL esperado.
- [x] La migración `create_daycares` aparece en el historial de migraciones del proyecto Supabase (vía `list_migrations` del MCP).
  - *Evidencia:* `list_migrations` → `[{ "version": "20261113104726", "name": "create_daycares" }]`. Nota: la versión registrada por MCP es `20261113104726`, distinta del prefijo del archivo espejo (`20261113120000`); el nombre coincide. Sin impacto, se concilia con el drift documentado en Riesgos.
- [x] La tabla `public.daycares` existe en el remoto con exactamente: `id uuid` PK default `gen_random_uuid()`, `name text NOT NULL`, `address text NOT NULL`, `created_at timestamptz NOT NULL default now()`.
  - *Evidencia:* `information_schema.columns` → `id uuid NO gen_random_uuid()`, `name text NO`, `address text NO`, `created_at timestamp with time zone NO now()`. Exactamente 4 columnas, sin `updated_at` ni extras.
- [x] RLS está activa en `daycares` (`relrowsecurity = true`) y `pg_policies` no registra ninguna política para la tabla.
  - *Evidencia:* `pg_class` → `relrowsecurity = true`; `pg_policies` para `daycares` → `[]` (cero políticas).
- [x] `select * from public.daycares` devuelve exactamente 4 filas; la primera es "Guardería Sala Soles" y las 4 tienen `address` no vacía.
  - *Evidencia:* `select *` (sin order by) devuelve 4 filas en orden de inserción, primera `3f6c2e1a-…` "Guardería Sala Soles"; `count(*) = 4`, `with_address = 4`, `with_name = 4`.
- [x] No se crearon enums, extensiones ni otras tablas; los archivos de `app/`, `components/` y `data/` están sin cambios.
  - *Evidencia:* `pg_tables` en `public` → solo `daycares`; enums (`typtype='e'`) en `public` → `[]`; `pg_extension` → solo las 5 preinstaladas por Supabase (`pg_stat_statements`, `pgcrypto`, `plpgsql`, `supabase_vault`, `uuid-ossp`), ninguna creada por la migración (el SQL no tiene `create extension`). `git status --porcelain` vacío y `git ls-files --others -- app components data` sin archivos.
- [x] El doc de referencia `../07-DB-Schema/opendaycare-database-schema.md` incluye `address text NOT NULL` en `daycares`.
  - *Evidencia:* sección 1 `daycares`, línea: `` | `address` | `text` | NOT NULL (agregado en SPEC 07). | ``.
- [x] `npm run lint` y `npx tsc --noEmit` pasan (regresión: nada de la app se rompió).
  - *Evidencia:* `npm run lint` → exit 0 sin salida; `npx tsc --noEmit` → exit 0 sin errores.

## Decisiones

- **Sí:** aplicar la migración vía **Supabase MCP** (`apply_migration`) en lugar de CLI (decisión del usuario; la CLI y Docker no están instalados). El archivo SQL queda igual en el repo como espejo del patrón de migraciones.
- **Sí:** columna **`address text NOT NULL`** agregada a `daycares` (decisión del usuario), con actualización del doc de referencia para que la fuente de verdad siga siendo ese doc.
- **Sí:** 4 guarderías demo **dentro de la misma migración** con UUIDs fijos (decisión del usuario), así el remoto y el repo quedan idénticos sin depender de `seed.sql` (que solo corre local).
- **Sí:** "Guardería Sala Soles" es la **principal de forma conceptual** (primera fila, sin columna `is_default`): el doc de referencia no define esa noción y no se quiere desviar el esquema.
- **Sí:** **RLS activa sin políticas** (decisión del usuario): blindada desde el día 1; las políticas llegan con el spec de `users`/roles.
- **Sí:** solo `created_at`, sin `updated_at`: se respeta el doc de referencia tal cual.
- **No:** enums, otras tablas, migración de mocks, conexión de la app (`supabase-js`), UI de gestión, CLI/Docker/stack local: todo queda para specs propios.
- **No:** usar `seed.sql`: solo impacta el stack local (que no existe) y dejaría el remoto sin filas.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Migración aplicada por MCP sin CLI: posible drift con el historial local cuando la CLI llegue | El archivo del repo es espejo exacto de lo aplicado; cuando exista CLI, `supabase migration list` se concilia contra este nombre |
| No hay stack local (Docker): el SQL corre directo al remoto sin prueba previa | DDL mínimo y convencional (1 tabla, 4 inserts); verificación completa en el paso 3 antes de dar por terminado |
| RLS sin políticas bloquea toda lectura desde la app cuando se conecte | Intencional y documentado; el spec de conexión deberá agregar políticas primero |
| "Principal" sin columna: la elección de guardería queda sin representar en la base | Es una decisión consciente; cuando la app necesite seleccionar guardería activa, se decide en su propio spec (sesión/config, no schema) |

## Qué **no** está en este spec

- Enums y demás tablas del esquema (`users`, `rooms`, `children`, `posts`…).
- Migrar los mocks de `data/`.
- Conexión de la app a Supabase y lectura de la tabla.
- UI para gestionar guarderías.
- CLI de Supabase, Docker y stack local.
- Políticas RLS.

Cada uno de esos, si entra, va en su propio spec.
