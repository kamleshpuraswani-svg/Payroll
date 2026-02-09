import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Download,
  Search,
  ChevronDown,
  FileText,
  Eye,
  ShieldCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  User,
  Clock,
  ChevronUp,
  Info,
  Building,
  CreditCard,
  Calculator,
  CheckCircle,
  ArrowUpRight,
  X,
  Printer,
  Share2,
  Check,
  FileArchive,
  Loader2,
  // Fixed: Corrected typo in lucide-react import from CheckSquares to CheckSquare
  CheckSquare
} from 'lucide-react';

interface SalaryHistoryRow {
  id: string;
  period: string;
  gross: number;
  net: number;
  status: 'Disbursed' | 'Pending' | 'Hold';
  date: string;
  bankAcc: string;
  deductions: {
    pf: number;
    tds: number;
    others: number;
  };
}

interface EmployeeSalaryHistoryProps {
  onBack: () => void;
  employeeId: string;
}

const MOCK_HISTORY_ROWS: SalaryHistoryRow[] = [
  { id: '1', period: 'Nov 2025', gross: 250000, net: 205000, status: 'Disbursed', date: '30 Nov 2025', bankAcc: 'XXXX1234', deductions: { pf: 18000, tds: 25000, others: 2000 } },
  { id: '2', period: 'Oct 2025', gross: 250000, net: 205200, status: 'Disbursed', date: '31 Oct 2025', bankAcc: 'XXXX1234', deductions: { pf: 18000, tds: 24800, others: 2000 } },
  { id: '3', period: 'Sep 2025', gross: 240000, net: 198000, status: 'Disbursed', date: '30 Sep 2025', bankAcc: 'XXXX5678', deductions: { pf: 17280, tds: 22720, others: 2000 } },
  { id: '4', period: 'Aug 2025', gross: 240000, net: 198000, status: 'Disbursed', date: '31 Aug 2025', bankAcc: 'XXXX5678', deductions: { pf: 17280, tds: 22720, others: 2000 } },
  { id: '5', period: 'Jul 2025', gross: 240000, net: 198000, status: 'Disbursed', date: '31 Jul 2025', bankAcc: 'XXXX5678', deductions: { pf: 17280, tds: 22720, others: 2000 } },
  { id: '6', period: 'Jun 2025', gross: 230000, net: 189500, status: 'Disbursed', date: '30 Jun 2025', bankAcc: 'XXXX5678', deductions: { pf: 16560, tds: 21940, others: 2000 } },
  { id: '7', period: 'May 2025', gross: 230000, net: 189500, status: 'Disbursed', date: '31 May 2025', bankAcc: 'XXXX5678', deductions: { pf: 16560, tds: 21940, others: 2000 } },
  { id: '8', period: 'Apr 2025', gross: 230000, net: 189500, status: 'Disbursed', date: '30 Apr 2025', bankAcc: 'XXXX5678', deductions: { pf: 16560, tds: 21940, others: 2000 } },
  { id: '9', period: 'Mar 2025', gross: 215000, net: 178000, status: 'Disbursed', date: '31 Mar 2025', bankAcc: 'XXXX5678', deductions: { pf: 15480, tds: 19520, others: 2000 } },
  { id: '10', period: 'Feb 2025', gross: 215000, net: 178000, status: 'Disbursed', date: '28 Feb 2025', bankAcc: 'XXXX5678', deductions: { pf: 15480, tds: 19520, others: 2000 } },
  { id: '11', period: 'Jan 2025', gross: 215000, net: 178000, status: 'Disbursed', date: '31 Jan 2025', bankAcc: 'XXXX5678', deductions: { pf: 15480, tds: 19520, others: 2000 } },
];

