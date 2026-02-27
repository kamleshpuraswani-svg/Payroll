-- SUPABASE CONSOLIDATED SCHEMA
-- This script unifies all project tables, RLS policies, and triggers.

-- 0. Enable Extensions
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. Core Tables
-- ==========================================

-- Companies
create table if not exists public.companies (
  id text primary key,
  name text not null,
  plan text check (plan in ('Basic', 'Pro', 'Enterprise')),
  employees_count integer default 0,
  status text check (status in ('Active', 'Pending', 'Suspended')),
  last_audit text,
  location text,
  last_payroll_run text,
  industry text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Employees
create table if not exists public.employees (
  id text primary key,
  name text not null,
  eid text not null unique,
  company_name text,
  department text,
  location text,
  ctc text,
  join_date text,
  status text check (status in ('Active', 'New Joinee', 'On Notice', 'Relieved')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Audit Logs
create table if not exists public.audit_logs (
  id text primary key,
  action text not null,
  user_name text not null,
  severity text check (severity in ('Low', 'Medium', 'High')),
  timestamp_label text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Salary Components (NEW: Migrated from localStorage)
create table if not exists public.salary_components (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    type text check (type in ('Fixed Pay', 'Variable Pay')),
    calculation text,
    taxable text check (taxable in ('Fully Taxable', 'Partially Exempt', 'Fully Exempt', 'Tax Deductible')),
    status boolean default true,
    category text check (category in ('Earnings', 'Deductions', 'Benefits', 'Reimbursements')),
    amount_or_percent text,
    calc_method text check (calc_method in ('Flat', 'Percentage')),
    payslip_name text,
    frequency text check (frequency in ('One-time', 'Recurring')),
    consider_epf boolean default false,
    consider_esi boolean default false,
    effective_date date default current_date,
    deduction_type text check (deduction_type in ('Statutory', 'Non-Statutory')),
    show_in_payslip boolean default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- ==========================================
-- 2. Configuration & Settings
-- ==========================================

-- Operational Config
create table if not exists public.operational_config (
    id uuid default uuid_generate_v4() primary key,
    config_key text unique not null,
    config_value jsonb default '{}'::jsonb,
    updated_at timestamp with time zone default now(),
    created_at timestamp with time zone default now()
);

-- Tax Configurations
create table if not exists public.tax_configurations (
  id uuid default uuid_generate_v4() primary key,
  financial_year text not null,
  regime text not null check (regime in ('NEW', 'OLD')),
  slab_from numeric not null,
  slab_to numeric,
  rate numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Expense Settings
create table if not exists public.expense_settings (
    id uuid default uuid_generate_v4() primary key,
    deadline_claims_date integer default 5,
    receipt_mandatory_amount numeric default 200,
    allow_backdated_claims boolean default false,
    updated_at timestamp with time zone default now()
);

-- Expense Categories
create table if not exists public.expense_categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique,
    max_limit numeric default 0,
    status text default 'Active',
    description text,
    receipt_threshold numeric default 200,
    pro_rata boolean default false,
    applicable_to jsonb default '[]',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Document Templates (NEW: Consolidates all template types)
create table if not exists public.document_templates (
    id uuid default uuid_generate_v4() primary key,
    type text not null check (type in ('salary_slip', 'bank_disbursal', 'salary_annexure', 'fnf_settlement')),
    name text not null,
    bank_name text, -- Specific to bank disbursal
    status text default 'Draft',
    is_active boolean default true,
    content jsonb default '{}'::jsonb, -- Store sections, columns, headerConfig etc.
    settings jsonb default '{}'::jsonb,
    created_by text,
    last_updated_by text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- ==========================================
-- 3. Transactions & Requests
-- ==========================================

-- Tax Declarations
create table if not exists public.tax_declarations (
  id text primary key,
  employee_id text,
  employee_name text,
  type text,
  amount numeric,
  submitted_date text,
  status text,
  notes text,
  regime text,
  declaration_data jsonb default '{}'::jsonb,
  financial_year text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_updated_at timestamp with time zone default now()
);

-- Reimbursement Claims
create table if not exists public.reimbursement_claims (
    id text primary key,
    employee_id text,
    title text not null,
    category text not null,
    total_amount numeric default 0,
    status text default 'pending',
    items jsonb default '[]'::jsonb,
    approval_history jsonb default '[]'::jsonb,
    action_note text,
    submitted_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Employee Loans
create table if not exists public.employee_loans (
    id text primary key,
    employee_id text,
    loan_type text not null,
    amount numeric not null,
    interest_rate numeric,
    tenure_months integer,
    status text default 'active',
    repayment_schedule jsonb default '[]'::jsonb,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- ==========================================
-- 4. RLS Policies (Development Mode)
-- ==========================================

alter table public.companies enable row level security;
alter table public.employees enable row level security;
alter table public.audit_logs enable row level security;
alter table public.salary_components enable row level security;
alter table public.operational_config enable row level security;
alter table public.tax_configurations enable row level security;
alter table public.expense_settings enable row level security;
alter table public.expense_categories enable row level security;
alter table public.tax_declarations enable row level security;
alter table public.reimbursement_claims enable row level security;
alter table public.employee_loans enable row level security;
alter table public.document_templates enable row level security;

-- Public "Allow All" Policies
create policy "Allow all for public" on public.companies for all using (true) with check (true);
create policy "Allow all for public" on public.employees for all using (true) with check (true);
create policy "Allow all for public" on public.audit_logs for all using (true) with check (true);
create policy "Allow all for public" on public.salary_components for all using (true) with check (true);
create policy "Allow all for public" on public.operational_config for all using (true) with check (true);
create policy "Allow all for public" on public.tax_configurations for all using (true) with check (true);
create policy "Allow all for public" on public.expense_settings for all using (true) with check (true);
create policy "Allow all for public" on public.expense_categories for all using (true) with check (true);
create policy "Allow all for public" on public.tax_declarations for all using (true) with check (true);
create policy "Allow all for public" on public.reimbursement_claims for all using (true) with check (true);
create policy "Allow all for public" on public.employee_loans for all using (true) with check (true);
create policy "Allow all for public" on public.document_templates for all using (true) with check (true);

-- ==========================================
-- 5. Triggers & Functions
-- ==========================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_salary_components_updated_at before update on public.salary_components for each row execute procedure update_updated_at_column();
create trigger update_operational_config_updated_at before update on public.operational_config for each row execute procedure update_updated_at_column();
create trigger update_expense_categories_updated_at before update on public.expense_categories for each row execute procedure update_updated_at_column();
create trigger update_reimbursement_claims_updated_at before update on public.reimbursement_claims for each row execute procedure update_updated_at_column();
create trigger update_employee_loans_updated_at before update on public.employee_loans for each row execute procedure update_updated_at_column();
create trigger update_document_templates_updated_at before update on public.document_templates for each row execute procedure update_updated_at_column();
