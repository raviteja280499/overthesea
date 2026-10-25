-- ===================================================================
-- OVER THE SEA — CRM schema, full apply. Generated: 2026-10-18T11:23Z
--   node scripts/db.mjs apply supabase/apply_all.sql
-- Idempotent: safe to re-run.
-- ===================================================================


-- ###################### migrations/0001_types_and_profiles.sql ######################

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

-- ###################### migrations/0002_contact_inquiries.sql ######################

-- =========================================================================
-- 0002 — contact_inquiries: the raw website inbox.
--
-- Carried over from the original supabase/schema.sql, with two changes:
--   1. The blanket "TO authenticated USING (true)" policy is replaced by an
--      admin-only policy. Agents are `authenticated`; the old policy would
--      have handed every agent read AND delete on the whole inbox the moment
--      the first agent account existed.
--   2. Conversion columns, so an inquiry can be promoted into a CRM lead
--      while keeping its provenance.
-- =========================================================================

create table if not exists public.contact_inquiries (
    id uuid primary key default uuid_generate_v4(),
    full_name text not null,
    email text,
    phone text not null,
    service_category text not null check (
        service_category in (
            'Overseas Education',
            'Courier Logistics',
            'Tourism & Visa',
            'Test Preparation Coaching',
            'General Inquiry'
        )
    ),
    subject text,
    message text,
    metadata jsonb default '{}'::jsonb,
    status text not null default 'new' check (
        status in ('new', 'contacted', 'in_progress', 'resolved', 'archived')
    ),
    notes text,
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now())
);

-- conversion provenance (FK to leads added in 0003, once that table exists)
alter table public.contact_inquiries add column if not exists converted_lead_id uuid;
alter table public.contact_inquiries add column if not exists converted_at      timestamptz;
alter table public.contact_inquiries add column if not exists converted_by      uuid references public.profiles(id);

create index if not exists idx_contact_inquiries_created_at       on public.contact_inquiries (created_at desc);
create index if not exists idx_contact_inquiries_service_category on public.contact_inquiries (service_category);
create index if not exists idx_contact_inquiries_status           on public.contact_inquiries (status);
create index if not exists idx_contact_inquiries_phone            on public.contact_inquiries (phone);

drop trigger if exists on_contact_inquiries_updated on public.contact_inquiries;
create trigger on_contact_inquiries_updated
    before update on public.contact_inquiries
    for each row execute procedure public.handle_updated_at();

alter table public.contact_inquiries enable row level security;

-- Public website forms must still be able to submit.
drop policy if exists "Allow public insert into contact_inquiries" on public.contact_inquiries;
create policy "inquiries_public_insert"
    on public.contact_inquiries
    for insert
    to public, anon, authenticated
    with check (true);

-- Replaces the old "Allow full access for authenticated/service role".
drop policy if exists "Allow full access for authenticated/service role" on public.contact_inquiries;
create policy "inquiries_admin_all"
    on public.contact_inquiries
    for all
    to authenticated
    using ((select public.is_admin()))
    with check ((select public.is_admin()));

create policy "inquiries_service_all"
    on public.contact_inquiries
    for all
    to service_role
    using (true)
    with check (true);

-- ###################### migrations/0003_leads.sql ######################

-- =========================================================================
-- 0003 — lead_stages, leads, the three vertical detail tables, stage history.
-- =========================================================================

-- ── pipeline stages as DATA, not an enum ─────────────────────────────────
-- An enum cannot deliver "add travel/courier later with zero migration":
-- ALTER TYPE ... ADD VALUE *is* a migration, and one flat enum would happily
-- allow 'enrolled' on a courier lead.
--
-- With this table, a new vertical pipeline is an INSERT, the composite FK
-- from leads refuses cross-vertical stages, and is_commissionable makes the
-- payout rule data-driven: travel's 'booked' and courier's 'delivered' fire
-- the same accrual trigger with no code change.
create table if not exists public.lead_stages (
  vertical          public.lead_vertical not null,
  key               text not null,
  label             text not null,
  sort_order        int  not null,
  is_terminal       boolean not null default false,
  is_won            boolean not null default false,
  is_commissionable boolean not null default false,
  accent            text,
  primary key (vertical, key)
);

