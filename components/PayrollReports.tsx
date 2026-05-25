import React, { useState, useEffect, useRef } from 'react';
import { 
    Home, 
    Search, 
    Bookmark, 
    ArrowLeft, 
    Download, 
    Filter, 
    Loader2, 
    FileText, 
    FileSpreadsheet, 
    TrendingUp, 
    Percent, 
    PiggyBank, 
    CreditCard, 
    ChevronRight,
    ChevronDown,
    CheckCircle,
    Clock,
    AlertCircle,
    Calendar,
    User,
    Users,
    Maximize2,
    MoreVertical,
    Building,
    Briefcase,
    Calculator,
    MapPin,
    CheckSquare,
    X
} from 'lucide-react';

interface Report {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: string;
}

const REPORTS_LIST: Report[] = [
    {
        id: 'monthly_payroll',
        title: 'Monthly Payroll Summary',
        description: 'Detailed breakdown of earnings, deductions, and net pay per employee for the selected month.',
        category: 'Summary',
        icon: 'spreadsheet'
    },
    {
        id: 'tds_tax',
        title: 'TDS & Income Tax Deductions',
        description: 'Summary of income tax (TDS) deducted source-wise for all employees under active tax regimes.',
        category: 'Compliance',
        icon: 'percent'
    },
    {
        id: 'epf_esic',
        title: 'EPF & ESIC Compliance Report',
        description: 'Statutory compliance report for Employee Provident Fund and Employee State Insurance contributions.',
        category: 'Compliance',
        icon: 'piggybank'
    },
    {
        id: 'bank_disbursal',
        title: 'Bank Disbursal Register',
        description: 'Detailed bank-wise payment transfer advice register ready for upload and payroll disbursement.',
        category: 'Payment',
        icon: 'creditcard'
    },
    {
        id: 'expenses_claims',
        title: 'Expense & Reimbursement Claims',
        description: 'Summary of employee expense claims, approved amounts, categories, and reimbursement payout status.',
        category: 'Expenses',
        icon: 'filetext'
    },
    {
        id: 'salary_register',
        title: 'Salary Register',
        description: 'Comprehensive register of salary structure components, active allowances, and fixed pay elements.',
        category: 'Summary',
        icon: 'trendingup'
    },
    {
        id: 'employee_ctc',
        title: 'Employee CTC Report',
        description: 'Detailed CTC (Cost to Company) breakdown including monthly gross salary, annual CTC, and employer contributions.',
        category: 'Summary',
        icon: 'trendingup'
    },
    {
        id: 'employee_salary_structure',
        title: 'Employee Salary Structure Report',
        description: 'Comprehensive breakdown of employee active salary structure grades, fixed allowances, deductions, and tax regimes.',
        category: 'Summary',
        icon: 'spreadsheet'
    }
];

const FIELDS = [
    { name: 'Month', icon: Calendar },
    { name: 'Department', icon: Building },
    { name: 'Business Unit', icon: MapPin },
    { name: 'Employee', icon: User },
    { name: 'Status', icon: CheckSquare },
    { name: 'Salary Structure', icon: CheckCircle }
];

