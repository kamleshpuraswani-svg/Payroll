
import React, { useState, useEffect } from 'react';
import {
    Search,
    Bell,
    Eye,
    Edit2,
    CheckCircle,
    XCircle,
    MessageSquare,
    Download,
    Paperclip,
    ChevronDown,
    Check,
    X,
    AlertCircle,
    Smartphone,
    MapPin,
    BookOpen,
    Fuel,
    Activity,
    FileText,
    Image as ImageIcon,
    Save,
    Trash2,
    Calendar,
    ArrowLeft,
    Send,
    UserCircle,
    LayoutGrid,
    Search as SearchIcon,
    Plus as PlusIcon,
    Plus,
    ChevronRight as ChevronRightIcon,
    AlertCircle as AlertIcon,
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { ViewState } from '../types';

// --- Types ---

interface ClaimProof {
    id: string;
    name: string;
    type: 'pdf' | 'jpg' | 'png';
    size: string;
}

interface ExpenseClaim {
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
    status: 'Pending' | 'Approved' | 'Partially Approved' | 'Rejected' | 'More Info Requested';
    approvedAmount?: number;
    requestedOn: string;
    createdByName: string;
    lastModifiedBy: string;
    lastModifiedByName: string;
    activityLog: { text: string; date: string }[];
}

// --- Mock Data ---

const MOCK_CLAIMS: ExpenseClaim[] = [
    {
        id: 'EXP-001',
        employee: {
            name: 'Priya Sharma',
            id: 'TF00912',
            department: 'Sales',
            ctc: '₹24.0 L',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        },
        category: 'Medical',
        amount: 15400,
        submittedDate: '18 Dec 2025',
        proofs: Array(4).fill({ id: 'x', name: 'Bill.pdf', type: 'pdf', size: '1.2 MB' }),
        status: 'Pending',
        requestedOn: '18 Dec 2025, 10:30 AM',
        createdByName: 'Priya Sharma',
        lastModifiedBy: '18 Dec 2025, 10:30 AM',
        lastModifiedByName: 'Priya Sharma',
        activityLog: [{ text: 'Submitted by employee', date: '18 Dec 2025' }]
    },
    {
        id: 'EXP-002',
        employee: {
            name: 'Arjun Mehta',
            id: 'AC04567',
            department: 'Sales',
            ctc: '₹24.0 L',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        },
        category: 'Telephone',
        amount: 8200,
        submittedDate: '15 Dec 2025',
        proofs: [
            { id: 'p1', name: 'Airtel_Bill_Oct.pdf', type: 'pdf', size: '450 KB' },
            { id: 'p2', name: 'Airtel_Bill_Nov.pdf', type: 'pdf', size: '480 KB' }
        ],
        status: 'More Info Requested',
        requestedOn: '15 Dec 2025, 02:15 PM',
        createdByName: 'Arjun Mehta',
        lastModifiedBy: '16 Dec 2025, 11:00 AM',
        lastModifiedByName: 'HR Manager',
        activityLog: [
            { text: 'Submitted by employee', date: '15 Dec 2025' },
            { text: 'HR requested clarification: Missing Oct bill', date: '16 Dec 2025' }
        ]
    },
    {
        id: 'EXP-003',
        employee: {
            name: 'Neha Kapoor',
            id: 'SU00234',
            department: 'Product',
            ctc: '₹15.8 L',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        },
        category: 'LTA',
        amount: 45000,
        submittedDate: '12 Dec 2025',
        proofs: Array(6).fill({ id: 'x', name: 'Travel_Ticket.pdf', type: 'pdf', size: '1.5 MB' }),
        status: 'Partially Approved',
        approvedAmount: 38000,
        requestedOn: '12 Dec 2025, 09:45 AM',
        createdByName: 'Neha Kapoor',
        lastModifiedBy: '14 Dec 2025, 04:30 PM',
        lastModifiedByName: 'HR Manager',
        activityLog: [
            { text: 'Submitted by employee', date: '12 Dec 2025' },
            { text: 'Approved partial amount (Policy limit)', date: '14 Dec 2025' }
        ]
    },
    {
        id: 'EXP-004',
        employee: {
            name: 'Rohan Desai',
            id: 'GL07890',
            department: 'DevOps',
            ctc: '₹21.2 L',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        },
        category: 'Books',
        amount: 4800,
        submittedDate: '10 Dec 2025',
        proofs: Array(3).fill({ id: 'x', name: 'Amazon_Invoice.pdf', type: 'pdf', size: '320 KB' }),
        status: 'Approved',
        requestedOn: '10 Dec 2025, 03:20 PM',
        createdByName: 'Rohan Desai',
        lastModifiedBy: '11 Dec 2025, 10:15 AM',
        lastModifiedByName: 'HR Manager',
        activityLog: [
            { text: 'Submitted by employee', date: '10 Dec 2025' },
            { text: 'Approved by HR', date: '11 Dec 2025' }
        ]
    },
    {
        id: 'EXP-005',
        employee: {
            name: 'Ananya Patel',
            id: 'TF01145',
            department: 'Finance',
            ctc: '₹14.5 L',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        },
        category: 'Fuel',
        amount: 12000,
        submittedDate: '08 Dec 2025',
        proofs: Array(5).fill({ id: 'x', name: 'Petrol_Bill.pdf', type: 'pdf', size: '250 KB' }),
        status: 'Rejected',
        requestedOn: '08 Dec 2025, 11:50 AM',
        createdByName: 'Ananya Patel',
        lastModifiedBy: '09 Dec 2025, 02:40 PM',
        lastModifiedByName: 'HR Manager',
        activityLog: [
            { text: 'Submitted by employee', date: '08 Dec 2025' },
            { text: 'Rejected: Duplicate bill', date: '09 Dec 2025' }
        ]
    }
];

// --- Helpers ---

const getClaimTypeColor = (type: string) => {
    switch (type) {
        case 'Medical': return 'bg-orange-50 text-orange-700 border-orange-100';
        case 'Telephone': return 'bg-blue-50 text-blue-700 border-blue-100';
        case 'LTA':
        case 'Travel': return 'bg-green-50 text-green-700 border-green-100';
        case 'Books': return 'bg-purple-50 text-purple-700 border-purple-100';
        case 'Fuel': return 'bg-slate-100 text-slate-700 border-slate-200';
        case 'Meal': return 'bg-amber-50 text-amber-700 border-amber-100';
        default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Pending': return 'bg-orange-50 text-orange-700 border-orange-100';
        case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        case 'Partially Approved': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
        case 'Rejected': return 'bg-rose-50 text-rose-700 border-rose-100';
        case 'More Info Requested': return 'bg-purple-50 text-purple-700 border-purple-100';
        default: return 'bg-slate-50 text-slate-600';
    }
};

const getClaimIcon = (type: string) => {
    switch (type) {
        case 'Medical': return <Activity size={14} />;
        case 'Telephone': return <Smartphone size={14} />;
        case 'LTA':
        case 'Travel': return <MapPin size={14} />;
        case 'Books': return <BookOpen size={14} />;
        case 'Fuel': return <Fuel size={14} />;
        case 'Meal': return <Activity size={14} />; // Using Activity for now or should I use a better icon?
        default: return <FileText size={14} />;
    }
};

// --- Modals ---

const ViewClaimModal: React.FC<{
    claim: ExpenseClaim;
    onClose: () => void;
    onViewProof: (proof: ClaimProof) => void;
    onDownloadProof: (proof: ClaimProof) => void;
}> = ({ claim, onClose, onViewProof, onDownloadProof }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 text-lg">Claim Details</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Employee Profile Snippet */}
                    <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                            <img src={claim.employee.avatar} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">{claim.employee.name}</h4>
                            <p className="text-xs text-slate-500">{claim.employee.department} • CTC: {claim.employee.ctc}</p>
                        </div>
                    </div>

                    {/* Claim Summary */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Claim Summary</h4>
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadge(claim.status)}`}>
                                {claim.status}
                            </span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between p-3 border border-slate-100 rounded-lg">
                                <span className="text-sm text-slate-600">Claim Type</span>
                                <span className="text-sm font-bold text-slate-800">{claim.category}</span>
                            </div>
                            <div className="flex justify-between p-3 border border-slate-100 rounded-lg">
                                <span className="text-sm text-slate-600">Claimed Amount</span>
                                <span className="text-sm font-bold text-slate-800">₹{claim.amount.toLocaleString()}</span>
                            </div>
                            {claim.approvedAmount && (
                                <div className="flex justify-between p-3 border border-emerald-100 bg-emerald-50 rounded-lg">
                                    <span className="text-sm text-emerald-800 font-medium">Approved Amount</span>
                                    <span className="text-sm font-bold text-emerald-800">₹{claim.approvedAmount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between p-3 border border-slate-100 rounded-lg">
                                <span className="text-sm text-slate-600">Submitted Date</span>
                                <span className="text-sm font-bold text-slate-800">{claim.submittedDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Attached Proofs */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Attached Proofs ({claim.proofs.length})</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {claim.proofs.map((proof, i) => (
                                <div key={i} className="group relative aspect-square border border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-3 text-center transition-all hover:border-purple-300 hover:shadow-sm">
                                    <FileText size={24} className="text-slate-400 mb-2 group-hover:text-purple-500 transition-colors" />
                                    <p className="text-[10px] font-medium text-slate-600 line-clamp-2 w-full">{proof.name}</p>
                                    <span className="text-[9px] text-slate-400 mt-1">{proof.size}</span>

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-slate-900/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onViewProof(proof); }}
                                            className="p-1.5 bg-white shadow-sm border border-slate-200 rounded-lg text-slate-700 hover:text-purple-600 transition-transform hover:scale-110"
                                            title="View"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDownloadProof(proof); }}
                                            className="p-1.5 bg-white shadow-sm border border-slate-200 rounded-lg text-slate-700 hover:text-purple-600 transition-transform hover:scale-110"
                                            title="Download"
                                        >
                                            <Download size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Activity Log */}
                    <div className="pt-6 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Activity Log</h4>
                        <div className="space-y-4">
                            {claim.activityLog.map((log, i) => (
                                <div key={i} className="flex gap-3 relative group">
                                    {i !== claim.activityLog.length - 1 && <div className="absolute left-[9px] top-6 bottom-[-20px] w-0.5 bg-slate-100"></div>}
                                    <div className="w-5 h-5 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center shrink-0 z-10 group-hover:bg-purple-100 transition-colors">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-purple-600 transition-colors"></div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-700">{log.text}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{log.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition-colors text-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditClaimModal: React.FC<{
    claim: ExpenseClaim;
    onClose: () => void;
    onSave: (claim: ExpenseClaim) => void;
}> = ({ claim, onClose, onSave }) => {
    const [amount, setAmount] = useState(claim.amount);
    const [type, setType] = useState(claim.category);
    const [date, setDate] = useState(claim.submittedDate); // Assuming strict formatting in real app

    const handleSave = () => {
        onSave({
            ...claim,
            amount,
            category: type,
            submittedDate: date
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 text-lg">Edit Claim</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Claim Amount (₹)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Claim Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        >
                            <option value="Medical">Medical</option>
                            <option value="Telephone">Telephone</option>
                            <option value="LTA">LTA</option>
                            <option value="Books">Books</option>
                            <option value="Fuel">Fuel</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Date</label>
                        <input
                            type="text"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 text-sm">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 text-sm shadow-sm flex items-center gap-2">
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

const ApproveClaimModal: React.FC<{
    claim: ExpenseClaim;
    onClose: () => void;
    onConfirm: (action: 'FULL' | 'PARTIAL' | 'REJECT' | 'INFO', amount?: number, reason?: string) => void;
}> = ({ claim, onClose, onConfirm }) => {
    const [action, setAction] = useState<'FULL' | 'PARTIAL' | 'REJECT' | 'INFO'>('FULL');
    const [amount, setAmount] = useState<number>(claim.amount);
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
        onConfirm(action, amount, reason);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 text-lg">Action Claim</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Claimed Amount</p>
                            <p className="text-xl font-bold text-slate-800">₹{claim.amount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase">Type</p>
                            <p className="text-sm font-semibold text-slate-700">{claim.category}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Select Action</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setAction('FULL')} className={`p-3 rounded-xl border text-sm font-bold transition-all ${action === 'FULL' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>Full Approve</button>
                            <button onClick={() => setAction('PARTIAL')} className={`p-3 rounded-xl border text-sm font-bold transition-all ${action === 'PARTIAL' ? 'bg-yellow-50 border-yellow-500 text-yellow-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>Partial Approve</button>
                            <button onClick={() => setAction('REJECT')} className={`p-3 rounded-xl border text-sm font-bold transition-all ${action === 'REJECT' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>Reject</button>
                            <button onClick={() => setAction('INFO')} className={`p-3 rounded-xl border text-sm font-bold transition-all ${action === 'INFO' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>Request Info</button>
                        </div>
                    </div>

                    {action === 'PARTIAL' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Approved Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
                            />
                        </div>
                    )}

                    {(action === 'REJECT' || action === 'PARTIAL' || action === 'INFO') && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Remarks / Reason</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 min-h-[80px] resize-none"
                                placeholder="Add a note..."
                            ></textarea>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 text-sm">Cancel</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 text-sm shadow-sm">
                        Confirm Action
                    </button>
                </div>
            </div>
        </div>
    );
};

const DownloadClaimModal: React.FC<{
    claim: ExpenseClaim;
    onClose: () => void;
    onDownload: (proof: ClaimProof) => void;
}> = ({ claim, onClose, onDownload }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 text-lg">Download Attachments</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-slate-500 mb-4">Select attachments to download for <span className="font-bold text-slate-700">{claim.employee.name}</span>'s claim.</p>
                    <div className="space-y-2">
                        {claim.proofs.map((proof, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                        {proof.type === 'pdf' ? <FileText size={18} /> : <ImageIcon size={18} />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">{proof.name}</p>
                                        <p className="text-xs text-slate-400">{proof.size}</p>
                                    </div>
                                </div>
                                <button onClick={() => onDownload(proof)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                                    <Download size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 text-sm">Close</button>
                </div>
            </div>
        </div>
    );
};


// --- Main Container ---

const ExpenseManagement: React.FC<{ onChangeView: (view: ViewState) => void }> = ({ onChangeView }) => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [claims, setClaims] = useState<ExpenseClaim[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null);
    const [viewClaim, setViewClaim] = useState<ExpenseClaim | null>(null);
    const [editClaim, setEditClaim] = useState<ExpenseClaim | null>(null);
    const [approveClaim, setApproveClaim] = useState<ExpenseClaim | null>(null);
    const [downloadClaim, setDownloadClaim] = useState<ExpenseClaim | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoadingData(true);
        try {
            // Fetch employees
            const { data: empData } = await supabase
                .from('employees')
                .select('id, name, eid, avatar_url, department, company_name')
                .eq('status', 'Active')
                .order('name');
            if (empData) setEmployees(empData);

            // Fetch categories
            const { data: catData } = await supabase
                .from('expense_categories')
                .select('*')
                .eq('status', 'Active')
                .order('name');
            if (catData) setCategories(catData);

            // Fetch real claims
            const { data: claimData } = await supabase
                .from('reimbursement_claims')
                .select('*')
                .order('submitted_at', { ascending: false });

            if (claimData && empData) {
                const mappedClaims: ExpenseClaim[] = claimData.map(c => {
                    const emp = empData.find(e => e.id === c.employee_id);
                    return {
                        id: c.id,
                        employee: {
                            name: emp?.name || 'Unknown Employee',
                            id: emp?.eid || emp?.id || 'N/A',
                            department: emp?.department || 'N/A',
                            ctc: 'N/A',
                            avatar: emp?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                        },
                        category: c.category,
                        amount: c.total_amount,
                        submittedDate: c.submitted_at ? new Date(c.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
                        status: (c.status.charAt(0).toUpperCase() + c.status.slice(1)) as any,
                        proofs: (c.items || []).filter((it: any) => it.receiptName).map((it: any, i: number) => ({
                            id: `p-${i}`,
                            name: it.receiptName,
                            type: 'pdf',
                            size: '0 KB'
                        })),
                        requestedOn: c.submitted_at ? new Date(c.submitted_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A',
                        createdByName: emp?.name || 'Unknown',
                        lastModifiedBy: c.updated_at ? new Date(c.updated_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : (c.submitted_at ? new Date(c.submitted_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'),
                        lastModifiedByName: c.status === 'pending' ? (emp?.name || 'Employee') : 'HR Manager',
                        activityLog: [
                            { text: 'Submitted by employee', date: c.submitted_at ? new Date(c.submitted_at).toLocaleDateString('en-GB') : 'N/A' }
                        ]
                    };
                });
                setClaims([...mappedClaims, ...MOCK_CLAIMS]);
            } else {
                setClaims(MOCK_CLAIMS);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [showSuccessToast, setShowSuccessToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [viewingProof, setViewingProof] = useState<ClaimProof | null>(null);

    // Summary Stats
    const stats = [
        { 
            label: 'TOTAL CLAIMED (FY)', 
            val: `₹${(claims.reduce((s, c) => s + c.amount, 0)).toLocaleString('en-IN')}`, 
            color: 'text-slate-800', 
            subtitle: 'Apr 2025 – Mar 2026',
            highlight: true 
        },
        { label: 'Total Claims', val: claims.length.toString(), color: 'text-slate-800' },
        { label: 'Pending Approval', val: claims.filter(c => c.status === 'Pending').length.toString(), color: 'text-orange-600' },
        { 
            label: 'Approved & Paid', 
            val: `₹${(claims.filter(c => c.status === 'Approved' || c.status === 'Partially Approved').reduce((s, c) => s + (c.approvedAmount || c.amount), 0) / 100000).toFixed(2)}L`, 
            color: 'text-emerald-600' 
        },
    ];

    const handleActionConfirm = (action: 'FULL' | 'PARTIAL' | 'REJECT' | 'INFO', amount?: number, reason?: string) => {
        let message = '';
        let type: 'success' | 'error' = 'success';

        switch (action) {
            case 'FULL': message = 'Claim fully approved successfully'; break;
            case 'PARTIAL': message = `Claim partially approved for ₹${amount}`; break;
            case 'REJECT': message = 'Claim rejected successfully'; type = 'error'; break;
            case 'INFO': message = 'Request for information sent to employee'; break;
        }

        setShowSuccessToast({ message, type });
        setTimeout(() => setShowSuccessToast(null), 3000);
        setApproveClaim(null); // Close approve modal
    };

    const handleSaveEdit = (updatedClaim: ExpenseClaim) => {
        // In real app, update state/API here
        setShowSuccessToast({ message: 'Claim updated successfully', type: 'success' });
        setTimeout(() => setShowSuccessToast(null), 3000);
        setEditClaim(null); // Close edit modal
    };

    const handleDownloadProof = (proof: ClaimProof) => {
        // Mock download logic using a text file since we don't have real file URLs
        const text = `This is a placeholder for the proof document: ${proof.name}\nSize: ${proof.size}\nType: ${proof.type}`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = proof.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 animate-in fade-in duration-300 relative">

            {/* Top Stats Bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 shrink-0">
                {stats.map((stat, i) => (
                    <div key={i} className={`flex flex-col p-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:bg-slate-50/50 ${stat.highlight ? 'bg-purple-50/30' : 'bg-white'}`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</span>
                        <span className={`text-xl font-bold ${stat.color}`}>{stat.val}</span>
                        {stat.subtitle && <span className="text-[10px] text-slate-500 mt-1">{stat.subtitle}</span>}
                    </div>
                ))}
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Table Area (Full Width) */}
                <div className="flex-1 flex flex-col bg-white w-full">

                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3 items-center bg-white">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search employee, claim category..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                    />
                                </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                                Employee <ChevronDown size={14} />
                            </button>
                            <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                                Claim Category <ChevronDown size={14} />
                            </button>
                            <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                                Status <ChevronDown size={14} />
                            </button>
                                <button
                                    onClick={() => onChangeView(ViewState.HR_ADD_EXPENSE)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 font-bold flex items-center gap-2 shadow-md shadow-purple-100 transition-all ml-auto"
                                >
                                    Add Expense for Employee
                                </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-3 border-b border-slate-200">Employee Name & ID</th>
                                    <th className="px-6 py-3 border-b border-slate-200">Claim Category</th>
                                    <th className="px-6 py-3 border-b border-slate-200">Claim Amount</th>
                                    <th className="px-6 py-3 border-b border-slate-200">Expense Date</th>
                                    <th className="px-6 py-3 border-b border-slate-200">Status</th>
                                    <th className="px-6 py-3 border-b border-slate-200">Created By</th>
                                    <th className="px-6 py-3 border-b border-slate-200">Last Modified By</th>
                                    <th className="px-4 py-3 border-b border-slate-200 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {claims
                                    .filter(c => 
                                        c.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        c.category.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map((claim) => (
                                    <tr
                                        key={claim.id}
                                        onClick={() => setViewClaim(claim)}
                                        className="cursor-pointer transition-colors group hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={claim.employee.avatar} alt="" className="w-8 h-8 rounded-full border border-slate-200" />
                                                <div>
                                                    <div className="font-bold text-slate-800">{claim.employee.name}</div>
                                                    <div className="text-xs text-slate-400 font-mono">{claim.employee.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${getClaimTypeColor(claim.category)}`}>
                                                {getClaimIcon(claim.category)} {claim.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700">₹{claim.amount.toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{claim.submittedDate}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(claim.status)}`}>
                                                {claim.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{claim.createdByName}</span>
                                                <span className="text-[10px] text-slate-400 whitespace-nowrap">{claim.requestedOn}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{claim.lastModifiedByName}</span>
                                                <span className="text-[10px] text-slate-400 whitespace-nowrap">{claim.lastModifiedBy}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="p-1.5 hover:bg-slate-200 rounded text-slate-500"
                                                    title="View Details"
                                                    onClick={(e) => { e.stopPropagation(); setViewClaim(claim); }}
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setApproveClaim(claim); }}
                                                    className="p-1.5 hover:bg-emerald-100 text-slate-500 hover:text-emerald-600 rounded"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={14} />
                                                </button>
                                                <button
                                                    className="p-1.5 hover:bg-slate-200 rounded text-slate-500"
                                                    title="Download"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDownloadClaim(claim);
                                                    }}
                                                >
                                                    <Download size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- PROOF VIEWER MODAL --- */}
            {viewingProof && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
                    {/* Close button */}
                    <button
                        onClick={() => setViewingProof(null)}
                        className="absolute top-4 right-4 p-2 bg-white/10 text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${viewingProof.type === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {viewingProof.type === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{viewingProof.name}</h3>
                                    <p className="text-xs text-slate-500">{viewingProof.size} • {viewingProof.type.toUpperCase()}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDownloadProof(viewingProof)}
                                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-2 shadow-sm"
                            >
                                <Download size={16} /> Download
                            </button>
                        </div>
                        <div className="flex-1 bg-slate-100 flex items-center justify-center p-8 overflow-auto">
                            {viewingProof.type === 'pdf' ? (
                                <div className="w-full h-full min-h-[400px] bg-white shadow-sm border border-slate-200 flex flex-col items-center justify-center text-slate-400 rounded-lg">
                                    <FileText size={64} className="mb-4 text-slate-300" />
                                    <p className="font-medium text-sm">PDF Preview Not Available</p>
                                    <p className="text-xs mt-1">Please download the file to view content.</p>
                                </div>
                            ) : (
                                <div className="relative group w-full h-full flex items-center justify-center">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-20"></div>
                                    <div className="bg-white p-2 rounded shadow-lg max-w-full max-h-full">
                                        {/* Placeholder image as we don't have real URLs */}
                                        <div className="w-[600px] h-[400px] bg-slate-200 flex items-center justify-center text-slate-500 rounded">
                                            <span className="font-medium">Image Preview: {viewingProof.name}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- CONFIRMATION & ACTION MODALS --- */}

            {/* Success Toast */}
            {showSuccessToast && (
                <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-[110] px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${showSuccessToast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}>
                    {showSuccessToast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-bold text-sm">{showSuccessToast.message}</span>
                </div>
            )}

            {/* View Only Claim Modal */}
            {viewClaim && (
                <ViewClaimModal
                    claim={viewClaim}
                    onClose={() => setViewClaim(null)}
                    onViewProof={(proof) => setViewingProof(proof)}
                    onDownloadProof={(proof) => handleDownloadProof(proof)}
                />
            )}

            {/* Edit Claim Modal */}
            {editClaim && (
                <EditClaimModal
                    claim={editClaim}
                    onClose={() => setEditClaim(null)}
                    onSave={handleSaveEdit}
                />
            )}

            {/* Approve Claim Modal */}
            {approveClaim && (
                <ApproveClaimModal
                    claim={approveClaim}
                    onClose={() => setApproveClaim(null)}
                    onConfirm={handleActionConfirm}
                />
            )}

            {/* Download Claim Modal */}
            {downloadClaim && (
                <DownloadClaimModal
                    claim={downloadClaim}
                    onClose={() => setDownloadClaim(null)}
                    onDownload={handleDownloadProof}
                />
            )}

            {/* Add Expense Screen removed - now controlled via App routing */}

        </div>
    );
};

export default ExpenseManagement;
