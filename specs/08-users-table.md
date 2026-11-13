# SPEC 08 — Tabla `users` + enums `user_role`/`user_status` (migración + RLS + staff demo)

> **Estado:** Aprobado
> **Depende de:** SPEC 07 (tabla `daycares` con 4 guarderías seed de UUIDs fijos)
> **Fecha:** 2026-11-13
> **Objetivo:** Crear los enums `user_role` y `user_status` y la tabla `users` (FK a `auth.users` y `daycares`) con RLS y 3 políticas, `updated_at` por trigger, y un usuario staff de prueba creado vía SQL en la misma migración.

## Alcance

**Incluye:**

- **Archivo de migración en el repo:** `supabase/migrations/20261113150000_create_users.sql`, espejo exacto de lo aplicado (patrón SPEC 07).
- **Enums `public.user_role`** (`staff`, `parent`, `admin`) y **`public.user_status`** (`pending`, `active`) — solo los que la tabla `users` necesita (decisión del usuario).
- **Tabla `public.users`** según el doc de referencia (sección 2): `id uuid` PK FK → `auth.users(id)` ON DELETE CASCADE, `daycare_id uuid` FK → `daycares` (nullable, como lo define el doc), `role user_role NOT NULL`, `status user_status NOT NULL default 'active'`, `full_name text NOT NULL`, `avatar_url text` nullable, `notify_on_post boolean NOT NULL default true`, `daily_summary_enabled boolean NOT NULL default true`, `created_at` / `updated_at timestamptz NOT NULL default now()`.
- **Trigger `updated_at`:** función `public.set_updated_at()` (BEFORE UPDATE sobre `users`) que refresca `updated_at = now()` (decisión del usuario).
- **RLS con 3 políticas (decisión del usuario):** (1) `SELECT` de la propia fila (`auth.uid() = id`), (2) `SELECT` de los usuarios del mismo daycare si el solicitante es `staff` o `admin`, (3) `UPDATE` de la propia fila. Las políticas 1–2 usan **funciones helper `SECURITY DEFINER`** (`get_my_role()`, `get_my_daycare_id()`) para evitar la recursión infinita de RLS (la tabla se consulta a sí misma dentro de sus propias políticas).
- **Usuario staff demo en la misma migración vía SQL** (decisión del usuario): insert en `auth.users` (con `encrypted_password = crypt('abc12345_', gen_salt('bf'))`, `email_confirmed_at = now()`) + insert en `public.users` con el **mismo UUID**: email `joseluis@google.com`, password `abc12345_`, `full_name` "Jose Luis Santos", `role staff`, daycare **"Guardería Sala Soles"** (UUID fijo de SPEC 07), `status active`.
- **Aplicación vía Supabase MCP** (`apply_migration`, nombre `create_users`), como en SPEC 07.
- **Actualización del doc de referencia** (`../07-DB-Schema/opendaycare-database-schema.md`): nota en la sección 2 de `users` (RLS con 3 políticas en SPEC 08; trigger genérico `AFTER INSERT` diferido al spec de signup/invitaciones) para que siga siendo la fuente de verdad.
- **Verificación post-aplicación** contra el remoto: enums, estructura, RLS, políticas, trigger y el usuario demo.

**Fuera de alcance (para specs futuros):**

- **Trigger genérico `AFTER INSERT` en `auth.users`** que crea el perfil leyendo `raw_user_meta_data` (decisión del usuario: se hace cuando exista el flujo de signup/invitaciones; en ese spec también entra la decisión de que un signup sin `daycare_id`/`role` **falle el insert**).
- Los otros 4 enums (`relationship_type`, `invitation_status`, `post_type`, `child_status`) y cualquier otra tabla (`rooms`, `children`, `parent_children`, `invitations`, `posts`…).
- Políticas RLS para `daycares` (sigue activa sin políticas).
- Conectar la app a Supabase (`supabase-js`, login UI, queries): la app sigue con mocks.
- Migrar los mocks de `data/`, subida de avatares (Storage), gestión de dispositivos (`devices`).

## Convenciones de idioma

- **Base de datos en inglés:** enums, tablas, columnas y SQL. Contenido demo (nombre del usuario) en español, que es contenido, no esquema.
- **SQL en snake_case**, sin cambios de esquema en la app: código de la app no se toca.

