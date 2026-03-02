
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function checkRLS() {
    console.log('--- Checking RLS for employees ---');
    const { data: rlsData, error: rlsError } = await supabase.rpc('get_table_rls_status', { table_name: 'employees' });

    // If RPC fails (likely), try to query policies via public view
    const { data, error } = await supabase.from('employees').select('id').limit(1);
    console.log('Test query (id only):', { data, error });

    if (error && error.message.includes('permission denied')) {
        console.log('PERMISSION DENIED: RLS is likely blocking the query.');
    } else if (data && data.length === 0) {
        console.log('DATA EMPTY: Table is empty or filtered by RLS (using true/false policy).');
    }
}
checkRLS();
