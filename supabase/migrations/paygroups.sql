-- Create paygroups table
CREATE TABLE IF NOT EXISTS paygroups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    business_units TEXT[] DEFAULT '{}',
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by TEXT DEFAULT 'HR Manager'
);

-- Add RLS (Row Level Security) if needed - assuming public for now as per other tables in this project
ALTER TABLE paygroups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON paygroups FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON paygroups FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON paygroups FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON paygroups FOR DELETE USING (true);
