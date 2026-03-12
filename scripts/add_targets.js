import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function alterTables() {
    const query = `
        ALTER TABLE public.salary_components 
        ADD COLUMN IF NOT EXISTS target_id text,
        ADD COLUMN IF NOT EXISTS target_type text check (target_type in ('BusinessUnit', 'Paygroup'));

        ALTER TABLE public.salary_structures
        ADD COLUMN IF NOT EXISTS target_id text,
        ADD COLUMN IF NOT EXISTS target_type text check (target_type in ('BusinessUnit', 'Paygroup'));

        ALTER TABLE public.loan_types
        ADD COLUMN IF NOT EXISTS target_id text,
        ADD COLUMN IF NOT EXISTS target_type text check (target_type in ('BusinessUnit', 'Paygroup'));
    `;
    const { error } = await supabase.rpc('exec_sql', { query: query });
    if(error){
        console.error("RPC exec_sql error. Make sure an exec_sql rpc function exists, or run this via Supabase dashboard SQL editor:", error.message);
        console.log("SQL TO RUN:\n", query)
    } else {
        console.log("Tables altered successfully");
    }
}

alterTables();
