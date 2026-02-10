import { Company, AuditLog, ApprovalItem, Employee, StatutoryReport, TaxDeclaration } from './types';

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'TF-1024',
    name: 'TechFlow Systems',
    plan: 'Enterprise',
    employees: 12500,
    status: 'Active',
    lastAudit: '2 hours ago',
    businessUnit: 'Digital Technology',
    lastPayrollRun: '30 Nov 2025',
    industry: 'Technology'
  },
  {
    id: 'AC-1001',
    name: 'Acme Corp',
    plan: 'Pro',
    employees: 4560,
    status: 'Active',
    lastAudit: '1 day ago',
    businessUnit: 'Retail Banking',
    lastPayrollRun: '28 Nov 2025',
    industry: 'Manufacturing'
  },
  {
    id: 'GL-1026',
    name: 'Global Logistics',
    plan: 'Enterprise',
    employees: 8900,
    status: 'Pending',
    lastAudit: '3 days ago',
    businessUnit: 'Supply Chain',
    lastPayrollRun: '29 Nov 2025',
    industry: 'Logistics'
  },
  {
    id: 'SU-1027',
    name: 'StartUp Inc',
    plan: 'Basic',
    employees: 45,
    status: 'Suspended',
    lastAudit: '1 week ago',
    businessUnit: 'Product Innovation',
    lastPayrollRun: '30 Nov 2025',
    industry: 'SaaS'
  },
  {
    id: 'PX-1098',
    name: 'PixelCraft Studio',
    plan: 'Pro',
    employees: 180,
    status: 'Active',
    lastAudit: '5 hours ago',
    businessUnit: 'Digital Technology',
    lastPayrollRun: '30 Nov 2025',
    industry: 'Design'
  },
  {
    id: 'IN-1156',
    name: 'Innovate Solutions',
    plan: 'Pro',
    employees: 2340,
    status: 'Active',
    lastAudit: '12 hours ago',
    businessUnit: 'Strategic Consulting',
    lastPayrollRun: '30 Nov 2025',
    industry: 'Consulting'
  },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'LOG-001', action: 'Modified Tax Bracket Configuration', user: 'Admin Sarah', timestamp: '10 mins ago', severity: 'High' },
  { id: 'LOG-002', action: 'Added New Client: Zenith Co.', user: 'Sales Team', timestamp: '45 mins ago', severity: 'Medium' },
  { id: 'LOG-003', action: 'System Backup Completed', user: 'System', timestamp: '2 hours ago', severity: 'Low' },
  { id: 'LOG-004', action: 'Updated Salary Component Rules', user: 'Admin Mike', timestamp: '4 hours ago', severity: 'High' },
  { id: 'LOG-005', action: 'User Permissions Updated', user: 'SuperAdmin', timestamp: 'Yesterday', severity: 'Medium' },
];

