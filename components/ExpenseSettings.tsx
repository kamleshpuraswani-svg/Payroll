import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { X, Search, Home, ShieldCheck, User, Trash2, ChevronDown, Receipt, Plus, Edit2, ArrowLeft, Calendar, Repeat } from 'lucide-react';

const BUSINESS_UNITS = [
    "MindInventory",
    "300 Minds",
    "CollabCRM"
];

const ExpenseSettings: React.FC = () => {
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [isShowCategoriesDialog, setIsShowCategoriesDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // State for Expense Categories
    const [categories, setCategories] = useState<any[]>([]);
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [editingExpense, setEditingExpense] = useState<any>(null);
    const [configuredExpenses, setConfiguredExpenses] = useState<any[]>([]);
    const [allEmployees, setAllEmployees] = useState<any[]>([]);
    const [paygroups, setPaygroups] = useState<any[]>([]);
    const [selectedTarget, setSelectedTarget] = useState('bu:MindInventory');
    
    // Multi-select state for Add Expense modal
    const [selectedEntities, setSelectedEntities] = useState<any[]>([]);
    const [availableDesignations, setAvailableDesignations] = useState<string[]>([]);
    const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
    const [entitySearch, setEntitySearch] = useState('');
    const [showEntityDropdown, setShowEntityDropdown] = useState(false);

    // Hardcoded fallbacks
    const FALLBACK_DEPTS = ['Engineering', 'Product', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations', 'QA', 'Customer Success', 'Design', 'Legal', 'Administration'];
    const FALLBACK_DESIGS = ['Software Engineer', 'Senior Software Engineer', 'Tech Lead', 'Product Manager', 'Designer', 'Senior Designer', 'Accountant', 'Finance Manager', 'HR Associate', 'HR Manager', 'Sales Lead', 'Sales Executive', 'QA Analyst', 'Business Analyst', 'Operations Manager', 'Director'];

    useEffect(() => {
        fetchData();
    }, [selectedTarget]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [type, id] = selectedTarget.split(':');

            // Fetch categories
            const { data: catData, error: catError } = await supabase
                .from('expense_categories')
                .select('*')
                .eq('target_type', type)
                .eq('target_id', id)
                .order('name');

            if (catError) throw catError;

            // If no categories found, insert dummy data
            if (catData && catData.length === 0) {
                const dummyCategories = [
                    { name: 'Travel & Conveyance', max_limit: 5000, receipt_threshold: 1000, pro_rata: true, status: 'Active', description: 'Includes flight, train, and local taxi fares.', target_type: type, target_id: id },
                    { name: 'Meals & Entertainment', max_limit: 2000, receipt_threshold: 500, pro_rata: false, status: 'Active', description: 'Business lunches and team dinners.', target_type: type, target_id: id },
                    { name: 'Communication', max_limit: 1500, receipt_threshold: 0, pro_rata: false, status: 'Active', description: 'Mobile and internet bill reimbursements.', target_type: type, target_id: id },
                    { name: 'Office Supplies', max_limit: 5000, receipt_threshold: 500, pro_rata: true, status: 'Active', description: 'Stationery and minor equipment.', target_type: type, target_id: id }
                ];
                const { error: insertError } = await supabase.from('expense_categories').insert(dummyCategories);
                if (insertError) throw insertError;

                // Re-fetch after insertion to get actual data with IDs
                const { data: refreshedCat, error: refreshError } = await supabase
                    .from('expense_categories')
                    .select('*')
                    .eq('target_type', type)
                    .eq('target_id', id)
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
                .select('*')
                .eq('status', 'Active');
            
            if (empError) {
                console.error('Employee fetch error:', empError);
            } else if (empData) {
                const formattedEmployees = empData.map(emp => ({
                    id: emp.id,
                    name: emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'No Name',
                    eid: emp.eid || emp.employee_id || 'N/A',
                    department: emp.department,
                    designation: emp.designation,
                    avatar_url: emp.avatar_url
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

            // Fetch paygroups
            const { data: pgData, error: pgError } = await supabase
                .from('paygroups')
                .select('*')
                .order('name');
            
            if (pgError) {
                console.error('Error fetching paygroups:', pgError);
            } else {
                setPaygroups(pgData || []);
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

        const [type, id] = selectedTarget.split(':');

        setIsSaving(true);
        try {
            const categoryData = {
                name,
                status,
                target_type: type,
                target_id: id,
                last_updated_by: 'HR Manager',
                ...(editingCategory ? {} : { created_by: 'HR Manager' })
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
                .update({ 
                    status: newStatus, 
                    updated_at: new Date().toISOString(),
                    last_updated_by: 'HR Manager'
                })
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
        const categoryName = formData.get('category_name') as string;
        const status = formData.get('status') === 'on' ? 'Active' : 'Inactive';
        const effectiveFrom = formData.get('effectiveFrom') as string;

        // Check if at least one entity is added with limits
        if (selectedEntities.length === 0) {
            alert('Please select at least one Department or Designation before saving.');
            return;
        }

        setIsSaving(true);
        try {
            const [targetType, targetId] = selectedTarget.split(':');
            const configData: any = {
                status: status,
                applicable_to: selectedEntities,
                effective_from: effectiveFrom || null,
                updated_at: new Date().toISOString(),
                last_updated_by: 'HR Manager',
                created_by: 'HR Manager'
            };

            if (categoryName) {
                configData.name = categoryName;
            }

            if (editingExpense) {
                const { error } = await supabase
                    .from('expense_categories')
                    .update(configData)
                    .eq('id', editingExpense.id);

                if (error) throw error;
            } else {
                if (!categoryName) throw new Error('Expense Category Name is required');
                configData.target_type = targetType;
                configData.target_id = targetId;
                
                const { error } = await supabase
                    .from('expense_categories')
                    .insert([configData]);

                if (error) throw error;
            }

            await fetchData();
            setIsAddingExpense(false);
            setEditingExpense(null);
            setSelectedEntities([]);
            setEntitySearch('');
        } catch (error: any) {
            console.error('Error saving expense config:', error);
            if (error?.code === '23505') {
                alert('An Expense Category with this name already exists. Please choose a different name.');
            } else {
                alert(`Failed to save configuration: ${error.message || 'Unknown error'}`);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const addEntityToSelection = (type: 'dept' | 'desig' | 'emp', item: any) => {
        const entityLabel = type === 'dept' ? item : type === 'desig' ? item : item.name;
        const entityId = type === 'emp' ? item.id : item;
        
        // Prevent duplicates
        if (selectedEntities.some(e => e.id === entityId && e.type === type)) {
            setEntitySearch('');
            setShowEntityDropdown(false);
            return;
        }

        setSelectedEntities([...selectedEntities, {
            type,
            id: entityId,
            name: entityLabel,
            max_limit: 0,
            receipt_threshold: 0
        }]);
        setEntitySearch('');
        setShowEntityDropdown(false);
    };

    const removeEntityFromSelection = (type: string, id: string) => {
        setSelectedEntities(selectedEntities.filter(e => !(e.type === type && e.id === id)));
    };

    const updateEntityLimit = (type: string, id: string, field: 'max_limit' | 'receipt_threshold', value: number) => {
        setSelectedEntities(selectedEntities.map(e => 
            (e.type === type && e.id === id) ? { ...e, [field]: value } : e
        ));
    };

    const openEditModal = (category: any) => {
        setEditingCategory(category);
        setIsAddingCategory(true);
    };

    if (isAddingExpense) {
        return (
            <form onSubmit={handleSaveExpense} className="h-full flex flex-col bg-slate-50/50 absolute inset-0 z-50">
                {/* Header */}
                <div className="bg-white px-6 py-5 flex items-center justify-between border-b border-slate-200 sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                setIsAddingExpense(false);
                                setEditingExpense(null);
                                setSelectedEntities([]);
                            }}
                            className="p-2 -ml-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors focus:outline-none"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                                {editingExpense ? 'Edit Expense Rule' : 'Add Expense Rule'}
                            </h2>
                            <p className="text-sm text-slate-500 mt-0.5">Define expense category name, effective date, and applicable departments or designations.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setIsAddingExpense(false);
                                setEditingExpense(null);
                                setSelectedEntities([]);
                            }}
                            className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold text-sm transition-all shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-bold text-sm transition-all shadow-md active:scale-95 disabled:hover:scale-100 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving ? 'Saving...' : 'Submit'}
                        </button>
                    </div>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="max-w-4xl mx-auto space-y-6">
                        
                        {/* Section 1: Basic Details */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                <span className="bg-sky-100 text-sky-700 w-6 h-6 rounded-md flex items-center justify-center text-xs">1</span> 
                                Expense Category & Settings
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expense Category Name <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Receipt size={16} className="text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="category_name"
                                            defaultValue={editingExpense?.name || ""}
                                            placeholder="e.g. Travel & Conveyance"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Effective From</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Calendar size={16} className="text-slate-400" />
                                        </div>
                                        <input
                                            type="date"
                                            name="effectiveFrom"
                                            defaultValue={editingExpense?.effective_from || ""}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Target Configuration */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-4">
                                <span className="bg-sky-100 text-sky-700 w-6 h-6 rounded-md flex items-center justify-center text-xs">2</span> 
                                Target Limits & Defaults
                            </h3>
                            
                            {/* Entity Search & Selection */}
                            <div className="space-y-5 pt-2">
                                <div className="space-y-2 relative">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select Department or Designation</label>
                                    <div className="relative mt-1">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Search size={18} className="text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={entitySearch}
                                            onChange={(e) => {
                                                setEntitySearch(e.target.value);
                                                setShowEntityDropdown(true);
                                            }}
                                            onFocus={() => setShowEntityDropdown(true)}
                                            placeholder="Search to add... e.g., 'Engineering'"
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all shadow-inner"
                                        />
                                    </div>

                                    {/* Results Dropdown */}
                                    {showEntityDropdown && entitySearch.length > 0 && (
                                        <div className="absolute z-10 top-full inset-x-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-72 overflow-y-auto scrollbar-hide py-2 animate-in slide-in-from-top-2 duration-200">
                                            {/* Departments */}
                                            <div className="px-4 py-2 bg-slate-50/80 border-y border-slate-100 flex items-center gap-2">
                                                <Home size={12} className="text-slate-500" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Departments</span>
                                            </div>
                                            {availableDepartments.filter(d => d.toLowerCase().includes(entitySearch.toLowerCase())).map(dept => (
                                                <div key={`dept-${dept}`} onClick={() => addEntityToSelection('dept', dept)} className="px-5 py-2.5 hover:bg-sky-50 hover:text-sky-700 cursor-pointer text-sm font-semibold text-slate-700 transition-colors">
                                                    {dept}
                                                </div>
                                            ))}

                                            {/* Designations */}
                                            <div className="px-4 py-2 bg-slate-50/80 border-y border-slate-100 flex items-center gap-2 mt-2">
                                                <ShieldCheck size={12} className="text-slate-500" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Designations</span>
                                            </div>
                                            {availableDesignations.filter(d => d.toLowerCase().includes(entitySearch.toLowerCase())).map(desig => (
                                                <div key={`desig-${desig}`} onClick={() => addEntityToSelection('desig', desig)} className="px-5 py-2.5 hover:bg-sky-50 hover:text-sky-700 cursor-pointer text-sm font-semibold text-slate-700 transition-colors">
                                                    {desig}
                                                </div>
                                            ))}
                                            
                                            {/* No Results */}
                                            {availableDepartments.filter(d => d.toLowerCase().includes(entitySearch.toLowerCase())).length === 0 &&
                                             availableDesignations.filter(d => d.toLowerCase().includes(entitySearch.toLowerCase())).length === 0 && (
                                                <div className="px-5 py-4 text-center text-slate-400 text-xs font-bold uppercase tracking-widest italic">
                                                    No matches found
                                                </div>
                                             )}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Entities List with Inputs */}
                                <div className="space-y-4 mt-6">
                                    {selectedEntities.map((entity, index) => (
                                        <div key={`${entity.type}-${entity.id}`} className="px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-xl space-y-4 hover:border-slate-300 transition-colors group">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 shadow-sm border ${
                                                        entity.type === 'dept' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                                        entity.type === 'desig' ? 'bg-amber-50 border-amber-100 text-amber-600' : 
                                                        'bg-emerald-50 border-emerald-100 text-emerald-600'
                                                    }`}>
                                                        {entity.type === 'dept' ? <Home size={18} /> : entity.type === 'desig' ? <ShieldCheck size={18} /> : <User size={18} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800">{entity.name}</p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{entity.type === 'dept' ? 'Department' : entity.type === 'desig' ? 'Designation' : 'Employee'}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeEntityFromSelection(entity.type, entity.id)}
                                                    className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6 pt-2">
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monthly Limit (₹)</label>
                                                    <input
                                                        type="number"
                                                        value={entity.max_limit}
                                                        onChange={(e) => updateEntityLimit(entity.type, entity.id, 'max_limit', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Receipt Threshold (₹)</label>
                                                    <input
                                                        type="number"
                                                        value={entity.receipt_threshold}
                                                        onChange={(e) => updateEntityLimit(entity.type, entity.id, 'receipt_threshold', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedEntities.length === 0 && (
                                        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-3 text-slate-300">
                                                <Search size={20} />
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-600">No targets added</h4>
                                            <p className="text-xs font-semibold text-slate-400 mt-1 max-w-xs text-center">Search and select a department or designation to set specific expense limits.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Info helper text */}
                                <p className="text-xs text-slate-400 font-medium mt-2 flex items-start gap-1.5 leading-relaxed">
                                    <span className="text-sky-400 mt-0.5 flex-shrink-0">ℹ</span>
                                    If an employee matches both a department rule and a designation rule for the same category, the designation limit will be applied automatically.
                                </p>
                            </div>
                        </div>

                        {/* Section 3: Status */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-base font-black text-slate-800">Status</label>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer scale-110 mr-2">
                                <input
                                    type="checkbox"
                                    name="status"
                                    defaultChecked={editingExpense ? editingExpense.status === 'Active' : true}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                            </label>
                        </div>

                    </div>
                </div>
            </form>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-slate-50/30">
            <div className="p-4 lg:p-8 w-full space-y-8 animate-in fade-in duration-300 pb-20 max-w-7xl mx-auto">

                {/* Modal for Add Category / Override */}
                {isAddingCategory && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    {editingCategory ? 'Edit Category' : 'Add New Category'}
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
                                        {isSaving ? 'Saving...' : 'Submit'}
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
                            <div className="relative">
                                <select
                                    value={selectedTarget}
                                    onChange={(e) => setSelectedTarget(e.target.value)}
                                    className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none"
                                >
                                    <optgroup label="Business Units">
                                        {BUSINESS_UNITS.map(bu => (
                                            <option key={bu} value={`bu:${bu}`}>{bu}</option>
                                        ))}
                                    </optgroup>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                            {/* <button
                                onClick={() => setIsShowCategoriesDialog(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <Receipt size={16} /> EXPENSE CATEGORIES
                            </button> */}
                            <button
                                onClick={() => {
                                    setEditingExpense(null);
                                    setSelectedEntities([]);
                                    setIsAddingExpense(true);
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl font-bold text-sm hover:bg-sky-700 transition-all shadow-lg shadow-sky-100"
                            >
                                ADD EXPENSE RULE
                            </button>
                        </div>
                    </div>

                </div>

                {/* ── Expense Configurations Section ── */}
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applicable To</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Created By</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Last Modified By</th>
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
                                            <div className="flex flex-wrap gap-2">
                                                {cat.applicable_to
                                                    .filter((ent: any) => ent.type === 'dept' || ent.type === 'desig')
                                                    .map((ent: any, i: number) => (
                                                    <div key={i} className="flex flex-col gap-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg shadow-sm min-w-[140px]">
                                                        <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1 mb-1">
                                                            <div className="text-slate-400">
                                                                {ent.type === 'dept' ? <Home size={10} /> : ent.type === 'desig' ? <ShieldCheck size={10} /> : <User size={10} />}
                                                            </div>
                                                            <span className="text-[10px] font-black text-slate-800 uppercase truncate max-w-[120px]">
                                                                {ent.name}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-0.5">
                                                            <div className="flex justify-between items-center bg-white/50 px-1.5 py-0.5 rounded border border-slate-100/50">
                                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">LIMIT</span>
                                                                <span className="text-[10px] font-black text-slate-700">₹{ent.max_limit?.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center bg-white/50 px-1.5 py-0.5 rounded border border-slate-100/50">
                                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">THRESH.</span>
                                                                <span className="text-[10px] font-black text-slate-700">₹{ent.receipt_threshold?.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                    {cat.created_by?.[0] || 'H'}
                                                </div>
                                                <p className="text-xs font-bold text-slate-600">{cat.created_by || 'HR Manager'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-sky-50 flex items-center justify-center text-[10px] font-bold text-sky-600">
                                                    {cat.last_updated_by?.[0] || 'H'}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-bold text-slate-600">{cat.last_updated_by || 'HR Manager'}</p>
                                                    <p className="text-[9px] font-medium text-slate-400 italic">
                                                        {new Date(cat.updated_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${cat.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {cat.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end items-center gap-3">
                                                <button
                                                    onClick={() => toggleCategoryStatus(cat.id)}
                                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${cat.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${cat.status === 'Active' ? 'translate-x-5' : 'translate-x-1'}`} />
                                                </button>
                                                <button onClick={() => {
                                                    setEditingExpense(cat);
                                                    setSelectedEntities((cat.applicable_to || []).filter((ent: any) => ent.type === 'dept' || ent.type === 'desig'));
                                                    setIsAddingExpense(true);
                                                }} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all">
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
                {/* Categories Management Dialog */}
                {isShowCategoriesDialog && (
                    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                        <Receipt size={24} className="text-sky-600" /> Expense Categories
                                    </h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Manage global expense types and statuses</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            setEditingCategory(null);
                                            setIsAddingCategory(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg font-bold text-xs hover:bg-sky-700 transition-all shadow-lg shadow-sky-100"
                                    >
                                        <Plus size={14} /> ADD CATEGORY
                                    </button>
                                    <button
                                        onClick={() => setIsShowCategoriesDialog(false)}
                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto p-6">
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Name</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {categories.map((cat) => (
                                                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-bold text-slate-700">{cat.name}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cat.status === 'Inactive' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                                                            {cat.status?.toUpperCase() || 'ACTIVE'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end items-center gap-3">
                                                            <button
                                                                onClick={() => toggleCategoryStatus(cat.id)}
                                                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${cat.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                                            >
                                                                <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${cat.status === 'Active' ? 'translate-x-5' : 'translate-x-1'}`} />
                                                            </button>
                                                            <button onClick={() => openEditModal(cat)} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all">
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {categories.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest italic">
                                                        No categories found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={() => setIsShowCategoriesDialog(false)}
                                    className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 font-bold text-xs transition-all"
                                >
                                    CLOSE
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseSettings;
