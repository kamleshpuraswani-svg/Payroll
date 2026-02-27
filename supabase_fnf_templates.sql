-- Create F&F Settlement Templates Table
CREATE TABLE IF NOT EXISTS public.fnf_settlement_templates (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  status text CHECK (status IN ('Published', 'Draft')),
  created_by text NOT NULL,
  last_updated_by text NOT NULL,
  is_active boolean DEFAULT true,
  sections jsonb NOT NULL,
  settings jsonb NOT NULL,
  header_config jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.fnf_settlement_templates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for public (matching existing patterns)
CREATE POLICY "Allow all operations for public" ON public.fnf_settlement_templates FOR ALL USING (true) WITH CHECK (true);