export const MOCK_APPROVALS: ApprovalItem[] = [
  {
    id: 'APP-001',
    employeeName: 'Priya Sharma',
    companyName: 'TechFlow Systems',
    type: 'Investment Declaration',
    submittedTime: '2 hrs ago',
    amount: '₹1,48,000',
    details: '80C',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'APP-002',
    employeeName: 'Arjun Mehta',
    companyName: 'Acme Corp',
    type: 'Reimbursement Claim',
    submittedTime: '5 hrs ago',
    amount: '₹12,400',
    details: 'Medical',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'APP-003',
    employeeName: 'Neha Kapoor',
    companyName: 'StartUp Inc',
    type: 'Tax Regime Change',
    submittedTime: '1 day ago',
    details: 'Old → New',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'APP-004',
    employeeName: 'Rohan Desai',
    companyName: 'Global Logistics',
    type: 'Bank Details Update',
    submittedTime: '1 day ago',
    details: 'HDFC A/c ****6789',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'APP-005',
    employeeName: 'Ananya Patel',
    companyName: 'TechFlow Systems',
    type: 'Reimbursement Claim',
    submittedTime: '2 days ago',
    amount: '₹8,900',
    details: 'LTA',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'APP-006',
    employeeName: 'Vikram Singh',
    companyName: 'Acme Corp',
    type: 'Investment Declaration',
    submittedTime: '3 days ago',
    amount: '₹1,50,000',
    details: '80C + 80D',
    avatarUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: 'APP-007',
    employeeName: 'Sneha Reddy',
    companyName: 'PixelCraft Studio',
    type: 'Reimbursement Claim',
    submittedTime: '4 days ago',
    amount: '₹6,200',
    details: 'Telephone',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
];

export const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Priya Sharma', eid: 'TF00912', company: 'TechFlow Systems', department: 'Software Engineering', businessUnit: 'Digital Technology', ctc: '₹18.5 L', joinDate: '12 Jan 2023', status: 'Active', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: '2', name: 'Arjun Mehta', eid: 'AC04567', company: 'Acme Corp', department: 'Sales', businessUnit: 'Retail Banking', ctc: '₹24.0 L', joinDate: '03 Mar 2024', status: 'Active', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: '3', name: 'Neha Kapoor', eid: 'SU00234', company: 'StartUp Inc', department: 'Product', businessUnit: 'Product Management', ctc: '₹15.8 L', joinDate: '22 Nov 2025', status: 'New Joinee', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: '4', name: 'Rohan Desai', eid: 'GL07890', company: 'Global Logistics', department: 'DevOps', businessUnit: 'Digital Technology', ctc: '₹21.2 L', joinDate: '17 Apr 2022', status: 'Active', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: '5', name: 'Ananya Patel', eid: 'TF01145', company: 'TechFlow Systems', department: 'QA', businessUnit: 'Wealth Management', ctc: '₹14.7 L', joinDate: '05 Oct 2025', status: 'Active', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: '6', name: 'Vikram Singh', eid: 'AC03987', company: 'Acme Corp', department: 'Finance', businessUnit: 'Corporate Strategy', ctc: '₹19.0 L', joinDate: '01 Dec 2021', status: 'On Notice', avatarUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: '7', name: 'Sneha Reddy', eid: 'PX05678', company: 'PixelCraft Studio', department: 'Design', businessUnit: 'Creative Services', ctc: '₹16.4 L', joinDate: '14 Feb 2025', status: 'Active', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  { id: '8', name: 'Karan Malhotra', eid: 'SU00821', company: 'StartUp Inc', department: 'Marketing', businessUnit: 'Brand & Growth', ctc: '₹12.5 L', joinDate: '30 Nov 2025', status: 'Relieved', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
];

export const MOCK_STATUTORY_REPORTS: StatutoryReport[] = [
  {
    id: 'RPT-001',
    companyName: 'Acme Corp',
    reportType: 'Form 24Q (Q3)',
    dueDate: '31 Dec 2025',
    daysRemaining: 2,
    status: 'Critical',
    category: 'TDS'
  },
  {
    id: 'RPT-002',
    companyName: 'TechFlow Systems',
    reportType: 'PF ECR (Nov)',
    dueDate: '02 Jan 2026',
    daysRemaining: 4,
    status: 'Due Soon',
    category: 'PF'
  },
  {
    id: 'RPT-003',
    companyName: 'Global Logistics',
    reportType: 'ESI Return (Half-yearly)',
    dueDate: '06 Jan 2026',
    daysRemaining: 8,
    status: 'Due Soon',
    category: 'ESI'
  },
  {
    id: 'RPT-004',
    companyName: 'StartUp Inc',
    reportType: 'Maharashtra PT Return',
    dueDate: '10 Jan 2026',
    daysRemaining: 12,
    status: 'Upcoming',
    category: 'PT'
  },
  {
    id: 'RPT-005',
    companyName: 'PixelCraft Studio',
    reportType: 'Form 16 Part A',
    dueDate: '15 May 2026',
    daysRemaining: 135,
    status: 'Safe',
    category: 'TDS'
  }
];

