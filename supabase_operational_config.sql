-- Migration for Operational Config Settings

-- Create operational_config table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.operational_config (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    config_key text UNIQUE NOT NULL, -- e.g. 'payroll_approval_hierarchy', 'loans_advances_eligibility'
    config_value jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.operational_config ENABLE ROW LEVEL SECURITY;

-- Allow all for public (Development mode)
DROP POLICY IF EXISTS "Allow all for public config" ON public.operational_config;
CREATE POLICY "Allow all for public config" ON public.operational_config FOR ALL USING (true) WITH CHECK (true);

-- Trigger for updated_at (assumes update_updated_at_column exists from previous scripts)
DROP TRIGGER IF EXISTS update_operational_config_updated_at ON public.operational_config;
CREATE TRIGGER update_operational_config_updated_at
BEFORE UPDATE ON public.operational_config
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
