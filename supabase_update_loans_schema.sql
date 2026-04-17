-- Update employee_loans table to include all fields used in the UI
ALTER TABLE public.employee_loans 
ADD COLUMN IF NOT EXISTS reason TEXT,
ADD COLUMN IF NOT EXISTS remaining_balance NUMERIC,
ADD COLUMN IF NOT EXISTS emi_amount NUMERIC,
ADD COLUMN IF NOT EXISTS repayment_month TEXT,
ADD COLUMN IF NOT EXISTS approved_amount NUMERIC,
ADD COLUMN IF NOT EXISTS interest_calc_type TEXT;

-- Ensure ID is auto-generated if it's text
-- If it's pure text, we can't easily set a default uuid unless we cast or use a function.
-- Given the usage of 'LN-' prefixes in mocks, we'll keep it as text and generate in the app 
-- OR set a default that is a random string.
ALTER TABLE public.employee_loans 
ALTER COLUMN id SET DEFAULT ('REQ-' || floor(random() * 1000000)::text);
