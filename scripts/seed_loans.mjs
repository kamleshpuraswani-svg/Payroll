import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://henqkdlhwyqhticafhbc.supabase.co';
const supabaseKey = 'sb_publishable_OmFIATdJ8irHSqPq_L0C-g_JpF85Ei8';
const supabase = createClient(supabaseUrl, supabaseKey);

const MOCK_LOANS = [
    {
        id: 'LN-001',
        employee: { name: 'Priya Sharma', id: 'TF00912', department: 'Engineering', ctc: '₹18.5 L', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        type: 'Salary Advance',
        requestedAmount: 50000,
        approvedAmount: 50000,
        requestDate: '18 Dec 2025',
        status: 'Approved',
        emiAmount: 10000,
        totalEmis: 5,
        remainingBalance: 50000,
        interestRate: 0,
        disbursedDate: '20 Dec 2025',
        reason: 'Medical Emergency',
        repaymentSchedule: [
            { emiNo: 1, dueDate: '31 Jan 2026', amount: 10000, status: 'Pending' },
            { emiNo: 2, dueDate: '28 Feb 2026', amount: 10000, status: 'Pending' },
            { emiNo: 3, dueDate: '31 Mar 2026', amount: 10000, status: 'Pending' },
            { emiNo: 4, dueDate: '30 Apr 2026', amount: 10000, status: 'Pending' },
            { emiNo: 5, dueDate: '31 May 2026', amount: 10000, status: 'Pending' },
        ]
    },
    {
        id: 'LN-002',
        employee: { name: 'Arjun Mehta', id: 'AC04567', department: 'Sales', ctc: '₹24.0 L', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        type: 'Loan',
        requestedAmount: 100000,
        approvedAmount: 100000,
        requestDate: '10 Dec 2025',
        status: 'Active',
        emiAmount: 8500,
        totalEmis: 12,
        remainingBalance: 68000,
        interestRate: 10.5,
        disbursedDate: '12 Dec 2025',
        reason: 'Home Renovation',
        repaymentSchedule: [
            { emiNo: 1, dueDate: '31 Dec 2025', amount: 8815, deductedDate: '31 Dec 2025', status: 'Paid' },
            { emiNo: 2, dueDate: '31 Jan 2026', amount: 8815, status: 'Pending' },
            { emiNo: 3, dueDate: '28 Feb 2026', amount: 8815, status: 'Pending' },
            { emiNo: 4, dueDate: '31 Mar 2026', amount: 8815, status: 'Pending' },
        ]
    },
    {
        id: 'LN-003',
        employee: { name: 'Neha Kapoor', id: 'SU00234', department: 'Product', ctc: '₹15.8 L', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        type: 'Loan',
        requestedAmount: 30000,
        requestDate: '15 Dec 2025',
        status: 'Pending',
        reason: 'Diwali Expenses',
        interestRate: 0,
        totalEmis: 12
    },
    {
        id: 'LN-004',
        employee: { name: 'Rohan Desai', id: 'GL07890', department: 'DevOps', ctc: '₹21.2 L', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        type: 'Salary Advance',
        requestedAmount: 40000,
        approvedAmount: 40000,
        requestDate: '05 Nov 2025',
        status: 'Closed',
        emiAmount: 20000,
        totalEmis: 2,
        remainingBalance: 0,
        interestRate: 0,
        disbursedDate: '06 Nov 2025',
        reason: 'Urgent Travel',
        repaymentSchedule: [
            { emiNo: 1, dueDate: '30 Nov 2025', amount: 20000, deductedDate: '30 Nov 2025', status: 'Paid' },
            { emiNo: 2, dueDate: '31 Dec 2025', amount: 20000, deductedDate: '31 Dec 2025', status: 'Paid' },
        ]
    },
    {
        id: 'LN-005',
        employee: { name: 'Ananya Patel', id: 'TF01145', department: 'QA', ctc: '₹14.7 L', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        type: 'Loan',
        requestedAmount: 80000,
        approvedAmount: 0,
        requestDate: '12 Dec 2025',
        status: 'Rejected',
        reason: 'Policy Violation: Probation Period',
        interestRate: 10,
        totalEmis: 24
    }
];

async function seed() {
    const { data: employees } = await supabase.from('employees').select('id, eid, name');
    
    // We only need 1 default employee id if there's a mismatch since this is a mock mapping
    const defaultEmp = employees[0];
    
    let count = 0;
    
    for (const loan of MOCK_LOANS) {
        // Try mapping by eid first, fallback to name mapping, fallback to default
        let emp = employees.find(e => e.eid === loan.employee.id);
        if (!emp) emp = employees.find(e => e.name.includes(loan.employee.name.split(' ')[0]));
        if (!emp) emp = defaultEmp;
        
        const payload = {
            id: 'd9e030ca-22e3-4c91-a64e-c4fc874' + Math.floor(Math.random() * 100000), // Random uuid-ish for mock sake, but db generates it automatically so we ignore it
            employee_id: emp.id,
            type: loan.type,
            requested_amount: loan.requestedAmount,
            approved_amount: loan.approvedAmount || null,
            request_date: loan.requestDate,
            status: loan.status,
            emi_amount: loan.emiAmount || null,
            total_emis: loan.totalEmis,
            remaining_balance: loan.remainingBalance || loan.requestedAmount,
            interest_rate: loan.interestRate,
            disbursed_date: loan.disbursedDate || null,
            reason: loan.reason,
            repayment_schedule: loan.repaymentSchedule || []
        };
        
        // delete id to use default gen_random_uuid
        delete payload.id;
        
        const { error } = await supabase.from('loan_requests').insert(payload);
        if (error) {
            console.error('Insert error for', loan.id, error);
        } else {
            count++;
        }
    }
    
    console.log(`Successfully seeded ${count} loans!`);
}

seed();
