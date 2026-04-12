-- Add annual_gross column to employees table
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS annual_gross numeric(20,0);