const EmployeeSalaryHistory: React.FC<EmployeeSalaryHistoryProps> = ({ onBack, employeeId }) => {
  const [activeTab, setActiveTab] = useState<'HISTORY' | 'PROFILE'>('HISTORY');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Action Screen states
  const [selectedRow, setSelectedRow] = useState<SalaryHistoryRow | null>(null);
  const [activeAction, setActiveAction] = useState<'VIEW' | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Bulk Download state
  const [isBulkDownloadOpen, setIsBulkDownloadOpen] = useState(false);
  const [bulkDownloadStep, setBulkDownloadStep] = useState<'OPTIONS' | 'PROGRESS' | 'COMPLETE'>('OPTIONS');
  const [progress, setProgress] = useState(0);

  // Annexure Modal
  const [showAnnexureModal, setShowAnnexureModal] = useState(false);

  // Graph State
  const [graphYear, setGraphYear] = useState('2025');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disbursed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Hold': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleDownload = (row: SalaryHistoryRow) => {
    setIsDownloading(true);
    // Simulate generation
    setTimeout(() => {
      setIsDownloading(false);
      const dummyText = `PAYSLIP - ${row.period}\nNet Amount: ${formatINR(row.net)}`;
      const blob = new Blob([dummyText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payslip_${row.period.replace(' ', '_')}.pdf`;
      link.click();
    }, 1200);
  };

  const handleBulkDownloadStart = () => {
    setBulkDownloadStep('PROGRESS');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setBulkDownloadStep('COMPLETE');
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const closeBulkDownload = () => {
    setIsBulkDownloadOpen(false);
    setBulkDownloadStep('OPTIONS');
    setProgress(0);
  };

  // Helper to detect increment month
  const isIncrementMonth = (index: number) => {
    if (index >= MOCK_HISTORY_ROWS.length - 1) return false;
    return MOCK_HISTORY_ROWS[index].gross > MOCK_HISTORY_ROWS[index + 1].gross;
  };

  // Graph Data
  const graphData = [...MOCK_HISTORY_ROWS].filter(r => r.period.includes(graphYear)).reverse();
  const maxGross = Math.max(...graphData.map(d => d.gross), 1);

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">

      {/* Navigation Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employee Details</h1>
          <p className="text-sm text-slate-500">View comprehensive payroll and profile history</p>
        </div>
      </div>

      <div className="w-full">

        {/* Main Content Area */}
        <div className="space-y-6">

          {/* 1. Employee Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-slate-50 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Priya Sharma" className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-800">Priya Sharma</h2>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">TF00912</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Department</span>
                  <span className="text-slate-700 font-semibold">Software Engineering</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Date of Joining</span>
                  <span className="text-slate-700 font-semibold">12 Jan 2023</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Current CTC</span>
                  <span className="text-slate-700 font-bold">{formatINR(1850000)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Monthly Net</span>
                  <span className="text-emerald-600 font-bold">{formatINR(128400)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 font-medium">Next Appraisal Due</span>
                  <span className="text-purple-600 font-bold">15 Mar 2026</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[11px] font-bold text-slate-600">
                  <FileText size={12} className="text-slate-400" />
                  Total Payslips: 35
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[11px] font-bold text-slate-600">
                  <Clock size={12} className="text-slate-400" />
                  Last Disbursal: 30 Nov 2025
                </div>
                <button
                  onClick={() => setShowAnnexureModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  <FileText size={12} /> View Salary Annexure
                </button>
              </div>
            </div>
          </div>

          {/* 2. Tab Navigation */}
          <div className="flex border-b border-slate-200 gap-8 shrink-0 bg-white px-6 rounded-t-xl">
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'HISTORY' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Salary History
            </button>
            <button
              onClick={() => setActiveTab('PROFILE')}
              className={`py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'PROFILE' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Profile Details
            </button>
          </div>

          {activeTab === 'HISTORY' ? (
            <div className="space-y-6 animate-in fade-in duration-300">

              {/* 3. Salary Trend Graph */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <TrendingUp size={18} className="text-purple-600" />
                      Monthly Salary Trend
                    </h3>
                    <p className="text-xs text-slate-500">Gross salary progression since joining</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <select
                      value={graphYear}
                      onChange={(e) => setGraphYear(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                    </select>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span> Gross Salary</div>
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-purple-100 border border-purple-300"></span> Increment Applied</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between h-40 gap-3 px-2">
                  {graphData.length > 0 ? graphData.map((d, i) => {
                    const isRaise = i > 0 && d.gross > graphData[i - 1].gross;
                    return (
                      <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                        <div className="relative w-full flex justify-end flex-col items-center">
                          <div
                            className={`w-full rounded-t-md transition-all duration-500 hover:scale-x-105 group-hover:opacity-100 relative ${isRaise ? 'bg-purple-600 shadow-[0_0_12px_rgba(147,51,234,0.3)] ring-2 ring-purple-100' : 'bg-indigo-500 opacity-80'}`}
                            style={{ height: `${(d.gross / maxGross) * 120}px` }}
                          >
                            {isRaise && (
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-purple-600 font-black animate-bounce">
                                <ArrowUpRight size={14} />
                              </div>
                            )}
                          </div>
                          <div className="absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            {formatINR(d.gross)}
                          </div>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{d.period.split(' ')[0]}</span>
                      </div>
                    );
                  }) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm italic">
                      No salary data available for {graphYear}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Salary History Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Pay Period</th>
                        <th className="px-6 py-4 text-right">Gross Salary</th>
                        <th className="px-6 py-4 text-right">Deductions</th>
                        <th className="px-6 py-4 text-right">Net Pay</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Disbursed On</th>
                        <th className="px-6 py-4">Bank A/c</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MOCK_HISTORY_ROWS.map((row, index) => {
                        const isExpanded = expandedRow === row.id;
                        const totalDeduct = row.deductions.pf + row.deductions.tds + row.deductions.others;
                        const isIncrement = isIncrementMonth(index);

                        return (
                          <React.Fragment key={row.id}>
                            <tr className={`group transition-colors ${isExpanded ? 'bg-slate-50/80' : 'hover:bg-slate-50/50'}`}>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} className="text-slate-300" />
                                  <span className="font-bold text-slate-800">{row.period}</span>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <div className="flex flex-col items-end">
                                  <span className="font-medium text-slate-700">{formatINR(row.gross)}</span>
                                  {isIncrement && (
                                    <span className="flex items-center gap-1 text-[10px] font-black text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 mt-1 uppercase tracking-tighter">
                                      <ArrowUpRight size={10} /> Increment
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <button
                                  onClick={() => setExpandedRow(isExpanded ? null : row.id)}
                                  className="text-rose-600 font-bold hover:underline underline-offset-4 decoration-rose-200 flex items-center justify-end gap-1 ml-auto group/ded"
                                >
                                  {formatINR(totalDeduct)}
                                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} className="opacity-0 group-hover/ded:opacity-100 transition-opacity" />}
                                </button>
                              </td>
                              <td className="px-6 py-5 text-right font-black text-slate-900">{formatINR(row.net)}</td>
                              <td className="px-6 py-5">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(row.status)}`}>
                                  {row.status}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-slate-500">{row.date}</td>
                              <td className="px-6 py-5 font-mono text-xs text-slate-400">{row.bankAcc}</td>
                              <td className="px-6 py-5 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleDownload(row)}
                                    className="p-2 text-slate-400 hover:text-purple-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-sm"
                                    title="Download PDF"
                                  >
                                    <Download size={16} />
                                  </button>
                                  <button
                                    onClick={() => { setSelectedRow(row); setActiveAction('VIEW'); }}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-sm"
                                    title="View Payslip"
                                  >
                                    <Eye size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Expanded Deduction Row */}
                            {isExpanded && (
                              <tr className="bg-slate-50/80 animate-in slide-in-from-top-2 duration-200">
                                <td colSpan={8} className="px-6 py-4">
                                  <div className="flex justify-end pr-[400px]">
                                    <div className="w-80 bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                                      <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 mb-2">
                                        <span>Breakdown</span>
                                        <span>Amount</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Provident Fund (PF)</span>
                                        <span className="font-bold text-slate-700">{formatINR(row.deductions.pf)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Income Tax (TDS)</span>
                                        <span className="font-bold text-slate-700">{formatINR(row.deductions.tds)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">PT / Other Recoveries</span>
                                        <span className="font-bold text-slate-700">{formatINR(row.deductions.others)}</span>
                                      </div>
                                      <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-rose-600">
                                        <span>Total Deductions</span>
                                        <span>{formatINR(totalDeduct)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 text-center font-medium">
                  End of history reached (Joined Jan 2023)
                </div>
              </div>
            </div>
          ) : (
            /* 5. Profile Details Tab Content */
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Identity & Basic Info */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <User size={18} className="text-slate-400" /> Employee Profile Information
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                    <p className="text-sm font-semibold text-slate-800 py-1 border-b border-slate-50">Priya Sharma</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Designation</label>
                    <p className="text-sm font-semibold text-slate-800 py-1 border-b border-slate-50">Senior Software Engineer</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Department</label>
                    <p className="text-sm font-semibold text-slate-800 py-1 border-b border-slate-50">Engineering</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Work Location</label>
                    <p className="text-sm font-semibold text-slate-800 py-1 border-b border-slate-50">Bangalore</p>
                  </div>
                </div>
              </div>

              {/* Bank Information */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Building size={18} className="text-slate-400" /> Bank & Payment Details
                  </h3>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                    <CheckCircle size={12} /> KYC Verified
                  </span>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Account Number</label>
                    <p className="text-sm font-mono font-bold text-slate-800 py-1 border-b border-slate-50">50100234567890</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">IFSC Code</label>
                    <p className="text-sm font-mono font-bold text-slate-800 py-1 border-b border-slate-50">HDFC0001234</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Bank Name</label>
                    <p className="text-sm font-semibold text-slate-700 py-1 border-b border-slate-50">HDFC Bank</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Branch</label>
                    <p className="text-sm font-semibold text-slate-700 py-1 border-b border-slate-50">Koramangala 4th Block</p>
                  </div>
                </div>
              </div>

              {/* Statutory & Compliance */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-slate-400" /> Statutory & Tax Compliance
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">PAN Number</label>
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-slate-400" />
                      <p className="text-sm font-mono font-bold text-slate-800">ABCDE1234F</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">UAN (Provident Fund)</label>
                    <p className="text-sm font-mono font-bold text-slate-800">100900200300</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tax Regime (Current FY)</label>
                    <p className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">New Tax Regime</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">EPF Contribution Rate</label>
                    <p className="text-sm font-semibold text-slate-700">12% of Basic</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* --- OVERLAY SCREENS --- */}

      {/* Annexure Modal */}
      {showAnnexureModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800">Salary Structure Annexure</h3>
                <p className="text-xs text-slate-500">Priya Sharma (TF00912)</p>
              </div>
              <button onClick={() => setShowAnnexureModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={20} /></button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left">Component</th>
                      <th className="px-4 py-3 text-right">Monthly (₹)</th>
                      <th className="px-4 py-3 text-right">Annual (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Earnings */}
                    <tr className="bg-emerald-50/50"><td colSpan={3} className="px-4 py-2 font-bold text-emerald-800 text-xs uppercase">A. Earnings</td></tr>
                    <tr>
                      <td className="px-4 py-2 text-slate-700">Basic Salary</td>
                      <td className="px-4 py-2 text-right text-slate-600">61,667</td>
                      <td className="px-4 py-2 text-right text-slate-800 font-medium">7,40,000</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-slate-700">House Rent Allowance</td>
                      <td className="px-4 py-2 text-right text-slate-600">30,833</td>
                      <td className="px-4 py-2 text-right text-slate-800 font-medium">3,70,000</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-slate-700">Special Allowance</td>
                      <td className="px-4 py-2 text-right text-slate-600">52,967</td>
                      <td className="px-4 py-2 text-right text-slate-800 font-medium">6,35,600</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-slate-700">Leave Travel Allowance</td>
                      <td className="px-4 py-2 text-right text-slate-600">4,167</td>
                      <td className="px-4 py-2 text-right text-slate-800 font-medium">50,000</td>
                    </tr>
                    <tr className="font-bold bg-slate-50">
                      <td className="px-4 py-2 text-slate-800">Total Gross Salary (A)</td>
                      <td className="px-4 py-2 text-right">1,49,634</td>
                      <td className="px-4 py-2 text-right">17,95,600</td>
                    </tr>

                    {/* Retirals */}
                    <tr className="bg-sky-50/50"><td colSpan={3} className="px-4 py-2 font-bold text-sky-800 text-xs uppercase">B. Retirals (Employer)</td></tr>
                    <tr>
                      <td className="px-4 py-2 text-slate-700">Provident Fund (Employer)</td>
                      <td className="px-4 py-2 text-right text-slate-600">1,800</td>
                      <td className="px-4 py-2 text-right text-slate-800 font-medium">21,600</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-slate-700">Gratuity</td>
                      <td className="px-4 py-2 text-right text-slate-600">2,733</td>
                      <td className="px-4 py-2 text-right text-slate-800 font-medium">32,800</td>
                    </tr>
                    <tr className="font-bold bg-slate-50">
                      <td className="px-4 py-2 text-slate-800">Total Retirals (B)</td>
                      <td className="px-4 py-2 text-right">4,533</td>
                      <td className="px-4 py-2 text-right">54,400</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-800 text-white font-bold">
                    <tr>
                      <td className="px-4 py-3">Total Cost to Company (A + B)</td>
                      <td className="px-4 py-3 text-right">1,54,167</td>
                      <td className="px-4 py-3 text-right text-lg">18,50,000</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setShowAnnexureModal(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Download Modal */}
      {isBulkDownloadOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><FileArchive size={20} /></div>
                <div>
                  <h3 className="font-bold text-slate-800">Bulk Download Payslips</h3>
                  <p className="text-xs text-slate-500 uppercase font-black tracking-tighter">Priya Sharma (TF00912)</p>
                </div>
              </div>
              <button onClick={closeBulkDownload} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>

            {/* Body Content based on Step */}
            <div className="p-8">
              {bulkDownloadStep === 'OPTIONS' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Select Range</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border border-purple-100 bg-purple-50/30 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors group">
                        <input type="radio" name="range" defaultChecked className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-700">Current FY (2025-26)</p>
                          <p className="text-xs text-slate-400">8 Payslips available</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group">
                        <input type="radio" name="range" className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-700">Previous FY (2024-25)</p>
                          <p className="text-xs text-slate-400">12 Payslips available</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group">
                        <input type="radio" name="range" className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-700">All Time History</p>
                          <p className="text-xs text-slate-400">35 Payslips total</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Export Format</label>
                    <div className="flex gap-3">
                      <button className="flex-1 py-3 bg-white border-2 border-purple-600 text-purple-700 rounded-xl text-xs font-bold flex flex-col items-center gap-1 shadow-sm">
                        <Download size={16} /> Bundled ZIP
                      </button>
                      <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold flex flex-col items-center gap-1 hover:bg-slate-50 transition-colors">
                        <FileText size={16} /> Combined PDF
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleBulkDownloadStart}
                    className="w-full mt-2 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Start Bundling Files
                  </button>
                </div>
              )}

              {bulkDownloadStep === 'PROGRESS' && (
                <div className="flex flex-col items-center justify-center py-6 animate-in fade-in">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-purple-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-purple-600">
                      {progress}%
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">Generating Archive...</h4>
                  <p className="text-sm text-slate-500 mt-1 text-center">We are bundling all payslips with verified digital signatures and tax stamps.</p>

                  <div className="w-full mt-10 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applying encryption to PDFs...</p>
                </div>
              )}

              {bulkDownloadStep === 'COMPLETE' && (
                <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 border-4 border-emerald-100 ring-8 ring-emerald-50/50">
                    <Check size={40} strokeWidth={3} />
                  </div>
                  <h4 className="text-xl font-black text-slate-800">Archive Ready!</h4>
                  <p className="text-sm text-slate-500 mt-2 text-center">Your bulk payslip package has been generated successfully.</p>

                  <div className="w-full mt-8 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm"><FileArchive className="text-purple-600" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">Payslips_Priya_Sharma.zip</p>
                      <p className="text-xs text-slate-400">Total Size: 4.2 MB</p>
                    </div>
                    <button
                      className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                      onClick={closeBulkDownload}
                    >
                      <Download size={20} />
                    </button>
                  </div>

                  <button
                    onClick={closeBulkDownload}
                    className="mt-8 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Individual Download Progress Overlay */}
      {isDownloading && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-sm">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-purple-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center"><Download size={24} className="text-purple-600" /></div>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Generating PDF...</h3>
            <p className="text-sm text-slate-500 mt-1">Preparing high-resolution payslip with verified statutory stamps.</p>
          </div>
        </div>
      )}

      {/* View Payslip Modal */}
      {selectedRow && activeAction === 'VIEW' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-indigo-600"><FileText size={20} /></div>
                <div>
                  <h3 className="font-bold text-slate-800">Payslip: {selectedRow.period}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee: Priya Sharma (TF00912)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setSelectedRow(null); setActiveAction(null); }} className="p-2 text-slate-400 hover:text-rose-600 bg-white rounded-full transition-colors border border-slate-200"><X size={20} /></button>
              </div>
            </div>

            {/* Payslip Content */}
            <div className="flex-1 overflow-y-auto p-12 bg-slate-100/50">
              <div className="max-w-3xl mx-auto bg-white shadow-sm border border-slate-200 p-10 flex flex-col min-h-[800px]" style={{ fontFamily: 'Times New Roman, serif' }}>
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                  <div className="h-16 w-16 bg-slate-800 rounded flex items-center justify-center text-white font-black text-2xl shadow-md italic">C</div>
                  <div className="text-right">
                    <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-800">CollabCRM Systems</h1>
                    <p className="text-sm text-slate-500 mt-1">123, Tech Plaza, Bangalore - 560001</p>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold underline underline-offset-4 decoration-1">PAYSLIP FOR THE MONTH OF {selectedRow.period.toUpperCase()}</h2>
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 text-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span className="font-bold text-slate-600">Employee Name</span><span>: Priya Sharma</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span className="font-bold text-slate-600">Employee ID</span><span>: TF00912</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span className="font-bold text-slate-600">Designation</span><span>: Senior Engineer</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span className="font-bold text-slate-600">Department</span><span>: Engineering</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span className="font-bold text-slate-600">Bank A/c No.</span><span>: {selectedRow.bankAcc}</span></div>
                  <div className="flex justify-between border-b border-slate-100 pb-1"><span className="font-bold text-slate-600">PAN Number</span><span>: ABCDE1234F</span></div>
                </div>

                <div className="flex-1">
                  <table className="w-full border-collapse border border-slate-300 text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="border border-slate-300 p-2 text-left">EARNINGS</th>
                        <th className="border border-slate-300 p-2 text-right">AMOUNT</th>
                        <th className="border border-slate-300 p-2 text-left">DEDUCTIONS</th>
                        <th className="border border-slate-300 p-2 text-right">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-2">Basic Salary</td>
                        <td className="border border-slate-300 p-2 text-right">{formatINR(selectedRow.gross * 0.5)}</td>
                        <td className="border border-slate-300 p-2">Provident Fund</td>
                        <td className="border border-slate-300 p-2 text-right">{formatINR(selectedRow.deductions.pf)}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">House Rent Allowance</td>
                        <td className="border border-slate-300 p-2 text-right">{formatINR(selectedRow.gross * 0.25)}</td>
                        <td className="border border-slate-300 p-2">Professional Tax</td>
                        <td className="border border-slate-300 p-2 text-right">{formatINR(selectedRow.deductions.others)}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-2">Special Allowance</td>
                        <td className="border border-slate-300 p-2 text-right">{formatINR(selectedRow.gross * 0.25)}</td>
                        <td className="border border-slate-300 p-2">Income Tax (TDS)</td>
                        <td className="border border-slate-300 p-2 text-right">{formatINR(selectedRow.deductions.tds)}</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold">
                        <td className="border border-slate-300 p-2">TOTAL EARNINGS</td>
                        <td className="border border-slate-300 p-2 text-right">{formatINR(selectedRow.gross)}</td>
                        <td className="border border-slate-300 p-2">TOTAL DEDUCTIONS</td>
                        <td className="border border-slate-300 p-2 text-right">{formatINR(selectedRow.deductions.pf + selectedRow.deductions.tds + selectedRow.deductions.others)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="mt-8 flex justify-end">
                    <div className="w-1/2 border-2 border-slate-800 p-4 flex justify-between items-center bg-slate-50">
                      <span className="font-bold text-slate-700">NET PAYABLE:</span>
                      <span className="text-2xl font-black text-slate-900">{formatINR(selectedRow.net)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-12 border-t border-slate-200">
                  <div className="flex justify-between italic text-xs text-slate-400">
                    <span>Note: This is a computer generated payslip, no signature required.</span>
                    <span>Issued On: {selectedRow.date}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => { setSelectedRow(null); setActiveAction(null); }} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">Close</button>
              <button onClick={() => handleDownload(selectedRow)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2"><Download size={18} /> Download PDF</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeSalaryHistory;
