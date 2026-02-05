
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
  switch(status) {
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
    switch(type) {
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
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
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
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Requested Amount</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:border-purple-500"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tenure (Months)</label>
                        <input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"/>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 text-sm">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 text-sm shadow-sm flex items-center gap-2"><Save size={16}/> Save Changes</button>
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
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
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
                        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className={`w-full px-3 py-2 border rounded-lg text-sm font-bold focus:outline-none transition-colors ${isPartial ? 'border-amber-400 focus:border-amber-500' : 'border-slate-200 focus:border-emerald-500'}`}/>
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
                        <Check size={16}/> {isPartial ? 'Approve Partial' : 'Approve'}
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
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
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
                    <button onClick={() => { onReject(reason); onClose(); }} disabled={!reason.trim()} className="px-6 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 text-sm shadow-sm flex items-center gap-2 disabled:opacity-50"><XCircle size={16}/> Reject</button>
                </div>
            </div>
        </div>
    );
};

// New Modal Component
const NewLoanRequestModal: React.FC<{ onClose: () => void; onSubmit: (data: any) => void }> = ({ onClose, onSubmit }) => {
  // State for form fields
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loanType, setLoanType] = useState('Salary Advance');
  const [amount, setAmount] = useState<string>('50000');
  const [reason, setReason] = useState('');
  const [interest, setInterest] = useState('0');
  const [tenure, setTenure] = useState<string>('5');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [notify, setNotify] = useState(true);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Approvers State
  const [approvers, setApprovers] = useState(['Finance Head', 'Director']);
  const [approverSearch, setApproverSearch] = useState('');
  const [showApproverList, setShowApproverList] = useState(false);

  // Mock Data
  const employees = [
      { name: 'Priya Sharma', id: 'TF00912', department: 'Engineering', ctc: '₹18.5 L', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
      { name: 'Arjun Mehta', id: 'AC04567', department: 'Sales', ctc: '₹24.0 L', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  ];
  
  // Mock Approvers
  const allApprovers = [
    { name: 'Amit Verma', role: 'HR Manager' },
    { name: 'Rajesh Kumar', role: 'Finance Head' },
    { name: 'Sunita Gupta', role: 'Director' },
    { name: 'Vikram Singh', role: 'Manager' }
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
  }

  const selectEmployee = (emp: any) => {
      setSelectedEmployee(emp);
      setSearchQuery('');
      if(errors.employee) setErrors(prev => ({...prev, employee: ''}));
  }

  const handleTenureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (/^\d*$/.test(val)) {
          setTenure(val);
          if (errors.tenure) setErrors(prev => ({...prev, tenure: ''}));
      }
  };

  const handleAddApprover = (name: string) => {
      if (!approvers.includes(name)) {
          setApprovers([...approvers, name]);
      }
      setShowApproverList(false);
      setApproverSearch('');
  };

  const removeApprover = (name: string) => {
      setApprovers(approvers.filter(a => a !== name));
  };

  // EMI Calc & Breakdown
  const { emi, totalRepayment, totalInterest } = useMemo(() => {
      const p = parseFloat(amount) || 0;
      const r = parseFloat(interest) || 0;
      const n = parseFloat(tenure) || 0;
      
      if (p === 0 || n === 0) return { emi: 0, totalRepayment: 0, totalInterest: 0 };
      if (r === 0) {
          const e = p / n;
          return { emi: e, totalRepayment: p, totalInterest: 0 };
      }
      
      const rMon = r / 1200;
      const e = (p * rMon * Math.pow(1 + rMon, n)) / (Math.pow(1 + rMon, n) - 1);
      const total = e * n;
      return { emi: e, totalRepayment: total, totalInterest: total - p };
  }, [amount, interest, tenure]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedEmployee) newErrors.employee = 'Employee is required';
    if (!amount || Number(amount) <= 0) newErrors.amount = 'Amount is required';
    if (!reason.trim()) newErrors.reason = 'Reason is required';
    if (!tenure || Number(tenure) <= 0) newErrors.tenure = 'Tenure is required';
    if (!startDate) newErrors.startDate = 'Start Date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitRequest = () => {
    if (validate()) {
        onSubmit({
             // ... data structure
             status: 'Requested'
        });
    }
  };

  return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header - Light Blue */}
              <div className="px-6 py-4 border-b border-sky-100 bg-sky-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-lg">New Loan Request</h3>
                  <button onClick={onClose} className="p-2 hover:bg-sky-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                      <X size={20} />
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* Top Section - Employee Selection */}
                  <div className="space-y-4">
                      <label className="block text-xs font-bold text-slate-500 uppercase">Select Employee <span className="text-rose-500">*</span></label>
                      {!selectedEmployee ? (
                          <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                              <input 
                                  type="text" 
                                  placeholder="Search by name or ID" 
                                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 ${errors.employee ? 'border-rose-500' : 'border-slate-200'}`}
                                  value={searchQuery}
                                  onChange={handleSearch}
                              />
                              {errors.employee && <p className="text-xs text-rose-500 mt-1">{errors.employee}</p>}
                              {searchQuery && (
                                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 p-1">
                                      {employees.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase())).map(emp => (
                                          <div key={emp.id} onClick={() => selectEmployee(emp)} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                                              <img src={emp.avatar} className="w-8 h-8 rounded-full" />
                                              <div>
                                                  <div className="text-sm font-bold text-slate-700">{emp.name}</div>
                                                  <div className="text-xs text-slate-500">{emp.id}</div>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      ) : (
                          <div className="flex items-center justify-between p-4 border border-purple-100 bg-purple-50/30 rounded-xl">
                              <div className="flex items-center gap-4">
                                  <img src={selectedEmployee.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                                  <div>
                                      <h4 className="font-bold text-slate-800">{selectedEmployee.name}</h4>
                                      <p className="text-xs text-slate-500">{selectedEmployee.department} • CTC: {selectedEmployee.ctc}</p>
                                  </div>
                              </div>
                              <button onClick={() => setSelectedEmployee(null)} className="text-xs font-bold text-purple-600 hover:text-purple-700">Change</button>
                          </div>
                      )}
                  </div>

                  {/* Middle Section - Loan Details */}
                  <div className="space-y-6">
                      <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Loan Configuration</h4>
                      
                      <div className="grid grid-cols-2 gap-6">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Loan Type <span className="text-rose-500">*</span></label>
                              <select 
                                  value={loanType} 
                                  onChange={(e) => setLoanType(e.target.value)}
                                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-purple-500"
                              >
                                  <option>Salary Advance</option>
                                  <option>Personal Loan</option>
                                  <option>Festival Advance</option>
                                  <option>Medical Advance</option>
                                  <option>Education Loan</option>
                                  <option>Other</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Requested Amount <span className="text-rose-500">*</span></label>
                              <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                  <input 
                                      type="number" 
                                      value={amount} 
                                      onChange={(e) => {
                                          setAmount(e.target.value);
                                          if(errors.amount) setErrors(prev => ({...prev, amount: ''}));
                                      }}
                                      className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-purple-500 ${errors.amount ? 'border-rose-500' : 'border-slate-200'}`}
                                      placeholder="0.00"
                                  />
                              </div>
                              {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Reason / Purpose <span className="text-rose-500">*</span></label>
                          <textarea 
                              value={reason} 
                              onChange={(e) => {
                                  setReason(e.target.value);
                                  if(errors.reason) setErrors(prev => ({...prev, reason: ''}));
                              }}
                              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-purple-500 min-h-[80px] resize-none ${errors.reason ? 'border-rose-500' : 'border-slate-200'}`}
                              placeholder="e.g., Medical emergency"
                          />
                          {errors.reason && <p className="text-xs text-rose-500 mt-1">{errors.reason}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Interest Rate (% p.a.)</label>
                              <input 
                                  type="number" 
                                  value={interest} 
                                  onChange={(e) => setInterest(e.target.value)}
                                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Number of EMIs <span className="text-rose-500">*</span></label>
                              <input 
                                  type="text" 
                                  value={tenure} 
                                  onChange={handleTenureChange}
                                  placeholder="Enter months"
                                  className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:border-purple-500 ${errors.tenure ? 'border-rose-500' : 'border-slate-200'}`}
                              />
                              {errors.tenure && <p className="text-xs text-rose-500 mt-1">{errors.tenure}</p>}
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 items-start">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">EMI Start Date <span className="text-rose-500">*</span></label>
                              <input 
                                  type="date" 
                                  value={startDate} 
                                  onChange={(e) => {
                                      setStartDate(e.target.value);
                                      if(errors.startDate) setErrors(prev => ({...prev, startDate: ''}));
                                  }}
                                  className={`w-full px-3 py-2.5 border rounded-lg text-sm text-slate-600 focus:outline-none focus:border-purple-500 ${errors.startDate ? 'border-rose-500' : 'border-slate-200'}`}
                              />
                              {errors.startDate && <p className="text-xs text-rose-500 mt-1">{errors.startDate}</p>}
                          </div>
                          
                          {/* Updated Breakdown Section */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                              <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
                                  <span className="text-xs font-bold text-slate-500 uppercase">Monthly EMI</span>
                                  <span className="text-lg font-bold text-emerald-600">₹{Math.round(emi).toLocaleString()}</span>
                              </div>
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                  <div className="flex justify-between">
                                      <span className="text-slate-400">Principal</span>
                                      <span className="font-semibold text-slate-700">₹{parseFloat(amount || '0').toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                       <span className="text-slate-400">Total Interest</span>
                                       <span className="font-semibold text-slate-700">₹{Math.round(totalInterest).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between pt-1 mt-1 border-t border-slate-200 border-dashed">
                                       <span className="text-slate-500 font-bold">Total Payable</span>
                                       <span className="font-bold text-slate-800">₹{Math.round(totalRepayment).toLocaleString()}</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* File Upload */}
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-purple-300 transition-colors cursor-pointer bg-slate-50/50">
                          <Upload size={24} className="text-slate-400 mb-2" />
                          <p className="text-sm font-medium text-slate-600">Drag & drop supporting docs here</p>
                          <p className="text-xs text-slate-400 mt-1">PDF, JPG up to 5MB (Optional)</p>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">HR Internal Notes</label>
                          <textarea 
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 min-h-[60px] resize-none"
                              placeholder="Notes visible only to admins..."
                          />
                      </div>
                  </div>

                  {/* Bottom Section - Workflow */}
                  <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Approval Workflow</h4>
                      
                      {/* Auto-approve field removed */}

                      <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-700">Notification to Employee</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={notify} onChange={() => setNotify(!notify)} className="sr-only peer" />
                              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                      </div>

                      <div className="relative">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Require Approval From</label>
                          <div className="flex gap-2 flex-wrap mb-2">
                              {approvers.map(role => (
                                  <span key={role} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                                      {role} <X size={12} className="cursor-pointer hover:text-indigo-900" onClick={() => removeApprover(role)}/>
                                  </span>
                              ))}
                              <button 
                                onClick={() => setShowApproverList(!showApproverList)}
                                className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-xs font-medium rounded-full hover:bg-slate-50 flex items-center gap-1"
                              >
                                  <Plus size={12} /> Add Approver
                              </button>
                          </div>
                          
                          {/* Approver Dropdown */}
                          {showApproverList && (
                             <div className="absolute top-full left-0 z-10 w-64 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 p-2">
                                <input 
                                    type="text" 
                                    autoFocus
                                    placeholder="Search employees..." 
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm mb-2 focus:outline-none focus:border-purple-500"
                                    value={approverSearch}
                                    onChange={e => setApproverSearch(e.target.value)}
                                />
                                <div className="max-h-40 overflow-y-auto">
                                    {allApprovers.filter(a => a.name.toLowerCase().includes(approverSearch.toLowerCase())).map(a => (
                                        <div 
                                            key={a.name} 
                                            onClick={() => handleAddApprover(a.name)}
                                            className="px-3 py-2 hover:bg-slate-50 cursor-pointer rounded text-sm text-slate-700"
                                        >
                                            <div className="font-bold">{a.name}</div>
                                            <div className="text-xs text-slate-500">{a.role}</div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                          )}
                      </div>
                  </div>
              </div>

              {/* Footer Banner removed */}

              {/* Action Buttons */}
              <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                  <button onClick={onClose} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm">
                      Cancel
                  </button>
                  {/* Removed Save as Draft button here */}
                  <button 
                      onClick={handleSubmitRequest}
                      className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-sm transition-colors text-sm flex items-center gap-2"
                  >
                      Submit Request
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
                  repaymentSchedule: Array.from({length: l.totalEmis || 12}).map((_, i) => ({
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
      // In a real app, this would add a new loan request to the list
      // For demo, we are just closing the modal.
      // But we can simulate adding it to show Draft status if data has it.
      if (data && data.status) {
          console.log("Creating request with status:", data.status);
          // Logic to add to list would go here if full state management was needed
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
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 shadow-sm flex items-center gap-2 transition-colors ml-2"
                    >
                        <Plus size={16} /> New Loan Request
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
                                                <Eye size={14}/>
                                            </button>
                                            {loan.status === 'Requested' && (
                                                <>
                                                    <button 
                                                        onClick={() => setApproveLoan(loan)}
                                                        className="p-1.5 hover:bg-emerald-100 text-slate-500 hover:text-emerald-600 rounded" 
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={14}/>
                                                    </button>
                                                    <button 
                                                        onClick={() => setRejectLoan(loan)}
                                                        className="p-1.5 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded" 
                                                        title="Reject"
                                                    >
                                                        <XCircle size={14}/>
                                                    </button>
                                                </>
                                            )}
                                            {loan.status === 'Active' && (
                                                <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500" title="Statement"><Download size={14}/></button>
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
            <NewLoanRequestModal 
                onClose={() => setIsNewRequestOpen(false)} 
                onSubmit={handleCreateRequest} 
            />
        )}

    </div>
  );
};

export default LoansAdvances;
