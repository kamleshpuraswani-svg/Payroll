-- Add missing columns for partial approval and remarks
ALTER TABLE public.tax_declarations 
ADD COLUMN IF NOT EXISTS approved_amount numeric,
ADD COLUMN IF NOT EXISTS remarks text,
ADD COLUMN IF NOT EXISTS last_modified_by text;

-- Move notes to remarks if remarks is empty and notes exists (optional cleanup)
-- UPDATE public.tax_declarations SET remarks = notes WHERE remarks IS NULL AND notes IS NOT NULL;
