import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Eye,
    Edit2,
    MessageSquare,
    ChevronDown,
    X,
    Download,
    Calendar,
    ShieldCheck,
    Bell,
    Mail,
    Smartphone,
    User,
    TrendingUp,
    FileText,
    Save,
    Check,
    MoreVertical,
    Plus,
    Image as ImageIcon,
    Clock,
    AlertCircle,
    Upload,
    Trash2,
    Paperclip,
    Send,
    CornerDownLeft,
    Info,
    Loader2,
    Shield,
    Lock,
    ChevronRight,
    ChevronLeft,
    FileSpreadsheet,
    CheckSquare,
    ArrowLeft,
    Zap,
    Settings,
    CloudUpload,
    Pause,
    Play,
    Activity,
    Users,
    ChevronUp,
    AlertTriangle,
    DollarSign,
    Wallet
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { MOCK_TAX_DECLARATIONS } from '../constants';
import { TaxDeclaration } from '../types';

// --- Modals Interfaces ---

interface ModalProps {
    doc: TaxDeclaration;
    onClose: () => void;
}

interface EditModalProps extends ModalProps {
    onSave: (updatedDoc: TaxDeclaration) => void;
}

interface ApproveModalProps extends ModalProps {
    onDecide: (id: string, decision: 'Approved' | 'Rejected' | 'Partially Approved', amount?: number, note?: string, breakdown?: { label: string; amount: number; approved_amount?: number }[]) => void;
    initialDecision?: 'Approved' | 'Partially Approved' | 'Rejected';
}

interface CommentModalProps extends ModalProps {
    onComment: (id: string, comment: string) => void;
}

interface ViewModalProps extends ModalProps {
    onEdit: () => void;
    onApprove: (decision: 'Approved' | 'Rejected') => void;
    allDeclarations: TaxDeclaration[];
    onSwitchDoc: (id: string) => void;
}

const SECTION_LIMITS: Record<string, string> = {
    '80C': '₹1,50,000',
    '80D': '₹75,000',
    '80CCD': '₹50,000',
    'HRA': 'As per Rules',
    '80G': 'Donation Based',
    'Others': 'NA'
};

// Derives the overall/parent status for an employee from all their section statuses
const computeParentStatus = (sections: TaxDeclaration[]): string => {
    if (sections.length === 0) return 'Pending';
    const statuses = sections.map(s => s.status);
    if (statuses.every(s => s === 'Approved')) return 'Approved';
    if (statuses.every(s => s === 'Rejected')) return 'Rejected';
    if (statuses.every(s => s === 'Pending')) return 'Pending';
    return 'Partially Approved'; // If not all Pending, and not all Approved/Rejected, it's mixed
};

// --- Custom Icons ---
const Globe = ({ size, className }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);
const FileArchive = ({ size, className }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 22V4c0-1.1.9-2 2-2h8.5L20 7.5V22c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 12v6"></path><path d="m15 15-3-3-3 3"></path></svg>
);

// --- New Component: Form 16 Generation Screen ---

