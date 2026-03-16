
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function checkDetails() {
    console.log('--- Checking RLS Policies ---');
    const { data: rls, error: rlsError } = await supabase.rpc('get_policies', { table_name: 'employees' });
    if (rlsError) {
        console.log('Could not fetch policies via RPC, trying direct query on pg_policies if possible (usually not allowed via anon key)');
    } else {
        console.log(JSON.stringify(rls, null, 2));
    }

    console.log('\n--- Checking Table Constraints & Required Columns ---');
    // We can try to get column info from information_schema via a custom RPC if it exists, 
    // but since we don't have one, we'll try to insert a dummy record and catch the error for details.
    
    const { data, error } = await supabase
        .from('employees')
        .insert([{ name: 'Test Dummy' }])
        .select();

    if (error) {
        console.log('Error output for insight:', error.message);
        console.log('Error code:', error.code);
        console.log('Error detail:', (error as any).details);
    } else {
        console.log('Insert succeeded, cleaning up...');
        await supabase.from('employees').delete().eq('id', data[0].id);
    }
}

checkDetails();