-- ── leads: shared across all three verticals ─────────────────────────────
create table if not exists public.leads (
  id                uuid primary key default gen_random_uuid(),
  vertical          public.lead_vertical not null,

  agent_id          uuid references public.profiles(id) on delete set null,
  created_by        uuid references public.profiles(id),
  source            public.lead_source not null default 'agent',
  source_inquiry_id uuid references public.contact_inquiries(id) on delete set null,

  -- the basic block: exactly what an agent supplies
  student_name   text not null,
  phone          text,
  email          text,
  target_country text,
  remarks        text,

  stage_key   text not null,

  -- Over The Sea's own service/consultancy fee. Percent commissions are a
  -- share of THIS, so a payout can never exceed what the business earned.
  deal_value  numeric(12,2) check (deal_value is null or deal_value >= 0),
  currency    char(3) not null default 'INR',

  -- soft delete: commissions.lead_id is ON DELETE RESTRICT, so a lead that
  -- has ever earned must never be hard-deleted
  archived_at timestamptz,

  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),

  constraint leads_stage_fk foreign key (vertical, stage_key)
    references public.lead_stages (vertical, key),

  -- not redundant with the PK: it is the FK target the detail tables use to
  -- pin themselves to the correct vertical
  constraint leads_id_vertical_uq unique (id, vertical)
);

create index if not exists idx_leads_agent      on public.leads (agent_id, created_at desc);
create index if not exists idx_leads_pipeline   on public.leads (vertical, stage_key) where archived_at is null;
create index if not exists idx_leads_inquiry    on public.leads (source_inquiry_id);
create index if not exists idx_leads_created_at on public.leads (created_at desc);

drop trigger if exists on_leads_updated on public.leads;
create trigger on_leads_updated
  before update on public.leads
  for each row execute procedure public.handle_updated_at();

-- now that leads exists, close the conversion loop from 0002
alter table public.contact_inquiries
  drop constraint if exists contact_inquiries_converted_lead_fk;
alter table public.contact_inquiries
  add constraint contact_inquiries_converted_lead_fk
  foreign key (converted_lead_id) references public.leads(id) on delete set null;

-- ── education_details: the big admin-only form ───────────────────────────
create table if not exists public.education_details (
  lead_id  uuid primary key,
  vertical public.lead_vertical not null default 'education'
           check (vertical = 'education'),

  -- identity
  date_of_birth   date,
  gender          text,
  passport_number text,
  passport_expiry date,
  current_address text,
  city            text,
  state           text,

  -- academics
  highest_qualification text,
  board_or_university   text,
  year_of_passing       int,
  percentage_or_cgpa    text,
  backlogs              int,

  -- tests
  english_test       text check (english_test is null or english_test in
                     ('IELTS','TOEFL','PTE','DUOLINGO','MOI','NONE')),
  english_test_score text,
  english_test_date  date,
  gre_score          text,
  gmat_score         text,

  -- preferences
  preferred_countries  text[],
  preferred_intake     text,
  preferred_course     text,
  preferred_level      text,
  preferred_university text,

  -- experience and funding
  work_experience_years   numeric(4,1),
  work_experience_details text,
  funding_source          text,
  budget_amount           numeric(12,2),
  sponsor_relation        text,
  visa_refusal_history    boolean default false,
  visa_refusal_details    text,

  -- application tracking
  application_university  text,
  application_course      text,
  application_submitted_on date,
  offer_letter_date       date,
  offer_type              text,
  tuition_fee_amount      numeric(12,2),
  tuition_fee_currency    char(3),
  visa_applied_on         date,
  visa_decision_on        date,
  visa_outcome            text,

  counsellor_notes text,
  documents        jsonb not null default '[]'::jsonb,

  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),

  -- the composite FK is what makes attaching education details to a courier
  -- lead impossible — declarative, no trigger needed
  constraint education_details_parent_fk foreign key (lead_id, vertical)
    references public.leads (id, vertical) on delete cascade
);

-- ── travel_details (schema now, UI later) ────────────────────────────────
create table if not exists public.travel_details (
  lead_id  uuid primary key,
  vertical public.lead_vertical not null default 'travel' check (vertical = 'travel'),
  destination     text,
  travel_type     text,
  pax_count       int,
  depart_on       date,
  return_on       date,
  passport_number text,
  passport_expiry date,
  visa_type       text,
  visa_status     text,
  package_amount  numeric(12,2),
  notes           text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint travel_details_parent_fk foreign key (lead_id, vertical)
    references public.leads (id, vertical) on delete cascade
);

