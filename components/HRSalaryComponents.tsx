import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Download,
    X,
    Sigma,
    ChevronDown,
    Tag,
    FileText,
    Calculator,
    CheckCircle,
    Power,
    AlertTriangle,
    Check,
    Info,
    Lock,
    Building2
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface SalaryComponent {
    id: string;
    name: string;
    type: 'Fixed Pay' | 'Variable Pay';
    calculation: string;
    taxable: 'Fully Taxable' | 'Partially Exempt' | 'Fully Exempt' | 'Tax Deductible';
    status: boolean;
    category: 'Earnings' | 'Deductions' | 'Benefits' | 'Reimbursements';
    // Additional fields for editing context
    amountOrPercent?: string;
    calcMethod?: 'Flat' | 'Percentage';
    payslipName?: string;
    frequency?: 'One-time' | 'Recurring';
    // New fields for Earnings list view
    considerEPF?: boolean;
    considerESI?: boolean;
    lastModified?: string;
    created?: string;
    effectiveDate?: string;
    deductionType?: 'Statutory' | 'Non-Statutory';
    showInPayslip?: boolean;
    isSystem?: boolean;
    targetId?: string;
    targetType?: 'Paygroup' | 'BusinessUnit';
}

const BUSINESS_UNITS = [
    "MindInventory",
    "300 Minds",
    "CollabCRM"
];

interface AddEarningFormProps {
    onCancel: () => void;
    onSave: (data: Partial<SalaryComponent>) => void;
    initialData?: SalaryComponent | null;
    paygroups: any[];
    selectedTarget: string;
}

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmLabel: string;
    isDanger?: boolean;
}

// --- Mock Data ---
const INITIAL_DATA: SalaryComponent[] = [
    // Earnings
    {
        id: '1',
        name: 'Basic',
        type: 'Fixed Pay',
        calculation: '50% of CTC',
        taxable: 'Fully Taxable',
        status: true,
        category: 'Earnings',
        amountOrPercent: '50',
        calcMethod: 'Percentage',
        payslipName: 'Basic',
        considerEPF: true,
        considerESI: true,
        lastModified: 'By Kamlesh P.\nAt 6:38 PM, Nov 17, 2025',
        created: 'By Kamlesh P.\nAt 5:38 PM, Nov 17, 2025',
        effectiveDate: '2025-04-01'
    },
    {
        id: '2',
        name: 'House Rent Allowance',
        type: 'Fixed Pay',
        calculation: '50% of Basic',
        taxable: 'Partially Exempt',
        status: true,
        category: 'Earnings',
        amountOrPercent: '50',
        calcMethod: 'Percentage',
        payslipName: 'HRA',
        considerEPF: true,
        considerESI: true,
        lastModified: 'By Kamlesh P.\nAt 6:38 PM, Nov 17, 2025',
        created: 'By Kamlesh P.\nAt 5:38 PM, Nov 17, 2025',
        effectiveDate: '2025-04-01'
    },
    {
        id: '3',
        name: 'Fixed Allowance',
        type: 'Fixed Pay',
        calculation: 'Flat Rs. 5000',
        taxable: 'Fully Taxable',
        status: true,
        category: 'Earnings',
        amountOrPercent: '5000',
        calcMethod: 'Flat',
        payslipName: 'Special Allow',
        considerEPF: true,
        considerESI: true,
        lastModified: 'By Kamlesh P.\nAt 6:38 PM, Nov 17, 2025',
        created: 'By Kamlesh P.\nAt 5:38 PM, Nov 17, 2025'
    },
    {
        id: '4',
        name: 'Commission',
        type: 'Variable Pay',
        calculation: '10% of Basic',
        taxable: 'Partially Exempt',
        status: true,
        category: 'Earnings',
        amountOrPercent: '10',
        calcMethod: 'Percentage',
        payslipName: 'Commission',
        considerEPF: true,
        considerESI: true,
        lastModified: 'By Kamlesh P.\nAt 6:38 PM, Nov 17, 2025',
        created: 'By Kamlesh P.\nAt 5:38 PM, Nov 17, 2025'
    },

    // Deductions
    { 
        id: '7', 
        name: 'Professional Tax (PT)', 
        type: 'Variable Pay', 
        calculation: 'State Slab', 
        taxable: 'Tax Deductible', 
        status: true, 
        category: 'Deductions', 
        frequency: 'Recurring', 
        payslipName: 'Prof Tax',
        deductionType: 'Statutory',
        lastModified: 'By Admin\nAt 10:00 AM, Nov 11, 2025',
        created: 'By Admin\nAt 09:00 AM, Nov 11, 2025'
    },
    { 
        id: '8', 
        name: 'Provident Fund (Employee)', 
        type: 'Variable Pay', 
        calculation: '12% of Basic', 
        taxable: 'Tax Deductible', 
        status: true, 
        category: 'Deductions', 
        frequency: 'Recurring', 
        payslipName: 'EPF',
        deductionType: 'Statutory',
        lastModified: 'By Admin\nAt 10:00 AM, Nov 11, 2025',
        created: 'By Admin\nAt 09:00 AM, Nov 11, 2025'
    },
    { 
        id: '9', 
        name: 'Income Tax (TDS)', 
        type: 'Variable Pay', 
        calculation: 'As per Slab', 
        taxable: 'Tax Deductible', 
        status: true, 
        category: 'Deductions', 
        frequency: 'Recurring', 
        payslipName: 'TDS',
        deductionType: 'Statutory',
        lastModified: 'By Admin\nAt 10:00 AM, Nov 11, 2025',
        created: 'By Admin\nAt 09:00 AM, Nov 11, 2025'
    },
    { 
        id: '10', 
        name: 'Loan Repayment', 
        type: 'Fixed Pay', 
        calculation: 'Fixed EMI', 
        taxable: 'Tax Deductible', 
        status: false, 
        category: 'Deductions', 
        frequency: 'Recurring', 
        payslipName: 'Loan Recovery',
        deductionType: 'Non-Statutory',
        lastModified: 'By Admin\nAt 10:00 AM, Nov 11, 2025',
        created: 'By Admin\nAt 09:00 AM, Nov 11, 2025'
    },

    // Benefits (Data kept for future use, tab hidden)
    { id: '11', name: 'Provident Fund (Employer)', type: 'Variable Pay', calculation: '12% of Basic', taxable: 'Fully Exempt', status: true, category: 'Benefits' },

    // Reimbursements
    { 
        id: '14', 
        name: 'Medical Reimbursement', 
        type: 'Fixed Pay', 
        calculation: 'Up to ₹ 15,000', 
        taxable: 'Partially Exempt', 
        status: true, 
        category: 'Reimbursements', 
        amountOrPercent: '15000', 
        payslipName: 'Medical Reimb', 
        calcMethod: 'Flat',
        lastModified: 'By Admin\nAt 10:00 AM, Nov 11, 2025',
        created: 'By Admin\nAt 09:00 AM, Nov 11, 2025'
    },
    { 
        id: '15', 
        name: 'Fuel Reimbursement', 
        type: 'Variable Pay', 
        calculation: 'As per bills', 
        taxable: 'Partially Exempt', 
        status: true, 
        category: 'Reimbursements', 
        amountOrPercent: '0', 
        payslipName: 'Fuel', 
        calcMethod: 'Flat',
        lastModified: 'By Admin\nAt 10:00 AM, Nov 11, 2025',
        created: 'By Admin\nAt 09:00 AM, Nov 11, 2025'
    },
    { 
        id: '16', 
        name: 'Books & Periodicals', 
        type: 'Fixed Pay', 
        calculation: '₹ 1,000 / month', 
        taxable: 'Fully Exempt', 
        status: false, 
        category: 'Reimbursements', 
        amountOrPercent: '1000', 
        payslipName: 'Books', 
        calcMethod: 'Flat',
        lastModified: 'By Admin\nAt 10:00 AM, Nov 11, 2025',
        created: 'By Admin\nAt 09:00 AM, Nov 11, 2025'
    },
];

