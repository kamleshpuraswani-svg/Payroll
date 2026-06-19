
import React, { useState, useRef, useEffect, useMemo } from 'react';
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
    ArrowLeft,
    Upload,
    User,
    Send,
    Info,
    PauseCircle,
    Calculator,
    Minus
} from 'lucide-react';
import { RunPayrollModal, PayrollAlertsModal, PayrollOnHoldPanel } from './CompanyActionModals';
import { MOCK_COMPANIES } from '../constants';
import { supabase } from '../services/supabaseClient';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

interface PastPayroll {
    id: string;
    month: string;
    businessUnit: string;
    processedDate: string;
    employeeCount: number;
    grossAmount: string;
    totalDeductions: string;
    holdAmount?: string;
    netPay: string;
    status: 'Paid' | 'Locked' | 'Draft' | 'Failed';
    createdBy: string;
    lastModifiedBy: string;
    payrollType?: 'Regular Monthly' | 'F&F Settlement';
}

const MOCK_HISTORY: PastPayroll[] = [
    { id: 'PR-102', month: 'October 2025', businessUnit: 'Mindinventory', processedDate: '31 Oct 2025', employeeCount: 448, grossAmount: '₹ 1.82 Cr', totalDeductions: '₹ 42.00 L', holdAmount: '₹ 1.20 L', netPay: '₹ 1.40 Cr', status: 'Paid', createdBy: 'Admin', lastModifiedBy: 'HR Manager', payrollType: 'Regular Monthly' },
    { id: 'PR-101', month: 'September 2025', businessUnit: '300 Minds', processedDate: '30 Sep 2025', employeeCount: 445, grossAmount: '₹ 1.80 Cr', totalDeductions: '₹ 42.00 L', holdAmount: '₹ 0.00', netPay: '₹ 1.38 Cr', status: 'Paid', createdBy: 'Admin', lastModifiedBy: 'HR Manager', payrollType: 'Regular Monthly' },
    { id: 'PR-100', month: 'August 2025', businessUnit: 'CollabCRM', processedDate: '31 Aug 2025', employeeCount: 440, grossAmount: '₹ 1.78 Cr', totalDeductions: '₹ 42.00 L', holdAmount: '₹ 80,000', netPay: '₹ 1.36 Cr', status: 'Paid', createdBy: 'Admin', lastModifiedBy: 'HR Manager', payrollType: 'Regular Monthly' },
    { id: 'PR-099', month: 'July 2025', businessUnit: 'Dots & Boxes', processedDate: '31 Jul 2025', employeeCount: 435, grossAmount: '₹ 1.75 Cr', totalDeductions: '₹ 41.00 L', holdAmount: '₹ 0.00', netPay: '₹ 1.34 Cr', status: 'Paid', createdBy: 'Admin', lastModifiedBy: 'HR Manager', payrollType: 'Regular Monthly' },
    { id: 'PR-098', month: 'June 2025', businessUnit: 'Mindinventory', processedDate: '30 Jun 2025', employeeCount: 432, grossAmount: '₹ 1.72 Cr', totalDeductions: '₹ 40.00 L', holdAmount: '₹ 1.50 L', netPay: '₹ 1.32 Cr', status: 'Paid', createdBy: 'Admin', lastModifiedBy: 'HR Manager', payrollType: 'Regular Monthly' },
];

const MOCK_24Q_HISTORY = [
    { id: 'RET-001', fy: '2025-26', quarter: 'Q2 (Jul-Sep)', filedDate: '31 Oct 2025', ackNo: '3456789012', status: 'Filed', fileName: '24Q_Q2_2526.fvu' },
    { id: 'RET-002', fy: '2025-26', quarter: 'Q1 (Apr-Jun)', filedDate: '31 Jul 2025', ackNo: '9876543210', status: 'Filed', fileName: '24Q_Q1_2526.fvu' },
    { id: 'RET-003', fy: '2024-25', quarter: 'Q4 (Jan-Mar)', filedDate: '31 May 2025', ackNo: '1234567890', status: 'Filed', fileName: '24Q_Q4_2425.fvu' },
    { id: 'RET-004', fy: '2024-25', quarter: 'Q3 (Oct-Dec)', filedDate: '31 Jan 2025', ackNo: '1122334455', status: 'Filed', fileName: '24Q_Q3_2425.fvu' },
];

