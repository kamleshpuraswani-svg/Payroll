import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Calendar,
  TrendingUp,
  Wallet,
  FileText,
  PieChart as PieChartIcon,
  CreditCard,
  AlertTriangle,
  ChevronDown,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Heart,
  Fuel,
  BookOpen,
  Plane,
  Car,
  GraduationCap,
  Download,
  RotateCw,
  Info,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  KeyRound,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell
} from 'recharts';
import DateRangeFilterDropdown from './DateRangeFilterDropdown';

const STATUTORY_SNAPSHOT_DATA = [
  {
    id: 'pf',
    label: 'Provident Fund',
    value: '₹ 0',
    status: 'Applicable',
    applicable: true,
  },
  {
    id: 'pt',
    label: 'Professional Tax',
    value: '-',
    status: 'Not Applicable',
    applicable: false,
  },
  {
    id: 'esi',
    label: 'ESI',
    value: '-',
    status: 'Not Applicable',
    applicable: false,
  },
  {
    id: 'nps',
    label: 'NPS',
    value: '₹ 0',
    status: 'Applicable',
    applicable: true,
  },
  {
    id: 'lwf',
    label: 'LWF',
    value: '-',
    status: 'Not Applicable',
    applicable: false,
  },
];

const REVISION_YEAR_OPTIONS = ['2024', '2025', '2026', '2027'];

const REVISION_PRESETS = [
  { id: 'THIS_YEAR', label: 'This Year' },
  { id: 'LAST_2_YEARS', label: 'Last 2 Years' },
  { id: 'LAST_3_YEARS', label: 'Last 3 Years' },
  { id: 'ALL_TIME', label: 'All Time' },
];

// Last 12 months salary breakdown data (Oct 2025 - Sep 2026)
const salaryBreakdown12Months = [
  { month: 'Oct', period: 'October 2025', gross: 180000, deductions: 24800, net: 155200 },
  { month: 'Nov', period: 'November 2025', gross: 180000, deductions: 24800, net: 155200 },
  { month: 'Dec', period: 'December 2025', gross: 180000, deductions: 24800, net: 155200 },
  { month: 'Jan', period: 'January 2026', gross: 200000, deductions: 27550, net: 172450 },
  { month: 'Feb', period: 'February 2026', gross: 200000, deductions: 27550, net: 172450 },
  { month: 'Mar', period: 'March 2026', gross: 200000, deductions: 27550, net: 172450 },
  { month: 'Apr', period: 'April 2026', gross: 215000, deductions: 29620, net: 185380 },
  { month: 'May', period: 'May 2026', gross: 215000, deductions: 29620, net: 185380 },
  { month: 'Jun', period: 'June 2026', gross: 215000, deductions: 29620, net: 185380 },
  { month: 'Jul', period: 'July 2026', gross: 225000, deductions: 31000, net: 194000 },
  { month: 'Aug', period: 'August 2026', gross: 225000, deductions: 31000, net: 194000 },
  { month: 'Sep', period: 'September 2026', gross: 225000, deductions: 31000, net: 194000 },
];

const MOCK_LOANS = [
  {
    id: 'loan-1',
    name: 'Home Appliance Loan',
    totalAmount: 250000,
    repaidAmount: 150000,
    remainingBalance: 100000,
    emiAmount: 10000,
    paidMonths: 15,
    totalMonths: 25,
  },
  {
    id: 'loan-2',
    name: 'Personal Loan',
    totalAmount: 150000,
    repaidAmount: 76667,
    remainingBalance: 73333,
    emiAmount: 8333,
    paidMonths: 10,
    totalMonths: 18,
  },
];

const MOCK_ADVANCES = [
  {
    id: 'adv-1',
    name: 'Festival Advance',
    totalAmount: 40000,
    repaidAmount: 30000,
    remainingBalance: 10000,
    emiAmount: 10000,
    paidMonths: 3,
    totalMonths: 4,
  },
  {
    id: 'adv-2',
    name: 'Medical Advance',
    totalAmount: 20000,
    repaidAmount: 10000,
    remainingBalance: 10000,
    emiAmount: 5000,
    paidMonths: 2,
    totalMonths: 4,
  },
];

interface RevisionItem {
  period: string;
  month: string;
  monthLabel: string;
  year: number;
  prevGross: number;
  gross: number;
  incrementAmount: number;
  decrementAmount: number;
  isIncrement: boolean;
  isDecrement: boolean;
}

const ALL_REVISION_DATA: RevisionItem[] = [
  {
    period: 'January 2024',
    month: 'Jan',
    monthLabel: 'Jan 2024',
    year: 2024,
    prevGross: 0,
    gross: 150000,
    incrementAmount: 150000,
    decrementAmount: 0,
    isIncrement: true,
    isDecrement: false
  },
  {
    period: 'July 2024',
    month: 'Jul',
    monthLabel: 'Jul 2024',
    year: 2024,
    prevGross: 150000,
    gross: 175000,
    incrementAmount: 25000,
    decrementAmount: 0,
    isIncrement: true,
    isDecrement: false
  },
  {
    period: 'January 2025',
    month: 'Jan',
    monthLabel: 'Jan 2025',
    year: 2025,
    prevGross: 175000,
    gross: 190000,
    incrementAmount: 15000,
    decrementAmount: 0,
    isIncrement: true,
    isDecrement: false
  },
  {
    period: 'July 2025',
    month: 'Jul',
    monthLabel: 'Jul 2025',
    year: 2025,
    prevGross: 190000,
    gross: 180000,
    incrementAmount: 0,
    decrementAmount: 10000,
    isIncrement: false,
    isDecrement: true
  },
  {
    period: 'January 2026',
    month: 'Jan',
    monthLabel: 'Jan 2026',
    year: 2026,
    prevGross: 180000,
    gross: 200000,
    incrementAmount: 20000,
    decrementAmount: 0,
    isIncrement: true,
    isDecrement: false
  },
  {
    period: 'April 2026',
    month: 'Apr',
    monthLabel: 'Apr 2026',
    year: 2026,
    prevGross: 200000,
    gross: 215000,
    incrementAmount: 15000,
    decrementAmount: 0,
    isIncrement: true,
    isDecrement: false
  },
  {
    period: 'July 2026',
    month: 'Jul',
    monthLabel: 'Jul 2026',
    year: 2026,
    prevGross: 215000,
    gross: 205000,
    incrementAmount: 0,
    decrementAmount: 10000,
    isIncrement: false,
    isDecrement: true
  },
  {
    period: 'October 2026',
    month: 'Oct',
    monthLabel: 'Oct 2026',
    year: 2026,
    prevGross: 205000,
    gross: 225000,
    incrementAmount: 20000,
    decrementAmount: 0,
    isIncrement: true,
    isDecrement: false
  }
];

