-- Add target fields to salary_components
ALTER TABLE public.salary_components 
ADD COLUMN IF NOT EXISTS target_id text,
ADD COLUMN IF NOT EXISTS target_type text check (target_type in ('BusinessUnit', 'Paygroup'));

-- Add target fields to salary_structures
ALTER TABLE public.salary_structures
ADD COLUMN IF NOT EXISTS target_id text,
ADD COLUMN IF NOT EXISTS target_type text check (target_type in ('BusinessUnit', 'Paygroup'));

-- Add target fields to loan_types
ALTER TABLE public.loan_types
ADD COLUMN IF NOT EXISTS target_id text,
ADD COLUMN IF NOT EXISTS target_type text check (target_type in ('BusinessUnit', 'Paygroup'));
