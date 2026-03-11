-- Add target columns to salary_components table
ALTER TABLE public.salary_components 
ADD COLUMN IF NOT EXISTS target_id text,
ADD COLUMN IF NOT EXISTS target_type text;

-- Add index for better filtering performance (optional but good practice)
CREATE INDEX IF NOT EXISTS idx_salary_components_target ON public.salary_components (target_id, target_type);
