import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Info, Search, X, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

interface SelectedEmployee {
    id: string;
    name: string;
    eid: string;
}

const ALL_EMPLOYEES: SelectedEmployee[] = [
    { id: '1', name: 'Kavita Sharma', eid: 'E001' },
    { id: '2', name: 'Rajesh Kumar', eid: 'E002' },
    { id: '3', name: 'Priya Sharma', eid: 'E003' },
    { id: '4', name: 'Arjun Mehta', eid: 'E004' },
];

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
    const [eligibleDepartments, setEligibleDepartments] = useState<string[]>([]);
    const [employeeStatus, setEmployeeStatus] = useState<string[]>(['Probation', 'Confirmed']);

    const handleSelectEmployee = (id: string) => {
        if (!id) return;
        if (selectedEmployees.find(emp => emp.id === id)) return;

        const empToAdd = ALL_EMPLOYEES.find(emp => emp.id === id);
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
            </div>

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
                                        {ALL_EMPLOYEES.filter(emp => !selectedEmployees.find(s => s.id === emp.id)).map(emp => (
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
