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
    FileText,
    CheckCircle,
    Activity,
    Smartphone,
    BookOpen,
    Fuel,
    Edit2
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

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
    const [merchant, setMerchant] = useState('');
    const [project, setProject] = useState('');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [receipt, setReceipt] = useState<File | null>(null);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [editingItemId, setEditingItemId] = useState<number | string | null>(null);

    useEffect(() => {
        if (editId) {
            fetchClaimData();
        }
    }, [editId]);

    const fetchClaimData = async () => {
        setIsFetchingData(true);
        try {
            const { data, error } = await supabase
                .from('reimbursement_claims')
                .select('*')
                .eq('id', editId)
                .single();

            if (error) throw error;

            if (data) {
                setSelectedEmployeeId(data.employee_id || '');
                const cat = categories.find(c => c.name === data.category);
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
            }
        } catch (error) {
            console.error('Error fetching claim data:', error);
        } finally {
            setIsFetchingData(false);
        }
    };

    const handleAddItem = () => {
        if (!merchant || !amount || !reason) return;
        
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
                        fromDate: expenseFromDate,
                        toDate: expenseToDate
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
                fromDate: expenseFromDate,
                toDate: expenseToDate
            };
            setExpenseItems([...expenseItems, newItem]);
        }
        
        // Reset item fields
        setMerchant('');
        setProject('');
        setAmount('');
        setReason('');
        setReceipt(null);
    };

    const handleEditItem = (item: any) => {
        setEditingItemId(item.id);
        setMerchant(item.merchant || '');
        setProject(item.project || '');
        setAmount(String(item.amount));
        setReason(item.reason || item.description || '');
        // Note: keeping existing receipt name if no new file is selected
    };

    const handleRemoveItem = (id: number | string) => {
        setExpenseItems(expenseItems.filter(item => item.id !== id));
    };

    const handleSubmit = async () => {
        if (!selectedEmployeeId || !selectedCategory || expenseItems.length === 0) return;
        
        setIsSubmitting(true);
        try {
            const employee = employees.find(e => e.id === selectedEmployeeId);
            const employeeName = employee?.name || 'Employee';
            const totalAmount = expenseItems.reduce((sum, item) => sum + item.amount, 0);

            if (!editId) {
                // Insert mode
                const { error } = await supabase
                    .from('reimbursement_claims')
                    .insert([{
                        employee_id: selectedEmployeeId,
                        category: selectedCategory.name,
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
                        category: selectedCategory.name,
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                            {/* Select Employee */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest text-bold">Select Employee <span className="text-rose-500">*</span></label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                                    <select
                                        value={selectedEmployeeId}
                                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Choose an employee...</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.name} ({emp.eid})</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Select Category */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest text-bold">Select Category <span className="text-rose-500">*</span></label>
                                <div className="relative group">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                                    <select
                                        value={selectedCategory?.id || ''}
                                        onChange={(e) => {
                                            const cat = categories.find(c => String(c.id) === e.target.value);
                                            setSelectedCategory(cat);
                                        }}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Choose a category...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Expense from date */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest text-bold">Expense from date <span className="text-rose-500">*</span></label>
                                <div className="relative group">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                                    <input
                                        type="date"
                                        value={expenseFromDate}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setExpenseFromDate(val);
                                            setExpenseToDate(val);
                                            // Synchronize all existing items to this new date
                                            setExpenseItems(expenseItems.map(item => ({
                                                ...item,
                                                fromDate: val,
                                                toDate: val
                                            })));
                                        }}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all shadow-blue-100"
                                    />
                                </div>
                            </div>

                            {/* Expense to date */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest text-bold">Expense to date <span className="text-rose-500">*</span></label>
                                <div className="relative group">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                                    <input
                                        type="date"
                                        value={expenseToDate}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setExpenseFromDate(val);
                                            setExpenseToDate(val);
                                            // Synchronize all existing items to this new date
                                            setExpenseItems(expenseItems.map(item => ({
                                                ...item,
                                                fromDate: val,
                                                toDate: val
                                            })));
                                        }}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all shadow-blue-100"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 mt-10">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Expense details</h3>

                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                {/* Add Item Form */}
                                <div className="w-full lg:w-1/3 shrink-0 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                                    <div className="space-y-5">
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
                                                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-slate-700"
                                                />
                                            </div>
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
                                            disabled={!merchant || !amount || !reason}
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
                                                <DollarSign size={32} />
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
                                                        <th className="px-6 py-3">Amount</th>
                                                        <th className="px-6 py-3">Receipt</th>
                                                        <th className="px-4 py-3 text-right font-black">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {expenseItems.map((item, idx) => (
                                                        <tr key={item.id || idx} className="group hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                                        {selectedCategory?.name === 'Medical' && <Activity size={14} />}
                                                                        {selectedCategory?.name === 'Mobile' && <Smartphone size={14} />}
                                                                        {selectedCategory?.name === 'Travel' && <MapPin size={14} />}
                                                                        {selectedCategory?.name === 'Learning' && <BookOpen size={14} />}
                                                                        {selectedCategory?.name === 'Meal' && <Fuel size={14} />}
                                                                        {(!selectedCategory || !['Medical', 'Mobile', 'Travel', 'Learning', 'Meal'].includes(selectedCategory.name)) && <DollarSign size={14} />}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold text-slate-700">{item.merchant || 'General'}</span>
                                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.project ? `${item.project} • ` : ''}{item.reason || item.description}</span>
                                                                    </div>
                                                                </div>
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
