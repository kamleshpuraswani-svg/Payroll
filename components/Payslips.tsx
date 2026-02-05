
import React, { useState } from 'react';
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

const MOCK_PAYSLIPS: Record<string, PayslipData> = {
  'Nov 2025': {
    month: 'Nov',
    year: '2025',
    creditedDate: '30th Nov 2025',
    netPay: 44000,
    netPayWords: 'Rupees Forty Four Thousand Only',
    trend: 'up',
    totalWorkingDays: 30,
    processedDays: 30,
    earnings: [
      { name: 'Basic Salary', amount: 25000 },
      { name: 'House Rent Allowance (HRA)', amount: 12500 },
      { name: 'Special Allowance', amount: 12500 },
      { name: 'Statutory Bonus', amount: 8000 },
    ],
    deductions: [
      { name: 'Provident Fund (PF)', amount: 1800 },
      { name: 'Professional Tax', amount: 200 },
      { name: 'Income Tax (TDS)', amount: 4000 },
    ],
    reimbursements: [
      { name: 'Fuel Reimbursement', amount: 2500 },
      { name: 'Medical Reimbursement', amount: 1200 },
      { name: 'Broadband Reimbursement', amount: 1500 },
    ],
    taxDonut: [
      { name: 'Income Tax', value: 4000, color: COLORS.red },
      { name: 'PF', value: 1800, color: COLORS.amber },
      { name: 'Net Salary', value: 44000, color: COLORS.blue },
    ]
  },
  'Oct 2025': {
    month: 'Oct',
    year: '2025',
    creditedDate: '31st Oct 2025',
    netPay: 44000,
    netPayWords: 'Rupees Forty Four Thousand Only',
    trend: 'flat',
    totalWorkingDays: 31,
    processedDays: 31,
    earnings: [
      { name: 'Basic Salary', amount: 25000 },
      { name: 'House Rent Allowance (HRA)', amount: 12500 },
      { name: 'Special Allowance', amount: 12500 },
    ],
    deductions: [
      { name: 'Provident Fund (PF)', amount: 1800 },
      { name: 'Professional Tax', amount: 200 },
      { name: 'Income Tax (TDS)', amount: 4000 },
    ],
    reimbursements: [],
    taxDonut: []
  },
  'Sep 2025': {
    month: 'Sep',
    year: '2025',
    creditedDate: '30th Sep 2025',
    netPay: 42500,
    netPayWords: 'Rupees Forty Two Thousand Five Hundred Only',
    trend: 'down',
    totalWorkingDays: 30,
    processedDays: 28,
    earnings: [
      { name: 'Basic Salary', amount: 25000 },
      { name: 'House Rent Allowance (HRA)', amount: 12500 },
      { name: 'Special Allowance', amount: 11000 },
    ],
    deductions: [
      { name: 'Provident Fund (PF)', amount: 1800 },
      { name: 'Professional Tax', amount: 200 },
      { name: 'Income Tax (TDS)', amount: 4000 },
    ],
    reimbursements: [],
    taxDonut: []
  },
  'Dec 2024': {
    month: 'Dec',
    year: '2024',
    creditedDate: '31st Dec 2024',
    netPay: 42000,
    netPayWords: 'Rupees Forty Two Thousand Only',
    trend: 'flat',
    totalWorkingDays: 31,
    processedDays: 31,
    earnings: [
      { name: 'Basic Salary', amount: 24000 },
      { name: 'House Rent Allowance (HRA)', amount: 12000 },
      { name: 'Special Allowance', amount: 11000 },
    ],
    deductions: [
      { name: 'Provident Fund (PF)', amount: 1800 },
      { name: 'Professional Tax', amount: 200 },
      { name: 'Income Tax (TDS)', amount: 3000 },
    ],
    reimbursements: [],
    taxDonut: []
  },
  'Nov 2024': {
    month: 'Nov',
    year: '2024',
    creditedDate: '30th Nov 2024',
    netPay: 42000,
    netPayWords: 'Rupees Forty Two Thousand Only',
    trend: 'flat',
    totalWorkingDays: 30,
    processedDays: 30,
    earnings: [
      { name: 'Basic Salary', amount: 24000 },
      { name: 'House Rent Allowance (HRA)', amount: 12000 },
      { name: 'Special Allowance', amount: 11000 },
    ],
    deductions: [
      { name: 'Provident Fund (PF)', amount: 1800 },
      { name: 'Professional Tax', amount: 200 },
      { name: 'Income Tax (TDS)', amount: 3000 },
    ],
    reimbursements: [],
    taxDonut: []
  },
  'Oct 2024': {
    month: 'Oct',
    year: '2024',
    creditedDate: '31st Oct 2024',
    netPay: 43500,
    netPayWords: 'Rupees Forty Three Thousand Five Hundred Only',
    trend: 'up',
    totalWorkingDays: 31,
    processedDays: 31,
    earnings: [
      { name: 'Basic Salary', amount: 24000 },
      { name: 'House Rent Allowance (HRA)', amount: 12000 },
      { name: 'Special Allowance', amount: 11000 },
      { name: 'Diwali Bonus', amount: 1500 },
    ],
    deductions: [
      { name: 'Provident Fund (PF)', amount: 1800 },
      { name: 'Professional Tax', amount: 200 },
      { name: 'Income Tax (TDS)', amount: 3000 },
    ],
    reimbursements: [],
    taxDonut: []
  },
  'Sep 2024': {
    month: 'Sep',
    year: '2024',
    creditedDate: '30th Sep 2024',
    netPay: 41000,
    netPayWords: 'Rupees Forty One Thousand Only',
    trend: 'down',
    totalWorkingDays: 30,
    processedDays: 29,
    earnings: [
      { name: 'Basic Salary', amount: 24000 },
      { name: 'House Rent Allowance (HRA)', amount: 12000 },
      { name: 'Special Allowance', amount: 10000 },
    ],
    deductions: [
      { name: 'Provident Fund (PF)', amount: 1800 },
      { name: 'Professional Tax', amount: 200 },
      { name: 'Income Tax (TDS)', amount: 3000 },
    ],
    reimbursements: [],
    taxDonut: []
  },
  'Aug 2024': {
    month: 'Aug',
    year: '2024',
    creditedDate: '31st Aug 2024',
    netPay: 42000,
    netPayWords: 'Rupees Forty Two Thousand Only',
    trend: 'flat',
    totalWorkingDays: 31,
    processedDays: 31,
    earnings: [
      { name: 'Basic Salary', amount: 24000 },
      { name: 'House Rent Allowance (HRA)', amount: 12000 },
      { name: 'Special Allowance', amount: 11000 },
    ],
    deductions: [
      { name: 'Provident Fund (PF)', amount: 1800 },
      { name: 'Professional Tax', amount: 200 },
      { name: 'Income Tax (TDS)', amount: 3000 },
    ],
    reimbursements: [],
    taxDonut: []
  },
  'Jul 2024': {
    month: 'Jul',
    year: '2024',
    creditedDate: '31st Jul 2024',
    netPay: 42000,
    netPayWords: 'Rupees Forty Two Thousand Only',
    trend: 'flat',
    totalWorkingDays: 31,
    processedDays: 31,
    earnings: [
      { name: 'Basic Salary', amount: 24000 },
      { name: 'House Rent Allowance (HRA)', amount: 12000 },
      { name: 'Special Allowance', amount: 11000 },
    ],
    deductions: [
      { name: 'Provident Fund (PF)', amount: 1800 },
      { name: 'Professional Tax', amount: 200 },
      { name: 'Income Tax (TDS)', amount: 3000 },
    ],
    reimbursements: [],
    taxDonut: []
  }
};

