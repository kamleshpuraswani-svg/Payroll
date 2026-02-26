-- SQL Migration to create the salary_components table
-- Run this in your Supabase SQL Editor

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.salary_components (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    type text CHECK (type IN ('Fixed Pay', 'Variable Pay')),
    calculation text,
    taxable text CHECK (taxable IN ('Fully Taxable', 'Partially Exempt', 'Fully Exempt', 'Tax Deductible')),
    status boolean DEFAULT true,
    category text CHECK (category IN ('Earnings', 'Deductions', 'Benefits', 'Reimbursements')),
    amount_or_percent text,
    calc_method text CHECK (calc_method IN ('Flat', 'Percentage')),
    payslip_name text,
    frequency text CHECK (frequency IN ('One-time', 'Recurring')),
    consider_epf boolean DEFAULT false,
    consider_esi boolean DEFAULT false,
    effective_date date DEFAULT CURRENT_DATE,
    deduction_type text CHECK (deduction_type IN ('Statutory', 'Non-Statutory')),
    show_in_payslip boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.salary_components ENABLE ROW LEVEL SECURITY;

-- 3. Create a public "Allow All" policy (for development)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'salary_components' AND policyname = 'Allow all for public'
    ) THEN
        CREATE POLICY "Allow all for public" ON public.salary_components FOR ALL USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- 4. Create trigger for updated_at (optional but recommended)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_salary_components_updated_at') THEN
        CREATE TRIGGER update_salary_components_updated_at 
        BEFORE UPDATE ON public.salary_components 
        FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END
$$;
