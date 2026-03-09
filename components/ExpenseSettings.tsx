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
    ChevronRight,
    Home,
    User
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
    const [editingExpense, setEditingExpense] = useState<any>(null);
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
        backdated_limit_months: 3
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

    const toggleCategoryStatus = async (id: string) => {
        const category = categories.find(c => c.id === id);
        if (!category) return;

        const newStatus = category.status === 'Active' ? 'Inactive' : 'Active';

        try {
            const { error } = await supabase
                .from('expense_categories')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            await fetchData();
        } catch (error: any) {
            console.error('Error toggling status:', error);
            alert(`Failed to update status: ${error.message || 'Unknown error'}`);
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
            // Calculate a baseline limit from the selected entities if any, or use 0
            const maxLimit = selectedEntities.length > 0 ? Math.max(...selectedEntities.map(e => e.limit || 0)) : 0;
            const minThreshold = selectedEntities.length > 0 ? Math.min(...selectedEntities.map(e => e.receipt_threshold || 200)) : 200;

            const configData = {
                max_limit: maxLimit,
                receipt_threshold: minThreshold,
                status: status,
                applicable_to: selectedEntities,
                updated_at: new Date().toISOString()
            };

            const targetId = editingExpense ? editingExpense.id : categoryId;

            if (!targetId) throw new Error('Category is required');

            const { error } = await supabase
                .from('expense_categories')
                .update(configData)
                .eq('id', targetId);

            if (error) throw error;

            await fetchData();
            setIsAddingExpense(false);
            setEditingExpense(null);
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

    const openEditExpenseModal = (expense: any) => {
        setEditingExpense(expense);
        setSelectedEntities(expense.applicable_to || []);
        setIsAddingExpense(true);
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
                {isAddingExpense && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight">
                                        {editingExpense ? 'Edit Expense Configuration' : 'Add Expense Configuration'}
                                    </h3>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Define category limits and applicability</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsAddingExpense(false);
                                        setEditingExpense(null);
                                    }}
                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSaveExpense} className="flex flex-col h-[85vh] max-h-[750px]">
                                <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar bg-white">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[1.5px]">Expense Category</label>
                                        <div className="relative group">
                                            <select
                                                name="category"
                                                defaultValue={editingExpense?.id || ''}
                                                disabled={!!editingExpense}
                                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all appearance-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer group-hover:border-slate-300"
                                                required
                                            >
                                                <option value="">Choose a category...</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-500 transition-colors" />
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-sm font-black text-slate-800">Applicable To & Per-Entity Limits</h4>
                                                <p className="text-[11px] text-slate-400 font-bold mt-0.5">Control monthly limits and receipt thresholds for specific groups.</p>
                                            </div>
                                            <div className="relative w-full md:w-80 group">
                                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="Search Dept, Designation or Employee..."
                                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-sky-500 focus:bg-white shadow-sm transition-all group-hover:border-slate-300 placeholder:text-slate-300"
                                                    value={entitySearch}
                                                    onChange={(e) => {
                                                        setEntitySearch(e.target.value);
                                                        setShowEntityDropdown(true);
                                                    }}
                                                    onFocus={() => setShowEntityDropdown(true)}
                                                    onBlur={() => setTimeout(() => setShowEntityDropdown(false), 200)}
                                                />
                                                {showEntityDropdown && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[160] max-h-72 overflow-y-auto animate-in slide-in-from-top-2 duration-200 custom-scrollbar border-t-0 ring-4 ring-slate-900/5">
                                                        <div className="p-3">
                                                            {/* Designations */}
                                                            {availableDesignations.filter(d => d.toLowerCase().includes(entitySearch.toLowerCase())).length > 0 && (
                                                                <div className="mb-4">
                                                                    <div className="text-[9px] font-black text-slate-300 tracking-[3px] uppercase px-3 py-2">Designations</div>
                                                                    {availableDesignations
                                                                        .filter(d => d.toLowerCase().includes(entitySearch.toLowerCase()))
                                                                        .map(d => (
                                                                            <button
                                                                                key={d}
                                                                                type="button"
                                                                                onMouseDown={(ev) => {
                                                                                    ev.preventDefault();
                                                                                    if (!selectedEntities.find(ent => ent.type === 'Designation' && ent.name === d)) {
                                                                                        setSelectedEntities(prev => [...prev, { type: 'Designation', name: d, limit: 5000, receipt_threshold: 200 }]);
                                                                                    }
                                                                                    setEntitySearch('');
                                                                                }}
                                                                                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-sky-50 text-[11px] font-bold text-slate-600 flex items-center justify-between group/item transition-colors"
                                                                            >
                                                                                <span className="flex items-center gap-2">
                                                                                    <ShieldCheck size={14} className="text-amber-500" />
                                                                                    {d}
                                                                                </span>
                                                                                <Plus size={14} className="opacity-0 group-hover/item:opacity-100 text-sky-500 translate-x-2 group-hover/item:translate-x-0 transition-all" />
                                                                            </button>
                                                                        ))}
                                                                </div>
                                                            )}

                                                            {/* Departments */}
                                                            {availableDepartments.filter(d => d.toLowerCase().includes(entitySearch.toLowerCase())).length > 0 && (
                                                                <div className="mb-4">
                                                                    <div className="text-[9px] font-black text-slate-300 tracking-[3px] uppercase px-3 py-2">Departments</div>
                                                                    {availableDepartments
                                                                        .filter(d => d.toLowerCase().includes(entitySearch.toLowerCase()))
                                                                        .map(d => (
                                                                            <button
                                                                                key={d}
                                                                                type="button"
                                                                                onMouseDown={(ev) => {
                                                                                    ev.preventDefault();
                                                                                    if (!selectedEntities.find(ent => ent.type === 'Department' && ent.name === d)) {
                                                                                        setSelectedEntities(prev => [...prev, { type: 'Department', name: d, limit: 5000, receipt_threshold: 200 }]);
                                                                                    }
                                                                                    setEntitySearch('');
                                                                                }}
                                                                                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-purple-50 text-[11px] font-bold text-slate-600 flex items-center justify-between group/item transition-colors"
                                                                            >
                                                                                <span className="flex items-center gap-2">
                                                                                    <Home size={14} className="text-purple-500" />
                                                                                    {d}
                                                                                </span>
                                                                                <Plus size={14} className="opacity-0 group-hover/item:opacity-100 text-purple-500 translate-x-2 group-hover/item:translate-x-0 transition-all" />
                                                                            </button>
                                                                        ))}
                                                                </div>
                                                            )}

                                                            {/* Employees */}
                                                            {allEmployees.filter(e => e.name.toLowerCase().includes(entitySearch.toLowerCase()) || e.eid.toLowerCase().includes(entitySearch.toLowerCase())).length > 0 && (
                                                                <div>
                                                                    <div className="text-[9px] font-black text-slate-300 tracking-[3px] uppercase px-3 py-2">Employees</div>
                                                                    {allEmployees
                                                                        .filter(e => e.name.toLowerCase().includes(entitySearch.toLowerCase()) || e.eid.toLowerCase().includes(entitySearch.toLowerCase()))
                                                                        .map(e => (
                                                                            <button
                                                                                key={e.id}
                                                                                type="button"
                                                                                onMouseDown={(ev) => {
                                                                                    ev.preventDefault();
                                                                                    if (!selectedEntities.find(entity => entity.type === 'Employee' && entity.id === e.id)) {
                                                                                        setSelectedEntities(prev => [...prev, { type: 'Employee', name: e.name, id: e.id, limit: 5000, receipt_threshold: 200 }]);
                                                                                    }
                                                                                    setEntitySearch('');
                                                                                }}
                                                                                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-sky-50 text-[11px] font-bold text-slate-600 flex items-center justify-between group/item transition-colors"
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
                                                                                        <span className="text-[10px] uppercase">{e.name.charAt(0)}</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="font-black text-slate-700">{e.name}</div>
                                                                                        <div className="text-[9px] text-slate-400 font-bold">{e.eid} • {e.department}</div>
                                                                                    </div>
                                                                                </div>
                                                                                <Plus size={14} className="opacity-0 group-hover/item:opacity-100 text-sky-500 translate-x-2 group-hover/item:translate-x-0 transition-all" />
                                                                            </button>
                                                                        ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 border border-slate-100 rounded-[24px] overflow-hidden shadow-sm">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-100/50">
                                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Applicable Entity</th>
                                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] w-52">Exp. Limit (Monthly)</th>
                                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] w-52">Receipt Threshold</th>
                                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[2px] w-16 text-center">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 bg-white">
                                                        {selectedEntities.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={4} className="px-8 py-20 text-center">
                                                                    <div className="flex flex-col items-center gap-4">
                                                                        <div className="w-16 h-16 rounded-[20px] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                                                                            <Users size={28} className="text-slate-200" />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <p className="text-sm font-black text-slate-500">No entities selection detected</p>
                                                                            <p className="text-[11px] text-slate-400 font-bold">Try searching for a department, designation or specific employee above.</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            selectedEntities.map((entity, idx) => (
                                                                <tr key={idx} className="group hover:bg-slate-50/30 transition-all animate-in fade-in slide-in-from-top-1 duration-300">
                                                                    <td className="px-8 py-5">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border ${entity.type === 'Employee' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                                                                                entity.type === 'Department' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                                                }`}>
                                                                                {entity.type === 'Employee' ? <User size={18} /> : entity.type === 'Department' ? <Home size={18} /> : <ShieldCheck size={18} />}
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-sm font-black text-slate-800 leading-tight mb-0.5">{entity.name}</p>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${entity.type === 'Employee' ? 'bg-sky-100 text-sky-700' :
                                                                                        entity.type === 'Department' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                                                                                        }`}>{entity.type}</span>
                                                                                    {entity.id && <span className="text-[10px] text-slate-400 font-bold">#{entity.id}</span>}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-8 py-5">
                                                                        <div className="relative group/input">
                                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xs transition-colors group-focus-within/input:text-sky-500">₹</span>
                                                                            <input
                                                                                type="number"
                                                                                value={entity.limit || ''}
                                                                                onChange={(e) => {
                                                                                    const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                                                                                    setSelectedEntities(prev => prev.map((ent, i) => i === idx ? { ...ent, limit: val } : ent));
                                                                                }}
                                                                                className="w-full pl-8 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-black text-slate-700 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none"
                                                                                placeholder="0.00"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-8 py-5">
                                                                        <div className="relative group/input">
                                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xs transition-colors group-focus-within/input:text-sky-500">₹</span>
                                                                            <input
                                                                                type="number"
                                                                                value={entity.receipt_threshold || ''}
                                                                                onChange={(e) => {
                                                                                    const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                                                                                    setSelectedEntities(prev => prev.map((ent, i) => i === idx ? { ...ent, receipt_threshold: val } : ent));
                                                                                }}
                                                                                className="w-full pl-8 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-black text-slate-700 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none"
                                                                                placeholder="0.00"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-8 py-5 text-center">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setSelectedEntities(prev => prev.filter((_, i) => i !== idx))}
                                                                            className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all hover:rotate-12 outline-none"
                                                                        >
                                                                            <Trash2 size={18} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl group hover:border-slate-300 transition-all">
                                            <span className="text-sm font-black text-slate-600">Status</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="status"
                                                    defaultChecked={editingExpense ? editingExpense.status !== 'Inactive' : true}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500 shadow-inner"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50/30 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddingExpense(false);
                                            setEditingExpense(null);
                                        }}
                                        className="px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-50 hover:text-slate-700 font-black text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-12 py-3 bg-sky-600 text-white rounded-2xl hover:bg-sky-700 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-sky-100 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSaving ? 'Processing...' : 'Save'}
                                        {!isSaving && <ChevronRight size={16} />}
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
                                            setEditingExpense(null);
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
                                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Created By</th>
                                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Last Modified By</th>
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
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-[10px] font-bold text-sky-600">HM</div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-600">HR Manager</p>
                                                                {exp.created_at && (
                                                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                                                        {new Date(exp.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">HM</div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-600">HR Manager</p>
                                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                                    {new Date(exp.updated_at || exp.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end items-center gap-4">
                                                            <button
                                                                onClick={() => toggleCategoryStatus(exp.id)}
                                                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${exp.status !== 'Inactive' ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                                                title={exp.status !== 'Inactive' ? "Deactivate" : "Activate"}
                                                            >
                                                                <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${exp.status !== 'Inactive' ? 'translate-x-5' : 'translate-x-1'}`} />
                                                            </button>
                                                            <div className="h-4 w-[1px] bg-slate-100 mx-1"></div>
                                                            <button
                                                                onClick={() => openEditExpenseModal(exp)}
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
                                                <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700">Back-dated Claims Limit</p>
                                                        <p className="text-xs text-slate-500">How many months back can employees claim?</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={settings.backdated_limit_months}
                                                            onChange={(e) => updateSettings({ backdated_limit_months: parseInt(e.target.value) })}
                                                            className="w-28 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-sky-600 focus:outline-none focus:border-sky-500 bg-white appearance-none text-center cursor-pointer hover:border-sky-300 transition-colors"
                                                        >
                                                            <option value={0}>No limit</option>
                                                            {[1, 2, 3, 4, 5, 6, 12, 24].map((m) => (
                                                                <option key={m} value={m}>{m} {m === 1 ? 'Month' : 'Months'}</option>
                                                            ))}
                                                        </select>
                                                        <span className="text-[10px] font-black text-slate-400">LIMIT</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Approval Workflow Section */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Approval Workflow</h3>
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
                                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Created By</th>
                                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Last Modified By</th>
                                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {categories.map((cat) => (
                                                        <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">
                                                            <td className="px-6 py-6 border-b border-slate-50">
                                                                <p className="text-sm font-bold text-slate-700">{cat.name}</p>
                                                            </td>
                                                            <td className="px-6 py-6 border-b border-slate-50">
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${cat.status === 'Inactive' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                                                                    {cat.status?.toUpperCase() || 'ACTIVE'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-6 border-b border-slate-50">
                                                                <span className="text-sm font-medium text-slate-600">HR Manager</span>
                                                                {cat.created_at && (
                                                                    <p className="text-[10px] text-slate-400 mt-1">
                                                                        {new Date(cat.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                    </p>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-6 border-b border-slate-50">
                                                                <span className="text-sm font-medium text-slate-600">HR Manager</span>
                                                                {cat.updated_at && (
                                                                    <p className="text-[10px] text-slate-400 mt-1">
                                                                        {new Date(cat.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                    </p>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-6 text-right border-b border-slate-50">
                                                                <div className="flex justify-end items-center gap-4">
                                                                    <button
                                                                        onClick={() => toggleCategoryStatus(cat.id)}
                                                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${cat.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                                                        title={cat.status === 'Active' ? "Deactivate" : "Activate"}
                                                                    >
                                                                        <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${cat.status === 'Active' ? 'translate-x-5' : 'translate-x-1'}`} />
                                                                    </button>
                                                                    <div className="flex gap-2 border-l border-slate-100 pl-4 items-center">
                                                                        <button onClick={() => openEditModal(cat)} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all" title="Edit">
                                                                            <Edit2 size={16} />
                                                                        </button>
                                                                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
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
