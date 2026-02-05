
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Eye, 
  Lock, 
  Unlock, 
  ChevronRight, 
  CheckCircle, 
  DollarSign, 
  Users, 
  Download, 
  MoreVertical,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  X,
  Edit2,
  FileSpreadsheet,
  FileArchive,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Play,
  RefreshCw,
  Check,
  Database,
  Filter,
  History,
  ArrowLeft
} from 'lucide-react';
import { RunPayrollModal, PayrollAlertsModal } from './CompanyActionModals';
import { MOCK_COMPANIES } from '../constants';

interface PastPayroll {
  id: string;
  month: string;
  processedDate: string;
  employeeCount: number;
  grossAmount: string;
  netPay: string;
  status: 'Paid' | 'Locked' | 'Draft' | 'Failed';
}

const MOCK_HISTORY: PastPayroll[] = [
  { id: 'PR-102', month: 'October 2025', processedDate: '31 Oct 2025', employeeCount: 448, grossAmount: '₹ 1.82 Cr', netPay: '₹ 1.40 Cr', status: 'Paid' },
  { id: 'PR-101', month: 'September 2025', processedDate: '30 Sep 2025', employeeCount: 445, grossAmount: '₹ 1.80 Cr', netPay: '₹ 1.38 Cr', status: 'Paid' },
  { id: 'PR-100', month: 'August 2025', processedDate: '31 Aug 2025', employeeCount: 440, grossAmount: '₹ 1.78 Cr', netPay: '₹ 1.36 Cr', status: 'Paid' },
  { id: 'PR-099', month: 'July 2025', processedDate: '31 Jul 2025', employeeCount: 435, grossAmount: '₹ 1.75 Cr', netPay: '₹ 1.34 Cr', status: 'Paid' },
  { id: 'PR-098', month: 'June 2025', processedDate: '30 Jun 2025', employeeCount: 432, grossAmount: '₹ 1.72 Cr', netPay: '₹ 1.32 Cr', status: 'Paid' },
];

const MOCK_24Q_HISTORY = [
    { id: 'RET-001', fy: '2025-26', quarter: 'Q2 (Jul-Sep)', filedDate: '31 Oct 2025', ackNo: '3456789012', status: 'Filed', fileName: '24Q_Q2_2526.fvu' },
    { id: 'RET-002', fy: '2025-26', quarter: 'Q1 (Apr-Jun)', filedDate: '31 Jul 2025', ackNo: '9876543210', status: 'Filed', fileName: '24Q_Q1_2526.fvu' },
    { id: 'RET-003', fy: '2024-25', quarter: 'Q4 (Jan-Mar)', filedDate: '31 May 2025', ackNo: '1234567890', status: 'Filed', fileName: '24Q_Q4_2425.fvu' },
    { id: 'RET-004', fy: '2024-25', quarter: 'Q3 (Oct-Dec)', filedDate: '31 Jan 2025', ackNo: '1122334455', status: 'Filed', fileName: '24Q_Q3_2425.fvu' },
];

// --- Sub-Modal: Annexure 1 Details ---
const Annexure1DetailsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
             <h3 className="font-bold text-slate-800 text-lg">Annexure I: Deductee Details</h3>
             <p className="text-xs text-slate-500">List of all employees with TDS deduction for Q3</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
        </div>
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
           <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Search PAN or Name..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"/>
           </div>
           <button className="flex items-center gap-2 text-sm font-bold text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg transition-colors">
              <Filter size={16} /> Filter
           </button>
        </div>

        <div className="flex-1 overflow-auto">
           <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase sticky top-0 z-10">
                 <tr>
                    <th className="px-6 py-3">Sr. No.</th>
                    <th className="px-6 py-3">PAN</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Section</th>
                    <th className="px-6 py-3 text-right">Payment Date</th>
                    <th className="px-6 py-3 text-right">Amount Paid</th>
                    <th className="px-6 py-3 text-right">TDS Deducted</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <tr key={i} className="hover:bg-slate-50">
                       <td className="px-6 py-3 text-slate-500">{i}</td>
                       <td className="px-6 py-3 font-mono text-slate-600">AAAPA123{i}B</td>
                       <td className="px-6 py-3 font-medium text-slate-800">Employee Name {i}</td>
                       <td className="px-6 py-3 text-slate-500">192B</td>
                       <td className="px-6 py-3 text-right text-slate-600">30-11-2025</td>
                       <td className="px-6 py-3 text-right font-medium">₹ 75,000</td>
                       <td className="px-6 py-3 text-right font-bold text-emerald-600">₹ 8,500</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-center text-slate-400">
           Showing 10 of 1,842 records
        </div>
      </div>
    </div>
  );
};