-- ── courier_details (schema now, UI later) ───────────────────────────────
-- tracking_number is the future join to the existing /api/tracking
-- United Express proxy.
create table if not exists public.courier_details (
  lead_id  uuid primary key,
  vertical public.lead_vertical not null default 'courier' check (vertical = 'courier'),
  tracking_number     text,
  carrier             text,
  origin_city         text,
  destination_city    text,
  destination_country text,
  weight_kg           numeric(8,2),
  package_type        text,
  declared_value      numeric(12,2),
  pickup_on           date,
  delivered_on        date,
  notes               text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint courier_details_parent_fk foreign key (lead_id, vertical)
    references public.leads (id, vertical) on delete cascade
);

-- Materialise the detail row up front so the admin form is always a plain
-- UPDATE with no upsert branch.
create or replace function public.ensure_lead_detail_row()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  case new.vertical
    when 'education' then
      insert into public.education_details (lead_id) values (new.id) on conflict do nothing;
    when 'travel' then
      insert into public.travel_details (lead_id) values (new.id) on conflict do nothing;
    when 'courier' then
      insert into public.courier_details (lead_id) values (new.id) on conflict do nothing;
  end case;
  return new;
end;
$$;

drop trigger if exists trg_leads_detail_row on public.leads;
create trigger trg_leads_detail_row
  after insert on public.leads
  for each row execute function public.ensure_lead_detail_row();

-- ── stage history ────────────────────────────────────────────────────────
create table if not exists public.lead_stage_history (
  id         bigserial primary key,
  lead_id    uuid not null references public.leads(id) on delete cascade,
  from_stage text,
  to_stage   text not null,
  changed_by uuid references public.profiles(id),
  note       text,
  changed_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_stage_history_lead on public.lead_stage_history (lead_id, changed_at desc);

-- Written by trigger, so no code path can skip the audit trail.
create or replace function public.record_stage_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.lead_stage_history (lead_id, from_stage, to_stage, changed_by)
  values (
    new.id,
    case when tg_op = 'UPDATE' then old.stage_key else null end,
    new.stage_key,
    auth.uid()
  );
  return new;
end;
$$;

drop trigger if exists trg_leads_stage_history_ins on public.leads;
create trigger trg_leads_stage_history_ins
  after insert on public.leads
  for each row execute function public.record_stage_change();

drop trigger if exists trg_leads_stage_history_upd on public.leads;
create trigger trg_leads_stage_history_upd
  after update of stage_key on public.leads
  for each row when (old.stage_key is distinct from new.stage_key)
  execute function public.record_stage_change();

-- ── field guard ──────────────────────────────────────────────────────────
-- Stops an agent promoting their own lead to a commissionable stage (and so
-- minting their own payout), reassigning ownership, or setting deal_value.
create or replace function public.guard_lead_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.agent_id    is distinct from old.agent_id
    or new.stage_key   is distinct from old.stage_key
    or new.vertical    is distinct from old.vertical
    or new.deal_value  is distinct from old.deal_value
    or new.source      is distinct from old.source
    or new.created_by  is distinct from old.created_by
    or new.archived_at is distinct from old.archived_at then
      raise exception 'Agents may not change ownership, stage, or deal value'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_leads_guard on public.leads;
create trigger trg_leads_guard
  before update on public.leads
  for each row execute function public.guard_lead_fields();

drop trigger if exists on_education_details_updated on public.education_details;
create trigger on_education_details_updated before update on public.education_details
  for each row execute procedure public.handle_updated_at();
drop trigger if exists on_travel_details_updated on public.travel_details;
create trigger on_travel_details_updated before update on public.travel_details
  for each row execute procedure public.handle_updated_at();
drop trigger if exists on_courier_details_updated on public.courier_details;
create trigger on_courier_details_updated before update on public.courier_details
  for each row execute procedure public.handle_updated_at();

-- ###################### migrations/0004_commissions.sql ######################

-- =========================================================================
-- 0004 — the commission ledger.
-- =========================================================================

create table if not exists public.commissions (
  id       uuid primary key default gen_random_uuid(),

  -- UNIQUE is the idempotency key: bouncing a lead enrolled -> on_hold ->
  -- enrolled can never mint a second payout.
  -- RESTRICT: a lead that has earned must never be hard-deleted.
  lead_id  uuid not null unique references public.leads(id)    on delete restrict,
  agent_id uuid not null        references public.profiles(id) on delete restrict,
  vertical public.lead_vertical not null,

  -- ⚠ SNAPSHOT, taken once at earn time and never recomputed.
  -- Reading the rate live from profiles at payout time would mean raising an
  -- agent's rate tomorrow retroactively changes money already owed.
  commission_type  public.commission_type not null,
  commission_value numeric(12,2) not null,
  base_amount      numeric(12,2),          -- the lead's deal_value at earn time
  currency         char(3) not null default 'INR',

  -- null only while status = 'earned' (percent agent, deal_value not yet set)
  amount           numeric(12,2),

  status    public.commission_status not null default 'earned',
  earned_at timestamptz not null default timezone('utc'::text, now()),

  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  paid_at     timestamptz,
  paid_by     uuid references public.profiles(id),

  payment_reference text,
  payment_method    text,
  payment_note      text,

  cancelled_at  timestamptz,
  cancel_reason text,

  -- set when the lead leaves the won stage AFTER the money was approved or
  -- paid. Status is deliberately left alone: real money is never silently
  -- reversed, it goes into a review queue instead.
  stage_reverted_at timestamptz,

  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),

  -- forces the admin to set deal_value on a percent lead before approving,
  -- rather than silently booking a zero payout
  constraint approved_requires_amount
    check (status not in ('approved','paid') or amount is not null),

  constraint paid_requires_reference
    check (status <> 'paid' or (paid_at is not null and payment_reference is not null))
);

