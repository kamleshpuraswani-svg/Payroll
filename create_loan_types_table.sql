-- Loan Types Table
create table if not exists public.loan_types (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    interest_rate numeric default 0,
    max_amount text,          -- Stored as string to support "2 months gross salary" etc.
    max_tenure integer default 12,
    status boolean default true,
    description text,
    approvers jsonb default '[]'::jsonb,
    repayment_month text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.loan_types enable row level security;

-- Drop Policy if it exists to avoid errors on multiple runs
drop policy if exists "Allow all for public" on public.loan_types;

-- Public "Allow All" Policy
create policy "Allow all for public" on public.loan_types for all using (true) with check (true);

-- Insert Dummy Data for Loan Types
-- Clear existing mock data before re-inserting to prevent duplicates
delete from public.loan_types;

insert into public.loan_types (name, interest_rate, max_amount, max_tenure, status, description, approvers) values
  ('Personal Loan', 10.5, '5,00,000', 24, true, 'Standard personal loan for employees.', '["Rajesh Kumar (Finance Head)", "Sunita Gupta (Director)"]'::jsonb),
  ('Festival Advance', 0, '20,000', 6, true, 'Special advance for festival expenses.', '["Amit Verma (Manager)"]'::jsonb),
  ('Salary Advance', 0, '2 months Gross Salary', 3, true, 'Advance against upcoming salary.', '["Kavita Sharma (HR)"]'::jsonb),
  ('Medical Advance', 0, '2,00,000', 12, true, 'For medical emergencies.', '[]'::jsonb),
  ('Education Loan Assistance', 6, '3,00,000', 36, true, 'For employee or children''s education.', '[]'::jsonb),
  ('Vehicle Advance', 8, '4,00,000', 48, false, 'For two-wheeler/four-wheeler purchase.', '[]'::jsonb),
  ('Relocation Advance', 0, '1,00,000', 12, true, 'For joining/transfer expenses.', '[]'::jsonb),
  ('Marriage Advance', 0, '1,50,000', 18, true, 'For employee''s/family marriage.', '[]'::jsonb);

-- Trigger for updated_at
-- This drops the trigger if it already exists, then creates it
drop trigger if exists update_loan_types_updated_at on public.loan_types;
create trigger update_loan_types_updated_at before update on public.loan_types for each row execute procedure update_updated_at_column();
