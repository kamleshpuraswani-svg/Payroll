import { Company, AuditLog, ApprovalItem, Employee, StatutoryReport, TaxDeclaration } from './types';

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'TF-1024',
    name: 'TechFlow Systems',
    plan: 'Enterprise',
    employees: 12500,
    status: 'Active',
    last_audit: '2 hours ago',
    business_unit: 'Digital Technology',
    last_payroll_run: '30 Nov 2025',
    industry: 'Technology'
  },
  {
    id: 'AC-1001',
    name: 'Acme Corp',
    plan: 'Pro',
    employees: 4560,
    status: 'Active',
    last_audit: '1 day ago',
    business_unit: 'Retail Banking',
    last_payroll_run: '28 Nov 2025',
    industry: 'Manufacturing'
  },
  {
    id: 'GL-1026',
    name: 'Global Logistics',
    plan: 'Enterprise',
    employees: 8900,
    status: 'Pending',
    last_audit: '3 days ago',
    business_unit: 'Supply Chain',
    last_payroll_run: '29 Nov 2025',
    industry: 'Logistics'
  },
  {
    id: 'SU-1027',
    name: 'StartUp Inc',
    plan: 'Basic',
    employees: 45,
    status: 'Suspended',
    last_audit: '1 week ago',
    business_unit: 'Product Innovation',
    last_payroll_run: '30 Nov 2025',
    industry: 'SaaS'
  },
  {
    id: 'PX-1098',
    name: 'PixelCraft Studio',
    plan: 'Pro',
    employees: 180,
    status: 'Active',
    last_audit: '5 hours ago',
    business_unit: 'Digital Technology',
    last_payroll_run: '30 Nov 2025',
    industry: 'Design'
  },
  {
    id: 'IN-1156',
    name: 'Innovate Solutions',
    plan: 'Pro',
    employees: 2340,
    status: 'Active',
    last_audit: '12 hours ago',
    business_unit: 'Strategic Consulting',
    last_payroll_run: '30 Nov 2025',
    industry: 'Consulting'
  },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'LOG-001', action: 'Modified Tax Bracket Configuration', user_name: 'Admin Sarah', timestamp: '10 mins ago', severity: 'High' },
  { id: 'LOG-002', action: 'Added New Client: Zenith Co.', user_name: 'Sales Team', timestamp: '45 mins ago', severity: 'Medium' },
  { id: 'LOG-003', action: 'System Backup Completed', user_name: 'System', timestamp: '2 hours ago', severity: 'Low' },
  { id: 'LOG-004', action: 'Updated Salary Component Rules', user_name: 'Admin Mike', timestamp: '4 hours ago', severity: 'High' },
  { id: 'LOG-005', action: 'User Permissions Updated', user_name: 'SuperAdmin', timestamp: 'Yesterday', severity: 'Medium' },
];

