
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Copy,
    X,
    CheckCircle,
    AlertTriangle,
    Info,
    ChevronDown,
    FileText,
    Sigma,
    UserPlus,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface LoanType {
    id: string;
    name: string;
    interestRate: number;
    maxAmount: string; // Changed to string to support "2 months gross salary"
    maxTenure: number; // in months
    status: boolean;
    description: string;
    approvers?: string[];
    repaymentMonth?: string;
    createdAt?: string;
    updatedAt?: string;
    targetId?: string;
    targetType?: string;
    isEligibilityAfterJoining?: boolean;
    eligibilityJoiningType?: 'probation' | 'days';
    eligibilityJoiningDays?: number;
    isEligibilitySalaryRange?: boolean;
    eligibilitySalaryMin?: string;
    eligibilitySalaryMax?: string;
}

const MOCK_LOAN_TYPES: LoanType[] = [
    { id: '1', name: 'Personal Loan', interestRate: 10.5, maxAmount: '5,00,000', maxTenure: 24, status: true, description: 'Standard personal loan for employees.', approvers: ['Rajesh Kumar (Finance Head)', 'Sunita Gupta (Director)'] },
    { id: '2', name: 'Festival Advance', interestRate: 0, maxAmount: '20,000', maxTenure: 6, status: true, description: 'Special advance for festival expenses.', approvers: ['Amit Verma (Manager)'] },
    { id: '3', name: 'Salary Advance', interestRate: 0, maxAmount: '2 months gross salary', maxTenure: 3, status: true, description: 'Advance against upcoming salary.', approvers: ['Kavita Sharma (HR)'] },
    { id: '4', name: 'Medical Advance', interestRate: 0, maxAmount: '2,00,000', maxTenure: 12, status: true, description: 'For medical emergencies.' },
    { id: '5', name: 'Education Loan Assistance', interestRate: 6, maxAmount: '3,00,000', maxTenure: 36, status: true, description: "For employee or children's education." },
    { id: '6', name: 'Vehicle Advance', interestRate: 8, maxAmount: '4,00,000', maxTenure: 48, status: false, description: 'For two-wheeler/four-wheeler purchase.' },
    { id: '7', name: 'Relocation Advance', interestRate: 0, maxAmount: '1,00,000', maxTenure: 12, status: true, description: 'For joining/transfer expenses.' },
    { id: '8', name: 'Marriage Advance', interestRate: 0, maxAmount: '1,50,000', maxTenure: 18, status: true, description: "For employee's/family marriage." },
];

const EMPLOYEES_LIST = [
    "Amit Verma (Manager)",
    "Rajesh Kumar (Finance Head)",
    "Sunita Gupta (Director)",
    "Kavita Sharma (HR)",
    "Vikram Singh (VP)",
    "Anjali Mehta (Team Lead)"
];

const BUSINESS_UNITS = [
    "MindInventory",
    "300 Minds",
    "CollabCRM"
];

