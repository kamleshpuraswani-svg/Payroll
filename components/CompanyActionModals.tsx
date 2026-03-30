
import React, { useState, useEffect, useRef } from 'react';
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
   ChevronDown,
   Lock,
   Info,
   AlertCircle,
   Printer,
   CheckCircle,
   Edit,
   Settings,
   Clock,
   Undo,
   Hourglass,
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
                     <p className="text-2xl font-bold text-emerald-900">{company.last_payroll_run}</p>
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

// --- MultiSelect Component ---
const MultiSelect: React.FC<{
    label: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    disabled?: boolean;
}> = ({ label, options, selected, onChange, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (opt: string) => {
        if (selected.includes(opt)) {
            onChange(selected.filter(i => i !== opt));
        } else {
            onChange([...selected, opt]);
        }
    };

    return (
        <div className="flex-1 min-w-[200px]" ref={containerRef}>
            <div className="relative">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm flex justify-between items-center transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${disabled ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-slate-200 hover:border-sky-300'}`}
                >
                    <span className={`truncate pr-4 ${selected.length > 0 ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                        {selected.length > 0 ? selected.join(', ') : label}
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && !disabled && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <div className="max-h-60 overflow-y-auto p-1 text-sm">
                            {options.map(opt => (
                                <div
                                    key={opt}
                                    onClick={() => toggleOption(opt)}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${selected.includes(opt) ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${selected.includes(opt) ? 'bg-sky-600 border-sky-600' : 'bg-white border-slate-300'}`}>
                                        {selected.includes(opt) && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className="truncate">{opt}</span>
                                </div>
                            ))}
                            {options.length === 0 && (
                                <div className="p-3 text-center text-slate-400 text-xs">No options available</div>
                            )}
                        </div>
                    </div>
                )}
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
   const [payrollEmployees, setPayrollEmployees] = useState(() => {
      const bus = ["Mindinventory", "300 Minds", "CollabCRM", "Dots & Boxes"];
      const designations: Record<string, string> = {
         'Software Engineering': 'Senior Engineer',
         'Sales': 'Account Executive',
         'Product': 'Product Manager',
         'DevOps': 'Systems Engineer',
         'QA': 'QA Lead',
         'Finance': 'Finance Associate',
         'Design': 'Senior Designer',
         'Marketing': 'Marketing Specialist'
      };
      return MOCK_EMPLOYEES.map((e, i) => ({ 
         ...e, 
         business_unit: bus[i % bus.length],
         designation: designations[e.department] || 'Specialist',
         payrollStatus: 'Eligible' as 'Eligible' | 'On Hold' 
      }));
   });
   const [empSearch, setEmpSearch] = useState('');
   const [selectedBUs, setSelectedBUs] = useState<string[]>([]);
   const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);

   // Step 6 States
   const [isGenerating, setIsGenerating] = useState(false);
   const [generationProgress, setGenerationProgress] = useState(0);
   const [payslipsGenerated, setPayslipsGenerated] = useState(false);
   const [emailsSent, setEmailsSent] = useState(false);

   // Step 3 State & Modals
   const [adjustmentSearch, setAdjustmentSearch] = useState('');
   const [adjustments, setAdjustments] = useState([
      { id: 1, name: 'Priya Sharma', gross: 154166, bonus: 0, arrears: 0, loanRecovery: 0, salaryAdvanceRecovery: 0, expenseReimbursement: 0, lop: 0, lopReversal: 0, other: 0, proposedTds: 12500, actualTds: 12500, isEditing: false },
      { id: 2, name: 'Arjun Mehta', gross: 180000, bonus: 25000, arrears: 0, loanRecovery: 5000, salaryAdvanceRecovery: 0, expenseReimbursement: 8400, lop: 0, lopReversal: 0, other: 0, proposedTds: 18000, actualTds: 18000, isEditing: false },
      { id: 3, name: 'Neha Kapoor', gross: 131666, bonus: 0, arrears: 5000, loanRecovery: 0, salaryAdvanceRecovery: 0, expenseReimbursement: 0, lop: 4500, lopReversal: 0, other: 0, proposedTds: 8500, actualTds: 8500, isEditing: false },
      { id: 4, name: 'Rohan Desai', gross: 176666, bonus: 0, arrears: 0, loanRecovery: 2000, salaryAdvanceRecovery: 1000, expenseReimbursement: 0, lop: 0, lopReversal: 0, other: 1000, proposedTds: 16200, actualTds: 16200, isEditing: false },
      { id: 5, name: 'Vikram Singh', gross: 158333, bonus: 5000, arrears: 0, loanRecovery: 0, salaryAdvanceRecovery: 0, expenseReimbursement: 0, lop: 0, lopReversal: 0, other: 0, proposedTds: 14000, actualTds: 14000, isEditing: false },
      { id: 6, name: 'Ananya Patel', gross: 147500, bonus: 0, arrears: 0, loanRecovery: 1000, salaryAdvanceRecovery: 500, expenseReimbursement: 0, lop: 0, lopReversal: 0, other: 0, proposedTds: 11000, actualTds: 11000, isEditing: false },
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

   // Row-level LOP Reversal State
   const [showRowLopModal, setShowRowLopModal] = useState(false);
   const [rowLopTargetId, setRowLopTargetId] = useState<number | null>(null);
   const [rowLopDays, setRowLopDays] = useState('0');

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

   const handleRowLopClick = (id: number) => {
      setRowLopTargetId(id);
      setRowLopDays('1'); // Default to 1 day
      setShowRowLopModal(true);
   };

   const confirmRowLopReversal = () => {
      if (rowLopTargetId !== null) {
         const emp = adjustments.find(e => e.id === rowLopTargetId);
         if (emp) {
            const daysNum = parseFloat(rowLopDays) || 0;
            const amount = Math.round((emp.gross / 30) * daysNum);
            setAdjustments(prev => prev.map(row => 
               row.id === rowLopTargetId ? { ...row, lopReversal: row.lopReversal + amount } : row
            ));
         }
         setShowRowLopModal(false);
         setRowLopTargetId(null);
         setRowLopDays('0');
      }
   };

   const toggleEdit = (id: number) => {
      setAdjustments(prev => prev.map(row => row.id === id ? { ...row, isEditing: !row.isEditing } : row));
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
   const filteredEmployees = payrollEmployees.filter(e => {
      const matchesSearch = `${e.first_name} ${e.last_name}`.toLowerCase().includes(empSearch.toLowerCase()) ||
         e.employee_id.toLowerCase().includes(empSearch.toLowerCase());
      const matchesBU = selectedBUs.length > 0 ? selectedBUs.includes(e.business_unit || 'CollabCRM') : true;
      return matchesSearch && matchesBU;
   });

   const availableBUs = ["Mindinventory", "300 Minds", "CollabCRM", "Dots & Boxes"];

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
      { id: 1, name: 'Priya Sharma', days: 22, leaves: 0, lop: 0, pendingLeaves: 0 },
      { id: 2, name: 'Arjun Mehta', days: 20, leaves: 0, lop: 2, pendingLeaves: 1 },
      { id: 3, name: 'Rohan Desai', days: 21, leaves: 1, lop: 0, pendingLeaves: 0 },
      { id: 4, name: 'Neha Kapoor', days: 18, leaves: 0, lop: 4, pendingLeaves: 1 },
      { id: 5, name: 'Vikram Singh', days: 21, leaves: 0, lop: 1, pendingLeaves: 0 },
      { id: 6, name: 'Ananya Iyer', days: 22, leaves: 0, lop: 0, pendingLeaves: 0 },
      { id: 7, name: 'Rahul Verma', days: 19, leaves: 2, lop: 1, pendingLeaves: 1 },
      { id: 8, name: 'Sanya Malhotra', days: 22, leaves: 0, lop: 0, pendingLeaves: 0 },
      { id: 9, name: 'Amit Shah', days: 20, leaves: 1, lop: 1, pendingLeaves: 0 },
      { id: 10, name: 'Kavita Reddy', days: 21, leaves: 0, lop: 1, pendingLeaves: 1 },
   ];

   const handleExport = () => {
      const headers = ["Employee Name", "Working Days", "Present Days", "Leave Days", "LOP Days", "Payable Days"];
      const data = attendanceData.map(row => [
         row.name,
         22,
         row.days,
         row.leaves || 0,
         row.lop || 0,
         row.days + (row.leaves || 0)
      ]);
      const csvContent = [headers, ...data].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `attendance_data_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   const filteredAdjustments = adjustments.filter(row =>
      row.name.toLowerCase().includes(adjustmentSearch.toLowerCase())
   );

   // Derived Summary
   const summary = {
      bonus: adjustments.reduce((s, i) => s + i.bonus, 0),
      expenseReimb: adjustments.reduce((s, i) => s + i.expenseReimbursement, 0),
      loanRecovery: adjustments.reduce((s, i) => s + i.loanRecovery, 0),
      salaryAdvance: adjustments.reduce((s, i) => s + i.salaryAdvanceRecovery, 0),
      arrears: adjustments.reduce((s, i) => s + i.arrears, 0),
      lopReversal: adjustments.reduce((s, i) => s + i.lopReversal, 0),
      tds: adjustments.reduce((s, i) => s + i.actualTds, 0),
   };
   const netImpact = summary.bonus + summary.expenseReimb + summary.arrears + summary.lopReversal - summary.loanRecovery - summary.salaryAdvance - summary.tds;

   const formatLakh = (val: number) => {
      const abs = Math.abs(val);
      if (abs >= 100000) return `${(val / 100000).toFixed(2)} L`;
      if (abs >= 1000) return `${(val / 1000).toFixed(2)} K`;
      return val.toLocaleString('en-IN');
   }

   const previewEmployees = [
      { id: 1, name: 'Priya Sharma', role: 'Senior Engineer', gross: 154166, lopReversal: 10278, bonus: 0, expenseReimbursement: 0, arrears: 0, loanRecovery: 0, salaryAdvanceRecovery: 0, proposedTds: 12500, actualTds: 12500 },
      { id: 2, name: 'Arjun Mehta', role: 'Sales Manager', gross: 200000, lopReversal: 0, bonus: 25000, expenseReimbursement: 8400, arrears: 0, loanRecovery: 5000, salaryAdvanceRecovery: 0, proposedTds: 18000, actualTds: 18000 },
      { id: 3, name: 'Neha Kapoor', role: 'Product Analyst', gross: 131666, lopReversal: 0, bonus: 0, expenseReimbursement: 0, arrears: 5000, loanRecovery: 0, salaryAdvanceRecovery: 0, proposedTds: 8500, actualTds: 8500 },
      { id: 4, name: 'Rohan Desai', role: 'DevOps Engineer', gross: 176666, lopReversal: 0, bonus: 0, expenseReimbursement: 0, arrears: 0, loanRecovery: 2000, salaryAdvanceRecovery: 1000, proposedTds: 16200, actualTds: 16200 },
      { id: 5, name: 'Vikram Singh', role: 'Finance Assoc.', gross: 158333, lopReversal: 0, bonus: 5000, expenseReimbursement: 0, arrears: 0, loanRecovery: 0, salaryAdvanceRecovery: 0, proposedTds: 14000, actualTds: 14000 },
   ];

   const renderStepContent = () => {
      switch (currentStep) {
         case 1: // PERIOD
            return (
               <div className="w-full space-y-6">
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
                           <MultiSelect
                              label="All Business Units"
                              options={availableBUs}
                              selected={selectedBUs}
                              onChange={setSelectedBUs}
                              disabled={readOnly}
                           />
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
                                 <th className="px-4 py-3">Employee Name</th>
                                 <th className="px-4 py-3">Designation</th>
                                 <th className="px-4 py-3">Department</th>
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
                                             <img src={emp.avatar_url} alt="" className="w-full h-full object-cover" />
                                          </div>
                                          <div>
                                             <div className="font-semibold text-slate-800">{emp.first_name} {emp.last_name}</div>
                                             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{emp.employee_id}</div>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 font-medium">{emp.designation}</td>
                                    <td className="px-4 py-3 text-slate-500">{emp.department}</td>
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
                                    <td colSpan={readOnly ? 4 : 5} className="px-6 py-12 text-center text-slate-400 italic">
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
               <div className="w-full space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-bold text-slate-800">Attendance & Time Data</h3>
                  </div>

                  <div className="flex">
                     <div className="bg-amber-50 border border-amber-200 rounded-xl py-2.5 px-4 flex items-center gap-3 shadow-sm border-l-4 border-l-amber-400">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                           <AlertCircle size={18} />
                        </div>
                        <div className="text-amber-900 font-bold text-sm whitespace-nowrap">
                           {attendanceData.filter(e => e.pendingLeaves > 0).length} Employees with Pending Leaves
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                     <div className="flex gap-3 w-full sm:w-auto">
                        {!readOnly && (
                           <>
                              <button
                                 onClick={() => setShowAttendanceUpload(true)}
                                 className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                              >
                                 <Upload size={16} /> Upload CSV
                              </button>
                              <button
                                 onClick={handleExport}
                                 className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-bold transition-colors"
                              >
                                 <Download size={16} /> Export
                              </button>
                           </>
                        )}
                     </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                     <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                           <tr>
                              <th className="px-6 py-3">Employee Name</th>
                              <th className="px-4 py-3 text-center text-indigo-600 font-bold">Working Days</th>
                              <th className="px-4 py-3 text-center">Present Days</th>
                              <th className="px-4 py-3 text-center">Leave Days</th>
                              <th className="px-4 py-3 text-center">LOP Days</th>
                              <th className="px-4 py-3 text-right">Payable Days</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {attendanceData.map((row) => (
                                <tr key={row.id} className={`hover:bg-slate-50 transition-colors ${row.pendingLeaves > 0 ? 'bg-amber-50/50' : ''}`}>
                                  <td className="px-6 py-3">
                                     <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-800">{row.name}</span>
                                        {row.pendingLeaves > 0 && (
                                           <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-200 shadow-sm animate-pulse">
                                              <Clock size={10} /> Pending
                                           </span>
                                        )}
                                     </div>
                                  </td>
                                  <td className="px-4 py-3 text-center text-indigo-600 font-bold bg-indigo-50/30">22</td>
                                  <td className="px-4 py-3 text-center text-slate-600">{row.days}</td>
                                  <td className="px-4 py-3 text-center text-slate-600">{row.leaves || '-'}</td>
                                  <td className="px-4 py-3 text-center text-rose-600 font-medium">{row.lop || '-'}</td>
                                  <td className="px-4 py-3 text-right font-bold text-slate-800">{row.days + (row.leaves || 0)}</td>
                               </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            );

         case 3: // ADJUSTMENTS
            return (
               <div className="flex flex-col h-full space-y-4">
                  <div className="grid grid-cols-7 gap-3">
                     <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 leading-tight">Total Bonus</p>
                        <p className="text-base font-bold text-emerald-600 truncate">+ ₹{formatLakh(summary.bonus)}</p>
                     </div>
                     <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 leading-tight">Expense Reimb.</p>
                        <p className="text-base font-bold text-emerald-600 truncate">+ ₹{formatLakh(summary.expenseReimb)}</p>
                     </div>
                     <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 leading-tight">LOP Reversal</p>
                        <p className="text-base font-bold text-emerald-600 truncate">+ ₹{formatLakh(summary.lopReversal)}</p>
                     </div>
                     <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 leading-tight">Loan Recovery</p>
                        <p className="text-base font-bold text-rose-600 truncate">- ₹{formatLakh(summary.loanRecovery)}</p>
                     </div>
                     <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 leading-tight">Salary Advance</p>
                        <p className="text-base font-bold text-rose-600 truncate">- ₹{formatLakh(summary.salaryAdvance)}</p>
                     </div>
                     <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 leading-tight">TDS Deductions</p>
                        <p className="text-base font-bold text-rose-600 truncate">- ₹{formatLakh(summary.tds)}</p>
                     </div>
                     <div className={`p-3 rounded-xl border shadow-sm ${netImpact >= 0 ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
                        <p className={`text-[10px] font-bold uppercase mb-1 leading-tight ${netImpact >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>Net Impact</p>
                        <p className={`text-base font-bold truncate ${netImpact >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                           {netImpact >= 0 ? '+' : '-'} ₹{formatLakh(Math.abs(netImpact))}
                        </p>
                     </div>
                  </div>

                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                     <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                           type="text"
                           placeholder="Search employee..."
                           value={adjustmentSearch}
                           onChange={(e) => setAdjustmentSearch(e.target.value)}
                           className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
                        />
                     </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm flex-1 overflow-y-auto">
                     <table className="w-full text-sm text-left table-fixed min-w-[1200px]">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                           <tr>
                              <th className="px-4 py-3 w-48">Employee Name</th>
                              <th className="px-2 py-3 text-right w-24">Gross</th>
                              <th className="px-2 py-3 text-right text-emerald-600 w-24">LOP Reversal</th>
                              <th className="px-2 py-3 text-right w-24">Bonus</th>
                              <th className="px-2 py-3 text-right w-40">Expense Reimbursement</th>
                              <th className="px-2 py-3 text-right w-24">Arrears</th>
                              <th className="px-2 py-3 text-right text-rose-600 w-28">Loan Recovery</th>
                              <th className="px-2 py-3 text-right text-rose-600 w-32">Salary Advance Recovery</th>
                              <th className="px-2 py-3 text-right w-24">Proposed TDS</th>
                              <th className="px-2 py-3 text-right w-24">Actual TDS</th>
                              <th className="px-4 py-3 text-right font-bold bg-slate-100 w-32">Final Gross</th>
                              <th className="px-4 py-3 w-20 text-center">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                           {filteredAdjustments.length > 0 ? filteredAdjustments.map((row) => {
                              const total = row.gross + row.bonus + row.arrears + row.expenseReimbursement - row.loanRecovery - row.salaryAdvanceRecovery - row.actualTds - row.lop + row.lopReversal + row.other;
                              return (
                                 <tr key={row.id} className={`hover:bg-slate-50/80 transition-colors group ${row.isEditing ? 'bg-purple-50/30' : ''}`}>
                                    <td className="px-4 py-3 text-slate-800 truncate">{row.name}</td>
                                    <td className="px-2 py-3 text-right text-slate-500">₹{row.gross.toLocaleString()}</td>
                                    <td className="px-2 py-3 text-right">
                                       {row.isEditing ? (
                                          <input
                                             type="number"
                                             value={row.lopReversal || ''}
                                             onChange={(e) => handleAdjustmentChange(row.id, 'lopReversal', e.target.value)}
                                             className="w-full text-right p-1.5 border border-purple-200 rounded-lg text-emerald-600 font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white transition-all"
                                             placeholder="0"
                                          />
                                       ) : (
                                          <span className="text-emerald-600">{row.lopReversal > 0 ? `₹${row.lopReversal.toLocaleString()}` : '-'}</span>
                                       )}
                                    </td>
                                    <td className="px-2 py-3 text-right">
                                       {row.isEditing ? (
                                          <input
                                             type="number"
                                             value={row.bonus || ''}
                                             onChange={(e) => handleAdjustmentChange(row.id, 'bonus', e.target.value)}
                                             className="w-full text-right p-1.5 border border-purple-200 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white transition-all"
                                             placeholder="0"
                                          />
                                       ) : (
                                          <span>{row.bonus > 0 ? `₹${row.bonus.toLocaleString()}` : '-'}</span>
                                       )}
                                    </td>
                                    <td className="px-2 py-3 text-right">
                                       {row.isEditing ? (
                                          <input
                                             type="number"
                                             value={row.expenseReimbursement || ''}
                                             onChange={(e) => handleAdjustmentChange(row.id, 'expenseReimbursement', e.target.value)}
                                             className="w-full text-right p-1.5 border border-purple-200 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white transition-all"
                                             placeholder="0"
                                          />
                                       ) : (
                                          <span>{row.expenseReimbursement > 0 ? `₹${row.expenseReimbursement.toLocaleString()}` : '-'}</span>
                                       )}
                                    </td>
                                    <td className="px-2 py-3 text-right">
                                       {row.isEditing ? (
                                          <input
                                             type="number"
                                             value={row.arrears || ''}
                                             onChange={(e) => handleAdjustmentChange(row.id, 'arrears', e.target.value)}
                                             className="w-full text-right p-1.5 border border-purple-200 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white transition-all"
                                             placeholder="0"
                                          />
                                       ) : (
                                          <span>{row.arrears > 0 ? `₹${row.arrears.toLocaleString()}` : '-'}</span>
                                       )}
                                    </td>
                                    <td className="px-2 py-3 text-right">
                                       {row.isEditing ? (
                                          <input
                                             type="number"
                                             value={row.loanRecovery || ''}
                                             onChange={(e) => handleAdjustmentChange(row.id, 'loanRecovery', e.target.value)}
                                             className="w-full text-right p-1.5 border border-purple-200 rounded-lg text-rose-600 font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white transition-all"
                                             placeholder="0"
                                          />
                                       ) : (
                                          <span className="text-rose-600">{row.loanRecovery > 0 ? `- ₹${row.loanRecovery.toLocaleString()}` : '-'}</span>
                                       )}
                                    </td>
                                    <td className="px-2 py-3 text-right">
                                       {row.isEditing ? (
                                          <input
                                             type="number"
                                             value={row.salaryAdvanceRecovery || ''}
                                             onChange={(e) => handleAdjustmentChange(row.id, 'salaryAdvanceRecovery', e.target.value)}
                                             className="w-full text-right p-1.5 border border-purple-200 rounded-lg text-rose-600 font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white transition-all"
                                             placeholder="0"
                                          />
                                       ) : (
                                          <span className="text-rose-600">{row.salaryAdvanceRecovery > 0 ? `- ₹${row.salaryAdvanceRecovery.toLocaleString()}` : '-'}</span>
                                       )}
                                    </td>
                                    <td className="px-2 py-3 text-right text-slate-500">
                                       ₹{row.proposedTds.toLocaleString()}
                                    </td>
                                    <td className="px-2 py-3 text-right">
                                       {row.isEditing ? (
                                          <input
                                             type="number"
                                             value={row.actualTds || ''}
                                             onChange={(e) => handleAdjustmentChange(row.id, 'actualTds', e.target.value)}
                                             className="w-full text-right p-1.5 border border-purple-200 rounded-lg text-rose-600 font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white transition-all"
                                             placeholder="0"
                                          />
                                       ) : (
                                          <span className="text-rose-600">₹{row.actualTds.toLocaleString()}</span>
                                       )}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-800 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                                       ₹{total.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                       <div className="flex items-center justify-center gap-2">
                                          <button
                                             onClick={() => handleRowLopClick(row.id)}
                                             className="p-1.5 rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all"
                                             title="Recover LOP for this employee"
                                          >
                                             <Undo size={18} />
                                          </button>
                                          <button
                                             onClick={() => toggleEdit(row.id)}
                                             className={`p-1.5 rounded-lg transition-all ${row.isEditing ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}
                                             title={row.isEditing ? "Save Changes" : "Edit Row"}
                                          >
                                             {row.isEditing ? <CheckCircle size={18} /> : <Edit size={18} />}
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              );
                           }) : (
                              <tr>
                                 <td colSpan={12} className="px-4 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                       <Search size={32} className="text-slate-200" />
                                       <p>No employees found matching your search.</p>
                                    </div>
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            );

         case 4: // REVIEW
            return (
               <div className="w-full space-y-6 pb-20">
                   {/* KPI Summary - 3 Cards */}
                   <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                         <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Gross</p>
                         <p className="text-2xl font-bold text-slate-800">₹ 82.08 L</p>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                         <p className="text-xs font-bold text-slate-400 uppercase mb-1">Deductions</p>
                         <p className="text-2xl font-bold text-rose-600">₹ 9.85 L</p>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-emerald-100 bg-emerald-50 shadow-sm">
                         <p className="text-xs font-bold text-emerald-700 uppercase mb-1">Net Payout</p>
                         <p className="text-2xl font-bold text-emerald-800">₹ 72.23 L</p>
                      </div>
                   </div>

                   <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                         <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><FileText size={16} /> Final Register Preview</h3>
                         <div className="flex gap-2">
                            <button onClick={handleExport} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded hover:bg-slate-50 flex items-center gap-2 transition-colors">
                               <Download size={14} /> Export
                            </button>
                         </div>
                      </div>
                      <div className="overflow-x-auto">
                         <table className="w-full text-xs text-left min-w-[1400px]">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                               <tr>
                                  <th className="px-6 py-4 sticky left-0 bg-slate-50 z-10 w-[250px]">Employee Name</th>
                                  <th className="px-4 py-4 text-right">Gross</th>
                                  <th className="px-4 py-4 text-right text-emerald-600">LOP Reversal</th>
                                  <th className="px-4 py-4 text-right">Bonus</th>
                                  <th className="px-4 py-4 text-right">Expense Reimb.</th>
                                  <th className="px-4 py-4 text-right">Arrears</th>
                                  <th className="px-4 py-4 text-right text-rose-600">Loan Recovery</th>
                                  <th className="px-4 py-4 text-right text-rose-600">Salary Adv. Recovery</th>
                                  <th className="px-4 py-4 text-right">Proposed TDS</th>
                                  <th className="px-4 py-4 text-right text-rose-500">Actual TDS</th>
                                  <th className="px-6 py-4 text-right font-black text-slate-900 bg-slate-50/50">Net Pay</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                               {previewEmployees.map((emp) => {
                                  // Net Pay = Gross + LOP Reversal + Bonus + Reimb + Arrears - Loan - Advance - TDS
                                  const netPay = emp.gross + (emp.lopReversal || 0) + (emp.bonus || 0) + (emp.expenseReimbursement || 0) + (emp.arrears || 0) - (emp.loanRecovery || 0) - (emp.salaryAdvanceRecovery || 0) - (emp.actualTds || 0);
                                  
                                  return (
                                     <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                           <div className="flex flex-col">
                                              <span className="font-bold text-slate-800">{emp.name}</span>
                                              <span className="text-[10px] text-slate-500 font-medium">{emp.role}</span>
                                           </div>
                                        </td>
                                        <td className="px-4 py-4 text-right font-medium">₹{emp.gross.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right text-emerald-600 font-bold">{emp.lopReversal > 0 ? `₹${emp.lopReversal.toLocaleString()}` : '-'}</td>
                                        <td className="px-4 py-4 text-right text-slate-700">{emp.bonus > 0 ? `₹${emp.bonus.toLocaleString()}` : '-'}</td>
                                        <td className="px-4 py-4 text-right text-slate-700">{emp.expenseReimbursement > 0 ? `₹${emp.expenseReimbursement.toLocaleString()}` : '-'}</td>
                                        <td className="px-4 py-4 text-right text-slate-700">{emp.arrears > 0 ? `₹${emp.arrears.toLocaleString()}` : '-'}</td>
                                        <td className="px-4 py-4 text-right text-rose-600 font-medium">{emp.loanRecovery > 0 ? `-₹${emp.loanRecovery.toLocaleString()}` : '-'}</td>
                                        <td className="px-4 py-4 text-right text-rose-600 font-medium">{emp.salaryAdvanceRecovery > 0 ? `-₹${emp.salaryAdvanceRecovery.toLocaleString()}` : '-'}</td>
                                        <td className="px-4 py-4 text-right text-slate-400 font-medium italic">₹{emp.proposedTds.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right text-rose-500 font-bold">₹{emp.actualTds.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-black text-slate-900 bg-slate-50/30">
                                           ₹{netPay.toLocaleString()}
                                        </td>
                                     </tr>
                                  );
                               })}
                            </tbody>
                         </table>
                      </div>
                   </div>
                </div>
            );

         case 5: // FINALIZE
            return (
               <div className="w-full space-y-8">
                  <div className="flex items-center justify-end">
                     <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">Draft Mode</span>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                     <div className="bg-white p-6 rounded-xl border border-slate-200 border-t-4 border-t-blue-600 shadow-sm space-y-4">
                        <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Gross</p>
                           <p className="text-3xl font-bold text-slate-800 tracking-tight">₹ 18.42 Cr</p>
                        </div>
                        <div className="pt-4 border-t border-slate-100 space-y-2">
                           <div className="flex justify-between text-[11px] font-medium">
                              <span className="text-slate-400">Base salaries</span>
                              <span className="text-slate-700">₹ 17.90 Cr</span>
                           </div>
                           <div className="flex justify-between text-[11px] font-medium">
                              <span className="text-slate-400">Bonuses & arrears</span>
                              <span className="text-slate-700">₹ 38.40 K</span>
                           </div>
                           <div className="flex justify-between text-[11px] font-medium">
                              <span className="text-slate-400">Expense reimb.</span>
                              <span className="text-slate-700">₹ 8.40 K</span>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white p-6 rounded-xl border border-slate-200 border-t-4 border-t-rose-600 shadow-sm space-y-4">
                        <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Deductions</p>
                           <p className="text-3xl font-bold text-rose-600 tracking-tight">₹ 3.74 Cr</p>
                        </div>
                        <div className="pt-4 border-t border-slate-100 space-y-2">
                           <div className="flex justify-between text-[11px] font-medium">
                              <span className="text-slate-400">TDS</span>
                              <span className="text-slate-700">₹ 2.90 Cr</span>
                           </div>
                           <div className="flex justify-between text-[11px] font-medium">
                              <span className="text-slate-400">PF (employer + employee)</span>
                              <span className="text-slate-700">₹ 72.40 K</span>
                           </div>
                           <div className="flex justify-between text-[11px] font-medium">
                              <span className="text-slate-400">Loan & advance recovery</span>
                              <span className="text-slate-700">₹ 9.50 K</span>
                           </div>
                           <div className="flex justify-between text-[11px] font-medium">
                              <span className="text-slate-400">LOP deductions</span>
                              <span className="text-slate-700">₹ 0</span>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white p-6 rounded-xl border border-slate-200 border-t-4 border-t-emerald-600 shadow-sm space-y-4">
                        <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Net Payable</p>
                           <p className="text-3xl font-bold text-emerald-800 tracking-tight">₹ 14.68 Cr</p>
                        </div>
                        <div className="pt-4 border-t border-slate-100 space-y-2">
                           <div className="flex justify-between text-[11px] font-medium">
                              <span className="text-slate-400">Employees included</span>
                              <span className="text-slate-700">450</span>
                           </div>
                           <div className="flex justify-between text-[11px] font-medium">
                              <span className="text-slate-400">Avg. net per employee</span>
                              <span className="text-slate-700">₹ 3.26 L</span>
                           </div>
                           <div className="flex justify-between text-[11px] font-medium">
                              <span className="text-slate-400">Pay period</span>
                              <span className="text-slate-700">1-30 Nov 2025</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <h4 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <UserCheck size={16} className="text-indigo-500" /> Approval Hierarchy
                     </h4>
                     <div className="flex items-center gap-6">
                        <div className="flex-1 p-4 border border-emerald-200 bg-emerald-50/50 rounded-2xl relative">
                           <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg border-2 border-white shadow-sm">KS</div>
                              <div>
                                 <p className="text-sm font-bold text-slate-800">Kavita Sharma</p>
                                 <p className="text-[11px] text-slate-400 font-medium">HR Manager</p>
                              </div>
                           </div>
                           <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-100 rounded-full text-[11px] font-bold text-emerald-600 shadow-sm mb-2">
                              <CheckCircle size={12} /> Approved
                           </div>
                           <p className="text-[10px] text-slate-400 font-medium">27 Mar 2026 · 11:42 AM</p>
                        </div>

                        <div className="text-slate-300">
                           <ChevronRight size={24} strokeWidth={3} />
                        </div>

                        <div className="flex-1 p-4 border border-slate-200 bg-white rounded-2xl relative">
                           <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg border-2 border-white shadow-sm">RK</div>
                              <div>
                                 <p className="text-sm font-bold text-slate-800">Rajesh Kumar</p>
                                 <p className="text-[11px] text-slate-400 font-medium">Finance Head</p>
                              </div>
                           </div>
                           <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[11px] font-bold text-amber-700 shadow-sm mb-2">
                              <Hourglass size={12} /> Pending approval
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                     <div className="flex items-start gap-4 mb-6">
                        <div className="p-2.5 bg-slate-50 text-slate-400 rounded-lg border border-slate-100 italic">
                           <Lock size={20} />
                        </div>
                        <div className="flex-1">
                           <h4 className="text-sm font-bold text-slate-800">Confirm & lock payroll</h4>
                           <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-2xl">
                              Once locked, payroll cannot be edited. Payslips and bank disbursal files will be generated automatically. 
                              All approvals must be complete before you can lock.
                           </p>
                        </div>
                     </div>
                     
                     <div className="pt-6 border-t border-slate-100">
                        <label className="flex items-center gap-3 cursor-pointer group w-full">
                           <input
                              type="checkbox"
                              checked={isConfirmed}
                              onChange={e => setIsConfirmed(e.target.checked)}
                              disabled={readOnly}
                              className="rounded text-indigo-600 focus:ring-indigo-500 w-5 h-5 cursor-pointer disabled:opacity-50 border-slate-300"
                           />
                           <span className="text-[11px] font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">
                              I confirm that all figures are accurate and authorise locking this payroll run for Nov 2025
                           </span>
                        </label>
                     </div>
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

   const stepDescriptions: Record<number, string> = {
      1: 'Pay cycle & employees',
      2: 'Leaves & working days',
      3: 'Arrears & deductions',
      4: 'Final salary register',
      5: 'Totals & approvals',
      6: 'Payslips & bank sheet'
   };

   const stepTitles: Record<number, string> = {
      1: 'Pay period & employees',
      2: 'Attendance & Time Data',
      3: 'Salary Adjustments',
      4: 'Review & Verify',
      5: 'Finalize & Lock',
      6: 'Disburse Salaries'
   };

   const stepSubtitles: Record<number, string> = {
      1: 'Set the payroll cycle dates and select which employees to include in this run.',
      2: 'Review imported biometric attendance and verify paydays.',
      3: 'Add bonuses, recover LOPs, or process ad-hoc deductions.',
      4: 'Preview final salary calculations before locking.',
      5: 'Approve payroll totals to lock editing and generate files.',
      6: 'Distribute payslips and process bank transfer file.'
   };

   const innerContent = (
      <>
         <div className="flex w-full h-full bg-slate-50 relative flex-col">
            {/* Top Header */}
         <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-20">
             <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                 <h2 className="text-lg font-bold text-slate-800">{company.name}</h2>
                 <span className="text-slate-300">/</span>
                 <p className="text-sm text-slate-600">Payroll • Nov 2025</p>
                 {readOnly && <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded ml-2">Read Only</span>}
             </div>
             <div className="flex items-center gap-3">
                 <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                     <X size={16} className="text-slate-400" /> Cancel
                 </button>
                 <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                     <MoreHorizontal size={16} />
                 </button>
             </div>
         </div>

         <div className="flex flex-1 overflow-hidden">
             {/* Left Sidebar (Stepper) */}
             <div className="w-64 bg-white border-r border-slate-200 p-6 overflow-y-auto shrink-0 relative">
                <div className="relative pt-2 pl-2">
                   {/* Vertical Line */}
                   <div className="absolute left-[24px] top-6 bottom-6 w-px border-l-2 border-dashed border-slate-200"></div>
                   
                   {[
                      { id: 1, label: 'Period' },
                      { id: 2, label: 'Attendance' },
                      { id: 3, label: 'Adjustments' },
                      { id: 4, label: 'Review' },
                      { id: 5, label: 'Finalise' },
                      { id: 6, label: 'Disburse' }
                   ].map((step) => {
                      const isActive = step.id === currentStep;
                      const isCompleted = step.id < currentStep;
                      return (
                         <div key={step.id} className="relative mb-6 last:mb-0 bg-white">
                            <div 
                               className={`flex items-start gap-4 cursor-pointer group p-3 transition-colors ${isActive ? 'bg-blue-50/60 rounded-xl rounded-l-none -ml-5 pl-5 border-l-4 border-blue-600' : 'hover:bg-slate-50 rounded-xl -ml-5 pl-5 border-l-4 border-transparent'}`}
                               onClick={() => (isCompleted || !readOnly) && setCurrentStep(step.id)}
                            >
                               <div className={`relative z-10 w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all outline outline-4 outline-white ${isActive ? 'bg-blue-600 text-white' : isCompleted ? 'bg-white border-2 border-slate-300 text-slate-500' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                                  {step.id}
                               </div>
                               <div className={`mt-0.5 ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100 transition-opacity'}`}>
                                  <div className={`text-sm font-bold ${isActive ? 'text-blue-600' : 'text-slate-800'}`}>{step.label}</div>
                                  <div className="text-xs text-slate-500 mt-0.5 leading-snug">{stepDescriptions[step.id]}</div>
                               </div>
                            </div>
                         </div>
                      );
                   })}
                </div>
             </div>

             {/* Right Content Area */}
             <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 overflow-hidden relative">
                 <div className="flex-1 overflow-y-auto p-8">
                     <div className="w-full">
                         {/* Dynamic Header based on step */}
                         <div className="mb-8 pl-4">
                            <h2 className="text-2xl font-bold text-slate-800">{stepTitles[currentStep]}</h2>
                            <p className="text-slate-500 mt-1">{stepSubtitles[currentStep]}</p>
                         </div>

                         {renderStepContent()}
                     </div>
                 </div>

                 {/* Sticky Footer */}
                 <div className="bg-white border-t border-slate-200 px-8 py-5 flex justify-between items-center shrink-0 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] sticky bottom-0 z-20">
                     {currentStep > 1 && currentStep < 6 ? (
                        <button onClick={handleBack} className="px-6 py-2.5 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm">
                           <ChevronLeft size={16} /> Back
                        </button>
                     ) : <div />}
                     
                     {currentStep === 5 ? (
                        <button
                           onClick={handleNext}
                           disabled={(!isConfirmed && !readOnly) || readOnly}
                           className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <Lock size={16} /> {readOnly ? 'Locked' : 'Approve & Lock Payroll'}
                        </button>
                     ) : currentStep === 6 ? (
                        <button onClick={onClose} className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 shadow-sm flex items-center gap-2 transition-all">
                           Finish <CheckCircle size={16} />
                        </button>
                     ) : (
                        <button onClick={handleNext} className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-sm flex items-center gap-2 transition-all">
                           {getStepButtonLabel()} <ArrowRight size={16} />
                        </button>
                     )}
                 </div>
             </div>
         </div>

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

         {/* Row-Level LOP Reversal Modal */}
         {showRowLopModal && rowLopTargetId && !readOnly && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-amber-100">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-amber-50/50">
                     <div className="flex items-center gap-2">
                        <Undo size={18} className="text-amber-600" />
                        <h3 className="font-bold text-amber-900 text-sm">Reverse LOP</h3>
                     </div>
                     <button onClick={() => setShowRowLopModal(false)}><X size={18} className="text-slate-400 hover:text-slate-600" /></button>
                  </div>
                  <div className="p-6 space-y-5">
                     <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Employee Name</p>
                        <p className="text-sm font-bold text-slate-800">{adjustments.find(e => e.id === rowLopTargetId)?.name}</p>
                     </div>
                     
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Number of Days to Reversed</label>
                        <div className="relative">
                           <input
                              type="number"
                              step="0.5"
                              value={rowLopDays}
                              onChange={(e) => setRowLopDays(e.target.value)}
                              autoFocus
                              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="0"
                           />
                           <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">Days</span>
                        </div>
                     </div>

                     <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-700 uppercase">Calculated Reversal Amount</span>
                        <span className="text-lg font-bold text-emerald-800">
                           ₹ {Math.round((adjustments.find(e => e.id === rowLopTargetId)?.gross || 0) / 30 * (parseFloat(rowLopDays) || 0)).toLocaleString()}
                        </span>
                     </div>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                     <button onClick={() => setShowRowLopModal(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                     <button
                        onClick={confirmRowLopReversal}
                        className="px-8 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-200/50 transition-all font-bold"
                     >
                        Submit
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
