-- ============================================================
-- Sync missing columns identified in audit (2026-04-13)
-- ============================================================

-- 1. tax_declarations: add breakdown column (JSONB array of {label, amount})
ALTER TABLE public.tax_declarations
  ADD COLUMN IF NOT EXISTS breakdown jsonb DEFAULT '[]'::jsonb;

-- 2. employee_loans: add approved_amount column (used for partial approvals)
ALTER TABLE public.employee_loans
  ADD COLUMN IF NOT EXISTS approved_amount numeric;

-- 3. employee_loans: add disbursed_date column
ALTER TABLE public.employee_loans
  ADD COLUMN IF NOT EXISTS disbursed_date timestamp with time zone;

-- 4. employees: no full_name column needed — live DB uses `name` directly
