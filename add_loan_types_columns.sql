-- Migration to add missing columns to loan_types table
-- This script ensures the loan_types table has all the columns needed for the new UI and logic.

DO $$ 
BEGIN 
    -- 1. Change max_amount to text if it's numeric
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'loan_types' AND column_name = 'max_amount' AND data_type = 'numeric'
    ) THEN
        ALTER TABLE public.loan_types ALTER COLUMN max_amount TYPE text;
    END IF;

    -- 2. Add description column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_types' AND column_name = 'description') THEN
        ALTER TABLE public.loan_types ADD COLUMN description text;
    END IF;

    -- 3. Add approvers column if missing (Array of strings)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_types' AND column_name = 'approvers') THEN
        ALTER TABLE public.loan_types ADD COLUMN approvers text[] DEFAULT '{}';
    END IF;

    -- 4. Add repayment_month column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_types' AND column_name = 'repayment_month') THEN
        ALTER TABLE public.loan_types ADD COLUMN repayment_month text;
    END IF;

    -- 5. Add max_tenure column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_types' AND column_name = 'max_tenure') THEN
        ALTER TABLE public.loan_types ADD COLUMN max_tenure integer DEFAULT 0;
    END IF;

    -- 6. Add status column if missing (Sync with is_active if needed)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_types' AND column_name = 'status') THEN
        ALTER TABLE public.loan_types ADD COLUMN status boolean DEFAULT true;
    END IF;

    -- 7. Add target_id and target_type columns for scoping
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_types' AND column_name = 'target_id') THEN
        ALTER TABLE public.loan_types ADD COLUMN target_id text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_types' AND column_name = 'target_type') THEN
        ALTER TABLE public.loan_types ADD COLUMN target_type text;
    END IF;

    -- 8. Add eligibility_statuses column (The NEW feature)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loan_types' AND column_name = 'eligibility_statuses') THEN
        ALTER TABLE public.loan_types ADD COLUMN eligibility_statuses text[] DEFAULT '{}';
    END IF;

END $$;
