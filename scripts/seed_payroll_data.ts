
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SEED_STRUCTURES = [
    {
        id: uuidv4(),
        name: 'Standard IT Structure 2025',
        description: 'Regular structure for FT employees',
        departments: ['Software Engineering', 'QA'],
        designations: ['Senior Engineer', 'DevOps Engineer', 'QA Lead'],
        status: 'Active',
        earnings: [
            { id: 'm1', name: 'Basic Salary', calculation: '50% of CTC', type: 'Fixed', taxStatus: 'Taxable' },
            { id: 'm2', name: 'House Rent Allowance', calculation: '50% of Basic', type: 'Fixed', taxStatus: 'Exempt' },
            { id: 'm3', name: 'Special Allowance', calculation: 'Balancing Figure', type: 'Fixed', taxStatus: 'Taxable' }
        ],
        deductions: [
            { id: 'd1', name: 'PF (Employee)', calculation: '12% of Basic', type: 'Variable', taxStatus: 'Tax Deductible' },
            { id: 'd2', name: 'Professional Tax', calculation: 'Slab Based', type: 'Variable', taxStatus: 'Tax Deductible' }
        ],
        benefits: [
            { id: 'b1', name: 'PF (Employer)', calculation: '12% of Basic', type: 'Fixed', taxStatus: 'Exempt' }
        ],
        reimbursements: []
    },
    {
        id: uuidv4(),
        name: 'Internship Stipend',
        description: 'Fixed stipend for interns',
        departments: ['Software Engineering', 'Product'],
        designations: ['Software Intern'],
        status: 'Active',
        earnings: [
            { id: 'm99', name: 'Stipend', calculation: 'Fixed', type: 'Fixed', taxStatus: 'Taxable' }
        ],
        deductions: [],
        benefits: [],
        reimbursements: []
    }
];

const SEED_EMPLOYEES = [
    {
        id: 'EMP001',
        name: 'Priya Sharma',
        eid: 'TF00912',
        company_id: 'COMP001',
        department: 'Software Engineering',
        location: 'Bangalore',
        ctc: '1500000',
        join_date: '2023-01-15',
        status: 'Active',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        salary_structure_id: SEED_STRUCTURES[0].id,
        effective_date: '2025-01-01'
    },
    {
        id: 'EMP002',
        name: 'Arjun Mehta',
        eid: 'AC04567',
        company_id: 'COMP001',
        department: 'QA',
        location: 'Mumbai',
        ctc: '1200000',
        join_date: '2023-03-20',
        status: 'Active',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        salary_structure_id: SEED_STRUCTURES[0].id,
        effective_date: '2025-01-01'
    },
    {
        id: 'EMP003',
        name: 'Neha Kapoor',
        eid: 'SU00234',
        company_id: 'COMP001',
        department: 'Product',
        location: 'Remote',
        ctc: '1800000',
        join_date: '2022-11-05',
        status: 'Active',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        salary_structure_id: SEED_STRUCTURES[0].id,
        effective_date: '2025-01-01'
    }
];

async function seed() {
    console.log('Seeding salary structures...');
    const structureMap: Record<string, string> = {};

    for (const structure of SEED_STRUCTURES) {
        // First try to find by name
        const { data: existing } = await supabase
            .from('salary_structures')
            .select('id')
            .eq('name', structure.name)
            .single();

        let structureId;
        if (existing) {
            structureId = existing.id;
            const { error: updateError } = await supabase
                .from('salary_structures')
                .update(structure)
                .eq('id', existing.id);
            if (updateError) console.error(`Error updating structure ${structure.name}:`, updateError);
        } else {
            const { data, error: insertError } = await supabase
                .from('salary_structures')
                .insert([structure])
                .select()
                .single();
            if (insertError) console.error(`Error inserting structure ${structure.name}:`, insertError);
            structureId = data?.id;
        }

        if (structureId) {
            structureMap[structure.name] = structureId;
            console.log(`Successfully seeded structure: ${structure.name} (${structureId})`);
        }
    }

    console.log('Seeding employees...');
    const itStructureId = structureMap['Standard IT Structure 2025'];

    const employeesToUpdate = SEED_EMPLOYEES.map(emp => ({
        ...emp,
        salary_structure_id: itStructureId || emp.salary_structure_id
    }));

    for (const employeeData of employeesToUpdate) {
        // Find existing employee by eid
        const { data: existingEmp } = await supabase
            .from('employees')
            .select('id')
            .eq('eid', employeeData.eid)
            .single();

        let result;
        if (existingEmp) {
            // Remove 'id' from employeeData to avoid trying to change it
            const { id, ...dataToUpdate } = employeeData;
            result = await supabase
                .from('employees')
                .update(dataToUpdate)
                .eq('id', existingEmp.id);
        } else {
            result = await supabase
                .from('employees')
                .insert([employeeData]);
        }

        if (result.error) {
            console.error(`Error seeding employee ${employeeData.name}:`, result.error);
        } else {
            console.log(`Successfully seeded employee: ${employeeData.name}`);
        }
    }
}

seed();
