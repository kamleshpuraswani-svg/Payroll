
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit2, 
  CheckCircle, 
  Lock, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  X, 
  FileText, 
  Download, 
  History, 
  MoreHorizontal,
  DollarSign,
  Users,
  Calendar,
  Check,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { RunPayrollModal } from './CompanyActionModals';
import { MOCK_COMPANIES } from '../constants';

interface PayrollRun {
  id: string;
  period: string;
  employees: number;
  gross: string;
  net: string;
  status: 'Draft' | 'In Progress' | 'Pending Approval' | 'Approved' | 'Locked';
  initiatedBy: string;
  lastUpdated: string;
  approvedDate?: string;
  deductions?: string;
}

const INITIAL_DATA: PayrollRun[] = [
  { 
    id: '1', 
    period: 'November 2025', 
    employees: 1842, 
    gross: '₹18.42 Cr', 
    net: '₹14.68 Cr', 
    deductions: '₹3.74 Cr',
    status: 'Pending Approval', 
    initiatedBy: 'Kavita Sharma', 
    lastUpdated: '18 Dec 2025' 
  },
  { 
    id: '2', 
    period: 'October 2025', 
    employees: 1838, 
    gross: '₹18.10 Cr', 
    net: '₹14.45 Cr', 
    deductions: '₹3.65 Cr',
    status: 'Approved', 
    initiatedBy: 'Rajesh Kumar', 
    lastUpdated: '28 Oct 2025',
    approvedDate: '28 Oct 2025'
  },
  { 
    id: '3', 
    period: 'September 2025', 
    employees: 1835, 
    gross: '₹17.95 Cr', 
    net: '₹14.32 Cr', 
    deductions: '₹3.63 Cr',
    status: 'Locked', 
    initiatedBy: 'Kavita Sharma', 
    lastUpdated: '30 Sep 2025' 
  },
  { 
    id: '4', 
    period: 'August 2025', 
    employees: 1830, 
    gross: '₹17.80 Cr', 
    net: '₹14.20 Cr', 
    deductions: '₹3.60 Cr',
    status: 'Locked', 
    initiatedBy: 'Rajesh Kumar', 
    lastUpdated: '31 Aug 2025' 
  },
  { 
    id: '5', 
    period: 'July 2025', 
    employees: 1825, 
    gross: '₹17.65 Cr', 
    net: '₹14.10 Cr', 
    deductions: '₹3.55 Cr',
    status: 'Locked', 
    initiatedBy: 'Kavita Sharma', 
    lastUpdated: '31 Jul 2025' 
  },
];

