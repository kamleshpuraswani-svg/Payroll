-- Comprehensive SQL Setup and Target Scoping Migration

-- 0. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Expense Categories: Create if missing
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    max_limit numeric DEFAULT 0,
    status text DEFAULT 'Active',
    description text,
    receipt_threshold numeric DEFAULT 200,
    pro_rata boolean DEFAULT false,
    applicable_to jsonb DEFAULT '[]',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by text DEFAULT 'HR Manager',
    last_updated_by text DEFAULT 'HR Manager'
);

-- Add target scoping and audit columns to expense_categories
DO $$ 
BEGIN 
    -- Drop old constraint if it exists to allow updating allowed values
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'expense_categories_target_type_check') THEN
        ALTER TABLE public.expense_categories DROP CONSTRAINT expense_categories_target_type_check;
    END IF;
END $$;

ALTER TABLE public.expense_categories 
ADD COLUMN IF NOT EXISTS target_id text,
ADD COLUMN IF NOT EXISTS target_type text,
ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'HR Manager',
ADD COLUMN IF NOT EXISTS last_updated_by text DEFAULT 'HR Manager';

ALTER TABLE public.expense_categories 
ADD CONSTRAINT expense_categories_target_type_check CHECK (target_type IN ('bu', 'pg'));

-- Handle unique constraint swaps for expense_categories
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'expense_categories_name_key') THEN
        ALTER TABLE public.expense_categories DROP CONSTRAINT expense_categories_name_key;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'expense_categories_name_target_key') THEN
        ALTER TABLE public.expense_categories DROP CONSTRAINT expense_categories_name_target_key;
    END IF;
END $$;

ALTER TABLE public.expense_categories 
ADD CONSTRAINT expense_categories_name_target_key UNIQUE (name, target_id, target_type);

-- 2. Document Templates: Create if missing
CREATE TABLE IF NOT EXISTS public.document_templates (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    type text NOT NULL CHECK (type IN ('salary_slip', 'bank_disbursal', 'salary_annexure', 'fnf_settlement')),
    name text NOT NULL,
    bank_name text,
    status text DEFAULT 'Draft',
    is_active boolean DEFAULT true,
    content jsonb DEFAULT '{}'::jsonb,
    settings jsonb DEFAULT '{}'::jsonb,
    target_id text,
    target_type text,
    created_by text DEFAULT 'HR Manager',
    last_updated_by text DEFAULT 'HR Manager',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Handle audit columns for document_templates if table existed
ALTER TABLE public.document_templates 
ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'HR Manager',
ADD COLUMN IF NOT EXISTS last_updated_by text DEFAULT 'HR Manager';

-- Handle constraint for document_templates
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'document_templates_target_type_check') THEN
        ALTER TABLE public.document_templates DROP CONSTRAINT document_templates_target_type_check;
    END IF;
END $$;

ALTER TABLE public.document_templates 
ADD COLUMN IF NOT EXISTS target_id text,
ADD COLUMN IF NOT EXISTS target_type text;

ALTER TABLE public.document_templates 
ADD CONSTRAINT document_templates_target_type_check CHECK (target_type IN ('bu', 'pg'));

-- 3. Operational Config: Ensure it exists
CREATE TABLE IF NOT EXISTS public.operational_config (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    config_key text UNIQUE NOT NULL,
    config_value jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);
