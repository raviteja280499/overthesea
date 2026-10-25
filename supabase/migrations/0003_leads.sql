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
