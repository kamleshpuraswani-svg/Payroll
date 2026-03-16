-- SQL Migration to add missing columns to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS designation text,
ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'HR Manager',
ADD COLUMN IF NOT EXISTS last_updated_by text DEFAULT 'HR Manager';

-- Ensure CTC is a format that can handle numeric operations if needed, 
-- but we'll stick to text for now as per current schema observation, 
-- though the UI sends numbers. If it's currently text, it works.