create index if not exists idx_commissions_agent   on public.commissions (agent_id, status, earned_at desc);
create index if not exists idx_commissions_pending on public.commissions (status) where status in ('earned','approved');
create index if not exists idx_commissions_flagged on public.commissions (stage_reverted_at) where stage_reverted_at is not null;

drop trigger if exists on_commissions_updated on public.commissions;
create trigger on_commissions_updated
  before update on public.commissions
  for each row execute procedure public.handle_updated_at();

-- ###################### migrations/0005_commission_engine.sql ######################

-- =========================================================================
-- 0005 — the commission engine.
--
-- Why triggers rather than application code: "reached a commissionable stage
-- => money is owed" is an invariant of the DATA, not of one code path. A
-- trigger fires regardless of writer (admin UI, a future agent UI, a bulk
-- import, the Supabase SQL editor), is atomic with the stage change so there
-- is no "stage saved but commission insert failed" half-state, and cannot be
-- forgotten by whoever later adds a second place that updates stages.
-- The Supabase JS client cannot express a multi-statement transaction anyway.
-- =========================================================================

create or replace function public.accrue_commission()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_now_comm boolean := false;
  v_was_comm boolean := false;
  v_type     public.commission_type;
  v_value    numeric(12,2);
  v_amount   numeric(12,2);
begin
  select is_commissionable into v_now_comm
    from public.lead_stages
   where vertical = new.vertical and key = new.stage_key;

  if tg_op = 'UPDATE' then
    select is_commissionable into v_was_comm
      from public.lead_stages
     where vertical = old.vertical and key = old.stage_key;
  end if;

  v_now_comm := coalesce(v_now_comm, false);
  v_was_comm := coalesce(v_was_comm, false);

  -- ── crossing INTO a commissionable stage ───────────────────────────────
  if v_now_comm and not v_was_comm then
    -- no referring agent (admin-sourced or website lead) => nothing is owed
    if new.agent_id is null then
      return new;
    end if;

    select commission_type, commission_value
      into v_type, v_value
      from public.profiles
     where id = new.agent_id;

    if v_type = 'flat' then
      v_amount := v_value;
    elsif new.deal_value is not null then
      v_amount := round(new.deal_value * v_value / 100.0, 2);
    else
      -- percent agent with no deal value yet: leave amount null. The
      -- approved_requires_amount CHECK then blocks approval until the admin
      -- fills it in, instead of silently booking zero.
      v_amount := null;
    end if;

    insert into public.commissions (
      lead_id, agent_id, vertical,
      commission_type, commission_value, base_amount, currency,
      amount, status, earned_at
    ) values (
      new.id, new.agent_id, new.vertical,
      v_type, v_value, new.deal_value, new.currency,
      v_amount, 'earned', timezone('utc'::text, now())
    )
    on conflict (lead_id) do nothing;   -- idempotent across stage bouncing

  -- ── crossing OUT of a commissionable stage ─────────────────────────────
  elsif v_was_comm and not v_now_comm then
    -- not yet paid out: cancel cleanly
    update public.commissions
       set status        = 'cancelled',
           cancelled_at  = timezone('utc'::text, now()),
           cancel_reason = 'Lead moved out of a commissionable stage'
     where lead_id = new.id
       and status in ('earned','approved');

    -- already paid: do NOT silently reverse real money. Flag it for review.
    update public.commissions
       set stage_reverted_at = timezone('utc'::text, now())
     where lead_id = new.id
       and status = 'paid'
       and stage_reverted_at is null;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_leads_accrue_ins on public.leads;
