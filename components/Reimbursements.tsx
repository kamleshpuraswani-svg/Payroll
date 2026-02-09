
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, X, Calendar, CheckCircle, Clock, AlertCircle, Filter, ChevronDown } from 'lucide-react';
import { Dashboard } from './reimbursements/Dashboard';
import { ClaimWizard } from './reimbursements/ClaimWizard';
import { ReimbursementCategory, ClaimStatus, WalletMetric, BudgetCategory } from '../types';
import { supabase } from '../services/supabaseClient';

interface ApprovalLog {
    date: string;
    actor: string;
    action: string;
    comment?: string;
}

interface ClaimReport {
    id: string;
    name: string;
    otherType?: string;
    category: ReimbursementCategory;
    status: ClaimStatus;
    items: any[];
    submittedAt: string;
    createdAt?: string;
    settledDate?: string;
    approvalHistory?: ApprovalLog[];
    actionNote?: string;
}

const FALLBACK_CLAIMS: ClaimReport[] = [
    {
        id: 'CLM-00124',
        name: 'Client Meeting - Food & Cab',
        category: ReimbursementCategory.TRAVEL,
        status: 'settled',
        submittedAt: '2025-12-05',
        createdAt: '2025-12-05T10:00:00Z',
        items: [
            { merchant: 'Uber', amount: 450 },
            { merchant: 'Starbucks', amount: 800 }
        ]
    },
    {
        id: 'CLM-00121',
        name: 'Broadband Subscription - Dec',
        category: ReimbursementCategory.BROADBAND,
        status: 'approved',
        submittedAt: '2025-12-01',
        createdAt: '2025-12-01T09:00:00Z',
        items: [
            { merchant: 'Airtel', amount: 999 }
        ]
    }
];

const MOCK_LOANS = [
    {
        id: 'LN-5542',
        type: 'Personal Loan',
        date: '15 Oct 2025',
        amount: 50000,
        balance: 35000,
        status: 'Active',
        requestedAmount: 50000,
        approvedAmount: 50000,
        tenure: '12 Months',
        interestRate: 0,
        reason: 'Medical Emergency',
        repaymentMonth: 'Nov 2025',
        schedule: [
            { emi: 'EMI 1', date: '05 Nov 2025', amount: 4167, status: 'Paid' },
            { emi: 'EMI 2', date: '05 Dec 2025', amount: 4167, status: 'Paid' },
            { emi: 'EMI 3', date: '05 Jan 2026', amount: 4167, status: 'Pending' }
        ]
    },
    {
        id: 'LN-4421',
        type: 'Salary Advance',
        date: '02 Nov 2025',
        amount: 20000,
        balance: 0,
        status: 'Closed',
        requestedAmount: 20000,
        approvedAmount: 20000,
        tenure: '4 Months',
        interestRate: 0,
        reason: 'Festival Advance',
        repaymentMonth: 'Nov 2025',
        schedule: [
            { emi: 'EMI 1', date: '05 Nov 2025', amount: 5000, status: 'Paid' },
            { emi: 'EMI 2', date: '05 Dec 2025', amount: 5000, status: 'Paid' },
            { emi: 'EMI 3', date: '05 Jan 2026', amount: 5000, status: 'Paid' },
            { emi: 'EMI 4', date: '05 Feb 2026', amount: 5000, status: 'Paid' }
        ]
    }
];

// Mock data for employee loans with details for right panel
// Mock data removed (fetched from DB)

