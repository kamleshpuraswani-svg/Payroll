
import React, { useState, useMemo, useEffect, useRef } from 'react';
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
    Activity
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
    type: 'Personal Loan' | 'Salary Advance' | 'Festival Advance' | 'Emergency Aid';
    requestedAmount: number;
    approvedAmount?: number;
    requestDate: string;
    status: 'Requested' | 'Approved' | 'Partially Approved' | 'Active' | 'Repaying' | 'Closed' | 'Rejected' | 'Draft';
    emiAmount?: number;
    totalEmis?: number;
    remainingBalance?: number;
    interestRate?: number;
    disbursedDate?: string;
    repaymentSchedule?: RepaymentScheduleItem[];
    reason: string;
}

// --- Mock Data ---

const MOCK_LOANS: LoanRequest[] = [
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
        type: 'Personal Loan',
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
            { emiNo: 1, dueDate: '31 Dec 2025', amount: 8500, deductedDate: '31 Dec 2025', status: 'Paid' },
            { emiNo: 2, dueDate: '31 Jan 2026', amount: 8500, status: 'Pending' },
            { emiNo: 3, dueDate: '28 Feb 2026', amount: 8500, status: 'Pending' },
            { emiNo: 4, dueDate: '31 Mar 2026', amount: 8500, status: 'Pending' },
        ]
    },
    {
        id: 'LN-003',
        employee: { name: 'Neha Kapoor', id: 'SU00234', department: 'Product', ctc: '₹15.8 L', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        type: 'Festival Advance',
        requestedAmount: 30000,
        requestDate: '15 Dec 2025',
        status: 'Requested',
        reason: 'Diwali Expenses',
        interestRate: 0
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
        type: 'Personal Loan',
        requestedAmount: 80000,
        approvedAmount: 0,
        requestDate: '12 Dec 2025',
        status: 'Rejected',
        reason: 'Policy Violation: Probation Period',
        interestRate: 10
    }
];

// --- Helpers ---

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Requested': return 'bg-orange-50 text-orange-700 border-orange-100';
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
        case 'Personal Loan': return 'text-purple-700 bg-purple-50 border-purple-100';
        case 'Festival Advance': return 'text-orange-700 bg-orange-50 border-orange-100';
        default: return 'text-slate-700 bg-slate-50 border-slate-100';
    }
};

// --- Modals ---

