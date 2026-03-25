-- Add new fields to expense_categories for the full-page rule setup
ALTER TABLE public.expense_categories 
ADD COLUMN IF NOT EXISTS frequency text DEFAULT 'Monthly';

ALTER TABLE public.expense_categories 
ADD COLUMN IF NOT EXISTS effective_from text;
