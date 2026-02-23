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
    const [showExpenseCategoryView, setShowExpenseCategoryView] = useState(false);
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [configuredExpenses, setConfiguredExpenses] = useState<any[]>([]);

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

    // Multi-select state for Add Expense modal
    const [selectedEntities, setSelectedEntities] = useState<any[]>([]);
    const [availableDesignations, setAvailableDesignations] = useState<string[]>([]);
    const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
    const [entitySearch, setEntitySearch] = useState('');
    const [showEntityDropdown, setShowEntityDropdown] = useState(false);

    // Hardcoded fallbacks
    const FALLBACK_DEPTS = ['Engineering', 'Product', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations', 'QA'];
    const FALLBACK_DESIGS = ['Software Engineer', 'Product Manager', 'Designer', 'Accountant', 'HR Associate', 'Sales Lead', 'QA Analyst'];

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

            if (catError) throw catError;

            // If no categories found, insert dummy data
            if (catData && catData.length === 0) {
                const dummyCategories = [
                    { name: 'Travel & Conveyance', max_limit: 5000, receipt_threshold: 1000, pro_rata: true, status: 'Active', description: 'Includes flight, train, and local taxi fares.' },
                    { name: 'Meals & Entertainment', max_limit: 2000, receipt_threshold: 500, pro_rata: false, status: 'Active', description: 'Business lunches and team dinners.' },
                    { name: 'Communication', max_limit: 1500, receipt_threshold: 0, pro_rata: false, status: 'Active', description: 'Mobile and internet bill reimbursements.' },
                    { name: 'Office Supplies', max_limit: 5000, receipt_threshold: 500, pro_rata: true, status: 'Active', description: 'Stationery and minor equipment.' }
                ];
                const { error: insertError } = await supabase.from('expense_categories').insert(dummyCategories);
                if (insertError) throw insertError;

                // Re-fetch after insertion to get actual data with IDs
                const { data: refreshedCat, error: refreshError } = await supabase
                    .from('expense_categories')
                    .select('*')
                    .order('name');
                if (refreshError) throw refreshError;
                if (refreshedCat) {
                    setCategories(refreshedCat);
                    setConfiguredExpenses(refreshedCat.map(c => ({
                        ...c,
                        category_name: c.name,
                        category_id: c.id
                    })));
                }
            } else if (catData) {
                setCategories(catData);
                setConfiguredExpenses(catData.map(c => ({
                    ...c,
                    category_name: c.name,
                    category_id: c.id
                })));
            }

            // Fetch workflow approvers
            const { data: workflowData, error: workflowError } = await supabase
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

            if (workflowError) {
                console.error('Workflow error:', workflowError);
                // Don't throw here to allow categories to still show
            }

            if (workflowData) {
                setApprovers(workflowData.map(w => ({
                    ...w.employees,
                    workflowId: w.id,
                    sequence: w.sequence_order
                })));
            }

            // Fetch all employees with designations
            const { data: empData, error: empError } = await supabase
                .from('employees')
                .select('id, name, eid, avatar_url, department, designation')
                .eq('status', 'Active')
                .order('name');
            if (empError) console.error('Employee fetch error:', empError);
            if (empData) {
                setAllEmployees(empData);
                // Extract unique departments and designations
                const depts = Array.from(new Set(empData.map(e => e.department).filter(Boolean))) as string[];
                const desigs = Array.from(new Set((empData as any).map((e: any) => e.designation).filter(Boolean))) as string[];

                setAvailableDepartments(depts.length > 0 ? depts.sort() : FALLBACK_DEPTS);
                setAvailableDesignations(desigs.length > 0 ? desigs.sort() : FALLBACK_DESIGS);
            } else {
                setAvailableDepartments(FALLBACK_DEPTS);
                setAvailableDesignations(FALLBACK_DESIGS);
            }

            // Fetch settings
            const { data: settingsData, error: settingsError } = await supabase
                .from('expense_settings')
                .select('*')
                .single();

            if (settingsData) setSettings(settingsData);
        } catch (error: any) {
            console.error('Error fetching data:', error);
            alert(`Failed to load data: ${error.message || 'Unknown error'}. Please ensure your Supabase schema is up to date.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const name = formData.get('name') as string;
        const status = formData.get('status') === 'on' ? 'Active' : 'Inactive';

        setIsSaving(true);
        try {
            const categoryData = {
                name,
                status
            };

            if (editingCategory) {
                const { error } = await supabase
                    .from('expense_categories')
                    .update(categoryData)
                    .eq('id', editingCategory.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('expense_categories')
                    .insert([categoryData]);
                if (error) throw error;
            }
            await fetchData();
            setIsAddingCategory(false);
            setEditingCategory(null);
        } catch (error: any) {
            console.error('Error saving category:', error);
            alert(`Failed to save category: ${error.message || 'Unknown error'}. Please check your database connection and schema.`);
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

    const handleSaveExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const categoryId = formData.get('category') as string;
        const totalLimit = formData.get('limit') as string;
        const receiptThreshold = formData.get('receipt_threshold') as string;
        const status = formData.get('status') === 'on' ? 'Active' : 'Inactive';

        setIsSaving(true);
        try {
            const configData = {
                max_limit: parseFloat(totalLimit.replace(/[^0-9.]/g, '')),
                receipt_threshold: parseFloat(receiptThreshold),
                status: status
            };

            const { error } = await supabase
                .from('expense_categories')
                .update(configData)
                .eq('id', categoryId);

            if (error) throw error;

            await fetchData();
            setIsAddingExpense(false);
            setSelectedEntities([]);
            setEntitySearch('');
        } catch (error: any) {
            console.error('Error saving expense config:', error);
            alert(`Failed to save configuration: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSaving(false);
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

                {/* Modal for Add Category / Override */}
                {isAddingCategory && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    {editingCategory ? 'Override Category Limits' : 'Add New Category'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsAddingCategory(false);
                                        setEditingCategory(null);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleSaveCategory} className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category Name</label>
                                        <input
                                            name="name"
                                            type="text"
                                            defaultValue={editingCategory?.name || ''}
                                            placeholder="e.g. Travel, Meals"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-sky-500 transition-all"
                                            required
                                            disabled={!!editingCategory}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                        <div className="space-y-0.5">
                                            <label className="text-sm font-bold text-slate-700">Status</label>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{editingCategory?.status === 'Inactive' ? 'Inactive' : 'Active'}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="status"
                                                defaultChecked={editingCategory ? editingCategory.status === 'Active' : true}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddingCategory(false);
                                            setEditingCategory(null);
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold text-sm transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 px-4 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-bold text-sm transition-all shadow-lg shadow-sky-100 disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : (editingCategory ? 'Save Changes' : 'Submit')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {isAddingWorkflow && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
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
                {/* Modal for Add Expense Configuration */}
                {isAddingExpense && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <Plus className="text-sky-600" size={18} /> Add Expense Configuration
                                </h3>
                                <button
                                    onClick={() => setIsAddingExpense(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleSaveExpense} className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select Category</label>
                                        <select
                                            name="category"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-sky-500 transition-all"
                                            required
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expense amount limit (monthly)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                                <input
                                                    name="limit"
                                                    type="text"
                                                    placeholder="5,000"
                                                    className="w-full pl-7 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-sky-500 transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Receipt required amount</label>
                                                <div className="group relative">
                                                    <Info size={12} className="text-slate-300 cursor-help" />
                                                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-[200] text-center leading-relaxed">
                                                        Claims above this amount will require a receipt/document.
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                                <input
                                                    name="receipt_threshold"
                                                    type="number"
                                                    placeholder="200"
                                                    className="w-full pl-7 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-sky-500 transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applicable To</label>
                                        <div className="space-y-2">
                                            {selectedEntities.map((entity, idx) => (
                                                <div key={idx} className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-lg group animate-in slide-in-from-left-2">
                                                    <div className={`flex-1 flex items-center gap-2 px-2 py-1 rounded-md text-[11px] font-bold ${entity.type === 'Employee' ? 'bg-sky-100 text-sky-700' :
                                                        entity.type === 'Department' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        <span>{entity.name}</span>
                                                        {entity.type === 'Employee' && <span className="opacity-50 text-[9px]">({entity.id})</span>}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-slate-400">LIMIT ₹</span>
                                                        <input
                                                            type="number"
                                                            value={entity.limit || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                                                                setSelectedEntities(prev => prev.map((ent, i) => i === idx ? { ...ent, limit: val } : ent));
                                                            }}
                                                            className="w-24 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-700 focus:outline-none focus:border-sky-500"
                                                            placeholder="Amount"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedEntities(prev => prev.filter((_, i) => i !== idx))}
                                                            className="text-slate-400 hover:text-rose-500 transition-colors"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search to add Designation, Department or Employee..."
                                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 shadow-sm"
                                                value={entitySearch}
                                                onChange={(e) => {
                                                    setEntitySearch(e.target.value);
                                                    setShowEntityDropdown(true);
                                                }}
                                                onFocus={() => setShowEntityDropdown(true)}
                                                onBlur={() => setTimeout(() => setShowEntityDropdown(false), 200)}
                                            />
                                            {showEntityDropdown && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-[160] max-h-60 overflow-y-auto">
                                                    <div className="p-2">
                                                        {/* Designations */}
                                                        {availableDesignations.filter(d => d.toLowerCase().includes(entitySearch.toLowerCase())).length > 0 && (
                                                            <>
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">Designations</div>
                                                                {availableDesignations
                                                                    .filter(d => d.toLowerCase().includes(entitySearch.toLowerCase()))
                                                                    .map(d => (
                                                                        <button
                                                                            key={d}
                                                                            type="button"
                                                                            onMouseDown={(e) => {
                                                                                e.preventDefault(); // Prevent blur
                                                                                if (!selectedEntities.find(ent => ent.type === 'Designation' && ent.name === d)) {
                                                                                    setSelectedEntities(prev => [...prev, { type: 'Designation', name: d, limit: 5000 }]);
                                                                                }
                                                                                setEntitySearch('');
                                                                                setShowEntityDropdown(false);
                                                                            }}
                                                                            className="w-full text-left px-3 py-1.5 rounded hover:bg-slate-50 text-xs font-semibold text-slate-600"
                                                                        >
                                                                            {d}
                                                                        </button>
                                                                    ))}
                                                            </>
                                                        )}

                                                        {/* Departments */}
                                                        {availableDepartments.filter(d => d.toLowerCase().includes(entitySearch.toLowerCase())).length > 0 && (
                                                            <>
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2 mb-1 px-2">Departments</div>
                                                                {availableDepartments
                                                                    .filter(d => d.toLowerCase().includes(entitySearch.toLowerCase()))
                                                                    .map(d => (
                                                                        <button
                                                                            key={d}
                                                                            type="button"
                                                                            onMouseDown={(e) => {
                                                                                e.preventDefault(); // Prevent blur
                                                                                if (!selectedEntities.find(ent => ent.type === 'Department' && ent.name === d)) {
                                                                                    setSelectedEntities(prev => [...prev, { type: 'Department', name: d, limit: 5000 }]);
                                                                                }
                                                                                setEntitySearch('');
                                                                                setShowEntityDropdown(false);
                                                                            }}
                                                                            className="w-full text-left px-3 py-1.5 rounded hover:bg-slate-50 text-xs font-semibold text-slate-600"
                                                                        >
                                                                            {d}
                                                                        </button>
                                                                    ))}
                                                            </>
                                                        )}

                                                        {/* Employees */}
                                                        {allEmployees.filter(e => e.name.toLowerCase().includes(entitySearch.toLowerCase()) || e.eid.toLowerCase().includes(entitySearch.toLowerCase())).length > 0 && (
                                                            <>
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2 mb-1 px-2">Employees</div>
                                                                {allEmployees
                                                                    .filter(e => e.name.toLowerCase().includes(entitySearch.toLowerCase()) || e.eid.toLowerCase().includes(entitySearch.toLowerCase()))
                                                                    .map(e => (
                                                                        <button
                                                                            key={e.id}
                                                                            type="button"
                                                                            onMouseDown={(e) => {
                                                                                e.preventDefault(); // Prevent blur
                                                                                if (!selectedEntities.find(entity => entity.type === 'Employee' && entity.id === e.id)) {
                                                                                    setSelectedEntities(prev => [...prev, { type: 'Employee', name: e.name, id: e.id, limit: 5000 }]);
                                                                                }
                                                                                setEntitySearch('');
                                                                                setShowEntityDropdown(false);
                                                                            }}
                                                                            className="w-full text-left px-3 py-1.5 rounded hover:bg-slate-50 text-xs font-semibold text-slate-600"
                                                                        >
                                                                            {e.name} ({e.eid})
                                                                        </button>
                                                                    ))}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                        <div className="space-y-0.5">
                                            <label className="text-sm font-bold text-slate-700">Status</label>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Toggle category status</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="status"
                                                defaultChecked={true}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingExpense(false)}
                                        className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold text-sm transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 px-4 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-bold text-sm transition-all shadow-lg shadow-sky-100 disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : 'Add Configuration'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}



                {/* ── Main View (shown when category modal is NOT open) ── */}
                {!showExpenseCategoryView && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">Expense Configurations</h2>
                                <p className="text-sm text-slate-500 mt-1">Manage expense categories, limits, and approval workflows.</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowExpenseCategoryView(true);
                                    setActiveTab('categories');
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl font-bold text-sm hover:bg-sky-700 transition-all shadow-lg shadow-sky-100"
                            >
                                <Settings2 size={16} /> CONFIGURE CATEGORIES
                            </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex border-b border-slate-200 gap-6">
                            {[
                                { id: 'categories', label: 'Expense Categories' },
                                { id: 'rules', label: 'Policy & Workflow' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`pb-3 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />}
                                </button>
                            ))}
                        </div>

                        {/* Tab: Expense Categories / Configurations */}
                        {activeTab === 'categories' && (
                            <div className="space-y-4">
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => {
                                            setSelectedEntities([]);
                                            setEntitySearch('');
                                            setIsAddingExpense(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg font-bold text-sm hover:bg-sky-700 transition-all shadow-md shadow-sky-100"
                                    >
                                        <Plus size={15} /> Add Configuration
                                    </button>
                                </div>
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly Limit</th>
                                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Receipt Required</th>
                                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {configuredExpenses.map((exp) => (
                                                <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-bold text-slate-700">{exp.category_name || exp.name}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-semibold text-slate-600">₹{(exp.max_limit || 0).toLocaleString()}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-semibold text-slate-600">Above ₹{exp.receipt_threshold || 200}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${exp.status === 'Inactive' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                                                            {(exp.status || 'ACTIVE').toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-3">
                                                            <button
                                                                onClick={() => openEditModal(exp)}
                                                                className="text-slate-400 hover:text-sky-600 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit2 size={15} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCategory(exp.id)}
                                                                className="text-slate-400 hover:text-rose-500 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {configuredExpenses.length === 0 && (
                                        <div className="p-10 text-center">
                                            <Receipt className="mx-auto mb-3 text-slate-200" size={40} />
                                            <p className="text-sm font-bold text-slate-400">No expense configurations yet.</p>
                                            <p className="text-xs text-slate-400 mt-1">Click "Add Configuration" to get started.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab: Policy & Workflow */}
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
                                                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
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
                                                        <div className="text-slate-300"><ChevronRight size={16} /></div>
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
                )}

                {/* ── Expense Categories Configuration Modal ── */}
                {showExpenseCategoryView && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
                            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                                {/* Header Section */}
                                <div className="flex flex-col space-y-4 pb-6 border-b border-slate-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-800">Expense Categories Configuration</h3>
                                            <p className="text-slate-500 mt-1">Set up and manage expense categories for HR</p>
                                        </div>
                                        <button
                                            onClick={() => setShowExpenseCategoryView(false)}
                                            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>

                                    {/* Tabs and Action Button */}
                                    <div className="flex justify-between items-end">
                                        <div className="flex gap-8">
                                            {[
                                                { id: 'categories', label: 'Expense Categories' },
                                            ].map(tab => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id as any)}
                                                    className={`pb-3 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    {tab.label}
                                                    {activeTab === tab.id && (
                                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        {activeTab === 'categories' && (
                                            <button
                                                onClick={() => {
                                                    setEditingCategory(null);
                                                    setIsAddingCategory(true);
                                                }}
                                                className="px-6 py-2.5 bg-sky-600 text-white rounded-lg font-bold text-sm hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 flex items-center gap-2"
                                            >
                                                <Plus size={16} /> ADD CATEGORY
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Main Content Area */}
                                <div className="pb-20">
                                    {activeTab === 'categories' ? (
                                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 border-b border-slate-100">
                                                    <tr>
                                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category Name</th>
                                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {categories.map((cat) => (
                                                        <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">
                                                            <td className="px-6 py-6">
                                                                <p className="text-sm font-bold text-slate-700">{cat.name}</p>
                                                            </td>
                                                            <td className="px-6 py-6">
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${cat.status === 'Inactive' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                                                                    {cat.status?.toUpperCase() || 'ACTIVE'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-6 text-right">
                                                                <div className="flex justify-end gap-3">
                                                                    <button onClick={() => openEditModal(cat)} className="text-slate-400 hover:text-sky-600 transition-colors" title="Edit">
                                                                        <Edit2 size={16} />
                                                                    </button>
                                                                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-400 hover:text-rose-500 transition-colors" title="Delete">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {categories.length === 0 && (
                                                <div className="p-8 text-center text-slate-400">
                                                    No categories found. Add one to get started.
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
                                            {/* Left Side: List */}
                                            <div className="w-full lg:w-1/3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Category</h4>
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                                    {categories.map(cat => (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => setEditingCategory(cat)}
                                                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all flex justify-between items-center ${editingCategory?.id === cat.id ? 'bg-sky-50 text-sky-700 border border-sky-100' : 'text-slate-600 hover:bg-slate-50'}`}
                                                        >
                                                            {cat.name}
                                                            {editingCategory?.id === cat.id && <ChevronRight size={16} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Right Side: Configuration Panel */}
                                            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                                {editingCategory ? (
                                                    <>
                                                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                                                            <h4 className="text-sm font-bold text-slate-800">Expense Configuration</h4>
                                                            <span className="text-xs font-semibold text-slate-400">{editingCategory.name}</span>
                                                        </div>
                                                        <div className="p-6 flex-1 overflow-y-auto space-y-6">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly Limit</label>
                                                                    <div className="relative">
                                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                                                        <input
                                                                            type="text"
                                                                            defaultValue={editingCategory.max_limit}
                                                                            className="w-full pl-7 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-sky-500 transition-all"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Receipt Requirements</label>
                                                                    <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-sky-500 transition-all">
                                                                        <option>Required above ₹{editingCategory.receipt_threshold || 200}</option>
                                                                        <option>Always Required</option>
                                                                        <option>Not Required</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approval Workflows</label>
                                                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 flex items-center gap-2">
                                                                    <ShieldCheck size={16} className="text-sky-600" />
                                                                    <span>Reporting Manager</span>
                                                                    <ChevronRight size={14} className="text-slate-400" />
                                                                    <span>Finance Head</span>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                                                <label className="flex items-center justify-between cursor-pointer">
                                                                    <span className="text-sm font-semibold text-slate-700">Allow split expenses</span>
                                                                    <input type="checkbox" className="accent-sky-600 w-4 h-4" />
                                                                </label>
                                                                <label className="flex items-center justify-between cursor-pointer">
                                                                    <span className="text-sm font-semibold text-slate-700">Require description</span>
                                                                    <input type="checkbox" defaultChecked={true} className="accent-sky-600 w-4 h-4" />
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="p-5 border-t border-slate-100 bg-slate-50/30 flex justify-end">
                                                            <button className="px-6 py-2 bg-sky-600 text-white rounded-lg font-bold text-sm hover:bg-sky-700 transition-all shadow-md shadow-sky-100">
                                                                Save Changes
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-300">
                                                        <Settings2 size={48} className="mb-4 opacity-50" />
                                                        <p className="text-sm font-bold">Select a category to configure</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseSettings;
