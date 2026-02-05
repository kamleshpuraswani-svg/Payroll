
import React, { useState } from 'react';
import { 
  FileText, 
  TrendingUp, 
  Wallet, 
  Calculator, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  PieChart as PieChartIcon, 
  ExternalLink,
  AlertTriangle,
  Layers,
  Landmark,
  UserCheck,
  Building,
  Download,
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  X
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// --- Constants & Types ---
const COLORS = {
  blue: '#3B82F6',
  teal: '#0EA5E9',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  purple: '#8B5CF6',
  slate: '#64748b',
  bg: '#F0F9FF'
};

const BASE_SALARY_STRUCTURE = [
  { name: 'Basic Salary', type: 'Fixed', monthly: 41667, annual: 500000, color: COLORS.green },
  { name: 'House Rent Allowance (HRA)', type: 'Fixed', monthly: 20000, annual: 240000, color: COLORS.teal },
  { name: 'Special Allowance', type: 'Fixed', monthly: 15000, annual: 180000, color: COLORS.purple },
  { name: 'Statutory Bonus', type: 'Fixed', monthly: 5000, annual: 60000, color: COLORS.blue },
];

const BASE_CONTRIBUTIONS = [
  { name: 'Employer PF Contribution', monthly: 6000, annual: 72000 },
  { name: 'Gratuity Provision', monthly: 2000, annual: 24000 },
];

const BASE_DEDUCTIONS = [
  { name: 'Professional Tax', monthly: 200, annual: 2400 },
  { name: 'Employee PF Contribution', monthly: 6000, annual: 72000 },
];

const BASE_DONUT_DATA = [
  { name: 'Basic & Fixed', value: 980000, color: COLORS.green },
  { name: 'Benefits (FBP)', value: 124000, color: COLORS.amber },
  { name: 'Statutory', value: 96000, color: COLORS.blue },
];

export const SalaryBreakdownModule: React.FC = () => {
  // Visibility State
  const [showValues, setShowValues] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Date State
  const [effectiveDate, setEffectiveDate] = useState('July 2025 (Current)');

  // Logic to scale values based on date
  const getMultiplier = () => {
    if (effectiveDate.includes('2025')) return 1;
    if (effectiveDate.includes('2024')) return 0.90; // 10% less
    if (effectiveDate.includes('2023')) return 0.80; // 20% less
    return 1;
  };

  const multiplier = getMultiplier();

  const salaryStructure = BASE_SALARY_STRUCTURE.map(item => ({
    ...item,
    monthly: Math.round(item.monthly * multiplier),
    annual: Math.round(item.annual * multiplier)
  }));

  const contributions = BASE_CONTRIBUTIONS.map(item => ({
    ...item,
    monthly: Math.round(item.monthly * multiplier),
    annual: Math.round(item.annual * multiplier)
  }));

  const deductions = BASE_DEDUCTIONS.map(item => ({
    ...item,
    monthly: Math.round(item.monthly * multiplier),
    annual: Math.round(item.annual * multiplier)
  }));

  const donutData = BASE_DONUT_DATA.map(item => ({
    ...item,
    value: Math.round(item.value * multiplier)
  }));
  
  const totalCTC = donutData.reduce((acc, curr) => acc + curr.value, 0);

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

  const maskValue = (val: number) => showValues ? `₹${val.toLocaleString()}` : '₹ ••••••';

  const handleDownloadPDF = () => {
      const content = `
      COLLABCRM SYSTEMS PVT LTD - SALARY BREAKDOWN
      Effective Date: ${effectiveDate}
      
      (A) PAYMENT & STATUTORY DETAILS
      --------------------------------------------------
      Payment Mode: Online Transfer
      Bank: HDFC Bank (**** 8901)
      Tax Regime: NEW REGIME (Default)
      
      (B) GROSS BENEFITS (EARNINGS)
      --------------------------------------------------
      ${salaryStructure.map(i => `${i.name.padEnd(30)} : ₹ ${i.monthly.toLocaleString()}/mo  |  ₹ ${i.annual.toLocaleString()}/yr`).join('\n      ')}
      
      TOTAL GROSS: ₹ ${salaryStructure.reduce((s,i) => s+i.monthly, 0).toLocaleString()} / month
      
      (C) CONTRIBUTIONS
      --------------------------------------------------
      ${contributions.map(i => `${i.name.padEnd(30)} : ₹ ${i.monthly.toLocaleString()}/mo`).join('\n      ')}
      
      (D) DEDUCTIONS
      --------------------------------------------------
      ${deductions.map(i => `${i.name.padEnd(30)} : ₹ ${i.monthly.toLocaleString()}/mo`).join('\n      ')}
      
      TOTAL CTC: ₹ ${totalCTC.toLocaleString()}
      `;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Salary_Breakdown_${effectiveDate.split(' ')[0]}_${effectiveDate.split(' ')[1]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-12 gap-8 h-full animate-fade-in max-w-[1400px] mx-auto pb-10">
      
      {/* LEFT & CENTER WORKSPACE */}
      <div className="col-span-12 lg:col-span-9 space-y-6">
        
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
           <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Salary Structure</h2>
              <p className="text-sm text-slate-500 font-medium">Detailed breakdown of your Cost to Company (CTC).</p>
           </div>
           <div className="flex items-center gap-3">
              <button 
                onClick={handleToggleVisibility}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-all border border-slate-100"
                title={showValues ? "Hide amounts" : "Show amounts"}
              >
                {showValues ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>

              <div className="flex flex-col items-end">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Effective Date</label>
                 <select 
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 outline-none cursor-pointer"
                 >
                    <option>July 2025 (Current)</option>
                    <option>July 2024</option>
                    <option>May 2023</option>
                 </select>
              </div>
              <button 
                onClick={handleDownloadPDF}
                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all border border-blue-100"
                title="Download PDF"
              >
                 <Download size={18}/>
              </button>
           </div>
        </div>

        {/* UNIFIED CONTAINER */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 space-y-10">
          
          {/* Section A: Payment Details */}
          <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Landmark size={16} />
                  </div>
                  (A) Payment & Statutory Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-2 px-2">
                <InfoGroup label="Salary Payment Mode" value="Online Transfer" icon={<CreditCard size={14} className="text-blue-500"/>} />
                <InfoGroup label="Bank Name" value="HDFC Bank (**** 8901)" />
                <InfoGroup label="Tax Regime" value="NEW REGIME (Default)" highlight />
                
                <div className="col-span-1 md:col-span-3 h-px bg-slate-50"></div>
                
                <InfoGroup label="Aadhaar Linked" value="YES" icon={<UserCheck size={14} className="text-emerald-500"/>} />
                <InfoGroup label="PAN Linked" value="YES" />
                <InfoGroup label="UAN Status" value="ACTIVE (102199****)" />
             </div>
          </div>

          <div className="h-px bg-slate-100"></div>

          {/* Section B: Gross Benefits */}
          <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <TrendingUp size={16} />
                  </div>
                  (B) Gross Benefits (Earnings)
              </h3>
              <div className="overflow-hidden rounded-2xl border border-slate-100">
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <tr>
                        <th className="px-6 py-4">Component Name</th>
                        <th className="px-6 py-4">Nature</th>
                        <th className="px-6 py-4 text-right">Monthly (₹)</th>
                        <th className="px-6 py-4 text-right">Annual (₹)</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                     {salaryStructure.map((item) => (
                        <tr key={item.name} className="hover:bg-blue-50/20 transition-colors group">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                 {item.name}
                                 <TooltipTrigger content={`${item.name} is part of your fixed monthly payout.`} />
                              </div>
                           </td>
                           <td className="px-6 py-4 text-xs font-black uppercase text-slate-400">{item.type}</td>
                           <td className="px-6 py-4 text-right font-black">{maskValue(item.monthly)}</td>
                           <td className="px-6 py-4 text-right font-black">{maskValue(item.annual)}</td>
                        </tr>
                     ))}
                  </tbody>
                  <tfoot className="bg-emerald-50 text-emerald-900 border-t-2 border-emerald-100">
                     <tr className="font-black">
                        <td className="px-6 py-5" colSpan={2}>Total Gross Benefits</td>
                        <td className="px-6 py-5 text-right">{maskValue(salaryStructure.reduce((s,i) => s+i.monthly, 0))}</td>
                        <td className="px-6 py-5 text-right">{maskValue(salaryStructure.reduce((s,i) => s+i.annual, 0))}</td>
                     </tr>
                  </tfoot>
               </table>
             </div>
          </div>

          <div className="h-px bg-slate-100"></div>

          {/* Section C: Contributions & Retirals */}
          <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Building size={16} />
                  </div>
                  (C) Contributions / Retirals
              </h3>
              <div className="overflow-hidden rounded-2xl border border-slate-100">
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <tr>
                        <th className="px-6 py-4">Component Name</th>
                        <th className="px-6 py-4 text-right">Monthly (₹)</th>
                        <th className="px-6 py-4 text-right">Annual (₹)</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                     {contributions.map((item) => (
                        <tr key={item.name} className="hover:bg-blue-50/20 transition-colors group">
                           <td className="px-6 py-4 flex items-center gap-2">
                              {item.name}
                              <TooltipTrigger content={`Employer contribution to your ${item.name.includes('PF') ? 'Provident Fund' : 'Gratuity Fund'}.`} />
                           </td>
                           <td className="px-6 py-4 text-right font-black">{maskValue(item.monthly)}</td>
                           <td className="px-6 py-4 text-right font-black">{maskValue(item.annual)}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
             </div>
          </div>

          <div className="h-px bg-slate-100"></div>

          {/* Section D: Deductions */}
          <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <TrendingUp className="rotate-180" size={16} />
                  </div>
                  (D) Recurring Deductions
              </h3>
              <div className="overflow-hidden rounded-2xl border border-slate-100">
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <tr>
                        <th className="px-6 py-4">Component Name</th>
                        <th className="px-6 py-4 text-right">Monthly (₹)</th>
                        <th className="px-6 py-4 text-right">Annual (₹)</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                     {deductions.map((item) => (
                        <tr key={item.name} className="hover:bg-blue-50/20 transition-colors group">
                           <td className="px-6 py-4">{item.name}</td>
                           <td className="px-6 py-4 text-right font-black text-red-500">- {maskValue(item.monthly)}</td>
                           <td className="px-6 py-4 text-right font-black text-red-500">- {maskValue(item.annual)}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
             </div>
          </div>

        </div>
        {/* Nudge Banner Removed as requested */}
      </div>

      {/* RIGHT SIDEBAR (25%) */}
      <div className="col-span-12 lg:col-span-3 space-y-6">
        
        {/* CTC Summary Card */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col items-center sticky top-24">
           <h3 className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Annual CTC Composition</h3>
           <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                       {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => showValues ? `₹${value.toLocaleString()}` : '₹ ••••••'}
                    />
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-[10px] font-bold text-slate-400 uppercase">Annual</span>
                 <span className="text-xl font-black text-slate-900 leading-tight">
                    {showValues ? `₹ ${(totalCTC/100000).toFixed(1)}L` : '•••••'}
                 </span>
              </div>
           </div>
           <div className="w-full mt-6 space-y-3">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                      <span className="text-xs font-bold text-slate-600">{d.name}</span>
                   </div>
                   <span className="text-xs font-black text-slate-900">
                     {showValues ? `₹${(d.value/100000).toFixed(1)}L` : '••••'}
                   </span>
                </div>
              ))}
           </div>
        </div>

      </div>

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

/* --- Visual Atom Components --- */

const InfoGroup = ({ label, value, icon, highlight }: any) => (
  <div className="space-y-1">
     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
        {icon} {label}
     </label>
     <p className={`text-sm font-black ${highlight ? 'text-blue-600' : 'text-slate-800'}`}>{value}</p>
  </div>
);

const TooltipTrigger = ({ content }: { content: string }) => (
  <div className="group relative">
     <Info size={12} className="text-slate-300 cursor-help hover:text-blue-400 transition-colors" />
     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
     </div>
  </div>
);

export default SalaryBreakdownModule;
