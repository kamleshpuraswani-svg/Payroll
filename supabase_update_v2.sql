-- Supabase Schema Update V2
-- Supports Advanced Tax Planning, Reimbursements, and Loans

-- 1. Enhance Tax Declarations to support JSONB state
-- This allows storing the complex UI state (rentedHouses, homeLoanDetails, etc.) in a single field
ALTER TABLE public.tax_declarations 
ADD COLUMN IF NOT EXISTS declaration_data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS financial_year text,
ADD COLUMN IF NOT EXISTS last_updated_at timestamp with time zone DEFAULT now();

-- 2. Create Reimbursement Claims Table (Dedicated)
CREATE TABLE IF NOT EXISTS public.reimbursement_claims (
    id text PRIMARY KEY,
    employee_id text REFERENCES public.employees(id),
    title text NOT NULL,
    category text NOT NULL,
    total_amount numeric DEFAULT 0,
    status text DEFAULT 'pending', -- pending, action_required, settled, draft
    items jsonb DEFAULT '[]'::jsonb, -- Array of items with receipts
    approval_history jsonb DEFAULT '[]'::jsonb,
    action_note text,
    submitted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. Create Employee Loans Table
CREATE TABLE IF NOT EXISTS public.employee_loans (
    id text PRIMARY KEY,
    employee_id text REFERENCES public.employees(id),
    loan_type text NOT NULL,
    amount numeric NOT NULL,
    interest_rate numeric,
    tenure_months integer,
    status text DEFAULT 'active', -- active, closed, pending
    repayment_schedule jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. Create Income Tax Declaration Settings (HR)
CREATE TABLE IF NOT EXISTS public.it_declaration_settings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    financial_year text UNIQUE NOT NULL,
    window_start date,
    window_end date,
    grace_period_days integer DEFAULT 0,
    frequency text DEFAULT 'Annually', -- Monthly, Annually
    deduction_method text DEFAULT 'Equal', -- Equal, Weighted, Threshold
    approver_hierarchy jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- 5. Enable RLS on new tables
ALTER TABLE public.reimbursement_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.it_declaration_settings ENABLE ROW LEVEL SECURITY;

-- 6. Create Public Access Policies (Development Mode)
CREATE POLICY "Allow all for public claims" ON public.reimbursement_claims FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for public loans" ON public.employee_loans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for public it_settings" ON public.it_declaration_settings FOR ALL USING (true) WITH CHECK (true);

-- 7. Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reimbursement_claims_updated_at
BEFORE UPDATE ON public.reimbursement_claims
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_employee_loans_updated_at
BEFORE UPDATE ON public.employee_loans
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
