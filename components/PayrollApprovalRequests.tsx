
import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  AlertTriangle,
  Unlock,
  CheckSquare,
  User
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
  businessUnits?: string[];
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
    lastUpdated: '18 Dec 2025',
    businessUnits: ['Mindinventory', '300 Minds']
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

const APPROVAL_FIELDS = [
  { name: 'Status', icon: CheckSquare },
  { name: 'Period', icon: Calendar },
  { name: 'Created By', icon: User },
];

const PayrollApprovalRequests: React.FC = () => {
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(INITIAL_DATA);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);

  // Lookup Filter States
  const [completedFilters, setCompletedFilters] = useState<any[]>([]);
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [currentOperator, setCurrentOperator] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<string[]>([]);
  const [valSearchQuery, setValSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (field === 'Status') return ['Pending Approval', 'Approved', 'Locked', 'In Progress', 'Draft'];
    const uniqueValues = new Set<string>();
    payrollRuns.forEach(run => {
      if (field === 'Period') uniqueValues.add(run.period);
      if (field === 'Created By') uniqueValues.add(run.initiatedBy);
    });
    return Array.from(uniqueValues).filter(Boolean).sort();
  };

  const selectField = (field: string) => { setCurrentField(field); setCurrentOperator(null); setTempValues([]); setValSearchQuery(''); };
  const selectOperator = (operator: string) => { setCurrentOperator(operator); setTempValues([]); setValSearchQuery(''); };
  const toggleTempValue = (val: string) => { setTempValues(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]); };

  const applyCurrentFilter = () => {
    if (currentField && currentOperator && tempValues.length > 0) {
      setCompletedFilters(prev => [...prev, { id: Math.random().toString(), field: currentField, operator: currentOperator, values: tempValues }]);
      setCurrentField(null); setCurrentOperator(null); setTempValues([]); setValSearchQuery(''); setDropdownOpen(false);
    }
  };

  const cancelCurrentFilter = () => { setCurrentField(null); setCurrentOperator(null); setTempValues([]); setValSearchQuery(''); setDropdownOpen(false); };
  const removeFilter = (id: string) => { setCompletedFilters(prev => prev.filter(f => f.id !== id)); };
  const clearAllFilters = () => { setCompletedFilters([]); cancelCurrentFilter(); setSearchTerm(''); };

  // Modal States
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [wizardState, setWizardState] = useState<{isOpen: boolean, readOnly: boolean}>({isOpen: false, readOnly: false});
  const [showLockModal, setShowLockModal] = useState<string | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState<string | null>(null);

  // Derived Stats
  const pendingCount = payrollRuns.filter(r => r.status === 'Pending Approval').length;
  const lastApprovedRun = payrollRuns.find(r => r.status === 'Approved' || r.status === 'Locked');

  // Filter the list using Lookup Filter + search
  const filteredRuns = useMemo(() => {
    return payrollRuns.filter(run => {
      const matchesSearch = searchTerm
        ? run.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
          run.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          run.initiatedBy.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      if (!matchesSearch) return false;
      for (const filter of completedFilters) {
        let val = '';
        if (filter.field === 'Status') val = run.status;
        else if (filter.field === 'Period') val = run.period;
        else if (filter.field === 'Created By') val = run.initiatedBy;
        const isMatch = filter.values.some((v: string) => v.toLowerCase() === val.toLowerCase());
        if (filter.operator === 'Is' && !isMatch) return false;
        if (filter.operator === 'Is not' && isMatch) return false;
      }
      return true;
    });
  }, [payrollRuns, searchTerm, completedFilters]);

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
      <div className="flex gap-3 shrink-0 flex-wrap">
         <div className="bg-white p-4 rounded-2xl border border-orange-200 bg-orange-50/20 shadow-sm flex flex-col justify-between transition-all w-52">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">Pending Approvals</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{pendingCount}</p>
               </div>
               <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><AlertCircle size={18}/></div>
            </div>
         </div>

         <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between w-52">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Month Payroll</p>
                  <div className="flex items-center gap-2 mt-1">
                     <p className="text-lg font-bold text-slate-800">Nov 2025</p>
                     <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-[10px] font-bold rounded border border-yellow-100 uppercase">In Progress</span>
                  </div>
               </div>
               <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg"><Clock size={18}/></div>
            </div>
         </div>

         <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between w-52">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Approved Payroll</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">{lastApprovedRun ? lastApprovedRun.period : '-'}</p>
               </div>
               <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle size={18}/></div>
            </div>
         </div>

         <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between w-52">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Payroll Runs</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">12</p>
               </div>
               <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><History size={18}/></div>
            </div>
         </div>
      </div>

      {/* Main List Section */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[400px]">
         {/* Toolbar */}
         <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2 relative">
            <div className="relative flex-1" ref={dropdownRef}>
               <div
                  onClick={() => { setDropdownOpen(true); inputRef.current?.focus(); }}
                  className="w-full flex flex-wrap items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm min-h-[40px] focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 transition-all cursor-text pr-10"
               >
                  {completedFilters.length === 0 && !currentField && (
                     <Search className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                  {completedFilters.map(filter => {
                     const fObj = APPROVAL_FIELDS.find(f => f.name === filter.field);
                     const FIcon = fObj?.icon;
                     return (
                        <div key={filter.id} className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                           {FIcon && <FIcon size={12} className="text-slate-500" />}
                           <span>{filter.field}</span>
                           <span className="text-slate-400 font-bold lowercase text-[10px]">{filter.operator}</span>
                           <span className="bg-slate-200/60 px-1 rounded text-slate-800 max-w-[120px] truncate">{filter.values.join(', ')}</span>
                           <button onClick={(e) => { e.stopPropagation(); removeFilter(filter.id); }} className="ml-1 text-slate-400 hover:text-slate-600 transition-colors">
                              <X size={12} />
                           </button>
                        </div>
                     );
                  })}
                  {currentField && (
                     <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-700">
                        {(() => { const fObj = APPROVAL_FIELDS.find(f => f.name === currentField); const FIcon = fObj?.icon; return FIcon ? <FIcon size={12} className="text-slate-500" /> : null; })()}
                        <span>{currentField}</span>
                     </div>
                  )}
                  {currentOperator && (
                     <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-1.5 py-0.5 text-xs font-bold text-slate-600">
                        <span>{currentOperator}</span>
                     </div>
                  )}
                  <input
                     ref={inputRef}
                     type="text"
                     value={currentField && currentOperator ? valSearchQuery : searchTerm}
                     onChange={(e) => {
                        if (currentField && currentOperator) { setValSearchQuery(e.target.value); }
                        else { setSearchTerm(e.target.value); setDropdownOpen(false); }
                     }}
                     placeholder={completedFilters.length === 0 && !currentField ? "Filter Results..." : currentField && currentOperator ? "Select..." : ""}
                     className="flex-1 min-w-[60px] bg-transparent border-none outline-none text-slate-800 text-sm py-0.5 placeholder-slate-400 focus:ring-0 p-0"
                  />
                  {(completedFilters.length > 0 || currentField || searchTerm) && (
                     <button onClick={(e) => { e.stopPropagation(); clearAllFilters(); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                        <X size={14} />
                     </button>
                  )}
               </div>
               {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                     {!currentField && (
                        <div className="py-1">
                           <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Field</div>
                           {APPROVAL_FIELDS.map(f => (
                              <button key={f.name} onClick={() => selectField(f.name)} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors">
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
                              <button key={op} onClick={() => selectOperator(op)} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors">
                                 <div className="w-4 h-4 flex items-center justify-center font-mono text-xs font-bold text-slate-400">{op === 'Is' ? '=' : '!='}</div>
                                 <span>{op}</span>
                              </button>
                           ))}
                        </div>
                     )}
                     {currentField && currentOperator && (
                        <div className="flex flex-col max-h-[300px]">
                           <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">Select values for {currentField}</div>
                           <div className="p-2 border-b border-slate-100">
                              <input type="text" placeholder="Search values..." value={valSearchQuery} onChange={(e) => setValSearchQuery(e.target.value)} className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500" />
                           </div>
                           <div className="overflow-y-auto flex-1 py-1 max-h-[160px]">
                              {(() => {
                                 const opts = getOptionsForField(currentField).filter(opt => opt.toLowerCase().includes(valSearchQuery.toLowerCase()));
                                 if (opts.length === 0) return <div className="px-3 py-2 text-xs text-slate-400 italic">No values found</div>;
                                 return opts.map(opt => (
                                    <label key={opt} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
                                       <input type="checkbox" checked={tempValues.includes(opt)} onChange={() => toggleTempValue(opt)} className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer w-3.5 h-3.5" />
                                       <span>{opt}</span>
                                    </label>
                                 ));
                              })()}
                           </div>
                           <div className="p-2 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                              <button onClick={cancelCurrentFilter} className="px-2.5 py-1 text-[10px] text-slate-500 font-bold hover:text-slate-700 transition-colors">Cancel</button>
                              <button onClick={applyCurrentFilter} disabled={tempValues.length === 0} className="px-3 py-1 bg-purple-600 text-white text-[10px] font-bold rounded hover:bg-purple-700 transition-colors disabled:opacity-50">Done</button>
                           </div>
                        </div>
                     )}
                  </div>
               )}
            </div>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 text-sm font-medium flex items-center gap-2 shadow-sm shrink-0 h-[40px]">
               <Filter size={16} /> Filter
            </button>
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
                     <th className="px-6 py-4">Created By</th>
                     <th className="px-6 py-4">Last Modified By</th>
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
                                {run.status === 'Pending Approval' && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedRun(run);
                                            setWizardState({ isOpen: true, readOnly: false });
                                        }}
                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-purple-600" title="Edit"
                                    >
                                        <Edit2 size={16}/>
                                    </button>
                                )}
                                {run.status === 'Locked' ? (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setShowUnlockModal(run.id); }} 
                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600" 
                                        title="Unlock to Edit"
                                    >
                                        <Unlock size={16}/>
                                    </button>
                                ) : run.status !== 'Draft' && run.status !== 'Pending Approval' ? (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setShowLockModal(run.id); }} 
                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600" 
                                        title="Lock Payroll"
                                    >
                                        <Lock size={16}/>
                                    </button>
                                ) : null}
                            </div>
                            </td>
                        </tr>
                    ))
                  ) : (
                    <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                            No payroll runs found matching the selected filters.
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
                     </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {selectedRun.status === 'Pending Approval' && (
                        <button 
                            onClick={handleEditPayroll}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 shadow-sm text-slate-700 rounded-lg font-bold text-xs hover:bg-slate-50 transition-all"
                        >
                            <Edit2 size={14} /> Edit
                        </button>
                    )}
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
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                           <p className="text-xs text-slate-500 font-medium mb-1">Total Deductions</p>
                           <p className="text-lg font-bold text-slate-700">{selectedRun.deductions || '₹0'}</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                           <p className="text-xs text-blue-600 font-medium mb-1">Total Employees</p>
                           <p className="text-lg font-bold text-blue-900">{selectedRun.employees.toLocaleString()}</p>
                        </div>
                     </div>
                  </div>

                  {/* Approval Hierarchy */}
                  <div>
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Approval Hierarchy</h3>
                     <div className="space-y-6 pl-2">
                        {/* Step 1 */}
                        <div className="flex gap-4 relative">
                           <div className="absolute left-[11px] top-6 bottom-[-30px] w-0.5 bg-emerald-200"></div>
                           <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-sm">
                              <Check size={12} strokeWidth={3} />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-800">{selectedRun.initiatedBy}</p>
                              <p className="text-xs text-slate-500 mt-0.5">HR Manager</p>
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
                                    <p className="text-sm font-bold text-slate-800">Kavita Sharma</p>
                                    <p className="text-xs text-slate-500 mt-0.5">HR Manager</p>
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
                                    <p className="text-sm font-bold text-slate-800">Kavita Sharma</p>
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
                              <p className={`text-sm font-bold ${selectedRun.status === 'Locked' ? 'text-slate-800' : 'text-slate-400'}`}>Rajesh Kumar</p>
                              <p className="text-xs text-slate-400 mt-0.5">Pending Action</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Sticky Footer Actions */}
               <div className="p-6 border-t border-slate-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  {selectedRun.status === 'Pending Approval' ? (
                    <button 
                        onClick={handleApproveClick}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={18} /> Approve
                    </button>
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
        initialBusinessUnits={selectedRun?.businessUnits || undefined}
      />

      {/* Unlock Confirmation Modal */}
      {showUnlockModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                          <Unlock size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Unlock Payroll Request?</h3>
                      <p className="text-slate-500 mb-6">
                          Unlocking this payroll will allow HR administrators to edit it again. Once changes are done, it must be approved again before locking.
                      </p>
                      <div className="flex gap-3 mt-8">
                          <button 
                              onClick={() => setShowUnlockModal(null)}
                              className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={() => {
                                  const idx = payrollRuns.findIndex(r => r.id === showUnlockModal);
                                  if (idx !== -1) {
                                      const newRuns = [...payrollRuns];
                                      newRuns[idx].status = 'Approved';
                                      setPayrollRuns(newRuns);
                                  }
                                  setShowUnlockModal(null);
                              }}
                              className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg font-bold text-sm hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all flex items-center justify-center gap-2"
                          >
                              <Unlock size={16} /> Confirm Unlock
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Lock Confirmation Modal */}
      {showLockModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                          <Lock size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Lock Payroll Request?</h3>
                      <p className="text-slate-500 mb-6">
                          You are about to lock this payroll request to prevent any further changes.
                      </p>
                      <div className="flex gap-3 mt-8">
                          <button 
                              onClick={() => setShowLockModal(null)}
                              className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={() => {
                                  const idx = payrollRuns.findIndex(r => r.id === showLockModal);
                                  if (idx !== -1) {
                                      const newRuns = [...payrollRuns];
                                      newRuns[idx].status = 'Locked';
                                      setPayrollRuns(newRuns);
                                  }
                                  setShowLockModal(null);
                              }}
                              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                          >
                              <Lock size={16} /> Confirm Lock
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default PayrollApprovalRequests;