export const MOCK_APPROVALS: ApprovalItem[] = [
  {
    id: 'APP-001',
    employee_name: 'Priya Sharma',
    company_name: 'TechFlow Systems',
    type: 'Investment Declaration',
    submitted_time: '2 hrs ago',
    amount: '₹1,48,000',
    details: '80C',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'APP-002',
    employee_name: 'Arjun Mehta',
    company_name: 'Acme Corp',
    type: 'Reimbursement Claim',
    submitted_time: '5 hrs ago',
    amount: '₹12,400',
    details: 'Medical',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'APP-003',
    employee_name: 'Neha Kapoor',
    company_name: 'StartUp Inc',
    type: 'Tax Regime Change',
    submitted_time: '1 day ago',
    details: 'Old → New',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'APP-004',
    employee_name: 'Rohan Desai',
    company_name: 'Global Logistics',
    type: 'Bank Details Update',
    submitted_time: '1 day ago',
    details: 'HDFC A/c ****6789',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'APP-005',
    employee_name: 'Ananya Patel',
    company_name: 'TechFlow Systems',
    type: 'Reimbursement Claim',
    submitted_time: '2 days ago',
    amount: '₹8,900',
    details: 'LTA',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'APP-006',
    employee_name: 'Vikram Singh',
    company_name: 'Acme Corp',
    type: 'Investment Declaration',
    submitted_time: '3 days ago',
    amount: '₹1,50,000',
    details: '80C + 80D',
    avatar_url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'APP-007',
    employee_name: 'Sneha Reddy',
    company_name: 'PixelCraft Studio',
    type: 'Reimbursement Claim',
    submitted_time: '4 days ago',
    amount: '₹6,200',
    details: 'Telephone',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
];

export const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', first_name: 'Priya', last_name: 'Sharma', employee_id: 'TF00912', company_id: 'TF-1024', email: 'priya@techflow.com', department: 'Software Engineering', business_unit: 'Digital Technology', location: 'Digital Technology', ctc: '1850000', date_of_joining: '2023-01-12', status: 'Active', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: '2', first_name: 'Arjun', last_name: 'Mehta', employee_id: 'AC04567', company_id: 'AC-1001', email: 'arjun@acme.com', department: 'Sales', business_unit: 'Retail Banking', location: 'Retail Banking', ctc: '2400000', date_of_joining: '2024-03-03', status: 'Active', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: '3', first_name: 'Neha', last_name: 'Kapoor', employee_id: 'SU00234', company_id: 'SU-1027', email: 'neha@startup.com', department: 'Product', business_unit: 'Product Management', location: 'Product Management', ctc: '1580000', date_of_joining: '2025-11-22', status: 'New Joinee', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: '4', first_name: 'Rohan', last_name: 'Desai', employee_id: 'GL07890', company_id: 'GL-1026', email: 'rohan@globallogistics.com', department: 'DevOps', business_unit: 'Digital Technology', location: 'Digital Technology', ctc: '2120000', date_of_joining: '2022-04-17', status: 'Active', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: '5', first_name: 'Ananya', last_name: 'Patel', employee_id: 'TF01145', company_id: 'TF-1024', email: 'ananya@techflow.com', department: 'QA', business_unit: 'Wealth Management', location: 'Wealth Management', ctc: '1470000', date_of_joining: '2025-10-05', status: 'Active', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: '6', first_name: 'Vikram', last_name: 'Singh', employee_id: 'AC03987', company_id: 'AC-1001', email: 'vikram@acme.com', department: 'Finance', business_unit: 'Corporate Strategy', location: 'Corporate Strategy', ctc: '1900000', date_of_joining: '2021-12-01', status: 'On Notice', avatar_url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: '7', first_name: 'Sneha', last_name: 'Reddy', employee_id: 'PX05678', company_id: 'PX-1098', email: 'sneha@pixelcraft.com', department: 'Design', business_unit: 'Creative Services', location: 'Creative Services', ctc: '1640000', date_of_joining: '2025-02-14', status: 'Active', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: '8', first_name: 'Karan', last_name: 'Malhotra', employee_id: 'SU00821', company_id: 'SU-1027', email: 'karan@startup.com', department: 'Marketing', business_unit: 'Brand & Growth', location: 'Brand & Growth', ctc: '1250000', date_of_joining: '2025-11-30', status: 'Relieved', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
];

export const MOCK_STATUTORY_REPORTS: StatutoryReport[] = [
  {
    id: 'RPT-001',
    company_name: 'Acme Corp',
    report_type: 'Form 24Q (Q3)',
    due_date: '31 Dec 2025',
    days_remaining: 2,
    status: 'Critical',
    category: 'TDS'
  },
  {
    id: 'RPT-002',
    company_name: 'TechFlow Systems',
    report_type: 'PF ECR (Nov)',
    due_date: '02 Jan 2026',
    days_remaining: 4,
    status: 'Due Soon',
    category: 'PF'
  },
  {
    id: 'RPT-003',
    company_name: 'Global Logistics',
    report_type: 'ESI Return (Half-yearly)',
    due_date: '06 Jan 2026',
    days_remaining: 8,
    status: 'Due Soon',
    category: 'ESI'
  },
  {
    id: 'RPT-004',
    company_name: 'StartUp Inc',
    report_type: 'Maharashtra PT Return',
    due_date: '10 Jan 2026',
    days_remaining: 12,
    status: 'Upcoming',
    category: 'PT'
  },
  {
    id: 'RPT-005',
    company_name: 'PixelCraft Studio',
    report_type: 'Form 16 Part A',
    due_date: '15 May 2026',
    days_remaining: 135,
    status: 'Safe',
    category: 'TDS'
  }
];

