-- Migration: Complete Application Synchronization Schema
-- Created At: 2026-04-13

-- 1. Payslips Table
create table if not exists public.payslips (
    id uuid default uuid_generate_v4() primary key,
    employee_id text references public.employees(id),
    payroll_run_id uuid references public.payroll_runs(id),
    month text not null,
    year text not null,
    credited_date date default current_date,
    net_pay numeric not null,
    net_pay_words text,
    trend text check (trend in ('up', 'down', 'flat')),
    total_working_days integer,
    processed_days integer,
    earnings jsonb default '[]'::jsonb,
    deductions jsonb default '[]'::jsonb,
    reimbursements jsonb default '[]'::jsonb,
    tax_donut jsonb default '[]'::jsonb,
    pdf_url text,
    created_at timestamp with time zone default now(),
    unique(employee_id, month, year)
);

-- 2. Document Templates enhancement (if not fully covered)
-- The existing document_templates table is already quite flexible, 
-- but we ensure RLS is correctly set.

-- 3. Enable RLS
alter table public.payslips enable row level security;

-- 4. RLS Policies
create policy "Allow all for public" on public.payslips for all using (true) with check (true);

-- 5. Audit Log for sync initiation
insert into public.audit_logs (id, action, user_name, severity, timestamp_label)
values (
    uuid_generate_v4(), 
    'Database Sync Schema Completed', 
    'System', 
    'Medium', 
    now()::text
);
