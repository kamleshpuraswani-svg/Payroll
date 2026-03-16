
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function checkSchema() {
    const { data: sample } = await supabase.from('salary_structures').select('*').limit(1);
    if (sample && sample.length > 0) {
        console.log('Columns found in salary_structures:');
        console.log(Object.keys(sample[0]).join(', '));
    } else {
        console.log('No data in salary_structures to check schema.');
    }
}

checkSchema();