export const MOCK_TAX_DECLARATIONS: TaxDeclaration[] = [
  {
    id: 'TX-001',
    employee_name: 'Priya Sharma',
    employee_id: 'TF00912',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    type: '80C',
    type_label: '80C Investments',
    amount: 150000,
    submitted_date: '10 Dec 2025',
    status: 'Pending',
    notes: 'LIC receipt pending',
    ctc: '₹18.5 L',
    regime: 'Old',
    proofs: [
      { id: 'p1', file_name: 'LIC_Receipt.pdf', file_type: 'pdf', size: '1.2 MB' },
      { id: 'p2', file_name: 'PPF_Statement.jpg', file_type: 'jpg', size: '850 KB' },
      { id: 'p3', file_name: 'ELSS_Cert.pdf', file_type: 'pdf', size: '2.1 MB' }
    ],
    breakdown: [
      { label: 'LIC Premium', amount: 80000 },
      { label: 'Mutual Funds (ELSS)', amount: 70000 }
    ]
  },
  {
    id: 'TX-002',
    employee_name: 'Arjun Mehta',
    employee_id: 'AC04567',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
    type: 'HRA',
    type_label: 'HRA Rent Receipts',
    amount: 240000,
    submitted_date: '08 Dec 2025',
    status: 'Approved',
    notes: '',
    ctc: '₹24.0 L',
    regime: 'Old',
    proofs: Array.from({ length: 12 }).map((_, i) => ({ id: `h${i}`, file_name: `Rent_Receipt_Month_${i + 1}.pdf`, file_type: 'pdf', size: '300 KB' })),
    breakdown: [
      { label: 'Annual Rent Paid', amount: 240000 }
    ]
  },
  {
    id: 'TX-003',
    employee_name: 'Neha Kapoor',
    employee_id: 'SU00234',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neha',
    type: '80D',
    type_label: '80D Medical Insurance',
    amount: 75000,
    submitted_date: '12 Dec 2025',
    status: 'Rejected',
    notes: 'Invalid policy document uploaded. Please upload a clear copy of the premium receipt.',
    ctc: '₹15.8 L',
    regime: 'New',
    proofs: [
      { id: 'm1', file_name: 'Policy_Invalid.jpg', file_type: 'jpg', size: '2.4 MB' }
    ],
    breakdown: [
      { label: 'Self & Spouse', amount: 25000 },
      { label: 'Parents (Senior Citizen)', amount: 50000 }
    ]
  },
  {
    id: 'TX-004',
    employee_name: 'Rohan Desai',
    employee_id: 'GL07890',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan',
    type: '80CCD',
    type_label: '80CCD NPS',
    amount: 50000,
    submitted_date: '05 Dec 2025',
    status: 'Pending',
    notes: '',
    ctc: '₹21.2 L',
    regime: 'New',
    proofs: [
      { id: 'n1', file_name: 'NPS_Contribution.pdf', file_type: 'pdf', size: '1.1 MB' }
    ],
    breakdown: [
      { label: 'Tier 1 Contribution', amount: 50000 }
    ]
  },
  {
    id: 'TX-005',
    employee_name: 'Ananya Patel',
    employee_id: 'TF01145',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
    type: '80G',
    type_label: '80G Donations',
    amount: 20000,
    submitted_date: '15 Dec 2025',
    status: 'Approved',
    notes: '',
    ctc: '₹14.7 L',
    regime: 'Old',
    proofs: [
      { id: 'g1', file_name: 'NGO_Receipt.pdf', file_type: 'pdf', size: '450 KB' }
    ],
    breakdown: [
      { label: 'Prime Minister Relief Fund', amount: 20000 }
    ]
  },
  {
    id: 'TX-006',
    employee_name: 'Vikram Singh',
    employee_id: 'AC03987',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
    type: '80C',
    type_label: '80C Investments',
    amount: 120000,
    submitted_date: '18 Dec 2025',
    status: 'Pending',
    notes: '',
    ctc: '₹19.0 L',
    regime: 'Old',
    proofs: [
      { id: 'v1', file_name: 'NSC_Cert.jpg', file_type: 'jpg', size: '1.8 MB' }
    ],
    breakdown: [
      { label: 'NSC Purchase', amount: 120000 }
    ]
  }
];