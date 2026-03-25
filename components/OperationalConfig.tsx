import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Info, Search, X, ArrowUp, ArrowDown, GripVertical, Save, CheckCircle2, Loader2, AlertCircle, Edit2, Check } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface SelectedEmployee {
    id: string;
    name: string;
    eid: string;
}

// MOCK_EMPLOYEES is kept as fallback or removed if using Supabase
interface EmployeeData {
    id: string;
    name: string;
    eid: string;
    department?: string;
    designation?: string;
    avatar_url?: string;
}

const DEPARTMENTS = [
    "Digital Technology",
    "Retail Banking",
    "Human Resources",
    "Finance",
    "Sales",
    "Marketing",
    "Operations"
];

const BUSINESS_UNITS = [
    "MindInventory",
    "300 Minds",
    "CollabCRM"
];

const OperationalConfig: React.FC = () => {
    const [isHierarchyExpanded, setIsHierarchyExpanded] = useState(true);
    const [isEligibilityExpanded, setIsEligibilityExpanded] = useState(true);
    const [selectedEmployees, setSelectedEmployees] = useState<SelectedEmployee[]>([]);
    const [allEmployees, setAllEmployees] = useState<EmployeeData[]>([]);

    // Supabase state
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [eligibleDepartments, setEligibleDepartments] = useState<string[]>([]);
    const [employeeStatus, setEmployeeStatus] = useState<string[]>(['Probation', 'Confirmed']);
    const [approvalSourceSettings, setApprovalSourceSettings] = useState<{
        departments: string[];
    }>({
        departments: []
    });

    // Expense Management settings state
    const [expenseSettings, setExpenseSettings] = useState({
        id: '',
        deadline_claims_date: 5,
        receipt_mandatory_amount: 200,
        backdated_limit_months: 3
    });
    const [expenseApprovers, setExpenseApprovers] = useState<any[]>([]);
    const [isExpenseExpanded, setIsExpenseExpanded] = useState(true);

    // Payslip Naming Format state
    const [isPayslipNamingExpanded, setIsPayslipNamingExpanded] = useState(true);
    const [namingPatternSuffix, setNamingPatternSuffix] = useState('{{EmployeeName}}_{{Month}}_{{Year}}');
    const [isNamingEditing, setIsNamingEditing] = useState(false);
    const [tempSuffix, setTempSuffix] = useState('');
    const [paygroups, setPaygroups] = useState<any[]>([]);
    const [selectedTarget, setSelectedTarget] = useState('bu:MindInventory');
    const [isLoadingNaming, setIsLoadingNaming] = useState(false);
    const [isNamingSaving, setIsNamingSaving] = useState(false);

    const fetchPaygroups = async () => {
        try {
            const { data, error } = await supabase.from('paygroups').select('*').order('name');
            if (error) throw error;
            setPaygroups(data || []);
        } catch (err) {
            console.error('Error fetching paygroups:', err);
        }
    };

    const fetchNamingFormat = async (target: string) => {
        setIsLoadingNaming(true);
        try {
            const { data, error } = await supabase
                .from('operational_config')
                .select('config_value')
                .eq('config_key', `payslip_naming_format:${target}`)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            
            if (data?.config_value?.suffix) {
                setNamingPatternSuffix(data.config_value.suffix);
            } else {
                setNamingPatternSuffix('{{EmployeeName}}_{{Month}}_{{Year}}');
            }
        } catch (err) {
            console.error('Error fetching naming format:', err);
        } finally {
            setIsLoadingNaming(false);
        }
    };

    useEffect(() => {
        fetchPaygroups();
    }, []);

    useEffect(() => {
        fetchNamingFormat(selectedTarget);
    }, [selectedTarget]);

    const handleEditNamingFormat = () => {
        setTempSuffix(namingPatternSuffix);
        setIsNamingEditing(true);
    };
    const handleCancelNamingFormat = () => setIsNamingEditing(false);
    const handleSaveNamingFormat = async () => {
        setIsNamingSaving(true);
        try {
            const { error } = await supabase
                .from('operational_config')
                .upsert({
                    config_key: `payslip_naming_format:${selectedTarget}`,
                    config_value: { suffix: tempSuffix },
                    updated_at: new Date().toISOString()
                }, { onConflict: 'config_key' });

            if (error) throw error;
            setNamingPatternSuffix(tempSuffix);
            setIsNamingEditing(false);
        } catch (err) {
            console.error('Error saving naming format:', err);
            alert('Failed to save naming format.');
        } finally {
            setIsNamingSaving(false);
        }
    };
    const handleTagClick = (tag: string) => {
        if (!isNamingEditing) return;
        let s = tempSuffix;
        if (s.includes(tag)) {
            s = s.replace(tag, '');
        } else {
            if (tag === '{{Month}}' && s.includes('{{MonthShort}}')) { s = s.replace('{{MonthShort}}', '{{Month}}'); setTempSuffix(s.replace(/__+/g, '_').replace(/^_|_$/g, '')); return; }
            if (tag === '{{MonthShort}}' && s.includes('{{Month}}')) { s = s.replace('{{Month}}', '{{MonthShort}}'); setTempSuffix(s.replace(/__+/g, '_').replace(/^_|_$/g, '')); return; }
            s = s ? `${s}_${tag}` : tag;
        }
        setTempSuffix(s.replace(/__+/g, '_').replace(/^_|_$/g, ''));
    };
    const generateNamingPreview = (suffix: string) => {
        return ('Payslip_' + suffix)
            .replace('{{EmployeeName}}', 'Priya_Sharma')
            .replace('{{EmployeeID}}', 'TF00912')
            .replace('{{Month}}', 'November')
            .replace('{{MonthShort}}', 'Nov')
            .replace('{{Year}}', '2025')
            .replace('{{CompanyName}}', 'TechFlow')
            .replace('{{PayPeriod}}', '01-30_Nov_2025')
            .replace(/_+/g, '_') + '.pdf';
    };
    const resetNamingToDefault = () => {
        if (isNamingEditing) setTempSuffix('{{Month}}_{{Year}}_{{EmployeeID}}');
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch configuration
            const { data, error: fetchError } = await supabase
                .from('operational_config')
                .select('*');

            if (fetchError) throw fetchError;

            // Fetch employees for selection
            console.log('[OperationalConfig] Fetching all employees with robust mapping...');
            const { data: empData, error: empError } = await supabase
                .from('employees')
                .select('*')
                .eq('status', 'Active');
            
            if (empError) {
                console.error('[OperationalConfig] Error fetching employees:', empError);
            } else if (empData) {
                const formattedEmployees = empData.map(emp => ({
                    id: emp.id,
                    name: emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'No Name',
                    eid: emp.eid || emp.employee_id || 'N/A',
                    department: emp.department,
                    designation: emp.designation,
                    avatar_url: emp.avatar_url
                }));
                console.log('[OperationalConfig] fetched and formatted employees:', formattedEmployees.length);
                setAllEmployees(formattedEmployees);
            }

            if (data) {
                const hierarchy = data.find(c => c.config_key === 'payroll_approval_hierarchy');
                const eligibility = data.find(c => c.config_key === 'loans_advances_eligibility');

                if (hierarchy && hierarchy.config_value) {
                    setSelectedEmployees(hierarchy.config_value.approvers || []);
                }

                if (eligibility && eligibility.config_value) {
                    setEligibleDepartments(eligibility.config_value.departments || []);
                    setEmployeeStatus(eligibility.config_value.statuses || ['Probation', 'Confirmed']);
                    setApprovalSourceSettings(eligibility.config_value.approval_source_settings || {
                        departments: []
                    });
                }
            }

            // Fetch expense settings
            const { data: expSettingsData, error: expSettingsError } = await supabase
                .from('expense_settings')
                .select('*')
                .single();
            if (expSettingsData) setExpenseSettings(expSettingsData);

            // Fetch expense workflow
            const { data: workflowData, error: workflowError } = await supabase
                .from('expense_workflows')
                .select(`
                    id,
                    approver_id,
                    sequence_order
                `)
                .order('sequence_order');
            
            if (workflowData && empData) {
                setExpenseApprovers(workflowData.map(w => {
                    const emp = empData.find(e => e.id === w.approver_id);
                    return {
                        ...emp,
                        workflowId: w.id,
                        sequence: w.sequence_order
                    };
                }).filter(a => a.id)); // Ensure we only keep found employees
            }

        } catch (err: any) {
            console.error('Error fetching config:', err);
            setError('Failed to load configuration from Supabase.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveConfig = async () => {
        setIsSaving(true);
        setError(null);
        try {
            // Save hierarchy
            const { error: hierarchyError } = await supabase
                .from('operational_config')
                .upsert({
                    config_key: 'payroll_approval_hierarchy',
                    config_value: { approvers: selectedEmployees }
                }, { onConflict: 'config_key' });

            if (hierarchyError) throw hierarchyError;

            // Save eligibility
            const { error: eligibilityError } = await supabase
                .from('operational_config')
                .upsert({
                    config_key: 'loans_advances_eligibility',
                    config_value: {
                        departments: eligibleDepartments,
                        statuses: employeeStatus,
                        approval_source_settings: approvalSourceSettings
                    }
                }, { onConflict: 'config_key' });

            if (eligibilityError) throw eligibilityError;

            // Save expense settings
            const { error: expSettingsError } = await supabase
                .from('expense_settings')
                .update({
                    deadline_claims_date: expenseSettings.deadline_claims_date,
                    backdated_limit_months: expenseSettings.backdated_limit_months
                })
                .eq('id', expenseSettings.id);

            if (expSettingsError) throw expSettingsError;

            // Save expense workflow
            // Delete existing workflow
            await supabase.from('expense_workflows').delete().neq('id', '00000000-0000-0000-0000-000000000000');

            // Insert new sequence
            const workflowToInsert = expenseApprovers.map((emp, index) => ({
                approver_id: emp.id,
                sequence_order: index + 1
            }));

            if (workflowToInsert.length > 0) {
                const { error: workflowError } = await supabase.from('expense_workflows').insert(workflowToInsert);
                if (workflowError) throw workflowError;
            }

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            console.error('Error saving config:', err);
            setError('Failed to save configuration to Supabase.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSelectEmployee = (id: string, type: 'payroll' | 'expense') => {
        if (!id) return;
        
        if (type === 'payroll') {
            if (selectedEmployees.find(emp => emp.id === id)) return;
            const empToAdd = allEmployees.find(emp => emp.id === id);
            if (empToAdd) setSelectedEmployees([...selectedEmployees, empToAdd]);
        } else {
            if (expenseApprovers.find(emp => emp.id === id)) return;
            const empToAdd = allEmployees.find(emp => emp.id === id);
            if (empToAdd) setExpenseApprovers([...expenseApprovers, empToAdd]);
        }
    };

    const removeEmployee = (id: string, type: 'payroll' | 'expense') => {
        if (type === 'payroll') {
            setSelectedEmployees(selectedEmployees.filter(emp => emp.id !== id));
        } else {
            setExpenseApprovers(expenseApprovers.filter(emp => emp.id !== id));
        }
    };

    const moveEmployee = (index: number, direction: 'up' | 'down', type: 'payroll' | 'expense') => {
        const items = type === 'payroll' ? [...selectedEmployees] : [...expenseApprovers];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= items.length) return;

        const [movedItem] = items.splice(index, 1);
        items.splice(targetIndex, 0, movedItem);

        if (type === 'payroll') setSelectedEmployees(items);
        else setExpenseApprovers(items);
    };

    // Eligibility Handlers
    const handleSelectDepartment = (dept: string) => {
        if (!dept) return;
        if (eligibleDepartments.includes(dept)) return;
        setEligibleDepartments([...eligibleDepartments, dept]);
    };

    const removeDepartment = (dept: string) => {
        setEligibleDepartments(eligibleDepartments.filter(d => d !== dept));
    };

    const toggleStatus = (status: string) => {
        setEmployeeStatus(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const handleApprovalSourceSelectDept = (dept: string) => {
        if (!dept) return;
        if (approvalSourceSettings.departments.includes(dept)) return;
        setApprovalSourceSettings(prev => ({
            ...prev,
            departments: [...prev.departments, dept]
        }));
    };

    const removeApprovalSourceDept = (dept: string) => {
        setApprovalSourceSettings(prev => ({
            ...prev,
            departments: prev.departments.filter(d => d !== dept)
        }));
    };

    return (
        <div className="p-4 lg:p-6 w-full space-y-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Operational Config</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage operational settings and notification preferences.</p>
                </div>
                <div className="flex items-center gap-4">
                    {saveSuccess && (
                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 animate-in fade-in zoom-in duration-300">
                            <CheckCircle2 size={16} />
                            <span className="text-xs font-bold">Changes Synced with Supabase</span>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                            <AlertCircle size={16} />
                            <span className="text-xs font-bold">{error}</span>
                        </div>
                    )}
                    <button
                        onClick={handleSaveConfig}
                        disabled={isSaving || isLoading}
                        className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-sky-100 active:scale-95"
                    >
                        {isSaving ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        {isSaving ? 'Syncing...' : 'Save All Changes'}
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse">
                    <Loader2 size={32} className="text-sky-500 animate-spin mb-4" />
                    <p className="text-slate-400 font-medium">Fetching configuration from Supabase...</p>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setIsHierarchyExpanded(!isHierarchyExpanded)}
                >
                    <h3 className="font-semibold text-slate-800">Payroll Approval Hierarchy</h3>
                    <button className="text-slate-400">
                        {isHierarchyExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>

                {isHierarchyExpanded && (
                    <div className="p-6 border-t border-slate-100 bg-white">
                        <div className="max-w-3xl space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                                    Notify for Payroll Approval <span className="text-red-500">*</span>
                                    <Info size={14} className="text-slate-400 cursor-help" />
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <Search size={16} className="text-slate-400" />
                                    </div>
                                    <select
                                        value=""
                                        onChange={(e) => handleSelectEmployee(e.target.value, 'payroll')}
                                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Search employee...</option>
                                        {allEmployees.filter(emp => !selectedEmployees.find(s => s.id === emp.id)).map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.name} ({emp.eid})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                        <ChevronDown size={16} className="text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Selected Hierarchy Section */}
                            {selectedEmployees.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approval Workflow</p>
                                    <div className="space-y-2">
                                        {selectedEmployees.map((emp, index) => (
                                            <div
                                                key={emp.id}
                                                className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg group hover:border-sky-200 hover:bg-sky-50 transition-all"
                                            >
                                                <div className="flex flex-col gap-0.5 text-slate-400">
                                                    <button
                                                        disabled={index === 0}
                                                        onClick={() => moveEmployee(index, 'up', 'payroll')}
                                                        className="hover:text-sky-600 disabled:opacity-30 p-0.5"
                                                    >
                                                        <ArrowUp size={14} />
                                                    </button>
                                                    <button
                                                        disabled={index === selectedEmployees.length - 1}
                                                        onClick={() => moveEmployee(index, 'down', 'payroll')}
                                                        className="hover:text-sky-600 disabled:opacity-30 p-0.5"
                                                    >
                                                        <ArrowDown size={14} />
                                                    </button>
                                                </div>

                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-slate-700">{emp.name}</div>
                                                    <div className="text-xs text-slate-500">Employee ID: {emp.eid} • Level {index + 1}</div>
                                                </div>

                                                <button
                                                    onClick={() => removeEmployee(emp.id, 'payroll')}
                                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-all"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-slate-400 italic">
                                        * Approvals will be requested sequentially in the order listed above.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Loans & Advances Eligibility Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setIsEligibilityExpanded(!isEligibilityExpanded)}
                >
                    <h3 className="font-semibold text-slate-800">Loans & Advances Eligibility</h3>
                    <button className="text-slate-400">
                        {isEligibilityExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>

                {isEligibilityExpanded && (
                    <div className="p-6 border-t border-slate-100 bg-white">
                        <div className="max-w-3xl space-y-8">
                            {/* Department Eligibility Section */}
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">
                                    Eligible Departments <span className="text-red-500">*</span>
                                    <div className="group relative">
                                        <Info size={14} className="text-slate-400 cursor-help" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-relaxed font-normal normal-case">
                                            Choose departments who will be eligible for Loans and Advances. This helps limit selection to relevant teams only.
                                        </div>
                                    </div>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <Search size={16} className="text-slate-400" />
                                    </div>
                                    <select
                                        value=""
                                        onChange={(e) => handleSelectDepartment(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Search department...</option>
                                        {DEPARTMENTS.filter(dept => !eligibleDepartments.includes(dept)).map(dept => (
                                            <option key={dept} value={dept}>
                                                {dept}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                        <ChevronDown size={16} className="text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Selected Eligible Departments Section */}
                            {eligibleDepartments.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Eligible Departments List</p>
                                    <div className="space-y-2">
                                        {eligibleDepartments.map((dept, index) => (
                                            <div
                                                key={dept}
                                                className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg group hover:border-sky-200 hover:bg-sky-50 transition-all"
                                            >
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-slate-700 font-bold">{dept}</div>
                                                </div>

                                                <button
                                                    onClick={() => removeDepartment(dept)}
                                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-all"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 mb-4 flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">
                                        Employee Status <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-8 items-center">
                                        {['Probation', 'Confirmed', 'Notice Period', 'Intern'].map((status) => (
                                            <label key={status} className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={employeeStatus.includes(status)}
                                                        onChange={() => toggleStatus(status)}
                                                        className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-md checked:bg-sky-500 checked:border-sky-500 transition-all cursor-pointer"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                                                    {status}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <label className="block text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">
                                        Approval Source Settings <span className="text-red-500">*</span>
                                        <div className="group relative">
                                            <Info size={14} className="text-slate-400 cursor-help" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-relaxed font-normal normal-case">
                                                Select the department whose employees should be available for assignment in the dropdowns for the approval flow for any loans & advances requests of employees. This helps limit selection to relevant teams only.
                                            </div>
                                        </div>
                                    </label>

                                    <div className="max-w-md">
                                        {/* Dropdown for Departments */}
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                                <Search size={16} className="text-slate-400" />
                                            </div>
                                            <select
                                                value=""
                                                onChange={(e) => handleApprovalSourceSelectDept(e.target.value)}
                                                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer text-sm"
                                            >
                                                <option value="" disabled>Search department...</option>
                                                {DEPARTMENTS.filter(dept => !approvalSourceSettings.departments.includes(dept)).map(dept => (
                                                    <option key={dept} value={dept}>{dept}</option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                                <ChevronDown size={16} className="text-slate-400" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selected Items List */}
                                    {approvalSourceSettings.departments.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {approvalSourceSettings.departments.map(dept => (
                                                <div key={dept} className="flex items-center gap-2 bg-sky-50 text-sky-700 border border-sky-100 px-3 py-1.5 rounded-lg text-xs font-bold">
                                                    <div className="flex items-center gap-1.5">
                                                        <Search size={12} className="opacity-70" />
                                                        {dept}
                                                    </div>
                                                    <button onClick={() => removeApprovalSourceDept(dept)} className="hover:text-rose-600 transition-colors">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Expenses Management Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setIsExpenseExpanded(!isExpenseExpanded)}
                >
                    <h3 className="font-semibold text-slate-800">Expenses Management</h3>
                    <button className="text-slate-400">
                        {isExpenseExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>

                {isExpenseExpanded && (
                    <div className="p-6 border-t border-slate-100 bg-white">
                        <div className="max-w-3xl space-y-8">
                            {/* Submission Rules */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">
                                        Submission Deadline (Date)
                                        <Info size={14} className="text-slate-400 cursor-help" />
                                    </label>
                                    <select
                                        value={expenseSettings.deadline_claims_date}
                                        onChange={(e) => setExpenseSettings({...expenseSettings, deadline_claims_date: parseInt(e.target.value)})}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-sky-500 transition-all"
                                    >
                                        {[...Array(31)].map((_, i) => (
                                            <option key={i+1} value={i+1}>{i+1}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">
                                        Back-dated Claims Limit (Months)
                                        <Info size={14} className="text-slate-400 cursor-help" />
                                    </label>
                                    <select
                                        value={expenseSettings.backdated_limit_months}
                                        onChange={(e) => setExpenseSettings({...expenseSettings, backdated_limit_months: parseInt(e.target.value)})}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-sky-500 transition-all"
                                    >
                                        {[...Array(12)].map((_, i) => (
                                            <option key={i+1} value={i+1}>{i+1} Months</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Approval Workflow */}
                            <div className="pt-6 border-t border-slate-100">
                                <label className="block text-sm font-medium text-slate-500 mb-4 flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">
                                    Approval Workflow
                                    <Info size={14} className="text-slate-400 cursor-help" />
                                </label>
                                
                                <div className="space-y-4">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                            <Search size={16} className="text-slate-400" />
                                        </div>
                                        <select
                                            value=""
                                            onChange={(e) => handleSelectEmployee(e.target.value, 'expense')}
                                            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Search approver...</option>
                                            {allEmployees.filter(emp => !expenseApprovers.find(s => s.id === emp.id)).map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.name} ({emp.eid})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {expenseApprovers.length > 0 && (
                                        <div className="space-y-2">
                                            {expenseApprovers.map((emp, index) => (
                                                <div key={emp.id} className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg group hover:border-sky-200 hover:bg-sky-50 transition-all">
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-slate-700">{emp.name}</div>
                                                        <div className="text-xs text-slate-500">Employee ID: {emp.eid}</div>
                                                    </div>
                                                    <button 
                                                        onClick={() => removeEmployee(emp.id, 'expense')}
                                                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-all"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Payslip Naming Format Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setIsPayslipNamingExpanded(!isPayslipNamingExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-800">Payslip Naming Format</h3>
                        {isNamingSaving && <Loader2 size={16} className="text-sky-600 animate-spin" />}
                    </div>
                    <button className="text-slate-400">
                        {isPayslipNamingExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>

                {isPayslipNamingExpanded && (
                    <div className="p-6 border-t border-slate-100 bg-white">
                        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg">Format Configuration</h4>
                                <p className="text-sm text-slate-500 mt-1">Configure the default naming format for payslip PDFs.</p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <select
                                        value={selectedTarget}
                                        onChange={(e) => setSelectedTarget(e.target.value)}
                                        className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none shadow-sm"
                                    >
                                        <optgroup label="Business Units">
                                            {BUSINESS_UNITS.map(bu => (
                                                <option key={bu} value={`bu:${bu}`}>{bu}</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>

                                {isNamingEditing ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleCancelNamingFormat}
                                            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm h-[42px]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveNamingFormat}
                                            disabled={isNamingSaving}
                                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-2 h-[42px]"
                                        >
                                            {isNamingSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            Save Changes
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleEditNamingFormat}
                                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm flex items-center gap-2 h-[42px]"
                                    >
                                        <Edit2 size={16} /> Edit Format
                                    </button>
                                )}
                            </div>
                        </div>

                        {isLoadingNaming ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                                <Loader2 size={24} className="animate-spin text-sky-600" />
                                <span className="text-sm font-medium">Loading naming format...</span>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="space-y-4">
                                    {/* Filename Input */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">PDF Filename Pattern</label>
                                        <div className="flex shadow-sm rounded-xl overflow-hidden">
                                            <div className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 text-sm font-medium text-slate-500 flex items-center select-none">
                                                Payslip_
                                            </div>
                                            <input
                                                type="text"
                                                value={isNamingEditing ? tempSuffix : namingPatternSuffix}
                                                onChange={(e) => isNamingEditing && setTempSuffix(e.target.value)}
                                                disabled={!isNamingEditing}
                                                className={`flex-1 px-3 py-2.5 border border-l-0 border-slate-200 text-sm font-mono text-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 ${!isNamingEditing ? 'bg-slate-50 cursor-not-allowed opacity-80' : 'bg-white'}`}
                                            />
                                            <div className="w-20 bg-slate-100 border border-l-0 border-slate-200 flex items-center justify-center">
                                                <span className="text-xs font-bold text-slate-500">.pdf</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tag Chips */}
                                    <div className="flex flex-wrap gap-2">
                                        {['{{EmployeeName}}', '{{EmployeeID}}', '{{Month}}', '{{MonthShort}}', '{{Year}}', '{{CompanyName}}', '{{PayPeriod}}'].map(tag => {
                                            const currentSuffix = isNamingEditing ? tempSuffix : namingPatternSuffix;
                                            const isSelected = currentSuffix.includes(tag);
                                            return (
                                                <button
                                                    key={tag}
                                                    onClick={() => handleTagClick(tag)}
                                                    disabled={!isNamingEditing}
                                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border flex items-center gap-1.5 ${
                                                        !isNamingEditing
                                                            ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed'
                                                            : isSelected
                                                                ? 'bg-sky-100 text-sky-700 border-sky-200 shadow-sm'
                                                                : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-600'
                                                    }`}
                                                >
                                                    {isSelected && <Check size={12} className="stroke-[3]" />}
                                                    {tag}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Preview */}
                                    <div className="flex items-center gap-2 text-sm bg-emerald-50 border border-emerald-100 p-3 rounded-xl overflow-hidden">
                                        <div className="bg-emerald-100 p-1 rounded">
                                            <Info size={14} className="text-emerald-700" />
                                        </div>
                                        <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-wider">Preview:</span>
                                        <span className="font-bold text-emerald-700 truncate font-mono text-xs">
                                            {generateNamingPreview(isNamingEditing ? tempSuffix : namingPatternSuffix)}
                                        </span>
                                    </div>

                                    {/* Reset Action */}
                                    {isNamingEditing && (
                                        <div className="flex justify-start">
                                            <button
                                                onClick={resetNamingToDefault}
                                                className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline uppercase tracking-wider"
                                            >
                                                Reset to Default Pattern
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OperationalConfig;
