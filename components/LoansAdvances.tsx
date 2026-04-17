
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import {
    Search,
    Filter,
    Plus,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    MoreVertical,
    ChevronDown,
    ChevronUp,
    DollarSign,
    Calendar,
    User,
    Banknote,
    Eye,
    Edit2,
    Download,
    Check,
    X,
    AlertCircle,
    FileText,
    ChevronRight,
    Printer,
    MessageSquare,
    Save,
    Trash2,
    AlertTriangle,
    Upload,
    Paperclip,
    Sigma,
    Activity,
    Info
} from 'lucide-react';
import { MOCK_EMPLOYEES } from '../constants';

// --- Types ---

interface RepaymentScheduleItem {
    emiNo: number;
    dueDate: string;
    amount: number;
    deductedDate?: string;
    status: 'Paid' | 'Pending' | 'Overdue';
}

interface LoanRequest {
    id: string;
    employee: {
        name: string;
        id: string;
        department: string;
        ctc: string;
        avatar: string;
    };
    type: 'Salary Advance' | 'Loan';
    requestedAmount: number;
    approvedAmount?: number;
    requestDate: string;
    status: 'Pending' | 'Approved' | 'Partially Approved' | 'Active' | 'Repaying' | 'Closed' | 'Rejected' | 'Draft';
    emiAmount?: number;
    totalEmis?: number;
    remainingBalance?: number;
    interestRate?: number;
    disbursedDate?: string;
    repaymentSchedule?: RepaymentScheduleItem[];
    reason: string;
    repaymentMonth?: string;
}

// --- Mock Data ---

