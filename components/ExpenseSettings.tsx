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
    Check
} from 'lucide-react';

const ExpenseSettings: React.FC = () => {
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'categories' | 'rules'>('categories');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // State for Expense Categories
    const [categories, setCategories] = useState<any[]>([]);

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

            if (catData) setCategories(catData);

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
        const description = formData.get('description') as string;

        setIsSaving(true);
        try {
            if (editingCategory) {
                const { error } = await supabase
                    .from('expense_categories')
                    .update({
                        name,
                        max_limit: parseFloat(limit.replace(/[^0-9.]/g, '')),
                        description
                    })
                    .eq('id', editingCategory.id);
            } else {
                const { error } = await supabase
                    .from('expense_categories')
                    .insert([{
                        name,
                        max_limit: parseFloat(limit.replace(/[^0-9.]/g, '')),
                        status: 'Active',
                        description
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
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Description (Optional)</label>
                                    <textarea
                                        name="description"
                                        rows={3}
                                        defaultValue={editingCategory?.description || ''}
                                        placeholder="Describe the scope of this category..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all resize-none"
                                    />
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
                                                    <p className="text-sm font-bold text-slate-700">Deadline for claims</p>
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
                                                    <p className="text-sm font-bold text-slate-700">Receipt Mandatory</p>
                                                    <p className="text-xs text-slate-500">For amounts greater than</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-400 font-bold">₹</span>
                                                    <input
                                                        type="number"
                                                        value={settings.receipt_mandatory_amount}
                                                        onChange={(e) => updateSettings({ receipt_mandatory_amount: parseFloat(e.target.value) })}
                                                        className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-sky-600 text-center focus:outline-none focus:border-sky-500 disabled:bg-white"
                                                    />
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
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center text-center py-20 space-y-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                    <Clock size={32} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Advanced Workflow Engine</h3>
                                    <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">
                                        Multi-level approval workflows are currently managed at the organization level.
                                        To customize expense-specific workflows, please contact your administrator.
                                    </p>
                                </div>
                                <button className="mt-4 px-6 py-2 bg-slate-800 text-white rounded-lg font-bold text-sm hover:bg-slate-900 transition-all">
                                    Request Custom Workflow
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpenseSettings;
