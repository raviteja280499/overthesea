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
