-- Migration: Add Business Units to Payroll Runs
-- Created At: 2026-04-15
-- This migration updates the payroll_runs table to support the new Business Units filtering state 
-- introduced in the RunPayrollModal wizard.

alter table public.payroll_runs
add column if not exists business_units text[] default '{}'::text[];

-- Set a comment on the column for documentation purposes
comment on column public.payroll_runs.business_units is 'Stores an array of business unit names selected during the payroll run initiation.';
