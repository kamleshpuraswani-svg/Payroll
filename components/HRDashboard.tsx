

import React, { useState, useMemo } from 'react';
import {
    Users,
    Calendar,
    Clock,
    FileText,
    CheckCircle,
    AlertCircle,
    Briefcase,
    ChevronRight,
    TrendingUp,
    PieChart,
    DollarSign,
    Download,
    AlertTriangle,
    UserPlus,
    FileWarning,
    Activity,
    X,
    PlayCircle,
    ArrowRight,
    ShieldCheck,
    Mail,
    Search,
    Check,
    Send,
    Bell,
    Info,
    ChevronDown,
    Filter,
    BarChart2,
    Eye
} from 'lucide-react';
import StatCard from './StatCard';
import ApprovalsPanel from './ApprovalsPanel';
import { RunPayrollModal } from './CompanyActionModals';
import { StatMetric, Company } from '../types';
import { MOCK_APPROVALS } from '../constants';

// --- Sub-Modals for Payroll Actions ---



const ScheduleDetailsModal: React.FC<{ onClose: () => void; onBack: () => void }> = ({ onClose, onBack }) => (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2">
                    <button onClick={onBack} className="text-slate-400 hover:text-slate-600"><ChevronRight className="rotate-180" size={20} /></button>
                    <h3 className="font-bold text-slate-800">Payroll Schedule</h3>
                </div>
                <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 p-3 border border-indigo-100 bg-indigo-50 rounded-lg">
                    <div className="p-2 bg-white rounded-full text-indigo-600"><Calendar size={20} /></div>
                    <div>
                        <p className="text-xs text-indigo-600 font-bold uppercase">Current Cycle</p>
                        <p className="text-sm font-bold text-slate-800">November 2025</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Pay Frequency</span>
                        <span className="font-medium text-slate-800">Monthly</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Pay Day</span>
                        <span className="font-medium text-slate-800">Last Working Day</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Processing Date</span>
                        <span className="font-medium text-slate-800">28th - 30th Nov</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Bank Transfer Date</span>
                        <span className="font-medium text-emerald-600">30th Nov 2025</span>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button onClick={onClose} className="w-full py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors text-sm">Close</button>
            </div>
        </div>
    </div>
);

const PayrollConfigurationModal: React.FC<{ onClose: () => void; onBack: () => void }> = ({ onClose, onBack }) => (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2">
                    <button onClick={onBack} className="text-slate-400 hover:text-slate-600"><ChevronRight className="rotate-180" size={20} /></button>
                    <h3 className="font-bold text-slate-800">Payroll Settings</h3>
                </div>
                <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
            </div>
            <div className="p-6 space-y-5">
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase">Automation</h4>
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-slate-700">Auto-release Payslips</span>
                        <div className="w-9 h-5 bg-emerald-500 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-slate-700">Send Email Notifications</span>
                        <div className="w-9 h-5 bg-emerald-500 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                    </label>
                </div>

                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase">Components</h4>
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-slate-700">Include Variable Pay</span>
                        <div className="w-9 h-5 bg-emerald-500 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-slate-700">Deduct Professional Tax</span>
                        <div className="w-9 h-5 bg-emerald-500 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                    </label>
                </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button onClick={onBack} className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors text-sm">Cancel</button>
                <button onClick={onClose} className="flex-1 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm">Save Changes</button>
            </div>
        </div>
    </div>
);

const SendPayslipsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [employees, setEmployees] = useState([
        { id: '1', name: 'Arjun Mehta', email: 'arjun@techflow.com', dept: 'Sales', status: 'Pending' },
        { id: '2', name: 'Priya Sharma', email: 'priya@techflow.com', dept: 'Engineering', status: 'Pending' },
        { id: '3', name: 'Rohan Desai', email: 'rohan@techflow.com', dept: 'Marketing', status: 'Pending' },
        { id: '4', name: 'Ananya Patel', email: 'ananya@techflow.com', dept: 'HR', status: 'Pending' },
        { id: '5', name: 'Vikram Singh', email: 'vikram@techflow.com', dept: 'Finance', status: 'Pending' },
    ]);

    const [stats, setStats] = useState({ sent: 0, pending: 450 });
    const [sendingAll, setSendingAll] = useState(false);
    const [sendingIds, setSendingIds] = useState<string[]>([]);

    const handleSendSingle = (id: string) => {
        if (sendingIds.includes(id)) return;

        setSendingIds(prev => [...prev, id]);

        // Simulate API delay
        setTimeout(() => {
            setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: 'Sent' } : e));
            setStats(prev => ({ sent: prev.sent + 1, pending: prev.pending - 1 }));
            setSendingIds(prev => prev.filter(sid => sid !== id));
        }, 800);
    };

    const handleSendAll = () => {
        setSendingAll(true);
        // Simulate API call
        setTimeout(() => {
            setEmployees(prev => prev.map(e => ({ ...e, status: 'Sent' })));
            setStats({ sent: 450, pending: 0 });
            setSendingAll(false);
            setTimeout(onClose, 1000);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Distribute Payslips</h3>
                        <p className="text-xs text-slate-500">November 2025 Cycle</p>
                    </div>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                {/* Stats */}
                <div className="px-6 py-4 bg-white border-b border-slate-100 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <p className="text-xs text-emerald-700 font-medium">Payslips Sent</p>
                        <p className="text-lg font-bold text-emerald-800">{stats?.sent || 0}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-xs text-amber-700 font-medium">Pending</p>
                        <p className="text-lg font-bold text-amber-800">{stats?.pending || 0}</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="px-6 py-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-6 py-2 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pending Recipients</p>
                    {employees.map(emp => (
                        <div key={emp.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${emp?.status === 'Sent' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                    {emp?.status === 'Sent' ? <Check size={14} /> : (emp?.name || 'E').charAt(0)}
                                </div>
                                <div>
                                    <p className={`text-sm font-semibold ${emp?.status === 'Sent' ? 'text-slate-500' : 'text-slate-800'}`}>{emp?.name || 'N/A'}</p>
                                    <p className="text-xs text-slate-500">{emp?.email || 'N/A'}</p>
                                </div>
                            </div>

                            {emp?.status === 'Sent' ? (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-100">
                                    <Check size={12} /> Sent
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleSendSingle(emp?.id || '')}
                                    disabled={sendingIds.includes(emp?.id || '') || sendingAll}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sendingIds.includes(emp?.id || '') ? 'Sending...' : <><Send size={12} /> Send</>}
                                </button>
                            )}
                        </div>
                    ))}
                    {stats.pending > 5 && (
                        <div className="text-center py-4 text-xs text-slate-400 italic">
                            + {Math.max(0, stats.pending - employees.filter(e => e.status === 'Pending').length)} more employees
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium text-sm hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
                        Close
                    </button>
                    <button
                        onClick={handleSendAll}
                        disabled={sendingAll || stats.pending === 0}
                        className="px-6 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2 disabled:opacity-70 transition-all"
                    >
                        {sendingAll ? (
                            <>Sending All...</>
                        ) : (
                            <>
                                <Mail size={16} /> Send Remaining ({stats.pending})
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
const PendingTaxProofsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [remindedList, setRemindedList] = useState<string[]>([]);
    const [remindingAll, setRemindingAll] = useState(false);

    const employees = [
        { id: '1', name: 'Vikram Singh', email: 'vikram@techflow.com', dept: 'Finance', missing: '80C Investments', avatar: 'V' },
        { id: '2', name: 'Neha Kapoor', email: 'neha@techflow.com', dept: 'Marketing', missing: 'Rent Receipts (HRA)', avatar: 'N' },
        { id: '3', name: 'Rahul Sharma', email: 'rahul@techflow.com', dept: 'Sales', missing: 'Medical Bills', avatar: 'R' },
        { id: '4', name: 'Simran Kaur', email: 'simran@techflow.com', dept: 'Engineering', missing: 'Home Loan Cert', avatar: 'S' },
        { id: '5', name: 'Amit Patel', email: 'amit@techflow.com', dept: 'Operations', missing: 'LTA Proofs', avatar: 'A' },
        { id: '6', name: 'Priya Desai', email: 'priya.d@techflow.com', dept: 'HR', missing: 'Previous Emp Income', avatar: 'P' },
    ];

    const handleRemind = (id: string) => {
        if (!remindedList.includes(id)) {
            setRemindedList(prev => [...prev, id]);
        }
    };

    const handleRemindAll = () => {
        setRemindingAll(true);
        setTimeout(() => {
            setRemindedList(employees.map(e => e.id));
            setRemindingAll(false);
        }, 1500);
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <FileWarning size={20} className="text-amber-500" />
                            Pending Tax Proofs
                        </h3>
                        <p className="text-xs text-slate-500">24 employees need to submit proofs before 20 Nov</p>
                    </div>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-2">
                    {/* List */}
                    <div className="space-y-3 mt-4">
                        {employees.map(emp => (
                            <div key={emp.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                                        {emp?.avatar || 'E'}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">{emp?.name || 'N/A'}</h4>
                                        <div className="text-xs text-slate-500 flex items-center gap-2">
                                            <span>{emp?.dept || 'N/A'}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="text-amber-600">Missing: {emp?.missing || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemind(emp?.id || '')}
                                    disabled={remindedList.includes(emp?.id || '')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${remindedList.includes(emp?.id || '') ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200'}`}
                                >
                                    {remindedList.includes(emp?.id || '') ? 'Reminded' : 'Send Reminder'}
                                </button>
                            </div>
                        ))}
                        <div className="text-center py-4">
                            <p className="text-xs text-slate-400 font-medium">+ 18 more employees</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    <p className="text-xs text-slate-500">Automatic reminder scheduled for: <strong>18 Nov 2025</strong></p>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium text-sm hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
                            Close
                        </button>
                        <button
                            onClick={handleRemindAll}
                            disabled={remindingAll}
                            className="px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2 disabled:opacity-70"
                        >
                            {remindingAll ? 'Sending...' : <><Bell size={16} /> Remind All (24)</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfessionalTaxModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <ShieldCheck size={20} className="text-amber-600" />
                            Professional Tax Detail (Gujarat)
                        </h3>
                        <p className="text-xs text-slate-500">Statutory breakdown for November 2025</p>
                    </div>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div className="p-6">
                    <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Total PT Liability</span>
                            <span className="text-xl font-bold text-amber-600">₹ 82,400</span>
                        </div>
                        <p className="text-[10px] text-amber-700">Calculated based on Gujarat State PT Slabs</p>
                    </div>

                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Employee Distribution</h4>
                    <div className="space-y-3">
                        {/* Slab 1 */}
                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all">
                            <div>
                                <h5 className="text-sm font-bold text-slate-700">Salary Below ₹15,000</h5>
                                <p className="text-xs text-slate-400 mt-0.5">PT Rate: ₹0 (Nil)</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-400">40 Employees</p>
                                <p className="text-[10px] font-bold text-slate-300">₹0 Total</p>
                            </div>
                        </div>

                        {/* Slab 2 */}
                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all">
                            <div>
                                <h5 className="text-sm font-bold text-slate-700">Salary Above ₹15,000</h5>
                                <p className="text-xs text-slate-400 mt-0.5">PT Rate: ₹200 (Monthly)</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-700">412 Employees</p>
                                <p className="text-[10px] font-bold text-amber-600">₹82,400 Total</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                        <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                            <Info size={18} className="text-slate-400" />
                        </div>
                        <div className="flex-1">
                            <h5 className="text-xs font-bold text-slate-700 mb-1">Filing Information</h5>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Professional Tax is a state-level tax. In Gujarat, the deduction is ₹200/month for employees earning above ₹15,000. For the month of March, the deduction is ₹300.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white font-bold text-sm rounded-lg hover:bg-slate-900 shadow-sm transition-all">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const ECRFilingModal: React.FC<{ onClose: () => void; onMarkFiled: () => void }> = ({ onClose, onMarkFiled }) => {
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setStep(2);
        }, 2000);
    };

    const handleMarkFiled = () => {
        setIsSuccess(true);
        onMarkFiled();
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">PF ECR Filed Successfully</h3>
                    <p className="text-sm text-slate-500 mb-6">The filing status for October 2025 has been updated across the dashboard.</p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <ShieldCheck size={20} className="text-rose-600" />
                            PF ECR Filing Assistant
                        </h3>
                        <p className="text-xs text-slate-500">October 2025 • Filing Workflow</p>
                    </div>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div className="p-6">
                    {/* Stepper */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${step >= 1 ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200'}`}>1</div>
                            <span className="text-xs font-bold">Summary</span>
                        </div>
                        <div className="flex-1 h-px bg-slate-200" />
                        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${step >= 2 ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200'}`}>2</div>
                            <span className="text-xs font-bold">Filing</span>
                        </div>
                    </div>

                    {step === 1 ? (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Members</p>
                                    <p className="text-lg font-black text-slate-800">452 Employees</p>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Contribution</p>
                                    <p className="text-lg font-black text-emerald-700">₹ 12,45,000</p>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between">
                                    <span className="text-xs font-bold text-slate-700">Wages Summary</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Oct 2025</span>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Gross Wages</span>
                                        <span className="font-bold text-slate-800">₹ 1,81,00,000</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">EPF Wages</span>
                                        <span className="font-bold text-slate-800">₹ 85,00,000</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-t border-slate-100 pt-3">
                                        <span className="font-bold text-slate-700">Employer Share (EPF + EPS)</span>
                                        <span className="font-bold text-slate-800">₹ 10,20,000</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold text-slate-700">Employee Share (EPF)</span>
                                        <span className="font-bold text-slate-800">₹ 2,25,000</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                                <Info size={16} className="text-amber-600 mt-0.5" />
                                <p className="text-[11px] text-amber-800 leading-relaxed">
                                    Please ensure all LOP days and joining/leaving dates are correctly captured before generating the ECR. Once generated, the file must be uploaded to the EPFO unified portal.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="text-center py-4">
                                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Download size={24} />
                                </div>
                                <h4 className="font-bold text-slate-800">ECR File Generated</h4>
                                <p className="text-xs text-slate-500 mt-1">Ready for upload to portal</p>
                            </div>

                            <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FileText size={20} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">ECR_OCT_2025.txt</p>
                                        <p className="text-[10px] text-slate-400">452 KB • Generated just now</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        const element = document.createElement("a");
                                        const file = new Blob(["Mock ECR File Content for October 2025"], { type: 'text/plain' });
                                        element.href = URL.createObjectURL(file);
                                        element.download = "ECR_OCT_2025.txt";
                                        document.body.appendChild(element);
                                        element.click();
                                        document.body.removeChild(element);
                                    }}
                                    className="text-xs font-bold text-indigo-600 hover:underline"
                                >
                                    Download
                                </button>
                            </div>

                            <div className="bg-indigo-900 text-white p-5 rounded-xl shadow-lg">
                                <h5 className="text-sm font-bold mb-2 flex items-center gap-2">
                                    <PlayCircle size={16} /> Next Steps
                                </h5>
                                <ol className="text-[11px] space-y-2 opacity-90 list-decimal pl-4">
                                    <li>Upload the downloaded file to the EPFO portal.</li>
                                    <li>Complete the payment on the portal.</li>
                                    <li>Click <strong>"Mark as Filed"</strong> below to update records.</li>
                                </ol>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between gap-3">
                    <button
                        onClick={() => step === 2 ? setStep(1) : onClose()}
                        className="px-6 py-2 text-slate-600 font-bold text-sm hover:bg-white rounded-lg transition-all"
                    >
                        {step === 2 ? 'Back' : 'Cancel'}
                    </button>
                    {step === 1 ? (
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="px-8 py-2 bg-slate-800 text-white font-bold text-sm rounded-lg hover:bg-slate-900 shadow-sm transition-all flex items-center gap-2 disabled:opacity-70"
                        >
                            {isGenerating ? 'Generating...' : <><Download size={16} /> Generate ECR File</>}
                        </button>
                    ) : (
                        <button
                            onClick={handleMarkFiled}
                            className="px-8 py-2 bg-emerald-600 text-white font-bold text-sm rounded-lg hover:bg-emerald-700 shadow-sm transition-all"
                        >
                            Mark as Filed
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const HRDashboard: React.FC = () => {
    const [isApprovalsPanelOpen, setIsApprovalsPanelOpen] = useState(false);
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
    const [isTaxProofsModalOpen, setIsTaxProofsModalOpen] = useState(false);

    // Payroll Modal States
    const [activePayrollModal, setActivePayrollModal] = useState<'ACTIONS' | 'RUN' | 'SCHEDULE' | null>(null);

    // Payroll Trend State
    const [payrollTimeRange, setPayrollTimeRange] = useState('This Year');
    const [isPayrollFilterPopoverOpen, setIsPayrollFilterPopoverOpen] = useState(false);

    // Contribution Summary State
    const [contributionTimeRange, setContributionTimeRange] = useState('This Year');
    const [isContributionFilterPopoverOpen, setIsContributionFilterPopoverOpen] = useState(false);

    const [isPTModalOpen, setIsPTModalOpen] = useState(false);
    const [isECRModalOpen, setIsECRModalOpen] = useState(false);
    const [isPFECRFiled, setIsPFECRFiled] = useState(false);

    // Pending Payroll Slide-over State
    const [isPendingPanelOpen, setIsPendingPanelOpen] = useState(false);
    const [activePendingFilter, setActivePendingFilter] = useState<'All' | 'On Hold' | 'Draft'>('All');

    // Payroll KPIs State
    const [payrollKpiTimeRange, setPayrollKpiTimeRange] = useState('This Month');
    const [isPayrollKpiFilterPopoverOpen, setIsPayrollKpiFilterPopoverOpen] = useState(false);

    // Mock Company for RunPayrollModal
    const currentCompany: Company = {
        id: 'TF-1024',
        name: 'TechFlow Systems',
        plan: 'Enterprise',
        employees: 452,
        status: 'Active',
        last_audit: 'Today',
        business_unit: 'Digital Technology',
        last_payroll_run: '31 Oct 2025'
    };

    // Mock Pending Employees Data
    const pendingEmployees = [
        { id: 'EMP-001', name: 'Alka Sharma', initials: 'AS', color: 'bg-emerald-100 text-emerald-700', dept: 'Engineering', lastUpdatedBy: 'Jane Manager', status: 'Draft', pendingDays: 2, netSalary: '₹ 85,000' },
        { id: 'EMP-002', name: 'Ravi Kumar', initials: 'RK', color: 'bg-blue-100 text-blue-700', dept: 'Sales', lastUpdatedBy: 'System', holdReason: 'Missing Bank Details', status: 'On Hold', pendingDays: 5, netSalary: '₹ 62,500' },
        { id: 'EMP-003', name: 'Priya Singh', initials: 'PS', color: 'bg-indigo-100 text-indigo-700', dept: 'Operations', lastUpdatedBy: 'John HR', holdReason: 'Attendance Discrepancy', status: 'On Hold', pendingDays: 3, netSalary: '₹ 54,200' },
        { id: 'EMP-004', name: 'Amit Patel', initials: 'AP', color: 'bg-purple-100 text-purple-700', dept: 'Engineering', lastUpdatedBy: 'Jane Manager', status: 'Draft', pendingDays: 1, netSalary: '₹ 92,000' },
        { id: 'EMP-005', name: 'Sneha Gupta', initials: 'SG', color: 'bg-rose-100 text-rose-700', dept: 'Marketing', lastUpdatedBy: 'System', holdReason: 'Tax Proofs Pending', status: 'On Hold', pendingDays: 4, netSalary: '₹ 71,000' },
    ];

    const filteredPendingEmployees = activePendingFilter === 'All' 
        ? pendingEmployees 
        : pendingEmployees.filter(emp => emp.status === activePendingFilter);

    const getPayrollKpiData = useMemo(() => {
        let eligible = '450';
        let processed = '400';
        let pending = '50';
        let cost = '₹ 1.85 Cr';
        let payable = '₹ 1.42 Cr';
        let nextCycle = '30 Nov';

        switch (payrollKpiTimeRange) {
            case 'Last Month':
                eligible = '448';
                processed = '448';
                pending = '0';
                cost = '₹ 1.81 Cr';
                payable = '₹ 1.39 Cr';
                nextCycle = '31 Oct';
                break;
            case 'This Quarter':
                eligible = '452';
                processed = '400';
                pending = '52';
                cost = '₹ 5.49 Cr';
                payable = '₹ 4.23 Cr';
                nextCycle = '30 Nov';
                break;
            case 'Last Quarter':
                eligible = '435';
                processed = '435';
                pending = '0';
                cost = '₹ 5.31 Cr';
                payable = '₹ 4.08 Cr';
                nextCycle = '30 Sep';
                break;
            case 'This Year':
                eligible = '452';
                processed = '400';
                pending = '52';
                cost = '₹ 14.22 Cr';
                payable = '₹ 10.95 Cr';
                nextCycle = '30 Nov';
                break;
            case 'Last Year':
                eligible = '410';
                processed = '410';
                pending = '0';
                cost = '₹ 18.25 Cr';
                payable = '₹ 14.05 Cr';
                nextCycle = '31 Mar';
                break;
            case 'Custom':
                eligible = '440';
                processed = '430';
                pending = '10';
                cost = '₹ 1.80 Cr';
                payable = '₹ 1.38 Cr';
                nextCycle = '31 Dec';
                break;
            default:
                break;
        }

        return [
            { label: 'Total Eligible', val: eligible, sub: '', icon: <Users size={16} />, color: 'bg-blue-50/70 text-blue-700' },
            { label: 'Processed', val: processed, sub: '', icon: <CheckCircle size={16} />, color: 'bg-emerald-50/70 text-emerald-700' },
            { label: 'Pending/Hold', val: pending, sub: 'On Hold', icon: <Clock size={16} />, color: 'bg-amber-50/70 text-amber-700', showEye: true, onAction: () => setIsPendingPanelOpen(true) },
            { label: 'Total Payroll Cost', val: cost, sub: 'Gross Salary', icon: <DollarSign size={16} />, color: 'bg-purple-50/70 text-purple-700' },
            { label: 'Net Payable', val: payable, sub: '', icon: <Briefcase size={16} />, color: 'bg-indigo-50/70 text-indigo-700' },
            { label: 'Next Payroll Cycle', val: nextCycle, sub: '', icon: <Calendar size={16} />, color: 'bg-rose-50/70 text-rose-700' },
        ];
    }, [payrollKpiTimeRange]);



    const stats: StatMetric[] = [
        {
            title: 'Total Employees',
            value: '452',
            trend: '',
            trend_up: false,
            icon: <Users />,
            color_class: 'text-indigo-600 bg-indigo-100',
        },
        {
            title: 'Pending Requests',
            value: '15',
            trend: 'Requires Action',
            trend_up: false,
            icon: <Clock />,
            color_class: 'text-amber-600 bg-amber-100',
            on_info_click: () => setIsApprovalsPanelOpen(true)
        },
        {
            title: 'Payroll Status',
            value: 'Pending',
            trend: 'Due in 5 days',
            trend_up: true,
            icon: <FileText />,
            color_class: 'text-emerald-600 bg-emerald-100',
            extra_details: [
                { label: 'Current Cycle', value: 'January, 2026' },
                { label: 'Pay Frequency', value: 'Monthly' },
                { label: 'Pay Day', value: 'Last Working Day' },
            ],
            details_at_top: true
        },
    ];

    // Mock Data for Charts
    const trendData = [
        { month: 'Jun', value: 1.4 },
        { month: 'Jul', value: 1.45 },
        { month: 'Aug', value: 1.5 },
        { month: 'Sep', value: 1.48 },
        { month: 'Oct', value: 1.6 },
        { month: 'Nov', value: 1.85 },
    ];

    const maxTrendValue = Math.max(...trendData.map(d => d.value));



    return (
        <div className="p-4 lg:p-8 w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Welcome Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Hello, HR Manager 👋</h1>
                    <p className="text-slate-500 mt-1">Here's what's happening at <span className="font-semibold text-slate-700">TechFlow Systems</span> today.</p>
                </div>

            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className={index === 2 ? "md:col-span-2" : "md:col-span-1"}>
                        <StatCard stat={stat} />
                    </div>
                ))}
            </div>

            {/* --- NEW SECTION: PAYROLL DEEP DIVE --- */}

            <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="text-purple-600" size={20} /> Payroll & Analytics Overview
                </h2>

                {/* 1. Payroll KPIs Section */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    {/* Header & Filters */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Payroll Overview</h3>
                                <p className="text-xs text-slate-500">Summary of payroll metrics and costs</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                            {/* Filter Popover */}
                            <div className="relative w-full sm:w-auto">
                                <button
                                    onClick={() => setIsPayrollKpiFilterPopoverOpen(!isPayrollKpiFilterPopoverOpen)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm w-full sm:w-auto justify-between sm:justify-start"
                                >
                                    <div className="flex items-center gap-2">
                                        <Filter size={16} className="text-purple-600" />
                                        <span>{payrollKpiTimeRange}</span>
                                    </div>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isPayrollKpiFilterPopoverOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isPayrollKpiFilterPopoverOpen && (
                                    <>
                                        {/* Overlay to close popover */}
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsPayrollKpiFilterPopoverOpen(false)}
                                        ></div>

                                        <div className="absolute right-0 mt-2 p-4 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 w-[320px] animate-in fade-in slide-in-from-top-2 origin-top-right">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-3">Date Range</p>

                                            <div className="grid grid-cols-3 gap-2 mb-4">
                                                {['This Month', 'Last Month', 'This Quarter', 'Last Quarter', 'This Year', 'Last Year'].map(label => (
                                                    <button
                                                        key={label}
                                                        onClick={() => {
                                                            setPayrollKpiTimeRange(label);
                                                            setIsPayrollKpiFilterPopoverOpen(false);
                                                        }}
                                                        className={`px-2 py-2 text-[11px] font-bold rounded-lg transition-all border ${payrollKpiTimeRange === label
                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                                            }`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="pt-3 border-t border-slate-100">
                                                <div className="relative">
                                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="month"
                                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                                                        placeholder="Custom Month"
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                setPayrollKpiTimeRange('Custom');
                                                                setIsPayrollKpiFilterPopoverOpen(false);
                                                            }
                                                        }}
                                                    />
                                                    <p className="absolute left-9 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                                                        {payrollKpiTimeRange === 'Custom' ? 'Selected' : 'Custom Month'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        {getPayrollKpiData.map((kpi, idx) => (
                            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-semibold text-slate-500 uppercase">{kpi.label}</span>
                                    <div className={`p-1.5 rounded-lg flex items-center gap-2 ${kpi.color}`}>
                                        {kpi.icon}
                                        {kpi.showEye && (
                                            <button
                                                onClick={kpi.onAction}
                                                className="hover:opacity-70 transition-opacity cursor-pointer"
                                                title="View details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-slate-800">{kpi.val}</div>
                                    {kpi.sub && <div className="text-xs text-slate-400 mt-0.5">{kpi.sub}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>



                {/* 2. Charts & Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly Trend */}
                    <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-slate-800">Monthly Payroll Expense Trend</h3>
                                <p className="text-xs text-slate-500">Total payroll cost over the last 6 months (in ₹ Crores)</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Payroll Filter */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsPayrollFilterPopoverOpen(!isPayrollFilterPopoverOpen)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                                    >
                                        <Filter size={14} className="text-indigo-600" />
                                        <span>{payrollTimeRange}</span>
                                        <ChevronDown size={12} className={`text-slate-400 transition-transform ${isPayrollFilterPopoverOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isPayrollFilterPopoverOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setIsPayrollFilterPopoverOpen(false)}
                                            ></div>
                                            <div className="absolute right-0 mt-2 p-4 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 w-[300px] animate-in fade-in slide-in-from-top-2 origin-top-right">
                                                <p className="text-xs font-bold text-slate-400 uppercase mb-3">Date Range</p>
                                                <div className="grid grid-cols-3 gap-2 mb-4">
                                                    {['This Month', 'Last Month', 'This Quarter', 'Last Quarter', 'This Year', 'Last Year'].map(label => (
                                                        <button
                                                            key={label}
                                                            onClick={() => {
                                                                setPayrollTimeRange(label);
                                                                setIsPayrollFilterPopoverOpen(false);
                                                            }}
                                                            className={`px-2 py-2 text-[10px] font-bold rounded-lg transition-all border ${payrollTimeRange === label
                                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                                                }`}
                                                        >
                                                            {label}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="pt-3 border-t border-slate-100">
                                                    <div className="relative">
                                                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input
                                                            type="month"
                                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                                                            placeholder="Custom Month"
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    setPayrollTimeRange('Custom');
                                                                    setIsPayrollFilterPopoverOpen(false);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                                    <TrendingUp size={18} />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-end justify-between h-48 gap-4 px-2">
                            {trendData.map((d, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                                    <div className="relative w-full flex justify-end flex-col items-center">
                                        <div
                                            className="w-full bg-indigo-500 rounded-t-md transition-all duration-500 hover:bg-indigo-600 group-hover:shadow-lg opacity-80 group-hover:opacity-100"
                                            style={{ height: `${(d.value / maxTrendValue) * 150}px` }}
                                        ></div>
                                        <div className="absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            ₹ {d.value} Cr
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-slate-500">{d.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Detailed Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Employee Level Details */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Users size={16} className="text-purple-600" /> Employee Insights
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><FileWarning size={16} /></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Pending Tax Proofs</p>
                                        <p className="text-xs text-slate-500">Action Required</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsTaxProofsModalOpen(true)}
                                    className="text-xs font-bold text-amber-600 hover:underline"
                                >
                                    View 24 Emp
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><AlertTriangle size={16} /></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">LWP (Loss of Pay)</p>
                                        <p className="text-xs text-slate-500">Affecting Nov Payroll</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-slate-800">5</span>
                            </div>
                        </div>
                    </div>

                    {/* PF / ESI Summary */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <PieChart size={16} className="text-blue-600" /> Contribution Summary
                            </h3>
                            {/* Filter */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsContributionFilterPopoverOpen(!isContributionFilterPopoverOpen)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                                >
                                    <Filter size={14} className="text-indigo-600" />
                                    <span>{contributionTimeRange}</span>
                                    <ChevronDown size={12} className={`text-slate-400 transition-transform ${isContributionFilterPopoverOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isContributionFilterPopoverOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsContributionFilterPopoverOpen(false)}
                                        ></div>
                                        <div className="absolute right-0 mt-2 p-4 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 w-[300px] animate-in fade-in slide-in-from-top-2 origin-top-right">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-3">Date Range</p>
                                            <div className="grid grid-cols-3 gap-2 mb-4">
                                                {['This Month', 'Last Month', 'This Quarter', 'Last Quarter', 'This Year', 'Last Year'].map(label => (
                                                    <button
                                                        key={label}
                                                        onClick={() => {
                                                            setContributionTimeRange(label);
                                                            setIsContributionFilterPopoverOpen(false);
                                                        }}
                                                        className={`px-2 py-2 text-[10px] font-bold rounded-lg transition-all border ${contributionTimeRange === label
                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                                            }`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="pt-3 border-t border-slate-100">
                                                <div className="relative">
                                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="month"
                                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
                                                        placeholder="Custom Month"
                                                        onChange={(e) => {
                                                            if (e.target.value) {
                                                                setContributionTimeRange('Custom');
                                                                setIsContributionFilterPopoverOpen(false);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">Provident Fund (PF)</p>
                                        <p className="text-xs text-slate-500">Employer + Employee</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-800">₹ 12,45,000</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-8 bg-pink-500 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">ESI Contribution</p>
                                        <p className="text-xs text-slate-500">Total Remittance</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-800">₹ 3,20,500</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            <ApprovalsPanel
                isOpen={isApprovalsPanelOpen}
                onClose={() => setIsApprovalsPanelOpen(false)}
                approvals={MOCK_APPROVALS}
            />

            {/* --- Payroll Action Modals --- */}

            {/* 1. Main Actions Menu (Clicked from Eye Icon) */}
            {activePayrollModal === 'ACTIONS' && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">Payroll Management</h3>
                            <button onClick={() => setActivePayrollModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-6 grid grid-cols-1 gap-3">
                            <button
                                onClick={() => setActivePayrollModal('SCHEDULE')}
                                className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-sky-50 hover:border-sky-200 transition-all group text-left"
                            >
                                <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-sky-200 transition-colors">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 group-hover:text-sky-800">View Schedule</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Check pay days and processing dates</p>
                                </div>
                                <ChevronRight className="ml-auto text-slate-300 group-hover:text-sky-400" size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Process Payroll Modal */}
            <RunPayrollModal
                isOpen={activePayrollModal === 'RUN'}
                onClose={() => setActivePayrollModal(null)}
                company={currentCompany}
            />

            {/* 3. Schedule Modal */}
            {activePayrollModal === 'SCHEDULE' && (
                <ScheduleDetailsModal
                    onClose={() => setActivePayrollModal(null)}
                    onBack={() => setActivePayrollModal('ACTIONS')}
                />
            )}


            {/* 5. Send Payslips Modal */}
            {isPayslipModalOpen && (
                <SendPayslipsModal onClose={() => setIsPayslipModalOpen(false)} />
            )}

            {/* 6. Pending Tax Proofs Modal */}
            {isTaxProofsModalOpen && (
                <PendingTaxProofsModal onClose={() => setIsTaxProofsModalOpen(false)} />
            )}

            {/* 7. Professional Tax Modal */}
            {isPTModalOpen && (
                <ProfessionalTaxModal onClose={() => setIsPTModalOpen(false)} />
            )}

            {/* PF ECR Filing Modal */}
            {isECRModalOpen && (
                <ECRFilingModal
                    onClose={() => setIsECRModalOpen(false)}
                    onMarkFiled={() => setIsPFECRFiled(true)}
                />
            )}



            {/* Pending Payroll Slide-over Panel */}
            {isPendingPanelOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80] animate-in fade-in duration-200"
                        onClick={() => setIsPendingPanelOpen(false)}
                    />
                    <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-[90] flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Pending Payroll</h2>
                                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                    <Users size={14} />
                                    {pendingEmployees.length} employees · On Hold
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsPendingPanelOpen(false)}
                                className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Employee List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                            {filteredPendingEmployees.map((emp) => (
                                <div key={emp.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:border-purple-200 transition-colors group">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${emp.color}`}>
                                        {emp.initials}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 flex justify-between gap-4">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                                {emp.name}
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                                                    {emp.id}
                                                </span>
                                            </h4>
                                            <p className="text-sm text-slate-500 font-medium mt-0.5">{emp.dept}</p>
                                            
                                            <div className="mt-2 text-xs">
                                                {emp.holdReason && (
                                                    <span className="text-rose-500 font-medium block flex items-center gap-1">
                                                        <AlertCircle size={12} /> {emp.holdReason}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="text-right flex flex-col items-end justify-between">
                                            <div>
                                                <div className="font-black text-slate-800 text-lg">{emp.netSalary}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Net Salary</div>
                                            </div>
                                            
                                            <div className="mt-3 flex flex-col items-end gap-1.5">
                                                <button className="text-[10px] font-bold px-3 py-1.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors">
                                                    Process
                                                </button>
                                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                    <Clock size={10} /> Pending {emp.pendingDays}d
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {filteredPendingEmployees.length === 0 && (
                                <div className="text-center py-12 px-4">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                                        <CheckCircle size={24} className="text-slate-400" />
                                    </div>
                                    <h3 className="text-slate-800 font-bold mb-1">No pending payrolls</h3>
                                    <p className="text-sm text-slate-500">All employees in this category have been processed.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-slate-100 bg-white flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                            <span className="text-sm font-bold text-slate-500">
                                Showing {filteredPendingEmployees.length} of {pendingEmployees.length} employees
                            </span>
                            <button className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-md shadow-purple-200">
                                Process All
                            </button>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
};

export default HRDashboard;