create trigger trg_leads_accrue_ins
  after insert on public.leads
  for each row execute function public.accrue_commission();

drop trigger if exists trg_leads_accrue_upd on public.leads;
create trigger trg_leads_accrue_upd
  after update of stage_key on public.leads
  for each row when (old.stage_key is distinct from new.stage_key)
  execute function public.accrue_commission();

-- ── status state machine + snapshot immutability ─────────────────────────
create or replace function public.guard_commission_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is null under service_role and internal triggers; trusted.
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Only admins may modify commissions' using errcode = '42501';
  end if;

  if new.status is distinct from old.status then
    if not (
         (old.status = 'earned'    and new.status in ('approved','cancelled'))
      or (old.status = 'approved'  and new.status in ('paid','cancelled'))
      or (old.status = 'cancelled' and new.status = 'earned')   -- admin un-cancel
    ) then
      raise exception 'Illegal commission transition % -> %', old.status, new.status
        using errcode = '23514';
    end if;

    if new.status = 'approved' then
      new.approved_at := timezone('utc'::text, now());
      new.approved_by := auth.uid();
    elsif new.status = 'paid' then
      new.paid_at := coalesce(new.paid_at, timezone('utc'::text, now()));
      new.paid_by := auth.uid();
    elsif new.status = 'cancelled' then
      new.cancelled_at := timezone('utc'::text, now());
    end if;
  end if;

  -- the snapshot is the whole point; it must never drift
  if new.lead_id          is distinct from old.lead_id
  or new.agent_id         is distinct from old.agent_id
  or new.commission_type  is distinct from old.commission_type
  or new.commission_value is distinct from old.commission_value
  or new.base_amount      is distinct from old.base_amount
  or new.earned_at        is distinct from old.earned_at then
    raise exception 'Commission snapshot fields are immutable' using errcode = '42501';
  end if;

  -- amount may only be corrected while still unapproved
  if new.amount is distinct from old.amount and old.status <> 'earned' then
    raise exception 'Amount is locked once the commission is approved'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_commissions_guard on public.commissions;
create trigger trg_commissions_guard
  before update on public.commissions
  for each row execute function public.guard_commission_write();

-- Append-only ledger: cancel, never delete. This is also why leads are
-- soft-deleted via archived_at.
create or replace function public.block_commission_delete()
returns trigger language plpgsql as $$
begin
  raise exception 'Commissions are append-only; cancel instead of deleting'
    using errcode = '42501';
end;
$$;

drop trigger if exists trg_commissions_no_delete on public.commissions;
create trigger trg_commissions_no_delete
  before delete on public.commissions
  for each row execute function public.block_commission_delete();

-- ###################### migrations/0006_rls.sql ######################

-- =========================================================================
-- 0006 — Row Level Security.
--
-- Every policy calls `(select public.is_admin())` rather than bare
-- `is_admin()`. Wrapping a STABLE function in a scalar subquery lets the
-- planner hoist it into an InitPlan evaluated ONCE PER STATEMENT instead of
-- once per row — on a 10k-row scan that is 1 call instead of 10,000.
--
-- Column-level restrictions are NOT done here: RLS cannot restrict columns,
-- and admin + agent share the `authenticated` Postgres role so a column
-- GRANT would cripple the admin too. Those live in the guard triggers in
-- 0001 (profiles) and 0003 (leads).
-- =========================================================================