const MOCK_LOANS: LoanRequest[] = [
    {
        id: 'LN-2025-001',
        employee: { name: 'Priya Sharma', id: 'TF00912', department: 'Engineering', ctc: '1850000', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
        type: 'Loan',
        requestedAmount: 200000,
        approvedAmount: 200000,
        requestDate: '05 Jan 2026',
        status: 'Repaying',
        emiAmount: 18333,
        totalEmis: 12,
        remainingBalance: 146667,
        interestRate: 5,
        disbursedDate: '10 Jan 2026',
        reason: 'Home renovation',
        repaymentMonth: 'February 2026',
        repaymentSchedule: Array.from({ length: 12 }, (_, i) => ({
            emiNo: i + 1,
            dueDate: new Date(2026, 0 + i, 10).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            amount: 18333,
            status: i < 2 ? 'Paid' : i === 2 ? 'Pending' : 'Pending',
        }))
    },
    {
        id: 'LA-2025-002',
        employee: { name: 'Arjun Mehta', id: 'AC04567', department: 'Sales', ctc: '2400000', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun' },
        type: 'Salary Advance',
        requestedAmount: 50000,
        approvedAmount: 50000,
        requestDate: '18 Feb 2026',
        status: 'Approved',
        emiAmount: 50000,
        totalEmis: 1,
        remainingBalance: 50000,
        interestRate: 0,
        disbursedDate: '20 Feb 2026',
        reason: 'Medical emergency for family member',
        repaymentMonth: 'March 2026',
    },
    {
        id: 'LN-2025-003',
        employee: { name: 'Neha Kapoor', id: 'SU00234', department: 'HR', ctc: '1580000', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neha' },
        type: 'Loan',
        requestedAmount: 150000,
        approvedAmount: 100000,
        requestDate: '12 Mar 2026',
        status: 'Partially Approved',
        emiAmount: 9167,
        totalEmis: 12,
        remainingBalance: 100000,
        interestRate: 6,
        reason: 'Vehicle purchase',
        repaymentMonth: 'April 2026',
    },
    {
        id: 'LN-2025-004',
        employee: { name: 'Rohan Desai', id: 'GL07890', department: 'Finance', ctc: '2120000', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan' },
        type: 'Loan',
        requestedAmount: 500000,
        requestDate: '01 Apr 2026',
        status: 'Pending',
        reason: 'Children\'s education fee payment',
    },
    {
        id: 'LA-2025-005',
        employee: { name: 'Ananya Patel', id: 'TF01145', department: 'Marketing', ctc: '1470000', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya' },
        type: 'Salary Advance',
        requestedAmount: 30000,
        approvedAmount: 0,
        requestDate: '02 Apr 2026',
        status: 'Rejected',
        reason: 'Travel expenses for personal trip',
    },
    {
        id: 'LN-2025-006',
        employee: { name: 'Kunal Singh', id: 'SU00111', department: 'Engineering', ctc: '1920000', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kunal' },
        type: 'Loan',
        requestedAmount: 300000,
        approvedAmount: 300000,
        requestDate: '15 Nov 2025',
        status: 'Closed',
        emiAmount: 26250,
        totalEmis: 12,
        remainingBalance: 0,
        interestRate: 5,
        disbursedDate: '20 Nov 2025',
        reason: 'Home down-payment assistance',
    },
    {
        id: 'LN-2026-007',
        employee: { name: 'Priya Sharma', id: 'TF00912', department: 'Engineering', ctc: '1850000', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
        type: 'Loan',
        requestedAmount: 150000,
        approvedAmount: 150000,
        requestDate: '10 Feb 2026',
        status: 'Approved',
        emiAmount: 13750,
        totalEmis: 12,
        remainingBalance: 150000,
        interestRate: 10,
        reason: 'Personal expense',
        repaymentMonth: 'March 2026',
        repaymentSchedule: Array.from({ length: 12 }, (_, i) => ({
            emiNo: i + 1,
            dueDate: new Date(2026, 2 + i, 10).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            amount: 13187,
            status: 'Pending',
        }))
    },
    {
        id: 'LA-2026-008',
        employee: { name: 'Priya Sharma', id: 'TF00912', department: 'Engineering', ctc: '1850000', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
        type: 'Salary Advance',
        requestedAmount: 50000,
        requestDate: '15 Mar 2026',
        status: 'Rejected',
        reason: 'Exceeds monthly limit',
    },
    {
        id: 'LN-2024-009',
        employee: { name: 'Priya Sharma', id: 'TF00912', department: 'Engineering', ctc: '1850000', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
        type: 'Loan',
        requestedAmount: 100000,
        approvedAmount: 100000,
        requestDate: '10 Oct 2024',
        status: 'Closed',
        emiAmount: 8333,
        totalEmis: 12,
        remainingBalance: 0,
        interestRate: 0,
        disbursedDate: '15 Oct 2024',
        reason: 'Emergency fund',
        repaymentSchedule: Array.from({ length: 12 }, (_, i) => ({
            emiNo: i + 1,
            dueDate: new Date(2024, 10 + i, 15).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            amount: 8333,
            status: 'Paid',
        }))
    },
];


// --- Helpers ---

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Pending': return 'bg-orange-50 text-orange-700 border-orange-100';
        case 'Approved': return 'bg-green-50 text-green-700 border-green-100';
        case 'Partially Approved': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
        case 'Active': return 'bg-blue-50 text-blue-700 border-blue-100';
        case 'Repaying': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
        case 'Closed': return 'bg-slate-100 text-slate-600 border-slate-200';
        case 'Rejected': return 'bg-rose-50 text-rose-700 border-rose-100';
        case 'Draft': return 'bg-slate-100 text-slate-500 border-slate-200';
        default: return 'bg-slate-50 text-slate-600';
    }
};

const getTypeColor = (type: string) => {
    switch (type) {
        case 'Salary Advance': return 'text-blue-700 bg-blue-50 border-blue-100';
        case 'Loan': return 'text-purple-700 bg-purple-50 border-purple-100';
        default: return 'text-slate-700 bg-slate-50 border-slate-100';
    }
};

// --- Modals ---

const ViewLoanModal: React.FC<{ 
    loan: LoanRequest; 
    userRole: string; 
    onClose: () => void;
    onEdit?: (loan: LoanRequest) => void;
    onApprove?: (loan: LoanRequest) => void;
    onReject?: (loan: LoanRequest) => void;
}> = ({ loan, userRole, onClose, onEdit, onApprove, onReject }) => {
    
    // Calculate EMI stats for the visual boxes
    const calculateEMI = () => {
        // If a schedule exists, use the actual amount from the first entry to ensure consistency
        if (loan.repaymentSchedule && loan.repaymentSchedule.length > 0) {
            return { emi: loan.repaymentSchedule[0].amount };
        }
        
        const p = loan.requestedAmount || 0;
        const r = (loan.interestRate || 0) / 12 / 100;
        const n = loan.totalEmis || 1;
        if (p === 0 || n === 0) return { emi: 0 };
        let emi = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        return { emi: Math.round(emi) };
    };

    const stats = calculateEMI();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-100">
                {/* Header with Status */}
                <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <h3 className="font-black text-slate-800 text-xl tracking-tight">Loan Details</h3>
                        {(() => {
                            const displayStatus = userRole === 'EMPLOYEE' 
                                ? (['Active', 'Repaying'].includes(loan.status) ? 'Active' : (['Approved', 'Partially Approved'].includes(loan.status) ? 'Approved' : loan.status))
                                : loan.status;
                            const statusColor = getStatusColor(displayStatus);
                            return (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm ${statusColor}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${statusColor.split(' ')[1].replace('text-', 'bg-')}`} />
                                    {displayStatus}
                                </span>
                            );
                        })()}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-300 hover:text-slate-500 transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                    {/* Top Section: Employee & Actions Card */}
                    <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <img src={loan.employee.avatar} alt="" className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 text-lg leading-tight">{loan.employee.name} ({loan.employee.id})</h4>
                                <p className="text-sm text-slate-400 font-medium mt-1 uppercase tracking-wide">
                                    Requested on {loan.requestDate || '02-Mar-2026'}, 05:15 PM
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {loan.status === 'Pending' && (
                                <button onClick={() => onEdit?.(loan)} title="Edit" className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all border border-indigo-100/50 shadow-sm">
                                    <Edit2 size={18} />
                                </button>
                            )}
                            {userRole !== 'EMPLOYEE' && loan.status === 'Pending' && (
                                <>
                                    <button onClick={() => onApprove?.(loan)} title="Approve" className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all border border-emerald-100/50 shadow-sm">
                                        <Check size={18} />
                                    </button>
                                    <button onClick={() => onReject?.(loan)} title="Reject" className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all border border-rose-100/50 shadow-sm">
                                        <X size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Middle Section: Visual Stats Summary */}
                    <div className="relative flex items-center justify-center py-6 px-4 bg-slate-50/30 rounded-[32px] border border-slate-50">
                        {/* Connecting Line */}
                        <div className="absolute left-1/4 right-1/4 h-[2px] border-t-2 border-dashed border-slate-200 top-1/2 -translate-y-1/2 -z-0" />

                        <div className="grid grid-cols-3 w-full relative z-10">
                            {/* Start Box: Requested Amount */}
                            <div className="flex flex-col items-start gap-3">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Requested Amount</span>
                                <div className="w-full aspect-[16/9] max-h-24 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col items-center justify-center p-4">
                                    <span className="text-xl font-black text-indigo-600">₹{loan.requestedAmount.toLocaleString()}</span>
                                    <span className="text-[10px] font-bold text-slate-400 mt-0.5">Full Principle</span>
                                </div>
                            </div>

                            {/* Center Bubble: Tenure & Interest */}
                            <div className="flex flex-col items-center justify-center mt-6">
                                <div className="px-6 py-2 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
                                    <span className="text-xs font-black text-indigo-600">{loan.totalEmis || 1} Month(s)</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight">of {loan.type || 'Personal Loan'}</span>
                                <div className="mt-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-[11px] font-black text-white shadow-lg border-2 border-white">
                                    {loan.interestRate || '0'}%
                                </div>
                            </div>

                            {/* End Box: Monthly EMI */}
                            <div className="flex flex-col items-end gap-3 text-right">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest pr-2">Monthly EMI</span>
                                <div className="w-full aspect-[16/9] max-h-24 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col items-center justify-center p-4">
                                    <span className="text-xl font-black text-indigo-600">₹{stats.emi.toLocaleString()}</span>
                                    <span className="text-[10px] font-bold text-slate-400 mt-0.5">{loan.interestRate ? 'With Interest' : 'Interest Free'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Metadata Sections */}
                    <div className="space-y-6 pt-4">
                        <div className="grid grid-cols-1 gap-6">
                            {/* Attachment */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Attachment:</span>
                                <p className="text-slate-800 font-bold ml-1">-</p>
                                <div className="h-px bg-slate-100" />
                            </div>

                            {/* Reason */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Reason:</span>
                                <p className="text-slate-800 font-bold ml-1 text-sm leading-relaxed">
                                    {loan.reason || 'Requested for personal requirements.'}
                                </p>
                                <div className="h-px bg-slate-100" />
                            </div>

                            {/* Repayment Month */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Repayment Month:</span>
                                <p className="text-slate-800 font-bold ml-1 text-sm">
                                    {loan.repaymentMonth || 'Not specified'}
                                </p>
                            </div>

                            {/* Repayment Schedule (Conditional) */}
                            {['Active', 'Approved', 'Repaying', 'Closed', 'Partially Approved'].includes(loan.status) && loan.repaymentSchedule && (
                                <div className="space-y-4 pt-4 border-t border-slate-50">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Repayment Schedule</span>
                                    <div className="overflow-hidden border border-slate-100 rounded-2xl bg-white shadow-sm">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-tight">
                                                <tr>
                                                    <th className="px-4 py-3 border-b border-slate-100">#</th>
                                                    <th className="px-4 py-3 border-b border-slate-100">Due Date</th>
                                                    <th className="px-4 py-3 border-b border-slate-100 text-right">Amount</th>
                                                    <th className="px-4 py-3 border-b border-slate-100 text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {(() => {
                                                    const fullSchedule = loan.repaymentSchedule || [];
                                                    if (userRole !== 'EMPLOYEE') return fullSchedule.map(renderRow);
                                                    
                                                    const paid = fullSchedule.filter(e => e.status === 'Paid');
                                                    const nextPending = fullSchedule.find(e => e.status === 'Pending');
                                                    const displaySchedule = nextPending ? [...paid, nextPending] : paid;
                                                    
                                                    return displaySchedule.map(renderRow);

                                                    function renderRow(emi: any) {
                                                        return (
                                                            <tr key={emi.emiNo} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className="px-4 py-3 text-slate-500 font-mono">{emi.emiNo}</td>
                                                                <td className="px-4 py-3 text-slate-800 font-bold">{emi.dueDate}</td>
                                                                <td className="px-4 py-3 text-right text-indigo-600 font-black">₹{emi.amount.toLocaleString()}</td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${emi.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                                                        {emi.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    }
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer (Simplified for View) */}
                <div className="p-6 border-t border-slate-50 bg-white flex justify-end shrink-0">
                    <button onClick={onClose} className="px-8 py-2.5 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 text-sm transition-all shadow-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditLoanModal: React.FC<{ loan: LoanRequest; onClose: () => void; onSave: (updated: LoanRequest) => void }> = ({ loan, onClose, onSave }) => {
    const [amount, setAmount] = useState(loan.requestedAmount);
    const [tenure, setTenure] = useState(loan.totalEmis || 1);
    const [interestRate, setInterestRate] = useState(String(loan.interestRate || '0'));
    const [repaymentMonth, setRepaymentMonth] = useState('February 2026'); // Mock default
    const [reason, setReason] = useState(loan.reason || '');
    const [approvers, setApprovers] = useState<any[]>([]);

    useEffect(() => {
        const fetchApprovers = async () => {
            try {
                const { data } = await supabase.from('loan_types').select('*');
                if (data) {
                    // Try to find matching config based on loan type and employee's BU
                    const businessUnit = 'MindInventory'; // Mock/Default BU
                    let config = data.find(lt => lt.name === loan.type && lt.target_id === businessUnit);
                    if (!config) config = data.find(lt => lt.name === loan.type && lt.target_id === 'MindInventory');
                    
                    if (config?.approvers) {
                        const mapped = config.approvers.map((name: string) => {
                            const found = MOCK_EMPLOYEES.find(e => `${e.first_name} ${e.last_name}` === name.split(' (')[0]);
                            return found || { id: name, first_name: name.split(' (')[0], last_name: '' };
                        });
                        setApprovers(mapped);
                    }
                }
            } catch (err) {
                console.error('Error fetching approvers for edit:', err);
            }
        };
        fetchApprovers();
    }, [loan.id, loan.type]);

    const calculateEMI = () => {
        const p = parseFloat(String(amount)) || 0;
        const r = (parseFloat(interestRate) || 0) / 12 / 100;
        const n = parseInt(String(tenure)) || 0;
        if (p === 0 || n === 0) return { emi: 0, totalInterest: 0, totalPayable: 0 };
        let emi = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        return { emi: Math.round(emi), totalInterest: Math.round((emi * n) - p), totalPayable: Math.round(emi * n) };
    };

    const stats = calculateEMI();

    const handleSave = () => {
        onSave({ 
            ...loan, 
            requestedAmount: Number(amount), 
            totalEmis: Number(tenure), 
            interestRate: Number(interestRate),
            reason: reason,
            remainingBalance: Number(amount)
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 transition-shadow">
                    <h3 className="font-bold text-slate-800 text-lg">Edit Loan Request</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto">
                    {/* Employee Snippet (Read-only Context) */}
                    <div className="max-w-md">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">SELECTED EMPLOYEE</label>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl opacity-60">
                            <img src={loan.employee.avatar} alt="" className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                            <div>
                                <div className="font-bold text-slate-800">{loan.employee.name}</div>
                                <div className="text-xs text-slate-400 font-mono">{loan.employee.id} • {loan.employee.department}</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Loan Type (Read-only Context) */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-4">LOAN TYPE</label>
                            <div className="flex gap-4">
                                <label className={`flex items-center gap-4 px-6 py-4 border-2 rounded-2xl cursor-not-allowed opacity-50 min-w-[200px] ${loan.type === 'Salary Advance' ? 'border-purple-600 bg-purple-50/30' : 'border-slate-100'}`}>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${loan.type === 'Salary Advance' ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {loan.type === 'Salary Advance' && <div className="w-3 h-3 rounded-full bg-purple-600" />}
                                    </div>
                                    <span className={`text-base font-bold ${loan.type === 'Salary Advance' ? 'text-purple-900' : 'text-slate-600'}`}>Salary Advance</span>
                                </label>
                                <label className={`flex items-center gap-4 px-6 py-4 border-2 rounded-2xl cursor-not-allowed opacity-50 min-w-[200px] ${loan.type === 'Loan' ? 'border-purple-600 bg-purple-50/30' : 'border-slate-100'}`}>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${loan.type === 'Loan' ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {loan.type === 'Loan' && <div className="w-3 h-3 rounded-full bg-purple-600" />}
                                    </div>
                                    <span className={`text-base font-bold ${loan.type === 'Loan' ? 'text-purple-900' : 'text-slate-600'}`}>Loan</span>
                                </label>
                            </div>
                        </div>

                        {/* Requested Amount */}
                        <div className="max-w-md">
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">REQUESTED AMOUNT <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input
                                    type="text"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 max-w-md">
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">INTEREST RATE (% P.A.)</label>
                                <input
                                    type="text"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold"
                                />
                                <p className="mt-1.5 text-[10px] text-slate-400 font-medium">Set 0 for interest-free advances.</p>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">MAX TENURE (MONTHS) <span className="text-rose-500">*</span></label>
                                <input
                                    type="text"
                                    value={tenure}
                                    onChange={(e) => setTenure(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold"
                                />
                                <p className="mt-1.5 text-[10px] text-slate-400 font-medium">Max tenure allowed for this selection.</p>
                            </div>
                        </div>

                        {/* Detailed EMI Table & Repayment Month */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">REPAYMENT MONTH</label>
                                <div className="relative">
                                    <select
                                        value={repaymentMonth}
                                        onChange={(e) => setRepaymentMonth(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none cursor-pointer font-bold"
                                    >
                                        <option>February 2026</option>
                                        <option>March 2026</option>
                                        <option>April 2026</option>
                                    </select>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            
                            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">MONTHLY EMI</span>
                                    <span className="text-lg font-black text-emerald-600">₹{stats.emi.toLocaleString()}</span>
                                </div>
                                <div className="h-px bg-slate-100" />
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-slate-400">Principal</span>
                                        <span className="text-slate-700 font-bold">₹{Number(amount || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-slate-400">Total Interest</span>
                                        <span className="text-slate-700 font-bold">₹{stats.totalInterest.toLocaleString()}</span>
                                    </div>
                                    <div className="h-px border-t border-dashed border-slate-200 my-1" />
                                    <div className="flex justify-between text-xs font-medium pt-1">
                                        <span className="text-slate-600 font-black">Total Payable</span>
                                        <span className="text-slate-900 font-black">₹{stats.totalPayable.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reason/Purpose */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Reason/Purpose <span className="text-rose-500">*</span></label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all min-h-[100px] resize-none font-bold"
                                placeholder="Brief reason for the loan request..."
                            />
                        </div>

                        {/* Approval Flow Section (Read-Only List) */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-4">Approval Flow</label>
                            <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/30 space-y-4">
                                <div className="min-h-[80px] border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-4">
                                    {approvers.length === 0 ? (
                                        <p className="text-xs italic text-slate-400 font-medium">Approval flow is linked to entity settings and cannot be modified.</p>
                                    ) : (
                                        <div className="w-full flex flex-wrap gap-2">
                                            {approvers.map((app, idx) => (
                                                <div key={app.id} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm transition-all shadow-sm">
                                                    <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                                                    <span className="font-bold text-slate-700">{app.first_name} {app.last_name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 sticky bottom-0 z-10 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
                    <button onClick={onClose} className="px-8 py-3 dark:bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">Cancel</button>
                    <button onClick={handleSave} className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all transform active:scale-95">Save</button>
                </div>
            </div>
        </div>
    );
};

const ApproveLoanModal: React.FC<{ loan: LoanRequest; onClose: () => void; onApprove: (amount: number, remarks: string) => void }> = ({ loan, onClose, onApprove }) => {
    const [amount, setAmount] = useState(loan.requestedAmount);
    const [remarks, setRemarks] = useState('');

    const isPartial = amount < loan.requestedAmount;
    const isSubmitDisabled = isPartial && !remarks.trim();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 text-lg">Approve Loan</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg flex justify-between items-center">
                        <span className="text-sm text-purple-700 font-medium">Requested Amount</span>
                        <span className="text-lg font-bold text-purple-900">₹{loan.requestedAmount.toLocaleString()}</span>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase">Approved Amount</label>
                            {isPartial && (
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 animate-in fade-in">
                                    Partially Approved
                                </span>
                            )}
                        </div>
                        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={`w-full px-3 py-2 border rounded-lg text-sm font-bold focus:outline-none transition-colors ${isPartial ? 'border-amber-400 focus:border-amber-500' : 'border-slate-200 focus:border-emerald-500'}`} />
                        {isPartial && <p className="text-xs text-amber-600 mt-1 flex items-center gap-1"><AlertTriangle size={10} /> Amount is less than requested.</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Reason {isPartial && <span className="text-rose-500">*</span>}</label>
                        <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-colors h-24 resize-none ${isSubmitDisabled ? 'border-amber-300 focus:border-amber-500' : 'border-slate-200 focus:border-emerald-500'}`} placeholder={isPartial ? "Please provide a reason for partial approval..." : "Add any comments..."}></textarea>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 text-sm">Cancel</button>
                    <button 
                        onClick={() => { onApprove(amount, remarks); onClose(); }} 
                        disabled={isSubmitDisabled}
                        className={`px-6 py-2 text-white rounded-lg font-medium text-sm shadow-sm flex items-center gap-2 transition-all ${isSubmitDisabled ? 'bg-slate-300 cursor-not-allowed opacity-50' : (isPartial ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200')}`}
                    >
                        <Check size={16} /> {isPartial ? 'Approve Partial' : 'Approve'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RejectLoanModal: React.FC<{ loan: LoanRequest; onClose: () => void; onReject: (reason: string) => void }> = ({ loan, onClose, onReject }) => {
    const [reason, setReason] = useState('');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 text-lg">Reject Loan</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <p className="text-sm text-slate-600">You are rejecting a request for <span className="font-bold text-slate-800">₹{loan.requestedAmount.toLocaleString()}</span> from <span className="font-bold text-slate-800">{loan.employee.name}</span>.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Reason for Rejection <span className="text-rose-500">*</span></label>
                        <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-500 h-24 resize-none" placeholder="Please specify why this request is being rejected..."></textarea>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 text-sm">Cancel</button>
                    <button onClick={() => { onReject(reason); onClose(); }} disabled={!reason.trim()} className="px-6 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 text-sm shadow-sm flex items-center gap-2 disabled:opacity-50"><XCircle size={16} /> Reject</button>
                </div>
            </div>
        </div>
    );
};

// New Modal Component
const CreateLoanModal: React.FC<{ userRole: UserRole; currentEmployeeId?: string; onClose: () => void; onSave: (data: any) => void }> = ({ userRole, currentEmployeeId, onClose, onSave }) => {
    // Form State
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(currentEmployeeId || '');
    const [loanType, setLoanType] = useState<'Salary Advance' | 'Loan'>('Salary Advance');
    const [interestRate, setInterestRate] = useState('0');
    const [maxTenure, setMaxTenure] = useState('0');
    const [interestCalcType, setInterestCalcType] = useState<'flat' | 'reducing'>('flat');
    const [repaymentMonth, setRepaymentMonth] = useState('February 2026');
    const [emiStartDate, setEmiStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [requestedAmount, setRequestedAmount] = useState('');
    const [reason, setReason] = useState('');

    // Handle role-based defaults for Employee
    useEffect(() => {
        const fetchDefaults = async () => {
            try {
                // Fetch live config from Supabase
                const { data: loanTypes } = await supabase
                    .from('loan_types')
                    .select('*');

                if (loanTypes) {
                    // Try to find the employee and their business unit
                    const employee = MOCK_EMPLOYEES.find(e => e.id === selectedEmployeeId);
                    const businessUnit = employee?.business_unit;

                    // 1. Try to find config matching name AND employee's BU
                    let config = businessUnit ? loanTypes.find(lt => 
                        lt.name === loanType && 
                        lt.target_id === businessUnit && 
                        lt.target_type === 'BusinessUnit'
                    ) : null;

                    // 2. Fallback to 'MindInventory' (System Default) if BU mismatch or BU not found
                    if (!config) {
                        config = loanTypes.find(lt => 
                            lt.name === loanType && 
                            lt.target_id === 'MindInventory'
                        );
                    }

                    // 3. Last resort: first match by name (preferring non-null target_id)
                    if (!config) {
                        config = loanTypes.find(lt => lt.name === loanType && lt.target_id !== null) 
                                 || loanTypes.find(lt => lt.name === loanType);
                    }

                    if (config) {
                        // Interest Rate
                        setInterestRate(String(config.interest_rate ?? (loanType === 'Loan' ? '10.5' : '0')));
                        
                        // Max Tenure
                        const defaultTenure = loanType === 'Loan' ? '12' : '3';
                        setMaxTenure(String(config.max_tenure || defaultTenure));

                        // Interest Calculation Type
                        setInterestCalcType(config.interest_calc_type === 'reducing' ? 'reducing' : 'flat');
                        
                        // Handle Approvers
                        if (config.approvers && Array.isArray(config.approvers)) {
                            const mappedApprovers = config.approvers.map((nameStr: string) => {
                                const found = MOCK_EMPLOYEES.find(e => `${e.first_name} ${e.last_name}` === nameStr.split(' (')[0]);
                                if (found) return found;
                                return {
                                    id: nameStr,
                                    first_name: nameStr.split(' (')[0],
                                    last_name: ''
                                };
                            });
                            setApprovers(mappedApprovers);
                        } else {
                            setApprovers([]);
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching loan defaults:', err);
                if (loanType === 'Loan') {
                    setInterestRate('10.5');
                    setMaxTenure('12');
                } else {
                    setInterestRate('0');
                    setMaxTenure('3');
                }
                setApprovers([]);
            }
        };

        fetchDefaults();
    }, [loanType, userRole, selectedEmployeeId]);

    // Approval Flow State
    const [approvers, setApprovers] = useState<any[]>([]);
    const [selectedApproverId, setSelectedApproverId] = useState('');

    const handleAddApprover = () => {
        if (userRole === 'EMPLOYEE') return;
        const emp = MOCK_EMPLOYEES.find(e => e.employee_id === selectedApproverId);
        if (emp && !approvers.find(a => a.id === emp.id)) {
            setApprovers([...approvers, emp]);
            setSelectedApproverId('');
        }
    };

    const removeApprover = (id: string) => {
        setApprovers(approvers.filter(a => a.id !== id));
    };

    const moveApprover = (index: number, direction: 'up' | 'down') => {
        const newApprovers = [...approvers];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newApprovers.length) return;
        [newApprovers[index], newApprovers[targetIndex]] = [newApprovers[targetIndex], newApprovers[index]];
        setApprovers(newApprovers);
    };

    const calculateEMI = () => {
        const p = parseFloat(requestedAmount) || 0;
        const r = (parseFloat(interestRate) || 0) / 12 / 100;
        const n = parseInt(maxTenure) || 0;

        if (p === 0 || n === 0) return { emi: 0, totalInterest: 0, totalPayable: 0 };

        let emi = 0;
        if (r === 0) {
            emi = p / n;
        } else {
            emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        }

        const totalPayable = emi * n;
        const totalInterest = totalPayable - p;

        return {
            emi: Math.round(emi),
            totalInterest: Math.round(totalInterest),
            totalPayable: Math.round(totalPayable)
        };
    };

    const stats = calculateEMI();

    const handleSave = () => {
        onSave({
            employeeId: selectedEmployeeId,
            loanType,
            interestRate: parseFloat(interestRate),
            maxTenure: parseInt(maxTenure),
            repaymentMonth,
            emiStartDate: loanType === 'Loan' ? emiStartDate : '',
            requestedAmount: parseFloat(requestedAmount),
            reason,
            approvers,
            isActive: true
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 transition-shadow">
                    <h3 className="font-bold text-slate-800 text-lg">Add New Loan Request</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto">
                    {/* Select Employee */}
                    {userRole !== 'EMPLOYEE' && (
                        <div className="max-w-md">
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">SELECT EMPLOYEE <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <select
                                    value={selectedEmployeeId}
                                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">-- Choose Employee --</option>
                                    {MOCK_EMPLOYEES.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                {/* Repayment note moved to correct section */}
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Loan Type */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-4">LOAN TYPE <span className="text-rose-500">*</span></label>
                            <div className="flex gap-4">
                                <label
                                    className={`flex items-center gap-4 px-6 py-4 border-2 rounded-2xl cursor-pointer transition-all min-w-[200px] ${loanType === 'Salary Advance' ? 'border-purple-600 bg-purple-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                                    onClick={() => setLoanType('Salary Advance')}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${loanType === 'Salary Advance' ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {loanType === 'Salary Advance' && <div className="w-3 h-3 rounded-full bg-purple-600" />}
                                    </div>
                                    <span className={`text-base font-bold ${loanType === 'Salary Advance' ? 'text-purple-900' : 'text-slate-600'}`}>Salary Advance</span>
                                </label>

                                <label
                                    className={`flex items-center gap-4 px-6 py-4 border-2 rounded-2xl cursor-pointer transition-all min-w-[200px] ${loanType === 'Loan' ? 'border-purple-600 bg-purple-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                                    onClick={() => setLoanType('Loan')}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${loanType === 'Loan' ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {loanType === 'Loan' && <div className="w-3 h-3 rounded-full bg-purple-600" />}
                                    </div>
                                    <span className={`text-base font-bold ${loanType === 'Loan' ? 'text-purple-900' : 'text-slate-600'}`}>Loan</span>
                                </label>
                            </div>
                        </div>

                        {/* Requested Amount */}
                        <div className="max-w-md">
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">REQUESTED AMOUNT <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input
                                    type="text"
                                    value={requestedAmount}
                                    onChange={(e) => setRequestedAmount(e.target.value)}
                                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold"
                                    placeholder="e.g. 50,000"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">INTEREST RATE (% P.A.)</label>
                                <input
                                    type="text"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(e.target.value)}
                                    readOnly={userRole === 'EMPLOYEE'}
                                    className={`w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold ${userRole === 'EMPLOYEE' ? 'bg-slate-50/50 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                    placeholder="e.g. 12"
                                />
                                <p className="mt-1.5 text-[10px] text-slate-400 font-medium">Set 0 for interest-free advances.</p>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                                    {loanType === 'Loan' ? 'MAX EMI TENURE (MONTHS)' : 'MAX TENURE (MONTHS)'} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={maxTenure}
                                    onChange={(e) => setMaxTenure(e.target.value)}
                                    readOnly={userRole === 'EMPLOYEE'}
                                    className={`w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold ${userRole === 'EMPLOYEE' ? 'bg-slate-50/50 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                    placeholder="e.g. 12"
                                />
                                <p className="mt-1.5 text-[10px] text-slate-400 font-medium">
                                    {loanType === 'Salary Advance' ? 'Max tenure allowed is 6 months.' : 'Max tenure allowed is 48 months.'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">INTEREST CALCULATION TYPE</label>
                                <div className="flex gap-2">
                                    {(['flat', 'reducing'] as const).map((type) => {
                                        const label = type === 'flat' ? 'Flat Rate' : 'Reducing Rate';
                                        const isSelected = interestCalcType === type;
                                        return (
                                            <label
                                                key={type}
                                                className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl cursor-pointer transition-all text-sm font-bold ${isSelected ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500 text-purple-900' : 'bg-white border-slate-200 hover:border-purple-200 text-slate-600'} ${userRole === 'EMPLOYEE' ? 'cursor-not-allowed opacity-70' : ''}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-purple-600' : 'border-slate-300'}`}>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    className="hidden"
                                                    checked={isSelected}
                                                    disabled={userRole === 'EMPLOYEE'}
                                                    onChange={() => userRole !== 'EMPLOYEE' && setInterestCalcType(type)}
                                                />
                                                {label}
                                            </label>
                                        );
                                    })}
                                </div>
                                <p className="mt-1.5 text-[10px] text-slate-400 font-medium">
                                    {interestCalcType === 'flat' ? 'Calculated on original principal.' : 'Calculated on outstanding balance.'}
                                </p>
                            </div>
                        </div>

                        {/* Show EMI table for Loan OR for Salary Advance with Interest > 0 and Tenure > 1 */}
                        {(loanType === 'Loan' || (loanType === 'Salary Advance' && (parseFloat(interestRate) || 0) > 0 && (parseInt(maxTenure) || 0) > 1)) && (
                            <div className="grid grid-cols-2 gap-6">
                                {userRole !== 'EMPLOYEE' && (
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                                            {loanType === 'Loan' ? 'REPAYMENT MONTH' : 'REPAYMENT MONTH'}
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={repaymentMonth}
                                                onChange={(e) => setRepaymentMonth(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none cursor-pointer font-bold"
                                            >
                                                <option>February 2026</option>
                                                <option>March 2026</option>
                                                <option>April 2026</option>
                                            </select>
                                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                )}
                                <div className={`bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-3 ${(userRole === 'EMPLOYEE' || loanType === 'Salary Advance') ? 'col-span-2' : ''}`}>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">MONTHLY EMI</span>
                                        <span className="text-lg font-black text-emerald-600">₹{stats.emi.toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-slate-100" />
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-slate-400">Principal</span>
                                            <span className="text-slate-700 font-bold">₹{(parseFloat(requestedAmount) || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-slate-400">Total Interest</span>
                                            <span className="text-slate-700 font-bold">₹{stats.totalInterest.toLocaleString()}</span>
                                        </div>
                                        <div className="h-px border-t border-dashed border-slate-200 my-1" />
                                        <div className="flex justify-between text-xs font-medium pt-1">
                                            <span className="text-slate-600 font-black">Total Payable</span>
                                            <span className="text-slate-900 font-black">₹{stats.totalPayable.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {loanType === 'Salary Advance' && userRole !== 'EMPLOYEE' && (
                            <div className="max-w-md">
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">REPAYMENT MONTH</label>
                                <div className="relative">
                                    <select
                                        value={repaymentMonth}
                                        onChange={(e) => setRepaymentMonth(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none cursor-pointer"
                                    >
                                        <option>February 2026</option>
                                        <option>March 2026</option>
                                        <option>April 2026</option>
                                    </select>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                                {loanType === 'Salary Advance' && (parseInt(maxTenure) || 0) === 1 && (
                                    <p className="mt-3 text-xs text-purple-600 font-medium bg-purple-50 p-3 rounded-xl border border-purple-100 flex items-center gap-2.5">
                                        <Info size={14} className="flex-shrink-0" />
                                        <span>This advance will be recovered in full from the <span className="font-bold underline">{repaymentMonth}</span> payroll.</span>
                                    </p>
                                )}
                            </div>
                        )}


                        {/* Reason/Purpose */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Reason/Purpose <span className="text-rose-500">*</span></label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all min-h-[100px] resize-none"
                                placeholder="Brief reason for the loan request..."
                            />
                        </div>

                        {/* Approval Flow Section */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-4">Approval Flow</label>
                            <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/30 space-y-4">
                                {/* Manual approver addition removed per requirement */}

                                {/* Approvers List Area */}
                                <div className="min-h-[80px] border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-4">
                                    {approvers.length === 0 ? (
                                        <p className="text-xs italic text-slate-400 font-medium">No approvers added. Requests will be auto-approved or routed to admin.</p>
                                    ) : (
                                        <div className="w-full flex flex-wrap gap-2">
                                            {approvers.map((app, idx) => (
                                                <div key={app.id} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm group transition-all">
                                                    <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                                                    <span className="font-bold text-slate-700">{app.first_name} {app.last_name}</span>
                                                    {/* Approver reordering removed per requirement - view only hierarchy */}
                                                    {/* Approver removal removed per requirement */}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 sticky bottom-0 z-10 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all border shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all transform active:scale-95"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

import { ViewState, UserRole } from '../types';

interface LoansAdvancesProps {
    userRole: UserRole;
    currentEmployeeId?: string;
}

const LoansAdvances: React.FC<LoansAdvancesProps> = ({ userRole, currentEmployeeId }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [viewLoan, setViewLoan] = useState<LoanRequest | null>(null);
    const [editLoan, setEditLoan] = useState<LoanRequest | null>(null);
    const [approveLoan, setApproveLoan] = useState<LoanRequest | null>(null);
    const [rejectLoan, setRejectLoan] = useState<LoanRequest | null>(null);
    const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Data State (Supabase)
    const [loans, setLoans] = useState<LoanRequest[]>([]);
    
     const fetchLoans = async () => {
         const { data, error } = await supabase.from('employee_loans').select('*').order('created_at', { ascending: false });
         let dbLoans: LoanRequest[] = [];
         
         if (!error && data && data.length > 0) {
             dbLoans = data.map((item: any) => {
                 const emp = MOCK_EMPLOYEES.find(e => e.id === item.employee_id || e.employee_id === item.employee_id) || MOCK_EMPLOYEES[0];
                 return {
                     id: item.id,
                     employee: {
                         name: `${emp.first_name} ${emp.last_name}`,
                         id: emp.employee_id,
                         department: emp.department,
                         ctc: String(emp.ctc || 'N/A'),
                         avatar: emp.avatar_url
                     },
                     type: item.loan_type,
                     requestedAmount: item.amount,
                     approvedAmount: item.approved_amount || item.amount,
                     requestDate: item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
                     status: item.status,
                     emiAmount: item.emi_amount,
                     totalEmis: item.tenure_months,
                     remainingBalance: item.remaining_balance || item.amount,
                     interestRate: item.interest_rate,
                     interestCalcType: item.interest_calc_type || 'flat',
                     disbursedDate: item.disbursed_date,
                     repaymentSchedule: item.repayment_schedule,
                     reason: item.reason,
                     repaymentMonth: item.repayment_month
                 };
             });
         }
         
         // Merge DB loans with MOCK_LOANS (DB loans take priority if IDs clash, though unlikely)
         const combined = [...dbLoans, ...MOCK_LOANS.filter(ml => !dbLoans.some(dl => dl.id === ml.id))];
         setLoans(combined);
     };

    useEffect(() => {
        fetchLoans();
    }, []);

    const allLoans = loans;

    const displayLoans = useMemo(() => {
        let filtered = allLoans;
        if (userRole === 'EMPLOYEE' && currentEmployeeId) {
            filtered = filtered.filter(l => l.employee.id === currentEmployeeId);
        }
        return filtered.filter(loan =>
            `${loan.employee.name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${loan.id}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allLoans, userRole, currentEmployeeId, searchTerm]);

    // Metrics calculation based on filtered data (for Employee) or all data (for HR)
    const metricsData = useMemo(() => {
        let baseLoans = allLoans;
        if (userRole === 'EMPLOYEE' && currentEmployeeId) {
            baseLoans = baseLoans.filter(l => l.employee.id === currentEmployeeId);
        }

        const activeCount = baseLoans.filter(l => ['Approved', 'Active', 'Repaying'].includes(l.status)).length;
        const totalOutstanding = baseLoans.reduce((acc, l) => acc + (l.remainingBalance || 0), 0);
        const totalLoanIssued = 520000; // Dummy amount
        const overdueAmount = 45000; // Dummy amount

        return { activeCount, totalOutstanding, totalLoanIssued, overdueAmount };
    }, [allLoans, userRole, currentEmployeeId]);

    const handleUpdateLoan = async (updatedLoan: LoanRequest) => {
        const payload = {
            loan_type: updatedLoan.type,
            amount: updatedLoan.requestedAmount,
            status: updatedLoan.status,
            reason: updatedLoan.reason,
            tenure_months: updatedLoan.totalEmis,
            interest_rate: updatedLoan.interestRate,
            emi_amount: updatedLoan.emiAmount,
            remaining_balance: updatedLoan.remainingBalance,
            repayment_month: updatedLoan.repaymentMonth
        };
        await supabase.from('employee_loans').update(payload).eq('id', updatedLoan.id);
        fetchLoans();
        setEditLoan(null);
    };

    const handleApproveAction = async (id: string, amount: number, remarks: string) => {
        const loan = loans.find(l => l.id === id);
        if (!loan) return;
        const status = amount < loan.requestedAmount ? 'Partially Approved' : 'Approved';
        const dummySchedule = Array.from({ length: loan.totalEmis || 12 }).map((_, i) => ({
            emiNo: i + 1,
            dueDate: '31 Jan 2026', // Mock date
            amount: Math.round(amount / (loan.totalEmis || 12)),
            status: 'Pending'
        }));
        
        await supabase.from('employee_loans').update({
            status,
            approved_amount: amount,
            remaining_balance: amount,
            repayment_schedule: dummySchedule
        }).eq('id', id);
        fetchLoans();
    };

    const handleRejectAction = async (id: string, reason: string) => {
        await supabase.from('employee_loans').update({
            status: 'Rejected',
            reason: reason
        }).eq('id', id);
        fetchLoans();
    };

    const calculateInitialEmi = (requestedAmount: number, interestRate: number, maxTenure: number) => {
        const p = parseFloat(requestedAmount as any) || 0;
        const r = (parseFloat(interestRate as any) || 0) / 12 / 100;
        const n = parseInt(maxTenure as any) || 0;
        if (p === 0 || n === 0) return 0;
        let emi = 0;
        if (r === 0) {
            emi = p / n;
        } else {
            emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        }
        return Math.round(emi);
    };

    const handleCreateRequest = async (data: any) => {
        const selectedEmp = MOCK_EMPLOYEES.find(e => e.id === data.employeeId || e.employee_id === data.employeeId);
        if (selectedEmp) {
            const requestedAmount = data.requestedAmount || 0;
            const maxTenure = data.maxTenure || 1;
            const interestRate = data.interestRate || 0;
            
            const payload = {
                employee_id: selectedEmp.id,
                loan_type: data.loanType === 'Salary Advance' ? 'Salary Advance' : 'Loan',
                amount: requestedAmount,
                status: 'Pending',
                reason: data.reason || 'Requested based on requirements.',
                tenure_months: maxTenure,
                interest_rate: interestRate,
                remaining_balance: requestedAmount,
                emi_amount: calculateInitialEmi(requestedAmount, interestRate, maxTenure),
                repayment_month: data.repaymentMonth || 'February 2026',
                interest_calc_type: data.interestCalcType || 'flat'
            };
            
            await supabase.from('employee_loans').insert([payload]);
            fetchLoans();
        }
        setIsNewRequestOpen(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 animate-in fade-in duration-300 relative">

            {/* Top Summary Cards */}
            <div className={`bg-white border-b border-slate-200 px-6 py-4 grid ${userRole === 'EMPLOYEE' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'} gap-4 shrink-0`}>
                {userRole !== 'EMPLOYEE' && (
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Active Loans</span>
                        <span className="text-xl font-bold text-slate-800">{metricsData.activeCount}</span>
                    </div>
                )}
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Outstanding</span>
                    <span className="text-xl font-bold text-orange-600">₹{(metricsData.totalOutstanding / 100000).toFixed(2)}L</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Loan Amount Issued</span>
                    <span className="text-xl font-bold text-slate-800">₹{(metricsData.totalLoanIssued / 100000).toFixed(2)}L</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {userRole === 'EMPLOYEE' ? 'Upcoming EMIs' : 'Overdue EMIs'}
                    </span>
                    <span className={`text-xl font-bold ${userRole === 'EMPLOYEE' ? 'text-blue-600' : 'text-rose-600'} flex items-center gap-1`}>
                        {userRole === 'EMPLOYEE' ? <Calendar size={16} /> : <AlertCircle size={16} />}
                        ₹{metricsData.overdueAmount.toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content (Full Width Table) */}
                <div className="flex-1 flex flex-col bg-white w-full">

                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3 items-center bg-white">
                        <div className="flex items-center gap-2 flex-1">
                            <div className="relative">
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-purple-600 transition-colors shadow-sm"
                                >
                                    <Sigma size={18} className="text-purple-600" />
                                    <ChevronDown size={14} className="text-slate-400" />
                                </button>
                                {isFilterOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
                                        <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1">
                                            Select Filter Field
                                        </div>
                                        {userRole !== 'EMPLOYEE' && (
                                            <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-purple-600 flex items-center gap-3 transition-colors">
                                                <User size={16} className="text-slate-400" /> Employee Name
                                            </button>
                                        )}
                                        <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-purple-600 flex items-center gap-3 transition-colors">
                                            <CreditCard size={16} className="text-slate-400" /> Loan Type
                                        </button>
                                        <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-purple-600 flex items-center gap-3 transition-colors">
                                            <Calendar size={16} className="text-slate-400" /> Request Date
                                        </button>
                                        <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-purple-600 flex items-center gap-3 transition-colors">
                                            <Activity size={16} className="text-slate-400" /> Status
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Filter Results..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                />
                            </div>

                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                                Filter
                            </button>
                        </div>

                        <button
                            onClick={() => setIsNewRequestOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 shadow-sm transition-all ml-2"
                        >
                            New Request
                        </button>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase sticky top-0 z-10 shadow-sm border-b border-slate-200">
                                <tr>
                                    {userRole !== 'EMPLOYEE' && <th className="px-6 py-3">Employee Name & ID</th>}
                                    <th className="px-6 py-3">Loan Type</th>
                                    <th className="px-6 py-3 text-right">Requested Amount</th>
                                    <th className="px-6 py-3 text-right">Approved Amount</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Monthly EMI Amount</th>
                                    <th className="px-6 py-3 text-right">Total EMIs</th>
                                    <th className="px-6 py-3 text-right">Balance Remaining</th>
                                    <th className="px-6 py-3">Created By</th>
                                    <th className="px-6 py-3">Last Modified By</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {displayLoans.map(loan => (
                                    <tr
                                        key={loan.id}
                                        className="hover:bg-slate-50 transition-colors group"
                                    >
                                        {userRole !== 'EMPLOYEE' && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={loan.employee.avatar} alt="" className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 object-cover" />
                                                    <div>
                                                        <div className="font-bold text-slate-800">{loan.employee.name}</div>
                                                        <div className="text-xs text-slate-400 font-mono">{loan.employee.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${getTypeColor(loan.type)}`}>
                                                {loan.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-600">₹{(loan.requestedAmount || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-800">{loan.approvedAmount ? `₹${loan.approvedAmount.toLocaleString()}` : '—'}</td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const displayStatus = userRole === 'EMPLOYEE' 
                                                    ? (['Active', 'Repaying'].includes(loan.status) ? 'Active' : (['Approved', 'Partially Approved'].includes(loan.status) ? 'Approved' : loan.status))
                                                    : loan.status;
                                                const statusColor = getStatusColor(displayStatus);
                                                return (
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusColor}`}>
                                                        {displayStatus}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-600 font-bold">
                                            {loan.emiAmount ? `₹${loan.emiAmount.toLocaleString()}` : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-600">
                                            {loan.totalEmis || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-800">
                                            {loan.remainingBalance !== undefined ? `₹${loan.remainingBalance.toLocaleString()}` : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-600">HR Manager</span>
                                            {loan.requestDate && <p className="text-[10px] text-slate-400 mt-0.5">{loan.requestDate}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-600">HR Manager</span>
                                            {loan.requestDate && <p className="text-[10px] text-slate-400 mt-0.5">{loan.requestDate}</p>}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setViewLoan(loan)}
                                                    className="p-1.5 hover:bg-slate-200 rounded text-slate-500"
                                                    title="View Details"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                {loan.status === 'Pending' && (
                                                    <button
                                                        onClick={() => setEditLoan(loan)}
                                                        className="p-1.5 hover:bg-slate-200 rounded text-slate-500"
                                                        title="Edit Request"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                )}
                                             </div>
                                         </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {viewLoan && (
                <ViewLoanModal 
                    loan={viewLoan} 
                    userRole={userRole}
                    onClose={() => setViewLoan(null)} 
                    onEdit={(l) => { setViewLoan(null); setEditLoan(l); }}
                    onApprove={(l) => { setViewLoan(null); setApproveLoan(l); }}
                    onReject={(l) => { setViewLoan(null); setRejectLoan(l); }}
                />
            )}

            {editLoan && (
                <EditLoanModal
                    loan={editLoan}
                    onClose={() => setEditLoan(null)}
                    onSave={handleUpdateLoan}
                />
            )}

            {approveLoan && (
                <ApproveLoanModal
                    loan={approveLoan}
                    onClose={() => setApproveLoan(null)}
                    onApprove={(amount, remarks) => handleApproveAction(approveLoan.id, amount, remarks)}
                />
            )}

            {rejectLoan && (
                <RejectLoanModal
                    loan={rejectLoan}
                    onClose={() => setRejectLoan(null)}
                    onReject={(reason) => handleRejectAction(rejectLoan.id, reason)}
                />
            )}

            {isNewRequestOpen && (
                <CreateLoanModal
                    userRole={userRole}
                    currentEmployeeId={currentEmployeeId}
                    onClose={() => setIsNewRequestOpen(false)}
                    onSave={handleCreateRequest}
                />
            )}

        </div>
    );
};

export default LoansAdvances;
