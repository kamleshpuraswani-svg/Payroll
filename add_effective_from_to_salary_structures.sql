-- Add effective_from column to salary_structures table
ALTER TABLE public.salary_structures
ADD COLUMN IF NOT EXISTS effective_from text;
