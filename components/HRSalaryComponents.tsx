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
    Building2,
    ChevronLeft,
    ChevronRight,
    ChevronDown as ChevronDownIcon
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
    considerGratuity?: boolean;
    lastModified?: string;
    created?: string;
    effectiveDate?: string;
    deductionType?: 'Statutory' | 'Non-Statutory';
    showInPayslip?: boolean;
    isSystem?: boolean;
    targetId?: string;
    targetType?: 'Paygroup' | 'BusinessUnit';
    isProRata?: boolean;
    includeMonthlyPayout?: boolean;
    prorateDojDol?: boolean;
    includeInFirstSalaryDeduction?: boolean;
    includeArrears?: boolean;
    deductionTiming?: 'Pre-tax' | 'Post-tax';
    roundOffSetting?: 'Floor' | 'Ceiling';
    taxComputation?: 'Proportionally' | 'Pay month';
    incomeTaxSection?: string;
    sectionMaxLimit?: string;
    nonTaxableLimit?: string;
    includeInCTC?: boolean;
    includeInGross?: boolean;
    includeInPayout?: boolean;
    includeInFirstSalary?: boolean;
    considerPT?: boolean;
    considerLWF?: boolean;
    considerLeaveEncashment?: boolean;
    showOnSalaryRegister?: boolean;
    showRateOnSalarySlip?: boolean;
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

    // Deductions (Mock data removed as requested)


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
    const [effectiveDate, setEffectiveDate] = useState(initialData?.effectiveDate || new Date().toISOString().split('T')[0]);
    const [error, setError] = useState<string | null>(null);
    const [localSelectedTarget, setLocalSelectedTarget] = useState(() => {
        if (initialData?.targetId && initialData?.targetType) {
            const prefix = initialData.targetType === 'Paygroup' ? 'pg' : 'bu';
            return `${prefix}:${initialData.targetId}`;
        }
        return selectedTarget === 'all' ? "bu:MindInventory" : selectedTarget;
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
    const [isTaxable, setIsTaxable] = useState(initialData?.taxable && initialData.taxable !== 'Fully Exempt' ? true : false);
    const [taxTreatment, setTaxTreatment] = useState(initialData?.taxable || 'Fully Taxable');
    const [taxPreference, setTaxPreference] = useState('Subsequent');
    const [isProRata, setIsProRata] = useState(true);
    const [isConsiderEPF, setIsConsiderEPF] = useState(initialData?.considerEPF ?? true);
    const [isConsiderESI, setIsConsiderESI] = useState(initialData?.considerESI ?? true);
    const [isConsiderGratuity, setIsConsiderGratuity] = useState(initialData?.considerGratuity ?? true);
    const [includeInCTC, setIncludeInCTC] = useState(initialData?.includeInCTC ?? false);
    const [includeInGross, setIncludeInGross] = useState(initialData?.includeInGross ?? false);
    const [includeInFirstSalary, setIncludeInFirstSalary] = useState(initialData?.includeInFirstSalary ?? true);
    const [includeInPayout, setIncludeInPayout] = useState(initialData?.includeInPayout ?? false);
    const [isConsiderPT, setIsConsiderPT] = useState(initialData?.considerPT ?? false);
    const [isConsiderLWF, setIsConsiderLWF] = useState(initialData?.considerLWF ?? false);
    const [isConsiderLeaveEncashment, setIsConsiderLeaveEncashment] = useState(initialData?.considerLeaveEncashment ?? false);
    const [showInPayslip, setShowInPayslip] = useState(true);
    const [isShowOnSalaryRegister, setIsShowOnSalaryRegister] = useState(initialData?.showOnSalaryRegister ?? false);
    const [isShowRateOnSalarySlip, setIsShowRateOnSalarySlip] = useState(initialData?.showRateOnSalarySlip ?? false);
    const [isActive, setIsActive] = useState(initialData?.status ?? true);
    const [roundOffSetting, setRoundOffSetting] = useState<'Floor' | 'Ceiling'>(initialData?.roundOffSetting || 'Floor');
    const [taxComputation, setTaxComputation] = useState<'Proportionally' | 'Pay month'>(initialData?.taxComputation || 'Proportionally');
    const [incomeTaxSection, setIncomeTaxSection] = useState(initialData?.incomeTaxSection || '');
    const [sectionMaxLimit, setSectionMaxLimit] = useState(initialData?.sectionMaxLimit || '');
    const [nonTaxableLimit, setNonTaxableLimit] = useState(initialData?.nonTaxableLimit || '');
    const [isCreatingSection, setIsCreatingSection] = useState(false);
    const [customTaxSection, setCustomTaxSection] = useState('');
    const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);

    const handleSave = () => {
        if (!name) {
            setError('Component Name is mandatory');
            return;
        }
        if (!payslipName) {
            setError('Name in Payslip is mandatory');
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
            taxable: isTaxable ? taxTreatment : 'Fully Exempt',
            considerEPF: isConsiderEPF,
            considerESI: isConsiderESI,
            considerGratuity: isConsiderGratuity,
            status: isActive,
            category: 'Earnings',
            roundOffSetting: roundOffSetting,
            taxComputation: isTaxable ? taxComputation : undefined,
            incomeTaxSection: isTaxable ? (isCreatingSection ? customTaxSection : incomeTaxSection) : undefined,
            sectionMaxLimit: (isTaxable && taxTreatment === 'Fully Taxable') ? sectionMaxLimit : undefined,
            nonTaxableLimit: (isTaxable && taxTreatment === 'Partially Exempt') ? nonTaxableLimit : undefined,
            includeInCTC,
            includeInGross,
            includeInFirstSalary,
            includeInPayout,
            considerPT: isConsiderPT,
            considerLWF: isConsiderLWF,
            considerLeaveEncashment: isConsiderLeaveEncashment,
            showOnSalaryRegister: isShowOnSalaryRegister,
            showRateOnSalarySlip: isShowRateOnSalarySlip
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
                    <div className="w-1/2 hidden">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Business Unit or Paygroup <span className="text-rose-500">*</span></label>
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
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                        {error && error.includes('Business Unit') && <p className="text-[10px] text-rose-500 mt-1">{error}</p>}
                    </div>

                    {/* Section 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Component Name <span className="text-rose-500">*</span></label>
                            <input type="text" value={name} onChange={e => { setName(e.target.value); setError(null); }} placeholder="Enter Component Name" className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 ${error === 'Component Name is mandatory' ? 'border-rose-500' : 'border-slate-200'}`} />
                            {error === 'Component Name is mandatory' && <p className="text-[10px] text-rose-500 mt-1 font-medium">{error}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Name in Payslip <span className="text-rose-500">*</span></label>
                            <input type="text" value={payslipName} onChange={e => { setPayslipName(e.target.value); setError(null); }} placeholder="Enter Name in Payslip" className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 ${error === 'Name in Payslip is mandatory' ? 'border-rose-500' : 'border-slate-200'}`} />
                            {error === 'Name in Payslip is mandatory' && <p className="text-[10px] text-rose-500 mt-1 font-medium">{error}</p>}
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
                                <label key={type} 
                                       className="flex items-center gap-2 cursor-pointer group"
                                       style={{ display: type === 'Variable' ? 'none' : 'flex' }}
                                >
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
                            <div className="relative max-w-[200px]">
                                <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={calcMethod === 'Percentage' ? 'Enter Percentage' : 'Enter Amount'} className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                                <div className="absolute right-0 top-0 h-full px-3 bg-slate-100 border-l border-slate-200 rounded-r-lg flex items-center text-slate-500 font-medium text-sm">
                                    {calcMethod === 'Percentage' ? '%' : '₹'}
                                </div>
                            </div>
                        </div>
                    </div>



                    <div className="pt-6 border-t border-slate-300 space-y-5">
                        <h3 className="font-bold text-slate-800 text-sm">Other Configurations</h3>

                        {/* Taxable */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">Taxable earning <span className="text-rose-500">*</span></label>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isTaxable ? 'border-purple-600' : 'border-slate-300'}`}>
                                            {isTaxable && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                        </div>
                                        <input type="radio" className="hidden" checked={isTaxable} onChange={() => setIsTaxable(true)} />
                                        <span className="text-sm text-slate-700 font-medium">Yes</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors {!isTaxable ? 'border-purple-600' : 'border-slate-300'}`}>
                                            {!isTaxable && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                        </div>
                                        <input type="radio" className="hidden" checked={!isTaxable} onChange={() => setIsTaxable(false)} />
                                        <span className="text-sm text-slate-700 font-medium">No</span>
                                    </label>
                                </div>
                            </div>

                            {isTaxable && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="w-1/2">
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Tax Treatment <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <select
                                                value={taxTreatment}
                                                onChange={(e) => setTaxTreatment(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none bg-white"
                                            >
                                                <option value="Fully Taxable">Fully Taxable</option>
                                                <option value="Partially Exempt">Partially Exempt</option>
                                                <option value="Fully Exempt">Fully Exempt</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1.5">
                                            {taxTreatment === 'Fully Taxable' && "Entire amount is added to taxable income."}
                                            {taxTreatment === 'Partially Exempt' && "Entire amount is exempt from income tax."}
                                            {taxTreatment === 'Fully Exempt' && "Only a part of the amount is exempt; the rest is taxable."}
                                        </p>
                                    </div>
                                    {/* Tax Deduction Preference for Variable Pay */}
                                    {natureOfPay === 'Variable' && (
                                        <div className="space-y-2">
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

                                    {/* Additional Tax Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                        {taxTreatment === 'Partially Exempt' && (
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Non Taxable Limit</label>
                                                <input
                                                    type="text"
                                                    value={nonTaxableLimit}
                                                    onChange={e => setNonTaxableLimit(e.target.value.replace(/[^0-9]/g, ''))}
                                                    placeholder="Enter Amount"
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-slate-700"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-2">Tax computation <span className="text-rose-500">*</span></label>
                                            <div className="flex gap-6 h-[40px] items-center">
                                                {['Proportionally', 'Pay month'].map((option) => (
                                                    <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${taxComputation === option ? 'border-purple-600' : 'border-slate-300'}`}>
                                                            {taxComputation === option && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                                                        </div>
                                                        <input type="radio" className="hidden" checked={taxComputation === option} onChange={() => setTaxComputation(option as any)} />
                                                        <span className="text-sm text-slate-700 font-medium">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Income tax section</label>
                                            {isCreatingSection ? (
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={customTaxSection}
                                                        onChange={e => setCustomTaxSection(e.target.value)}
                                                        placeholder="Enter Section Name"
                                                        className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-purple-50/10 font-medium text-slate-700"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => { setIsCreatingSection(false); setCustomTaxSection(''); }}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div
                                                        onClick={() => setIsSectionDropdownOpen(!isSectionDropdownOpen)}
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white cursor-pointer flex justify-between items-center text-slate-700 font-medium"
                                                    >
                                                        <span>{incomeTaxSection || 'Select or Create Section'}</span>
                                                        <ChevronDown className={`text-slate-400 transition-transform ${isSectionDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                                                    </div>
                                                    {isSectionDropdownOpen && (
                                                        <>
                                                            <div className="fixed inset-0 z-[60]" onClick={() => setIsSectionDropdownOpen(false)} />
                                                            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-[70] py-1 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                                                                <div
                                                                    onClick={() => { setIsCreatingSection(true); setIsSectionDropdownOpen(false); }}
                                                                    className="px-3 py-2.5 text-sm text-purple-600 font-semibold hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                                                                >
                                                                    Create section
                                                                </div>
                                                                {[
                                                                    "Section_10(14)(i)",
                                                                    "Section_10(14)(ii)",
                                                                    "Section_10(5)",
                                                                    "Section_17(2)(Viii)",
                                                                    "Section_10(13)(a)"
                                                                ].map(section => (
                                                                    <div
                                                                        key={section}
                                                                        onClick={() => { setIncomeTaxSection(section); setIsSectionDropdownOpen(false); }}
                                                                        className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                                                                    >
                                                                        {section}
                                                                        {incomeTaxSection === section && <Check size={14} className="text-purple-600" />}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {taxTreatment === 'Fully Taxable' && (
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Section maximum limit</label>
                                                <input
                                                    type="text"
                                                    value={sectionMaxLimit}
                                                    onChange={e => setSectionMaxLimit(e.target.value.replace(/[^0-9]/g, ''))}
                                                    placeholder="Enter Amount"
                                                    className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-slate-700"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Round off settings */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">Round off settings <span className="text-rose-500">*</span></label>
                            <div className="flex gap-6">
                                {['Floor', 'Ceiling'].map((option) => (
                                    <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${roundOffSetting === option ? 'border-purple-600' : 'border-slate-300'}`}>
                                            {roundOffSetting === option && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                        </div>
                                        <input type="radio" className="hidden" checked={roundOffSetting === option} onChange={() => setRoundOffSetting(option as any)} />
                                        <span className="text-sm text-slate-700 font-medium">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-start gap-2 cursor-pointer">
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${includeInCTC ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                    {includeInCTC && <Check size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={includeInCTC} onChange={() => setIncludeInCTC(!includeInCTC)} />
                                <span className="block text-sm font-bold text-slate-700">Include this component in CTC</span>
                            </label>

                            <label className="flex items-start gap-2 cursor-pointer">
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${includeInGross ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                    {includeInGross && <Check size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={includeInGross} onChange={() => setIncludeInGross(!includeInGross)} />
                                <span className="block text-sm font-bold text-slate-700">Include this component in Gross salary</span>
                            </label>

                            <label className="flex items-start gap-2 cursor-pointer">
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${includeInFirstSalary ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                    {includeInFirstSalary && <Check size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={includeInFirstSalary} onChange={() => setIncludeInFirstSalary(!includeInFirstSalary)} />
                                <span className="block text-sm font-bold text-slate-700">Include in the employee’s first salary</span>
                            </label>

                            <label className="flex items-start gap-2 cursor-pointer">
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${includeInPayout ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                    {includeInPayout && <Check size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={includeInPayout} onChange={() => setIncludeInPayout(!includeInPayout)} />
                                <span className="block text-sm font-bold text-slate-700">Include this component in monthly payout</span>
                            </label>

                            {/* Pro Rata moved here */}
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
                        </div>

                        <h3 className="font-bold text-slate-800 text-sm mt-6 mb-4 pt-4 border-t border-slate-200">Statutory Settings</h3>

                        {/* EPF */}
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                            <label className="flex items-start gap-2 cursor-pointer">
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isConsiderEPF ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                    {isConsiderEPF && <Check size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={isConsiderEPF} onChange={() => setIsConsiderEPF(!isConsiderEPF)} />
                                <div>
                                    <span className="block text-sm font-bold text-slate-700">Consider for EPF Contribution</span>
                                    <span className="block text-xs text-slate-500 mt-0.5">This will be included when calculating the employee's EPF contribution.</span>
                                </div>
                            </label>

                        </div>

                        {/* ESI & Payslip & other configurations */}
                        <div className="space-y-4">
                            <label className="flex items-start gap-2 cursor-pointer">
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isConsiderESI ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                    {isConsiderESI && <Check size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={isConsiderESI} onChange={() => setIsConsiderESI(!isConsiderESI)} />
                                <span className="text-sm font-bold text-slate-700">Consider for ESI Contribution</span>
                            </label>

                            <label className="flex items-start gap-2 cursor-pointer">
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isConsiderGratuity ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                    {isConsiderGratuity && <Check size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={isConsiderGratuity} onChange={() => setIsConsiderGratuity(!isConsiderGratuity)} />
                                <div>
                                    <span className="block text-sm font-bold text-slate-700">Consider for Gratuity</span>
                                    <span className="block text-xs text-slate-500 mt-0.5">This component will be included in gratuity computation.</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isConsiderPT ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                    {isConsiderPT && <Check size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={isConsiderPT} onChange={() => setIsConsiderPT(!isConsiderPT)} />
                                <span className="text-sm font-bold text-slate-700">Consider for Professional tax</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isConsiderLWF ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                    {isConsiderLWF && <Check size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={isConsiderLWF} onChange={() => setIsConsiderLWF(!isConsiderLWF)} />
                                <span className="text-sm font-bold text-slate-700">Consider for Labour Welfare Fund</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isConsiderLeaveEncashment ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                    {isConsiderLeaveEncashment && <Check size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={isConsiderLeaveEncashment} onChange={() => setIsConsiderLeaveEncashment(!isConsiderLeaveEncashment)} />
                                <span className="text-sm font-bold text-slate-700">Consider for Leave encashment</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${showInPayslip ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                    {showInPayslip && <Check size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={showInPayslip} onChange={() => setShowInPayslip(!showInPayslip)} />
                                <span className="text-sm font-bold text-slate-700">Show in Payslip</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isShowOnSalaryRegister ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                    {isShowOnSalaryRegister && <Check size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={isShowOnSalaryRegister} onChange={() => setIsShowOnSalaryRegister(!isShowOnSalaryRegister)} />
                                <span className="text-sm font-bold text-slate-700">Show on salary register</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isShowRateOnSalarySlip ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                    {isShowRateOnSalarySlip && <Check size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={isShowRateOnSalarySlip} onChange={() => setIsShowRateOnSalarySlip(!isShowRateOnSalarySlip)} />
                                <span className="text-sm font-bold text-slate-700">Show rate on salary slip</span>
                            </label>
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
    const [isProRata, setIsProRata] = useState(initialData?.isProRata ?? false);
    const [includeMonthlyPayout, setIncludeMonthlyPayout] = useState(initialData?.includeMonthlyPayout ?? false);
    const [prorateDojDol, setProrateDojDol] = useState(initialData?.prorateDojDol ?? false);
    const [includeInFirstSalaryDeduction, setIncludeInFirstSalaryDeduction] = useState(initialData?.includeInFirstSalaryDeduction ?? false);
    const [includeArrears, setIncludeArrears] = useState(initialData?.includeArrears ?? false);
    const [showInPayslip, setShowInPayslip] = useState(initialData?.showInPayslip ?? true);
    const [deductionTiming, setDeductionTiming] = useState<'Pre-tax' | 'Post-tax'>(initialData?.deductionTiming || 'Post-tax');
    const [roundOffSetting, setRoundOffSetting] = useState<'Floor' | 'Ceiling'>(initialData?.roundOffSetting || 'Ceiling');
    // Taxable earning fields
    const [isTaxableEarning, setIsTaxableEarning] = useState(
        initialData?.taxable !== undefined && initialData.taxable !== 'Tax Deductible' ? true : false
    );
    const [taxTreatment, setTaxTreatment] = useState(initialData?.taxable && initialData.taxable !== 'Tax Deductible' ? initialData.taxable : 'Fully Taxable');
    const [taxComputation, setTaxComputation] = useState<'Proportionally' | 'Pay month'>(initialData?.taxComputation || 'Proportionally');
    const [incomeTaxSection, setIncomeTaxSection] = useState(initialData?.incomeTaxSection || '');
    const [sectionMaxLimit, setSectionMaxLimit] = useState(initialData?.sectionMaxLimit || '');
    const [nonTaxableLimit, setNonTaxableLimit] = useState(initialData?.nonTaxableLimit || '');
    const [isCreatingSection, setIsCreatingSection] = useState(false);
    const [customTaxSection, setCustomTaxSection] = useState('');
    const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);
    const [effectiveDate, setEffectiveDate] = useState(initialData?.effectiveDate || new Date().toISOString().split('T')[0]);
    const [deductionType, setDeductionType] = useState<'Statutory' | 'Non-Statutory'>(initialData?.deductionType || 'Statutory');
    const [error, setError] = useState<string | null>(null);

    const [localSelectedTarget, setLocalSelectedTarget] = useState(() => {
        if (initialData?.targetId && initialData?.targetType) {
            const prefix = initialData.targetType === 'Paygroup' ? 'pg' : 'bu';
            return `${prefix}:${initialData.targetId}`;
        }
        return selectedTarget === 'all' ? "bu:MindInventory" : selectedTarget;
    });

    const [natureOfDeduction, setNatureOfDeduction] = useState<'Fixed' | 'Variable'>(
        initialData?.type === 'Fixed Pay' ? 'Fixed' : 'Variable'
    );

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
        if (!payslipName) {
            setError('Name in Payslip is mandatory');
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
            type: natureOfDeduction === 'Variable' ? 'Variable Pay' : 'Fixed Pay',
            category: 'Deductions',
            calculation: calcMethod === 'Flat' ? `Flat ₹${amountOrPercent}` : `${amountOrPercent}% of ${selectedComponents.join(', ')}`,
            isProRata,
            includeMonthlyPayout,
            prorateDojDol,
            includeInFirstSalaryDeduction,
            includeArrears,
            deductionTiming,
            roundOffSetting,
            taxable: isTaxableEarning ? taxTreatment as SalaryComponent['taxable'] : 'Tax Deductible',
            taxComputation: isTaxableEarning ? taxComputation : undefined,
            incomeTaxSection: isTaxableEarning ? (isCreatingSection ? customTaxSection : incomeTaxSection) : undefined,
            sectionMaxLimit: (isTaxableEarning && taxTreatment === 'Fully Taxable') ? sectionMaxLimit : undefined,
            nonTaxableLimit: (isTaxableEarning && taxTreatment === 'Partially Exempt') ? nonTaxableLimit : undefined,
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
                    <div className="w-1/2 hidden">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Business Unit or Paygroup <span className="text-rose-500">*</span></label>
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
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                        {error && error.includes('Business Unit') && <p className="text-[10px] text-rose-500 mt-1">{error}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Component Name <span className="text-rose-500">*</span></label>
                            <input type="text" value={name} onChange={(e) => { setName(e.target.value); setError(null); }} placeholder="Enter Component Name" className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 ${error === 'Component Name is mandatory' ? 'border-rose-500' : 'border-slate-200'}`} />
                            {error === 'Component Name is mandatory' && <p className="text-[10px] text-rose-500 mt-1 font-medium">{error}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name in Payslip <span className="text-rose-500">*</span></label>
                            <input type="text" value={payslipName} onChange={(e) => { setPayslipName(e.target.value); setError(null); }} placeholder="Enter Payslip Name" className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 ${error === 'Name in Payslip is mandatory' ? 'border-rose-500' : 'border-slate-200'}`} />
                            {error === 'Name in Payslip is mandatory' && <p className="text-[10px] text-rose-500 mt-1 font-medium">{error}</p>}
                        </div>
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

                    {/* Nature of Deduction */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Nature of Deduction <span className="text-rose-500">*</span></label>
                        <div className="flex gap-6">
                            {(['Variable'] as const).map((option) => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${natureOfDeduction === option ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {natureOfDeduction === option && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={natureOfDeduction === option} onChange={() => {
                                        setNatureOfDeduction(option);
                                        if (option === 'Variable') setCalcMethod('Flat');
                                    }} />
                                    <span className="text-sm text-slate-700 font-medium">{option}</span>
                                </label>
                            ))}
                        </div>
                        {natureOfDeduction === 'Variable' && (
                            <p className="text-xs text-slate-500 mt-1.5">Amount can be edited per employee during payroll processing.</p>
                        )}
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
                                {natureOfDeduction === 'Fixed' && (
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${calcMethod === 'Percentage' ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {calcMethod === 'Percentage' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={calcMethod === 'Percentage'} onChange={() => setCalcMethod('Percentage')} />
                                    <span className="text-sm text-slate-700 font-medium">Percentage of</span>
                                </label>
                                )}
                                {natureOfDeduction === 'Fixed' && <div className="relative">
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
                                </div>}
                            </div>
                        </div>
                        <div className="w-1/2">
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



                    {isTaxableEarning && (
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Deduction Timing <span className="text-rose-500">*</span></label>
                        <div className="flex gap-6">
                            {(['Pre-tax', 'Post-tax'] as const).map(timing => (
                                <label key={timing} className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${deductionTiming === timing ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {deductionTiming === timing && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                    </div>
                                    <input
                                        type="radio"
                                        className="hidden"
                                        checked={deductionTiming === timing}
                                        onChange={() => setDeductionTiming(timing)}
                                    />
                                    <span className="text-sm text-slate-700 font-medium">{timing === 'Pre-tax' ? 'Pre-tax deduction' : 'Post-tax deduction'}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                            Pre-tax — deducted before income tax calculation, reducing taxable income (e.g. PF, NPS). <br />
                            Post-tax — deducted after income tax calculation (e.g. loan recovery, salary advance).
                        </p>
                    </div>
                    )}

                    {/* Taxable deduction */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Taxable deduction <span className="text-rose-500">*</span></label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isTaxableEarning ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {isTaxableEarning && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={isTaxableEarning} onChange={() => setIsTaxableEarning(true)} />
                                    <span className="text-sm text-slate-700 font-medium">Yes</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${!isTaxableEarning ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {!isTaxableEarning && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={!isTaxableEarning} onChange={() => setIsTaxableEarning(false)} />
                                    <span className="text-sm text-slate-700 font-medium">No</span>
                                </label>
                            </div>
                        </div>

                        {isTaxableEarning && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <div className="w-1/2">
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Tax Treatment <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <select
                                            value={taxTreatment}
                                            onChange={(e) => setTaxTreatment(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none bg-white"
                                        >
                                            <option value="Fully Taxable">Fully Taxable</option>
                                            <option value="Partially Exempt">Partially Exempt</option>
                                            <option value="Fully Exempt">Fully Exempt</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1.5">
                                        {taxTreatment === 'Fully Taxable' && "Entire amount is added to taxable income."}
                                        {taxTreatment === 'Partially Exempt' && "Only a part of the amount is exempt; the rest is taxable."}
                                        {taxTreatment === 'Fully Exempt' && "Entire amount is exempt from income tax."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                    {taxTreatment === 'Partially Exempt' && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Non Taxable Limit</label>
                                            <input
                                                type="text"
                                                value={nonTaxableLimit}
                                                onChange={e => setNonTaxableLimit(e.target.value.replace(/[^0-9]/g, ''))}
                                                placeholder="Enter Amount"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-slate-700"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2">Tax computation <span className="text-rose-500">*</span></label>
                                        <div className="flex gap-6 h-[40px] items-center">
                                            {(['Proportionally', 'Pay month'] as const).map((option) => (
                                                <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${taxComputation === option ? 'border-purple-600' : 'border-slate-300'}`}>
                                                        {taxComputation === option && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                                                    </div>
                                                    <input type="radio" className="hidden" checked={taxComputation === option} onChange={() => setTaxComputation(option)} />
                                                    <span className="text-sm text-slate-700 font-medium">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Income tax section</label>
                                        {isCreatingSection ? (
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={customTaxSection}
                                                    onChange={e => setCustomTaxSection(e.target.value)}
                                                    placeholder="Enter Section Name"
                                                    className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-purple-50/10 font-medium text-slate-700"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => { setIsCreatingSection(false); setCustomTaxSection(''); }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div
                                                    onClick={() => setIsSectionDropdownOpen(!isSectionDropdownOpen)}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white cursor-pointer flex justify-between items-center text-slate-700 font-medium"
                                                >
                                                    <span>{incomeTaxSection || 'Select or Create Section'}</span>
                                                    <ChevronDown className={`text-slate-400 transition-transform ${isSectionDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                                                </div>
                                                {isSectionDropdownOpen && (
                                                    <>
                                                        <div className="fixed inset-0 z-[60]" onClick={() => setIsSectionDropdownOpen(false)} />
                                                        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-[70] py-1 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                                                            <div
                                                                onClick={() => { setIsCreatingSection(true); setIsSectionDropdownOpen(false); }}
                                                                className="px-3 py-2.5 text-sm text-purple-600 font-semibold hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                                                            >
                                                                Create section
                                                            </div>
                                                            {[
                                                                "Section_10(14)(i)",
                                                                "Section_10(14)(ii)",
                                                                "Section_10(5)",
                                                                "Section_17(2)(Viii)",
                                                                "Section_10(13)(a)"
                                                            ].map(section => (
                                                                <div
                                                                    key={section}
                                                                    onClick={() => { setIncomeTaxSection(section); setIsSectionDropdownOpen(false); }}
                                                                    className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                                                                >
                                                                    {section}
                                                                    {incomeTaxSection === section && <Check size={14} className="text-purple-600" />}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {taxTreatment === 'Fully Taxable' && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Section maximum limit</label>
                                            <input
                                                type="text"
                                                value={sectionMaxLimit}
                                                onChange={e => setSectionMaxLimit(e.target.value.replace(/[^0-9]/g, ''))}
                                                placeholder="Enter Amount"
                                                className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-slate-700"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 flex flex-col gap-3">
                        {/* Round off settings */}
                        <div className="pb-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Round off settings <span className="text-rose-500">*</span></label>
                            <div className="flex gap-6">
                                {(['Floor', 'Ceiling'] as const).map((option) => (
                                    <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${roundOffSetting === option ? 'border-purple-600' : 'border-slate-300'}`}>
                                            {roundOffSetting === option && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                        </div>
                                        <input type="radio" className="hidden" checked={roundOffSetting === option} onChange={() => setRoundOffSetting(option)} />
                                        <span className="text-sm text-slate-700 font-medium">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <label className="flex items-start gap-2 cursor-pointer group">
                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isProRata ? "bg-purple-600 border-purple-600" : "border-slate-300 bg-white group-hover:border-purple-400"}`}>
                                {isProRata && <Check size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={isProRata} onChange={() => setIsProRata(!isProRata)} />
                            <div>
                                <span className="text-sm font-bold text-slate-700">Calculate on pro-rata basis</span>
                                <p className="text-xs text-slate-500">Deduction will be adjusted based on employee working days.</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${includeMonthlyPayout ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white group-hover:border-purple-400'}`}>
                                {includeMonthlyPayout && <Check size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={includeMonthlyPayout} onChange={() => setIncludeMonthlyPayout(!includeMonthlyPayout)} />
                            <span className="text-sm font-medium text-slate-700">Include this component in monthly payout</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${prorateDojDol ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white group-hover:border-purple-400'}`}>
                                {prorateDojDol && <Check size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={prorateDojDol} onChange={() => setProrateDojDol(!prorateDojDol)} />
                            <span className="text-sm font-medium text-slate-700">Prorate as per D.O.J / D.O.L</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${includeInFirstSalaryDeduction ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white group-hover:border-purple-400'}`}>
                                {includeInFirstSalaryDeduction && <Check size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={includeInFirstSalaryDeduction} onChange={() => setIncludeInFirstSalaryDeduction(!includeInFirstSalaryDeduction)} />
                            <span className="text-sm font-medium text-slate-700">Include in the employee's first salary</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${includeArrears ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white group-hover:border-purple-400'}`}>
                                {includeArrears && <Check size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={includeArrears} onChange={() => setIncludeArrears(!includeArrears)} />
                            <span className="text-sm font-medium text-slate-700">Include Arrears</span>
                        </label>
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
    const [effectiveDate, setEffectiveDate] = useState(initialData?.effectiveDate || new Date().toISOString().split('T')[0]);
    const [showInPayslip, setShowInPayslip] = useState(initialData?.showInPayslip ?? true);
    const [taxTreatment, setTaxTreatment] = useState(initialData?.taxable && initialData.taxable !== 'Tax Deductible' ? initialData.taxable : 'Fully Taxable');
    const [error, setError] = useState<string | null>(null);

    const [localSelectedTarget, setLocalSelectedTarget] = useState(() => {
        if (initialData?.targetId && initialData?.targetType) {
            const prefix = initialData.targetType === 'Paygroup' ? 'pg' : 'bu';
            return `${prefix}:${initialData.targetId}`;
        }
        return selectedTarget === 'all' ? "bu:MindInventory" : selectedTarget;
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
            taxable: taxTreatment as any,
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
                    <div className="w-1/2 hidden">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Business Unit or Paygroup <span className="text-rose-500">*</span></label>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>

                    {/* Calculation Method, Enter Amount & Tax Treatment */}
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
                                    className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-slate-800"
                                />
                                <div className="absolute right-0 top-0 h-full px-3 bg-slate-100 border-l border-slate-200 rounded-r-lg flex items-center text-slate-500 font-medium text-sm">
                                    {calcMethod === 'Percentage' ? '%' : '₹'}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Tax Treatment <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <select
                                    value={taxTreatment}
                                    onChange={(e) => setTaxTreatment(e.target.value as any)}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 appearance-none bg-white text-slate-700 font-medium"
                                >
                                    <option value="Fully Taxable">Fully Taxable</option>
                                    <option value="Fully Exempt">Fully Exempt</option>
                                    <option value="Partially Exempt">Partially Exempt</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1.5">
                                {taxTreatment === 'Fully Taxable' && "Entire amount is added to taxable income."}
                                {taxTreatment === 'Fully Exempt' && "Entire amount is exempt from income tax."}
                                {taxTreatment === 'Partially Exempt' && "Only a part of the amount is exempt; the rest is taxable."}
                            </p>
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
    const [selectedTarget, setSelectedTarget] = useState('all');
    const [paygroups, setPaygroups] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery, selectedTarget]);

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
            .order('created_at', { ascending: false });

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
                targetType: item.target_type,
                considerGratuity: item.consider_gratuity,
                isProRata: item.is_pro_rata,
                deductionTiming: item.deduction_timing,
                includeMonthlyPayout: item.include_monthly_payout,
                prorateDojDol: item.prorate_doj_dol,
                includeInFirstSalaryDeduction: item.include_in_first_salary,
                includeInFirstSalary: item.include_in_first_salary,
                includeArrears: item.include_arrears,
                roundOffSetting: item.round_off_setting,
                taxComputation: item.tax_computation,
                incomeTaxSection: item.income_tax_section,
                sectionMaxLimit: item.section_max_limit,
                nonTaxableLimit: item.non_taxable_limit,
                includeInCTC: item.include_in_ctc,
                includeInGross: item.include_in_gross,
                includeInPayout: item.include_in_payout,
                considerPT: item.consider_pt,
                considerLWF: item.consider_lwf,
                considerLeaveEncashment: item.consider_leave_encashment,
                showOnSalaryRegister: item.show_on_salary_register,
                showRateOnSalarySlip: item.show_rate_on_salary_slip
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
    const tabs = ['Earnings', 'Deductions'];

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

        const filtered = allComponents.filter(c => {
            if (c.category !== activeTab) return false;
            
            // Filter out specific components in Deductions tab as requested
            if (activeTab === 'Deductions') {
                const forbiddenNames = [
                    'esi (employee)',
                    'professional tax',
                    'provident fund (employee)',
                    'professional tax (pt)'
                ];
                const normalizedName = c.name.trim().toLowerCase();
                if (forbiddenNames.some(fn => normalizedName.includes(fn))) return false;
            }
            return true;
        });
        
        if (!searchQuery.trim()) return filtered;
        
        const query = searchQuery.toLowerCase();
        return filtered.filter(c => 
            c.name.toLowerCase().includes(query) || 
            (c.payslipName && c.payslipName.toLowerCase().includes(query))
        );
    }, [components, activeTab, selectedTarget, searchQuery]);

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
            consider_gratuity: data.considerGratuity,
            effective_date: data.effectiveDate,
            deduction_type: data.deductionType,
            show_in_payslip: data.showInPayslip,
            target_id: data.targetId,
            target_type: data.targetType,
            is_pro_rata: data.isProRata,
            deduction_timing: data.deductionTiming,
            include_monthly_payout: data.includeMonthlyPayout,
            prorate_doj_dol: data.prorateDojDol,
            include_in_first_salary: data.includeInFirstSalaryDeduction || data.includeInFirstSalary,
            include_arrears: data.includeArrears,
            round_off_setting: data.roundOffSetting,
            tax_computation: data.taxComputation,
            income_tax_section: data.incomeTaxSection,
            section_max_limit: data.sectionMaxLimit,
            non_taxable_limit: data.nonTaxableLimit,
            include_in_ctc: data.includeInCTC,
            include_in_gross: data.includeInGross,
            include_in_payout: data.includeInPayout,
            consider_pt: data.considerPT,
            consider_lwf: data.considerLWF,
            consider_leave_encashment: data.considerLeaveEncashment,
            show_on_salary_register: data.showOnSalaryRegister,
            show_rate_on_salary_slip: data.showRateOnSalarySlip,
            last_updated_by: 'Admin'
        } as any;

        try {
            if (editingComponent) {
                const isMock = editingComponent.id.startsWith('mock-');
                if (isMock) {
                    payload.created_by = 'Admin';
                    const { error } = await supabase
                        .from('salary_components')
                        .insert([payload]);

                    if (error) throw error;
                } else {
                    const { error } = await supabase
                        .from('salary_components')
                        .update(payload)
                        .eq('id', editingComponent.id);

                    if (error) throw error;
                }
            } else {
                payload.created_by = 'Admin';
                const { error } = await supabase
                    .from('salary_components')
                    .insert([payload]);

                if (error) throw error;
            }
            fetchComponents();
            handleCancel();
        } catch (err: any) {
            console.error('Error saving component:', err);
            alert(`Failed to save component: ${err.message || 'Unknown error'}`);
        }
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
                                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
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
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400 shadow-sm"
                                />
                            </div>

                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                                Filter
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative hidden">
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
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>

                            <button
                                onClick={() => setIsAdding(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm w-full sm:w-auto justify-center"
                            >
                                Add Component
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
                                            <th className="px-6 py-4">Taxable Earning</th>
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
                                                    <th className="px-6 py-4">Nature of Deduction</th>
                                                    <th className="px-6 py-4">Calculation Method</th>
                                                    <th className="px-6 py-4">Taxable deduction</th>
                                                    <th className="px-6 py-4">Deduction Timing</th>
                                                </>
                                            )}
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
                                        <td colSpan={9} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                                <span>Loading components...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredData.length > 0 ? (
                                    filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((item) => (
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
                                                    <td className="px-6 py-4 font-medium text-slate-700">{item.taxable !== 'Fully Exempt' ? 'Yes' : 'No'}</td>
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
                                                            <td className="px-6 py-4">
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                                                                    {item.type === 'Variable Pay' ? 'Variable' : 'Fixed'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-600 font-medium">{item.calculation || '-'}</td>
                                                            <td className="px-6 py-4 font-medium text-slate-700">{item.taxable !== 'Tax Deductible' ? 'Yes' : 'No'}</td>
                                                            <td className="px-6 py-4 font-medium text-slate-700">{item.deductionTiming || '-'}</td>
                                                        </>
                                                    )}
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
                                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${item.status ? 'bg-sky-500' : 'bg-slate-200'}`}
                                                        title={item.status ? 'Deactivate' : 'Activate'}
                                                    >
                                                        <span
                                                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${item.status ? 'translate-x-5' : 'translate-x-1'}`}
                                                        />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const isBasic = item.name?.trim().toLowerCase() === 'basic';
                                                            const isRestricted = isBasic || item.isSystem;
                                                            if (!isRestricted) {
                                                                handleDeleteClick(item.id);
                                                            }
                                                        }}
                                                        disabled={item.name?.trim().toLowerCase() === 'basic' || item.isSystem}
                                                        className={`p-1.5 rounded-md transition-colors ${
                                                            (item.name?.trim().toLowerCase() === 'basic' || item.isSystem)
                                                                ? 'text-slate-200 cursor-not-allowed bg-slate-50/50' 
                                                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                                        }`}
                                                        title={(item.name?.trim().toLowerCase() === 'basic' || item.isSystem) ? "System defined components cannot be deleted." : "Delete"}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
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

                    {/* Pagination */}
                    {filteredData.length > 0 && (
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-slate-500">
                                Showing <span className="font-medium text-slate-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                                <span className="font-medium text-slate-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)}</span> of{' '}
                                <span className="font-medium text-slate-700">{filteredData.length}</span> entries
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={16} className="text-slate-600" />
                                </button>
                                {[...Array(Math.ceil(filteredData.length / ITEMS_PER_PAGE))].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                            currentPage === i + 1
                                                ? 'bg-purple-600 text-white shadow-sm'
                                                : 'text-slate-600 hover:bg-white border border-transparent hover:border-slate-200'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredData.length / ITEMS_PER_PAGE)))}
                                    disabled={currentPage === Math.ceil(filteredData.length / ITEMS_PER_PAGE)}
                                    className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={16} className="text-slate-600" />
                                </button>
                            </div>
                        </div>
                    )}
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
