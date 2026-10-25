-- =========================================================================
-- 0001 — Enums, profiles, and the role helpers every later policy depends on.
--
-- Ordering note: is_admin() lives here, not in the RLS migration, because the
-- contact_inquiries policy in 0002 already needs to call it.
-- =========================================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ── enums ────────────────────────────────────────────────────────────────
do $$ begin create type public.user_role as enum ('admin','agent'); exception when duplicate_object then null; end $$;
do $$ begin create type public.user_status as enum ('active','suspended'); exception when duplicate_object then null; end $$;
do $$ begin create type public.lead_vertical as enum ('education','travel','courier'); exception when duplicate_object then null; end $$;
do $$ begin create type public.lead_source as enum ('agent','website_inquiry','admin_manual','walk_in'); exception when duplicate_object then null; end $$;
do $$ begin create type public.commission_type as enum ('flat','percent'); exception when duplicate_object then null; end $$;
do $$ begin create type public.commission_status as enum ('earned','approved','paid','cancelled'); exception when duplicate_object then null; end $$;

-- ── shared updated_at trigger function ───────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- ── profiles: one row per auth.users row ─────────────────────────────────
create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  role                 public.user_role   not null default 'agent',
  status               public.user_status not null default 'active',

  full_name            text not null,
  email                text not null unique,   -- mirrors auth.users; treated as immutable
  phone                text,

  -- agent-specific profile fields
  institute_name       text,
  address              text,
  remarks              text,
  agent_code           text unique,

  -- commission configuration (snapshotted into commissions at earn time)
  commission_type      public.commission_type not null default 'flat',
  commission_value     numeric(12,2) not null default 0 check (commission_value >= 0),

  must_change_password boolean not null default false,
  password_changed_at  timestamptz,

  created_by           uuid references public.profiles(id),
  created_at           timestamptz not null default timezone('utc'::text, now()),
  updated_at           timestamptz not null default timezone('utc'::text, now()),

  constraint percent_in_range
    check (commission_type <> 'percent' or commission_value <= 100)
);

create index if not exists idx_profiles_role_status on public.profiles (role, status);

drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ── role helpers ─────────────────────────────────────────────────────────
-- SECURITY DEFINER is load-bearing. A policy ON profiles that inlines
--   exists (select 1 from profiles where ...)
-- re-enters profiles' own policy and raises 42P17 infinite recursion.
-- Running as the function owner skips RLS and breaks the cycle.
--
-- `set search_path = public` stops a shadowing table on an earlier search
-- path from hijacking a definer-rights function.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.status = 'active'
  );
$$;

create or replace function public.current_role_is(target public.user_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = target
      and p.status = 'active'
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant   execute on function public.is_admin() to authenticated, service_role;

revoke execute on function public.current_role_is(public.user_role) from public, anon;
grant   execute on function public.current_role_is(public.user_role) to authenticated, service_role;

-- ── privilege guard ──────────────────────────────────────────────────────
-- RLS cannot restrict columns, and admin + agent share the `authenticated`
-- Postgres role, so a column GRANT would cripple the admin too.
--
-- Without this trigger, the `profiles_update_self` policy in 0007 lets any
-- agent run `update profiles set role='admin' where id = auth.uid()` — the
-- statement passes `with check (id = auth.uid())` cleanly. This is the
-- privilege boundary, not defence in depth.
create or replace function public.guard_profile_privileges()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is null for service_role and internal triggers; those are trusted.
  if auth.uid() is not null and not public.is_admin() then
    if new.role                 is distinct from old.role
    or new.status               is distinct from old.status
    or new.commission_type      is distinct from old.commission_type
    or new.commission_value     is distinct from old.commission_value
    or new.agent_code           is distinct from old.agent_code
    or new.email                is distinct from old.email
    or new.must_change_password is distinct from old.must_change_password
    or new.created_by           is distinct from old.created_by then
      raise exception 'You may not modify privileged profile fields'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_guard on public.profiles;
create trigger trg_profiles_guard
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();
