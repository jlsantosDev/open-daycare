-- SPEC 07 — Create table public.daycares
-- Reference: ../07-DB-Schema/opendaycare-database-schema.md (section 1)
-- Extension agreed with user: address text NOT NULL

create table public.daycares (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  address    text not null,
  created_at timestamptz not null default now()
);

-- RLS enabled with no policies yet: they arrive with the users/roles spec.
alter table public.daycares enable row level security;

-- Demo seed with fixed UUIDs so future specs can reference them deterministically.
-- "Guardería Sala Soles" is first (conceptually the main one, no is_default column).
insert into public.daycares (id, name, address) values
  ('3f6c2e1a-7d94-4b8e-9a2c-5e1d3f7a8b90', 'Guardería Sala Soles',       'Calle de los Cedros 142, Col. Jardines del Norte'),
  ('7e2a9c4d-1b53-4f60-8e7a-9c0b2d4e6f81', 'Guardería Estrellitas',     'Av. Insurgentes Sur 1183, Col. Del Valle'),
  ('a1d4e8b2-6c37-49f5-b8a0-2e9d7c1f3a64', 'Guardería Pequeños Genios', 'Calle Tulipanes 88, Col. Las Flores'),
  ('c9e7f3d1-5a28-4b6e-9d3f-8b1c4e2a7d95', 'Guardería Mundo Feliz',     'Av. Siempreviva 305, Col. Primavera');
