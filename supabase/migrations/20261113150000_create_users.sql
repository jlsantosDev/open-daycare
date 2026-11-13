-- SPEC 08: enums user_role/user_status + table public.users + RLS + updated_at trigger + staff demo

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

-- updated_at via trigger (reusable function for future tables)
create function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- SECURITY DEFINER helpers: avoid RLS recursion (users querying itself in its own policies)
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

-- Staff demo (same migration, SPEC 07 seed pattern; fixed UUID)
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
