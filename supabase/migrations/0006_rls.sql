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
