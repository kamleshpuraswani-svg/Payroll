-- SEED DUMMY DATA FOR TAX DECLARATIONS AND LOANS
-- Financial Year: 2025-26

-- 1. Dummy Tax Declarations
INSERT INTO public.tax_declarations (id, employee_id, employee_name, type, amount, approved_amount, submitted_date, status, regime, financial_year, last_modified_by)
VALUES 
('TD-001', 'TF00912', 'Priya Sharma', 'Section 80C', 150000, 150000, '2026-04-10', 'Approved', 'NEW', '2025-26', 'HR Manager'),
('TD-002', 'TF01145', 'Ananya Patel', 'Section 80D', 25000, 0, '2026-04-12', 'Pending', 'NEW', '2025-26', 'Ananya Patel'),
('TD-003', 'AC04567', 'Arjun Mehta', 'HRA', 240000, 200000, '2026-04-05', 'Approved', 'OLD', '2025-26', 'HR Manager'),
('TD-004', 'PX05678', 'Sneha Reddy', 'Section 80C', 85000, 0, '2026-04-13', 'Pending', 'NEW', '2025-26', 'Sneha Reddy'),
('TD-005', 'TF00912', 'Priya Sharma', 'Section 80D', 15000, 0, '2026-04-13', 'Pending', 'NEW', '2025-26', 'Priya Sharma');

-- 2. Dummy Employee Loans
INSERT INTO public.employee_loans (id, employee_id, loan_type, amount, interest_rate, tenure_months, status, repayment_month)
VALUES
('LN-001', 'TF00912', 'Salary Advance', 50000, 0, 5, 'active', 'May 2026'),
('LN-002', 'TF01145', 'Personal Loan', 200000, 10.5, 24, 'active', 'June 2026'),
('LN-003', 'AC04567', 'Salary Advance', 25000, 0, 2, 'pending', 'April 2026'),
('LN-004', 'PX05678', 'Education Loan', 500000, 8.0, 60, 'active', 'July 2026'),
('LN-005', 'TF00912', 'Home Loan', 2500000, 9.2, 180, 'active', 'August 2026');

-- 3. Audit Logs for Seed Action
INSERT INTO public.audit_logs (id, action, user_name, severity, timestamp_label)
VALUES (gen_random_uuid()::text, 'Seeded Dummy Tax Declarations and Loans', 'System Admin', 'Medium', timezone('utc'::text, now())::text);