export const MOCK_TAX_DECLARATIONS: TaxDeclaration[] = [
  {
    id: 'TX-001',
    employeeName: 'Priya Sharma',
    employeeId: 'TF00912',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    type: '80C',
    typeLabel: '80C Investments',
    amount: 150000,
    submittedDate: '10 Dec 2025',
    status: 'Pending',
    notes: 'LIC receipt pending',
    ctc: '₹18.5 L',
    regime: 'Old',
    proofs: [
      { id: 'p1', fileName: 'LIC_Receipt.pdf', fileType: 'pdf', size: '1.2 MB' },
      { id: 'p2', fileName: 'PPF_Statement.jpg', fileType: 'jpg', size: '850 KB' },
      { id: 'p3', fileName: 'ELSS_Cert.pdf', fileType: 'pdf', size: '2.1 MB' }
    ],
    breakdown: [
      { label: 'LIC Premium', amount: 80000 },
      { label: 'Mutual Funds (ELSS)', amount: 70000 }
    ]
  },
  {
    id: 'TX-002',
    employeeName: 'Arjun Mehta',
    employeeId: 'AC04567',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
    type: 'HRA',
    typeLabel: 'HRA Rent Receipts',
    amount: 240000,
    submittedDate: '08 Dec 2025',
    status: 'Approved',
    notes: '',
    ctc: '₹24.0 L',
    regime: 'Old',
    proofs: Array.from({ length: 12 }).map((_, i) => ({ id: `h${i}`, fileName: `Rent_Receipt_Month_${i + 1}.pdf`, fileType: 'pdf', size: '300 KB' })),
    breakdown: [
      { label: 'Annual Rent Paid', amount: 240000 }
    ]
  },
  {
    id: 'TX-003',
    employeeName: 'Neha Kapoor',
    employeeId: 'SU00234',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neha',
    type: '80D',
    typeLabel: '80D Medical Insurance',
    amount: 75000,
    submittedDate: '12 Dec 2025',
    status: 'Rejected',
    notes: 'Invalid policy document uploaded. Please upload a clear copy of the premium receipt.',
    ctc: '₹15.8 L',
    regime: 'New',
    proofs: [
      { id: 'm1', fileName: 'Policy_Invalid.jpg', fileType: 'jpg', size: '2.4 MB' }
    ],
    breakdown: [
      { label: 'Self & Spouse', amount: 25000 },
      { label: 'Parents (Senior Citizen)', amount: 50000 }
    ]
  },
  {
    id: 'TX-004',
    employeeName: 'Rohan Desai',
    employeeId: 'GL07890',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan',
    type: '80CCD',
    typeLabel: '80CCD NPS',
    amount: 50000,
    submittedDate: '05 Dec 2025',
    status: 'Pending',
    notes: '',
    ctc: '₹21.2 L',
    regime: 'New',
    proofs: [
      { id: 'n1', fileName: 'NPS_Contribution.pdf', fileType: 'pdf', size: '1.1 MB' }
    ],
    breakdown: [
      { label: 'Tier 1 Contribution', amount: 50000 }
    ]
  },
  {
    id: 'TX-005',
    employeeName: 'Ananya Patel',
    employeeId: 'TF01145',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
    type: '80G',
    typeLabel: '80G Donations',
    amount: 20000,
    submittedDate: '15 Dec 2025',
    status: 'Approved',
    notes: '',
    ctc: '₹14.7 L',
    regime: 'Old',
    proofs: [
      { id: 'g1', fileName: 'NGO_Receipt.pdf', fileType: 'pdf', size: '450 KB' }
    ],
    breakdown: [
      { label: 'Prime Minister Relief Fund', amount: 20000 }
    ]
  },
  {
    id: 'TX-006',
    employeeName: 'Vikram Singh',
    employeeId: 'AC03987',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
    type: '80C',
    typeLabel: '80C Investments',
    amount: 120000,
    submittedDate: '18 Dec 2025',
    status: 'Pending',
    notes: '',
    ctc: '₹19.0 L',
    regime: 'Old',
    proofs: [
      { id: 'v1', fileName: 'NSC_Cert.jpg', fileType: 'jpg', size: '1.8 MB' }
    ],
    breakdown: [
      { label: 'NSC Purchase', amount: 120000 }
    ]
  }
];