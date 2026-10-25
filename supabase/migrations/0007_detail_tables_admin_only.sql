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