// --- Form 24Q Wizard Component ---
const Form24QModalContent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [mode, setMode] = useState<'GENERATE' | 'HISTORY'>('GENERATE');
  const [quarter, setQuarter] = useState('Q3');
  const [expandedSection, setExpandedSection] = useState<string | null>('ANNEXURE_I');
  const [validationStatus, setValidationStatus] = useState<'IDLE' | 'CHECKING' | 'VALID' | 'ERROR'>('IDLE');
  const [generationStatus, setGenerationStatus] = useState<'IDLE' | 'GENERATING' | 'DONE'>('IDLE');
  const [markAsFiled, setMarkAsFiled] = useState(false);
  const [isNilReturn, setIsNilReturn] = useState(false);
  
  // Modal Visibility
  const [showAnnexureDetails, setShowAnnexureDetails] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleValidation = () => {
    setValidationStatus('CHECKING');
    setTimeout(() => {
      setValidationStatus('VALID');
    }, 1500);
  };

  const handleGeneration = () => {
    if (validationStatus !== 'VALID') return;
    setGenerationStatus('GENERATING');
    setTimeout(() => {
      setGenerationStatus('DONE');
    }, 2000);
  };

  const handleNilReturnToggle = () => {
      const newState = !isNilReturn;
      setIsNilReturn(newState);
      // Reset statuses when mode changes
      setValidationStatus('IDLE');
      setGenerationStatus('IDLE');
  };

  const downloadFile = (fileName: string) => {
      // Create a dummy text file
      const element = document.createElement("a");
      const file = new Blob([`Content for ${fileName}\nVer: 1.0\n...`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = fileName;
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
      document.body.removeChild(element);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileSpreadsheet size={20}/></div>
           <div>
              <h3 className="font-bold text-slate-800 text-lg">
                  {mode === 'GENERATE' ? 'Form 24Q TDS Return Generation' : 'Form 24Q Filing History'}
              </h3>
              <p className="text-xs text-slate-500">Quarterly statement of deduction of tax under sub-section (3) of section 200 of IT Act</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
            {mode === 'GENERATE' ? (
                <button 
                    onClick={() => setMode('HISTORY')}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-purple-600 transition-colors"
                >
                    <History size={16} /> View History
                </button>
            ) : (
                <button 
                    onClick={() => setMode('GENERATE')}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors shadow-sm"
                >
                    <Plus size={16} /> Generate New
                </button>
            )}
            <div className="h-6 w-px bg-slate-200"></div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
        </div>
      </div>

      {mode === 'GENERATE' ? (
      /* --- GENERATION WIZARD CONTENT --- */
      <>
        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
            
            {/* 1. Return Details Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Database size={14} /> Return Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Financial Year</label>
                    <select disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700">
                        <option>2025-26</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Quarter</label>
                    <select 
                        value={quarter} 
                        onChange={(e) => setQuarter(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:border-purple-500 focus:outline-none"
                    >
                        <option value="Q1">Q1 (Apr-Jun)</option>
                        <option value="Q2">Q2 (Jul-Sep)</option>
                        <option value="Q3">Q3 (Oct-Dec)</option>
                        <option value="Q4">Q4 (Jan-Mar)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Return Type</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="type" defaultChecked className="text-purple-600 focus:ring-purple-500" />
                        <span className="text-sm font-medium text-slate-700">Regular</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="type" className="text-purple-600 focus:ring-purple-500" />
                        <span className="text-sm font-medium text-slate-700">Correction</span>
                        </label>
                    </div>
                </div>
                <div className="flex items-center justify-end">
                    <label className="flex items-center gap-2 cursor-pointer p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div 
                            className={`w-9 h-5 rounded-full relative transition-colors ${isNilReturn ? 'bg-purple-600' : 'bg-slate-200'}`}
                            onClick={handleNilReturnToggle}
                        >
                        <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm absolute top-[3px] transition-all ${isNilReturn ? 'left-[18px]' : 'left-[3px]'}`}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-600 select-none" onClick={handleNilReturnToggle}>NIL Return</span>
                    </label>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div className="flex justify-between">
                    <span className="text-slate-500">Company Name:</span>
                    <span className="font-bold text-slate-700">TechFlow Systems Pvt Ltd</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">TAN:</span>
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">DELA12345B</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">Responsible Person:</span>
                    <span className="font-medium text-slate-700">Rajesh Kumar (Finance Head)</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">PAN:</span>
                    <span className="font-mono font-medium text-slate-700">ABCDE1234F</span>
                </div>
            </div>
            </div>

            {/* 2. Middle Section: Accordions or NIL State */}
            {isNilReturn ? (
                <div className="bg-white border border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">NIL Return Mode Active</h3>
                    <p className="text-slate-500 max-w-md mt-2 text-sm">
                        You have selected a NIL return. Deductee details and challan entries are not required. 
                        Please proceed to validation to verify entity details.
                    </p>
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in">
                {/* Annexure I */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors">
                        <button 
                            onClick={() => toggleSection('ANNEXURE_I')}
                            className="flex-1 flex items-center text-left"
                        >
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Annexure I - Deductee Details</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Salary details for the selected quarter</p>
                            </div>
                        </button>
                        
                        <div className="flex items-center gap-3">
                            {/* View Eye Icon for Annexure 1 */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowAnnexureDetails(true); }}
                                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-purple-600 hover:border-purple-200 transition-colors"
                                title="View Full List"
                            >
                                <Eye size={16} />
                            </button>
                            
                            <button onClick={() => toggleSection('ANNEXURE_I')}>
                                {expandedSection === 'ANNEXURE_I' ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
                            </button>
                        </div>
                    </div>
                    
                    {expandedSection === 'ANNEXURE_I' && (
                        <div className="p-6 border-t border-slate-200 animate-in slide-in-from-top-2">
                            <div className="flex gap-4 mb-6">
                            <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-100">
                                Employees: 1,842
                            </div>
                            <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                                Total Salary Paid: ₹ 55.26 Cr
                            </div>
                            <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">
                                TDS Deducted: ₹ 6.54 Cr
                            </div>
                            </div>
                            <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">Employee PAN</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3 text-right">Gross Salary</th>
                                    <th className="px-4 py-3 text-right">Exempt Allowances</th>
                                    <th className="px-4 py-3 text-right">Perquisites</th>
                                    <th className="px-4 py-3 text-right">TDS Deducted</th>
                                    <th className="px-4 py-3">Reason (Lower Ded.)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-100">
                                    <td className="px-4 py-3 font-mono font-medium text-slate-600">AAAPA1234B</td>
                                    <td className="px-4 py-3 font-bold text-slate-700">Priya Sharma</td>
                                    <td className="px-4 py-3 text-right">₹ 7,50,000</td>
                                    <td className="px-4 py-3 text-right text-emerald-600">₹ 3,00,000</td>
                                    <td className="px-4 py-3 text-right">₹ 0</td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-800">₹ 1,20,000</td>
                                    <td className="px-4 py-3 text-slate-400">-</td>
                                </tr>
                                {/* More rows would be here */}
                                <tr>
                                    <td colSpan={7} className="px-4 py-3 text-center text-slate-400 italic bg-slate-50/30">+ 1,841 more records</td>
                                </tr>
                            </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Annexure II (Conditional) */}
                {quarter === 'Q4' && (
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <button 
                            onClick={() => toggleSection('ANNEXURE_II')}
                            className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                        >
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Annexure II - Annual Salary Details</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Required for Q4 filing (Annual Consolidation)</p>
                            </div>
                            {expandedSection === 'ANNEXURE_II' ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
                        </button>
                        
                        {expandedSection === 'ANNEXURE_II' && (
                            <div className="p-6 border-t border-slate-200 animate-in slide-in-from-top-2">
                                <div className="flex gap-4 mb-6">
                                <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                                    Total Annual Salary: ₹ 221.04 Cr
                                </div>
                                <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">
                                    Total Deductions u/s VI-A: ₹ 18.42 Cr
                                </div>
                                </div>
                                <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3">PAN</th>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Period</th>
                                        <th className="px-4 py-3 text-right">Gross Salary YTD</th>
                                        <th className="px-4 py-3 text-right">Exemptions</th>
                                        <th className="px-4 py-3 text-right">Taxable Income</th>
                                        <th className="px-4 py-3 text-right">TDS YTD</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-100">
                                        <td className="px-4 py-3 font-mono text-slate-600">AAAPA1234B</td>
                                        <td className="px-4 py-3 font-bold text-slate-700">Priya Sharma</td>
                                        <td className="px-4 py-3 text-slate-500">Apr 25 - Mar 26</td>
                                        <td className="px-4 py-3 text-right">₹ 90,00,000</td>
                                        <td className="px-4 py-3 text-right text-emerald-600">₹ 2,25,000</td>
                                        <td className="px-4 py-3 text-right">₹ 87,75,000</td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-800">₹ 12,60,000</td>
                                    </tr>
                                </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Annexure III */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <button 
                        onClick={() => toggleSection('ANNEXURE_III')}
                        className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                    >
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">Annexure III - Challan Details</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Tax payment vouchers for the quarter</p>
                        </div>
                        {expandedSection === 'ANNEXURE_III' ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
                    </button>
                    
                    {expandedSection === 'ANNEXURE_III' && (
                        <div className="p-6 border-t border-slate-200 animate-in slide-in-from-top-2">
                            <div className="flex gap-4 mb-6">
                            <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-100">
                                Challans: 3
                            </div>
                            <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">
                                Total Deposited: ₹ 6.54 Cr
                            </div>
                            <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-100">
                                Pending: 0
                            </div>
                            </div>
                            <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">CIN</th>
                                    <th className="px-4 py-3">BSR Code</th>
                                    <th className="px-4 py-3">Serial No.</th>
                                    <th className="px-4 py-3">Deposit Date</th>
                                    <th className="px-4 py-3 text-right">TDS Amount</th>
                                    <th className="px-4 py-3 text-right">Surcharge</th>
                                    <th className="px-4 py-3 text-right">Cess</th>
                                    <th className="px-4 py-3 text-right">Interest</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-100">
                                    <td className="px-4 py-3 font-mono text-slate-600">123456789</td>
                                    <td className="px-4 py-3 font-mono text-slate-600">0260001</td>
                                    <td className="px-4 py-3 font-mono text-slate-600">00005</td>
                                    <td className="px-4 py-3 text-slate-700 font-medium">07 Dec 2025</td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-800">₹ 2.18 Cr</td>
                                    <td className="px-4 py-3 text-right">₹ 0</td>
                                    <td className="px-4 py-3 text-right text-slate-600">4%</td>
                                    <td className="px-4 py-3 text-right text-rose-600">₹ 0</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="px-4 py-3 font-mono text-slate-600">987654321</td>
                                    <td className="px-4 py-3 font-mono text-slate-600">0260001</td>
                                    <td className="px-4 py-3 font-mono text-slate-600">00004</td>
                                    <td className="px-4 py-3 text-slate-700 font-medium">07 Nov 2025</td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-800">₹ 2.18 Cr</td>
                                    <td className="px-4 py-3 text-right">₹ 0</td>
                                    <td className="px-4 py-3 text-right text-slate-600">4%</td>
                                    <td className="px-4 py-3 text-right text-rose-600">₹ 0</td>
                                </tr>
                            </tbody>
                            </table>
                        </div>
                    )}
                </div>
                </div>
            )}

            {/* 3. Bottom Section: Actions & Generation */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleValidation}
                        disabled={validationStatus === 'VALID' || generationStatus !== 'IDLE'}
                        className={`px-4 py-2 border rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                        validationStatus === 'VALID' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 cursor-default'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        {validationStatus === 'CHECKING' ? (
                        <RefreshCw size={16} className="animate-spin"/>
                        ) : validationStatus === 'VALID' ? (
                        <Check size={16}/> 
                        ) : (
                        <ShieldCheck size={16}/> 
                        )}
                        {validationStatus === 'CHECKING' ? 'Validating...' : validationStatus === 'VALID' ? '0 Errors Found' : (isNilReturn ? 'Validate NIL Declaration' : 'Check for Errors')}
                    </button>
                    
                    {validationStatus === 'VALID' && (
                        <div className="animate-in fade-in slide-in-from-left-2 text-xs font-medium text-emerald-600">
                        Data validated successfully. Ready for generation.
                        </div>
                    )}
                    {validationStatus === 'ERROR' && (
                        <div className="animate-in fade-in slide-in-from-left-2 text-xs font-bold text-rose-600 flex items-center gap-1">
                        <AlertTriangle size={12}/> 3 Missing PANs found. Please correct in Employee Master.
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={12} />
                    <span>Due Date: 31 Jan 2026</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 pt-6 border-t border-slate-100">
                {generationStatus === 'DONE' ? (
                    <div className="flex-1 w-full flex items-center justify-between animate-in zoom-in duration-300 bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-full text-emerald-600 shadow-sm"><Check size={20} strokeWidth={3}/></div>
                        <div>
                            <h4 className="font-bold text-emerald-800">File Generated Successfully!</h4>
                            <p className="text-xs text-emerald-600">24Q_Q3_2025-26.fvu</p>
                        </div>
                        </div>
                        <div className="flex items-center gap-3">
                        <button 
                            onClick={() => downloadFile(`24Q_${quarter}_2025-26.fvu`)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 flex items-center gap-2"
                        >
                            <Download size={16}/> Download 24Q File
                        </button>
                        <div className="flex items-center gap-2 ml-4 border-l border-emerald-200 pl-4">
                            <label className="text-sm font-bold text-emerald-800 cursor-pointer">Mark as Filed</label>
                            <div 
                                onClick={() => setMarkAsFiled(!markAsFiled)}
                                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${markAsFiled ? 'bg-emerald-600' : 'bg-emerald-200'}`}
                            >
                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${markAsFiled ? 'translate-x-5' : ''}`}></div>
                            </div>
                        </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded text-purple-600 focus:ring-purple-500" />
                            <span className="text-sm text-slate-600">Include CSI File (Challan Status Inquiry)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500" />
                            <span className="text-sm text-slate-600">Export as TXT/CSV for NSDL FVU Tool</span>
                        </label>
                        </div>
                        <button 
                        onClick={handleGeneration}
                        disabled={validationStatus !== 'VALID' || generationStatus === 'GENERATING'}
                        className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95 ${
                            validationStatus !== 'VALID' 
                            ? 'bg-slate-300 cursor-not-allowed shadow-none hover:transform-none' 
                            : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                        }`}
                        >
                        {generationStatus === 'GENERATING' ? (
                            <>
                                <RefreshCw size={18} className="animate-spin"/> Generating FVU...
                            </>
                        ) : (
                            <>
                                <FileSpreadsheet size={18}/> Generate FVU File
                            </>
                        )}
                        </button>
                    </>
                )}
            </div>
            </div>

            {/* Info Banner */}
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Compliance Warning:</strong> Ensure all employee PANs, declarations, and challans are updated before generation. 
                Late filing penalty is ₹200/day plus 1.5% interest per month on the tax amount.
            </p>
            </div>
        </div>
        </>
      ) : (
      /* --- HISTORY VIEW CONTENT --- */
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Financial Year</th>
                            <th className="px-6 py-4">Quarter</th>
                            <th className="px-6 py-4">Filing Date</th>
                            <th className="px-6 py-4">Token / Ack No.</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {MOCK_24Q_HISTORY.map((ret) => (
                            <tr key={ret.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-800">{ret.fy}</td>
                                <td className="px-6 py-4 text-slate-700">{ret.quarter}</td>
                                <td className="px-6 py-4 flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-400" />
                                    {ret.filedDate}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{ret.ackNo}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-100">
                                        <CheckCircle size={12} /> {ret.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => downloadFile(ret.fileName)}
                                            className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-purple-600 hover:border-purple-200 rounded-lg transition-colors"
                                            title="Download FVU File"
                                        >
                                            <Download size={16} />
                                        </button>
                                        <button 
                                            onClick={() => downloadFile(`Receipt_${ret.ackNo}.pdf`)}
                                            className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 rounded-lg transition-colors"
                                            title="Download Receipt"
                                        >
                                            <FileText size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
          </div>
      </div>
      )}

      {/* Annexure Detail Modal Overlay */}
      {showAnnexureDetails && (
          <Annexure1DetailsModal onClose={() => setShowAnnexureDetails(false)} />
      )}
    </div>
  );
};

const PayrollManager: React.FC = () => {
  const [view, setView] = useState<'HISTORY' | 'WIZARD'>('HISTORY');
  const [showUnlockModal, setShowUnlockModal] = useState<string | null>(null);
  const [showLockModal, setShowLockModal] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<PastPayroll | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState<PastPayroll | null>(null);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showForm24QModal, setShowForm24QModal] = useState(false);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Locked': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Draft': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Failed': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  const handleUnlockConfirm = () => {
    setShowUnlockModal(null);
    setView('WIZARD'); 
  };

  const handleLockConfirm = () => {
      setShowLockModal(null);
      // In real app, would trigger locking logic
  }

  if (view === 'WIZARD') {
    return (
      <RunPayrollModal 
        isPage={true} 
        company={MOCK_COMPANIES[0]} 
        onClose={() => setView('HISTORY')}
      />
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payroll Runs</h1>
          <p className="text-slate-500 mt-1">Review past disbursements and manage current payroll processing.</p>
        </div>
        <button 
          onClick={() => setView('WIZARD')}
          className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-100 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95"
        >
          <Plus size={20} /> Initiate Payroll
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Cycle</p>
            <p className="text-xl font-bold text-slate-800">Nov 2025</p>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-orange-600">
               <Clock size={14} /> Pending Submission
            </div>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payout (YTD)</p>
            <p className="text-xl font-bold text-slate-800">₹ 16.52 Cr</p>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
               <CheckCircle size={14} /> 10 Cycles Paid
            </div>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Monthly Cost</p>
            <p className="text-xl font-bold text-slate-800">₹ 1.80 Cr</p>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-slate-500">
               <Users size={14} /> 450 Employees
            </div>
         </div>
         
         {/* Critical Payroll Issues Card */}
         <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-sm relative group">
            <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Critical Payroll Issues</p>
                <button 
                    onClick={() => setShowAlertsModal(true)}
                    className="text-rose-400 hover:text-rose-600 transition-colors p-1 hover:bg-rose-100 rounded"
                    title="View Critical Issues"
                >
                    <Eye size={16} />
                </button>
            </div>
            <p className="text-xl font-bold text-slate-800">3 Alerts</p>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-rose-600">
               <AlertCircle size={14} /> Action Required
            </div>
         </div>

         {/* Form 24Q TDS Return Card */}
         <div className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-sm relative group">
            <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Form 24Q TDS Return</p>
                <button 
                    onClick={() => setShowForm24QModal(true)}
                    className="text-blue-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-100 rounded"
                    title="View Details"
                >
                    <Eye size={16} />
                </button>
            </div>
            <p className="text-xl font-bold text-slate-800">Q3 Filing</p>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-orange-600">
               <Clock size={14} /> Due Jan 31st
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          
          {/* Toolbar */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-4 w-full sm:w-auto">
                <h2 className="text-lg font-bold text-slate-800">Payroll History</h2>
                <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search by month or ID..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                </div>
             </div>
             <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                    <Download size={16} /> Export History
                </button>
             </div>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50/50 text-[11px] font-black uppercase text-slate-400 border-b border-slate-100">
                   <tr>
                      <th className="px-8 py-4">Payroll Month</th>
                      <th className="px-6 py-4">Employees</th>
                      <th className="px-6 py-4">Gross Amount</th>
                      <th className="px-6 py-4">Net Payout</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right pr-8">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {/* Special row for current pending payroll */}
                   <tr className="bg-purple-50/20 group hover:bg-purple-50/40 transition-colors">
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold shadow-sm">N</div>
                            <div>
                               <div className="font-black text-slate-800">November 2025</div>
                               <div className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">In Progress</div>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-slate-600">452</td>
                      <td className="px-6 py-5 font-bold text-slate-800">₹ 1.85 Cr (Est)</td>
                      <td className="px-6 py-5 font-bold text-emerald-700">₹ 1.42 Cr (Est)</td>
                      <td className="px-6 py-5">
                         <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-100">Draft</span>
                      </td>
                      <td className="px-6 py-5 text-right pr-8">
                         <div className="flex items-center justify-end gap-2">
                             <button 
                                onClick={() => setView('WIZARD')}
                                className="p-2 hover:bg-white hover:text-purple-600 rounded-lg text-slate-400 transition-colors shadow-sm border border-transparent hover:border-slate-200" 
                                title="Edit Draft"
                             >
                                <Edit2 size={16} />
                             </button>
                             <button 
                                onClick={() => setShowLockModal('Nov 2025')}
                                className="p-2 hover:bg-white hover:text-emerald-600 rounded-lg text-slate-400 transition-colors shadow-sm border border-transparent hover:border-slate-200" 
                                title="Lock Payroll"
                             >
                                <Lock size={16} />
                             </button>
                             <button 
                                onClick={() => setView('WIZARD')}
                                className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-black hover:bg-purple-700 transition-all flex items-center gap-1.5 ml-2 shadow-md shadow-purple-100"
                              >
                                Continue <ArrowRight size={14} />
                             </button>
                         </div>
                      </td>
                   </tr>

                   {/* Past Payrolls */}
                   {MOCK_HISTORY.map((payroll) => (
                      <tr key={payroll.id} className="hover:bg-slate-50 transition-colors group">
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold">{payroll.month.charAt(0)}</div>
                               <div>
                                  <div className="font-bold text-slate-700">{payroll.month}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">ID: {payroll.id}</div>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-5 text-slate-600 font-medium">{payroll.employeeCount}</td>
                         <td className="px-6 py-5 text-slate-800 font-bold">{payroll.grossAmount}</td>
                         <td className="px-6 py-5 text-slate-800 font-black">{payroll.netPay}</td>
                         <td className="px-6 py-5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(payroll.status)}`}>
                               {payroll.status}
                            </span>
                         </td>
                         <td className="px-6 py-5 text-right pr-8">
                            <div className="flex items-center justify-end gap-2">
                               <button 
                                 onClick={() => setShowDetailsModal(payroll)}
                                 className="p-2 hover:bg-white hover:text-indigo-600 rounded-lg text-slate-400 transition-colors shadow-sm border border-transparent hover:border-slate-200" 
                                 title="View Details"
                               >
                                  <Eye size={16} />
                               </button>
                               <button 
                                 onClick={() => setView('WIZARD')}
                                 className="p-2 hover:bg-white hover:text-purple-600 rounded-lg text-slate-400 transition-colors shadow-sm border border-transparent hover:border-slate-200" 
                                 title="Edit Payroll"
                               >
                                  <Edit2 size={16} />
                               </button>
                               <button 
                                 onClick={() => setShowUnlockModal(payroll.id)}
                                 className="p-2 hover:bg-white hover:text-amber-600 rounded-lg text-slate-400 transition-colors shadow-sm border border-transparent hover:border-slate-200" 
                                 title="Unlock to Edit"
                               >
                                  <Unlock size={16} />
                               </button>
                               <button 
                                 onClick={() => setShowDownloadModal(payroll)}
                                 className="p-2 hover:bg-white hover:text-slate-800 rounded-lg text-slate-400 transition-colors shadow-sm border border-transparent hover:border-slate-200"
                                 title="Download Reports"
                               >
                                  <Download size={16} />
                                </button>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>

          {/* Footer Pagination */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center text-xs font-medium text-slate-500">
             <span>Showing 6 of 24 payroll cycles</span>
             <div className="flex gap-2">
                <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors">Previous</button>
                <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-white transition-colors">Next</button>
             </div>
          </div>
      </div>

      {/* --- OVERLAYS / MODALS --- */}

      {/* Payroll Alerts Modal */}
      <PayrollAlertsModal 
        isOpen={showAlertsModal} 
        onClose={() => setShowAlertsModal(false)} 
      />

      {/* Form 24Q Details Modal */}
      {showForm24QModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
              <Form24QModalContent onClose={() => setShowForm24QModal(false)} />
          </div>
      )}

      {/* Unlock Confirmation */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-8 text-center border-t-8 border-amber-500">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Unlock size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Unlock Payroll Run?</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                 Unlocking a completed payroll will allow you to make changes to adjustments, attendance, and bonuses. <br/><br/>
                 <span className="text-rose-600 font-bold">Caution:</span> Existing payslips for this period may become invalid.
              </p>
              <div className="flex gap-3">
                 <button 
                   onClick={() => setShowUnlockModal(null)}
                   className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                 >
                    Cancel
                 </button>
                 <button 
                   onClick={handleUnlockConfirm}
                   className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 shadow-lg shadow-amber-100 transition-all flex items-center justify-center gap-2"
                 >
                    <Unlock size={18} /> Confirm Unlock
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Lock Confirmation (for draft) */}
      {showLockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-8 text-center border-t-8 border-indigo-600">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Lock Payroll Cycle?</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                 You are about to lock the payroll for <strong>{showLockModal}</strong>. Once locked, the calculations will be finalized and bank files will be generated.
              </p>
              <div className="flex gap-3">
                 <button 
                   onClick={() => setShowLockModal(null)}
                   className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                 >
                    Cancel
                 </button>
                 <button 
                   onClick={handleLockConfirm}
                   className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                 >
                    <Lock size={18} /> Finalize & Lock
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
               <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Calendar size={18}/></div>
                     <div>
                        <h3 className="font-bold text-slate-800">Payroll Details: {showDetailsModal.month}</h3>
                        <p className="text-xs text-slate-500">Cycle ID: {showDetailsModal.id}</p>
                     </div>
                  </div>
                  <button onClick={() => setShowDetailsModal(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={20}/></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  <div className="grid grid-cols-3 gap-6">
                     <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Gross</p>
                        <p className="text-xl font-bold text-indigo-900">{showDetailsModal.grossAmount}</p>
                     </div>
                     <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Net Payout</p>
                        <p className="text-xl font-bold text-emerald-900">{showDetailsModal.netPay}</p>
                     </div>
                     <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Employees</p>
                        <p className="text-xl font-bold text-purple-900">{showDetailsModal.employeeCount}</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Component Breakdown</h4>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-600">Basic Salary</span>
                           <span className="font-bold text-slate-800">₹ 85,20,000</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-600">House Rent Allowance (HRA)</span>
                           <span className="font-bold text-slate-800">₹ 42,60,000</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-600">Provident Fund (Employer)</span>
                           <span className="font-bold text-slate-800">₹ 10,22,400</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t border-dashed border-slate-200 pt-3">
                           <span className="text-slate-800 font-bold">Income Tax (TDS) Deducted</span>
                           <span className="font-black text-rose-600">- ₹ 15,40,000</span>
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Audit Trail</h4>
                     <div className="space-y-4">
                        <div className="flex gap-3">
                           <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500"></div>
                           <p className="text-xs text-slate-600"><span className="font-bold">Payments released</span> via ICICI bulk transfer by Kavita Sharma on {showDetailsModal.processedDate} at 4:30 PM.</p>
                        </div>
                        <div className="flex gap-3">
                           <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-300"></div>
                           <p className="text-xs text-slate-600"><span className="font-bold">Payslips distributed</span> to 448 employees via email on {showDetailsModal.processedDate}.</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                  <button onClick={() => setShowDetailsModal(null)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50">Close</button>
                  <button 
                    onClick={() => { setShowDetailsModal(null); setShowDownloadModal(showDetailsModal); }}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-100 flex items-center gap-2"
                  >
                     <Download size={16} /> Download Options
                  </button>
               </div>
            </div>
        </div>
      )}

      {/* Download Options Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
               <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                   <h3 className="font-bold text-slate-800">Download Reports: {showDownloadModal.month}</h3>
                   <button onClick={() => setShowDownloadModal(null)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
               </div>
               <div className="p-6 space-y-3">
                   <button className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group text-left">
                       <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition-colors"><FileText size={20}/></div>
                       <div className="flex-1">
                           <p className="text-sm font-bold text-slate-700">Payroll Register (Excel)</p>
                           <p className="text-xs text-slate-400">Complete summary of earnings & deductions</p>
                       </div>
                       <Download size={16} className="text-slate-300 group-hover:text-indigo-500" />
                   </button>
                   <button className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all group text-left">
                       <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-200 transition-colors"><FileSpreadsheet size={20}/></div>
                       <div className="flex-1">
                           <p className="text-sm font-bold text-slate-700">Bank Transfer File (CSV)</p>
                           <p className="text-xs text-slate-400">Standard format for bank bulk transfers</p>
                       </div>
                       <Download size={16} className="text-slate-300 group-hover:text-emerald-500" />
                   </button>
                   <button className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all group text-left">
                       <div className="p-2 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-200 transition-colors"><FileArchive size={20}/></div>
                       <div className="flex-1">
                           <p className="text-sm font-bold text-slate-700">All Payslips (ZIP)</p>
                           <p className="text-xs text-slate-400">Bundled PDFs for all 452 employees</p>
                       </div>
                       <Download size={16} className="text-slate-300 group-hover:text-orange-500" />
                   </button>
               </div>
               <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                   <button onClick={() => setShowDownloadModal(null)} className="px-4 py-2 text-slate-600 font-medium text-sm hover:bg-white rounded-lg transition-all">Close</button>
               </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default PayrollManager;
