-- Migration to add min_amount column to public.salary_components table
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'salary_components' AND column_name = 'min_amount'
    ) THEN
        ALTER TABLE public.salary_components ADD COLUMN min_amount text;
    END IF;
END $$;
