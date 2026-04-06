-- RUN THIS IN SUPABASE SQL EDITOR TO ENHANCE THE TABLE SCHEMA

ALTER TABLE reimbursement_claims 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE reimbursement_claims 
ADD COLUMN IF NOT EXISTS approved_amount NUMERIC;

-- Optional: Comment on columns for clarity
COMMENT ON COLUMN reimbursement_claims.rejection_reason IS 'Reason for rejection or partial approval provided by HR';
COMMENT ON COLUMN reimbursement_claims.approved_amount IS 'Total amount approved if the claim is partially approved';