// --- Confirmation Modal ---
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmLabel, isDanger = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-t-4 border-slate-200" style={{ borderColor: isDanger ? '#e11d48' : '#f59e0b' }}>
                <div className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isDanger ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                        <AlertTriangle size={28} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
                    <div className="text-sm text-slate-500 mb-6">
                        {message}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium shadow-sm transition-colors ${isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-500 hover:bg-amber-600'}`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Detailed Add Earning Form ---
const AddEarningComponentForm: React.FC<AddEarningFormProps> = ({ onCancel, onSave, initialData, paygroups, selectedTarget }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [payslipName, setPayslipName] = useState(initialData?.payslipName || '');
    const [effectiveDate, setEffectiveDate] = useState(initialData?.effectiveDate || '');
    const [error, setError] = useState<string | null>(null);
    const [localSelectedTarget, setLocalSelectedTarget] = useState(() => {
        if (initialData?.targetId && initialData?.targetType) {
            const prefix = initialData.targetType === 'Paygroup' ? 'pg' : 'bu';
            return `${prefix}:${initialData.targetId}`;
        }
        return selectedTarget === 'all' ? '' : selectedTarget;
    });

    const [natureOfPay, setNatureOfPay] = useState<'Fixed' | 'Variable'>(
        initialData?.type === 'Variable Pay' ? 'Variable' : 'Fixed'
    );
    const [calcMethod, setCalcMethod] = useState<'Flat' | 'Percentage'>(
        initialData?.calcMethod || 'Flat'
    );
    const [amount, setAmount] = useState(initialData?.amountOrPercent || '');
    const [selectedComponents, setSelectedComponents] = useState<string[]>(['CTC']);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Configurations
    const [isTaxable, setIsTaxable] = useState(initialData?.taxable !== 'Fully Exempt');
    const [taxPreference, setTaxPreference] = useState('Subsequent');
    const [isProRata, setIsProRata] = useState(true);
    const [epfContribution, setEpfContribution] = useState<'Always' | 'Limit'>('Always');
    const [isConsiderEPF, setIsConsiderEPF] = useState(initialData?.considerEPF ?? true);
    const [isConsiderESI, setIsConsiderESI] = useState(initialData?.considerESI ?? true);
    const [showInPayslip, setShowInPayslip] = useState(true);
    const [isActive, setIsActive] = useState(initialData?.status ?? true);

    const handleSave = () => {
        if (!name) {
            setError('Component Name is mandatory');
            return;
        }
        if (!localSelectedTarget) {
            setError('Business Unit or Paygroup is mandatory');
            return;
        }
        setError(null);

        const updatedData: Partial<SalaryComponent> = {
            name,
            payslipName,
            effectiveDate,
            type: natureOfPay === 'Variable' ? 'Variable Pay' : 'Fixed Pay',
            calcMethod: natureOfPay === 'Fixed' ? calcMethod : undefined,
            amountOrPercent: natureOfPay === 'Fixed' ? amount : undefined,
            calculation: natureOfPay === 'Fixed'
                ? (calcMethod === 'Flat' ? `Flat ₹${amount}` : `${amount}% of ${selectedComponents.join(', ')}`)
                : 'Variable',
            taxable: isTaxable ? 'Fully Taxable' : 'Fully Exempt',
            considerEPF: isConsiderEPF,
            considerESI: isConsiderESI,
            status: isActive,
            category: 'Earnings'
        };

        const [targetTypeRaw, targetId] = localSelectedTarget.split(':');
        const targetType = targetTypeRaw === 'pg' ? 'Paygroup' : 'BusinessUnit';

        onSave({ ...updatedData, targetId, targetType });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-4 max-w-4xl w-full max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <h2 className="text-lg font-bold text-slate-800">{initialData ? 'Edit Earning Component' : 'Add Earning Component'}</h2>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto flex-1">
                    {/* Target Selection */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Associate with Business Unit or Paygroup <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <select
                                disabled
                                value={localSelectedTarget}
                                onChange={(e) => setLocalSelectedTarget(e.target.value)}
                                className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-slate-50 opacity-80 cursor-not-allowed text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 ${error && error.includes('Business Unit') ? 'border-rose-500' : 'border-slate-200'}`}
                            >
                                <option value="">Select a unit or paygroup</option>
                                <optgroup label="Business Units">
                                    {BUSINESS_UNITS.map(bu => (
                                        <option key={bu} value={`bu:${bu}`}>{bu}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Payroll Paygroups">
                                    {paygroups.map(pg => (
                                        <option key={pg.id} value={`pg:${pg.id}`}>
                                            {pg.name}
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                        {error && error.includes('Business Unit') && <p className="text-[10px] text-rose-500 mt-1">{error}</p>}
                    </div>

                    {/* Section 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Component Name <span className="text-rose-500">*</span></label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter Component Name" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Name in Payslip <span className="text-rose-500">*</span></label>
                            <input type="text" value={payslipName} onChange={e => setPayslipName(e.target.value)} placeholder="Enter Name in Payslip" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                        </div>
                        {initialData && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Effective Date</label>
                                <input type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-600" />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">Nature of Pay <span className="text-rose-500">*</span></label>
                        <div className="flex gap-6">
                            {['Fixed', 'Variable'].map((type) => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${natureOfPay === type ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {natureOfPay === type && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={natureOfPay === type} onChange={() => setNatureOfPay(type as any)} />
                                    <span className="text-sm text-slate-700 font-medium">{type} Pay</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Calculation Method - Visible for Both Fixed and Variable per request */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">Calculation Method <span className="text-rose-500">*</span></label>
                            <div className="flex items-center gap-6 h-[42px]">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${calcMethod === 'Flat' ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {calcMethod === 'Flat' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={calcMethod === 'Flat'} onChange={() => setCalcMethod('Flat')} />
                                    <span className="text-sm text-slate-700 font-medium">Flat Amount</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${calcMethod === 'Percentage' ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {calcMethod === 'Percentage' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={calcMethod === 'Percentage'} onChange={() => setCalcMethod('Percentage')} />
                                    <span className="text-sm text-slate-700 font-medium">Percentage of</span>
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        disabled={calcMethod !== 'Percentage'}
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="h-9 px-3 border border-slate-200 rounded text-sm text-slate-600 bg-slate-50 flex items-center gap-2 focus:outline-none focus:border-purple-500 disabled:opacity-50 min-w-[100px] justify-between"
                                    >
                                        <span className="truncate max-w-[80px]">
                                            {selectedComponents.length > 0 ? selectedComponents.join(', ') : 'Select'}
                                        </span>
                                        <ChevronDown size={14} className="text-slate-400" />
                                    </button>

                                    {isDropdownOpen && calcMethod === 'Percentage' && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setIsDropdownOpen(false)}
                                            />
                                            <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 max-h-48 overflow-y-auto hidden-scrollbar animate-in slide-in-from-top-2">
                                                {['CTC', 'Basic'].map(comp => (
                                                    <label key={comp} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedComponents.includes(comp)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedComponents([...selectedComponents, comp]);
                                                                } else {
                                                                    setSelectedComponents(selectedComponents.filter(c => c !== comp));
                                                                }
                                                            }}
                                                            className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                                        />
                                                        <span className="text-sm text-slate-700">{comp}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">{calcMethod === 'Percentage' ? 'Enter Percentage' : 'Enter Amount'} <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={calcMethod === 'Percentage' ? 'Enter Percentage' : 'Enter Amount'} className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                                <div className="absolute right-0 top-0 h-full px-3 bg-slate-100 border-l border-slate-200 rounded-r-lg flex items-center text-slate-500 font-medium text-sm">
                                    {calcMethod === 'Percentage' ? '%' : '₹'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isActive ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                {isActive && <Check size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={isActive} onChange={() => setIsActive(!isActive)} />
                            <span className="text-sm font-medium text-slate-700">Mark as Active</span>
                        </label>
                    </div>

                    <div className="pt-6 border-t border-slate-100 space-y-5">
                        <h3 className="font-bold text-slate-800 text-sm">Other Configurations</h3>

                        {/* Taxable */}
                        <div className="space-y-3">
                            <label className="flex items-start gap-2 cursor-pointer">
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isTaxable ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                    {isTaxable && <Check size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={isTaxable} onChange={() => setIsTaxable(!isTaxable)} />
                                <div>
                                    <span className="block text-sm font-bold text-slate-700">Taxable earning</span>
                                    <span className="block text-xs text-slate-500 mt-0.5">The income tax amount will be divided equally and deducted every month across the financial year.</span>
                                </div>
                            </label>

                            {/* Tax Deduction Preference for Variable Pay */}
                            {natureOfPay === 'Variable' && isTaxable && (
                                <div className="ml-7 space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Tax Deduction Preference <span className="text-rose-500">*</span></label>
                                    <div className="space-y-2">
                                        <label className="flex items-start gap-2 cursor-pointer">
                                            <div className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center transition-colors ${taxPreference === 'Subsequent' ? 'border-purple-600' : 'border-slate-300'}`}>
                                                {taxPreference === 'Subsequent' && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                                            </div>
                                            <input type="radio" className="hidden" checked={taxPreference === 'Subsequent'} onChange={() => setTaxPreference('Subsequent')} />
                                            <div>
                                                <span className="text-sm text-slate-700 font-medium">Deduct tax in subsequent payrolls of the financial year</span>
                                                <p className="text-xs text-slate-500">The income tax amount will be divided equally and deducted every month.</p>
                                            </div>
                                        </label>
                                        <label className="flex items-start gap-2 cursor-pointer">
                                            <div className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center transition-colors ${taxPreference === 'Same' ? 'border-purple-600' : 'border-slate-300'}`}>
                                                {taxPreference === 'Same' && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                                            </div>
                                            <input type="radio" className="hidden" checked={taxPreference === 'Same'} onChange={() => setTaxPreference('Same')} />
                                            <div>
                                                <span className="text-sm text-slate-700 font-medium">Deduct tax in same payroll</span>
                                                <p className="text-xs text-slate-500">The entire income tax amount will be deducted when it is paid.</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pro Rata */}
                        <label className="flex items-start gap-2 cursor-pointer">
                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isProRata ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                {isProRata && <Check size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={isProRata} onChange={() => setIsProRata(!isProRata)} />
                            <div>
                                <span className="block text-sm font-bold text-slate-700">Calculate on pro-rata basis</span>
                                <span className="block text-xs text-slate-500 mt-0.5">Pay will be adjusted based on employee working days.</span>
                            </div>
                        </label>

                        {/* EPF */}
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                            <label className="flex items-start gap-2 cursor-pointer">
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isConsiderEPF ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                    {isConsiderEPF && <Check size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={isConsiderEPF} onChange={() => setIsConsiderEPF(!isConsiderEPF)} />
                                <div>
                                    <span className="block text-sm font-bold text-slate-700">Consider for EPF Contribution</span>
                                    <span className="block text-xs text-slate-500 mt-0.5">Pay will be adjusted based on employee working days.</span>
                                </div>
                            </label>

                            {isConsiderEPF && (
                                <div className="flex gap-4 ml-7 md:ml-0">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${epfContribution === 'Always' ? 'border-purple-600' : 'border-slate-300'}`}>
                                            {epfContribution === 'Always' && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                                        </div>
                                        <input type="radio" className="hidden" checked={epfContribution === 'Always'} onChange={() => setEpfContribution('Always')} />
                                        <span className="text-sm text-slate-700 font-medium">Always</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${epfContribution === 'Limit' ? 'border-purple-600' : 'border-slate-300'}`}>
                                            {epfContribution === 'Limit' && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                                        </div>
                                        <input type="radio" className="hidden" checked={epfContribution === 'Limit'} onChange={() => setEpfContribution('Limit')} />
                                        <span className="text-sm text-slate-700 font-medium">Only when PF Wage is less than ₹ 15,000</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* ESI & Payslip */}
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isConsiderESI ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                {isConsiderESI && <Check size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={isConsiderESI} onChange={() => setIsConsiderESI(!isConsiderESI)} />
                            <span className="text-sm font-bold text-slate-700">Consider for ESI Contribution</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${showInPayslip ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                {showInPayslip && <Check size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={showInPayslip} onChange={() => setShowInPayslip(!showInPayslip)} />
                            <span className="text-sm font-bold text-slate-700">Show in Payslip</span>
                        </label>
                    </div>
                </div>

                <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                    <button onClick={onCancel} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm shadow-sm transition-colors">{initialData ? 'Update' : 'Save'}</button>
                </div>
            </div>
        </div>
    );
}

// --- Detailed Add Deduction Form ---
const AddDeductionComponentForm: React.FC<AddEarningFormProps> = ({ onCancel, onSave, initialData, paygroups, selectedTarget }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [payslipName, setPayslipName] = useState(initialData?.payslipName || '');
    const [frequency, setFrequency] = useState<'One-time' | 'Recurring'>(initialData?.frequency || 'One-time');
    const [isActive, setIsActive] = useState(initialData?.status ?? true);
    const [showInPayslip, setShowInPayslip] = useState(initialData?.showInPayslip ?? false);
    const [effectiveDate, setEffectiveDate] = useState(initialData?.effectiveDate || new Date().toISOString().split('T')[0]);
    const [deductionType, setDeductionType] = useState<'Statutory' | 'Non-Statutory'>(initialData?.deductionType || 'Statutory');
    const [error, setError] = useState<string | null>(null);

    const [localSelectedTarget, setLocalSelectedTarget] = useState(() => {
        if (initialData?.targetId && initialData?.targetType) {
            const prefix = initialData.targetType === 'Paygroup' ? 'pg' : 'bu';
            return `${prefix}:${initialData.targetId}`;
        }
        return selectedTarget === 'all' ? '' : selectedTarget;
    });

    // Calculation Method State
    const [calcMethod, setCalcMethod] = useState<'Flat' | 'Percentage'>(
        initialData?.calcMethod || 'Flat'
    );
    const [amountOrPercent, setAmountOrPercent] = useState(initialData?.amountOrPercent || '');
    const [selectedComponents, setSelectedComponents] = useState<string[]>(['CTC']);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleSave = () => {
        if (!name) {
            setError('Component Name is mandatory');
            return;
        }
        if (!localSelectedTarget) {
            setError('Business Unit or Paygroup is mandatory');
            return;
        }
        setError(null);

        const updatedData: Partial<SalaryComponent> = {
            name,
            payslipName,
            frequency,
            status: isActive,
            showInPayslip,
            effectiveDate,
            deductionType,
            calcMethod,
            amountOrPercent,
            type: 'Variable Pay',
            category: 'Deductions',
            calculation: calcMethod === 'Flat' ? `Flat ₹${amountOrPercent}` : `${amountOrPercent}% of ${selectedComponents.join(', ')}`,
            taxable: 'Tax Deductible',
        };

        const [targetTypeRaw, targetId] = localSelectedTarget.split(':');
        const targetType = targetTypeRaw === 'pg' ? 'Paygroup' : 'BusinessUnit';

        onSave({ ...updatedData, targetId, targetType });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-4 max-w-4xl w-full max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <h2 className="text-lg font-bold text-slate-800">{initialData ? 'Edit Deduction Component' : 'Add Deduction Component'}</h2>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                </div>
                <div className="p-8 space-y-6 overflow-y-auto flex-1">
                    {/* Target Selection */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Associate with Business Unit or Paygroup <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <select
                                disabled
                                value={localSelectedTarget}
                                onChange={(e) => setLocalSelectedTarget(e.target.value)}
                                className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-slate-50 opacity-80 cursor-not-allowed text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 ${error && error.includes('Business Unit') ? 'border-rose-500' : 'border-slate-200'}`}
                            >
                                <option value="">Select a unit or paygroup</option>
                                <optgroup label="Business Units">
                                    {BUSINESS_UNITS.map(bu => (
                                        <option key={bu} value={`bu:${bu}`}>{bu}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Payroll Paygroups">
                                    {paygroups.map(pg => (
                                        <option key={pg.id} value={`pg:${pg.id}`}>
                                            {pg.name}
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                        {error && error.includes('Business Unit') && <p className="text-[10px] text-rose-500 mt-1">{error}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Component Name <span className="text-rose-500">*</span></label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Component Name" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" /></div>
                        <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Name in Payslip <span className="text-rose-500">*</span></label><input type="text" value={payslipName} onChange={(e) => setPayslipName(e.target.value)} placeholder="Enter Payslip Name" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {initialData && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Effective Date</label>
                                <input
                                    type="date"
                                    value={effectiveDate}
                                    onChange={(e) => setEffectiveDate(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-600"
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">Deduction Type <span className="text-rose-500">*</span></label>
                        <div className="flex gap-6">
                            {(['Statutory', 'Non-Statutory'] as const).map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${deductionType === type ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {deductionType === type && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                    </div>
                                    <input
                                        type="radio"
                                        className="hidden"
                                        checked={deductionType === type}
                                        onChange={() => setDeductionType(type)}
                                    />
                                    <span className="text-sm text-slate-700 font-medium">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    {/* Calculation Method */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Calculation Method <span className="text-rose-500">*</span></label>
                            <div className="flex items-center gap-6 h-[42px]">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${calcMethod === 'Flat' ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {calcMethod === 'Flat' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={calcMethod === 'Flat'} onChange={() => setCalcMethod('Flat')} />
                                    <span className="text-sm text-slate-700 font-medium">Flat Amount</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${calcMethod === 'Percentage' ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {calcMethod === 'Percentage' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={calcMethod === 'Percentage'} onChange={() => setCalcMethod('Percentage')} />
                                    <span className="text-sm text-slate-700 font-medium">Percentage of</span>
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        disabled={calcMethod !== 'Percentage'}
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="h-9 px-3 border border-slate-200 rounded text-sm text-slate-600 bg-slate-50 flex items-center gap-2 focus:outline-none focus:border-purple-500 disabled:opacity-50 min-w-[100px] justify-between transition-all"
                                    >
                                        <span className="truncate max-w-[80px]">{selectedComponents.length > 0 ? selectedComponents.join(', ') : 'Select'}</span>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                                            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                                                {['CTC', 'Basic'].map(comp => (
                                                    <label key={comp} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer group transition-colors">
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedComponents.includes(comp) ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white group-hover:border-purple-400'}`}>
                                                            {selectedComponents.includes(comp) && <Check size={12} className="text-white" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={selectedComponents.includes(comp)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedComponents(prev => [...prev, comp]);
                                                                } else {
                                                                    setSelectedComponents(prev => prev.filter(c => c !== comp));
                                                                }
                                                            }}
                                                        />
                                                        <span className="text-sm text-slate-700 font-medium">{comp}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                {calcMethod === 'Percentage' ? 'Enter Percentage' : 'Enter Amount'} <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={amountOrPercent}
                                    onChange={(e) => setAmountOrPercent(e.target.value)}
                                    placeholder={calcMethod === 'Percentage' ? 'Enter Percentage' : 'Enter Amount'}
                                    className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                />
                                <div className="absolute right-0 top-0 h-full px-3 bg-slate-100 border-l border-slate-200 rounded-r-lg flex items-center text-slate-500 font-medium text-sm">
                                    {calcMethod === 'Percentage' ? '%' : '₹'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Deduction Frequency <span className="text-rose-500">*</span></label>
                        <div className="space-y-2">
                            {['One-time', 'Recurring'].map(freq => (
                                <label key={freq} className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${frequency === freq ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {frequency === freq && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={frequency === freq} onChange={() => setFrequency(freq as any)} />
                                    <span className="text-sm text-slate-700 font-medium">{freq === 'One-time' ? 'One-time deduction' : 'Recurring deduction for subsequent Payrolls'}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="pt-2 flex flex-col gap-3">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${showInPayslip ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white group-hover:border-purple-400'}`}>
                                {showInPayslip && <Check size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={showInPayslip} onChange={() => setShowInPayslip(!showInPayslip)} />
                            <span className="text-sm font-medium text-slate-700">Show in Payslip</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isActive ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white group-hover:border-purple-400'}`}>
                                {isActive && <Check size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={isActive} onChange={() => setIsActive(!isActive)} />
                            <span className="text-sm font-medium text-slate-700">Mark as Active</span>
                        </label>
                    </div>
                </div>
                <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                    <button onClick={onCancel} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm shadow-sm transition-colors">{initialData ? 'Update' : 'Save'}</button>
                </div>
            </div>
        </div>
    );
}

// --- Detailed Add Reimbursement Form ---
const AddReimbursementComponentForm: React.FC<AddEarningFormProps> = ({ onCancel, onSave, initialData, paygroups, selectedTarget }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [payslipName, setPayslipName] = useState(initialData?.payslipName || '');
    const [amount, setAmount] = useState(initialData?.amountOrPercent || '');
    const [isActive, setIsActive] = useState(initialData?.status ?? true);
    const [effectiveDate, setEffectiveDate] = useState(initialData?.effectiveDate || '');
    const [showInPayslip, setShowInPayslip] = useState(initialData?.showInPayslip ?? false);
    const [error, setError] = useState<string | null>(null);

    const [localSelectedTarget, setLocalSelectedTarget] = useState(() => {
        if (initialData?.targetId && initialData?.targetType) {
            const prefix = initialData.targetType === 'Paygroup' ? 'pg' : 'bu';
            return `${prefix}:${initialData.targetId}`;
        }
        return selectedTarget === 'all' ? '' : selectedTarget;
    });

    const [natureOfPay, setNatureOfPay] = useState<'Fixed' | 'Variable'>(
        initialData?.type === 'Variable Pay' ? 'Variable' : 'Fixed'
    );

    const [calcMethod, setCalcMethod] = useState<'Flat' | 'Percentage'>(
        initialData?.calcMethod || 'Flat'
    );
    const [selectedComponents, setSelectedComponents] = useState<string[]>(['CTC']);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleSave = () => {
        if (!name) {
            setError('Component Name is mandatory');
            return;
        }
        if (!localSelectedTarget) {
            setError('Business Unit or Paygroup is mandatory');
            return;
        }
        setError(null);

        const updatedData: Partial<SalaryComponent> = {
            name,
            payslipName,
            amountOrPercent: amount,
            status: isActive,
            effectiveDate,
            showInPayslip,
            type: natureOfPay === 'Variable' ? 'Variable Pay' : 'Fixed Pay',
            category: 'Reimbursements',
            calcMethod: calcMethod,
            calculation: calcMethod === 'Flat' ? `Fixed Amount` : `${amount}% of ${selectedComponents.join(', ')}`,
            taxable: 'Partially Exempt',
        };

        const [targetTypeRaw, targetId] = localSelectedTarget.split(':');
        const targetType = targetTypeRaw === 'pg' ? 'Paygroup' : 'BusinessUnit';

        onSave({ ...updatedData, targetId, targetType });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-4 max-w-4xl w-full max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <h2 className="text-lg font-bold text-slate-800">{initialData ? 'Edit Reimbursement Component' : 'Add Reimbursement Component'}</h2>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto flex-1">
                    {/* Target Selection */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Associate with Business Unit or Paygroup <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <select
                                disabled
                                value={localSelectedTarget}
                                onChange={(e) => setLocalSelectedTarget(e.target.value)}
                                className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-slate-50 opacity-80 cursor-not-allowed text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 ${error && error.includes('Business Unit') ? 'border-rose-500' : 'border-slate-200'}`}
                            >
                                <option value="">Select a unit or paygroup</option>
                                <optgroup label="Business Units">
                                    {BUSINESS_UNITS.map(bu => (
                                        <option key={bu} value={`bu:${bu}`}>{bu}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Payroll Paygroups">
                                    {paygroups.map(pg => (
                                        <option key={pg.id} value={`pg:${pg.id}`}>
                                            {pg.name}
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                        {error && error.includes('Business Unit') && <p className="text-[10px] text-rose-500 mt-1">{error}</p>}
                    </div>

                    {/* Names */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Component Name <span className="text-rose-500">*</span></label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Component Name" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Name in Payslip <span className="text-rose-500">*</span></label>
                            <input type="text" value={payslipName} onChange={(e) => setPayslipName(e.target.value)} placeholder="Enter Name in Payslip" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
                        </div>
                        {initialData && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Effective Date</label>
                                <input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-600 transition-all" />
                            </div>
                        )}
                    </div>

                    {/* Nature of Pay */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">Nature of Pay <span className="text-rose-500">*</span></label>
                        <div className="flex gap-6">
                            {['Fixed', 'Variable'].map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${natureOfPay === type ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {natureOfPay === type && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={natureOfPay === type} onChange={() => setNatureOfPay(type as any)} />
                                    <span className="text-sm text-slate-700 font-medium">{type} Pay</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Calculation Method */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">Calculation Method <span className="text-rose-500">*</span></label>
                            <div className="flex items-center gap-6 h-[42px]">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${calcMethod === 'Flat' ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {calcMethod === 'Flat' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={calcMethod === 'Flat'} onChange={() => setCalcMethod('Flat')} />
                                    <span className="text-sm text-slate-700 font-medium">Flat Amount</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${calcMethod === 'Percentage' ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {calcMethod === 'Percentage' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={calcMethod === 'Percentage'} onChange={() => setCalcMethod('Percentage')} />
                                    <span className="text-sm text-slate-700 font-medium">Percentage of</span>
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        disabled={calcMethod !== 'Percentage'}
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="h-9 px-3 border border-slate-200 rounded text-sm text-slate-600 bg-slate-50 flex items-center gap-2 focus:outline-none focus:border-purple-500 disabled:opacity-50 min-w-[100px] justify-between transition-all"
                                    >
                                        <span className="truncate max-w-[80px]">
                                            {selectedComponents.length > 0 ? selectedComponents.join(', ') : 'Select'}
                                        </span>
                                        <ChevronDown size={14} className="text-slate-400" />
                                    </button>

                                    {isDropdownOpen && calcMethod === 'Percentage' && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setIsDropdownOpen(false)}
                                            />
                                            <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 max-h-48 overflow-y-auto hidden-scrollbar animate-in slide-in-from-top-2">
                                                {['CTC', 'Basic'].map(comp => (
                                                    <label key={comp} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedComponents.includes(comp)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedComponents([...selectedComponents, comp]);
                                                                } else {
                                                                    setSelectedComponents(selectedComponents.filter(c => c !== comp));
                                                                }
                                                            }}
                                                            className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                                        />
                                                        <span className="text-sm text-slate-700">{comp}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">
                                {calcMethod === 'Percentage' ? 'Enter Percentage' : 'Enter Amount'} <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder={calcMethod === 'Percentage' ? 'Enter Percentage' : 'Enter Amount'}
                                    className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                />
                                <div className="absolute right-0 top-0 h-full px-3 bg-slate-100 border-l border-slate-200 rounded-r-lg flex items-center text-slate-500 font-medium text-sm">
                                    {calcMethod === 'Percentage' ? '%' : '₹'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="pt-2 flex flex-col gap-3">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${showInPayslip ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white group-hover:border-purple-400'}`}>
                                {showInPayslip && <Check size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={showInPayslip} onChange={() => setShowInPayslip(!showInPayslip)} />
                            <span className="text-sm font-medium text-slate-700">Show in Payslip</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isActive ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white group-hover:border-purple-400'}`}>
                                {isActive && <Check size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={isActive} onChange={() => setIsActive(!isActive)} />
                            <span className="text-sm font-medium text-slate-700">Mark as Active</span>
                        </label>
                    </div>
                </div>

                <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                    <button onClick={onCancel} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm shadow-sm transition-colors">{initialData ? 'Update' : 'Save'}</button>
                </div>
            </div>
        </div>
    );
}

const HRSalaryComponents: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Earnings');
    const [selectedTarget, setSelectedTarget] = useState(`bu:${BUSINESS_UNITS[0]}`);
    const [paygroups, setPaygroups] = useState<any[]>([]);

    // Initialize state
    const [components, setComponents] = useState<SalaryComponent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const fetchPaygroups = async () => {
        const { data, error } = await supabase
            .from('paygroups')
            .select('*');
        if (error) console.error('Error fetching paygroups:', error);
        else setPaygroups(data || []);
    };

    const fetchComponents = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('salary_components')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching components:', error);
        } else {
            const mappedData: SalaryComponent[] = (data || []).map(item => ({
                id: item.id,
                name: item.name,
                type: item.type,
                calculation: item.calculation,
                taxable: item.taxable,
                status: item.status,
                category: item.category,
                amountOrPercent: item.amount_or_percent,
                calcMethod: item.calc_method,
                payslipName: item.payslip_name,
                frequency: item.frequency,
                considerEPF: item.consider_epf,
                considerESI: item.consider_esi,
                effectiveDate: item.effective_date,
                deductionType: item.deduction_type,
                showInPayslip: item.show_in_payslip,
                created: item.created_by,
                lastModified: item.last_updated_by,
                isSystem: item.is_system,
                targetId: item.target_id,
                targetType: item.target_type
            }));
            setComponents(mappedData);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchComponents();
        fetchPaygroups();
    }, []);

    const [isAdding, setIsAdding] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [editingComponent, setEditingComponent] = useState<SalaryComponent | null>(null);

    // Modal States
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
    const [statusChangeRequest, setStatusChangeRequest] = useState<{ isOpen: boolean; id: string | null; newStatus: boolean }>({ isOpen: false, id: null, newStatus: false });

    // Filter out Benefits for now
    const tabs = ['Earnings', 'Deductions', 'Reimbursements'];

    const filteredData = useMemo(() => {
        let allComponents = [...components];

        if (selectedTarget !== 'all') {
            const [targetTypeRaw, targetId] = selectedTarget.split(':');
            const targetType = targetTypeRaw === 'pg' ? 'Paygroup' : 'BusinessUnit';
            
            // Filter components saved for this target
            const savedForTarget = components.filter(c => c.targetId === targetId && c.targetType === targetType);
            
            // Add INITIAL_DATA as defaults, but skip any that have already been saved/modified
            const defaultsForTarget = INITIAL_DATA
                .filter(mock => !savedForTarget.some(saved => saved.name === mock.name))
                .map(c => ({
                    ...c,
                    id: `mock-${c.id}`,
                    targetType,
                    targetId: targetId
                }));
            
            allComponents = [...defaultsForTarget, ...savedForTarget];
        }

        return allComponents.filter(c => c.category === activeTab);
    }, [components, activeTab, selectedTarget]);

    const handleEditClick = (component: SalaryComponent) => {
        setEditingComponent(component);
        setIsAdding(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteConfirmation({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        if (deleteConfirmation.id) {
            const isMock = deleteConfirmation.id.startsWith('mock-');
            if (isMock) {
                alert("Default components cannot be deleted.");
                setDeleteConfirmation({ isOpen: false, id: null });
                return;
            }

            const { error } = await supabase
                .from('salary_components')
                .delete()
                .eq('id', deleteConfirmation.id);

            if (error) {
                console.error('Error deleting component:', error);
            } else {
                fetchComponents();
            }
            setDeleteConfirmation({ isOpen: false, id: null });
            if (isAdding && editingComponent?.id === deleteConfirmation.id) {
                handleCancel();
            }
        }
    };

    const handleStatusClick = (id: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        if (newStatus === false) { // Deactivating
            setStatusChangeRequest({ isOpen: true, id, newStatus });
        } else { // Activating (Direct)
            confirmStatusChange(id, true);
        }
    };

    const confirmStatusChange = async (id: string | null = statusChangeRequest.id, statusToSet: boolean = statusChangeRequest.newStatus) => {
        if (id) {
            const isMock = id.startsWith('mock-');
            if (isMock) {
                // Find in INITIAL_DATA and insert it as a real record
                const originalId = id.replace('mock-', '');
                const mockComp = INITIAL_DATA.find(c => c.id === originalId);
                if (mockComp) {
                    const [targetTypeRaw, targetId] = selectedTarget.split(':');
                    const targetType = targetTypeRaw === 'pg' ? 'Paygroup' : 'BusinessUnit';
                    
                    const payload = {
                        name: mockComp.name,
                        type: mockComp.type,
                        calculation: mockComp.calculation,
                        taxable: mockComp.taxable,
                        status: statusToSet,
                        category: mockComp.category,
                        amount_or_percent: mockComp.amountOrPercent,
                        calc_method: mockComp.calcMethod,
                        payslip_name: mockComp.payslipName,
                        frequency: mockComp.frequency,
                        consider_epf: mockComp.considerEPF,
                        consider_esi: mockComp.considerESI,
                        target_id: targetId,
                        target_type: targetType,
                        created_by: 'Admin',
                        last_updated_by: 'Admin'
                    };
                    const { error } = await supabase.from('salary_components').insert([payload]);
                    if (error) console.error('Error inserting mock component status change:', error);
                    else fetchComponents();
                }
            } else {
                const { error } = await supabase
                    .from('salary_components')
                    .update({ status: statusToSet, last_updated_by: 'Admin' })
                    .eq('id', id);

                if (error) {
                    console.error('Error updating status:', error);
                } else {
                    fetchComponents();
                }
            }
            setStatusChangeRequest({ isOpen: false, id: null, newStatus: false });
        }
    };

    const handleSave = async (data: Partial<SalaryComponent>) => {
        const payload = {
            name: data.name || 'New Component',
            type: data.type || 'Fixed Pay',
            calculation: data.calculation || '',
            taxable: data.taxable || 'Fully Taxable',
            status: data.status ?? true,
            category: activeTab as any,
            amount_or_percent: data.amountOrPercent,
            calc_method: data.calcMethod,
            payslip_name: data.payslipName,
            frequency: data.frequency,
            consider_epf: data.considerEPF,
            consider_esi: data.considerESI,
            effective_date: data.effectiveDate,
            deduction_type: data.deductionType,
            show_in_payslip: data.showInPayslip,
            target_id: data.targetId,
            target_type: data.targetType,
            last_updated_by: 'Admin'
        } as any;

        if (editingComponent) {
            const isMock = editingComponent.id.startsWith('mock-');
            if (isMock) {
                payload.created_by = 'Admin';
                const { error } = await supabase
                    .from('salary_components')
                    .insert([payload]);

                if (error) console.error('Error inserting component:', error);
            } else {
                const { error } = await supabase
                    .from('salary_components')
                    .update(payload)
                    .eq('id', editingComponent.id);

                if (error) console.error('Error updating component:', error);
            }
        } else {
            payload.created_by = 'Admin';
            const { error } = await supabase
                .from('salary_components')
                .insert([payload]);

            if (error) console.error('Error inserting component:', error);
        }
        fetchComponents();
        handleCancel();
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingComponent(null);
    };

    return (
        <div className="p-4 lg:p-6 w-full space-y-6 animate-in fade-in duration-300 pb-20">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        Salary Components
                    </h1>
                    <p className="text-slate-500 mt-1">Configure earnings, deductions, and reimbursement rules.</p>
                </div>

            </div>

            {isAdding ? (
                activeTab === 'Earnings' ? (
                    <AddEarningComponentForm onCancel={handleCancel} onSave={handleSave} initialData={editingComponent} paygroups={paygroups} selectedTarget={selectedTarget} />
                ) : activeTab === 'Deductions' ? (
                    <AddDeductionComponentForm onCancel={handleCancel} onSave={handleSave} initialData={editingComponent} paygroups={paygroups} selectedTarget={selectedTarget} />
                ) : (
                    <AddReimbursementComponentForm onCancel={handleCancel} onSave={handleSave} initialData={editingComponent} paygroups={paygroups} selectedTarget={selectedTarget} />
                )
            ) : (
                /* Main Content */
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-100">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                                    ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Toolbar */}
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative">
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
                                        <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-purple-600 flex items-center gap-3 transition-colors">
                                            <Tag size={16} className="text-slate-400" /> Component Name
                                        </button>
                                        <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-purple-600 flex items-center gap-3 transition-colors">
                                            <FileText size={16} className="text-slate-400" /> Nature of Pay
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 sm:w-80 relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Filter Results..."
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400 shadow-sm"
                                />
                            </div>

                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                                Filter
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <select
                                    value={selectedTarget}
                                    onChange={(e) => setSelectedTarget(e.target.value)}
                                    className="pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none shadow-sm"
                                >
                                    <optgroup label="Business Units">
                                        {BUSINESS_UNITS.map(bu => (
                                            <option key={bu} value={`bu:${bu}`}>{bu}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Payroll Paygroups">
                                        {paygroups.map(pg => (
                                            <option key={pg.id} value={`pg:${pg.id}`}>
                                                {pg.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>

                            <button
                                onClick={() => setIsAdding(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm w-full sm:w-auto justify-center"
                            >
                                <Plus size={16} /> Add Component
                            </button>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Component Name</th>
                                    <th className="px-6 py-4">Name in Payslip</th>
                                    {activeTab !== 'Deductions' && <th className="px-6 py-4">Nature of Pay</th>}

                                    {/* Columns Specific to Earnings vs Others */}
                                    {activeTab === 'Earnings' ? (
                                        <>
                                            <th className="px-6 py-4">Calculation Method</th>
                                            <th className="px-6 py-4">Consider for PF</th>
                                            <th className="px-6 py-4">Consider for ESI</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Last Modified By</th>
                                            <th className="px-6 py-4">Created By</th>
                                        </>
                                    ) : (
                                        <>
                                            {activeTab === 'Reimbursements' && (
                                                <>
                                                    <th className="px-6 py-4">Calculation Method</th>
                                                </>
                                            )}
                                            {activeTab === 'Deductions' && (
                                                <>
                                                    <th className="px-6 py-4">Calculation Method</th>
                                                    <th className="px-6 py-4">Deduction Type</th>
                                                    <th className="px-6 py-4">Deduction Frequency</th>
                                                </>
                                            )}
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Last Modified By</th>
                                            <th className="px-6 py-4">Created By</th>
                                        </>
                                    )}

                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={12} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                                <span>Loading components...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredData.length > 0 ? (
                                    filteredData.map((item) => (
                                        <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors group ${item.isSystem ? 'bg-slate-50/30' : ''}`}>
                                            <td className="px-6 py-4 font-semibold text-slate-800">
                                                <div className="flex items-center gap-2">
                                                    {item.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">
                                                {item.payslipName || '-'}
                                            </td>
                                            {activeTab !== 'Deductions' && (
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                                                        {item.type}
                                                    </span>
                                                </td>
                                            )}

                                            {activeTab === 'Earnings' ? (
                                                <>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-700">{item.calcMethod === 'Flat' ? 'Flat' : item.calculation}</span>
                                                            {item.calcMethod === 'Flat' && <span className="text-xs text-slate-500">Rs. {item.amountOrPercent}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-700">{item.considerEPF ? 'Yes' : 'No'}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-700">{item.considerESI ? 'Yes' : 'No'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-slate-700">
                                                            {item.status ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-pre-line">{item.lastModified || '-'}</td>
                                                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-pre-line">{item.created || '-'}</td>
                                                </>
                                            ) : (
                                                <>
                                                    {activeTab === 'Reimbursements' && (
                                                        <>
                                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                                <div className="flex flex-col">
                                                                    <span>{item.calcMethod === 'Flat' ? 'Flat' : item.calculation || '-'}</span>
                                                                    {item.calcMethod === 'Flat' && <span className="text-xs text-slate-500">Rs. {item.amountOrPercent || '0'}</span>}
                                                                </div>
                                                            </td>
                                                        </>
                                                    )}
                                                    {activeTab === 'Deductions' && (
                                                        <>
                                                            <td className="px-6 py-4 text-slate-600 font-medium">{item.calculation || '-'}</td>
                                                            <td className="px-6 py-4 font-medium text-slate-700">{item.deductionType || '-'}</td>
                                                            <td className="px-6 py-4 font-medium text-slate-700">{item.frequency || '-'}</td>
                                                        </>
                                                    )}
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-slate-700">
                                                            {item.status ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-pre-line">{item.lastModified || '-'}</td>
                                                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-pre-line">{item.created || '-'}</td>
                                                </>
                                            )}

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditClick(item)}
                                                        className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusClick(item.id, item.status)}
                                                        className={`p-1.5 rounded-md transition-colors ${item.status ? 'text-emerald-500 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                                        title={item.status ? "Deactivate" : "Activate"}
                                                    >
                                                        <Power size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(item.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={12} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
                                            <div className="flex flex-col items-center gap-2">
                                                <Info size={24} className="opacity-50" />
                                                <p>No components found for this category.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Confirmation Modals */}
            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, id: null })}
                onConfirm={confirmDelete}
                title="Delete Component?"
                message={
                    <span>
                        Are you sure you want to delete this component? <br />
                        <strong>This action will affect employees currently assigned to this rule.</strong>
                    </span>
                }
                confirmLabel="Yes, Delete"
                isDanger={true}
            />

            <ConfirmationModal
                isOpen={statusChangeRequest.isOpen}
                onClose={() => setStatusChangeRequest({ isOpen: false, id: null, newStatus: false })}
                onConfirm={() => confirmStatusChange()}
                title="Deactivate Component?"
                message="Are you sure you want to mark this component as inactive? It will no longer be applied to new payroll runs."
                confirmLabel="Yes, Deactivate"
                isDanger={false}
            />

        </div>
    );
};

export default HRSalaryComponents;
