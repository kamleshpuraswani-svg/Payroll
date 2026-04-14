import React, { useState, useEffect } from 'react';
import {
    Users, LayoutDashboard, Plus, Search, Filter, Trash2, Edit2, RotateCcw, CheckCircle, X, Download, Info, Check, MoreVertical,
    Sigma, ChevronDown, Tag, FileText, Calculator, Power, AlertTriangle, Clock
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface ComponentChangeHistory {
    id: string;
    timestamp: string;
    changedBy: string;
    field: string;
    oldValue: string;
    newValue: string;
}

interface SalaryComponent {
    id: string;
    name: string;
    type: 'Fixed Pay' | 'Variable Pay';
    calculation: string;
    taxable: 'Fully Taxable' | 'Partially Exempt' | 'Fully Exempt' | 'Tax Deductible';
    status: boolean;
    category: 'Earnings' | 'Deductions' | 'Benefits' | 'Reimbursements';
    // Additional fields for editing context
    amount_or_percent?: string;
    calc_method?: 'Flat' | 'Percentage';
    payslip_name?: string;
    frequency?: 'One-time' | 'Recurring';
    // New fields for Earnings list view
    consider_epf?: boolean;
    consider_esi?: boolean;
    last_modified?: string;
    created?: string;
    effective_date?: string;
    deduction_type?: 'Statutory' | 'Non-Statutory';
    show_in_payslip?: boolean;
    round_off_setting?: 'Floor' | 'Ceiling';
    tax_computation?: 'Proportionally' | 'Pay month';
    income_tax_section?: string;
    section_max_limit?: string;
    non_taxable_limit?: string;
    include_in_ctc?: boolean;
    include_in_gross?: boolean;
    include_monthly_payout?: boolean;
    include_in_first_salary?: boolean;
    include_arrears?: boolean;
    is_pro_rata?: boolean;
    prorate_doj_dol?: boolean;
    consider_gratuity?: boolean;
    consider_pt?: boolean;
    consider_lwf?: boolean;
    consider_leave_encashment?: boolean;
    show_on_salary_register?: boolean;
    show_rate_on_salary_slip?: boolean;
    history?: ComponentChangeHistory[];
}

interface AddEarningFormProps {
    onCancel: () => void;
    onSave: (data: Partial<SalaryComponent>) => void;
    initialData?: SalaryComponent | null;
    userRole?: string;
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

const addHistory = (label: string, oldVal: any, newVal: any): ComponentChangeHistory | null => {
    if (String(oldVal) === String(newVal)) return null;
    return {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        }),
        changedBy: 'Admin',
        field: label,
        oldValue: String(oldVal || 'None'),
        newValue: String(newVal || 'None')
    };
};