const Form16GenerationModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [viewStep, setViewStep] = useState<'SETUP' | 'PROCESSING' | 'COMPLETE'>('SETUP');
    const [selectedFY, setSelectedFY] = useState('2025-26');
    const [genOption, setGenOption] = useState('full');
    const [isSigning, setIsSigning] = useState(false);
    const [include12BA, setInclude12BA] = useState(false);
    const [isPasswordProtected, setIsPasswordProtected] = useState(false);
    const [selectedEmps, setSelectedEmps] = useState<string[]>([]);

    // Processing State
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<{ id: number; msg: string; type: 'info' | 'success' | 'error' }[]>([]);
    const logEndRef = useRef<HTMLDivElement>(null);

    // Mock Employee Data for Form 16
    const form16Emps = [
        { id: 'TF00123', name: 'Priya Sharma', pan: 'ABCDE1234F', location: 'Bangalore', status: 'Ready' },
        { id: 'TF00456', name: 'Rahul Varma', pan: 'FGHIJ5678K', location: 'Mumbai', status: 'Proofs Pending' },
        { id: 'TF00789', name: 'Sneha Kapur', pan: 'KLMNO9012P', location: 'Pune', status: 'Generated' },
        { id: 'AC00212', name: 'Arjun Mehta', pan: 'QRSTU3456V', location: 'Delhi', status: 'Ready' },
        { id: 'AC00345', name: 'Anita Desai', pan: 'WXYZA7890B', location: 'Bangalore', status: 'Ready' },
        { id: 'SU00111', name: 'Kunal Singh', pan: 'BCDEF1122C', location: 'Hyderabad', status: 'Proofs Pending' },
    ];

    useEffect(() => {
        if (viewStep === 'PROCESSING') {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(() => setViewStep('COMPLETE'), 500);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 100);

            const logMessages = [
                "Initializing data validation for selected employees...",
                "Validating PAN details from TRACES portal...",
                "Generating PDF for Priya Sharma (TF00123)...",
                "Applying Digital Signature (DSC) to Priya Sharma's PDF...",
                "Generating PDF for Rahul Varma (TF00456)...",
                "Error: Rahul Varma missing mandatory proof for 80C. Skipping...",
                "Applying Password Protection to all generated PDFs...",
                "Compiling batch archive..."
            ];

            let logIdx = 0;
            const logInterval = setInterval(() => {
                if (logIdx < logMessages.length) {
                    setLogs(prev => [...prev, {
                        id: Date.now() + logIdx,
                        msg: logMessages[logIdx],
                        type: logMessages[logIdx].includes('Error') ? 'error' : logMessages[logIdx].includes('Applying') ? 'success' : 'info'
                    }]);
                    logIdx++;
                } else {
                    clearInterval(logInterval);
                }
            }, 800);

            return () => {
                clearInterval(interval);
                clearInterval(logInterval);
            };
        }
    }, [viewStep]);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    if (!isOpen) return null;

    const toggleSelectAll = () => {
        if (selectedEmps.length === form16Emps.length) {
            setSelectedEmps([]);
        } else {
            setSelectedEmps(form16Emps.map(e => e.id));
        }
    };

    const toggleEmp = (id: string) => {
        setSelectedEmps(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleStartGeneration = () => {
        setViewStep('PROCESSING');
        setProgress(0);
        setLogs([{ id: 1, msg: "Starting Form 16 batch generation...", type: 'info' }]);
    };

    const handleReset = () => {
        setViewStep('SETUP');
        setProgress(0);
        setLogs([]);
    };

    return (
        <div className="fixed inset-0 z-[120] bg-slate-50 flex flex-col animate-in fade-in duration-300">
            {/* Header Bar */}
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button onClick={viewStep === 'SETUP' ? onClose : handleReset} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <FileText className="text-indigo-600" size={24} /> Generate Form 16
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                            {viewStep === 'SETUP' && 'Issue TDS certificates for employees'}
                            {viewStep === 'PROCESSING' && 'Batch process in progress...'}
                            {viewStep === 'COMPLETE' && 'Generation completed successfully'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {viewStep === 'SETUP' && (
                        <>
                            <button onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                                Close
                            </button>
                            <button
                                onClick={handleStartGeneration}
                                className="px-8 py-2.5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all transform active:scale-95 flex items-center gap-2"
                            >
                                <Zap size={16} /> Start
                            </button>
                        </>
                    )}
                    {viewStep === 'PROCESSING' && (
                        <button onClick={handleReset} className="px-6 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 font-bold rounded-xl hover:bg-rose-100 transition-colors text-xs uppercase tracking-widest flex items-center gap-2">
                            <X size={16} /> Stop Generation
                        </button>
                    )}
                    {viewStep === 'COMPLETE' && (
                        <button
                            onClick={handleReset}
                            className="px-6 py-2.5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all transform active:scale-95 flex items-center gap-2"
                        >
                            <Plus size={16} /> Start New Batch
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="max-w-[1600px] mx-auto p-8">

                    {viewStep === 'SETUP' && (
                        <div className="grid grid-cols-1 gap-8 animate-in slide-in-from-bottom-4">
                            <div className="col-span-1 space-y-6">
                                {/* Top Filter Bar */}
                                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Financial Year</label>
                                        <div className="relative">
                                            <select
                                                value={selectedFY}
                                                onChange={e => setSelectedFY(e.target.value)}
                                                className="w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white appearance-none focus:outline-none focus:border-indigo-500"
                                            >
                                                <option>2025-26</option>
                                                <option>2024-25</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Reporting Unit</label>
                                        <div className="relative">
                                            <select className="w-full pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white appearance-none focus:outline-none focus:border-indigo-500">
                                                <option>TechFlow Systems Pvt Ltd</option>
                                                <option>TechFlow Solutions INC</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Search Employee</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Name, Code, or PAN..."
                                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-end">
                                        <button className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                            <Filter size={16} /> More Filters
                                        </button>
                                    </div>
                                </div>

                                {/* Options Panel */}
                                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Settings size={16} /> Generation Parameters
                                        </h3>
                                    </div>
                                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Output Option</label>
                                                <div className="space-y-3">
                                                    {[
                                                        { id: 'full', label: 'Generate Full Form 16 (Part A + B)' },
                                                        { id: 'partb', label: 'Generate Part B only' },
                                                        { id: 'regen', label: 'Re-generate' },
                                                    ].map(opt => (
                                                        <label key={opt.id} className="flex items-center gap-3 group cursor-pointer">
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${genOption === opt.id ? 'border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                                                                {genOption === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-in zoom-in-50" />}
                                                            </div>
                                                            <input type="radio" className="hidden" checked={genOption === opt.id} onChange={() => setGenOption(opt.id)} />
                                                            <span className={`text-sm font-bold ${genOption === opt.id ? 'text-slate-900' : 'text-slate-500'}`}>{opt.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSigning ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}>
                                                        {isSigning && <Check size={14} className="text-white" strokeWidth={4} />}
                                                    </div>
                                                    <input type="checkbox" className="hidden" checked={isSigning} onChange={() => setIsSigning(!isSigning)} />
                                                    <span className="text-sm font-bold text-slate-700">Digitally Sign PDFs (using DSC)</span>
                                                </label>
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${include12BA ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}>
                                                        {include12BA && <Check size={14} className="text-white" strokeWidth={4} />}
                                                    </div>
                                                    <input type="checkbox" className="hidden" checked={include12BA} onChange={() => setInclude12BA(!include12BA)} />
                                                    <span className="text-sm font-bold text-slate-700">Include Form 12BA if applicable</span>
                                                </label>
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isPasswordProtected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}>
                                                        {isPasswordProtected && <Check size={14} className="text-white" strokeWidth={4} />}
                                                    </div>
                                                    <input type="checkbox" className="hidden" checked={isPasswordProtected} onChange={() => setIsPasswordProtected(!isPasswordProtected)} />
                                                    <span className="text-sm font-bold text-slate-700">Password Protect PDFs</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className={`space-y-4 p-6 rounded-2xl border transition-all ${isSigning ? 'bg-slate-50 border-slate-200 border-dashed opacity-100' : 'bg-slate-50/50 border-slate-100 opacity-50 pointer-events-none'}`}>
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Shield size={14} className="text-indigo-500" /> Digital Signature Certificate (DSC)
                                            </h4>
                                            <div className="border-2 border-dashed border-slate-200 bg-white p-6 rounded-xl flex flex-col items-center justify-center text-center group cursor-pointer hover:border-indigo-300 transition-colors">
                                                <CloudUpload size={32} className="text-slate-300 group-hover:text-indigo-500 transition-colors mb-2" />
                                                <p className="text-xs font-bold text-slate-600">Click to upload .pfx file</p>
                                                <p className="text-[9px] text-slate-400 mt-1">PKCS#12 Standard</p>
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                                <input
                                                    type="password"
                                                    placeholder="Certificate Password"
                                                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Employee Table */}
                                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-8 py-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Employee Selection</h3>
                                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black">{selectedEmps.length} Selected</span>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <tr>
                                                    <th className="px-8 py-4 w-10">
                                                        <input type="checkbox" checked={selectedEmps.length === form16Emps.length} onChange={toggleSelectAll} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                                    </th>
                                                    <th className="px-4 py-4">Emp Code</th>
                                                    <th className="px-6 py-4">Employee Name</th>
                                                    <th className="px-6 py-4">PAN Number</th>
                                                    <th className="px-6 py-4">Location</th>
                                                    <th className="px-6 py-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {form16Emps.map(emp => (
                                                    <tr key={emp.id} onClick={() => toggleEmp(emp.id)} className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${selectedEmps.includes(emp.id) ? 'bg-indigo-50/30' : ''}`}>
                                                        <td className="px-8 py-4">
                                                            <input type="checkbox" checked={selectedEmps.includes(emp.id)} readOnly className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                                        </td>
                                                        <td className="px-4 py-4 font-mono text-xs text-slate-500">{emp.id}</td>
                                                        <td className="px-6 py-4 font-bold text-slate-800">{emp.name}</td>
                                                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{emp.pan}</td>
                                                        <td className="px-6 py-4 text-slate-500 font-medium">{emp.location}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${emp.status === 'Ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : emp.status === 'Generated' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                                {emp.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {viewStep === 'PROCESSING' && (
                        <div className="flex flex-col items-center justify-center min-h-[600px] max-w-4xl mx-auto space-y-12 animate-in zoom-in-95 duration-500">
                            <div className="text-center space-y-4">
                                <div className="inline-flex p-4 bg-indigo-100 text-indigo-600 rounded-3xl animate-bounce mb-4">
                                    <FileText size={48} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Generating Form 16 Certificates</h2>
                                <p className="text-slate-500 font-medium max-w-lg mx-auto">Please do not close this window. We are processing payroll data and applying digital signatures.</p>
                            </div>
                            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target</p>
                                    <p className="text-2xl font-black text-slate-800">452</p>
                                </div>
                                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completed</p>
                                    <p className="text-2xl font-black text-emerald-600">{Math.floor(452 * (progress / 100))}</p>
                                </div>
                                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Failed</p>
                                    <p className="text-2xl font-black text-rose-600">1</p>
                                </div>
                                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Remaining</p>
                                    <p className="text-2xl font-black text-slate-400">{452 - Math.floor(452 * (progress / 100))}</p>
                                </div>
                            </div>
                            <div className="w-full space-y-4">
                                <div className="flex justify-between items-end px-2">
                                    <span className="text-xs font-black text-indigo-600">{progress}% Processed</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated time: 45s</span>
                                </div>
                                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200 p-1">
                                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(79,70,229,0.4)]" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {viewStep === 'COMPLETE' && (
                        <div className="flex flex-col items-center justify-center min-h-[600px] max-w-4xl mx-auto space-y-12 animate-in zoom-in-95 duration-500">
                            <div className="text-center space-y-4">
                                <div className="inline-flex p-6 bg-emerald-100 text-emerald-600 rounded-[40px] shadow-lg shadow-emerald-100 mb-4 ring-8 ring-emerald-50">
                                    <Check size={64} strokeWidth={3} />
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Batch Generated!</h2>
                                <p className="text-slate-500 font-medium max-w-lg mx-auto">Success: <span className="text-emerald-600 font-bold">451 Form 16s</span> were generated and signed. Failed: <span className="text-rose-600 font-bold">1</span> (Missing PAN).</p>
                            </div>
                            <div className="w-full flex justify-center">
                                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center text-center max-w-md w-full">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors"><FileArchive size={32} /></div>
                                    <h4 className="font-black text-slate-800 mb-2">Download All</h4>
                                    <p className="text-xs text-slate-400 mb-8 px-4">Download a single compressed ZIP file containing all certificates.</p>
                                    <button
                                        onClick={() => {
                                            const dummyContent = "This is a mock ZIP file containing Form 16 certificates.";
                                            const blob = new Blob([dummyContent], { type: 'application/zip' });
                                            const url = URL.createObjectURL(blob);
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.download = `Form16_Batch_${selectedFY}.zip`;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            URL.revokeObjectURL(url);
                                        }}
                                        className="mt-auto w-full py-4 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 group-hover:border-blue-200 transition-all text-center"
                                    >
                                        Download ZIP
                                    </button>
                                </div>
                            </div>
                            <button onClick={handleReset} className="px-12 py-4 bg-white border-2 border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-sm">Back to Setup</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- 1. Edit Declaration Modal ---

const EditDeclarationModal: React.FC<EditModalProps> = ({ doc, onClose, onSave }) => {
    const [amount, setAmount] = useState(doc.amount);
    const [breakdown, setBreakdown] = useState(doc.breakdown);
    const [proofs, setProofs] = useState(doc.proofs);
    const [hrNote, setHrNote] = useState('');

    const handleBreakdownChange = (index: number, field: 'label' | 'amount', value: string) => {
        const newBreakdown = [...breakdown];
        if (field === 'amount') {
            newBreakdown[index].amount = parseInt(value) || 0;
        } else {
            newBreakdown[index].label = value;
        }
        setBreakdown(newBreakdown);
        // Auto update total
        const newTotal = newBreakdown.reduce((sum, item) => sum + item.amount, 0);
        setAmount(newTotal);
    };

    const addRow = () => {
        setBreakdown([...breakdown, { label: '', amount: 0 }]);
    };

    const removeRow = (index: number) => {
        const newBreakdown = breakdown.filter((_, i) => i !== index);
        setBreakdown(newBreakdown);
        const newTotal = newBreakdown.reduce((sum, item) => sum + item.amount, 0);
        setAmount(newTotal);
    };

    const handleSave = () => {
        onSave({ ...doc, amount, breakdown });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-sky-100 bg-sky-50 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Edit Investment Declaration</h3>
                        <p className="text-xs text-sky-700 font-medium">{doc?.employee_name || 'N/A'} ({doc?.employee_id || 'N/A'})</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-sky-100 rounded-full text-slate-400 hover:text-sky-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Employee Info Header (Read Only) */}
                    <div className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                        {doc?.avatar_url ? (
                            <img src={doc.avatar_url} alt="" className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-white shadow-sm">
                                <User size={20} />
                            </div>
                        )}
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                            <div className="col-span-1 sm:col-span-2">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Employee</p>
                                <p className="font-bold text-slate-800">{doc?.employee_name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Dept</p>
                                <p className="font-medium text-slate-700">Engineering</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Regime</p>
                                <p className="font-medium text-slate-700">{doc?.regime || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Editable Fields */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Declaration Type</label>
                                <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 font-medium cursor-not-allowed">
                                    {doc?.status === 'Approved' || doc?.status === 'Partially Approved' ? 'Confirmed Investment' : 'Proposed Investment'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Total Declared Amount (₹)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Breakdown Table */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Breakdown</label>
                                <button onClick={addRow} className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                                    <Plus size={12} /> Add Item
                                </button>
                            </div>
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Sub-Item / Category</th>
                                            <th className="px-3 py-2 text-right">Amount</th>
                                            <th className="px-3 py-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {breakdown.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={item.label}
                                                        onChange={(e) => handleBreakdownChange(idx, 'label', e.target.value)}
                                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm focus:border-purple-500 focus:outline-none"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        value={item.amount}
                                                        onChange={(e) => handleBreakdownChange(idx, 'amount', e.target.value)}
                                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-sm text-right focus:border-purple-500 focus:outline-none"
                                                    />
                                                </td>
                                                <td className="p-2 text-center">
                                                    <button onClick={() => removeRow(idx)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Proofs */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Attached Proofs</label>
                            <div className="grid grid-cols-3 gap-3">
                                {(proofs || []).map((proof, i) => (
                                    <div key={i} className="border border-slate-200 rounded-lg p-2 flex flex-col items-center text-center bg-slate-50 relative group">
                                        <div className="mb-1 text-slate-400"><FileText size={20} /></div>
                                        <p className="text-[10px] font-medium text-slate-600 truncate w-full">{proof?.file_name || 'File'}</p>
                                        <button className="absolute top-1 right-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <XCircle size={14} />
                                        </button>
                                    </div>
                                ))}
                                <button className="border-2 border-dashed border-purple-200 rounded-lg p-2 flex flex-col items-center justify-center text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors min-h-[80px]">
                                    <Upload size={20} className="mb-1" />
                                    <span className="text-[10px] font-bold">Upload New</span>
                                </button>
                            </div>
                        </div>

                        {/* HR Note */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">HR Note / Reason for Edit</label>
                            <textarea
                                value={hrNote}
                                onChange={(e) => setHrNote(e.target.value)}
                                placeholder="Why are you editing this declaration?"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 min-h-[80px] resize-none"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-sm transition-colors text-sm flex items-center gap-2">
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 2. Approve Declaration Modal ---

const ApproveDeclarationModal: React.FC<ApproveModalProps> = ({ doc, onClose, onDecide, initialDecision = 'Approved' }) => {
    const [decision, setDecision] = useState<'Approved' | 'Partially Approved' | 'Rejected'>(
        initialDecision === 'Approved' ? 'Partially Approved' : initialDecision
    );
    const [itemApprovals, setItemApprovals] = useState<Record<number, number>>(() => {
        const initialMap: Record<number, number> = {};
        if (doc.breakdown) {
            doc.breakdown.forEach((item, index) => {
                initialMap[index] = item.amount;
            });
        }
        return initialMap;
    });
    const [approvedAmount, setApprovedAmount] = useState<number>(doc.amount);
    const [reason, setReason] = useState('');
    const [rejectedItems, setRejectedItems] = useState<Set<number>>(new Set());

    const toggleItemReject = (idx: number) => {
        setRejectedItems(prev => {
            const next = new Set(prev);
            if (next.has(idx)) {
                next.delete(idx);
                // Restore original amount if un-rejecting (or just leave at 0?)
                // Let's restore to original to be helpful
                setItemApprovals(ia => ({ ...ia, [idx]: doc.breakdown[idx].amount }));
            } else {
                next.add(idx);
                setItemApprovals(ia => ({ ...ia, [idx]: 0 }));
            }
            return next;
        });
    };

    useEffect(() => {
        if (decision === 'Partially Approved' && doc.breakdown && doc.breakdown.length > 0) {
            const total = Object.values(itemApprovals).reduce((sum, val) => sum + val, 0);
            setApprovedAmount(total);
        }
    }, [itemApprovals, doc.breakdown, decision]);

    const handleSubmit = () => {
        let updatedBreakdown = doc.breakdown;
        if (decision === 'Partially Approved' && doc.breakdown) {
            updatedBreakdown = doc.breakdown.map((item, idx) => ({
                ...item,
                approved_amount: itemApprovals[idx] !== undefined ? itemApprovals[idx] : item.amount
            }));
        } else if (decision === 'Approved' && doc.breakdown) {
            updatedBreakdown = doc.breakdown.map(item => ({
                ...item,
                approved_amount: item.amount
            }));
        } else if (decision === 'Rejected' && doc.breakdown) {
            updatedBreakdown = doc.breakdown.map(item => ({
                ...item,
                approved_amount: 0
            }));
        }
        onDecide(doc.id, decision, approvedAmount, reason, updatedBreakdown);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-sky-100 bg-sky-50 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Approve Declaration</h3>
                        <p className="text-xs text-sky-700 font-medium">{doc?.employee_name || 'N/A'} ({doc?.employee_id || 'N/A'})</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-sky-100 rounded-full text-slate-400 hover:text-sky-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Summary */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Declaration</p>
                            <p className="font-bold text-slate-800">{doc?.type_label || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase">Declared Amount</p>
                            <p className="font-bold text-slate-800 text-lg">₹{(doc?.amount || 0).toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    {/* Approval Options */}
                    <div>
                        <div className="space-y-3">
                            {/* Full Approve hidden as per requirement - hide original block */}
                            {false && (
                                <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${decision === 'Approved' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                    <input type="radio" name="decision" checked={decision === 'Approved'} onChange={() => {
                                        setDecision('Approved');
                                        setApprovedAmount(doc.amount);
                                    }} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                                    <span className="ml-3 font-bold text-slate-700">Full Approve</span>
                                    <span className="ml-auto text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded">₹{(doc?.amount || 0).toLocaleString()}</span>
                                </label>
                            )}

                            <label className={`flex flex-col p-3 border rounded-xl cursor-pointer transition-all ${decision === 'Partially Approved' ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:bg-slate-50'}`}>
                                <div className="flex items-center w-full">
                                    <input type="radio" name="decision" checked={decision === 'Partially Approved'} onChange={() => setDecision('Partially Approved')} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                                    <span className="ml-3 font-bold text-slate-700">Approve</span>
                                </div>
                                {decision === 'Partially Approved' && (
                                    <div className="mt-3 ml-7 space-y-4 animate-in fade-in slide-in-from-top-1">
                                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3">
                                            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2">Item-wise Approval</p>
                                            {doc.breakdown && doc.breakdown.length > 0 ? (
                                                doc.breakdown.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between gap-4 p-2 bg-white rounded-lg border border-emerald-100/50">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-bold text-slate-700">{item.label}</p>
                                                            <p className="text-[10px] text-slate-500 font-medium">Declared: ₹{item.amount.toLocaleString()}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-slate-400">₹</span>
                                                                <input
                                                                    type="text"
                                                                    value={(itemApprovals[idx] || 0).toLocaleString()}
                                                                    disabled={rejectedItems.has(idx)}
                                                                    onChange={(e) => {
                                                                        const rawVal = e.target.value.replace(/[^0-9]/g, '');
                                                                        const val = Math.min(item.amount, Math.max(0, parseInt(rawVal) || 0));
                                                                        setItemApprovals(prev => ({ ...prev, [idx]: val }));
                                                                        if (val > 0 && rejectedItems.has(idx)) {
                                                                            setRejectedItems(prev => {
                                                                                const next = new Set(prev);
                                                                                next.delete(idx);
                                                                                return next;
                                                                            });
                                                                        }
                                                                    }}
                                                                    className={`w-24 px-2 py-1 border rounded text-sm font-bold focus:outline-none text-right transition-all ${rejectedItems.has(idx) ? 'bg-slate-50 border-slate-200 text-slate-400 font-medium' : 'border-slate-200 focus:border-emerald-500'}`}
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={(e) => { e.preventDefault(); toggleItemReject(idx); }}
                                                                title={rejectedItems.has(idx) ? "Approve Item" : "Reject Item"}
                                                                className={`p-1.5 rounded-lg transition-all ${rejectedItems.has(idx) ? 'bg-rose-500 text-white shadow-md' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'}`}
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-slate-600">Approved Amount: ₹</span>
                                                    <input
                                                        type="number"
                                                        value={approvedAmount}
                                                        onChange={(e) => setApprovedAmount(parseInt(e.target.value) || 0)}
                                                        className="w-32 px-2 py-1 border border-slate-300 rounded text-sm font-bold focus:border-emerald-500 focus:outline-none"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between px-4 py-2 bg-slate-100 rounded-lg">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Calculated Total Approval</span>
                                            <div className="flex items-center gap-3">
                                                {approvedAmount < (doc?.amount || 0) && (
                                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black uppercase rounded-md border border-amber-200 animate-pulse">
                                                        Partial Approval
                                                    </span>
                                                )}
                                                <span className="text-base font-black text-slate-800">₹{approvedAmount.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <textarea
                                            placeholder="Reason for partial approval (Mandatory)"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 min-h-[60px]"
                                        ></textarea>
                                    </div>
                                )}
                            </label>

                            <label className={`flex flex-col p-3 border rounded-xl cursor-pointer transition-all ${decision === 'Rejected' ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 hover:bg-slate-50'}`}>
                                <div className="flex items-center w-full">
                                    <input type="radio" name="decision" checked={decision === 'Rejected'} onChange={() => {
                                        setDecision('Rejected');
                                        setApprovedAmount(0);
                                    }} className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-gray-300" />
                                    <span className="ml-3 font-bold text-slate-700">Reject</span>
                                </div>
                                        <textarea
                                            placeholder="Reason for rejection (Mandatory)"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:outline-none focus:border-rose-500 min-h-[60px]"
                                        ></textarea>
                            </label>
                        </div>
                    </div>

                    {/* Note to Employee */}
                    {decision !== 'Rejected' && (
                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-xs font-bold text-slate-500 uppercase">Remarks</label>
                            <p className="text-[10px] text-slate-400 mb-2 font-medium">These remarks will also be visible to employees</p>
                            <textarea
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="Optional comment..."
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 min-h-[80px]"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0 z-10 relative">
                    <button onClick={onClose} className="px-8 py-2.5 bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={`px-8 py-2.5 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2 ${
                            decision === 'Approved' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' :
                            decision === 'Partially Approved' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' :
                            'bg-rose-500 hover:bg-rose-600 shadow-rose-100'
                        }`}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 3. Add Comment Modal ---

const AddCommentModal: React.FC<CommentModalProps> = ({ doc, onClose, onComment }) => {
    const [newComment, setNewComment] = useState('');
    const [requestProof, setRequestProof] = useState(false);
    const [notify, setNotify] = useState(true);

    // Mock History
    const history = [
        { author: 'System', text: 'Submitted by employee', date: '10 Dec 2025' },
        { author: 'HR Manager', text: 'Please upload the latest LIC receipt as the current one is blurry.', date: '15 Dec 2025' },
        { author: 'Employee', text: 'Uploaded new receipt.', date: '16 Dec 2025' }
    ];

    const handleSend = () => {
        onComment(doc.id, newComment);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-sky-100 bg-sky-50 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Add Comment</h3>
                        <p className="text-xs text-sky-700 font-medium">{doc?.employee_name || 'N/A'} ({doc?.employee_id || 'N/A'})</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-sky-100 rounded-full text-slate-400 hover:text-sky-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {/* History */}
                    <div className="space-y-3 pb-4">
                        {history.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.author === 'HR Manager' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.author === 'HR Manager'
                                    ? 'bg-purple-50 text-purple-900 rounded-br-none'
                                    : msg.author === 'System'
                                        ? 'bg-slate-100 text-slate-500 text-xs text-center w-full rounded-lg italic'
                                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                                    }`}>
                                    {msg.author !== 'System' && <p className="text-[10px] font-bold opacity-60 mb-1">{msg.author}</p>}
                                    <p>{msg.text}</p>
                                </div>
                                {msg.author !== 'System' && <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.date}</span>}
                            </div>
                        ))}
                    </div>

                    {/* New Comment Input */}
                    <div className="border-t border-slate-100 pt-4 mt-auto">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Type your comment here..."
                            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 min-h-[100px] resize-none"
                        ></textarea>

                        <div className="flex flex-col gap-2 mt-3">
                            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={requestProof}
                                    onChange={(e) => setRequestProof(e.target.checked)}
                                    className="rounded text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-sm font-medium text-slate-700">Request More Proof / Clarification</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer px-2">
                                <input
                                    type="checkbox"
                                    checked={notify}
                                    onChange={(e) => setNotify(e.target.checked)}
                                    className="rounded text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-xs font-bold text-slate-500">Send Notification to Employee</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm">
                        Cancel
                    </button>
                    <button onClick={handleSend} disabled={!newComment.trim()} className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-sm transition-colors text-sm flex items-center gap-2 disabled:opacity-50">
                        <Send size={16} /> Send Comment
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- View Declaration Modal (Updated) ---

const ViewDeclarationDetail: React.FC<ViewModalProps> = ({ doc, onClose, onEdit, onApprove, allDeclarations, onSwitchDoc }) => {
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Rejected': return 'bg-rose-50 text-rose-700 border-rose-100';
            case 'Pending': return 'bg-orange-50 text-orange-700 border-orange-100';
            case 'In Review': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Partially Approved': return 'bg-sky-50 text-sky-700 border-sky-100';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const employeeSections = allDeclarations.filter((d: TaxDeclaration) => d.employee_id === doc.employee_id);
    const parentStatus = computeParentStatus(employeeSections);
    
    const totalDeclared = employeeSections.reduce((sum, section) => sum + (section.amount || 0), 0);
    const totalApproved = employeeSections.reduce((sum, section) => sum + (section.approved_amount || 0), 0);

    const maxLimit = SECTION_LIMITS[doc.type] || 'NA';

    const handleViewProof = (fileName: string) => {
        const dummyContent = `<html><head><title>${fileName}</title></head><body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#f1f5f9;font-family:sans-serif;">
      <div style="background:white;padding:40px;border-radius:10px;box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1);text-align:center;">
        <h2 style="color:#1e293b;">Document Preview</h2>
        <p style="color:#64748b;margin-bottom:20px;">${fileName}</p>
        <div style="background:#f8fafc;border:2px dashed #cbd5e1;padding:40px;border-radius:8px;color:#94a3b8;">[Document Content Placeholder]</div>
      </div>
    </body></html>`;
        const blob = new Blob([dummyContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    const handleDownloadProof = (fileName: string) => {
        const dummyContent = `Placeholder content for ${fileName}\n\nGenerated by CollabCRM system.`;
        const blob = new Blob([dummyContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="px-8 py-5 border-b border-sky-100 bg-sky-50 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-sky-100 rounded-full text-slate-500 hover:text-sky-700 transition-colors bg-white shadow-sm border border-slate-200">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">View Investment Declaration</h3>
                        <p className="text-xs text-sky-700 font-medium">{doc?.employee_name || 'N/A'} ({doc?.employee_id || 'N/A'})</p>
                    </div>
                </div>
            </div>

            <div className="px-8 py-3 bg-white border-b border-slate-100">
                {/* Employee Info Header */}
                <div className="flex items-center gap-6 p-4 border border-slate-100 rounded-2xl bg-slate-50/50 shadow-sm">
                    {doc?.avatar_url ? (
                        <img src={doc.avatar_url} alt="" className="w-14 h-14 rounded-full border-4 border-white shadow-md object-cover" />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-4 border-white shadow-md">
                            <User size={28} />
                        </div>
                    )}
                    <div className="flex-1 flex justify-between items-center text-center sm:text-left">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                                <p className="font-bold text-slate-800 text-lg leading-tight">{doc?.employee_name || 'N/A'}</p>
                                <p className="text-xs text-slate-500 font-medium">({doc?.employee_id || 'N/A'})</p>
                            </div>
                        </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex flex-col items-end mr-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Declared</span>
                                    <span className="text-sm font-black text-slate-800 leading-none">₹{totalDeclared.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="hidden sm:flex flex-col items-end mr-4">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Approved</span>
                                    <span className="text-sm font-black text-emerald-600 leading-none">₹{totalApproved.toLocaleString('en-IN')}</span>
                                </div>
                                <span className={`hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white border border-slate-200 text-slate-600 shadow-sm`}>
                                    Tax Regime: {doc?.regime || 'N/A'}
                                </span>

                                <div className="flex flex-col items-end gap-1">
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-bold border shadow-sm ${getStatusStyle(parentStatus)}`}>
                                        {parentStatus}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 ml-2 border-l border-slate-200 pl-4">
                                    {['Approved', 'Partially Approved'].includes(parentStatus) && (
                                        <button
                                            onClick={onEdit}
                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors bg-white border border-slate-200 shadow-sm mr-1 flex items-center justify-center animate-in zoom-in duration-200"
                                            title="Edit Declaration"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className={['Approved', 'Partially Approved', 'Rejected'].includes(parentStatus)
                                            ? "px-4 py-2 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-1.5"
                                            : "px-4 py-2 bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-slate-50 transition-all shadow-sm"
                                        }
                                    >
                                        {['Approved', 'Partially Approved', 'Rejected'].includes(parentStatus) ? 'Close' : 'Cancel'}
                                    </button>
                                    {(!['Approved', 'Partially Approved', 'Rejected'].includes(parentStatus) || parentStatus === 'Partially Approved') && (
                                        <button
                                            onClick={onClose}
                                            className="px-4 py-2 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-1.5"
                                        >
                                            <CheckCircle size={14} /> Submit
                                        </button>
                                    )}
                                </div>
                            </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                    <div className="w-80 border-r border-slate-100 bg-slate-50/30 overflow-y-auto shrink-0 animate-in slide-in-from-left-4 duration-300">
                        <div className="p-4 space-y-3">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                <Zap size={12} className="text-indigo-500" /> All Declarations
                            </h4>
                            {allDeclarations
                                .filter(d => d.employee_id === doc.employee_id)
                                .map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => onSwitchDoc(item.id)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group ${item.id === doc.id
                                            ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-50'
                                            : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-xs font-bold ${item.id === doc.id ? 'text-indigo-600' : 'text-slate-700'}`}>
                                                {item.type_label}
                                            </span>
                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase border ${item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                item.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                    'bg-orange-50 text-orange-600 border-orange-100'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="font-bold text-slate-500">
                                                INR {item.amount.toLocaleString('en-IN')}
                                            </span>
                                            <div className="flex items-center gap-1 text-slate-400 font-bold">
                                                <Paperclip size={10} />
                                                {(item.proofs || []).length}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        {/* Declaration Summary */}
                        <div className={`grid grid-cols-2 ${doc?.status === 'Approved' || doc?.status === 'Partially Approved' || doc?.status === 'Pending' ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-6 border-b border-slate-100 pb-8`}>
                            <div>
                                <p className="text-[11px] text-slate-400 font-bold uppercase mb-2">Declaration Type</p>
                                <p className="font-bold text-purple-700 text-base">{doc?.status === 'Approved' || doc?.status === 'Partially Approved' ? 'Confirmed Investment' : 'Proposed Investment'}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-slate-400 font-bold uppercase mb-2">Maximum Limit</p>
                                <p className="font-bold text-slate-600 text-base">{maxLimit}</p>
                            </div>
                    <div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase mb-2">Declared Amount</p>
                        <p className="font-bold text-slate-600 text-base">₹{(doc?.amount || 0).toLocaleString('en-IN')}</p>
                    </div>

                    {doc.status === 'Pending' && (
                            <div className="flex items-end pb-1 h-full">
                                <div className="flex gap-3 p-1.5">
                                    {/* Approve icon button — green circle checkmark */}
                                    <button
                                        onClick={() => onApprove('Approved')}
                                        title="Approve"
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100 active:scale-95 group"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    </button>
                                    {/* Reject icon button — red circle X */}
                                    <button
                                        onClick={() => onApprove('Rejected')}
                                        title="Reject"
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 transition-all shadow-md shadow-rose-100 active:scale-95 group"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                    )}
                    {(doc?.status === 'Approved' || doc?.status === 'Partially Approved') && (
                        <div>
                            <p className="text-[11px] text-slate-400 font-bold uppercase mb-2">Approved Amount</p>
                            <p className="font-bold text-emerald-700 text-base">₹{(doc?.approved_amount || 0).toLocaleString('en-IN')}</p>
                            {doc?.status === 'Partially Approved' && doc?.remarks && (
                                <p className="text-[10px] text-slate-500 italic mt-2 leading-tight" title={doc.remarks}>
                                    <span className="font-bold uppercase text-[9px] text-slate-400 mr-1">Reason:</span>
                                    {doc.remarks}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Breakdown Table */}
                <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Declaration Breakdown</h4>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 border-b border-slate-200">Sub-Item / Category</th>
                                    {doc?.status === 'Partially Approved' ? (
                                        <>
                                            <th className="px-6 py-4 border-b border-slate-200 text-right">Declared Amount</th>
                                            <th className="px-6 py-4 border-b border-slate-200 text-right text-emerald-700">Approved Amount</th>
                                        </>
                                    ) : (
                                        <th className="px-6 py-4 border-b border-slate-200 text-right">Amount</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(doc?.breakdown || []).map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-700 font-medium">{item?.label || 'N/A'}</td>
                                        {doc?.status === 'Partially Approved' ? (
                                            <>
                                                <td className="px-6 py-4 text-right font-bold text-slate-500">₹{(item?.amount || 0).toLocaleString('en-IN')}</td>
                                                <td className="px-6 py-4 text-right font-bold text-emerald-600">₹{(item?.approved_amount !== undefined ? item.approved_amount : item?.amount || 0).toLocaleString('en-IN')}</td>
                                            </>
                                        ) : (
                                            <td className="px-6 py-4 text-right font-bold text-slate-900">₹{(item?.amount || 0).toLocaleString('en-IN')}</td>
                                        )}
                                    </tr>
                                ))}
                                <tr className="bg-slate-50/50 font-black text-lg">
                                    <td className="px-6 py-4 text-slate-800">Total</td>
                                    {doc?.status === 'Partially Approved' ? (
                                        <>
                                            <td className="px-6 py-4 text-right text-slate-500">₹{(doc?.amount || 0).toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4 text-right text-emerald-700">₹{(doc?.approved_amount || 0).toLocaleString('en-IN')}</td>
                                        </>
                                    ) : (
                                        <td className="px-6 py-4 text-right text-indigo-700">₹{(doc?.amount || 0).toLocaleString('en-IN')}</td>
                                    )}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Attached Proofs */}
                <div className="pb-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Attached Proofs ({(doc?.proofs || []).length})</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {(doc?.proofs || []).map((proof, i) => (
                            <div key={i} className="border border-slate-200 rounded-2xl p-4 flex flex-col items-center text-center gap-3 hover:border-indigo-400 transition-all group bg-white shadow-sm hover:shadow-lg relative cursor-pointer active:scale-95">
                                <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                                    {proof?.file_type === 'pdf' ? <FileText size={32} className="text-rose-500" /> : <ImageIcon size={32} className="text-sky-500" />}
                                </div>
                                <div className="w-full">
                                    <p className="text-[11px] font-bold text-slate-700 truncate px-1" title={proof?.file_name || 'File'}>{proof?.file_name || 'File'}</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-1">{proof?.size || '0 KB'}</p>
                                </div>
                                {/* Hover Actions */}
                                <div className="absolute inset-0 bg-indigo-600/90 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleViewProof(proof?.file_name || 'file.pdf'); }}
                                        className="p-2 bg-white shadow-lg rounded-xl text-indigo-600 hover:scale-110 transition-transform"
                                        title="View"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDownloadProof(proof?.file_name || 'file.pdf'); }}
                                        className="p-2 bg-white shadow-lg rounded-xl text-indigo-600 hover:scale-110 transition-transform"
                                        title="Download"
                                    >
                                        <Download size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
};

// --- Mock data for HR Add Declarations feature ---
const MOCK_PENDING_PROOFS = [
    { empId: 'TF00456', name: 'Rahul Varma', dept: 'Marketing', desig: 'Marketing Manager', status: 'Proofs Pending', dueDate: '31 Mar 2026' },
    { empId: 'SU00111', name: 'Kunal Singh', dept: 'Operations', desig: 'Operations Lead', status: 'Proofs Pending', dueDate: '31 Mar 2026' },
    { empId: 'TF00789', name: 'Sneha Kapur', dept: 'Finance', desig: 'Financial Analyst', status: 'Partially Submitted', dueDate: '15 Mar 2026' },
    { empId: 'AC00212', name: 'Arjun Mehta', dept: 'HR', desig: 'HR Executive', status: 'Proofs Pending', dueDate: '31 Mar 2026' },
];

const MOCK_TAX_LIABILITY = [
    { empId: 'TF00123', name: 'Priya Sharma', dept: 'Engineering', desig: 'Senior Developer', annualCTC: 1800000, totalTax: 142600, monthlyTax: 11883, regime: 'New Regime' },
    { empId: 'TF00456', name: 'Rahul Varma', dept: 'Marketing', desig: 'Marketing Manager', annualCTC: 1200000, totalTax: 78000, monthlyTax: 6500, regime: 'Old Regime' },
    { empId: 'TF00789', name: 'Sneha Kapur', dept: 'Finance', desig: 'Financial Analyst', annualCTC: 1500000, totalTax: 112400, monthlyTax: 9367, regime: 'New Regime' },
    { empId: 'AC00212', name: 'Arjun Mehta', dept: 'HR', desig: 'HR Executive', annualCTC: 900000, totalTax: 42900, monthlyTax: 3575, regime: 'New Regime' },
    { empId: 'AC00345', name: 'Anita Desai', dept: 'Engineering', desig: 'Frontend Developer', annualCTC: 1100000, totalTax: 63700, monthlyTax: 5308, regime: 'Old Regime' },
    { empId: 'SU00111', name: 'Kunal Singh', dept: 'Operations', desig: 'Operations Lead', annualCTC: 1350000, totalTax: 95200, monthlyTax: 7933, regime: 'New Regime' },
];

const MOCK_EMPLOYEES_DECL = [
    { id: 'TF00123', name: 'Priya Sharma', department: 'Engineering', designation: 'Senior Developer' },
    { id: 'TF00456', name: 'Rahul Varma', department: 'Marketing', designation: 'Marketing Manager' },
    { id: 'TF00789', name: 'Sneha Kapur', department: 'Finance', designation: 'Financial Analyst' },
    { id: 'AC00212', name: 'Arjun Mehta', department: 'HR', designation: 'HR Executive' },
    { id: 'AC00345', name: 'Anita Desai', department: 'Engineering', designation: 'Frontend Developer' },
    { id: 'SU00111', name: 'Kunal Singh', department: 'Operations', designation: 'Operations Lead' },
];

const LAST_APPROVED_HR_DATA = [
    { id: 1, section: '80C', title: 'Life Insurance Premium (LIC)', amount: 25000 },
    { id: 2, section: '80C', title: 'Public Provident Fund (PPF)', amount: 20000 },
    { id: 3, section: '80D', title: 'Self, Spouse, Children (below 60 years)', amount: 15000 },
    { id: 4, section: 'HRA', title: 'House Rent Allowance', amount: 180000 },
];

const HR_DECL_SECTIONS = [
    { code: '80C', name: 'Section 80C', limit: '₹1,50,000', color: 'purple' },
    { code: '80D', name: 'Section 80D – Medical Insurance', limit: '₹1,00,000', color: 'sky' },
    { code: 'HRA', name: 'House Rent Allowance (HRA)', limit: 'Exemption based on Rent', color: 'orange' },
    { code: '80CCD', name: 'Section 80CCD – NPS', limit: '₹50,000', color: 'indigo' },
    { code: '80E', name: 'Section 80E – Education Loan', limit: 'No Max Limit', color: 'emerald' },
    { code: '80G', name: 'Section 80G – Donations', limit: '50% / 100% of donation', color: 'amber' },
    { code: 'OTHERS', name: 'Other Investments & Exemptions', limit: 'Various', color: 'slate' },
];

const SECTION_80C_OPTS = [
    'Life Insurance Premium (LIC)', 'Public Provident Fund (PPF)', 'ELSS Mutual Fund',
    'NSC (National Savings Certificate)', 'Tax Saving FD', 'Sukanya Samriddhi Yojana',
    'Employee Provident Fund (EPF)', 'Tuition Fees', 'Home Loan Principal Repayment',
];
const SECTION_80D_OPTS = ['Self, Spouse, Children (below 60 years)', 'Self, Spouse & Parents (all below 60)', 'Parents above 60'];
const SECTION_HRA_OPTS = ['House Rent Allowance'];
const SECTION_80CCD_OPTS = ['80CCD(1B) – Additional NPS Contribution', '80CCD(2) – Employer NPS Contribution'];
const SECTION_80E_OPTS = ['Interest on Education Loan'];
const SECTION_80G_OPTS = ['Donations (100% Tax Exempt)', 'Donations (50% Tax Exempt)'];
const SECTION_OTHERS_OPTS = ['Section 80U – Disability', 'Section 80EEA – Affordable Housing Interest', 'Section 80TTA – Savings Interest', 'LTA – Leave Travel Allowance'];

const getSectionOpts = (code: string) => {
    if (code === '80C') return SECTION_80C_OPTS;
    if (code === '80D') return SECTION_80D_OPTS;
    if (code === 'HRA') return SECTION_HRA_OPTS;
    if (code === '80CCD') return SECTION_80CCD_OPTS;
    if (code === '80E') return SECTION_80E_OPTS;
    if (code === '80G') return SECTION_80G_OPTS;
    return SECTION_OTHERS_OPTS;
};

// --- HR Declaration Form (inline, used for Add Declarations and Edit) ---
interface HRDeclRow { id: number; section: string; title: string; amount: number; }

const HRDeclarationForm: React.FC<{
    employeeName: string;
    employeeId: string;
    mode: 'use_last' | 'new';
    onBack: () => void;
}> = ({ employeeName, employeeId, mode, onBack }) => {
    const [rows, setRows] = useState<HRDeclRow[]>(mode === 'use_last' ? LAST_APPROVED_HR_DATA : []);
    const [expandedSection, setExpandedSection] = useState<string | null>('80C');
    const [addingSection, setAddingSection] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    const totalDeclared = rows.reduce((s, r) => s + r.amount, 0);

    const handleAdd = () => {
        if (!addingSection || !newTitle || !newAmount) return;
        setRows(prev => [...prev, { id: Date.now(), section: addingSection, title: newTitle, amount: parseInt(newAmount) || 0 }]);
        setNewTitle(''); setNewAmount(''); setAddingSection(null);
    };

    const handleRemove = (id: number) => setRows(prev => prev.filter(r => r.id !== id));

    const handleSave = () => { setIsSaved(true); setTimeout(onBack, 1200); };

    const sectionColor: Record<string, string> = {
        '80C': 'purple', '80D': 'sky', 'HRA': 'orange', '80CCD': 'indigo',
        '80E': 'emerald', '80G': 'amber', 'OTHERS': 'slate'
    };

    const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
        purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
        sky: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-100' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
        slate: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' },
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <p className="text-xs text-slate-500 font-medium mb-0.5">Tax Declaration for Employee</p>
                            <h2 className="text-xl font-bold text-slate-800">{employeeName} <span className="text-sm font-mono text-slate-400 ml-2">({employeeId})</span></h2>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${mode === 'use_last' ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                            {mode === 'use_last' ? 'From Last Approved' : 'New Declaration'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                            <p className="text-[10px] font-black text-indigo-400 uppercase">Total Declared</p>
                            <p className="text-base font-black text-indigo-800">₹{totalDeclared.toLocaleString('en-IN')}</p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaved}
                            className="px-6 py-2.5 bg-sky-600 text-white font-bold text-sm rounded-xl hover:bg-sky-700 shadow-lg shadow-sky-100 transition-all flex items-center gap-2 disabled:opacity-70"
                        >
                            {isSaved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Declaration</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Sections */}
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3 mb-6">
                    <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                        You are adding tax declarations on behalf of <strong>{employeeName}</strong>. Ensure all declared amounts are verified. Submitted declarations will be visible to the employee.
                    </p>
                </div>

                {HR_DECL_SECTIONS.map(section => {
                    const sectionRows = rows.filter(r => r.section === section.code);
                    const sectionTotal = sectionRows.reduce((s, r) => s + r.amount, 0);
                    const isExpanded = expandedSection === section.code;
                    const color = sectionColor[section.code] || 'slate';
                    const cc = colorClasses[color];

                    return (
                        <div key={section.code} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <button
                                onClick={() => setExpandedSection(isExpanded ? null : section.code)}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`px-2.5 py-1 rounded-lg text-xs font-black border ${cc.bg} ${cc.text} ${cc.border}`}>{section.code}</div>
                                    <div className="text-left">
                                        <p className="font-bold text-slate-800 text-sm">{section.name}</p>
                                        <p className="text-xs text-slate-400 font-medium">Limit: {section.limit}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {sectionTotal > 0 && (
                                        <span className="text-sm font-black text-indigo-700">₹{sectionTotal.toLocaleString('en-IN')}</span>
                                    )}
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${sectionRows.length > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                        {sectionRows.length} item{sectionRows.length !== 1 ? 's' : ''}
                                    </span>
                                    {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="px-6 pb-5 border-t border-slate-100 animate-in slide-in-from-top-1">
                                    {sectionRows.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {sectionRows.map(row => (
                                                <div key={row.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="text-sm font-medium text-slate-700">{row.title}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-black text-slate-800">₹{row.amount.toLocaleString('en-IN')}</span>
                                                        <button onClick={() => handleRemove(row.id)} className="p-1 text-slate-300 hover:text-rose-500 transition-colors"><X size={14} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {addingSection === section.code ? (
                                        <div className="mt-4 p-4 bg-sky-50 border border-sky-100 rounded-xl space-y-3 animate-in fade-in">
                                            <div className="relative">
                                                <select
                                                    value={newTitle}
                                                    onChange={e => setNewTitle(e.target.value)}
                                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white appearance-none focus:outline-none focus:border-sky-500"
                                                >
                                                    <option value="">Select investment type</option>
                                                    {getSectionOpts(section.code).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={newAmount}
                                                    onChange={e => setNewAmount(e.target.value)}
                                                    placeholder="Enter amount (₹)"
                                                    className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500"
                                                />
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setAddingSection(null); setNewTitle(''); setNewAmount(''); }} className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                                                <button onClick={handleAdd} disabled={!newTitle || !newAmount} className="px-4 py-2 text-sm text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 font-medium">Add</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setAddingSection(section.code)}
                                            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:border-sky-300 hover:text-sky-600 transition-colors"
                                        >
                                            <Plus size={16} /> Add {section.name} Investment
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Main Container ---

interface TaxDeclarationsManagementProps {
    userRole?: string;
}

const TaxDeclarationsManagement: React.FC<TaxDeclarationsManagementProps> = ({ userRole = 'HR_MANAGER' }) => {
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [modalMode, setModalMode] = useState<'VIEW' | 'EDIT' | 'APPROVE' | 'COMMENT' | null>(null);
    const [initialDecision, setInitialDecision] = useState<'Approved' | 'Partially Approved' | 'Rejected'>('Approved');
    const [isForm16ModalOpen, setIsForm16ModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [declarations, setDeclarations] = useState<TaxDeclaration[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // HR Add Declarations flow
    const [hrDeclView, setHrDeclView] = useState<'SELECT' | 'FORM' | null>(null);
    const [hrDeclEmpId, setHrDeclEmpId] = useState('');
    const [hrDeclOption, setHrDeclOption] = useState<'use_last' | 'new'>('use_last');
    const [showPendingProofsRSP, setShowPendingProofsRSP] = useState(false);
    const [showTaxLiabilityRSP, setShowTaxLiabilityRSP] = useState(false);
    const [editDeclDocId, setEditDeclDocId] = useState<string | null>(null);

    // FIELDS configuration for Lookup Filter
    const FIELDS = [
        { name: 'Employee', icon: User },
        { name: 'Declaration Type', icon: FileText },
        { name: 'Status', icon: CheckSquare }
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

    const getOptionsForField = (field: string) => {
        if (field === 'Declaration Type') {
            return ['Proposed Investment', 'Confirmed Investment'];
        }
        if (field === 'Status') {
            return ['Approved', 'Pending', 'Rejected', 'Partially Approved'];
        }
        if (field === 'Section') {
            return ['80C', '80D', '80CCD', 'HRA', '80G', 'Others'];
        }
        
        // Extract unique values
        const uniqueValues = new Set<string>();
        (declarations || []).forEach(doc => {
            if (field === 'Employee') {
                uniqueValues.add(doc.employee_name || '');
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
            const vals = currentOperator === 'Contains' ? [tempContainsText] : tempValues;
            if (vals.length > 0 && (currentOperator !== 'Contains' || vals[0].trim() !== '')) {
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

    const fetchDeclarations = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('tax_declarations')
            .select(`
                *,
                employee:employees(name, avatar_url)
            `)
            .order('submitted_date', { ascending: false });

        if (!error && data && data.length > 0) {
            const mappedData = data.map((d: any) => ({
                ...d,
                employee_name: d.employee?.name || d.employee_name,
                avatar_url: d.employee?.avatar_url || d.avatar_url
            }));
            setDeclarations(mappedData);
        } else {
            setDeclarations(MOCK_TAX_DECLARATIONS);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchDeclarations();
    }, []);

    const selectedDoc = declarations.find(d => d.id === selectedDocId);

    const filteredDeclarations = useMemo(() => {
        return (declarations || []).filter(doc => {
            // 1. Text Search (searchTerm)
            const matchesSearch = searchTerm ? (
                (doc.employee_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (doc.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (doc.amount || 0).toString().includes(searchTerm) ||
                (doc.approved_amount || 0).toString().includes(searchTerm)
            ) : true;

            if (!matchesSearch) return false;

            // 2. Lookup Filters
            for (const filter of completedFilters) {
                let docValue = '';
                if (filter.field === 'Employee') {
                    docValue = doc.employee_name || '';
                } else if (filter.field === 'Declaration Type') {
                    docValue = (doc.status === 'Approved' || doc.status === 'Partially Approved')
                        ? 'Confirmed Investment'
                        : 'Proposed Investment';
                } else if (filter.field === 'Status') {
                    // Overall computed status
                    const empSections = declarations.filter((d: TaxDeclaration) => d.employee_id === doc.employee_id);
                    docValue = computeParentStatus(empSections);
                } else if (filter.field === 'Section') {
                    docValue = doc.type || '';
                }

                const isMatch = filter.operator === 'Contains'
                    ? docValue.toLowerCase().includes(filter.values[0].toLowerCase())
                    : filter.values.some(val => val.toLowerCase() === docValue.toLowerCase());

                if (filter.operator === 'Is' || filter.operator === 'Contains') {
                    if (!isMatch) return false;
                } else { // 'Is not'
                    if (isMatch) return false;
                }
            }

            return true;
        });
    }, [declarations, searchTerm, completedFilters]);

    const handleOpenView = (id: string) => {
        setSelectedDocId(id);
        setModalMode('VIEW');
    };

    const handleOpenEdit = () => setModalMode('EDIT');
    const handleOpenApprove = (decision: 'Approved' | 'Partially Approved' | 'Rejected' = 'Approved') => {
        setInitialDecision(decision);
        setModalMode('APPROVE');
    };
    const handleOpenComment = () => setModalMode('COMMENT');

    const handleClose = () => {
        setModalMode(null);
        setSelectedDocId(null);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Rejected': return 'bg-rose-50 text-rose-700 border-rose-100';
            case 'Pending': return 'bg-orange-50 text-orange-700 border-orange-100';
            case 'In Review': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Partially Approved': return 'bg-sky-50 text-sky-700 border-sky-100';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getTypeStyle = (type: string) => {
        switch (type) {
            case '80C': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'HRA': return 'bg-orange-50 text-orange-700 border-orange-100';
            case '80D': return 'bg-sky-50 text-sky-700 border-sky-100';
            case '80CCD': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
            case '80G': return 'bg-amber-50 text-amber-700 border-amber-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const stats = [
        { title: 'Total Declarations', value: '1,842', color: 'bg-white text-slate-800' },
        { title: 'Pending Approvals', value: '214', color: 'bg-orange-50 text-orange-700' },
        { title: userRole === 'HR_MANAGER' ? 'Approved' : 'Approved YTD', value: '1,628', color: 'bg-emerald-50 text-emerald-700' },
        { title: 'Rejected', value: '56', color: 'bg-rose-50 text-rose-700' },
    ];

    const handleUpdateStatus = async (id: string, status: string, approvedAmount?: number, remarks?: string, breakdown?: any[]) => {
        const updateFields: any = {
            status,
            approved_amount: approvedAmount,
            remarks,
            last_modified_by: 'HR Manager'
        };
        if (breakdown !== undefined) {
            updateFields.breakdown = breakdown;
        }

        const { error } = await supabase
            .from('tax_declarations')
            .update(updateFields)
            .eq('id', id);

        if (!error) {
            setDeclarations(prev => prev.map(doc =>
                doc.id === id ? {
                    ...doc,
                    status: status as any,
                    approved_amount: approvedAmount !== undefined ? approvedAmount : doc.approved_amount,
                    remarks: remarks !== undefined ? remarks : doc.remarks,
                    breakdown: breakdown !== undefined ? breakdown : doc.breakdown,
                    last_modified_by: 'HR Manager'
                } : doc
            ));
            setModalMode('VIEW');
        } else {
            console.error('Error updating status:', error);
        }
    };

    const handleSaveEdit = async (updatedDoc: TaxDeclaration) => {
        const { error } = await supabase
            .from('tax_declarations')
            .update({
                amount: updatedDoc.amount,
                breakdown: updatedDoc.breakdown,
                last_modified_by: 'HR Manager'
            })
            .eq('id', updatedDoc.id);

        if (!error) {
            setDeclarations(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc));
        } else {
            console.error('Error saving edit:', error);
        }
    };

    const hrDeclEmp = MOCK_EMPLOYEES_DECL.find(e => e.id === hrDeclEmpId);

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden animate-in fade-in duration-300">
            {/* HR Declaration inline flow */}
            {hrDeclView === 'FORM' && hrDeclEmpId ? (
                <HRDeclarationForm
                    employeeName={hrDeclEmp?.name || ''}
                    employeeId={hrDeclEmpId}
                    mode={hrDeclOption}
                    onBack={() => { setHrDeclView(null); setHrDeclEmpId(''); setEditDeclDocId(null); }}
                />
            ) : hrDeclView === 'SELECT' ? (
                /* Select Employee + Option Screen */
                <div className="flex flex-col h-full bg-slate-50 overflow-hidden animate-in fade-in duration-300">
                    <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0">
                        <div className="flex items-center gap-4">
                            <button onClick={() => { setHrDeclView(null); setHrDeclEmpId(''); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                    <Users className="text-sky-600" size={22} /> Add Declarations for Employee
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">Select an employee and choose how to add their investment declarations</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto flex items-start justify-center pt-12 px-8">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-xl p-8 space-y-6">
                            {/* Employee Select */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Select Employee <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <select
                                        value={hrDeclEmpId}
                                        onChange={e => setHrDeclEmpId(e.target.value)}
                                        className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white appearance-none focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                                    >
                                        <option value="">— Select Employee —</option>
                                        {MOCK_EMPLOYEES_DECL.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                                {hrDeclEmpId && (
                                    <p className="mt-1.5 text-xs text-slate-500">{MOCK_EMPLOYEES_DECL.find(e => e.id === hrDeclEmpId)?.department} — {MOCK_EMPLOYEES_DECL.find(e => e.id === hrDeclEmpId)?.designation}</p>
                                )}
                            </div>

                            {/* Investment Option */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Declaration Option</label>
                                <div className="space-y-3">
                                    {([
                                        { val: 'use_last', label: 'Use last approved request', desc: 'Pre-fill the form with the employee\'s last approved declarations' },
                                        { val: 'new', label: 'Make a new request', desc: 'Start with a blank form for fresh declarations' },
                                    ] as { val: 'use_last' | 'new'; label: string; desc: string }[]).map(opt => (
                                        <label
                                            key={opt.val}
                                            onClick={() => setHrDeclOption(opt.val)}
                                            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${hrDeclOption === opt.val ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                                        >
                                            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${hrDeclOption === opt.val ? 'border-sky-600' : 'border-slate-300'}`}>
                                                {hrDeclOption === opt.val && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                            </div>
                                            <div>
                                                <div className={`text-sm font-bold ${hrDeclOption === opt.val ? 'text-sky-800' : 'text-slate-700'}`}>{opt.label}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Continue Button */}
                            <button
                                disabled={!hrDeclEmpId}
                                onClick={() => setHrDeclView('FORM')}
                                className="w-full py-3 bg-sky-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-sky-700 shadow-lg shadow-sky-100 transition-all transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            ) : modalMode === 'VIEW' && selectedDoc ? (
                <ViewDeclarationDetail
                    doc={selectedDoc}
                    onClose={handleClose}
                    onEdit={handleOpenEdit}
                    onApprove={handleOpenApprove}
                    allDeclarations={declarations}
                    onSwitchDoc={(id) => setSelectedDocId(id)}
                />
            ) : (
                <>
                    {/* Header & Title */}
                    <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-tr from-sky-400 via-purple-500 to-yellow-500 rounded-lg text-white shadow-sm">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Tax Declarations</h1>
                                    <p className="text-sm text-slate-500">Manage and verify employee investment declarations</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => { setHrDeclView('SELECT'); setHrDeclEmpId(''); setHrDeclOption('use_last'); }} className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white font-black text-xs uppercase tracking-widest rounded-lg hover:bg-sky-700 shadow-lg shadow-sky-100 transition-all transform active:scale-95">
                                    <Plus size={18} /> Add Declarations for Employee
                                </button>
                                <button onClick={() => setIsForm16ModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all transform active:scale-95">
                                    <FileText size={18} /> Generate Form 16
                                </button>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                            {stats.map((stat, i) => (
                                <div key={i} className={`p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between ${stat.color}`}>
                                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-60 mb-1">{stat.title}</span>
                                    <span className="text-2xl font-black">{stat.value}</span>
                                </div>
                            ))}
                            {/* Pending Investment Proofs KPI */}
                            <div className="p-4 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between bg-amber-50 text-amber-700">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">Pending Inv. Proofs</span>
                                    <button onClick={() => setShowPendingProofsRSP(true)} className="p-1 hover:bg-amber-100 rounded-lg transition-colors" title="View Details">
                                        <Eye size={14} />
                                    </button>
                                </div>
                                <div>
                                    <span className="text-2xl font-black">4</span>
                                    <span className="text-[10px] font-bold opacity-60 ml-2">FY 2025-26</span>
                                </div>
                            </div>
                            {/* Proposed Tax Liability KPI */}
                            <div className="p-4 rounded-2xl border border-violet-100 shadow-sm flex flex-col justify-between bg-violet-50 text-violet-700">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">Proposed Tax Liab.</span>
                                    <button onClick={() => setShowTaxLiabilityRSP(true)} className="p-1 hover:bg-violet-100 rounded-lg transition-colors" title="View Details">
                                        <Eye size={14} />
                                    </button>
                                </div>
                                <div>
                                    <span className="text-2xl font-black">₹5.35L</span>
                                    <span className="text-[10px] font-bold opacity-60 ml-2">FY 2025-26</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden relative">

                        {/* Main List Table */}
                        <div className="flex-1 flex flex-col bg-white">
                            {/* Filters Bar */}
                            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center relative">
                                <div className="flex items-center gap-2 w-full flex-1">
                                    <div className="relative flex-1" ref={dropdownRef}>
                                        {/* Input-like container */}
                                        <div 
                                            onClick={() => {
                                                setDropdownOpen(true);
                                                inputRef.current?.focus();
                                            }}
                                            className="w-full flex flex-wrap items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm min-h-[40px] focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 transition-all cursor-text pr-10"
                                        >
                                            {/* Search icon (only if not building a filter, or we can always show it) */}
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
                                                        className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-0.5 text-xs font-semibold text-slate-700"
                                                    >
                                                        {FIcon && <FIcon size={12} className="text-slate-500" />}
                                                        <span>{filter.field}</span>
                                                        <span className="text-slate-400 font-bold lowercase text-[10px]">{filter.operator}</span>
                                                        <span className="bg-slate-200/60 px-1 rounded text-slate-800 max-w-[120px] truncate">
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
                                                <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-700">
                                                    {(() => {
                                                        const fObj = FIELDS.find(f => f.name === currentField);
                                                        const FIcon = fObj?.icon;
                                                        return FIcon ? <FIcon size={12} className="text-slate-500" /> : null;
                                                    })()}
                                                    <span>{currentField}</span>
                                                </div>
                                            )}

                                            {currentOperator && (
                                                <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-1.5 py-0.5 text-xs font-bold text-slate-600">
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
                                                        setDropdownOpen(false); // don't open field dropdown when typing normal search
                                                    }
                                                }}
                                                placeholder={
                                                    completedFilters.length === 0 && !currentField
                                                        ? "Filter Results..."
                                                        : currentField && currentOperator
                                                        ? "Select..."
                                                        : ""
                                                }
                                                className="flex-1 min-w-[60px] bg-transparent border-none outline-none text-slate-800 text-sm py-0.5 placeholder-slate-400 focus:ring-0 p-0"
                                            />

                                            {/* 4. Clear/Reset Button on the right of input container */}
                                            {(completedFilters.length > 0 || currentField || searchTerm) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        clearAllFilters();
                                                    }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
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
                                                        {(currentField === 'Employee' 
                                                            ? ['Is', 'Contains'] 
                                                            : currentField === 'Declaration Type' 
                                                            ? ['Is'] 
                                                            : ['Is', 'Is not']
                                                        ).map(op => (
                                                            <button
                                                                key={op}
                                                                onClick={() => selectOperator(op)}
                                                                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                                            >
                                                                <div className="w-4 h-4 flex items-center justify-center font-mono text-xs font-bold text-slate-400">
                                                                    {op === 'Is' ? '=' : op === 'Contains' ? '⊃' : '!='}
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
                                                        {currentOperator === 'Contains' ? (
                                                            <div className="p-3">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Type employee name..."
                                                                    value={tempContainsText}
                                                                    onChange={(e) => setTempContainsText(e.target.value)}
                                                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500"
                                                                    autoFocus
                                                                />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {/* Search options input inside dropdown */}
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
                                                            </>
                                                        )}
                                                        <div className="p-2 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                                                            <button
                                                                onClick={cancelCurrentFilter}
                                                                className="px-2.5 py-1 text-[10px] text-slate-500 font-bold hover:text-slate-700 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={applyCurrentFilter}
                                                                disabled={currentOperator === 'Contains' ? tempContainsText.trim() === '' : tempValues.length === 0}
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
                                    <button 
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-medium flex items-center gap-2 shadow-sm shrink-0 h-[40px]"
                                    >
                                        <Filter size={16} /> Filter
                                    </button>
                                </div>
                            </div>

                            {/* Table Body */}
                            <div className="flex-1 overflow-auto bg-white">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="bg-slate-50/50 sticky top-0 z-10 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">Employee Name & ID</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">Declaration Type</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">Declared Amount</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">Approved Amount</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">Status</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">Created By</th>
                                            <th className="px-6 py-4">Last Modified By</th>
                                            <th className="px-6 py-4 text-right">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {isLoading ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <tr key={i} className="animate-pulse">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-slate-100"></div>
                                                            <div className="space-y-2">
                                                                <div className="h-4 w-24 bg-slate-100 rounded"></div>
                                                                <div className="h-3 w-16 bg-slate-50 rounded"></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-100 rounded-lg"></div></td>
                                                    <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 rounded"></div></td>
                                                    <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 rounded"></div></td>
                                                    <td className="px-6 py-4"><div className="h-5 w-20 bg-slate-100 rounded-full"></div></td>
                                                    <td className="px-6 py-4"><div className="h-3 w-20 bg-slate-50 rounded italic"></div></td>
                                                    <td className="px-6 py-4"><div className="h-3 w-24 bg-slate-50 rounded italic"></div></td>
                                                    <td className="px-6 py-4"></td>
                                                </tr>
                                            ))
                                        ) : filteredDeclarations.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium">
                                                    No declarations found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredDeclarations.map((doc) => (
                                                <tr
                                                    key={doc?.id || Math.random()}
                                                    onClick={() => handleOpenView(doc?.id || '')}
                                                    className={`hover:bg-sky-50/30 cursor-pointer transition-colors group ${selectedDocId === doc?.id ? 'bg-sky-50/50' : ''}`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {doc?.avatar_url ? (
                                                                <img src={doc.avatar_url} alt="" className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200" />
                                                            ) : (
                                                                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                                                                    <User size={14} />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="font-bold text-slate-800">{doc?.employee_name || 'N/A'}</div>
                                                                <div className="text-xs text-slate-400 font-mono">{doc?.employee_id || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getTypeStyle(doc?.type || '')}`}>
                                                            {doc?.status === 'Approved' || doc?.status === 'Partially Approved' ? 'Confirmed Investment' : 'Proposed Investment'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-black text-slate-700">₹{(doc?.amount || 0).toLocaleString('en-IN')}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-black text-emerald-700">₹{(doc?.approved_amount || 0).toLocaleString('en-IN')}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {(() => {
                                                            const empSections = declarations.filter((d: TaxDeclaration) => d.employee_id === doc.employee_id);
                                                            const overall = computeParentStatus(empSections);
                                                            return (
                                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(overall)}`}>
                                                                    {overall}
                                                                </span>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-[11px] font-bold text-slate-700">
                                                            {doc?.created_by || 'Employee'}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                                            {doc?.created_at || '10 Dec 2025, 09:00 AM'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-[11px] font-bold text-slate-700">
                                                            {doc?.last_modified_by || 'Not modified'}
                                                        </div>
                                                        {doc?.last_modified_at && (
                                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                                {doc.last_modified_at}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-0.5">
                                                            <button onClick={(e) => { e.stopPropagation(); handleOpenView(doc?.id || ''); }} className="p-1.5 hover:bg-slate-100 hover:text-indigo-600 rounded-lg text-slate-400 transition-colors" title="View Details"><Eye size={15} /></button>
                                                            {doc?.status === 'Pending' && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setEditDeclDocId(doc?.id || null); setHrDeclEmpId(doc?.employee_id || ''); setHrDeclOption('new'); setHrDeclView('FORM'); }}
                                                                    className="p-1.5 hover:bg-slate-100 hover:text-sky-600 rounded-lg text-slate-400 transition-colors"
                                                                    title="Edit Declaration"
                                                                >
                                                                    <Edit2 size={15} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between items-center text-xs font-medium text-slate-500">
                                <span>Showing {filteredDeclarations.length} of {declarations.length} declarations</span>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors">Previous</button>
                                    <button className="px-3 py-1 bg-purple-600 text-white rounded-lg font-bold shadow-sm shadow-purple-100">1</button>
                                    <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">2</button>
                                    <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">3</button>
                                    <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {selectedDoc && modalMode === 'EDIT' && (
                <EditDeclarationModal
                    doc={selectedDoc}
                    onClose={() => setModalMode('VIEW')}
                    onSave={handleSaveEdit}
                />
            )}

            {selectedDoc && modalMode === 'APPROVE' && (
                <ApproveDeclarationModal
                    doc={selectedDoc}
                    initialDecision={initialDecision}
                    onClose={() => setModalMode('VIEW')}
                    onDecide={(id, decision, amount, note, breakdown) => handleUpdateStatus(id, decision, amount, note, breakdown)}
                />
            )}

            {selectedDoc && modalMode === 'COMMENT' && (
                <AddCommentModal
                    doc={selectedDoc}
                    onClose={() => setModalMode('VIEW')}
                    onComment={() => { }}
                />
            )}

            <Form16GenerationModal isOpen={isForm16ModalOpen} onClose={() => setIsForm16ModalOpen(false)} />

            {/* Pending Investment Proofs RSP */}
            {showPendingProofsRSP && (
                <div className="fixed inset-0 z-[100] flex">
                    <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setShowPendingProofsRSP(false)} />
                    <div className="w-[700px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <AlertTriangle className="text-amber-500" size={20} /> Pending Investment Proofs
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">FY 2025-26 — Employees with outstanding proof submissions</p>
                            </div>
                            <button onClick={() => setShowPendingProofsRSP(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><X size={18} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3">Employee</th>
                                            <th className="px-4 py-3">Department</th>
                                            <th className="px-4 py-3">Designation</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Due Date</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {MOCK_PENDING_PROOFS.map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-slate-800">{row.name}</div>
                                                    <div className="text-xs text-slate-400 font-mono">{row.empId}</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-600">{row.dept}</td>
                                                <td className="px-4 py-3 text-xs text-slate-600">{row.desig}</td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">{row.status}</span>
                                                </td>
                                                <td className="px-4 py-3 text-xs font-bold text-rose-600">{row.dueDate}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-100 rounded-lg text-xs font-bold hover:bg-sky-100 transition-colors ml-auto">
                                                        <Bell size={12} /> Send Reminder
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Proposed Tax Liability RSP */}
            {showTaxLiabilityRSP && (
                <div className="fixed inset-0 z-[100] flex">
                    <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setShowTaxLiabilityRSP(false)} />
                    <div className="w-[800px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <DollarSign className="text-violet-500" size={20} /> Proposed Tax Liability
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">FY 2025-26 — Employee-wise estimated tax liability</p>
                            </div>
                            <button onClick={() => setShowTaxLiabilityRSP(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><X size={18} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3">Employee</th>
                                            <th className="px-4 py-3">Department</th>
                                            <th className="px-4 py-3">Annual CTC</th>
                                            <th className="px-4 py-3">Total Tax</th>
                                            <th className="px-4 py-3">Monthly Tax</th>
                                            <th className="px-4 py-3">Regime</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {MOCK_TAX_LIABILITY.map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-slate-800">{row.name}</div>
                                                    <div className="text-xs text-slate-400 font-mono">{row.empId}</div>
                                                    <div className="text-[10px] text-slate-400">{row.desig}</div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-600">{row.dept}</td>
                                                <td className="px-4 py-3 text-xs font-bold text-slate-700">₹{(row.annualCTC / 100000).toFixed(1)}L</td>
                                                <td className="px-4 py-3 text-xs font-black text-rose-700">₹{row.totalTax.toLocaleString('en-IN')}</td>
                                                <td className="px-4 py-3 text-xs font-bold text-slate-600">₹{row.monthlyTax.toLocaleString('en-IN')}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${row.regime === 'New Regime' ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                                        {row.regime}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaxDeclarationsManagement;