const ViewLoanModal: React.FC<{ loan: LoanRequest; onClose: () => void }> = ({ loan, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 text-lg">Loan Details</h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Employee Snippet */}
                <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <img src={loan.employee.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">{loan.employee.name}</h4>
                        <p className="text-xs text-slate-500">{loan.employee.department} • CTC: {loan.employee.ctc}</p>
                    </div>
                </div>

                {/* Loan Summary */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loan Summary</h4>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(loan.status)}`}>
                            {loan.status}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                            <p className="text-xs text-slate-500 mb-1">Type</p>
                            <p className="font-bold text-slate-800 text-sm">{loan.type}</p>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                            <p className="text-xs text-slate-500 mb-1">Requested Amount</p>
                            <p className="font-bold text-slate-800 text-sm">₹{loan.requestedAmount.toLocaleString()}</p>
                        </div>
                        {loan.approvedAmount && (
                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                                <p className="text-xs text-emerald-600 font-medium mb-1">Approved Amount</p>
                                <p className="font-bold text-emerald-800 text-sm">₹{loan.approvedAmount.toLocaleString()}</p>
                            </div>
                        )}
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                            <p className="text-xs text-slate-500 mb-1">Tenure</p>
                            <p className="font-bold text-slate-800 text-sm">{loan.totalEmis || '-'} Months</p>
                        </div>
                    </div>
                    {loan.reason && (
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                            <p className="text-xs text-slate-500 mb-1">Reason</p>
                            <p className="text-sm text-slate-700 italic">"{loan.reason}"</p>
                        </div>
                    )}
                </div>

                {/* Repayment Schedule */}
                {loan.repaymentSchedule && (
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Repayment Schedule</h4>
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-500 font-semibold">
                                    <tr>
                                        <th className="px-3 py-2 border-b border-slate-200">EMI</th>
                                        <th className="px-3 py-2 border-b border-slate-200">Due Date</th>
                                        <th className="px-3 py-2 border-b border-slate-200 text-right">Amount</th>
                                        <th className="px-3 py-2 border-b border-slate-200 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loan.repaymentSchedule.map((emi) => (
                                        <tr key={emi.emiNo} className="hover:bg-slate-50">
                                            <td className="px-3 py-2 text-slate-600">#{emi.emiNo}</td>
                                            <td className="px-3 py-2 text-slate-800 font-medium">{emi.dueDate}</td>
                                            <td className="px-3 py-2 text-right font-bold text-slate-700">₹{emi.amount.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right">
                                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${emi.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : emi.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {emi.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button onClick={onClose} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-100 text-sm">Close</button>
            </div>
        </div>
    </div>
);

const EditLoanModal: React.FC<{ loan: LoanRequest; onClose: () => void; onSave: (updated: LoanRequest) => void }> = ({ loan, onClose, onSave }) => {
    const [amount, setAmount] = useState(loan.requestedAmount);
    const [tenure, setTenure] = useState(loan.totalEmis || 12);

    const handleSave = () => {
        onSave({ ...loan, requestedAmount: amount, totalEmis: tenure });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 text-lg">Edit Loan Request</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Requested Amount</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:border-purple-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tenure (Months)</label>
                        <input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 text-sm">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 text-sm shadow-sm flex items-center gap-2"><Save size={16} /> Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const ApproveLoanModal: React.FC<{ loan: LoanRequest; onClose: () => void; onApprove: (amount: number, remarks: string) => void }> = ({ loan, onClose, onApprove }) => {
    const [amount, setAmount] = useState(loan.requestedAmount);
    const [remarks, setRemarks] = useState('');

    const isPartial = amount < loan.requestedAmount;

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
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Remarks (Optional)</label>
                        <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 h-24 resize-none" placeholder="Add any comments..."></textarea>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 text-sm">Cancel</button>
                    <button onClick={() => { onApprove(amount, remarks); onClose(); }} className={`px-6 py-2 text-white rounded-lg font-medium text-sm shadow-sm flex items-center gap-2 ${isPartial ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
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
const CreateLoanModal: React.FC<{ onClose: () => void; onSave: (data: any) => void }> = ({ onClose, onSave }) => {
    // Form State
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [loanType, setLoanType] = useState<'Salary Advance' | 'Loan'>('Salary Advance');
    const [interestRate, setInterestRate] = useState('0');
    const [maxTenure, setMaxTenure] = useState('0');
    const [repaymentMonth, setRepaymentMonth] = useState('February 2026');
    const [emiStartDate, setEmiStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [requestedAmount, setRequestedAmount] = useState('');
    const [reason, setReason] = useState('');

    // Approval Flow State
    const [approvers, setApprovers] = useState<any[]>([]);
    const [selectedApproverId, setSelectedApproverId] = useState('');

    const handleAddApprover = () => {
        const emp = MOCK_EMPLOYEES.find(e => e.id === selectedApproverId);
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
                    <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">SELECT EMPLOYEE <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <select
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">-- Choose Employee --</option>
                                {MOCK_EMPLOYEES.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

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
                        <div>
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

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">INTEREST RATE (% P.A.)</label>
                                <input
                                    type="text"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold"
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
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold"
                                    placeholder="e.g. 12"
                                />
                                <p className="mt-1.5 text-[10px] text-slate-400 font-medium">Max tenure allowed is 3 months.</p>
                            </div>
                        </div>

                        {loanType === 'Loan' && (
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">EMI START DATE</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={emiStartDate}
                                            onChange={(e) => setEmiStartDate(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold"
                                        />
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

                        {loanType === 'Salary Advance' && (
                            <div>
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
                            </div>
                        )}


                        {/* Reason/Purpose */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Reason/Purpose</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all min-h-[100px] resize-none"
                                placeholder="Brief reason for the loan request..."
                            />
                        </div>

                        {/* Approval Flow Section */}
                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-4">Approval Flow (Hierarchy)</label>
                            <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/30 space-y-4">
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <select
                                            value={selectedApproverId}
                                            onChange={(e) => setSelectedApproverId(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Employee to Add...</option>
                                            {MOCK_EMPLOYEES.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                    <button
                                        onClick={handleAddApprover}
                                        className="px-6 py-3 bg-purple-400 hover:bg-purple-500 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
                                    >
                                        <Plus size={18} /> Add
                                    </button>
                                </div>

                                {/* Approvers List Area */}
                                <div className="min-h-[80px] border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-4">
                                    {approvers.length === 0 ? (
                                        <p className="text-xs italic text-slate-400 font-medium">No approvers added. Requests will be auto-approved or routed to admin.</p>
                                    ) : (
                                        <div className="w-full flex flex-wrap gap-2">
                                            {approvers.map((app, idx) => (
                                                <div key={app.id} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm group transition-all">
                                                    <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                                                    <span className="font-bold text-slate-700">{app.name}</span>
                                                    <div className="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => moveApprover(idx, 'up')}
                                                            disabled={idx === 0}
                                                            title="Move Up"
                                                            className={`text-slate-400 hover:text-purple-600 p-0.5 rounded transition-colors ${idx === 0 ? 'opacity-20 cursor-not-allowed' : ''}`}
                                                        >
                                                            <ChevronUp size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => moveApprover(idx, 'down')}
                                                            disabled={idx === approvers.length - 1}
                                                            title="Move Down"
                                                            className={`text-slate-400 hover:text-purple-600 p-0.5 rounded transition-colors ${idx === approvers.length - 1 ? 'opacity-20 cursor-not-allowed' : ''}`}
                                                        >
                                                            <ChevronDown size={14} />
                                                        </button>
                                                    </div>
                                                    <button onClick={() => removeApprover(app.id)} className="text-slate-400 hover:text-rose-500 ml-1"><X size={14} /></button>
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
                        className="px-8 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all transform active:scale-95"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

const LoansAdvances: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [viewLoan, setViewLoan] = useState<LoanRequest | null>(null);
    const [editLoan, setEditLoan] = useState<LoanRequest | null>(null);
    const [approveLoan, setApproveLoan] = useState<LoanRequest | null>(null);
    const [rejectLoan, setRejectLoan] = useState<LoanRequest | null>(null);
    const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Data State (Mock)
    const [loans, setLoans] = useState(MOCK_LOANS);

    const filteredLoans = loans.filter(loan =>
        loan.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUpdateLoan = (updatedLoan: LoanRequest) => {
        setLoans(prev => prev.map(l => l.id === updatedLoan.id ? updatedLoan : l));
    };

    const handleApproveAction = (id: string, amount: number, remarks: string) => {
        setLoans(prev => prev.map(l => {
            if (l.id === id) {
                const status = amount < l.requestedAmount ? 'Partially Approved' : 'Approved';
                return {
                    ...l,
                    status: status,
                    approvedAmount: amount,
                    remainingBalance: amount, // Reset balance to approved amount
                    // Generate dummy schedule
                    repaymentSchedule: Array.from({ length: l.totalEmis || 12 }).map((_, i) => ({
                        emiNo: i + 1,
                        dueDate: '31 Jan 2026', // Mock date
                        amount: Math.round(amount / (l.totalEmis || 12)),
                        status: 'Pending'
                    }))
                } as LoanRequest;
            }
            return l;
        }));
    };

    const handleRejectAction = (id: string, reason: string) => {
        setLoans(prev => prev.map(l => l.id === id ? { ...l, status: 'Rejected', reason: reason } as LoanRequest : l));
    };

    const handleCreateRequest = (data: any) => {
        const selectedEmp = MOCK_EMPLOYEES.find(e => e.id === data.employeeId);
        if (selectedEmp) {
            const newRequest: LoanRequest = {
                id: `LN-${Date.now().toString().slice(-4)}`,
                employee: {
                    name: selectedEmp.name,
                    id: selectedEmp.eid,
                    department: selectedEmp.department,
                    ctc: selectedEmp.ctc || 'N/A',
                    avatar: selectedEmp.avatarUrl
                },
                type: data.loanType === 'Salary Advance' ? 'Salary Advance' : 'Personal Loan',
                requestedAmount: data.amount,
                requestDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                status: 'Requested',
                reason: data.reason,
                totalEmis: data.tenure,
                interestRate: data.loanType === 'Loan' ? 10.5 : 0, // Mock interest
                remainingBalance: data.amount
            };
            setLoans(prev => [newRequest, ...prev]);
        }
        setIsNewRequestOpen(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 animate-in fade-in duration-300 relative">

            {/* Top Summary Cards */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Active Loans</span>
                    <span className="text-xl font-bold text-slate-800">142</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Outstanding</span>
                    <span className="text-xl font-bold text-orange-600">₹48.62L</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requested This Month</span>
                    <span className="text-xl font-bold text-slate-800">28</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overdue EMIs</span>
                    <span className="text-xl font-bold text-rose-600 flex items-center gap-1"><AlertCircle size={16} /> 12</span>
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
                                        <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-purple-600 flex items-center gap-3 transition-colors">
                                            <User size={16} className="text-slate-400" /> Employee Name
                                        </button>
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
                            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 shadow-sm transition-all ml-2"
                        >
                            <Plus size={16} /> New Request
                        </button>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase sticky top-0 z-10 shadow-sm border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3">Employee Name & ID</th>
                                    <th className="px-6 py-3">Loan Type</th>
                                    <th className="px-6 py-3 text-right">Requested</th>
                                    <th className="px-6 py-3 text-right">Approved</th>
                                    <th className="px-6 py-3">Req. Date</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">EMI / Total</th>
                                    <th className="px-6 py-3 text-right">Balance</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLoans.map(loan => (
                                    <tr
                                        key={loan.id}
                                        className="hover:bg-slate-50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={loan.employee.avatar} alt="" className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 object-cover" />
                                                <div>
                                                    <div className="font-bold text-slate-800">{loan.employee.name}</div>
                                                    <div className="text-xs text-slate-400 font-mono">{loan.employee.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${getTypeColor(loan.type)}`}>
                                                {loan.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-600">₹{loan.requestedAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-800">{loan.approvedAmount ? `₹${loan.approvedAmount.toLocaleString()}` : '—'}</td>
                                        <td className="px-6 py-4 text-slate-500">{loan.requestDate}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(loan.status)}`}>
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-600">
                                            {loan.emiAmount ? (
                                                <>
                                                    <span className="font-bold">₹{loan.emiAmount.toLocaleString()}</span>
                                                    <span className="text-xs text-slate-400"> / {loan.totalEmis}</span>
                                                </>
                                            ) : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-800">
                                            {loan.remainingBalance !== undefined ? `₹${loan.remainingBalance.toLocaleString()}` : '—'}
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
                                                {loan.status === 'Requested' && (
                                                    <>
                                                        <button
                                                            onClick={() => setApproveLoan(loan)}
                                                            className="p-1.5 hover:bg-emerald-100 text-slate-500 hover:text-emerald-600 rounded"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectLoan(loan)}
                                                            className="p-1.5 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={14} />
                                                        </button>
                                                    </>
                                                )}
                                                {loan.status === 'Active' && (
                                                    <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500" title="Statement"><Download size={14} /></button>
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
                <ViewLoanModal loan={viewLoan} onClose={() => setViewLoan(null)} />
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
                    onClose={() => setIsNewRequestOpen(false)}
                    onSave={handleCreateRequest}
                />
            )}

        </div>
    );
};

export default LoansAdvances;
