

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
    ChevronDown,
    Filter,
    BarChart2
} from 'lucide-react';
import StatCard from './StatCard';
import ApprovalsPanel from './ApprovalsPanel';
import { RunPayrollModal } from './CompanyActionModals';
import { StatMetric, Company } from '../types';
import { MOCK_APPROVALS } from '../constants';

// --- Sub-Modals for Payroll Actions ---

const TdsFullReportModal: React.FC<{ onClose: () => void; data: any[] }> = ({ onClose, data }) => {
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <FileText className="text-purple-600" size={20} /> TDS Detailed Report
                        </h3>
                        <p className="text-xs text-slate-500">Comprehensive breakdown of tax deductions</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors">
                            <Download size={14} /> Export CSV
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <p className="text-xs font-bold text-purple-600 uppercase mb-1">Total TDS</p>
                            <p className="text-xl font-bold text-purple-900">₹ {data.reduce((acc, curr) => acc + curr.tds, 0).toFixed(2)} L</p>
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Salary TDS</p>
                            <p className="text-xl font-bold text-indigo-900">₹ {data.reduce((acc, curr) => acc + curr.salaryTds, 0).toFixed(2)} L</p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <p className="text-xs font-bold text-amber-600 uppercase mb-1">Perquisite Tax</p>
                            <p className="text-xl font-bold text-amber-900">₹ {data.reduce((acc, curr) => acc + curr.perqTds, 0).toFixed(2)} L</p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Avg Employees</p>
                            <p className="text-xl font-bold text-emerald-900">{Math.round(data.reduce((acc, curr) => acc + curr.employees, 0) / data.length)}</p>
                        </div>
                    </div>

                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 border-b border-slate-200">Period</th>
                                <th className="px-4 py-3 border-b border-slate-200 text-right">Gross Salary</th>
                                <th className="px-4 py-3 border-b border-slate-200 text-right">TDS from Salary</th>
                                <th className="px-4 py-3 border-b border-slate-200 text-right">TDS on Perquisites</th>
                                <th className="px-4 py-3 border-b border-slate-200 text-right">Total TDS</th>
                                <th className="px-4 py-3 border-b border-slate-200 text-right">Employee Count</th>
                                <th className="px-4 py-3 border-b border-slate-200 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[...data].reverse().map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-800">{row.period}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">{row.gross}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">₹ {row.salaryTds.toFixed(2)} L</td>
                                    <td className="px-4 py-3 text-right text-slate-600">₹ {row.perqTds.toFixed(2)} L</td>
                                    <td className="px-4 py-3 text-right font-bold text-purple-700">₹ {row.tds.toFixed(2)} L</td>
                                    <td className="px-4 py-3 text-right text-slate-600">{row.employees}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                                            Deposited
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-100 transition-colors text-sm">
                        Close Report
                    </button>
                </div>
            </div>
        </div>
    );
};

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
                        <p className="text-lg font-bold text-emerald-800">{stats.sent}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-xs text-amber-700 font-medium">Pending</p>
                        <p className="text-lg font-bold text-amber-800">{stats.pending}</p>
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
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${emp.status === 'Sent' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                    {emp.status === 'Sent' ? <Check size={14} /> : emp.name.charAt(0)}
                                </div>
                                <div>
                                    <p className={`text-sm font-semibold ${emp.status === 'Sent' ? 'text-slate-500' : 'text-slate-800'}`}>{emp.name}</p>
                                    <p className="text-xs text-slate-500">{emp.email}</p>
                                </div>
                            </div>

                            {emp.status === 'Sent' ? (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-100">
                                    <Check size={12} /> Sent
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleSendSingle(emp.id)}
                                    disabled={sendingIds.includes(emp.id) || sendingAll}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sendingIds.includes(emp.id) ? 'Sending...' : <><Send size={12} /> Send</>}
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
                                        {emp.avatar}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">{emp.name}</h4>
                                        <div className="text-xs text-slate-500 flex items-center gap-2">
                                            <span>{emp.dept}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="text-amber-600">Missing: {emp.missing}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemind(emp.id)}
                                    disabled={remindedList.includes(emp.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${remindedList.includes(emp.id) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200'}`}
                                >
                                    {remindedList.includes(emp.id) ? 'Reminded' : 'Send Reminder'}
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

const HRDashboard: React.FC = () => {
    const [isApprovalsPanelOpen, setIsApprovalsPanelOpen] = useState(false);
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
    const [isTaxProofsModalOpen, setIsTaxProofsModalOpen] = useState(false);

    // Payroll Modal States
    const [activePayrollModal, setActivePayrollModal] = useState<'ACTIONS' | 'RUN' | 'SCHEDULE' | null>(null);

    // TDS Dashboard State
    const [tdsTimeRange, setTdsTimeRange] = useState('This Year');
    const [customTdsDates, setCustomTdsDates] = useState({ from: '', to: '' });
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

    // Full Report Modal State
    const [isTdsReportOpen, setIsTdsReportOpen] = useState(false);

    // Mock Company for RunPayrollModal
    const currentCompany: Company = {
        id: 'TF-1024',
        name: 'TechFlow Systems',
        plan: 'Enterprise',
        employees: 452,
        status: 'Active',
        lastAudit: 'Today',
        location: 'Bangalore',
        lastPayrollRun: '31 Oct 2025'
    };

    // Function to get data based on range
    const getGraphData = useMemo(() => {
        switch (tdsTimeRange) {
            case 'This Month': // Nov 2025 - Weekly breakdown
                return [
                    { period: 'Week 1', tds: 5.2, employees: 1840, salaryTds: 4.8, perqTds: 0.4, gross: '₹ 45 L' },
                    { period: 'Week 2', tds: 5.5, employees: 1842, salaryTds: 5.0, perqTds: 0.5, gross: '₹ 48 L' },
                    { period: 'Week 3', tds: 5.1, employees: 1839, salaryTds: 4.6, perqTds: 0.5, gross: '₹ 44 L' },
                    { period: 'Week 4', tds: 6.6, employees: 1845, salaryTds: 5.9, perqTds: 0.7, gross: '₹ 52 L' },
                ];
            case 'Last Month': // Oct 2025 - Weekly breakdown
                return [
                    { period: 'Week 1', tds: 4.8, employees: 1835, salaryTds: 4.2, perqTds: 0.6, gross: '₹ 42 L' },
                    { period: 'Week 2', tds: 5.0, employees: 1836, salaryTds: 4.5, perqTds: 0.5, gross: '₹ 45 L' },
                    { period: 'Week 3', tds: 4.9, employees: 1838, salaryTds: 4.4, perqTds: 0.5, gross: '₹ 43 L' },
                    { period: 'Week 4', tds: 5.1, employees: 1838, salaryTds: 4.6, perqTds: 0.5, gross: '₹ 46 L' },
                ];
            case 'This Quarter': // Oct, Nov, Dec
                return [
                    { period: 'Oct 2025', tds: 19.8, employees: 1838, salaryTds: 18.0, perqTds: 1.8, gross: '₹ 1.81 Cr' },
                    { period: 'Nov 2025', tds: 22.4, employees: 1842, salaryTds: 20.1, perqTds: 2.3, gross: '₹ 1.85 Cr' },
                    { period: 'Dec 2025', tds: 21.5, employees: 1845, salaryTds: 19.5, perqTds: 2.0, gross: '₹ 1.83 Cr' }, // Projected
                ];
            case 'Last Quarter': // Jul, Aug, Sep
                return [
                    { period: 'Jul 2025', tds: 17.2, employees: 1825, salaryTds: 15.8, perqTds: 1.4, gross: '₹ 1.75 Cr' },
                    { period: 'Aug 2025', tds: 18.0, employees: 1830, salaryTds: 16.5, perqTds: 1.5, gross: '₹ 1.78 Cr' },
                    { period: 'Sep 2025', tds: 18.5, employees: 1835, salaryTds: 17.0, perqTds: 1.5, gross: '₹ 1.80 Cr' },
                ];
            case 'This Year': // Apr 2025 to Nov 2025 (Default)
                return [
                    { period: 'Apr 2025', tds: 15.2, employees: 1810, salaryTds: 14.0, perqTds: 1.2, gross: '₹ 1.65 Cr' },
                    { period: 'May 2025', tds: 15.8, employees: 1815, salaryTds: 14.5, perqTds: 1.3, gross: '₹ 1.68 Cr' },
                    { period: 'Jun 2025', tds: 16.5, employees: 1820, salaryTds: 15.0, perqTds: 1.5, gross: '₹ 1.72 Cr' },
                    { period: 'Jul 2025', tds: 17.2, employees: 1825, salaryTds: 15.8, perqTds: 1.4, gross: '₹ 1.75 Cr' },
                    { period: 'Aug 2025', tds: 18.0, employees: 1830, salaryTds: 16.5, perqTds: 1.5, gross: '₹ 1.78 Cr' },
                    { period: 'Sep 2025', tds: 18.5, employees: 1835, salaryTds: 17.0, perqTds: 1.5, gross: '₹ 1.80 Cr' },
                    { period: 'Oct 2025', tds: 19.8, employees: 1838, salaryTds: 18.0, perqTds: 1.8, gross: '₹ 1.81 Cr' },
                    { period: 'Nov 2025', tds: 22.4, employees: 1842, salaryTds: 20.1, perqTds: 2.3, gross: '₹ 1.85 Cr' },
                ];
            case 'Last Year': // Apr 2024 to Mar 2025 (Mock)
                return [
                    { period: 'Apr 2024', tds: 14.0, employees: 1750, salaryTds: 13.0, perqTds: 1.0, gross: '₹ 1.50 Cr' },
                    { period: 'Mar 2025', tds: 16.0, employees: 1800, salaryTds: 14.5, perqTds: 1.5, gross: '₹ 1.60 Cr' },
                    // Simplified for demo
                ];
            case 'Custom':
                // Just return this year for demo if custom is picked
                return [
                    { period: 'Custom 1', tds: 10.0, employees: 1800, salaryTds: 9.0, perqTds: 1.0, gross: '₹ 1.0 Cr' },
                    { period: 'Custom 2', tds: 12.0, employees: 1810, salaryTds: 11.0, perqTds: 1.0, gross: '₹ 1.2 Cr' }
                ];
            default: return [];
        }
    }, [tdsTimeRange]);

    const tdsGraphData = getGraphData;
    const maxTdsValue = Math.max(...tdsGraphData.map(d => d.tds), 1); // Ensure > 0
    const yAxisMax = Math.ceil(maxTdsValue * 1.1); // 10% buffer

    const stats: StatMetric[] = [
        {
            title: 'Total Employees',
            value: '452',
            trend: '+12 new joinees',
            trendUp: true,
            icon: <Users />,
            colorClass: 'text-indigo-600 bg-indigo-100',
        },
        {
            title: 'Pending Requests',
            value: '15',
            trend: 'Requires Action',
            trendUp: false,
            icon: <Clock />,
            colorClass: 'text-amber-600 bg-amber-100',
            onInfoClick: () => setIsApprovalsPanelOpen(true)
        },
        {
            title: 'Payroll Status',
            value: 'Pending',
            trend: 'Due in 5 days',
            trendUp: true,
            icon: <FileText />,
            colorClass: 'text-emerald-600 bg-emerald-100',
            extraDetails: [
                { label: 'Pay Frequency', value: 'Monthly' },
                { label: 'Pay Day', value: 'Last Working Day' },
                { label: 'Processing Date', value: '28th - 30th Nov' },
                { label: 'Bank Transfer Date', value: '30th Nov 2025', color: 'text-emerald-600' },
            ]
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

    // --- Graph Helper Functions ---
    const getGraphPath = () => {
        if (tdsGraphData.length === 0) return '';
        const points = tdsGraphData.map((d, i) => {
            const x = (i / (tdsGraphData.length - 1)) * 1000;
            const y = 300 - ((d.tds / yAxisMax) * 300); // Dynamic scaling
            return `${x},${y}`;
        });
        return `M ${points.join(' L ')}`;
    };

    const getAreaPath = () => {
        const linePath = getGraphPath();
        if (!linePath) return '';
        return `${linePath} L 1000,300 L 0,300 Z`;
    };

    const getPointCoords = (index: number) => {
        const x = (index / (tdsGraphData.length - 1)) * 1000;
        const y = 300 - ((tdsGraphData[index].tds / yAxisMax) * 300);
        return { x, y };
    };

    return (
        <div className="p-4 lg:p-8 w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Welcome Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Hello, HR Manager 👋</h1>
                    <p className="text-slate-500 mt-1">Here's what's happening at <span className="font-semibold text-slate-700">TechFlow Systems</span> today.</p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} stat={stat} />
                ))}
            </div>

            {/* --- NEW SECTION: PAYROLL DEEP DIVE --- */}

            <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="text-purple-600" size={20} /> Payroll & Analytics Overview
                </h2>

                {/* 1. Payroll KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {[
                        { label: 'Total Eligible', val: '450', sub: 'Employees', icon: <Users size={16} />, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Processed', val: '400', sub: 'Current Month', icon: <CheckCircle size={16} />, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Pending', val: '50', sub: 'On Hold/Draft', icon: <Clock size={16} />, color: 'bg-amber-50 text-amber-700' },
                        { label: 'Total Payroll Cost', val: '₹ 1.85 Cr', sub: 'Gross Salary', icon: <DollarSign size={16} />, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Net Payable', val: '₹ 1.42 Cr', sub: 'After Deductions', icon: <Briefcase size={16} />, color: 'bg-indigo-50 text-indigo-700' },
                        { label: 'Next Pay Cycle', val: '30 Nov', sub: 'Upcoming', icon: <Calendar size={16} />, color: 'bg-rose-50 text-rose-700' },
                    ].map((kpi, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-semibold text-slate-500 uppercase">{kpi.label}</span>
                                <div className={`p-1.5 rounded-lg ${kpi.color}`}>{kpi.icon}</div>
                            </div>
                            <div>
                                <div className="text-xl font-bold text-slate-800">{kpi.val}</div>
                                <div className="text-xs text-slate-400 mt-0.5">{kpi.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* TDS Analytics Section */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">

                    {/* Header & Filters */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">TDS Deductions Over Time</h3>
                                <p className="text-xs text-slate-500">Analysis of Tax Deducted at Source trends</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                            {/* Segmented Control */}
                            <div className="flex flex-wrap gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100 w-full sm:w-auto justify-center sm:justify-start">
                                {['This Month', 'Last Month', 'This Quarter', 'Last Quarter', 'This Year', 'Last Year', 'Custom'].map(label => (
                                    <button
                                        key={label}
                                        onClick={() => setTdsTimeRange(label)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${tdsTimeRange === label
                                            ? 'bg-purple-600 text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Custom Date Pickers */}
                            {tdsTimeRange === 'Custom' && (
                                <div className="flex gap-2 items-center bg-slate-50 p-1.5 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-left-2">
                                    <div className="relative">
                                        <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="date"
                                            className="pl-8 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:border-purple-500"
                                            value={customTdsDates.from}
                                            onChange={(e) => setCustomTdsDates({ ...customTdsDates, from: e.target.value })}
                                        />
                                    </div>
                                    <span className="text-slate-400 text-xs">-</span>
                                    <div className="relative">
                                        <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="date"
                                            className="pl-8 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 focus:outline-none focus:border-purple-500"
                                            value={customTdsDates.to}
                                            onChange={(e) => setCustomTdsDates({ ...customTdsDates, to: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Average Monthly TDS</p>
                                <p className="text-xl font-bold text-slate-800 mt-1">₹ {(tdsGraphData.reduce((acc, curr) => acc + curr.tds, 0) / tdsGraphData.length).toFixed(2)} L</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-purple-600 shadow-sm">
                                <DollarSign size={18} />
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Employees with TDS</p>
                                <p className="text-xl font-bold text-slate-800 mt-1">1,842</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                                <Users size={18} />
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Highest TDS Month</p>
                                <p className="text-xl font-bold text-slate-800 mt-1">Nov '25 <span className="text-sm font-medium text-emerald-600">₹ 22.4 L</span></p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-sm">
                                <TrendingUp size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Main Graph & Table */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Line Chart */}
                        <div className="lg:col-span-2 relative h-[350px] bg-white border border-slate-100 rounded-xl p-4 flex flex-col">
                            <div className="flex-1 w-full relative">
                                <svg viewBox="0 0 1000 300" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                    {/* Grids */}
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <line key={i} x1="0" y1={300 - (i * 75)} x2="1000" y2={300 - (i * 75)} stroke="#f1f5f9" strokeWidth="1" />
                                    ))}

                                    {/* Area & Line */}
                                    <defs>
                                        <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#9333ea" stopOpacity="0.1" />
                                            <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d={getAreaPath()} fill="url(#purpleGradient)" />
                                    <path d={getGraphPath()} fill="none" stroke="#9333ea" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                                    {/* Data Points */}
                                    {tdsGraphData.map((d, i) => {
                                        const { x, y } = getPointCoords(i);
                                        return (
                                            <g key={i} onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)} style={{ cursor: 'pointer' }}>
                                                <circle cx={x} cy={y} r="6" fill="white" stroke="#9333ea" strokeWidth="2" className="transition-all hover:r-8" />
                                                {/* Invisible Rect for easier hover */}
                                                <rect x={x - 20} y={0} width="40" height="300" fill="transparent" />
                                            </g>
                                        );
                                    })}
                                </svg>

                                {/* Y-Axis Labels */}
                                <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-xs text-slate-400 pointer-events-none -ml-8">
                                    <span>₹{yAxisMax}L</span>
                                    <span>₹{(yAxisMax * 0.75).toFixed(1)}L</span>
                                    <span>₹{(yAxisMax * 0.5).toFixed(1)}L</span>
                                    <span>₹{(yAxisMax * 0.25).toFixed(1)}L</span>
                                    <span>0</span>
                                </div>

                                {/* Tooltip */}
                                {hoveredPoint !== null && (
                                    <div
                                        className="absolute bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl z-20 pointer-events-none min-w-[180px]"
                                        style={{
                                            left: `${getPointCoords(hoveredPoint).x / 10}%`,
                                            top: `${(getPointCoords(hoveredPoint).y / 300) * 100}%`,
                                            transform: 'translate(-50%, -120%)'
                                        }}
                                    >
                                        <div className="font-bold border-b border-slate-600 pb-1 mb-1 flex justify-between">
                                            <span>{tdsGraphData[hoveredPoint].period}</span>
                                            <span className="text-purple-300">₹{tdsGraphData[hoveredPoint].tds.toFixed(2)}L</span>
                                        </div>
                                        <div className="space-y-1 opacity-90">
                                            <div className="flex justify-between"><span>Salary TDS:</span> <span>₹{tdsGraphData[hoveredPoint].salaryTds}L</span></div>
                                            <div className="flex justify-between"><span>Perquisites:</span> <span>₹{tdsGraphData[hoveredPoint].perqTds}L</span></div>
                                            <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-700 mt-1">
                                                <span>Employees:</span> <span>{tdsGraphData[hoveredPoint].employees}</span>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-slate-800"></div>
                                    </div>
                                )}
                            </div>
                            {/* X-Axis Labels */}
                            <div className="flex justify-between mt-2 text-xs font-medium text-slate-500">
                                {tdsGraphData.map((d, i) => (
                                    <span key={i} className="text-center w-10 truncate">{d.period.split(' ')[0]}</span>
                                ))}
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col h-[350px]">
                            <div className="px-4 py-3 border-b border-slate-200 bg-white">
                                <h4 className="text-xs font-bold text-slate-700 uppercase">Monthly Breakdown</h4>
                            </div>
                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-100 text-slate-500 font-semibold sticky top-0 z-10">
                                        <tr>
                                            <th className="px-3 py-2">Period</th>
                                            <th className="px-3 py-2 text-right">Gross</th>
                                            <th className="px-3 py-2 text-right">TDS</th>
                                            <th className="px-3 py-2 text-right">Emps</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {[...tdsGraphData].reverse().map((row, i) => (
                                            <tr key={i} className="hover:bg-white transition-colors">
                                                <td className="px-3 py-2 font-medium text-slate-700">{row.period}</td>
                                                <td className="px-3 py-2 text-right text-slate-500">{row.gross}</td>
                                                <td className="px-3 py-2 text-right font-bold text-purple-700">₹{row.tds}L</td>
                                                <td className="px-3 py-2 text-right text-slate-600">{row.employees}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-2 border-t border-slate-200 bg-white text-center">
                                <button
                                    onClick={() => setIsTdsReportOpen(true)}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                    View Full Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Charts & Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly Trend */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-slate-800">Monthly Payroll Expense Trend</h3>
                                <p className="text-xs text-slate-500">Total payroll cost over the last 6 months (in ₹ Crores)</p>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                                <TrendingUp size={18} />
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

                    {/* Department Breakdown */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-bold text-slate-800">Dept. Payroll Cost</h3>
                                <p className="text-xs text-slate-500">Distribution by department</p>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
                                <PieChart size={18} />
                            </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center relative">
                            {/* CSS Conic Gradient Donut */}
                            <div
                                className="w-40 h-40 rounded-full"
                                style={{
                                    background: 'conic-gradient(#6366f1 0% 45%, #ec4899 45% 70%, #10b981 70% 90%, #f59e0b 90% 100%)'
                                }}
                            >
                                <div className="w-28 h-28 bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold text-slate-800">100%</span>
                                    <span className="text-[10px] text-slate-400">Total</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-xs">
                                <div className="flex items-center gap-2"><span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Engineering</div>
                                <span className="font-medium text-slate-700">45%</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <div className="flex items-center gap-2"><span className="w-2 h-2 bg-pink-500 rounded-full"></span> Sales & Mktg</div>
                                <span className="font-medium text-slate-700">25%</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <div className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Operations</div>
                                <span className="font-medium text-slate-700">20%</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <div className="flex items-center gap-2"><span className="w-2 h-2 bg-amber-500 rounded-full"></span> Others</div>
                                <span className="font-medium text-slate-700">10%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Detailed Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Current Payroll Cycle Details */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Activity size={16} className="text-sky-600" /> Current Cycle Details
                            </h3>
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded uppercase">In Progress</span>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Payroll Month</p>
                                <p className="text-sm font-bold text-slate-700">November 2025</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Processing Date</p>
                                <p className="text-sm font-bold text-slate-700">Pending</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Approved By</p>
                                <p className="text-sm font-medium text-slate-600">-</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Disbursement Status</p>
                                <p className="text-sm font-medium text-slate-600 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-slate-300 rounded-full"></span> Not Initiated
                                </p>
                            </div>
                            <div
                                onClick={() => setIsPayslipModalOpen(true)}
                                className="col-span-2 pt-2 border-t border-slate-100 cursor-pointer group"
                            >
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-slate-500 group-hover:text-indigo-600 transition-colors">Payslips Sent</p>
                                    <p className="text-xs font-bold text-slate-700">0 / 450</p>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                                    <div className="bg-emerald-500 h-1.5 rounded-full w-0 group-hover:shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all"></div>
                                </div>
                            </div>
                        </div>
                    </div>

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
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><UserPlus size={16} /></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">New Joinees</p>
                                        <p className="text-xs text-slate-500">Joined in Nov 2025</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-slate-800">12</span>
                            </div>

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
                </div>

                {/* 4. Compliance & Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* PF / ESI Summary */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Contribution Summary (Nov)</h3>
                            <button className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors">
                                <Download size={12} /> Export
                            </button>
                        </div>
                        <div className="space-y-3">
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

                    {/* Statutory Alerts */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Statutory Filings Due</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 p-1 bg-rose-100 rounded text-rose-600"><AlertCircle size={14} /></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-800">PF ECR Filing (Oct 2025)</p>
                                    <p className="text-xs text-rose-600 font-medium">Due in 2 days (15 Nov)</p>
                                </div>
                                <button className="px-3 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50">File Now</button>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 p-1 bg-amber-100 rounded text-amber-600"><AlertCircle size={14} /></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-800">Professional Tax (Karnataka)</p>
                                    <p className="text-xs text-amber-600 font-medium">Due in 5 days (20 Nov)</p>
                                </div>
                                <button className="px-3 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50">View</button>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 p-1 bg-emerald-100 rounded text-emerald-600"><CheckCircle size={14} /></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-800">TDS Payment (Oct 2025)</p>
                                    <p className="text-xs text-emerald-600">Completed on 07 Nov</p>
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

            {/* 7. TDS Full Report Modal */}
            {isTdsReportOpen && (
                <TdsFullReportModal onClose={() => setIsTdsReportOpen(false)} data={tdsGraphData} />
            )}

        </div>
    );
};

export default HRDashboard;
