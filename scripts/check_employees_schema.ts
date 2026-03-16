
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function checkSchema() {
    console.log('Fetching sample employee data...');
    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching employee:', error);
    } else {
        console.log('Employee columns and their typical values:');
        const sample = data[0] || {};
        Object.keys(sample).forEach(key => {
            console.log(`- ${key}: ${typeof sample[key]} (Example: ${sample[key]})`);
        });
    }
}

checkSchema();
