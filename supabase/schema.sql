-- =========================================================================
-- OVER THE SEA: DATABASE SCHEMA FOR CONTACT & SERVICE INQUIRIES
-- Project: lrxsjuulqtldvnetdtof
-- =========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create table `contact_inquiries`
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    service_category TEXT NOT NULL CHECK (
        service_category IN (
            'Overseas Education',
            'Courier Logistics',
            'Tourism & Visa',
            'Test Preparation Coaching',
            'General Inquiry'
        )
    ),
    subject TEXT,
    message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'new' CHECK (
        status IN ('new', 'contacted', 'in_progress', 'resolved', 'archived')
    ),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create indices for performance
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON public.contact_inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_service_category ON public.contact_inquiries (service_category);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON public.contact_inquiries (status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_phone ON public.contact_inquiries (phone);

-- 3. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_contact_inquiries_updated ON public.contact_inquiries;
CREATE TRIGGER on_contact_inquiries_updated
    BEFORE UPDATE ON public.contact_inquiries
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- 4. Setup Row Level Security (RLS)
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous/authenticated users to submit inquiries (INSERT only)
DROP POLICY IF EXISTS "Allow public insert into contact_inquiries" ON public.contact_inquiries;
CREATE POLICY "Allow public insert into contact_inquiries"
    ON public.contact_inquiries
    FOR INSERT
    TO public, anon, authenticated
    WITH CHECK (true);

-- Allow service role and authenticated admin users to read and manage all inquiries
DROP POLICY IF EXISTS "Allow full access for authenticated/service role" ON public.contact_inquiries;
CREATE POLICY "Allow full access for authenticated/service role"
    ON public.contact_inquiries
    FOR ALL
    TO authenticated, service_role
    USING (true)
    WITH CHECK (true);

-- Sample initial test records (optional)
INSERT INTO public.contact_inquiries (full_name, email, phone, service_category, subject, message, metadata, status)
VALUES 
(
    'Ramesh Rao',
    'ramesh.rao@example.com',
    '+91 98765 43210',
    'Overseas Education',
    'Fall 2026 MS in Computer Science in USA',
    'Looking for university shortlisting and GRE coaching assistance in Hyderabad.',
    '{"country": "USA", "target_intake": "Fall 2026", "degree": "Masters"}'::jsonb,
    'new'
),
(
    'Priya Reddy',
    'priya.reddy@example.com',
    '+91 90527 11223',
    'Courier Logistics',
    'Prescription Medicine Courier to London UK',
    'Need door-to-door pickup for 2kg medicine parcel with doctor prescription.',
    '{"dest_country": "UK", "weight_kg": 2, "item_type": "medicine"}'::jsonb,
    'new'
),
(
    'Anil Kumar',
    'anil.k@example.com',
    '+91 98480 22334',
    'Tourism & Visa',
    'Tourist Visa Callback for Dubai UAE',
    'Family of 4 traveling for vacation next month. Need express visa stamping.',
    '{"dest_country": "UAE", "visa_type": "Express Tourist Visa (30 Days)", "passengers": 4}'::jsonb,
    'contacted'
)
ON CONFLICT DO NOTHING;
