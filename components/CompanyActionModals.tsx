
import React, { useState, useEffect } from 'react';
import {
   X,
   Building,
   Users,
   CreditCard,
   Calendar,
   Check,
   AlertTriangle,
   Download,
   FileText,
   Activity,
   Save,
   Database,
   Shield,
   FileSpreadsheet,
   Briefcase,
   MapPin,
   ChevronRight,
   Filter,
   ArrowRight,
   ChevronLeft,
   Lock,
   Info,
   AlertCircle,
   Printer,
   CheckCircle,
   Settings,
   Clock,
   Upload,
   PieChart,
   UserCheck,
   FileSignature,
   ShieldCheck,
   Plus,
   Mail,
   Smartphone,
   Award,
   Search,
   MoreHorizontal,
   MinusCircle,
   Play,
   RotateCcw,
   DollarSign,
   Edit2,
   PauseCircle,
   PlayCircle,
   Trash2
} from 'lucide-react';
import { Company } from '../types';
import { MOCK_EMPLOYEES } from '../constants';

// --- View Company Modal ---
export const ViewCompanyModal: React.FC<{ isOpen: boolean; onClose: () => void; company: Company | null }> = ({ isOpen, onClose, company }) => {
   if (!isOpen || !company) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-lg shadow-sm">
                     {company.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                     <h2 className="text-lg font-bold text-slate-800">{company.name}</h2>
                     <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-mono">{company.id}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><MapPin size={10} /> {company.location}</span>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${company.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                     {company.status}
                  </span>
                  <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                     <X size={20} />
                  </button>
               </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
               <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                     <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Total Workforce</p>
                     <p className="text-2xl font-bold text-indigo-900">{company.employees.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                     <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Current Plan</p>
                     <p className="text-2xl font-bold text-purple-900">{company.plan}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                     <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Last Payroll</p>
                     <p className="text-2xl font-bold text-emerald-900">{company.lastPayrollRun}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <div>
                     <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-slate-400" /> Recent Activity
                     </h3>
                     <div className="space-y-4">
                        <div className="flex gap-3">
                           <div className="w-2 h-2 mt-2 rounded-full bg-slate-300"></div>
                           <div>
                              <p className="text-sm font-medium text-slate-700">Payroll for Nov 2025 processed</p>
                              <p className="text-xs text-slate-400">2 days ago by System</p>
                           </div>
                        </div>
                        <div className="flex gap-3">
                           <div className="w-2 h-2 mt-2 rounded-full bg-slate-300"></div>
                           <div>
                              <p className="text-sm font-medium text-slate-700">Added 5 new employees</p>
                              <p className="text-xs text-slate-400">5 days ago by HR Manager</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div>
                     <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Shield size={18} className="text-slate-400" /> Compliance Status
                     </h3>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 border border-slate-100 rounded-lg">
                           <span className="text-sm text-slate-600">PF Filing</span>
                           <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Up to Date</span>
                        </div>
                        <div className="flex justify-between items-center p-3 border border-slate-100 rounded-lg">
                           <span className="text-sm text-slate-600">TDS Remittance</span>
                           <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Due in 2 days</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
               <button className="px-4 py-2 border border-slate-200 bg-white text-slate-600 font-medium text-sm rounded-lg hover:bg-slate-50">View Full History</button>
               <button className="px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700">Manage Company</button>
            </div>
         </div>
      </div>
   );
};

// --- Payroll Alerts Modal ---
export const PayrollAlertsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
   if (!isOpen) return null;

   const alerts = [
      { id: 1, severity: 'High', title: 'Compliance Issue', message: 'Basic salary is less than 50% of CTC for 3 employees (Neha Kapoor, +2 others).', action: 'Adjust Structure' },
      { id: 2, severity: 'Medium', title: 'Data Missing', message: 'Bank account details missing for new joinee: Rahul Sharma.', action: 'Update Profile' },
      { id: 3, severity: 'Low', title: 'Policy Check', message: 'LTA claim exceeds eligibility for Priya Sharma.', action: 'Review Claim' },
   ];

   const handleActionClick = (actionName: string) => {
      // In a real app, this would navigate or open the specific module
      alert(`Action Triggered: ${actionName}`);
   };

   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
         <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><AlertCircle size={18} /></div>
                  <h3 className="font-bold text-slate-800">Payroll Alerts</h3>
               </div>
               <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
               {alerts.map(alert => (
                  <div key={alert.id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors bg-white shadow-sm">
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${alert.severity === 'High' ? 'bg-rose-500' :
                              alert.severity === 'Medium' ? 'bg-orange-500' : 'bg-blue-500'
                              }`}></span>
                           <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{alert.title}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${alert.severity === 'High' ? 'bg-rose-50 text-rose-700' :
                           alert.severity === 'Medium' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
                           }`}>
                           {alert.severity} Priority
                        </span>
                     </div>
                     <p className="text-sm text-slate-600 mb-4 leading-relaxed">{alert.message}</p>
                     <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                        <button className="px-3 py-1.5 text-slate-500 text-xs font-bold hover:text-slate-700 transition-colors">Ignore</button>
                        <button
                           onClick={() => handleActionClick(alert.action)}
                           className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-1"
                        >
                           {alert.action} <ChevronRight size={12} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
               <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-900 transition-colors shadow-sm">
                  Done
               </button>
            </div>
         </div>
      </div>
   );
};

// --- Run Payroll Modal (Full 6-Step Wizard) ---
export const RunPayrollModal: React.FC<{
   isOpen?: boolean;
   onClose: () => void;
   company: Company | null;
   isPage?: boolean;
   readOnly?: boolean;
}> = ({ isOpen = false, onClose, company, isPage = false, readOnly = false }) => {
   const [currentStep, setCurrentStep] = useState(1);
   const [isConfirmed, setIsConfirmed] = useState(false);
   const [isAlertsOpen, setIsAlertsOpen] = useState(false);

   // Step 1: Employee Selection State
   const [payrollEmployees, setPayrollEmployees] = useState(() =>
      MOCK_EMPLOYEES.map(e => ({ ...e, payrollStatus: 'Eligible' as 'Eligible' | 'On Hold' }))
   );
   const [empSearch, setEmpSearch] = useState('');
   const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);

   // Step 6 States
   const [isGenerating, setIsGenerating] = useState(false);
   const [generationProgress, setGenerationProgress] = useState(0);
   const [payslipsGenerated, setPayslipsGenerated] = useState(false);
   const [emailsSent, setEmailsSent] = useState(false);

   // Step 3 State & Modals
   const [adjustmentSearch, setAdjustmentSearch] = useState('');
   const [adjustments, setAdjustments] = useState([
      { id: 1, name: 'Priya Sharma', gross: 154166, bonus: 0, arrears: 0, deduction: 0, reimbursement: 0, lop: 0, lopReversal: 0, other: 0, proposedTds: 12500, actualTds: 12500 },
      { id: 2, name: 'Arjun Mehta', gross: 180000, bonus: 25000, arrears: 0, deduction: 5000, reimbursement: 8400, lop: 0, lopReversal: 0, other: 0, proposedTds: 18000, actualTds: 18000 },
      { id: 3, name: 'Neha Kapoor', gross: 131666, bonus: 0, arrears: 5000, deduction: 0, reimbursement: 0, lop: 4500, lopReversal: 0, other: 0, proposedTds: 8500, actualTds: 8500 },
      { id: 4, name: 'Rohan Desai', gross: 176666, bonus: 0, arrears: 0, deduction: 2000, reimbursement: 0, lop: 0, lopReversal: 0, other: 1000, proposedTds: 16200, actualTds: 16200 },
      { id: 5, name: 'Vikram Singh', gross: 158333, bonus: 5000, arrears: 0, deduction: 0, reimbursement: 0, lop: 0, lopReversal: 0, other: 0, proposedTds: 14000, actualTds: 14000 },
      { id: 6, name: 'Ananya Patel', gross: 147500, bonus: 0, arrears: 0, deduction: 1000, reimbursement: 0, lop: 0, lopReversal: 0, other: 0, proposedTds: 11000, actualTds: 11000 },
   ]);
   const [showBonusModal, setShowBonusModal] = useState(false);
   const [showLopModal, setShowLopModal] = useState(false);

   // Temporary State for Modals inputs
   const [selectedBonusEmp, setSelectedBonusEmp] = useState('');
   const [bonusAmount, setBonusAmount] = useState('');

   // LOP Reversal List State
   const [lopReversalList, setLopReversalList] = useState<{ id: number, name: string, days: string, amount: number }[]>([]);
   const [selectedLopEmp, setSelectedLopEmp] = useState('');
   const [showAttendanceUpload, setShowAttendanceUpload] = useState(false);

   // If not page mode, check isOpen
   if (!isPage && !isOpen) return null;
   if (!company) return null;

   const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 6));
   const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

   const handleGeneratePayslips = () => {
      setIsGenerating(true);
      let progress = 0;
      const interval = setInterval(() => {
         progress += 10;
         setGenerationProgress(progress);
         if (progress >= 100) {
            clearInterval(interval);
            setIsGenerating(false);
            setPayslipsGenerated(true);
         }
      }, 200);
   };

   const handleAdjustmentChange = (id: number, field: string, val: string) => {
      const num = parseFloat(val) || 0;
      setAdjustments(prev => prev.map(row => row.id === id ? { ...row, [field]: num } : row));
   };

   const handleAddBonus = () => {
      if (selectedBonusEmp && bonusAmount) {
         const empId = parseInt(selectedBonusEmp);
         setAdjustments(prev => prev.map(row =>
            row.id === empId ? { ...row, bonus: row.bonus + parseFloat(bonusAmount) } : row
         ));
         setShowBonusModal(false);
         setBonusAmount('');
         setSelectedBonusEmp('');
      }
   };

   const handleAddLopEmployee = () => {
      if (selectedLopEmp) {
         const empId = parseInt(selectedLopEmp);
         // Check if already in list
         if (lopReversalList.some(item => item.id === empId)) {
            setSelectedLopEmp('');
            return;
         }

         const emp = adjustments.find(e => e.id === empId);
         if (emp) {
            setLopReversalList(prev => [...prev, {
               id: empId,
               name: emp.name,
               days: '1',
               amount: Math.round(emp.gross / 30) // Default 1 day amount
            }]);
         }
         setSelectedLopEmp('');
      }
   };

   const updateLopDays = (id: number, days: string) => {
      const emp = adjustments.find(e => e.id === id);
      const daysNum = parseFloat(days) || 0;
      const amount = emp ? Math.round((emp.gross / 30) * daysNum) : 0;

      setLopReversalList(prev => prev.map(item =>
         item.id === id ? { ...item, days, amount } : item
      ));
   };

   const removeLopEmployee = (id: number) => {
      setLopReversalList(prev => prev.filter(item => item.id !== id));
   };

   const handleApplyReversal = () => {
      if (lopReversalList.length > 0) {
         setAdjustments(prev => prev.map(row => {
            const reversalItem = lopReversalList.find(item => item.id === row.id);
            if (reversalItem) {
               return { ...row, lopReversal: row.lopReversal + reversalItem.amount };
            }
            return row;
         }));
         setShowLopModal(false);
         setLopReversalList([]);
      }
   };

   // Step 1: Selection Logic
   const filteredEmployees = payrollEmployees.filter(e =>
      e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.eid.toLowerCase().includes(empSearch.toLowerCase())
   );

   const eligibleCount = payrollEmployees.filter(e => e.payrollStatus === 'Eligible').length;
   const onHoldCount = payrollEmployees.filter(e => e.payrollStatus === 'On Hold').length;

   const toggleHold = (id: string) => {
      setPayrollEmployees(prev => prev.map(e => {
         if (e.id === id) {
            return { ...e, payrollStatus: e.payrollStatus === 'Eligible' ? 'On Hold' : 'Eligible' };
         }
         return e;
      }));
   };

   const toggleSelection = (id: string) => {
      setSelectedEmpIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
   };

   const toggleSelectAll = () => {
      if (selectedEmpIds.length === filteredEmployees.length) {
         setSelectedEmpIds([]);
      } else {
         setSelectedEmpIds(filteredEmployees.map(e => e.id));
      }
   };

   const bulkAction = (action: 'Hold' | 'Eligible') => {
      setPayrollEmployees(prev => prev.map(e => {
         if (selectedEmpIds.includes(e.id)) {
            return { ...e, payrollStatus: action === 'Hold' ? 'On Hold' : 'Eligible' };
         }
         return e;
      }));
      setSelectedEmpIds([]);
   };

   // Mock Data
   const attendanceData = [
      { id: 1, name: 'Priya Sharma', days: 22, leaves: 0, lop: 0, payable: 22 },
      { id: 2, name: 'Arjun Mehta', days: 20, leaves: 0, lop: 2, payable: 20 },
      { id: 3, name: 'Rohan Desai', days: 21, leaves: 1, lop: 0, payable: 22 },
      { id: 4, name: 'Neha Kapoor', days: 18, leaves: 0, lop: 4, payable: 18 },
      { id: 5, name: 'Vikram Singh', days: 21, leaves: 0, lop: 1, payable: 21 },
   ];

   const filteredAdjustments = adjustments.filter(row =>
      row.name.toLowerCase().includes(adjustmentSearch.toLowerCase())
   );

   // Derived Summary
   const summary = {
      bonus: adjustments.reduce((s, i) => s + i.bonus, 0),
      reimb: adjustments.reduce((s, i) => s + i.reimbursement, 0),
      deduct: adjustments.reduce((s, i) => s + i.deduction, 0), // Focusing on editable deduction column for summary line
      arrears: adjustments.reduce((s, i) => s + i.arrears, 0),
      lopReversal: adjustments.reduce((s, i) => s + i.lopReversal, 0),
      tds: adjustments.reduce((s, i) => s + i.actualTds, 0),
   };
   const netImpact = summary.bonus + summary.reimb + summary.arrears + summary.lopReversal - summary.deduct - summary.tds;

   const formatLakh = (val: number) => {
      const abs = Math.abs(val);
      if (abs >= 100000) return `${(val / 100000).toFixed(2)} L`;
      if (abs >= 1000) return `${(val / 1000).toFixed(2)} K`;
      return val.toLocaleString('en-IN');
   }

   const previewEmployees = [
      { id: 1, name: 'Priya Sharma', role: 'Senior Engineer', gross: 154166, bonus: 0, reimb: 2500, deduction: 18500, status: 'OK' },
      { id: 2, name: 'Arjun Mehta', role: 'Sales Manager', gross: 200000, bonus: 15000, reimb: 5000, deduction: 24000, status: 'OK' },
      { id: 3, name: 'Neha Kapoor', role: 'Product Analyst', gross: 131666, bonus: 0, reimb: 0, deduction: 15800, status: 'Issue' },
      { id: 4, name: 'Rohan Desai', role: 'DevOps Engineer', gross: 176666, bonus: 0, reimb: 1200, deduction: 21200, status: 'OK' },
      { id: 5, name: 'Vikram Singh', role: 'Finance Assoc.', gross: 158333, bonus: 5000, reimb: 0, deduction: 19000, status: 'OK' },
   ];

   const renderStepContent = () => {
      switch (currentStep) {
         case 1: // PERIOD
            return (
               <div className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h3 className="text-sm font-bold text-slate-800 uppercase mb-4 flex items-center gap-2">
                        <Calendar size={16} className="text-sky-600" /> Payroll Period
                     </h3>
                     <div className="flex gap-4 items-center">
                        <div className="flex-1 relative">
                           <input type="date" disabled={readOnly} defaultValue="2025-11-01" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500 disabled:bg-slate-50" />
                           <span className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase">From</span>
                        </div>
                        <span className="text-slate-400 font-medium">to</span>
                        <div className="flex-1 relative">
                           <input type="date" disabled={readOnly} defaultValue="2025-11-30" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-500 disabled:bg-slate-50" />
                           <span className="absolute -top-2.5 left-3 bg-white px-1 text-[10px] font-bold text-slate-400 uppercase">To</span>
                        </div>
                        <div className="bg-slate-100 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600">22 Working Days</div>
                     </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
                     <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                           <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                              <Users size={16} className="text-sky-600" /> Select Employees
                           </h3>
                           <div className="flex gap-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded border border-emerald-100"><Check size={12} /> {eligibleCount} Eligible</span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded border border-amber-100"><AlertTriangle size={12} /> {onHoldCount} On Hold</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="relative flex-1">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                              <input
                                 type="text"
                                 value={empSearch}
                                 onChange={(e) => setEmpSearch(e.target.value)}
                                 placeholder="Search employees by name or ID..."
                                 className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                              />
                           </div>
                           {selectedEmpIds.length > 0 && !readOnly && (
                              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                                 <button onClick={() => bulkAction('Hold')} className="px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors flex items-center gap-1.5">
                                    <PauseCircle size={14} /> Mark On Hold ({selectedEmpIds.length})
                                 </button>
                                 <button onClick={() => bulkAction('Eligible')} className="px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5">
                                    <PlayCircle size={14} /> Mark Eligible ({selectedEmpIds.length})
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>

                     <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left text-sm border-collapse">
                           <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 sticky top-0 z-10 border-b border-slate-200">
                              <tr>
                                 <th className="px-4 py-3 w-12 text-center">
                                    <input
                                       type="checkbox"
                                       disabled={readOnly}
                                       checked={filteredEmployees.length > 0 && selectedEmpIds.length === filteredEmployees.length}
                                       onChange={toggleSelectAll}
                                       className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer disabled:opacity-50"
                                    />
                                 </th>
                                 <th className="px-4 py-3">Employee Details</th>
                                 <th className="px-4 py-3">Status</th>
                                 {!readOnly && <th className="px-4 py-3 text-right">Action</th>}
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {filteredEmployees.map(emp => (
                                 <tr key={emp.id} className={`hover:bg-slate-50 transition-colors group ${selectedEmpIds.includes(emp.id) ? 'bg-sky-50/30' : ''}`}>
                                    <td className="px-4 py-3 text-center">
                                       <input
                                          type="checkbox"
                                          disabled={readOnly}
                                          checked={selectedEmpIds.includes(emp.id)}
                                          onChange={() => toggleSelection(emp.id)}
                                          className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer disabled:opacity-50"
                                       />
                                    </td>
                                    <td className="px-4 py-3">
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden">
                                             <img src={emp.avatarUrl} alt="" className="w-full h-full object-cover" />
                                          </div>
                                          <div>
                                             <div className="font-semibold text-slate-800">{emp.name}</div>
                                             <div className="text-xs text-slate-500">{emp.department} • {emp.eid}</div>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-4 py-3">
                                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${emp.payrollStatus === 'Eligible' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                          {emp.payrollStatus === 'Eligible' ? <CheckCircle size={12} /> : <PauseCircle size={12} />}
                                          {emp.payrollStatus}
                                       </span>
                                    </td>
                                    {!readOnly && (
                                       <td className="px-4 py-3 text-right">
                                          <button
                                             onClick={() => toggleHold(emp.id)}
                                             className={`p-1.5 rounded-lg border transition-colors ${emp.payrollStatus === 'Eligible'
                                                ? 'bg-white border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200'
                                                : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                                                }`}
                                             title={emp.payrollStatus === 'Eligible' ? "Put On Hold" : "Mark as Eligible"}
                                          >
                                             {emp.payrollStatus === 'Eligible' ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                                          </button>
                                       </td>
                                    )}
                                 </tr>
                              ))}
                              {filteredEmployees.length === 0 && (
                                 <tr>
                                    <td colSpan={readOnly ? 3 : 4} className="px-6 py-12 text-center text-slate-400 italic">
                                       No employees found matching "{empSearch}"
                                    </td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            );

         case 2: // ATTENDANCE
            return (
               <div className="max-w-4xl mx-auto space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-bold text-slate-800">Attendance & Time Data</h3>
                     <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 text-xs font-bold">
                        <CheckCircle size={14} /> Synced with Biometrics
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                     <div className="flex gap-3 w-full sm:w-auto">
                        {!readOnly && (
                           <button
                              onClick={() => setShowAttendanceUpload(true)}
                              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                           >
                              <Upload size={16} /> Upload CSV
                           </button>
                        )}
                     </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                     <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                           <tr>
                              <th className="px-6 py-3">Employee Name</th>
                              <th className="px-4 py-3 text-center">Days Present</th>
                              <th className="px-4 py-3 text-center">Leaves</th>
                              <th className="px-4 py-3 text-center">LOP</th>
                              <th className="px-4 py-3 text-right">Payable Days</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {attendanceData.map((row) => (
                              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-6 py-3 font-medium text-slate-800">{row.name}</td>
                                 <td className="px-4 py-3 text-center text-slate-600">{row.days}</td>
                                 <td className="px-4 py-3 text-center text-slate-600">{row.leaves || '-'}</td>
                                 <td className="px-4 py-3 text-center text-rose-600 font-medium">{row.lop || '-'}</td>
                                 <td className="px-4 py-3 text-right font-bold text-slate-800">{row.payable}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            );

         case 3: // ADJUSTMENTS
            return (
               <div className="flex gap-6 h-full overflow-hidden">
                  {/* Left: Main Table */}
                  <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                     <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="relative flex-1 max-w-md">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                           <input
                              type="text"
                              placeholder="Search employee..."
                              value={adjustmentSearch}
                              onChange={(e) => setAdjustmentSearch(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                           />
                        </div>
                     </div>

                     <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                           <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                              <tr>
                                 <th className="px-4 py-3">Employee Name</th>
                                 <th className="px-2 py-3 text-right">Gross Salary</th>
                                 <th className="px-2 py-3 text-right">LOP Deduction</th>
                                 <th className="px-2 py-3 text-right text-emerald-600">LOP Reversal</th>
                                 <th className="px-2 py-3 text-right w-24">Bonus</th>
                                 <th className="px-2 py-3 text-right w-24">Reimb.</th>
                                 <th className="px-2 py-3 text-right w-24">Arrears</th>
                                 <th className="px-2 py-3 text-right w-24">Deduction</th>
                                 <th className="px-2 py-3 text-right w-24">Proposed TDS</th>
                                 <th className="px-2 py-3 text-right w-24">Actual TDS</th>
                                 <th className="px-4 py-3 text-right font-bold bg-slate-100">Final Gross</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {filteredAdjustments.length > 0 ? filteredAdjustments.map((row) => {
                                 const total = row.gross + row.bonus + row.arrears + (row.reimbursement || 0) - row.deduction - row.actualTds - row.lop + row.lopReversal + row.other;
                                 return (
                                    <tr key={row.id} className="hover:bg-slate-50 group">
                                       <td className="px-4 py-3 font-medium text-slate-800">{row.name}</td>
                                       <td className="px-2 py-3 text-right text-slate-500">₹{row.gross.toLocaleString()}</td>
                                       <td className="px-2 py-3 text-right text-rose-600 font-medium">
                                          {row.lop > 0 ? `- ₹${row.lop.toLocaleString()}` : '-'}
                                       </td>
                                       <td className="px-2 py-3 text-right">
                                          <input
                                             type="number"
                                             readOnly={readOnly}
                                             value={row.lopReversal || ''}
                                             onChange={(e) => handleAdjustmentChange(row.id, 'lopReversal', e.target.value)}
                                             className="w-full text-right p-1 border border-slate-200 rounded text-emerald-600 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none bg-transparent placeholder:text-slate-300 disabled:border-transparent disabled:bg-transparent"
                                             placeholder="-"
                                          />
                                       </td>
                                       <td className="px-2 py-3 text-right">
                                          <input
                                             type="number"
                                             readOnly={readOnly}
                                             value={row.bonus || ''}
                                             onChange={(e) => handleAdjustmentChange(row.id, 'bonus', e.target.value)}
                                             className="w-full text-right p-1 border border-slate-200 rounded text-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none bg-transparent disabled:border-transparent" placeholder="-"
                                          />
                                       </td>
                                       <td className="px-2 py-3 text-right">
                                          <input
                                             type="number"
                                             readOnly={readOnly}
                                             value={row.reimbursement || ''}
                                             onChange={(e) => handleAdjustmentChange(row.id, 'reimbursement', e.target.value)}
                                             className="w-full text-right p-1 border border-slate-200 rounded text-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none bg-transparent disabled:border-transparent" placeholder="-"
                                          />
                                       </td>
                                       <td className="px-2 py-3 text-right">
                                          <input
                                             type="number"
                                             readOnly={readOnly}
                                             value={row.arrears || ''}
                                             onChange={(e) => handleAdjustmentChange(row.id, 'arrears', e.target.value)}
                                             className="w-full text-right p-1 border border-slate-200 rounded text-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none bg-transparent disabled:border-transparent" placeholder="-"
                                          />
                                       </td>
                                       <td className="px-2 py-3 text-right">
                                          <input
                                             type="number"
                                             readOnly={readOnly}
                                             value={row.deduction || ''}
                                             onChange={(e) => handleAdjustmentChange(row.id, 'deduction', e.target.value)}
                                             className="w-full text-right p-1 border border-slate-200 rounded text-rose-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none bg-transparent disabled:border-transparent" placeholder="-"
                                          />
                                       </td>
                                       <td className="px-2 py-3 text-right text-slate-500">
                                          {row.proposedTds}
                                       </td>
                                       <td className="px-2 py-3 text-right">
                                          <input
                                             type="number"
                                             readOnly={readOnly}
                                             value={row.actualTds || ''}
                                             onChange={(e) => handleAdjustmentChange(row.id, 'actualTds', e.target.value)}
                                             className="w-full text-right p-1 border border-slate-200 rounded text-rose-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none bg-transparent disabled:border-transparent" placeholder="-"
                                          />
                                       </td>
                                       <td className="px-4 py-3 text-right font-bold text-slate-800 bg-slate-50 group-hover:bg-slate-100">
                                          ₹{total.toLocaleString()}
                                       </td>
                                    </tr>
                                 );
                              }) : (
                                 <tr>
                                    <td colSpan={11} className="px-4 py-8 text-center text-slate-400">No employees found.</td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* Right: Summary Panel */}
                  <div className="w-80 flex flex-col gap-4">

                     <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 sticky top-0">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Adjustment Summary</h3>

                        <div className="space-y-3">
                           <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Total Bonus</span>
                              <span className="font-medium text-emerald-600">+ ₹ {formatLakh(summary.bonus)}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Reimbursements</span>
                              <span className="font-medium text-emerald-600">+ ₹ {formatLakh(summary.reimb)}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Total LOP Reversal</span>
                              <span className="font-medium text-emerald-600">+ ₹ {formatLakh(summary.lopReversal)}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Total Deductions</span>
                              <span className="font-medium text-rose-600">- ₹ {formatLakh(summary.deduct)}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Total TDS Deductions</span>
                              <span className="font-medium text-rose-600">- ₹ {formatLakh(summary.tds)}</span>
                           </div>
                           <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-800">
                              <span>Net Impact</span>
                              <span>{netImpact >= 0 ? '+' : '-'} ₹ {formatLakh(netImpact)}</span>
                           </div>
                        </div>

                        {!readOnly && (
                           <div className="pt-4 space-y-2">
                              <button
                                 onClick={() => setShowLopModal(true)}
                                 className="w-full py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                              >
                                 <MinusCircle size={14} /> Recover LOP
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            );

         case 4: // REVIEW
            return (
               <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Gross</p>
                        <p className="text-xl font-bold text-slate-800">₹ 82.08 L</p>
                     </div>
                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Deductions</p>
                        <p className="text-xl font-bold text-rose-600">₹ 9.85 L</p>
                     </div>
                     <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50 shadow-sm">
                        <p className="text-xs font-bold text-emerald-700 uppercase mb-1">Net Payout</p>
                        <p className="text-xl font-bold text-emerald-800">₹ 72.23 L</p>
                     </div>
                     <div
                        onClick={() => setIsAlertsOpen(true)}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer hover:border-amber-300 hover:shadow-md transition-all group"
                     >
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100 transition-colors"><AlertCircle size={20} /></div>
                        <div>
                           <p className="text-xs font-bold text-slate-400 uppercase group-hover:text-amber-600 transition-colors">Alerts</p>
                           <p className="text-sm font-bold text-amber-600">3 Issues</p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                     <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><FileText size={16} /> Final Register Preview</h3>
                        <div className="flex gap-2">
                           <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded hover:bg-slate-50 flex items-center gap-2 transition-colors">
                              <Download size={14} /> Export
                           </button>
                        </div>
                     </div>
                     <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                           <tr>
                              <th className="px-6 py-3 w-1/4">Employee</th>
                              <th className="px-4 py-3 text-right">Gross</th>
                              <th className="px-4 py-3 text-right">Bonus</th>
                              <th className="px-4 py-3 text-right">Deductions</th>
                              <th className="px-4 py-3 text-right">Net Pay</th>
                              <th className="px-4 py-3 text-center">Status</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {previewEmployees.map((emp) => (
                              <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-6 py-3">
                                    <div className="flex flex-col">
                                       <span className="font-bold text-slate-800">{emp.name}</span>
                                       <span className="text-xs text-slate-500">{emp.role}</span>
                                    </div>
                                 </td>
                                 <td className="px-4 py-3 text-right">₹ {emp.gross.toLocaleString()}</td>
                                 <td className="px-4 py-3 text-right text-emerald-600">{emp.bonus > 0 ? `+${emp.bonus}` : '-'}</td>
                                 <td className="px-4 py-3 text-right text-rose-600">- {emp.deduction.toLocaleString()}</td>
                                 <td className="px-4 py-3 text-right font-bold text-slate-800">
                                    ₹ {(emp.gross + emp.bonus + emp.reimb - emp.deduction).toLocaleString()}
                                 </td>
                                 <td className="px-4 py-3 text-center">
                                    {emp.status === 'OK' ? <CheckCircle size={16} className="text-emerald-500 mx-auto" /> : <AlertTriangle size={16} className="text-rose-500 mx-auto" />}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            );

         case 5: // FINALIZE
            return (
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-bold text-slate-800">Final Approval & Lock</h3>
                     <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">Draft Mode</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                     <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Total Gross</p>
                        <p className="text-3xl font-bold text-slate-800">₹ 18.42 Cr</p>
                     </div>
                     <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Deductions</p>
                        <p className="text-3xl font-bold text-rose-600">₹ 3.74 Cr</p>
                     </div>
                     <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-xl border border-emerald-100 shadow-sm">
                        <p className="text-xs font-bold text-emerald-700 uppercase mb-2">Net Payable</p>
                        <p className="text-3xl font-bold text-emerald-800">₹ 14.68 Cr</p>
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <UserCheck size={16} className="text-indigo-500" /> Approval Workflow
                     </h4>
                     <div className="flex items-center gap-4">
                        <div className="flex-1 flex items-center gap-4 p-4 border border-emerald-200 bg-emerald-50 rounded-xl shadow-sm">
                           <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold">KS</div>
                           <div>
                              <p className="text-sm font-bold text-slate-800">Kavita Sharma (HR)</p>
                              <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle size={10} /> Approved</p>
                           </div>
                        </div>
                        <ChevronRight className="text-slate-300" />
                        <div className="flex-1 flex items-center gap-4 p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                           <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">RK</div>
                           <div>
                              <p className="text-sm font-bold text-slate-800">Rajesh Kumar (Finance)</p>
                              <p className="text-xs text-amber-600 flex items-center gap-1"><Clock size={10} /> Pending</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
                     <div className="p-3 bg-amber-100 text-amber-600 rounded-full"><Lock size={24} /></div>
                     <div className="flex-1">
                        <h4 className="text-sm font-bold text-amber-900">Confirm & Lock</h4>
                        <p className="text-xs text-amber-800 mt-1">Once locked, payroll cannot be edited. Payslips and bank files will be generated.</p>
                     </div>
                     <label className="flex items-center gap-2 cursor-pointer group" title="Check this box to enable locking">
                        <input
                           type="checkbox"
                           checked={isConfirmed}
                           onChange={e => setIsConfirmed(e.target.checked)}
                           disabled={readOnly}
                           className="rounded text-indigo-600 focus:ring-indigo-500 w-5 h-5 cursor-pointer disabled:opacity-50"
                        />
                        <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">I confirm accuracy</span>
                     </label>
                  </div>
               </div>
            );

         case 6: // DISBURSE
            return (
               <div className="space-y-6">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500"></div>
                     <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                        <Award size={32} className="text-emerald-500" />
                     </div>
                     <h2 className="text-2xl font-bold text-emerald-900">November 2025 Payroll Successfully Locked!</h2>
                     <p className="text-emerald-700 mt-1">All calculations are finalized. You can now proceed with disbursement.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                           <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FileText size={20} /></div>
                           {payslipsGenerated && <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100 flex items-center gap-1"><Check size={10} /> Done</span>}
                        </div>
                        <h3 className="font-bold text-slate-800">1. Generate Payslips</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-4">Create PDF payslips for all 1,842 employees.</p>

                        <div className="mt-auto">
                           {!payslipsGenerated ? (
                              !isGenerating ? (
                                 <button onClick={handleGeneratePayslips} disabled={readOnly} className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    Generate Payslips
                                 </button>
                              ) : (
                                 <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium text-slate-600">
                                       <span>Generating PDFs...</span>
                                       <span>{generationProgress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                       <div className="bg-purple-600 h-full transition-all duration-200" style={{ width: `${generationProgress}%` }}></div>
                                    </div>
                                 </div>
                              )
                           ) : (
                              <button disabled className="w-full py-2 bg-slate-50 text-slate-400 border border-slate-200 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2">
                                 <CheckCircle size={16} /> Payslips Ready
                              </button>
                           )}
                        </div>
                     </div>

                     <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                           <div className="p-2 bg-sky-50 text-sky-600 rounded-lg"><Mail size={20} /></div>
                           {emailsSent && <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100 flex items-center gap-1"><Check size={10} /> Sent</span>}
                        </div>
                        <h3 className="font-bold text-slate-800">2. Distribute Payslips</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-4">Payslip will be uploaded to Employees account in People module.</p>

                        <button
                           onClick={() => setEmailsSent(true)}
                           disabled={!payslipsGenerated || emailsSent || readOnly}
                           className={`w-full py-2 rounded-lg text-sm font-medium transition-colors mt-auto ${(!payslipsGenerated || readOnly) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : emailsSent ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-sky-600 text-white hover:bg-sky-700'}`}
                        >
                           {emailsSent ? 'Notifications Sent' : 'Send Now'}
                        </button>
                     </div>

                     <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                           <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Download size={20} /></div>
                        </div>
                        <h3 className="font-bold text-slate-800">3. Bank Disbursal</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-4">Download formatted file for HDFC/ICICI upload.</p>
                        <button disabled={readOnly} className="mt-auto w-full py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                           <Download size={16} /> Download File
                        </button>
                     </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-4">
                     <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Recent Activity</h4>
                     <div className="flex gap-4 text-sm">
                        <p className="text-slate-600"><span className="font-bold text-slate-800">Kavita Sharma</span> locked payroll at 3:42 PM.</p>
                        <p className="text-slate-600"><span className="font-bold text-slate-800">Rajesh Kumar</span> approved at 3:38 PM.</p>
                     </div>
                  </div>
               </div>
            );

         default: return <div>Step not found</div>;
      }
   };

   const getStepButtonLabel = () => {
      switch (currentStep) {
         case 1: return 'Next: Attendance';
         case 2: return 'Next: Adjustments';
         case 3: return 'Next: Review';
         case 4: return 'Next: Finalize';
         default: return 'Next Step';
      }
   };

   const ModalContainer = isPage ? React.Fragment : 'div';
   const containerProps = isPage ? {} : { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200" };

   const innerContent = (
      <>
         {/* Header */}
         <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                  <CreditCard size={20} />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-slate-800">Run Payroll {readOnly && <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded ml-2">Read Only</span>}</h2>
                  <p className="text-xs text-slate-500">For {company.name} • Nov 2025</p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
               <X size={20} />
            </button>
         </div>

         {/* Stepper */}
         <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 shrink-0">
            <div className="flex items-center justify-between max-w-4xl mx-auto relative">
               <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
               {[
                  { id: 1, label: 'Period' },
                  { id: 2, label: 'Attendance' },
                  { id: 3, label: 'Adjustments' },
                  { id: 4, label: 'Review' },
                  { id: 5, label: 'Finalize' },
                  { id: 6, label: 'Disburse' }
               ].map((step) => {
                  const isActive = step.id === currentStep;
                  const isCompleted = step.id < currentStep;
                  return (
                     <button
                        key={step.id}
                        onClick={() => setCurrentStep(step.id)}
                        disabled={step.id > currentStep && !readOnly} // Allow jumping if readOnly or visited
                        className="flex flex-col items-center gap-2 group focus:outline-none disabled:opacity-60"
                     >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ring-4 ring-white transition-all ${isActive ? 'bg-sky-600 text-white ring-sky-100 scale-110' :
                           isCompleted ? 'bg-emerald-500 text-white' :
                              'bg-white border-2 border-slate-300 text-slate-400 group-hover:border-sky-300'
                           }`}>
                           {isCompleted ? <Check size={16} /> : step.id}
                        </div>
                        <span className={`text-xs font-bold transition-colors ${isActive ? 'text-sky-700' : 'text-slate-500'}`}>{step.label}</span>
                     </button>
                  );
               })}
            </div>
         </div>

         {/* Content */}
         <div className="flex-1 p-8 overflow-y-auto bg-slate-50/30">
            {renderStepContent()}
         </div>

         {/* Footer */}
         <div className="bg-white border-t border-slate-200 px-8 py-4 flex justify-between items-center shrink-0">
            {currentStep > 1 && currentStep < 6 ? (
               <button onClick={handleBack} className="px-6 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
                  <ChevronLeft size={16} /> Back
               </button>
            ) : currentStep === 6 && !readOnly ? (
               <div />
            ) : (
               <button onClick={onClose} className="px-6 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors">
                  {readOnly ? 'Close' : 'Cancel'}
               </button>
            )}

            {currentStep === 5 ? (
               <button
                  onClick={handleNext}
                  disabled={(!isConfirmed && !readOnly) || readOnly} // Disable if readOnly or not confirmed
                  className="px-8 py-2.5 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 shadow-md shadow-purple-200 flex items-center gap-2 transition-all transform hover:translate-x-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
               >
                  <Lock size={16} /> {readOnly ? 'Locked' : 'Approve & Lock Payroll'}
               </button>
            ) : currentStep === 6 ? (
               <button onClick={onClose} className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-200 flex items-center gap-2 transition-all transform hover:translate-x-1">
                  Finish <CheckCircle size={16} />
               </button>
            ) : (
               <button onClick={handleNext} className="px-8 py-2.5 bg-sky-600 text-white rounded-lg font-bold text-sm hover:bg-sky-700 shadow-md shadow-sky-200 flex items-center gap-2 transition-all transform hover:translate-x-1">
                  {getStepButtonLabel()} <ArrowRight size={16} />
               </button>
            )}
         </div>

         {/* Alerts Modal */}
         <PayrollAlertsModal isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />

         {/* Attendance Upload Modal */}
         <AttendanceImportModal
            isOpen={showAttendanceUpload}
            onClose={() => setShowAttendanceUpload(false)}
         />

         {/* Add Performance Bonus Modal */}
         {showBonusModal && !readOnly && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-purple-50/50">
                     <h3 className="font-bold text-purple-900 text-sm">Add Performance Bonus</h3>
                     <button onClick={() => setShowBonusModal(false)}><X size={18} className="text-slate-400 hover:text-slate-600" /></button>
                  </div>
                  <div className="p-6 space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Select Employee</label>
                        <select
                           value={selectedBonusEmp}
                           onChange={(e) => setSelectedBonusEmp(e.target.value)}
                           className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                        >
                           <option value="">Select...</option>
                           {adjustments.map(adj => (
                              <option key={adj.id} value={adj.id}>{adj.name}</option>
                           ))}
                        </select>
                     </div>
                     {/* ... rest of bonus modal fields ... */}
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Amount</label>
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                           <input
                              type="number"
                              value={bonusAmount}
                              onChange={(e) => setBonusAmount(e.target.value)}
                              className="w-full pl-6 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                              placeholder="0.00"
                           />
                        </div>
                     </div>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                     <button onClick={() => setShowBonusModal(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                     <button
                        onClick={handleAddBonus}
                        disabled={!selectedBonusEmp || !bonusAmount}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 shadow-sm"
                     >
                        Add Bonus
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Recover LOP Modal */}
         {showLopModal && !readOnly && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-amber-50/50">
                     <h3 className="font-bold text-amber-900 text-sm">Recover Loss of Pay</h3>
                     <button onClick={() => setShowLopModal(false)}><X size={18} className="text-slate-400 hover:text-slate-600" /></button>
                  </div>

                  <div className="p-6 flex-1 overflow-y-auto">
                     {/* Add Employee Section */}
                     <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Add Employee for Reversal</label>
                        <div className="flex gap-2">
                           <div className="flex-1">
                              <select
                                 value={selectedLopEmp}
                                 onChange={(e) => setSelectedLopEmp(e.target.value)}
                                 className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                              >
                                 <option value="">Select Employee...</option>
                                 {adjustments.map(adj => (
                                    <option key={adj.id} value={adj.id}>{adj.name}</option>
                                 ))}
                              </select>
                           </div>
                           <button
                              onClick={handleAddLopEmployee}
                              disabled={!selectedLopEmp}
                              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-white hover:text-amber-600 hover:border-amber-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              <Plus size={16} /> Add
                           </button>
                        </div>
                     </div>

                     {/* List Section */}
                     {lopReversalList.length > 0 ? (
                        <div className="space-y-3">
                           <div className="flex text-xs font-bold text-slate-400 px-2 uppercase tracking-wide">
                              <span className="flex-1">Employee</span>
                              <span className="w-20 text-center">Days</span>
                              <span className="w-24 text-right">Amount</span>
                              <span className="w-8"></span>
                           </div>
                           {lopReversalList.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg bg-white shadow-sm group hover:border-amber-200 transition-colors">
                                 <div className="flex-1 font-medium text-sm text-slate-700">{item.name}</div>
                                 <div className="w-20">
                                    <input
                                       type="number"
                                       value={item.days}
                                       onChange={(e) => updateLopDays(item.id, e.target.value)}
                                       className="w-full px-2 py-1 border border-slate-200 rounded text-center text-sm focus:outline-none focus:border-amber-500"
                                    />
                                 </div>
                                 <div className="w-24 text-right font-bold text-emerald-600 text-sm">
                                    ₹{item.amount.toLocaleString()}
                                 </div>
                                 <button
                                    onClick={() => removeLopEmployee(item.id)}
                                    className="w-8 flex justify-end text-slate-300 hover:text-rose-500 transition-colors"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           ))}
                           <div className="flex justify-between items-center px-3 pt-2 border-t border-dashed border-slate-200 font-bold text-sm text-slate-700">
                              <span>Total Reversal</span>
                              <span>₹{lopReversalList.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</span>
                           </div>
                        </div>
                     ) : (
                        <div className="text-center py-8 text-slate-400 text-sm">
                           No employees selected for reversal yet.
                        </div>
                     )}
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                     <button onClick={() => setShowLopModal(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                     <button
                        onClick={handleApplyReversal}
                        disabled={lopReversalList.length === 0}
                        className="px-6 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 disabled:opacity-50 shadow-sm"
                     >
                        Apply Reversal
                     </button>
                  </div>
               </div>
            </div>
         )}
      </>
   );

   return (
      <ModalContainer {...containerProps}>
         {isPage ? (
            <div className="flex flex-col h-full bg-slate-50">
               {innerContent}
            </div>
         ) : (
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]">
               {innerContent}
            </div>
         )}
      </ModalContainer>
   );
};

export const ExportEmployeesModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
   if (!isOpen) return null;
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
         <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="font-bold text-slate-800">Export Employee Data</h3>
               <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Format</label>
                  <div className="grid grid-cols-2 gap-3">
                     <label className="flex items-center justify-center gap-2 p-3 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-lg cursor-pointer font-medium">
                        <input type="radio" name="format" defaultChecked className="hidden" />
                        <FileSpreadsheet size={18} /> Excel (.xlsx)
                     </label>
                     <label className="flex items-center justify-center gap-2 p-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg cursor-pointer font-medium transition-colors">
                        <input type="radio" name="format" className="hidden" />
                        <FileText size={18} /> CSV
                     </label>
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Data Range</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
                     <option>All Active Employees</option>
                     <option>All Employees (Including Ex-employees)</option>
                     <option>New Joinees (This Month)</option>
                  </select>
               </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
               <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-white rounded-lg text-sm font-medium transition-colors">Cancel</button>
               <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 text-sm font-medium transition-colors flex items-center gap-2">
                  <Download size={16} /> Export
               </button>
            </div>
         </div>
      </div>
   );
};

export const ExportAllDataModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
   if (!isOpen) return null;
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
         <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="font-bold text-slate-800">Export All Company Data</h3>
               <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
            </div>
            <div className="p-6 space-y-4">
               <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-3">
                  <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                  <div>
                     <p className="text-sm font-bold text-amber-800">Confidential Data</p>
                     <p className="text-xs text-amber-700 mt-1">This export contains sensitive PII and financial data. Please ensure it is handled securely.</p>
                  </div>
               </div>
               <div>
                  <label className="flex items-center gap-2 cursor-pointer mb-4">
                     <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
                     <span className="text-sm text-slate-700 font-medium">Password Protect File (Recommended)</span>
                  </label>
                  <div className="space-y-2">
                     <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                        <span className="text-sm text-slate-700">Employee Master Data</span>
                     </label>
                     <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                        <span className="text-sm text-slate-700">Payroll History (Current FY)</span>
                     </label>
                     <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                        <span className="text-sm text-slate-700">Compliance Documents</span>
                     </label>
                  </div>
               </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
               <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-white rounded-lg text-sm font-medium transition-colors">Cancel</button>
               <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 text-sm font-medium transition-colors flex items-center gap-2">
                  <ShieldCheck size={16} /> Secure Export
               </button>
            </div>
         </div>
      </div>
   );
};

// --- Attendance Import Modal (Multi-step CSV Upload) ---
const AttendanceImportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
   const [step, setStep] = useState(1);

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
               <h3 className="font-bold text-slate-800 text-lg">Import Employees Attendance</h3>
               <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                  <X size={20} />
               </button>
            </div>

            {/* Stepper */}
            <div className="px-12 py-8 bg-white border-b border-slate-50">
               <div className="flex items-center justify-between max-w-2xl mx-auto relative">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10 -translate-y-1/2"></div>
                  {[
                     { id: 1, label: 'Prepare' },
                     { id: 2, label: 'Upload' },
                     { id: 3, label: 'Results' }
                  ].map((s) => (
                     <div key={s.id} className="flex flex-col items-center gap-2 relative bg-white px-4">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white ${step === s.id ? 'bg-indigo-600 text-white ring-indigo-50' :
                           step > s.id ? 'bg-indigo-100 text-indigo-600' :
                              'bg-white border-2 border-slate-200 text-slate-300'
                           }`}>
                           {step > s.id ? <Check size={12} /> : s.id}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${step === s.id ? 'text-indigo-600' : 'text-slate-400'}`}>{s.label}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Content (Prepare Step) */}
            <div className="flex-1 overflow-y-auto p-8 flex gap-12">
               {/* Left side */}
               <div className="flex-1 space-y-8">
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center text-center">
                     <p className="text-sm text-slate-600 mb-6">
                        Download a <button className="text-indigo-600 font-bold hover:underline">Sample File</button>.
                     </p>

                     <button className="w-full max-w-md py-3 px-6 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 mb-4">
                        Upload Excel File
                     </button>
                  </div>
               </div>

               {/* Right side - Instructions */}
               <div className="w-80 border-l border-slate-100 pl-8 space-y-6">
                  <h4 className="font-bold text-slate-800">Instructions:</h4>
                  <ul className="space-y-4">
                     {[
                        "Do not change the column names provided in the sample Excel template.",
                        "Columns indicated in red color are mandatory fields.",
                        "Ensure to follow correct data types for each column.",
                        "Once the import is complete, verify that the data has been accurately imported. Cross-check a few records to ensure consistency."
                     ].map((text, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-500 leading-relaxed">
                           <span className="text-slate-300 transform translate-y-2">•</span>
                           <span>{text}</span>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
               <button onClick={onClose} className="px-10 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                  Cancel
               </button>
               <button
                  onClick={() => step < 3 && setStep(s => s + 1)}
                  className="px-10 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all"
               >
                  {step === 3 ? 'Finish' : 'Next'}
               </button>
            </div>
         </div>
      </div>
   );
};
