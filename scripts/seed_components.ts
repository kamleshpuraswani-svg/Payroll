
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SEED_COMPONENTS = [
    {
        name: 'Basic',
        type: 'Fixed Pay',
        calculation: '50% of CTC',
        taxable: 'Fully Taxable',
        status: true,
        category: 'Earnings',
        amount_or_percent: '50',
        calc_method: 'Percentage',
        payslip_name: 'Basic',
        consider_epf: true,
        consider_esi: true,
        is_system: true,
        created_by: 'System'
    },
    {
        name: 'HRA',
        type: 'Fixed Pay',
        calculation: '40% of Basic',
        taxable: 'Partially Exempt',
        status: true,
        category: 'Earnings',
        amount_or_percent: '40',
        calc_method: 'Percentage',
        payslip_name: 'HRA',
        consider_epf: true,
        consider_esi: true,
        is_system: true,
        created_by: 'System'
    },
    {
        name: 'Provident Fund (Employee)',
        type: 'Variable Pay',
        calculation: '12% of Basic',
        taxable: 'Tax Deductible',
        status: true,
        category: 'Deductions',
        amount_or_percent: '12',
        calc_method: 'Percentage',
        payslip_name: 'EPF',
        deduction_type: 'Statutory',
        is_system: true,
        created_by: 'System'
    }
];

async function seed() {
    console.log('Seeding salary components...');
    for (const component of SEED_COMPONENTS) {
        const { error } = await supabase
            .from('salary_components')
            .upsert(component, { onConflict: 'name' });

        if (error) {
            console.error(`Error seeding ${component.name}:`, error);
        } else {
            console.log(`Successfully seeded ${component.name}`);
        }
    }
}

seed();
