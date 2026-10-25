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