const MONTH_ORDER = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const PayslipsModule: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [activeMonth, setActiveMonth] = useState('Nov 2025');
  const [showValues, setShowValues] = useState(false);
  
  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const slip = MOCK_PAYSLIPS[activeMonth];
  const totalEarnings = slip ? slip.earnings.reduce((s, i) => s + i.amount, 0) : 0;
  const totalDeductions = slip ? slip.deductions.reduce((s, i) => s + i.amount, 0) : 0;
  const totalReimbursements = slip ? slip.reimbursements.reduce((s, i) => s + i.amount, 0) : 0;
  
  const lopDays = slip ? slip.totalWorkingDays - slip.processedDays : 0;

  const availableMonths = Object.keys(MOCK_PAYSLIPS)
    .filter(key => key.includes(selectedYear))
    .sort((a, b) => {
       const monthA = a.split(' ')[0];
       const monthB = b.split(' ')[0];
       return MONTH_ORDER.indexOf(monthB) - MONTH_ORDER.indexOf(monthA);
    });

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = e.target.value;
    setSelectedYear(newYear);
    // Automatically switch to the latest available month in the new year
    const latestMonthInYear = Object.keys(MOCK_PAYSLIPS)
      .filter(key => key.includes(newYear))
      .sort((a, b) => {
        const monthA = a.split(' ')[0];
        const monthB = b.split(' ')[0];
        return MONTH_ORDER.indexOf(monthB) - MONTH_ORDER.indexOf(monthA);
      })[0];
      
    if (latestMonthInYear) {
      setActiveMonth(latestMonthInYear);
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
    <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-300 max-w-[1400px] mx-auto pb-10">
      
      {/* LEFT: INTERACTIVE TIMELINE */}
      <div className="col-span-3 space-y-6">
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-6">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline</h3>
             <select 
               value={selectedYear}
               onChange={handleYearChange}
               className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none cursor-pointer"
             >
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
                    <p className="text-[10px] text-slate-400 font-medium">Credited {MOCK_PAYSLIPS[m]?.creditedDate || 'N/A'}</p>
                  </div>

                  <div className="text-right flex flex-col items-end">
                     <p className={`text-sm font-black ${activeMonth === m ? 'text-purple-900' : 'text-slate-800'}`}>
                        {MOCK_PAYSLIPS[m] ? formatCurrency(MOCK_PAYSLIPS[m].netPay) : '--'}
                     </p>
                     {MOCK_PAYSLIPS[m] && (
                        <span className={`text-[10px] font-black uppercase flex items-center gap-0.5 ${MOCK_PAYSLIPS[m].trend === 'up' ? 'text-emerald-500' : MOCK_PAYSLIPS[m].trend === 'down' ? 'text-red-400' : 'text-slate-300'}`}>
                           {MOCK_PAYSLIPS[m].trend === 'up' && <TrendingUp size={10}/>}
                           {MOCK_PAYSLIPS[m].trend === 'down' && <TrendingDown size={10}/>}
                           {MOCK_PAYSLIPS[m].trend === 'up' ? 'PAID' : MOCK_PAYSLIPS[m].trend === 'flat' ? 'PAID' : 'PAID'}
                        </span>
                     )}
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
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
           
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
                    <p className="text-[10px] text-slate-400 font-bold">Standard Payroll Cycle</p>
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
        <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
           
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
                    <span className="font-black text-slate-900 uppercase text-xs tracking-widest">Reimbursements (Non-Taxable)</span>
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
                            <td className="py-4 text-sm font-medium text-slate-700 flex items-center gap-2">
                               {r.name}
                               <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black uppercase">Verified</span>
                            </td>
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

export default PayslipsModule;
