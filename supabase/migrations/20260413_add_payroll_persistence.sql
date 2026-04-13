-- Migration: Add Payroll Persistence
-- Created At: 2026-04-13

-- 1. Extend Employees Table
alter table public.employees 
add column if not exists payroll_status text default 'Eligible' check (payroll_status in ('Eligible', 'On Hold')),
add column if not exists hold_reason text;

-- 2. Payroll Runs Table
create table if not exists public.payroll_runs (
    id uuid default uuid_generate_v4() primary key,
    month text not null,
    year integer not null,
    status text default 'Draft' check (status in ('Draft', 'Processing', 'Completed')),
    created_at timestamp with time zone default now(),
    created_by text default 'HR Manager',
    company_id text references public.companies(id),
    unique(month, year, company_id)
);

-- 3. Payroll Adjustments Table
create table if not exists public.payroll_adjustments (
    id uuid default uuid_generate_v4() primary key,
    payroll_run_id uuid references public.payroll_runs(id) on delete cascade,
    employee_id text references public.employees(id),
    gross numeric default 0,
    bonus numeric default 0,
    arrears numeric default 0,
    loan_recovery numeric default 0,
    salary_advance_recovery numeric default 0,
    expense_reimbursement numeric default 0,
    lop numeric default 0,
    lop_reversal numeric default 0,
    other numeric default 0,
    proposed_tds numeric default 0,
    actual_tds numeric default 0,
    is_exit boolean default false,
    updated_at timestamp with time zone default now(),
    created_at timestamp with time zone default now(),
    unique(payroll_run_id, employee_id)
);

-- 4. Enable RLS
alter table public.payroll_runs enable row level security;
alter table public.payroll_adjustments enable row level security;

-- 5. RLS Policies
create policy "Allow all for public" on public.payroll_runs for all using (true) with check (true);
create policy "Allow all for public" on public.payroll_adjustments for all using (true) with check (true);

-- 6. Updated At Triggers
create trigger update_payroll_adjustments_updated_at before update on public.payroll_adjustments for each row execute procedure update_updated_at_column();
