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

-- Public "Allow All" Policy
create policy "Allow all for public" on public.tax_configurations for all using (true) with check (true);
