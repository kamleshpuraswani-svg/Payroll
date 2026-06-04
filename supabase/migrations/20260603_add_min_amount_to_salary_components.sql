-- Add min_amount column to salary_components table
ALTER TABLE public.salary_components 
ADD COLUMN IF NOT EXISTS min_amount text;
