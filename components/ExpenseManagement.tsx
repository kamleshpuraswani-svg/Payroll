
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
import { MOCK_CLAIMS, ExpenseClaim, ClaimProof } from './mockData';

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
    const s = status.toUpperCase().replace(/ /g, '_');
    switch (s) {
        case 'PENDING': return 'bg-orange-50 text-orange-700 border-orange-100';
        case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        case 'PARTIALLY_APPROVED': return 'bg-amber-50 text-amber-700 border-amber-100';
        case 'REJECTED': return 'bg-rose-50 text-rose-700 border-rose-100';
        default: return 'bg-slate-50 text-slate-600 border-slate-200';
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

const ViewClaimPanel: React.FC<{
    claim: ExpenseClaim;
    onClose: () => void;
    onViewProof: (proof: ClaimProof) => void;
    onDownloadProof: (proof: ClaimProof) => void;
}> = ({ claim, onClose, onViewProof, onDownloadProof }) => {
    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[115] bg-slate-900/10 backdrop-blur-[1px] animate-in fade-in duration-300" onClick={onClose} />
            
            {/* Panel */}
            <div className="fixed inset-y-0 right-0 w-[540px] z-[120] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="h-20 px-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Claim Details</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all border border-slate-100">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {/* Employee Profile Snippet */}
                    <div className="flex items-center gap-4 p-5 border border-slate-100 rounded-2xl bg-slate-50/50">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                            <img src={claim.employee.avatar} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between w-full">
                                <h4 className="font-bold text-slate-800 text-base">{claim.employee.name}</h4>
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-widest ${getStatusBadge(claim.status)}`}>
                                    {claim.status}
                                </span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{claim.employee.department} • ID: {claim.employee.id}</p>
                        </div>
                    </div>

                    {/* Claim Summary */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">General Information</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Claim Category</span>
                                <span className="text-sm font-bold text-slate-800">{claim.category}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Claimed Amount</span>
                                <span className="text-sm font-black text-slate-800">₹{claim.amount.toLocaleString('en-IN')}</span>
                            </div>
                            {claim.approvedAmount && (
                                <div className="flex justify-between items-center p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Approved Amount</span>
                                    <span className="text-sm font-black text-emerald-700">₹{claim.approvedAmount.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Date</span>
                                <span className="text-sm font-bold text-slate-800">{claim.submittedDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Rejection Reason */}
                    {claim.rejectionReason && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                            <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Rejection Reason</h4>
                            <p className="text-sm text-rose-800 font-medium">{claim.rejectionReason}</p>
                        </div>
                    )}

                    {/* Attached Proofs */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attached Receipts ({claim.proofs.length})</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {claim.proofs.map((proof, i) => (
                                <div key={i} className="group relative border border-slate-100 rounded-2xl bg-slate-50 flex flex-col items-center justify-center p-4 text-center transition-all hover:border-purple-200 hover:bg-white hover:shadow-xl hover:shadow-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 mb-3 group-hover:text-purple-500 transition-colors">
                                        <FileText size={20} />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-600 line-clamp-1 w-full px-2">{proof.name}</p>
                                    <span className="text-[9px] font-bold text-slate-300 mt-1 uppercase">{proof.size}</span>

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-slate-900/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onViewProof(proof); }}
                                            className="w-10 h-10 bg-white shadow-xl border border-slate-100 rounded-xl text-slate-700 hover:text-purple-600 transition-all hover:scale-110 flex items-center justify-center"
                                            title="View"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDownloadProof(proof); }}
                                            className="w-10 h-10 bg-white shadow-xl border border-slate-100 rounded-xl text-slate-700 hover:text-purple-600 transition-all hover:scale-110 flex items-center justify-center"
                                            title="Download"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Expense Items List */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expense Items List</h4>
                        <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                            <table className="w-full text-left text-xs border-collapse font-bold">
                                <thead className="bg-white border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-4 py-3">Expense Date</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(claim.items || []).map((item: any, i: number) => (
                                        <tr key={i} className="hover:bg-white transition-colors">
                                            <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                                {item.expenseDate ? new Date(item.expenseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-800 line-clamp-1">{item.category}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5 line-clamp-1">{item.reason || item.description}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex flex-col items-end">
                                                    {(claim.status === 'Partially Approved' || (item.approvedAmount !== undefined && item.approvedAmount < (item.amount || 0))) ? (
                                                        <>
                                                            <span className="text-[9px] text-slate-400 line-through font-bold">₹{(item.amount || 0).toLocaleString('en-IN')}</span>
                                                            <span className="text-emerald-600 font-black">₹{(item.approvedAmount !== undefined ? item.approvedAmount : item.amount).toLocaleString('en-IN')}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-800 font-black">₹{(item.amount || 0).toLocaleString('en-IN')}</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!claim.items || claim.items.length === 0) && (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-6 text-center text-slate-300 italic font-medium">No individual items recorded</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
                    <button onClick={onClose} className="px-8 py-3 bg-blue-600 border border-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all text-[11px] uppercase tracking-widest shadow-lg shadow-blue-500/25">
                        Close
                    </button>
                </div>
            </div>
        </>
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
    onConfirm: (action: 'FULL' | 'PARTIAL' | 'REJECT', amount?: number, reason?: string, itemAmounts?: {[key: string | number]: number}) => void;
}> = ({ claim, onClose, onConfirm }) => {
    const [action, setAction] = useState<'FULL' | 'PARTIAL' | 'REJECT'>('FULL');
    const [itemAmounts, setItemAmounts] = useState<{[key: string | number]: number}>(
        (claim.items || []).reduce((acc: any, item: any, idx: number) => {
            acc[item.id || idx] = item.amount || 0;
            return acc;
        }, {})
    );
    const [reason, setReason] = useState('');

    const totalApprovedAmount = Object.values(itemAmounts).reduce((sum, val) => sum + val, 0);

    const handleSubmit = () => {
        if ((action === 'REJECT' || action === 'PARTIAL') && !reason.trim()) return;
        onConfirm(action, totalApprovedAmount, reason, itemAmounts);
        onClose();
    };

    const handleItemAmountChange = (id: string | number, val: number) => {
        setItemAmounts(prev => ({ ...prev, [id]: val }));
    };

    const isFormValid = action === 'FULL' || (reason.trim().length > 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 text-lg">Action Claim</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                    {/* Employee & Base Info */}
                    <div className="flex items-center gap-4 p-5 border border-slate-100 rounded-2xl bg-white shadow-sm ring-4 ring-slate-50">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                            <img src={claim.employee.avatar} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-slate-800 text-base">{claim.employee.name}</h4>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">Submitted: {claim.submittedDate}</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{claim.employee.department} • ID: {claim.employee.id}</p>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Claimed Amount</p>
                            <p className="text-xl font-black text-slate-800">₹{claim.amount.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</p>
                            <p className="text-sm font-bold text-slate-700">{claim.category}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Select Action</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button onClick={() => setAction('FULL')} className={`p-3 rounded-xl border text-sm font-bold transition-all ${action === 'FULL' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>Full Approve</button>
                            <button onClick={() => setAction('PARTIAL')} className={`p-3 rounded-xl border text-sm font-bold transition-all ${action === 'PARTIAL' ? 'bg-yellow-50 border-yellow-500 text-yellow-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>Partial Approve</button>
                            <button onClick={() => setAction('REJECT')} className={`p-3 rounded-xl border text-sm font-bold transition-all ${action === 'REJECT' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>Reject</button>
                        </div>
                    </div>

                    {action === 'PARTIAL' && (
                        <div className="animate-in fade-in slide-in-from-top-2 border border-yellow-100 bg-yellow-50/30 rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-3 bg-yellow-50 border-b border-yellow-100 flex justify-between items-center">
                                <label className="text-[10px] font-black text-yellow-800 uppercase tracking-widest">Adjust Approved Amounts</label>
                                <span className="text-xs font-black text-yellow-700">Total Approved: ₹{totalApprovedAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="max-h-[220px] overflow-y-auto p-3 space-y-2 custom-scrollbar">
                                {(claim.items || []).map((item: any, idx: number) => {
                                    const itemId = item.id || idx;
                                    return (
                                        <div key={itemId} className="flex flex-col gap-2 p-3 bg-white border border-yellow-100/50 rounded-xl">
                                            <div className="flex justify-between items-start">
                                                <div className="max-w-[70%]">
                                                    <p className="text-[10px] font-bold text-slate-700 line-clamp-1 leading-tight">{item.reason || item.description}</p>
                                                    <p className="text-[9px] text-slate-400 uppercase font-bold mt-0.5 tracking-tight">{item.category} • {item.expenseDate ? new Date(item.expenseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}</p>
                                                </div>
                                                <p className="text-[10px] font-black text-slate-400">Claimed: ₹{(item.amount || 0).toLocaleString('en-IN')}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-slate-400">Approved: ₹</span>
                                                <input
                                                    type="number"
                                                    value={itemAmounts[itemId]}
                                                    onChange={(e) => handleItemAmountChange(itemId, parseInt(e.target.value) || 0)}
                                                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 bg-slate-50/50"
                                                    max={item.amount || 0}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {(action === 'REJECT' || action === 'PARTIAL') && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                                Reason <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 min-h-[100px] resize-none bg-slate-50/30 font-medium"
                                placeholder={`Include a reason for ${action === 'REJECT' ? 'rejecting' : 'partial approval'}...`}
                                required
                            ></textarea>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">Cancel</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!isFormValid}
                        className={`px-8 py-2 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all ${isFormValid ? 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
                    >
                        Confirm
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
const ExpenseManagement: React.FC<{ 
    onChangeView: (view: ViewState) => void,
    onEditClaim?: (id: string) => void 
}> = ({ onChangeView, onEditClaim }) => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [claims, setClaims] = useState<ExpenseClaim[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null);
    const [viewClaim, setViewClaim] = useState<ExpenseClaim | null>(null);
    const [approveClaim, setApproveClaim] = useState<ExpenseClaim | null>(null);
    const [downloadClaim, setDownloadClaim] = useState<ExpenseClaim | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoadingData(true);
        try {
            // Fetch employees (all, to ensure past/transitionary claims match)
            const { data: empData } = await supabase
                .from('employees')
                .select('id, name, eid, avatar_url, department, company_name')
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
                    const rawStatus = (c.status || 'pending').toLowerCase();
                    let displayStatus: 'Pending' | 'Approved' | 'Partially Approved' | 'Rejected' = 'Pending';
                    
                    if (rawStatus === 'approved') displayStatus = 'Approved';
                    else if (rawStatus === 'rejected') displayStatus = 'Rejected';
                    else if (rawStatus === 'partially_approved' || rawStatus === 'partial') displayStatus = 'Partially Approved';

                    const emp = empData.find(e => e.id === c.employee_id);
                    
                    // Fallback name from title if emp mapping fails (AddExpenseScreen sets "Claim by [Name]")
                    const fallbackNameFromTitle = c.title?.startsWith('Claim by ') ? c.title.replace('Claim by ', '') : 'Unknown Employee';

                    const totalApproved = (c.items || []).reduce((sum: number, it: any) => sum + (it.approvedAmount !== undefined ? it.approvedAmount : (it.amount || 0)), 0);

                    return {
                        id: c.id,
                        employee: {
                            name: emp?.name || fallbackNameFromTitle,
                            id: emp?.eid || emp?.id || 'N/A',
                            department: emp?.department || 'N/A',
                            ctc: 'N/A',
                            avatar: emp?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                        },
                        category: c.category,
                        amount: c.total_amount,
                        approvedAmount: displayStatus === 'Partially Approved' ? totalApproved : undefined,
                        submittedDate: c.submitted_at ? new Date(c.submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
                        status: displayStatus,
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
                        ],
                        items: c.items || [],
                        title: c.title
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

    const handleActionConfirm = async (action: 'FULL' | 'PARTIAL' | 'REJECT', amount?: number, reason?: string, itemApprovals?: {[key: string | number]: number}) => {
        if (!approveClaim) return;

        let status: 'approved' | 'partially_approved' | 'rejected' = 'approved';
        if (action === 'PARTIAL') status = 'partially_approved';
        if (action === 'REJECT') status = 'rejected';

        // Update items with approved amounts if partial
        const updatedItems = (approveClaim.items || []).map((item: any, idx: number) => {
            const itemId = item.id || idx;
            return {
                ...item,
                approvedAmount: action === 'FULL' ? item.amount : (itemApprovals ? itemApprovals[itemId] : item.amount)
            };
        });

        // Determine if it's a mock claim (EXP-001, EXP-002, etc.) or a real one
        const isMock = approveClaim.id.startsWith('EXP-00');

        try {
            if (!isMock) {
                const { error } = await supabase
                    .from('reimbursement_claims')
                    .update({
                        status: status,
                        items: updatedItems,
                        title: reason && status === 'rejected' ? `Rejected: ${reason}` : (approveClaim.title || `Claim by ${approveClaim.employee.name}`), // Storing reason in title if no column exists
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', approveClaim.id);

                if (error) throw error;
            }

            // Update local state (works for both real and mock)
            const displayStatus = (status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')) as any;
            
            setClaims(prev => prev.map(c => {
                if (c.id === approveClaim.id) {
                    return {
                        ...c,
                        status: displayStatus,
                        approvedAmount: amount, // Keep track of the total approved locally
                        items: updatedItems,
                        rejectionReason: reason,
                        lastModifiedBy: new Date().toLocaleString('en-GB'),
                        lastModifiedByName: 'HR Manager'
                    };
                }
                return c;
            }));

            let message = '';
            let type: 'success' | 'error' = 'success';
            switch (action) {
                case 'FULL': message = 'Claim fully approved successfully'; break;
                case 'PARTIAL': message = `Claim partially approved for ₹${amount}`; break;
                case 'REJECT': message = 'Claim rejected successfully'; type = 'error'; break;
            }

            setShowSuccessToast({ message, type });
        } catch (error) {
            console.error('Error updating claim:', error);
            setShowSuccessToast({ message: 'Failed to update claim status. Please try again.', type: 'error' });
        } finally {
            setTimeout(() => setShowSuccessToast(null), 3000);
            setApproveClaim(null); // Close approve modal
        }
    };

    const handleSaveEdit = (updatedClaim: ExpenseClaim) => {
        // This is now handled in AddExpenseScreen
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
                                    <th className="px-6 py-3 border-b border-slate-200">Status</th>
                                    <th className="px-6 py-3 border-b border-slate-200 text-center whitespace-nowrap">Expense Date</th>
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
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${getStatusBadge(claim.status)}`}>
                                                {claim.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-center font-bold text-xs">{claim.submittedDate}</td>
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
                                                {['PENDING'].includes(claim.status.toUpperCase()) && (
                                                    <button
                                                        className="p-1.5 hover:bg-slate-200 rounded text-slate-500"
                                                        title="Edit Claim"
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            if (onEditClaim) onEditClaim(claim.id);
                                                        }}
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                )}
                                                {['PENDING', 'MORE INFO REQUESTED'].includes(claim.status.toUpperCase()) && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setApproveClaim(claim); }}
                                                        className="p-1.5 hover:bg-emerald-100 text-slate-500 hover:text-emerald-600 rounded"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={14} />
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

            {/* View Only Claim Right Side Panel */}
            {viewClaim && (
                <ViewClaimPanel
                    claim={viewClaim}
                    onClose={() => setViewClaim(null)}
                    onViewProof={(proof) => setViewingProof(proof)}
                    onDownloadProof={(proof) => handleDownloadProof(proof)}
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
