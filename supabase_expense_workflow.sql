-- Expense Approval Workflow Schema

-- 1. Create Expense Workflows Table
-- This table stores individual approval levels/stages for the workflow
CREATE TABLE IF NOT EXISTS public.expense_workflows (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    approver_id text REFERENCES public.employees(id),
    sequence_order integer NOT NULL, -- 1, 2, 3...
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.expense_workflows ENABLE ROW LEVEL SECURITY;

-- 3. Create Public Policies (Development Mode)
DROP POLICY IF EXISTS "Allow all operations for public" ON public.expense_workflows;
CREATE POLICY "Allow all operations for public" ON public.expense_workflows FOR ALL USING (true) WITH CHECK (true);

-- 4. Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_expense_workflows_updated_at ON public.expense_workflows;
CREATE TRIGGER update_expense_workflows_updated_at
BEFORE UPDATE ON public.expense_workflows
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
