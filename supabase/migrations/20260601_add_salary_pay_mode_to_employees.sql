-- Add salary_pay_mode column to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS salary_pay_mode TEXT DEFAULT 'Bank Transfer';
