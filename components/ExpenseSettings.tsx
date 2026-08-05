import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { X, Search, Home, ShieldCheck, User, Trash2, ChevronDown, GripVertical, Receipt, Plus, Edit2, ArrowLeft, Calendar, Repeat, Clock, Filter, Tag, Sigma, Power, Info } from 'lucide-react';

const EXPENSE_FIELDS = [
    { name: 'Category', icon: Tag },
    { name: 'Created By', icon: User },
];

const BUSINESS_UNITS = [
    "MindInventory",
    "300 Minds",
    "CollabCRM"
];

const FALLBACK_EMPLOYEES = [
    "Amit Verma",
    "Rajesh Kumar",
    "Sunita Gupta",
    "Kavita Sharma",
    "Vikram Singh",
    "Anjali Mehta",
    "Priya Sharma",
    "Arjun Mehta"
];

const loadAddedRules = (applicableTo: any[]) => {
    if (!applicableTo || applicableTo.length === 0) {
        return [];
    }
    const groups: Record<string, { frequency: string; resetCycleBasis: string; applicableTarget: string; values: string[]; expenseLimit: string; receiptThreshold: string }> = {};
    applicableTo.forEach(item => {
        if (!item.type) return;
        const freq = item.frequency || 'Monthly';
        const reset = item.reset_cycle || 'Calendar Year (Jan-Dec)';
        const targetType = item.type;
        const limitVal = item.max_limit !== undefined ? String(item.max_limit) : '';
        const thresholdVal = item.receipt_threshold !== undefined ? String(item.receipt_threshold) : '';
        const key = `${freq}_${reset}_${targetType}_${limitVal}_${thresholdVal}`;
        if (!groups[key]) {
            groups[key] = {
                frequency: freq,
                resetCycleBasis: reset,
                applicableTarget: targetType,
                values: [],
                expenseLimit: limitVal,
                receiptThreshold: thresholdVal
            };
        }
        const valId = item.id || item.name;
        if (!groups[key].values.includes(valId)) {
            groups[key].values.push(valId);
        }
    });
    return Object.keys(groups).map((key, index) => ({
        id: `rule-${index}-${Date.now()}`,
        frequency: groups[key].frequency,
        resetCycleBasis: groups[key].resetCycleBasis,
        applicableTarget: groups[key].applicableTarget,
        selectedTargetValues: groups[key].values,
        expenseLimit: groups[key].expenseLimit,
        receiptThreshold: groups[key].receiptThreshold
    }));
};


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
    
    interface AddedRule {
        id: string;
        frequency: string;
        resetCycleBasis: string;
        applicableTarget: string;
        selectedTargetValues: string[];
        expenseLimit: string;
        receiptThreshold: string;
        groupId?: string;
    }

    const [addedRules, setAddedRules] = useState<AddedRule[]>([]);
    const [draggedRuleGroupKey, setDraggedRuleGroupKey] = useState<string | null>(null);
    const [ruleFrequency, setRuleFrequency] = useState<'Monthly' | 'Yearly' | 'Once per tenure'>('Monthly');
    const [expenseStatusActive, setExpenseStatusActive] = useState(true);
    const [limitsPreviewCategory, setLimitsPreviewCategory] = useState<any>(null);
    const [ruleResetCycleBasis, setRuleResetCycleBasis] = useState('Calendar Year (Jan-Dec)');
    interface InputTargetRow {
        id: string;
        applicableTarget: string;
        selectedTargetValues: string[];
        isTargetDropdownOpen: boolean;
    }

    const [inputTargetRows, setInputTargetRows] = useState<InputTargetRow[]>([
        { id: 'row-0', applicableTarget: 'Business Unit', selectedTargetValues: [], isTargetDropdownOpen: false }
    ]);
    const [sharedExpenseLimit, setSharedExpenseLimit] = useState('');
    const [sharedReceiptThreshold, setSharedReceiptThreshold] = useState('');

    const addInputTargetRow = (currentRowId: string) => {
        const ALL_TARGET_OPTIONS = ["Business Unit", "Department", "Designation", "Employee Status", "Employee"];
        const usedInInputs = inputTargetRows.map(r => r.applicableTarget);
        const nextAvailable = ALL_TARGET_OPTIONS.find(opt => !usedInInputs.includes(opt));
        if (nextAvailable) {
            setInputTargetRows(prev => {
                const currentIndex = prev.findIndex(r => r.id === currentRowId);
                const nextRows = [...prev];
                nextRows.splice(currentIndex + 1, 0, {
                    id: `row-${Date.now()}`,
                    applicableTarget: nextAvailable,
                    selectedTargetValues: [],
                    isTargetDropdownOpen: false
                });
                return nextRows;
            });
        }
    };

    const handleAddRulesList = () => {
        const validRows = inputTargetRows.filter(row => row.applicableTarget && row.selectedTargetValues.length > 0);
        if (validRows.length === 0) {
            alert('Please select at least one target and items before adding.');
            return;
        }

        const groupId = 'group-' + Date.now();
        const newRules = validRows.map((row, idx) => ({
            id: `rule-${Date.now()}-${idx}-${Math.random()}`,
            groupId: groupId,
            frequency: ruleFrequency,
            resetCycleBasis: ruleResetCycleBasis,
            applicableTarget: row.applicableTarget,
            selectedTargetValues: [...row.selectedTargetValues],
            expenseLimit: sharedExpenseLimit || '0',
            receiptThreshold: sharedReceiptThreshold || '0'
        }));

        const updatedRules = [...addedRules, ...newRules];
        setAddedRules(updatedRules);

        // Reset to a single row - all target types are available again since Add created a separate group
        const ALL_TARGET_OPTIONS = ["Business Unit", "Department", "Designation", "Employee Status", "Employee"];
        const nextAvailable = ALL_TARGET_OPTIONS[0];

        setInputTargetRows([{
            id: `row-0-${Date.now()}`,
            applicableTarget: nextAvailable,
            selectedTargetValues: [],
            isTargetDropdownOpen: false
        }]);
        setSharedExpenseLimit('');
        setSharedReceiptThreshold('');
    };

    const handleDropRuleGroup = (targetKey: string) => {
        if (!draggedRuleGroupKey || draggedRuleGroupKey === targetKey) {
            setDraggedRuleGroupKey(null);
            return;
        }
        setAddedRules(prev => {
            const next = [...prev];
            const draggedRules = next.filter(r => (r.groupId || r.id) === draggedRuleGroupKey);
            const remainingRules = next.filter(r => (r.groupId || r.id) !== draggedRuleGroupKey);
            
            const targetIndexInRemaining = remainingRules.findIndex(r => (r.groupId || r.id) === targetKey);
            if (targetIndexInRemaining === -1) return prev;
            
            remainingRules.splice(targetIndexInRemaining, 0, ...draggedRules);
            return remainingRules;
        });
        setDraggedRuleGroupKey(null);
    };

    const handleEditRuleGroup = (rules: AddedRule[]) => {
        if (rules.length === 0) return;
        const first = rules[0];
        setRuleFrequency(first.frequency as 'Monthly' | 'Yearly' | 'Once per tenure');
        setRuleResetCycleBasis(first.resetCycleBasis);
        
        setInputTargetRows(rules.map((r, idx) => ({
            id: `row-edit-${Date.now()}-${idx}`,
            applicableTarget: r.applicableTarget,
            selectedTargetValues: [...r.selectedTargetValues],
            isTargetDropdownOpen: false
        })));
        
        setSharedExpenseLimit(first.expenseLimit);
        setSharedReceiptThreshold(first.receiptThreshold);
        
        const groupIds = rules.map(r => r.id);
        setAddedRules(prev => prev.filter(r => !groupIds.includes(r.id)));
    };

    const [newEntityValue, setNewEntityValue] = useState('');
    const [newMonthlyLimit, setNewMonthlyLimit] = useState('');
    const [newReceiptThreshold, setNewReceiptThreshold] = useState('');
    const [defaultExpenseLimit, setDefaultExpenseLimit] = useState('0');
    const [defaultReceiptThreshold, setDefaultReceiptThreshold] = useState('0');
    const [showCriteriaOverrides, setShowCriteriaOverrides] = useState(false);
    const [applicabilityScope, setApplicabilityScope] = useState<'all' | 'specific'>('all');
    const [selectedEntities, setSelectedEntities] = useState<any[]>([]);
    const [availableDesignations, setAvailableDesignations] = useState<string[]>([]);
    const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
    // Filter states
    const [filterField, setFilterField] = useState<'category' | 'created_by' | 'status'>('category');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const expDropdownRef = useRef<HTMLDivElement>(null);

    const getTargetOptions = (targetType: string) => {
        switch (targetType) {
            case 'Business Unit':
                return BUSINESS_UNITS;
            case 'Department':
                return availableDepartments.length > 0 ? availableDepartments : FALLBACK_DEPTS;
            case 'Designation':
                return availableDesignations.length > 0 ? availableDesignations : FALLBACK_DESIGS;
            case 'Employee Status':
                return ['Active', 'On Probation', 'Notice Period', 'Suspended'];
            case 'Employee':
                return allEmployees.length > 0 ? allEmployees.map(e => e.name) : FALLBACK_EMPLOYEES;
            default:
                return [];
        }
    };

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
            const path = e.composedPath ? e.composedPath() : [];
            const isClickInsideDropdown = path.some((el: any) => el.classList && el.classList.contains('target-dropdown-container'));
            if (!isClickInsideDropdown) {
                setInputTargetRows(prev => prev.map(row => ({ ...row, isTargetDropdownOpen: false })));
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filteredCategories = useMemo(() => {
        let data = categories;
        
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
        const [type, id] = selectedTarget.split(':');
        const defaultDummyCategories = [
            { id: 'cat-1', name: 'Travel & Conveyance', max_limit: 5000, receipt_threshold: 1000, pro_rata: true, status: 'Active', description: 'Includes flight, train, and local taxi fares.', target_type: type, target_id: id },
            { id: 'cat-2', name: 'Meals & Entertainment', max_limit: 2000, receipt_threshold: 500, pro_rata: false, status: 'Active', description: 'Business lunches and team dinners.', target_type: type, target_id: id },
            { id: 'cat-3', name: 'Communication', max_limit: 1500, receipt_threshold: 0, pro_rata: false, status: 'Active', description: 'Mobile and internet bill reimbursements.', target_type: type, target_id: id },
            { id: 'cat-4', name: 'Office Supplies', max_limit: 5000, receipt_threshold: 500, pro_rata: true, status: 'Active', description: 'Stationery and minor equipment.', target_type: type, target_id: id }
        ];

        try {
            // Fetch categories
            const { data: catData, error: catError } = await supabase
                .from('expense_categories')
                .select('*')
                .eq('target_type', type)
                .eq('target_id', id)
                .order('name');

            if (catError || !catData || catData.length === 0) {
                setCategories(defaultDummyCategories);
            } else {
                setCategories(catData);
            }

            // Fetch all employees with designations for configurations
            const { data: empData, error: empError } = await supabase
                .from('employees')
                .select('*')
                .eq('status', 'Active');
            
            if (empError || !empData) {
                setAvailableDepartments(FALLBACK_DEPTS);
                setAvailableDesignations(FALLBACK_DESIGS);
            } else {
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
            }

            // Fetch paygroups
            const { data: pgData } = await supabase
                .from('paygroups')
                .select('*')
                .order('name');
            
            if (pgData) {
                setPaygroups(pgData);
            }
        } catch (error: any) {
            console.error('Error fetching data:', error);
            setCategories(defaultDummyCategories);
            setAvailableDepartments(FALLBACK_DEPTS);
            setAvailableDesignations(FALLBACK_DESIGS);
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

        const applicableTo = addedRules.flatMap(rule => 
            rule.selectedTargetValues.map(val => ({
                type: rule.applicableTarget,
                id: val,
                name: val,
                frequency: rule.frequency,
                reset_cycle: rule.resetCycleBasis,
                max_limit: parseFloat(rule.expenseLimit) || 0,
                receipt_threshold: parseFloat(rule.receiptThreshold) || 0
            }))
        );

        if (applicableTo.length === 0) {
            alert('Please add at least one applicability rule before saving.');
            return;
        }

        setIsSaving(true);
        try {
            const [targetType, targetId] = selectedTarget.split(':');
            const configData: any = {
                status: status,
                applicable_to: applicableTo,
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
        const applicableTarget = '';
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
                                setRuleFrequency('Monthly');
                                setRuleResetCycleBasis('Calendar Year (Jan-Dec)');
                                setInputTargetRows([{ id: 'row-0', applicableTarget: 'Business Unit', selectedTargetValues: [], isTargetDropdownOpen: false }]);
                                setAddedRules([]);
                                setNewEntityValue('');
                                setNewMonthlyLimit('');
                                setNewReceiptThreshold('');
                                setDefaultExpenseLimit('0');
                                setDefaultReceiptThreshold('0');
                                setShowCriteriaOverrides(false);
                                setApplicabilityScope('all');
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
                                setRuleFrequency('Monthly');
                                setRuleResetCycleBasis('Calendar Year (Jan-Dec)');
                                setInputTargetRows([{ id: 'row-0', applicableTarget: 'Business Unit', selectedTargetValues: [], isTargetDropdownOpen: false }]);
                                setAddedRules([]);
                                setNewEntityValue('');
                                setNewMonthlyLimit('');
                                setNewReceiptThreshold('');
                                setDefaultExpenseLimit('0');
                                setDefaultReceiptThreshold('0');
                                setShowCriteriaOverrides(false);
                                setApplicabilityScope('all');
                            }}
                            className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 font-bold text-sm transition-all shadow-sm"
                        >
                            {expenseActiveTab === 'HISTORY' ? 'Back' : 'Cancel'}
                        </button>
                        {expenseActiveTab === 'CONFIGURATION' && (
                            <>
                                {editingExpense && (
                                    <button
                                        type="button"
                                        onClick={() => setExpenseActiveTab('HISTORY')}
                                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 font-bold text-sm transition-all shadow-sm flex items-center gap-2"
                                    >
                                        <Clock size={16} /> Audit History
                                    </button>
                                )}
                                 <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2 text-white rounded-md hover:opacity-90 font-bold text-sm transition-all shadow-md active:scale-95 disabled:hover:scale-100 disabled:opacity-50 flex items-center gap-2"
                                    style={{ backgroundColor: '#444CE7' }}
                                >
                                    {isSaving ? 'Saving...' : 'Submit'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 animate-in fade-in duration-300">
                    <div className="w-full">
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
                                <div className="flex flex-col lg:flex-row gap-4 lg:gap-10">
                                    <div className="lg:w-64 flex-shrink-0 space-y-1">
                                        <h3 className="text-sm font-bold text-slate-800">Expense Category & Settings</h3>
                                        <p className="text-xs text-slate-500 leading-relaxed">Define the category name and the month this rule becomes effective.</p>
                                    </div>
                                    <div className="flex-1 bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
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
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    </div>
                                </div>

                                {/* Section: Applicability & Limits */}
                                <div className="flex flex-col lg:flex-row gap-4 lg:gap-10">
                                    <div className="lg:w-64 flex-shrink-0 space-y-1">
                                        <h3 className="text-sm font-bold text-slate-800">Applicability & Limits</h3>
                                        <p className="text-xs text-slate-500 leading-relaxed">Applies company-wide unless a specific override is added.</p>
                                    </div>
                                    <div className="flex-1 bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm relative">
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Frequency <span className="text-rose-500">*</span></label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                            <ChevronDown size={16} className="text-slate-400" />
                                                        </div>
                                                        <select
                                                            name="frequency"
                                                            value={ruleFrequency}
                                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                                const value = e.target.value as 'Monthly' | 'Yearly' | 'Once per tenure';
                                                                setRuleFrequency(value);
                                                                if (value !== 'Yearly') setRuleResetCycleBasis('Calendar Year (Jan-Dec)');
                                                            }}
                                                            required
                                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer"
                                                        >
                                                            <option value="Monthly">Monthly</option>
                                                            <option value="Yearly">Yearly</option>
                                                            <option value="Once per tenure">Once per tenure</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {ruleFrequency === 'Yearly' && (
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reset Cycle Based On: <span className="text-rose-500">*</span></label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                                <ChevronDown size={16} className="text-slate-400" />
                                                            </div>
                                                            <select
                                                                name="reset_cycle_based_on"
                                                                value={ruleResetCycleBasis}
                                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRuleResetCycleBasis(e.target.value)}
                                                                required
                                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer"
                                                            >
                                                                <option value="Calendar Year (Jan-Dec)">Calendar Year (Jan-Dec)</option>
                                                                <option value="Financial Year">Financial Year</option>
                                                                <option value="Employee's Joining Date">Employee's Joining Date</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/30 space-y-5">
                                            {inputTargetRows.map((row) => (
                                                <div key={row.id} className="p-5 border border-slate-100 rounded-xl bg-white space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Applicable Target <span className="text-rose-500">*</span></label>
                                                            <div className="relative">
                                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                                    <ChevronDown size={16} className="text-slate-400" />
                                                                </div>
                                                                <select
                                                                    name={`applicable_target_${row.id}`}
                                                                    value={row.applicableTarget}
                                                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                                        const val = e.target.value;
                                                                        setInputTargetRows(prev => prev.map(r => r.id === row.id ? { ...r, applicableTarget: val, selectedTargetValues: [], isTargetDropdownOpen: false } : r));
                                                                    }}
                                                                    disabled={(() => {
                                                                        const ALL_TARGET_OPTIONS = ["Business Unit", "Department", "Designation", "Employee Status", "Employee"];
                                                                        const usedInOtherInputRows = inputTargetRows.filter(r => r.id !== row.id).map(r => r.applicableTarget);
                                                                        const availableTargetOptions = ALL_TARGET_OPTIONS.filter(opt =>
                                                                            opt === row.applicableTarget ||
                                                                            !usedInOtherInputRows.includes(opt)
                                                                        );
                                                                        return availableTargetOptions.length === 0;
                                                                    })()}
                                                                    required
                                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                                                >
                                                                    {(() => {
                                                                        const ALL_TARGET_OPTIONS = ["Business Unit", "Department", "Designation", "Employee Status", "Employee"];
                                                                        const usedInOtherInputRows = inputTargetRows.filter(r => r.id !== row.id).map(r => r.applicableTarget);
                                                                        const availableTargetOptions = ALL_TARGET_OPTIONS.filter(opt =>
                                                                            opt === row.applicableTarget ||
                                                                            !usedInOtherInputRows.includes(opt)
                                                                        );
                                                                        if (availableTargetOptions.length === 0) {
                                                                            return <option value="">All targets configured</option>;
                                                                        }
                                                                        return availableTargetOptions.map(opt => (
                                                                            <option key={opt} value={opt}>{opt}</option>
                                                                        ));
                                                                    })()}
                                                                </select>
                                                            </div>
                                                        </div>

                                                        {row.applicableTarget && (
                                                            <div className="space-y-1.5 relative">
                                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select {row.applicableTarget}(s) <span className="text-rose-500">*</span></label>
                                                                <div className="flex items-start gap-3 w-full">
                                                                    <div className="flex-1 relative target-dropdown-container">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setInputTargetRows(prev => prev.map(r => 
                                                                                    r.id === row.id 
                                                                                        ? { ...r, isTargetDropdownOpen: !r.isTargetDropdownOpen }
                                                                                        : { ...r, isTargetDropdownOpen: false }
                                                                                ));
                                                                            }}
                                                                            className={`w-full pl-3 pr-10 py-2 bg-slate-50 border rounded-md text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-left flex items-center justify-between cursor-pointer min-h-12 ${row.isTargetDropdownOpen ? 'border-indigo-400 ring-2 ring-indigo-500/10' : 'border-slate-200'}`}
                                                                        >
                                                                            <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0 pr-2">
                                                                                {row.selectedTargetValues.length === 0 ? (
                                                                                    <span className="text-slate-400 font-medium">Select {row.applicableTarget.toLowerCase()}(s)...</span>
                                                                                ) : (
                                                                                    <>
                                                                                        {row.selectedTargetValues.slice(0, 2).map(val => (
                                                                                            <span 
                                                                                                key={val} 
                                                                                                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-200/80 text-slate-700 rounded-full text-xs font-semibold select-none"
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setInputTargetRows(prev => prev.map(r => 
                                                                                                        r.id === row.id 
                                                                                                            ? { ...r, selectedTargetValues: r.selectedTargetValues.filter(v => v !== val) }
                                                                                                            : r
                                                                                                    ));
                                                                                                }}
                                                                                            >
                                                                                                <span className="truncate max-w-[120px]">{val}</span>
                                                                                                <span className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold text-sm ml-0.5">×</span>
                                                                                            </span>
                                                                                        ))}
                                                                                        {row.selectedTargetValues.length > 2 && (
                                                                                            <span className="text-slate-600 font-bold text-xs select-none">...</span>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${row.isTargetDropdownOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                                                                        </button>
                                                                        
                                                                        {row.isTargetDropdownOpen && (
                                                                            <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-md shadow-lg z-50 py-1">
                                                                                {getTargetOptions(row.applicableTarget).map(option => {
                                                                                    const isSelected = row.selectedTargetValues.includes(option);
                                                                                    return (
                                                                                        <div
                                                                                            key={option}
                                                                                            onClick={() => {
                                                                                                setInputTargetRows(prev => prev.map(r => {
                                                                                                    if (r.id === row.id) {
                                                                                                        const nextVals = r.selectedTargetValues.includes(option)
                                                                                                            ? r.selectedTargetValues.filter(item => item !== option)
                                                                                                            : [...r.selectedTargetValues, option];
                                                                                                        return { ...r, selectedTargetValues: nextVals };
                                                                                                    }
                                                                                                    return r;
                                                                                                }));
                                                                                            }}
                                                                                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors cursor-pointer hover:bg-slate-50 ${isSelected ? 'bg-indigo-50/50 text-indigo-900 font-semibold' : 'text-slate-700'}`}
                                                                                        >
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={isSelected}
                                                                                                readOnly
                                                                                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                                                                                            />
                                                                                            <span>{option}</span>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex items-center gap-2 h-12 flex-shrink-0">
                                                                        {(inputTargetRows.length + addedRules.length < 5) && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => addInputTargetRow(row.id)}
                                                                                className="p-3 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-600 rounded-md transition-all flex items-center justify-center h-12 w-12 flex-shrink-0 active:scale-95 shadow-sm"
                                                                                title="Add target row"
                                                                            >
                                                                                <Plus size={20} />
                                                                            </button>
                                                                        )}
                                                                        
                                                                        {inputTargetRows.length > 1 && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setInputTargetRows(prev => prev.filter(r => r.id !== row.id))}
                                                                                className="p-3 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 rounded-md transition-all flex items-center justify-center h-12 w-12 flex-shrink-0 active:scale-95 shadow-sm"
                                                                                title="Delete target row"
                                                                            >
                                                                                <Trash2 size={18} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                </div>
                                            ))}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                                <div className="space-y-1.5">
                                                     <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{ruleFrequency === 'Monthly' ? 'Expense Limit (Monthly)' : ruleFrequency === 'Yearly' ? 'Expense Limit (Yearly)' : 'Expense Limit'} <span className="text-rose-500">*</span></label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            placeholder="e.g. 5000"
                                                            value={sharedExpenseLimit}
                                                            onChange={(e) => setSharedExpenseLimit(e.target.value)}
                                                            required
                                                            min="0"
                                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Receipt Threshold <span className="text-rose-500">*</span></label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            placeholder="e.g. 1000"
                                                            value={sharedReceiptThreshold}
                                                            onChange={(e) => setSharedReceiptThreshold(e.target.value)}
                                                            required
                                                            min="0"
                                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            </div>

                                            <div className="flex justify-end pt-2">
                                                <button
                                                    type="button"
                                                    onClick={handleAddRulesList}
                                                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100/70 hover:border-indigo-300 text-indigo-600 rounded-lg font-bold text-sm transition-all active:scale-95 shadow-sm"
                                                >
                                                    <Plus size={16} /> Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                 {/* Section: Rules and Limits */}
                                 <div className="flex flex-col lg:flex-row gap-4 lg:gap-10">
                                     <div className="lg:w-64 flex-shrink-0 space-y-1">
                                         <h3 className="text-sm font-bold text-slate-800">Rules and Limits</h3>
                                         <p className="text-xs text-slate-500 leading-relaxed">Configured applicability rules for this expense category.</p>
                                     </div>
                                     <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                         {addedRules.length === 0 ? (
                                             <div className="p-8 text-center text-slate-400">
                                                 <Info size={32} className="mx-auto mb-2 text-slate-300 animate-pulse" />
                                                 <p className="text-sm font-semibold">No rules added yet.</p>
                                                 <p className="text-xs text-slate-400 mt-0.5">Select a Frequency and Applicable Target above, click Add, and they will show up here.</p>
                                             </div>
                                         ) : (
                                             <div className="overflow-x-auto">
                                                 <table className="w-full text-left border-collapse">
                                                     <thead>
                                                         <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">

                                                             <th className="px-4 py-4 w-10"></th>
                                                             <th className="px-6 py-4">Applicable Target</th>
                                                             <th className="px-6 py-4">Selected Items</th>
                                                             <th className="px-6 py-4">Expense Limit</th>
                                                             <th className="px-6 py-4">Receipt Threshold</th>
                                                             <th className="px-6 py-4 text-center">Actions</th>
                                                         </tr>
                                                     </thead>
                                                      <tbody className="divide-y divide-slate-100">
                                                          {(() => {
                                                              const groups: { key: string; rules: typeof addedRules }[] = [];
                                                              addedRules.forEach(rule => {
                                                                  const key = rule.groupId || rule.id;
                                                                  const existing = groups.find(g => g.key === key);
                                                                  if (existing) { existing.rules.push(rule); }
                                                                  else { groups.push({ key, rules: [rule] }); }
                                                              });
                                                              return groups.map(group => {
                                                                  const first = group.rules[0];
                                                                  const allTargets = group.rules.map(r => r.applicableTarget).join(', ');
                                                                  const allItems = group.rules.flatMap(r => r.selectedTargetValues).join(', ');
                                                                  const groupKey = group.key;
                                                                  return (
                                                                      <tr
                                                                          key={groupKey}
                                                                          draggable
                                                                          onDragStart={() => setDraggedRuleGroupKey(groupKey)}
                                                                          onDragOver={(e: React.DragEvent) => e.preventDefault()}
                                                                          onDrop={() => handleDropRuleGroup(groupKey)}
                                                                          onDragEnd={() => setDraggedRuleGroupKey(null)}
                                                                          className={`hover:bg-slate-50/50 transition-colors ${draggedRuleGroupKey === groupKey ? 'opacity-40' : ''}`}
                                                                      >
                                                                          <td className="px-4 py-4">
                                                                              <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors" title="Drag to reorder">
                                                                                  <GripVertical size={16} />
                                                                              </div>
                                                                          </td>
                                                                          <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                                                              {allTargets}
                                                                          </td>
                                                                          <td className="px-6 py-4 text-sm text-slate-600">
                                                                              {allItems}
                                                                          </td>
                                                                          <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                                                                               ₹{first.expenseLimit || '0'}
                                                                          </td>
                                                                          <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                                                                               ₹{first.receiptThreshold || '0'}
                                                                          </td>
                                                                           <td className="px-6 py-4">
                                                                               <div className="flex items-center justify-center gap-1">
                                                                                   <button
                                                                                       type="button"
                                                                                       onClick={() => handleEditRuleGroup(group.rules)}
                                                                                       className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-all"
                                                                                       title="Edit Rule Group"
                                                                                   >
                                                                                       <Edit2 size={14} />
                                                                                   </button>
                                                                                   <button
                                                                                       type="button"
                                                                                       onClick={() => {
                                                                                           const groupIds = group.rules.map(r => r.id);
                                                                                           setAddedRules(prev => prev.filter(r => !groupIds.includes(r.id)));
                                                                                       }}
                                                                                       className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                                                       title="Remove Rule Group"
                                                                                   >
                                                                                       <Trash2 size={14} />
                                                                                   </button>
                                                                               </div>
                                                                           </td>
                                                                      </tr>
                                                                  );
                                                              });
                                                          })()}
                                                      </tbody>

                                                 </table>
                                             </div>
                                         )}
                                     </div>
                                 </div>

                                {/* Section 3: Status */}
                                <div className="flex flex-col lg:flex-row gap-4 lg:gap-10">
                                    <div className="lg:w-64 flex-shrink-0 space-y-1">
                                        <h3 className="text-sm font-bold text-slate-800">Status</h3>
                                        <p className="text-xs text-slate-500 leading-relaxed">Set whether this expense rule is active or inactive.</p>
                                    </div>
                                    <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="status"
                                                checked={expenseStatusActive}
                                                onChange={(e) => setExpenseStatusActive(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                        <span className="text-sm font-semibold text-indigo-700">{expenseStatusActive ? 'Active' : 'Inactive'}</span>
                                    </div>
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
            <div className="p-4 lg:p-8 w-full space-y-8 animate-in fade-in duration-300 pb-20">

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
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-700 focus:outline-none focus:border-sky-500 transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg">
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
                                        className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 font-bold text-sm transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 px-4 py-2.5 bg-sky-600 text-white rounded-md hover:bg-sky-700 font-bold text-sm transition-all shadow-lg shadow-sky-100 disabled:opacity-50"
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
                                    setRuleFrequency('Monthly');
                                    setRuleResetCycleBasis('Calendar Year (Jan-Dec)');
                                    setInputTargetRows([{ id: 'row-0', applicableTarget: 'Business Unit', selectedTargetValues: [], isTargetDropdownOpen: false }]);
                                    setAddedRules([]);
                                    setShowCriteriaOverrides(false);
                                    setApplicabilityScope('all');
                                    setExpenseStatusActive(true);
                                    setIsAddingExpense(true);
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg font-bold text-sm transition-all shadow-lg" style={{ backgroundColor: '#444CE7' }}
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
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Frequency</th>
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
                                                 {(() => {
                                                     const frequencies = Array.from(new Set((cat.applicable_to || []).map((ent: any) => ent.frequency).filter(Boolean)));
                                                     if (frequencies.length === 0) frequencies.push('Monthly');
                                                     return frequencies.map((freq: any, i: number) => (
                                                         <span key={i} className="text-[10px] font-black text-slate-700 uppercase tracking-wider px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg w-fit">
                                                             {freq}
                                                         </span>
                                                     ));
                                                 })()}
                                             </div>
                                         </td>
                                         <td className="px-6 py-5">
                                             <button
                                                 type="button"
                                                 onClick={() => setLimitsPreviewCategory(cat)}
                                                 className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                                             >
                                                 {(() => {
                                                     const limitVals = (cat.applicable_to && cat.applicable_to.length > 0)
                                                         ? cat.applicable_to.map((e: any) => Number(e.max_limit) || 0)
                                                         : [Number(cat.max_limit) || 0];
                                                     const min = Math.min(...limitVals);
                                                     const max = Math.max(...limitVals);
                                                     return min === max ? `₹${min.toLocaleString()}` : `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
                                                 })()}
                                             </button>
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
                                                         {cat.updated_at ? new Date(cat.updated_at).toLocaleDateString() : 'Recently'}
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
                                                    const loaded = loadAddedRules(cat.applicable_to);
                                                    setAddedRules(loaded);
                                                    const ALL_TARGET_OPTIONS = ["Business Unit", "Department", "Designation", "Employee Status", "Employee"];
                                                    setInputTargetRows([{ id: 'row-0', applicableTarget: ALL_TARGET_OPTIONS[0], selectedTargetValues: [], isTargetDropdownOpen: false }]);
                                                    setRuleFrequency('Monthly');
                                                    setRuleResetCycleBasis('Calendar Year (Jan-Dec)');
                                                    setSelectedEntities((cat.applicable_to || []).filter((ent: any) => ent.type === 'dept' || ent.type === 'desig'));
                                                    setShowCriteriaOverrides((cat.applicable_to || []).some((ent: any) => ent.type === 'dept' || ent.type === 'desig'));
                                                    setApplicabilityScope((cat.applicable_to || []).some((ent: any) => ent.type === 'dept' || ent.type === 'desig') ? 'specific' : 'all');
                                                    setExpenseStatusActive(cat.status === 'Active');
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
                {/* Limits Preview Modal */}
                {limitsPreviewCategory && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{limitsPreviewCategory.name}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Configured applicability rules and limits for this expense category.</p>
                                </div>
                                <button
                                    onClick={() => setLimitsPreviewCategory(null)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="overflow-y-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="px-6 py-4">Applicable Target</th>
                                            <th className="px-6 py-4">Selected Items</th>
                                            <th className="px-6 py-4">Expense Limit</th>
                                            <th className="px-6 py-4">Receipt Threshold</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loadAddedRules(limitsPreviewCategory.applicable_to).map(rule => (
                                            <tr key={rule.id}>
                                                <td className="px-6 py-4 text-sm text-slate-600 font-medium">{rule.applicableTarget}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{rule.selectedTargetValues.join(', ')}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-800">₹{rule.expenseLimit || '0'}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-800">₹{rule.receiptThreshold || '0'}</td>
                                            </tr>
                                        ))}
                                        {loadAddedRules(limitsPreviewCategory.applicable_to).length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">
                                                    No specific rules configured — applies to all employees.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={() => setLimitsPreviewCategory(null)}
                                    className="px-5 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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