// --- Sub-Modal: Form 16 Distribution ---
const DistributeForm16Modal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [selectedFY, setSelectedFY] = useState('2024-25');
    const [isUploading, setIsUploading] = useState(false);
    const [mappingStep, setMappingStep] = useState<'LIST' | 'IMPORT' | 'PREVIEW'>('LIST');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const manualFileInputRef = useRef<HTMLInputElement>(null);
    const [targetEmpId, setTargetEmpId] = useState<string | null>(null);

    // Mock data for distributed Form 16
    const [form16History, setForm16History] = useState([
        { id: 'F16-101', name: 'Arjun Mehta', pan: 'ABCDE1234F', status: 'Delivered', year: '2024-25', date: '15 Jun 2025' },
        { id: 'F16-102', name: 'Priya Sharma', pan: 'FGHIJ5678K', status: 'Delivered', year: '2024-25', date: '15 Jun 2025' },
        { id: 'F16-103', name: 'Rohan Desai', pan: 'KLMNO9012P', status: 'Opened', year: '2023-24', date: '12 Jun 2024' },
        { id: 'F16-104', name: 'Neha Kapoor', pan: '', status: 'Error', errorMsg: 'Missing PAN', year: '2024-25', date: '-' },
    ]);

    const handleImport = () => {
        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            setMappingStep('PREVIEW');
        }, 1500);
    };

    const handleManualUploadClick = (id: string) => {
        setTargetEmpId(id);
        manualFileInputRef.current?.click();
    };

    const handleManualFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && targetEmpId) {
            // Simulate sending/uploading
            setForm16History(prev => prev.map(h => h.id === targetEmpId ? {
                ...h,
                status: 'Delivered',
                date: 'Just now',
                errorMsg: undefined
            } : h));
            setTargetEmpId(null);
            if (e.target) e.target.value = '';
        }
    };

    const handleSend = (id: string) => {
        // Simulate re-sending or uploading for a successfully mapped employee
        setForm16History(prev => prev.map(h => h.id === id ? {
            ...h,
            status: 'Delivered',
            date: 'Resent Just now'
        } : h));
    };

    const filteredHistory = form16History.filter(h => h.year === selectedFY);

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Hidden Manual File Input */}
                <input
                    type="file"
                    ref={manualFileInputRef}
                    className="hidden"
                    onChange={handleManualFileChange}
                    accept=".pdf"
                />

                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm"><FileText size={24} /></div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Distribute Form 16</h3>
                            <p className="text-xs text-slate-500 font-medium">Bulk map and send TDS certificates to employee accounts</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                </div>

                <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Financial Year</label>
                            <div className="relative">
                                <select
                                    value={selectedFY}
                                    onChange={(e) => setSelectedFY(e.target.value)}
                                    className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="2025-26">FY 2025-26</option>
                                    <option value="2024-25">FY 2024-25</option>
                                    <option value="2023-24">FY 2023-24</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div className="h-10 w-px bg-slate-200 mx-2"></div>
                        <div className="flex gap-2">
                            <input type="file" ref={fileInputRef} className="hidden" accept=".zip,.pdf" multiple onChange={handleImport} />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                            >
                                <Upload size={16} /> Import Form 16 (ZIP/PDF)
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-xs font-bold text-blue-700">
                        <Info size={14} />
                        Files are auto-mapped using PAN number
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-white">
                    {isUploading ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 animate-in fade-in zoom-in-95">
                            <div className="relative mb-6">
                                <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-indigo-600 font-bold">
                                    <FileArchive size={28} />
                                </div>
                            </div>
                            <h4 className="text-xl font-bold text-slate-800">Processing Upload...</h4>
                            <p className="text-sm text-slate-500 mt-2">Extracting certificates and matching PAN identifiers</p>
                        </div>
                    ) : mappingStep === 'PREVIEW' ? (
                        <div className="p-8 space-y-6 animate-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <h4 className="font-bold text-slate-800">Imported Results (352 files)</h4>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-full border border-emerald-100">348 Mapped</span>
                                    <span className="px-3 py-1 bg-rose-50 text-rose-700 text-[10px] font-black uppercase rounded-full border border-rose-100">4 Errors</span>
                                </div>
                            </div>
                            <table className="w-full text-left text-sm">
                                <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <tr>
                                        <th className="px-4 py-3">Employee Name</th>
                                        <th className="px-4 py-3">PAN</th>
                                        <th className="px-4 py-3">Form 16 PAN</th>
                                        <th className="px-4 py-3">Employee Name (as per Form 16)</th>
                                        <th className="px-4 py-3">Matched File</th>
                                        <th className="px-4 py-3">Mapping Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <tr className="hover:bg-slate-50">
                                        <td className="px-4 py-4 font-bold text-slate-700">Priya Sharma</td>
                                        <td className="px-4 py-4 font-mono text-slate-500">ABCDE1234F</td>
                                        <td className="px-4 py-4 font-mono text-slate-600">ABCDE1234F</td>
                                        <td className="px-4 py-4 text-slate-700">PRIYA SHARMA</td>
                                        <td className="px-4 py-4 text-slate-400 font-mono text-xs">ABCDE1234F_F16.pdf</td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                <Check size={12} /> Success
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button
                                                onClick={() => setMappingStep('LIST')}
                                                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5 ml-auto"
                                            >
                                                <Send size={12} /> Send
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="bg-rose-50/30">
                                        <td className="px-4 py-4 font-bold text-slate-700">Neha Kapoor</td>
                                        <td className="px-4 py-4 font-mono text-rose-500 italic">Not in Profile</td>
                                        <td className="px-4 py-4 font-mono text-slate-600">XYZAB9876C</td>
                                        <td className="px-4 py-4 text-slate-700">NEHA KAPOOR</td>
                                        <td className="px-4 py-4 text-slate-400 font-mono text-xs">XYZ123_NEHA.pdf</td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-rose-600 bg-rose-100/50 px-2 py-0.5 rounded-full border border-rose-200">
                                                <AlertTriangle size={12} /> Unmapped
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button
                                                onClick={() => handleManualUploadClick('F16-104')}
                                                className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 rounded-lg text-[10px] font-black uppercase hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5 ml-auto"
                                            >
                                                <Upload size={12} /> Upload Manually
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="flex justify-end gap-3 pt-6">
                                <button onClick={() => setMappingStep('LIST')} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors">Back to List</button>
                                <button onClick={() => setMappingStep('LIST')} className="px-8 py-2.5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center gap-2">
                                    <Send size={16} /> Publish All to Employee Accounts
                                </button>
                            </div>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5">Employee</th>
                                    <th className="px-6 py-5">PAN Number</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5">Year</th>
                                    <th className="px-6 py-5">Distribution Date</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredHistory.map((h) => (
                                    <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-800">{h.name}</div>
                                        </td>
                                        <td className="px-6 py-5 font-mono text-xs text-slate-600">
                                            {h.pan || <span className="text-rose-500 font-black italic">MISSING PAN</span>}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${h.status === 'Delivered' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                h.status === 'Opened' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    'bg-rose-50 text-rose-700 border-rose-100'
                                                }`}>
                                                {h.status === 'Error' ? <AlertCircle size={10} /> : <Check size={10} />} {h.status}
                                            </span>
                                            {h.errorMsg && <p className="text-[9px] text-rose-500 font-bold mt-1 uppercase">{h.errorMsg}</p>}
                                        </td>
                                        <td className="px-6 py-5 text-slate-600 font-medium">{h.year}</td>
                                        <td className="px-6 py-5 text-slate-400">{h.date}</td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {h.status === 'Error' ? (
                                                    <button
                                                        onClick={() => handleManualUploadClick(h.id)}
                                                        className="px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-[10px] font-black uppercase hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
                                                    >
                                                        <Upload size={12} /> Upload Manually
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSend(h.id)}
                                                        className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-indigo-700 transition-all shadow-sm flex items-center justify-center gap-1.5"
                                                    >
                                                        <Send size={12} /> Send
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

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
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input type="text" placeholder="Search PAN or Name..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500" />
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
        const file = new Blob([`Content for ${fileName}\nVer: 1.0\n...`], { type: 'text/plain' });
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
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileSpreadsheet size={20} /></div>
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
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
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
                                                {expandedSection === 'ANNEXURE_I' ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
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
                                            {expandedSection === 'ANNEXURE_II' ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
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
                                        {expandedSection === 'ANNEXURE_III' ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
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
                                        className={`px-4 py-2 border rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${validationStatus === 'VALID'
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 cursor-default'
                                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                            }`}
                                    >
                                        {validationStatus === 'CHECKING' ? (
                                            <RefreshCw size={16} className="animate-spin" />
                                        ) : validationStatus === 'VALID' ? (
                                            <Check size={16} />
                                        ) : (
                                            <ShieldCheck size={16} />
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
                                            <AlertTriangle size={12} /> 3 Missing PANs found. Please correct in Employee Master.
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
                                            <div className="p-2 bg-white rounded-full text-emerald-600 shadow-sm"><Check size={20} strokeWidth={3} /></div>
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
                                                <Download size={16} /> Download 24Q File
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
                                            className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95 ${validationStatus !== 'VALID'
                                                ? 'bg-slate-300 cursor-not-allowed shadow-none hover:transform-none'
                                                : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                                                }`}
                                        >
                                            {generationStatus === 'GENERATING' ? (
                                                <>
                                                    <RefreshCw size={18} className="animate-spin" /> Generating FVU...
                                                </>
                                            ) : (
                                                <>
                                                    <FileSpreadsheet size={18} /> Generate FVU File
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

interface PayrollManagerProps {
    userRole?: string;
}

const PayrollManager: React.FC<PayrollManagerProps> = ({ userRole }) => {
    const [view, setView] = useState<'HISTORY' | 'WIZARD'>('HISTORY');
    const [showUnlockModal, setShowUnlockModal] = useState<string | null>(null);
    const [showLockModal, setShowLockModal] = useState<string | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState<PastPayroll | null>(null);
    const [showDownloadModal, setShowDownloadModal] = useState<PastPayroll | null>(null);
    const [showAlertsModal, setShowAlertsModal] = useState(false);
    const [showOnHoldPanel, setShowOnHoldPanel] = useState(false);
    const [showForm24QModal, setShowForm24QModal] = useState(false);
    const [showForm16Modal, setShowForm16Modal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [unlockedPayrolls, setUnlockedPayrolls] = useState<string[]>([]);
    const [wizardBU, setWizardBU] = useState<string[]>([]);
    const [novPayrollStatus, setNovPayrollStatus] = useState<'Draft' | 'Locked' | 'Paid'>('Draft');
    const [novPayrollType, setNovPayrollType] = useState<'Regular Monthly' | 'F&F Settlement'>('Regular Monthly');
    const [wizardReadOnly, setWizardReadOnly] = useState(false);
    const [wizardInitialStep, setWizardInitialStep] = useState(1);
    const [unlockedRegularMonthly, setUnlockedRegularMonthly] = useState(false);
    const [unlockStep, setUnlockStep] = useState<number>(3);
    const [unlockReason, setUnlockReason] = useState<string>('');

    useEffect(() => {
        if (showUnlockModal) {
            setUnlockStep(3);
            setUnlockReason('');
        }
    }, [showUnlockModal]);

    const [searchTerm, setSearchTerm] = useState('');

    // FIELDS configuration for Lookup Filter
    const FIELDS = [
        { name: 'Payroll Month', icon: Calendar },
        { name: 'Business Unit', icon: Users },
        { name: 'Payroll Type', icon: FileText },
        { name: 'Status', icon: CheckCircle }
    ];

    // Lookup Filter States
    const [completedFilters, setCompletedFilters] = useState<any[]>([]);
    const [currentField, setCurrentField] = useState<string | null>(null);
    const [currentOperator, setCurrentOperator] = useState<string | null>(null);
    const [tempValues, setTempValues] = useState<string[]>([]);
    const [tempContainsText, setTempContainsText] = useState('');
    const [valSearchQuery, setValSearchQuery] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Click outside hook
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const combinedPayrolls = useMemo<PastPayroll[]>(() => {
        const currentPayroll: PastPayroll = {
            id: 'Nov-2025-Pending',
            month: 'November 2025',
            businessUnit: 'Mindinventory, 300 Minds',
            processedDate: 'N/A',
            employeeCount: 452,
            grossAmount: '₹ 1.85 Cr',
            totalDeductions: '₹ 43.00 L',
            holdAmount: '₹ 1.50 L',
            netPay: '₹ 1.42 Cr',
            status: novPayrollStatus,
            createdBy: 'Admin',
            lastModifiedBy: 'HR Manager',
            payrollType: novPayrollType
        };
        return [currentPayroll, ...MOCK_HISTORY];
    }, [novPayrollStatus, novPayrollType]);

    const getOptionsForField = (field: string) => {
        if (field === 'Status') {
            return ['Draft', 'Locked', 'Paid', 'Failed'];
        }
        if (field === 'Payroll Type') {
            return ['Regular Monthly', 'F&F Settlement'];
        }
        
        const uniqueValues = new Set<string>();
        combinedPayrolls.forEach(p => {
            if (field === 'Payroll Month' && p.month) {
                uniqueValues.add(p.month);
            } else if (field === 'Business Unit' && p.businessUnit) {
                uniqueValues.add(p.businessUnit);
            }
        });
        
        return Array.from(uniqueValues).filter(Boolean).sort();
    };

    const selectField = (field: string) => {
        setCurrentField(field);
        setCurrentOperator(null);
        setTempValues([]);
        setValSearchQuery('');
    };

    const selectOperator = (operator: string) => {
        setCurrentOperator(operator);
        setTempValues([]);
        setValSearchQuery('');
    };

    const toggleTempValue = (val: string) => {
        setTempValues(prev => 
            prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
        );
    };

    const applyCurrentFilter = () => {
        if (currentField && currentOperator) {
            const vals = tempValues;
            if (vals.length > 0) {
                setCompletedFilters(prev => [
                    ...prev,
                    {
                        id: Math.random().toString(),
                        field: currentField,
                        operator: currentOperator,
                        values: vals
                    }
                ]);
                setCurrentField(null);
                setCurrentOperator(null);
                setTempValues([]);
                setTempContainsText('');
                setValSearchQuery('');
                setDropdownOpen(false);
            }
        }
    };

    const cancelCurrentFilter = () => {
        setCurrentField(null);
        setCurrentOperator(null);
        setTempValues([]);
        setTempContainsText('');
        setValSearchQuery('');
        setDropdownOpen(false);
    };

    const removeFilter = (id: string) => {
        setCompletedFilters(prev => prev.filter(f => f.id !== id));
    };

    const clearAllFilters = () => {
        setCompletedFilters([]);
        cancelCurrentFilter();
        setSearchTerm('');
    };

    const displayHistory = useMemo(() => {
        let filtered = combinedPayrolls;

        // Apply standard Search Term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.month.toLowerCase().includes(term) ||
                p.id.toLowerCase().includes(term) ||
                p.businessUnit.toLowerCase().includes(term)
            );
        }

        // Apply Completed Filters (for HR_MANAGER)
        if (userRole === 'HR_MANAGER') {
            for (const filter of completedFilters) {
                filtered = filtered.filter(p => {
                    let pValue = '';
                    if (filter.field === 'Payroll Month') pValue = p.month || '';
                    else if (filter.field === 'Business Unit') pValue = p.businessUnit || '';
                    else if (filter.field === 'Payroll Type') pValue = p.payrollType || 'Regular Monthly';
                    else if (filter.field === 'Status') pValue = p.status || '';

                    const isMatch = filter.values.some(val => val.toLowerCase() === pValue.toLowerCase());

                    if (filter.operator === 'Is') {
                        return isMatch;
                    } else if (filter.operator === 'Is not') {
                        return !isMatch;
                    }
                    return true;
                });
            }
        }

        return filtered;
    }, [combinedPayrolls, searchTerm, completedFilters, userRole]);

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
        // Insert audit log to database
        const logAction = async () => {
            const targetMonth = showUnlockModal === 'Nov 2025' ? 'November 2025' : (MOCK_HISTORY.find(p => p.id === showUnlockModal)?.month || showUnlockModal || 'Unknown Month');
            const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
            const { error } = await supabase.from('audit_logs').insert({
                id: uuid,
                action: `Unlocked Payroll Run for ${targetMonth} (Step ${unlockStep}) - Reason: ${unlockReason}`,
                user_name: 'HR Manager',
                severity: 'High',
                timestamp_label: 'Just now'
            });
            if (error) {
                console.error('Error saving unlock audit log:', error);
            }
        };
        logAction();

        if (showUnlockModal === 'Nov 2025') {
            setNovPayrollStatus('Draft');
            if (novPayrollType === 'Regular Monthly') {
                setWizardBU(['Mindinventory', '300 Minds']);
                setWizardInitialStep(unlockStep);
                setUnlockedRegularMonthly(true);
                setWizardReadOnly(false);
                setView('WIZARD');
            }
        } else if (showUnlockModal) {
            const payroll = MOCK_HISTORY.find(p => p.id === showUnlockModal);
            setUnlockedPayrolls([...unlockedPayrolls, showUnlockModal]);
            if (payroll && (payroll.payrollType === 'Regular Monthly' || !payroll.payrollType)) {
                const bus = payroll.businessUnit.split(',').map(s => s.trim());
                setWizardBU(bus);
                setWizardInitialStep(unlockStep);
                setUnlockedRegularMonthly(true);
                setWizardReadOnly(false);
                setView('WIZARD');
            }
        }
        setShowUnlockModal(null);
    };

    const handleLockConfirm = () => {
        if (showLockModal === 'Nov 2025') {
            setNovPayrollStatus('Locked');
        }
        setShowLockModal(null);
    };

    if (view === 'WIZARD') {
        return (
            <RunPayrollModal
                isPage={true}
                company={MOCK_COMPANIES[0]}
                onClose={() => setView('HISTORY')}
                initialBusinessUnits={wizardBU}
                readOnly={wizardReadOnly}
                onStatusChange={setNovPayrollStatus}
                onTypeChange={setNovPayrollType}
                initialStep={wizardInitialStep}
                unlockedRegularMonthly={unlockedRegularMonthly}
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
                    onClick={() => { setWizardBU([]); setWizardReadOnly(false); setWizardInitialStep(1); setUnlockedRegularMonthly(false); setView('WIZARD'); }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                    Initiate Payroll
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Cycle</p>
                    <p className="text-xl font-bold text-slate-800">Nov 2025</p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-orange-600">
                        <Clock size={14} /> Pending
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

                {/* Payroll On-hold Card */}
                <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-sm relative group">
                    <div className="flex justify-between items-start mb-1">
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Payroll On-hold</p>
                        <button
                            onClick={() => setShowOnHoldPanel(true)}
                            className="text-amber-500 hover:text-amber-600 transition-colors p-1 hover:bg-amber-100 rounded"
                            title="View On-hold Details"
                        >
                            <Eye size={16} />
                        </button>
                    </div>
                    <p className="text-xl font-bold text-slate-800">3 Employees</p>
                    {userRole !== 'HR_MANAGER' && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-amber-600">
                            <PauseCircle size={14} /> Verification Pending
                        </div>
                    )}
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
                {/* Toolbar */}
                <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <h2 className="text-lg font-bold text-slate-800">Payroll History</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-sm font-bold hover:bg-slate-50 shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                            >
                                <Upload size={16} /> Import
                            </button>
                            <button
                                onClick={() => setShowForm16Modal(true)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm flex items-center gap-2 cursor-pointer"
                            >
                                <FileText size={16} /> Distribute Form 16
                            </button>
                        </div>
                    </div>

                    {/* Filter bar below */}
                    <div className="w-full">
                        {userRole === 'HR_MANAGER' ? (
                            <div className="relative w-full" ref={dropdownRef}>
                                {/* Input-like container */}
                                <div 
                                    onClick={() => {
                                        setDropdownOpen(true);
                                        inputRef.current?.focus();
                                    }}
                                    className="w-full flex flex-wrap items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[40px] focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 transition-all cursor-text pr-10"
                                >
                                    {/* Search icon */}
                                    {completedFilters.length === 0 && !currentField && (
                                        <Search className="h-4 w-4 text-slate-400 shrink-0" />
                                    )}

                                    {/* 1. Completed Filters Chips */}
                                    {completedFilters.map(filter => {
                                        const fObj = FIELDS.find(f => f.name === filter.field);
                                        const FIcon = fObj?.icon;
                                        return (
                                            <div 
                                                key={filter.id} 
                                                className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-sm"
                                            >
                                                {FIcon && <FIcon size={12} className="text-slate-500" />}
                                                <span>{filter.field}</span>
                                                <span className="text-slate-400 font-bold lowercase text-[10px]">{filter.operator}</span>
                                                <span className="bg-slate-100 px-1 rounded text-slate-800 max-w-[120px] truncate">
                                                    {filter.values.join(', ')}
                                                </span>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); removeFilter(filter.id); }} 
                                                    className="ml-1 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        );
                                    })}

                                    {/* 2. In-Progress Filter Pills */}
                                    {currentField && (
                                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-700 shadow-sm">
                                            {(() => {
                                                const fObj = FIELDS.find(f => f.name === currentField);
                                                const FIcon = fObj?.icon;
                                                return FIcon ? <FIcon size={12} className="text-slate-500" /> : null;
                                            })()}
                                            <span>{currentField}</span>
                                        </div>
                                    )}

                                    {currentOperator && (
                                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5 text-xs font-bold text-slate-600 shadow-sm">
                                            <span>{currentOperator}</span>
                                        </div>
                                    )}

                                    {/* 3. Text Input / Placeholder */}
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={currentField && currentOperator ? valSearchQuery : searchTerm}
                                        onChange={(e) => {
                                            if (currentField && currentOperator) {
                                                setValSearchQuery(e.target.value);
                                            } else {
                                                setSearchTerm(e.target.value);
                                                setDropdownOpen(false);
                                            }
                                        }}
                                        placeholder={
                                            completedFilters.length === 0 && !currentField
                                                ? "Search by month or ID..."
                                                : currentField && currentOperator
                                                ? "Select..."
                                                : ""
                                        }
                                        className="flex-1 min-w-[60px] bg-transparent border-none outline-none text-slate-800 text-sm py-0.5 placeholder-slate-400 focus:ring-0 p-0"
                                    />

                                    {/* 4. Clear/Reset Button */}
                                    {(completedFilters.length > 0 || currentField || searchTerm) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clearAllFilters();
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                                        {!currentField && (
                                            <div className="py-1">
                                                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Field</div>
                                                {FIELDS.map(f => (
                                                    <button
                                                        key={f.name}
                                                        onClick={() => selectField(f.name)}
                                                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                                    >
                                                        <f.icon size={14} className="text-slate-400" />
                                                        <span>{f.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {currentField && !currentOperator && (
                                            <div className="py-1">
                                                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Condition</div>
                                                {['Is', 'Is not'].map(op => (
                                                    <button
                                                        key={op}
                                                        onClick={() => selectOperator(op)}
                                                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                                    >
                                                        <div className="w-4 h-4 flex items-center justify-center font-mono text-xs font-bold text-slate-400">
                                                            {op === 'Is' ? '=' : '!='}
                                                        </div>
                                                        <span>{op}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {currentField && currentOperator && (
                                            <div className="flex flex-col max-h-[300px]">
                                                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                                                    Select values for {currentField}
                                                </div>
                                                <div className="p-2 border-b border-slate-100">
                                                    <input
                                                        type="text"
                                                        placeholder="Search values..."
                                                        value={valSearchQuery}
                                                        onChange={(e) => setValSearchQuery(e.target.value)}
                                                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500"
                                                    />
                                                </div>
                                                <div className="overflow-y-auto flex-1 py-1 max-h-[160px]">
                                                    {(() => {
                                                        const opts = getOptionsForField(currentField);
                                                        const filteredOpts = opts.filter(opt => 
                                                            opt.toLowerCase().includes(valSearchQuery.toLowerCase())
                                                        );
                                                        if (filteredOpts.length === 0) {
                                                            return <div className="px-3 py-2 text-xs text-slate-400 italic">No values found</div>;
                                                        }
                                                        return filteredOpts.map(opt => {
                                                            const isChecked = tempValues.includes(opt);
                                                            return (
                                                                <label
                                                                    key={opt}
                                                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={() => toggleTempValue(opt)}
                                                                        className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer w-3.5 h-3.5"
                                                                    />
                                                                    <span>{opt}</span>
                                                                </label>
                                                            );
                                                        });
                                                    })()}
                                                </div>
                                                <div className="p-2 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                                    <button
                                                        onClick={cancelCurrentFilter}
                                                        className="px-2.5 py-1 text-[10px] text-slate-500 font-bold hover:text-slate-700 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={applyCurrentFilter}
                                                        disabled={tempValues.length === 0}
                                                        className="px-3 py-1 bg-purple-600 text-white text-[10px] font-bold rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
                                                    >
                                                        Done
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by month or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* History Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50/50 text-[11px] font-black uppercase text-slate-400 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-4">Payroll Month</th>
                                <th className="px-6 py-4">Business Unit</th>
                                <th className="px-6 py-4">Payroll Type</th>
                                <th className="px-6 py-4">Employees</th>
                                <th className="px-6 py-4">Total Gross</th>
                                <th className="px-6 py-4">Total Deductions</th>
                                <th className="px-6 py-4">Total Hold Amount</th>
                                <th className="px-6 py-4">Net Payout</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created By</th>
                                <th className="px-6 py-4">Last Modified By</th>
                                <th className="px-6 py-4 text-right pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {displayHistory.map((payroll) => {
                                if (payroll.id === 'Nov-2025-Pending') {
                                    return (
                                        <tr key={payroll.id} className="bg-purple-50/20 group hover:bg-purple-50/40 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold shadow-sm">N</div>
                                                    <div>
                                                        <div className="font-black text-slate-800">November 2025</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-bold text-slate-700">Mindinventory, 300 Minds</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-medium text-slate-600">{novPayrollType}</div>
                                            </td>
                                            <td className="px-6 py-5 font-bold text-slate-600">452</td>
                                            <td className="px-6 py-5 font-bold text-slate-800">₹ 1.85 Cr</td>
                                            <td className="px-6 py-5 font-bold text-rose-600">₹ 43.00 L</td>
                                            <td className="px-6 py-5 font-bold text-amber-600">₹ 1.50 L</td>
                                            <td className="px-6 py-5 font-bold text-emerald-700">₹ 1.42 Cr</td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(novPayrollStatus)}`}>
                                                    {novPayrollStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-slate-600 font-medium text-xs">Admin</td>
                                            <td className="px-6 py-5 text-slate-600 font-medium text-xs">HR Manager</td>
                                            <td className="px-6 py-5 text-right pr-8">
                                                <div className="flex items-center justify-end gap-2">
                                                    {novPayrollStatus === 'Locked' || novPayrollStatus === 'Paid' ? (
                                                        <>
                                                            <button
                                                                onClick={() => { setWizardBU(['Mindinventory', '300 Minds']); setWizardReadOnly(true); setWizardInitialStep(1); setUnlockedRegularMonthly(false); setView('WIZARD'); }}
                                                                className="p-2 hover:bg-white hover:text-indigo-600 rounded-lg text-slate-400 transition-colors shadow-sm border border-transparent hover:border-slate-200"
                                                                title="View Details"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => setShowUnlockModal('Nov 2025')}
                                                                className="p-2 hover:bg-white hover:text-amber-600 rounded-lg text-slate-400 transition-colors shadow-sm border border-transparent hover:border-slate-200"
                                                                title="Unlock to Edit"
                                                            >
                                                                <Unlock size={16} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => { setWizardBU(['Mindinventory', '300 Minds']); setWizardReadOnly(false); setWizardInitialStep(1); setUnlockedRegularMonthly(false); setView('WIZARD'); }}
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
                                                                onClick={() => { setWizardBU(['Mindinventory', '300 Minds']); setWizardReadOnly(false); setWizardInitialStep(1); setUnlockedRegularMonthly(false); setView('WIZARD'); }}
                                                                className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-black hover:bg-purple-700 transition-all flex items-center gap-1.5 ml-2 shadow-md shadow-purple-100"
                                                            >
                                                                Continue <ArrowRight size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }

                                return (
                                    <tr key={payroll.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold">{payroll.month.charAt(0)}</div>
                                                <div>
                                                    <div className="font-bold text-slate-700">{payroll.month}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-medium text-slate-600">{payroll.businessUnit}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-medium text-slate-600">{payroll.payrollType || 'Regular Monthly'}</div>
                                        </td>
                                        <td className="px-6 py-5 text-slate-600 font-medium">{payroll.employeeCount}</td>
                                        <td className="px-6 py-5 text-slate-800 font-bold">{payroll.grossAmount}</td>
                                        <td className="px-6 py-5 text-rose-600 font-bold">{payroll.totalDeductions}</td>
                                        <td className="px-6 py-5 text-amber-600 font-bold">{payroll.holdAmount || '₹ 0.00'}</td>
                                        <td className="px-6 py-5 text-slate-800 font-black">{payroll.netPay}</td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(payroll.status)}`}>
                                                {payroll.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-slate-600 font-medium text-xs">{payroll.createdBy}</td>
                                        <td className="px-6 py-5 text-slate-600 font-medium text-xs">{payroll.lastModifiedBy}</td>
                                        <td className="px-6 py-5 text-right pr-8">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        if (payroll.status === 'Locked' || payroll.status === 'Paid') {
                                                            const bus = payroll.businessUnit.split(',').map(s => s.trim());
                                                            setWizardBU(bus);
                                                            setWizardReadOnly(true);
                                                            setWizardInitialStep(1);
                                                            setUnlockedRegularMonthly(false);
                                                            setView('WIZARD');
                                                        } else {
                                                            setShowDetailsModal(payroll);
                                                        }
                                                    }}
                                                    className="p-2 hover:bg-white hover:text-indigo-600 rounded-lg text-slate-400 transition-colors shadow-sm border border-transparent hover:border-slate-200"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                { (payroll.status !== 'Paid' || unlockedPayrolls.includes(payroll.id)) && (
                                                    <button
                                                        onClick={() => {
                                                            const bus = payroll.businessUnit.split(',').map(s => s.trim());
                                                            setWizardBU(bus);
                                                            setWizardInitialStep(1);
                                                            setUnlockedRegularMonthly(false);
                                                            setWizardReadOnly(false);
                                                            setView('WIZARD');
                                                        }}
                                                        className="p-2 hover:bg-white hover:text-purple-600 rounded-lg text-slate-400 transition-colors shadow-sm border border-transparent hover:border-slate-200"
                                                        title="Edit Payroll"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
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
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center text-xs font-medium text-slate-500">
                    <span>Showing {displayHistory.length} of {combinedPayrolls.length} payroll cycles</span>
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

            <PayrollOnHoldPanel
                isOpen={showOnHoldPanel}
                onClose={() => setShowOnHoldPanel(false)}
                userRole={userRole}
            />

            {/* Form 24Q Details Modal */}
            {showForm24QModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Form24QModalContent onClose={() => setShowForm24QModal(false)} />
                </div>
            )}

            {/* Distribute Form 16 Modal */}
            {showForm16Modal && (
                <DistributeForm16Modal onClose={() => setShowForm16Modal(false)} />
            )}

            {/* Import Employees Modal */}
            <ImportEmployeesRunsModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
            />

            {/* Unlock Confirmation */}
            {showUnlockModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh] p-8 text-center border-t-8 border-blue-600 scrollbar-none">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Unlock size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Unlock Payroll Run</h3>
                        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                            Select the step from which you want to unlock. Steps following the selected step will also be unlocked.
                        </p>

                        {/* Step Selection List */}
                        <div className="text-left mb-6">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Select Step to Unlock from</label>
                            <div className="space-y-2">
                                {[
                                    { num: 1, name: 'Period & Employees' },
                                    { num: 2, name: 'Attendance & Time Data' },
                                    { num: 3, name: 'Salary Adjustments' },
                                    { num: 4, name: 'Review & Verify' },
                                ].map((step) => {
                                    const isSelected = unlockStep === step.num;
                                    return (
                                        <button
                                            key={step.num}
                                            type="button"
                                            onClick={() => setUnlockStep(step.num)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                                                isSelected
                                                    ? 'border-blue-200 bg-blue-50/50 shadow-sm'
                                                    : 'border-slate-100 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold text-xs transition-colors ${
                                                isSelected
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {step.num}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-xs font-bold ${isSelected ? 'text-blue-800' : 'text-slate-700'}`}>
                                                    {step.name}
                                                </p>
                                                {isSelected && (
                                                    <p className="text-[10px] text-blue-500 font-medium mt-0.5">
                                                        Unlocks steps {step.num} to 4
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Reason Field */}
                        <div className="text-left mb-6">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Reason for Unlocking <span className="text-rose-500">*</span></label>
                            <textarea
                                value={unlockReason}
                                onChange={(e) => setUnlockReason(e.target.value.slice(0, 200))}
                                placeholder="Enter reason for unlocking this payroll (e.g. attendance corrections)..."
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[60px] resize-none"
                            />
                            <div className="flex justify-end mt-1">
                                <span className={`text-[10px] font-bold ${unlockReason.length >= 190 ? 'text-rose-500' : 'text-slate-400'}`}>
                                    {unlockReason.length}/200
                                </span>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowUnlockModal(null)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUnlockConfirm}
                                disabled={!unlockReason.trim()}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Unlock size={18} /> Confirm
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
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Calendar size={18} /></div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Payroll Details: {showDetailsModal.month}</h3>
                                </div>
                            </div>
                            <button onClick={() => setShowDetailsModal(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={20} /></button>
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

                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                <div className="flex items-center gap-3 px-4 py-2 bg-slate-200/60 rounded-xl mb-4 w-max">
                                    <div className="relative">
                                        <Calculator size={20} className="text-slate-700" />
                                        <div className="absolute -bottom-1 -right-1.5 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                            <Minus size={10} className="text-white" strokeWidth={4} />
                                        </div>
                                    </div>
                                    <h4 className="text-[15px] font-bold text-slate-800 tracking-tight">Deductions & Recoveries</h4>
                                </div>
                                <div className="space-y-4 px-1">
                                    <div className="flex justify-between items-center bg-white">
                                        <span className="text-[15px] text-slate-700 tracking-tight">TDS (Income Tax):</span>
                                        <span className="font-bold text-[15px] text-red-700 tracking-tight">- ₹ 15,40,000</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white">
                                        <span className="text-[15px] text-slate-700 tracking-tight">PF (Employee):</span>
                                        <span className="font-bold text-[15px] text-red-700 tracking-tight">- ₹ 0.40,000</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white">
                                        <span className="text-[15px] text-slate-700 tracking-tight">Professional Tax:</span>
                                        <span className="font-bold text-[15px] text-red-700 tracking-tight">- ₹ 20,000</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white">
                                        <span className="text-[15px] text-slate-700 tracking-tight">Loan Repayments:</span>
                                        <span className="font-bold text-[15px] text-red-700 tracking-tight">- ₹ 30,000</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white">
                                        <span className="text-[15px] text-slate-700 tracking-tight">Unpaid Leaves (LWP):</span>
                                        <span className="font-bold text-[15px] text-red-700 tracking-tight">- ₹ 10,000</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button onClick={() => setShowDetailsModal(null)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50">Close</button>
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
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition-colors"><FileText size={20} /></div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-700">Payroll Register (Excel)</p>
                                    <p className="text-xs text-slate-400">Complete summary of earnings & deductions</p>
                                </div>
                                <Download size={16} className="text-slate-300 group-hover:text-indigo-500" />
                            </button>
                            <button className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all group text-left">
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-200 transition-colors"><FileSpreadsheet size={20} /></div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-700">Bank Transfer File (CSV)</p>
                                    <p className="text-xs text-slate-400">Standard format for bank bulk transfers</p>
                                </div>
                                <Download size={16} className="text-slate-300 group-hover:text-emerald-500" />
                            </button>
                            <button className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all group text-left">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-200 transition-colors"><FileArchive size={20} /></div>
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

interface ImportEmployeesRunsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess?: () => void;
}

const ImportEmployeesRunsModal: React.FC<ImportEmployeesRunsModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [sendOnboarding, setSendOnboarding] = useState(false);

    // Success and failure state for step 3 Results screen
    const [successCount, setSuccessCount] = useState(0);
    const [failureCount, setFailureCount] = useState(0);
    const [failedRecords, setFailedRecords] = useState<any[]>([]);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setFile(null);
            setParsedData([]);
            setIsUploading(false);
            setIsSaving(false);
            setSuccessCount(0);
            setFailureCount(0);
            setFailedRecords([]);
            setSendOnboarding(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleDownloadSample = async () => {
        const headers = [
            "Sr. No.",
            "Employee Code",
            "Employee Name",
            "Business Unit",
            "Salary Structure",
            "Annual CTC (₹)",
            "Basic Salary",
            "Child Education Allowance",
            "Child hostel allowance",
            "Conveyance Allowance",
            "Dearness Allowance (DA)",
            "House Rent Allowance (HRA)",
            "Meal Allowance",
            "Medical Allowance",
            "Professional Allowance",
            "Statutory Bonus",
            "Provident Fund (Employee)",
            "ESI (Employee)",
            "Gratuity",
            "Provident Fund (Employer)",
            "ESI (Employer)",
            "NPS",
            "Labour Welfare Fund (Employee)",
            "Labour Welfare Fund (Employer)",
            "Voluntary Provident Fund",
            "Professional Tax",
            "Effective From",
            "Provident Fund",
            "ESI",
            "Gratuity",
            "Labour Welfare Fund",
            "National Pension System",
            "PAN Number",
            "Aadhaar Number",
            "PF Number",
            "UAN Number",
            "ESI Number",
            "PRAN Number",
            "Tax Regime"
        ];
        
        const rows = [
            [
                1,
                "CO-059",
                "Sachin Tendulkar",
                "CollabCRM",
                "Executive Structure",
                1800000,
                720000, // Basic Salary
                2400,   // Child Education Allowance
                4800,   // Child hostel allowance
                19200,  // Conveyance Allowance
                0,      // Dearness Allowance (DA)
                288000, // House Rent Allowance (HRA)
                0,      // Meal Allowance
                0,      // Medical Allowance
                0,      // Professional Allowance
                0,      // Statutory Bonus
                21600,  // Provident Fund (Employee)
                0,      // ESI (Employee)
                34600,  // Gratuity
                21600,  // Provident Fund (Employer)
                0,      // ESI (Employer)
                0,      // NPS
                120,    // Labour Welfare Fund (Employee)
                240,    // Labour Welfare Fund (Employer)
                0,      // Voluntary Provident Fund
                2500,   // Professional Tax
                "2026-06-01",
                "Yes",
                "No",
                "Yes",
                "Yes",
                "No",
                "ABCDE1234F",
                "123456789012",
                "MH/BAN/1234567/123",
                "100987654321",
                "3112345678",
                "110098765432",
                "New Regime"
            ]
        ];

        // Create workbook & worksheet using ExcelJS
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Employees Compensation");
        const instructionsWorksheet = workbook.addWorksheet("Instructions");
        instructionsWorksheet.addRow(["Instructions:"]);
        instructionsWorksheet.addRow(["Please refer to subsequent prompts for detailed instructions."]);

        // Define columns
        worksheet.columns = headers.map(header => ({
            header,
            key: header,
            width: header.length + 5
        }));

        // Add rows
        rows.forEach(row => {
            worksheet.addRow(row);
        });

        // Set mandatory columns and style them (red text, bold)
        const mandatoryHeaders = [
            "Employee Code",
            "Employee Name",
            "Business Unit",
            "Salary Structure",
            "Annual CTC (₹)",
            "Effective From",
            "Provident Fund",
            "ESI",
            "Gratuity",
            "Labour Welfare Fund",
            "National Pension System",
            "PAN Number",
            "Tax Regime"
        ];

        // Format headers row
        const firstRow = worksheet.getRow(1);
        headers.forEach((header, index) => {
            const cell = firstRow.getCell(index + 1);
            if (mandatoryHeaders.includes(header)) {
                cell.font = {
                    name: 'Segoe UI',
                    size: 11,
                    bold: true,
                    color: { argb: 'FFFF0000' } // Red color
                };
            } else {
                cell.font = {
                    name: 'Segoe UI',
                    size: 11,
                    bold: true
                };
            }
        });

        // Add dropdown to Tax Regime column (col 39) for rows 2 to 100
        for (let rowNum = 2; rowNum <= 100; rowNum++) {
            const cell = worksheet.getCell(rowNum, 39);
            cell.dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: ['"Old Regime,New Regime"']
            };
        }

        // Generate buffer and trigger file download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "employees_compensation_sample.xlsx";
        anchor.click();
        window.URL.revokeObjectURL(url);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet);
                    setParsedData(jsonData);
                } catch (err) {
                    console.error("Error reading file:", err);
                }
            };
            reader.readAsArrayBuffer(selectedFile);
        }
    };

    const handleNext = () => {
        if (!file) {
            alert("Please select a file first.");
            return;
        }
        setStep(2);
        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
        }, 1500);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleImport = async () => {
        setIsSaving(true);
        try {
            if (parsedData.length === 0) {
                alert("No employee data found in the uploaded file.");
                setIsSaving(false);
                return;
            }

            // 1. Fetch active structures
            const { data: structures } = await supabase.from('salary_structures').select('id, name');
            const structuresMap: Record<string, string> = {};
            if (structures) {
                structures.forEach(s => {
                    structuresMap[s.name.toLowerCase().trim()] = s.id;
                });
            }

            // 2. Fetch default company name
            const { data: companies } = await supabase.from('companies').select('name').limit(1);
            const companyName = companies?.[0]?.name || 'TechFlow Systems';

            // 3. Fetch existing employees to resolve IDs by EID
            const { data: existingEmps } = await supabase.from('employees').select('id, eid');
            const eidToIdMap: Record<string, string> = {};
            if (existingEmps) {
                existingEmps.forEach(e => {
                    eidToIdMap[e.eid] = e.id;
                });
            }

            // Helpers for parsing values
            const getExcelValue = (row: any, ...keys: string[]) => {
                for (const key of keys) {
                    if (row[key] !== undefined && row[key] !== null) return row[key];
                    const lowerKey = key.toLowerCase().trim();
                    const foundKey = Object.keys(row).find(
                        k => k.toLowerCase().trim() === lowerKey
                    );
                    if (foundKey !== undefined && row[foundKey] !== null) return row[foundKey];
                }
                return '';
            };

            const cleanNumber = (val: any): number => {
                if (typeof val === 'number') return val;
                if (!val) return 0;
                const cleaned = String(val).replace(/[^0-9.]/g, '');
                return parseFloat(cleaned) || 0;
            };

            const formatDate = (val: any): string => {
                if (!val) return new Date().toISOString().split('T')[0];
                if (val instanceof Date) return val.toISOString().split('T')[0];
                if (typeof val === 'number') {
                    const date = new Date((val - 25569) * 86400 * 1000);
                    return date.toISOString().split('T')[0];
                }
                const str = String(val).trim();
                if (str.match(/^\d{4}-\d{2}-\d{2}$/)) return str;
                const parsed = Date.parse(str);
                if (!isNaN(parsed)) return new Date(parsed).toISOString().split('T')[0];
                return str;
            };

            const mapStatus = (val: any): string => {
                const str = String(val || '').trim();
                const valid = ['Active', 'New Joinee', 'On Notice', 'Relieved'];
                const matched = valid.find(v => v.toLowerCase() === str.toLowerCase());
                return matched || 'Active';
            };

            // 4. Map rows and validate
            const employeesToUpsert: any[] = [];
            const configsToUpsert: any[] = [];
            const failures: any[] = [];

            parsedData.forEach(row => {
                const errors: string[] = [];
                
                const eid = String(getExcelValue(row, "Employee Code", "eid")).trim();
                const name = String(getExcelValue(row, "Employee Name", "name")).trim();
                const department = String(getExcelValue(row, "Department")).trim() || "N/A";
                const designation = String(getExcelValue(row, "Designation")).trim() || "N/A";
                const ctcVal = cleanNumber(getExcelValue(row, "Annual CTC (₹)", "ctc"));
                const effectiveFrom = getExcelValue(row, "Effective From", "join_date");
                
                const businessUnit = String(getExcelValue(row, "Business Unit", "location")).trim();
                const structureName = String(getExcelValue(row, "Salary Structure")).trim();
                const isPfStr = String(getExcelValue(row, "Provident Fund", "Provident Fund Applicable?")).trim();
                const isEsiStr = String(getExcelValue(row, "ESI", "ESI Applicable?")).trim();
                const isGratuityStr = String(getExcelValue(row, "Gratuity", "Gratuity Applicable?")).trim();
                const isLwfStr = String(getExcelValue(row, "Labour Welfare Fund", "Labour Welfare Fund Applicable?")).trim();
                const isNpsStr = String(getExcelValue(row, "National Pension System", "National Pension System Applicable?")).trim();
                const panNumber = String(getExcelValue(row, "PAN Number", "pan_no")).trim();
                const taxRegime = String(getExcelValue(row, "Tax Regime", "regime")).trim();

                if (!eid) errors.push("Employee Code is required");
                if (!name) errors.push("Employee Name is required");
                if (!businessUnit) errors.push("Business Unit is required");
                if (!structureName) errors.push("Salary Structure is required");
                if (ctcVal <= 0) errors.push("Annual CTC must be greater than 0");
                if (!effectiveFrom) errors.push("Effective From date is required");
                if (!isPfStr) errors.push("Provident Fund option is required (Yes/No)");
                if (!isEsiStr) errors.push("ESI option is required (Yes/No)");
                if (!isGratuityStr) errors.push("Gratuity option is required (Yes/No)");
                if (!isLwfStr) errors.push("Labour Welfare Fund option is required (Yes/No)");
                if (!isNpsStr) errors.push("National Pension System option is required (Yes/No)");
                if (!panNumber) errors.push("PAN Number is required");
                if (!taxRegime) errors.push("Tax Regime is required");

                if (errors.length > 0) {
                    failures.push({
                        ...row,
                        "Error Reason": errors.join(", ")
                    });
                    return;
                }

                const employeeId = eidToIdMap[eid] || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15));
                const status = mapStatus(getExcelValue(row, "Status"));
                const formattedDate = formatDate(effectiveFrom);
                
                const isPf = isPfStr.toLowerCase() === "yes";
                const isEsi = isEsiStr.toLowerCase() === "yes";
                const isGratuity = isGratuityStr.toLowerCase() === "yes";
                const isLwf = isLwfStr.toLowerCase() === "yes";
                const isNps = isNpsStr.toLowerCase() === "yes";

                const aadhaarNumber = String(getExcelValue(row, "Aadhaar Number", "aadhaar_no")).trim();
                const pfNumber = String(getExcelValue(row, "PF Number", "pf_no")).trim();
                const uanNumber = String(getExcelValue(row, "UAN Number", "uan_no")).trim();
                const esiNumber = String(getExcelValue(row, "ESI Number", "esi_no")).trim();
                const pranNumber = String(getExcelValue(row, "PRAN Number", "pran_no")).trim();

                const structureId = structuresMap[structureName.toLowerCase()] || null;

                const statutoryDeductions = {
                    providentFund: isPf,
                    esi: isEsi,
                    professionalTax: true,
                    gratuity: isGratuity,
                    lwf: isLwf,
                    tds: true,
                    nps: isNps
                };

                employeesToUpsert.push({
                    id: employeeId,
                    name,
                    eid,
                    company_name: companyName,
                    department,
                    designation,
                    location: businessUnit,
                    ctc: String(ctcVal),
                    join_date: formattedDate,
                    status,
                    salary_structure_id: structureId,
                    effective_date: formattedDate,
                    tax_regime: taxRegime,
                    pan_no: panNumber,
                    aadhaar_no: aadhaarNumber,
                    uan_no: uanNumber,
                    business_unit: businessUnit,
                    annual_gross: ctcVal,
                    payroll_status: 'Eligible',
                    created_by: 'HR Manager',
                    last_updated_by: 'HR Manager'
                });

                configsToUpsert.push({
                    config_key: `emp_statutory:${employeeId}`,
                    config_value: {
                        ...statutoryDeductions,
                        pf_no: pfNumber,
                        esi_no: esiNumber,
                        pran_no: pranNumber,
                        arrears_payout_month: null,
                        appraisal_month: null,
                        salary_input_basis: "Gross CTC"
                    },
                    updated_at: new Date().toISOString()
                });
            });

            setSuccessCount(employeesToUpsert.length);
            setFailureCount(failures.length);
            setFailedRecords(failures);

            if (employeesToUpsert.length > 0) {
                const { error: empError } = await supabase.from('employees').upsert(employeesToUpsert, { onConflict: 'eid' });
                if (empError) throw empError;

                const { error: configError } = await supabase.from('operational_config').upsert(configsToUpsert, { onConflict: 'config_key' });
                if (configError) throw configError;
            }

            if (onImportSuccess) onImportSuccess();
            setStep(3);
        } catch (err: any) {
            console.error('Import process failed:', err);
            alert(`Error importing records: ${err.message || err}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 text-slate-800">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                    <h3 className="text-lg font-bold text-slate-800">Import Payroll - Import historical data</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                {/* Stepper */}
                <div className="border-b border-slate-100 py-4 bg-white select-none">
                    <div className="flex items-center justify-center max-w-xl mx-auto px-4">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center relative">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 bg-white transition-all ${
                                step === 1 ? 'border-indigo-600' : 'border-indigo-600 text-indigo-600'
                            }`}>
                                {step === 1 ? <div className="w-3.5 h-3.5 bg-indigo-600 rounded-full" /> : <Check size={16} strokeWidth={3} />}
                            </div>
                            <span className={`text-xs mt-2 transition-all ${step === 1 ? 'font-bold text-indigo-600' : 'font-medium text-slate-400'}`}>Prepare</span>
                        </div>
                        <div className={`h-[2px] flex-1 -mt-5 mx-2 transition-all ${step > 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                        {/* Step 2 */}
                        <div className="flex flex-col items-center relative">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 bg-white transition-all ${
                                step === 2 ? 'border-indigo-600' : step > 2 ? 'border-indigo-600 text-indigo-600' : 'border-slate-300'
                            }`}>
                                {step === 2 ? <div className="w-3.5 h-3.5 bg-indigo-600 rounded-full" /> : step > 2 ? <Check size={16} strokeWidth={3} /> : null}
                            </div>
                            <span className={`text-xs mt-2 transition-all ${step === 2 ? 'font-bold text-indigo-600' : 'font-medium text-slate-400'}`}>Upload</span>
                        </div>
                        <div className={`h-[2px] flex-1 -mt-5 mx-2 transition-all ${step > 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                        {/* Step 3 */}
                        <div className="flex flex-col items-center relative">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 bg-white transition-all ${
                                step === 3 ? 'border-indigo-600 text-indigo-600' : 'border-slate-300'
                            }`}>
                                {step === 3 ? <Check size={16} strokeWidth={3} /> : null}
                            </div>
                            <span className={`text-xs mt-2 transition-all ${step === 3 ? 'font-bold text-indigo-600' : 'font-medium text-slate-400'}`}>Results</span>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 flex-grow relative min-h-[280px] bg-white">
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                            {/* Left Side */}
                            <div className="space-y-6 flex flex-col justify-center pr-0 md:pr-8">
                                <div className="text-sm text-slate-600">
                                    Download a <span onClick={handleDownloadSample} className="text-indigo-600 hover:underline cursor-pointer font-semibold">Sample File</span>.
                                </div>
                                <div>
                                    <button onClick={handleUploadClick} className="w-full py-4 text-center border border-indigo-200 bg-indigo-50/20 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50/50 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                                        Upload Excel File <span className="text-rose-500">*</span>
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv,.xlsx,.xls" />
                                    {file && (
                                        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 animate-in fade-in">
                                            <Check className="text-emerald-600" size={14} strokeWidth={3} /> Selected: <span className="font-semibold text-slate-700 font-mono">{file.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="hidden md:block absolute left-1/2 top-8 bottom-8 border-l border-dashed border-slate-200" />
                            {/* Right Side */}
                            <div className="space-y-4 pl-0 md:pl-10 flex flex-col justify-center">
                                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Instructions:</h4>
                                <ul className="space-y-3 text-xs text-slate-500 font-medium leading-relaxed pl-4 list-disc">
                                    <li>Do not change the column names provided in the sample Excel template.</li>
                                    <li>Columns indicated in red color are mandatory fields.</li>
                                    <li>Ensure to follow correct data types for each column.</li>
                                    <li>Once the import is complete, verify that the data has been accurately imported. Cross-check a few records to ensure consistency.</li>
                                </ul>
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="flex flex-col items-center justify-center h-full min-h-[220px] animate-in fade-in duration-200">
                            {isUploading ? (
                                <div className="w-full space-y-8 p-4 animate-in fade-in duration-350">
                                    <div className="w-full bg-blue-50/50 border border-blue-200 rounded-xl p-4 flex items-start gap-3.5 shadow-sm">
                                        <div className="p-1 bg-blue-100 rounded-full text-blue-600 shrink-0 mt-0.5"><Info size={18} /></div>
                                        <div className="text-sm text-blue-800 leading-relaxed font-medium">
                                            We're currently uploading your file <span className="font-bold font-mono">'{file?.name}'</span>.<br />
                                            <span className="text-blue-600 font-normal mt-0.5 block">Please be patient while we fully process your data.</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-center items-center py-12">
                                        <div className="relative w-16 h-16 animate-spin">
                                            {[...Array(12)].map((_, i) => (
                                                <div key={i} className="absolute w-2.5 h-2.5 bg-purple-500 rounded-full" style={{ top: `${50 + 40 * Math.sin((i * 2 * Math.PI) / 12)}%`, left: `${50 + 40 * Math.cos((i * 2 * Math.PI) / 12)}%`, transform: 'translate(-50%, -50%)', opacity: 0.15 + (i * 0.85) / 11 }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 text-center animate-in fade-in">
                                    <div className="w-16 h-16 bg-violet-50 text-violet-500 rounded-full flex items-center justify-center mx-auto"><Check size={28} strokeWidth={3} /></div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800">File Processed Successfully!</h4>
                                        <p className="text-sm text-slate-500 mt-2 font-mono">{file?.name}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {step === 3 && (
                        <div className="w-full space-y-6 animate-in fade-in">
                            <div className="w-full bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
                                <div className="p-1 bg-emerald-100 rounded-full text-emerald-600 shrink-0"><CheckCircle size={18} /></div>
                                <div className="text-sm font-semibold text-emerald-800">All records imported successfully!</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border border-slate-200 bg-white rounded-xl p-6 flex items-center gap-5 shadow-sm">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shrink-0"><Check size={28} strokeWidth={3} /></div>
                                    <div className="text-sm font-bold text-slate-700">{successCount} record(s) imported successfully.</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isUploading && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 bg-white">
                        {step === 1 && (
                            <>
                                <button onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 text-sm cursor-pointer">Cancel</button>
                                <button onClick={handleNext} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 text-sm cursor-pointer">Next</button>
                            </>
                        )}
                        {step === 2 && (
                            <>
                                <button onClick={handleBack} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 text-sm cursor-pointer">Back</button>
                                <button onClick={handleImport} disabled={isSaving} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 text-sm disabled:opacity-50 cursor-pointer">{isSaving ? 'Saving...' : 'Import'}</button>
                            </>
                        )}
                        {step === 3 && (
                            <button onClick={onClose} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 text-sm cursor-pointer">Done</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PayrollManager;
