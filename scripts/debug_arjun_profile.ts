
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function checkArjun() {
    const { data, error } = await supabase
        .from('employees')
        .select('name, department, designation, salary_structure_id')
        .eq('name', 'Arjun Mehta')
        .single();
    
    if (error) {
        console.error('Error fetching Arjun:', error);
        return;
    }

    console.log('Arjun Mehta Profile Details:');
    console.log(JSON.stringify(data, null, 2));

    const { data: structures, error: structError } = await supabase
        .from('salary_structures')
        .select('id, name, departments, designations, status')
        .eq('status', 'Active');
    
    if (structError) {
        console.error('Error fetching structures:', structError);
        return;
    }

    console.log('\nActive Salary Structures Mappings:');
    structures.forEach(s => {
        console.log(`- ${s.name} (${s.id})`);
        console.log(`  Depts: ${JSON.stringify(s.departments)}`);
        console.log(`  Desigs: ${JSON.stringify(s.designations)}`);
    });
}

checkArjun();
