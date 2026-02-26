import React, { useState, useEffect } from 'react';
import {
    Users, LayoutDashboard, Plus, Search, Filter, Trash2, Edit2, RotateCcw, CheckCircle, X, Download, Info, Check, MoreVertical,
    Sigma, ChevronDown, Tag, FileText, Calculator, Power, AlertTriangle
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
}

interface AddEarningFormProps {
    onCancel: () => void;
    onSave: (data: Partial<SalaryComponent>) => void;
    initialData?: SalaryComponent | null;
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

    // Deductions
    { id: '550e8400-e29b-41d4-a716-446655440007', name: 'Professional Tax (PT)', type: 'Variable Pay', calculation: 'State Slab', taxable: 'Tax Deductible', status: true, category: 'Deductions', frequency: 'Recurring', payslip_name: 'Prof Tax' },
    { id: '550e8400-e29b-41d4-a716-446655440008', name: 'Provident Fund (Employee)', type: 'Variable Pay', calculation: '12% of Basic', taxable: 'Tax Deductible', status: true, category: 'Deductions', frequency: 'Recurring', payslip_name: 'EPF' },
    { id: '550e8400-e29b-41d4-a716-446655440009', name: 'Income Tax (TDS)', type: 'Variable Pay', calculation: 'As per Slab', taxable: 'Tax Deductible', status: true, category: 'Deductions', frequency: 'Recurring', payslip_name: 'TDS' },
    { id: '550e8400-e29b-41d4-a716-446655440010', name: 'Loan Repayment', type: 'Fixed Pay', calculation: 'Fixed EMI', taxable: 'Tax Deductible', status: false, category: 'Deductions', frequency: 'Recurring', payslip_name: 'Loan Recovery' },
    { id: '550e8400-e29b-41d4-a716-446655440017', name: 'Health Insurance Premium', type: 'Fixed Pay', calculation: 'Flat ₹500', taxable: 'Partially Exempt', status: true, category: 'Deductions', frequency: 'Recurring', payslip_name: 'Health Ins' },
    { id: '550e8400-e29b-41d4-a716-446655440018', name: 'Salary Advance Recovery', type: 'Variable Pay', calculation: 'Manual', taxable: 'Fully Exempt', status: true, category: 'Deductions', frequency: 'Recurring', payslip_name: 'Sal Adv' },
    { id: '550e8400-e29b-41d4-a716-446655440019', name: 'Labour Welfare Fund', type: 'Fixed Pay', calculation: 'State Rules', taxable: 'Fully Exempt', status: true, category: 'Deductions', frequency: 'Recurring', payslip_name: 'LWF' },

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
const AddEarningComponentForm: React.FC<AddEarningFormProps> = ({ onCancel, onSave, initialData }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [payslip_name, setPayslip_name] = useState(initialData?.payslip_name || '');
    const [effective_date, setEffective_date] = useState(initialData?.effective_date || '');
    const [natureOfPay, setNatureOfPay] = useState<'Fixed' | 'Variable'>(
        initialData?.type === 'Variable Pay' ? 'Variable' : 'Fixed'
    );
    const [calc_method, setCalc_method] = useState<'Flat' | 'Percentage'>(
        initialData?.calc_method || 'Flat'
    );
    const [amount_or_percent, setAmount_or_percent] = useState(initialData?.amount_or_percent || '');

    // Configurations
    const [isTaxable, setIsTaxable] = useState(initialData?.taxable !== 'Fully Exempt');
    const [taxPreference, setTaxPreference] = useState('Subsequent');
    const [isProRata, setIsProRata] = useState(true);
    const [epfContribution, setEpfContribution] = useState<'Always' | 'Limit'>('Always');
    const [consider_epf, setConsider_epf] = useState(initialData?.consider_epf ?? true);
    const [consider_esi, setConsider_esi] = useState(initialData?.consider_esi ?? true);
    const [showInPayslip, setShowInPayslip] = useState(true);
    const [isActive, setIsActive] = useState(initialData?.status ?? true);

    const handleSave = () => {
        const updatedData: Partial<SalaryComponent> = {
            name,
            payslip_name,
            effective_date,
            type: natureOfPay === 'Variable' ? 'Variable Pay' : 'Fixed Pay',
            calc_method: natureOfPay === 'Fixed' ? calc_method : undefined,
            amount_or_percent: natureOfPay === 'Fixed' ? amount_or_percent : undefined,
            calculation: natureOfPay === 'Fixed'
                ? (calc_method === 'Flat' ? `Flat ₹${amount_or_percent}` : `${amount_or_percent}% of CTC`)
                : 'Variable',
            taxable: isTaxable ? 'Fully Taxable' : 'Fully Exempt',
            consider_epf: consider_epf,
            consider_esi: consider_esi,
            status: isActive,
            category: 'Earnings'
        };
        onSave(updatedData);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-4 max-w-4xl mx-auto mt-6">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800">{initialData ? 'Edit Earning Component' : 'Add Earning Component'}</h2>
                <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-8">
                {/* Section 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Component Name <span className="text-rose-500">*</span></label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter Component Name" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Name in Payslip <span className="text-rose-500">*</span></label>
                        <input type="text" value={payslip_name} onChange={e => setPayslip_name(e.target.value)} placeholder="Enter Name in Payslip" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Effective Date</label>
                        <input type="date" value={effective_date} onChange={e => setEffective_date(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-600" />
                    </div>
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
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${calc_method === 'Flat' ? 'border-purple-600' : 'border-slate-300'}`}>
                                    {calc_method === 'Flat' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                </div>
                                <input type="radio" className="hidden" checked={calc_method === 'Flat'} onChange={() => setCalc_method('Flat')} />
                                <span className="text-sm text-slate-700 font-medium">Flat Amount</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${calc_method === 'Percentage' ? 'border-purple-600' : 'border-slate-300'}`}>
                                    {calc_method === 'Percentage' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                </div>
                                <input type="radio" className="hidden" checked={calc_method === 'Percentage'} onChange={() => setCalc_method('Percentage')} />
                                <span className="text-sm text-slate-700 font-medium">Percentage of</span>
                            </label>
                            <div className="relative">
                                <select disabled={calc_method !== 'Percentage'} className="px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-600 bg-slate-50 focus:outline-none focus:border-purple-500 disabled:opacity-50">
                                    <option>CTC</option>
                                    <option>Basic</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">{calc_method === 'Percentage' ? 'Enter Percentage' : 'Enter Amount'} <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <input type="text" value={amount_or_percent} onChange={(e) => setAmount_or_percent(e.target.value)} placeholder={calc_method === 'Percentage' ? 'Enter Percentage' : 'Enter Amount'} className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                            <div className="absolute right-0 top-0 h-full px-3 bg-slate-100 border-l border-slate-200 rounded-r-lg flex items-center text-slate-500 font-medium text-sm">
                                {calc_method === 'Percentage' ? '%' : '₹'}
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
                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${consider_epf ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                {consider_epf && <Check size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={consider_epf}
                                onChange={() => setConsider_epf(!consider_epf)}
                            />
                            <div>
                                <span className="block text-sm font-bold text-slate-700">Consider for EPF Contribution</span>
                                <span className="block text-xs text-slate-500 mt-0.5">Pay will be adjusted based on employee working days.</span>
                            </div>
                        </label>

                        {consider_epf && (
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
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${consider_esi ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                            {consider_esi && <Check size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={consider_esi}
                            onChange={() => setConsider_esi(!consider_esi)}
                        />
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

            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={onCancel} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm shadow-sm transition-colors">{initialData ? 'Update' : 'Save'}</button>
            </div>
        </div>
    );
}

// --- Detailed Add Deduction Form ---
const AddDeductionComponentForm: React.FC<AddEarningFormProps> = ({ onCancel, onSave, initialData }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [payslip_name, setPayslip_name] = useState(initialData?.payslip_name || '');
    const [frequency, setFrequency] = useState<'One-time' | 'Recurring'>(initialData?.frequency || 'One-time');
    const [isActive, setIsActive] = useState(initialData?.status ?? true);
    const [show_in_payslip, setShow_in_payslip] = useState(initialData?.show_in_payslip ?? false);
    const [effective_date, setEffective_date] = useState(initialData?.effective_date || new Date().toISOString().split('T')[0]);
    const [deduction_type, setDeduction_type] = useState<'Statutory' | 'Non-Statutory'>(initialData?.deduction_type || 'Statutory');

    const handleSave = () => {
        const updatedData: Partial<SalaryComponent> = {
            name,
            payslip_name,
            frequency,
            status: isActive,
            show_in_payslip,
            effective_date,
            deduction_type,
            type: 'Variable Pay',
            category: 'Deductions',
            calculation: frequency === 'One-time' ? 'One-time Deduction' : 'Recurring Deduction',
            taxable: 'Tax Deductible',
        };
        onSave(updatedData);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-4 max-w-3xl mx-auto mt-6">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800">{initialData ? 'Edit Deduction Component' : 'Add Deduction Component'}</h2>
                <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Component Name <span className="text-rose-500">*</span></label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" /></div>
                    <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Name in Payslip <span className="text-rose-500">*</span></label><input type="text" value={payslip_name} onChange={(e) => setPayslip_name(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Effective Date <span className="text-rose-500">*</span></label>
                        <input
                            type="date"
                            value={effective_date}
                            onChange={(e) => setEffective_date(e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Deduction Type <span className="text-rose-500">*</span></label>
                    <div className="flex gap-6">
                        {(['Statutory', 'Non-Statutory'] as const).map(type => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${deduction_type === type ? 'border-sky-500' : 'border-slate-300'}`}>
                                    {deduction_type === type && <div className="w-2 h-2 rounded-full bg-sky-500" />}
                                </div>
                                <input
                                    type="radio"
                                    className="hidden"
                                    checked={deduction_type === type}
                                    onChange={() => setDeduction_type(type)}
                                />
                                <span className="text-sm text-slate-700">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Select the deduction frequency <span className="text-rose-500">*</span></label>
                    <div className="space-y-2">
                        {['One-time', 'Recurring'].map(freq => (
                            <label key={freq} className="flex items-center gap-2 cursor-pointer">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${frequency === freq ? 'border-sky-500' : 'border-slate-300'}`}>
                                    {frequency === freq && <div className="w-2 h-2 rounded-full bg-sky-500" />}
                                </div>
                                <input type="radio" className="hidden" checked={frequency === freq} onChange={() => setFrequency(freq as any)} />
                                <span className="text-sm text-slate-700">{freq === 'One-time' ? 'One-time deduction' : 'Recurring deduction for subsequent Payrolls'}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="pt-2 flex flex-col gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${show_in_payslip ? 'bg-black border-black' : 'border-slate-300 bg-white'}`}>
                            {show_in_payslip && <CheckCircle size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={show_in_payslip} onChange={() => setShow_in_payslip(!show_in_payslip)} />
                        <span className="text-sm font-medium text-slate-700">Show in Payslip</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isActive ? 'bg-black border-black' : 'border-slate-300 bg-white'}`}>
                            {isActive && <CheckCircle size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={isActive} onChange={() => setIsActive(!isActive)} />
                        <span className="text-sm font-medium text-slate-700">Mark as Active</span>
                    </label>
                </div>
            </div>
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3"><button onClick={onCancel} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">Cancel</button><button onClick={handleSave} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm shadow-sm transition-colors">{initialData ? 'Update' : 'Save'}</button></div>
        </div>
    );
}

// --- Detailed Add Reimbursement Form ---
const AddReimbursementComponentForm: React.FC<AddEarningFormProps> = ({ onCancel, onSave, initialData }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [payslip_name, setPayslip_name] = useState(initialData?.payslip_name || '');
    const [amount_or_percent, setAmount_or_percent] = useState(initialData?.amount_or_percent || '');
    const [isActive, setIsActive] = useState(initialData?.status ?? true);

    const [natureOfPay, setNatureOfPay] = useState<'Fixed' | 'Variable'>(
        initialData?.type === 'Variable Pay' ? 'Variable' : 'Fixed'
    );

    const [calc_method, setCalc_method] = useState<'Flat' | 'Percentage'>(
        initialData?.calc_method || 'Flat'
    );

    const handleSave = () => {
        const updatedData: Partial<SalaryComponent> = {
            name,
            payslip_name,
            amount_or_percent: amount_or_percent,
            status: isActive,
            type: natureOfPay === 'Variable' ? 'Variable Pay' : 'Fixed Pay',
            category: 'Reimbursements',
            calc_method: calc_method,
            calculation: calc_method === 'Flat' ? `Fixed Amount` : `% of CTC`,
            taxable: 'Partially Exempt',
        };
        onSave(updatedData);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-4 max-w-3xl mx-auto mt-6">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800">{initialData ? 'Edit Reimbursement Component' : 'Add Reimbursement Component'}</h2>
                <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>

            <div className="p-8">
                <div className="space-y-6">
                    {/* Names */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Component Name <span className="text-rose-500">*</span></label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Component Name" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Name in Payslip <span className="text-rose-500">*</span></label>
                            <input type="text" value={payslip_name} onChange={(e) => setPayslip_name(e.target.value)} placeholder="Enter Name in Payslip" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
                        </div>
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
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${calc_method === 'Flat' ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {calc_method === 'Flat' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={calc_method === 'Flat'} onChange={() => setCalc_method('Flat')} />
                                    <span className="text-sm text-slate-700 font-medium">Flat Amount</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${calc_method === 'Percentage' ? 'border-purple-600' : 'border-slate-300'}`}>
                                        {calc_method === 'Percentage' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={calc_method === 'Percentage'} onChange={() => setCalc_method('Percentage')} />
                                    <span className="text-sm text-slate-700 font-medium">Percentage of</span>
                                </label>
                                <div className="relative">
                                    <select disabled={calc_method !== 'Percentage'} className="px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-600 bg-slate-50 focus:outline-none focus:border-purple-500 disabled:opacity-50">
                                        <option>CTC</option>
                                        <option>Basic</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">
                                {calc_method === 'Percentage' ? 'Enter Percentage' : 'Enter Amount'} <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={amount_or_percent}
                                    onChange={(e) => setAmount_or_percent(e.target.value)}
                                    placeholder={calc_method === 'Percentage' ? 'Enter Percentage' : 'Enter Amount'}
                                    className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                />
                                <div className="absolute right-0 top-0 h-full px-3 bg-slate-100 border-l border-slate-200 rounded-r-lg flex items-center text-slate-500 font-medium text-sm">
                                    {calc_method === 'Percentage' ? '%' : '₹'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Checkbox */}
                    <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isActive ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white group-hover:border-purple-400'}`}>
                                {isActive && <Check size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={isActive} onChange={() => setIsActive(!isActive)} />
                            <span className="text-sm font-medium text-slate-700">Mark as Active</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={onCancel} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm shadow-sm transition-colors">{initialData ? 'Update' : 'Save'}</button>
            </div>
        </div>
    );
}

const SalaryComponents: React.FC = () => {
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
                const errorMessage = error?.message || (typeof error === 'string' ? error : 'Unknown error');
                alert(`Failed to update status: ${errorMessage}. Please try again.`);
            }
        }
    };

    const handleSave = async (data: Partial<SalaryComponent>) => {
        try {
            if (editingComponent) {
                const { data: updatedData, error } = await supabase
                    .from('salary_components')
                    .update(data)
                    .eq('id', editingComponent.id)
                    .select();

                if (error) throw error;
                setComponents(prev => prev.map(c => c.id === editingComponent.id ? { ...c, ...data } : c));
            } else {
                const newComponent = {
                    name: data.name || 'New Component',
                    type: data.type || 'Fixed Pay',
                    calculation: data.calculation || '',
                    taxable: data.taxable || 'Fully Taxable',
                    status: data.status ?? true,
                    category: activeTab,
                    ...data
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
            alert('Failed to save component. Please try again.');
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
            headers = ['Component Name', 'Nature of Pay', 'Calculation Method', 'Value', 'Consider for PF', 'Consider for ESI', 'Status', 'Last Modified', 'Created'];
        } else {
            headers = ['Component Name', 'Nature of Pay', 'Taxable', 'Status'];
        }

        // Map data to rows - simplified CSV escaping
        const rows = filteredData.map(item => {
            if (activeTab === 'Earnings') {
                return [
                    `"${(item.name || '').replace(/"/g, '""')}"`,
                    `"${item.type}"`,
                    `"${item.calc_method === 'Flat' ? 'Flat' : (item.calculation || '')}"`,
                    `"${item.amount_or_percent || ''}"`,
                    `"${item.consider_epf ? 'Yes' : 'No'}"`,
                    `"${item.consider_esi ? 'Yes' : 'No'}"`,
                    `"${item.status ? 'Active' : 'Inactive'}"`,
                    `"${(item.last_modified || '').replace(/\n/g, ' ').replace(/"/g, '""')}"`,
                    `"${(item.created || '').replace(/\n/g, ' ').replace(/"/g, '""')}"`
                ];
            } else {
                return [
                    `"${(item.name || '').replace(/"/g, '""')}"`,
                    `"${item.type}"`,
                    `"${item.taxable}"`,
                    `"${item.status ? 'Active' : 'Inactive'}"`
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
                    <AddEarningComponentForm onCancel={handleCancel} onSave={handleSave} initialData={editingComponent} />
                ) : activeTab === 'Deductions' ? (
                    <AddDeductionComponentForm onCancel={handleCancel} onSave={handleSave} initialData={editingComponent} />
                ) : (
                    <AddReimbursementComponentForm onCancel={handleCancel} onSave={handleSave} initialData={editingComponent} />
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
                            <Plus size={16} /> Add Component
                        </button>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Component Name</th>
                                    <th className="px-6 py-4">Name in Payslip</th>
                                    <th className="px-6 py-4">Nature of Pay</th>

                                    {/* Columns Specific to Earnings vs Others */}
                                    {activeTab === 'Earnings' ? (
                                        <>
                                            <th className="px-6 py-4">Calculation Method</th>
                                            <th className="px-6 py-4">Consider for PF</th>
                                            <th className="px-6 py-4">Consider for ESI</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Last Modified</th>
                                            <th className="px-6 py-4">Created</th>
                                        </>
                                    ) : (
                                        <>
                                            {/* Fallback Columns for Deductions/Reimbursements (Calculcation Removed) */}
                                            <th className="px-6 py-4">Taxable</th>
                                            <th className="px-6 py-4">Status</th>
                                        </>
                                    )}

                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.length > 0 ? (
                                    filteredData.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4 font-semibold text-slate-800">{item.name}</td>
                                            <td className="px-6 py-4 text-slate-600">{item.payslip_name || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                                                    {item.type}
                                                </span>
                                            </td>

                                            {/* Data Cells Specific to Earnings vs Others */}
                                            {activeTab === 'Earnings' ? (
                                                <>
                                                    <td className="px-6 py-4">{item.calc_method === 'Flat' ? 'Flat' : (item.calculation || '-')}</td>
                                                    <td className="px-6 py-4">{item.consider_epf ? 'Yes' : 'No'}</td>
                                                    <td className="px-6 py-4">{item.consider_esi ? 'Yes' : 'No'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${item.status ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                            {item.status ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500">{item.last_modified ? new Date(item.last_modified).toLocaleDateString() : '-'}</td>
                                                    <td className="px-6 py-4 text-slate-500">{item.created ? new Date(item.created).toLocaleDateString() : '-'}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-4">{item.taxable}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${item.status ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                            {item.status ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
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
                                                        className={`p-1.5 rounded-md transition-colors ${item.status ? 'text-amber-500 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
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
                                        <td colSpan={activeTab === 'Earnings' ? 9 : 5} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
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
