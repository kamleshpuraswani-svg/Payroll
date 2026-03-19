
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkOperationalConfig() {
  const { data, error } = await supabase
    .from('operational_config')
    .select('*')
    .eq('config_key', 'pay_schedules')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('--- Operational Config (pay_schedules) ---');
  console.log(JSON.stringify(data.config_value, null, 2));
}

checkOperationalConfig();
