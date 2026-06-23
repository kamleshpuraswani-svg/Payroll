-- SQL Migration to add consider_nps to salary_components table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.salary_components 
ADD COLUMN IF NOT EXISTS consider_nps boolean DEFAULT false;
