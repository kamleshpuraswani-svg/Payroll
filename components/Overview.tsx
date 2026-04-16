
import React, { useState } from 'react';
import {
  Download,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Wallet,
  FileText,
  PieChart as PieChartIcon,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building,
  Info,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  History,
  Pin,
  PinOff,
  Clock,
  Zap,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Lock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';

const COLORS = {
  netPay: '#3B82F6',
  pf: '#F59E0B',
  tax: '#EF4444',
  green: '#10B981',
  teal: '#0EA5E9',
  purple: '#8B5CF6',
  gray: '#94A3B8'
};

const trendData = [
  { month: 'Jul', net: 72000, pf: 4000, tax: 8000 },
  { month: 'Aug', net: 75000, pf: 4200, tax: 8500 },
  { month: 'Sep', net: 75000, pf: 4200, tax: 8500 },
  { month: 'Oct', net: 77000, pf: 4400, tax: 8800 },
  { month: 'Nov', net: 78000, pf: 4600, tax: 9000 },
  { month: 'Dec', net: 78200, pf: 4600, tax: 9200 },
];

const MOCK_LOANS = [
  {
    type: 'Personal Loan',
    outstanding: 45000,
    total: 100000,
    progress: 55,
    emisPaid: 6,
    totalEmis: 12,
    upcomingEmi: 8333,
    dueDate: '01 Jan 2026',
    status: 'Active'
  },
  {
    type: 'Home Renovation',
    outstanding: 245000,
    total: 500000,
    progress: 51,
    emisPaid: 24,
    totalEmis: 60,
    upcomingEmi: 12500,
    dueDate: '10 Feb 2026',
    status: 'Repaying'
  }
];

const recentActivities = [
  { id: 1, type: 'reimbursement', label: 'Fuel Reimbursement Approved', amount: '₹2,500', date: '2 hours ago', status: 'approved' },
  { id: 2, type: 'payout', label: 'December Salary Credited', amount: '₹78,200', date: 'Dec 7, 2025', status: 'credited' },
  { id: 3, type: 'tax', label: 'Form 12BB Submitted', date: 'Dec 5, 2025', status: 'signed' },
  { id: 4, type: 'reimbursement', label: 'Mobile Claim Action Required', date: 'Dec 4, 2025', status: 'pending' },
];

interface OverviewProps {
  onNavigateToTaxPlanning?: () => void;
  onNavigateToReimbursements?: () => void;
}

const Overview: React.FC<OverviewProps> = ({ onNavigateToTaxPlanning, onNavigateToReimbursements }) => {
  const [pinnedWidgets, setPinnedWidgets] = useState<string[]>(['payout', 'ytd', 'trends']);
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([]);
  const [showAmounts, setShowAmounts] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<'verified' | 'issue'>('verified');
  const [activeLoanIndex, setActiveLoanIndex] = useState(0);

  const currentLoan = MOCK_LOANS[activeLoanIndex];

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const togglePin = (id: string) => {
    setPinnedWidgets(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const hideWidget = (id: string) => {
    setHiddenWidgets(prev => [...prev, id]);
  };

  const handleToggleAmounts = () => {
    if (showAmounts) {
      setShowAmounts(false);
    } else {
      setIsPasswordModalOpen(true);
      setPasswordInput('');
      setPasswordError('');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1234') {
      setShowAmounts(true);
      setIsPasswordModalOpen(false);
    } else {
      setPasswordError('Incorrect password. Try 1234.');
    }
  };

  const handleDownloadSlip = () => {
    const content = `COLLABCRM SYSTEMS PVT LTD
Salary Slip for the month of December 2025

Employee Name: Priya Sharma
Employee ID: TF00123
Designation: Senior Engineer

EARNINGS              AMOUNT
----------------------------
Basic Salary       : ₹ 41,667
HRA                : ₹ 20,000
Special Allowance  : ₹ 15,000
Statutory Bonus    : ₹  5,000

DEDUCTIONS            AMOUNT
----------------------------
PF Contribution    : ₹  1,800
Professional Tax   : ₹    200
Income Tax (TDS)   : ₹  4,000

NET PAYABLE        : ₹ 78,200

(This is a computer generated document)`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Salary_Slip_Dec_2025.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-full mx-auto pb-10">

      {/* 2. Top row: Quick Insights & Tax Teaser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Latest Salary Card - Compact Redesign */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="inline-block px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-1">Dec 2025</span>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900">{showAmounts ? '₹78,200' : '₹ ••••••'}</h3>
                <button onClick={handleToggleAmounts} className="text-slate-300 hover:text-blue-600 transition-colors">
                  {showAmounts ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 size={10} className="text-emerald-500" /> Credited on 7th Dec
              </p>
            </div>
            <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText size={16} />
            </div>
          </div>
          <div className="mt-3">
            <button
              onClick={handleDownloadSlip}
              className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 transition-all uppercase tracking-wide shadow-lg shadow-indigo-100"
            >
              <Download size={12} /> Download Slip
            </button>
          </div>
        </div>

        {/* Tax Projection Teaser - Light Theme (Changed from Dark) */}
        <div className="lg:col-span-2 bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl shadow-sm relative overflow-hidden group cursor-pointer hover:bg-indigo-50 transition-all" onClick={onNavigateToTaxPlanning}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-indigo-500" />
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Est. Tax Saved</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleAmounts(); }}
                    className="p-1.5 rounded-lg text-indigo-300 hover:bg-indigo-100/50 hover:text-indigo-600 transition-all"
                    title={showAmounts ? "Hide amount" : "Show amount"}
                  >
                    {showAmounts ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <h4 className="text-2xl font-black text-indigo-950">{showAmounts ? '₹ 32,400' : '₹ ••••••'}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md uppercase">New Regime</span>
                  <p className="text-[10px] font-bold text-indigo-400 tracking-tight">Active for FY 25-26</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Next Payout - Compact Design */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center hover:border-blue-300 transition-all relative overflow-hidden">
          <div className="flex justify-between items-center">
            <div>
            <div className="flex justify-between items-start mb-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Payout In</p>
              <button
                onClick={handleToggleAmounts}
                className="p-1 rounded-lg text-slate-300 hover:bg-slate-50 hover:text-slate-600 transition-all"
                title={showAmounts ? "Hide payout" : "Show payout"}
              >
                {showAmounts ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-black text-slate-900">{showAmounts ? '5' : '•'}</h3>
              <span className="text-sm font-bold text-slate-500">{showAmounts ? 'Days' : '••••'}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-1">Salary Date: {showAmounts ? '7th January, 2026' : '•• ••••••••, ••••'}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Calendar size={20} />
            </div>
          </div>
        </div>

        {/* Loans & advances - Detailed Design */}
        <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <CreditCard size={20} />
              </div>
              <div>
                <div className="flex items-center justify-between w-full min-w-[220px]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{currentLoan.type}</p>
                  <div className="flex items-center gap-1 ml-4 bg-slate-50 border border-slate-100 rounded-lg px-2 py-0.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveLoanIndex(prev => Math.max(0, prev - 1)); }}
                      disabled={activeLoanIndex === 0}
                      className="text-slate-300 hover:text-emerald-600 disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft size={10} strokeWidth={3} />
                    </button>
                    <span className="text-[9px] font-black text-slate-600 min-w-[30px] text-center">
                      {(activeLoanIndex + 1).toString().padStart(2, '0')} / {MOCK_LOANS.length.toString().padStart(2, '0')}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveLoanIndex(prev => Math.min(MOCK_LOANS.length - 1, prev + 1)); }}
                      disabled={activeLoanIndex === MOCK_LOANS.length - 1}
                      className="text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight size={10} strokeWidth={3} />
                    </button>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleAmounts(); }}
                    className="p-1 rounded-lg text-slate-200 hover:bg-slate-50 hover:text-slate-400 transition-all ml-2"
                    title={showAmounts ? "Hide loans" : "Show loans"}
                  >
                    {showAmounts ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-xl font-black text-slate-900 leading-none">{showAmounts ? `₹ ${currentLoan.outstanding.toLocaleString()}` : '₹ •••••'}</h3>
                  <span className="text-[10px] font-bold text-slate-400">/ {showAmounts ? `₹ ${currentLoan.total.toLocaleString()}` : '₹ •••••'}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 uppercase tracking-widest">{currentLoan.status}</span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-400 uppercase tracking-wider">Repayment Progress</span>
                <span className="text-emerald-600">{currentLoan.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${currentLoan.progress}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              {/* EMIs */}
              <div className="p-2 bg-slate-50/50 border border-slate-100 rounded-lg">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">EMIs Paid</p>
                <p className="text-sm font-black text-slate-900">{currentLoan.emisPaid.toString().padStart(2, '0')} <span className="text-[10px] text-slate-400 font-bold">/ {currentLoan.totalEmis}</span></p>
              </div>

              {/* Next EMI */}
              <div className="p-2 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Upcoming EMI</p>
                <p className="text-sm font-black text-indigo-900">{showAmounts ? `₹ ${currentLoan.upcomingEmi.toLocaleString()}` : '••••'}</p>
                <p className="text-[9px] font-bold text-indigo-400 mt-0.5">Due: {currentLoan.dueDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle row: Activity, YTD, Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">



        {/* YTD Earnings - Redesigned (Simplified) */}
        {!hiddenWidgets.includes('ytd') && (
          <div className="lg:col-span-6 bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative group">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={16} /> Annual Realization
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleToggleAmounts}
                  className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-all"
                  title={showAmounts ? "Hide amounts" : "Show amounts"}
                >
                  {showAmounts ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <PinButton active={pinnedWidgets.includes('ytd')} onClick={() => togglePin('ytd')} />
              </div>
            </div>

            {/* Hero: Total CTC */}
            <div className="mb-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total CTC Realized</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                  {showAmounts ? '₹ 7,25,800' : '₹ ••••••'}
                </h2>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">FY 25-26</span>
              </div>
            </div>

            {/* Simplified Stats Grid */}
            <div className="grid grid-cols-1 gap-4">
              {/* Net Pay */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Net Take Home</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm font-black text-slate-900">{showAmounts ? '₹ 6.83L' : '••••'}</p>
                      <span className="text-[10px] font-bold text-slate-400">({showAmounts ? '₹ 56.9k/mo' : '••••/mo'})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PF */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-amber-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">PF Contribution</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm font-black text-slate-900">{showAmounts ? '₹ 9.2k' : '••••'}</p>
                      <span className="text-[10px] font-bold text-slate-400">({showAmounts ? '₹ 766/mo' : '••••/mo'})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-red-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Tax Deducted</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm font-black text-slate-900">{showAmounts ? '₹ 33.6k' : '••••'}</p>
                      <span className="text-[10px] font-bold text-slate-400">({showAmounts ? '₹ 2.8k/mo' : '••••/mo'})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trends Chart (Customizable/Hideable) - REDESIGNED */}
        {!hiddenWidgets.includes('trends') && (
          <div className="lg:col-span-6 bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col relative group h-full">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="text-slate-400"><PieChartIcon size={20} strokeWidth={2} /></div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Salary Trends</h3>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={handleToggleAmounts}
                  className="w-8 h-8 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-50 flex items-center justify-center transition-all"
                  title={showAmounts ? "Hide data" : "Show data"}
                >
                  {showAmounts ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() => togglePin('trends')}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${pinnedWidgets.includes('trends') ? 'bg-blue-50 text-blue-600' : 'text-slate-300 hover:bg-slate-50'}`}
                >
                  <Pin size={14} />
                </button>
                <button
                  onClick={() => hideWidget('trends')}
                  className="w-8 h-8 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-50 flex items-center justify-center transition-all"
                  title="Hide Widget"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                  <Bar dataKey="net" stackId="a" fill={COLORS.netPay} barSize={28} />
                  <Bar dataKey="pf" stackId="a" fill={COLORS.pf} barSize={28} />
                  <Bar dataKey="tax" stackId="a" fill={COLORS.tax} radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-8">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.netPay }}></div>
                <span className="text-xs font-bold text-slate-400 uppercase">NET</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.pf }}></div>
                <span className="text-xs font-bold text-slate-400 uppercase">PF</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.tax }}></div>
                <span className="text-xs font-bold text-slate-400 uppercase">TAX</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom row: Allowances, Payout Status (Quick Actions Removed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* My Allowances - Compact & No Progress Bar */}
        <div className="lg:col-span-12 bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Wallet size={16} /> Reimbursement Summary
            </h3>
            <button
              onClick={handleToggleAmounts}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-50 hover:text-slate-600 transition-all"
              title={showAmounts ? "Hide amounts" : "Show amounts"}
            >
              {showAmounts ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">

            <AllowanceItem label="Medical Reimbursement" utilized={5200} limit={15000} showAmounts={showAmounts} />
            <AllowanceItem label="Fuel & Conveyance" utilized={8000} limit={24000} showAmounts={showAmounts} />
            <AllowanceItem label="Books & Periodicals" utilized={0} limit={6000} disabled showAmounts={showAmounts} />
            <AllowanceItem label="LTA (Travel)" utilized={32000} limit={45000} showAmounts={showAmounts} />
          </div>
        </div>


      </div>

      {/* 5. Bottom banner */}
      <div className="bg-amber-50 border border-amber-200 p-10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white text-amber-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-amber-100">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black text-amber-900">Tax Deadline Approaching</h3>
            <p className="text-sm text-amber-700 mt-1 max-w-xl font-medium">
              The tax window for FY 2025-26 closes on <span className="font-black underline">January 20th</span>. Submit your declarations now to avoid higher TDS in Jan-March payouts.
            </p>
          </div>
        </div>
        <button onClick={onNavigateToTaxPlanning} className="bg-blue-600 hover:bg-blue-700 text-white px-10 h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all whitespace-nowrap">
          Open Tax Planner
        </button>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800">Enter Password</h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
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

/* --- Internal Helpers --- */

const AllowanceItem = ({ label, utilized, limit, disabled, showAmounts }: any) => {
  return (
    <div className={`px-3 py-2.5 rounded-2xl border ${disabled ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 hover:border-blue-200 transition-all group'}`}>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate" title={label}>{label}</p>
      <div className="flex justify-between items-baseline mt-0.5">
        <span className="text-base font-black text-slate-900">{showAmounts ? `₹${utilized.toLocaleString()}` : '••••'}</span>
        <span className="text-[9px] font-bold text-slate-400 tracking-tighter">{showAmounts ? `/ ₹${limit.toLocaleString()}` : '/ •••'}</span>
      </div>
    </div>
  );
};

const PinButton = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${active ? 'text-blue-600 bg-blue-50' : 'text-slate-300 hover:bg-slate-100'}`}
    title={active ? "Unpin widget" : "Pin widget to top"}
  >
    {active ? <Pin size={12} /> : <PinOff size={12} />}
  </button>
);

export default Overview;
