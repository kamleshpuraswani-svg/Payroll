-- FIX SCRIPT: Run this to resolve the "relation does not exist" error
-- This script creates the missing table AND applies the new updates in one go.

-- 0. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. FIX: Ensure tax_declarations table exists (This was missing)
CREATE TABLE IF NOT EXISTS public.tax_declarations (
  id text primary key,
  employee_id text,
  employee_name text,
  type text, -- 80C, 80D etc
  amount numeric,
  submitted_date text,
  status text,
  notes text,
  regime text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. FIX: Ensure RLS is enabled for tax_declarations
ALTER TABLE public.tax_declarations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations for public" ON public.tax_declarations;
CREATE POLICY "Allow all operations for public" ON public.tax_declarations FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- V2 UPDATES (Advanced Features)
-- ==========================================

-- 3. Enhance Tax Declarations with JSONB
ALTER TABLE public.tax_declarations 
ADD COLUMN IF NOT EXISTS declaration_data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS financial_year text,
ADD COLUMN IF NOT EXISTS last_updated_at timestamp with time zone DEFAULT now();

-- 4. Create Reimbursement Claims Table
CREATE TABLE IF NOT EXISTS public.reimbursement_claims (
    id text PRIMARY KEY,
    employee_id text REFERENCES public.employees(id),
    title text NOT NULL,
    category text NOT NULL,
    total_amount numeric DEFAULT 0,
    status text DEFAULT 'pending',
    items jsonb DEFAULT '[]'::jsonb,
    approval_history jsonb DEFAULT '[]'::jsonb,
    action_note text,
    submitted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 5. Create Employee Loans Table
CREATE TABLE IF NOT EXISTS public.employee_loans (
    id text PRIMARY KEY,
    employee_id text REFERENCES public.employees(id),
    loan_type text NOT NULL,
    amount numeric NOT NULL,
    interest_rate numeric,
    tenure_months integer,
    status text DEFAULT 'active',
    repayment_schedule jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 6. Create Income Tax Declaration Settings
CREATE TABLE IF NOT EXISTS public.it_declaration_settings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    financial_year text UNIQUE NOT NULL,
    window_start date,
    window_end date,
    grace_period_days integer DEFAULT 0,
    frequency text DEFAULT 'Annually',
    deduction_method text DEFAULT 'Equal',
    approver_hierarchy jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- 7. Enable RLS and Policies for new tables
ALTER TABLE public.reimbursement_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.it_declaration_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for public claims" ON public.reimbursement_claims;
CREATE POLICY "Allow all for public claims" ON public.reimbursement_claims FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for public loans" ON public.employee_loans;
CREATE POLICY "Allow all for public loans" ON public.employee_loans FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for public it_settings" ON public.it_declaration_settings;
CREATE POLICY "Allow all for public it_settings" ON public.it_declaration_settings FOR ALL USING (true) WITH CHECK (true);

-- 8. Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_reimbursement_claims_updated_at ON public.reimbursement_claims;
CREATE TRIGGER update_reimbursement_claims_updated_at
BEFORE UPDATE ON public.reimbursement_claims
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_employee_loans_updated_at ON public.employee_loans;
CREATE TRIGGER update_employee_loans_updated_at
BEFORE UPDATE ON public.employee_loans
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
