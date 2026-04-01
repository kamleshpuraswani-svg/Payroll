
import React, { useState } from 'react';
import {
    ArrowLeft,
    X,
    Save,
    Send,
    Briefcase,
    MessageSquare,
    DollarSign,
    Calendar,
    Paperclip,
    CheckCircle,
    Plus,
    Trash2,
    ImageIcon,
    FileText,
    ChevronDown,
    MapPin,
    Smartphone,
    BookOpen,
    Fuel,
    Activity
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export const AddExpenseScreen: React.FC<{
    onClose: () => void;
    employees: any[];
    categories: any[];
    onSuccess: (message: string) => void;
}> = ({ onClose, employees, categories, onSuccess }) => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [expenseItems, setExpenseItems] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state for current item
    const [amount, setAmount] = useState('');
    const [expenseFromDate, setExpenseFromDate] = useState(new Date().toISOString().split('T')[0]);
    const [expenseToDate, setExpenseToDate] = useState(new Date().toISOString().split('T')[0]);
    const [projectClient, setProjectClient] = useState('');
    const [merchant, setMerchant] = useState('');
    const [description, setDescription] = useState('');
    const [receipt, setReceipt] = useState<File | null>(null);

    const handleAddItem = () => {
        if (!selectedCategory) {
            alert('Please select an expense category first.');
            return;
        }
        if (!amount || !description) return;

        const newItem = {
            id: Date.now().toString(),
            category: selectedCategory.name,
            amount: parseFloat(amount),
            expenseFromDate,
            expenseToDate,
            projectClient,
            merchant,
            description,
            receiptName: receipt?.name || null
        };

        setExpenseItems([...expenseItems, newItem]);
        // Reset item form
        setAmount('');
        setMerchant('');
        setProjectClient('');
        setDescription('');
        setReceipt(null);
    };

    const handleRemoveItem = (id: string) => {
        setExpenseItems(expenseItems.filter(item => item.id !== id));
    };

    const handleSubmit = async () => {
        if (!selectedEmployeeId) {
            alert('Please select an employee.');
            return;
        }
        if (expenseItems.length === 0) {
            alert('Please add at least one expense item.');
            return;
        }

        setIsSubmitting(true);
        try {
            const employee = employees.find(e => e.id === selectedEmployeeId);

            // Generate a unique ID (e.g., EXP-1680584000)
            const claimId = `EXP-${Date.now()}`;

            const { error } = await supabase
                .from('reimbursement_claims')
                .insert({
                    id: claimId,
                    employee_id: selectedEmployeeId,
                    title: `Claim by ${employee?.name || 'Employee'}`,
                    category: selectedCategory?.name || 'Other',
                    total_amount: expenseItems.reduce((sum, item) => sum + item.amount, 0),
                    status: 'pending',
                    items: expenseItems,
                    submitted_at: new Date().toISOString()
                });

            if (error) throw error;

            onSuccess('Expense claim submitted successfully for the employee!');
            onClose();
        } catch (error: any) {
            console.error('Error submitting expense:', error);
            alert(`Failed to submit expense claim: ${error.message || 'Please check your database schema or internet connection.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full min-h-screen bg-white animate-in fade-in duration-300">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors border border-slate-200">
                        <ArrowLeft size={18} />
                    </button>
                    <h3 className="font-bold text-slate-800 text-xl">Add New Claim</h3>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 flex items-center gap-2 transition-all"
                    >
                        <X size={16} /> Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedEmployeeId || expenseItems.length === 0}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-100 transition-all disabled:opacity-50"
                    >
                        <Send size={16} /> {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                    {/* Select Employee */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Employee <span className="text-rose-500">*</span></label>
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
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Category <span className="text-rose-500">*</span></label>
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
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Expense from date <span className="text-rose-500">*</span></label>
                        <div className="relative group">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                            <input
                                type="date"
                                value={expenseFromDate}
                                onChange={(e) => setExpenseFromDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Expense to date */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Expense to date <span className="text-rose-500">*</span></label>
                        <div className="relative group">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                            <input
                                type="date"
                                value={expenseToDate}
                                onChange={(e) => setExpenseToDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Expense details</h3>

                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Add Item Form */}
                        <div className="w-full lg:w-1/3 shrink-0 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Merchant / Payee</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                        <input
                                            type="text"
                                            placeholder="e.g. Uber, Amazon, etc."
                                            value={merchant}
                                            onChange={(e) => setMerchant(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Project / client</label>
                                    <div className="relative group">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                        <input
                                            type="text"
                                            placeholder="e.g. Project X, Client Y"
                                            value={projectClient}
                                            onChange={(e) => setProjectClient(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Amount <span className="text-rose-500">*</span></label>
                                    <div className="relative group">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full pl-7 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Reason/Description <span className="text-rose-500">*</span></label>
                                    <div className="relative group">
                                        <MessageSquare className="absolute left-3 top-3 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                        <textarea
                                            placeholder="Business purpose of this expense..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={3}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Bill / Receipt</label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 relative">
                                            <input
                                                type="file"
                                                id="receipt-upload-screen"
                                                className="hidden"
                                                onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                                            />
                                            <label
                                                htmlFor="receipt-upload-screen"
                                                className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-indigo-500 hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer group"
                                            >
                                                <Paperclip size={16} className="group-hover:rotate-12 transition-transform" />
                                                <span className="text-xs font-bold uppercase tracking-wider">{receipt ? receipt.name : 'Upload Receipt'}</span>
                                            </label>
                                        </div>
                                        {receipt && (
                                            <button onClick={() => setReceipt(null)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddItem}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} /> Add
                                </button>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h4 className="font-bold text-slate-700">Expense Items List</h4>
                                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500">{expenseItems.length} items added</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">Expense Details</th>
                                            <th className="px-6 py-4 text-center">Amount</th>
                                            <th className="px-6 py-4 text-center">Receipt</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {expenseItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                                            {item.category === 'Medical' && <Activity size={18} />}
                                                            {item.category === 'Telephone' && <Smartphone size={18} />}
                                                            {item.category === 'LTA' && <MapPin size={18} />}
                                                            {item.category === 'Books' && <BookOpen size={18} />}
                                                            {item.category === 'Fuel' && <Fuel size={18} />}
                                                            {!['Medical', 'Telephone', 'LTA', 'Books', 'Fuel'].includes(item.category) && <DollarSign size={18} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800">{item.merchant || 'General Expense'}</p>
                                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                                <span>{item.expenseFromDate} - {item.expenseToDate}</span>
                                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                                <span className="truncate max-w-[150px]">{item.projectClient ? `${item.projectClient}: ` : ''}{item.description}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center font-black text-slate-900">₹{item.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {item.receiptName ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold border border-emerald-100">
                                                            <CheckCircle size={12} /> ATTACHED
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-300 font-bold">NO RECEIPT</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleRemoveItem(item.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {expenseItems.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-16 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                            <DollarSign size={32} />
                                                        </div>
                                                        <p className="text-slate-400 font-medium">No items added to this claim yet.</p>
                                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Fill the form on the left to start</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    {expenseItems.length > 0 && (
                                        <tfoot className="bg-slate-50/50">
                                            <tr>
                                                <td colSpan={4} className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-6">
                                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Claim Amount</span>
                                                        <span className="text-xl font-black text-indigo-600">
                                                            ₹{expenseItems.reduce((s, i) => s + i.amount, 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
