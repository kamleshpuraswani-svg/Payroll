import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import {
    Receipt,
    Plus,
    Edit2,
    Trash2,
    X,
    ChevronDown,
    Search,
    ShieldCheck,
    Users,
    Home,
    User
} from 'lucide-react';

const ExpenseSettings: React.FC = () => {
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // State for Expense Categories
    const [categories, setCategories] = useState<any[]>([]);
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [editingExpense, setEditingExpense] = useState<any>(null);
    const [configuredExpenses, setConfiguredExpenses] = useState<any[]>([]);
    const [allEmployees, setAllEmployees] = useState<any[]>([]);
    
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
                }
            } else if (catData) {
                setCategories(catData);
            }

            // Fetch all employees with designations for configurations
            const { data: empData, error: empError } = await supabase
                .from('employees')
                .select('id, first_name, last_name, eid, avatar_url, department, designation')
                .eq('status', 'Active')
                .order('first_name');
            
            if (empError) console.error('Employee fetch error:', empError);
            if (empData) {
                const formattedEmployees = empData.map(emp => ({
                    ...emp,
                    name: `${emp.first_name} ${emp.last_name || ''}`.trim()
                }));
                setAllEmployees(formattedEmployees);
                const depts = Array.from(new Set(formattedEmployees.map(e => e.department).filter(Boolean))) as string[];
                const desigs = Array.from(new Set(formattedEmployees.map((e: any) => e.designation).filter(Boolean))) as string[];
                setAvailableDepartments(depts.length > 0 ? depts.sort() : FALLBACK_DEPTS);
                setAvailableDesignations(desigs.length > 0 ? desigs.sort() : FALLBACK_DESIGS);
            } else {
                setAvailableDepartments(FALLBACK_DEPTS);
                setAvailableDesignations(FALLBACK_DESIGS);
            }
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

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            await supabase.from('expense_categories').delete().eq('id', id);
            await fetchData();
        } catch (error) {
            console.error('Error deleting category:', error);
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

    const handleSaveExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const categoryId = formData.get('category') as string;
        const status = formData.get('status') === 'on' ? 'Active' : 'Inactive';

        setIsSaving(true);
        try {
            const configData = {
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
                {/* ── Main View: Expenses Management ── */}
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800">Expenses Management</h2>
                            <p className="text-sm text-slate-500 mt-1">Set up and manage expense categories and their global limits.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setEditingCategory(null);
                                    setIsAddingCategory(true);
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <Plus size={16} /> ADD CATEGORY
                            </button>
                            <button
                                onClick={() => {
                                    setEditingExpense(null);
                                    setSelectedEntities([]);
                                    setIsAddingExpense(true);
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl font-bold text-sm hover:bg-sky-700 transition-all shadow-lg shadow-sky-100"
                            >
                                <Plus size={16} /> ADD CONFIGURATION
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                            <div className="p-20 text-center">
                                <Receipt className="mx-auto mb-4 text-slate-200" size={48} />
                                <h3 className="text-lg font-bold text-slate-400">No categories found</h3>
                                <p className="text-sm text-slate-400 mt-1">Add your first expense category to get started.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Expense Configurations Section ── */}
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Expense Configurations</h2>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Overrides and eligibility for specific groups</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applicable To</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Limits</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {categories.filter(c => c.applicable_to && c.applicable_to.length > 0).map((cat) => (
                                    <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-black text-slate-800">{cat.name}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-1.5">
                                                {cat.applicable_to.map((ent: any, i: number) => (
                                                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-tight">
                                                        {ent.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-black text-slate-700">₹{cat.max_limit?.toLocaleString()} limit</p>
                                                <p className="text-[9px] font-bold text-slate-400">₹{cat.receipt_threshold?.toLocaleString()} receipt threshold</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${cat.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {cat.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => {
                                                    setEditingExpense(cat);
                                                    setSelectedEntities(cat.applicable_to || []);
                                                    setIsAddingExpense(true);
                                                }} className="p-1.5 text-slate-400 hover:text-sky-600">
                                                    <Edit2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {categories.filter(c => c.applicable_to && c.applicable_to.length > 0).length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest italic">
                                            No special configurations defined
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseSettings;
