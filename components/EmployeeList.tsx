import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import {
    Search,
    Filter,
    Edit2,
    Trash2,
    Users,
    Calculator,
    Calendar,
    ChevronDown,
    X,
    CheckCircle,
    ArrowRight,
    Briefcase,
    CheckSquare,
    Eye,
    Clock,
    Save,
    MapPin,
    Building,
    Info,
    ChevronLeft,
    Printer,
    Download,
    Share2,
    Plus,
    Check,
    AlertTriangle,
    Upload
} from 'lucide-react';
import { Employee } from '../types';
import { MOCK_EMPLOYEES } from '../constants';
import { supabase } from '../services/supabaseClient';

interface SalaryHistoryRow {
    id: string;
    period: string;
    gross: number;
    net: number;
    status: 'Disbursed' | 'Pending' | 'Hold';
    date: string;
    bankAcc: string;
    deductions: {
        pf: number;
        tds: number;
        others: number;
    };
}

const STRUCTURE_OPTIONS = [
    "Standard IT 2025",
    "Startup Flexi",
    "Contractor Monthly",
    "Custom – Priya",
    "Sales Incentive Structure"
];

export interface SalaryComponent {
    id: string;
    name: string;
    monthlyAmount: number;
    annualAmount: number;
    type: 'earnings' | 'retirals' | 'deductions';
    isMandatory?: boolean;
}