// Loan Details Panel Component
const LoanDetailsPanel = ({ loan, onClose }: { loan: any, onClose: () => void }) => {
    return (
        <>
            <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col border-l border-slate-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Loan Details</h2>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{loan.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
                    {/* Loan Summary Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Loan Summary</h3>
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${loan.status === 'Active' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                {loan.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                <p className="text-xs text-slate-500 mb-1">Type</p>
                                <p className="font-bold text-slate-800 text-sm">{loan.type}</p>
                            </div>
                            <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                <p className="text-xs text-slate-500 mb-1">Requested Amount</p>
                                <p className="font-bold text-slate-800 text-sm">₹{loan.requestedAmount.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl shadow-sm">
                                <p className="text-xs text-emerald-600 mb-1">Approved Amount</p>
                                <p className="font-bold text-emerald-800 text-lg">₹{loan.approvedAmount.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                <p className="text-xs text-slate-500 mb-1">Tenure</p>
                                <p className="font-bold text-slate-800 text-sm">{loan.tenure}</p>
                            </div>
                            <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                <p className="text-xs text-slate-500 mb-1">Repayment Month</p>
                                <p className="font-bold text-slate-800 text-sm">{loan.repaymentMonth || '-'}</p>
                            </div>
                            <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                <p className="text-xs text-slate-500 mb-1">Interest Rate (%)</p>
                                <p className="font-bold text-slate-800 text-sm">{loan.interestRate}%</p>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">Reason</p>
                            <p className="text-sm text-slate-700 italic">"{loan.reason}"</p>
                        </div>
                    </div>

                    {/* Repayment Schedule Section */}
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Repayment Schedule</h3>
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs">
                                    <tr>
                                        <th className="px-4 py-3">EMI</th>
                                        <th className="px-4 py-3">Due Date</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                        <th className="px-4 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loan.schedule.map((emi: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 text-slate-600">{emi.emi}</td>
                                            <td className="px-4 py-3 text-slate-800 font-medium">{emi.date}</td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-700">₹{emi.amount.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${emi.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-50 text-orange-700'
                                                    }`}>
                                                    {emi.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const EmployeeLoansView = ({ onBack, loans }: { onBack: () => void, loans: any[] }) => {
    const [selectedLoan, setSelectedLoan] = useState<any>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        type: 'All',
        status: 'All',
        date: ''
    });

    const isLoading = false;
    const EMPLOYEE_ID = '1';


    const loanTypes = ['All', ...Array.from(new Set(loans.map(l => l.type)))];
    const loanStatuses = ['All', ...Array.from(new Set(loans.map(l => l.status)))];

    const filteredLoans = loans.filter(loan => {
        const matchType = filters.type === 'All' || loan.type === filters.type;
        const matchStatus = filters.status === 'All' || loan.status === filters.status;
        const matchDate = filters.date === '' || loan.date.toLowerCase().includes(filters.date.toLowerCase());
        return matchType && matchStatus && matchDate;
    });

    return (
        <div className="animate-fade-in space-y-6 max-w-[1400px] mx-auto relative">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><ArrowLeft size={20} /></button>
                    <h2 className="text-2xl font-bold text-slate-800">My Loans & Advances</h2>
                </div>
                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${isFilterOpen ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                    <Filter size={16} /> Filters
                </button>
            </div>

            {/* Filter Bar */}
            {isFilterOpen && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Type</label>
                        <div className="relative">
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                            >
                                {loanTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status</label>
                        <div className="relative">
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                            >
                                {loanStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Date</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="e.g. Nov 2025"
                                value={filters.date}
                                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Loan ID</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Requested Date</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                            <th className="px-6 py-4 text-right">Balance</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredLoans.map(loan => (
                            <tr key={loan.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4 font-mono text-slate-500">{loan.id}</td>
                                <td className="px-6 py-4 font-medium text-slate-700">{loan.type}</td>
                                <td className="px-6 py-4 text-slate-500">{loan.date}</td>
                                <td className="px-6 py-4 text-right font-bold text-slate-800">₹{loan.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right font-medium text-slate-600">₹{loan.balance.toLocaleString()}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${loan.status === 'Active' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                        {loan.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => setSelectedLoan(loan)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                        title="View Details"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredLoans.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-sm">
                        No loans found matching the selected filters.
                    </div>
                )}
            </div>

            {selectedLoan && <LoanDetailsPanel loan={selectedLoan} onClose={() => setSelectedLoan(null)} />}
        </div>
    )
}

export const ReimbursementModule: React.FC = () => {
    const [view, setView] = useState<'DASHBOARD' | 'WIZARD' | 'LOANS'>('DASHBOARD');
    const [editingClaim, setEditingClaim] = useState<ClaimReport | null>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);

    // Persistence logic
    const [claims, setClaims] = useState<ClaimReport[]>(FALLBACK_CLAIMS);
    const [loans, setLoans] = useState<any[]>(MOCK_LOANS);
    const EMPLOYEE_ID = '1'; // Hardcoded for prototype

    // Fetch Claims from Supabase
    useEffect(() => {
        const fetchClaims = async () => {
            const { data, error } = await supabase
                .from('reimbursement_claims')
                .select('*')
                .eq('employee_id', EMPLOYEE_ID)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching claims:', error);
            } else if (data && data.length > 0) {
                // Map database columns to ClaimReport interface
                const mappedClaims: ClaimReport[] = data.map((item: any) => ({
                    id: item.id,
                    name: item.title,
                    category: item.category as ReimbursementCategory,
                    status: item.status as ClaimStatus,
                    items: item.items || [],
                    submittedAt: item.submitted_at ? new Date(item.submitted_at).toISOString().split('T')[0] : '',
                    createdAt: item.created_at,
                    actionNote: item.action_note,
                    approvalHistory: item.approval_history || []
                }));
                setClaims(mappedClaims);
            }
        };

        const fetchLoans = async () => {
            const { data } = await supabase
                .from('employee_loans')
                .select('*')
                .eq('employee_id', EMPLOYEE_ID)
                .order('created_at', { ascending: false });

            if (data && data.length > 0) {
                const mappedLoans = data.map((loan: any) => {
                    const schedule = loan.repayment_schedule || [];
                    const balance = schedule
                        .filter((emi: any) => emi.status === 'Pending')
                        .reduce((sum: number, emi: any) => sum + emi.amount, 0);

                    return {
                        id: loan.id,
                        type: loan.loan_type,
                        amount: loan.amount,
                        date: new Date(loan.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                        status: loan.status.charAt(0).toUpperCase() + loan.status.slice(1),
                        balance: balance || 0,
                        requestedAmount: loan.amount,
                        approvedAmount: loan.amount,
                        tenure: `${loan.tenure_months} Months`,
                        interestRate: loan.interest_rate || 0,
                        reason: 'Personal Requirement',
                        repaymentMonth: schedule.length > 0 ? schedule[0].date : '-',
                        schedule: schedule
                    };
                });
                setLoans(mappedLoans);
            }
        };

        fetchClaims();
        fetchLoans();
    }, []);

    const wallet: WalletMetric = {
        entitlement: 250000,
        utilized: 45000,
        pending: 12500,
        lapse: 0,
    };

    const budgets: BudgetCategory[] = [
        { category: ReimbursementCategory.TRAVEL, limit: 120000, utilized: 35000 },
        { category: ReimbursementCategory.MEAL, limit: 36000, utilized: 12000 },
        { category: ReimbursementCategory.MOBILE, limit: 12000, utilized: 4500 },
        { category: ReimbursementCategory.BROADBAND, limit: 12000, utilized: 3000 },
        { category: ReimbursementCategory.LEARNING, limit: 45000, utilized: 15000 },
        { category: ReimbursementCategory.OTHER, limit: 25000, utilized: 0 },
    ];

    const handleUpsertClaim = async (claim: ClaimReport) => {
        try {
            const totalAmount = claim.items.reduce((sum, item) => sum + item.amount, 0);

            const payload = {
                id: claim.id,
                employee_id: EMPLOYEE_ID,
                title: claim.name,
                category: claim.category,
                total_amount: totalAmount,
                status: claim.status,
                items: claim.items,
                approval_history: claim.approvalHistory,
                action_note: claim.actionNote,
                submitted_at: claim.submittedAt ? new Date(claim.submittedAt).toISOString() : new Date().toISOString()
            };

            const { error } = await supabase
                .from('reimbursement_claims')
                .upsert(payload, { onConflict: 'id' });

            if (error) throw error;

            // Optimistic update
            setClaims(prev => {
                const exists = prev.find(c => c.id === claim.id);
                if (exists) return prev.map(c => c.id === claim.id ? claim : c);
                return [claim, ...prev];
            });

            setView('DASHBOARD');
            setEditingClaim(null);
        } catch (err) {
            console.error("Error saving claim:", err);
            // Ideally show toast error here
        }
    };

    return (
        <div className="h-full">
            {view === 'DASHBOARD' ? (
                <Dashboard
                    wallet={wallet}
                    budgets={budgets}
                    claims={claims}
                    loans={loans}
                    onNewClaim={() => { setEditingClaim(null); setIsReadOnly(false); setView('WIZARD'); }}
                    onEditClaim={(c: any) => { setEditingClaim(c); setIsReadOnly(false); setView('WIZARD'); }}
                    onViewClaim={(c: any) => { setEditingClaim(c); setIsReadOnly(true); setView('WIZARD'); }}
                    onViewLoans={() => setView('LOANS')}
                />
            ) : view === 'LOANS' ? (
                <EmployeeLoansView loans={loans} onBack={() => setView('DASHBOARD')} />
            ) : (
                <ClaimWizard
                    initialData={editingClaim}
                    readOnly={isReadOnly}
                    onCancel={() => { setView('DASHBOARD'); setEditingClaim(null); }}
                    onSubmit={handleUpsertClaim}
                    onEdit={() => setIsReadOnly(false)}
                />
            )}
        </div>
    );
};

export default ReimbursementModule;
