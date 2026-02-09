-- Expense Settings and Categories Schema

-- 1. Create Expense Categories Table
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    max_limit numeric DEFAULT 0,
    status text DEFAULT 'Active', -- Active, Inactive
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Create Global Expense Settings Table
CREATE TABLE IF NOT EXISTS public.expense_settings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    deadline_claims_date integer DEFAULT 5, -- Day of the month (1-31)
    receipt_mandatory_amount numeric DEFAULT 200,
    allow_backdated_claims boolean DEFAULT false,
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_settings ENABLE ROW LEVEL SECURITY;

-- 4. Create Public Policies (Development Mode)
DROP POLICY IF EXISTS "Allow all operations for public" ON public.expense_categories;
CREATE POLICY "Allow all operations for public" ON public.expense_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations for public" ON public.expense_settings;
CREATE POLICY "Allow all operations for public" ON public.expense_settings FOR ALL USING (true) WITH CHECK (true);

-- 5. Insert Default Settings if not exists
INSERT INTO public.expense_settings (deadline_claims_date, receipt_mandatory_amount, allow_backdated_claims)
SELECT 5, 200, false
WHERE NOT EXISTS (SELECT 1 FROM public.expense_settings);

-- 6. Insert Default Categories
INSERT INTO public.expense_categories (name, max_limit)
VALUES 
    ('Travel & Conveyance', 5000),
    ('Meals & Entertainment', 1000),
    ('Communication', 2000),
    ('Office Supplies', 10000)
ON CONFLICT (name) DO NOTHING;

-- 7. Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_expense_categories_updated_at ON public.expense_categories;
CREATE TRIGGER update_expense_categories_updated_at
BEFORE UPDATE ON public.expense_categories
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_expense_settings_updated_at ON public.expense_settings;
CREATE TRIGGER update_expense_settings_updated_at
BEFORE UPDATE ON public.expense_settings
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