alter table public.profiles           enable row level security;
alter table public.lead_stages        enable row level security;
alter table public.leads              enable row level security;
alter table public.education_details  enable row level security;
alter table public.travel_details     enable row level security;
alter table public.courier_details    enable row level security;
alter table public.lead_stage_history enable row level security;
alter table public.commissions        enable row level security;

-- ── profiles ─────────────────────────────────────────────────────────────
drop policy if exists profiles_select_self  on public.profiles;
create policy profiles_select_self on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin on public.profiles
  for select to authenticated
  using ((select public.is_admin()));

-- Privileged columns are blocked by trg_profiles_guard (0001), NOT by this
-- policy. Without that trigger this policy alone permits
--   update profiles set role='admin' where id = auth.uid()
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using      (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists profiles_all_admin on public.profiles;
create policy profiles_all_admin on public.profiles
  for all to authenticated
  using      ((select public.is_admin()))
  with check ((select public.is_admin()));

-- No INSERT policy for non-admins: profiles are created by the admin action
-- using the service-role client, paired with auth.admin.createUser.

-- ── lead_stages ──────────────────────────────────────────────────────────
drop policy if exists stages_read_all on public.lead_stages;
create policy stages_read_all on public.lead_stages
  for select to authenticated using (true);

drop policy if exists stages_write_admin on public.lead_stages;
create policy stages_write_admin on public.lead_stages
  for all to authenticated
  using      ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ── leads ────────────────────────────────────────────────────────────────
drop policy if exists leads_admin_all on public.leads;
create policy leads_admin_all on public.leads
  for all to authenticated
  using      ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists leads_agent_select_own on public.leads;
create policy leads_agent_select_own on public.leads
  for select to authenticated
  using (agent_id = (select auth.uid()));

-- An agent may only create a lead that is their own, attributed to them,
-- with no deal value, sitting at the vertical's first stage.
drop policy if exists leads_agent_insert_own on public.leads;
create policy leads_agent_insert_own on public.leads
  for insert to authenticated
  with check (
        agent_id   = (select auth.uid())
    and created_by = (select auth.uid())
    and (select public.current_role_is('agent'))
    and source     = 'agent'
    and deal_value is null
    and archived_at is null
    and stage_key in (
          select s.key from public.lead_stages s
           where s.vertical = leads.vertical
             and s.sort_order = (
                   select min(s2.sort_order) from public.lead_stages s2
                    where s2.vertical = leads.vertical
                 )
        )
  );

-- Which COLUMNS an agent may change is enforced by trg_leads_guard (0003).
drop policy if exists leads_agent_update_own on public.leads;
create policy leads_agent_update_own on public.leads
  for update to authenticated
  using      (agent_id = (select auth.uid()) and archived_at is null)
  with check (agent_id = (select auth.uid()));

-- deliberately no DELETE policy for agents

-- ── detail tables: ADMIN ONLY, no agent access at all ────────────────────
-- Scores, budget, passport data, sponsor details and counsellor notes live
-- here precisely so that row-level security can hide them. Agents get no
-- policy on these tables, so the rows simply do not exist for them. RLS
-- cannot hide a column, so this separation is the mechanism — not a careful
-- SELECT list in the API that someone will eventually forget.
drop policy if exists edu_admin_all on public.education_details;
create policy edu_admin_all on public.education_details
  for all to authenticated
  using      ((select public.is_admin()))
  with check ((select public.is_admin()));


drop policy if exists travel_admin_all on public.travel_details;
create policy travel_admin_all on public.travel_details
  for all to authenticated
  using      ((select public.is_admin()))
  with check ((select public.is_admin()));


drop policy if exists courier_admin_all on public.courier_details;
create policy courier_admin_all on public.courier_details
  for all to authenticated
  using      ((select public.is_admin()))
  with check ((select public.is_admin()));


-- ── stage history: read-only to everyone ─────────────────────────────────
-- Rows arrive only via the SECURITY DEFINER trigger in 0003.
drop policy if exists history_admin_select on public.lead_stage_history;
create policy history_admin_select on public.lead_stage_history
  for select to authenticated
  using ((select public.is_admin()));

drop policy if exists history_agent_select_own on public.lead_stage_history;
create policy history_agent_select_own on public.lead_stage_history
  for select to authenticated
  using (exists (
    select 1 from public.leads l
     where l.id = lead_stage_history.lead_id
       and l.agent_id = (select auth.uid())
  ));

-- ── commissions ──────────────────────────────────────────────────────────
drop policy if exists comm_admin_all on public.commissions;
create policy comm_admin_all on public.commissions
  for all to authenticated
  using      ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Agents read their own and nothing more. There is deliberately NO agent
-- INSERT / UPDATE / DELETE policy at all; the accrual trigger is SECURITY
-- DEFINER so it still writes.
drop policy if exists comm_agent_select_own on public.commissions;
create policy comm_agent_select_own on public.commissions
  for select to authenticated
  using (agent_id = (select auth.uid()));

-- ###################### migrations/0007_detail_tables_admin_only.sql ######################

-- =========================================================================
-- 0007 — Make the vertical detail tables strictly admin-only.
--
-- 0006 originally let an agent SELECT the detail row of their own lead. That
-- contradicts the agreed visibility rule: an agent sees the student's name,
-- country, stage, their own remarks and their commission status — and
-- nothing else. The detail tables hold test scores, budget, passport data,
-- sponsor details and counsellor notes, all of which are internal.
--
-- Dropping the policies is the whole fix: with RLS enabled and no policy
-- granting an agent access, the rows are invisible to them. There is no
-- column-hiding to get wrong and no SELECT list in the API that someone can
-- later forget to constrain.
-- =========================================================================

drop policy if exists edu_agent_select_own     on public.education_details;
drop policy if exists travel_agent_select_own  on public.travel_details;
drop policy if exists courier_agent_select_own on public.courier_details;

-- ###################### migrations/0008_commission_reinstate.sql ######################

-- =========================================================================
-- 0008 — Reinstate a cancelled commission when a lead re-enters a
--        commissionable stage.
--
-- Bug this fixes: moving a lead enrolled -> on_hold -> enrolled cancelled the
-- commission on the way out, and then `on conflict (lead_id) do nothing`
-- refused to recreate it on the way back in. The agent silently lost the
-- payout forever, and because UNIQUE(lead_id) is the idempotency key there
-- was no way to re-earn it. An admin correcting a mis-click would have
-- quietly cost an agent real money.
--
-- The fix keeps the idempotency guarantee (still exactly one row per lead,
-- so no double payment) while allowing the cancelled -> earned transition
-- the state machine already permits.
--
-- Deliberately untouched on re-entry:
--   * approved / paid rows   — already settled; nothing to reinstate
--   * amount                 — the earn-time snapshot stands; the guard
--                              trigger locks it once past 'earned' anyway
-- =========================================================================

create or replace function public.accrue_commission()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_now_comm boolean := false;
  v_was_comm boolean := false;
  v_type     public.commission_type;
  v_value    numeric(12,2);
  v_amount   numeric(12,2);
begin
  select is_commissionable into v_now_comm
    from public.lead_stages
   where vertical = new.vertical and key = new.stage_key;

  if tg_op = 'UPDATE' then
    select is_commissionable into v_was_comm
      from public.lead_stages
     where vertical = old.vertical and key = old.stage_key;
  end if;

  v_now_comm := coalesce(v_now_comm, false);
  v_was_comm := coalesce(v_was_comm, false);

  -- ── crossing INTO a commissionable stage ───────────────────────────────
  if v_now_comm and not v_was_comm then
    if new.agent_id is null then
      return new;   -- admin-sourced or website lead: nothing is owed
    end if;

    select commission_type, commission_value
      into v_type, v_value
      from public.profiles
     where id = new.agent_id;

    if v_type = 'flat' then
      v_amount := v_value;
    elsif new.deal_value is not null then
      v_amount := round(new.deal_value * v_value / 100.0, 2);
    else
      -- percent agent with no deal value yet: leave null so the
      -- approved_requires_amount CHECK forces the admin to set it rather
      -- than silently booking zero.
      v_amount := null;
    end if;

    insert into public.commissions (
      lead_id, agent_id, vertical,
      commission_type, commission_value, base_amount, currency,
      amount, status, earned_at
    ) values (
      new.id, new.agent_id, new.vertical,
      v_type, v_value, new.deal_value, new.currency,
      v_amount, 'earned', timezone('utc'::text, now())
    )
    on conflict (lead_id) do update
      set status        = 'earned',
          cancelled_at  = null,
          cancel_reason = null
      -- Only a cancelled commission is reinstated. An approved or paid row
      -- is left exactly as it is: that money is already settled.
      where public.commissions.status = 'cancelled';

  -- ── crossing OUT of a commissionable stage ─────────────────────────────
  elsif v_was_comm and not v_now_comm then
    update public.commissions
       set status        = 'cancelled',
           cancelled_at  = timezone('utc'::text, now()),
           cancel_reason = 'Lead moved out of a commissionable stage'
     where lead_id = new.id
       and status in ('earned','approved');

    -- Already paid: never silently reverse real money. Flag for review.
    update public.commissions
       set stage_reverted_at = timezone('utc'::text, now())
     where lead_id = new.id
       and status = 'paid'
       and stage_reverted_at is null;
  end if;

  return new;
end;
$$;

-- ###################### seed/lead_stages.sql ######################

-- =========================================================================
-- Pipeline definitions for all three verticals. DATA, not DDL — re-runnable.
--
-- Adding or renaming a stage, or switching on a new vertical's pipeline, is
-- an edit to this file and a re-run. No migration, no ALTER TYPE.
--
-- is_commissionable marks the single stage per vertical that makes money
-- owed. The accrual trigger in 0005 reads it, so travel's 'booked' and
-- courier's 'delivered' work with zero code change.
-- =========================================================================

insert into public.lead_stages
  (vertical, key, label, sort_order, is_terminal, is_won, is_commissionable, accent)
values
  -- ── education (the active vertical) ────────────────────────────────────
  ('education','new',                   'New',                   10,  false, false, false, '#6355d8'),
  ('education','contacted',             'Contacted',             20,  false, false, false, '#6355d8'),
  ('education','counselling',           'Counselling',           30,  false, false, false, '#6355d8'),
  ('education','documents_pending',     'Documents Pending',     40,  false, false, false, '#d97706'),
  ('education','application_submitted', 'Application Submitted', 50,  false, false, false, '#6355d8'),
  ('education','offer_received',        'Offer Received',        60,  false, false, false, '#059669'),
  ('education','fee_paid',              'Fee Paid',              70,  false, false, false, '#059669'),
  ('education','visa_applied',          'Visa Applied',          80,  false, false, false, '#6355d8'),
  ('education','visa_approved',         'Visa Approved',         90,  false, false, false, '#059669'),
  ('education','enrolled',              'Enrolled',              100, true,  true,  true,  '#059669'),
  ('education','on_hold',               'On Hold',               110, false, false, false, '#64748b'),
  ('education','lost',                  'Lost',                  120, true,  false, false, '#dc2626'),

  -- ── travel (schema ready, no UI yet) ──────────────────────────────────
  ('travel','new',            'New',            10, false, false, false, '#059669'),
  ('travel','contacted',      'Contacted',      20, false, false, false, '#059669'),
  ('travel','quotation_sent', 'Quotation Sent', 30, false, false, false, '#059669'),
  ('travel','booked',         'Booked',         40, false, true,  true,  '#059669'),
  ('travel','travelled',      'Travelled',      50, true,  true,  false, '#059669'),
  ('travel','cancelled',      'Cancelled',      60, true,  false, false, '#dc2626'),

  -- ── courier (schema ready, no UI yet) ─────────────────────────────────
  ('courier','new',              'New',              10, false, false, false, '#d97706'),
  ('courier','pickup_scheduled', 'Pickup Scheduled', 20, false, false, false, '#d97706'),
  ('courier','in_transit',       'In Transit',       30, false, false, false, '#d97706'),
  ('courier','delivered',        'Delivered',        40, true,  true,  true,  '#059669'),
  ('courier','cancelled',        'Cancelled',        50, true,  false, false, '#dc2626')

on conflict (vertical, key) do update set
  label             = excluded.label,
  sort_order        = excluded.sort_order,
  is_terminal       = excluded.is_terminal,
  is_won            = excluded.is_won,
  is_commissionable = excluded.is_commissionable,
  accent            = excluded.accent;