## Modelo de datos

```sql
-- supabase/migrations/20261113150000_create_users.sql

create type public.user_role   as enum ('staff', 'parent', 'admin');
create type public.user_status as enum ('pending', 'active');

create table public.users (
  id                    uuid primary key references auth.users(id) on delete cascade,
  daycare_id            uuid references public.daycares,
  role                  user_role   not null,
  status                user_status not null default 'active',
  full_name             text        not null,
  avatar_url            text,
  notify_on_post        boolean     not null default true,
  daily_summary_enabled boolean     not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- updated_at por trigger
create function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- Helpers SECURITY DEFINER: evitan la recursión de RLS (users consultándose a sí misma)
create function public.get_my_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from public.users where id = (select auth.uid())
$$;

create function public.get_my_daycare_id() returns uuid
language sql stable security definer set search_path = public as $$
  select daycare_id from public.users where id = (select auth.uid())
$$;

alter table public.users enable row level security;

create policy "users_select_own" on public.users
  for select using (id = (select auth.uid()));

create policy "users_select_daycare_staff" on public.users
  for select using (
    public.get_my_role() in ('staff', 'admin')
    and daycare_id = public.get_my_daycare_id()
  );

create policy "users_update_own" on public.users
  for update using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Staff demo (misma migración, patrón de seed de SPEC 07; UUID fijo)
insert into auth.users (
  id, aud, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  'b2f8d6c4-9e31-4a75-bc02-d6f1a8e3c527', 'authenticated', 'joseluis@google.com',
  crypt('abc12345_', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now()
);

insert into public.users (id, daycare_id, role, status, full_name)
values (
  'b2f8d6c4-9e31-4a75-bc02-d6f1a8e3c527',
  '3f6c2e1a-7d94-4b8e-9a2c-5e1d3f7a8b90',  -- Guardería Sala Soles (SPEC 07)
  'staff', 'active', 'Jose Luis Santos'
);
```

Notas:

- `pgcrypto` ya está preinstalado en el proyecto (verificado en SPEC 07), así que `crypt`/`gen_salt('bf')` están disponibles; el hash bcrypt es el formato que GoTrue espera.
- El insert en `auth.users` usa el mínimo de columnas con valores por defecto razonables para las NOT NULL de GoTrue (`aud`, `raw_app_meta_data`).
- `daycare_id` nullable según el doc de referencia (no lo marca NOT NULL); el demo sí lo llena.

## Estructura de archivos

```
supabase/
  migrations/
    20261113150000_create_users.sql   ← nuevo: enums + tabla + RLS + helpers + trigger + staff demo

../07-DB-Schema/
  opendaycare-database-schema.md      ← modificación: nota en la sección 2 de users
                                         (RLS 3 políticas en SPEC 08; trigger diferido)

(sin cambios en la app: app/, components/, data/ quedan intactos)
```

## Plan de implementación

1. Crear `supabase/migrations/20261113150000_create_users.sql` con el SQL del modelo de datos. **Validación:** el SQL refleja la sección 2 del doc de referencia y las decisiones de esta sesión.
2. Aplicar la migración al proyecto remoto vía Supabase MCP: `apply_migration` con nombre `create_users`. **Validación:** `list_migrations` la muestra en el historial del proyecto.
3. Verificar contra el remoto con SQL vía MCP: (a) enums con sus valores exactos, (b) columnas/tipos/default de `users`, (c) RLS activa y **exactamente 3** políticas, (d) trigger `users_set_updated_at` y helpers presentes, (e) fila en `auth.users` con `email_confirmed_at` no nulo y hash bcrypt verificable con `crypt('abc12345_', encrypted_password) = encrypted_password`, (f) fila en `public.users` con `role=staff`, daycare de Sala Soles y `status=active`. **Validación manual:** los checks pasan.
4. Actualizar `../07-DB-Schema/opendaycare-database-schema.md` con la nota de implementación en la sección 2. **Validación:** el doc y la base coinciden.
5. Verificación final de contención: no existen tablas nuevas además de `users` ni enums además de los 2, y `npm run lint` + `npx tsc --noEmit` siguen limpios (la app no cambió).

## Criterios de aceptación

