import React, { useState, useRef } from 'react';
import { Edit2, Save, Calendar, ChevronDown, Bell, Check, Info, AlertCircle, Clock, FileText, History, AlertTriangle, Plus, Trash2, X, ArrowUp, ArrowDown, UserCheck, ShieldCheck, Calculator, PieChart as PieChartIcon, Percent, Building2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const BUSINESS_UNITS = [
    "MindInventory",
    "300 Minds",
    "CollabCRM"
];

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
        className={`relative w-full h-12 bg-white border rounded-2xl flex items-center transition-all shadow-sm ${disabled ? 'border-slate-200 bg-slate-50 cursor-not-allowed' : 'border-slate-200 hover:border-sky-400 cursor-pointer group'}`}
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
    const [paygroups, setPaygroups] = useState<any[]>([]);
    const [selectedTarget, setSelectedTarget] = useState('bu:MindInventory');

    const [lateJoinerMonth, setLateJoinerMonth] = useState('February');
    const [lateJoinerDay, setLateJoinerDay] = useState('22');

    const [proofCutoffMonth, setProofCutoffMonth] = useState('January');
    const [proofCutoffDay, setProofCutoffDay] = useState('22');

    const [selectedYear, setSelectedYear] = useState('2025-2026');
    const [availableYears] = useState(['2025-2026', '2024-2025', '2023-2024']);

    const fetchPaygroups = async () => {
        try {
            const { data, error } = await supabase
                .from('paygroups')
                .select('*')
                .order('name');
            if (error) throw error;
            setPaygroups(data || []);
        } catch (err) {
            console.error('Error fetching paygroups:', err);
        }
    };

    const fetchSettings = async () => {
        try {
            // First try year-prefixed key
            const yearKey = `income_tax_settings:${selectedYear}:${selectedTarget}`;
            const legacyKey = `income_tax_settings:${selectedTarget}`;

            let { data, error } = await supabase
                .from('operational_config')
                .select('config_value')
                .eq('config_key', yearKey)
                .single();

            // If not found for current year, try legacy fallback
            if (error && error.code === 'PGRST116') {
                const { data: legacyData, error: legacyError } = await supabase
                    .from('operational_config')
                    .select('config_value')
                    .eq('config_key', legacyKey)
                    .single();
                
                if (!legacyError) {
                    data = legacyData;
                }
            } else if (error) {
                throw error;
            }

            if (data?.config_value) {
                const config = data.config_value;
                setInvEnabled(config.invEnabled ?? true);
                setInvStartDay(config.invStartDay ?? '1');
                setInvEndDay(config.invEndDay ?? '22');
                setCutoffMonth(config.cutoffMonth ?? 'January');
                setCutoffDay(config.cutoffDay ?? '22');
                setInvDeadlineFrom(config.invDeadlineFrom ? new Date(config.invDeadlineFrom) : new Date(2026, 0, 1));
                setInvDeadlineTo(config.invDeadlineTo ? new Date(config.invDeadlineTo) : new Date(2026, 0, 15));
                setGracePeriodEnabled(config.gracePeriodEnabled ?? false);
                setGracePeriodDate(config.gracePeriodDate ? new Date(config.gracePeriodDate) : new Date(2026, 0, 20));
                setDeclarationFrequency(config.declarationFrequency ?? 'Annually');
                setInvApprovers(config.invApprovers ?? ["Kavita Sharma (HR)"]);
                const defaultLimits = [
                    { id: '1', section: '80C', limit: '1,50,000', description: 'PPF, EPF, LIC, ELSS, NSC, Home Loan Principal, Tuition Fees, etc.', regime: 'Old' },
                    { id: '2', section: '80CCC', limit: '1,50,000 (within 80C)', description: 'Pension fund contributions', regime: 'Old' },
                    { id: '3', section: '80CCD(1)', limit: '1,50,000 (within 80C)', description: 'Employee NPS contribution', regime: 'Old' },
                    { id: '4', section: '80CCD(1B)', limit: '50,000', description: 'Additional NPS contribution (over 80C limit)', regime: 'Old' },
                    { id: '5', section: '80CCD(2)', limit: '10% of salary (no upper cap)', description: 'Employer NPS contribution', regime: 'Old' },
                    { id: '6', section: '80D', limit: '25,000', description: 'Medical insurance — Self & Family', regime: 'Old' },
                    { id: '7', section: '80D', limit: '25,000', description: 'Medical insurance — Parents', regime: 'Old' },
                    { id: '8', section: '80DD', limit: '75,000 / 1,25,000 (severe)', description: 'Disabled dependent medical expenses', regime: 'Old' },
                    { id: '9', section: '80DDB', limit: '40,000', description: 'Treatment of specified diseases', regime: 'Old' },
                    { id: '10', section: '80E', limit: 'Actual (no limit, 8 years)', description: 'Interest on education loan', regime: 'Old' },
                    { id: '11', section: '80EE', limit: '50,000', description: 'Interest on home loan (first-time buyer, loan ≤35L)', regime: 'Old' },
                    { id: '12', section: '80EEA', limit: '1,50,000', description: 'Interest on affordable housing home loan', regime: 'Old' },
                    { id: '13', section: '80G', limit: '50% or 100% of donation', description: 'Donations to approved funds', regime: 'Old' },
                    { id: '14', section: '80GG', limit: 'Min of: ₹5,000/month, 25% of income, rent–10% of income', description: 'House rent (no HRA received)', regime: 'Old' },
                    { id: '15', section: '80GGB/GGC', limit: 'Actual amount', description: 'Political party donations', regime: 'Old' },
                    { id: '16', section: '80TTA', limit: '10,000', description: 'Interest on savings account (non-senior)', regime: 'Old' },
                    { id: '17', section: '80TTB', limit: '50,000', description: 'Interest on deposits (senior citizens)', regime: 'Old' },
                    { id: '18', section: '80U', limit: '75,000 / 1,25,000 (severe)', description: 'Self disability deduction', regime: 'Old' },
                    { id: '19', section: '24(b)', limit: '2,00,000', description: 'Interest on home loan (self-occupied)', regime: 'Old' },
                    { id: '20', section: '10(13A)', limit: 'Least of: actual HRA, 40/50% of salary, rent–10% salary', description: 'HRA exemption', regime: 'Old' },
                    { id: '21', section: '10(14)', limit: 'As per rules', description: 'LTA, conveyance, children education allowance', regime: 'Old' },
                    { id: '22', section: '16(ia)', limit: '75,000 (FY 2024-25 onwards)', description: 'Standard Deduction (salaried)', regime: 'Old' },
                    { id: '23', section: '16(ia)', limit: '75,000', description: 'Standard Deduction (salaried)', regime: 'New' },
                    { id: '24', section: '80CCD(2)', limit: '14% of salary (govt); 10% (others)', description: 'Employer NPS contribution', regime: 'New' },
                    { id: '25', section: '80CCH', limit: 'Full amount', description: 'Agniveer Corpus Fund contribution', regime: 'New' },
                    { id: '26', section: '10(13A)', limit: 'Not available', description: 'HRA', regime: 'New' },
                    { id: '27', section: '24(b)', limit: 'Not available', description: 'Home loan interest', regime: 'New' },
                    { id: '28', section: '80C, D, E, G…', limit: 'Not available', description: 'Most Chapter VI-A deductions', regime: 'New' },
                    // Senior Citizens (60–80 years)
                    { id: 'sc-1', section: '80C', limit: '1,50,000', description: 'PPF, LIC, ELSS, SCSS etc.', regime: 'Old', ageGroup: 'senior' },
                    { id: 'sc-2', section: '80D', limit: '50,000', description: 'Health insurance premium', regime: 'Old', ageGroup: 'senior' },
                    { id: 'sc-3', section: '80DDB', limit: '1,00,000', description: 'Treatment of specified diseases', regime: 'Old', ageGroup: 'senior' },
                    { id: 'sc-4', section: '80TTB', limit: '50,000', description: 'Interest on deposits (FD/savings)', regime: 'Old', ageGroup: 'senior' },
                    { id: 'sc-5', section: 'TDS on FD interest', limit: '1,00,000', description: 'Section 194A threshold', regime: 'Old', ageGroup: 'senior' },
                    { id: 'sc-6', section: '87A Rebate', limit: 'Old: ₹12,500 (income ≤ ₹5L) | New: ₹60,000 (income ≤ ₹12L) — same for all ages', description: 'Tax rebate', regime: 'Old', ageGroup: 'senior' },
                    { id: 'sc-7', section: 'Standard deduction', limit: 'Old: ₹50,000 | New: ₹75,000 — same for all ages', description: 'Salary / pension income', regime: 'Old', ageGroup: 'senior' },
                    { id: 'sc-8', section: 'Advance tax', limit: 'Exempt*', description: 'Quarterly payment requirement', regime: 'Old', ageGroup: 'senior' },
                    // Super Senior Citizens (80+ years)
                    { id: 'ssc-1', section: '80C', limit: '1,50,000', description: 'PPF, LIC, ELSS, SCSS etc.', regime: 'Old', ageGroup: 'superSenior' },
                    { id: 'ssc-2', section: '80D', limit: '50,000', description: 'Health insurance premium', regime: 'Old', ageGroup: 'superSenior' },
                    { id: 'ssc-3', section: '80DDB', limit: '1,00,000', description: 'Treatment of specified diseases', regime: 'Old', ageGroup: 'superSenior' },
                    { id: 'ssc-4', section: '80TTB', limit: '50,000', description: 'Interest on deposits (FD/savings)', regime: 'Old', ageGroup: 'superSenior' },
                    { id: 'ssc-5', section: 'TDS on FD interest', limit: '1,00,000', description: 'Section 194A threshold', regime: 'Old', ageGroup: 'superSenior' },
                    { id: 'ssc-6', section: '87A Rebate', limit: 'Old: ₹12,500 (income ≤ ₹5L) | New: ₹60,000 (income ≤ ₹12L) — same for all ages', description: 'Tax rebate', regime: 'Old', ageGroup: 'superSenior' },
                    { id: 'ssc-7', section: 'Standard deduction', limit: 'Old: ₹50,000 | New: ₹75,000 — same for all ages', description: 'Salary / pension income', regime: 'Old', ageGroup: 'superSenior' },
                    { id: 'ssc-8', section: 'Advance tax', limit: 'Exempt*', description: 'Quarterly payment requirement', regime: 'Old', ageGroup: 'superSenior' }
                ];
                
                // Smarter migration: If they have exactly the 2 old defaults, override them with the new 28 entries
                const isLegacyDefaults = config.limits && config.limits.length === 2 && config.limits[0].description === 'Investments & Expenses';
                const baseLoaded = (!config.limits || config.limits.length === 0 || isLegacyDefaults) ? defaultLimits : config.limits;
                // Merge in any defaultLimits entries missing from the loaded set (e.g. newly added ageGroup rows)
                const mergedLimits = [
                    ...baseLoaded,
                    ...defaultLimits.filter(def => !baseLoaded.some((l: any) => l.id === def.id))
                ];
                setLimits(mergedLimits);
                setDefaultRegime(config.defaultRegime ?? 'New Regime');
                setAllowSwitch(config.allowSwitch ?? true);
                setSwitchLockDate(config.switchLockDate ? new Date(config.switchLockDate) : new Date(2025, 11, 31));
                setNotifyRelease(config.notifyRelease ?? true);
                setEmailReminder(config.emailReminder ?? false);
                setNotifyLock(config.notifyLock ?? true);
                setTdsAdjustmentMonth(config.tdsAdjustmentMonth ?? 'April');
                setDeductionPattern(config.deductionPattern ?? 'Monthly');
                setSelectedTdsMonths(config.selectedTdsMonths ?? ["April", "May", "June", "July", "August", "September", "November", "December", "January", "February"]);
                setDistributionMethod(config.distributionMethod ?? 'Equal Distribution Across Selected Months');
                setMinTdsThreshold(config.minTdsThreshold ?? '10,000');
                setMaxTdsCap(config.maxTdsCap ?? '10,000');
                setTdsWeights(config.tdsWeights ?? {
                    "April": 5, "May": 5, "June": 5, "July": 8, "August": 8, "September": 8,
                    "October": 0, "November": 10, "December": 10, "January": 15, "February": 15, "March": 0
                });
                setProofEnabled(config.proofEnabled ?? true);
                setProofDeadlineFrom(config.proofDeadlineFrom ? new Date(config.proofDeadlineFrom) : new Date(2026, 0, 1));
                setProofDeadlineTo(config.proofDeadlineTo ? new Date(config.proofDeadlineTo) : new Date(2026, 1, 28));
                setProofGraceEnabled(config.proofGraceEnabled ?? false);
                setProofGraceDate(config.proofGraceDate ? new Date(config.proofGraceDate) : new Date(2026, 2, 10));
                setAllowedFileTypes(config.allowedFileTypes ?? ['PDF', 'JPG', 'PNG']);
                setProofApprovers(config.proofApprovers ?? ["Rajesh Kumar (Finance Head)"]);
                setMandateComments(config.mandateComments ?? true);
                setNpsIncludeInCtc(config.npsIncludeInCtc ?? true);
                setNpsWageCeiling(config.npsWageCeiling ?? false);
                setLateJoinerMonth(config.lateJoinerMonth ?? 'February');
                setLateJoinerDay(config.lateJoinerDay ?? '22');
                setProofCutoffMonth(config.proofCutoffMonth ?? 'January');
                setProofCutoffDay(config.proofCutoffDay ?? '22');
                setLockDeclarationsAfterCutoff(config.lockDeclarationsAfterCutoff ?? true);
                setProofGracePeriodDays(config.proofGracePeriodDays ?? '5');
                setRejectionReasonMandatory(config.rejectionReasonMandatory ?? false);
                setProofVerificationMonth(config.proofVerificationMonth ?? 'March');
                setProofVerificationDay(config.proofVerificationDay ?? '31');
            }
        } catch (err) {
            console.error('Error fetching income tax settings:', err);
        }
    };

    React.useEffect(() => {
        fetchPaygroups();
        fetchSettings();
    }, [selectedTarget, selectedYear]);
    // --- Investment Declaration State ---
    const [isEditingInv, setIsEditingInv] = useState(false);
    const [invEnabled, setInvEnabled] = useState(true);
    const [invStartDay, setInvStartDay] = useState('1');
    const [invEndDay, setInvEndDay] = useState('22');
    const [cutoffMonth, setCutoffMonth] = useState('January');
    const [cutoffDay, setCutoffDay] = useState('22');
    const [invDeadlineFrom, setInvDeadlineFrom] = useState(new Date(2026, 0, 1)); // Jan 1, 2026
    const [invDeadlineTo, setInvDeadlineTo] = useState(new Date(2026, 0, 15)); // Jan 15, 2026
    const [gracePeriodEnabled, setGracePeriodEnabled] = useState(false);
    const [gracePeriodDate, setGracePeriodDate] = useState(new Date(2026, 0, 20));
    const [declarationFrequency, setDeclarationFrequency] = useState('Annually');
    const [invApprovers, setInvApprovers] = useState<string[]>(["Kavita Sharma (HR)"]);
    const [selectedInvApprover, setSelectedInvApprover] = useState("");
    
    // Limits State
    const [limits, setLimits] = useState([
        { id: '1', section: '80C', limit: '1,50,000', description: 'PPF, EPF, LIC, ELSS, NSC, Home Loan Principal, Tuition Fees, etc.', regime: 'Old' },
        { id: '2', section: '80CCC', limit: '1,50,000 (within 80C)', description: 'Pension fund contributions', regime: 'Old' },
        { id: '3', section: '80CCD(1)', limit: '1,50,000 (within 80C)', description: 'Employee NPS contribution', regime: 'Old' },
        { id: '4', section: '80CCD(1B)', limit: '50,000', description: 'Additional NPS contribution (over 80C limit)', regime: 'Old' },
        { id: '5', section: '80CCD(2)', limit: '10% of salary (no upper cap)', description: 'Employer NPS contribution', regime: 'Old' },
        { id: '6', section: '80D', limit: '25,000', description: 'Medical insurance — Self & Family', regime: 'Old' },
        { id: '7', section: '80D', limit: '25,000', description: 'Medical insurance — Parents', regime: 'Old' },
        { id: '8', section: '80DD', limit: '75,000 / 1,25,000 (severe)', description: 'Disabled dependent medical expenses', regime: 'Old' },
        { id: '9', section: '80DDB', limit: '40,000', description: 'Treatment of specified diseases', regime: 'Old' },
        { id: '10', section: '80E', limit: 'Actual (no limit, 8 years)', description: 'Interest on education loan', regime: 'Old' },
        { id: '11', section: '80EE', limit: '50,000', description: 'Interest on home loan (first-time buyer, loan ≤35L)', regime: 'Old' },
        { id: '12', section: '80EEA', limit: '1,50,000', description: 'Interest on affordable housing home loan', regime: 'Old' },
        { id: '13', section: '80G', limit: '50% or 100% of donation', description: 'Donations to approved funds', regime: 'Old' },
        { id: '14', section: '80GG', limit: 'Min of: ₹5,000/month, 25% of income, rent–10% of income', description: 'House rent (no HRA received)', regime: 'Old' },
        { id: '15', section: '80GGB/GGC', limit: 'Actual amount', description: 'Political party donations', regime: 'Old' },
        { id: '16', section: '80TTA', limit: '10,000', description: 'Interest on savings account (non-senior)', regime: 'Old' },
        { id: '17', section: '80TTB', limit: '50,000', description: 'Interest on deposits (senior citizens)', regime: 'Old' },
        { id: '18', section: '80U', limit: '75,000 / 1,25,000 (severe)', description: 'Self disability deduction', regime: 'Old' },
        { id: '19', section: '24(b)', limit: '2,00,000', description: 'Interest on home loan (self-occupied)', regime: 'Old' },
        { id: '20', section: '10(13A)', limit: 'Least of: actual HRA, 40/50% of salary, rent–10% salary', description: 'HRA exemption', regime: 'Old' },
        { id: '21', section: '10(14)', limit: 'As per rules', description: 'LTA, conveyance, children education allowance', regime: 'Old' },
        { id: '22', section: '16(ia)', limit: '75,000 (FY 2024-25 onwards)', description: 'Standard Deduction (salaried)', regime: 'Old' },
        { id: '23', section: '16(ia)', limit: '75,000', description: 'Standard Deduction (salaried)', regime: 'New' },
        { id: '24', section: '80CCD(2)', limit: '14% of salary (govt); 10% (others)', description: 'Employer NPS contribution', regime: 'New' },
        { id: '25', section: '80CCH', limit: 'Full amount', description: 'Agniveer Corpus Fund contribution', regime: 'New' },
        { id: '26', section: '10(13A)', limit: 'Not available', description: 'HRA', regime: 'New' },
        { id: '27', section: '24(b)', limit: 'Not available', description: 'Home loan interest', regime: 'New' },
        { id: '28', section: '80C, D, E, G…', limit: 'Not available', description: 'Most Chapter VI-A deductions', regime: 'New' },
        // Senior Citizens (60–80 years)
        { id: 'sc-1', section: '80C', limit: '1,50,000', description: 'PPF, LIC, ELSS, SCSS etc.', regime: 'Old', ageGroup: 'senior' },
        { id: 'sc-2', section: '80D', limit: '50,000', description: 'Health insurance premium', regime: 'Old', ageGroup: 'senior' },
        { id: 'sc-3', section: '80DDB', limit: '1,00,000', description: 'Treatment of specified diseases', regime: 'Old', ageGroup: 'senior' },
        { id: 'sc-4', section: '80TTB', limit: '50,000', description: 'Interest on deposits (FD/savings)', regime: 'Old', ageGroup: 'senior' },
        { id: 'sc-5', section: 'TDS on FD interest', limit: '1,00,000', description: 'Section 194A threshold', regime: 'Old', ageGroup: 'senior' },
        { id: 'sc-6', section: '87A Rebate', limit: 'Old: ₹12,500 (income ≤ ₹5L) | New: ₹60,000 (income ≤ ₹12L) — same for all ages', description: 'Tax rebate', regime: 'Old', ageGroup: 'senior' },
        { id: 'sc-7', section: 'Standard deduction', limit: 'Old: ₹50,000 | New: ₹75,000 — same for all ages', description: 'Salary / pension income', regime: 'Old', ageGroup: 'senior' },
        { id: 'sc-8', section: 'Advance tax', limit: 'Exempt*', description: 'Quarterly payment requirement', regime: 'Old', ageGroup: 'senior' },
        // Super Senior Citizens (80+ years)
        { id: 'ssc-1', section: '80C', limit: '1,50,000', description: 'PPF, LIC, ELSS, SCSS etc.', regime: 'Old', ageGroup: 'superSenior' },
        { id: 'ssc-2', section: '80D', limit: '50,000', description: 'Health insurance premium', regime: 'Old', ageGroup: 'superSenior' },
        { id: 'ssc-3', section: '80DDB', limit: '1,00,000', description: 'Treatment of specified diseases', regime: 'Old', ageGroup: 'superSenior' },
        { id: 'ssc-4', section: '80TTB', limit: '50,000', description: 'Interest on deposits (FD/savings)', regime: 'Old', ageGroup: 'superSenior' },
        { id: 'ssc-5', section: 'TDS on FD interest', limit: '1,00,000', description: 'Section 194A threshold', regime: 'Old', ageGroup: 'superSenior' },
        { id: 'ssc-6', section: '87A Rebate', limit: 'Old: ₹12,500 (income ≤ ₹5L) | New: ₹60,000 (income ≤ ₹12L) — same for all ages', description: 'Tax rebate', regime: 'Old', ageGroup: 'superSenior' },
        { id: 'ssc-7', section: 'Standard deduction', limit: 'Old: ₹50,000 | New: ₹75,000 — same for all ages', description: 'Salary / pension income', regime: 'Old', ageGroup: 'superSenior' },
        { id: 'ssc-8', section: 'Advance tax', limit: 'Exempt*', description: 'Quarterly payment requirement', regime: 'Old', ageGroup: 'superSenior' }
    ]);
    const [limitViewRegime, setLimitViewRegime] = useState<'Old' | 'New'>('Old');
    const [oldRegimeAgeGroup, setOldRegimeAgeGroup] = useState<'individual' | 'senior' | 'superSenior'>('individual');

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
    const [allowedFileTypes, setAllowedFileTypes] = useState<string[]>(['PDF', 'JPG', 'PNG']);
    const [proofApprovers, setProofApprovers] = useState<string[]>(["Rajesh Kumar (Finance Head)"]);
    const [selectedProofApprover, setSelectedProofApprover] = useState("");
    
    const [mandateComments, setMandateComments] = useState(true);
    const [showCalcPreview, setShowCalcPreview] = useState(false);

    const [npsIncludeInCtc, setNpsIncludeInCtc] = useState(true);
    const [npsWageCeiling, setNpsWageCeiling] = useState(false);

    const [proofCutoffMonthState, setProofCutoffMonthState] = useState('January');
    const [proofCutoffDayState, setProofCutoffDayState] = useState('31');

    // New configuration states
    const [lockDeclarationsAfterCutoff, setLockDeclarationsAfterCutoff] = useState(true);
    const [proofGracePeriodDays, setProofGracePeriodDays] = useState('5');
    const [rejectionReasonMandatory, setRejectionReasonMandatory] = useState(false);
    const [proofVerificationMonth, setProofVerificationMonth] = useState('March');
    const [proofVerificationDay, setProofVerificationDay] = useState('31');

    const [isLimitsExpanded, setIsLimitsExpanded] = useState(true);

    // Backup states for cancel functionality
    const [invBackup, setInvBackup] = useState<any>(null);
    const [proofBackup, setProofBackup] = useState<any>(null);

    // -- Handlers for Investment Declaration --
    const handleEditInv = () => {
        setInvBackup({ 
            invEnabled, invStartDay, invEndDay, cutoffMonth, cutoffDay, invDeadlineFrom: new Date(invDeadlineFrom), invDeadlineTo: new Date(invDeadlineTo), gracePeriodEnabled, gracePeriodDate: new Date(gracePeriodDate), declarationFrequency, limits: JSON.parse(JSON.stringify(limits)), 
            defaultRegime, allowSwitch, switchLockDate,
            notifyRelease, emailReminder, notifyLock,
            invApprovers: [...invApprovers],
            tdsAdjustmentMonth,
            deductionPattern, selectedTdsMonths: [...selectedTdsMonths],
            distributionMethod,
            tdsWeights: { ...tdsWeights },
            minTdsThreshold,
            maxTdsCap,
            lateJoinerMonth,
            lateJoinerDay,
            lockDeclarationsAfterCutoff
        });
        setIsEditingInv(true);
    };

    const handleCancelInv = () => {
        if(invBackup) {
            setInvEnabled(invBackup.invEnabled);
            setInvStartDay(invBackup.invStartDay || '1');
            setInvEndDay(invBackup.invEndDay || '22');
            setCutoffMonth(invBackup.cutoffMonth || 'January');
            setCutoffDay(invBackup.cutoffDay || '22');
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
            setDeductionPattern(invBackup.deductionPattern);
            setSelectedTdsMonths(invBackup.selectedTdsMonths);
            setDistributionMethod(invBackup.distributionMethod);
            setTdsWeights(invBackup.tdsWeights);
            setMinTdsThreshold(invBackup.minTdsThreshold);
            setMaxTdsCap(invBackup.maxTdsCap);
            setLateJoinerMonth(invBackup.lateJoinerMonth || 'February');
            setLateJoinerDay(invBackup.lateJoinerDay || '22');
            setLockDeclarationsAfterCutoff(invBackup.lockDeclarationsAfterCutoff ?? true);
        }
        setIsEditingInv(false);
        setSelectedInvApprover("");
    };

    const handleSaveInv = async () => {
        try {
            const configValue = {
                invEnabled, invStartDay, invEndDay, cutoffMonth, cutoffDay, invDeadlineFrom, invDeadlineTo, gracePeriodEnabled, gracePeriodDate, declarationFrequency, 
                limits, defaultRegime, allowSwitch, switchLockDate,
                notifyRelease, emailReminder, notifyLock, invApprovers,
                tdsAdjustmentMonth,
                deductionPattern, selectedTdsMonths, distributionMethod, tdsWeights, minTdsThreshold, maxTdsCap,
                proofEnabled, proofDeadlineFrom, proofDeadlineTo, proofGraceEnabled, proofGraceDate,
                allowedFileTypes,
                proofApprovers, mandateComments, npsIncludeInCtc, npsWageCeiling,
                lateJoinerMonth, lateJoinerDay,
                proofCutoffMonth, proofCutoffDay,
                lockDeclarationsAfterCutoff, proofGracePeriodDays, rejectionReasonMandatory, proofVerificationMonth, proofVerificationDay
            };

            const { error } = await supabase
                .from('operational_config')
                .upsert({
                    config_key: `income_tax_settings:${selectedYear}:${selectedTarget}`,
                    config_value: configValue,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'config_key' });

            if (error) throw error;
            setIsEditingInv(false);
            setSelectedInvApprover("");
        } catch (err) {
            console.error('Error saving investment settings:', err);
            alert('Failed to save settings. Please try again.');
        }
    };

    // -- Handlers for Proof of Investment --
    const handleEditProof = () => {
        setProofBackup({ 
            proofEnabled, proofDeadlineFrom, proofDeadlineTo, 
            proofGraceEnabled, proofGraceDate: new Date(proofGraceDate),
            allowedFileTypes,
            mandateComments, npsIncludeInCtc, npsWageCeiling,
            proofApprovers: [...proofApprovers],
            proofCutoffMonth,
            proofCutoffDay,
            proofGracePeriodDays,
            rejectionReasonMandatory,
            proofVerificationMonth,
            proofVerificationDay
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
            setAllowedFileTypes(proofBackup.allowedFileTypes);
            setMandateComments(proofBackup.mandateComments);
            setNpsIncludeInCtc(proofBackup.npsIncludeInCtc);
            setNpsWageCeiling(proofBackup.npsWageCeiling);
            setProofApprovers(proofBackup.proofApprovers);
            setProofCutoffMonth(proofBackup.proofCutoffMonth || 'January');
            setProofCutoffDay(proofBackup.proofCutoffDay || '22');
            setProofGracePeriodDays(proofBackup.proofGracePeriodDays || '5');
            setRejectionReasonMandatory(proofBackup.rejectionReasonMandatory ?? false);
            setProofVerificationMonth(proofBackup.proofVerificationMonth || 'March');
            setProofVerificationDay(proofBackup.proofVerificationDay || '31');
        }
        setIsEditingProof(false);
        setSelectedProofApprover("");
    };

    const handleSaveProof = async () => {
        try {
            const configValue = {
                invEnabled, invStartDay, invEndDay, cutoffMonth, cutoffDay, invDeadlineFrom, invDeadlineTo, gracePeriodEnabled, gracePeriodDate, declarationFrequency, 
                limits, defaultRegime, allowSwitch, switchLockDate,
                notifyRelease, emailReminder, notifyLock, invApprovers,
                tdsAdjustmentMonth,
                deductionPattern, selectedTdsMonths, distributionMethod, tdsWeights, minTdsThreshold, maxTdsCap,
                proofEnabled, proofDeadlineFrom, proofDeadlineTo, proofGraceEnabled, proofGraceDate,
                allowedFileTypes,
                proofApprovers, mandateComments, npsIncludeInCtc, npsWageCeiling,
                lateJoinerMonth, lateJoinerDay,
                proofCutoffMonth, proofCutoffDay,
                lockDeclarationsAfterCutoff, proofGracePeriodDays, rejectionReasonMandatory, proofVerificationMonth, proofVerificationDay
            };

            const { error } = await supabase
                .from('operational_config')
                .upsert({
                    config_key: `income_tax_settings:${selectedYear}:${selectedTarget}`,
                    config_value: configValue,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'config_key' });

            if (error) throw error;
            setIsEditingProof(false);
            setSelectedProofApprover("");
        } catch (err) {
            console.error('Error saving proof settings:', err);
            alert('Failed to save settings. Please try again.');
        }
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
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculation</p>
                            <p className="text-xs font-bold text-slate-700">Total TDS = ₹{totalTax.toLocaleString()}</p>
                            <p className="text-xs font-bold text-slate-700">Selected months = {selectedCount}</p>
                            <p className="text-xs font-black text-indigo-600">Per month deduction = ₹{totalTax.toLocaleString()} ÷ {selectedCount} = ₹{perMonth.toLocaleString()}</p>
                        </div>

                        <div className="space-y-3">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Month-wise Breakup:</h5>
                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-[11px] border-collapse">
                                    <thead className="bg-slate-50/50 border-b border-slate-200">
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
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculation</p>
                            <p className="text-xs font-bold text-slate-700">Total TDS = ₹{totalTax.toLocaleString()}</p>
                        </div>

                        <div className="space-y-3">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Month-wise Breakup:</h5>
                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-[11px] border-collapse">
                                    <thead className="bg-slate-50/50 border-b border-slate-200">
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
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculation</p>
                            <p className="text-xs font-bold text-slate-700">Total TDS = ₹{totalTax.toLocaleString()}</p>
                        </div>

                        <div className="space-y-3">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Month-wise Breakup (Auto-adjusted):</h5>
                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-[11px] border-collapse">
                                    <thead className="bg-slate-50/50 border-b border-slate-200">
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
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculation</p>
                            <p className="text-xs font-bold text-slate-700">Total TDS = ₹{totalTax.toLocaleString()}</p>
                        </div>

                        <div className="space-y-3">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Month-wise Breakup:</h5>
                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-[11px] border-collapse">
                                    <thead className="bg-slate-50/50 border-b border-slate-200">
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
                                        <tr className="font-black border-b border-slate-200">
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
            <div className="p-4 lg:p-8 w-full mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Income Tax Declaration Settings</h2>
                        <p className="text-slate-500 mt-1">Configure investment declaration, limits, and POI verification rules.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Financial Year Selector */}
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shadow-sm h-10 px-2 lg:px-3">
                            <Calendar size={16} className="text-slate-400" />
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer focus:ring-0"
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>FY {year}</option>
                                ))}
                            </select>
                        </div>

                        {/* Business Unit Selector */}
                        <div className="relative">
                            <select
                                value={selectedTarget}
                                onChange={(e) => setSelectedTarget(e.target.value)}
                                className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none shadow-sm"
                            >
                                <optgroup label="Business Units">
                                    {BUSINESS_UNITS.map(bu => (
                                        <option key={bu} value={`bu:${bu}`}>{bu}</option>
                                    ))}
                                </optgroup>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>
                
                {/* 1. Investment Declaration Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-bold text-slate-800">Investment Declaration</h3>
                                {!isEditingInv && (
                                    <button onClick={handleEditInv} className="text-slate-400 hover:text-indigo-600 transition-colors p-1 hover:bg-slate-50 rounded">
                                        <Edit2 size={16} />
                                    </button>
                                )}
                            </div>
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

                            {/* Declaration Settings Overhaul */}
                            <div className="pt-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6 border-b border-slate-200 pb-2">Tax Declaration Due Date</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Monthly Window */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                                <Clock size={16} className="text-indigo-600" />
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-800">Monthly window</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 max-w-sm">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start date</label>
                                                <div className="relative">
                                                    <select
                                                        disabled={!isEditingInv}
                                                        value={invStartDay}
                                                        onChange={(e) => setInvStartDay(e.target.value)}
                                                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none disabled:bg-slate-50 disabled:text-slate-400 shadow-sm"
                                                    >
                                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                            <option key={day} value={day}>{day}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End date</label>
                                                <div className="relative">
                                                    <select
                                                        disabled={!isEditingInv}
                                                        value={invEndDay}
                                                        onChange={(e) => setInvEndDay(e.target.value)}
                                                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none disabled:bg-slate-50 disabled:text-slate-400 shadow-sm"
                                                    >
                                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                                            <option key={day} value={day}>{day}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Financial Year Cutoff Date */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                                                <Calendar size={16} className="text-rose-600" />
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-800">Financial year cutoff date</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 max-w-sm">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Month</label>
                                                <div className="relative">
                                                    <select
                                                        disabled={!isEditingInv}
                                                        value={cutoffMonth}
                                                        onChange={(e) => setCutoffMonth(e.target.value)}
                                                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all appearance-none disabled:bg-slate-50 disabled:text-slate-400 shadow-sm"
                                                    >
                                                        {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                                            <option key={m} value={m}>{m}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End date</label>
                                                <div className="relative">
                                                    <select
                                                        disabled={!isEditingInv}
                                                        value={cutoffDay}
                                                        onChange={(e) => setCutoffDay(e.target.value)}
                                                        className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all appearance-none disabled:bg-slate-50 disabled:text-slate-400 shadow-sm"
                                                    >
                                                        {Array.from({ 
                                                            length: new Date(2026, ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(cutoffMonth) + 1, 0).getDate() 
                                                        }, (_, i) => i + 1).map(day => (
                                                            <option key={day} value={day}>{day}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dynamic info text box */}
                                <div className="mt-8 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                                        <Info size={20} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <h5 className="text-[11px] font-black text-amber-700 uppercase tracking-widest mb-1">Investment Declaration Period</h5>
                                        <p className="text-sm font-medium text-amber-900/80 leading-relaxed">
                                            Employees can declare investments from the <span className="font-bold underline decoration-amber-300 underline-offset-2">{getOrdinalDay(new Date(2026, 0, parseInt(invStartDay)))}</span> to <span className="font-bold underline decoration-amber-300 underline-offset-2">{getOrdinalDay(new Date(2026, 0, parseInt(invEndDay)))}</span> of every month until the yearly cutoff period from the <span className="font-bold underline decoration-amber-300 underline-offset-2">1st</span> to <span className="font-bold underline decoration-amber-300 underline-offset-2">{getOrdinalDay(new Date(2026, 0, parseInt(cutoffDay)))} {cutoffMonth}</span>. After this period, no further declarations will be accepted for the current financial year.
                                        </p>
                                    </div>
                                </div>
                            </div>




                            {/* Regime & Locking Settings */}
                            <div className="pt-2 border-t border-slate-200 space-y-6">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Tax Regime & Switching</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-1 max-w-[50%]">
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
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer group pt-2">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${allowSwitch ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                        {allowSwitch && <Check size={14} className="text-white" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={allowSwitch} onChange={() => isEditingInv && setAllowSwitch(!allowSwitch)} disabled={!isEditingInv} />
                                    <span className="text-sm font-semibold text-slate-700">Allow employees to switch tax regime until financial year cutoff date</span>
                                </label>
                                <label className={`flex items-center gap-3 cursor-pointer group pt-2 ${!isEditingInv ? 'opacity-70' : ''}`}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${lockDeclarationsAfterCutoff ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                        {lockDeclarationsAfterCutoff && <Check size={14} className="text-white" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={lockDeclarationsAfterCutoff} onChange={() => isEditingInv && setLockDeclarationsAfterCutoff(!lockDeclarationsAfterCutoff)} disabled={!isEditingInv} />
                                    <span className="text-sm font-semibold text-slate-700">Lock declarations after Financial year cutoff date</span>
                                </label>
                            </div>

                            {/* Approval Hierarchy Section */}
                            <div className="pt-2 border-t border-slate-200">
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
                                            <div key={approver} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl group hover:border-indigo-200 transition-colors shadow-sm">
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
                            <div className="pt-4 border-t border-slate-200">
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
                            <div className="pt-6 border-t border-slate-200">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
                                    <Calculator size={16} className="text-slate-400" /> TDS Deduction Configuration
                                </h4>

                                <div className="mt-4 pl-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Deduction Pattern</label>
                                    <div className="flex gap-6 mb-4">
                                        {['Monthly', 'Custom'].map((p) => (
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
                                                        }
                                                    }} 
                                                />
                                                <span className="text-sm text-slate-700">{p}</span>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
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
                                        <div className="space-y-4">
                                            <button 
                                                onClick={() => setShowCalcPreview(!showCalcPreview)}
                                                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm transition-colors group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                                    <PieChartIcon size={16} />
                                                </div>
                                                <span className="underline decoration-indigo-200 underline-offset-4">Preview Calculation</span>
                                                <ChevronDown size={16} className={`transition-transform duration-300 ${showCalcPreview ? 'rotate-180' : ''}`} />
                                            </button>

                                            {showCalcPreview && (
                                                <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                                                    <div className="flex items-center gap-2 mb-6 text-indigo-600 border-b border-indigo-50 pb-4">
                                                        <PieChartIcon size={18} />
                                                        <h5 className="text-xs font-black uppercase tracking-widest">Calculation Preview (Demo Data)</h5>
                                                    </div>
                                                    <div className="mb-6 pb-6 border-b border-slate-200 flex justify-between items-end">
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
                                                    
                                                    <div className="mt-6 pt-6 border-t border-slate-200 space-y-2">
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                                                            <Info size={12} /> System Note
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                                            This preview is for illustrative purposes only. Actual values will vary per employee based on their salary structure, joined date, and approved declarations.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                {/* 2. Income Tax Deductions Limit Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <ShieldCheck size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Income Tax Deductions Limit</h3>
                            </div>
                            
                            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                                <button 
                                    onClick={() => setLimitViewRegime('Old')}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${limitViewRegime === 'Old' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Old Regime
                                </button>
                                <button 
                                    onClick={() => setLimitViewRegime('New')}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${limitViewRegime === 'New' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    New Regime
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setIsLimitsExpanded(!isLimitsExpanded)}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
                            >
                                {isLimitsExpanded ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                            </button>
                        </div>
                    </div>
                    {isLimitsExpanded && (
                        <div className="p-8 animate-in fade-in slide-in-from-top-2 duration-300">

                        {/* Age group sub-tabs — only for Old Regime */}
                        {limitViewRegime === 'Old' && (
                            <div className="mb-5 flex items-center gap-1 bg-slate-100/80 border border-slate-200 rounded-2xl p-1 w-fit shadow-sm">
                                {([
                                    { key: 'individual', label: 'Individuals (Below 60 years)' },
                                    { key: 'senior',     label: 'Senior Citizens (60\u201380 years)' },
                                    { key: 'superSenior', label: 'Super Senior Citizens (80+ years)' },
                                ] as const).map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setOldRegimeAgeGroup(tab.key)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                                            oldRegimeAgeGroup === tab.key
                                                ? 'bg-white text-violet-600 shadow-sm border border-slate-200'
                                                : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left text-sm border-collapse">
                                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">Section</th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">Max. Limit (₹)</th>
                                        {isEditingInv && <th className="px-6 py-4 w-16 text-center">Action</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(limits as any[]).filter(l => {
                                            if ((l.regime || 'Old') !== limitViewRegime) return false;
                                            if (limitViewRegime === 'Old') return (l.ageGroup || 'individual') === oldRegimeAgeGroup;
                                            return true;
                                        }).length > 0 ? (
                                        (limits as any[]).filter(l => {
                                            if ((l.regime || 'Old') !== limitViewRegime) return false;
                                            if (limitViewRegime === 'Old') return (l.ageGroup || 'individual') === oldRegimeAgeGroup;
                                            return true;
                                        }).map((limit, idx) => {
                                            const actualIdx = limits.findIndex(l => l.id === limit.id);
                                            return (
                                                <tr key={limit.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4 font-bold text-slate-700">
                                                        {isEditingInv ? (
                                                            <input 
                                                                type="text" 
                                                                value={limit.section} 
                                                                onChange={(e) => {
                                                                    const newLimits = [...limits];
                                                                    newLimits[actualIdx].section = e.target.value;
                                                                    setLimits(newLimits);
                                                                }}
                                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 bg-white"
                                                                placeholder="e.g. 80C"
                                                            />
                                                        ) : <span className="px-3 py-1 bg-slate-100/50 rounded-lg">{limit.section}</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                                                        {isEditingInv ? (
                                                            <input 
                                                                type="text" 
                                                                value={limit.description} 
                                                                onChange={(e) => {
                                                                    const newLimits = [...limits];
                                                                    newLimits[actualIdx].description = e.target.value;
                                                                    setLimits(newLimits);
                                                                }}
                                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all bg-white"
                                                                placeholder="Section description..."
                                                            />
                                                        ) : limit.description}
                                                    </td>
                                                    <td className="px-6 py-4 font-black text-slate-800">
                                                        {isEditingInv ? (
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                                                                <input 
                                                                    type="text" 
                                                                    value={limit.limit} 
                                                                    onChange={(e) => {
                                                                        const newLimits = [...limits];
                                                                        newLimits[actualIdx].limit = e.target.value;
                                                                        setLimits(newLimits);
                                                                    }}
                                                                    className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all bg-white"
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                        ) : <span className="text-indigo-600">₹{limit.limit}</span>}
                                                    </td>
                                                    {isEditingInv && (
                                                        <td className="px-6 py-4 text-center">
                                                            <button 
                                                                onClick={() => setLimits(limits.filter(l => (l as any).id !== limit.id))}
                                                                className="w-8 h-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={isEditingInv ? 4 : 3} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                                                No deductions configured for {limitViewRegime} Regime.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    )}
                </div>

                {/* 3. Proof of Investment Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
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
                                <div className="space-y-6">
                                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Financial year cutoff date</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex gap-3">
                                            <div className="relative flex-1">
                                                <select
                                                    disabled={!isEditingProof}
                                                    value={proofCutoffMonth}
                                                    onChange={(e) => setProofCutoffMonth(e.target.value)}
                                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none disabled:bg-slate-50/50 disabled:text-slate-400 shadow-sm"
                                                >
                                                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                                        <option key={m} value={m}>{m}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                            </div>
                                            <div className="relative w-24">
                                                <select
                                                    disabled={!isEditingProof}
                                                    value={proofCutoffDay}
                                                    onChange={(e) => setProofCutoffDay(e.target.value)}
                                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none disabled:bg-slate-50/50 disabled:text-slate-400 text-center shadow-sm"
                                                >
                                                    {Array.from({ 
                                                        length: new Date(2026, ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(proofCutoffMonth) + 1, 0).getDate() 
                                                    }, (_, i) => i + 1).map(day => (
                                                        <option key={day} value={day}>{day}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-2">
                                        <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Grace Period (Days)</h5>
                                        <div className="max-w-xs">
                                            <input 
                                                type="number"
                                                disabled={!isEditingProof}
                                                value={proofGracePeriodDays}
                                                onChange={(e) => setProofGracePeriodDays(e.target.value)}
                                                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-50/50 disabled:text-slate-400 shadow-sm"
                                                placeholder="e.g. 5"
                                            />
                                        </div>
                                        <p className="mt-2 text-[10px] text-indigo-600 font-bold px-1 italic">
                                            {(() => {
                                                const monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                                                const monthIndex = monthsArr.indexOf(proofCutoffMonth);
                                                const day = parseInt(proofCutoffDay);
                                                if (monthIndex === -1 || isNaN(day)) return "";
                                                const date = new Date(2026, monthIndex, day);
                                                date.setDate(date.getDate() + (parseInt(proofGracePeriodDays) || 0));
                                                return `Documents can be uploaded until ${date.getDate()} ${monthsArr[date.getMonth()]} 2026`;
                                            })()}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4 animate-in fade-in slide-in-from-top-2 w-full">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                                            <AlertTriangle size={20} className="text-amber-600" />
                                        </div>
                                        <p className="text-sm font-medium text-amber-900/80 leading-relaxed self-center">
                                            After this date, declarations made by employees would not be considered for tax calculation if documents are not uploaded.
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">POI Verification deadline</h5>
                                    <div className="flex gap-3">
                                        <div className="relative w-1/2">
                                            <select
                                                disabled={!isEditingProof}
                                                value={proofVerificationMonth}
                                                onChange={(e) => setProofVerificationMonth(e.target.value)}
                                                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none disabled:bg-slate-50/50 disabled:text-slate-400 shadow-sm"
                                            >
                                                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                        <div className="relative w-24">
                                            <select
                                                disabled={!isEditingProof}
                                                value={proofVerificationDay}
                                                onChange={(e) => setProofVerificationDay(e.target.value)}
                                                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none disabled:bg-slate-50/50 disabled:text-slate-400 text-center shadow-sm"
                                            >
                                                {Array.from({ 
                                                    length: new Date(2026, ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(proofVerificationMonth) + 1, 0).getDate() 
                                                }, (_, i) => i + 1).map(day => (
                                                    <option key={day} value={day}>{day}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Approval Hierarchy Section - NEW for POI */}
                            <div className="pt-2 border-t border-slate-200">
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
                                            <div key={approver} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl group hover:border-indigo-200 transition-colors shadow-sm">
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

                            <div className="pt-2"></div>


                            {/* Other Configs */}
                            <div className="pt-6 border-t border-slate-200">
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
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${rejectionReasonMandatory ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                            {rejectionReasonMandatory && <Check size={14} className="text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={rejectionReasonMandatory} onChange={() => isEditingProof && setRejectionReasonMandatory(!rejectionReasonMandatory)} disabled={!isEditingProof} />
                                        <span className="text-sm text-slate-700">Rejection reason mandatory</span>
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