// --- Sub-Component: Salary Annexure Preview Modal ---
const SalaryAnnexureModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    employee: Employee;
    annualCtc: number;
    structureName: string;
    initialComponents?: SalaryComponent[];
    onSave?: (components: SalaryComponent[]) => void;
}> = ({ isOpen, onClose, employee, annualCtc, structureName, initialComponents, onSave }) => {
    if (!isOpen) return null;

    const [components, setComponents] = useState<SalaryComponent[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerSearch, setPickerSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialComponents && initialComponents.length > 0) {
                setComponents(initialComponents);
            } else {
                const ctc = annualCtc || 0;
                const basic = Math.round(ctc * 0.4);
                const hra = Math.round(basic * 0.5);
                const lta = ctc > 0 ? 50000 : 0;
                const pf = ctc > 0 ? 21600 : 0;
                const grat = Math.round(basic * 0.0443);
                const retirals = pf + grat;
                const gross = ctc - retirals;
                const special = Math.max(0, gross - basic - hra - lta);

                setComponents([
                    { id: 'basic', name: 'Basic Salary', annualAmount: basic, monthlyAmount: Math.round(basic / 12), type: 'earnings', isMandatory: true },
                    { id: 'hra', name: 'House Rent Allowance', annualAmount: hra, monthlyAmount: Math.round(hra / 12), type: 'earnings' },
                    { id: 'special', name: 'Special Allowance', annualAmount: special, monthlyAmount: Math.round(special / 12), type: 'earnings' },
                    { id: 'lta', name: 'Leave Travel Allowance', annualAmount: lta, monthlyAmount: Math.round(lta / 12), type: 'earnings' },
                    { id: 'pf', name: 'Provident Fund (Employer)', annualAmount: pf, monthlyAmount: Math.round(pf / 12), type: 'retirals', isMandatory: false },
                    { id: 'gratuity', name: 'Gratuity', annualAmount: grat, monthlyAmount: Math.round(grat / 12), type: 'retirals', isMandatory: false },
                ]);
            }
        }
    }, [isOpen, annualCtc, initialComponents]);

    const calculateTotals = () => {
        const earnings = components.filter(c => c.type === 'earnings').reduce((sum, c) => sum + c.annualAmount, 0);
        const retirals = components.filter(c => c.type === 'retirals').reduce((sum, c) => sum + c.annualAmount, 0);
        return { earnings, retirals, ctc: earnings + retirals };
    };

    const handleUpdateAmount = (id: string, newAnnual: number) => {
        setComponents(prev => {
            const newComps = prev.map(c => {
                if (c.id === id) {
                    return { ...c, annualAmount: newAnnual, monthlyAmount: Math.round(newAnnual / 12) };
                }
                return c;
            });

            // Balancing logic: If CTC should stay fixed (which is often expected in salary editing),
            // update Special Allowance. However, for true "manual edit", we'll just update the component
            // and let the total CTC reflect the sum unless it's a specific balancing field.
            return newComps;
        });
    };

    const handleRemoveComponent = (id: string) => {
        setComponents(prev => prev.filter(c => c.id !== id || c.isMandatory));
    };

    const handleAddComponent = () => {
        setIsPickerOpen(true);
    };

    const handleSelectComponent = (configComp: any) => {
        const amount = parseInt(prompt(`Enter Annual Amount for ${configComp.name}:`) || "0");
        if (isNaN(amount) || amount === 0) return;

        let type: 'earnings' | 'retirals' | 'deductions' = 'earnings';
        if (configComp.category === 'Deductions') type = 'deductions';
        if (configComp.category === 'Benefits' || configComp.name.toLowerCase().includes('employer')) type = 'retirals';

        const newComp: SalaryComponent = {
            id: `custom-${Date.now()}`,
            name: configComp.name,
            annualAmount: amount,
            monthlyAmount: Math.round(amount / 12),
            type
        };
        setComponents([...components, newComp]);
        setIsPickerOpen(false);
        setPickerSearch('');
    };

    // Load available components from config
    const availableComponents = (() => {
        const saved = localStorage.getItem('collab_salary_components');
        const configComps = saved ? JSON.parse(saved) : [
            { id: '1', name: 'Basic', category: 'Earnings' },
            { id: '2', name: 'House Rent Allowance', category: 'Earnings' },
            { id: '3', name: 'Fixed Allowance', category: 'Earnings' },
            { id: '4', name: 'Commission', category: 'Earnings' },
            { id: '14', name: 'Medical Reimbursement', category: 'Reimbursements' },
            { id: '15', name: 'Fuel Reimbursement', category: 'Reimbursements' },
            { id: '7', name: 'Professional Tax (PT)', category: 'Deductions' },
            { id: '8', name: 'Provident Fund (Employee)', category: 'Deductions' },
            { id: '9', name: 'Income Tax (TDS)', category: 'Deductions' },
            { id: '11', name: 'Provident Fund (Employer)', category: 'Benefits' },
        ];

        // Filter out components already in the list
        return configComps.filter((cc: any) =>
            !components.some(c => c.name.toLowerCase() === cc.name.toLowerCase()) &&
            (cc.name.toLowerCase().includes(pickerSearch.toLowerCase()))
        );
    })();

    const handleSave = () => {
        if (onSave) onSave(components);
        onClose();
    };

    const { earnings: totalEarnings, retirals: totalRetirals, ctc: totalCtc } = calculateTotals();

    const formatNum = (val: number) => val.toLocaleString('en-IN');
    const formatMonthly = (val: number) => Math.round(val / 12).toLocaleString('en-IN');

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-start bg-white">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Salary Structure Annexure</h3>
                        <p className="text-sm text-sky-600 font-bold mt-0.5">{employee.first_name} {employee.last_name} <span className="text-slate-400 font-medium">({employee.employee_id})</span></p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            {isEditing ? 'Viewing' : 'Edit Structure'}
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Component</th>
                                    <th className="px-6 py-4 text-right">Monthly (₹)</th>
                                    <th className="px-6 py-4 text-right">Annual (₹)</th>
                                    {isEditing && <th className="px-6 py-4 text-center w-20">Action</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {/* A. Earnings */}
                                <tr className="bg-emerald-50/20">
                                    <td colSpan={isEditing ? 4 : 3} className="px-6 py-3 font-black text-emerald-800 text-[10px] uppercase tracking-widest bg-emerald-50/40 border-y border-emerald-100/50">A. Earnings</td>
                                </tr>
                                {components.filter(c => c.type === 'earnings').map(comp => (
                                    <tr key={comp.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-700">{comp.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-slate-500 font-medium tracking-tight">₹ {formatMonthly(comp.annualAmount)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {isEditing ? (
                                                <div className="relative inline-block w-32">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                    <input
                                                        type="number"
                                                        value={comp.annualAmount}
                                                        onChange={(e) => handleUpdateAmount(comp.id, parseInt(e.target.value) || 0)}
                                                        className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded-md text-right font-black text-slate-800 focus:outline-none focus:border-sky-500 transition-all text-xs"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-slate-800 font-black tracking-tight">₹ {formatNum(comp.annualAmount)}</span>
                                            )}
                                        </td>
                                        {isEditing && (
                                            <td className="px-6 py-4 text-center">
                                                {!comp.isMandatory && (
                                                    <button
                                                        onClick={() => handleRemoveComponent(comp.id)}
                                                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                <tr className="bg-slate-50/50 font-black border-t border-slate-200">
                                    <td className="px-6 py-4 text-slate-700 text-xs">Total Gross Salary (A)</td>
                                    <td className="px-6 py-4 text-right text-slate-900 text-xs tracking-tight">₹ {formatMonthly(totalEarnings)}</td>
                                    <td className="px-6 py-4 text-right text-slate-900 text-sm tracking-tight">₹ {formatNum(totalEarnings)}</td>
                                    {isEditing && <td />}
                                </tr>

                                {/* B. Retirals */}
                                <tr className="bg-sky-50/20">
                                    <td colSpan={isEditing ? 4 : 3} className="px-6 py-3 font-black text-sky-800 text-[10px] uppercase tracking-widest bg-sky-50/40 border-y border-sky-100/50">B. Retirals (Employer)</td>
                                </tr>
                                {components.filter(c => c.type === 'retirals').map(comp => (
                                    <tr key={comp.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-700">{comp.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-slate-500 font-medium tracking-tight">₹ {formatMonthly(comp.annualAmount)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {isEditing ? (
                                                <div className="relative inline-block w-32">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                    <input
                                                        type="number"
                                                        value={comp.annualAmount}
                                                        onChange={(e) => handleUpdateAmount(comp.id, parseInt(e.target.value) || 0)}
                                                        className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded-md text-right font-black text-slate-800 focus:outline-none focus:border-sky-500 transition-all text-xs"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-slate-800 font-black tracking-tight">₹ {formatNum(comp.annualAmount)}</span>
                                            )}
                                        </td>
                                        {isEditing && (
                                            <td className="px-6 py-4 text-center">
                                                {!comp.isMandatory && (
                                                    <button
                                                        onClick={() => handleRemoveComponent(comp.id)}
                                                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                <tr className="bg-slate-50/50 font-black border-t border-slate-200">
                                    <td className="px-6 py-4 text-slate-700 text-xs">Total Retirals (B)</td>
                                    <td className="px-6 py-4 text-right text-slate-900 text-xs tracking-tight">₹ {formatMonthly(totalRetirals)}</td>
                                    <td className="px-6 py-4 text-right text-slate-900 text-sm tracking-tight">₹ {formatNum(totalRetirals)}</td>
                                    {isEditing && <td />}
                                </tr>

                                {/* C. Deductions (Only if added) */}
                                {components.some(c => c.type === 'deductions') && (
                                    <>
                                        <tr className="bg-rose-50/20">
                                            <td colSpan={isEditing ? 4 : 3} className="px-6 py-3 font-black text-rose-800 text-[10px] uppercase tracking-widest bg-rose-50/40 border-y border-rose-100/50">C. Deductions (Employee)</td>
                                        </tr>
                                        {components.filter(c => c.type === 'deductions').map(comp => (
                                            <tr key={comp.id} className="group hover:bg-slate-50/50 transition-colors text-rose-600">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold">{comp.name}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-medium tracking-tight">₹ {formatMonthly(comp.annualAmount)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {isEditing ? (
                                                        <div className="relative inline-block w-32">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-rose-300 font-bold">₹</span>
                                                            <input
                                                                type="number"
                                                                value={comp.annualAmount}
                                                                onChange={(e) => handleUpdateAmount(comp.id, parseInt(e.target.value) || 0)}
                                                                className="w-full pl-6 pr-2 py-1.5 bg-white border border-rose-100 rounded-md text-right font-black text-rose-700 focus:outline-none focus:border-rose-300 transition-all text-xs"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className="font-black tracking-tight">₹ {formatNum(comp.annualAmount)}</span>
                                                    )}
                                                </td>
                                                {isEditing && (
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => handleRemoveComponent(comp.id)}
                                                            className="p-1.5 text-rose-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </>
                                )}
                            </tbody>
                            <tfoot className="bg-slate-900 text-white font-black overflow-hidden rounded-b-2xl">
                                <tr>
                                    <td className="px-6 py-6 text-sm">Total Cost to Company (A + B)</td>
                                    <td className="px-6 py-6 text-right text-sm border-l border-white/5">₹ {formatMonthly(totalCtc)}</td>
                                    <td className="px-6 py-6 text-right text-2xl tracking-tighter border-l border-white/5">₹ {formatNum(totalCtc)}</td>
                                    {isEditing && <td />}
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {isEditing && (
                        <div className="relative">
                            <button
                                onClick={handleAddComponent}
                                className="mt-4 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Plus size={18} className="group-hover:scale-110 transition-transform" />
                                Add Salary Component
                            </button>

                            {isPickerOpen && (
                                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[120] animate-in slide-in-from-bottom-2 duration-300 max-h-[300px] flex flex-col">
                                    <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Search components..."
                                                value={pickerSearch}
                                                onChange={(e) => setPickerSearch(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-400 transition-all"
                                                autoFocus
                                            />
                                        </div>
                                        <button onClick={() => setIsPickerOpen(false)} className="ml-2 p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                                        {availableComponents.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-1">
                                                {['Earnings', 'Reimbursements', 'Deductions', 'Benefits'].map(category => {
                                                    const categoryItems = availableComponents.filter(c => c.category === category);
                                                    if (categoryItems.length === 0) return null;
                                                    return (
                                                        <div key={category} className="mb-2">
                                                            <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">{category}</div>
                                                            {categoryItems.map(cc => (
                                                                <button
                                                                    key={cc.id}
                                                                    onClick={() => handleSelectComponent(cc)}
                                                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-sky-50 hover:text-sky-700 transition-all flex items-center justify-between group"
                                                                >
                                                                    <span className="text-xs font-bold text-slate-600 group-hover:text-sky-700">{cc.name}</span>
                                                                    <Plus size={14} className="opacity-0 group-hover:opacity-100 text-sky-400" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-slate-400 text-xs italic">
                                                No more components found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-8 flex items-start gap-4 p-5 bg-sky-50/50 rounded-2xl border border-sky-100/50 shadow-sm shadow-sky-50">
                        <div className="p-2 bg-white rounded-xl shadow-sm border border-sky-100">
                            <Info size={16} className="text-sky-600" />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                            <span className="font-bold text-sky-700 uppercase tracking-widest text-[9px] block mb-1">Calculation Method: {structureName}</span>
                            Editing components here will create a <span className="font-bold text-slate-700 italic">custom structure</span> specifically for this employee. Ensure manual edits comply with your company policy and local labor laws.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-2.5 bg-sky-600 text-white rounded-xl font-bold text-sm hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 flex items-center gap-2"
                    >
                        <Save size={18} />
                        Update Annexure
                    </button>
                </div>
            </div>
        </div>
    );
};

const AssignStructureModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds: string[];
    employees: Employee[];
}> = ({ isOpen, onClose, preSelectedIds, employees }) => {
    const [step, setStep] = useState(1);

    // Selection & Data States
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [assignments, setAssignments] = useState<Record<string, string>>({});
    const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [availableStructures, setAvailableStructures] = useState<string[]>(STRUCTURE_OPTIONS);

    useEffect(() => {
        const fetchStructures = async () => {
            const { data, error } = await supabase
                .from('salary_structures')
                .select('name');
            if (data && !error) {
                setAvailableStructures(data.map(s => s.name));
            }
        };
        fetchStructures();
    }, []);

    // Step 2 Data
    const [ctcValues, setCtcValues] = useState<Record<string, string>>({});
    const [arrearsDefaults, setArrearsDefaults] = useState<Record<string, string>>({});
    const [componentOverrides, setComponentOverrides] = useState<Record<string, SalaryComponent[]>>({});

    // Preview State
    const [previewEmployee, setPreviewEmployee] = useState<Employee | null>(null);

    // Filters (Step 1)
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [locFilter, setLocFilter] = useState('All');

    // Mock Current Data
    const [currentStructures] = useState<Record<string, string>>(() => {
        const map: Record<string, string> = {};
        employees.forEach((e, i) => {
            map[e.id] = i % 4 === 0 ? "Standard IT 2025" : i % 4 === 1 ? "Not Assigned" : i % 4 === 2 ? "Startup Flexi" : "Contractor Monthly";
        });
        return map;
    });

    const departments = useMemo(() => ['All', ...Array.from(new Set(employees.map(e => e.department)))], [employees]);
    const locations = useMemo(() => ['All', ...Array.from(new Set(employees.map(e => e.location)))], [employees]);

    useEffect(() => {
        if (isOpen) {
            setSelectedIds(preSelectedIds);
            setStep(1); // Reset to step 1 on open
            setCtcValues({});
        }
    }, [isOpen, preSelectedIds]);

    if (!isOpen) return null;

    // --- Logic Helpers ---

    const handleClose = () => {
        setStep(1);
        onClose();
    };

    const filteredEmployees = employees.filter(e => {
        const matchesSearch = `${e.first_name} ${e.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) || e.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = deptFilter === 'All' || e.department === deptFilter;
        const matchesLoc = locFilter === 'All' || e.location === locFilter;
        return matchesSearch && matchesDept && matchesLoc;
    });

    const selectedEmployeesList = employees.filter(e => selectedIds.includes(e.id));

    // Step 1 Handlers
    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filteredEmployees.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredEmployees.map(e => e.id));
        }
    };

    const handleAssignmentChange = (id: string, value: string) => {
        setAssignments(prev => ({ ...prev, [id]: value }));
        if (!selectedIds.includes(id)) {
            handleToggleSelect(id);
        }
    };

    const handleBulkAssign = (value: string) => {
        if (!value) return;
        const newAssignments = { ...assignments };
        selectedIds.forEach(id => {
            newAssignments[id] = value;
        });
        setAssignments(newAssignments);
    };

    // Step 2 Handlers
    const handleCtcChange = (id: string, val: string) => {
        setCtcValues(prev => ({ ...prev, [id]: val }));
    };

    const calculateMonthly = (ctc: string) => {
        const val = parseFloat(ctc);
        if (!val || isNaN(val)) return '-';
        return (val / 12).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
    };

    const calculateTDS = (ctc: string, regime: 'OLD' | 'NEW') => {
        const annualIncome = parseFloat(ctc);
        if (!annualIncome || isNaN(annualIncome)) return '-';

        let tax = 0;
        let taxableIncome = annualIncome;

        if (regime === 'OLD') {
            // Simplified Old Regime Logic (Standard Deduction 50k)
            taxableIncome = Math.max(0, taxableIncome - 50000);

            if (taxableIncome > 1000000) {
                tax += (taxableIncome - 1000000) * 0.30;
                taxableIncome = 1000000;
            }
            if (taxableIncome > 500000) {
                tax += (taxableIncome - 500000) * 0.20;
                taxableIncome = 500000;
            }
            if (taxableIncome > 250000) {
                tax += (taxableIncome - 250000) * 0.05;
            }
        } else {
            // New Regime FY 25-26 (Standard Deduction 75k)
            taxableIncome = Math.max(0, taxableIncome - 75000);

            // Slabs: 0-4 (0), 4-8 (5), 8-12 (10), 12-16 (15), 16-20 (20), 20-24 (25), >24 (30)
            if (taxableIncome > 2400000) { tax += (taxableIncome - 2400000) * 0.30; taxableIncome = 2400000; }
            if (taxableIncome > 2000000) { tax += (taxableIncome - 2000000) * 0.25; taxableIncome = 2000000; }
            if (taxableIncome > 1600000) { tax += (taxableIncome - 1600000) * 0.20; taxableIncome = 1600000; }
            if (taxableIncome > 1200000) { tax += (taxableIncome - 1200000) * 0.15; taxableIncome = 1200000; }
            if (taxableIncome > 800000) { tax += (taxableIncome - 800000) * 0.10; taxableIncome = 800000; }
            if (taxableIncome > 400000) { tax += (taxableIncome - 400000) * 0.05; }
        }

        // Cess 4%
        const totalTax = Math.round(tax * 1.04);
        return totalTax > 0 ? totalTax.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : 'Nil';
    };

    const handleConfirmAssignment = async () => {
        setIsLoading(true);
        try {
            for (const id of selectedIds) {
                const structureName = assignments[id];
                const ctcValue = ctcValues[id];

                if (!structureName) continue;

                // Find structure ID
                const { data: structData } = await supabase
                    .from('salary_structures')
                    .select('id')
                    .eq('name', structureName)
                    .single();

                const { error } = await supabase
                    .from('employees')
                    .update({
                        salary_structure_id: structData?.id,
                        ctc: ctcValue,
                        effective_date: effectiveDate
                    })
                    .eq('id', id);

                if (error) throw error;
            }
            setStep(3);
        } catch (error) {
            console.error('Error in handleConfirmAssignment:', error);
            alert('Failed to save assignments. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- RENDER STEP 3: SUCCESS ---
    if (step === 3) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-800">Confirmation</h3>
                        <button onClick={handleClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                    </div>
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle size={32} strokeWidth={3} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Structure Assigned Successfully!</h2>
                        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                            The salary structure <strong className="text-slate-700">{selectedEmployeesList.length > 0 ? assignments[selectedEmployeesList[0].id] || 'Selected Structure' : 'Structure'}</strong> has been assigned to <strong className="text-slate-700">{selectedIds.length} employees</strong>. Changes will be reflected in the {effectiveDate} payroll cycle.
                        </p>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                        <button
                            onClick={handleClose}
                            className="px-8 py-2.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-colors shadow-sm"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER STEP 2: CTC CONFIGURATION ---
    if (step === 2) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Configure Salary Details</h3>
                            <p className="text-xs text-slate-500">Step 2: Define CTC for selected employees</p>
                        </div>
                        <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded-full"><X size={20} /></button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-auto bg-white p-6">
                        {/* Info Banner */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 mb-6">
                            <div className="p-1 bg-blue-100 rounded text-blue-600 mt-0.5"><Calculator size={16} /></div>
                            <p className="text-sm text-blue-700">Enter the <span className="font-bold">Annual CTC</span> for each employee. Monthly gross and TDS estimates will be calculated automatically.</p>
                        </div>

                        {/* Table */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-4">Employee</th>
                                        <th className="px-4 py-4">Joining Date</th>
                                        <th className="px-4 py-4">Salary Structure</th>
                                        <th className="px-4 py-4">Annual CTC <span className="text-rose-500">*</span></th>
                                        <th className="px-4 py-4 text-right">Monthly Gross</th>
                                        <th className="px-4 py-4 text-center">Proposed TDS<br /><span className="text-[9px] font-normal text-slate-400">(Old Regime)</span></th>
                                        <th className="px-4 py-4 text-center">Proposed TDS<br /><span className="text-[9px] text-purple-600 font-bold">(New Regime)</span></th>
                                        <th className="px-4 py-4">Arrears Payout</th>
                                        <th className="px-4 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedEmployeesList.map(emp => (
                                        <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="font-bold text-slate-800">{emp.first_name} {emp.last_name}</div>
                                                <div className="text-xs text-slate-500">{emp.employee_id}</div>
                                            </td>
                                            <td className="px-4 py-4 text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    {emp.date_of_joining}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-100 text-xs font-semibold">
                                                    {assignments[emp.id] || 'Not Assigned'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                    <input
                                                        type="number"
                                                        placeholder="e.g. 1200000"
                                                        value={ctcValues[emp.id] || ''}
                                                        onChange={(e) => handleCtcChange(emp.id, e.target.value)}
                                                        className="w-36 pl-6 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-medium text-slate-700">
                                                {calculateMonthly(ctcValues[emp.id])}
                                            </td>
                                            <td className="px-4 py-4 text-center text-slate-600 font-medium">
                                                {calculateTDS(ctcValues[emp.id], 'OLD')}
                                            </td>
                                            <td className="px-4 py-4 text-center text-purple-700 font-bold">
                                                {calculateTDS(ctcValues[emp.id], 'NEW')}
                                            </td>
                                            <td className="px-4 py-4">
                                                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-purple-500 cursor-pointer">
                                                    <option>Nov 2025</option>
                                                    <option>Dec 2025</option>
                                                    <option>Jan 2026</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <button
                                                    onClick={() => setPreviewEmployee(emp)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="View Annexure Preview"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between items-center">
                        <div>
                            <button onClick={() => setStep(1)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium text-sm flex items-center gap-2 transition-colors">
                                <ChevronLeft size={16} /> Back
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm">
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAssignment}
                                disabled={isLoading}
                                className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-colors text-sm flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : <CheckCircle size={18} />}
                                Confirm Assignment
                            </button>
                        </div>
                    </div>
                </div>

                {/* Annexure Preview Modal */}
                {previewEmployee && (
                    <SalaryAnnexureModal
                        isOpen={!!previewEmployee}
                        onClose={() => setPreviewEmployee(null)}
                        employee={previewEmployee}
                        annualCtc={parseFloat(ctcValues[previewEmployee.id] || '0')}
                        structureName={assignments[previewEmployee.id] || 'Standard'}
                        initialComponents={componentOverrides[previewEmployee.id]}
                        onSave={(newComponents) => {
                            setComponentOverrides(prev => ({
                                ...prev,
                                [previewEmployee.id]: newComponents
                            }));
                            // Update the CTC value in the main table to reflect the sum of custom components
                            const newTotal = newComponents.reduce((sum, c) => sum + c.annualAmount, 0);
                            setCtcValues(prev => ({
                                ...prev,
                                [previewEmployee.id]: newTotal.toString()
                            }));
                        }}
                    />
                )}
            </div>
        );
    }

    // --- RENDER STEP 1: SELECTION ---
    const activeAssignmentCount = Object.keys(assignments).filter(id => selectedIds.includes(id) && assignments[id]).length;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Assign Salary Structure</h3>
                        <p className="text-xs text-slate-500">Configure payroll structures and effective dates for employees</p>
                    </div>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded-full"><X size={20} /></button>
                </div>

                {/* Body Content */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Toolbar: Search & Filters */}
                    <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center bg-white">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search employee..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            />
                        </div>

                        {/* Department Filter */}
                        <div className="relative min-w-[160px]">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <select
                                value={deptFilter}
                                onChange={e => setDeptFilter(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 appearance-none focus:outline-none focus:border-purple-500 cursor-pointer"
                            >
                                {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>

                        {/* Location Filter */}
                        <div className="relative min-w-[160px]">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <select
                                value={locFilter}
                                onChange={e => setLocFilter(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 appearance-none focus:outline-none focus:border-purple-500 cursor-pointer"
                            >
                                {locations.map(l => <option key={l} value={l}>{l === 'All' ? 'All Locations' : l}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>
                    </div>

                    {/* Bulk Action Bar - Visible when multiple rows selected */}
                    {selectedIds.length > 1 && (
                        <div className="bg-purple-50 px-6 py-2 border-b border-purple-100 flex items-center justify-between animate-in slide-in-from-top-2">
                            <span className="text-sm font-bold text-purple-800 flex items-center gap-2">
                                <CheckCircle size={16} /> {selectedIds.length} Employees Selected
                            </span>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Bulk Assign Structure:</span>
                                <div className="relative">
                                    <select
                                        onChange={(e) => handleBulkAssign(e.target.value)}
                                        className="pl-3 pr-8 py-1.5 border border-purple-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select Structure...</option>
                                        {STRUCTURE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="flex-1 overflow-auto bg-white relative">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase sticky top-0 z-10 border-b border-slate-200 shadow-sm">
                                <tr>
                                    <th className="px-6 py-3 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            checked={filteredEmployees.length > 0 && selectedIds.length === filteredEmployees.length}
                                            onChange={handleSelectAll}
                                            className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer w-4 h-4"
                                        />
                                    </th>
                                    <th className="px-6 py-3">EMPLOYEE ID</th>
                                    <th className="px-6 py-3">NAME</th>
                                    <th className="px-6 py-3">DEPARTMENT</th>
                                    <th className="px-6 py-3">CURRENT STRUCTURE</th>
                                    <th className="px-6 py-3">ASSIGNED STRUCTURE</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredEmployees.map(emp => {
                                    const isSelected = selectedIds.includes(emp.id);
                                    return (
                                        <tr key={emp.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-purple-50/10' : ''}`}>
                                            <td className="px-6 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleSelect(emp.id)}
                                                    className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer w-4 h-4"
                                                />
                                            </td>
                                            <td className="px-6 py-3 font-mono text-slate-700 font-semibold">{emp?.employee_id || 'N/A'}</td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    {emp?.avatar_url ? (
                                                        <img src={emp.avatar_url} alt="" className="w-9 h-9 rounded-full border border-slate-200 object-cover" />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                                                            <Users size={14} />
                                                        </div>
                                                    )}
                                                    <div className="font-bold text-slate-800">{emp?.first_name || 'N/A'} {emp?.last_name || ''}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-slate-600">{emp.department}</td>
                                            <td className="px-6 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${currentStructures[emp.id] === 'Not Assigned'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                                    }`}>
                                                    {currentStructures[emp.id]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="relative w-full max-w-[220px]">
                                                    <select
                                                        value={assignments[emp.id] || ''}
                                                        onChange={(e) => handleAssignmentChange(emp.id, e.target.value)}
                                                        className={`w-full pl-3 pr-8 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer transition-colors ${assignments[emp.id]
                                                            ? 'border-purple-200 bg-purple-50 text-purple-900 font-medium'
                                                            : 'border-slate-200 bg-white text-slate-500'
                                                            }`}
                                                    >
                                                        <option value="">Select Structure...</option>
                                                        {STRUCTURE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredEmployees.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400">No employees found matching filters.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Effective Date Section */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-bold text-slate-700">Effective From:</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar className="text-purple-600" size={16} />
                                </div>
                                <input
                                    type="date"
                                    value={effectiveDate}
                                    onChange={(e) => setEffectiveDate(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                                />
                            </div>
                            <span className="text-xs text-slate-500 ml-2">Changes will be applicable for payroll runs from this date onwards.</span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between items-center">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                        <Briefcase size={16} />
                        <span className="text-xs font-bold">Assigning salary structures to {activeAssignmentCount} employees</span>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={handleClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm">
                            Cancel
                        </button>
                        <button onClick={handleClose} className="px-5 py-2.5 bg-purple-50 text-purple-700 font-bold rounded-xl hover:bg-purple-100 transition-colors text-sm flex items-center gap-2 border border-purple-100">
                            <Clock size={16} /> Save as Draft
                        </button>
                        <button
                            onClick={() => setStep(2)}
                            disabled={activeAssignmentCount === 0}
                            className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircle size={18} /> Assign Structures
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Fixed: Added missing EmployeeListProps interface to resolve the "Cannot find name 'EmployeeListProps'" error.
interface EmployeeListProps {
    onEdit: (id: string) => void;
    onView: (id: string) => void;
    userRole?: string;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ onEdit, onView, userRole }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // FIELDS configuration for Lookup Filter
    const FIELDS = [
        { name: 'Status', icon: CheckSquare },
        { name: 'Department', icon: Building },
        { name: 'Designation', icon: Briefcase },
        { name: 'Business Unit', icon: MapPin },
        { name: 'CTC Status', icon: Calculator },
        { name: 'Salary Structure', icon: CheckCircle },
        { name: 'Employee', icon: Users },
        { name: 'PF Applicable?', icon: CheckSquare },
        { name: 'ESI Applicable?', icon: CheckSquare },
        { name: 'LWF Applicable?', icon: CheckSquare },
        { name: 'NPS Applicable?', icon: CheckSquare },
        { name: 'Gratuity Applicable?', icon: CheckSquare }
    ];

    // Lookup Filter States for HR Manager
    const [completedFilters, setCompletedFilters] = useState<any[]>([]);
    const [currentField, setCurrentField] = useState<string | null>(null);
    const [currentOperator, setCurrentOperator] = useState<string | null>(null);
    const [tempValues, setTempValues] = useState<string[]>([]);
    const [tempContainsText, setTempContainsText] = useState('');
    const [valSearchQuery, setValSearchQuery] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Click outside hook
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getOptionsForField = (field: string) => {
        if (field === 'Status') {
            return ['Active', 'Relieved'];
        }
        if (field === 'CTC Status') {
            return ['Assigned', 'Pending'];
        }
        if ([
            'PF Applicable?',
            'ESI Applicable?',
            'LWF Applicable?',
            'NPS Applicable?',
            'Gratuity Applicable?'
        ].includes(field)) {
            return ['Yes', 'No'];
        }
        
        // Extract unique values from employee list
        const uniqueValues = new Set<string>();
        (employees || []).forEach(emp => {
            if (field === 'Department' && emp.department) uniqueValues.add(emp.department);
            if (field === 'Designation' && emp.designation) uniqueValues.add(emp.designation);
            if (field === 'Business Unit' && emp.business_unit) uniqueValues.add(emp.business_unit);
            if (field === 'Salary Structure') uniqueValues.add(emp.salary_structure_name || 'Standard');
            if (field === 'Employee') uniqueValues.add(`${emp.first_name || ''} ${emp.last_name || ''}`.trim());
        });
        
        return Array.from(uniqueValues).filter(Boolean).sort();
    };

    const selectField = (field: string) => {
        setCurrentField(field);
        setCurrentOperator(null);
        setTempValues([]);
        setValSearchQuery('');
    };

    const selectOperator = (operator: string) => {
        setCurrentOperator(operator);
        setTempValues([]);
        setValSearchQuery('');
    };

    const toggleTempValue = (val: string) => {
        setTempValues(prev => 
            prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
        );
    };

    const applyCurrentFilter = () => {
        if (currentField && currentOperator) {
            const vals = currentOperator === 'Contains' ? [tempContainsText] : tempValues;
            if (vals.length > 0 && (currentOperator !== 'Contains' || vals[0].trim() !== '')) {
                setCompletedFilters(prev => [
                    ...prev,
                    {
                        id: Math.random().toString(),
                        field: currentField,
                        operator: currentOperator,
                        values: vals
                    }
                ]);
                setCurrentField(null);
                setCurrentOperator(null);
                setTempValues([]);
                setTempContainsText('');
                setValSearchQuery('');
                setDropdownOpen(false);
            }
        }
    };

    const cancelCurrentFilter = () => {
        setCurrentField(null);
        setCurrentOperator(null);
        setTempValues([]);
        setTempContainsText('');
        setValSearchQuery('');
        setDropdownOpen(false);
    };

    const removeFilter = (id: string) => {
        setCompletedFilters(prev => prev.filter(f => f.id !== id));
    };

    const clearAllFilters = () => {
        setCompletedFilters([]);
        cancelCurrentFilter();
        setSearchTerm('');
    };

    const fetchEmployees = async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
            // Attempt to fetch with join and parallel fetch of operational configs
            const [empRes, configRes] = await Promise.all([
                supabase
                    .from('employees')
                    .select('*, salary_structures(name)')
                    .order('name', { ascending: true }),
                supabase
                    .from('operational_config')
                    .select('config_key, config_value')
                    .like('config_key', 'emp_statutory:%')
            ]);

            let data = empRes.data;
            let error = empRes.error;

            // If the join fails (e.g., relationship missing in cache), fallback to separate fetches
            if (error && error.message.includes('relationship')) {
                console.warn('Relationship missing in schema cache, falling back to manual join');
                
                const [empResFallback, structRes] = await Promise.all([
                    supabase.from('employees').select('*').order('name', { ascending: true }),
                    supabase.from('salary_structures').select('id, name')
                ]);

                if (empResFallback.error) throw empResFallback.error;
                
                const structuresMap = (structRes.data || []).reduce((acc: any, s) => {
                    acc[s.id] = s.name;
                    return acc;
                }, {});

                data = (empResFallback.data || []).map(emp => ({
                    ...emp,
                    salary_structures: { name: structuresMap[emp.salary_structure_id] || 'Not Assigned' }
                }));
                error = null;
            }

            if (error) {
                console.error('Error fetching employees:', error);
                setFetchError(error.message);
            } else {
                const configMap: Record<string, any> = {};
                (configRes.data || []).forEach(row => {
                    const parts = row.config_key.split(':');
                    if (parts.length > 1) {
                        configMap[parts[1]] = row.config_value;
                    }
                });

                const mappedData: Employee[] = (data || []).map(item => {
                    let statutory = configMap[item.id] || null;
                    if (!statutory && item.statutory_deductions) {
                        try {
                            statutory = typeof item.statutory_deductions === 'string'
                                ? JSON.parse(item.statutory_deductions)
                                : item.statutory_deductions;
                        } catch (e) {
                            console.error('Error parsing statutory deductions:', e);
                        }
                    }

                    return {
                        id: item.id,
                        first_name: item.name || 'N/A',
                        last_name: '',
                        employee_id: item.eid,
                        company_id: item.company_id || '',
                        department: item.department || 'N/A',
                        designation: item.designation || 'N/A',
                        location: item.location || 'N/A',
                        ctc: item.ctc || 'N/A',
                        date_of_joining: item.join_date || 'N/A',
                        status: item.status || 'Active',
                        avatar_url: item.avatar_url,
                        email: item.email || '',
                        business_unit: item.business_unit || item.location || 'CollabCRM',
                        created_by: item.created_by || 'HR Manager',
                        last_modified_by: item.last_updated_by || item.created_by || 'HR Manager',
                        salary_structure_name: item.salary_structures?.name || 'Not Assigned',
                        statutory_deductions: statutory || undefined
                    };
                });
                setEmployees(mappedData);
            }
        } catch (err: any) {
            console.error('Unexpected error in fetchEmployees:', err);
            setFetchError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredEmployees = useMemo(() => {
        return (employees || []).filter(emp => {
            // First, apply text search (searchTerm)
            const matchesSearch = searchTerm ? (
                (emp?.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (emp?.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (emp?.department || '').toLowerCase().includes(searchTerm.toLowerCase())
            ) : true;

            if (!matchesSearch) return false;

            // Only apply completedFilters if userRole is HR_MANAGER
            if (userRole === 'HR_MANAGER') {
                for (const filter of completedFilters) {
                    let empValue = '';
                    if (filter.field === 'Status') empValue = emp.status || '';
                    else if (filter.field === 'Department') empValue = emp.department || '';
                    else if (filter.field === 'Designation') empValue = emp.designation || '';
                    else if (filter.field === 'Business Unit') empValue = emp.business_unit || '';
                    else if (filter.field === 'Salary Structure') empValue = emp.salary_structure_name || 'Standard';
                    else if (filter.field === 'CTC Status') empValue = emp.salary_structure_name ? 'Assigned' : 'Pending';
                    else if (filter.field === 'Employee') empValue = `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
                    else if (filter.field === 'PF Applicable?') empValue = emp.statutory_deductions?.providentFund ? 'Yes' : 'No';
                    else if (filter.field === 'ESI Applicable?') empValue = emp.statutory_deductions?.esi ? 'Yes' : 'No';
                    else if (filter.field === 'LWF Applicable?') empValue = emp.statutory_deductions?.lwf ? 'Yes' : 'No';
                    else if (filter.field === 'NPS Applicable?') empValue = emp.statutory_deductions?.nps ? 'Yes' : 'No';
                    else if (filter.field === 'Gratuity Applicable?') empValue = emp.statutory_deductions?.gratuity ? 'Yes' : 'No';

                    const isMatch = filter.operator === 'Contains'
                        ? empValue.toLowerCase().includes(filter.values[0].toLowerCase())
                        : filter.values.some(val => val.toLowerCase() === empValue.toLowerCase());

                    if (filter.operator === 'Is' || filter.operator === 'Contains') {
                        if (!isMatch) return false;
                    } else { // 'Is not'
                        if (isMatch) return false;
                    }
                }
            }

            return true;
        });
    }, [employees, searchTerm, completedFilters, userRole]);

    const unassignedCtcCount = (employees || []).filter(emp => 
        !emp.salary_structure_name || emp.salary_structure_name === 'Not Assigned'
    ).length;

    const toggleSelection = (id: string) => {
        if (selectedEmployeeIds.includes(id)) {
            setSelectedEmployeeIds(prev => prev.filter(i => i !== id));
        } else {
            setSelectedEmployeeIds(prev => [...prev, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedEmployeeIds.length === filteredEmployees.length) {
            setSelectedEmployeeIds([]);
        } else {
            setSelectedEmployeeIds(filteredEmployees.map(e => e.id));
        }
    };

    return (
        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-300">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        Employees Compensation
                    </h1>
                    <p className="text-slate-500 mt-1">Manage employee profiles, salary structures and data.</p>
                </div>
                <div className="flex gap-2">
                    {/* Assign Salary Structure button temporarily removed for HR Manager */}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="flex gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-amber-200 transition-all cursor-default" style={{ width: '70%', maxWidth: '280px' }}>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform shrink-0">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">CTC Unassigned</p>
                        <h3 className="text-2xl font-black text-slate-800 leading-tight">{unassignedCtcCount}</h3>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">

                {/* Toolbar */}
                {userRole === 'HR_MANAGER' ? (
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center relative">
                        <div className="flex items-center gap-2 w-full flex-1">
                            <div className="relative flex-1" ref={dropdownRef}>
                                {/* Input-like container */}
                                <div 
                                    onClick={() => {
                                        setDropdownOpen(true);
                                        inputRef.current?.focus();
                                    }}
                                    className="w-full flex flex-wrap items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm min-h-[40px] focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 transition-all cursor-text pr-10"
                                >
                                    {/* Search icon (only if not building a filter, or we can always show it) */}
                                    {completedFilters.length === 0 && !currentField && (
                                        <Search className="h-4 w-4 text-slate-400 shrink-0" />
                                    )}

                                    {/* 1. Completed Filters Chips */}
                                    {completedFilters.map(filter => {
                                        const fObj = FIELDS.find(f => f.name === filter.field);
                                        const FIcon = fObj?.icon;
                                        return (
                                            <div 
                                                key={filter.id} 
                                                className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-0.5 text-xs font-semibold text-slate-700"
                                            >
                                                {FIcon && <FIcon size={12} className="text-slate-500" />}
                                                <span>{filter.field}</span>
                                                <span className="text-slate-400 font-bold lowercase text-[10px]">{filter.operator}</span>
                                                <span className="bg-slate-200/60 px-1 rounded text-slate-800 max-w-[120px] truncate">
                                                    {filter.values.join(', ')}
                                                </span>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); removeFilter(filter.id); }} 
                                                    className="ml-1 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        );
                                    })}

                                    {/* 2. In-Progress Filter Pills */}
                                    {currentField && (
                                        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-700">
                                            {(() => {
                                                const fObj = FIELDS.find(f => f.name === currentField);
                                                const FIcon = fObj?.icon;
                                                return FIcon ? <FIcon size={12} className="text-slate-500" /> : null;
                                            })()}
                                            <span>{currentField}</span>
                                        </div>
                                    )}

                                    {currentOperator && (
                                        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-1.5 py-0.5 text-xs font-bold text-slate-600">
                                            <span>{currentOperator}</span>
                                        </div>
                                    )}

                                    {/* 3. Text Input / Placeholder */}
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={currentField && currentOperator ? valSearchQuery : searchTerm}
                                        onChange={(e) => {
                                            if (currentField && currentOperator) {
                                                setValSearchQuery(e.target.value);
                                            } else {
                                                setSearchTerm(e.target.value);
                                                setDropdownOpen(false); // don't open field dropdown when typing normal search
                                            }
                                        }}
                                        placeholder={
                                            completedFilters.length === 0 && !currentField
                                                ? "Filter Results..."
                                                : currentField && currentOperator
                                                ? "Select..."
                                                : ""
                                        }
                                        className="flex-1 min-w-[60px] bg-transparent border-none outline-none text-slate-800 text-sm py-0.5 placeholder-slate-400 focus:ring-0 p-0"
                                    />

                                    {/* 4. Clear/Reset Button on the right of input container */}
                                    {(completedFilters.length > 0 || currentField || searchTerm) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clearAllFilters();
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                                        {!currentField && (
                                            <div className="py-1">
                                                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Field</div>
                                                {FIELDS.map(f => (
                                                    <button
                                                        key={f.name}
                                                        onClick={() => selectField(f.name)}
                                                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                                    >
                                                        <f.icon size={14} className="text-slate-400" />
                                                        <span>{f.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {currentField && !currentOperator && (
                                            <div className="py-1">
                                                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Condition</div>
                                                {(() => {
                                                    let ops = ['Is', 'Is not'];
                                                    if (currentField === 'Employee') {
                                                        ops = ['Is', 'Contains'];
                                                    } else if ([
                                                        'PF Applicable?',
                                                        'ESI Applicable?',
                                                        'LWF Applicable?',
                                                        'NPS Applicable?',
                                                        'Gratuity Applicable?'
                                                    ].includes(currentField)) {
                                                        ops = ['Is'];
                                                    }
                                                    return ops;
                                                })().map(op => (
                                                    <button
                                                        key={op}
                                                        onClick={() => selectOperator(op)}
                                                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                                    >
                                                        <div className="w-4 h-4 flex items-center justify-center font-mono text-xs font-bold text-slate-400">
                                                            {op === 'Is' ? '=' : op === 'Contains' ? '⊃' : '!='}
                                                        </div>
                                                        <span>{op}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {currentField && currentOperator && (
                                            <div className="flex flex-col max-h-[300px]">
                                                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                                                    Select values for {currentField}
                                                </div>
                                                {currentOperator === 'Contains' ? (
                                                    <div className="p-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Type employee name..."
                                                            value={tempContainsText}
                                                            onChange={(e) => setTempContainsText(e.target.value)}
                                                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500"
                                                            autoFocus
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* Search options input inside dropdown */}
                                                        <div className="p-2 border-b border-slate-100">
                                                            <input
                                                                type="text"
                                                                placeholder="Search values..."
                                                                value={valSearchQuery}
                                                                onChange={(e) => setValSearchQuery(e.target.value)}
                                                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500"
                                                            />
                                                        </div>
                                                        <div className="overflow-y-auto flex-1 py-1 max-h-[160px]">
                                                            {(() => {
                                                                const opts = getOptionsForField(currentField);
                                                                const filteredOpts = opts.filter(opt => 
                                                                    opt.toLowerCase().includes(valSearchQuery.toLowerCase())
                                                                );
                                                                if (filteredOpts.length === 0) {
                                                                    return <div className="px-3 py-2 text-xs text-slate-400 italic">No values found</div>;
                                                                }
                                                                return filteredOpts.map(opt => {
                                                                    const isChecked = tempValues.includes(opt);
                                                                    return (
                                                                        <label
                                                                            key={opt}
                                                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isChecked}
                                                                                onChange={() => toggleTempValue(opt)}
                                                                                className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer w-3.5 h-3.5"
                                                                            />
                                                                            <span>{opt}</span>
                                                                        </label>
                                                                    );
                                                                });
                                                            })()}
                                                        </div>
                                                    </>
                                                )}
                                                <div className="p-2 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                                    <button
                                                        onClick={cancelCurrentFilter}
                                                        className="px-2.5 py-1 text-[10px] text-slate-500 font-bold hover:text-slate-700 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={applyCurrentFilter}
                                                        disabled={currentOperator === 'Contains' ? tempContainsText.trim() === '' : tempValues.length === 0}
                                                        className="px-3 py-1 bg-purple-600 text-white text-[10px] font-bold rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
                                                    >
                                                        Done
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium flex items-center gap-2 shadow-sm shrink-0 h-[40px]"
                            >
                                <Filter size={16} /> Filter
                            </button>
                            <button 
                                onClick={() => setIsImportModalOpen(true)}
                                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white border border-transparent rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm shrink-0 h-[40px] transition-colors"
                            >
                                <Upload size={16} /> Import
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    placeholder="Search employees..."
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                />
                            </div>
                            <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium flex items-center gap-2 shadow-sm">
                                <Filter size={16} /> Filter
                            </button>
                            <button 
                                onClick={() => setIsImportModalOpen(true)}
                                className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white border border-transparent rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
                            >
                                <Upload size={16} /> Import
                            </button>
                        </div>

                        {selectedEmployeeIds.length > 0 && (
                            <div className="text-sm text-slate-600 font-medium animate-in fade-in">
                                {selectedEmployeeIds.length} employees selected
                            </div>
                        )}
                    </div>
                )}

                {/* Normal List View with Checkboxes */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                            <tr>

                                <th className="px-6 py-4">Employee ID</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Joining Date</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Designation</th>
                                <th className="px-6 py-4">Business Unit</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Salary Structure</th>
                                <th className="px-6 py-4">CTC Status</th>
                                <th className="px-6 py-4 whitespace-nowrap">PF Applicable?</th>
                                <th className="px-6 py-4 whitespace-nowrap">ESI Applicable?</th>
                                <th className="px-6 py-4 whitespace-nowrap">LWF Applicable?</th>
                                <th className="px-6 py-4 whitespace-nowrap">NPS Applicable?</th>
                                <th className="px-6 py-4 whitespace-nowrap">Gratuity Applicable?</th>

                                <th className="px-6 py-4">Created By</th>
                                <th className="px-6 py-4 whitespace-nowrap">Last Modified By</th>
                                <th className="sticky right-0 bg-slate-50 border-l border-slate-200 px-4 py-4 text-right z-20 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={18} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                            <span>Loading employees...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : fetchError ? (
                                <tr>
                                    <td colSpan={18} className="px-6 py-12 text-center text-rose-500 bg-rose-50/30">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertTriangle size={24} />
                                            <span className="font-bold">Error loading employees</span>
                                            <p className="text-xs text-rose-400">{fetchError}</p>
                                            <button onClick={() => fetchEmployees()} className="mt-2 px-4 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-200 transition-colors">Retry</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={18} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users size={24} className="text-slate-200" />
                                            <span>No employees found matching filters.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (filteredEmployees || []).map((emp) => (
                                <tr key={emp?.id || Math.random()} className={`hover:bg-slate-50 transition-colors group ${selectedEmployeeIds.includes(emp?.id || '') ? 'bg-purple-50/30' : ''}`}>

                                    <td className="px-6 py-4 font-mono text-slate-700 font-semibold">{emp?.employee_id || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {emp?.avatar_url ? (
                                                <img src={emp.avatar_url} alt="" className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 object-cover" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                                                    <Users size={14} />
                                                </div>
                                            )}
                                            <div className="font-semibold text-slate-800">{emp?.first_name || 'N/A'} {emp?.last_name || ''}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-slate-300" />
                                            {emp?.date_of_joining || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700">{emp?.department || 'N/A'}</td>
                                    <td className="px-6 py-4 text-slate-500 italic">{emp?.designation || 'N/A'}</td>
                                    <td className="px-6 py-4">{emp?.business_unit || 'CollabCRM'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${emp?.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                            {emp?.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-bold uppercase tracking-tight">
                                            {emp?.salary_structure_name || 'Standard'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-tight ${emp?.salary_structure_name ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                            {emp?.salary_structure_name ? 'Assigned' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold ${emp?.statutory_deductions?.providentFund ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                            {emp?.statutory_deductions?.providentFund ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold ${emp?.statutory_deductions?.esi ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                            {emp?.statutory_deductions?.esi ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold ${emp?.statutory_deductions?.lwf ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                            {emp?.statutory_deductions?.lwf ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold ${emp?.statutory_deductions?.nps ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                            {emp?.statutory_deductions?.nps ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold ${emp?.statutory_deductions?.gratuity ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                            {emp?.statutory_deductions?.gratuity ? 'Yes' : 'No'}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{emp?.created_by || 'HR Manager'}</td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{emp?.last_modified_by || 'HR Manager'}</td>
                                    <td className={`sticky right-0 border-l border-slate-200/80 px-4 py-4 text-right transition-colors z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] ${selectedEmployeeIds.includes(emp?.id || '') ? 'bg-[#faf8fd] group-hover:bg-[#f5f0fb]' : 'bg-white group-hover:bg-slate-50'}`}>
                                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => onView(emp?.id || '')} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors" title="View Profile"><Eye size={16} /></button>
                                            <button onClick={() => onEdit(emp?.id || '')} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors" title="Edit"><Edit2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AssignStructureModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                preSelectedIds={selectedEmployeeIds}
                employees={employees}
            />

            <ImportEmployeesModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImportSuccess={fetchEmployees}
            />
        </div>
    );
};

// ==========================================
// IMPORT EMPLOYEES MODAL COMPONENT
// ==========================================
interface ImportEmployeesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess?: () => void;
}

// Helper to extract value case-insensitively from Excel row object
const getExcelValue = (row: any, ...keys: string[]): any => {
    for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null) return row[key];
        
        const lowerKey = key.toLowerCase().trim();
        const foundKey = Object.keys(row).find(
            k => k.toLowerCase().trim() === lowerKey
        );
        if (foundKey !== undefined && row[foundKey] !== null) return row[foundKey];
    }
    return '';
};

// Formats arbitrary dates (serial, JS Date, or string) to YYYY-MM-DD
const formatDate = (val: any): string => {
    if (!val) return new Date().toISOString().split('T')[0];
    if (val instanceof Date) {
        return val.toISOString().split('T')[0];
    }
    if (typeof val === 'number') {
        const date = new Date((val - 25569) * 86400 * 1000);
        return date.toISOString().split('T')[0];
    }
    const str = String(val).trim();
    if (str.match(/^\d{4}-\d{2}-\d{2}$/)) return str;
    
    const parsed = Date.parse(str);
    if (!isNaN(parsed)) {
        return new Date(parsed).toISOString().split('T')[0];
    }
    return str;
};

// Formats numeric strings or numbers
const cleanNumber = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
};

// Status mapper to check constraints
const mapStatus = (val: any): string => {
    const str = String(val || '').trim();
    const valid = ['Active', 'New Joinee', 'On Notice', 'Relieved'];
    const matched = valid.find(v => v.toLowerCase() === str.toLowerCase());
    return matched || 'Active';
};

const ImportEmployeesModal: React.FC<ImportEmployeesModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Success and failure state for step 3 Results screen
    const [successCount, setSuccessCount] = useState(0);
    const [failureCount, setFailureCount] = useState(0);
    const [failedRecords, setFailedRecords] = useState<any[]>([]);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setFile(null);
            setParsedData([]);
            setIsUploading(false);
            setUploadProgress(0);
            setIsSaving(false);
            setSuccessCount(0);
            setFailureCount(0);
            setFailedRecords([]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleDownloadSample = async () => {
        const headers = [
            "Sr. No.",
            "Employee Code",
            "Employee Name",
            "Business Unit",
            "Salary Structure",
            "Annual CTC (₹)",
            "Basic Salary",
            "Child Education Allowance",
            "Child hostel allowance",
            "Conveyance Allowance",
            "Dearness Allowance (DA)",
            "House Rent Allowance (HRA)",
            "Meal Allowance",
            "Medical Allowance",
            "Professional Allowance",
            "Statutory Bonus",
            "Provident Fund (Employee)",
            "ESI (Employee)",
            "Gratuity",
            "Provident Fund (Employer)",
            "ESI (Employer)",
            "NPS",
            "Labour Welfare Fund (Employee)",
            "Labour Welfare Fund (Employer)",
            "Voluntary Provident Fund",
            "Professional Tax",
            "Effective From",
            "Provident Fund",
            "ESI",
            "Gratuity",
            "Labour Welfare Fund",
            "National Pension System",
            "PAN Number",
            "Aadhaar Number",
            "PF Number",
            "UAN Number",
            "ESI Number",
            "PRAN Number",
            "Tax Regime"
        ];
        
        const rows = [
            [
                1,
                "CO-059",
                "Sachin Tendulkar",
                "CollabCRM",
                "Executive Structure",
                1800000,
                720000, // Basic Salary
                2400,   // Child Education Allowance
                4800,   // Child hostel allowance
                19200,  // Conveyance Allowance
                0,      // Dearness Allowance (DA)
                288000, // House Rent Allowance (HRA)
                0,      // Meal Allowance
                0,      // Medical Allowance
                0,      // Professional Allowance
                0,      // Statutory Bonus
                21600,  // Provident Fund (Employee)
                0,      // ESI (Employee)
                34600,  // Gratuity
                21600,  // Provident Fund (Employer)
                0,      // ESI (Employer)
                0,      // NPS
                120,    // Labour Welfare Fund (Employee)
                240,    // Labour Welfare Fund (Employer)
                0,      // Voluntary Provident Fund
                2500,   // Professional Tax
                "2026-06-01",
                "Yes",
                "No",
                "Yes",
                "Yes",
                "No",
                "ABCDE1234F",
                "123456789012",
                "MH/BAN/1234567/123",
                "100987654321",
                "3112345678",
                "110098765432",
                "New Regime"
            ]
        ];

        // Create workbook & worksheet using ExcelJS
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Employees Compensation");
        const instructionsWorksheet = workbook.addWorksheet("Instructions");
        instructionsWorksheet.addRow(["Instructions:"]);
        instructionsWorksheet.addRow(["Please refer to subsequent prompts for detailed instructions."]);

        // Define columns
        worksheet.columns = headers.map(header => ({
            header,
            key: header,
            width: header.length + 5
        }));

        // Add rows
        rows.forEach(row => {
            worksheet.addRow(row);
        });

        // Set mandatory columns and style them (red text, bold)
        const mandatoryHeaders = [
            "Employee Code",
            "Employee Name",
            "Business Unit",
            "Salary Structure",
            "Annual CTC (₹)",
            "Effective From",
            "Provident Fund",
            "ESI",
            "Gratuity",
            "Labour Welfare Fund",
            "National Pension System",
            "PAN Number",
            "Tax Regime"
        ];

        // Format headers row
        const firstRow = worksheet.getRow(1);
        headers.forEach((header, index) => {
            const cell = firstRow.getCell(index + 1);
            if (mandatoryHeaders.includes(header)) {
                cell.font = {
                    name: 'Segoe UI',
                    size: 11,
                    bold: true,
                    color: { argb: 'FFFF0000' } // Red color
                };
            } else {
                cell.font = {
                    name: 'Segoe UI',
                    size: 11,
                    bold: true
                };
            }
        });

        // Add dropdown to Tax Regime column (col 39) for rows 2 to 100
        for (let rowNum = 2; rowNum <= 100; rowNum++) {
            const cell = worksheet.getCell(rowNum, 39);
            cell.dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: ['"Old Regime,New Regime"']
            };
        }

        // Generate buffer and trigger file download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "employees_compensation_sample.xlsx";
        anchor.click();
        window.URL.revokeObjectURL(url);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet);
                    setParsedData(jsonData);
                } catch (err) {
                    console.error("Error reading file:", err);
                }
            };
            reader.readAsArrayBuffer(selectedFile);
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!file) {
                alert("Please upload an Excel file to proceed.");
                return;
            }
            setStep(2);
            setIsUploading(true);
            setUploadProgress(0);
            
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                if (progress >= 100) {
                    setUploadProgress(100);
                    setIsUploading(false);
                    clearInterval(interval);
                } else {
                    setUploadProgress(progress);
                }
            }, 150);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(prev => prev - 1);
        }
    };

    const handleDownloadFailedRecords = () => {
        if (failedRecords.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(failedRecords);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Failed Records");
        XLSX.writeFile(wb, "employees_import_failed_records.xlsx");
    };

    const handleImport = async () => {
        setIsSaving(true);
        try {
            if (parsedData.length === 0) {
                alert("No employee data found in the uploaded file.");
                setIsSaving(false);
                return;
            }

            // 1. Fetch active structures
            const { data: structures } = await supabase.from('salary_structures').select('id, name');
            const structuresMap: Record<string, string> = {};
            if (structures) {
                structures.forEach(s => {
                    structuresMap[s.name.toLowerCase().trim()] = s.id;
                });
            }

            // 2. Fetch default company name
            const { data: companies } = await supabase.from('companies').select('name').limit(1);
            const companyName = companies?.[0]?.name || 'TechFlow Systems';

            // 3. Fetch existing employees to resolve IDs by EID
            const { data: existingEmps } = await supabase.from('employees').select('id, eid');
            const eidToIdMap: Record<string, string> = {};
            if (existingEmps) {
                existingEmps.forEach(e => {
                    eidToIdMap[e.eid] = e.id;
                });
            }

            // 4. Map rows and validate
            const employeesToUpsert: any[] = [];
            const configsToUpsert: any[] = [];
            const failures: any[] = [];

            parsedData.forEach(row => {
                const errors: string[] = [];
                
                const eid = String(getExcelValue(row, "Employee Code", "eid")).trim();
                const name = String(getExcelValue(row, "Employee Name", "name")).trim();
                const department = String(getExcelValue(row, "Department")).trim() || "N/A";
                const designation = String(getExcelValue(row, "Designation")).trim() || "N/A";
                const ctcVal = cleanNumber(getExcelValue(row, "Annual CTC (₹)", "ctc"));
                const effectiveFrom = getExcelValue(row, "Effective From", "join_date");
                
                const businessUnit = String(getExcelValue(row, "Business Unit", "location")).trim();
                const structureName = String(getExcelValue(row, "Salary Structure")).trim();
                const isPfStr = String(getExcelValue(row, "Provident Fund", "Provident Fund Applicable?")).trim();
                const isEsiStr = String(getExcelValue(row, "ESI", "ESI Applicable?")).trim();
                const isGratuityStr = String(getExcelValue(row, "Gratuity", "Gratuity Applicable?")).trim();
                const isLwfStr = String(getExcelValue(row, "Labour Welfare Fund", "Labour Welfare Fund Applicable?")).trim();
                const isNpsStr = String(getExcelValue(row, "National Pension System", "National Pension System Applicable?")).trim();
                const panNumber = String(getExcelValue(row, "PAN Number", "pan_no")).trim();
                const taxRegime = String(getExcelValue(row, "Tax Regime", "regime")).trim();

                if (!eid) errors.push("Employee Code is required");
                if (!name) errors.push("Employee Name is required");
                if (!businessUnit) errors.push("Business Unit is required");
                if (!structureName) errors.push("Salary Structure is required");
                if (ctcVal <= 0) errors.push("Annual CTC must be greater than 0");
                if (!effectiveFrom) errors.push("Effective From date is required");
                if (!isPfStr) errors.push("Provident Fund option is required (Yes/No)");
                if (!isEsiStr) errors.push("ESI option is required (Yes/No)");
                if (!isGratuityStr) errors.push("Gratuity option is required (Yes/No)");
                if (!isLwfStr) errors.push("Labour Welfare Fund option is required (Yes/No)");
                if (!isNpsStr) errors.push("National Pension System option is required (Yes/No)");
                if (!panNumber) errors.push("PAN Number is required");
                if (!taxRegime) errors.push("Tax Regime is required");

                if (errors.length > 0) {
                    failures.push({
                        ...row,
                        "Error Reason": errors.join(", ")
                    });
                    return; // skip this row for import
                }

                const employeeId = eidToIdMap[eid] || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15));
                const status = mapStatus(getExcelValue(row, "Status"));
                const formattedDate = formatDate(effectiveFrom);
                
                const isPf = isPfStr.toLowerCase() === "yes";
                const isEsi = isEsiStr.toLowerCase() === "yes";
                const isGratuity = isGratuityStr.toLowerCase() === "yes";
                const isLwf = isLwfStr.toLowerCase() === "yes";
                const isNps = isNpsStr.toLowerCase() === "yes";

                const aadhaarNumber = String(getExcelValue(row, "Aadhaar Number", "aadhaar_no")).trim();
                const pfNumber = String(getExcelValue(row, "PF Number", "pf_no")).trim();
                const uanNumber = String(getExcelValue(row, "UAN Number", "uan_no")).trim();
                const esiNumber = String(getExcelValue(row, "ESI Number", "esi_no")).trim();
                const pranNumber = String(getExcelValue(row, "PRAN Number", "pran_no")).trim();

                const structureId = structuresMap[structureName.toLowerCase()] || null;

                const statutoryDeductions = {
                    providentFund: isPf,
                    esi: isEsi,
                    professionalTax: true,
                    gratuity: isGratuity,
                    lwf: isLwf,
                    tds: true,
                    nps: isNps
                };

                employeesToUpsert.push({
                    id: employeeId,
                    name,
                    eid,
                    company_name: companyName,
                    department,
                    designation,
                    location: businessUnit,
                    ctc: String(ctcVal),
                    join_date: formattedDate,
                    status,
                    salary_structure_id: structureId,
                    effective_date: formattedDate,
                    tax_regime: taxRegime,
                    pan_no: panNumber,
                    aadhaar_no: aadhaarNumber,
                    uan_no: uanNumber,
                    business_unit: businessUnit,
                    annual_gross: ctcVal,
                    payroll_status: 'Eligible',
                    created_by: 'HR Manager',
                    last_updated_by: 'HR Manager'
                });

                configsToUpsert.push({
                    config_key: `emp_statutory:${employeeId}`,
                    config_value: {
                        ...statutoryDeductions,
                        pf_no: pfNumber,
                        esi_no: esiNumber,
                        pran_no: pranNumber,
                        arrears_payout_month: null,
                        appraisal_month: null,
                        salary_input_basis: "Gross CTC"
                    },
                    updated_at: new Date().toISOString()
                });
            });

            setSuccessCount(employeesToUpsert.length);
            setFailureCount(failures.length);
            setFailedRecords(failures);

            if (employeesToUpsert.length > 0) {
                // Upsert into Supabase
                const { error: empError } = await supabase.from('employees').upsert(employeesToUpsert, { onConflict: 'eid' });
                if (empError) throw empError;

                const { error: configError } = await supabase.from('operational_config').upsert(configsToUpsert, { onConflict: 'config_key' });
                if (configError) throw configError;
            }

            // 6. Refetch and advance step
            if (onImportSuccess) onImportSuccess();
            setStep(3);
        } catch (err: any) {
            console.error('Import process failed:', err);
            alert(`Error importing records: ${err.message || err}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                    <h3 className="text-lg font-bold text-slate-800">Import Employees Compensation</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Stepper */}
                <div className="border-b border-slate-100 py-4 bg-white select-none">
                    <div className="flex items-center justify-center max-w-xl mx-auto px-4">
                        {/* Step 1: Prepare */}
                        <div className="flex flex-col items-center relative">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 bg-white transition-all ${
                                step === 1 ? 'border-indigo-600' : 'border-indigo-600 text-indigo-600'
                            }`}>
                                {step === 1 ? (
                                    <div className="w-3.5 h-3.5 bg-indigo-600 rounded-full" />
                                ) : (
                                    <Check size={16} strokeWidth={3} />
                                )}
                            </div>
                            <span className={`text-xs mt-2 transition-all ${step === 1 ? 'font-bold text-indigo-600' : 'font-medium text-slate-400'}`}>
                                Prepare
                            </span>
                        </div>

                        {/* Line 1 */}
                        <div className={`h-[2px] flex-1 -mt-5 mx-2 transition-all ${step > 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />

                        {/* Step 2: Upload */}
                        <div className="flex flex-col items-center relative">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 bg-white transition-all ${
                                step === 2 ? 'border-indigo-600' : step > 2 ? 'border-indigo-600 text-indigo-600' : 'border-slate-300'
                            }`}>
                                {step === 2 ? (
                                    <div className="w-3.5 h-3.5 bg-indigo-600 rounded-full" />
                                ) : step > 2 ? (
                                    <Check size={16} strokeWidth={3} />
                                ) : null}
                            </div>
                            <span className={`text-xs mt-2 transition-all ${step === 2 ? 'font-bold text-indigo-600' : 'font-medium text-slate-400'}`}>
                                Upload
                            </span>
                        </div>

                        {/* Line 2 */}
                        <div className={`h-[2px] flex-1 -mt-5 mx-2 transition-all ${step > 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />

                        {/* Step 3: Results */}
                        <div className="flex flex-col items-center relative">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 bg-white transition-all ${
                                step === 3 ? 'border-indigo-600 text-indigo-600' : 'border-slate-300'
                            }`}>
                                {step === 3 ? (
                                    <Check size={16} strokeWidth={3} />
                                ) : null}
                            </div>
                            <span className={`text-xs mt-2 transition-all ${step === 3 ? 'font-bold text-indigo-600' : 'font-medium text-slate-400'}`}>
                                Results
                            </span>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 flex-grow relative min-h-[280px] bg-white">
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                            {/* Left Side */}
                            <div className="space-y-6 flex flex-col justify-center pr-0 md:pr-8">
                                <div className="text-sm text-slate-600">
                                    Download a{' '}
                                    <span 
                                        onClick={handleDownloadSample} 
                                        className="text-indigo-600 hover:underline cursor-pointer font-semibold"
                                    >
                                        Sample File
                                    </span>.
                                </div>
                                
                                <div>
                                    <button
                                        onClick={handleUploadClick}
                                        className="w-full py-4 text-center border border-indigo-200 bg-indigo-50/20 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50/50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        Upload Excel File <span className="text-rose-500">*</span>
                                    </button>
                                    <input 
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".csv,.xlsx,.xls"
                                    />
                                    {file && (
                                        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 animate-in fade-in">
                                            <Check className="text-emerald-600" size={14} strokeWidth={3} />
                                            Selected: <span className="font-semibold text-slate-700">{file.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dotted Vertical Divider */}
                            <div className="hidden md:block absolute left-1/2 top-8 bottom-8 border-l border-dashed border-slate-200" />

                            {/* Right Side */}
                            <div className="space-y-4 pl-0 md:pl-10 flex flex-col justify-center">
                                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Instructions:</h4>
                                <ul className="space-y-3 text-xs text-slate-500 font-medium leading-relaxed pl-4 list-disc">
                                    <li>Do not change the column names provided in the sample Excel template.</li>
                                    <li>Columns indicated in red color are mandatory fields.</li>
                                    <li>Ensure to follow correct data types for each column.</li>
                                    <li>Once the import is complete, verify that the data has been accurately imported. Cross-check a few records to ensure consistency.</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col items-center justify-center h-full min-h-[220px] animate-in fade-in duration-200">
                            {isUploading ? (
                                <div className="w-full space-y-8 p-4 animate-in fade-in duration-350">
                                    {/* Alert Banner */}
                                    <div className="w-full bg-blue-50/50 border border-blue-200 rounded-xl p-4 flex items-start gap-3.5 shadow-sm">
                                        <div className="p-1 bg-blue-100 rounded-full text-blue-600 shrink-0 mt-0.5">
                                            <Info size={18} />
                                        </div>
                                        <div className="text-sm text-blue-800 leading-relaxed font-medium">
                                            We're currently uploading your file <span className="font-bold font-mono">'{file?.name || 'employees_compensation_sample.xlsx'}'</span>.
                                            <br />
                                            <span className="text-blue-600 font-normal mt-0.5 block">Please be patient while we fully process your data. This could take some time to complete.</span>
                                        </div>
                                    </div>
                                    
                                    {/* Dotted Spinner */}
                                    <div className="flex justify-center items-center py-12">
                                        <div className="relative w-16 h-16 animate-spin">
                                            {[...Array(12)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="absolute w-2.5 h-2.5 bg-purple-500 rounded-full"
                                                    style={{
                                                        top: `${50 + 40 * Math.sin((i * 2 * Math.PI) / 12)}%`,
                                                        left: `${50 + 40 * Math.cos((i * 2 * Math.PI) / 12)}%`,
                                                        transform: 'translate(-50%, -50%)',
                                                        opacity: 0.15 + (i * 0.85) / 11,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 text-center animate-in fade-in">
                                    <div className="w-16 h-16 bg-violet-50 text-violet-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                        <Check size={28} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800">File Processed Successfully!</h4>
                                        <p className="text-sm text-slate-500 mt-2">File name: <span className="font-semibold text-slate-700 font-mono">{file?.name}</span></p>
                                        <p className="text-xs text-slate-400 mt-1">({file ? (file.size >= 1024 ? `${Math.round(file.size / 1024)} KB` : `${file.size} Bytes`) : '0 KB'} • Ready for DB integration)</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="w-full space-y-6 animate-in fade-in duration-300">
                            {/* Alert Banner */}
                            {failureCount > 0 ? (
                                <div className="w-full bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
                                    <div className="p-1 bg-amber-100 rounded-full text-amber-600 shrink-0">
                                        <Info size={18} />
                                    </div>
                                    <div className="text-sm font-semibold text-amber-800">
                                        Some records failed to import. Please review and correct them.
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
                                    <div className="p-1 bg-emerald-100 rounded-full text-emerald-600 shrink-0">
                                        <CheckCircle size={18} />
                                    </div>
                                    <div className="text-sm font-semibold text-emerald-800">
                                        All records imported successfully!
                                    </div>
                                </div>
                            )}

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Success Card */}
                                <div className="border border-slate-200 bg-white rounded-xl p-6 flex items-center gap-5 shadow-sm">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100/50 shrink-0">
                                        <Check size={28} strokeWidth={3} />
                                    </div>
                                    <div className="text-sm font-bold text-slate-700 leading-tight">
                                        {successCount} record(s) imported successfully.
                                    </div>
                                </div>

                                {/* Failure Card */}
                                <div className="border border-slate-200 bg-white rounded-xl p-6 flex flex-col justify-center gap-3 shadow-sm min-h-[110px]">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 border border-rose-100/50 shrink-0">
                                            <X size={28} strokeWidth={3} />
                                        </div>
                                        <div className="text-sm font-bold text-slate-700 leading-tight">
                                            {failureCount} record(s) failed to import.
                                        </div>
                                    </div>
                                    {failureCount > 0 && (
                                        <div className="pl-21">
                                            <button
                                                onClick={handleDownloadFailedRecords}
                                                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs transition-all flex items-center gap-2 mt-1 cursor-pointer"
                                            >
                                                <Download size={14} /> Download Failed Records
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isUploading && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                        {step === 1 && (
                            <>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm animate-in fade-in"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!file}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed animate-in fade-in"
                                >
                                    Next
                                </button>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <button
                                    onClick={handleBack}
                                    disabled={isSaving}
                                    className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-all text-sm disabled:opacity-50 animate-in fade-in"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={isUploading || isSaving}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all text-sm shadow-md disabled:opacity-50 animate-in fade-in"
                                >
                                    {isSaving ? 'Importing...' : 'Finish & Import'}
                                </button>
                            </>
                        )}

                        {step === 3 && (
                            <button
                                onClick={onClose}
                                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all text-sm shadow-md animate-in fade-in"
                            >
                                Done
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeList;
