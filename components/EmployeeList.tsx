import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Users,
  Calculator,
  Calendar,
  ChevronDown, 
  X, 
  CheckCircle, 
  ArrowRight, 
  Briefcase, 
  CheckSquare, 
  Eye, 
  Clock, 
  Save, 
  MapPin, 
  Building, 
  Info, 
  ChevronLeft, 
  Printer, 
  Download, 
  Share2
} from 'lucide-react';
import { Employee } from '../types';
import { MOCK_EMPLOYEES } from '../constants';

interface SalaryHistoryRow {
  id: string;
  period: string;
  gross: number;
  net: number;
  status: 'Disbursed' | 'Pending' | 'Hold';
  date: string;
  bankAcc: string;
  deductions: {
    pf: number;
    tds: number;
    others: number;
  };
}

const STRUCTURE_OPTIONS = [
  "Standard IT 2025",
  "Startup Flexi",
  "Contractor Monthly",
  "Custom – Priya",
  "Sales Incentive Structure"
];

// --- Sub-Component: Salary Annexure Preview Modal ---
const SalaryAnnexureModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    employee: Employee;
    annualCtc: number;
    structureName: string;
}> = ({ isOpen, onClose, employee, annualCtc, structureName }) => {
    if (!isOpen) return null;

    // Calculation logic based on provided image proportions
    const ctc = annualCtc || 0;
    const basicAnnual = Math.round(ctc * 0.4);
    const hraAnnual = Math.round(basicAnnual * 0.5);
    const ltaAnnual = ctc > 0 ? 50000 : 0;
    const pfAnnual = ctc > 0 ? 21600 : 0;
    const gratuityAnnual = Math.round(basicAnnual * 0.0443); // Matching ~32,800 for 7,40,000 basic
    
    const retiralsTotal = pfAnnual + gratuityAnnual;
    const grossAnnual = ctc - retiralsTotal;
    const specialAnnual = Math.max(0, grossAnnual - basicAnnual - hraAnnual - ltaAnnual);

    const formatNum = (val: number) => val.toLocaleString('en-IN');
    const formatMonthly = (val: number) => Math.round(val / 12).toLocaleString('en-IN');

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-start bg-white">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Salary Structure Annexure</h3>
                        <p className="text-sm text-sky-600 font-medium">{employee.name} ({employee.eid})</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                       <table className="w-full text-sm text-left">
                           <thead className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">
                               <tr>
                                   <th className="px-6 py-4">Component</th>
                                   <th className="px-6 py-4 text-right">Monthly (₹)</th>
                                   <th className="px-6 py-4 text-right">Annual (₹)</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                               {/* A. Earnings */}
                               <tr className="bg-emerald-50/30">
                                   <td colSpan={3} className="px-6 py-2.5 font-black text-emerald-800 text-[11px] uppercase tracking-wider">A. Earnings</td>
                               </tr>
                               <tr>
                                   <td className="px-6 py-3.5 text-slate-700 font-medium">Basic Salary</td>
                                   <td className="px-6 py-3.5 text-right text-slate-600">{formatMonthly(basicAnnual)}</td>
                                   <td className="px-6 py-3.5 text-right text-slate-800 font-bold">{formatNum(basicAnnual)}</td>
                               </tr>
                               <tr>
                                   <td className="px-6 py-3.5 text-slate-700 font-medium">House Rent Allowance</td>
                                   <td className="px-6 py-3.5 text-right text-slate-600">{formatMonthly(hraAnnual)}</td>
                                   <td className="px-6 py-3.5 text-right text-slate-800 font-bold">{formatNum(hraAnnual)}</td>
                               </tr>
                               <tr>
                                   <td className="px-6 py-3.5 text-slate-700 font-medium">Special Allowance</td>
                                   <td className="px-6 py-3.5 text-right text-slate-600">{formatMonthly(specialAnnual)}</td>
                                   <td className="px-6 py-3.5 text-right text-slate-800 font-bold">{formatNum(specialAnnual)}</td>
                               </tr>
                               <tr>
                                   <td className="px-6 py-3.5 text-slate-700 font-medium">Leave Travel Allowance</td>
                                   <td className="px-6 py-3.5 text-right text-slate-600">{formatMonthly(ltaAnnual)}</td>
                                   <td className="px-6 py-3.5 text-right text-slate-800 font-bold">{formatNum(ltaAnnual)}</td>
                               </tr>
                               <tr className="bg-slate-50 font-black">
                                   <td className="px-6 py-4 text-slate-800">Total Gross Salary (A)</td>
                                   <td className="px-6 py-4 text-right text-slate-900">{formatMonthly(grossAnnual)}</td>
                                   <td className="px-6 py-4 text-right text-slate-900">{formatNum(grossAnnual)}</td>
                               </tr>

                               {/* B. Retirals */}
                               <tr className="bg-sky-50/30">
                                   <td colSpan={3} className="px-6 py-2.5 font-black text-sky-800 text-[11px] uppercase tracking-wider">B. Retirals (Employer)</td>
                               </tr>
                               <tr>
                                   <td className="px-6 py-3.5 text-slate-700 font-medium">Provident Fund (Employer)</td>
                                   <td className="px-6 py-3.5 text-right text-slate-600">{formatMonthly(pfAnnual)}</td>
                                   <td className="px-6 py-3.5 text-right text-slate-800 font-bold">{formatNum(pfAnnual)}</td>
                               </tr>
                               <tr>
                                   <td className="px-6 py-3.5 text-slate-700 font-medium">Gratuity</td>
                                   <td className="px-6 py-3.5 text-right text-slate-600">{formatMonthly(gratuityAnnual)}</td>
                                   <td className="px-6 py-3.5 text-right text-slate-800 font-bold">{formatNum(gratuityAnnual)}</td>
                               </tr>
                               <tr className="bg-slate-50 font-black">
                                   <td className="px-6 py-4 text-slate-800">Total Retirals (B)</td>
                                   <td className="px-6 py-4 text-right text-slate-900">{formatMonthly(retiralsTotal)}</td>
                                   <td className="px-6 py-4 text-right text-slate-900">{formatNum(retiralsTotal)}</td>
                               </tr>
                           </tbody>
                           <tfoot className="bg-slate-900 text-white font-black">
                               <tr>
                                   <td className="px-6 py-5 text-base">Total Cost to Company (A + B)</td>
                                   <td className="px-6 py-5 text-right text-base">{formatMonthly(ctc)}</td>
                                   <td className="px-6 py-5 text-right text-xl tracking-tight">{formatNum(ctc)}</td>
                               </tr>
                           </tfoot>
                       </table>
                    </div>
                    <div className="mt-6 flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <Info size={16} className="text-slate-400 mt-0.5" />
                        <p className="text-[11px] text-slate-500 leading-relaxed italic">
                            * The above calculations are based on the "{structureName}" salary structure. Actual payroll amounts may vary slightly due to rounding, days worked, and prevailing statutory rules.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-8 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const AssignStructureModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  preSelectedIds: string[];
  employees: Employee[];
}> = ({ isOpen, onClose, preSelectedIds, employees }) => {
  const [step, setStep] = useState(1);
  
  // Selection & Data States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [effectiveDate, setEffectiveDate] = useState('2025-11-01');
  
  // Step 2 Data
  const [ctcValues, setCtcValues] = useState<Record<string, string>>({});
  const [arrearsDefaults, setArrearsDefaults] = useState<Record<string, string>>({});

  // Preview State
  const [previewEmployee, setPreviewEmployee] = useState<Employee | null>(null);

  // Filters (Step 1)
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [locFilter, setLocFilter] = useState('All');

  // Mock Current Data
  const [currentStructures] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    employees.forEach((e, i) => {
        map[e.id] = i % 4 === 0 ? "Standard IT 2025" : i % 4 === 1 ? "Not Assigned" : i % 4 === 2 ? "Startup Flexi" : "Contractor Monthly";
    });
    return map;
  });

  const departments = useMemo(() => ['All', ...Array.from(new Set(employees.map(e => e.department)))], [employees]);
  const locations = useMemo(() => ['All', ...Array.from(new Set(employees.map(e => e.location)))], [employees]);

  useEffect(() => {
    if (isOpen) {
        setSelectedIds(preSelectedIds);
        setStep(1); // Reset to step 1 on open
        setCtcValues({});
    }
  }, [isOpen, preSelectedIds]);

  if (!isOpen) return null;

  // --- Logic Helpers ---

  const handleClose = () => {
      setStep(1);
      onClose();
  };

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.eid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All' || e.department === deptFilter;
    const matchesLoc = locFilter === 'All' || e.location === locFilter;
    return matchesSearch && matchesDept && matchesLoc;
  });

  const selectedEmployeesList = employees.filter(e => selectedIds.includes(e.id));

  // Step 1 Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredEmployees.length) {
        setSelectedIds([]);
    } else {
        setSelectedIds(filteredEmployees.map(e => e.id));
    }
  };

  const handleAssignmentChange = (id: string, value: string) => {
    setAssignments(prev => ({ ...prev, [id]: value }));
    if (!selectedIds.includes(id)) {
        handleToggleSelect(id);
    }
  };

  const handleBulkAssign = (value: string) => {
    if (!value) return;
    const newAssignments = { ...assignments };
    selectedIds.forEach(id => {
        newAssignments[id] = value;
    });
    setAssignments(newAssignments);
  };

  // Step 2 Handlers
  const handleCtcChange = (id: string, val: string) => {
      setCtcValues(prev => ({ ...prev, [id]: val }));
  };

  const calculateMonthly = (ctc: string) => {
      const val = parseFloat(ctc);
      if (!val || isNaN(val)) return '-';
      return (val / 12).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  };

  const calculateTDS = (ctc: string, regime: 'OLD' | 'NEW') => {
      const annualIncome = parseFloat(ctc);
      if (!annualIncome || isNaN(annualIncome)) return '-';

      let tax = 0;
      let taxableIncome = annualIncome;

      if (regime === 'OLD') {
          // Simplified Old Regime Logic (Standard Deduction 50k)
          taxableIncome = Math.max(0, taxableIncome - 50000);
          
          if (taxableIncome > 1000000) {
              tax += (taxableIncome - 1000000) * 0.30;
              taxableIncome = 1000000;
          }
          if (taxableIncome > 500000) {
              tax += (taxableIncome - 500000) * 0.20;
              taxableIncome = 500000;
          }
          if (taxableIncome > 250000) {
              tax += (taxableIncome - 250000) * 0.05;
          }
      } else {
          // New Regime FY 25-26 (Standard Deduction 75k)
          taxableIncome = Math.max(0, taxableIncome - 75000);
          
          // Slabs: 0-4 (0), 4-8 (5), 8-12 (10), 12-16 (15), 16-20 (20), 20-24 (25), >24 (30)
          if (taxableIncome > 2400000) { tax += (taxableIncome - 2400000) * 0.30; taxableIncome = 2400000; }
          if (taxableIncome > 2000000) { tax += (taxableIncome - 2000000) * 0.25; taxableIncome = 2000000; }
          if (taxableIncome > 1600000) { tax += (taxableIncome - 1600000) * 0.20; taxableIncome = 1600000; }
          if (taxableIncome > 1200000) { tax += (taxableIncome - 1200000) * 0.15; taxableIncome = 1200000; }
          if (taxableIncome > 800000) { tax += (taxableIncome - 800000) * 0.10; taxableIncome = 800000; }
          if (taxableIncome > 400000) { tax += (taxableIncome - 400000) * 0.05; }
      }
      
      // Cess 4%
      const totalTax = Math.round(tax * 1.04);
      return totalTax > 0 ? totalTax.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : 'Nil';
  };

  // --- RENDER STEP 3: SUCCESS ---
  if (step === 3) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Confirmation</h3>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={32} strokeWidth={3} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Structure Assigned Successfully!</h2>
                    <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                        The salary structure <strong className="text-slate-700">{selectedEmployeesList.length > 0 ? assignments[selectedEmployeesList[0].id] || 'Selected Structure' : 'Structure'}</strong> has been assigned to <strong className="text-slate-700">{selectedIds.length} employees</strong>. Changes will be reflected in the {effectiveDate} payroll cycle.
                    </p>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                    <button 
                        onClick={handleClose}
                        className="px-8 py-2.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-colors shadow-sm"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // --- RENDER STEP 2: CTC CONFIGURATION ---
  if (step === 2) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div>
                    <h3 className="text-lg font-bold text-slate-800">Configure Salary Details</h3>
                    <p className="text-xs text-slate-500">Step 2: Define CTC for selected employees</p>
                 </div>
                 <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded-full"><X size={20} /></button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-auto bg-white p-6">
                  {/* Info Banner */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 mb-6">
                      <div className="p-1 bg-blue-100 rounded text-blue-600 mt-0.5"><Calculator size={16} /></div>
                      <p className="text-sm text-blue-700">Enter the <span className="font-bold">Annual CTC</span> for each employee. Monthly gross and TDS estimates will be calculated automatically.</p>
                  </div>

                  {/* Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-sm border-collapse">
                          <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                              <tr>
                                  <th className="px-4 py-4">Employee</th>
                                  <th className="px-4 py-4">Joining Date</th>
                                  <th className="px-4 py-4">Salary Structure</th>
                                  <th className="px-4 py-4">Annual CTC <span className="text-rose-500">*</span></th>
                                  <th className="px-4 py-4 text-right">Monthly Gross</th>
                                  <th className="px-4 py-4 text-center">Proposed TDS<br/><span className="text-[9px] font-normal text-slate-400">(Old Regime)</span></th>
                                  <th className="px-4 py-4 text-center">Proposed TDS<br/><span className="text-[9px] text-purple-600 font-bold">(New Regime)</span></th>
                                  <th className="px-4 py-4">Arrears Payout</th>
                                  <th className="px-4 py-4 text-center">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {selectedEmployeesList.map(emp => (
                                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-4 py-4">
                                          <div className="font-bold text-slate-800">{emp.name}</div>
                                          <div className="text-xs text-slate-500">{emp.eid}</div>
                                      </td>
                                      <td className="px-4 py-4 text-slate-600">
                                          <div className="flex items-center gap-2">
                                              <Calendar size={14} className="text-slate-400" />
                                              {emp.joinDate}
                                          </div>
                                      </td>
                                      <td className="px-4 py-4">
                                          <span className="inline-flex items-center px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-100 text-xs font-semibold">
                                              {assignments[emp.id] || 'Not Assigned'}
                                          </span>
                                      </td>
                                      <td className="px-4 py-4">
                                          <div className="relative">
                                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                              <input 
                                                  type="number" 
                                                  placeholder="e.g. 1200000"
                                                  value={ctcValues[emp.id] || ''}
                                                  onChange={(e) => handleCtcChange(emp.id, e.target.value)}
                                                  className="w-36 pl-6 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                              />
                                          </div>
                                      </td>
                                      <td className="px-4 py-4 text-right font-medium text-slate-700">
                                          {calculateMonthly(ctcValues[emp.id])}
                                      </td>
                                      <td className="px-4 py-4 text-center text-slate-600 font-medium">
                                          {calculateTDS(ctcValues[emp.id], 'OLD')}
                                      </td>
                                      <td className="px-4 py-4 text-center text-purple-700 font-bold">
                                          {calculateTDS(ctcValues[emp.id], 'NEW')}
                                      </td>
                                      <td className="px-4 py-4">
                                          <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-purple-500 cursor-pointer">
                                              <option>Nov 2025</option>
                                              <option>Dec 2025</option>
                                              <option>Jan 2026</option>
                                          </select>
                                      </td>
                                      <td className="px-4 py-4 text-center">
                                          <button 
                                            onClick={() => setPreviewEmployee(emp)}
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="View Annexure Preview"
                                          >
                                              <Eye size={18} />
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between items-center">
                 <div>
                     <button onClick={() => setStep(1)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium text-sm flex items-center gap-2 transition-colors">
                         <ChevronLeft size={16} /> Back
                     </button>
                 </div>
                 <div className="flex gap-3">
                     <button onClick={handleClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm">
                         Cancel
                     </button>
                     <button 
                        onClick={() => setStep(3)}
                        className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-colors text-sm flex items-center gap-2"
                     >
                         <CheckCircle size={18} /> Confirm Assignment
                     </button>
                 </div>
              </div>
           </div>
           
           {/* Annexure Preview Modal */}
           {previewEmployee && (
               <SalaryAnnexureModal 
                   isOpen={!!previewEmployee} 
                   onClose={() => setPreviewEmployee(null)} 
                   employee={previewEmployee}
                   annualCtc={parseFloat(ctcValues[previewEmployee.id] || '0')}
                   structureName={assignments[previewEmployee.id] || 'Standard'}
               />
           )}
        </div>
      );
  }

  // --- RENDER STEP 1: SELECTION ---
  const activeAssignmentCount = Object.keys(assignments).filter(id => selectedIds.includes(id) && assignments[id]).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <div>
                <h3 className="text-lg font-bold text-slate-800">Assign Salary Structure</h3>
                <p className="text-xs text-slate-500">Configure payroll structures and effective dates for employees</p>
             </div>
             <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded-full"><X size={20} /></button>
          </div>

          {/* Body Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
             
             {/* Toolbar: Search & Filters */}
             <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center bg-white">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search employee..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                </div>
                
                {/* Department Filter */}
                <div className="relative min-w-[160px]">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <select 
                        value={deptFilter}
                        onChange={e => setDeptFilter(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 appearance-none focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                        {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>

                {/* Location Filter */}
                <div className="relative min-w-[160px]">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <select 
                        value={locFilter}
                        onChange={e => setLocFilter(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 appearance-none focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                        {locations.map(l => <option key={l} value={l}>{l === 'All' ? 'All Locations' : l}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
             </div>

             {/* Bulk Action Bar - Visible when rows selected */}
             {selectedIds.length > 0 && (
                 <div className="bg-purple-50 px-6 py-2 border-b border-purple-100 flex items-center justify-between animate-in slide-in-from-top-2">
                     <span className="text-sm font-bold text-purple-800 flex items-center gap-2">
                         <CheckCircle size={16} /> {selectedIds.length} Employees Selected
                     </span>
                     <div className="flex items-center gap-3">
                         <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Bulk Assign Structure:</span>
                         <div className="relative">
                             <select 
                                onChange={(e) => handleBulkAssign(e.target.value)}
                                className="pl-3 pr-8 py-1.5 border border-purple-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                defaultValue=""
                             >
                                 <option value="" disabled>Select Structure...</option>
                                 {STRUCTURE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                             </select>
                             <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                         </div>
                     </div>
                 </div>
             )}

             {/* Table */}
             <div className="flex-1 overflow-auto bg-white relative">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase sticky top-0 z-10 border-b border-slate-200 shadow-sm">
                        <tr>
                            <th className="px-6 py-3 w-12 text-center">
                                <input 
                                    type="checkbox" 
                                    checked={filteredEmployees.length > 0 && selectedIds.length === filteredEmployees.length}
                                    onChange={handleSelectAll}
                                    className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer w-4 h-4"
                                />
                            </th>
                            <th className="px-6 py-3">EMPLOYEE DETAILS</th>
                            <th className="px-6 py-3">DEPARTMENT</th>
                            <th className="px-6 py-3">CURRENT STRUCTURE</th>
                            <th className="px-6 py-3">ASSIGNED STRUCTURE</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredEmployees.map(emp => {
                            const isSelected = selectedIds.includes(emp.id);
                            return (
                                <tr key={emp.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-purple-50/10' : ''}`}>
                                    <td className="px-6 py-3 text-center">
                                        <input 
                                            type="checkbox" 
                                            checked={isSelected}
                                            onChange={() => handleToggleSelect(emp.id)}
                                            className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer w-4 h-4"
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={emp.avatarUrl} alt="" className="w-9 h-9 rounded-full border border-slate-200 object-cover" />
                                            <div>
                                                <div className="font-bold text-slate-800">{emp.name}</div>
                                                <div className="text-xs text-slate-500">{emp.eid}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-slate-600">{emp.department}</td>
                                    <td className="px-6 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                                            currentStructures[emp.id] === 'Not Assigned' 
                                            ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                            : 'bg-slate-100 text-slate-600 border-slate-200'
                                        }`}>
                                            {currentStructures[emp.id]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="relative w-full max-w-[220px]">
                                            <select 
                                                value={assignments[emp.id] || ''}
                                                onChange={(e) => handleAssignmentChange(emp.id, e.target.value)}
                                                className={`w-full pl-3 pr-8 py-2 border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer transition-colors ${
                                                    assignments[emp.id] 
                                                    ? 'border-purple-200 bg-purple-50 text-purple-900 font-medium' 
                                                    : 'border-slate-200 bg-white text-slate-500'
                                                }`}
                                            >
                                                <option value="">Select Structure...</option>
                                                {STRUCTURE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredEmployees.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400">No employees found matching filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
             </div>

             {/* Effective Date Section */}
             <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                 <div className="flex items-center gap-4">
                     <label className="text-sm font-bold text-slate-700">Effective From:</label>
                     <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <Calendar className="text-purple-600" size={16} />
                         </div>
                         <input 
                            type="date" 
                            value={effectiveDate}
                            onChange={(e) => setEffectiveDate(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                         />
                     </div>
                     <span className="text-xs text-slate-500 ml-2">Changes will be applicable for payroll runs from this date onwards.</span>
                 </div>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between items-center">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                 <Briefcase size={16} />
                 <span className="text-xs font-bold">Assigning salary structures to {activeAssignmentCount} employees</span>
             </div>
             
             <div className="flex gap-3">
                 <button onClick={handleClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm">
                     Cancel
                 </button>
                 <button onClick={handleClose} className="px-5 py-2.5 bg-purple-50 text-purple-700 font-bold rounded-xl hover:bg-purple-100 transition-colors text-sm flex items-center gap-2 border border-purple-100">
                     <Clock size={16} /> Save as Draft
                 </button>
                 <button 
                    onClick={() => setStep(2)}
                    disabled={activeAssignmentCount === 0}
                    className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                     <CheckCircle size={18} /> Assign Structures
                 </button>
             </div>
          </div>
       </div>
    </div>
  );
};

// Fixed: Added missing EmployeeListProps interface to resolve the "Cannot find name 'EmployeeListProps'" error.
interface EmployeeListProps {
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ onEdit, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees] = useState<Employee[]>(MOCK_EMPLOYEES);
  
  // Selection & Modal States
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.eid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    if (selectedEmployeeIds.includes(id)) {
      setSelectedEmployeeIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedEmployeeIds(prev => [...prev, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedEmployeeIds.length === filteredEmployees.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(filteredEmployees.map(e => e.id));
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             Workforce Management
          </h1>
          <p className="text-slate-500 mt-1">Manage employee profiles, salary structures and data.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setIsAssignModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
            >
                <Briefcase size={16} /> Assign Salary Structure
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
         
         {/* Toolbar */}
         <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-2 w-full md:w-auto flex-1">
               <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search employees..." 
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
               </div>
               <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium flex items-center gap-2 shadow-sm">
                  <Filter size={16} /> Filter
               </button>
            </div>
            
            {selectedEmployeeIds.length > 0 && (
                <div className="text-sm text-slate-600 font-medium animate-in fade-in">
                    {selectedEmployeeIds.length} employees selected
                </div>
            )}
         </div>

         {/* Normal List View with Checkboxes */}
         <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                    <th className="px-4 py-4 w-10 text-center">
                        <input 
                            type="checkbox" 
                            checked={selectedEmployeeIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer w-4 h-4"
                        />
                    </th>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Joining Date</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">CTC</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className={`hover:bg-slate-50 transition-colors group ${selectedEmployeeIds.includes(emp.id) ? 'bg-purple-50/30' : ''}`}>
                        <td className="px-4 py-4 text-center">
                            <input 
                                type="checkbox" 
                                checked={selectedEmployeeIds.includes(emp.id)}
                                onChange={() => toggleSelection(emp.id)}
                                className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer w-4 h-4"
                            />
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <img src={emp.avatarUrl} alt="" className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 object-cover" />
                                <div>
                                <div className="font-semibold text-slate-800">{emp.name}</div>
                                <div className="text-xs text-slate-400 font-mono">{emp.eid}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-slate-300" />
                                {emp.joinDate}
                            </div>
                        </td>
                        <td className="px-6 py-4">{emp.department}</td>
                        <td className="px-6 py-4">{emp.location}</td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                {emp.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">{emp.ctc}</td>
                        <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onView(emp.id)} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors" title="View Profile"><Eye size={16} /></button>
                                <button onClick={() => onEdit(emp.id)} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors" title="Edit"><Edit2 size={16} /></button>
                                <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Archive"><Trash2 size={16} /></button>
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </div>

      <AssignStructureModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        preSelectedIds={selectedEmployeeIds}
        employees={employees}
      />
    </div>
  );
};

export default EmployeeList;
