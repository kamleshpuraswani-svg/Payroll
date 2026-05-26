import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { X, Search, Home, ShieldCheck, User, Trash2, ChevronDown, Receipt, Plus, Edit2, ArrowLeft, Calendar, Repeat, Clock, Filter, Tag, Sigma, Power } from 'lucide-react';

const EXPENSE_FIELDS = [
    { name: 'Category', icon: Tag },
    { name: 'Created By', icon: User },
];

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
    const [expenseActiveTab, setExpenseActiveTab] = useState<'CONFIGURATION' | 'HISTORY'>('CONFIGURATION');
    const [selectedVersion, setSelectedVersion] = useState(0);

    // State for Expense Categories
    const [categories, setCategories] = useState<any[]>([]);
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [editingExpense, setEditingExpense] = useState<any>(null);
    const [configuredExpenses, setConfiguredExpenses] = useState<any[]>([]);
    const [allEmployees, setAllEmployees] = useState<any[]>([]);
    const [paygroups, setPaygroups] = useState<any[]>([]);
    const [selectedTarget, setSelectedTarget] = useState('bu:MindInventory');
    
    // Multi-select state for Add Expense modal
    const [applicableTarget, setApplicableTarget] = useState<'dept' | 'desig' | ''>('');
    const [newEntityValue, setNewEntityValue] = useState('');
    const [newMonthlyLimit, setNewMonthlyLimit] = useState('');
    const [newReceiptThreshold, setNewReceiptThreshold] = useState('');
    const [selectedEntities, setSelectedEntities] = useState<any[]>([]);
    const [availableDesignations, setAvailableDesignations] = useState<string[]>([]);
    const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
    // Filter states
    const [filterField, setFilterField] = useState<'category' | 'created_by' | 'status'>('category');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const expDropdownRef = useRef<HTMLDivElement>(null);

    // Hardcoded fallbacks
    const FALLBACK_DEPTS = ['Engineering', 'Product', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations', 'QA', 'Customer Success', 'Design', 'Legal', 'Administration'];
    const FALLBACK_DESIGS = ['Software Engineer', 'Senior Software Engineer', 'Tech Lead', 'Product Manager', 'Designer', 'Senior Designer', 'Accountant', 'Finance Manager', 'HR Associate', 'HR Manager', 'Sales Lead', 'Sales Executive', 'QA Analyst', 'Business Analyst', 'Operations Manager', 'Director'];

    useEffect(() => {
        fetchData();
    }, [selectedTarget]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (expDropdownRef.current && !expDropdownRef.current.contains(e.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filteredCategories = useMemo(() => {
        let data = categories.filter(c => c.applicable_to && c.applicable_to.length > 0);
        
        if (!searchQuery) return data;
        
        const query = searchQuery.toLowerCase();
        return data.filter(cat => {
            if (filterField === 'category') {
                return (cat.name || '').toLowerCase().includes(query);
            }
            if (filterField === 'created_by') {
                return (cat.created_by || 'HR Manager').toLowerCase().includes(query);
            }
            if (filterField === 'status') {
                const statusText = (cat.status || 'Active').toLowerCase();
                return statusText.includes(query);
            }
            return false;
        });
    }, [categories, searchQuery, filterField]);

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

    const removeEntityFromSelection = (type: string, id: string) => {
        setSelectedEntities(selectedEntities.filter(e => !(e.type === type && e.id === id)));
    };

    const updateEntityLimit = (type: string, id: string, field: 'max_limit' | 'receipt_threshold', value: number) => {
        setSelectedEntities(selectedEntities.map(e => 
            (e.type === type && e.id === id) ? { ...e, [field]: value } : e
        ));
    };

    const handleAddEntity = () => {
        if (!applicableTarget) {
            alert('Please select an Applicable Target.');
            return;
        }
        if (!newEntityValue) {
            alert(`Please select a ${applicableTarget === 'dept' ? 'Department' : 'Designation'}.`);
            return;
        }
        const limit = parseInt(newMonthlyLimit, 10);
        const threshold = parseInt(newReceiptThreshold, 10);
        if (!newMonthlyLimit || isNaN(limit) || limit <= 0) {
            alert('Please enter a valid Monthly Limit.');
            return;
        }
        if (newReceiptThreshold === '' || isNaN(threshold) || threshold < 0) {
            alert('Please enter a valid Receipt Threshold.');
            return;
        }
        if (threshold >= limit) {
            alert('Receipt Threshold must be less than Monthly Limit.');
            return;
        }
        if (selectedEntities.some((e: any) => e.type === applicableTarget && e.id === newEntityValue)) {
            alert(`This ${applicableTarget === 'dept' ? 'Department' : 'Designation'} has already been added.`);
            return;
        }
        setSelectedEntities([...selectedEntities, {
            type: applicableTarget,
            id: newEntityValue,
            name: newEntityValue,
            max_limit: limit,
            receipt_threshold: threshold
        }]);
        setNewEntityValue('');
        setNewMonthlyLimit('');
        setNewReceiptThreshold('');
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
                                if (expenseActiveTab === 'HISTORY') {
                                    setExpenseActiveTab('CONFIGURATION');
                                    return;
                                }
                                setIsAddingExpense(false);
                                setEditingExpense(null);
                                setSelectedEntities([]);
                                setApplicableTarget('');
                                setNewEntityValue('');
                                setNewMonthlyLimit('');
                                setNewReceiptThreshold('');
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
                                if (expenseActiveTab === 'HISTORY') {
                                    setExpenseActiveTab('CONFIGURATION');
                                    return;
                                }
                                setIsAddingExpense(false);
                                setEditingExpense(null);
                                setSelectedEntities([]);
                                setApplicableTarget('');
                                setNewEntityValue('');
                                setNewMonthlyLimit('');
                                setNewReceiptThreshold('');
                            }}
                            className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold text-sm transition-all shadow-sm"
                        >
                            {expenseActiveTab === 'HISTORY' ? 'Back' : 'Cancel'}
                        </button>
                        {expenseActiveTab === 'CONFIGURATION' && (
                            <>
                                {editingExpense && (
                                    <button
                                        type="button"
                                        onClick={() => setExpenseActiveTab('HISTORY')}
                                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold text-sm transition-all shadow-sm flex items-center gap-2"
                                    >
                                        <Clock size={16} /> Audit History
                                    </button>
                                )}
                                 <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm transition-all shadow-md active:scale-95 disabled:hover:scale-100 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSaving ? 'Saving...' : 'Submit'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 animate-in fade-in duration-300">
                    <div className="max-w-4xl mx-auto">
                        {expenseActiveTab === 'HISTORY' ? (
                            <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Left Column: Configuration Details */}
                                <div className="flex-1 space-y-6">
                                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                                                Configuration Details 
                                                {selectedVersion === 0 && (
                                                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md uppercase tracking-wider">Current Version</span>
                                                )}
                                            </h3>
                                        </div>
                                        
                                        <div className="p-8 space-y-8">
                                            {/* Basic Info Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expense Category</label>
                                                    <div className="px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                                                        <p className="text-sm font-bold text-slate-700">{editingExpense?.name || "Travel & Conveyance"}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Unit</label>
                                                    <div className="px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                                                        <p className="text-sm font-bold text-slate-700">{selectedTarget.split(':')[1]}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Effective Date</label>
                                                    <div className="px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between">
                                                        <p className="text-sm font-bold text-slate-700">01 Apr 2026</p>
                                                        {selectedVersion === 0 && (
                                                            <span className="text-[9px] font-black bg-sky-100 text-sky-700 px-2 py-0.5 rounded uppercase">Changed</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                                                    <div className="px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                                                        <p className="text-sm font-bold text-slate-700">Active</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Targets Section */}
                                            <div className="space-y-4 pt-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Limits</label>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {(selectedVersion === 0 ? [
                                                        { name: 'Engineering', type: 'Department', limit: 7500, threshold: 1000, changed: true },
                                                        { name: 'Senior Software Engineer', type: 'Designation', limit: 10000, threshold: 2000 }
                                                    ] : [
                                                        { name: 'Engineering', type: 'Department', limit: 5000, threshold: 1000 },
                                                        { name: 'Senior Software Engineer', type: 'Designation', limit: 10000, threshold: 2000 }
                                                    ]).map((target, i) => (
                                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50/30 border border-slate-100 rounded-2xl group hover:bg-white hover:shadow-md hover:border-sky-200 transition-all duration-300">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${target.type === 'Department' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                    {target.type === 'Department' ? <Home size={18} /> : <ShieldCheck size={18} />}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-800">{target.name}</p>
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{target.type}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-8 text-right">
                                                                <div className="space-y-0.5">
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase">Limit</p>
                                                                    <p className="text-sm font-black text-slate-700 flex items-center gap-2">
                                                                        ₹{target.limit.toLocaleString()}
                                                                        {target.changed && (
                                                                            <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase">Threshold</p>
                                                                    <p className="text-sm font-black text-slate-700">₹{target.threshold.toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Version History */}
                                <div className="w-full lg:w-80 space-y-4">
                                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Version History</h3>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1">View previous versions of rules.</p>
                                        </div>
                                        <div className="p-3 space-y-2">
                                            {[
                                                { date: '19 Mar 2026', time: '03:20 PM', user: 'HR Manager', current: true },
                                                { date: '15 Mar 2026', time: '11:45 AM', user: 'Admin User' },
                                                { date: '01 Mar 2026', time: '09:30 AM', user: 'System Auto' },
                                                { date: '15 Feb 2026', time: '02:15 PM', user: 'HR Associate' }
                                            ].map((v, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setSelectedVersion(i)}
                                                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border ${
                                                        selectedVersion === i 
                                                        ? 'bg-white border-sky-200 shadow-lg shadow-sky-50 ring-1 ring-sky-100' 
                                                        : 'bg-transparent border-transparent hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className={`text-sm font-black ${selectedVersion === i ? 'text-slate-800' : 'text-slate-600'}`}>{v.date}</p>
                                                            <p className="text-[10px] font-bold text-slate-400">{v.time}</p>
                                                        </div>
                                                        {v.current && (
                                                            <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase tracking-wider">Current</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                            selectedVersion === i ? 'bg-sky-50 text-sky-600' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                            {v.user[0]}
                                                        </div>
                                                        <p className={`text-xs font-bold ${selectedVersion === i ? 'text-slate-700' : 'text-slate-500'}`}>{v.user}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Section 1: Basic Details */}
                                <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                        <span className="bg-sky-100 text-sky-700 w-6 h-6 rounded-md flex items-center justify-center text-xs">1</span> 
                                        Expense Category & Settings
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                        <div className="space-y-1.5">
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
                                        
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Effective From <span className="text-rose-500">*</span></label>
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
                                        {/* Unified card: Applicable Target + conditional fields */}
                                        <div className="p-5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4">
                                            {/* Applicable Target Dropdown — 50% width */}
                                            <div className="space-y-1.5 w-1/2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applicable Target <span className="text-rose-500">*</span></label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                        <ChevronDown size={16} className="text-slate-400" />
                                                    </div>
                                                    <select
                                                        value={applicableTarget}
                                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                            setApplicableTarget(e.target.value as 'dept' | 'desig' | '');
                                                            setNewEntityValue('');
                                                            setNewMonthlyLimit('');
                                                            setNewReceiptThreshold('');
                                                        }}
                                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="">Select target type...</option>
                                                        <option value="dept">Department</option>
                                                        <option value="desig">Designation</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Conditional row: Dept/Desig + Monthly Limit + Receipt Threshold */}
                                            {applicableTarget !== '' && (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {/* Department / Designation dropdown */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                            {applicableTarget === 'dept' ? 'Department' : 'Designation'} <span className="text-rose-500">*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                                <ChevronDown size={14} className="text-slate-400" />
                                                            </div>
                                                            <select
                                                                value={newEntityValue}
                                                                onChange={(e) => setNewEntityValue(e.target.value)}
                                                                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer"
                                                            >
                                                                <option value="">Select {applicableTarget === 'dept' ? 'department' : 'designation'}...</option>
                                                                {(applicableTarget === 'dept' ? availableDepartments : availableDesignations).map((item: string) => (
                                                                    <option key={item} value={item}>{item}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Monthly Limit */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                            Monthly Limit (₹) <span className="text-rose-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={newMonthlyLimit}
                                                            onChange={(e) => setNewMonthlyLimit(e.target.value)}
                                                            min="1"
                                                            step="1"
                                                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === '.' || e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                                            placeholder="e.g. 5000"
                                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                                                        />
                                                    </div>

                                                    {/* Receipt Threshold */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                            Receipt Threshold (₹) <span className="text-rose-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={newReceiptThreshold}
                                                            onChange={(e) => setNewReceiptThreshold(e.target.value)}
                                                            min="0"
                                                            step="1"
                                                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === '.' || e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                                            placeholder="e.g. 1000"
                                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Add button — outside the card, right-aligned, blue border */}
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handleAddEntity}
                                                className="flex items-center gap-2 px-5 py-2 bg-white border-2 border-blue-500 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-50 transition-all shadow-sm"
                                            >
                                                <Plus size={15} /> Add
                                            </button>
                                        </div>

                                        {/* Selected Entities — rendered as cards matching the input layout */}
                                        <div className="space-y-4">
                                            {selectedEntities.map((entity, index) => (
                                                <div key={`${entity.type}-${entity.id}`} className="p-5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4 group">
                                                    {/* Row 1: Applicable Target (read-only) + delete */}
                                                    <div className="flex items-end justify-between">
                                                        <div className="space-y-1.5 w-1/2">
                                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applicable Target <span className="text-rose-500">*</span></label>
                                                            <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800">
                                                                {entity.type === 'dept' ? 'Department' : 'Designation'}
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeEntityFromSelection(entity.type, entity.id)}
                                                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all mb-0.5"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    {/* Row 2: Entity name + Monthly Limit + Receipt Threshold */}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                                {entity.type === 'dept' ? 'Department' : 'Designation'} <span className="text-rose-500">*</span>
                                                            </label>
                                                            <div className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800">
                                                                {entity.name}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly Limit (₹) <span className="text-rose-500">*</span></label>
                                                            <input
                                                                type="number"
                                                                value={entity.max_limit}
                                                                onChange={(e) => updateEntityLimit(entity.type, entity.id, 'max_limit', parseFloat(e.target.value) || 0)}
                                                                min="1"
                                                                step="1"
                                                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === '.' || e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Receipt Threshold (₹) <span className="text-rose-500">*</span></label>
                                                            <input
                                                                type="number"
                                                                value={entity.receipt_threshold}
                                                                onChange={(e) => updateEntityLimit(entity.type, entity.id, 'receipt_threshold', parseFloat(e.target.value) || 0)}
                                                                min="0"
                                                                step="1"
                                                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === '.' || e.key === '-' || e.key === 'e') e.preventDefault(); }}
                                                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Info helper text */}
                                    <p className="text-xs text-slate-400 font-medium mt-2 flex items-start gap-1.5 leading-relaxed">
                                        <span className="text-sky-400 mt-0.5 flex-shrink-0">ℹ</span>
                                        If an employee matches both a department rule and a designation rule for the same category, the designation limit will be applied automatically.
                                    </p>
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
                        )}
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
                            <button
                                onClick={() => {
                                    setEditingExpense(null);
                                    setSelectedEntities([]);
                                    setIsAddingExpense(true);
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                            >
                                ADD EXPENSE RULE
                            </button>
                        </div>
                    </div>

                </div>

                {/* ── Lookup Filter Toolbar ── */}
                <div className="flex items-center gap-2 w-full sm:w-auto mb-6">
                    <div className="relative" ref={expDropdownRef}>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-purple-600 transition-colors shadow-sm"
                        >
                            <Sigma size={18} className="text-purple-600" />
                            <ChevronDown size={14} className="text-slate-400" />
                        </button>
                        {isFilterOpen && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1">
                                    Select Filter Field
                                </div>
                                <button
                                    onClick={() => { setFilterField('category'); setIsFilterOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${filterField === 'category' ? 'bg-purple-50 text-purple-700' : 'text-slate-700 hover:bg-slate-50'}`}
                                >
                                    <Tag size={16} className={filterField === 'category' ? 'text-purple-500' : 'text-slate-400'} /> Category
                                </button>
                                <button
                                    onClick={() => { setFilterField('created_by'); setIsFilterOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${filterField === 'created_by' ? 'bg-purple-50 text-purple-700' : 'text-slate-700 hover:bg-slate-50'}`}
                                >
                                    <User size={16} className={filterField === 'created_by' ? 'text-purple-500' : 'text-slate-400'} /> Created By
                                </button>
                                <button
                                    onClick={() => { setFilterField('status'); setIsFilterOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${filterField === 'status' ? 'bg-purple-50 text-purple-700' : 'text-slate-700 hover:bg-slate-50'}`}
                                >
                                    <Power size={16} className={filterField === 'status' ? 'text-purple-500' : 'text-slate-400'} /> Status
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 sm:w-80 relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Filter by ${filterField === 'category' ? 'Category' : filterField === 'created_by' ? 'Created By' : 'Status'}...`}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400 shadow-sm"
                        />
                    </div>

                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                        Filter
                    </button>
                </div>

                {/* ── Expense Configurations Section ── */}
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applicable To</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Limits</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Created By</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Last Modified By</th>
                                     <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-50">
                                 {filteredCategories.map((cat) => (
                                     <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                                         <td className="px-6 py-5">
                                             <p className="text-sm font-black text-slate-800">{cat.name}</p>
                                         </td>
                                         <td className="px-6 py-5">
                                             <div className="flex flex-col gap-2">
                                                 {cat.applicable_to
                                                     .filter((ent: any) => ent.type === 'dept' || ent.type === 'desig')
                                                     .map((ent: any, i: number) => (
                                                     <div key={i} className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg min-h-[44px]">
                                                         <div className="text-slate-400 flex-shrink-0">
                                                             {ent.type === 'dept' ? <Home size={10} /> : ent.type === 'desig' ? <ShieldCheck size={10} /> : <User size={10} />}
                                                         </div>
                                                         <span className="text-[10px] font-black text-slate-800 uppercase truncate max-w-[140px]">
                                                             {ent.name}
                                                         </span>
                                                     </div>
                                                 ))}
                                             </div>
                                         </td>
                                         <td className="px-6 py-5">
                                             <div className="flex flex-col gap-2">
                                                 {cat.applicable_to
                                                     .filter((ent: any) => ent.type === 'dept' || ent.type === 'desig')
                                                     .map((ent: any, i: number) => (
                                                     <div key={i} className="flex flex-col gap-0.5 px-3 py-2 min-h-[44px] justify-center">
                                                         <div className="flex items-center gap-1.5">
                                                             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter w-12">LIMIT</span>
                                                             <span className="text-[10px] font-black text-slate-700">₹{ent.max_limit?.toLocaleString()}</span>
                                                         </div>
                                                         <div className="flex items-center gap-1.5">
                                                             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter w-12">THRESH.</span>
                                                             <span className="text-[10px] font-black text-slate-700">₹{ent.receipt_threshold?.toLocaleString()}</span>
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
                                                <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCategories.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest italic">
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
