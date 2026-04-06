
export interface ClaimProof {
    id: string;
    name: string;
    type: 'pdf' | 'jpg' | 'png';
    size: string;
}

export interface ExpenseClaim {
    id: string;
    employee: {
        name: string;
        id: string;
        department: string;
        ctc: string;
        avatar: string;
    };
    category: string;
    amount: number;
    submittedDate: string;
    proofs: ClaimProof[];
    status: 'Pending' | 'Approved' | 'Partially Approved' | 'Rejected';
    approvedAmount?: number;
    requestedOn: string;
    createdByName: string;
    lastModifiedBy: string;
    lastModifiedByName: string;
    activityLog: { text: string; date: string }[];
    rejectionReason?: string;
    items?: any[];
    title?: string;
}

export const MOCK_CLAIMS: ExpenseClaim[] = [
    {
        id: 'EXP-001',
        employee: {
            name: 'Ananya Patel',
            id: 'TF01145',
            department: 'Finance',
            ctc: '₹14.5 L',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        },
        category: 'Medical',
        amount: 12400,
        submittedDate: '07 Apr 2026',
        proofs: [{ id: 'p1', name: 'Health_Invoice_A01.pdf', type: 'pdf', size: '1.2 MB' }],
        status: 'Pending',
        requestedOn: '07 Apr 2026, 10:30 AM',
        createdByName: 'Ananya Patel',
        lastModifiedBy: '07 Apr 2026, 10:30 AM',
        lastModifiedByName: 'Ananya Patel',
        activityLog: [{ text: 'Submitted by employee', date: '07 Apr 2026' }],
        items: [
            { id: 'it1', category: 'Medical', expenseDate: '2026-04-05', merchant: 'Apollo Pharmacy', amount: 4500, reason: 'Prescribed Medicines' },
            { id: 'it2', category: 'Medical', expenseDate: '2026-04-06', merchant: 'Care Hospital', amount: 7900, reason: 'Consultation & Tests' }
        ]
    },
    {
        id: 'EXP-002',
        employee: {
            name: 'Priya Sharma',
            id: 'TF00912',
            department: 'Sales',
            ctc: '₹24.0 L',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        },
        category: 'Travel',
        amount: 8500,
        submittedDate: '06 Apr 2026',
        proofs: [{ id: 'p2', name: 'Uber_Reciept_Travel.pdf', type: 'pdf', size: '450 KB' }],
        status: 'Partially Approved',
        approvedAmount: 6000,
        requestedOn: '06 Apr 2026, 02:15 PM',
        createdByName: 'Priya Sharma',
        lastModifiedBy: '06 Apr 2026, 04:30 PM',
        lastModifiedByName: 'HR Manager',
        activityLog: [
            { text: 'Submitted by employee', date: '06 Apr 2026' },
            { text: 'Partially approved: Policy limit on travel exceeded', date: '06 Apr 2026' }
        ],
        items: [
            { id: 'it3', category: 'Travel', expenseDate: '2026-04-04', merchant: 'Uber', amount: 2500, approvedAmount: 2500, reason: 'Client Visit' },
            { id: 'it4', category: 'Travel', expenseDate: '2026-04-05', merchant: 'Indigo Air', amount: 6000, approvedAmount: 3500, reason: 'Conference Travel' }
        ]
    },
    {
        id: 'EXP-003',
        employee: {
            name: 'Arjun Mehta',
            id: 'AC04567',
            department: 'Marketing',
            ctc: '₹18.0 L',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        },
        category: 'Broadband',
        amount: 2200,
        submittedDate: '05 Apr 2026',
        proofs: [{ id: 'p3', name: 'Internet_Bill_Mar.pdf', type: 'pdf', size: '280 KB' }],
        status: 'Approved',
        requestedOn: '05 Apr 2026, 09:45 AM',
        createdByName: 'Arjun Mehta',
        lastModifiedBy: '05 Apr 2026, 11:30 AM',
        lastModifiedByName: 'HR Manager',
        activityLog: [
            { text: 'Submitted by employee', date: '05 Apr 2026' },
            { text: 'Approved by HR', date: '05 Apr 2026' }
        ],
        items: [
            { id: 'it5', category: 'Broadband', expenseDate: '2026-03-31', merchant: 'Jio Fiber', amount: 2200, approvedAmount: 2200, reason: 'WFH Internet Connectivity' }
        ]
    },
    {
        id: 'EXP-004',
        employee: {
            name: 'Sneha Reddy',
            id: 'PX05678',
            department: 'HR',
            ctc: '₹12.0 L',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        },
        category: 'Books',
        amount: 4800,
        submittedDate: '04 Apr 2026',
        proofs: [{ id: 'p4', name: 'Amazon_Invoice_Books.pdf', type: 'pdf', size: '320 KB' }],
        status: 'Pending',
        requestedOn: '04 Apr 2026, 03:20 PM',
        createdByName: 'Sneha Reddy',
        lastModifiedBy: '04 Apr 2026, 03:20 PM',
        lastModifiedByName: 'Sneha Reddy',
        activityLog: [{ text: 'Submitted by employee', date: '04 Apr 2026' }],
        items: [
            { id: 'it6', category: 'Books', expenseDate: '2026-04-02', merchant: 'Amazon', amount: 4800, reason: 'Leadership Development Training Manuals' }
        ]
    },
    {
        id: 'EXP-005',
        employee: {
            name: 'Vikram Singh',
            id: 'AC03987',
            department: 'Operations',
            ctc: '₹16.5 L',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        },
        category: 'Meal',
        amount: 1200,
        submittedDate: '03 Apr 2026',
        proofs: [{ id: 'p5', name: 'Restaurant_Bill.pdf', type: 'pdf', size: '150 KB' }],
        status: 'Rejected',
        requestedOn: '03 Apr 2026, 01:50 PM',
        createdByName: 'Vikram Singh',
        lastModifiedBy: '03 Apr 2026, 04:40 PM',
        lastModifiedByName: 'HR Manager',
        activityLog: [
            { text: 'Submitted by employee', date: '03 Apr 2026' },
            { text: 'Rejected: Personal meal, not as per company policy', date: '03 Apr 2026' }
        ],
        rejectionReason: 'Personal meal, not as per company policy',
        items: [
            { id: 'it7', category: 'Meal', expenseDate: '2026-04-01', merchant: 'Starbucks', amount: 1200, reason: 'Personal refreshment' }
        ]
    }
];
