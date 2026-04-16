
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  X
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

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

export const SalarySlipsModule: React.FC<{ currentEmployeeId?: string }> = ({ currentEmployeeId = 'TF00912' }) => {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [activeMonth, setActiveMonth] = useState('');
  const [showValues, setShowValues] = useState(false);
  const [payslipsMap, setPayslipsMap] = useState<Record<string, PayslipData>>({});
  const [isLoading, setIsLoading] = useState(true);

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

  
  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

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

  const handleToggleVisibility = () => {
    if (showValues) {
      setShowValues(false);
    } else {
      setIsPasswordModalOpen(true);
      setPasswordInput('');
      setPasswordError('');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1234') {
      setShowValues(true);
      setIsPasswordModalOpen(false);
    } else {
      setPasswordError('Incorrect password. Try 1234.');
    }
  };

  const formatCurrency = (amount: number) => {
    return showValues ? `₹${amount.toLocaleString()}` : '₹ ••••••';
  };

  const handleDownloadPDF = () => {
    if (!slip) return;
    
    const content = `
      COLLABCRM SYSTEMS PVT LTD
      PAYSLIP - ${slip.month.toUpperCase()} ${slip.year}
      --------------------------------------------------
      Employee: Priya Sharma (TF00123)
      Designation: Senior Engineer
      Department: Engineering
      
      Working Days: ${slip.totalWorkingDays}
      Paid Days: ${slip.processedDays}
      LOP Days: ${lopDays}
      
      EARNINGS
      --------------------------------------------------
      ${slip.earnings.map(e => `${e.name.padEnd(30)}: ₹ ${e.amount.toLocaleString()}`).join('\n      ')}
      --------------------------------------------------
      Total Earnings                : ₹ ${totalEarnings.toLocaleString()}
      
      DEDUCTIONS
      --------------------------------------------------
      ${slip.deductions.map(d => `${d.name.padEnd(30)}: ₹ ${d.amount.toLocaleString()}`).join('\n      ')}
      --------------------------------------------------
      Total Deductions              : ₹ ${totalDeductions.toLocaleString()}
      
      NET PAYABLE                   : ₹ ${slip.netPay.toLocaleString()}
      (${slip.netPayWords})
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslip_${slip.month}_${slip.year}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-300 pb-10">
      
      {/* LEFT: INTERACTIVE TIMELINE */}
      <div className="col-span-3 flex flex-col">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex-1">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-slate-900">Payslips</h3>
             <select 
               value={selectedYear}
               onChange={handleYearChange}
               className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none cursor-pointer"
             >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
             </select>
           </div>
           
           <div className="space-y-4">
              {availableMonths.length > 0 ? availableMonths.map((m) => (
                <button 
                  key={m}
                  onClick={() => setActiveMonth(m)}
                  className={`w-full group relative pl-8 py-3 pr-4 rounded-2xl flex items-center justify-between transition-all border cursor-pointer
                    ${activeMonth === m ? 'bg-purple-50 border-purple-200 shadow-sm' : 'hover:bg-slate-50 border-transparent'}
                  `}
                >
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-all
                    ${activeMonth === m ? 'bg-purple-600 ring-4 ring-purple-100' : 'bg-slate-200 group-hover:bg-slate-300'}
                  `}></div>
                  
                  <div className="text-left">
                    <p className={`text-sm font-bold ${activeMonth === m ? 'text-purple-900' : 'text-slate-600'}`}>{m}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Credited {payslipsMap[m]?.creditedDate || 'N/A'}</p>
                  </div>

                  <div className="text-right flex flex-col items-end">
                     <p className={`text-sm font-black ${activeMonth === m ? 'text-purple-900' : 'text-slate-800'}`}>
                        {payslipsMap[m] ? formatCurrency(payslipsMap[m].netPay) : '--'}
                     </p>
                  </div>
                </button>
              )) : (
                <div className="text-center py-6 text-xs text-slate-400 font-medium italic">
                  No payslips found for {selectedYear}
                </div>
              )}
           </div>
        </div>
      </div>

      {/* RIGHT: MAIN PAYSLIP CONTENT */}
      {slip && (
      <div className="col-span-9 space-y-6">
        
        {/* MERGED: Header Actions & Employee Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
           
           {/* Top Section: Company Info & Actions */}
           <div className="p-8 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">C</div>
                 <div>
                    <h2 className="text-lg font-black text-slate-900">CollabCRM Systems Pvt Ltd</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tech Park, Bangalore - 560103</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="text-right mr-4">
                    <h3 className="text-sm font-black text-slate-900 tracking-tighter">PAYSLIP #{slip.month.toUpperCase()}-{slip.year}</h3>
                 </div>
                 
                 <button 
                    onClick={handleToggleVisibility}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-all active:scale-95 border border-slate-100"
                    title={showValues ? "Hide sensitive values" : "Show sensitive values"}
                 >
                    {showValues ? <EyeOff size={20}/> : <Eye size={20}/>}
                 </button>

                 <button 
                   onClick={handleDownloadPDF}
                   className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 h-12 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all active:scale-95"
                 >
                   <Download size={18}/> Download PDF
                 </button>
              </div>
           </div>

           <div className="h-px bg-slate-100 mx-8"></div>

           {/* Bottom Section: Employee Info Grid */}
           <div className="p-8">
              <div className="grid grid-cols-7 gap-6">
                 <InfoItem label="Employee Name" value="Priya Sharma" />
                 <InfoItem label="Employee ID" value="TF00123" />
                 <InfoItem label="Designation" value="Senior Engineer" />
                 <InfoItem label="Department" value="Engineering" />
                 <InfoItem label="Working Days" value={`${slip.totalWorkingDays} Days`} />
                 <InfoItem label="Paid Days" value={`${slip.processedDays} Days`} />
                 <InfoItem label="LOP Days" value={`${lopDays} Days`} isWarning={lopDays > 0} />
              </div>
           </div>
        </div>

        {/* SALARY BREAKDOWN & FOOTER MERGED CARD */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
           
           {/* Earnings */}
           <div className="group">
              <div className="w-full px-8 py-5 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                       <TrendingUp size={16}/>
                    </div>
                    <span className="font-black text-slate-900 uppercase text-xs tracking-widest">Earnings</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-emerald-600">Total: {formatCurrency(totalEarnings)}</span>
                 </div>
              </div>
              <div className="px-8 pb-6">
                 <table className="w-full text-left">
                    <thead className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
                       <tr>
                          <th className="py-4">Component</th>
                          <th className="py-4 text-right">Amount (INR)</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {slip.earnings.map((e) => (
                         <tr key={e.name} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="py-4 text-sm font-medium text-slate-700">{e.name}</td>
                            <td className="py-4 text-right font-black text-slate-900">{formatCurrency(e.amount)}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           <div className="h-px bg-slate-100 mx-8"></div>

           {/* Deductions */}
           <div className="group">
              <div className="w-full px-8 py-5 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                       <TrendingDown size={16}/>
                    </div>
                    <span className="font-black text-slate-900 uppercase text-xs tracking-widest">Deductions</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-amber-600">Total: {formatCurrency(totalDeductions)}</span>
                 </div>
              </div>
              <div className="px-8 pb-6">
                 <table className="w-full text-left">
                    <thead className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
                       <tr>
                          <th className="py-4">Component</th>
                          <th className="py-4 text-right">Amount (INR)</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {slip.deductions.map((d) => (
                         <tr key={d.name} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="py-4 text-sm font-medium text-slate-700">{d.name}</td>
                            <td className="py-4 text-right font-black text-slate-900 text-red-400">- {formatCurrency(d.amount)}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           <div className="h-px bg-slate-100 mx-8"></div>

           {/* Reimbursements */}
           <div className="group">
              <div className="w-full px-8 py-5 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gold/10 text-gold rounded-lg flex items-center justify-center">
                       <CreditCard size={16}/>
                    </div>
                    <span className="font-black text-slate-900 uppercase text-xs tracking-widest">Reimbursements</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-gold">Total: {formatCurrency(totalReimbursements)}</span>
                 </div>
              </div>
              <div className="px-8 pb-6">
                 <table className="w-full text-left">
                    <thead className="text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
                       <tr>
                          <th className="py-4">Claim Detail</th>
                          <th className="py-4 text-right">Amount (INR)</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {slip.reimbursements.length > 0 ? slip.reimbursements.map((r) => (
                         <tr key={r.name} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="py-4 text-sm font-medium text-slate-700">{r.name}</td>
                            <td className="py-4 text-right font-black text-slate-900">{formatCurrency(r.amount)}</td>
                         </tr>
                       )) : (
                         <tr>
                            <td className="py-8 text-center text-slate-400 text-xs italic" colSpan={2}>No reimbursements processed in this cycle.</td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* SUMMARY FOOTER MERGED INSIDE */}
           <div className="bg-blue-600 p-6 text-white shadow-2xl relative overflow-hidden flex items-center justify-between">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
              
              <div className="relative z-10 space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 opacity-80">Final Payout Amount</p>
                 <h2 className="text-4xl font-black tracking-tighter">{formatCurrency(slip.netPay)}</h2>
                 <p className="text-xs font-medium italic text-blue-100 opacity-60">({showValues ? slip.netPayWords : '•••••••••••••••••••••'})</p>
              </div>
           </div>

        </div>

      </div>
      )}

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-slate-800">Enter Password</h3>
                 <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
                    <div className="relative">
                        <input 
                           type="password" 
                           value={passwordInput}
                           onChange={(e) => setPasswordInput(e.target.value)}
                           className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                           placeholder="Enter 1234"
                           autoFocus
                        />
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    {passwordError && <p className="text-xs text-red-500 mt-2 font-medium">{passwordError}</p>}
                 </div>
                 
                 <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-100">
                    Unlock View
                 </button>
              </form>
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