const LoanAdvancesTypes: React.FC = () => {
    // Persistence: Initialize from Supabase
    const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
    const [paygroups, setPaygroups] = useState<any[]>([]);
    const [selectedTarget, setSelectedTarget] = useState(`bu:${BUSINESS_UNITS[0]}`);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPaygroups = async () => {
        const { data } = await supabase.from('payroll_paygroups').select('id, name');
        if (data) setPaygroups(data);
    };

    const fetchLoanTypes = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('loan_types')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching loan types:', error);
        } else {
            const mappedData: LoanType[] = (data || []).map(item => ({
                id: item.id,
                name: item.name,
                interestRate: Number(item.interest_rate),
                maxAmount: item.max_amount || '',
                maxTenure: item.max_tenure || 0,
                status: item.status,
                description: item.description || '',
                approvers: item.approvers || [],
                repaymentMonth: item.repayment_month || '',
                createdAt: item.created_at,
                updatedAt: item.updated_at,
                targetId: item.target_id,
                targetType: item.target_type,
                isEligibilityAfterJoining: item.isEligibilityAfterJoining,
                eligibilityJoiningType: item.eligibilityJoiningType,
                eligibilityJoiningDays: item.eligibilityJoiningDays,
                isEligibilitySalaryRange: item.isEligibilitySalaryRange,
                eligibilitySalaryMin: item.eligibilitySalaryMin,
                eligibilitySalaryMax: item.eligibilitySalaryMax
            }));
            setLoanTypes(mappedData);
        }
        setIsLoading(false);
    };

    const handleAutoCreateDefaults = async (targetId: string, targetType: string, hasLoan: boolean, hasSalaryAdvance: boolean) => {
        setIsLoading(true);
        const defaults = [];
        
        if (!hasLoan) {
            defaults.push({
                name: 'Loan',
                interest_rate: 0,
                max_amount: '0',
                max_tenure: 48,
                status: false,
                description: 'Default loan type for employees.',
                approvers: [],
                repayment_month: monthOptions[0],
                target_id: targetId,
                target_type: targetType
            });
        }
        
        if (!hasSalaryAdvance) {
            defaults.push({
                name: 'Salary Advance',
                interest_rate: 0,
                max_amount: '2 months Net Salary',
                max_tenure: 3,
                status: false,
                description: 'Advance against upcoming salary.',
                approvers: [],
                repayment_month: monthOptions[0],
                target_id: targetId,
                target_type: targetType
            });
        }

        if (defaults.length > 0) {
            try {
                const { error } = await supabase
                    .from('loan_types')
                    .insert(defaults);
                if (error) throw error;
                await fetchLoanTypes();
            } catch (err) {
                console.error('Error auto-creating loan types:', err);
            }
        }
    };

    useEffect(() => {
        fetchLoanTypes();
        fetchPaygroups();
    }, []);

    useEffect(() => {
        if (!isLoading && loanTypes.length >= 0) {
            const [targetTypeRaw, targetId] = selectedTarget.split(':');
            if (targetTypeRaw === 'bu' && targetId !== 'MindInventory') {
                const hasLoan = loanTypes.some(t => t.name === 'Loan' && t.targetId === targetId);
                const hasSalaryAdvance = loanTypes.some(t => t.name === 'Salary Advance' && t.targetId === targetId);
                
                if (!hasLoan || !hasSalaryAdvance) {
                    handleAutoCreateDefaults(targetId, 'BusinessUnit', hasLoan, hasSalaryAdvance);
                }
            }
        }
    }, [selectedTarget, loanTypes.length, isLoading]);

    const [isEditing, setIsEditing] = useState(false);
    const [currentLoan, setCurrentLoan] = useState<Partial<LoanType>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // New States for Max Amount Configuration
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; maxAmount?: string; interestRate?: string; maxTenure?: string }>({});
    const [amountType, setAmountType] = useState<'Fixed' | 'Multiple'>('Fixed');
    const [fixedVal, setFixedVal] = useState('');
    const [multiFactor, setMultiFactor] = useState('2');
    const [multiBasis, setMultiBasis] = useState('Gross Salary');

    // Approver Selection State
    const [selectedApprover, setSelectedApprover] = useState('');

    // Eligibility Criteria State
    const [isEligibilityAfterJoining, setIsEligibilityAfterJoining] = useState(false);
    const [eligibilityJoiningType, setEligibilityJoiningType] = useState<'probation' | 'days'>('probation');
    const [eligibilityJoiningDays, setEligibilityJoiningDays] = useState(0);
    const [isEligibilitySalaryRange, setIsEligibilitySalaryRange] = useState(false);
    const [eligibilitySalaryMin, setEligibilitySalaryMin] = useState('');
    const [eligibilitySalaryMax, setEligibilitySalaryMax] = useState('');

    // Helper to generate next 12 months for repayment dropdown
    const getRepaymentMonthOptions = () => {
        const options = [];
        const date = new Date();
        for (let i = 0; i < 12; i++) {
            options.push(date.toLocaleString('default', { month: 'long', year: 'numeric' }));
            date.setMonth(date.getMonth() + 1);
        }
        return options;
    };

    const monthOptions = getRepaymentMonthOptions();

    const filteredTypes = loanTypes.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
        const [targetTypeRaw, targetId] = selectedTarget.split(':');
        const targetType = targetTypeRaw === 'pg' ? 'Paygroup' : 'BusinessUnit';
        
        const matchesTarget = t.targetId === targetId && t.targetType === targetType;
        // Also show items without a target id as default, or filter specifically
        return matchesSearch && matchesTarget;
    });

    const handleAddNew = () => {
        setCurrentLoan({
            name: 'Salary Advance',
            interestRate: 0,
            maxAmount: '',
            maxTenure: 0, // Default 0
            status: true,
            description: '',
            approvers: [],
            repaymentMonth: monthOptions[0]
        });
        // Reset amount config states
        setAmountType('Fixed');
        setFixedVal('');
        setMultiFactor('2');
        setMultiBasis('Gross Salary');

        setErrors({});
        setIsEditing(true);
        setSelectedApprover('');

        // Reset eligibility
        setIsEligibilityAfterJoining(false);
        setEligibilityJoiningType('probation');
        setEligibilityJoiningDays(0);
        setIsEligibilitySalaryRange(false);
        setEligibilitySalaryMin('');
        setEligibilitySalaryMax('');
    };

    const handleEdit = (loan: LoanType) => {
        setCurrentLoan(loan);

        // Parse maxAmount to set UI states
        if (loan.maxAmount.toLowerCase().includes('month')) {
            setAmountType('Multiple');
            const parts = loan.maxAmount.split(' ');
            setMultiFactor(parts[0]);
            // Regex to extract text after "months "
            const match = loan.maxAmount.match(/months\s+(.*)/i);
            setMultiBasis(match ? match[1] : 'Gross Salary');
            setFixedVal('');
        } else {
            setAmountType('Fixed');
            setFixedVal(loan.maxAmount.replace(/[^\d.,]/g, '')); // Keep digits, dots, commas
            setMultiFactor('2');
            setMultiBasis('Gross Salary');
        }

        setErrors({});
        setIsEditing(true);
        setSelectedApprover('');

        // Set eligibility from loan
        setIsEligibilityAfterJoining(loan.isEligibilityAfterJoining ?? false);
        setEligibilityJoiningType(loan.eligibilityJoiningType ?? 'probation');
        setEligibilityJoiningDays(loan.eligibilityJoiningDays ?? 0);
        setIsEligibilitySalaryRange(loan.isEligibilitySalaryRange ?? false);
        setEligibilitySalaryMin(loan.eligibilitySalaryMin ?? '');
        setEligibilitySalaryMax(loan.eligibilitySalaryMax ?? '');
    };

    const handleDuplicate = (loan: LoanType) => {
        const newLoan = {
            ...loan,
            id: Date.now().toString(),
            name: `${loan.name} (Copy)`,
        };
        setLoanTypes(prev => [newLoan, ...prev]);
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('loan_types')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting loan type:', error);
            alert('Failed to delete loan type.');
        } else {
            fetchLoanTypes();
        }
        setDeleteId(null);
    };

    const handleSave = async () => {
        const isSalaryAdvance = currentLoan.name === 'Salary Advance';
        const newErrors: { name?: string; maxAmount?: string; interestRate?: string; maxTenure?: string } = {};

        // 1. Basic Validation
        if (!currentLoan.name || !currentLoan.name.trim()) {
            newErrors.name = 'Loan Type is required.';
        }

        let isMaxAmountValid = true;
        
        if (amountType === 'Fixed') {
            if (!fixedVal || parseFloat(fixedVal.replace(/,/g, '')) <= 0) isMaxAmountValid = false;
        }
        if (amountType === 'Multiple' && (!multiFactor || !multiBasis)) isMaxAmountValid = false;

        if (!isMaxAmountValid) {
            newErrors.maxAmount = 'Max Amount Limit is required.';
        }

        if (currentLoan.name === 'Loan') {
            if (currentLoan.interestRate === undefined || currentLoan.interestRate === null) {
                newErrors.interestRate = 'Interest Rate is required.';
            }
            if (!currentLoan.maxTenure || currentLoan.maxTenure <= 0) {
                newErrors.maxTenure = 'Max Tenure is required (min 1 month).';
            }
            if (currentLoan.maxTenure && currentLoan.maxTenure > 48) {
                newErrors.maxTenure = 'Max tenure allowed is 48 months.';
            }
        }

        if (isSalaryAdvance) {
            if (!currentLoan.maxTenure || currentLoan.maxTenure <= 0) {
                newErrors.maxTenure = 'Max Tenure is required (min 1 month).';
            }
            if (currentLoan.maxTenure && currentLoan.maxTenure > 6) {
                newErrors.maxTenure = 'Max tenure allowed is 6 months.';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        let finalMaxAmount = amountType === 'Fixed'
            ? fixedVal
            : `${multiFactor} months ${multiBasis}`;

        setIsLoading(true);
        try {
            const [targetTypeRaw, targetId] = selectedTarget.split(':');
            const targetType = targetTypeRaw === 'pg' ? 'Paygroup' : 'BusinessUnit';
            
            const payload = {
                name: currentLoan.name,
                interest_rate: currentLoan.interestRate || 0,
                max_amount: finalMaxAmount,
                max_tenure: currentLoan.maxTenure || 0,
                status: currentLoan.status ?? true,
                description: currentLoan.description || '',
                approvers: currentLoan.approvers || [],
                repayment_month: (currentLoan.name === 'Salary Advance' || currentLoan.name === 'Loan') ? (currentLoan.repaymentMonth || monthOptions[0]) : null,
                updated_at: new Date().toISOString(),
                target_id: targetId,
                target_type: targetType,
                // Eligibility Criteria fields (using camelCase for payload as database columns might not exist yet, 
                // but this ensures local state sync if the backend supports it eventually)
                isEligibilityAfterJoining: isEligibilityAfterJoining,
                eligibilityJoiningType: eligibilityJoiningType,
                eligibilityJoiningDays: eligibilityJoiningDays,
                isEligibilitySalaryRange: isEligibilitySalaryRange,
                eligibilitySalaryMin: eligibilitySalaryMin,
                eligibilitySalaryMax: eligibilitySalaryMax
            };

            let error;
            if (currentLoan.id) {
                const { error: updateError } = await supabase
                    .from('loan_types')
                    .update(payload)
                    .eq('id', currentLoan.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('loan_types')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            await fetchLoanTypes();
            setIsEditing(false);
        } catch (err) {
            console.error('Error saving loan type:', err);
            alert('Failed to save loan type.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleStatus = async (id: string) => {
        const type = loanTypes.find(t => t.id === id);
        if (!type) return;

        const { error } = await supabase
            .from('loan_types')
            .update({ status: !type.status, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('Error toggling status:', error);
            alert('Failed to update status.');
        } else {
            fetchLoanTypes();
        }
    };

    // Approver Handlers
    const handleAddApprover = () => {
        if (!selectedApprover) return;
        const currentApprovers = currentLoan.approvers || [];
        if (!currentApprovers.includes(selectedApprover)) {
            setCurrentLoan({ ...currentLoan, approvers: [...currentApprovers, selectedApprover] });
        }
        setSelectedApprover('');
    };

    const removeApprover = (index: number) => {
        const currentApprovers = [...(currentLoan.approvers || [])];
        currentApprovers.splice(index, 1);
        setCurrentLoan({ ...currentLoan, approvers: currentApprovers });
    };

    const moveApprover = (index: number, direction: number) => {
        const currentApprovers = [...(currentLoan.approvers || [])];
        if (index + direction < 0 || index + direction >= currentApprovers.length) return;

        const temp = currentApprovers[index];
        currentApprovers[index] = currentApprovers[index + direction];
        currentApprovers[index + direction] = temp;

        setCurrentLoan({ ...currentLoan, approvers: currentApprovers });
    };

    return (
        <div className="h-full overflow-y-auto bg-slate-50">
            <div className="p-4 lg:p-8 w-full mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
                {/* Header */}
                {!isEditing && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                Loans & Advances
                            </h1>
                            <p className="text-slate-500 mt-1">Configure types of loans and advances available for employees.</p>
                        </div>
                    </div>
                )}

                {/* List View */}
                {!isEditing ? (
                    <>
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                            {/* Lookup Filter Toolbar */}
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
                                                    <FileText size={16} className="text-slate-400" /> Loan Type
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 sm:w-80 relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Filter Results..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400 shadow-sm"
                                        />
                                    </div>

                                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                                        Filter
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="relative">
                                        <select 
                                            value={selectedTarget}
                                            onChange={(e) => setSelectedTarget(e.target.value)}
                                            className="appearance-none w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all h-[42px]">
                                            <optgroup label="Business Units">
                                                {BUSINESS_UNITS.map(bu => (
                                                    <option key={bu} value={`bu:${bu}`}>{bu}</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                    {/* Hidden: Add Loan Type button (can be restored later)
                                    <button
                                        onClick={handleAddNew}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-bold shadow-sm shadow-purple-100"
                                    >
                                        Add Loan Type
                                    </button>
                                    */}
                                </div>
                            </div>

                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4">Loan Type</th>
                                            <th className="px-6 py-4">Interest Rate</th>
                                            <th className="px-6 py-4">Max Amount</th>
                                            <th className="px-6 py-4">Max Tenure</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Created By</th>
                                            <th className="px-6 py-4">Last Modified By</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                                        <span>Loading loan types...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredTypes.length > 0 ? filteredTypes.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4 max-w-xs">
                                                    <div>
                                                        <p className="font-bold text-slate-800">{item.name}</p>
                                                        <p className="text-xs text-slate-500 truncate mt-0.5">{item.description}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-slate-700">{item.interestRate}%</span> p.a.
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-slate-800">
                                                        {item.maxAmount.includes('months') ? item.maxAmount : `₹${item.maxAmount}`}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-block px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600 border border-slate-200">
                                                        {item.name === 'Salary Advance' ? '--' : (item.name === 'Loan' ? '48 Months' : `${item.maxTenure} Months`)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${item.status ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                        {item.status ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-slate-600">HR Manager</span>
                                                    {item.createdAt && <p className="text-[10px] text-slate-400 mt-0.5">{new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-slate-600">HR Manager</span>
                                                    {item.updatedAt && <p className="text-[10px] text-slate-400 mt-0.5">{new Date(item.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-3 transition-opacity">
                                                        <button
                                                            onClick={() => toggleStatus(item.id)}
                                                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${item.status ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                                            title={item.status ? "Deactivate" : "Activate"}
                                                        >
                                                            <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.status ? 'translate-x-5' : 'translate-x-1'}`} />
                                                        </button>
                                                        <div className="flex items-center gap-1 border-l border-slate-200 pl-3 opacity-60 group-hover:opacity-100">
                                                            <button
                                                                onClick={() => handleEdit(item)}
                                                                className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteId(item.id)}
                                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                                    No loan types found. Create one to get started.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Edit/Add Form */
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full mx-auto">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-800">{currentLoan.id ? 'Edit Loan Type' : 'Add New Loan Type'}</h2>
                            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Loan Type <span className="text-rose-500">*</span></label>
                                    <div className="flex flex-wrap gap-4">
                                        <label className={`flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer transition-all ${currentLoan.name === 'Salary Advance' ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500' : 'bg-white border-slate-200 hover:border-purple-200'}`}>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${currentLoan.name === 'Salary Advance' ? 'border-purple-600' : 'border-slate-300'}`}>
                                                {currentLoan.name === 'Salary Advance' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                            </div>
                                            <input
                                                type="radio"
                                                name="loanType"
                                                className="hidden"
                                                checked={currentLoan.name === 'Salary Advance'}
                                                onChange={() => {
                                                    setCurrentLoan({ ...currentLoan, name: 'Salary Advance', maxTenure: 0, repaymentMonth: currentLoan.repaymentMonth || monthOptions[0] });
                                                    setAmountType('Multiple');
                                                    setMultiBasis('Net Salary');
                                                    if (errors.name) setErrors({ ...errors, name: undefined });
                                                    // Clear Loan specific errors
                                                    setErrors(prev => ({ ...prev, interestRate: undefined, maxTenure: undefined }));
                                                }}
                                            />
                                            <span className={`text-sm font-bold ${currentLoan.name === 'Salary Advance' ? 'text-purple-900' : 'text-slate-600'}`}>Salary Advance</span>
                                        </label>

                                        <label className={`flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer transition-all ${currentLoan.name === 'Loan' ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500' : 'bg-white border-slate-200 hover:border-purple-200'}`}>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${currentLoan.name === 'Loan' ? 'border-purple-600' : 'border-slate-300'}`}>
                                                {currentLoan.name === 'Loan' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                            </div>
                                            <input
                                                type="radio"
                                                name="loanType"
                                                className="hidden"
                                                checked={currentLoan.name === 'Loan'}
                                                onChange={() => {
                                                    setCurrentLoan({ ...currentLoan, name: 'Loan', repaymentMonth: currentLoan.repaymentMonth || monthOptions[0] });
                                                    if (errors.name) setErrors({ ...errors, name: undefined });
                                                }}
                                            />
                                            <span className={`text-sm font-bold ${currentLoan.name === 'Loan' ? 'text-purple-900' : 'text-slate-600'}`}>Loan</span>
                                        </label>

                                        {/* Handle existing custom names if editing */}
                                        {currentLoan.name && currentLoan.name !== 'Salary Advance' && currentLoan.name !== 'Loan' && (
                                            <label className={`flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer transition-all bg-purple-50 border-purple-500 ring-1 ring-purple-500`}>
                                                <div className="w-5 h-5 rounded-full border border-purple-600 flex items-center justify-center">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                                                </div>
                                                <input type="radio" name="loanType" className="hidden" checked readOnly />
                                                <span className="text-sm font-bold text-purple-900">{currentLoan.name}</span>
                                            </label>
                                        )}
                                    </div>
                                    {errors.name && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertTriangle size={10} /> {errors.name}</p>}
                                </div>

                                <div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                        <span className="text-sm font-medium text-slate-700">Interest Rate</span>
                                        <div className={`flex border rounded-lg overflow-hidden transition-all ${errors.interestRate ? 'border-rose-500' : 'border-slate-200 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500'}`}>
                                            <input
                                                type="number"
                                                value={currentLoan.interestRate}
                                                onChange={e => {
                                                    setCurrentLoan({ ...currentLoan, interestRate: parseFloat(e.target.value) || 0 });
                                                    if (errors.interestRate) setErrors({ ...errors, interestRate: undefined });
                                                }}
                                                className="w-20 px-3 py-2 text-sm focus:outline-none"
                                            />
                                            <div className="px-3 py-2 bg-slate-50 border-l border-slate-200 text-slate-500 text-sm flex items-center justify-center font-medium">
                                                %
                                            </div>
                                        </div>
                                    </div>
                                    {errors.interestRate && (
                                        <div className="mt-1.5 space-y-1 ml-5">
                                            <p className="text-xs text-rose-500">Default interest rate is required</p>
                                            <p className="text-xs text-rose-500">Interest calculation rate is required</p>
                                        </div>
                                    )}
                                    <p className="text-[10px] text-slate-400 mt-1 ml-5">Set 0 for interest-free advances.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                                        Max Tenure (Months) {(currentLoan.name === 'Loan' || currentLoan.name === 'Salary Advance') && <span className="text-rose-500">*</span>}
                                    </label>
                                    <input
                                        type="number"
                                        value={currentLoan.maxTenure}
                                        onChange={e => {
                                            const val = parseInt(e.target.value) || 0;
                                            if (currentLoan.name === 'Salary Advance' && val > 6) {
                                                setErrors(prev => ({ ...prev, maxTenure: 'Max tenure allowed is 6 months.' }));
                                                return;
                                            }
                                            if (currentLoan.name === 'Loan' && val > 48) {
                                                setErrors(prev => ({ ...prev, maxTenure: 'Max tenure allowed is 48 months.' }));
                                                return;
                                            }
                                            setCurrentLoan({ ...currentLoan, maxTenure: val });
                                            if (errors.maxTenure) setErrors({ ...errors, maxTenure: undefined });
                                        }}
                                        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 ${errors.maxTenure ? 'border-rose-500' : 'border-slate-200'}`}
                                    />
                                    {currentLoan.name === 'Salary Advance' && (
                                        <p className="text-[10px] text-slate-400 mt-1">Max tenure allowed is 6 months.</p>
                                    )}
                                    {currentLoan.name === 'Loan' && (
                                        <p className="text-[10px] text-slate-400 mt-1">Max tenure allowed is 48 months.</p>
                                    )}
                                    {errors.maxTenure && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertTriangle size={10} /> {errors.maxTenure}</p>}
                                </div>

                                {/* Repayment Month Dropdown */}
                                {(currentLoan.name && currentLoan.name !== 'Salary Advance' && currentLoan.name !== 'Loan') && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Repayment Month</label>
                                        <div className="relative">
                                            <select
                                                value={currentLoan.repaymentMonth}
                                                onChange={e => setCurrentLoan({ ...currentLoan, repaymentMonth: e.target.value })}
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 appearance-none"
                                            >
                                                {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                )}

                                {/* Max Amount Limit - Enhanced Section */}
                                <div className="md:col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-200">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Max Amount Limit <span className="text-rose-500">*</span></label>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-4">
                                            {currentLoan.name !== 'Salary Advance' && (
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${amountType === 'Fixed' ? 'border-purple-600 bg-white' : 'border-slate-300 bg-white'}`}>
                                                        {amountType === 'Fixed' && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                                                    </div>
                                                    <input
                                                        type="radio"
                                                        className="hidden"
                                                        checked={amountType === 'Fixed'}
                                                        onChange={() => {
                                                            setAmountType('Fixed');
                                                            const val = fixedVal || '';
                                                            setCurrentLoan({ ...currentLoan, maxAmount: val });
                                                        }}
                                                    />
                                                    <span className={`text-sm font-medium ${amountType === 'Fixed' ? 'text-purple-900' : 'text-slate-600'}`}>Fixed Amount</span>
                                                </label>
                                            )}
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${amountType === 'Multiple' ? 'border-purple-600 bg-white' : 'border-slate-300 bg-white'}`}>
                                                    {amountType === 'Multiple' && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    className="hidden"
                                                    checked={amountType === 'Multiple'}
                                                    onChange={() => {
                                                        setAmountType('Multiple');
                                                        const val = `${multiFactor} months ${multiBasis}`;
                                                        setCurrentLoan({ ...currentLoan, maxAmount: val });
                                                    }}
                                                />
                                                <span className={`text-sm font-medium ${amountType === 'Multiple' ? 'text-purple-900' : 'text-slate-600'}`}>Multiple of Salary</span>
                                            </label>
                                        </div>

                                        {amountType === 'Fixed' ? (
                                            <div className="relative max-w-md animate-in fade-in slide-in-from-top-1 duration-200">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                <input
                                                    type="text"
                                                    value={fixedVal}
                                                    onChange={(e) => {
                                                        const raw = e.target.value.replace(/[^\d]/g, '');
                                                        const formatted = raw ? parseInt(raw).toLocaleString('en-IN') : '';
                                                        setFixedVal(formatted);
                                                        setCurrentLoan({ ...currentLoan, maxAmount: formatted });
                                                        if (errors.maxAmount) setErrors({ ...errors, maxAmount: undefined });
                                                    }}
                                                    placeholder="e.g. 5,00,000"
                                                    className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white shadow-sm"
                                                />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4 max-w-lg animate-in fade-in slide-in-from-top-1 duration-200">
                                                <div className="relative">
                                                    <select
                                                        value={multiFactor}
                                                        onChange={(e) => {
                                                            setMultiFactor(e.target.value);
                                                            setCurrentLoan({ ...currentLoan, maxAmount: `${e.target.value} months ${multiBasis}` });
                                                        }}
                                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 appearance-none shadow-sm cursor-pointer"
                                                    >
                                                        {[1, 2, 3, 4, 5, 6, 12].map(n => <option key={n} value={n}>{n}x</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                                <div className="relative">
                                                    <select
                                                        value={multiBasis}
                                                        onChange={(e) => {
                                                            setMultiBasis(e.target.value);
                                                            setCurrentLoan({ ...currentLoan, maxAmount: `${multiFactor} months ${e.target.value}` });
                                                        }}
                                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 appearance-none shadow-sm cursor-pointer"
                                                    >
                                                        {currentLoan.name === 'Salary Advance' ? (
                                                            <option>Net Salary</option>
                                                        ) : (
                                                            <>
                                                                <option>Basic Salary</option>
                                                                <option>Gross Salary</option>
                                                                <option>Net Salary</option>
                                                            </>
                                                        )}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                            </div>
                                        )}
                                        {errors.maxAmount && <p className="text-xs text-rose-500 mt-2 flex items-center gap-1"><AlertTriangle size={10} /> {errors.maxAmount}</p>}

                                        <div className="mt-3 flex items-center gap-2 p-2 bg-slate-100 rounded-lg w-fit border border-slate-200">
                                            <Info size={14} className="text-purple-500" />
                                            <span className="text-xs text-slate-500">Preview: <span className="font-bold text-slate-700">{amountType === 'Fixed' ? `Max Limit: ₹ ${fixedVal || '0'}` : `Max Limit: ${multiFactor} months ${multiBasis}`}</span></span>
                                        </div>
                                    </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
                                    <textarea
                                        value={currentLoan.description}
                                        onChange={e => setCurrentLoan({ ...currentLoan, description: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none h-20"
                                        placeholder="Brief description of the loan purpose..."
                                    />
                                </div>

                                {/* Approval Flow Section */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Approval Flow</label>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <div className="flex gap-3 mb-4">
                                            <div className="relative flex-1">
                                                <select
                                                    value={selectedApprover}
                                                    onChange={(e) => setSelectedApprover(e.target.value)}
                                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 appearance-none bg-white"
                                                >
                                                    <option value="">Select Employee to Add...</option>
                                                    {EMPLOYEES_LIST.map(emp => (
                                                        <option key={emp} value={emp} disabled={currentLoan.approvers?.includes(emp)}>{emp}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                            </div>
                                            <button
                                                onClick={handleAddApprover}
                                                disabled={!selectedApprover}
                                                className="px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                            >
                                                <Plus size={16} /> Add
                                            </button>
                                        </div>

                                        {/* List */}
                                        <div className="space-y-2">
                                            {currentLoan.approvers && currentLoan.approvers.length > 0 ? (
                                                currentLoan.approvers.map((approver, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg group hover:border-purple-200 transition-colors shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                                                                {index + 1}
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-700">{approver}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => moveApprover(index, -1)}
                                                                disabled={index === 0}
                                                                className="p-1.5 text-slate-400 hover:text-purple-600 disabled:opacity-30 rounded hover:bg-purple-50 transition-colors"
                                                            >
                                                                <ArrowUp size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => moveApprover(index, 1)}
                                                                disabled={index === (currentLoan.approvers?.length || 0) - 1}
                                                                className="p-1.5 text-slate-400 hover:text-purple-600 disabled:opacity-30 rounded hover:bg-purple-50 transition-colors"
                                                            >
                                                                <ArrowDown size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => removeApprover(index)}
                                                                className="p-1.5 text-slate-400 hover:text-rose-600 ml-2 rounded hover:bg-rose-50 transition-colors"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-6 text-slate-400 text-xs italic bg-white rounded-lg border border-dashed border-slate-200">
                                                    No approvers added. Requests will be auto-approved or routed to admin.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Eligibility Criteria Section */}
                                <div className="md:col-span-2">
                                    <div className="flex flex-col gap-1 mb-4">
                                        <h3 className="text-sm font-bold text-slate-800">Eligibility Criteria</h3>
                                    </div>
                                    
                                    <div className="space-y-5">
                                        {/* Eligibility After Joining */}
                                        <div className="space-y-3">
                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${isEligibilityAfterJoining ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                                    {isEligibilityAfterJoining && <CheckCircle size={14} className="text-white" />}
                                                </div>
                                                <input 
                                                    type="checkbox" 
                                                    className="hidden" 
                                                    checked={isEligibilityAfterJoining} 
                                                    onChange={() => setIsEligibilityAfterJoining(!isEligibilityAfterJoining)} 
                                                />
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-purple-700 transition-colors">Employees are eligible for loans after</span>
                                            </label>
                                            
                                            {isEligibilityAfterJoining && (
                                                <div className="pl-8 space-y-3 animate-in fade-in slide-in-from-top-1">
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${eligibilityJoiningType === 'probation' ? 'border-purple-600' : 'border-slate-300'}`}>
                                                            {eligibilityJoiningType === 'probation' && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                                                        </div>
                                                        <input 
                                                            type="radio" 
                                                            className="hidden" 
                                                            checked={eligibilityJoiningType === 'probation'} 
                                                            onChange={() => setEligibilityJoiningType('probation')} 
                                                        />
                                                        <span className="text-sm font-medium text-slate-600">Probation Period</span>
                                                    </label>
                                                    
                                                    <div className="flex items-center gap-3">
                                                        <label className="flex items-center gap-3 cursor-pointer group">
                                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${eligibilityJoiningType === 'days' ? 'border-purple-600' : 'border-slate-300'}`}>
                                                                {eligibilityJoiningType === 'days' && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                                                            </div>
                                                            <input 
                                                                type="radio" 
                                                                className="hidden" 
                                                                checked={eligibilityJoiningType === 'days'} 
                                                                onChange={() => setEligibilityJoiningType('days')} 
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                <input 
                                                                    type="number" 
                                                                    value={eligibilityJoiningDays}
                                                                    onChange={(e) => setEligibilityJoiningDays(parseInt(e.target.value) || 0)}
                                                                    className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:border-purple-500"
                                                                />
                                                                <span className="text-sm font-medium text-slate-600">days from joining</span>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Salary Range Eligibility */}
                                        <div className="space-y-3">
                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${isEligibilitySalaryRange ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                                    {isEligibilitySalaryRange && <CheckCircle size={14} className="text-white" />}
                                                </div>
                                                <input 
                                                    type="checkbox" 
                                                    className="hidden" 
                                                    checked={isEligibilitySalaryRange} 
                                                    onChange={() => setIsEligibilitySalaryRange(!isEligibilitySalaryRange)} 
                                                />
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-purple-700 transition-colors">Employees are eligible if annual salary is in the range of</span>
                                            </label>
                                            
                                            {isEligibilitySalaryRange && (
                                                <div className="pl-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                                                    <input 
                                                        type="text" 
                                                        value={eligibilitySalaryMin}
                                                        onChange={(e) => setEligibilitySalaryMin(e.target.value)}
                                                        className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:border-purple-500"
                                                        placeholder="Min"
                                                    />
                                                    <span className="text-slate-400">-</span>
                                                    <input 
                                                        type="text" 
                                                        value={eligibilitySalaryMax}
                                                        onChange={(e) => setEligibilitySalaryMax(e.target.value)}
                                                        className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:border-purple-500"
                                                        placeholder="Max"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-2 cursor-pointer w-fit">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${currentLoan.status ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}>
                                        {currentLoan.status && <CheckCircle size={14} className="text-white" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={currentLoan.status} onChange={() => setCurrentLoan({ ...currentLoan, status: !currentLoan.status })} />
                                    <span className="text-sm font-medium text-slate-700">Mark as Active</span>
                                </label>
                            </div>
                        </div>

                        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium text-sm transition-colors">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold text-sm shadow-sm transition-colors">Save</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-t-4 border-rose-500">
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={28} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Delete Loan Type?</h2>
                            <p className="text-sm text-slate-500 mb-6">
                                Are you sure you want to delete this loan type? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 shadow-sm transition-colors">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanAdvancesTypes;
