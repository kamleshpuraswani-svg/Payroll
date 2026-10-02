
import React, { useState, useEffect, useRef } from 'react';
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
  X,
  ShieldCheck,
  KeyRound,
  Home
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SalarySlipsModule } from './SalarySlips';
import { TaxDocumentsModule } from './TaxDocuments';

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
  { name: 'Gross Earnings', value: 980000, color: '#10B981' },
  { name: 'Employee Deductions', value: 124000, color: '#EF4444' },
  { name: 'Employer Contributions', value: 96000, color: '#3B82F6' },
];

interface SalaryBreakdownProps {
  onNavigateToOverview?: () => void;
}

export const SalaryBreakdownModule: React.FC<SalaryBreakdownProps> = ({
  onNavigateToOverview
}) => {
  // Screen-level Password Protection
  const [isScreenUnlocked, setIsScreenUnlocked] = useState(false);
  const [screenPasswordInput, setScreenPasswordInput] = useState('');
  const [screenPasswordError, setScreenPasswordError] = useState('');
  const [showPasswordPlaintext, setShowPasswordPlaintext] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Visibility State
  const [showValues, setShowValues] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [unlockStep, setUnlockStep] = useState<'password' | 'otp-method' | 'otp-entry'>('password');
  const [otpMethod, setOtpMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isSalaryBreakupOpen, setIsSalaryBreakupOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState('v1');
  const [activeTab, setActiveTab] = useState<'payslips' | 'tax-documents'>('payslips');

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
    setShowValues(prev => !prev);
  };

  const handleUnlockScreenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScreenPasswordError('');
    if (!screenPasswordInput.trim()) {
      setScreenPasswordError('Please enter your password.');
      return;
    }
    if (screenPasswordInput === '1234') {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsScreenUnlocked(true);
        setShowValues(true);
        setScreenPasswordInput('');
      }, 200);
    } else {
      setScreenPasswordError('Incorrect password. Default password is 1234.');
    }
  };

  const closeUnlockModal = () => {
    setIsPasswordModalOpen(false);
    setUnlockStep('password');
    setOtpDigits(['', '', '', '']);
    setOtpError('');
    setResendCountdown(0);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1234') {
      setPasswordError('');
      setUnlockStep('otp-method');
    } else {
      setPasswordError('Incorrect password. Try 1234.');
    }
  };

  const handleSendOtp = () => {
    setUnlockStep('otp-entry');
    setOtpDigits(['', '', '', '']);
    setOtpError('');
    setResendCountdown(57);
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    setOtpDigits(prev => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 4) {
      setOtpError('Please enter the complete OTP.');
      return;
    }
    if (code === '0000') {
      setShowValues(true);
      closeUnlockModal();
    } else {
      setOtpError('Incorrect OTP. Try 0000.');
    }
  };

  // Resend OTP countdown
  useEffect(() => {
    if (unlockStep !== 'otp-entry' || resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [unlockStep, resendCountdown]);

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

  if (!isScreenUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[560px] h-full py-12 px-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl max-w-md w-full p-8 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-indigo-50/70 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-blue-50/70 rounded-full blur-2xl pointer-events-none" />

          {/* Lock Icon with Shield */}
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5 shadow-xs">
            <Lock size={30} className="stroke-[2.2]" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs">
              <ShieldCheck size={13} />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Payslips Access Protected</h2>
            <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">
              This screen contains confidential payslip and salary records. Please enter your portal password to continue.
            </p>
          </div>

          <form onSubmit={handleUnlockScreenSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Portal Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswordPlaintext ? 'text' : 'password'}
                  value={screenPasswordInput}
                  onChange={(e) => {
                    setScreenPasswordInput(e.target.value);
                    if (screenPasswordError) setScreenPasswordError('');
                  }}
                  placeholder="Enter password (e.g. 1234)"
                  autoFocus
                  className={`w-full pl-10 pr-11 py-3 bg-slate-50/60 border ${
                    screenPasswordError
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

              {screenPasswordError && (
                <div className="mt-2.5 p-2.5 bg-red-50/90 border border-red-200/80 rounded-lg flex items-center gap-2 text-xs text-red-600 font-semibold animate-in fade-in">
                  <AlertTriangle size={14} className="shrink-0 text-red-500" />
                  <span>{screenPasswordError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-100 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>Unlock Payslips</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Helper for user / tester */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center flex flex-col items-center gap-3">
            <span className="text-[11px] text-slate-400 font-medium inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              <span>Default PIN:</span> <strong className="text-slate-700 font-bold">1234</strong>
            </span>

            {onNavigateToOverview && (
              <button
                type="button"
                onClick={onNavigateToOverview}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer shadow-2xs"
              >
                <Home size={13} />
                <span>Go to Home</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full animate-fade-in pb-10">

      {/* Module Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex-shrink-0">
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
            <span className="hidden bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100">UAN Active</span>
            <button
              onClick={handleToggleVisibility}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-all border border-slate-100 cursor-pointer"
              title={showValues ? "Hide amounts" : "Show amounts"}
            >
              {showValues ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
            <button
              onClick={() => {
                setIsScreenUnlocked(false);
                setScreenPasswordInput('');
                setScreenPasswordError('');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 transition-all cursor-pointer"
              title="Lock Payslips Screen"
            >
              <Lock size={13} />
              <span>Lock Screen</span>
            </button>
          </div>
        </div>

        {/* CTC Breakdown Bar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-700">Annual CTC Breakdown</span>
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
                  {d.name} {showValues ? `₹${d.value.toLocaleString()}` : '₹ ••••••'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payslips Section */}
      <div className="flex-1 min-h-0">
        <SalarySlipsModule showValues={showValues} />
      </div>

      {/* Password / Two-Factor Unlock Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6">

              {unlockStep === 'password' && (
                <>
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-slate-800">Enter Password</h3>
                     <button onClick={closeUnlockModal} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
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
                </>
              )}

              {unlockStep === 'otp-method' && (
                <>
                  <div className="flex justify-between items-start mb-1">
                     <h3 className="text-xl font-bold">
                        <span className="text-indigo-600">Two Factor</span>{' '}
                        <span className="text-amber-500">Authentication</span>
                     </h3>
                     <button onClick={closeUnlockModal} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>
                  <p className="text-sm text-slate-400 mb-5">Where should we send your OTP?</p>

                  <div className="space-y-3">
                     <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${otpMethod === 'whatsapp' ? 'border-indigo-400 bg-indigo-50/60' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <span className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${otpMethod === 'whatsapp' ? 'border-indigo-600' : 'border-slate-300'}`}>
                           {otpMethod === 'whatsapp' && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                        </span>
                        <input type="radio" name="otpMethod" className="hidden" checked={otpMethod === 'whatsapp'} onChange={() => setOtpMethod('whatsapp')} />
                        <span className="text-sm font-semibold text-slate-700">
                           Send OTP to WhatsApp Mobile Number<br />
                           <span className="font-bold text-slate-800">(*****80)</span>
                        </span>
                     </label>

                     <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${otpMethod === 'email' ? 'border-indigo-400 bg-indigo-50/60' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <span className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${otpMethod === 'email' ? 'border-indigo-600' : 'border-slate-300'}`}>
                           {otpMethod === 'email' && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                        </span>
                        <input type="radio" name="otpMethod" className="hidden" checked={otpMethod === 'email'} onChange={() => setOtpMethod('email')} />
                        <span className="text-sm font-semibold text-slate-700">
                           Send OTP to Email<br />
                           <span className="font-bold text-slate-800">bl***@ma***.cc</span>
                        </span>
                     </label>
                  </div>

                  {otpMethod === 'whatsapp' && (
                     <p className="text-xs text-slate-400 mt-4">
                        By proceeding, I agree to receive WhatsApp messages from CollabCRM.
                     </p>
                  )}

                  <button
                     onClick={handleSendOtp}
                     className="w-full mt-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-indigo-100"
                  >
                     Send OTP
                  </button>
                </>
              )}

              {unlockStep === 'otp-entry' && (
                <>
                  <div className="flex justify-between items-start mb-1">
                     <h3 className="text-xl font-bold">
                        <span className="text-indigo-600">Enter the</span>{' '}
                        <span className="text-amber-500">OTP</span>
                     </h3>
                     <button onClick={closeUnlockModal} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>
                  <p className="text-sm text-slate-400 mb-5">
                     We have sent you the OTP on your {otpMethod === 'whatsapp' ? 'WhatsApp number' : 'email'}, please enter it below.
                  </p>

                  <form onSubmit={handleOtpSubmit} className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">OTP <span className="text-red-500">*</span></label>
                        <div className="flex items-center gap-3">
                           {otpDigits.map((digit, index) => (
                              <input
                                 key={index}
                                 ref={(el) => { otpInputRefs.current[index] = el; }}
                                 type="text"
                                 inputMode="numeric"
                                 maxLength={1}
                                 value={digit}
                                 onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                                 onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                 className="w-12 h-12 text-center text-lg font-bold border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                 autoFocus={index === 0}
                              />
                           ))}
                        </div>
                        {otpError && <p className="text-xs text-red-500 mt-2 font-medium">{otpError}</p>}
                     </div>

                     <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-indigo-100">
                        Unlock
                     </button>
                  </form>

                  <div className="flex flex-col items-center gap-3 mt-4">
                     <p className="text-xs text-slate-400">
                        {resendCountdown > 0 ? (
                           <>Resend OTP <span className="font-bold text-slate-600">after 0:{resendCountdown.toString().padStart(2, '0')}</span></>
                        ) : (
                           <button onClick={handleSendOtp} className="font-bold text-indigo-600 hover:text-indigo-700">Resend OTP</button>
                        )}
                     </p>
                     <button
                        onClick={() => setUnlockStep('otp-method')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                     >
                        ← Switch OTP Method
                     </button>
                  </div>
                </>
              )}

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
