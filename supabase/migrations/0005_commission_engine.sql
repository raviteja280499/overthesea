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
