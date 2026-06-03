-- SQL Migration to synchronize employees table columns with application schema
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS bank_account_no TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS bank_ifsc TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS bank_branch TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS pan_no TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS aadhaar_no TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS uan_no TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS tax_regime TEXT DEFAULT 'New Regime (2025)';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS salary_pay_mode TEXT DEFAULT 'Bank Transfer';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS annual_gross NUMERIC;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS business_unit TEXT;
