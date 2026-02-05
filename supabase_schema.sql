-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Companies Table
create table public.companies (
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

-- 2. Create Employees Table
create table public.employees (
  id text primary key,
  name text not null,
  eid text not null unique,
  company_name text, -- keeping basic text relationship for now to match mock
  department text,
  location text,
  ctc text,
  join_date text,
  status text check (status in ('Active', 'New Joinee', 'On Notice', 'Relieved')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Audit Logs Table
create table public.audit_logs (
  id text primary key,
  action text not null,
  user_name text not null,
  severity text check (severity in ('Low', 'Medium', 'High')),
  timestamp_label text, -- keeping the descriptive timestamp from mock
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Approvals Table
create table public.approvals (
  id text primary key,
  employee_name text,
  company_name text,
  type text,
  submitted_time text,
  amount text,
  details text,
  avatar_url text,
  status text default 'Pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Tax Declarations Table
create table public.tax_declarations (
  id text primary key,
  employee_id text,
  employee_name text,
  type text, -- 80C, 80D etc
  amount numeric,
  submitted_date text,
  status text,
  notes text,
  regime text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) but allow public access for now (Development Mode)
alter table public.companies enable row level security;
alter table public.employees enable row level security;
alter table public.audit_logs enable row level security;
alter table public.approvals enable row level security;
alter table public.tax_declarations enable row level security;

-- Create policies to allow all operations for anon (public) users for now
create policy "Allow all operations for public" on public.companies for all using (true) with check (true);
create policy "Allow all operations for public" on public.employees for all using (true) with check (true);
create policy "Allow all operations for public" on public.audit_logs for all using (true) with check (true);
create policy "Allow all operations for public" on public.approvals for all using (true) with check (true);
create policy "Allow all operations for public" on public.tax_declarations for all using (true) with check (true);


-- SEED DATA --

-- Insert Companies
insert into public.companies (id, name, plan, employees_count, status, last_audit, location, last_payroll_run, industry) values
('TF-1024', 'TechFlow Systems', 'Enterprise', 12500, 'Active', '2 hours ago', 'Bangalore', '30 Nov 2025', 'Technology'),
('AC-1001', 'Acme Corp', 'Pro', 4560, 'Active', '1 day ago', 'Mumbai', '28 Nov 2025', 'Manufacturing'),
('GL-1026', 'Global Logistics', 'Enterprise', 8900, 'Pending', '3 days ago', 'Pune', '29 Nov 2025', 'Logistics'),
('SU-1027', 'StartUp Inc', 'Basic', 45, 'Suspended', '1 week ago', 'Hyderabad', '30 Nov 2025', 'SaaS'),
('PX-1098', 'PixelCraft Studio', 'Pro', 180, 'Active', '5 hours ago', 'Bangalore', '30 Nov 2025', 'Design'),
('IN-1156', 'Innovate Solutions', 'Pro', 2340, 'Active', '12 hours ago', 'Chennai', '30 Nov 2025', 'Consulting');

-- Insert Employees
insert into public.employees (id, name, eid, company_name, department, location, ctc, join_date, status, avatar_url) values
('1', 'Priya Sharma', 'TF00912', 'TechFlow Systems', 'Software Engineering', 'Bangalore', '₹18.5 L', '12 Jan 2023', 'Active', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'),
('2', 'Arjun Mehta', 'AC04567', 'Acme Corp', 'Sales', 'Mumbai', '₹24.0 L', '03 Mar 2024', 'Active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'),
('3', 'Neha Kapoor', 'SU00234', 'StartUp Inc', 'Product', 'Hyderabad', '₹15.8 L', '22 Nov 2025', 'New Joinee', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'),
('4', 'Rohan Desai', 'GL07890', 'Global Logistics', 'DevOps', 'Pune', '₹21.2 L', '17 Apr 2022', 'Active', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'),
('5', 'Ananya Patel', 'TF01145', 'TechFlow Systems', 'QA', 'Chennai', '₹14.7 L', '05 Oct 2025', 'Active', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'),
('6', 'Vikram Singh', 'AC03987', 'Acme Corp', 'Finance', 'Delhi', '₹19.0 L', '01 Dec 2021', 'On Notice', 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'),
('7', 'Sneha Reddy', 'PX05678', 'PixelCraft Studio', 'Design', 'Bangalore', '₹16.4 L', '14 Feb 2025', 'Active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'),
('8', 'Karan Malhotra', 'SU00821', 'StartUp Inc', 'Marketing', 'Remote', '₹12.5 L', '30 Nov 2025', 'Relieved', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

-- Insert Audit Logs
insert into public.audit_logs (id, action, user_name, severity, timestamp_label) values
('LOG-001', 'Modified Tax Bracket Configuration', 'Admin Sarah', 'High', '10 mins ago'),
('LOG-002', 'Added New Client: Zenith Co.', 'Sales Team', 'Medium', '45 mins ago'),
('LOG-003', 'System Backup Completed', 'System', 'Low', '2 hours ago'),
('LOG-004', 'Updated Salary Component Rules', 'Admin Mike', 'High', '4 hours ago'),
('LOG-005', 'User Permissions Updated', 'SuperAdmin', 'Medium', 'Yesterday');

-- 6. Create Tax Configurations Table
create table if not exists public.tax_configurations (
  id uuid default uuid_generate_v4() primary key,
  financial_year text not null,
  regime text not null check (regime in ('NEW', 'OLD')),
  slab_from numeric not null,
  slab_to numeric, -- null implies 'and above'
  rate numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.tax_configurations enable row level security;

-- Create policy
create policy "Allow all operations for public" on public.tax_configurations for all using (true) with check (true);

-- Seed Data for Tax Configurations
insert into public.tax_configurations (financial_year, regime, slab_from, slab_to, rate) values
-- 2025-2026 NEW
('2025-2026', 'NEW', 0, 400000, 0),
('2025-2026', 'NEW', 400001, 800000, 5),
('2025-2026', 'NEW', 800001, 1200000, 10),
('2025-2026', 'NEW', 1200001, 1500000, 15),
('2025-2026', 'NEW', 1500001, 2000000, 20),
('2025-2026', 'NEW', 2000001, null, 30),
-- 2025-2026 OLD
('2025-2026', 'OLD', 0, 250000, 0),
('2025-2026', 'OLD', 250001, 500000, 5),
('2025-2026', 'OLD', 500001, 1000000, 20),
('2025-2026', 'OLD', 1000001, null, 30);

