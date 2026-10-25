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