// --- Mock Data ---
const INITIAL_DATA: SalaryComponent[] = [
    // Earnings
    {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Basic',
        type: 'Fixed Pay',
        calculation: '50% of CTC',
        taxable: 'Fully Taxable',
        status: true,
        category: 'Earnings',
        amount_or_percent: '50',
        calc_method: 'Percentage',
        payslip_name: 'Basic',
        consider_epf: true,
        consider_esi: true,
        last_modified: 'By Kamlesh P.\nAt 6:38 PM, Nov 17, 2025',
        created: 'By Kamlesh P.\nAt 5:38 PM, Nov 17, 2025',
        effective_date: '2025-04-01'
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'House Rent Allowance',
        type: 'Fixed Pay',
        calculation: '50% of Basic',
        taxable: 'Partially Exempt',
        status: true,
        category: 'Earnings',
        amount_or_percent: '50',
        calc_method: 'Percentage',
        payslip_name: 'HRA',
        consider_epf: true,
        consider_esi: true,
        last_modified: 'By Kamlesh P.\nAt 6:38 PM, Nov 17, 2025',
        created: 'By Kamlesh P.\nAt 5:38 PM, Nov 17, 2025',
        effective_date: '2025-04-01'
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Fixed Allowance',
        type: 'Fixed Pay',
        calculation: 'Flat Rs. 5000',
        taxable: 'Fully Taxable',
        status: true,
        category: 'Earnings',
        amount_or_percent: '5000',
        calc_method: 'Flat',
        payslip_name: 'Special Allow',
        consider_epf: true,
        consider_esi: true,
        last_modified: 'By Kamlesh P.\nAt 6:38 PM, Nov 17, 2025',
        created: 'By Kamlesh P.\nAt 5:38 PM, Nov 17, 2025'
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Commission',
        type: 'Variable Pay',
        calculation: '10% of Basic',
        taxable: 'Partially Exempt',
        status: true,
        category: 'Earnings',
        amount_or_percent: '10',
        calc_method: 'Percentage',
        payslip_name: 'Commission',
        consider_epf: true,
        consider_esi: true,
        last_modified: 'By Kamlesh P.\nAt 6:38 PM, Nov 17, 2025',
        created: 'By Kamlesh P.\nAt 5:38 PM, Nov 17, 2025'
    },

    // Benefits (Data kept for future use, tab hidden)
    { id: '550e8400-e29b-41d4-a716-446655440011', name: 'Provident Fund (Employer)', type: 'Variable Pay', calculation: '12% of Basic', taxable: 'Fully Exempt', status: true, category: 'Benefits' },

    // Reimbursements
    { id: '550e8400-e29b-41d4-a716-446655440014', name: 'Medical Reimbursement', type: 'Fixed Pay', calculation: 'Up to ₹ 15,000', taxable: 'Partially Exempt', status: true, category: 'Reimbursements', amount_or_percent: '15000', payslip_name: 'Medical Reimb', calc_method: 'Flat' },
    { id: '550e8400-e29b-41d4-a716-446655440015', name: 'Fuel Reimbursement', type: 'Variable Pay', calculation: 'As per bills', taxable: 'Partially Exempt', status: true, category: 'Reimbursements', amount_or_percent: '0', payslip_name: 'Fuel', calc_method: 'Flat' },
    { id: '550e8400-e29b-41d4-a716-446655440016', name: 'Books & Periodicals', type: 'Fixed Pay', calculation: '₹ 1,000 / month', taxable: 'Fully Exempt', status: false, category: 'Reimbursements', amount_or_percent: '1000', payslip_name: 'Books', calc_method: 'Flat' },
    { id: '550e8400-e29b-41d4-a716-446655440020', name: 'Driver Salary', type: 'Fixed Pay', calculation: 'Up to ₹ 10,000', taxable: 'Fully Exempt', status: true, category: 'Reimbursements', amount_or_percent: '10000', payslip_name: 'Driver', calc_method: 'Flat' },
    { id: '550e8400-e29b-41d4-a716-446655440021', name: 'Internet Reimbursement', type: 'Fixed Pay', calculation: 'Flat ₹ 1,000', taxable: 'Fully Exempt', status: true, category: 'Reimbursements', amount_or_percent: '1000', payslip_name: 'Internet', calc_method: 'Flat' },
    { id: '550e8400-e29b-41d4-a716-446655440022', name: 'Food Coupons', type: 'Fixed Pay', calculation: '₹ 2,200 / month', taxable: 'Fully Exempt', status: true, category: 'Reimbursements', amount_or_percent: '2200', payslip_name: 'Food Coupons', calc_method: 'Flat' },
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
const AddEarningComponentForm: React.FC<AddEarningFormProps> = ({ onCancel, onSave, initialData, userRole }) => {
    const [activeTab, setActiveTab] = useState<'Configuration' | 'History'>('Configuration');
    const [name, setName] = useState(initialData?.name || '');
    const [availableEarnings, setAvailableEarnings] = useState<{ id: string, name: string }[]>([]);
    const [isLoadingEarnings, setIsLoadingEarnings] = useState(false);
    const [history] = useState<ComponentChangeHistory[]>(initialData?.history || []);
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

    useEffect(() => {
        if (userRole === 'HR_MANAGER') {
            const fetchAvailableEarnings = async () => {
                setIsLoadingEarnings(true);
                try {
                    const { data, error } = await supabase
                        .from('salary_components')
                        .select('id, name')
                        .eq('category', 'Earnings')
                        .eq('status', true);

                    if (error) throw error;
                    if (data) {
                        setAvailableEarnings(data);
                    }
                } catch (err) {
                    console.error('Error fetching available earnings:', err);
                } finally {
                    setIsLoadingEarnings(false);
                }
            };
            fetchAvailableEarnings();
        }
    }, [userRole]);

    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [customName, setCustomName] = useState('');
    const [payslip_name, setPayslip_name] = useState(initialData?.payslip_name || '');
    const [effective_date, setEffective_date] = useState(initialData?.effective_date || '');
    const [natureOfPay, setNatureOfPay] = useState<'Fixed' | 'Variable'>(
        initialData?.type === 'Variable Pay' ? 'Variable' : 'Fixed'
    );
    const [calc_method, setCalc_method] = useState<'Flat' | 'Percentage'>(
        initialData?.calc_method || 'Flat'
    );
    const [amount_or_percent, setAmount_or_percent] = useState(initialData?.amount_or_percent || '');
    const [selectedComponents, setSelectedComponents] = useState<string[]>(['CTC']);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Configurations
    const [isTaxable, setIsTaxable] = useState(initialData?.taxable !== 'Fully Exempt');
    const [taxTreatment, setTaxTreatment] = useState<'Fully Taxable' | 'Partially Exempt' | 'Fully Exempt'>(initialData?.tax_treatment || 'Fully Taxable');
    const [isProRata, setIsProRata] = useState(true);
    const [epfContribution, setEpfContribution] = useState<'Always' | 'Limit'>('Always');
    const [consider_epf, setConsider_epf] = useState(initialData?.consider_epf ?? true);
    const [consider_esi, setConsider_esi] = useState(initialData?.consider_esi ?? true);
    const [include_in_ctc, setInclude_in_ctc] = useState(initialData?.include_in_ctc ?? false);
    const [include_in_gross, setInclude_in_gross] = useState(initialData?.include_in_gross ?? false);
    const [include_in_first_salary, setInclude_in_first_salary] = useState(initialData?.include_in_first_salary ?? true);
    const [include_in_payout, setInclude_in_payout] = useState(initialData?.include_in_payout ?? false);
    const [consider_gratuity, setConsider_gratuity] = useState(initialData?.consider_gratuity ?? true);
    const [consider_pt, setConsider_pt] = useState(initialData?.consider_pt ?? false);
    const [consider_lwf, setConsider_lwf] = useState(initialData?.consider_lwf ?? false);
    const [consider_leave_encashment, setConsider_leave_encashment] = useState(initialData?.consider_leave_encashment ?? false);
    const [showInPayslip, setShowInPayslip] = useState(true);
    const [show_on_salary_register, setShow_on_salary_register] = useState(initialData?.show_on_salary_register ?? false);
    const [show_rate_on_salary_slip, setShow_rate_on_salary_slip] = useState(initialData?.show_rate_on_salary_slip ?? false);
    const [isActive, setIsActive] = useState(initialData?.status ?? true);
    const [round_off_setting, setRound_off_setting] = useState<'Floor' | 'Ceiling'>(initialData?.round_off_setting || 'Floor');
    const [tax_computation, setTax_computation] = useState<'Proportionally' | 'Pay month'>(initialData?.tax_computation || 'Proportionally');
    const [income_tax_section, setIncome_tax_section] = useState(initialData?.income_tax_section || '');
    const [section_max_limit, setSection_max_limit] = useState(initialData?.section_max_limit || '');
    const [non_taxable_limit, setNon_taxable_limit] = useState(initialData?.non_taxable_limit || '');
    const [isCreatingSection, setIsCreatingSection] = useState(false);
    const [customTaxSection, setCustomTaxSection] = useState('');
    const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        const finalName = isOtherSelected ? customName : name;
        if (userRole === 'HR_MANAGER' && (!finalName || !effective_date)) {
            if (!effective_date) setError('Effective Date is mandatory');
            else setError('Component Name is mandatory');
            return;
        }
        setError(null);
        const calculateString = natureOfPay === 'Fixed'
            ? (calc_method === 'Flat' ? `Flat ₹${amount_or_percent}` : `${amount_or_percent}% of ${selectedComponents.join(', ')}`)
            : 'Variable';

        const newHistoryRecords: ComponentChangeHistory[] = [];
        if (initialData) {
            const h1 = addHistory('Name', initialData.name, finalName); if (h1) newHistoryRecords.push(h1);
            const h2 = addHistory('Payslip Name', initialData.payslip_name, payslip_name); if (h2) newHistoryRecords.push(h2);
            const h3 = addHistory('Effective Date', initialData.effective_date, effective_date); if (h3) newHistoryRecords.push(h3);
            const h4 = addHistory('Type', initialData.type, natureOfPay === 'Variable' ? 'Variable Pay' : 'Fixed Pay'); if (h4) newHistoryRecords.push(h4);
            const h5 = addHistory('Calc Method', initialData.calc_method, calc_method); if (h5) newHistoryRecords.push(h5);
            const h6 = addHistory('Amount/Percent', initialData.amount_or_percent, amount_or_percent); if (h6) newHistoryRecords.push(h6);
            const h7 = addHistory('Taxable', initialData.taxable, isTaxable ? 'Fully Taxable' : 'Fully Exempt'); if (h7) newHistoryRecords.push(h7);
            const h8 = addHistory('Status', initialData.status, isActive); if (h8) newHistoryRecords.push(h8);
        }

        const updatedData: Partial<SalaryComponent> = {
            name: finalName,
            payslip_name,
            effective_date,
            type: natureOfPay === 'Variable' ? 'Variable Pay' : 'Fixed Pay',
            calc_method: natureOfPay === 'Fixed' ? calc_method : undefined,
            amount_or_percent: natureOfPay === 'Fixed' ? amount_or_percent : undefined,
            calculation: calculateString,
            taxable: isTaxable ? 'Fully Taxable' : 'Fully Exempt',
            consider_epf: consider_epf,
            consider_esi: consider_esi,
            status: isActive,
            category: 'Earnings',
            round_off_setting: round_off_setting,
            tax_computation: isTaxable ? tax_computation : undefined,
            income_tax_section: isTaxable ? (isCreatingSection ? customTaxSection : income_tax_section) : undefined,
            section_max_limit: (isTaxable && taxTreatment === 'Fully Taxable') ? section_max_limit : undefined,
            non_taxable_limit: (isTaxable && taxTreatment === 'Partially Exempt') ? non_taxable_limit : undefined,
            include_in_ctc,
            include_in_gross,
            include_in_first_salary,
            include_in_payout,
            consider_gratuity,
            consider_pt,
            consider_lwf,
            consider_leave_encashment,
            show_on_salary_register,
            show_rate_on_salary_slip,
            history: [...newHistoryRecords, ...(initialData?.history || [])]
        };
        onSave(updatedData);
    };

    if (activeTab === 'History') {
        const selectedIndex = selectedRecordId ? history.findIndex(r => r.id === selectedRecordId) : 0;
        
        return (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 flex flex-col h-[85vh] max-w-6xl mx-auto mt-6">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setActiveTab('Configuration')} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><ChevronDown size={20} className="rotate-90 text-slate-600" /></button>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Audit History: {name || 'New Component'}</h2>
                            <p className="text-sm text-slate-500">Track all modifications and configuration changes</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-all group">
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/30">
                        <div className="p-4 border-b border-slate-100 bg-white/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input type="text" placeholder="Search history..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                            {history.length === 0 ? (
                                <div className="text-center py-10 px-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3"><Clock className="text-slate-400" size={20} /></div>
                                    <p className="text-slate-500 text-sm font-medium">No history available</p>
                                </div>
                            ) : (
                                history.map((record, index) => (
                                    <button
                                        key={record.id}
                                        onClick={() => setSelectedRecordId(record.id)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${selectedRecordId === record.id || (!selectedRecordId && index === 0) ? 'bg-white border-purple-200 shadow-md ring-1 ring-purple-100' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{record.timestamp}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 mb-1">{record.field} Changed</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">A</div>
                                            <span className="text-xs text-slate-500 font-medium">{record.changedBy}</span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto bg-white p-10">
                        {history.length > 0 && (
                            <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center"><Clock className="text-purple-600" size={24} /></div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Modification Summary</h3>
                                        <p className="text-sm text-slate-500">Detailed overview of the changes made to the configuration.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Previous Configuration</h4>
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-slate-300" />
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{history[selectedIndex]?.field}</span>
                                                <span className="text-lg font-bold text-slate-800 line-through decoration-slate-300 decoration-2">{history[selectedIndex]?.oldValue}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-sky-500 uppercase tracking-widest pl-1">New Configuration</h4>
                                        <div className="bg-sky-50 rounded-2xl p-6 border border-sky-200/60 relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-sky-500" />
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">{history[selectedIndex]?.field}</span>
                                                <span className="text-lg font-bold text-slate-900">{history[selectedIndex]?.newValue}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 text-center">
                                    <p className="text-xs text-slate-400">Captured by System Audit Engine • Version 2.4.0</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-w-4xl mx-auto mt-6 flex flex-col h-[85vh]">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-slate-800">{initialData ? `Edit ${name}` : 'Add Earning Component'}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isActive ? 'Currently Active' : 'Currently Inactive'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-200 rounded-lg p-1 flex gap-1 shadow-sm mr-4">
                        <button
                            onClick={() => setActiveTab('Configuration')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'Configuration' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Configuration
                        </button>
                        <button
                            onClick={() => setActiveTab('History')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'History' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            History
                        </button>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-all group">
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-10">
                    <section className="space-y-6">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Component Name <span className="text-rose-500">*</span></label>
                                {userRole === 'HR_MANAGER' ? (
                                    <div className="relative">
                                        <select
                                            value={isOtherSelected ? 'others' : name}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (val === 'others') {
                                                    setIsOtherSelected(true);
                                                    setName('');
                                                } else {
                                                    setIsOtherSelected(false);
                                                    setName(val);
                                                    if (!payslip_name) setPayslip_name(val);
                                                }
                                            }}
                                            disabled={isLoadingEarnings}
                                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all appearance-none"
                                        >
                                            <option value="">Select Component</option>
                                            {availableEarnings.map(comp => (
                                                <option key={comp.id} value={comp.name}>{comp.name}</option>
                                            ))}
                                            <option value="others">+ Others</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Basic Salary"
                                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all"
                                    />
                                )}
                                {userRole === 'HR_MANAGER' && isOtherSelected && (
                                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                        <label className="block text-[10px] font-bold text-purple-600 mb-1.5 uppercase tracking-wider">Custom Component Name <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            value={customName}
                                            onChange={e => { setCustomName(e.target.value); if (!payslip_name) setPayslip_name(e.target.value); }}
                                            placeholder="Enter Custom Name"
                                            className="w-full px-4 py-3 bg-purple-50/10 border border-purple-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Name in Payslip <span className="text-rose-500">*</span></label>
                                <input
                                    type="text"
                                    value={payslip_name}
                                    onChange={(e) => setPayslip_name(e.target.value)}
                                    placeholder="e.g. Basic"
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Effective Date <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="date"
                                        value={effective_date}
                                        onChange={(e) => setEffective_date(e.target.value)}
                                        className={`w-full pl-12 pr-4 py-3 bg-slate-50/50 border rounded-xl text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all ${error && !effective_date ? 'border-rose-500' : 'border-slate-200'}`}
                                    />
                                </div>
                                {error && !effective_date && <p className="text-[10px] text-rose-500 mt-1 font-bold">{error}</p>}
                            </div>
                        </div>
                    </section>

                    <div className="h-px bg-slate-100" />

                    <section className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Calculator size={18} className="text-purple-600" />
                            Calculation Basis
                        </h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3" style={{ display: 'none' }}>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Pay Type</label>
                                <div className="flex p-1.5 bg-slate-100/50 rounded-xl border border-slate-200/60 shadow-inner">
                                    {['Fixed', 'Variable'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setNatureOfPay(t as any)}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${natureOfPay === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            {t} Pay
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Calculation Method</label>
                                <div className="flex p-1.5 bg-slate-100/50 rounded-xl border border-slate-200/60 shadow-inner">
                                    {['Flat', 'Percentage'].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setCalc_method(m as any)}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${calc_method === m ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            {m === 'Flat' ? 'Flat Amount' : 'Percentage'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Value</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={amount_or_percent}
                                        onChange={(e) => setAmount_or_percent(e.target.value)}
                                        placeholder={calc_method === 'Percentage' ? 'e.g. 50' : 'e.g. 10000'}
                                        className="w-full pl-4 pr-14 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all"
                                    />
                                    <div className="absolute right-0 top-0 h-full px-4 bg-slate-100/80 border-l border-slate-200 rounded-r-xl flex items-center text-slate-500 font-bold text-sm">
                                        {calc_method === 'Percentage' ? '%' : '₹'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {calc_method === 'Percentage' && (
                            <div className="relative max-w-sm">
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:border-purple-500 outline-none flex items-center justify-between group hover:bg-white transition-all shadow-sm"
                                >
                                    <span className="text-slate-700 flex items-center gap-2 uppercase tracking-tighter text-[10px] font-black">
                                        <Sigma className="text-slate-400" size={12} />
                                        OF {selectedComponents.join(', ')}
                                    </span>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                                        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100 overflow-hidden ring-1 ring-slate-200/50">
                                            {['CTC', 'Basic'].map(comp => (
                                                <label key={comp} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer group transition-colors">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedComponents.includes(comp) ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white group-hover:border-purple-400'}`}>
                                                        {selectedComponents.includes(comp) && <Check size={14} className="text-white" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={selectedComponents.includes(comp)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedComponents(prev => [...prev, comp]);
                                                            else setSelectedComponents(prev => prev.filter(c => c !== comp));
                                                        }}
                                                    />
                                                    <span className="text-sm text-slate-700 font-bold">{comp}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </section>

                    <div className="h-px bg-slate-100" />

                    <section className="space-y-8">
                        <div className="flex items-center justify-between mb-2">
                             <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                                <Sigma size={18} className="text-purple-600" />
                                Configuration & Statutory
                            </h3>
                            <button onClick={() => setIsActive(!isActive)} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'}`}>
                                {isActive ? 'Active Status' : 'Inactive Status'}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <label className="flex items-center justify-between cursor-pointer group bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-purple-200 transition-all duration-300">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">PF (Provident Fund)</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight transition-colors">Consider for PF Contribution</span>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${consider_epf ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${consider_epf ? 'left-7' : 'left-1'}`} />
                                        <input type="checkbox" className="hidden" checked={consider_epf} onChange={() => setConsider_epf(!consider_epf)} />
                                    </div>
                                </label>

                                <label className="flex items-center justify-between cursor-pointer group bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-purple-200 transition-all duration-300">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">ESI contribution</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight transition-colors">Consider for ESI Contribution</span>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${consider_esi ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${consider_esi ? 'left-7' : 'left-1'}`} />
                                        <input type="checkbox" className="hidden" checked={consider_esi} onChange={() => setConsider_esi(!consider_esi)} />
                                    </div>
                                </label>

                                <label className="flex items-center justify-between cursor-pointer group bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-purple-200 transition-all duration-300">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">Taxable Earning</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight transition-colors">Consider for Income Tax</span>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isTaxable ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isTaxable ? 'left-7' : 'left-1'}`} />
                                        <input type="checkbox" className="hidden" checked={isTaxable} onChange={() => setIsTaxable(!isTaxable)} />
                                    </div>
                                </label>
                            </div>

                            <div className="space-y-6">
                                <label className="flex items-center justify-between cursor-pointer group bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-purple-200 transition-all duration-300">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">Include in CTC</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight transition-colors">Affects Annual CTC calculation</span>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${include_in_ctc ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${include_in_ctc ? 'left-7' : 'left-1'}`} />
                                        <input type="checkbox" className="hidden" checked={include_in_ctc} onChange={() => setInclude_in_ctc(!include_in_ctc)} />
                                    </div>
                                </label>

                                <label className="flex items-center justify-between cursor-pointer group bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-purple-200 transition-all duration-300">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">Gross Salary</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight transition-colors">Include in Gross Salary Sum</span>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${include_in_gross ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${include_in_gross ? 'left-7' : 'left-1'}`} />
                                        <input type="checkbox" className="hidden" checked={include_in_gross} onChange={() => setInclude_in_gross(!include_in_gross)} />
                                    </div>
                                </label>

                                <label className="flex items-center justify-between cursor-pointer group bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-purple-200 transition-all duration-300">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">First Salary Only</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight transition-colors">Include in employee's first salary</span>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${include_in_first_salary ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${include_in_first_salary ? 'left-7' : 'left-1'}`} />
                                        <input type="checkbox" className="hidden" checked={include_in_first_salary} onChange={() => setInclude_in_first_salary(!include_in_first_salary)} />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <div className="px-10 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                <button onClick={onCancel} className="px-8 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-all border border-slate-200 rounded-xl bg-white hover:bg-slate-50">Cancel</button>
                <button
                    onClick={handleSave}
                    className="px-10 py-2.5 text-sm font-black text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-lg shadow-purple-200 transition-all active:scale-[0.98] uppercase tracking-widest"
                >
                    {initialData ? 'Update Component' : 'Create Component'}
                </button>
            </div>
        </div>
    );
};

// --- Detailed Add Deduction Form ---
const AddDeductionComponentForm: React.FC<AddEarningFormProps> = ({ onCancel, onSave, initialData, userRole }) => {
    const [activeTab, setActiveTab] = useState<'Configuration' | 'History'>('Configuration');
    const [name, setName] = useState(initialData?.name || '');
    const [availableDeductions, setAvailableDeductions] = useState<{ id: string, name: string }[]>([]);
    const [isLoadingDeductions, setIsLoadingDeductions] = useState(false);
    const [history, setHistory] = useState<ComponentChangeHistory[]>(initialData?.history || []);
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

    useEffect(() => {
        if (userRole === 'HR_MANAGER') {
            const fetchAvailableDeductions = async () => {
                setIsLoadingDeductions(true);
                try {
                    const { data, error } = await supabase
                        .from('salary_components')
                        .select('id, name')
                        .eq('category', 'Deductions')
                        .eq('status', true);

                    if (error) throw error;
                    if (data) {
                        setAvailableDeductions(data);
                    }
                } catch (err) {
                    console.error('Error fetching available deductions:', err);
                } finally {
                    setIsLoadingDeductions(false);
                }
            };
            fetchAvailableDeductions();
        }
    }, [userRole]);

    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [customName, setCustomName] = useState('');
    const [payslip_name, setPayslip_name] = useState(initialData?.payslip_name || '');
    const [frequency, setFrequency] = useState<'One-time' | 'Recurring'>(initialData?.frequency || 'One-time');
    const [isActive, setIsActive] = useState(initialData?.status ?? true);
    const [show_in_payslip, setShow_in_payslip] = useState(initialData?.show_in_payslip ?? false);
    const [effective_date, setEffective_date] = useState(initialData?.effective_date || new Date().toISOString().split('T')[0]);
    const [deduction_type, setDeduction_type] = useState<'Statutory' | 'Non-Statutory'>(initialData?.deduction_type || 'Statutory');

    const [calc_method, setCalc_method] = useState<'Flat' | 'Percentage'>(
        initialData?.calc_method || 'Flat'
    );
    const [amount_or_percent, setAmount_or_percent] = useState(initialData?.amount_or_percent || '');
    const [selectedComponents, setSelectedComponents] = useState<string[]>(['CTC']);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // New Fields
    const [isProRata, setIsProRata] = useState(initialData?.is_pro_rata ?? false);
    const [includeMonthlyPayout, setIncludeMonthlyPayout] = useState(initialData?.include_monthly_payout ?? false);
    const [prorateDojDol, setProrateDojDol] = useState(initialData?.prorate_doj_dol ?? false);
    const [includeInFirstSalary, setIncludeInFirstSalary] = useState(initialData?.include_in_first_salary ?? false);
    const [includeArrears, setIncludeArrears] = useState(initialData?.include_arrears ?? false);

    const handleSave = () => {
        const finalName = isOtherSelected ? customName : name;
        if (userRole === 'HR_MANAGER' && (!finalName || !effective_date)) {
            if (!effective_date) setError('Effective Date is mandatory');
            else setError('Component Name is mandatory');
            return;
        }
        setError(null);

        const newHistoryEntries: ComponentChangeHistory[] = [];
        if (initialData) {
            const changes = [
                { label: 'Name', old: initialData.name, new: finalName },
                { label: 'Payslip Name', old: initialData.payslip_name, new: payslip_name },
                { label: 'Amount/Percent', old: initialData.amount_or_percent, new: amount_or_percent },
                { label: 'Calculation Method', old: initialData.calc_method, new: calc_method },
                { label: 'Status', old: initialData.status, new: isActive },
                { label: 'Pro-rata', old: initialData.is_pro_rata, new: isProRata },
                { label: 'Effective Date', old: initialData.effective_date, new: effective_date },
                { label: 'Include Monthly Payout', old: initialData.include_monthly_payout, new: includeMonthlyPayout },
                { label: 'Prorate DOJ/DOL', old: initialData.prorate_doj_dol, new: prorateDojDol },
                { label: 'Include In First Salary', old: initialData.include_in_first_salary, new: includeInFirstSalary },
                { label: 'Include Arrears', old: initialData.include_arrears, new: includeArrears },
            ];

            changes.forEach(c => {
                const entry = addHistory(c.label, c.old, c.new);
                if (entry) newHistoryEntries.push(entry);
            });
        }

        const calculateString = calc_method === 'Flat'
            ? 'Fixed Amount'
            : `% of ${selectedComponents.join(', ')}`;

        const updatedData: Partial<SalaryComponent> = {
            name: finalName,
            payslip_name,
            effective_date,
            amount_or_percent: amount_or_percent,
            status: isActive,
            type: 'Fixed Pay',
            category: 'Deductions',
            calc_method: calc_method,
            calculation: calculateString,
            taxable: 'Tax Deductible',
            is_pro_rata: isProRata,
            show_in_payslip: show_in_payslip,
            include_monthly_payout: includeMonthlyPayout,
            prorate_doj_dol: prorateDojDol,
            include_in_first_salary: includeInFirstSalary,
            include_arrears: includeArrears,
            history: [...newHistoryEntries, ...history]
        };
        onSave(updatedData);
    };

    if (activeTab === 'History') {
        const selectedIndex = selectedRecordId ? history.findIndex(r => r.id === selectedRecordId) : 0;
        
        return (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 flex flex-col h-[85vh] max-w-6xl mx-auto mt-6">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setActiveTab('Configuration')} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><ChevronDown size={20} className="rotate-90 text-slate-600" /></button>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Audit History: {name || 'New Component'}</h2>
                            <p className="text-sm text-slate-500">Track all modifications and configuration changes</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-all group">
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/30">
                        <div className="p-4 border-b border-slate-100 bg-white/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input type="text" placeholder="Search history..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                            {history.length === 0 ? (
                                <div className="text-center py-10 px-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3"><Clock className="text-slate-400" size={20} /></div>
                                    <p className="text-slate-500 text-sm font-medium">No history available</p>
                                </div>
                            ) : (
                                history.map((record, index) => (
                                    <button
                                        key={record.id}
                                        onClick={() => setSelectedRecordId(record.id)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${selectedRecordId === record.id || (!selectedRecordId && index === 0) ? 'bg-white border-purple-200 shadow-md ring-1 ring-purple-100' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{record.timestamp}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 mb-1">{record.field} Changed</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">A</div>
                                            <span className="text-xs text-slate-500 font-medium">{record.changedBy}</span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto bg-white p-10">
                        {history.length > 0 && (
                            <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center"><Clock className="text-purple-600" size={24} /></div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Modification Summary</h3>
                                        <p className="text-sm text-slate-500">Detailed overview of the changes made to the configuration.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Previous Configuration</h4>
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-slate-300" />
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{history[selectedIndex]?.field}</span>
                                                <span className="text-lg font-bold text-slate-800 line-through decoration-slate-300 decoration-2">{history[selectedIndex]?.oldValue}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-sky-500 uppercase tracking-widest pl-1">New Configuration</h4>
                                        <div className="bg-sky-50 rounded-2xl p-6 border border-sky-200/60 relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-sky-500" />
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">{history[selectedIndex]?.field}</span>
                                                <span className="text-lg font-bold text-slate-900">{history[selectedIndex]?.newValue}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 text-center">
                                    <p className="text-xs text-slate-400">Captured by System Audit Engine • Version 2.4.0</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-w-4xl mx-auto mt-6 flex flex-col h-[85vh]">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-slate-800">{initialData ? `Edit ${name}` : 'Add Deduction Component'}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isActive ? 'Currently Active' : 'Currently Inactive'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-200 rounded-lg p-1 flex gap-1 shadow-sm mr-4">
                        <button
                            onClick={() => setActiveTab('Configuration')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'Configuration' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Configuration
                        </button>
                        <button
                            onClick={() => setActiveTab('History')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'History' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            History
                        </button>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-all group">
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-10">
                    <section className="space-y-6">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Component Name <span className="text-rose-500">*</span></label>
                                {userRole === 'HR_MANAGER' ? (
                                    <div className="relative">
                                        <select
                                            value={isOtherSelected ? 'others' : name}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (val === 'others') {
                                                    setIsOtherSelected(true);
                                                    setName('');
                                                } else {
                                                    setIsOtherSelected(false);
                                                    setName(val);
                                                    if (!payslip_name) setPayslip_name(val);
                                                }
                                            }}
                                            disabled={isLoadingDeductions}
                                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all appearance-none"
                                        >
                                            <option value="">Select Component</option>
                                            {availableDeductions.map(comp => (
                                                <option key={comp.id} value={comp.name}>{comp.name}</option>
                                            ))}
                                            <option value="others">+ Others</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Professional Tax"
                                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all"
                                    />
                                )}
                                {userRole === 'HR_MANAGER' && isOtherSelected && (
                                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                        <label className="block text-[10px] font-bold text-purple-600 mb-1.5 uppercase tracking-wider">Custom Component Name <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            value={customName}
                                            onChange={e => { setCustomName(e.target.value); if (!payslip_name) setPayslip_name(e.target.value); }}
                                            placeholder="Enter Custom Name"
                                            className="w-full px-4 py-3 bg-purple-50/10 border border-purple-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Name in Payslip <span className="text-rose-500">*</span></label>
                                <input
                                    type="text"
                                    value={payslip_name}
                                    onChange={(e) => setPayslip_name(e.target.value)}
                                    placeholder="e.g. PT"
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Effective Date <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="date"
                                        value={effective_date}
                                        onChange={(e) => setEffective_date(e.target.value)}
                                        className={`w-full pl-12 pr-4 py-3 bg-slate-50/50 border rounded-xl text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all ${error && !effective_date ? 'border-rose-500' : 'border-slate-200'}`}
                                    />
                                </div>
                                {error && !effective_date && <p className="text-[10px] text-rose-500 mt-1 font-bold">{error}</p>}
                            </div>
                        </div>
                    </section>

                    <div className="h-px bg-slate-100" />

                    <section className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Calculator size={18} className="text-purple-600" />
                            Calculation Basis
                        </h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Calculation Method</label>
                                <div className="flex p-1.5 bg-slate-100/50 rounded-xl border border-slate-200/60 shadow-inner">
                                    {['Flat', 'Percentage'].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setCalc_method(m as any)}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${calc_method === m ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            {m === 'Flat' ? 'Flat Amount' : 'Percentage'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Value</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={amount_or_percent}
                                        onChange={(e) => setAmount_or_percent(e.target.value)}
                                        placeholder={calc_method === 'Percentage' ? 'e.g. 10' : 'e.g. 500'}
                                        className="w-full pl-4 pr-14 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all"
                                    />
                                    <div className="absolute right-0 top-0 h-full px-4 bg-slate-100/80 border-l border-slate-200 rounded-r-xl flex items-center text-slate-500 font-bold text-sm">
                                        {calc_method === 'Percentage' ? '%' : '₹'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {calc_method === 'Percentage' && (
                            <div className="relative max-w-sm">
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:border-purple-500 outline-none flex items-center justify-between group hover:bg-white transition-all shadow-sm"
                                >
                                    <span className="text-slate-700 flex items-center gap-2 uppercase tracking-tighter text-[10px] font-black">
                                        <Sigma className="text-slate-400" size={12} />
                                        OF {selectedComponents.join(', ')}
                                    </span>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                                        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100 overflow-hidden ring-1 ring-slate-200/50">
                                            {['CTC', 'Basic'].map(comp => (
                                                <label key={comp} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer group transition-colors">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedComponents.includes(comp) ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white group-hover:border-purple-400'}`}>
                                                        {selectedComponents.includes(comp) && <Check size={14} className="text-white" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={selectedComponents.includes(comp)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedComponents(prev => [...prev, comp]);
                                                            else setSelectedComponents(prev => prev.filter(c => c !== comp));
                                                        }}
                                                    />
                                                    <span className="text-sm text-slate-700 font-bold">{comp}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </section>

                    <div className="h-px bg-slate-100" />

                    <section className="space-y-8">
                        <div className="flex items-center justify-between mb-2">
                             <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                                <Sigma size={18} className="text-purple-600" />
                                Configuration & Flags
                            </h3>
                            <button onClick={() => setIsActive(!isActive)} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'}`}>
                                {isActive ? 'Active Status' : 'Inactive Status'}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <label className="flex items-center justify-between cursor-pointer group bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-purple-200 transition-all duration-300">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">Pro-rata basis</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight transition-colors">Adjust as per working days</span>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isProRata ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isProRata ? 'left-7' : 'left-1'}`} />
                                        <input type="checkbox" className="hidden" checked={isProRata} onChange={() => setIsProRata(!isProRata)} />
                                    </div>
                                </label>

                                <label className="flex items-center justify-between cursor-pointer group bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-purple-200 transition-all duration-300">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">Monthly Payout</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight transition-colors">Include in monthly payout</span>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${includeMonthlyPayout ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${includeMonthlyPayout ? 'left-7' : 'left-1'}`} />
                                        <input type="checkbox" className="hidden" checked={includeMonthlyPayout} onChange={() => setIncludeMonthlyPayout(!includeMonthlyPayout)} />
                                    </div>
                                </label>

                                <label className="flex items-center justify-between cursor-pointer group bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-purple-200 transition-all duration-300">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">Prorate DOJ/DOL</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight transition-colors">Enable DOJ/DOL Proration</span>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${prorateDojDol ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${prorateDojDol ? 'left-7' : 'left-1'}`} />
                                        <input type="checkbox" className="hidden" checked={prorateDojDol} onChange={() => setProrateDojDol(!prorateDojDol)} />
                                    </div>
                                </label>
                            </div>

                            <div className="space-y-6">
                                <label className="flex items-center justify-between cursor-pointer group bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-purple-200 transition-all duration-300">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">First Salary</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight transition-colors">Include in first salary</span>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${includeInFirstSalary ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${includeInFirstSalary ? 'left-7' : 'left-1'}`} />
                                        <input type="checkbox" className="hidden" checked={includeInFirstSalary} onChange={() => setIncludeInFirstSalary(!includeInFirstSalary)} />
                                    </div>
                                </label>

                                <label className="flex items-center justify-between cursor-pointer group bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-purple-200 transition-all duration-300">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">Include Arrears</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight transition-colors">Enable Arrears Calculation</span>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${includeArrears ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${includeArrears ? 'left-7' : 'left-1'}`} />
                                        <input type="checkbox" className="hidden" checked={includeArrears} onChange={() => setIncludeArrears(!includeArrears)} />
                                    </div>
                                </label>

                                <label className="flex items-center justify-between cursor-pointer group bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-purple-200 transition-all duration-300">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">Show in Payslip</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight transition-colors">Visible in Payslip document</span>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${show_in_payslip ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${show_in_payslip ? 'left-7' : 'left-1'}`} />
                                        <input type="checkbox" className="hidden" checked={show_in_payslip} onChange={() => setShow_in_payslip(!show_in_payslip)} />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <div className="px-10 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                <button onClick={onCancel} className="px-8 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-all border border-slate-200 rounded-xl bg-white hover:bg-slate-50">Cancel</button>
                <button
                    onClick={handleSave}
                    className="px-10 py-2.5 text-sm font-black text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-lg shadow-purple-200 transition-all active:scale-[0.98] uppercase tracking-widest"
                >
                    {initialData ? 'Update Component' : 'Create Component'}
                </button>
            </div>
        </div>
    );
};

// --- Detailed Add Reimbursement Form ---
const AddReimbursementComponentForm: React.FC<AddEarningFormProps> = ({ onCancel, onSave, initialData, userRole }) => {
    const [activeTab, setActiveTab] = useState<'Configuration' | 'History'>('Configuration');
    const [name, setName] = useState(initialData?.name || '');
    const [availableReimbursements, setAvailableReimbursements] = useState<{ id: string, name: string }[]>([]);
    const [isLoadingReimbursements, setIsLoadingReimbursements] = useState(false);
    const [effective_date, setEffective_date] = useState(initialData?.effective_date || '');
    const [history, setHistory] = useState<ComponentChangeHistory[]>(initialData?.history || []);
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [customName, setCustomName] = useState('');

    useEffect(() => {
        if (userRole === 'HR_MANAGER') {
            const fetchAvailableReimbursements = async () => {
                setIsLoadingReimbursements(true);
                try {
                    const { data, error } = await supabase
                        .from('salary_components')
                        .select('id, name')
                        .eq('category', 'Reimbursements')
                        .eq('status', true);

                    if (error) throw error;
                    if (data) {
                        setAvailableReimbursements(data);
                    }
                } catch (err) {
                    console.error('Error fetching available reimbursements:', err);
                } finally {
                    setIsLoadingReimbursements(false);
                }
            };
            fetchAvailableReimbursements();
        }
    }, [userRole]);

    const [payslip_name, setPayslip_name] = useState(initialData?.payslip_name || '');
    const [amount_or_percent, setAmount_or_percent] = useState(initialData?.amount_or_percent || '');
    const [isActive, setIsActive] = useState(initialData?.status ?? true);
    const [show_in_payslip, setShow_in_payslip] = useState(initialData?.show_in_payslip ?? false);

    const [natureOfPay, setNatureOfPay] = useState<'Fixed' | 'Variable'>(
        initialData?.type === 'Variable Pay' ? 'Variable' : 'Fixed'
    );

    const [calc_method, setCalc_method] = useState<'Flat' | 'Percentage'>(
        initialData?.calc_method || 'Flat'
    );
    const [selectedComponents, setSelectedComponents] = useState<string[]>(['CTC']);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        const finalName = isOtherSelected ? customName : name;
        if (userRole === 'HR_MANAGER' && (!finalName || !effective_date)) {
            if (!effective_date) setError('Effective Date is mandatory');
            else setError('Component Name is mandatory');
            return;
        }
        setError(null);

        const newHistoryEntries: ComponentChangeHistory[] = [];
        if (initialData) {
            const changes = [
                { label: 'Name', old: initialData.name, new: finalName },
                { label: 'Payslip Name', old: initialData.payslip_name, new: payslip_name },
                { label: 'Amount/Percent', old: initialData.amount_or_percent, new: amount_or_percent },
                { label: 'Calculation Method', old: initialData.calc_method, new: calc_method },
                { label: 'Status', old: initialData.status, new: isActive },
                { label: 'Nature of Pay', old: initialData.type, new: natureOfPay === 'Variable' ? 'Variable Pay' : 'Fixed Pay' },
                { label: 'Effective Date', old: initialData.effective_date, new: effective_date },
            ];

            changes.forEach(c => {
                const entry = addHistory(c.label, c.old, c.new);
                if (entry) newHistoryEntries.push(entry);
            });
        }

        const calculateString = calc_method === 'Flat'
            ? 'Fixed Amount'
            : `% of ${selectedComponents.join(', ')}`;

        const updatedData: Partial<SalaryComponent> = {
            name: finalName,
            payslip_name,
            effective_date,
            amount_or_percent: amount_or_percent,
            status: isActive,
            type: natureOfPay === 'Variable' ? 'Variable Pay' : 'Fixed Pay',
            category: 'Reimbursements',
            calc_method: calc_method,
            calculation: calculateString,
            taxable: 'Partially Exempt',
            show_in_payslip: show_in_payslip,
            history: [...newHistoryEntries, ...history]
        };
        onSave(updatedData);
    };

    if (activeTab === 'History') {
        const selectedIndex = selectedRecordId ? history.findIndex(r => r.id === selectedRecordId) : 0;
        
        return (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 flex flex-col h-[85vh] max-w-6xl mx-auto mt-6">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setActiveTab('Configuration')} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><ChevronDown size={20} className="rotate-90 text-slate-600" /></button>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Audit History: {name || 'New Component'}</h2>
                            <p className="text-sm text-slate-500">Track all modifications and configuration changes</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-all group">
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/30">
                        <div className="p-4 border-b border-slate-100 bg-white/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input type="text" placeholder="Search history..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                            {history.length === 0 ? (
                                <div className="text-center py-10 px-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3"><Clock className="text-slate-400" size={20} /></div>
                                    <p className="text-slate-500 text-sm font-medium">No history available</p>
                                </div>
                            ) : (
                                history.map((record, index) => (
                                    <button
                                        key={record.id}
                                        onClick={() => setSelectedRecordId(record.id)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${selectedRecordId === record.id || (!selectedRecordId && index === 0) ? 'bg-white border-purple-200 shadow-md ring-1 ring-purple-100' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{record.timestamp}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 mb-1">{record.field} Changed</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">A</div>
                                            <span className="text-xs text-slate-500 font-medium">{record.changedBy}</span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto bg-white p-10">
                        {history.length > 0 && (
                            <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center"><Clock className="text-purple-600" size={24} /></div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Modification Summary</h3>
                                        <p className="text-sm text-slate-500">Detailed overview of the changes made to the configuration.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Previous Configuration</h4>
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-slate-300" />
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{history[selectedIndex]?.field}</span>
                                                <span className="text-lg font-bold text-slate-800 line-through decoration-slate-300 decoration-2">{history[selectedIndex]?.oldValue}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-sky-500 uppercase tracking-widest pl-1">New Configuration</h4>
                                        <div className="bg-sky-50 rounded-2xl p-6 border border-sky-200/60 relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-sky-500" />
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">{history[selectedIndex]?.field}</span>
                                                <span className="text-lg font-bold text-slate-900">{history[selectedIndex]?.newValue}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 text-center">
                                    <p className="text-xs text-slate-400">Captured by System Audit Engine • Version 2.4.0</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-w-4xl mx-auto mt-6 flex flex-col h-[85vh]">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-slate-800">{initialData ? `Edit ${name}` : 'Add Reimbursement Component'}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{isActive ? 'Currently Active' : 'Currently Inactive'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-200 rounded-lg p-1 flex gap-1 shadow-sm mr-4">
                        <button
                            onClick={() => setActiveTab('Configuration')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'Configuration' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Configuration
                        </button>
                        <button
                            onClick={() => setActiveTab('History')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'History' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            History
                        </button>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-all group">
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-10">
                    <section className="space-y-6">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Component Name <span className="text-rose-500">*</span></label>
                                {userRole === 'HR_MANAGER' ? (
                                    <div className="relative">
                                        <select
                                            value={isOtherSelected ? 'others' : name}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (val === 'others') {
                                                    setIsOtherSelected(true);
                                                    setName('');
                                                } else {
                                                    setIsOtherSelected(false);
                                                    setName(val);
                                                    if (!payslip_name) setPayslip_name(val);
                                                }
                                            }}
                                            disabled={isLoadingReimbursements}
                                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all appearance-none"
                                        >
                                            <option value="">Select Component</option>
                                            {availableReimbursements.map(comp => (
                                                <option key={comp.id} value={comp.name}>{comp.name}</option>
                                            ))}
                                            <option value="others">+ Others</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Fuel Reimbursement"
                                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all"
                                    />
                                )}
                                {userRole === 'HR_MANAGER' && isOtherSelected && (
                                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                        <label className="block text-[10px] font-bold text-purple-600 mb-1.5 uppercase tracking-wider">Custom Component Name <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            value={customName}
                                            onChange={e => { setCustomName(e.target.value); if (!payslip_name) setPayslip_name(e.target.value); }}
                                            placeholder="Enter Custom Name"
                                            className="w-full px-4 py-3 bg-purple-50/10 border border-purple-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Name in Payslip <span className="text-rose-500">*</span></label>
                                <input
                                    type="text"
                                    value={payslip_name}
                                    onChange={(e) => setPayslip_name(e.target.value)}
                                    placeholder="e.g. Fuel"
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Effective Date <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="date"
                                        value={effective_date}
                                        onChange={(e) => setEffective_date(e.target.value)}
                                        className={`w-full pl-12 pr-4 py-3 bg-slate-50/50 border rounded-xl text-sm font-medium focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all ${error && !effective_date ? 'border-rose-500' : 'border-slate-200'}`}
                                    />
                                </div>
                                {error && !effective_date && <p className="text-[10px] text-rose-500 mt-1 font-bold">{error}</p>}
                            </div>
                        </div>
                    </section>

                    <div className="h-px bg-slate-100" />

                    <section className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Calculator size={18} className="text-purple-600" />
                            Calculation Basis
                        </h3>
                        
                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Nature of Pay <span className="text-rose-500">*</span></label>
                            <div className="flex gap-4">
                                {['Fixed', 'Variable'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setNatureOfPay(type as any)}
                                        className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${natureOfPay === type ? 'bg-purple-50 border-purple-200 shadow-md ring-1 ring-purple-100' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${natureOfPay === type ? 'bg-purple-100' : 'bg-slate-50'}`}>
                                            {type === 'Fixed' ? <Calculator size={20} className={natureOfPay === type ? 'text-purple-600' : 'text-slate-400'} /> : <Sigma size={20} className={natureOfPay === type ? 'text-purple-600' : 'text-slate-400'} />}
                                        </div>
                                        <span className={`text-sm font-bold ${natureOfPay === type ? 'text-purple-700' : 'text-slate-600'}`}>{type} Pay</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-4">
                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Calculation Method</label>
                                <div className="flex p-1.5 bg-slate-100/50 rounded-xl border border-slate-200/60 shadow-inner">
                                    {['Flat', 'Percentage'].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setCalc_method(m as any)}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${calc_method === m ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            {m === 'Flat' ? 'Flat Amount' : 'Percentage'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Value</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={amount_or_percent}
                                        onChange={(e) => setAmount_or_percent(e.target.value)}
                                        placeholder={calc_method === 'Percentage' ? 'e.g. 10' : 'e.g. 500'}
                                        className="w-full pl-4 pr-14 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all"
                                    />
                                    <div className="absolute right-0 top-0 h-full px-4 bg-slate-100/80 border-l border-slate-200 rounded-r-xl flex items-center text-slate-500 font-bold text-sm">
                                        {calc_method === 'Percentage' ? '%' : '₹'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {calc_method === 'Percentage' && (
                            <div className="relative max-w-sm">
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:border-purple-500 outline-none flex items-center justify-between group hover:bg-white transition-all shadow-sm"
                                >
                                    <span className="text-slate-700 flex items-center gap-2 uppercase tracking-tighter text-[10px] font-black">
                                        <Sigma className="text-slate-400" size={12} />
                                        OF {selectedComponents.join(', ')}
                                    </span>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                                        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100 overflow-hidden ring-1 ring-slate-200/50">
                                            {['CTC', 'Basic'].map(comp => (
                                                <label key={comp} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer group transition-colors">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedComponents.includes(comp) ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white group-hover:border-purple-400'}`}>
                                                        {selectedComponents.includes(comp) && <Check size={14} className="text-white" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={selectedComponents.includes(comp)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedComponents(prev => [...prev, comp]);
                                                            else setSelectedComponents(prev => prev.filter(c => c !== comp));
                                                        }}
                                                    />
                                                    <span className="text-sm text-slate-700 font-bold">{comp}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </section>

                    <div className="h-px bg-slate-100" />

                    <section className="space-y-8">
                        <div className="flex items-center justify-between mb-2">
                             <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                                <Sigma size={18} className="text-purple-600" />
                                Configuration & Flags
                            </h3>
                            <button onClick={() => setIsActive(!isActive)} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'}`}>
                                {isActive ? 'Active Status' : 'Inactive Status'}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <label className="flex items-center justify-between cursor-pointer group bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-purple-200 transition-all duration-300">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">Show in Payslip</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight transition-colors">Visible in Payslip document</span>
                                </div>
                                <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${show_in_payslip ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${show_in_payslip ? 'left-7' : 'left-1'}`} />
                                    <input type="checkbox" className="hidden" checked={show_in_payslip} onChange={() => setShow_in_payslip(!show_in_payslip)} />
                                </div>
                            </label>

                            <label className="flex items-center justify-between cursor-pointer group bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-purple-200 transition-all duration-300">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-purple-600 transition-colors">Mark as Active</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight transition-colors">Enable/Disable Component</span>
                                </div>
                                <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isActive ? 'bg-purple-600' : 'bg-slate-200'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isActive ? 'left-7' : 'left-1'}`} />
                                    <input type="checkbox" className="hidden" checked={isActive} onChange={() => setIsActive(!isActive)} />
                                </div>
                            </label>
                        </div>
                    </section>
                </div>
            </div>

            <div className="px-10 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                <button onClick={onCancel} className="px-8 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-all border border-slate-200 rounded-xl bg-white hover:bg-slate-50">Cancel</button>
                <button
                    onClick={handleSave}
                    className="px-10 py-2.5 text-sm font-black text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-lg shadow-purple-200 transition-all active:scale-[0.98] uppercase tracking-widest"
                >
                    {initialData ? 'Update Component' : 'Create Component'}
                </button>
            </div>
        </div>
    );
};

const SalaryComponents: React.FC<{ userRole?: string }> = ({ userRole }) => {
    const [activeTab, setActiveTab] = useState('Earnings');
    const [components, setComponents] = useState<SalaryComponent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch from Supabase on mount
    useEffect(() => {
        const fetchComponents = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('salary_components')
                    .select('*');

                if (error) throw error;
                if (data && data.length > 0) {
                    setComponents(data as SalaryComponent[]);
                } else {
                    setComponents(INITIAL_DATA);
                }
            } catch (error) {
                console.error('Error fetching components:', error);
                setComponents(INITIAL_DATA);
            } finally {
                setIsLoading(false);
            }
        };
        fetchComponents();
    }, []);

    const [isAdding, setIsAdding] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [editingComponent, setEditingComponent] = useState<SalaryComponent | null>(null);

    // Modal States
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
    const [statusChangeRequest, setStatusChangeRequest] = useState<{ isOpen: boolean; id: string | null; newStatus: boolean }>({ isOpen: false, id: null, newStatus: false });

    // Filter out Benefits for now
    const tabs = ['Earnings', 'Deductions', 'Reimbursements'];

    const [filterField, setFilterField] = useState<'name' | 'type' | 'status'>('name');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = components.filter(c => {
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

        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        if (filterField === 'name') return c.name.toLowerCase().includes(query);
        if (filterField === 'type') return c.type.toLowerCase().includes(query);
        if (filterField === 'status') {
            const statusText = c.status ? 'active' : 'inactive';
            return statusText.includes(query);
        }
        return false;
    });

    const handleEditClick = (component: SalaryComponent) => {
        setEditingComponent(component);
        setIsAdding(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteConfirmation({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        if (deleteConfirmation.id) {
            try {
                const { error } = await supabase
                    .from('salary_components')
                    .delete()
                    .eq('id', deleteConfirmation.id);

                if (error) throw error;

                setComponents(prev => prev.filter(c => c.id !== deleteConfirmation.id));
                setDeleteConfirmation({ isOpen: false, id: null });
                if (isAdding && editingComponent?.id === deleteConfirmation.id) {
                    handleCancel();
                }
            } catch (error) {
                console.error('Error deleting component:', error);
                alert('Failed to delete component. Please try again.');
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
            try {
                const { error } = await supabase
                    .from('salary_components')
                    .update({ status: statusToSet })
                    .eq('id', id);

                if (error) throw error;

                setComponents(prev => prev.map(c => c.id === id ? { ...c, status: statusToSet } : c));
                setStatusChangeRequest({ isOpen: false, id: null, newStatus: false });
            } catch (error: any) {
                console.error('Error updating status:', error);
                let errorMessage = error?.message || (typeof error === 'string' ? error : 'Unknown error');

                // Provide a more helpful message for missing table error
                if (errorMessage.includes('Relation') && errorMessage.includes('does not exist')) {
                    errorMessage = "The 'salary_components' table is missing from your database. Please run the provided SQL script in your Supabase editor.";
                }

                alert(`Failed to update status: ${errorMessage}`);
            }
        }
    };

    const handleSave = async (data: Partial<SalaryComponent>) => {
        try {
            // Strip frontend-only fields that don't exist in the DB table
            const { history, ...dbData } = data;

            if (editingComponent) {
                const { data: updatedData, error } = await supabase
                    .from('salary_components')
                    .update(dbData)
                    .eq('id', editingComponent.id)
                    .select();

                if (error) throw error;
                setComponents(prev => prev.map(c => c.id === editingComponent.id ? { ...c, ...data } : c));
            } else {
                const newComponent = {
                    name: dbData.name || 'New Component',
                    type: dbData.type || 'Fixed Pay',
                    calculation: dbData.calculation || '',
                    taxable: dbData.taxable || 'Fully Taxable',
                    status: dbData.status ?? true,
                    category: activeTab,
                    ...dbData
                };

                const { data: insertedData, error } = await supabase
                    .from('salary_components')
                    .insert(newComponent)
                    .select();

                if (error) throw error;
                if (insertedData) {
                    setComponents(prev => [...prev, insertedData[0] as SalaryComponent]);
                }
            }
            handleCancel();
        } catch (error) {
            console.error('Error saving component:', error);
            alert(`Failed to save component: ${(error as any)?.message || 'Please try again.'}`);
        }
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingComponent(null);
    };

    const handleExportCSV = () => {
        // Define headers based on the current tab
        let headers: string[] = [];
        if (activeTab === 'Earnings') {
            headers = ['Component Name', 'Nature of Pay', 'Calculation Method', 'Taxable Earning', 'Value', 'Consider for PF', 'Consider for ESI', 'Last Modified', 'Created'];
        } else if (activeTab === 'Deductions') {
            headers = ['Component Name', 'Nature of Deduction', 'Calculation Method', 'Taxable deduction'];
        } else {
            headers = ['Component Name', 'Nature of Pay', 'Taxable'];
        }

        // Map data to rows - simplified CSV escaping
        const rows = filteredData.map(item => {
            if (activeTab === 'Earnings') {
                return [
                    `"${(item.name || '').replace(/"/g, '""')}"`,
                    `"${item.type}"`,
                    `"${item.calc_method === 'Flat' ? 'Flat' : (item.calculation || '')}"`,
                    `"${item.taxable !== 'Fully Exempt' ? 'Yes' : 'No'}"`,
                    `"${item.amount_or_percent || ''}"`,
                    `"${item.consider_epf ? 'Yes' : 'No'}"`,
                    `"${item.consider_esi ? 'Yes' : 'No'}"`,
                    `"${(item.last_modified || '').replace(/\n/g, ' ').replace(/"/g, '""')}"`,
                    `"${(item.created || '').replace(/\n/g, ' ').replace(/"/g, '""')}"`
                ];
            } else if (activeTab === 'Deductions') {
                return [
                    `"${(item.name || '').replace(/"/g, '""')}"`,
                    `"${item.type === 'Variable Pay' ? 'Variable' : 'Fixed'}"`,
                    `"${item.calculation || ''}"`,
                    `"${item.taxable !== 'Tax Deductible' ? 'Yes' : 'No'}"`
                ];
            } else {
                return [
                    `"${(item.name || '').replace(/"/g, '""')}"`,
                    `"${item.type}"`,
                    `"${item.taxable}"`
                ];
            }
        });

        // Create CSV string
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        // Trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `salary_components_${activeTab.toLowerCase()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">

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
                    <AddEarningComponentForm onCancel={handleCancel} onSave={handleSave} initialData={editingComponent} userRole={userRole} />
                ) : activeTab === 'Deductions' ? (
                    <AddDeductionComponentForm onCancel={handleCancel} onSave={handleSave} initialData={editingComponent} userRole={userRole} />
                ) : (
                    <AddReimbursementComponentForm onCancel={handleCancel} onSave={handleSave} initialData={editingComponent} userRole={userRole} />
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
                                        <button
                                            onClick={() => { setFilterField('name'); setIsFilterOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${filterField === 'name' ? 'bg-purple-50 text-purple-700' : 'text-slate-700 hover:bg-slate-50'}`}
                                        >
                                            <Tag size={16} className={filterField === 'name' ? 'text-purple-500' : 'text-slate-400'} /> Component Name
                                        </button>
                                        <button
                                            onClick={() => { setFilterField('type'); setIsFilterOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${filterField === 'type' ? 'bg-purple-50 text-purple-700' : 'text-slate-700 hover:bg-slate-50'}`}
                                        >
                                            <FileText size={16} className={filterField === 'type' ? 'text-purple-500' : 'text-slate-400'} /> Nature of Pay
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
                                    placeholder={`Filter by ${filterField === 'name' ? 'Component Name' : filterField === 'type' ? 'Nature of Pay' : 'Status'}...`}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400 shadow-sm"
                                />
                            </div>

                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                                Filter
                            </button>
                        </div>

                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm w-full sm:w-auto justify-center"
                        >
                            Add Component
                        </button>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Component Name</th>
                                    <th className="px-6 py-4">Name in Payslip</th>
                                    <th className="px-6 py-4">{activeTab === 'Deductions' ? 'Nature of Deduction' : 'Nature of Pay'}</th>

                                    {/* Columns Specific to Earnings vs Others */}
                                    {activeTab === 'Earnings' ? (
                                        <>
                                            <th className="px-6 py-4">Calculation Method</th>
                                            <th className="px-6 py-4">Taxable Earning</th>
                                            {userRole === 'HR_MANAGER' && <th className="px-6 py-4">Effective Date</th>}
                                            <th className="px-6 py-4">{userRole === 'SUPER_ADMIN' || userRole === 'HR_MANAGER' ? 'Last Modified By' : 'Last Modified'}</th>
                                            <th className="px-6 py-4">{userRole === 'SUPER_ADMIN' || userRole === 'HR_MANAGER' ? 'Created By' : 'Created'}</th>
                                        </>
                                    ) : (
                                        <>
                                            {activeTab === 'Deductions' && (
                                                <>
                                                    <th className="px-6 py-4">Calculation Method</th>
                                                    <th className="px-6 py-4">Taxable deduction</th>
                                                </>
                                            )}
                                            {activeTab !== 'Deductions' && (
                                                <>
                                                    {userRole === 'HR_MANAGER' && (
                                                        <th className="px-6 py-4">Calculation Method</th>
                                                    )}
                                                    {userRole !== 'HR_MANAGER' && (
                                                        <th className="px-6 py-4">Taxable</th>
                                                    )}
                                                </>
                                            )}
                                            <th className="px-6 py-4">Status</th>
                                            {activeTab === 'Deductions' && userRole === 'HR_MANAGER' && (
                                                <>
                                                    <th className="px-6 py-4">Effective Date</th>
                                                    <th className="px-6 py-4">Created By</th>
                                                    <th className="px-6 py-4">Last Modified By</th>
                                                </>
                                            )}
                                            {activeTab !== 'Deductions' && userRole === 'HR_MANAGER' && (
                                                <>
                                                    <th className="px-6 py-4">Effective Date</th>
                                                    <th className="px-6 py-4">Created By</th>
                                                    <th className="px-6 py-4">Last Modified By</th>
                                                </>
                                            )}
                                        </>
                                    )}

                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.length > 0 ? (
                                    filteredData.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4 font-semibold text-slate-800">
                                                <div className="flex items-center gap-2">
                                                    {item.name}
                                                    {item.created === 'System' && userRole !== 'SUPER_ADMIN' && <div className="text-slate-400" title="System Component"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></div>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{item.payslip_name || '-'}</td>
                                            <td className="px-6 py-4">
                                                {activeTab === 'Deductions' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                                                        {item.type === 'Variable Pay' ? 'Variable' : 'Fixed'}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                                                        {item.type}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Data Cells Specific to Earnings vs Others */}
                                            {activeTab === 'Earnings' ? (
                                                <>
                                                    <td className="px-6 py-4">{item.calc_method === 'Flat' ? 'Flat' : (item.calculation || '-')}</td>
                                                    <td className="px-6 py-4">{item.taxable !== 'Fully Exempt' ? 'Yes' : 'No'}</td>
                                                    {userRole === 'HR_MANAGER' && <td className="px-6 py-4 text-slate-500">{item.effective_date ? new Date(item.effective_date).toLocaleDateString() : '-'}</td>}
                                                    <td className="px-6 py-4 text-slate-500">{item.last_modified ? new Date(item.last_modified).toLocaleDateString() : '-'}</td>
                                                    <td className="px-6 py-4 text-slate-500">{item.created ? new Date(item.created).toLocaleDateString() : '-'}</td>
                                                </>
                                            ) : (
                                                <>
                                                    {activeTab === 'Deductions' && (
                                                        <>
                                                            <td className="px-6 py-4 text-slate-600 font-medium">{item.calculation || '-'}</td>
                                                            <td className="px-6 py-4 font-medium text-slate-700">{item.taxable !== 'Tax Deductible' ? 'Yes' : 'No'}</td>
                                                        </>
                                                    )}
                                                    {activeTab !== 'Deductions' && (
                                                        <>
                                                            {userRole === 'HR_MANAGER' && (
                                                                <td className="px-6 py-4">{item.calc_method === 'Flat' ? 'Flat' : (item.calculation || '-')}</td>
                                                            )}
                                                            {userRole !== 'HR_MANAGER' && (
                                                                <td className="px-6 py-4">{item.taxable}</td>
                                                            )}
                                                        </>
                                                    )}
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${item.status ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                            {item.status ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    {activeTab === 'Deductions' && userRole === 'HR_MANAGER' && (
                                                        <>
                                                            <td className="px-6 py-4 text-slate-500">{item.effective_date ? new Date(item.effective_date).toLocaleDateString() : '-'}</td>
                                                            <td className="px-6 py-4 text-slate-500">
                                                                {item.created ? (
                                                                    <div className="whitespace-pre-line text-xs">{item.created}</div>
                                                                ) : '-'}
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-500">
                                                                {item.last_modified ? (
                                                                    <div className="whitespace-pre-line text-xs">{item.last_modified}</div>
                                                                ) : '-'}
                                                            </td>
                                                        </>
                                                    )}
                                                    {activeTab !== 'Deductions' && userRole === 'HR_MANAGER' && (
                                                        <>
                                                            <td className="px-6 py-4 text-slate-500">{item.effective_date ? new Date(item.effective_date).toLocaleDateString() : '-'}</td>
                                                            <td className="px-6 py-4 text-slate-500">
                                                                {item.created ? (
                                                                    <div className="whitespace-pre-line text-xs">{item.created}</div>
                                                                ) : '-'}
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-500">
                                                                {item.last_modified ? (
                                                                    <div className="whitespace-pre-line text-xs">{item.last_modified}</div>
                                                                ) : '-'}
                                                            </td>
                                                        </>
                                                    )}
                                                </>
                                            )}

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditClick(item)}
                                                        disabled={item.created === 'System' && userRole !== 'SUPER_ADMIN'}
                                                        className={`p-1.5 rounded-md transition-colors ${item.created === 'System' && userRole !== 'SUPER_ADMIN' ? 'opacity-50 cursor-not-allowed text-slate-400' : 'text-slate-500 hover:text-sky-600 hover:bg-sky-50'}`}
                                                        title={item.created === 'System' && userRole !== 'SUPER_ADMIN' ? "System components cannot be edited" : "Edit"}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusClick(item.id, item.status)}
                                                        disabled={item.created === 'System' && userRole !== 'SUPER_ADMIN'}
                                                        className={`p-1.5 rounded-md transition-colors ${item.created === 'System' && userRole !== 'SUPER_ADMIN' ? 'opacity-50 cursor-not-allowed text-slate-400' : item.status ? 'text-amber-500 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                                        title={item.created === 'System' && userRole !== 'SUPER_ADMIN' ? "System components cannot be deactivated" : item.status ? "Deactivate" : "Activate"}
                                                    >
                                                        <Power size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(item.id)}
                                                        disabled={item.created === 'System' && userRole !== 'SUPER_ADMIN'}
                                                        className={`p-1.5 rounded-md transition-colors ${item.created === 'System' && userRole !== 'SUPER_ADMIN' ? 'opacity-50 cursor-not-allowed text-slate-400' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}
                                                        title={item.created === 'System' && userRole !== 'SUPER_ADMIN' ? "System components cannot be deleted" : "Delete"}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={activeTab === 'Earnings' ? 8 : 4} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
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

export default SalaryComponents;
