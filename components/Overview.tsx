
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
  const [showYtd, setShowYtd] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<'verified' | 'issue'>('verified');

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

  const handleToggleYtd = () => {
    if (showYtd) {
      setShowYtd(false);
    } else {
      setIsPasswordModalOpen(true);
      setPasswordInput('');
      setPasswordError('');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1234') {
      setShowYtd(true);
      setIsPasswordModalOpen(false);
    } else {
      setPasswordError('Incorrect password. Try 1234.');
    }
  };

  const handleDownloadSlip = () => {
    const content = `COLLABCRM SYSTEMS PVT LTD
Payslip for the month of December 2025

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
    link.download = 'Payslip_Dec_2025.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-10">
      
      {/* 2. Top row: Quick Insights & Tax Teaser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Latest Salary Card - Compact Redesign */}
        <div className="lg:col-span-2 bg-white p-4 rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all relative overflow-hidden">
          <div className="flex justify-between items-start">
             <div>
                <span className="inline-block px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-1">Dec 2025</span>
                <h3 className="text-xl font-black text-slate-900">₹78,200</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                   <CheckCircle2 size={10} className="text-emerald-500"/> Credited on 7th Dec
                </p>
             </div>
             <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText size={16}/>
             </div>
          </div>
          <div className="mt-3">
             <button 
               onClick={handleDownloadSlip}
               className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 transition-all uppercase tracking-wide shadow-lg shadow-indigo-100"
             >
                <Download size={12}/> Download Slip
             </button>
          </div>
        </div>

        {/* Tax Projection Teaser - Light Theme (Changed from Dark) */}
        <div className="lg:col-span-2 bg-indigo-50/50 border border-indigo-100 p-4 rounded-[32px] shadow-sm relative overflow-hidden group cursor-pointer hover:bg-indigo-50 transition-all" onClick={onNavigateToTaxPlanning}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-2 mb-2">
                     <Zap size={14} className="text-indigo-500" />
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Est. Tax Saved YTD</p>
                  </div>
                  <h4 className="text-2xl font-black text-indigo-950">₹ 32,400</h4>
                  <p className="text-[10px] font-bold text-indigo-400 mt-1">New Regime Vs Old Regime</p>
               </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
               <span className="text-[10px] font-bold text-indigo-700 group-hover:underline">View Tax Planning</span>
               <ArrowRight size={12} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Next Payout - Compact Design */}
        <div className="lg:col-span-2 bg-white p-4 rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-center hover:border-blue-300 transition-all relative overflow-hidden">
           <div className="flex justify-between items-center">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Next Payout In</p>
                 <div className="flex items-baseline gap-1">
                    <h3 className="text-3xl font-black text-slate-900">5</h3>
                    <span className="text-sm font-bold text-slate-500">Days</span>
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 mt-1">Salary Date: 7th January, 2026</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                 <Calendar size={20}/>
              </div>
           </div>
        </div>
      </div>

      {/* 3. Middle row: Activity, YTD, Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        
        {/* Recent Activity Feed (New) */}
        {!hiddenWidgets.includes('activity') && (
          <div className="lg:col-span-4 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm group relative">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <History size={16}/> Recent Activity
              </h3>
              <div className="flex gap-1">
                 <PinButton active={pinnedWidgets.includes('activity')} onClick={() => togglePin('activity')} />
              </div>
            </div>
            <div className="space-y-6">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex gap-4 group/item">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover/item:scale-105 ${
                      act.type === 'reimbursement' ? 'bg-teal-50 text-teal-600' : 
                      act.type === 'payout' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {act.type === 'reimbursement' ? <Wallet size={18}/> : act.type === 'payout' ? <CreditCard size={18}/> : <FileText size={18}/>}
                    </div>
                    {act.id !== recentActivities.length && (
                      <div className="absolute top-10 bottom-0 left-1/2 -translate-x-1/2 w-px bg-slate-100 h-6"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-black text-slate-800 leading-tight">{act.label}</p>
                      {act.amount && <span className="text-xs font-black text-slate-900">{act.amount}</span>}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{act.date} • <span className={
                      act.status === 'approved' || act.status === 'credited' ? 'text-emerald-500' : 
                      act.status === 'pending' ? 'text-amber-500' : 'text-blue-500'
                    }>{act.status}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* YTD Earnings - Redesigned (Simplified) */}
        {!hiddenWidgets.includes('ytd') && (
          <div className="lg:col-span-4 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative group">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={16}/> Annual Realization (YTD)
              </h3>
              <div className="flex items-center gap-1">
                <button 
                   onClick={handleToggleYtd}
                   className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-all"
                   title={showYtd ? "Hide amounts" : "Show amounts"}
                 >
                    {showYtd ? <EyeOff size={14}/> : <Eye size={14}/>}
                 </button>
                <PinButton active={pinnedWidgets.includes('ytd')} onClick={() => togglePin('ytd')} />
              </div>
            </div>
            
            {/* Hero: Total CTC */}
            <div className="mb-8">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total CTC Realized</p>
               <div className="flex items-baseline gap-2">
                 <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                   {showYtd ? '₹ 7,25,800' : '₹ ••••••'}
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
                        <p className="text-sm font-black text-slate-900">{showYtd ? '₹ 6.83L' : '••••'}</p>
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
                        <p className="text-sm font-black text-slate-900">{showYtd ? '₹ 9.2k' : '••••'}</p>
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
                        <p className="text-sm font-black text-slate-900">{showYtd ? '₹ 33.6k' : '••••'}</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Trends Chart (Customizable/Hideable) - REDESIGNED */}
        {!hiddenWidgets.includes('trends') && (
          <div className="lg:col-span-4 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col relative group h-full">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="text-slate-400"><PieChartIcon size={20} strokeWidth={2}/></div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Salary Trends</h3>
              </div>
              <div className="flex gap-2">
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
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                  <Bar dataKey="net" stackId="a" fill={COLORS.netPay} barSize={28} />
                  <Bar dataKey="pf" stackId="a" fill={COLORS.pf} barSize={28} />
                  <Bar dataKey="tax" stackId="a" fill={COLORS.tax} radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-8">
               <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS.netPay}}></div>
                  <span className="text-xs font-bold text-slate-400 uppercase">NET</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS.pf}}></div>
                  <span className="text-xs font-bold text-slate-400 uppercase">PF</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS.tax}}></div>
                  <span className="text-xs font-bold text-slate-400 uppercase">TAX</span>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom row: Allowances, Payout Status (Quick Actions Removed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* My Allowances - Compact & No Progress Bar */}
        <div className="lg:col-span-8 bg-white p-5 rounded-[40px] border border-slate-200 shadow-sm h-fit">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Wallet size={16} /> Flexi Benefit Wallets
            </h3>
            <button onClick={onNavigateToReimbursements} className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1 transition-all">
              Manage All <ArrowRight size={14}/>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             <AllowanceItem label="Medical Reimbursement" utilized={5200} limit={15000} />
             <AllowanceItem label="Fuel & Conveyance" utilized={8000} limit={24000} />
             <AllowanceItem label="Books & Periodicals" utilized={0} limit={6000} disabled />
             <AllowanceItem label="LTA (Travel)" utilized={32000} limit={45000} />
          </div>
        </div>

        {/* Payout Status - Expanded to 4 */}
        <div className={`lg:col-span-4 p-8 rounded-[40px] border shadow-sm flex flex-col justify-between relative group transition-colors ${
          attendanceStatus === 'issue' ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'
        }`}>
           {/* Dev Toggle */}
           <button 
             onClick={() => setAttendanceStatus(prev => prev === 'verified' ? 'issue' : 'verified')}
             className="absolute top-6 right-6 p-2 text-red-500 hover:text-red-600 bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
             title="Toggle Attendance Status"
           >
             <AlertTriangle size={14} />
           </button>

           <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Attendance Check</h3>
              
              {attendanceStatus === 'verified' ? (
                <div className="flex flex-col items-center text-center py-4">
                   <div className="relative">
                      <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100 shadow-inner">
                         <span className="text-2xl font-black text-emerald-600">30/30</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-emerald-200">
                         <CheckCircle2 size={16} className="text-emerald-500"/>
                      </div>
                   </div>
                   <h4 className="font-black text-slate-900 mt-6">All Days Credited</h4>
                   <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">Zero Loss of Pay (LOP)</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-4">
                   <div className="relative animate-pulse-slow">
                      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center border-4 border-red-200 shadow-inner">
                         <span className="text-2xl font-black text-red-600">28/30</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-red-200">
                         <AlertCircle size={16} className="text-red-500"/>
                      </div>
                   </div>
                   <h4 className="font-black text-slate-900 mt-6">Action Required</h4>
                   <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-tighter">2 Days LOP Detected</p>
                </div>
              )}
           </div>

           {attendanceStatus === 'verified' ? (
             <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-2xl border border-emerald-100 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest">
                Verified for December Payout
             </div>
           ) : (
             <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-2xl shadow-lg shadow-red-200 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all">
                Regularize Now <ArrowRight size={14}/>
             </button>
           )}
        </div>
      </div>

      {/* 5. Bottom banner */}
      <div className="bg-amber-50 border border-amber-200 p-10 rounded-[48px] flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-white text-amber-600 rounded-3xl flex items-center justify-center shrink-0 shadow-sm border border-amber-100">
             <AlertTriangle size={32} />
           </div>
           <div>
             <h3 className="text-xl font-black text-amber-900">Tax Deadline Approaching</h3>
             <p className="text-sm text-amber-700 mt-1 max-w-xl font-medium">
               The tax window for FY 2025-26 closes on <span className="font-black underline">January 20th</span>. Submit your declarations now to avoid higher TDS in Jan-March payouts.
             </p>
           </div>
        </div>
        <button onClick={onNavigateToTaxPlanning} className="bg-slate-900 hover:bg-slate-800 text-white px-10 h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all whitespace-nowrap">
          Open Planner
        </button>
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

/* --- Internal Helpers --- */

const AllowanceItem = ({ label, utilized, limit, disabled }: any) => {
  return (
    <div className={`px-3 py-2.5 rounded-2xl border ${disabled ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 hover:border-blue-200 transition-all group'}`}>
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate" title={label}>{label}</p>
       <div className="flex justify-between items-baseline mt-0.5">
          <span className="text-base font-black text-slate-900">₹{utilized.toLocaleString()}</span>
          <span className="text-[9px] font-bold text-slate-400 tracking-tighter">/ ₹{limit.toLocaleString()}</span>
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
    {active ? <Pin size={12}/> : <PinOff size={12}/>}
  </button>
);

export default Overview;