const formatINR = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

interface ExpenseItemData {
  id: string;
  name: string;
  claimed: number;
  limit: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  iconBg: string;
  barColor: string;
  frequency: 'Monthly' | 'Yearly' | 'Once Per Tenure';
  cycleText?: string;
  resetText: string;
}

const OVERVIEW_EXPENSE_DATA_MAP: Record<string, ExpenseItemData[]> = {
  'This Month': [
    { id: 'med', name: 'Medical', claimed: 1250, limit: 15000, icon: Heart, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Yearly', cycleText: 'Jan–Dec 2026', resetText: 'Limit Resets on 1st January, 2027.' },
    { id: 'fuel', name: 'Fuel and conveyance', claimed: 2000, limit: 24000, icon: Fuel, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Monthly', cycleText: 'October 2026', resetText: 'Limit Resets on 1st November, 2026.' },
    { id: 'books', name: 'Books and periodicals', claimed: 0, limit: 6000, icon: BookOpen, iconColor: 'text-slate-500', iconBg: 'bg-slate-50', barColor: 'bg-blue-600', frequency: 'Monthly', cycleText: 'October 2026', resetText: 'Limit Resets on 1st November, 2026.' },
    { id: 'driver', name: 'Driver salary', claimed: 6000, limit: 24000, icon: Car, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Yearly', cycleText: 'FY 2026-27', resetText: 'Limit Resets on 1st April, 2027.' },
    { id: 'learn', name: 'Learning & certification', claimed: 4500, limit: 20000, icon: GraduationCap, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Yearly', cycleText: '14 July 2026 - 13 July 2027', resetText: 'Limit Resets on 14th July, 2027.' },
    { id: 'lta', name: 'LTA (travel)', claimed: 0, limit: 45000, icon: Plane, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-amber-500', frequency: 'Once Per Tenure', cycleText: 'Since Joining', resetText: 'One-time limit for your tenure. Does not reset.' },
  ],
  'Last Month': [
    { id: 'med', name: 'Medical', claimed: 2100, limit: 15000, icon: Heart, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Yearly', cycleText: 'Jan–Dec 2026', resetText: 'Limit Resets on 1st January, 2027.' },
    { id: 'fuel', name: 'Fuel and conveyance', claimed: 3600, limit: 24000, icon: Fuel, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Monthly', cycleText: 'September 2026', resetText: 'Limit Resets on 1st October, 2026.' },
    { id: 'books', name: 'Books and periodicals', claimed: 1000, limit: 6000, icon: BookOpen, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Monthly', cycleText: 'September 2026', resetText: 'Limit Resets on 1st October, 2026.' },
    { id: 'driver', name: 'Driver salary', claimed: 8000, limit: 24000, icon: Car, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Yearly', cycleText: 'FY 2026-27', resetText: 'Limit Resets on 1st April, 2027.' },
    { id: 'learn', name: 'Learning & certification', claimed: 6500, limit: 20000, icon: GraduationCap, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Yearly', cycleText: '14 July 2026 - 13 July 2027', resetText: 'Limit Resets on 14th July, 2027.' },
    { id: 'lta', name: 'LTA (travel)', claimed: 0, limit: 45000, icon: Plane, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-amber-500', frequency: 'Once Per Tenure', cycleText: 'Since Joining', resetText: 'One-time limit for your tenure. Does not reset.' },
  ],
  'This Quarter': [
    { id: 'med', name: 'Medical', claimed: 3800, limit: 15000, icon: Heart, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Yearly', cycleText: 'Jan–Dec 2026', resetText: 'Limit Resets on 1st January, 2027.' },
    { id: 'fuel', name: 'Fuel and conveyance', claimed: 6000, limit: 24000, icon: Fuel, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Monthly', cycleText: 'October 2026', resetText: 'Limit Resets on 1st November, 2026.' },
    { id: 'books', name: 'Books and periodicals', claimed: 1500, limit: 6000, icon: BookOpen, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Monthly', cycleText: 'October 2026', resetText: 'Limit Resets on 1st November, 2026.' },
    { id: 'driver', name: 'Driver salary', claimed: 12000, limit: 24000, icon: Car, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Yearly', cycleText: 'FY 2026-27', resetText: 'Limit Resets on 1st April, 2027.' },
    { id: 'learn', name: 'Learning & certification', claimed: 8500, limit: 20000, icon: GraduationCap, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Yearly', cycleText: '14 July 2026 - 13 July 2027', resetText: 'Limit Resets on 14th July, 2027.' },
    { id: 'lta', name: 'LTA (travel)', claimed: 12000, limit: 45000, icon: Plane, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-amber-500', frequency: 'Once Per Tenure', cycleText: 'Since Joining', resetText: 'One-time limit for your tenure. Does not reset.' },
  ],
  'Last Quarter': [
    { id: 'med', name: 'Medical', claimed: 4200, limit: 15000, icon: Heart, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Yearly', cycleText: 'Jan–Dec 2026', resetText: 'Limit Resets on 1st January, 2027.' },
    { id: 'fuel', name: 'Fuel and conveyance', claimed: 7200, limit: 24000, icon: Fuel, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Monthly', cycleText: 'September 2026', resetText: 'Limit Resets on 1st October, 2026.' },
    { id: 'books', name: 'Books and periodicals', claimed: 2000, limit: 6000, icon: BookOpen, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Monthly', cycleText: 'September 2026', resetText: 'Limit Resets on 1st October, 2026.' },
    { id: 'driver', name: 'Driver salary', claimed: 14000, limit: 24000, icon: Car, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Yearly', cycleText: 'FY 2026-27', resetText: 'Limit Resets on 1st April, 2027.' },
    { id: 'learn', name: 'Learning & certification', claimed: 11000, limit: 20000, icon: GraduationCap, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Yearly', cycleText: '14 July 2026 - 13 July 2027', resetText: 'Limit Resets on 14th July, 2027.' },
    { id: 'lta', name: 'LTA (travel)', claimed: 20000, limit: 45000, icon: Plane, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-amber-500', frequency: 'Once Per Tenure', cycleText: 'Since Joining', resetText: 'One-time limit for your tenure. Does not reset.' },
  ],
  'This Year': [
    { id: 'med', name: 'Medical', claimed: 5200, limit: 15000, icon: Heart, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Yearly', cycleText: 'Jan–Dec 2026', resetText: 'Limit Resets on 1st January, 2027.' },
    { id: 'fuel', name: 'Fuel and conveyance', claimed: 8000, limit: 24000, icon: Fuel, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Monthly', cycleText: 'October 2026', resetText: 'Limit Resets on 1st November, 2026.' },
    { id: 'books', name: 'Books and periodicals', claimed: 0, limit: 6000, icon: BookOpen, iconColor: 'text-slate-500', iconBg: 'bg-slate-50', barColor: 'bg-blue-600', frequency: 'Monthly', cycleText: 'October 2026', resetText: 'Limit Resets on 1st November, 2026.' },
    { id: 'driver', name: 'Driver salary', claimed: 16000, limit: 24000, icon: Car, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Yearly', cycleText: 'FY 2026-27', resetText: 'Limit Resets on 1st April, 2027.' },
    { id: 'learn', name: 'Learning & certification', claimed: 14000, limit: 20000, icon: GraduationCap, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Yearly', cycleText: '14 July 2026 - 13 July 2027', resetText: 'Limit Resets on 14th July, 2027.' },
    { id: 'lta', name: 'LTA (travel)', claimed: 32000, limit: 45000, icon: Plane, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-amber-500', frequency: 'Once Per Tenure', cycleText: 'Since Joining', resetText: 'One-time limit for your tenure. Does not reset.' },
  ],
  'Last Year': [
    { id: 'med', name: 'Medical', claimed: 14200, limit: 15000, icon: Heart, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Yearly', cycleText: 'Jan–Dec 2026', resetText: 'Limit Resets on 1st January, 2027.' },
    { id: 'fuel', name: 'Fuel and conveyance', claimed: 22500, limit: 24000, icon: Fuel, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Monthly', cycleText: 'December 2025', resetText: 'Limit Resets on 1st January, 2026.' },
    { id: 'books', name: 'Books and periodicals', claimed: 5400, limit: 6000, icon: BookOpen, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Monthly', cycleText: 'December 2025', resetText: 'Limit Resets on 1st January, 2026.' },
    { id: 'driver', name: 'Driver salary', claimed: 22000, limit: 24000, icon: Car, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Yearly', cycleText: 'FY 2026-27', resetText: 'Limit Resets on 1st April, 2027.' },
    { id: 'learn', name: 'Learning & certification', claimed: 18500, limit: 20000, icon: GraduationCap, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-blue-600', frequency: 'Yearly', cycleText: '14 July 2026 - 13 July 2027', resetText: 'Limit Resets on 14th July, 2027.' },
    { id: 'lta', name: 'LTA (travel)', claimed: 42000, limit: 45000, icon: Plane, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', barColor: 'bg-amber-500', frequency: 'Once Per Tenure', cycleText: 'Since Joining', resetText: 'One-time limit for your tenure. Does not reset.' },
  ],
};

interface OverviewProps {
  onNavigateToTaxPlanning?: () => void;
  onNavigateToReimbursements?: () => void;
  onNavigateToSalaryBreakdown?: () => void;
  onNavigateToPayslips?: () => void;
}

const Overview: React.FC<OverviewProps> = ({
  onNavigateToTaxPlanning,
  onNavigateToReimbursements,
  onNavigateToSalaryBreakdown,
  onNavigateToPayslips
}) => {
  // Salary Revision filter dropdown state matching HR Manager Compensation -> Salary Insights (Screenshot 2)
  const [revisionPreset, setRevisionPreset] = useState<string>('THIS_YEAR');
  const [customRangeText, setCustomRangeText] = useState<string>('');
  const [fromYear, setFromYear] = useState<string>('2025');
  const [toYear, setToYear] = useState<string>('2025');
  const [isRevisionDropdownOpen, setIsRevisionDropdownOpen] = useState(false);
  const [activeLoanIndex, setActiveLoanIndex] = useState(0);
  const [activeAdvanceIndex, setActiveAdvanceIndex] = useState(0);
  const revisionDropdownRef = useRef<HTMLDivElement>(null);
  // Statutory Snapshot Date Range Filter State (matching Variable Pay Summary)
  const [statutoryTimeRange, setStatutoryTimeRange] = useState<string>('This Year');

  // Shared Lock & Password Protection for Salary Revision History & Salary Breakdown
  const [isSalaryWidgetsUnlocked, setIsSalaryWidgetsUnlocked] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordPlaintext, setShowPasswordPlaintext] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  const handleEyeIconClick = () => {
    if (isSalaryWidgetsUnlocked) {
      setIsSalaryWidgetsUnlocked(false);
    } else {
      setPasswordInput('');
      setPasswordError('');
      setShowPasswordPlaintext(false);
      setIsPasswordModalOpen(true);
    }
  };

  const handleOpenPasswordModal = () => {
    setPasswordInput('');
    setPasswordError('');
    setShowPasswordPlaintext(false);
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordInput('');
    setPasswordError('');
    setShowPasswordPlaintext(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!passwordInput.trim()) {
      setPasswordError('Please enter your password.');
      return;
    }
    if (passwordInput === '1234') {
      setIsVerifyingPassword(true);
      setTimeout(() => {
        setIsVerifyingPassword(false);
        setIsSalaryWidgetsUnlocked(true);
        setIsPasswordModalOpen(false);
        setPasswordInput('');
      }, 200);
    } else {
      setPasswordError('Incorrect password. Default password is 1234.');
    }
  };

  const currentExpenseItems = useMemo(() => {
    return OVERVIEW_EXPENSE_DATA_MAP['This Month'];
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (revisionDropdownRef.current && !revisionDropdownRef.current.contains(e.target as Node)) {
        setIsRevisionDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter revision data according to selection
  const salaryTrendData = useMemo(() => {
    const currentYear = 2026;
    if (revisionPreset === 'THIS_YEAR') {
      // Points for this year (matching Screenshot 3: Apr, Jul, Oct)
      return ALL_REVISION_DATA.filter(r => r.year === currentYear && r.month !== 'Jan');
    }
    if (revisionPreset === 'LAST_2_YEARS') {
      return ALL_REVISION_DATA.filter(r => r.year >= currentYear - 1);
    }
    if (revisionPreset === 'LAST_3_YEARS') {
      return ALL_REVISION_DATA.filter(r => r.year >= currentYear - 2);
    }
    if (revisionPreset === 'ALL_TIME') {
      return ALL_REVISION_DATA;
    }
    if (revisionPreset === 'CUSTOM' && customRangeText) {
      if (customRangeText.includes('-')) {
        const [startY, endY] = customRangeText.split('-').map(s => Number(s.trim()));
        return ALL_REVISION_DATA.filter(r => r.year >= startY && r.year <= endY);
      } else {
        const y = Number(customRangeText.trim());
        return ALL_REVISION_DATA.filter(r => r.year === y);
      }
    }
    return ALL_REVISION_DATA;
  }, [revisionPreset, customRangeText]);

  // Gradient stops to indicate decrements in red along the line chart
  const overviewSalaryTrendGradientStops = useMemo(() => {
    const data = salaryTrendData;
    const n = data.length;
    if (n < 2) {
      return [
        { offset: '0%', stopColor: '#4338ca' },
        { offset: '100%', stopColor: '#4338ca' }
      ];
    }

    const stops: { offset: string; stopColor: string }[] = [];
    const blueColor = '#4338ca';
    const redColor = '#ef4444';

    stops.push({ offset: '0%', stopColor: data[0]?.isDecrement ? redColor : blueColor });

    for (let i = 1; i < n; i++) {
      const prevPct = ((i - 1) / (n - 1)) * 100;
      const currPct = (i / (n - 1)) * 100;
      const isDec = data[i].isDecrement;

      if (isDec) {
        stops.push({ offset: `${Math.max(0, prevPct + 1).toFixed(2)}%`, stopColor: redColor });
        stops.push({ offset: `${currPct.toFixed(2)}%`, stopColor: redColor });
        const nextIsDec = i < n - 1 && data[i + 1]?.isDecrement;
        if (!nextIsDec) {
          stops.push({ offset: `${Math.min(100, currPct + 2.5).toFixed(2)}%`, stopColor: blueColor });
        }
      } else {
        stops.push({ offset: `${currPct.toFixed(2)}%`, stopColor: blueColor });
      }
    }

    stops.push({ offset: '100%', stopColor: data[n - 1]?.isDecrement ? redColor : blueColor });
    return stops;
  }, [salaryTrendData]);

  const revisionFilterLabel = useMemo(() => {
    if (revisionPreset === 'CUSTOM') {
      return customRangeText || 'Custom Year';
    }
    const found = REVISION_PRESETS.find(p => p.id === revisionPreset);
    return found ? found.label : 'This Year';
  }, [revisionPreset, customRangeText]);

  // Active Loan & Advance Data Selection
  const currentLoan = MOCK_LOANS[activeLoanIndex] || MOCK_LOANS[0];
  const currentAdvance = MOCK_ADVANCES[activeAdvanceIndex] || MOCK_ADVANCES[0];
  const loanProgress = Math.min(100, Math.round((currentLoan.repaidAmount / currentLoan.totalAmount) * 100));
  const advanceProgress = Math.min(100, Math.round((currentAdvance.repaidAmount / currentAdvance.totalAmount) * 100));

  const totalOutstandingAll = useMemo(() => {
    const loansRemaining = MOCK_LOANS.reduce((acc, l) => acc + l.remainingBalance, 0);
    const advancesRemaining = MOCK_ADVANCES.reduce((acc, a) => acc + a.remainingBalance, 0);
    return loansRemaining + advancesRemaining;
  }, []);

  const totalPaidAll = useMemo(() => {
    const loansPaid = MOCK_LOANS.reduce((acc, l) => acc + l.repaidAmount, 0);
    const advancesPaid = MOCK_ADVANCES.reduce((acc, a) => acc + a.repaidAmount, 0);
    return loansPaid + advancesPaid;
  }, []);

  const totalUpcomingEmiAll = useMemo(() => {
    const loansEmi = MOCK_LOANS.reduce((acc, l) => acc + l.emiAmount, 0);
    const advancesEmi = MOCK_ADVANCES.reduce((acc, a) => acc + a.emiAmount, 0);
    return loansEmi + advancesEmi;
  }, []);

  // Dynamic Payout Calculation
  const payoutInfo = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0);

    const todayMidnight = new Date(currentYear, currentMonth, today.getDate());
    const endMidnight = new Date(endOfCurrentMonth.getFullYear(), endOfCurrentMonth.getMonth(), endOfCurrentMonth.getDate());

    let targetDate = endMidnight;
    let diffDays = Math.round((endMidnight.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const nextMonthEnd = new Date(currentYear, currentMonth + 2, 0);
      const nextEndMidnight = new Date(nextMonthEnd.getFullYear(), nextMonthEnd.getMonth(), nextMonthEnd.getDate());
      targetDate = nextMonthEnd;
      diffDays = Math.round((nextEndMidnight.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));
    }

    const day = targetDate.getDate();
    const getOrdinal = (n: number) => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    const monthName = targetDate.toLocaleString('default', { month: 'long' });
    const formattedCreditDate = `${getOrdinal(day)} ${monthName}, ${targetDate.getFullYear()}`;

    let helperText = '';
    if (diffDays === 0) {
      helperText = 'Crediting today';
    } else if (diffDays === 1) {
      helperText = 'In 1 day';
    } else {
      helperText = `In ${diffDays} days`;
    }

    return {
      formattedCreditDate,
      helperText,
      diffDays
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-full mx-auto pb-10">

      {/* 1. TOP BANNER: Tax Deadline Approaching (Single Line Text, Renamed Button) */}
      <div className="bg-amber-50 border border-amber-200 px-5 py-3 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-white text-amber-600 rounded-lg flex items-center justify-center shrink-0 border border-amber-100 shadow-xs">
            <AlertTriangle size={18} />
          </div>
          <div className="min-w-0 flex items-center gap-2">
            <span className="text-sm font-black text-amber-900 whitespace-nowrap">Tax Deadline Approaching:</span>
            <p className="text-xs text-amber-800 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              The tax window for FY 2025-26 closes on <strong className="font-bold underline">January 20th</strong>. Submit your declarations now to avoid higher TDS deductions.
            </p>
          </div>
        </div>
        <button
          onClick={onNavigateToTaxPlanning}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 h-9 rounded-lg font-bold text-xs shadow-xs transition-all whitespace-nowrap shrink-0 cursor-pointer"
        >
          Continue Tax Planning
        </button>
      </div>

      {/* ROW 1: Next Payout (Left) & Tax & Investment Summary (Right) - Width reduced by ~50% */}
      <div className="flex flex-col lg:flex-row items-stretch gap-6">

        {/* Next Payout (Compact Height & Width, No Eye Icon, Bank Credit Text Removed) */}
        <div className="w-full sm:w-64 lg:w-72 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-all shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Payout</p>
              <h3 className="text-base font-bold text-slate-800 mt-1 tracking-tight">
                {payoutInfo.formattedCreditDate}
              </h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Calendar size={16} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {payoutInfo.helperText}
            </span>
          </div>
        </div>

        {/* Tax & Investment Summary */}
        <div className="w-full sm:w-[480px] lg:w-[520px] bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-all shrink-0">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
                  <Receipt size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider whitespace-nowrap">
                    Tax & Investment Summary
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">FY 2025–26</p>
                </div>
              </div>

              {onNavigateToTaxPlanning && (
                <button
                  onClick={onNavigateToTaxPlanning}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>View Tax Details</span>
                  <ChevronRight size={13} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tax Regime</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-black inline-block whitespace-nowrap">
                  New Regime
                </span>
              </div>

              <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 whitespace-nowrap">Declared Amount</span>
                <p className="text-sm sm:text-base font-black text-slate-900 whitespace-nowrap">₹ 1,50,000</p>
              </div>

              <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 whitespace-nowrap">Approved Amount</span>
                <p className="text-sm sm:text-base font-black text-slate-900 whitespace-nowrap">₹ 1,20,000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payslip Summary Card (Width same as Next Payout: w-full sm:w-64 lg:w-72) */}
        <div className="w-full sm:w-64 lg:w-72 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-all shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payslip</p>
              <h3 className="text-base font-bold text-slate-800 mt-1 tracking-tight">
                August 2026
              </h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <FileText size={16} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={onNavigateToPayslips || onNavigateToSalaryBreakdown}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/70 px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-2xs"
              title="Download Payslip"
            >
              <Download size={13} />
              <span>Download</span>
            </button>
          </div>
        </div>

      </div>

      {/* ROW 2: Salary Revision History */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm w-full">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-600" />
            Salary Revision History
          </h3>

          <div className="flex items-center gap-2">
            {/* Eye Icon to unlock/lock confidential salary widgets */}
            <button
              type="button"
              onClick={handleEyeIconClick}
              className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all cursor-pointer shadow-2xs ${
                isSalaryWidgetsUnlocked
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 hover:border-slate-300'
              }`}
              title={isSalaryWidgetsUnlocked ? 'Hide salary details' : 'Unlock salary details'}
            >
              {isSalaryWidgetsUnlocked ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>

            {/* Date Range Dropdown with Calendar icon & full modal popup - Reference Screenshot 2 */}
            <div className="relative" ref={revisionDropdownRef}>
            <button
              type="button"
              onClick={() => setIsRevisionDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:border-purple-300 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            >
              <Calendar size={14} className="text-purple-600" />
              <span>{revisionFilterLabel}</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isRevisionDropdownOpen ? 'rotate-180 text-purple-600' : ''}`} />
            </button>

            {isRevisionDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-[350px] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-700 tracking-tight uppercase">Select Time Period</h4>
                </div>

                {/* Preset Buttons Grid (2 columns x 2 rows) */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {REVISION_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setRevisionPreset(preset.id);
                        setIsRevisionDropdownOpen(false);
                      }}
                      className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all text-center cursor-pointer ${
                        revisionPreset === preset.id
                          ? 'bg-[#4338ca] border-[#4338ca] text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom Year Section */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Custom Year
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 mb-3">
                    {/* From Year */}
                    <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">From</span>
                      <select
                        value={fromYear}
                        onChange={(e) => setFromYear(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-md px-2 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                      >
                        {REVISION_YEAR_OPTIONS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                    {/* To Year */}
                    <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">To</span>
                      <select
                        value={toYear}
                        onChange={(e) => setToYear(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-md px-2 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                      >
                        {REVISION_YEAR_OPTIONS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const minY = Math.min(Number(fromYear), Number(toYear));
                      const maxY = Math.max(Number(fromYear), Number(toYear));
                      const formatted = minY === maxY ? `${minY}` : `${minY} - ${maxY}`;
                      setCustomRangeText(formatted);
                      setRevisionPreset('CUSTOM');
                      setIsRevisionDropdownOpen(false);
                    }}
                    className="w-full py-2 bg-[#4338ca] hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Calendar size={13} />
                    <span>Apply Custom Range</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Revision Chart */}
        <div className="relative w-full h-72">
          {!isSalaryWidgetsUnlocked ? (
            <div
              onClick={handleOpenPasswordModal}
              className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none text-center px-4 group"
              title="Click to unlock"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all mb-3">
                <Lock size={18} strokeWidth={2} />
              </div>
              <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                Salary Revision History is Hidden
              </p>
              <p className="text-xs text-slate-400 group-hover:text-indigo-600 font-medium mt-1 transition-colors">
                Click the eye icon or click here to unlock and view details
              </p>
            </div>
          ) : (
            <div className="w-full h-full transition-all duration-300">
              {salaryTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={salaryTrendData} margin={{ top: 38, right: 30, left: 10, bottom: 8 }}>
                    <defs>
                      <linearGradient id="overviewSalaryTrendLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        {overviewSalaryTrendGradientStops.map((stop, i) => (
                          <stop key={i} offset={stop.offset} stopColor={stop.stopColor} />
                        ))}
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} allowDecimals={false} domain={[0, 'auto']} />
                    <RechartsTooltip
                      cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const row = payload[0].payload as RevisionItem;
                          return (
                            <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg text-xs min-w-[260px]">
                              <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1.5">{row.period}</p>
                              <div className="flex justify-between items-center gap-4 text-slate-600">
                                <span className="whitespace-nowrap">Previous Monthly CTC:</span>
                                <span className="font-semibold whitespace-nowrap">{formatINR(row.prevGross)}</span>
                              </div>
                              <div className="flex justify-between items-center gap-4 text-[#4f46e5] pt-1">
                                <span className="whitespace-nowrap font-medium">Revised Monthly CTC:</span>
                                <span className="font-bold whitespace-nowrap">{formatINR(row.gross)}</span>
                              </div>
                              {row.isDecrement ? (
                                <div className="flex justify-between items-center gap-4 text-[#dc2626] pt-1.5 mt-1.5 border-t border-slate-100">
                                  <span className="whitespace-nowrap font-medium">Decrement:</span>
                                  <span className="font-bold whitespace-nowrap">-{formatINR(row.decrementAmount)}</span>
                                </div>
                              ) : (
                                <div className="flex justify-between items-center gap-4 text-[#7c3aed] pt-1.5 mt-1.5 border-t border-slate-100">
                                  <span className="whitespace-nowrap font-medium">Increment:</span>
                                  <span className="font-bold whitespace-nowrap">+{formatINR(row.incrementAmount)}</span>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="gross"
                      barSize={36}
                      radius={[6, 6, 0, 0]}
                      fill="#4f46e5"
                      fillOpacity={0.85}
                    />
                    <Line
                      type="monotone"
                      dataKey="gross"
                      stroke="url(#overviewSalaryTrendLineGradient)"
                      strokeWidth={2.5}
                      dot={(props: any) => {
                        const { cx, cy, payload, key } = props;
                        if (payload.isDecrement) {
                          const badgeLabel = `↓ -${formatINR(payload.decrementAmount)}`;
                          const badgeWidth = Math.max(70, badgeLabel.length * 6.5);
                          return (
                            <g key={key}>
                              <rect x={cx - badgeWidth / 2} y={cy - 25} width={badgeWidth} height={18} rx={4} fill="#fee2e2" stroke="#fca5a5" />
                              <text x={cx} y={cy - 12} fill="#dc2626" fontSize="10" fontWeight="bold" textAnchor="middle">
                                {badgeLabel}
                              </text>
                              <circle cx={cx} cy={cy} r={7} fill="#ef4444" fillOpacity={0.25} />
                              <circle cx={cx} cy={cy} r={4.5} fill="#ef4444" stroke="#fff" strokeWidth={1.5} />
                            </g>
                          );
                        }
                        if (payload.isIncrement) {
                          const badgeLabel = `↑ +${formatINR(payload.incrementAmount)}`;
                          const badgeWidth = Math.max(70, badgeLabel.length * 6.5);
                          return (
                            <g key={key}>
                              <rect x={cx - badgeWidth / 2} y={cy - 25} width={badgeWidth} height={18} rx={4} fill="#f3e8ff" stroke="#d8b4fe" />
                              <text x={cx} y={cy - 12} fill="#7c3aed" fontSize="10" fontWeight="bold" textAnchor="middle">
                                {badgeLabel}
                              </text>
                              <circle cx={cx} cy={cy} r={4} fill="#7c3aed" stroke="#fff" strokeWidth={1.5} />
                            </g>
                          );
                        }
                        return <circle key={key} cx={cx} cy={cy} r={3} fill="#4f46e5" stroke="#fff" strokeWidth={1.5} />;
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm italic py-12">
                  <TrendingUp size={28} className="text-slate-300 mb-2 stroke-1" />
                  No salary revisions in this period
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ROW 3: Outstanding Loan/Advance Summary (Left) & Salary Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* Outstanding Loan/Advance Summary (Left, lg:col-span-6) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={18} className="text-blue-600" />
              <h3 className="font-bold text-slate-800 text-base">
                Outstanding Loan/Advance Summary
              </h3>
            </div>

            {/* 3 Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
              <div className="bg-rose-50/60 border border-rose-100 rounded-lg p-2.5 flex flex-col justify-between">
                <div className="mb-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Outstanding</span>
                </div>
                <span className="text-base sm:text-lg font-black text-rose-600">{formatINR(totalOutstandingAll)}</span>
              </div>
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-2.5 flex flex-col justify-between">
                <div className="mb-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Paid</span>
                </div>
                <span className="text-base sm:text-lg font-black text-emerald-600">{formatINR(totalPaidAll)}</span>
              </div>
              <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-2.5 flex flex-col justify-between">
                <div className="mb-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Upcoming EMI</span>
                </div>
                <span className="text-base sm:text-lg font-black text-blue-600">
                  {formatINR(totalUpcomingEmiAll)} <span className="text-[11px] font-semibold text-slate-400">/ month</span>
                </span>
              </div>
            </div>

            {/* Loan Section */}
            <div className="mb-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Loan</span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                    2 loans
                  </span>
                </div>
                {MOCK_LOANS.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 mr-0.5">
                      {activeLoanIndex + 1} of {MOCK_LOANS.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveLoanIndex(prev => Math.max(0, prev - 1))}
                      disabled={activeLoanIndex === 0}
                      title="Previous Loan"
                      className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                    >
                      <ChevronLeft size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveLoanIndex(prev => Math.min(MOCK_LOANS.length - 1, prev + 1))}
                      disabled={activeLoanIndex === MOCK_LOANS.length - 1}
                      title="Next Loan"
                      className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center ml-1 sm:ml-3">
                <div className="min-w-[125px]">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Remaining Balance</div>
                  <span className="text-xl font-black text-slate-800">{formatINR(currentLoan.remainingBalance)}</span>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Amount Repaid ({formatINR(currentLoan.repaidAmount)})</span>
                    <span>Total: {formatINR(currentLoan.totalAmount)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${loanProgress}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      EMI: <strong className="text-slate-800">{formatINR(currentLoan.emiAmount)}</strong> / month
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <strong className="text-slate-800">{currentLoan.paidMonths}</strong> of {currentLoan.totalMonths} paid
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 my-3"></div>

            {/* Salary Advance Section */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Salary Advance</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                    2 advances
                  </span>
                </div>
                {MOCK_ADVANCES.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 mr-0.5">
                      {activeAdvanceIndex + 1} of {MOCK_ADVANCES.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveAdvanceIndex(prev => Math.max(0, prev - 1))}
                      disabled={activeAdvanceIndex === 0}
                      title="Previous Advance"
                      className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                    >
                      <ChevronLeft size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAdvanceIndex(prev => Math.min(MOCK_ADVANCES.length - 1, prev + 1))}
                      disabled={activeAdvanceIndex === MOCK_ADVANCES.length - 1}
                      title="Next Advance"
                      className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center ml-1 sm:ml-3">
                <div className="min-w-[125px]">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Remaining Balance</div>
                  <span className="text-xl font-black text-slate-800">{formatINR(currentAdvance.remainingBalance)}</span>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Amount Repaid ({formatINR(currentAdvance.repaidAmount)})</span>
                    <span>Total: {formatINR(currentAdvance.totalAmount)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${advanceProgress}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      EMI: <strong className="text-slate-800">{formatINR(currentAdvance.emiAmount)}</strong> / month
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <strong className="text-slate-800">{currentAdvance.paidMonths}</strong> of {currentAdvance.totalMonths} paid
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Breakdown (Right, lg:col-span-6) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <PieChartIcon size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Salary Breakdown</h3>
                <p className="text-[10px] text-slate-400 font-medium">(Last 12 months)</p>
              </div>
            </div>

            {/* Eye Icon to unlock/lock confidential salary widgets */}
            <button
              type="button"
              onClick={handleEyeIconClick}
              className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all cursor-pointer shadow-2xs ${
                isSalaryWidgetsUnlocked
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 hover:border-slate-300'
              }`}
              title={isSalaryWidgetsUnlocked ? 'Hide salary details' : 'Unlock salary details'}
            >
              {isSalaryWidgetsUnlocked ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <div className="relative w-full flex-1 flex flex-col justify-between">
            {!isSalaryWidgetsUnlocked ? (
              <div
                onClick={handleOpenPasswordModal}
                className="w-full h-56 flex flex-col items-center justify-center cursor-pointer select-none text-center px-4 group"
                title="Click to unlock"
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all mb-2.5">
                  <Lock size={16} strokeWidth={2} />
                </div>
                <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  Salary Breakdown is Hidden
                </p>
                <p className="text-xs text-slate-400 group-hover:text-indigo-600 font-medium mt-1 transition-colors">
                  Click the eye icon or click here to unlock and view details
                </p>
              </div>
            ) : (
              <div className="w-full transition-all duration-300">
                <div className="w-full h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salaryBreakdown12Months} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val / 1000}k`} />
                      <RechartsTooltip
                        cursor={{ fill: '#f8fafc' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const row = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-xl text-xs min-w-[210px]">
                                <p className="font-bold text-slate-800 border-b border-slate-100 pb-1.5 mb-2">{row.period}</p>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between items-center text-blue-600">
                                    <span className="font-medium">Net Pay:</span>
                                    <span className="font-bold">{formatINR(row.net)}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-rose-600">
                                    <span className="font-medium">Deductions:</span>
                                    <span className="font-bold">-{formatINR(row.deductions)}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-slate-900 pt-1.5 border-t border-slate-100">
                                    <span className="font-bold">Gross Salary:</span>
                                    <span className="font-black text-sm">{formatINR(row.gross)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="net" stackId="a" fill="#3B82F6" barSize={16} radius={[0, 0, 0, 0]} />
                      <Bar dataKey="deductions" stackId="a" fill="#EF4444" radius={[3, 3, 0, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex justify-center gap-6 mt-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">NET PAY</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">DEDUCTIONS</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ROW 4: Statutory Snapshot (Width matching Outstanding Loan/Advance Summary: lg:col-span-6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-all">
          <div className="flex justify-between items-center mb-5 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800">
                Statutory Snapshot
              </h3>
              <div className="relative group/info">
                <Info
                  size={16}
                  className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover/info:block z-50 w-64 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl text-center pointer-events-none">
                  Summary of statutory contributions and compliance applicability for the selected period.
                  <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                </div>
              </div>
            </div>

            {/* Filter - Same as HR Manager role -> Payroll Dashboard -> Variable Pay Summary */}
            <DateRangeFilterDropdown
              value={statutoryTimeRange}
              onChange={setStatutoryTimeRange}
            />
          </div>

          {/* 5 Inner Cards Grid (3 columns on sm+: Provident Fund, Professional Tax, ESI on top; NPS, LWF below) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STATUTORY_SNAPSHOT_DATA.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200/90 rounded-xl p-3 bg-white flex flex-col justify-between min-h-[105px] hover:border-slate-300 transition-all shadow-2xs"
              >
                <div>
                  <span className="text-xs font-bold text-slate-500 truncate block">
                    {item.label}
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 mb-2">
                    {item.value}
                  </p>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      item.applicable
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 5: Expense & Reimbursement Summary */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Wallet size={18} className="text-blue-600" />
            Expense & Reimbursement Summary
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentExpenseItems.map((item) => {
            const Icon = item.icon;
            const percentage = item.limit > 0 ? Math.min(100, (item.claimed / item.limit) * 100) : 0;
            return (
              <div
                key={item.id}
                onClick={onNavigateToReimbursements}
                className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group select-none"
                title="Click to view Reimbursements"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon size={18} />
                      </div>
                      <span className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors" title={item.name}>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.cycleText && (
                        <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                          {item.cycleText}
                        </span>
                      )}
                      <span className="text-xs font-semibold px-2.5 py-0.5 bg-sky-50 text-sky-600 rounded-full shrink-0">
                        {item.frequency}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-700 mb-2.5">
                    {formatINR(item.claimed)} of {formatINR(item.limit)}
                  </p>
                </div>
                <div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className={`${item.barColor} h-1.5 rounded-full`} style={{ width: `${percentage.toFixed(1)}%` }}></div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2.5 font-medium">
                    {item.frequency === 'Once Per Tenure' ? (
                      <Info size={11} className="text-slate-400 shrink-0" />
                    ) : (
                      <RotateCw size={11} className="text-slate-400 shrink-0" />
                    )}
                    <span>{item.resetText || 'Limit Resets on 1st June, 2026.'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Password Prompt Modal Dialog for Unlocking Salary Widgets */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full p-7 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Subtle background glow */}
            <div className="absolute -top-20 -right-20 w-44 h-44 bg-indigo-50/70 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-blue-50/70 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClosePasswordModal}
              className="absolute right-4 top-4 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              title="Close"
            >
              <X size={16} />
            </button>

            {/* Lock Icon with Shield */}
            <div className="relative mx-auto w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
              <Lock size={26} className="stroke-[2.2]" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs">
                <ShieldCheck size={11} />
              </div>
            </div>

            <div className="text-center mb-5">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Salary Access Protected</h2>
              <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">
                This screen contains confidential payslip and salary records. Please enter your portal password to continue.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Portal Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswordPlaintext ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="Enter password (e.g. 1234)"
                    autoFocus
                    className={`w-full pl-10 pr-11 py-2.5 bg-slate-50/60 border ${
                      passwordError
                        ? 'border-red-300 ring-2 ring-red-100 bg-red-50/30'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    } rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all`}
                  />
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPasswordPlaintext(!showPasswordPlaintext)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title={showPasswordPlaintext ? 'Hide password' : 'Show password'}
                  >
                    {showPasswordPlaintext ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {passwordError && (
                  <div className="mt-2.5 p-2.5 bg-red-50/90 border border-red-200/80 rounded-lg flex items-center gap-2 text-xs text-red-600 font-semibold animate-in fade-in">
                    <AlertTriangle size={14} className="shrink-0 text-red-500" />
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isVerifyingPassword}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-100 cursor-pointer disabled:opacity-60"
              >
                {isVerifyingPassword ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>Unlock Salary Widgets</span>
                  </>
                )}
              </button>
            </form>

            {/* Default PIN Helper */}
            <div className="mt-5 pt-4 border-t border-slate-100 text-center flex flex-col items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>Default PIN:</span> <strong className="text-slate-700 font-bold">1234</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
