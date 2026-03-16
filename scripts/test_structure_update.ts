
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function testUpdate() {
    // Get the first real structure
    const { data: structures } = await supabase.from('salary_structures').select('*').limit(1);
    
    if (!structures || structures.length === 0) {
        console.log('No structures found to update');
        return;
    }

    const structure = structures[0];
    const originalName = structure.name;
    const testName = originalName + ' (Updated)';

    console.log(`Updating structure ID: ${structure.id} from "${originalName}" to "${testName}"`);

    const { error } = await supabase
        .from('salary_structures')
        .update({ name: testName })
        .eq('id', structure.id);

    if (error) {
        console.error('Update failed:', error);
    } else {
        console.log('Update reported success. Verifying...');
        const { data: verified } = await supabase
            .from('salary_structures')
            .select('name')
            .eq('id', structure.id)
            .single();
        
        console.log(`Verified name in DB: "${verified?.name}"`);
        
        // Cleanup
        await supabase
            .from('salary_structures')
            .update({ name: originalName })
            .eq('id', structure.id);
        console.log('Restored original name.');
    }
}

testUpdate();
