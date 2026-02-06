import React, { useState, useRef } from 'react';
/* Added PieChart as PieChartIcon to lucide-react imports to fix the missing component error on line 885 */
import { Edit2, Save, Calendar, ChevronDown, Bell, Check, Info, AlertCircle, Clock, FileText, History, AlertTriangle, Plus, Trash2, X, ArrowUp, ArrowDown, UserCheck, ShieldCheck, Calculator, PieChart as PieChartIcon, Percent } from 'lucide-react';

const months = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];

const EMPLOYEES_LIST = [
    "Amit Verma (Manager)",
    "Rajesh Kumar (Finance Head)",
    "Sunita Gupta (Director)",
    "Kavita Sharma (HR)",
    "Vikram Singh (VP)",
    "Anjali Mehta (Team Lead)"
];

/**
 * Robust date formatter that handles potential invalid date objects safely.
 */
function formatDate(date: any) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'N/A';
  }
  return `${date.getDate().toString().padStart(2, '0')} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
}

/**
 * Helper to get ordinal day for Monthly info text
 */
function getOrdinalDay(date: Date) {
    const d = date.getDate();
    const s = ["th", "st", "nd", "rd"];
    const v = d % 100;
    return d + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Helper to convert a Date object to local YYYY-MM-DD string for input type="date"
 */
function toLocalISOString(date: Date): string {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
}

const DatePicker: React.FC<{
  date: Date;
  onChange: (date: Date) => void;
  label: string;
  disabled?: boolean;
  required?: boolean;
  subLabel?: string;
}> = ({ date, onChange, label, disabled = false, required = false, subLabel }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = `date-picker-${label.replace(/\s+/g, '-').toLowerCase()}`;

  const dateValue = (date instanceof Date && !isNaN(date.getTime())) ? date : new Date();

  const triggerPicker = (e?: React.MouseEvent) => {
    if (disabled || !inputRef.current) return;
    
    try {
      if ('showPicker' in HTMLInputElement.prototype) {
        inputRef.current.showPicker();
      } else {
        inputRef.current.focus();
        inputRef.current.click();
      }
    } catch (err) {
      inputRef.current.focus();
      inputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center cursor-pointer">
        {label} {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <div 
        onClick={triggerPicker}
        className={`relative w-full h-12 bg-white border rounded-2xl flex items-center transition-all shadow-sm ${disabled ? 'border-slate-100 bg-slate-50 cursor-not-allowed' : 'border-slate-200 hover:border-sky-400 cursor-pointer group'}`}
      >
        <div className="absolute inset-0 px-4 flex items-center justify-between pointer-events-none z-0">
          <div className="flex items-center gap-3">
            <Calendar size={20} className={`transition-colors ${disabled ? 'text-slate-300' : 'text-slate-400 group-hover:text-sky-50'}`} />
            <span className={`text-sm font-bold ${disabled ? 'text-slate-400' : 'text-slate-700/80'}`}>
              {formatDate(dateValue)}
            </span>
          </div>
          <ChevronDown size={18} className="text-slate-300" />
        </div>
        
        <input 
          ref={inputRef}
          id={inputId}
          type="date" 
          value={toLocalISOString(dateValue)} 
          onChange={(e) => { 
            if (e.target.value) {
              const [year, month, day] = e.target.value.split('-').map(Number);
              onChange(new Date(year, month - 1, day)); 
            }
          }}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed z-10"
          disabled={disabled}
        />
      </div>
      {subLabel && <p className="text-[10px] text-slate-400 mt-2 font-medium">{subLabel}</p>}
    </div>
  );
};

const IncomeTaxDeclarationSettings: React.FC = () => {
    // --- Investment Declaration State ---
    const [isEditingInv, setIsEditingInv] = useState(false);
    const [invEnabled, setInvEnabled] = useState(true);
    const [invDeadlineFrom, setInvDeadlineFrom] = useState(new Date(2026, 0, 1)); // Jan 1, 2026
    const [invDeadlineTo, setInvDeadlineTo] = useState(new Date(2026, 0, 15)); // Jan 15, 2026
    const [gracePeriodEnabled, setGracePeriodEnabled] = useState(false);
    const [gracePeriodDate, setGracePeriodDate] = useState(new Date(2026, 0, 20));
    const [declarationFrequency, setDeclarationFrequency] = useState('Annually');
    const [invApprovers, setInvApprovers] = useState<string[]>(["Kavita Sharma (HR)"]);
    const [selectedInvApprover, setSelectedInvApprover] = useState("");
    
    // Limits State
    const [limits, setLimits] = useState([
        { id: '1', section: '80C', limit: '1,50,000', description: 'Investments & Expenses' },
        { id: '2', section: '80D', limit: '25,000', description: 'Medical Insurance' }
    ]);

    // Regime State
    const [defaultRegime, setDefaultRegime] = useState('New Regime');
    const [allowSwitch, setAllowSwitch] = useState(true);
    const [switchLockDate, setSwitchLockDate] = useState(new Date(2025, 11, 31));

    // Alerts State
    const [notifyRelease, setNotifyRelease] = useState(true);
    const [emailReminder, setEmailReminder] = useState(false);
    const [notifyLock, setNotifyLock] = useState(true);

    // TDS Deduction Configuration State
    const [tdsAdjustmentMonth, setTdsAdjustmentMonth] = useState('April');
    const [deductTdsOnDeclaration, setDeductTdsOnDeclaration] = useState(true);
    const [considerPreviousIncome, setConsiderPreviousIncome] = useState(false);
    const [deductionPattern, setDeductionPattern] = useState<'Monthly' | 'Quarterly' | 'Custom'>('Monthly');
    const [selectedTdsMonths, setSelectedTdsMonths] = useState<string[]>(["April", "May", "June", "July", "August", "September", "November", "December", "January", "February"]);
    const [distributionMethod, setDistributionMethod] = useState('Equal Distribution Across Selected Months');
    const [minTdsThreshold, setMinTdsThreshold] = useState('10,000');
    const [maxTdsCap, setMaxTdsCap] = useState('10,000');
    const [tdsWeights, setTdsWeights] = useState<Record<string, number>>(() => {
        const initialWeights: Record<string, number> = {};
        months.forEach(m => {
            if (["April", "May", "June"].includes(m)) initialWeights[m] = 5;
            else if (["July", "August", "September"].includes(m)) initialWeights[m] = 8;
            else if (["November", "December"].includes(m)) initialWeights[m] = 10;
            else if (["January", "February"].includes(m)) initialWeights[m] = 15;
            else initialWeights[m] = 0;
        });
        return initialWeights;
    });

    // --- Proof of Investment State ---
    const [isEditingProof, setIsEditingProof] = useState(false);
    const [proofEnabled, setProofEnabled] = useState(true);
    const [proofDeadlineFrom, setProofDeadlineFrom] = useState(new Date(2026, 0, 1)); // Jan 1, 2026
    const [proofDeadlineTo, setProofDeadlineTo] = useState(new Date(2026, 1, 28)); // Feb 28, 2026
    const [proofGraceEnabled, setProofGraceEnabled] = useState(false);
    const [proofGraceDate, setProofGraceDate] = useState(new Date(2026, 2, 10)); // March 10, 2026
    const [mandatoryProof, setMandatoryProof] = useState(true);
    const [autoReject, setAutoReject] = useState(false);
    const [notifyRejection, setNotifyRejection] = useState(true);
    const [autoAdjustTDS, setAutoAdjustTDS] = useState(true);
    const [allowedFileTypes, setAllowedFileTypes] = useState<string[]>(['PDF', 'JPG', 'PNG']);
    const [proofApprovers, setProofApprovers] = useState<string[]>(["Rajesh Kumar (Finance Head)"]);
    const [selectedProofApprover, setSelectedProofApprover] = useState("");
    
    const [poiPayrollMonth, setPoiPayrollMonth] = useState('March');
    const [mandateComments, setMandateComments] = useState(true);

    const [npsIncludeInCtc, setNpsIncludeInCtc] = useState(true);
    const [npsWageCeiling, setNpsWageCeiling] = useState(false);

    // Backup states for cancel functionality
    const [invBackup, setInvBackup] = useState<any>(null);
    const [proofBackup, setProofBackup] = useState<any>(null);

    // -- Handlers for Investment Declaration --
    const handleEditInv = () => {
        setInvBackup({ 
            invEnabled, invDeadlineFrom, invDeadlineTo, gracePeriodEnabled, gracePeriodDate: new Date(gracePeriodDate), declarationFrequency, limits: JSON.parse(JSON.stringify(limits)), 
            defaultRegime, allowSwitch, switchLockDate,
            notifyRelease, emailReminder, notifyLock,
            invApprovers: [...invApprovers],
            tdsAdjustmentMonth, deductTdsOnDeclaration, considerPreviousIncome,
            deductionPattern, selectedTdsMonths: [...selectedTdsMonths],
            distributionMethod,
            tdsWeights: { ...tdsWeights },
            minTdsThreshold,
            maxTdsCap
        });
        setIsEditingInv(true);
    };

    const handleCancelInv = () => {
        if(invBackup) {
            setInvEnabled(invBackup.invEnabled);
            setInvDeadlineFrom(new Date(invBackup.invDeadlineFrom));
            setInvDeadlineTo(new Date(invBackup.invDeadlineTo));
            setGracePeriodEnabled(invBackup.gracePeriodEnabled);
            setGracePeriodDate(new Date(invBackup.gracePeriodDate));
            setDeclarationFrequency(invBackup.declarationFrequency);
            setLimits(invBackup.limits);
            setDefaultRegime(invBackup.defaultRegime);
            setAllowSwitch(invBackup.allowSwitch);
            setSwitchLockDate(new Date(invBackup.switchLockDate));
            setNotifyRelease(invBackup.notifyRelease);
            setEmailReminder(invBackup.emailReminder);
            setNotifyLock(invBackup.notifyLock);
            setInvApprovers(invBackup.invApprovers);
            setTdsAdjustmentMonth(invBackup.tdsAdjustmentMonth);
            setDeductTdsOnDeclaration(invBackup.deductTdsOnDeclaration);
            setConsiderPreviousIncome(invBackup.considerPreviousIncome);
            setDeductionPattern(invBackup.deductionPattern);
            setSelectedTdsMonths(invBackup.selectedTdsMonths);
            setDistributionMethod(invBackup.distributionMethod);
            setTdsWeights(invBackup.tdsWeights);
            setMinTdsThreshold(invBackup.minTdsThreshold);
            setMaxTdsCap(invBackup.maxTdsCap);
        }
        setIsEditingInv(false);
        setSelectedInvApprover("");
    };

    const handleSaveInv = () => {
        setIsEditingInv(false);
        setSelectedInvApprover("");
    };

    // -- Handlers for Proof of Investment --
    const handleEditProof = () => {
        setProofBackup({ 
            proofEnabled, proofDeadlineFrom, proofDeadlineTo, 
            proofGraceEnabled, proofGraceDate: new Date(proofGraceDate),
            mandatoryProof, autoReject, notifyRejection, autoAdjustTDS, allowedFileTypes,
            poiPayrollMonth, mandateComments, npsIncludeInCtc, npsWageCeiling,
            proofApprovers: [...proofApprovers]
        });
        setIsEditingProof(true);
    };

    const handleCancelProof = () => {
        if(proofBackup) {
            setProofEnabled(proofBackup.proofEnabled);
            setProofDeadlineFrom(new Date(proofBackup.proofDeadlineFrom));
            setProofDeadlineTo(new Date(proofBackup.proofDeadlineTo));
            setProofGraceEnabled(proofBackup.proofGraceEnabled);
            setProofGraceDate(new Date(proofBackup.proofGraceDate));
            setMandatoryProof(proofBackup.mandatoryProof);
            setAutoReject(proofBackup.autoReject);
            setNotifyRejection(proofBackup.notifyRejection);
            setAutoAdjustTDS(proofBackup.autoAdjustTDS);
            setAllowedFileTypes(proofBackup.allowedFileTypes);
            setPoiPayrollMonth(proofBackup.poiPayrollMonth);
            setMandateComments(proofBackup.mandateComments);
            setNpsIncludeInCtc(proofBackup.npsIncludeInCtc);
            setNpsWageCeiling(proofBackup.npsWageCeiling);
            setProofApprovers(proofBackup.proofApprovers);
        }
        setIsEditingProof(false);
        setSelectedProofApprover("");
    };

    const handleSaveProof = () => {
        setIsEditingProof(false);
        setSelectedProofApprover("");
    };

    const toggleFileType = (type: string) => {
        if (allowedFileTypes.includes(type)) {
            setAllowedFileTypes(allowedFileTypes.filter(t => t !== type));
        } else {
            setAllowedFileTypes([...allowedFileTypes, type]);
        }
    };

    // -- Hierarchy Handlers --
    const addApprover = (list: string[], setList: (val: string[]) => void, selected: string, setSelected: (val: string) => void) => {
        if (selected && !list.includes(selected)) {
            setList([...list, selected]);
        }
        setSelected("");
    };

    const removeApprover = (list: string[], setList: (val: string[]) => void, index: number) => {
        const newList = [...list];
        newList.splice(index, 1);
        setList(newList);
    };

    const moveApprover = (list: string[], setList: (val: string[]) => void, index: number, direction: number) => {
        if (index + direction < 0 || index + direction >= list.length) return;
        const newList = [...list];
        const temp = newList[index];
        newList[index] = newList[index + direction];
        newList[index + direction] = temp;
        setList(newList);
    };

    const distributionOptions = [
        {
            id: 'Equal Distribution Across Selected Months',
            label: 'Equal Distribution Across Selected Months',
            info: 'TDS will be divided equally across all selected months. The same amount will be deducted each month.'
        },
        {
            id: 'Weighted Distribution',
            label: 'Weighted Distribution',
            info: "Allows you to set different deduction percentages for different months based on your organization's requirements. Total of all percentages must equal 100%."
        },
        {
            id: 'Minimum Deduction Per Month Threshold',
            label: 'Minimum Deduction Per Month Threshold',
            info: 'Sets the minimum amount that must be deducted in any month. If the calculated deduction falls below this threshold, the system will automatically reduce the number of deduction months.'
        },
        {
            id: 'Maximum Deduction Per Month Cap',
            label: 'Maximum Deduction Per Month Cap',
            info: 'Sets the maximum amount that can be deducted in any single month to protect employee take-home salary. If calculated deduction exceeds this cap, the system will either add more months or flag a shortfall.'
        }
    ];

    const getDummyCalculation = (method: string) => {
        const totalTax = 120000;
        const selectedCount = selectedTdsMonths.length || 0;

        switch (method) {
            case 'Equal Distribution Across Selected Months':
                const perMonth = selectedCount > 0 ? Math.round(totalTax / selectedCount) : 0;
                return (
                    <div className="space-y-6 animate-in fade-in zoom-in-95">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-700">Annual TDS Liability: <span className="font-black">₹{totalTax.toLocaleString()}</span></p>
                            <p className="text-xs font-bold text-slate-700">Selected Months for Deduction: <span className="font-black">{selectedCount} months</span></p>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculation</p>
                            <p className="text-xs font-bold text-slate-700">Total TDS = ₹{totalTax.toLocaleString()}</p>
                            <p className="text-xs font-bold text-slate-700">Selected months = {selectedCount}</p>
                            <p className="text-xs font-black text-indigo-600">Per month deduction = ₹{totalTax.toLocaleString()} ÷ {selectedCount} = ₹{perMonth.toLocaleString()}</p>
                        </div>

                        <div className="space-y-3">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Month-wise Breakup:</h5>
                            <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-[11px] border-collapse">
                                    <thead className="bg-slate-50/50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-3 py-2 font-bold text-slate-500 uppercase">Month</th>
                                            <th className="px-3 py-2 font-bold text-slate-500 uppercase text-right">TDS Deducted</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {months.map(m => {
                                            const isSelected = selectedTdsMonths.includes(m);
                                            return (
                                                <tr key={m} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-3 py-1.5 font-medium text-slate-600">{m}</td>
                                                    <td className="px-3 py-1.5 text-right font-bold text-slate-700">
                                                        {isSelected ? `₹${perMonth.toLocaleString()}` : '₹0 (excluded)'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-slate-100/50 border-t border-slate-200">
                                        <tr className="font-black">
                                            <td className="px-3 py-2 text-slate-800">Total</td>
                                            <td className="px-3 py-2 text-right text-slate-900">₹{totalTax.toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'Weighted Distribution':
                const totalWeightW = selectedTdsMonths.reduce((sum, m) => sum + (tdsWeights[m] || 0), 0);
                return (
                    <div className="space-y-6 animate-in fade-in zoom-in-95">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-700">Annual TDS Liability: <span className="font-black">₹{totalTax.toLocaleString()}</span></p>
                            <p className="text-xs font-bold text-slate-700">Selected Months for Deduction: <span className="font-black">{selectedCount} months</span></p>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculation</p>
                            <p className="text-xs font-bold text-slate-700">Total TDS = ₹{totalTax.toLocaleString()}</p>
                        </div>

                        <div className="space-y-3">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Month-wise Breakup:</h5>
                            <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-[11px] border-collapse">
                                    <thead className="bg-slate-50/50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-3 py-2 font-bold text-slate-500 uppercase">Month</th>
                                            <th className="px-3 py-2 font-bold text-slate-500 uppercase">Weight</th>
                                            <th className="px-3 py-2 font-bold text-slate-500 uppercase">Calculation</th>
                                            <th className="px-3 py-2 font-bold text-slate-500 uppercase text-right">TDS Deducted</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {months.map(m => {
                                            const isSelected = selectedTdsMonths.includes(m);
                                            const weight = isSelected ? (tdsWeights[m] || 0) : 0;
                                            const monthTds = Math.round((totalTax * weight) / 100);
                                            return (
                                                <tr key={m} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-3 py-1.5 font-medium text-slate-600">{m}</td>
                                                    <td className="px-3 py-1.5 text-slate-700">{weight}%</td>
                                                    <td className="px-3 py-1.5 text-slate-50 text-slate-500 whitespace-nowrap">
                                                        {isSelected && weight > 0 ? `1,20,000 × ${weight}%` : '-'}
                                                    </td>
                                                    <td className="px-3 py-1.5 text-right font-bold text-slate-700">
                                                        {isSelected && weight > 0 ? `₹${monthTds.toLocaleString()}` : isSelected ? '₹0' : '₹0 (excluded)'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-slate-100/50 border-t border-slate-200">
                                        <tr className="font-black">
                                            <td className="px-3 py-2 text-slate-800">Total</td>
                                            <td className="px-3 py-2 text-slate-800">{totalWeightW}%</td>
                                            <td className="px-3 py-2"></td>
                                            <td className="px-3 py-2 text-right text-slate-900">₹{Math.round((totalTax * totalWeightW) / 100).toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'Minimum Deduction Per Month Threshold':
                const thresholdVal = parseInt(minTdsThreshold.replace(/,/g, '')) || 0;
                const equalDistMin = selectedCount > 0 ? Math.round(totalTax / selectedCount) : 0;
                const meetsMin = equalDistMin >= thresholdVal;

                let activeMonthLimit = selectedCount;
                let calculatedPerMonth = equalDistMin;
                
                if (!meetsMin && thresholdVal > 0) {
                    activeMonthLimit = Math.floor(totalTax / thresholdVal);
                    if (activeMonthLimit > 0) {
                        calculatedPerMonth = Math.floor(totalTax / activeMonthLimit);
                    } else {
                        calculatedPerMonth = totalTax;
                        activeMonthLimit = 1;
                    }
                }
                
                let currentActiveCount = 0;
                const totalCalculated = calculatedPerMonth * activeMonthLimit;
                const adjustmentRemainder = totalTax - totalCalculated;

                return (
                    <div className="space-y-6 animate-in fade-in zoom-in-95">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-700">Minimum <span className="font-black">₹{thresholdVal.toLocaleString()}</span> must be deducted per month</p>
                            <p className="text-xs font-bold text-slate-700 mt-3">Annual TDS Liability: <span className="font-black">₹{totalTax.toLocaleString()}</span></p>
                            <p className="text-xs font-bold text-slate-700">Selected months = <span className="font-black">{selectedCount}</span></p>
                            <p className="text-xs font-bold text-slate-700">
                                Equal distribution would be = <span className="font-black">₹{equalDistMin.toLocaleString()}/month</span> 
                                <span className={`ml-2 font-black ${meetsMin ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {meetsMin ? '✓ (meets minimum)' : '✗ (below minimum)'}
                                </span>
                            </p>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculation</p>
                            <p className="text-xs font-bold text-slate-700">Total TDS = ₹{totalTax.toLocaleString()}</p>
                        </div>

                        <div className="space-y-3">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Month-wise Breakup (Auto-adjusted):</h5>
                            <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-[11px] border-collapse">
                                    <thead className="bg-slate-50/50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-3 py-2 font-bold text-slate-500 uppercase">Month</th>
                                            <th className="px-3 py-2 font-bold text-slate-500 uppercase text-right">TDS Deducted</th>
                                            <th className="px-3 py-2 font-bold text-slate-500 uppercase">Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {months.map(m => {
                                            const isUserSelected = selectedTdsMonths.includes(m);
                                            let deductionAmount = 0;
                                            let reasonStr = "";

                                            if (!isUserSelected) {
                                                reasonStr = "Excluded";
                                            } else {
                                                if (currentActiveCount < activeMonthLimit) {
                                                    deductionAmount = (currentActiveCount === activeMonthLimit - 1) 
                                                        ? calculatedPerMonth + adjustmentRemainder 
                                                        : calculatedPerMonth;
                                                    currentActiveCount++;
                                                } else {
                                                    reasonStr = "Auto-excluded to meet minimum threshold";
                                                }
                                            }

                                            return (
                                                <tr key={m} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-3 py-1.5 font-medium text-slate-600">{m}</td>
                                                    <td className="px-3 py-1.5 text-right font-bold text-slate-700">
                                                        ₹{deductionAmount.toLocaleString()}
                                                    </td>
                                                    <td className="px-3 py-1.5 text-slate-500 italic">
                                                        {reasonStr}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-slate-100/50 border-t border-slate-200">
                                        <tr className="font-black">
                                            <td className="px-3 py-2 text-slate-800">Total</td>
                                            <td className="px-3 py-2 text-right text-slate-900">₹{totalTax.toLocaleString()}</td>
                                            <td className="px-3 py-2"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'Maximum Deduction Per Month Cap':
                const capVal = parseInt(maxTdsCap.replace(/,/g, '')) || 0;
                const eqDistMax = selectedCount > 0 ? Math.round(totalTax / selectedCount) : 0;
                const isWithin = eqDistMax <= capVal;
                
                let totalDeductedInTableMax = 0;

                return (
                    <div className="space-y-6 animate-in fade-in zoom-in-95">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-700">Maximum <span className="font-black">₹{capVal.toLocaleString()}</span> must be deducted per month</p>
                            <p className="text-xs font-bold text-slate-700 mt-3">Annual TDS Liability: <span className="font-black">₹{totalTax.toLocaleString()}</span></p>
                            <p className="text-xs font-bold text-slate-700">Selected months = <span className="font-black">{selectedCount}</span></p>
                            <p className="text-xs font-bold text-slate-700">
                                Equal distribution = <span className="font-black">₹{eqDistMax.toLocaleString()}/month</span> 
                                <span className={`ml-2 font-black ${isWithin ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {isWithin ? '✓ (within cap)' : '✗ (exceeds cap)'}
                                </span>
                            </p>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculation</p>
                            <p className="text-xs font-bold text-slate-700">Total TDS = ₹{totalTax.toLocaleString()}</p>
                        </div>

                        <div className="space-y-3">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Month-wise Breakup:</h5>
                            <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-[11px] border-collapse">
                                    <thead className="bg-slate-50/50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-3 py-2 font-bold text-slate-500 uppercase">Month</th>
                                            <th className="px-3 py-2 font-bold text-slate-500 uppercase text-right">TDS Deducted</th>
                                            <th className="px-3 py-2 font-bold text-slate-500 uppercase">Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {months.map(m => {
                                            const isMonthSelected = selectedTdsMonths.includes(m);
                                            let deducted = 0;
                                            let reason = "";

                                            if (!isMonthSelected) {
                                                reason = "Excluded";
                                            } else {
                                                deducted = Math.min(capVal, eqDistMax);
                                                totalDeductedInTableMax += deducted;
                                            }

                                            return (
                                                <tr key={m} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-3 py-1.5 font-medium text-slate-600">{m}</td>
                                                    <td className="px-3 py-1.5 text-right font-bold text-slate-700">
                                                        ₹{deducted.toLocaleString()}
                                                    </td>
                                                    <td className="px-3 py-1.5 text-slate-500 italic">
                                                        {reason}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-slate-100/50 border-t border-slate-200">
                                        <tr className="font-black border-b border-slate-100">
                                            <td className="px-3 py-2 text-slate-800">Total Deducted</td>
                                            <td className="px-3 py-2 text-right text-slate-900">₹{totalDeductedInTableMax.toLocaleString()}</td>
                                            <td className="px-3 py-2"></td>
                                        </tr>
                                        {totalTax - totalDeductedInTableMax > 0 && (
                                            <tr className="font-black text-rose-600 bg-rose-50/30">
                                                <td className="px-3 py-2 uppercase text-[9px] tracking-wider">Carry Forward</td>
                                                <td className="px-3 py-2 text-right">₹{(totalTax - totalDeductedInTableMax).toLocaleString()}</td>
                                                <td className="px-3 py-2 text-[9px] font-normal italic uppercase">Shortfall due to cap</td>
                                            </tr>
                                        )}
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    }

    const handleWeightChange = (month: string, val: string) => {
        const num = Math.min(100, Math.max(0, parseInt(val) || 0));
        setTdsWeights(prev => ({ ...prev, [month]: num }));
    };

    return (
        <div className="h-full overflow-y-auto bg-slate-50 relative">
            {/* Top Summary Banner */}
            <div className="bg-indigo-50 border-b border-indigo-100 py-3 text-center sticky top-0 z-20">
                <p className="text-sm font-medium text-indigo-900 flex items-center justify-center gap-2">
                    <Info size={16} className="text-indigo-600"/>
                    Current Financial Year: <span className="font-bold">2025–26</span> · Declarations open until <span className="font-bold">15 Jan 2026</span>
                </p>
            </div>

            <div className="p-4 lg:p-8 w-full mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
                
                {/* 1. Investment Declaration Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-bold text-slate-800">Investment Declaration</h3>
                                {!isEditingInv && (
                                    <button onClick={handleEditInv} className="text-slate-400 hover:text-indigo-600 transition-colors p-1 hover:bg-slate-50 rounded">
                                        <Edit2 size={16} />
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-slate-500">Allow employees to declare tax-saving investments under Section 80C, 80D, HRA, etc.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {isEditingInv ? (
                                <div className="flex gap-2 animate-in fade-in slide-in-from-right-2">
                                    <button onClick={handleCancelInv} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">Cancel</button>
                                    <button onClick={handleSaveInv} className="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Save</button>
                                </div>
                            ) : null}
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={invEnabled} 
                                        onChange={() => setInvEnabled(!invEnabled)} 
                                        disabled={!isEditingInv} 
                                        className="sr-only peer" 
                                    />
                                    <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    {invEnabled && (
                        <div className="p-8 space-y-8 animate-in slide-in-from-top-2">

                            {/* Declaration Settings Section */}
                            <div className="pt-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Declaration Settings</h4>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Declaration Frequency</label>
                                        <div className="flex gap-8">
                                            {['Monthly', 'Annually'].map((option) => (
                                                <label key={option} className={`flex items-center gap-2.5 ${isEditingInv ? 'cursor-pointer' : 'cursor-default'} group`}>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${declarationFrequency === option ? 'border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                                                        {declarationFrequency === option && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                                                    </div>
                                                    <input 
                                                        type="radio" 
                                                        name="declarationFrequency" 
                                                        value={option}
                                                        checked={declarationFrequency === option} 
                                                        onChange={() => isEditingInv && setDeclarationFrequency(option)} 
                                                        className="hidden" 
                                                        disabled={!isEditingInv}
                                                    />
                                                    <span className={`text-sm ${declarationFrequency === option ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Declaration Deadline</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                                            <DatePicker 
                                                label="From Date" 
                                                date={invDeadlineFrom} 
                                                onChange={setInvDeadlineFrom} 
                                                disabled={!isEditingInv}
                                                required
                                            />
                                            <DatePicker 
                                                label="To Date" 
                                                date={invDeadlineTo} 
                                                onChange={setInvDeadlineTo} 
                                                disabled={!isEditingInv}
                                                required
                                            />
                                        </div>

                                        {/* Grace Period Field */}
                                        <div className="mt-6 space-y-4">
                                            <div className="flex items-center justify-between max-w-2xl bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                                <span className="text-sm font-bold text-slate-700">Grace period after deadline?</span>
                                                <label className={`relative inline-flex items-center ${isEditingInv ? 'cursor-pointer' : 'cursor-default'}`}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={gracePeriodEnabled} 
                                                        onChange={() => isEditingInv && setGracePeriodEnabled(!gracePeriodEnabled)} 
                                                        disabled={!isEditingInv} 
                                                        className="sr-only peer" 
                                                    />
                                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                                </label>
                                            </div>
                                            {gracePeriodEnabled && (
                                                <div className="max-sm animate-in fade-in slide-in-from-top-2">
                                                    <DatePicker 
                                                        label="Grace Period End Date" 
                                                        date={gracePeriodDate} 
                                                        onChange={setGracePeriodDate} 
                                                        disabled={!isEditingInv}
                                                        required
                                                        subLabel="Allows submissions for a limited time after the official deadline"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {declarationFrequency === 'Monthly' && (
                                            <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-100 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
                                                <Info size={18} className="text-blue-600 mt-0.5 shrink-0" />
                                                <p className="text-sm text-blue-800 font-medium leading-relaxed">
                                                    Investment Declaration window will be active from <span className="font-bold underline decoration-blue-300 underline-offset-2">{getOrdinalDay(invDeadlineFrom)}</span> to <span className="font-bold underline decoration-blue-300 underline-offset-2">{getOrdinalDay(invDeadlineTo)}</span>.
                                                </p>
                                            </div>
                                        )}
                                        {declarationFrequency === 'Annually' && (
                                            <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-100 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
                                                <Info size={18} className="text-blue-600 mt-0.5 shrink-0" />
                                                <p className="text-sm text-blue-800 font-medium leading-relaxed">
                                                    Investment Declaration window will be active from <span className="font-bold underline decoration-blue-300 underline-offset-2">{formatDate(invDeadlineFrom)}</span> to <span className="font-bold underline decoration-blue-300 underline-offset-2">{formatDate(invDeadlineTo)}</span>.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Investment Limits Configuration */}
                            <div className="pt-2 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Investment Limits Configuration</h4>
                                    {isEditingInv && (
                                        <button 
                                            onClick={() => setLimits([...limits, { id: Date.now().toString(), section: '', limit: '', description: '' }])}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                        >
                                            <Plus size={14} /> Add Row
                                        </button>
                                    )}
                                </div>
                                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-3">Section</th>
                                                <th className="px-4 py-3">Max Limit (₹)</th>
                                                <th className="px-4 py-3">Description</th>
                                                {isEditingInv && <th className="px-4 py-3 w-10"></th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {limits.map((limit, idx) => (
                                                <tr key={limit.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-3 font-bold text-slate-700">
                                                        {isEditingInv ? (
                                                            <input 
                                                                type="text" 
                                                                value={limit.section} 
                                                                onChange={(e) => {
                                                                    const newLimits = [...limits];
                                                                    newLimits[idx].section = e.target.value;
                                                                    setLimits(newLimits);
                                                                }}
                                                                className="w-24 px-2 py-1 border border-slate-200 rounded focus:border-indigo-500 outline-none"
                                                            />
                                                        ) : limit.section}
                                                    </td>
                                                    <td className="px-4 py-3 font-black text-slate-800">
                                                        {isEditingInv ? (
                                                            <input 
                                                                type="text" 
                                                                value={limit.limit} 
                                                                onChange={(e) => {
                                                                    const newLimits = [...limits];
                                                                    newLimits[idx].limit = e.target.value;
                                                                    setLimits(newLimits);
                                                                }}
                                                                className="w-32 px-2 py-1 border border-slate-200 rounded focus:border-indigo-500 outline-none"
                                                            />
                                                        ) : limit.limit}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">
                                                        {isEditingInv ? (
                                                            <input 
                                                                type="text" 
                                                                value={limit.description} 
                                                                onChange={(e) => {
                                                                    const newLimits = [...limits];
                                                                    newLimits[idx].description = e.target.value;
                                                                    setLimits(newLimits);
                                                                }}
                                                                className="w-full px-2 py-1 border border-slate-200 rounded focus:border-indigo-500 outline-none"
                                                            />
                                                        ) : limit.description}
                                                    </td>
                                                    {isEditingInv && (
                                                        <td className="px-4 py-3 text-right">
                                                            <button 
                                                                onClick={() => setLimits(limits.filter(l => l.id !== limit.id))}
                                                                className="text-slate-300 hover:text-rose-500 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Regime & Locking Settings */}
                            <div className="pt-2 border-t border-slate-100 space-y-6">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Tax Regime & Switching</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Default Tax Regime</label>
                                        <div className="relative">
                                            <select 
                                                value={defaultRegime}
                                                onChange={(e) => setDefaultRegime(e.target.value)}
                                                disabled={!isEditingInv}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white appearance-none focus:outline-none focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-600"
                                            >
                                                <option>New Regime</option>
                                                <option>Old Regime</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Switching Window Lock Date</label>
                                        <DatePicker 
                                            label="Lock Date" 
                                            date={switchLockDate} 
                                            onChange={setSwitchLockDate} 
                                            disabled={!isEditingInv}
                                            subLabel="Last date for employees to switch between Old & New regime"
                                        />
                                    </div>
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer group pt-2">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${allowSwitch ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                        {allowSwitch && <Check size={14} className="text-white" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={allowSwitch} onChange={() => isEditingInv && setAllowSwitch(!allowSwitch)} disabled={!isEditingInv} />
                                    <span className="text-sm font-semibold text-slate-700">Allow employees to switch tax regime until lock date</span>
                                </label>
                            </div>

                            {/* Approval Hierarchy Section */}
                            <div className="pt-2 border-t border-slate-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approval Hierarchy</h4>
                                    <div className="group relative inline-block">
                                        <Info size={14} className="text-slate-400 cursor-help" />
                                        <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 text-center leading-relaxed font-normal normal-case whitespace-nowrap border border-slate-700">
                                            The specified employees will be notified when a declaration is submitted for review.
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                    <div className="flex gap-4 mb-4">
                                        <div className="relative flex-1">
                                            <select 
                                                value={selectedInvApprover}
                                                onChange={(e) => setSelectedInvApprover(e.target.value)}
                                                disabled={!isEditingInv}
                                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 appearance-none focus:outline-none focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                                            >
                                                <option value="">Select Employee to Add...</option>
                                                {EMPLOYEES_LIST.map(emp => (
                                                    <option key={emp} value={emp} disabled={invApprovers.includes(emp)}>{emp}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                        <button 
                                            onClick={() => addApprover(invApprovers, setInvApprovers, selectedInvApprover, setSelectedInvApprover)}
                                            disabled={!isEditingInv || !selectedInvApprover}
                                            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            <Plus size={18} /> Add
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {invApprovers.length > 0 ? invApprovers.map((approver, index) => (
                                            <div key={approver} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl group hover:border-indigo-200 transition-colors shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black">
                                                        {index + 1}
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-700">{approver}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {isEditingInv && (
                                                        <>
                                                            <button 
                                                                onClick={() => moveApprover(invApprovers, setInvApprovers, index, -1)}
                                                                disabled={index === 0}
                                                                className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20 rounded-lg hover:bg-slate-50 transition-colors"
                                                            >
                                                                <ArrowUp size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => moveApprover(invApprovers, setInvApprovers, index, 1)}
                                                                disabled={index === invApprovers.length - 1}
                                                                className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20 rounded-lg hover:bg-slate-50 transition-colors"
                                                            >
                                                                <ArrowDown size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => removeApprover(invApprovers, setInvApprovers, index)}
                                                                className="p-1.5 text-slate-300 hover:text-rose-500 ml-1 rounded-lg hover:bg-rose-50 transition-colors"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-6 text-slate-400 text-xs italic bg-white rounded-xl border border-dashed border-slate-200">
                                                No approvers added for Investment Declaration.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Alerts */}
                            <div className="pt-4 border-t border-slate-100">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                                    <Bell size={16} className="text-slate-400" /> Manage alerts for Employees
                                </h4>
                                <p className="text-sm text-slate-500 mb-4">Let employer send mail notifications and reminders automatically based on the configured lock date.</p>
                                <div className="space-y-3 pl-1">
                                    <label className={`flex items-center gap-3 group ${isEditingInv ? 'cursor-pointer' : ''}`}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${notifyRelease ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                            {notifyRelease && <Check size={14} className="text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={notifyRelease} onChange={() => isEditingInv && setNotifyRelease(!notifyRelease)} disabled={!isEditingInv} />
                                        <span className="text-sm text-slate-700">Notify when IT Declaration is RELEASED</span>
                                    </label>
                                    <label className={`flex items-center gap-3 group ${isEditingInv ? 'cursor-pointer' : ''}`}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${emailReminder ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                            {emailReminder && <Check size={14} className="text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={emailReminder} onChange={() => isEditingInv && setEmailReminder(!emailReminder)} disabled={!isEditingInv} />
                                        <span className="text-sm text-slate-700">Enable e-mail reminder to employees to submit before lock date</span>
                                    </label>
                                    <label className={`flex items-center gap-3 group ${isEditingInv ? 'cursor-pointer' : ''}`}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${notifyLock ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                            {notifyLock && <Check size={14} className="text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={notifyLock} onChange={() => isEditingInv && setNotifyLock(!notifyLock)} disabled={!isEditingInv} />
                                        <span className="text-sm text-slate-700">Notify when IT Declaration is LOCKED</span>
                                    </label>
                                </div>
                            </div>

                            {/* TDS Deduction Configuration */}
                            <div className="pt-6 border-t border-slate-100">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
                                    <Calculator size={16} className="text-slate-400" /> TDS Deduction Configuration
                                </h4>
                                
                                <div className="space-y-4 pl-1 mb-6">
                                     <label className={`flex items-center gap-3 group ${isEditingInv ? 'cursor-pointer' : ''}`}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${deductTdsOnDeclaration ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                            {deductTdsOnDeclaration && <Check size={14} className="text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={deductTdsOnDeclaration} onChange={() => isEditingInv && setDeductTdsOnDeclaration(!deductTdsOnDeclaration)} disabled={!isEditingInv} />
                                        <span className="text-sm text-slate-700">Enable TDS calculation based on declarations</span>
                                    </label>
                                    
                                    <label className={`flex items-center gap-3 group ${isEditingInv ? 'cursor-pointer' : ''}`}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${considerPreviousIncome ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                            {considerPreviousIncome && <Check size={14} className="text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={considerPreviousIncome} onChange={() => isEditingInv && setConsiderPreviousIncome(!considerPreviousIncome)} disabled={!isEditingInv} />
                                        <span className="text-sm text-slate-700">Consider previous employment income for TDS calculation</span>
                                    </label>
                                </div>

                                <div className="mt-4 pl-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Deduction Pattern</label>
                                    <div className="flex gap-6 mb-4">
                                        {['Monthly', 'Quarterly', 'Custom'].map((p) => (
                                            <label key={p} className={`flex items-center gap-2 cursor-pointer group ${!isEditingInv ? 'opacity-70' : ''}`}>
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${deductionPattern === p ? 'border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                                                    {deductionPattern === p && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                                                </div>
                                                <input 
                                                    type="radio" 
                                                    name="deductionPattern" 
                                                    className="hidden" 
                                                    checked={deductionPattern === p} 
                                                    onChange={() => {
                                                        if (!isEditingInv) return;
                                                        setDeductionPattern(p as any);
                                                        if (p === 'Monthly') {
                                                            setSelectedTdsMonths([...months]);
                                                        } else if (p === 'Quarterly') {
                                                            setSelectedTdsMonths(["June", "September", "December", "March"]);
                                                        }
                                                    }} 
                                                />
                                                <span className="text-sm text-slate-700">{p}</span>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        {months.map(m => (
                                            <label key={m} className={`flex items-center gap-2 group ${isEditingInv ? 'cursor-pointer' : 'cursor-default'}`}>
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedTdsMonths.includes(m) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}>
                                                    {selectedTdsMonths.includes(m) && <Check size={12} className="text-white" />}
                                                </div>
                                                <input 
                                                    type="checkbox" 
                                                    className="hidden" 
                                                    checked={selectedTdsMonths.includes(m)}
                                                    onChange={() => {
                                                        if (!isEditingInv) return;
                                                        setDeductionPattern('Custom');
                                                        setSelectedTdsMonths(prev => 
                                                            prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
                                                        );
                                                    }}
                                                    disabled={!isEditingInv}
                                                />
                                                <span className="text-xs font-medium text-slate-600">{m}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 pl-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Distribution Method</label>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                        {/* Method Selection */}
                                        <div className="space-y-4">
                                            {distributionOptions.map((option) => (
                                                <div key={option.id} className="space-y-4">
                                                    <label className={`flex flex-col p-4 border rounded-xl transition-all group ${distributionMethod === option.id ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-100'} ${!isEditingInv ? 'opacity-70' : 'cursor-pointer'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${distributionMethod === option.id ? 'border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                                                                {distributionMethod === option.id && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                                                            </div>
                                                            <input 
                                                                type="radio" 
                                                                name="distributionMethod" 
                                                                className="hidden" 
                                                                checked={distributionMethod === option.id} 
                                                                onChange={() => isEditingInv && setDistributionMethod(option.id)} 
                                                                disabled={!isEditingInv}
                                                            />
                                                            <span className={`text-sm ${distributionMethod === option.id ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                                                                {option.label}
                                                                {option.id === 'Maximum Deduction Per Month Cap' && (
                                                                    <div className="group/info relative inline-block ml-1.5 align-middle">
                                                                        <Info size={14} className="text-slate-400 hover:text-indigo-600 transition-colors cursor-help" />
                                                                        <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-[100] text-center leading-relaxed font-normal normal-case whitespace-normal">
                                                                            If any shortfall of TDS, HR can select months and adjust the TDS Deduction.
                                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-xs text-slate-500 leading-relaxed ml-7 font-medium">
                                                            {option.info}
                                                        </p>
                                                    </label>

                                                    {distributionMethod === 'Weighted Distribution' && option.id === 'Weighted Distribution' && (
                                                        <div className="ml-7 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 p-4 bg-white border border-indigo-100 rounded-xl animate-in fade-in slide-in-from-top-2">
                                                            <div className="col-span-full flex justify-between items-center mb-1">
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Set Weights for Selected Months</p>
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedTdsMonths.reduce((s, m) => s + (tdsWeights[m] || 0), 0) === 100 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                                                                    Total: {selectedTdsMonths.reduce((s, m) => s + (tdsWeights[m] || 0), 0)}%
                                                                </span>
                                                            </div>
                                                            {selectedTdsMonths.map(m => (
                                                                <div key={m} className="flex items-center justify-between gap-2">
                                                                    <span className="text-xs font-semibold text-slate-600 min-w-[70px]">{m}</span>
                                                                    <div className="relative flex-1 max-w-[80px]">
                                                                        <input 
                                                                            type="number" 
                                                                            value={tdsWeights[m] || 0}
                                                                            onChange={(e) => handleWeightChange(m, e.target.value)}
                                                                            disabled={!isEditingInv}
                                                                            className="w-full pl-2 pr-6 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 disabled:bg-slate-50"
                                                                        />
                                                                        <Percent size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {distributionMethod === 'Minimum Deduction Per Month Threshold' && option.id === 'Minimum Deduction Per Month Threshold' && (
                                                        <div className="ml-7 p-4 bg-white border border-indigo-100 rounded-xl animate-in fade-in slide-in-from-top-2">
                                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Set Minimum Threshold Amount</label>
                                                            <div className="relative max-w-[200px]">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                                <input 
                                                                    type="text" 
                                                                    value={minTdsThreshold}
                                                                    onChange={(e) => {
                                                                        const raw = e.target.value.replace(/[^\d]/g, '');
                                                                        const formatted = raw ? parseInt(raw).toLocaleString('en-IN') : '';
                                                                        setMinTdsThreshold(formatted);
                                                                    }}
                                                                    disabled={!isEditingInv}
                                                                    className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 disabled:bg-slate-50"
                                                                />
                                                            </div>
                                                            <p className="mt-2 text-[10px] text-slate-400 italic font-medium">If projected TDS is less than this amount, deduction will be skipped for that month.</p>
                                                        </div>
                                                    )}

                                                    {distributionMethod === 'Maximum Deduction Per Month Cap' && option.id === 'Maximum Deduction Per Month Cap' && (
                                                        <div className="ml-7 p-4 bg-white border border-indigo-100 rounded-xl animate-in fade-in slide-in-from-top-2">
                                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Set Maximum Payout Cap Amount</label>
                                                            <div className="relative max-w-[200px]">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                                <input 
                                                                    type="text" 
                                                                    value={maxTdsCap}
                                                                    onChange={(e) => {
                                                                        const raw = e.target.value.replace(/[^\d]/g, '');
                                                                        const formatted = raw ? parseInt(raw).toLocaleString('en-IN') : '';
                                                                        setMaxTdsCap(formatted);
                                                                    }}
                                                                    disabled={!isEditingInv}
                                                                    className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 disabled:bg-slate-50"
                                                                />
                                                            </div>
                                                            <p className="mt-2 text-[10px] text-slate-400 italic font-medium">Any excess tax amount beyond this cap will be carried forward to next payroll.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Preview Section */}
                                        <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm sticky top-24">
                                            <div className="flex items-center gap-2 mb-6 text-indigo-600">
                                                <PieChartIcon size={18} />
                                                <h5 className="text-xs font-black uppercase tracking-widest">Calculation Preview (Demo Data)</h5>
                                            </div>
                                            <div className="mb-6 pb-6 border-b border-slate-100 flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Projected TDS</p>
                                                    <p className="text-2xl font-black text-slate-900">₹ 1,20,000</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Method Applied</p>
                                                    <p className="text-xs font-bold text-indigo-600">{distributionMethod.split(' ')[0]}...</p>
                                                </div>
                                            </div>

                                            {getDummyCalculation(distributionMethod)}
                                            
                                            <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                                                    <Info size={12} /> System Note
                                                </div>
                                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                                    This preview is for illustrative purposes only. Actual values will vary per employee based on their salary structure, joined date, and approved declarations.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Other Configurations for Investment Declaration */}
                            <div className="pt-6 border-t border-slate-100">
                                <h4 className="text-sm font-bold text-slate-800 mb-4">Other Configurations</h4>
                                <div className="space-y-4">
                                    <label className={`flex items-center gap-3 group ${isEditingInv ? 'cursor-pointer' : ''}`}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${mandateComments ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                            {mandateComments && <Check size={14} className="text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={mandateComments} onChange={() => isEditingInv && setMandateComments(!mandateComments)} disabled={!isEditingInv} />
                                        <span className="text-sm text-slate-700">Mandate reviewer comments for investment declaration rejection</span>
                                    </label>
                                </div>
                            </div>

                            {/* Progress Stats */}
                            <div className="pt-2 border-t border-slate-100">
                                <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                                    <span>Declarations Submitted</span>
                                    <span className="text-emerald-600">1,200/1,842 (65%)</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <div className="bg-emerald-50 h-2.5 rounded-full w-[65%]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Proof of Investment Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-bold text-slate-800">Proof of Investment</h3>
                                {!isEditingProof && (
                                    <button onClick={handleEditProof} className="text-slate-400 hover:text-indigo-600 transition-colors p-1 hover:bg-slate-50 rounded">
                                        <Edit2 size={16} />
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-slate-500">Mandate employees to upload proof (e.g., receipts, architects, forms, statements) for declared investments.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {isEditingProof ? (
                                <div className="flex gap-2 animate-in fade-in slide-in-from-right-2">
                                    <button onClick={handleCancelProof} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">Cancel</button>
                                    <button onClick={handleSaveProof} className="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Save</button>
                                </div>
                            ) : null}
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={proofEnabled} onChange={() => setProofEnabled(!proofEnabled)} disabled={!isEditingProof} className="sr-only peer" />
                                    <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {proofEnabled && (
                        <div className="p-8 space-y-8 animate-in slide-in-from-top-2">
                            {/* Row 1: Deadline & File Types */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">Proof Submission Deadline</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <DatePicker 
                                            label="From Date" 
                                            date={proofDeadlineFrom} 
                                            onChange={setProofDeadlineFrom} 
                                            required
                                            disabled={!isEditingProof}
                                        />
                                        <DatePicker 
                                            label="To Date" 
                                            date={proofDeadlineTo} 
                                            onChange={setProofDeadlineTo} 
                                            required
                                            disabled={!isEditingProof}
                                        />
                                    </div>

                                    {/* Grace Period Field for POI */}
                                    <div className="mt-6 space-y-4">
                                        <div className="flex items-center justify-between max-w-2xl bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                            <span className="text-sm font-bold text-slate-700">Grace period after deadline?</span>
                                            <label className={`relative inline-flex items-center ${isEditingProof ? 'cursor-pointer' : 'cursor-default'}`}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={proofGraceEnabled} 
                                                    onChange={() => isEditingProof && setProofGraceEnabled(prev => !prev)} 
                                                    disabled={!isEditingProof} 
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                            </label>
                                        </div>
                                        {proofGraceEnabled && (
                                            <div className="animate-in fade-in slide-in-from-top-2">
                                                <DatePicker 
                                                    label="Grace Period End Date" 
                                                    date={proofGraceDate} 
                                                    onChange={setProofGraceDate} 
                                                    disabled={!isEditingProof}
                                                    required
                                                    subLabel="Allow proof uploads for a short period after the official deadline"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-[10px] text-slate-400 mt-2 font-medium italic">For final TDS adjustment and 24Q filing</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Allowed File Types</label>
                                    <div className="flex wrap gap-2">
                                        {['PDF', 'JPG', 'PNG', 'ZIP'].map(type => {
                                            const isSelected = allowedFileTypes.includes(type);
                                            return (
                                                <button
                                                    key={type}
                                                    onClick={() => isEditingProof && toggleFileType(type)}
                                                    disabled={!isEditingProof}
                                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all uppercase ${
                                                        isSelected 
                                                            ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm' 
                                                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                                    } ${isEditingProof ? 'cursor-pointer hover:border-purple-300' : 'cursor-default opacity-80'}`}
                                                >
                                                    {type}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2">Max file size: 5MB per document</p>
                                </div>
                            </div>

                            {/* Approval Hierarchy Section - NEW for POI */}
                            <div className="pt-2 border-t border-slate-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">POI Approval Hierarchy</h4>
                                    <Info size={12} className="text-slate-400" />
                                </div>
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                    <div className="flex gap-4 mb-4">
                                        <div className="relative flex-1">
                                            <select 
                                                value={selectedProofApprover}
                                                onChange={(e) => setSelectedProofApprover(e.target.value)}
                                                disabled={!isEditingProof}
                                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 appearance-none focus:outline-none focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                                            >
                                                <option value="">Select Employee to Add...</option>
                                                {EMPLOYEES_LIST.map(emp => (
                                                    <option key={emp} value={emp} disabled={proofApprovers.includes(emp)}>{emp}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                        <button 
                                            onClick={() => addApprover(proofApprovers, setProofApprovers, selectedProofApprover, setSelectedProofApprover)}
                                            disabled={!isEditingProof || !selectedProofApprover}
                                            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        >
                                            <Plus size={18} /> Add
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {proofApprovers.length > 0 ? proofApprovers.map((approver, index) => (
                                            <div key={approver} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl group hover:border-indigo-200 transition-colors shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black">
                                                        {index + 1}
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-700">{approver}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {isEditingProof && (
                                                        <>
                                                            <button 
                                                                onClick={() => moveApprover(proofApprovers, setProofApprovers, index, -1)}
                                                                disabled={index === 0}
                                                                className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20 rounded-lg hover:bg-slate-50 transition-colors"
                                                            >
                                                                <ArrowUp size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => moveApprover(proofApprovers, setProofApprovers, index, 1)}
                                                                disabled={index === proofApprovers.length - 1}
                                                                className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20 rounded-lg hover:bg-slate-50 transition-colors"
                                                            >
                                                                <ArrowDown size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => removeApprover(proofApprovers, setProofApprovers, index)}
                                                                className="p-1.5 text-slate-300 hover:text-rose-500 ml-1 rounded-lg hover:bg-rose-50 transition-colors"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-6 text-slate-400 text-xs italic bg-white rounded-xl border border-dashed border-slate-200">
                                                No approvers added for Proof of Investment.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Toggles Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 pt-2">
                                <label className={`flex items-center justify-between group ${isEditingProof ? 'cursor-pointer' : ''}`}>
                                    <span className="text-sm font-bold text-slate-700">Mandatory for All Declarations</span>
                                    <div className="relative inline-flex items-center">
                                        <input type="checkbox" checked={mandatoryProof} onChange={() => isEditingProof && setMandatoryProof(!mandatoryProof)} disabled={!isEditingProof} className="sr-only peer" />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                    </div>
                                </label>

                                <label className={`flex items-center justify-between group ${isEditingProof ? 'cursor-pointer' : ''}`}>
                                    <span className="text-sm font-bold text-slate-700">Link to TDS Adjustment</span>
                                    <div className="relative inline-flex items-center">
                                        <input type="checkbox" checked={autoAdjustTDS} onChange={() => isEditingProof && setAutoAdjustTDS(!autoAdjustTDS)} disabled={!isEditingProof} className="sr-only peer" />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                    </div>
                                </label>
                                <p className="text-xs text-slate-500 -mt-4 col-span-1 md:col-start-2">Auto-adjust TDS based on verified proofs</p>

                                <div className="col-span-1 md:col-span-2 bg-rose-50 border border-rose-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle size={20} className="text-rose-500" />
                                        <div>
                                            <span className="text-sm font-bold text-rose-800 block">Auto-reject if no proof by deadline</span>
                                            <span className="text-xs text-rose-600">Declarations without proofs will be rejected after {formatDate(proofDeadlineTo)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <label className={`flex items-center gap-2 group ${isEditingProof ? 'cursor-pointer' : ''}`}>
                                            <span className="text-xs font-bold text-rose-700">Enable</span>
                                            <div className="relative inline-flex items-center">
                                                <input type="checkbox" checked={autoReject} onChange={() => isEditingProof && setAutoReject(!autoReject)} disabled={!isEditingProof} className="sr-only peer" />
                                                <div className="w-9 h-5 bg-rose-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-rose-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                                            </div>
                                        </label>
                                        {autoReject && (
                                            <label className={`flex items-center gap-2 group ${isEditingProof ? 'cursor-pointer' : ''}`}>
                                                <input type="checkbox" checked={notifyRejection} onChange={() => isEditingProof && setNotifyRejection(!notifyRejection)} disabled={!isEditingProof} className="rounded text-rose-600 focus:ring-rose-500" />
                                                <span className="text-xs font-bold text-rose-700">Notify on Rejection</span>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payroll Month Processing */}
                            <div className="pt-6 border-t border-slate-100">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="flex-1">
                                         <label className="block text-sm font-bold text-slate-800 mb-2">Process payroll with approved POI amount from</label>
                                         <p className="text-sm text-emerald-600 leading-relaxed">
                                            The approved POI amount will be considered for the payroll from <span className="font-bold bg-emerald-50 px-1 rounded">{poiPayrollMonth}</span> onwards to calculate and deduct income tax amount in subsequent payrolls.
                                         </p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="relative">
                                            <select
                                                value={poiPayrollMonth}
                                                onChange={(e) => setPoiPayrollMonth(e.target.value)}
                                                disabled={!isEditingProof}
                                                className="appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white focus:outline-none focus:border-purple-500 disabled:bg-slate-50 min-w-[140px]"
                                            >
                                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                        <span className="text-sm text-slate-500 whitespace-nowrap">for upcoming years.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Other Configs */}
                            <div className="pt-6 border-t border-slate-100">
                                <h4 className="text-sm font-bold text-slate-800 mb-4">Other Configurations</h4>
                                <div className="space-y-4">
                                    <label className={`flex items-center gap-3 group ${isEditingProof ? 'cursor-pointer' : ''}`}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${mandateComments ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                            {mandateComments && <Check size={14} className="text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={mandateComments} onChange={() => isEditingProof && setMandateComments(!mandateComments)} disabled={!isEditingProof} />
                                        <span className="text-sm text-slate-700">Mandate reviewer comments for partial investment amount approval</span>
                                    </label>

                                    <label className={`flex items-center gap-3 group ${isEditingProof ? 'cursor-pointer' : ''}`}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${npsIncludeInCtc ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                            {npsIncludeInCtc && <Check size={14} className="text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={npsIncludeInCtc} onChange={() => isEditingProof && setNpsIncludeInCtc(!npsIncludeInCtc)} disabled={!isEditingProof} />
                                        <span className="text-sm text-slate-700">Include employer NPS contribution in employee CTC</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IncomeTaxDeclarationSettings;