- [ ] Existe `supabase/migrations/20261113150000_create_users.sql` en el repo con enums, tabla, RLS + 3 políticas, helpers, trigger y los 2 inserts del demo.
- [ ] `list_migrations` del MCP registra la migración `create_users`.
- [ ] `public.user_role` tiene exactamente `staff`, `parent`, `admin`; `public.user_status` exactamente `pending`, `active`.
- [ ] `public.users` existe con las columnas y defaults del modelo de datos (PK con FK cascade a `auth.users`, FK a `daycares`, defaults de `status`/`notify_on_post`/`daily_summary_enabled`/timestamps).
- [ ] RLS activa en `users` (`relrowsecurity = true`) y `pg_policies` muestra exactamente las 3 políticas con los nombres y expresiones del spec.
- [ ] El trigger `users_set_updated_at` existe; un `update` de prueba refresca `updated_at`.
- [ ] `auth.users` contiene la fila de `joseluis@google.com` con `email_confirmed_at` no nulo y hash bcrypt que verifica contra `abc12345_`.
- [ ] `public.users` contiene 1 fila: mismo UUID que `auth.users`, `full_name` "Jose Luis Santos", `role staff`, daycare de "Guardería Sala Soles", `status active`.
- [ ] El doc de referencia tiene la nota de implementación de SPEC 08 en la sección 2.
- [ ] No se crearon otras tablas ni enums; `npm run lint` y `npx tsc --noEmit` pasan (regresión: la app no cambió).

## Decisiones

- **Sí:** solo 2 enums, `user_role` y `user_status` (decisión del usuario); los demás llegan con la tabla que los use.
- **Sí:** RLS **con 3 políticas** (decisión del usuario), resolviendo lo que SPEC 07 dejó pendiente. Con helpers `SECURITY DEFINER` porque la política de daycare consulta `users` dentro de sí misma (recursión de RLS sin ellos).
- **Sí:** el **trigger genérico de `auth.users` se aplaza** al spec de signup/invitaciones (decisión del usuario). Quedan registradas para ese spec: leer `daycare_id`/`role`/`full_name` de `raw_user_meta_data` y **fallar el insert** si faltan (decisiones del usuario de esta sesión).
- **Sí:** staff demo creado con **SQL directo en la misma migración** (decisión del usuario, patrón seed de SPEC 07): insert en `auth.users` con `crypt` + insert en `public.users` con el mismo UUID.
- **Sí:** email **confirmado al crear** (decisión del usuario) para poder loguear de inmediato sin flujo de confirmación.
- **Sí:** `updated_at` con **trigger BEFORE UPDATE** (decisión del usuario); función `set_updated_at()` reutilizable para tablas futuras.
- **Sí:** credenciales demo `joseluis@google.com` / `abc12345_` y `full_name` "Jose Luis Santos" en "Guardería Sala Soles" (decisión del usuario), documentadas aquí a propósito.
- **No:** otros enums, otras tablas, políticas para `daycares`, conexión de la app, login UI, migración de mocks, Storage de avatares. Cada uno, si entra, en su propio spec.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Insert manual en `auth.users`: GoTrue tiene muchas columnas NOT NULL y el insert mínimo podría rechazarse | Insert mínimo con `aud`, `raw_app_meta_data` y timestamps; el paso 3 verifica la fila; si falla, se ajusta el SQL del espejo antes de reintentar |
| Recursión infinita de RLS al consultar `users` dentro de sus propias políticas | Helpers `SECURITY DEFINER` (`get_my_role`, `get_my_daycare_id`) que bypasean RLS |
| `crypt` requiere `pgcrypto` | Ya está preinstalado en el proyecto (verificado en SPEC 07) |
| Drift de versión MCP vs. prefijo del archivo espejo | Mismo criterio que SPEC 07: el nombre coincide y el drift queda documentado |
| Login real aún no probado (la app no está conectada) | El criterio de aceptación verifica la fila y el hash en DB; el login end-to-end se valida en el spec de conexión |

## Qué **no** está en este spec

- Trigger genérico de `auth.users` y flujo de signup/invitaciones.
- Los otros 4 enums y las demás tablas del esquema.
- Políticas RLS para `daycares`.
- Conexión de la app a Supabase y login funcional.
- Migración de mocks, avatares (Storage), devices.

Cada uno de esos, si entra, va en su propio spec.
