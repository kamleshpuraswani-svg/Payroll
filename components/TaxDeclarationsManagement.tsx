import React, { useState, useEffect, useRef } from 'react';
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
    FileSpreadsheet,
    CheckSquare,
    ArrowLeft,
    Zap,
    Settings,
    CloudUpload,
    Pause,
    Play,
    Activity
} from 'lucide-react';
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
    onDecide: (id: string, decision: 'Approved' | 'Rejected' | 'Partially Approved', amount?: number, note?: string) => void;
}

interface CommentModalProps extends ModalProps {
    onComment: (id: string, comment: string) => void;
}

interface ViewModalProps extends ModalProps {
    onEdit: () => void;
    onApprove: () => void;
}

const SECTION_LIMITS: Record<string, string> = {
    '80C': '₹1,50,000',
    '80D': '₹75,000',
    '80CCD': '₹50,000',
    'HRA': 'As per Rules',
    '80G': 'Donation Based',
    'Others': 'NA'
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
                        <p className="text-xs text-sky-700 font-medium">{doc.employeeName} ({doc.employeeId})</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-sky-100 rounded-full text-slate-400 hover:text-sky-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Employee Info Header (Read Only) */}
                    <div className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                        <img src={doc.avatarUrl} alt="" className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" />
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                            <div className="col-span-1 sm:col-span-2">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Employee</p>
                                <p className="font-bold text-slate-800">{doc.employeeName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Dept</p>
                                <p className="font-medium text-slate-700">Engineering</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Regime</p>
                                <p className="font-medium text-slate-700">{doc.regime}</p>
                            </div>
                        </div>
                    </div>

                    {/* Editable Fields */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Declaration Type</label>
                                <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 font-medium cursor-not-allowed">
                                    {doc.typeLabel}
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
                                {proofs.map((proof, i) => (
                                    <div key={i} className="border border-slate-200 rounded-lg p-2 flex flex-col items-center text-center bg-slate-50 relative group">
                                        <div className="mb-1 text-slate-400"><FileText size={20} /></div>
                                        <p className="text-[10px] font-medium text-slate-600 truncate w-full">{proof.fileName}</p>
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

const ApproveDeclarationModal: React.FC<ApproveModalProps> = ({ doc, onClose, onDecide }) => {
    const [decision, setDecision] = useState<'Approved' | 'Partially Approved' | 'Rejected'>('Approved');
    const [approvedAmount, setApprovedAmount] = useState<number>(doc.amount);
    const [reason, setReason] = useState('');
    const [sendNotification, setSendNotification] = useState(true);

    const handleSubmit = () => {
        onDecide(doc.id, decision, approvedAmount, reason);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-sky-100 bg-sky-50 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Approve Declaration</h3>
                        <p className="text-xs text-sky-700 font-medium">{doc.employeeName} ({doc.employeeId})</p>
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
                            <p className="font-bold text-slate-800">{doc.typeLabel}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase">Declared Amount</p>
                            <p className="font-bold text-slate-800 text-lg">₹{doc.amount.toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    {/* Approval Options */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Decision</label>
                        <div className="space-y-3">
                            <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${decision === 'Approved' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                <input type="radio" name="decision" checked={decision === 'Approved'} onChange={() => setDecision('Approved')} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                                <span className="ml-3 font-bold text-slate-700">Full Approve</span>
                                <span className="ml-auto text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded">₹{doc.amount.toLocaleString()}</span>
                            </label>

                            <label className={`flex flex-col p-3 border rounded-xl cursor-pointer transition-all ${decision === 'Partially Approved' ? 'border-orange-500 bg-orange-50/30' : 'border-slate-200 hover:bg-slate-50'}`}>
                                <div className="flex items-center w-full">
                                    <input type="radio" name="decision" checked={decision === 'Partially Approved'} onChange={() => setDecision('Partially Approved')} className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300" />
                                    <span className="ml-3 font-bold text-slate-700">Partial Approve</span>
                                </div>
                                {decision === 'Partially Approved' && (
                                    <div className="mt-3 ml-7 space-y-2 animate-in fade-in slide-in-from-top-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-600">Approved Amount: ₹</span>
                                            <input
                                                type="number"
                                                value={approvedAmount}
                                                onChange={(e) => setApprovedAmount(parseInt(e.target.value) || 0)}
                                                className="w-32 px-2 py-1 border border-slate-300 rounded text-sm font-bold focus:border-orange-500 focus:outline-none"
                                            />
                                        </div>
                                        <textarea
                                            placeholder="Reason for partial approval (Mandatory)"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 min-h-[60px]"
                                        ></textarea>
                                    </div>
                                )}
                            </label>

                            <label className={`flex flex-col p-3 border rounded-xl cursor-pointer transition-all ${decision === 'Rejected' ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 hover:bg-slate-50'}`}>
                                <div className="flex items-center w-full">
                                    <input type="radio" name="decision" checked={decision === 'Rejected'} onChange={() => setDecision('Rejected')} className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-gray-300" />
                                    <span className="ml-3 font-bold text-slate-700">Reject</span>
                                </div>
                                {decision === 'Rejected' && (
                                    <div className="mt-3 ml-7 animate-in fade-in slide-in-from-top-1">
                                        <textarea
                                            placeholder="Reason for rejection (Mandatory)"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:outline-none focus:border-rose-500 min-h-[60px]"
                                        ></textarea>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Read-Only Proofs */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Attached Proofs (Review)</label>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {doc.proofs.map((proof, i) => (
                                <div key={i} className="min-w-[100px] border border-slate-200 rounded-lg p-2 flex flex-col items-center text-center bg-slate-50">
                                    <FileText size={16} className="text-slate-400 mb-1" />
                                    <p className="text-[9px] font-medium text-slate-600 truncate w-full" title={proof.fileName}>{proof.fileName}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Note to Employee */}
                    <div className="pt-4 border-t border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Additional Note to Employee</label>
                        <textarea
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Optional comment..."
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 min-h-[60px]"
                        />
                        <div className="mt-2 flex items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={sendNotification}
                                    onChange={(e) => setSendNotification(e.target.checked)}
                                    className="rounded text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-xs font-bold text-slate-600">Send Notification (Email/SMS)</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={`px-6 py-2.5 text-white font-bold rounded-xl shadow-sm transition-colors text-sm flex items-center gap-2 ${decision === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' :
                            decision === 'Partially Approved' ? 'bg-orange-500 hover:bg-orange-600' :
                                'bg-rose-600 hover:bg-rose-700'
                            }`}
                    >
                        Submit Decision
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
                        <p className="text-xs text-sky-700 font-medium">{doc.employeeName} ({doc.employeeId})</p>
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

const ViewDeclarationModal: React.FC<ViewModalProps> = ({ doc, onClose, onEdit, onApprove }) => {
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Rejected': return 'bg-rose-50 text-rose-700 border-rose-100';
            case 'Pending': return 'bg-orange-50 text-orange-700 border-orange-100';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-sky-100 bg-sky-50 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">View Investment Declaration</h3>
                        <p className="text-xs text-sky-700 font-medium">{doc.employeeName} ({doc.employeeId})</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="p-2 hover:bg-sky-100 rounded-full text-slate-400 hover:text-sky-700 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Employee Info Header */}
                    <div className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                        <img src={doc.avatarUrl} alt="" className="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover" />
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 text-sm">
                            <div className="col-span-1 sm:col-span-2">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Employee</p>
                                <p className="font-bold text-slate-800">{doc.employeeName}</p>
                                <p className="text-xs text-slate-500">{doc.employeeId}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Department</p>
                                <p className="font-medium text-slate-700">Engineering</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">CTC</p>
                                <p className="font-medium text-slate-700">{doc.ctc}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-4 pt-1">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-white border border-slate-200 text-slate-600 shadow-sm">
                                    Tax Regime: {doc.regime}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Declaration Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-slate-100 pb-6">
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Declaration Type</p>
                            <p className="font-bold text-purple-700 text-sm">{doc.typeLabel}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Max Limit</p>
                            <p className="font-bold text-slate-600 text-sm">{maxLimit}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Declared Amount</p>
                            <p className="font-bold text-slate-800 text-lg">₹{doc.amount.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Submitted Date</p>
                            <p className="font-medium text-slate-700 text-sm flex items-center gap-1"><Calendar size={12} /> {doc.submittedDate}</p>
                        </div>
                    </div>

                    {/* Breakdown Table */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Declaration Breakdown</h4>
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-2 border-b border-slate-200">Sub-Item / Category</th>
                                        <th className="px-4 py-2 border-b border-slate-200 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {doc.breakdown.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-2.5 text-slate-700">{item.label}</td>
                                            <td className="px-4 py-2.5 text-right font-medium text-slate-800">₹{item.amount.toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-50/50 font-bold">
                                        <td className="px-4 py-2.5 text-slate-800">Total</td>
                                        <td className="px-4 py-2.5 text-right text-slate-900">₹{doc.amount.toLocaleString('en-IN')}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Attached Proofs */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Attached Proofs ({doc.proofs.length})</h4>
                        <div className="grid grid-cols-3 gap-3">
                            {doc.proofs.map((proof, i) => (
                                <div key={i} className="border border-slate-200 rounded-xl p-3 flex flex-col items-center text-center gap-2 hover:border-purple-300 transition-all group bg-white shadow-sm hover:shadow-md relative cursor-pointer">
                                    <div className="mb-1">
                                        {proof.fileType === 'pdf' ? <FileText size={24} className="text-rose-500" /> : <ImageIcon size={24} className="text-sky-500" />}
                                    </div>
                                    <div className="w-full">
                                        <p className="text-[10px] font-medium text-slate-700 truncate px-1" title={proof.fileName}>{proof.fileName}</p>
                                        <p className="text-[9px] text-slate-400 mt-0.5">{proof.size}</p>
                                    </div>
                                    {/* Hover Actions */}
                                    <div className="absolute inset-0 bg-slate-900/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleViewProof(proof.fileName); }}
                                            className="p-1.5 bg-white shadow-sm border border-slate-200 rounded-lg text-slate-600 hover:text-purple-600 transition-colors"
                                            title="View"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDownloadProof(proof.fileName); }}
                                            className="p-1.5 bg-white shadow-sm border border-slate-200 rounded-lg text-slate-600 hover:text-purple-600 transition-colors"
                                            title="Download"
                                        >
                                            <Download size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status & Log */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-slate-500 uppercase">Current Status</h4>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(doc.status)}`}>{doc.status}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-200">
                            <Clock size={12} />
                            <span>Submitted by employee – {doc.submittedDate}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm">
                        Close
                    </button>
                    <div className="flex gap-2">
                        <button onClick={onApprove} className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-sm transition-colors text-sm flex items-center gap-2">
                            <CheckCircle size={16} /> Decide
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Container ---

const TaxDeclarationsManagement: React.FC = () => {
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [modalMode, setModalMode] = useState<'VIEW' | 'EDIT' | 'APPROVE' | 'COMMENT' | null>(null);
    const [isForm16ModalOpen, setIsForm16ModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [declarations, setDeclarations] = useState(MOCK_TAX_DECLARATIONS);

    const selectedDoc = declarations.find(d => d.id === selectedDocId);

    const handleOpenView = (id: string) => {
        setSelectedDocId(id);
        setModalMode('VIEW');
    };

    const handleOpenEdit = () => setModalMode('EDIT');
    const handleOpenApprove = () => setModalMode('APPROVE');
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
        { title: 'Approved YTD', value: '1,628', color: 'bg-emerald-50 text-emerald-700' },
        { title: 'Rejected', value: '56', color: 'bg-rose-50 text-rose-700' },
    ];

    const handleUpdateStatus = (id: string, status: string) => {
        setDeclarations(prev => prev.map(doc =>
            doc.id === id ? { ...doc, status: status as any } : doc
        ));
    };

    const handleSaveEdit = (updatedDoc: TaxDeclaration) => {
        setDeclarations(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc));
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden animate-in fade-in duration-300">

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
                    <button onClick={() => setIsForm16ModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all transform active:scale-95">
                        <FileText size={18} /> Generate Form 16
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className={`p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between ${stat.color}`}>
                            <span className="text-[11px] font-bold uppercase tracking-wider opacity-60 mb-1">{stat.title}</span>
                            <span className="text-2xl font-black">{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">

                {/* Main List Table */}
                <div className="flex-1 flex flex-col bg-white">
                    {/* Filters Bar */}
                    <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap gap-3 items-center">
                        <div className="flex-1 min-w-[240px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search employee, ID or amount..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                Employee <ChevronDown size={14} />
                            </button>
                            <button className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                Type <ChevronDown size={14} />
                            </button>
                            <button className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                Status <ChevronDown size={14} />
                            </button>
                            <button className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                                Date <ChevronDown size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="flex-1 overflow-auto bg-white">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-50/50 sticky top-0 z-10 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Employee Name & ID</th>
                                    <th className="px-6 py-4">Declaration Type</th>
                                    <th className="px-6 py-4">Declared Amt</th>
                                    <th className="px-6 py-4">Submitted Date</th>
                                    <th className="px-6 py-4 text-center">Proofs</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {declarations.map((doc) => (
                                    <tr
                                        key={doc.id}
                                        onClick={() => handleOpenView(doc.id)}
                                        className={`hover:bg-sky-50/30 cursor-pointer transition-colors group ${selectedDocId === doc.id ? 'bg-sky-50/50' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={doc.avatarUrl} alt="" className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200" />
                                                <div>
                                                    <div className="font-bold text-slate-800">{doc.employeeName}</div>
                                                    <div className="text-xs text-slate-400 font-mono">{doc.employeeId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getTypeStyle(doc.type)}`}>
                                                {doc.typeLabel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-black text-slate-700">₹{doc.amount.toLocaleString('en-IN')}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                            {doc.submittedDate}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                                                <FileText size={12} /> {doc.proofs.length} Files
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(doc.status)}`}>
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-0.5">
                                                <button onClick={(e) => { e.stopPropagation(); handleOpenView(doc.id); }} className="p-1.5 hover:bg-slate-100 hover:text-indigo-600 rounded-lg text-slate-400 transition-colors" title="View Details"><Eye size={15} /></button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedDocId(doc.id); setModalMode('APPROVE'); }}
                                                    className="p-1.5 hover:bg-slate-100 hover:text-emerald-600 rounded-lg text-slate-400 transition-colors"
                                                    title="Decide"
                                                >
                                                    <Check size={15} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedDocId(doc.id); setModalMode('COMMENT'); }}
                                                    className="p-1.5 hover:bg-slate-100 hover:text-sky-600 rounded-lg text-slate-400 transition-colors"
                                                    title="Add Note"
                                                >
                                                    <MessageSquare size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between items-center text-xs font-medium text-slate-500">
                        <span>Showing 1-6 of 2,140 declarations</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors">Previous</button>
                            <button className="px-3 py-1 bg-purple-600 text-white rounded-lg font-bold shadow-sm shadow-purple-100">1</button>
                            <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">2</button>
                            <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">3</button>
                            <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Next</button>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {selectedDoc && modalMode === 'VIEW' && (
                    <ViewDeclarationModal
                        doc={selectedDoc}
                        onClose={handleClose}
                        onEdit={handleOpenEdit}
                        onApprove={handleOpenApprove}
                    />
                )}

                {selectedDoc && modalMode === 'EDIT' && (
                    <EditDeclarationModal
                        doc={selectedDoc}
                        onClose={handleClose}
                        onSave={handleSaveEdit}
                    />
                )}

                {selectedDoc && modalMode === 'APPROVE' && (
                    <ApproveDeclarationModal
                        doc={selectedDoc}
                        onClose={handleClose}
                        onDecide={(id, decision) => handleUpdateStatus(id, decision)}
                    />
                )}

                {selectedDoc && modalMode === 'COMMENT' && (
                    <AddCommentModal
                        doc={selectedDoc}
                        onClose={handleClose}
                        onComment={() => { }}
                    />
                )}
                <Form16GenerationModal isOpen={isForm16ModalOpen} onClose={() => setIsForm16ModalOpen(false)} />
            </div>
        </div>
    );
};

export default TaxDeclarationsManagement;
