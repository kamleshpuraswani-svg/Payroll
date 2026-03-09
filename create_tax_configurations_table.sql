-- Tax Configurations Table
create table if not exists public.tax_configurations (
  id uuid default uuid_generate_v4() primary key,
  financial_year text not null,
  regime text not null check (regime in ('NEW', 'OLD')),
  slab_from numeric not null,
  slab_to numeric,
  rate numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.tax_configurations enable row level security;

-- Drop Policy if it exists to avoid errors on multiple runs
drop policy if exists "Allow all for public" on public.tax_configurations;

-- Public "Allow All" Policy
create policy "Allow all for public" on public.tax_configurations for all using (true) with check (true);

-- Clear existing mock data before re-inserting to prevent duplicates
delete from public.tax_configurations where financial_year in ('2025-2026', '2024-2025', '2023-2024');

-- Insert Dummy Data for Previous Financial Years
insert into public.tax_configurations (financial_year, regime, slab_from, slab_to, rate) values
  -- FY 2025-2026 (NEW)
  ('2025-2026', 'NEW', 0, 400000, 0),
  ('2025-2026', 'NEW', 400001, 800000, 5),
  ('2025-2026', 'NEW', 800001, 1200000, 10),
  ('2025-2026', 'NEW', 1200001, 1500000, 15),
  ('2025-2026', 'NEW', 1500001, 2000000, 20),
  ('2025-2026', 'NEW', 2000001, null, 30),
  -- FY 2025-2026 (OLD)
  ('2025-2026', 'OLD', 0, 250000, 0),
  ('2025-2026', 'OLD', 250001, 500000, 5),
  ('2025-2026', 'OLD', 500001, 1000000, 20),
  ('2025-2026', 'OLD', 1000001, null, 30),

  -- FY 2024-2025 (NEW)
  ('2024-2025', 'NEW', 0, 300000, 0),
  ('2024-2025', 'NEW', 300001, 600000, 5),
  ('2024-2025', 'NEW', 600001, 900000, 10),
  ('2024-2025', 'NEW', 900001, 1200000, 15),
  ('2024-2025', 'NEW', 1200001, 1500000, 20),
  ('2024-2025', 'NEW', 1500001, null, 30),
  -- FY 2024-2025 (OLD)
  ('2024-2025', 'OLD', 0, 250000, 0),
  ('2024-2025', 'OLD', 250001, 500000, 5),
  ('2024-2025', 'OLD', 500001, 1000000, 20),
  ('2024-2025', 'OLD', 1000001, null, 30),

  -- FY 2023-2024 (NEW)
  ('2023-2024', 'NEW', 0, 250000, 0),
  ('2023-2024', 'NEW', 250001, 500000, 5),
  ('2023-2024', 'NEW', 500001, 750000, 10),
  ('2023-2024', 'NEW', 750001, 1000000, 15),
  ('2023-2024', 'NEW', 1000001, 1250000, 20),
  ('2023-2024', 'NEW', 1250001, 1500000, 25),
  ('2023-2024', 'NEW', 1500001, null, 30),
  -- FY 2023-2024 (OLD)
  ('2023-2024', 'OLD', 0, 250000, 0),
  ('2023-2024', 'OLD', 250001, 500000, 5),
  ('2023-2024', 'OLD', 500001, 750000, 10),
  ('2023-2024', 'OLD', 750001, 1000000, 15),
  ('2023-2024', 'OLD', 1000001, 1250000, 20),
  ('2023-2024', 'OLD', 1250001, 1500000, 25),
  ('2023-2024', 'OLD', 1500001, null, 30);
