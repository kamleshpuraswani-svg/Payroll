import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Trash2, 
    ArrowLeft, 
    Send, 
    MapPin, 
    Briefcase,
    DollarSign,
    Calendar,
    ChevronDown,
    Image as ImageIcon,
    Upload,
    Paperclip,
    X,
    Receipt,
    FileText,
    CheckCircle,
    Activity,
    Smartphone,
    BookOpen,
    Fuel,
    Edit2
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { MOCK_CLAIMS } from './mockData';


export interface AddExpenseScreenProps {
    onClose: () => void;
    onSuccess?: (message: string) => void;
    employees: any[];
    categories: any[];
    editId?: string;
}

export const AddExpenseScreen: React.FC<AddExpenseScreenProps> = ({ onClose, onSuccess, employees, categories, editId }) => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [expenseItems, setExpenseItems] = useState<any[]>([]);
    const [expenseFromDate, setExpenseFromDate] = useState(new Date().toISOString().split('T')[0]);
    const [expenseToDate, setExpenseToDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Form state for current item
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
    const [merchant, setMerchant] = useState('');
    const [project, setProject] = useState('');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [receipt, setReceipt] = useState<File | null>(null);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [editingItemId, setEditingItemId] = useState<number | string | null>(null);
    const [claimStatus, setClaimStatus] = useState('Pending');

    useEffect(() => {
        if (editId) {
            fetchClaimData();
        }
    }, [editId]);

    // Ensure expenseDate is valid when range changes
    useEffect(() => {
        if (expenseFromDate === expenseToDate) {
            setExpenseDate(expenseFromDate);
        } else {
            // If expenseDate is currently out of the new range, reset it to the start
            const current = new Date(expenseDate);
            const start = new Date(expenseFromDate);
            const end = new Date(expenseToDate);
            if (current < start || current > end) {
                setExpenseDate(expenseFromDate);
            }
        }
    }, [expenseFromDate, expenseToDate]);

    const fetchClaimData = async () => {
        setIsFetchingData(true);
        try {
            // Handle mock claims
            if (editId && editId.toString().startsWith('EXP-')) {
                const mockClaim = MOCK_CLAIMS.find(c => c.id === editId);
                if (mockClaim) {
                    setSelectedEmployeeId(mockClaim.employee.id || '');
                    const cat = categories.find(c => c.name === mockClaim.category);
                    setSelectedCategory(cat || null);
                    setClaimStatus(mockClaim.status);
                    
                    if (mockClaim.submittedDate) {
                        // Mock dates are already in reasonable format or handled by expenseDate normalization
                    }

                    const items = (mockClaim.items || []).map((item: any) => ({
                        ...item,
                        id: item.id || Date.now() + Math.random()
                    }));
                    setExpenseItems(items);
                    return;
                }
            }

            // Real claims from Supabase
            const { data, error } = await supabase
                .from('reimbursement_claims')
                .select('*')
                .eq('id', editId)
                .single();

            if (error) throw error;

            if (data) {
                setSelectedEmployeeId(data.employee_id || '');
                const catName = data.category ? data.category.split(', ')[0] : '';
                const cat = categories.find(c => c.name === catName);
                setSelectedCategory(cat || null);
                
                if (data.submitted_at) {
                    const date = new Date(data.submitted_at).toISOString().split('T')[0];
                    setExpenseFromDate(date);
                    setExpenseToDate(date);
                }

                // Map data items to our internal format if needed
                const items = (data.items || []).map((item: any) => ({
                    ...item,
                    id: item.id || Date.now() + Math.random()
                }));
                setExpenseItems(items);

                // Map status
                const rawStatus = (data.status || 'pending').toLowerCase();
                if (rawStatus === 'approved') setClaimStatus('Approved');
                else if (rawStatus === 'rejected') setClaimStatus('Rejected');
                else if (rawStatus === 'partially_approved' || rawStatus === 'partial') setClaimStatus('Partially Approved');
                else setClaimStatus('Pending');
            }
        } catch (error) {
            console.error('Error fetching claim data:', error);
        } finally {
            setIsFetchingData(false);
        }
    };

    const handleAddItem = () => {
        if (!amount || !reason) return;
        
        if (editingItemId !== null) {
            // Update existing item
            const updatedItems = expenseItems.map(item => {
                if (item.id === editingItemId) {
                    return {
                        ...item,
                        merchant,
                        project,
                        amount: parseFloat(amount),
                        reason,
                        receiptName: receipt ? receipt.name : item.receiptName,
                        category: selectedCategory?.name || '',
                        fromDate: expenseFromDate,
                        toDate: expenseToDate,
                        expenseDate: expenseDate
                    };
                }
                return item;
            });
            setExpenseItems(updatedItems);
            setEditingItemId(null);
        } else {
            // Add new item
            const newItem = {
                id: Date.now(),
                merchant,
                project,
                amount: parseFloat(amount),
                reason,
                receiptName: receipt ? receipt.name : null,
                category: selectedCategory?.name || '',
                fromDate: expenseFromDate,
                toDate: expenseToDate,
                expenseDate: expenseDate
            };
            setExpenseItems([...expenseItems, newItem]);
        }
        
        // Reset item fields
        setMerchant('');
        setProject('');
        setAmount('');
        setReason('');
        setReceipt(null);
        setSelectedCategory(null);
        setExpenseDate(expenseFromDate);
    };

    const handleEditItem = (item: any) => {
        setEditingItemId(item.id);
        setMerchant(item.merchant || '');
        setProject(item.project || '');
        setAmount(String(item.amount));
        setReason(item.reason || item.description || '');
        const cat = categories.find(c => c.name === item.category);
        setSelectedCategory(cat || null);
        setExpenseDate(item.expenseDate || (item.fromDate === item.toDate ? item.fromDate : new Date().toISOString().split('T')[0]));
        // Note: keeping existing receipt name if no new file is selected
    };

    const handleRemoveItem = (id: number | string) => {
        setExpenseItems(expenseItems.filter(item => item.id !== id));
    };

    const handleSubmit = async () => {
        if (!selectedEmployeeId || expenseItems.length === 0) return;
        
        setIsSubmitting(true);
        try {
            const employee = employees.find(e => e.id === selectedEmployeeId);
            const employeeName = employee?.name || 'Employee';
            const totalAmount = expenseItems.reduce((sum, item) => sum + item.amount, 0);

            if (!editId) {
                // Insert mode
                const generatedId = `EXP-${Date.now()}`;
                const { error } = await supabase
                    .from('reimbursement_claims')
                    .insert([{
                        id: generatedId,
                        employee_id: selectedEmployeeId,
                        category: Array.from(new Set(expenseItems.map(item => item.category).filter(Boolean))).join(', '),
                        total_amount: totalAmount,
                        status: 'pending',
                        submitted_at: new Date().toISOString(),
                        items: expenseItems,
                        title: `Claim by ${employeeName}`
                    }]);

                if (error) throw error;
                if (onSuccess) onSuccess('Claim submitted successfully');
            } else {
                // Update mode
                const { error } = await supabase
                    .from('reimbursement_claims')
                    .update({
                        employee_id: selectedEmployeeId,
                        category: Array.from(new Set(expenseItems.map(item => item.category).filter(Boolean))).join(', '),
                        total_amount: totalAmount,
                        items: expenseItems,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editId);

                if (error) throw error;
                if (onSuccess) onSuccess('Claim updated successfully');
            }
            onClose();
        } catch (error: any) {
            console.error('Error submitting expense:', error);
            alert('Failed to submit expense: ' + (error.message || 'Unknown error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="h-20 border-b border-slate-100 px-8 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-6">
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors border border-slate-200">
                        <ArrowLeft size={18} />
                    </button>
                    <h3 className="font-bold text-slate-800 text-xl">{editId ? 'Edit Claim' : 'Add New Claim'}</h3>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedEmployeeId || expenseItems.length === 0}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-100 transition-all disabled:opacity-50"
                    >
                        <Send size={16} /> {isSubmitting ? 'Submitting...' : (editId ? 'Update' : 'Submit')}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                {isFetchingData ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        <span className="ml-3 text-slate-500 font-medium">Loading claim details...</span>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col lg:flex-row items-end gap-8 mb-10 pb-10 border-b border-slate-200/60">
                            {/* Select Employee */}
                            <div className="w-full lg:w-80 space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest text-bold">Select Employee <span className="text-rose-500">*</span></label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <select
                                        value={selectedEmployeeId}
                                        onChange={(e) => !editId && setSelectedEmployeeId(e.target.value)}
                                        disabled={!!editId}
                                        className={`w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm shadow-sm transition-all appearance-none font-bold ${editId ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer'}`}
                                    >
                                        <option value="">Choose an employee...</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.name} ({emp.eid})</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                                {editId && <p className="text-[10px] text-slate-400 italic">Employee cannot be changed when editing.</p>}
                            </div>

                            {/* Expense from date */}
                            <div className="w-full lg:w-48 space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest text-bold">Expense From Date <span className="text-rose-500">*</span></label>
                                <div className="relative group">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="date"
                                        value={expenseFromDate}
                                        onChange={(e) => {
                                            if (editId) return;
                                            const val = e.target.value;
                                            setExpenseFromDate(val);
                                            setExpenseItems(expenseItems.map(item => ({ ...item, fromDate: val })));
                                        }}
                                        disabled={!!editId}
                                        className={`w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm shadow-sm transition-all font-bold ${editId ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500'}`}
                                    />
                                </div>
                            </div>

                            {/* Expense to date */}
                            <div className="w-full lg:w-48 space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest text-bold">Expense To Date <span className="text-rose-500">*</span></label>
                                <div className="relative group">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="date"
                                        value={expenseToDate}
                                        onChange={(e) => {
                                            if (editId) return;
                                            const val = e.target.value;
                                            setExpenseToDate(val);
                                            setExpenseItems(expenseItems.map(item => ({ ...item, toDate: val })));
                                        }}
                                        disabled={!!editId}
                                        className={`w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm shadow-sm transition-all font-bold ${editId ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500'}`}
                                    />
                                </div>
                            </div>

                            {/* Status - Extreme Right */}
                            {editId && (
                                <div className="lg:ml-auto space-y-2 text-right">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Current Status</label>
                                    <div className={`inline-block px-5 py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-[0.15em] shadow-sm ${
                                        claimStatus.toUpperCase() === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                        claimStatus.toUpperCase() === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                        claimStatus.toUpperCase().includes('PARTIAL') ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                        'bg-orange-50 text-orange-700 border-orange-100'
                                    }`}>
                                        {claimStatus.replace(/_/g, ' ')}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6 mt-10">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Expense details</h3>

                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                {/* Add Item Form */}
                                <div className="w-full lg:w-1/3 shrink-0 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                                    <div className="space-y-5">
                                        {/* Expense category per item */}
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Expense CATEGORY <span className="text-rose-500">*</span></label>
                                            <div className="relative group">
                                                <select
                                                    value={selectedCategory?.id || ""}
                                                    onChange={(e) => {
                                                        const catId = e.target.value;
                                                        const cat = categories.find(c => String(c.id) === catId);
                                                        setSelectedCategory(cat || null);
                                                    }}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold appearance-none cursor-pointer"
                                                >
                                                    <option value="">Select category...</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Expense Date <span className="text-rose-500">*</span></label>
                                            <div className="relative group">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" size={16} />
                                                <input
                                                    type="date"
                                                    value={expenseDate}
                                                    min={expenseFromDate}
                                                    max={expenseToDate}
                                                    onChange={(e) => setExpenseDate(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold cursor-pointer"
                                                />
                                            </div>
                                            {expenseFromDate === expenseToDate && (
                                                <p className="text-[9px] text-slate-400 mt-1 italic font-medium">Locked to selected from/to date.</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Merchant / Payee</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Uber, Amazon, etc."
                                                    value={merchant}
                                                    onChange={(e) => setMerchant(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Project / client</label>
                                            <div className="relative group">
                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Project X, Client Y"
                                                    value={project}
                                                    onChange={(e) => setProject(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Amount <span className="text-rose-500">*</span></label>
                                            <div className="relative group">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm font-bold">₹</div>
                                                <input 
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    className={`w-full pl-8 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-slate-700 ${selectedCategory?.receipt_threshold && parseFloat(amount) > selectedCategory.receipt_threshold ? 'bg-amber-50/30 border-amber-200' : 'bg-slate-50 border-slate-100'}`}
                                                />
                                            </div>
                                            {selectedCategory?.receipt_threshold > 0 && parseFloat(amount) > selectedCategory.receipt_threshold && (
                                                <p className="text-[10px] text-amber-600 mt-1.5 font-bold flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                                    <FileText size={12} /> Please upload a receipt/bill for expenses over ₹{selectedCategory.receipt_threshold.toLocaleString()}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Reason/Description <span className="text-rose-500">*</span></label>
                                            <textarea 
                                                rows={3}
                                                placeholder="Business purpose of this expense..."
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all resize-none shadow-blue-100 font-bold"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Bill / Receipt</label>
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    id="receipt-upload"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files ? e.target.files[0] : null;
                                                        setReceipt(file);
                                                    }}
                                                />
                                                <label 
                                                    htmlFor="receipt-upload"
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-xs font-black text-slate-400 hover:border-purple-400 hover:text-purple-500 hover:bg-white transition-all cursor-pointer uppercase tracking-widest"
                                                >
                                                    {receipt ? (
                                                        <>
                                                            <Paperclip size={14} /> {receipt.name.length > 20 ? receipt.name.substring(0, 17) + '...' : receipt.name}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload size={14} /> UPLOAD RECEIPT
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={handleAddItem}
                                            disabled={!amount || !reason || !selectedCategory}
                                            className="w-full py-3 bg-purple-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {editingItemId !== null ? <CheckCircle size={18} /> : <Plus size={18} />}
                                            {editingItemId !== null ? 'UPDATE ITEM' : 'ADD'}
                                        </button>
                                        {editingItemId !== null && (
                                            <button 
                                                onClick={() => {
                                                    setEditingItemId(null);
                                                    setMerchant('');
                                                    setProject('');
                                                    setAmount('');
                                                    setReason('');
                                                    setReceipt(null);
                                                }}
                                                className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-all"
                                            >
                                                Cancel Edit
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Items List Container */}
                                <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                                        <h4 className="text-sm font-bold text-slate-800">Expense Items List</h4>
                                        <div className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase">
                                            {expenseItems.length} items added
                                        </div>
                                    </div>

                                    {expenseItems.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500 opacity-40">
                                                <FileText size={32} />
                                            </div>
                                            <p className="text-slate-400 text-sm max-w-[200px] font-bold leading-relaxed">No items added to this claim yet.</p>
                                            <p className="text-[10px] text-slate-300 uppercase mt-4 tracking-widest font-black">fill the form on the left to start</p>
                                        </div>
                                    ) : (
                                        <div className="flex-1 overflow-auto">
                                            <table className="w-full text-left text-sm border-collapse">
                                                <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 z-10 border-b border-slate-100">
                                                    <tr>
                                                        <th className="px-6 py-3">Expense Details</th>
                                                        <th className="px-6 py-3">Expense Category</th>
                                                        <th className="px-6 py-3">Expense Date</th>
                                                        <th className="px-6 py-3">Amount</th>
                                                        <th className="px-6 py-3">Receipt</th>
                                                        <th className="px-4 py-3 text-right font-black">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {expenseItems.map((item, idx) => (
                                                        <tr key={item.id || idx} className="group hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[11px] font-bold text-slate-700 tracking-tight leading-relaxed">{item.reason || item.description}</span>
                                                                    {item.project && <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.project}</span>}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tight bg-slate-100 px-2 py-1 rounded-md">{item.category}</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{item.expenseDate ? new Date(item.expenseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                                                            </td>
                                                            <td className="px-6 py-4 font-black text-slate-800">
                                                                ₹{(item.amount || 0).toLocaleString('en-IN')}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {item.receiptName ? (
                                                                    <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[10px] uppercase">
                                                                        <CheckCircle size={12} /> ATTACHED
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter opacity-50">NO RECEIPT</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <button 
                                                                        onClick={() => handleEditItem(item)}
                                                                        className={`p-1.5 rounded-lg transition-all ${editingItemId === item.id ? 'text-purple-600 bg-purple-50' : 'text-slate-300 hover:text-purple-500 hover:bg-purple-50'}`}
                                                                        title="Edit Item"
                                                                    >
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleRemoveItem(item.id)}
                                                                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                                        title="Remove Item"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                    
                                    {expenseItems.length > 0 && (
                                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center shrink-0">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total amount</span>
                                            <span className="text-lg font-black text-blue-600">₹{expenseItems.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
