
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';

import {
  Download,
  FileCheck,
  TrendingUp,
  TrendingDown,
  CreditCard,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  ChevronDown,
  Calendar
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { generateTaxSlipPDF } from './taxSlipGenerator';

// --- Types & Data ---

interface SalaryComponent {
  name: string;
  amount: number;
}

interface PayslipData {
  month: string;
  year: string;
  creditedDate: string;
  netPay: number;
  netPayWords: string;
  trend: 'up' | 'down' | 'flat';
  totalWorkingDays: number;
  processedDays: number;
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
  reimbursements: SalaryComponent[];
  taxDonut: { name: string, value: number, color: string }[];
}

const COLORS = {
  blue: '#3B82F6',
  teal: '#0EA5E9',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  purple: '#8B5CF6',
  gold: '#FBBF24',
  slate: '#64748b'
};

// --- Persistence Configuration ---
// All data is fetched from public.payslips table based on logged-in employee ID


const MONTH_ORDER = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MOCK_PAYSLIPS_DATA: Record<string, PayslipData> = {
  // ── 2026 ──────────────────────────────────────────────
  'Mar 2026': { month: 'Mar', year: '2026', creditedDate: '07/03/2026', netPay: 81500, netPayWords: 'Eighty-One Thousand Five Hundred Only', trend: 'up', totalWorkingDays: 31, processedDays: 31, earnings: [{ name: 'Basic Salary', amount: 43000 }, { name: 'HRA', amount: 21000 }, { name: 'Special Allowance', amount: 16000 }, { name: 'Statutory Bonus', amount: 5000 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }, { name: 'Income Tax (TDS)', amount: 4500 }], reimbursements: [{ name: 'Fuel Reimbursement', amount: 2500 }], taxDonut: [] },
  'Feb 2026': { month: 'Feb', year: '2026', creditedDate: '07/02/2026', netPay: 80200, netPayWords: 'Eighty Thousand Two Hundred Only', trend: 'up', totalWorkingDays: 28, processedDays: 28, earnings: [{ name: 'Basic Salary', amount: 43000 }, { name: 'HRA', amount: 21000 }, { name: 'Special Allowance', amount: 16000 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }, { name: 'Income Tax (TDS)', amount: 4400 }], reimbursements: [], taxDonut: [] },
  'Jan 2026': { month: 'Jan', year: '2026', creditedDate: '07/01/2026', netPay: 79800, netPayWords: 'Seventy-Nine Thousand Eight Hundred Only', trend: 'up', totalWorkingDays: 31, processedDays: 31, earnings: [{ name: 'Basic Salary', amount: 43000 }, { name: 'HRA', amount: 21000 }, { name: 'Special Allowance', amount: 15500 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }, { name: 'Income Tax (TDS)', amount: 4300 }], reimbursements: [], taxDonut: [] },
  // ── 2025 ──────────────────────────────────────────────
  'Dec 2025': { month: 'Dec', year: '2025', creditedDate: '07/12/2025', netPay: 78200, netPayWords: 'Seventy-Eight Thousand Two Hundred Only', trend: 'flat', totalWorkingDays: 31, processedDays: 31, earnings: [{ name: 'Basic Salary', amount: 41667 }, { name: 'HRA', amount: 20000 }, { name: 'Special Allowance', amount: 15000 }, { name: 'Statutory Bonus', amount: 5000 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }, { name: 'Income Tax (TDS)', amount: 4000 }], reimbursements: [{ name: 'Fuel Reimbursement', amount: 2500 }], taxDonut: [] },
  'Nov 2025': { month: 'Nov', year: '2025', creditedDate: '07/11/2025', netPay: 75700, netPayWords: 'Seventy-Five Thousand Seven Hundred Only', trend: 'down', totalWorkingDays: 30, processedDays: 30, earnings: [{ name: 'Basic Salary', amount: 41667 }, { name: 'HRA', amount: 20000 }, { name: 'Special Allowance', amount: 15000 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }, { name: 'Income Tax (TDS)', amount: 3500 }], reimbursements: [], taxDonut: [] },
  'Oct 2025': { month: 'Oct', year: '2025', creditedDate: '07/10/2025', netPay: 76000, netPayWords: 'Seventy-Six Thousand Only', trend: 'up', totalWorkingDays: 31, processedDays: 31, earnings: [{ name: 'Basic Salary', amount: 41667 }, { name: 'HRA', amount: 20000 }, { name: 'Special Allowance', amount: 15000 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }, { name: 'Income Tax (TDS)', amount: 3200 }], reimbursements: [], taxDonut: [] },
  'Sep 2025': { month: 'Sep', year: '2025', creditedDate: '07/09/2025', netPay: 75500, netPayWords: 'Seventy-Five Thousand Five Hundred Only', trend: 'flat', totalWorkingDays: 30, processedDays: 30, earnings: [{ name: 'Basic Salary', amount: 41667 }, { name: 'HRA', amount: 20000 }, { name: 'Special Allowance', amount: 14500 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }, { name: 'Income Tax (TDS)', amount: 3100 }], reimbursements: [], taxDonut: [] },
  'Aug 2025': { month: 'Aug', year: '2025', creditedDate: '07/08/2025', netPay: 76200, netPayWords: 'Seventy-Six Thousand Two Hundred Only', trend: 'up', totalWorkingDays: 31, processedDays: 31, earnings: [{ name: 'Basic Salary', amount: 41667 }, { name: 'HRA', amount: 20000 }, { name: 'Special Allowance', amount: 15000 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }, { name: 'Income Tax (TDS)', amount: 3100 }], reimbursements: [{ name: 'Fuel Reimbursement', amount: 1500 }], taxDonut: [] },
  'Jul 2025': { month: 'Jul', year: '2025', creditedDate: '07/07/2025', netPay: 74900, netPayWords: 'Seventy-Four Thousand Nine Hundred Only', trend: 'down', totalWorkingDays: 31, processedDays: 31, earnings: [{ name: 'Basic Salary', amount: 41667 }, { name: 'HRA', amount: 20000 }, { name: 'Special Allowance', amount: 14000 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }, { name: 'Income Tax (TDS)', amount: 3000 }], reimbursements: [], taxDonut: [] },
  'Jun 2025': { month: 'Jun', year: '2025', creditedDate: '07/06/2025', netPay: 75200, netPayWords: 'Seventy-Five Thousand Two Hundred Only', trend: 'up', totalWorkingDays: 30, processedDays: 30, earnings: [{ name: 'Basic Salary', amount: 41667 }, { name: 'HRA', amount: 20000 }, { name: 'Special Allowance', amount: 14000 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }, { name: 'Income Tax (TDS)', amount: 2900 }], reimbursements: [], taxDonut: [] },
  'May 2025': { month: 'May', year: '2025', creditedDate: '07/05/2025', netPay: 74500, netPayWords: 'Seventy-Four Thousand Five Hundred Only', trend: 'flat', totalWorkingDays: 31, processedDays: 31, earnings: [{ name: 'Basic Salary', amount: 41667 }, { name: 'HRA', amount: 20000 }, { name: 'Special Allowance', amount: 13500 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }, { name: 'Income Tax (TDS)', amount: 2800 }], reimbursements: [], taxDonut: [] },
  'Apr 2025': { month: 'Apr', year: '2025', creditedDate: '07/04/2025', netPay: 74000, netPayWords: 'Seventy-Four Thousand Only', trend: 'up', totalWorkingDays: 30, processedDays: 30, earnings: [{ name: 'Basic Salary', amount: 41667 }, { name: 'HRA', amount: 20000 }, { name: 'Special Allowance', amount: 13000 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }, { name: 'Income Tax (TDS)', amount: 2700 }], reimbursements: [], taxDonut: [] },
  'Mar 2025': { month: 'Mar', year: '2025', creditedDate: '07/03/2025', netPay: 73500, netPayWords: 'Seventy-Three Thousand Five Hundred Only', trend: 'flat', totalWorkingDays: 31, processedDays: 31, earnings: [{ name: 'Basic Salary', amount: 41667 }, { name: 'HRA', amount: 20000 }, { name: 'Special Allowance', amount: 12500 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }, { name: 'Income Tax (TDS)', amount: 2600 }], reimbursements: [], taxDonut: [] },
  'Feb 2025': { month: 'Feb', year: '2025', creditedDate: '07/02/2025', netPay: 72800, netPayWords: 'Seventy-Two Thousand Eight Hundred Only', trend: 'down', totalWorkingDays: 28, processedDays: 28, earnings: [{ name: 'Basic Salary', amount: 41667 }, { name: 'HRA', amount: 20000 }, { name: 'Special Allowance', amount: 12000 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }, { name: 'Income Tax (TDS)', amount: 2500 }], reimbursements: [], taxDonut: [] },
  'Jan 2025': { month: 'Jan', year: '2025', creditedDate: '07/01/2025', netPay: 72500, netPayWords: 'Seventy-Two Thousand Five Hundred Only', trend: 'up', totalWorkingDays: 31, processedDays: 31, earnings: [{ name: 'Basic Salary', amount: 41667 }, { name: 'HRA', amount: 20000 }, { name: 'Special Allowance', amount: 11500 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }, { name: 'Income Tax (TDS)', amount: 2400 }], reimbursements: [], taxDonut: [] },
  // ── 2024 ──────────────────────────────────────────────
  'Dec 2024': { month: 'Dec', year: '2024', creditedDate: '07/12/2024', netPay: 72000, netPayWords: 'Seventy-Two Thousand Only', trend: 'flat', totalWorkingDays: 31, processedDays: 31, earnings: [{ name: 'Basic Salary', amount: 38000 }, { name: 'HRA', amount: 18000 }, { name: 'Special Allowance', amount: 16000 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }], reimbursements: [], taxDonut: [] },
  'Nov 2024': { month: 'Nov', year: '2024', creditedDate: '07/11/2024', netPay: 71500, netPayWords: 'Seventy-One Thousand Five Hundred Only', trend: 'up', totalWorkingDays: 30, processedDays: 30, earnings: [{ name: 'Basic Salary', amount: 38000 }, { name: 'HRA', amount: 18000 }, { name: 'Special Allowance', amount: 15500 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }], reimbursements: [], taxDonut: [] },
  'Oct 2024': { month: 'Oct', year: '2024', creditedDate: '07/10/2024', netPay: 71000, netPayWords: 'Seventy-One Thousand Only', trend: 'flat', totalWorkingDays: 31, processedDays: 31, earnings: [{ name: 'Basic Salary', amount: 38000 }, { name: 'HRA', amount: 18000 }, { name: 'Special Allowance', amount: 15000 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }], reimbursements: [], taxDonut: [] },
  'Sep 2024': { month: 'Sep', year: '2024', creditedDate: '07/09/2024', netPay: 70500, netPayWords: 'Seventy Thousand Five Hundred Only', trend: 'up', totalWorkingDays: 30, processedDays: 30, earnings: [{ name: 'Basic Salary', amount: 38000 }, { name: 'HRA', amount: 18000 }, { name: 'Special Allowance', amount: 14500 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }], reimbursements: [], taxDonut: [] },
  'Aug 2024': { month: 'Aug', year: '2024', creditedDate: '07/08/2024', netPay: 70000, netPayWords: 'Seventy Thousand Only', trend: 'flat', totalWorkingDays: 31, processedDays: 31, earnings: [{ name: 'Basic Salary', amount: 38000 }, { name: 'HRA', amount: 18000 }, { name: 'Special Allowance', amount: 14000 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }], reimbursements: [], taxDonut: [] },
  'Jul 2024': { month: 'Jul', year: '2024', creditedDate: '07/07/2024', netPay: 69500, netPayWords: 'Sixty-Nine Thousand Five Hundred Only', trend: 'down', totalWorkingDays: 31, processedDays: 31, earnings: [{ name: 'Basic Salary', amount: 38000 }, { name: 'HRA', amount: 18000 }, { name: 'Special Allowance', amount: 13500 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }], reimbursements: [], taxDonut: [] },
  'Jun 2024': { month: 'Jun', year: '2024', creditedDate: '07/06/2024', netPay: 69000, netPayWords: 'Sixty-Nine Thousand Only', trend: 'up', totalWorkingDays: 30, processedDays: 30, earnings: [{ name: 'Basic Salary', amount: 38000 }, { name: 'HRA', amount: 18000 }, { name: 'Special Allowance', amount: 13000 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }], reimbursements: [], taxDonut: [] },
  'May 2024': { month: 'May', year: '2024', creditedDate: '07/05/2024', netPay: 68500, netPayWords: 'Sixty-Eight Thousand Five Hundred Only', trend: 'flat', totalWorkingDays: 31, processedDays: 31, earnings: [{ name: 'Basic Salary', amount: 38000 }, { name: 'HRA', amount: 18000 }, { name: 'Special Allowance', amount: 12500 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }], reimbursements: [], taxDonut: [] },
  'Apr 2024': { month: 'Apr', year: '2024', creditedDate: '07/04/2024', netPay: 68000, netPayWords: 'Sixty-Eight Thousand Only', trend: 'up', totalWorkingDays: 30, processedDays: 30, earnings: [{ name: 'Basic Salary', amount: 38000 }, { name: 'HRA', amount: 18000 }, { name: 'Special Allowance', amount: 12000 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }], reimbursements: [], taxDonut: [] },
  'Mar 2024': { month: 'Mar', year: '2024', creditedDate: '07/03/2024', netPay: 67500, netPayWords: 'Sixty-Seven Thousand Five Hundred Only', trend: 'flat', totalWorkingDays: 31, processedDays: 31, earnings: [{ name: 'Basic Salary', amount: 38000 }, { name: 'HRA', amount: 18000 }, { name: 'Special Allowance', amount: 11500 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }], reimbursements: [], taxDonut: [] },
  'Feb 2024': { month: 'Feb', year: '2024', creditedDate: '07/02/2024', netPay: 67000, netPayWords: 'Sixty-Seven Thousand Only', trend: 'down', totalWorkingDays: 29, processedDays: 29, earnings: [{ name: 'Basic Salary', amount: 38000 }, { name: 'HRA', amount: 18000 }, { name: 'Special Allowance', amount: 11000 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }], reimbursements: [], taxDonut: [] },
  'Jan 2024': { month: 'Jan', year: '2024', creditedDate: '07/01/2024', netPay: 66500, netPayWords: 'Sixty-Six Thousand Five Hundred Only', trend: 'up', totalWorkingDays: 31, processedDays: 31, earnings: [{ name: 'Basic Salary', amount: 38000 }, { name: 'HRA', amount: 18000 }, { name: 'Special Allowance', amount: 10500 }], deductions: [{ name: 'PF Contribution', amount: 1800 }, { name: 'Professional Tax', amount: 200 }], reimbursements: [], taxDonut: [] },
};

export const SalarySlipsModule: React.FC<{ currentEmployeeId?: string; showValues?: boolean }> = ({ currentEmployeeId = 'TF00912', showValues = false }) => {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [activeMonth, setActiveMonth] = useState('');
  const [payslipsMap, setPayslipsMap] = useState<Record<string, PayslipData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [isForm16ModalOpen, setIsForm16ModalOpen] = useState(false);
  const [form16FY, setForm16FY] = useState('2025-26');
  const showHeaderDownloadButton = false; // Hidden for now, per request. Set to true to bring it back.

  const handleDownloadForm16Part = (part: string) => {
    const docTitle = `Form 16 - ${part} (FY ${form16FY})`;
    const content = `COLLABCRM SYSTEMS PVT LTD
FORM 16 (${part.toUpperCase()})
Assessment Year: 2026-27 | Financial Year: ${form16FY}
--------------------------------------------------
Employee: Priya Sharma (TF00123)
Designation: Senior Engineer
PAN: ABCDE1234F
Gross Salary: ₹ 12,00,000.00
Total TDS Deducted: ₹ 1,01,800.00
--------------------------------------------------
Certified that this is a valid TDS certificate generated for ${part}.`;
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${docTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Date Picker Popover State
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState<number>(2026);
  const [pickerMonth, setPickerMonth] = useState<string>('Mar');
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApplyFilter = () => {
    const yrStr = pickerYear.toString();
    setSelectedYear(yrStr);
    if (pickerMonth) {
      const key = `${pickerMonth} ${yrStr}`;
      if (payslipsMap[key]) {
        setActiveMonth(key);
      } else {
        const availableInYear = Object.keys(payslipsMap).filter(k => k.endsWith(yrStr));
        if (availableInYear.length > 0) {
          setActiveMonth(availableInYear[0]);
        }
      }
    }
    setIsDatePickerOpen(false);
  };

  const handleClearFilter = () => {
    setPickerYear(2026);
    setPickerMonth('Mar');
    setSelectedYear('2026');
    setActiveMonth('Mar 2026');
    setIsDatePickerOpen(false);
  };

  useEffect(() => {
    fetchPayslips();
  }, [currentEmployeeId]);

  const fetchPayslips = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payslips')
        .select('*')
        .eq('employee_id', currentEmployeeId);
      
        if (!error && data && data.length > 0) {
          const map: Record<string, PayslipData> = {};
          data.forEach(p => {
            const key = `${p.month} ${p.year}`;
            map[key] = {
              month: p.month,
              year: p.year,
              creditedDate: p.credited_date ? new Date(p.credited_date).toLocaleDateString() : 'N/A',
              netPay: p.net_pay,
              netPayWords: p.net_pay_words || '',
              trend: p.trend || 'flat',
              totalWorkingDays: p.total_working_days || 30,
              processedDays: p.processed_days || 30,
              earnings: p.earnings || [],
              deductions: p.deductions || [],
              reimbursements: p.reimbursements || [],
              taxDonut: p.tax_donut || []
            };
          });
          setPayslipsMap(map);
          
          // Set default active month to latest
          const sortedKeys = Object.keys(map).sort((a, b) => {
            const monthA = a.split(' ')[0];
            const monthB = b.split(' ')[0];
            return MONTH_ORDER.indexOf(monthB) - MONTH_ORDER.indexOf(monthA);
          });
          if (sortedKeys.length > 0) setActiveMonth(sortedKeys[0]);
        } else {
          // Fallback to mock data if no data found
          setPayslipsMap(MOCK_PAYSLIPS_DATA);
          setActiveMonth('Mar 2026');
        }
    } catch (err) {
      console.error('Error fetching payslips:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const slip = payslipsMap[activeMonth];
  const totalEarnings = slip ? slip.earnings.reduce((s, i) => s + i.amount, 0) : 0;
  const totalDeductions = slip ? slip.deductions.reduce((s, i) => s + i.amount, 0) : 0;
  const totalReimbursements = slip ? slip.reimbursements.reduce((s, i) => s + i.amount, 0) : 0;

  const lopDays = slip ? slip.totalWorkingDays - slip.processedDays : 0;

  const availableMonths = Object.keys(payslipsMap)
    .filter(key => key.includes(selectedYear))
    .sort((a, b) => {
       const monthA = a.split(' ')[0];
       const monthB = b.split(' ')[0];
       return MONTH_ORDER.indexOf(monthB) - MONTH_ORDER.indexOf(monthA);
    });

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = e.target.value;
    setSelectedYear(newYear);
    
    // Switch to the latest available month in the selected year
    const monthsInYear = Object.keys(payslipsMap)
      .filter(key => key.endsWith(newYear))
      .sort((a, b) => {
        const monthA = a.split(' ')[0];
        const monthB = b.split(' ')[0];
        return MONTH_ORDER.indexOf(monthB) - MONTH_ORDER.indexOf(monthA);
      });
      
    if (monthsInYear.length > 0) {
      setActiveMonth(monthsInYear[0]);
    } else {
      setActiveMonth('');
    }
  };

  const formatCurrency = (amount: number) => {
    return showValues ? `₹${amount.toLocaleString()}` : '₹ ••••••';
  };

  const handleDownloadPayslipForMonth = (monthKey: string) => {
    const targetSlip = payslipsMap[monthKey] || slip;
    if (!targetSlip) return;
    
    const targetLopDays = targetSlip.totalWorkingDays - targetSlip.processedDays;
    const targetTotalEarnings = targetSlip.earnings.reduce((s, i) => s + i.amount, 0);
    const targetTotalDeductions = targetSlip.deductions.reduce((s, i) => s + i.amount, 0);

    const content = `
      COLLABCRM SYSTEMS PVT LTD
      PAYSLIP - ${targetSlip.month.toUpperCase()} ${targetSlip.year}
      --------------------------------------------------
      Employee: Priya Sharma (TF00123)
      Designation: Senior Engineer
      Department: Engineering
      
      Working Days: ${targetSlip.totalWorkingDays}
      Paid Days: ${targetSlip.processedDays}
      LOP Days: ${targetLopDays}
      
      EARNINGS
      --------------------------------------------------
      ${targetSlip.earnings.map(e => `${e.name.padEnd(30)}: ₹ ${e.amount.toLocaleString()}`).join('\n      ')}
      --------------------------------------------------
      Total Earnings                : ₹ ${targetTotalEarnings.toLocaleString()}
      
      DEDUCTIONS
      --------------------------------------------------
      ${targetSlip.deductions.map(d => `${d.name.padEnd(30)}: ₹ ${d.amount.toLocaleString()}`).join('\n      ')}
      --------------------------------------------------
      Total Deductions              : ₹ ${targetTotalDeductions.toLocaleString()}
      
      NET PAYABLE                   : ₹ ${targetSlip.netPay.toLocaleString()}
      (${targetSlip.netPayWords})
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslip_${targetSlip.month}_${targetSlip.year}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadTaxSlipForMonth = (monthKey: string) => {
    generateTaxSlipPDF(monthKey);
  };

  const handleDownloadPDF = () => {
    if (!slip) return;
    handleDownloadPayslipForMonth(activeMonth);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-slate-100 relative">
        <h3 className="text-base font-bold text-slate-900">Payslips</h3>

        <div className="flex items-center gap-3">
          {/* Download Form-16 Button */}
          <button
            type="button"
            onClick={() => setIsForm16ModalOpen(true)}
            className="flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Download size={15} />
            <span>Download Form-16</span>
          </button>

          {/* Date Filter Dropdown Trigger & Popover */}
          <div className="relative" ref={datePickerRef}>
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className={`flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-white transition-all cursor-pointer ${
                isDatePickerOpen ? 'border-blue-500 ring-2 ring-blue-500/20 text-slate-800' : 'border-blue-400 text-slate-700 hover:border-blue-500'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span className="text-sm font-semibold text-slate-800">{selectedYear}</span>
            </button>

          {/* Date Picker Popover */}
          {isDatePickerOpen && (
            <div className="absolute right-0 top-11 z-50 w-72 bg-white rounded-2xl border border-slate-100 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
              {/* Year Navigation Header */}
              <div className="flex items-center justify-between mb-5 px-1">
                <button
                  type="button"
                  onClick={() => setPickerYear(prev => prev - 1)}
                  className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-xl font-bold text-slate-900">{pickerYear}</span>
                <button
                  type="button"
                  onClick={() => setPickerYear(prev => prev + 1)}
                  className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Month Selector Grid */}
              <div className="grid grid-cols-4 gap-y-4 gap-x-2 mb-6">
                {MONTH_ORDER.map((m) => {
                  const key = `${m} ${pickerYear}`;
                  const hasData = !!payslipsMap[key];
                  const isSelected = pickerMonth === m;

                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPickerMonth(m)}
                      className={`py-1.5 rounded-lg text-sm font-medium transition-all text-center ${
                        isSelected
                          ? 'text-indigo-600 font-bold bg-indigo-50/80'
                          : hasData
                          ? 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50 cursor-pointer'
                          : 'text-slate-300 font-normal cursor-pointer hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClearFilter}
                  className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 cursor-pointer transition-colors bg-transparent border-none p-0"
                >
                  Clear
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(false)}
                    className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyFilter}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Content Canvas */}
      <div className="p-6 bg-slate-50/80 min-h-[220px] flex justify-between items-start gap-6">
        
        {/* Left: Month Cards */}
        <div className="flex flex-wrap gap-4 items-start">
          {availableMonths.length > 0 ? availableMonths.map((m) => (
            <div
              key={m}
              onClick={() => setActiveMonth(m)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer w-48 sm:w-52 text-left ${
                activeMonth === m
                  ? 'bg-white border-blue-500 ring-1 ring-blue-500/20 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
                activeMonth === m ? 'bg-indigo-600 text-white' : 'bg-indigo-600/90 text-white'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <span className="text-sm font-bold text-slate-800">{m}</span>
            </div>
          )) : (
            <div className="text-center py-6 text-xs text-slate-400 font-medium italic">
              No payslips found for {selectedYear}
            </div>
          )}
        </div>

        {/* Right: Selected Payslip Summary Box */}
        {slip && (
          <div className="w-80 bg-white rounded-xl border border-slate-200/70 shadow-sm p-5 shrink-0 ml-auto">
            <h3 className="text-base font-bold text-slate-900 mb-4">{activeMonth}</h3>

            <div className="space-y-2 mb-4">
              <div className="bg-slate-50 rounded-lg px-4 py-3 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">Total Working Days</span>
                <span className="text-xs font-bold text-slate-900">{slip.totalWorkingDays}</span>
              </div>
              <div className="bg-slate-50 rounded-lg px-4 py-3 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">Payable Days</span>
                <span className="text-xs font-bold text-slate-900">{slip.processedDays}</span>
              </div>
              <div className="bg-slate-50 rounded-lg px-4 py-3 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">LOP Days</span>
                <span className={`text-xs font-bold ${lopDays > 0 ? 'text-red-500' : 'text-slate-900'}`}>{lopDays}</span>
              </div>
            </div>

            <button
              onClick={handleDownloadPDF}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-semibold text-xs shadow-sm shadow-indigo-100 transition-all active:scale-[0.99] cursor-pointer"
            >
              <Download size={15} /> Download payslip
            </button>
            <button
              onClick={() => handleDownloadTaxSlipForMonth(activeMonth)}
              className="w-full flex items-center justify-center gap-2 bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-4 py-2.5 rounded-lg font-semibold text-xs transition-all active:scale-[0.99] cursor-pointer mt-2"
            >
              <Download size={15} /> Download Tax Slip
            </button>
          </div>
        )}

      </div>

      {/* Form-16 Dialog Box Modal */}
      {isForm16ModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 p-8 relative overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsForm16ModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* DocCard exact structure */}
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600 shadow-xs">
                  <FileText size={26} />
                </div>
                <div className="mr-8">
                  <div className="relative">
                    <select
                      value={form16FY}
                      onChange={(e) => setForm16FY(e.target.value)}
                      className="pl-3 pr-7 py-1.5 border border-slate-200 rounded-lg text-xs font-black uppercase tracking-widest text-slate-700 bg-white appearance-none focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {['2025-26', '2024-25', '2023-24', '2022-23'].map(fy => (
                        <option key={fy} value={fy}>FY {fy}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900">Form 16 (Part A & B)</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">
                  Consolidated salary TDS certificate. Released once per financial year after it ends.
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              {['Part A', 'Part B'].map((part) => (
                <button
                  key={part}
                  type="button"
                  onClick={() => handleDownloadForm16Part(part)}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-blue-100 cursor-pointer"
                >
                  <Download size={18} /> {part}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


/* --- Visual UI Atoms --- */

const InfoItem = ({ label, value, isWarning }: { label: string, value: string, isWarning?: boolean }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{label}</p>
    <p className={`text-sm font-black whitespace-nowrap ${isWarning ? 'text-red-500' : 'text-slate-800'}`}>{value}</p>
  </div>
);

export default SalarySlipsModule;
