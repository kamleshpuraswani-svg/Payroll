
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function check() {
    console.log('--- Checking salary_structures ---');
    const { data: sData, error: sError } = await supabase.from('salary_structures').select('*');
    if (sError) {
        console.log('Error salary_structures:', sError.message);
    } else {
        console.log('salary_structures: OK', sData);
    }

    console.log('\n--- Checking employees ---');
    const { data: eData, error: eError } = await supabase.from('employees').select('id, name, eid, salary_structure_id');
    if (eError) {
        console.log('Error employees:', eError.message);
    } else {
        console.log('employees: OK', eData);
    }
}

check();