const PayrollApprovalRequests: React.FC = () => {
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(INITIAL_DATA);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modal States
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [wizardState, setWizardState] = useState<{isOpen: boolean, readOnly: boolean}>({isOpen: false, readOnly: false});

  // Derived Stats
  const pendingCount = payrollRuns.filter(r => r.status === 'Pending Approval').length;
  const lastApprovedRun = payrollRuns.find(r => r.status === 'Approved' || r.status === 'Locked');

  // Filter the list based on selected status
  const filteredRuns = filterStatus === 'All' 
    ? payrollRuns 
    : payrollRuns.filter(run => run.status === filterStatus);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending Approval': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Locked': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'In Progress': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending Approval': return <AlertCircle size={14} />;
      case 'Approved': return <CheckCircle size={14} />;
      case 'Locked': return <Lock size={14} />;
      case 'In Progress': return <Clock size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const handleReviewNow = () => {
    setFilterStatus('Pending Approval');
    const pendingRun = payrollRuns.find(run => run.status === 'Pending Approval');
    if (pendingRun) {
        setSelectedRun(pendingRun);
    }
  };

  const handleApproveClick = () => {
    setIsApproveModalOpen(true);
  };

  const confirmApproval = () => {
    if (!selectedRun) return;

    const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    
    const updatedRun: PayrollRun = { 
        ...selectedRun, 
        status: 'Approved', 
        lastUpdated: currentDate,
        approvedDate: currentDate
    };

    // Update state
    setPayrollRuns(prev => prev.map(run => run.id === selectedRun.id ? updatedRun : run));
    setSelectedRun(updatedRun);

    // Transitions
    setIsApproveModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  const handleCloseSuccess = () => {
    setIsSuccessModalOpen(false);
    // Optionally close detail panel or keep it open to see approved status
    // setSelectedRun(null); 
  };

  const handleViewPayroll = () => {
    setWizardState({ isOpen: true, readOnly: true });
  };

  const handleEditPayroll = () => {
    setWizardState({ isOpen: true, readOnly: false });
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-300 h-full flex flex-col relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payroll Approval Requests</h1>
          <p className="text-slate-500 mt-1">Review, approve, and track monthly payroll runs.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
         <div className="bg-white p-5 rounded-2xl border border-orange-200 bg-orange-50/20 shadow-sm flex flex-col justify-between transition-all">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">Pending Approvals</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{pendingCount}</p>
               </div>
               <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><AlertCircle size={20}/></div>
            </div>
            <button 
                onClick={handleReviewNow}
                disabled={pendingCount === 0}
                className={`mt-4 w-full py-2 bg-white border border-orange-200 text-orange-700 text-xs font-bold rounded-lg transition-colors shadow-sm ${pendingCount === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-50'}`}
            >
               {pendingCount > 0 ? 'Review Now' : 'All Caught Up'}
            </button>
         </div>

         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Month Payroll</p>
                  <div className="flex items-center gap-2 mt-1">
                     <p className="text-lg font-bold text-slate-800">Nov 2025</p>
                     <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-[10px] font-bold rounded border border-yellow-100 uppercase">In Progress</span>
                  </div>
               </div>
               <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg"><Clock size={20}/></div>
            </div>
         </div>

         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Approved Payroll</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">{lastApprovedRun ? lastApprovedRun.period : '-'}</p>
                  <p className="text-xs text-emerald-600 font-medium mt-0.5">{lastApprovedRun ? `Approved on ${lastApprovedRun.approvedDate}` : '-'}</p>
               </div>
               <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle size={20}/></div>
            </div>
         </div>

         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Payroll Runs YTD</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">12</p>
               </div>
               <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><History size={20}/></div>
            </div>
         </div>
      </div>

      {/* Main List Section */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[400px]">
         {/* Toolbar */}
         <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Search by period, status..." 
                 className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm"
               />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <div className="relative">
                  <select className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 focus:outline-none appearance-none cursor-pointer shadow-sm">
                     <option>Month/Year</option>
                     <option>2025</option>
                     <option>2024</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
               </div>
               <div className="relative">
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 focus:outline-none appearance-none cursor-pointer shadow-sm"
                  >
                     <option value="All">All Status</option>
                     <option value="Pending Approval">Pending Approval</option>
                     <option value="Approved">Approved</option>
                     <option value="Locked">Locked</option>
                     <option value="Draft">Draft</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
               </div>
            </div>
         </div>

         {/* Table */}
         <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm border-collapse">
               <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                     <th className="px-6 py-4">Payroll Period</th>
                     <th className="px-6 py-4 text-center">Total Employees</th>
                     <th className="px-6 py-4 text-right">Gross Payroll Cost</th>
                     <th className="px-6 py-4 text-right">Net Payable</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4">Initiated By</th>
                     <th className="px-6 py-4">Last Updated</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredRuns.length > 0 ? (
                    filteredRuns.map((run) => (
                        <tr 
                            key={run.id} 
                            onClick={() => setSelectedRun(run)}
                            className={`hover:bg-purple-50/30 transition-colors cursor-pointer group ${selectedRun?.id === run.id ? 'bg-purple-50/50' : ''}`}
                        >
                            <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{run.period}</div>
                            </td>
                            <td className="px-6 py-4 text-center font-medium text-slate-600">
                            {run.employees.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-slate-700">
                            {run.gross}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-slate-800">
                            {run.net}
                            </td>
                            <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(run.status)}`}>
                                {getStatusIcon(run.status)} {run.status}
                            </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 text-xs">
                            {run.initiatedBy}
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-xs">
                            {run.lastUpdated}
                            </td>
                            <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                                <button onClick={(e) => {e.stopPropagation(); setSelectedRun(run)}} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600" title="View Details">
                                    <Eye size={16}/>
                                </button>
                                {run.status === 'Pending Approval' ? (
                                    <>
                                        <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-purple-600" title="Edit">
                                        <Edit2 size={16}/>
                                        </button>
                                        <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-600" title="Approve">
                                        <CheckCircle size={16}/>
                                        </button>
                                    </>
                                ) : run.status === 'Approved' ? (
                                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600" title="Re-open">
                                        <RefreshCw size={16}/>
                                    </button>
                                ) : (
                                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-purple-600" title="History">
                                        <History size={16}/>
                                    </button>
                                )}
                            </div>
                            </td>
                        </tr>
                    ))
                  ) : (
                    <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                            No payroll runs found matching the filter "{filterStatus}".
                        </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Slide-in Detail Panel */}
      {selectedRun && (
         <>
            <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedRun(null)} />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col border-l border-slate-200">
               
               {/* Panel Header */}
               <div className="p-6 border-b border-slate-100 bg-slate-50/80 flex justify-between items-start">
                  <div>
                     <h2 className="text-xl font-bold text-slate-800">{selectedRun.period}</h2>
                     <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(selectedRun.status)}`}>
                           {getStatusIcon(selectedRun.status)} {selectedRun.status}
                        </span>
                        <span className="text-xs text-slate-400">• ID: {selectedRun.id}</span>
                     </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                        onClick={handleViewPayroll}
                        className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-200 transition-all"
                        title="View Full Details"
                    >
                        <Eye size={20} />
                    </button>
                    <button onClick={() => setSelectedRun(null)} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200 transition-all">
                        <X size={20} />
                    </button>
                  </div>
               </div>

               {/* Panel Content */}
               <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  
                  {/* Financial Summary */}
                  <div>
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Payroll Summary</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                           <p className="text-xs text-purple-600 font-medium mb-1">Total Gross</p>
                           <p className="text-lg font-bold text-purple-900">{selectedRun.gross}</p>
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                           <p className="text-xs text-indigo-600 font-medium mb-1">Net Payable</p>
                           <p className="text-lg font-bold text-indigo-900">{selectedRun.net}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 col-span-2 flex justify-between items-center">
                           <div>
                              <p className="text-xs text-slate-500 font-medium mb-1">Total Deductions</p>
                              <p className="text-base font-bold text-slate-700">{selectedRun.deductions || '₹0'}</p>
                           </div>
                           <button 
                             onClick={handleViewPayroll}
                             className="text-xs font-bold text-purple-600 hover:underline"
                           >
                             View Breakdown
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Approval Workflow */}
                  <div>
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Approval Workflow</h3>
                     <div className="space-y-6 pl-2">
                        {/* Step 1 */}
                        <div className="flex gap-4 relative">
                           <div className="absolute left-[11px] top-6 bottom-[-30px] w-0.5 bg-emerald-200"></div>
                           <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm">
                              <Check size={12} strokeWidth={3} />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-800">Payroll Initiated</p>
                              <p className="text-xs text-slate-500 mt-0.5">by {selectedRun.initiatedBy} • HR Manager</p>
                              <p className="text-[10px] text-slate-400 mt-1">18 Dec 2025, 10:30 AM</p>
                           </div>
                        </div>
                        
                        {/* Step 2 */}
                        <div className="flex gap-4 relative">
                           {selectedRun.status === 'Approved' || selectedRun.status === 'Locked' ? (
                              <>
                                 <div className="absolute left-[11px] top-6 bottom-[-30px] w-0.5 bg-emerald-200"></div>
                                 <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm animate-in zoom-in">
                                    <Check size={12} strokeWidth={3} />
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-slate-800">HR Approval</p>
                                    <p className="text-xs text-slate-500 mt-0.5">by Kavita Sharma</p>
                                    <p className="text-[10px] text-slate-400 mt-1">{selectedRun.approvedDate ? `${selectedRun.approvedDate}, 04:15 PM` : 'Just now'}</p>
                                 </div>
                              </>
                           ) : (
                              <>
                                 <div className="absolute left-[11px] top-6 bottom-[-30px] w-0.5 bg-slate-200"></div>
                                 <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm">
                                    <Clock size={12} strokeWidth={3} />
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-slate-800">HR Approval</p>
                                    <p className="text-xs text-amber-600 font-medium mt-0.5">Pending Action</p>
                                 </div>
                              </>
                           )}
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-4 relative">
                           {selectedRun.status === 'Locked' ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm">
                                 <Check size={12} strokeWidth={3} />
                              </div>
                           ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm">
                                 <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                              </div>
                           )}
                           <div>
                              <p className={`text-sm font-bold ${selectedRun.status === 'Locked' ? 'text-slate-800' : 'text-slate-400'}`}>Finance Approval</p>
                              <p className="text-xs text-slate-400 mt-0.5">Pending</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Activity Log */}
                  <div>
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Recent Activity</h3>
                     <div className="space-y-3">
                        {selectedRun.status === 'Approved' && (
                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs animate-in slide-in-from-top-2">
                                <span className="font-bold text-emerald-800">Payroll Approved</span> by You <br/>
                                <span className="text-emerald-600">{selectedRun.approvedDate} • Ready for Finance</span>
                            </div>
                        )}
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                           <span className="font-bold text-slate-700">Adjustments made</span> by Kavita <br/>
                           <span className="text-slate-400">18 Dec • Added Bonus for 12 employees</span>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                           <span className="font-bold text-slate-700">Payroll locked for editing</span> <br/>
                           <span className="text-slate-400">17 Dec • System Auto-lock</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Sticky Footer Actions */}
               <div className="p-6 border-t border-slate-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  {selectedRun.status === 'Pending Approval' ? (
                    <div className="flex gap-3">
                        <button 
                            onClick={handleEditPayroll}
                            className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Edit2 size={18} /> Edit Payroll
                        </button>
                        <button 
                            onClick={handleApproveClick}
                            className="flex-[2] py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={18} /> Approve Payroll
                        </button>
                    </div>
                  ) : (
                    <div className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                        <CheckCircle size={18} /> Payroll Approved
                    </div>
                  )}
               </div>
            </div>
         </>
      )}

      {/* Confirmation Modal */}
      {isApproveModalOpen && selectedRun && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-8 text-center border-t-8 border-purple-600">
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Approve {selectedRun.period} Payroll?</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                    This will mark the payroll as approved and notify the Finance team for disbursement. You cannot edit adjustments after this step.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsApproveModalOpen(false)}
                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmApproval}
                        className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all"
                    >
                        Confirm Approval
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                    <Check size={40} strokeWidth={4} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Payroll Approved!</h3>
                <p className="text-sm text-slate-500 mb-8">
                    The status has been updated successfully. Finance team has been notified.
                </p>
                <button 
                    onClick={handleCloseSuccess}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
                >
                    Done
                </button>
            </div>
        </div>
      )}

      {/* Payroll Wizard Modal (View/Edit) */}
      <RunPayrollModal 
        isOpen={wizardState.isOpen} 
        onClose={() => setWizardState({ ...wizardState, isOpen: false })} 
        company={MOCK_COMPANIES[0]} 
        readOnly={wizardState.readOnly}
      />

    </div>
  );
};

export default PayrollApprovalRequests;
