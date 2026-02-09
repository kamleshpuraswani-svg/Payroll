import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import {
    Receipt,
    Plus,
    Settings2,
    ShieldCheck,
    Clock,
    AlertCircle,
    Edit2,
    Trash2,
    ChevronDown,
    Save,
    X,
    Info,
    Check,
    Search,
    Users,
    UserPlus,
    ArrowUp,
    ArrowDown,
    UserCircle,
    ChevronRight
} from 'lucide-react';

const ExpenseSettings: React.FC = () => {
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isAddingWorkflow, setIsAddingWorkflow] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'categories' | 'rules'>('categories');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // State for Expense Categories
    const [categories, setCategories] = useState<any[]>([]);

    // State for Approval Workflow
    const [approvers, setApprovers] = useState<any[]>([]);
    const [allEmployees, setAllEmployees] = useState<any[]>([]);

    // State for Policy Settings
    const [settings, setSettings] = useState({
        id: '',
        deadline_claims_date: 5,
        receipt_mandatory_amount: 200,
        allow_backdated_claims: false
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch categories
            const { data: catData, error: catError } = await supabase
                .from('expense_categories')
                .select('*')
                .order('name');

            // If no categories found, insert dummy data
            if (catData && catData.length === 0) {
                const dummyCategories = [
                    { name: 'Travel & Conveyance', max_limit: 5000, receipt_threshold: 1000, pro_rata: true, status: 'Active', description: 'Includes flight, train, and local taxi fares.' },
                    { name: 'Meals & Entertainment', max_limit: 2000, receipt_threshold: 500, pro_rata: false, status: 'Active', description: 'Business lunches and team dinners.' },
                    { name: 'Communication', max_limit: 1500, receipt_threshold: 0, pro_rata: false, status: 'Active', description: 'Mobile and internet bill reimbursements.' },
                    { name: 'Office Supplies', max_limit: 5000, receipt_threshold: 500, pro_rata: true, status: 'Active', description: 'Stationery and minor equipment.' }
                ];
                await supabase.from('expense_categories').insert(dummyCategories);
                // Re-fetch after insertion
                const { data: refreshedCat } = await supabase
                    .from('expense_categories')
                    .select('*')
                    .order('name');
                if (refreshedCat) setCategories(refreshedCat);
            } else if (catData) {
                setCategories(catData);
            }

            // Fetch workflow approvers joining with employees
            const { data: workflowData } = await supabase
                .from('expense_workflows')
                .select(`
                    id,
                    sequence_order,
                    employees (
                        id,
                        name,
                        eid,
                        avatar_url,
                        department
                    )
                `)
                .order('sequence_order');

            if (workflowData) {
                setApprovers(workflowData.map(w => ({
                    ...w.employees,
                    workflowId: w.id,
                    sequence: w.sequence_order
                })));
            }

            // Fetch all employees for selection
            const { data: empData } = await supabase
                .from('employees')
                .select('id, name, eid, avatar_url, department')
                .eq('status', 'Active')
                .order('name');
            if (empData) setAllEmployees(empData);

            // Fetch settings
            const { data: settingsData, error: settingsError } = await supabase
                .from('expense_settings')
                .select('*')
                .single();

            if (settingsData) setSettings(settingsData);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const name = formData.get('name') as string;
        const limit = formData.get('limit') as string;
        const threshold = formData.get('receipt_threshold') as string;
        const proRata = formData.get('pro_rata') === 'on';
        const description = formData.get('description') as string;

        setIsSaving(true);
        try {
            const categoryData = {
                name,
                max_limit: parseFloat(limit.replace(/[^0-9.]/g, '')),
                receipt_threshold: parseFloat(threshold),
                pro_rata: proRata,
                description
            };

            if (editingCategory) {
                const { error } = await supabase
                    .from('expense_categories')
                    .update(categoryData)
                    .eq('id', editingCategory.id);
            } else {
                const { error } = await supabase
                    .from('expense_categories')
                    .insert([{
                        ...categoryData,
                        status: 'Active'
                    }]);
            }
            await fetchData();
            setIsAddingCategory(false);
            setEditingCategory(null);
        } catch (error) {
            console.error('Error saving category:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleApprover = (employee: any) => {
        setApprovers(prev => {
            const exists = prev.find(p => p.id === employee.id);
            if (exists) {
                return prev.filter(p => p.id !== employee.id);
            }
            return [...prev, employee];
        });
    };

    const moveApprover = (index: number, direction: 'up' | 'down') => {
        const newApprovers = [...approvers];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newApprovers.length) return;

        const temp = newApprovers[index];
        newApprovers[index] = newApprovers[targetIndex];
        newApprovers[targetIndex] = temp;
        setApprovers(newApprovers);
    };

    const handleSaveWorkflow = async () => {
        setIsSaving(true);
        try {
            // Delete existing workflow
            await supabase.from('expense_workflows').delete().neq('id', '00000000-0000-0000-0000-000000000000');

            // Insert new sequence
            const workflowToInsert = approvers.map((emp, index) => ({
                approver_id: emp.id,
                sequence_order: index + 1
            }));

            if (workflowToInsert.length > 0) {
                await supabase.from('expense_workflows').insert(workflowToInsert);
            }

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
            setIsAddingWorkflow(false);
            await fetchData();
        } catch (error) {
            console.error('Error saving workflow:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            await supabase.from('expense_categories').delete().eq('id', id);
            await fetchData();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const updateSettings = async (updates: any) => {
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);

        try {
            setSaveSuccess(false);
            const { error } = await supabase
                .from('expense_settings')
                .update(updates)
                .eq('id', settings.id);

            if (!error) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
            }
        } catch (error) {
            console.error('Error updating settings:', error);
        }
    };

    const openEditModal = (category: any) => {
        setEditingCategory(category);
        setIsAddingCategory(true);
    };

    return (
        <div className="h-full overflow-y-auto bg-slate-50/30">
            <div className="p-4 lg:p-8 w-full space-y-8 animate-in fade-in duration-300 pb-20 max-w-7xl mx-auto">
                {/* Modal for Add Category */}
                {isAddingCategory && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    {editingCategory ? (
                                        <>
                                            <Edit2 size={20} className="text-sky-600" />
                                            Edit Category
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={20} className="text-sky-600" />
                                            Add New Category
                                        </>
                                    )}
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsAddingCategory(false);
                                        setEditingCategory(null);
                                    }}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSaveCategory} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Category Name</label>
                                        <input
                                            name="name"
                                            type="text"
                                            defaultValue={editingCategory?.name || ''}
                                            placeholder="e.g. Travel, Meals, Office Supplies"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Max Limit (Per Month)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                <input
                                                    name="limit"
                                                    type="text"
                                                    defaultValue={editingCategory?.max_limit || ''}
                                                    placeholder="5,000"
                                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Receipt Threshold</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                <input
                                                    name="receipt_threshold"
                                                    type="number"
                                                    defaultValue={editingCategory?.receipt_threshold || 200}
                                                    placeholder="200"
                                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-400 italic">Claims exceeding this amount will require a mandatory bill upload from the employee.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                        <div className="space-y-0.5">
                                            <label className="text-sm font-bold text-slate-700">Pro-rata Calculations</label>
                                            <p className="text-xs text-slate-500">Enable monthly limit splitting</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="pro_rata"
                                                defaultChecked={editingCategory?.pro_rata || false}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                                        </label>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Description (Optional)</label>
                                        <textarea
                                            name="description"
                                            rows={2}
                                            defaultValue={editingCategory?.description || ''}
                                            placeholder="Describe the scope of this category..."
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all resize-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddingCategory(false);
                                            setEditingCategory(null);
                                        }}
                                        className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-sm transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 px-4 py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 font-bold text-sm transition-all shadow-lg shadow-sky-100 disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : (editingCategory ? 'Update Category' : 'Save Category')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Setup Approval Workflow Modal */}
                {isAddingWorkflow && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <ShieldCheck className="text-sky-600" size={24} />
                                        Setup Approval Workflow
                                    </h3>
                                    <p className="text-xs text-slate-500 font-semibold mt-1">Define the sequence of approvers for expense claims</p>
                                </div>
                                <button
                                    onClick={() => setIsAddingWorkflow(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 h-[500px]">
                                {/* Left Side: Employee List */}
                                <div className="border-r border-slate-100 flex flex-col">
                                    <div className="p-4 border-b border-slate-50">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Approvers</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Search employees..."
                                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-semibold"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                        {allEmployees
                                            .filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.eid.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map((emp) => {
                                                const isSelected = approvers.find(p => p.id === emp.id);
                                                return (
                                                    <div
                                                        key={emp.id}
                                                        onClick={() => toggleApprover(emp)}
                                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${isSelected ? 'bg-sky-50 border-sky-200' : 'bg-white border-slate-100 hover:border-sky-200'}`}
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                                                            {emp.avatar_url ? (
                                                                <img src={emp.avatar_url} alt={emp.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-50">
                                                                    {emp.name.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-slate-800 truncate">{emp.name}</p>
                                                            <p className="text-[10px] text-slate-500 font-semibold">{emp.department} • {emp.eid}</p>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-sky-600 border-sky-600' : 'bg-slate-50 border-slate-200 group-hover:border-sky-400'}`}>
                                                            {isSelected && <Check size={12} className="text-white" />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>

                                {/* Right Side: Sequence Ordering */}
                                <div className="bg-slate-50 flex flex-col">
                                    <div className="p-4 border-b border-slate-100 bg-white">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Workflow Sequence</label>
                                        <p className="text-[10px] text-slate-500 font-medium italic">Claims will follow this order for approval</p>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                        {approvers.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-3">
                                                    <Users size={24} />
                                                </div>
                                                <p className="text-sm font-bold text-slate-400">No approvers selected</p>
                                                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-black">Select from the left to build workflow</p>
                                            </div>
                                        ) : (
                                            approvers.map((emp, idx) => (
                                                <div key={emp.id} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-right-4 duration-200">
                                                    <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-black shadow-sm flex-shrink-0">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-black text-slate-800 truncate">{emp.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold">Approver Level {idx + 1}</p>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); moveApprover(idx, 'up'); }}
                                                            disabled={idx === 0}
                                                            className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-sky-600 disabled:opacity-30 disabled:hover:bg-transparent"
                                                        >
                                                            <ChevronDown className="rotate-180" size={14} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); moveApprover(idx, 'down'); }}
                                                            disabled={idx === approvers.length - 1}
                                                            className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-sky-600 disabled:opacity-30 disabled:hover:bg-transparent"
                                                        >
                                                            <ChevronDown size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-6 bg-white border-t border-slate-100 space-y-3">
                                        <button
                                            onClick={handleSaveWorkflow}
                                            disabled={approvers.length === 0 || isSaving}
                                            className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Saving Workflow...
                                                </>
                                            ) : (
                                                <>
                                                    < ShieldCheck size={18} />
                                                    Finalize Workflow
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setIsAddingWorkflow(false)}
                                            className="w-full py-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-all"
                                        >
                                            Exit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
                                <Receipt size={24} />
                            </div>
                            Expenses Management Configuration
                        </h2>
                        <p className="text-slate-500 mt-1">Set up expense categories, approval limits, and reimbursement policies.</p>
                    </div>
                    <div className="flex gap-3 md:ml-0">
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 gap-8">
                    {[
                        { id: 'categories', label: 'Expense Categories', icon: Settings2 },
                        { id: 'rules', label: 'Policy & Workflow', icon: ShieldCheck },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`pb-4 text-sm font-semibold flex items-center gap-2 transition-all relative ${activeTab === tab.id
                                ? 'text-sky-600'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full animate-in fade-in slide-in-from-bottom-1" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'categories' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Active Categories</h3>
                                    <button
                                        onClick={() => setIsAddingCategory(true)}
                                        className="text-sky-600 hover:text-sky-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                                    >
                                        <Plus size={14} className="stroke-[3]" /> ADD CATEGORY
                                    </button>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-white border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category Name</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Max Limit (Per Month)</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {categories.map(cat => (
                                            <tr key={cat.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4 font-semibold text-slate-700">{cat.name}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                                    ₹ {cat.max_limit?.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-100 uppercase tracking-wider">
                                                        {cat.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2 transition-opacity">
                                                        <button
                                                            onClick={() => openEditModal(cat)}
                                                            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCategory(cat.id)}
                                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {categories.length === 0 && !isLoading && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                                                    No categories found. Click "ADD CATEGORY" to create one.
                                                </td>
                                            </tr>
                                        )}
                                        {isLoading && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-sky-600/50">
                                                    Loading categories...
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                    {activeTab === 'rules' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-top-2">
                            {/* Reimbursement Policy Section */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Submission Rules</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">Submission Deadline</p>
                                                    <p className="text-xs text-slate-500">Select cut-off date of the month</p>
                                                    <p className="text-[10px] text-slate-400 mt-2 italic leading-relaxed">
                                                        Specify the cut-off date each month after which claims will be processed in the next payroll cycle.
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={settings.deadline_claims_date}
                                                        onChange={(e) => updateSettings({ deadline_claims_date: parseInt(e.target.value) })}
                                                        className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-sky-600 focus:outline-none focus:border-sky-500 bg-white appearance-none text-center cursor-pointer hover:border-sky-300 transition-colors"
                                                    >
                                                        {[...Array(31)].map((_, i) => (
                                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                                        ))}
                                                    </select>
                                                    <span className="text-[10px] font-black text-slate-400">DATE</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Advanced Controls</h3>
                                            {saveSuccess && (
                                                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 animate-pulse">
                                                    <Check size={10} /> SAVED
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            <label className="flex items-center justify-between cursor-pointer group p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Allow back-dated claims</span>
                                                <div className="relative inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={settings.allow_backdated_claims}
                                                        onChange={(e) => updateSettings({ allow_backdated_claims: e.target.checked })}
                                                    />
                                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Approval Workflow Section */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Advanced Workflow Engine</h3>
                                    <button
                                        onClick={() => setIsAddingWorkflow(true)}
                                        className="flex items-center gap-2 px-4 py-1.5 bg-sky-600 text-white rounded-lg font-bold text-xs hover:bg-sky-700 transition-all shadow-md shadow-sky-100"
                                    >
                                        <Plus size={14} /> {approvers.length > 0 ? 'Edit' : 'Add'}
                                    </button>
                                </div>

                                {approvers.length > 0 ? (
                                    <div className="flex flex-wrap gap-4 items-center py-4">
                                        {approvers.map((emp, idx) => (
                                            <React.Fragment key={emp.id}>
                                                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl group relative">
                                                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 overflow-hidden shadow-sm">
                                                        {emp.avatar_url ? (
                                                            <img src={emp.avatar_url} alt={emp.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                                                {emp.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-800">{emp.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Level {idx + 1}</p>
                                                    </div>
                                                </div>
                                                {idx < approvers.length - 1 && (
                                                    <div className="text-slate-300">
                                                        <ChevronRight size={16} />
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                            <Clock size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">No Custom Workflow</h3>
                                            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">
                                                Multi-level approval workflows are currently managed at the organization level.
                                                Click "+Add" to define an expense-specific approval sequence.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpenseSettings;