const PayrollReports: React.FC = () => {
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [bookmarkedReports, setBookmarkedReports] = useState<string[]>([]);
    
    // Filters state
    const [selectedMonth, setSelectedMonth] = useState('November 2025');
    const [selectedDept, setSelectedDept] = useState('All');
    const [selectedBU, setSelectedBU] = useState('All');
    const [employeeSearch, setEmployeeSearch] = useState('');
    
    // Lookup Filter States
    const [completedFilters, setCompletedFilters] = useState<any[]>([]);
    const [currentField, setCurrentField] = useState<string | null>(null);
    const [currentOperator, setCurrentOperator] = useState<string | null>(null);
    const [tempValues, setTempValues] = useState<string[]>([]);
    const [tempContainsText, setTempContainsText] = useState('');
    const [valSearchQuery, setValSearchQuery] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);

    // Report run state
    const [isRunning, setIsRunning] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);
    const [hasRun, setHasRun] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Bookmarking toggle
    const toggleBookmark = (id: string) => {
        setBookmarkedReports(prev => 
            prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
        );
    };

    // Filter reports based on search query
    const filteredReports = REPORTS_LIST.filter(report => 
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Dynamic icon selection
    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'spreadsheet':
                return <FileSpreadsheet size={22} />;
            case 'percent':
                return <Percent size={22} />;
            case 'piggybank':
                return <PiggyBank size={22} />;
            case 'creditcard':
                return <CreditCard size={22} />;
            case 'filetext':
                return <FileText size={22} />;
            case 'trendingup':
                return <TrendingUp size={22} />;
            default:
                return <FileText size={22} />;
        }
    };

    const getOptionsForField = (field: string) => {
        if (field === 'Month') {
            return ['November 2025', 'October 2025', 'September 2025', 'August 2025'];
        }
        if (field === 'Department') {
            return ['Engineering', 'HR', 'Sales', 'Finance'];
        }
        if (field === 'Business Unit') {
            return ['MindInventory', '300 Minds', 'CollabCRM'];
        }
        if (field === 'Status') {
            return ['Paid', 'Completed', 'Approved', 'Pending'];
        }
        if (field === 'Salary Structure') {
            return [
                'Standard L2 Eng Structure',
                'Lead Eng Structure',
                'Standard HR Structure',
                'Sales Incentive Structure',
                'Finance Mgr Structure'
            ];
        }
        return [];
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
        setEmployeeSearch('');
    };

    const handleSelectReport = (report: Report) => {
        setSelectedReport(report);
        setHasRun(false);
        setReportData([]);
        setEmployeeSearch('');
        setSelectedDept('All');
        setSelectedBU('All');
        setCompletedFilters([]);
        cancelCurrentFilter();
    };

    const handleBack = () => {
        setSelectedReport(null);
        setHasRun(false);
        setReportData([]);
        setCompletedFilters([]);
        cancelCurrentFilter();
    };

    // Auto-run report whenever filters change
    useEffect(() => {
        if (selectedReport) {
            handleRunReport();
        }
    }, [selectedReport, employeeSearch, completedFilters, selectedMonth, selectedBU]);

    // Generate mock data on running report
    const handleRunReport = () => {
        setIsRunning(true);
        setTimeout(() => {
            // Generate contextual mock data
            let mockData: any[] = [];

            // Extract department filter values if any
            const deptFilterObj = completedFilters.find(f => f.field === 'Department');
            const activeDepts = deptFilterObj ? deptFilterObj.values : [];
            const hasDeptFilter = activeDepts.length > 0;

            const isEng = !hasDeptFilter || activeDepts.some((d: string) => d.toLowerCase() === 'engineering');
            const isHR = !hasDeptFilter || activeDepts.some((d: string) => d.toLowerCase() === 'hr');
            const isSales = !hasDeptFilter || activeDepts.some((d: string) => d.toLowerCase() === 'sales');
            const isFinance = !hasDeptFilter || activeDepts.some((d: string) => d.toLowerCase() === 'finance');

            if (selectedReport?.id === 'monthly_payroll') {
                if (isEng) {
                    mockData.push(
                        { id: 'TF00123', name: 'Priya Sharma', dept: 'Engineering', business_unit: 'MindInventory', gross: 55000, epf: 1800, pt: 200, tds: 4500, net: 48500, status: 'Paid' },
                        { id: 'TF00456', name: 'Rohan Mehta', dept: 'Engineering', business_unit: '300 Minds', gross: 78000, epf: 1800, pt: 200, tds: 8200, net: 67800, status: 'Paid' }
                    );
                }
                if (isHR) {
                    mockData.push(
                        { id: 'TF00789', name: 'Anjali Verma', dept: 'HR', business_unit: 'CollabCRM', gross: 48000, epf: 1800, pt: 200, tds: 2100, net: 43900, status: 'Paid' }
                    );
                }
                if (isSales) {
                    mockData.push(
                        { id: 'TF00246', name: 'Vikram Singh', dept: 'Sales', business_unit: 'MindInventory', gross: 50000, epf: 1800, pt: 200, tds: 3200, net: 44800, status: 'Paid' }
                    );
                }
                if (isFinance) {
                    mockData.push(
                        { id: 'TF00912', name: 'Siddharth Roy', dept: 'Finance', business_unit: 'CollabCRM', gross: 65000, epf: 1800, pt: 200, tds: 5400, net: 57600, status: 'Paid' }
                    );
                }
            } else if (selectedReport?.id === 'tds_tax') {
                if (isEng) {
                    mockData.push(
                        { id: 'TF00123', name: 'Priya Sharma', pan: 'ABCDE1234F', dept: 'Engineering', business_unit: 'MindInventory', grossAnnual: 660000, savings80c: 150000, taxable: 410000, tdsYtd: 45000, tdsCurrent: 4500 },
                        { id: 'TF00456', name: 'Rohan Mehta', pan: 'FGHJK5678L', dept: 'Engineering', business_unit: '300 Minds', grossAnnual: 936000, savings80c: 120000, taxable: 716000, tdsYtd: 82000, tdsCurrent: 8200 }
                    );
                }
                if (isHR) {
                    mockData.push(
                        { id: 'TF00789', name: 'Anjali Verma', pan: 'MNOPQ9012R', dept: 'HR', business_unit: 'CollabCRM', grossAnnual: 576000, savings80c: 150000, taxable: 326000, tdsYtd: 21000, tdsCurrent: 2100 }
                    );
                }
                if (isSales) {
                    mockData.push(
                        { id: 'TF00246', name: 'Vikram Singh', pan: 'STUVW3456X', dept: 'Sales', business_unit: 'MindInventory', grossAnnual: 600000, savings80c: 80000, taxable: 420000, tdsYtd: 32000, tdsCurrent: 3200 }
                    );
                }
                if (isFinance) {
                    mockData.push(
                        { id: 'TF00912', name: 'Siddharth Roy', pan: 'YZABC7890D', dept: 'Finance', business_unit: 'CollabCRM', grossAnnual: 780000, savings80c: 150000, taxable: 530000, tdsYtd: 54000, tdsCurrent: 5400 }
                    );
                }
            } else if (selectedReport?.id === 'epf_esic') {
                if (isEng) {
                    mockData.push(
                        { id: 'TF00123', name: 'Priya Sharma', uan: '100900200300', dept: 'Engineering', business_unit: 'MindInventory', gross: 55000, epfEmp: 1800, epfEmpr: 1800, esicEmp: 0, esicEmpr: 0 },
                        { id: 'TF00456', name: 'Rohan Mehta', uan: '100900200301', dept: 'Engineering', business_unit: '300 Minds', gross: 78000, epfEmp: 1800, epfEmpr: 1800, esicEmp: 0, esicEmpr: 0 }
                    );
                }
                if (isHR) {
                    mockData.push(
                        { id: 'TF00789', name: 'Anjali Verma', uan: '100900200302', dept: 'HR', business_unit: 'CollabCRM', gross: 48000, epfEmp: 1800, epfEmpr: 1800, esicEmp: 0, esicEmpr: 0 }
                    );
                }
                if (isSales) {
                    mockData.push(
                        { id: 'TF00246', name: 'Vikram Singh', uan: '100900200303', dept: 'Sales', business_unit: 'MindInventory', gross: 15000, epfEmp: 1800, epfEmpr: 1800, esicEmp: 112.5, esicEmpr: 487.5 }
                    );
                }
                if (isFinance) {
                    mockData.push(
                        { id: 'TF00912', name: 'Siddharth Roy', uan: '100900200304', dept: 'Finance', business_unit: 'CollabCRM', gross: 65000, epfEmp: 1800, epfEmpr: 1800, esicEmp: 0, esicEmpr: 0 }
                    );
                }
            } else if (selectedReport?.id === 'bank_disbursal') {
                if (isEng) {
                    mockData.push(
                        { name: 'Priya Sharma', bank: 'HDFC Bank', acc: '000123456789', ifsc: 'HDFC0001234', amount: 48500, type: 'NEFT', status: 'Completed', dept: 'Engineering', business_unit: 'MindInventory' },
                        { name: 'Rohan Mehta', bank: 'ICICI Bank', acc: '555234567890', ifsc: 'ICIC0000555', amount: 67800, type: 'NEFT', status: 'Completed', dept: 'Engineering', business_unit: '300 Minds' }
                    );
                }
                if (isHR) {
                    mockData.push(
                        { name: 'Anjali Verma', bank: 'SBI', acc: '333456789012', ifsc: 'SBIN0000333', amount: 43900, type: 'NEFT', status: 'Completed', dept: 'HR', business_unit: 'CollabCRM' }
                    );
                }
                if (isSales) {
                    mockData.push(
                        { name: 'Vikram Singh', bank: 'HDFC Bank', acc: '000987654321', ifsc: 'HDFC0001234', amount: 44800, type: 'IMPS', status: 'Completed', dept: 'Sales', business_unit: 'MindInventory' }
                    );
                }
                if (isFinance) {
                    mockData.push(
                        { name: 'Siddharth Roy', bank: 'Axis Bank', acc: '999123456789', ifsc: 'UTIB0000999', amount: 57600, type: 'NEFT', status: 'Completed', dept: 'Finance', business_unit: 'CollabCRM' }
                    );
                }
            } else if (selectedReport?.id === 'expenses_claims') {
                mockData = [
                    { claimId: 'EXP-8012', name: 'Rohan Mehta', category: 'Broadband', claimAmt: 1500, approvedAmt: 1500, date: '12 Nov 2025', status: 'Approved', dept: 'Engineering', business_unit: '300 Minds' },
                    { claimId: 'EXP-8013', name: 'Priya Sharma', category: 'Travel', claimAmt: 8500, approvedAmt: 8500, date: '15 Nov 2025', status: 'Approved', dept: 'Engineering', business_unit: 'MindInventory' },
                    { claimId: 'EXP-8014', name: 'Anjali Verma', category: 'Meal', claimAmt: 1200, approvedAmt: 900, date: '19 Nov 2025', status: 'Approved', dept: 'HR', business_unit: 'CollabCRM' },
                    { claimId: 'EXP-8015', name: 'Vikram Singh', category: 'Other', claimAmt: 4500, approvedAmt: 0, date: '21 Nov 2025', status: 'Pending', dept: 'Sales', business_unit: 'MindInventory' }
                ];
            } else if (selectedReport?.id === 'salary_register') {
                if (isEng) {
                    mockData.push(
                        { id: 'TF00123', name: 'Priya Sharma', basic: 25000, hra: 12500, special: 17500, gross: 55000, net: 48500, dept: 'Engineering', business_unit: 'MindInventory' },
                        { id: 'TF00456', name: 'Rohan Mehta', basic: 35000, hra: 17500, special: 25500, gross: 78000, net: 67800, dept: 'Engineering', business_unit: '300 Minds' }
                    );
                }
                if (isHR) {
                    mockData.push(
                        { id: 'TF00789', name: 'Anjali Verma', basic: 22000, hra: 11000, special: 15000, gross: 48000, net: 43900, dept: 'HR', business_unit: 'CollabCRM' }
                    );
                }
                if (isSales) {
                    mockData.push(
                        { id: 'TF00246', name: 'Vikram Singh', basic: 23000, hra: 11500, special: 15500, gross: 50000, net: 44800, dept: 'Sales', business_unit: 'MindInventory' }
                    );
                }
                if (isFinance) {
                    mockData.push(
                        { id: 'TF00912', name: 'Siddharth Roy', basic: 30000, hra: 15000, special: 20000, gross: 65000, net: 57600, dept: 'Finance', business_unit: 'CollabCRM' }
                    );
                }
            } else if (selectedReport?.id === 'employee_ctc') {
                if (isEng) {
                    mockData.push(
                        { id: 'TF00123', name: 'Priya Sharma', dept: 'Engineering', business_unit: 'MindInventory', gross: 55000, epfContribution: 1800, gratuity: 2645, otherAllowances: 5000, monthlyCtc: 64445, annualCtc: 773340 },
                        { id: 'TF00456', name: 'Rohan Mehta', dept: 'Engineering', business_unit: '300 Minds', gross: 78000, epfContribution: 1800, gratuity: 3751, otherAllowances: 8000, monthlyCtc: 91551, annualCtc: 1098612 }
                    );
                }
                if (isHR) {
                    mockData.push(
                        { id: 'TF00789', name: 'Anjali Verma', dept: 'HR', business_unit: 'CollabCRM', gross: 48000, epfContribution: 1800, gratuity: 2308, otherAllowances: 4000, monthlyCtc: 56108, annualCtc: 673296 }
                    );
                }
                if (isSales) {
                    mockData.push(
                        { id: 'TF00246', name: 'Vikram Singh', dept: 'Sales', business_unit: 'MindInventory', gross: 50000, epfContribution: 1800, gratuity: 2404, otherAllowances: 4500, monthlyCtc: 58704, annualCtc: 704448 }
                    );
                }
                if (isFinance) {
                    mockData.push(
                        { id: 'TF00912', name: 'Siddharth Roy', dept: 'Finance', business_unit: 'CollabCRM', gross: 65000, epfContribution: 1800, gratuity: 3126, otherAllowances: 6000, monthlyCtc: 75926, annualCtc: 911112 }
                    );
                }
            } else if (selectedReport?.id === 'employee_salary_structure') {
                if (isEng) {
                    mockData.push(
                        { id: 'TF00123', name: 'Priya Sharma', structure: 'Standard L2 Eng Structure', regime: 'New', basic: 25000, hra: 12500, special: 17500, pf: 1800, dept: 'Engineering', business_unit: 'MindInventory' },
                        { id: 'TF00456', name: 'Rohan Mehta', structure: 'Lead Eng Structure', regime: 'Old', basic: 35000, hra: 17500, special: 25500, pf: 1800, dept: 'Engineering', business_unit: '300 Minds' }
                    );
                }
                if (isHR) {
                    mockData.push(
                        { id: 'TF00789', name: 'Anjali Verma', structure: 'Standard HR Structure', regime: 'New', basic: 22000, hra: 11000, special: 15000, pf: 1800, dept: 'HR', business_unit: 'CollabCRM' }
                    );
                }
                if (isSales) {
                    mockData.push(
                        { id: 'TF00246', name: 'Vikram Singh', structure: 'Sales Incentive Structure', regime: 'New', basic: 23000, hra: 11500, special: 15500, pf: 1800, dept: 'Sales', business_unit: 'MindInventory' }
                    );
                }
                if (isFinance) {
                    mockData.push(
                        { id: 'TF00912', name: 'Siddharth Roy', structure: 'Finance Mgr Structure', regime: 'Old', basic: 30000, hra: 15000, special: 20000, pf: 1800, dept: 'Finance', business_unit: 'CollabCRM' }
                    );
                }
            }

            // Filter by completedFilters
            mockData = mockData.filter(row => {
                for (const filter of completedFilters) {
                    let val = '';
                    if (filter.field === 'Month') val = selectedMonth;
                    else if (filter.field === 'Department') val = row.dept || '';
                    else if (filter.field === 'Business Unit') val = row.business_unit || '';
                    else if (filter.field === 'Employee') val = row.name || '';
                    else if (filter.field === 'Status') val = row.status || '';
                    else if (filter.field === 'Salary Structure') val = row.structure || '';

                    const isMatch = filter.operator === 'Contains'
                        ? val.toLowerCase().includes(filter.values[0].toLowerCase())
                        : filter.values.some(v => v.toLowerCase() === val.toLowerCase());

                    if (filter.operator === 'Is' || filter.operator === 'Contains') {
                        if (!isMatch) return false;
                    } else { // 'Is not'
                        if (isMatch) return false;
                    }
                }
                return true;
            });

            // Filter by Business Unit select option from header if set
            if (selectedBU !== 'All') {
                mockData = mockData.filter(row => row.business_unit === selectedBU);
            }

            // Filter by employee text search if provided
            if (employeeSearch.trim()) {
                const searchLower = employeeSearch.toLowerCase();
                mockData = mockData.filter(row => 
                    (row.name && row.name.toLowerCase().includes(searchLower)) ||
                    (row.id && row.id.toLowerCase().includes(searchLower)) ||
                    (row.claimId && row.claimId.toLowerCase().includes(searchLower)) ||
                    (row.dept && row.dept.toLowerCase().includes(searchLower))
                );
            }

            setReportData(mockData);
            setIsRunning(false);
            setHasRun(true);
        }, 1200);
    };

    // Simulate exporting report
    const handleExport = () => {
        alert(`Exporting "${selectedReport?.title}" dataset as Excel/CSV for ${selectedMonth}...`);
    };

    // Format currency display helpers
    const formatINR = (amount: number) => {
        return '₹ ' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="p-4 lg:p-8 w-full mx-auto space-y-6 animate-in fade-in duration-300">
            {/* Grid List View */}
            {!selectedReport ? (
                <>
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                        <Home size={14} className="text-slate-400" />
                        <span>/</span>
                        <span>Payroll</span>
                        <span>/</span>
                        <span className="text-slate-600">Payroll Reports</span>
                    </div>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Payroll Reports</h2>
                            <p className="text-sm text-slate-500 mt-1">Select a report to apply custom filters, analyze data, and download exports.</p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <input
                                type="text"
                                placeholder="Search by report title or description"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            />
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Reports Grid */}
                    {filteredReports.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
                            No matching reports found. Try adjustments to your search filter.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredReports.map(report => (
                                <div 
                                    key={report.id}
                                    onClick={() => handleSelectReport(report)}
                                    className="border border-slate-200 rounded-xl p-5 bg-white flex gap-4 hover:border-blue-500 hover:shadow-md transition-all duration-300 cursor-pointer group relative"
                                >
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 flex items-center justify-center self-start shadow-sm shadow-blue-50">
                                        {getIcon(report.icon)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors text-base truncate">
                                                {report.title}
                                            </h4>
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleBookmark(report.id);
                                                }}
                                                className="p-1 hover:bg-slate-50 rounded transition-colors"
                                            >
                                                <Bookmark 
                                                    size={16} 
                                                    className={bookmarkedReports.includes(report.id) ? 'fill-blue-600 text-blue-600' : 'text-slate-300 hover:text-blue-500'} 
                                                />
                                            </button>
                                        </div>
                                        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-normal">
                                            {report.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                /* Report Detail View */
                <>
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                        <Home size={14} className="text-slate-400" />
                        <span>/</span>
                        <span>Payroll</span>
                        <span>/</span>
                        <button onClick={handleBack} className="hover:text-blue-600">Payroll Reports</button>
                        <span>/</span>
                        <span className="text-slate-600">{selectedReport.title}</span>
                    </div>

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleBack}
                                className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors border border-slate-200 bg-white shadow-sm"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">{selectedReport.title}</h2>
                                    <span className="px-2 py-0.5 bg-blue-50 text-[10px] font-bold text-blue-600 rounded-full border border-blue-100/50">
                                        {!hasRun ? "0 - 0 of 0 Records" : `${reportData.length > 0 ? 1 : 0} - ${reportData.length} of ${reportData.length} Records`}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">{selectedReport.description}</p>
                            </div>
                        </div>

                        {/* Right Header Options */}
                        <div className="flex items-center gap-2.5 self-end sm:self-auto">
                            <div className="relative">
                                <select
                                    value={selectedBU}
                                    onChange={(e) => {
                                        setSelectedBU(e.target.value);
                                        if (hasRun) {
                                            handleRunReport();
                                        }
                                    }}
                                    className="pl-3 pr-8 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none animate-in fade-in"
                                >
                                    <option value="All">Select Business Unit</option>
                                    <option value="MindInventory">MindInventory</option>
                                    <option value="300 Minds">300 Minds</option>
                                    <option value="CollabCRM">CollabCRM</option>
                                </select>
                                <ChevronRight size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                            </div>

                            <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors border border-slate-200 bg-white shadow-sm">
                                <Maximize2 size={16} />
                            </button>

                            <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors border border-slate-200 bg-white shadow-sm">
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Filter Panel (Unified Search/Lookup Style matching Employees Compensation) */}
                    <div className="flex flex-col md:flex-row gap-3 mb-6 relative animate-in fade-in duration-150">
                        <div className="flex items-center gap-2 w-full flex-1">
                            <div className="relative flex-1" ref={filterRef}>
                                {/* Input-like container */}
                                <div 
                                    onClick={() => {
                                        setDropdownOpen(true);
                                        inputRef.current?.focus();
                                    }}
                                    className="w-full flex flex-wrap items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm min-h-[40px] focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all cursor-text pr-10 shadow-sm"
                                >
                                    {/* Search icon (only if not building a filter) */}
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
                                                <span className="bg-slate-200/60 px-1 rounded text-slate-800 max-w-[120px] truncate font-medium">
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
                                        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-700 animate-pulse">
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
                                        value={currentField && currentOperator ? valSearchQuery : employeeSearch}
                                        onChange={(e) => {
                                            if (currentField && currentOperator) {
                                                setValSearchQuery(e.target.value);
                                            } else {
                                                setEmployeeSearch(e.target.value);
                                                setDropdownOpen(false); // don't open field dropdown when typing normal search
                                            }
                                        }}
                                        onFocus={() => {
                                            if (!currentField) {
                                                setDropdownOpen(true);
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
                                    {(completedFilters.length > 0 || currentField || employeeSearch) && (
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
                                                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
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
                                                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
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
                                                                                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
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
                                                        className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
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
                                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm shrink-0 h-[40px] transition-colors"
                            >
                                <Filter size={16} className="text-slate-500" />
                                <span>Filter</span>
                            </button>

                            <button
                                onClick={handleExport}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm shrink-0 h-[40px] transition-colors"
                            >
                                <Download size={16} className="text-slate-500" />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>

                    {/* Data View */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[300px] flex flex-col">
                        {!hasRun && !isRunning ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
                                <Filter size={48} className="text-slate-300 mb-3" />
                                <p className="font-semibold text-slate-600 text-base">Filter and run the report</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-md text-center">
                                    Configure your filter criteria above and click the "Run Report" button to generate the report view.
                                </p>
                            </div>
                        ) : isRunning ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
                                <Loader2 size={36} className="animate-spin text-blue-600 mb-3" />
                                <p className="font-semibold text-slate-600">Generating report dataset...</p>
                                <p className="text-xs text-slate-400 mt-1">Please wait while the system consolidates payroll information.</p>
                            </div>
                        ) : reportData.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
                                <AlertCircle size={40} className="text-slate-300 mb-3" />
                                <p className="font-semibold text-slate-600">No report records found</p>
                                <p className="text-xs text-slate-400 mt-1">No matching logs or entries found for the selected filter range.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left text-sm text-slate-600 border-collapse">
                                    {/* Monthly Payroll Table */}
                                    {selectedReport.id === 'monthly_payroll' && (
                                        <>
                                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4">Employee ID</th>
                                                    <th className="px-6 py-4">Employee Name</th>
                                                    <th className="px-6 py-4">Department</th>
                                                    <th className="px-6 py-4 text-right">Gross Salary</th>
                                                    <th className="px-6 py-4 text-right">EPF Deduction</th>
                                                    <th className="px-6 py-4 text-right">Prof Tax</th>
                                                    <th className="px-6 py-4 text-right">TDS Deduction</th>
                                                    <th className="px-6 py-4 text-right">Net Pay</th>
                                                    <th className="px-6 py-4 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {reportData.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50">
                                                        <td className="px-6 py-4 font-mono font-medium text-slate-500">{row.id}</td>
                                                        <td className="px-6 py-4 font-semibold text-slate-800">{row.name}</td>
                                                        <td className="px-6 py-4">{row.dept}</td>
                                                        <td className="px-6 py-4 text-right font-medium">{formatINR(row.gross)}</td>
                                                        <td className="px-6 py-4 text-right text-rose-600">{formatINR(row.epf)}</td>
                                                        <td className="px-6 py-4 text-right text-rose-600">{formatINR(row.pt)}</td>
                                                        <td className="px-6 py-4 text-right text-rose-600">{formatINR(row.tds)}</td>
                                                        <td className="px-6 py-4 text-right font-bold text-emerald-700">{formatINR(row.net)}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                                <CheckCircle size={12} />
                                                                {row.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </>
                                    )}

                                    {/* TDS & Tax Deductions Table */}
                                    {selectedReport.id === 'tds_tax' && (
                                        <>
                                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4">Employee ID</th>
                                                    <th className="px-6 py-4">Employee Name</th>
                                                    <th className="px-6 py-4">PAN</th>
                                                    <th className="px-6 py-4 text-right">Gross Annual</th>
                                                    <th className="px-6 py-4 text-right">Declared Savings</th>
                                                    <th className="px-6 py-4 text-right">Taxable Income</th>
                                                    <th className="px-6 py-4 text-right">TDS (YTD)</th>
                                                    <th className="px-6 py-4 text-right">Current TDS</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {reportData.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50">
                                                        <td className="px-6 py-4 font-mono font-medium text-slate-500">{row.id}</td>
                                                        <td className="px-6 py-4 font-semibold text-slate-800">{row.name}</td>
                                                        <td className="px-6 py-4 font-mono">{row.pan}</td>
                                                        <td className="px-6 py-4 text-right font-medium">{formatINR(row.grossAnnual)}</td>
                                                        <td className="px-6 py-4 text-right font-medium text-blue-600">{formatINR(row.savings80c)}</td>
                                                        <td className="px-6 py-4 text-right font-medium">{formatINR(row.taxable)}</td>
                                                        <td className="px-6 py-4 text-right text-rose-600">{formatINR(row.tdsYtd)}</td>
                                                        <td className="px-6 py-4 text-right text-rose-600 font-bold">{formatINR(row.tdsCurrent)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </>
                                    )}

                                    {/* EPF & ESIC Compliance Table */}
                                    {selectedReport.id === 'epf_esic' && (
                                        <>
                                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4">Employee ID</th>
                                                    <th className="px-6 py-4">Employee Name</th>
                                                    <th className="px-6 py-4">UAN</th>
                                                    <th className="px-6 py-4 text-right">Monthly Wages</th>
                                                    <th className="px-6 py-4 text-right">EPF (Employee 12%)</th>
                                                    <th className="px-6 py-4 text-right">EPF (Employer 12%)</th>
                                                    <th className="px-6 py-4 text-right">ESIC (Employee 0.75%)</th>
                                                    <th className="px-6 py-4 text-right">ESIC (Employer 3.25%)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {reportData.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50">
                                                        <td className="px-6 py-4 font-mono font-medium text-slate-500">{row.id}</td>
                                                        <td className="px-6 py-4 font-semibold text-slate-800">{row.name}</td>
                                                        <td className="px-6 py-4 font-mono">{row.uan}</td>
                                                        <td className="px-6 py-4 text-right font-medium">{formatINR(row.gross)}</td>
                                                        <td className="px-6 py-4 text-right text-rose-600">{formatINR(row.epfEmp)}</td>
                                                        <td className="px-6 py-4 text-right text-rose-600">{formatINR(row.epfEmpr)}</td>
                                                        <td className="px-6 py-4 text-right text-rose-600">{formatINR(row.esicEmp)}</td>
                                                        <td className="px-6 py-4 text-right text-rose-600">{formatINR(row.esicEmpr)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </>
                                    )}

                                    {/* Bank Disbursal Table */}
                                    {selectedReport.id === 'bank_disbursal' && (
                                        <>
                                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4">Beneficiary Name</th>
                                                    <th className="px-6 py-4">Bank Name</th>
                                                    <th className="px-6 py-4">Account Number</th>
                                                    <th className="px-6 py-4">IFSC Code</th>
                                                    <th className="px-6 py-4 text-right">Transfer Amount</th>
                                                    <th className="px-6 py-4 text-center">Type</th>
                                                    <th className="px-6 py-4 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {reportData.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50">
                                                        <td className="px-6 py-4 font-semibold text-slate-800">{row.name}</td>
                                                        <td className="px-6 py-4 font-medium text-slate-700">{row.bank}</td>
                                                        <td className="px-6 py-4 font-mono">{row.acc}</td>
                                                        <td className="px-6 py-4 font-mono">{row.ifsc}</td>
                                                        <td className="px-6 py-4 text-right font-bold text-blue-700">{formatINR(row.amount)}</td>
                                                        <td className="px-6 py-4 text-center font-bold text-slate-500 text-xs">{row.type}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                                <CheckCircle size={10} />
                                                                {row.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </>
                                    )}

                                    {/* Expense & Reimbursements Claims Table */}
                                    {selectedReport.id === 'expenses_claims' && (
                                        <>
                                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4">Claim ID</th>
                                                    <th className="px-6 py-4">Employee Name</th>
                                                    <th className="px-6 py-4">Category</th>
                                                    <th className="px-6 py-4 text-right">Claim Amount</th>
                                                    <th className="px-6 py-4 text-right">Approved Amount</th>
                                                    <th className="px-6 py-4">Submission Date</th>
                                                    <th className="px-6 py-4 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {reportData.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50">
                                                        <td className="px-6 py-4 font-mono font-medium text-slate-500">{row.claimId}</td>
                                                        <td className="px-6 py-4 font-semibold text-slate-800">{row.name}</td>
                                                        <td className="px-6 py-4 font-medium">{row.category}</td>
                                                        <td className="px-6 py-4 text-right font-medium">{formatINR(row.claimAmt)}</td>
                                                        <td className="px-6 py-4 text-right font-bold text-blue-700">{formatINR(row.approvedAmt)}</td>
                                                        <td className="px-6 py-4 text-slate-500">{row.date}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                                row.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                                                            }`}>
                                                                {row.status === 'Approved' ? <CheckCircle size={10} /> : <Clock size={10} />}
                                                                {row.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </>
                                    )}

                                    {/* Salary Register Table */}
                                    {selectedReport.id === 'salary_register' && (
                                        <>
                                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4">Employee ID</th>
                                                    <th className="px-6 py-4">Employee Name</th>
                                                    <th className="px-6 py-4 text-right">Basic Pay</th>
                                                    <th className="px-6 py-4 text-right">HRA</th>
                                                    <th className="px-6 py-4 text-right">Special Allowance</th>
                                                    <th className="px-6 py-4 text-right">Gross Earnings</th>
                                                    <th className="px-6 py-4 text-right">Est. Net Salary</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {reportData.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50">
                                                        <td className="px-6 py-4 font-mono font-medium text-slate-500">{row.id}</td>
                                                        <td className="px-6 py-4 font-semibold text-slate-800">{row.name}</td>
                                                        <td className="px-6 py-4 text-right font-medium">{formatINR(row.basic)}</td>
                                                        <td className="px-6 py-4 text-right font-medium">{formatINR(row.hra)}</td>
                                                        <td className="px-6 py-4 text-right font-medium">{formatINR(row.special)}</td>
                                                        <td className="px-6 py-4 text-right font-bold text-slate-800">{formatINR(row.gross)}</td>
                                                        <td className="px-6 py-4 text-right font-bold text-emerald-700">{formatINR(row.net)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </>
                                    )}

                                    {/* Employee CTC Table */}
                                    {selectedReport.id === 'employee_ctc' && (
                                        <>
                                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4">Employee ID</th>
                                                    <th className="px-6 py-4">Employee Name</th>
                                                    <th className="px-6 py-4">Department</th>
                                                    <th className="px-6 py-4 text-right">Gross Salary</th>
                                                    <th className="px-6 py-4 text-right">Employer PF</th>
                                                    <th className="px-6 py-4 text-right">Gratuity</th>
                                                    <th className="px-6 py-4 text-right">Other Allowances</th>
                                                    <th className="px-6 py-4 text-right">Monthly CTC</th>
                                                    <th className="px-6 py-4 text-right">Annual CTC</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {reportData.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50">
                                                        <td className="px-6 py-4 font-mono font-medium text-slate-500">{row.id}</td>
                                                        <td className="px-6 py-4 font-semibold text-slate-800">{row.name}</td>
                                                        <td className="px-6 py-4">{row.dept}</td>
                                                        <td className="px-6 py-4 text-right font-medium">{formatINR(row.gross)}</td>
                                                        <td className="px-6 py-4 text-right font-medium">{formatINR(row.epfContribution)}</td>
                                                        <td className="px-6 py-4 text-right font-medium">{formatINR(row.gratuity)}</td>
                                                        <td className="px-6 py-4 text-right font-medium">{formatINR(row.otherAllowances)}</td>
                                                        <td className="px-6 py-4 text-right font-bold text-slate-800">{formatINR(row.monthlyCtc)}</td>
                                                        <td className="px-6 py-4 text-right font-bold text-blue-700">{formatINR(row.annualCtc)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </>
                                    )}

                                    {/* Employee Salary Structure Table */}
                                    {selectedReport.id === 'employee_salary_structure' && (
                                        <>
                                            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-4">Employee ID</th>
                                                    <th className="px-6 py-4">Employee Name</th>
                                                    <th className="px-6 py-4">Salary Structure</th>
                                                    <th className="px-6 py-4 text-center">Tax Regime</th>
                                                    <th className="px-6 py-4 text-right">Basic Pay</th>
                                                    <th className="px-6 py-4 text-right">HRA</th>
                                                    <th className="px-6 py-4 text-right">Special Allowance</th>
                                                    <th className="px-6 py-4 text-right">PF Deductions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {reportData.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50">
                                                        <td className="px-6 py-4 font-mono font-medium text-slate-500">{row.id}</td>
                                                        <td className="px-6 py-4 font-semibold text-slate-800">{row.name}</td>
                                                        <td className="px-6 py-4 font-semibold text-slate-700">{row.structure}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                                row.regime === 'New' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                                                            }`}>
                                                                {row.regime} Regime
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-medium">{formatINR(row.basic)}</td>
                                                        <td className="px-6 py-4 text-right font-medium">{formatINR(row.hra)}</td>
                                                        <td className="px-6 py-4 text-right font-medium">{formatINR(row.special)}</td>
                                                        <td className="px-6 py-4 text-right text-rose-600 font-medium">{formatINR(row.pf)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </>
                                    )}
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default PayrollReports;
