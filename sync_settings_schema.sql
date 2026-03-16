-- SQL Migration: Add target scoping to settings and templates

-- 1. Expense Categories: Add target scoping
ALTER TABLE public.expense_categories 
ADD COLUMN IF NOT EXISTS target_id text,
ADD COLUMN IF NOT EXISTS target_type text CHECK (target_type IN ('bu', 'pg'));

-- Drop the unique constraint on name if it exists, as names can be the same across different targets
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'expense_categories_name_key') THEN
        ALTER TABLE public.expense_categories DROP CONSTRAINT expense_categories_name_key;
    END IF;
END $$;

-- Add a composite unique constraint instead
ALTER TABLE public.expense_categories 
ADD CONSTRAINT expense_categories_name_target_key UNIQUE (name, target_id, target_type);

-- 2. Document Templates: Add target scoping
ALTER TABLE public.document_templates 
ADD COLUMN IF NOT EXISTS target_id text,
ADD COLUMN IF NOT EXISTS target_type text CHECK (target_type IN ('bu', 'pg'));

-- 3. Ensure operational_config exists (it should, based on consolidated schema)
-- No changes needed to structure, but we will use it for PF, Statutory, TDS etc.
