
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
import { SalarySlipsModule } from './SalarySlips';

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
  { name: 'Basic & Fixed', value: 980000, color: '#3B82F6' },
  { name: 'Benefits (FBP)', value: 124000, color: '#F59E0B' },
  { name: 'Statutory', value: 96000, color: '#8B5CF6' },
];

export const SalaryBreakdownModule: React.FC = () => {
  // Visibility State
  const [showValues, setShowValues] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSalaryBreakupOpen, setIsSalaryBreakupOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState('v1');

  // Date State
  const [effectiveDate, setEffectiveDate] = useState('July 2025 (Current)');

  // Version History data for the breakup panel
  const VERSIONS = [
    { id: 'v1', date: '01 Mar 2026', label: 'Original salary structure', multiplier: 1, isCurrent: true },
    { id: 'v2', date: '01 Jul 2024', label: 'Revised salary structure', multiplier: 0.90, isCurrent: false },
    { id: 'v3', date: '01 May 2023', label: 'Original salary structure', multiplier: 0.80, isCurrent: false },
  ];

  const selectedVersion = VERSIONS.find(v => v.id === selectedVersionId) || VERSIONS[0];
  const panelMultiplier = selectedVersion.multiplier;

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

  // Panel-specific data (changes with selected version)
  const panelSalary = BASE_SALARY_STRUCTURE.map(item => ({
    ...item,
    monthly: Math.round(item.monthly * panelMultiplier),
    annual: Math.round(item.annual * panelMultiplier),
  }));
  const panelDeductions = BASE_DEDUCTIONS.map(item => ({
    ...item,
    monthly: Math.round(item.monthly * panelMultiplier),
    annual: Math.round(item.annual * panelMultiplier),
  }));
  const panelTotalCTC = Math.round(BASE_DONUT_DATA.reduce((s, i) => s + i.value, 0) * panelMultiplier);

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
      link.download = `Salary_Slip_Breakdown_${effectiveDate.split(' ')[0]}_${effectiveDate.split(' ')[1]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3 h-full animate-fade-in pb-10">

      {/* Module Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {/* Top row: title + actions */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Salary structure</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm text-slate-500">Effective March 2026</p>
              <span className="bg-teal-400 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">Current</span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">New regime · HDFC ****8901</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSalaryBreakupOpen(true)} className="text-sm text-blue-600 hover:text-blue-700 underline underline-offset-2 decoration-blue-400 hover:decoration-blue-600 font-medium transition-colors cursor-pointer">View Salary Breakup</button>
            <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100">UAN Active</span>
            <button
              onClick={handleToggleVisibility}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-all border border-slate-100"
              title={showValues ? "Hide amounts" : "Show amounts"}
            >
              {showValues ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
        </div>

        {/* CTC Breakdown Bar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Annual CTC Breakdown</span>
            <span className="text-2xl font-black text-slate-900">
              {showValues ? `₹${totalCTC.toLocaleString()}` : '₹ ••••••'}
            </span>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-3">
            {donutData.map((d) => (
              <div key={d.name} style={{ width: `${(d.value / totalCTC) * 100}%`, backgroundColor: d.color }} />
            ))}
          </div>
          <div className="flex items-center gap-6">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-slate-600">
                  {d.name} {showValues ? `₹${(d.value / 100000).toFixed(1)}L` : '••••'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Salary Slips Section */}
      <div>
        <SalarySlipsModule />
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

      {/* Salary Breakup Side Panel */}
      {isSalaryBreakupOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setIsSalaryBreakupOpen(false)} />

          {/* Drawer */}
          <div className="relative w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Salary Breakup for INR {(panelTotalCTC / 100000).toFixed(0)},00,000</h2>
              <button onClick={() => setIsSalaryBreakupOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Body — two columns */}
            <div className="flex flex-1 overflow-hidden">

            {/* Left: breakup tables */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 border-r border-slate-100">

              {/* Earnings Table */}
              <div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest py-2">Earnings</th>
                      <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest py-2">Monthly</th>
                      <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest py-2">Annually</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {panelSalary.map((item) => (
                      <tr key={item.name}>
                        <td className="py-3 text-slate-700">{item.name}</td>
                        <td className="py-3 text-right text-slate-800 font-medium">INR {item.monthly.toLocaleString()}</td>
                        <td className="py-3 text-right text-slate-800 font-medium">INR {item.annual.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-slate-200 bg-slate-50/60">
                      <td className="py-3 font-bold text-slate-900">Total Earnings</td>
                      <td className="py-3 text-right font-bold text-slate-900">INR {panelSalary.reduce((s, i) => s + i.monthly, 0).toLocaleString()}</td>
                      <td className="py-3 text-right font-bold text-slate-900">INR {panelSalary.reduce((s, i) => s + i.annual, 0).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Deductions Table */}
              <div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-[10px] font-black text-slate-500 uppercase tracking-widest py-2">Deductions</th>
                      <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest py-2">Monthly</th>
                      <th className="text-right text-[10px] font-black text-slate-500 uppercase tracking-widest py-2">Annually</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {panelDeductions.map((item) => (
                      <tr key={item.name}>
                        <td className="py-3 text-slate-700">{item.name}</td>
                        <td className="py-3 text-right text-slate-800 font-medium">INR {item.monthly.toLocaleString()}</td>
                        <td className="py-3 text-right text-slate-800 font-medium">INR {item.annual.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-slate-200 bg-slate-50/60">
                      <td className="py-3 font-bold text-slate-900">Total Deductions</td>
                      <td className="py-3 text-right font-bold text-slate-900">INR {panelDeductions.reduce((s, i) => s + i.monthly, 0).toLocaleString()}</td>
                      <td className="py-3 text-right font-bold text-slate-900">INR {panelDeductions.reduce((s, i) => s + i.annual, 0).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Net Pay */}
              <div className="border-t-2 border-slate-200 pt-4">
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-2 font-black text-slate-900 text-base">NET PAY</td>
                      <td className="py-2 text-right font-black text-slate-900">
                        INR {(panelSalary.reduce((s, i) => s + i.monthly, 0) - panelDeductions.reduce((s, i) => s + i.monthly, 0)).toLocaleString()}
                      </td>
                      <td className="py-2 text-right font-black text-slate-900">
                        INR {(panelSalary.reduce((s, i) => s + i.annual, 0) - panelDeductions.reduce((s, i) => s + i.annual, 0)).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Note */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Note</p>
                <p className="text-xs text-slate-500">• NOTE: Net Pay above does not include Taxes or Other deductions (if any).</p>
              </div>

            </div>

            {/* Right: Version History */}
            <div className="w-56 shrink-0 px-5 py-6 bg-slate-50/60 overflow-y-auto">
              <h3 className="text-sm font-bold text-slate-800 mb-1">Version History</h3>
              <p className="text-xs text-slate-400 mb-5">View previous versions of salary structures</p>

              <div className="space-y-3">
                {VERSIONS.map((v) => {
                  const isSelected = selectedVersionId === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVersionId(v.id)}
                      className={`w-full text-left rounded-xl p-3 border transition-all ${
                        isSelected
                          ? 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-100'
                          : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-700 mb-2">{v.date}</p>
                      {v.isCurrent && (
                        <span className="bg-teal-400 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Current Version</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            </div>{/* end body two-col */}
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
