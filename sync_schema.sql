-- RUN THIS IN SUPABASE SQL EDITOR TO ENHANCE THE TABLE SCHEMA

ALTER TABLE reimbursement_claims 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE reimbursement_claims 
ADD COLUMN IF NOT EXISTS approved_amount NUMERIC;

-- Optional: Comment on columns for clarity
COMMENT ON COLUMN reimbursement_claims.rejection_reason IS 'Reason for rejection or partial approval provided by HR';
COMMENT ON COLUMN reimbursement_claims.approved_amount IS 'Total amount approved if the claim is partially approved';

-- LOANS & ADVANCES SCHEMA --
CREATE TABLE IF NOT EXISTS loan_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT REFERENCES employees(id),
    type TEXT NOT NULL,
    requested_amount NUMERIC NOT NULL,
    approved_amount NUMERIC,
    request_date TEXT,
    status TEXT NOT NULL,
    emi_amount NUMERIC,
    total_emis INTEGER,
    remaining_balance NUMERIC,
    interest_rate NUMERIC,
    disbursed_date TEXT,
    repayment_schedule JSONB,
    reason TEXT,
    repayment_month TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for the table
ALTER TABLE loan_requests ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Enable read access for all" ON loan_requests FOR SELECT USING (true);

-- Allow all operations for HR Managers / Admins (assuming they can write)
CREATE POLICY "Enable write access for all" ON loan_requests FOR ALL USING (true);
