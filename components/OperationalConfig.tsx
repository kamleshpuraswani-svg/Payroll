import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Info, Search, X, ArrowUp, ArrowDown, GripVertical, Save, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
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
            const { data: empData, error: empError } = await supabase
                .from('employees')
                .select('id, name, eid')
                .eq('status', 'Active');

            if (empError) console.error('Error fetching employees:', empError);
            if (empData) setAllEmployees(empData);

            if (data) {
                const hierarchy = data.find(c => c.config_key === 'payroll_approval_hierarchy');
                const eligibility = data.find(c => c.config_key === 'loans_advances_eligibility');

                if (hierarchy && hierarchy.config_value) {
                    setSelectedEmployees(hierarchy.config_value.approvers || []);
                }

                if (eligibility && eligibility.config_value) {
                    setEligibleDepartments(eligibility.config_value.departments || []);
                    setEmployeeStatus(eligibility.config_value.statuses || ['Probation', 'Confirmed']);
                }
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
                        statuses: employeeStatus
                    }
                }, { onConflict: 'config_key' });

            if (eligibilityError) throw eligibilityError;

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            console.error('Error saving config:', err);
            setError('Failed to save configuration to Supabase.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSelectEmployee = (id: string) => {
        if (!id) return;
        if (selectedEmployees.find(emp => emp.id === id)) return;

        const empToAdd = allEmployees.find(emp => emp.id === id);
        if (empToAdd) {
            setSelectedEmployees([...selectedEmployees, empToAdd]);
        }
    };

    const removeEmployee = (id: string) => {
        setSelectedEmployees(selectedEmployees.filter(emp => emp.id !== id));
    };

    const moveEmployee = (index: number, direction: 'up' | 'down') => {
        const newItems = [...selectedEmployees];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newItems.length) return;

        const [movedItem] = newItems.splice(index, 1);
        newItems.splice(targetIndex, 0, movedItem);
        setSelectedEmployees(newItems);
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

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
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
                                        onChange={(e) => handleSelectEmployee(e.target.value)}
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
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approval Sequence</p>
                                    <div className="space-y-2">
                                        {selectedEmployees.map((emp, index) => (
                                            <div
                                                key={emp.id}
                                                className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg group hover:border-sky-200 hover:bg-sky-50 transition-all"
                                            >
                                                <div className="flex flex-col gap-0.5 text-slate-400">
                                                    <button
                                                        disabled={index === 0}
                                                        onClick={() => moveEmployee(index, 'up')}
                                                        className="hover:text-sky-600 disabled:opacity-30 p-0.5"
                                                    >
                                                        <ArrowUp size={14} />
                                                    </button>
                                                    <button
                                                        disabled={index === selectedEmployees.length - 1}
                                                        onClick={() => moveEmployee(index, 'down')}
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
                                                    onClick={() => removeEmployee(emp.id)}
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
                                    <Info size={14} className="text-slate-400 cursor-help" />
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

                            {/* Employee Status Section */}
                            <div className="pt-4">
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OperationalConfig;
