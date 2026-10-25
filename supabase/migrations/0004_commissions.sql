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
