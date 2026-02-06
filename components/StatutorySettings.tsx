import React, { useState } from 'react';
import { Edit2, Save, Activity, Shield, Briefcase, ChevronDown, Info, AlertCircle, Check, Calendar, X, Award, Trash2, Calculator } from 'lucide-react';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const ESI_COMPONENTS = [
  "Basic Salary",
  "Dearness Allowance (DA)",
  "HRA",
  "Conveyance Allowance"
];

const GRATUITY_COMPONENTS = [
  "Basic Salary",
  "Dearness Allowance (DA)",
  "House Rent Allowance (HRA)",
  "Conveyance Allowance",
  "Special Allowance"
];

const DEPARTMENTS = [
    "Engineering",
    "Sales",
    "Marketing",
    "HR",
    "Finance",
    "Operations",
    "Product",
    "QA",
    "Administration",
    "Legal"
];

const StatutorySettings: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [showContributionModal, setShowContributionModal] = useState(false);
    
    // ESI State
    const [enableEsi, setEnableEsi] = useState(true);
    const [esiNumber, setEsiNumber] = useState('00-00-000000-000-0000');
    const [esiEstablishmentName, setEsiEstablishmentName] = useState('TechFlow Systems Pvt Ltd');
    const [esiCoverageDate, setEsiCoverageDate] = useState('2023-01-12');
    const [esiEmpRate, setEsiEmpRate] = useState('0.75%');
    const [esiEmprRate, setEsiEmprRate] = useState('3.25%');
    const [includeEmprContriEsi, setIncludeEmprContriEsi] = useState(true);
    const [esiMappedComponents, setEsiMappedComponents] = useState<string[]>(ESI_COMPONENTS);

    // Gratuity State
    const [enableGratuity, setEnableGratuity] = useState(false);
    const [includeInCtcGratuity, setIncludeInCtcGratuity] = useState(true);
    const [gratuityMode, setGratuityMode] = useState<'all' | 'selective'>('all');
    const [gratuityCriteria, setGratuityCriteria] = useState<string[]>(['Permanent employees only']);
    const [selectedGratuityDepts, setSelectedGratuityDepts] = useState<string[]>([]);
    const [gratuityCalculationComponents, setGratuityCalculationComponents] = useState<string[]>(['Basic Salary', 'Dearness Allowance (DA)']);
    const [minServicePeriod, setMinServicePeriod] = useState<'standard' | 'custom'>('standard');
    const [customServiceYears, setCustomServiceYears] = useState('5');
    const [gratuityExceptions, setGratuityExceptions] = useState<string[]>([]);
    const [otherExceptionDetails, setOtherExceptionDetails] = useState('');
    const [deathDisablementServiceType, setDeathDisablementServiceType] = useState<'none' | 'minimum'>('none');
    const [deathDisablementMinYears, setDeathDisablementMinYears] = useState('0');
    
    const [yearsCalculationMode, setYearsCalculationMode] = useState<'completed' | 'nearest' | 'sixMonths'>('completed');
    const [includedServicePeriods, setIncludedServicePeriods] = useState<string[]>([
        'Actual working days', 
        'Paid leave periods', 
        'Maternity/Paternity leave', 
        'Notice period served', 
        'Probation period'
    ]);
    const [lwpLimitDays, setLwpLimitDays] = useState('30');
    
    const [maxGratuityType, setMaxGratuityType] = useState<'statutory' | 'none' | 'custom'>('statutory');
    const [customMaxGratuityAmount, setCustomMaxGratuityAmount] = useState('20,00,000');

    const [nominationMandatory, setNominationMandatory] = useState<'yes' | 'no'>('yes');
    const [nominationChangeRule, setNominationChangeRule] = useState<'anytime' | 'approval' | 'events'>('anytime');
    const [nomineeCountType, setNomineeCountType] = useState<'single' | 'multiple'>('multiple');
    const [maxNominees, setMaxNominees] = useState('3');
    const [noNominationRule, setNoNominationRule] = useState<'legal_heirs' | 'certificate' | 'hold'>('legal_heirs');

    // LWF State
    const [enableLwf, setEnableLwf] = useState(true);
    const [lwfState, setLwfState] = useState('Karnataka');

    // PT State
    const [ptState, setPtState] = useState('Karnataka');
    const [ptNumber, setPtNumber] = useState('');

    // NPS State
    const [enableNps, setEnableNps] = useState(true);
    const [npsRegistrationId, setNpsRegistrationId] = useState('');
    const [npsDeductionCycle, setNpsDeductionCycle] = useState('Monthly');
    const [npsContributionBase, setNpsContributionBase] = useState('Basic Salary + Dearness Allowance (DA)');
    const [npsEmpRate, setNpsEmpRate] = useState('10');
    const [npsEmprRate, setNpsEmprRate] = useState('10');
    const [npsWageCeiling, setNpsWageCeiling] = useState(false);
    const [npsIncludeInCtc, setNpsIncludeInCtc] = useState(true);

    // Backup State for Cancel
    const [backupState, setBackupState] = useState<any>(null);

    const toggleEsiComponent = (component: string) => {
        if (!isEditing) return;
        setEsiMappedComponents(prev => 
            prev.includes(component) 
                ? prev.filter(c => c !== component) 
                : [...prev, component]
        );
    };

    const handleEdit = () => {
        setBackupState({
            enableEsi, esiNumber, esiEstablishmentName, esiCoverageDate, esiEmpRate, esiEmprRate, includeEmprContriEsi, esiMappedComponents: [...esiMappedComponents],
            enableGratuity, includeInCtcGratuity, gratuityMode, gratuityCriteria: [...gratuityCriteria],
            selectedGratuityDepts: [...selectedGratuityDepts], gratuityCalculationComponents: [...gratuityCalculationComponents],
            minServicePeriod, customServiceYears, 
            gratuityExceptions: [...gratuityExceptions], otherExceptionDetails,
            deathDisablementServiceType, deathDisablementMinYears,
            yearsCalculationMode, includedServicePeriods: [...includedServicePeriods], lwpLimitDays,
            maxGratuityType, customMaxGratuityAmount,
            nominationMandatory, nominationChangeRule, nomineeCountType, maxNominees, noNominationRule,
            enableLwf, lwfState,
            ptState, ptNumber,
            enableNps, npsRegistrationId, npsDeductionCycle, npsEmpRate, npsEmprRate, npsWageCeiling, npsIncludeInCtc
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (backupState) {
            setEnableEsi(backupState.enableEsi);
            setEsiNumber(backupState.esiNumber);
            setEsiEstablishmentName(backupState.esiEstablishmentName);
            setEsiCoverageDate(backupState.esiCoverageDate);
            setEsiEmpRate(backupState.esiEmpRate);
            setEsiEmprRate(backupState.esiEmprRate);
            setIncludeEmprContriEsi(backupState.includeEmprContriEsi);
            setEsiMappedComponents(backupState.esiMappedComponents);
            
            setEnableGratuity(backupState.enableGratuity);
            setIncludeInCtcGratuity(backupState.includeInCtcGratuity);
            setGratuityMode(backupState.gratuityMode);
            setGratuityCriteria(backupState.gratuityCriteria);
            setSelectedGratuityDepts(backupState.selectedGratuityDepts);
            setGratuityCalculationComponents(backupState.gratuityCalculationComponents);
            setMinServicePeriod(backupState.minServicePeriod);
            setCustomServiceYears(backupState.customServiceYears);
            setGratuityExceptions(backupState.gratuityExceptions);
            setOtherExceptionDetails(backupState.otherExceptionDetails);
            setDeathDisablementServiceType(backupState.deathDisablementServiceType);
            setDeathDisablementMinYears(backupState.deathDisablementMinYears);
            
            setYearsCalculationMode(backupState.yearsCalculationMode);
            setIncludedServicePeriods(backupState.includedServicePeriods);
            setLwpLimitDays(backupState.lwpLimitDays);
            
            setMaxGratuityType(backupState.maxGratuityType);
            setCustomMaxGratuityAmount(backupState.customMaxGratuityAmount);

            setNominationMandatory(backupState.nominationMandatory);
            setNominationChangeRule(backupState.nominationChangeRule);
            setNomineeCountType(backupState.nomineeCountType);
            setMaxNominees(backupState.maxNominees);
            setNoNominationRule(backupState.noNominationRule);

            setEnableLwf(backupState.enableLwf);
            setLwfState(backupState.lwfState);
            setPtState(backupState.ptState);
            setPtNumber(backupState.ptNumber);
            setEnableNps(backupState.enableNps);
            setNpsRegistrationId(backupState.npsRegistrationId);
            setNpsDeductionCycle(backupState.npsDeductionCycle);
            setNpsEmpRate(backupState.npsEmpRate);
            setNpsEmprRate(backupState.npsEmprRate);
            setNpsWageCeiling(backupState.npsWageCeiling);
            setNpsIncludeInCtc(backupState.npsIncludeInCtc);
        }
        setIsEditing(false);
    };

    const toggleGratuityCriteria = (item: string) => {
        if (!isEditing) return;
        setGratuityCriteria(prev => 
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        );
    };

    const toggleGratuityDept = (dept: string) => {
        if (!isEditing) return;
        setSelectedGratuityDepts(prev => 
            prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
        );
    };

    const toggleGratuityComponent = (component: string) => {
        if (!isEditing) return;
        setGratuityCalculationComponents(prev => 
            prev.includes(component) 
                ? prev.filter(c => c !== component) 
                : [...prev, component]
        );
    };

    const toggleGratuityException = (exc: string) => {
        if (!isEditing) return;
        setGratuityExceptions(prev => 
            prev.includes(exc) ? prev.filter(e => e !== exc) : [...prev, exc]
        );
    };

    const toggleIncludedServicePeriod = (period: string) => {
        if (!isEditing) return;
        setIncludedServicePeriods(prev => 
            prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period]
        );
    };

    const showDeathDisablementFields = gratuityExceptions.includes('Death of employee') || gratuityExceptions.includes('Permanent disablement due to accident/disease');

    return (
        <div className="h-full overflow-y-auto">
            <div className="p-4 lg:p-8 w-full space-y-6 animate-in fade-in duration-300 pb-20">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Statutory Settings</h2>
                        <p className="text-slate-500 mt-1">Configure ESI, LWF, and Professional Tax compliance rules.</p>
                    </div>
                    <div className="flex gap-3">
                        {isEditing && (
                            <button 
                                onClick={handleCancel} 
                                className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                            onClick={() => isEditing ? setIsEditing(false) : handleEdit()} 
                            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${isEditing ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
                            {isEditing ? 'Save Settings' : 'Edit Settings'}
                        </button>
                    </div>
                </div>

                <div className="w-full space-y-6">
                    {/* 1. ESI Settings */}
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <Activity size={20} className="text-sky-600" />
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">EMPLOYEE STATE INSURANCE (ESI)</h3>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={enableEsi} onChange={() => isEditing && setEnableEsi(!enableEsi)} disabled={!isEditing} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                            </label>
                        </div>

                        <p className="text-sm text-slate-500 -mt-2 mb-6">
                            Organisations having 10 or more employees must register for Employee State Insurance (ESI). This scheme provides cash allowances and medical benefits for employees whose monthly salary is less than ₹21,00,000. If the employee gets a salary revision which increases their monthly salary above ₹21,000, they would have to continue making ESI contributions till the end of the contribution period in which the salary was revised (April-September or October-March).
                        </p>

                        {enableEsi && (
                            <div className="space-y-8 animate-in fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">ESIC Employer Code/Insurance Number</label>
                                        <input 
                                            type="text" 
                                            value={esiNumber} 
                                            onChange={(e) => setEsiNumber(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Establishment Name</label>
                                        <input 
                                            type="text" 
                                            value={esiEstablishmentName} 
                                            onChange={(e) => setEsiEstablishmentName(e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="Enter Establishment Name"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Date of Coverage / Applicability Date</label>
                                        <input 
                                            type="date" 
                                            value={esiCoverageDate} 
                                            onChange={(e) => setEsiCoverageDate(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                                            Deduction Cycle
                                            <div className="group relative inline-block">
                                                <Info size={14} className="text-slate-400 cursor-help" />
                                                <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 text-center leading-relaxed font-normal normal-case whitespace-normal border border-slate-700">
                                                    Employee State Insurance (ESI) contribution for each month should be deposited to the Employee State Insurance Corporation (ESIC) within the 21st of the following month.
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                </div>
                                            </div>
                                        </label>
                                        <input type="text" value="Monthly" disabled className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-500 cursor-not-allowed" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Employees' Contribution</label>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="text" 
                                                value={esiEmpRate}
                                                onChange={(e) => setEsiEmpRate(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                                            />
                                            <span className="text-sm text-slate-600 whitespace-nowrap">of Gross</span>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500 leading-relaxed italic">
                                            If daily average wage ≤ ₹176 (approx. monthly ₹5,280–₹5,500 depending on days), employee is exempt from contributing 0.75%, but employer still pays 3.25%.
                                        </p>
                                        <button 
                                            onClick={() => setShowContributionModal(true)}
                                            className="mt-4 px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-100 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-sky-100 transition-all flex items-center gap-2 shadow-sm"
                                        >
                                            <Calendar size={14} />
                                            Contribution Period
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Employer's Contribution</label>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="text" 
                                                value={esiEmprRate}
                                                onChange={(e) => setEsiEmprRate(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                                            />
                                            <span className="text-sm text-slate-600 whitespace-nowrap">of Gross</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-2">
                                    {/* Component Mapping Section */}
                                    <div className="border-t border-slate-100 pt-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Component Mapping:</h4>
                                            <div className="group relative inline-block">
                                                <Info size={14} className="text-slate-400 cursor-help" />
                                                <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 text-center leading-relaxed font-normal normal-case whitespace-normal border border-slate-700">
                                                    Select the salary components that should be included in the calculation of ESI contributions.
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                            {ESI_COMPONENTS.map(comp => (
                                                <label key={comp} className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer group ${esiMappedComponents.includes(comp) ? 'border-sky-200 bg-sky-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${esiMappedComponents.includes(comp) ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                                        {esiMappedComponents.includes(comp) && <Check size={14} className="text-white stroke-[3]" />}
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        className="hidden" 
                                                        checked={esiMappedComponents.includes(comp)} 
                                                        onChange={() => toggleEsiComponent(comp)} 
                                                        disabled={!isEditing} 
                                                    />
                                                    <span className={`text-sm font-semibold transition-colors ${esiMappedComponents.includes(comp) ? 'text-sky-900' : 'text-slate-600'}`}>{comp}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <label className="flex items-start gap-3 cursor-pointer group pt-2">
                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${includeEmprContriEsi ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                            {includeEmprContriEsi && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={includeEmprContriEsi} onChange={() => isEditing && setIncludeEmprContriEsi(!includeEmprContriEsi)} disabled={!isEditing} />
                                        <span className="text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">Include employer's contribution in employee's salary structure.</span>
                                    </label>

                                    <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-6 mt-4">
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            <span className="font-bold">Note:</span> ESI deductions will be made only if the employee’s monthly salary is less than or equal to ₹21,000. If the employee gets a salary revision which increases their monthly salary above ₹21,000, they would have to continue making ESI contributions till the end of the contribution period in which the salary was revised (April-September or October-March).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. Gratuity Settings */}
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <Award size={20} className="text-sky-600" />
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">GRATUITY</h3>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={enableGratuity} onChange={() => isEditing && setEnableGratuity(!enableGratuity)} disabled={!isEditing} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                            </label>
                        </div>

                        <p className="text-sm text-slate-500 -mt-2 mb-6">
                            The Payment of Gratuity Act, 1972 is applicable to establishments with 10 or more employees. It is a lump-sum payment made by the employer as a mark of recognition for the service rendered by the employee.
                        </p>

                        {enableGratuity && (
                            <div className="space-y-10 animate-in fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Calculation Formula Block */}
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Calculator size={14} className="text-indigo-600" /> Calculation Formula
                                        </h4>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs font-black text-slate-700 mb-1">Standard Formula:</p>
                                                <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 font-mono text-[11px] text-indigo-700">
                                                    Gratuity = (Basic + DA) × Years of Service × 15 / 26
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-xs font-black text-slate-700">Example:</p>
                                                <div className="text-[11px] text-slate-500 space-y-1">
                                                    <p>• Basic + DA = ₹50,000/month</p>
                                                    <p>• Service = 10 years 6 months (counted as 11 years)</p>
                                                    <p>• Gratuity = (50,000 × 11 × 15) / 26 = <span className="text-slate-800 font-bold">₹3,17,307.69</span></p>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 italic">
                                                The divisor '26' represents average working days per month (excluding Sundays).
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col justify-center">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${includeInCtcGratuity ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                                {includeInCtcGratuity && <Check size={14} className="text-white stroke-[3]" />}
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                className="hidden" 
                                                checked={includeInCtcGratuity} 
                                                onChange={() => isEditing && setIncludeInCtcGratuity(!includeInCtcGratuity)} 
                                                disabled={!isEditing} 
                                            />
                                            <span className="text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">Include Gratuity in employee's salary structure (CTC).</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Gratuity Enablement Mode */}
                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Enable Gratuity For:</label>
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <label className={`flex items-center gap-2.5 ${isEditing ? 'cursor-pointer' : 'cursor-default'} group`}>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${gratuityMode === 'all' ? 'border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                                {gratuityMode === 'all' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                            </div>
                                            <input 
                                                type="radio" 
                                                name="gratuityMode" 
                                                checked={gratuityMode === 'all'} 
                                                onChange={() => isEditing && setGratuityMode('all')} 
                                                className="hidden" 
                                                disabled={!isEditing}
                                            />
                                            <span className={`text-sm ${gratuityMode === 'all' ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>Yes (Enable for all eligible employees)</span>
                                        </label>
                                        <label className={`flex items-center gap-2.5 ${isEditing ? 'cursor-pointer' : 'cursor-default'} group`}>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${gratuityMode === 'selective' ? 'border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                                {gratuityMode === 'selective' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                            </div>
                                            <input 
                                                type="radio" 
                                                name="gratuityMode" 
                                                checked={gratuityMode === 'selective'} 
                                                onChange={() => isEditing && setGratuityMode('selective')} 
                                                className="hidden" 
                                                disabled={!isEditing}
                                            />
                                            <span className={`text-sm ${gratuityMode === 'selective' ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>Selective (Enable based on criteria)</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Selective Criteria */}
                                {gratuityMode === 'selective' && (
                                    <div className="pl-6 pt-2 space-y-6 border-l-2 border-slate-100 animate-in fade-in slide-in-from-top-1">
                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Select eligibility criteria:</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {[
                                                    'Permanent employees only',
                                                    'Contract employees (if converted to permanent)',
                                                    'Specific departments'
                                                ].map(item => (
                                                    <label key={item} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isEditing ? 'cursor-pointer hover:border-sky-200 hover:bg-sky-50/50' : 'cursor-default'} ${gratuityCriteria.includes(item) ? 'border-sky-200 bg-sky-50/50 shadow-sm' : 'border-slate-200 bg-white'}`}>
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${gratuityCriteria.includes(item) ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                                            {gratuityCriteria.includes(item) && <Check size={14} className="text-white stroke-[3]" />}
                                                        </div>
                                                        <input 
                                                            type="checkbox" 
                                                            className="hidden" 
                                                            checked={gratuityCriteria.includes(item)} 
                                                            onChange={() => toggleGratuityCriteria(item)} 
                                                            disabled={!isEditing} 
                                                        />
                                                        <span className={`text-xs font-semibold ${gratuityCriteria.includes(item) ? 'text-sky-900' : 'text-slate-600'}`}>{item}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Department Multi-select */}
                                        {gratuityCriteria.includes('Specific departments') && (
                                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Departments:</label>
                                                <div className="relative max-w-xl group">
                                                    <div className={`w-full min-h-[42px] p-2 border rounded-xl bg-white flex flex-wrap gap-2 transition-all ${isEditing ? 'border-slate-200 group-hover:border-sky-400' : 'border-slate-100 bg-slate-50'}`}>
                                                        {selectedGratuityDepts.length > 0 ? (
                                                            selectedGratuityDepts.map(dept => (
                                                                <span key={dept} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg text-xs font-bold border border-sky-100">
                                                                    {dept}
                                                                    {isEditing && <X size={14} onClick={() => toggleGratuityDept(dept)} className="cursor-pointer hover:text-rose-500" />}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-slate-400 text-sm py-1.5 px-2">Select multiple departments from dropdown...</span>
                                                        )}
                                                        {isEditing && (
                                                            <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                                                                <ChevronDown size={16} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {isEditing && (
                                                        <select 
                                                            className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                                            onChange={(e) => toggleGratuityDept(e.target.value)}
                                                            value=""
                                                        >
                                                            <option value="" disabled>Choose...</option>
                                                            {DEPARTMENTS.map(d => (
                                                                <option key={d} value={d}>{d}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Gratuity Calculation Components */}
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">GRATUITY CALCULATION COMPONENTS</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {GRATUITY_COMPONENTS.map(item => (
                                            <label key={item} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isEditing ? 'cursor-pointer hover:border-sky-200 hover:bg-sky-50/50' : 'cursor-default'} ${gratuityCalculationComponents.includes(item) ? 'border-sky-200 bg-sky-50/50 shadow-sm' : 'border-slate-200 bg-white'}`}>
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${gratuityCalculationComponents.includes(item) ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                                    {gratuityCalculationComponents.includes(item) && <Check size={14} className="text-white stroke-[3]" />}
                                                </div>
                                                <input 
                                                    type="checkbox" 
                                                    className="hidden" 
                                                    checked={gratuityCalculationComponents.includes(item)} 
                                                    onChange={() => toggleGratuityComponent(item)} 
                                                    disabled={!isEditing} 
                                                />
                                                <span className={`text-xs font-semibold ${gratuityCalculationComponents.includes(item) ? 'text-sky-900' : 'text-slate-600'}`}>{item}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
                                        <Info size={14} className="text-sky-500" />
                                        Only Basic + DA is considered as per the GRATUITY Act.
                                    </p>
                                </div>

                                {/* Minimum Service Period */}
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">MINIMUM SERVICE PERIOD FOR GRATUITY ELIGIBILITY</label>
                                    <div className="flex flex-col gap-4">
                                        <label className={`flex items-center gap-3 ${isEditing ? 'cursor-pointer' : 'cursor-default'} group`}>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${minServicePeriod === 'standard' ? 'border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                                {minServicePeriod === 'standard' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                            </div>
                                            <input 
                                                type="radio" 
                                                name="minServicePeriod" 
                                                checked={minServicePeriod === 'standard'} 
                                                onChange={() => isEditing && setMinServicePeriod('standard')} 
                                                className="hidden" 
                                                disabled={!isEditing}
                                            />
                                            <span className={`text-sm ${minServicePeriod === 'standard' ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>5 years (Standard As per Gratuity Act - Recommended)</span>
                                        </label>
                                        <div className="flex items-center gap-6">
                                            <label className={`flex items-center gap-3 ${isEditing ? 'cursor-pointer' : 'cursor-default'} group`}>
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${minServicePeriod === 'custom' ? 'border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                                    {minServicePeriod === 'custom' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                                </div>
                                                <input 
                                                    type="radio" 
                                                    name="minServicePeriod" 
                                                    checked={minServicePeriod === 'custom'} 
                                                    onChange={() => isEditing && setMinServicePeriod('custom')} 
                                                    className="hidden" 
                                                    disabled={!isEditing}
                                                />
                                                <span className={`text-sm ${minServicePeriod === 'custom' ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>Custom period</span>
                                            </label>
                                            {minServicePeriod === 'custom' && (
                                                <div className="flex items-center gap-3 animate-in slide-in-from-left-2">
                                                    <input 
                                                        type="number" 
                                                        min="0"
                                                        value={customServiceYears}
                                                        onChange={(e) => setCustomServiceYears(e.target.value)}
                                                        disabled={!isEditing}
                                                        className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:border-sky-500 disabled:bg-slate-50"
                                                    />
                                                    <span className="text-sm text-slate-500 font-medium">Years</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Exception Cases */}
                                <div className="space-y-6 pt-4 border-t border-slate-100">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Exception cases (Gratuity payable even if &lt; 5 years)</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[
                                            'Death of employee',
                                            'Permanent disablement due to accident/disease',
                                            'Others'
                                        ].map(item => (
                                            <label key={item} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isEditing ? 'cursor-pointer hover:border-sky-200 hover:bg-sky-50/50' : 'cursor-default'} ${gratuityExceptions.includes(item) ? 'border-sky-200 bg-sky-50/50 shadow-sm' : 'border-slate-200 bg-white'}`}>
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${gratuityExceptions.includes(item) ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                                    {gratuityExceptions.includes(item) && <Check size={14} className="text-white stroke-[3]" />}
                                                </div>
                                                <input 
                                                    type="checkbox" 
                                                    className="hidden" 
                                                    checked={gratuityExceptions.includes(item)} 
                                                    onChange={() => toggleGratuityException(item)} 
                                                    disabled={!isEditing} 
                                                />
                                                <span className={`text-xs font-semibold ${gratuityExceptions.includes(item) ? 'text-sky-900' : 'text-slate-600'}`}>{item}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {gratuityExceptions.includes('Others') && (
                                        <div className="animate-in fade-in slide-in-from-top-1">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Others details:</label>
                                            <textarea 
                                                value={otherExceptionDetails}
                                                onChange={(e) => setOtherExceptionDetails(e.target.value)}
                                                disabled={!isEditing}
                                                placeholder="Describe other exceptional cases..."
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 min-h-[80px] resize-none"
                                            />
                                        </div>
                                    )}

                                    {showDeathDisablementFields && (
                                        <div className="p-6 bg-slate-50/50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in zoom-in-95">
                                            <label className="block text-xs font-bold text-slate-800 uppercase tracking-widest">For death/disablement cases:</label>
                                            <div className="flex flex-col gap-4">
                                                <label className={`flex items-center gap-3 ${isEditing ? 'cursor-pointer' : 'cursor-default'} group`}>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${deathDisablementServiceType === 'none' ? 'border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                                        {deathDisablementServiceType === 'none' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                                    </div>
                                                    <input 
                                                        type="radio" 
                                                        name="deathDisablementServiceType" 
                                                        checked={deathDisablementServiceType === 'none'} 
                                                        onChange={() => isEditing && setDeathDisablementServiceType('none')} 
                                                        className="hidden" 
                                                        disabled={!isEditing}
                                                    />
                                                    <span className={`text-sm ${deathDisablementServiceType === 'none' ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>No minimum service required</span>
                                                </label>
                                                <div className="flex items-center gap-6">
                                                    <label className={`flex items-center gap-3 ${isEditing ? 'cursor-pointer' : 'cursor-default'} group`}>
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${deathDisablementServiceType === 'minimum' ? 'border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                                            {deathDisablementServiceType === 'minimum' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                                        </div>
                                                        <input 
                                                            type="radio" 
                                                            name="deathDisablementServiceType" 
                                                            checked={deathDisablementServiceType === 'minimum'} 
                                                            onChange={() => isEditing && setDeathDisablementServiceType('minimum')} 
                                                            className="hidden" 
                                                            disabled={!isEditing}
                                                        />
                                                        <span className={`text-sm ${deathDisablementServiceType === 'minimum' ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>Minimum ____ year of service required</span>
                                                    </label>
                                                    {deathDisablementServiceType === 'minimum' && (
                                                        <div className="flex items-center gap-3 animate-in slide-in-from-left-2">
                                                            <input 
                                                                type="number" 
                                                                min="0"
                                                                value={deathDisablementMinYears}
                                                                onChange={(e) => setDeathDisablementMinYears(e.target.value)}
                                                                disabled={!isEditing}
                                                                className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:border-sky-500 disabled:bg-slate-50"
                                                            />
                                                            <span className="text-sm text-slate-500 font-medium">Years</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Years Calculation Mode */}
                                <div className="space-y-4 pt-6 border-t border-slate-100">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">How to calculate years of service?</label>
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {[
                                            { id: 'completed', label: 'Completed years only' },
                                            { id: 'nearest', label: 'Round to nearest year' },
                                            { id: 'sixMonths', label: 'Round up if ≥ 6 months' }
                                        ].map((mode) => (
                                            <label key={mode.id} className={`flex items-center gap-2.5 ${isEditing ? 'cursor-pointer' : 'cursor-default'} group`}>
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${yearsCalculationMode === mode.id ? 'border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                                    {yearsCalculationMode === mode.id && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                                </div>
                                                <input 
                                                    type="radio" 
                                                    name="yearsCalculationMode" 
                                                    checked={yearsCalculationMode === mode.id} 
                                                    onChange={() => isEditing && setYearsCalculationMode(mode.id as any)} 
                                                    className="hidden" 
                                                    disabled={!isEditing}
                                                />
                                                <span className={`text-sm ${yearsCalculationMode === mode.id ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>{mode.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
                                        <div className="flex items-start gap-2">
                                            <Info size={14} className="text-slate-400 mt-0.5" />
                                            <div className="space-y-1">
                                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                                    <span className="font-bold text-slate-700">Completed years only</span> - 5 years 8 months = 5 years
                                                </p>
                                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                                    <span className="font-bold text-slate-700">Round to nearest year</span> - 5 years 8 months = 6 years
                                                </p>
                                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                                    <span className="font-bold text-slate-700">Round up if ≥ 6 months</span> - 5 years 6 months = 6 years; 5 years 5 months = 5 years
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Included Service Periods */}
                                <div className="space-y-4 pt-6 border-t border-slate-100">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Include following periods in service calculation:</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[
                                            'Actual working days',
                                            'Paid leave periods',
                                            'Maternity/Paternity leave',
                                            'Notice period served',
                                            'Notice period buyout',
                                            'Probation period',
                                            'Leave without pay (LWP) - if < [days] per year'
                                        ].map(period => {
                                            const isLWP = period.includes('LWP');
                                            const labelText = isLWP ? `Leave without pay (LWP) - if < ${lwpLimitDays} days per year` : period;
                                            
                                            return (
                                                <div key={period} className="space-y-2">
                                                    <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isEditing ? 'cursor-pointer hover:border-sky-200 hover:bg-sky-50/50' : 'cursor-default'} ${includedServicePeriods.includes(period) ? 'border-sky-200 bg-sky-50/50 shadow-sm' : 'border-slate-200 bg-white'}`}>
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${includedServicePeriods.includes(period) ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                                            {includedServicePeriods.includes(period) && <Check size={14} className="text-white stroke-[3]" />}
                                                        </div>
                                                        <input 
                                                            type="checkbox" 
                                                            className="hidden" 
                                                            checked={includedServicePeriods.includes(period)} 
                                                            onChange={() => toggleIncludedServicePeriod(period)} 
                                                            disabled={!isEditing} 
                                                        />
                                                        <span className={`text-[11px] font-semibold ${includedServicePeriods.includes(period) ? 'text-sky-900' : 'text-slate-600'}`}>{labelText}</span>
                                                    </label>
                                                    {isLWP && includedServicePeriods.includes(period) && isEditing && (
                                                        <div className="pl-8 animate-in fade-in zoom-in-95">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Limit:</span>
                                                                <input 
                                                                    type="number" 
                                                                    value={lwpLimitDays} 
                                                                    onChange={(e) => setLwpLimitDays(e.target.value)}
                                                                    className="w-16 px-2 py-1 border border-slate-200 rounded text-xs font-bold text-slate-700 focus:border-sky-500 outline-none"
                                                                />
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Days</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Maximum Gratuity Amount */}
                                <div className="space-y-4 pt-6 border-t border-slate-100">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">MAXIMUM GRATUITY AMOUNT</label>
                                    <div className="flex flex-col gap-4">
                                        <label className={`flex items-center gap-3 ${isEditing ? 'cursor-pointer' : 'cursor-default'} group`}>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${maxGratuityType === 'statutory' ? 'border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                                {maxGratuityType === 'statutory' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                            </div>
                                            <input 
                                                type="radio" 
                                                name="maxGratuityType" 
                                                checked={maxGratuityType === 'statutory'} 
                                                onChange={() => isEditing && setMaxGratuityType('statutory')} 
                                                className="hidden" 
                                                disabled={!isEditing} 
                                            />
                                            <span className={`text-sm ${maxGratuityType === 'statutory' ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>Yes, ₹20,00,000 (Twenty Lakh Rupees) (As per GRATUITY Act)</span>
                                        </label>
                                        <label className={`flex items-center gap-3 ${isEditing ? 'cursor-pointer' : 'cursor-default'} group`}>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${maxGratuityType === 'none' ? 'border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                                {maxGratuityType === 'none' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                            </div>
                                            <input 
                                                type="radio" 
                                                name="maxGratuityType" 
                                                checked={maxGratuityType === 'none'} 
                                                onChange={() => isEditing && setMaxGratuityType('none')} 
                                                className="hidden" 
                                                disabled={!isEditing} 
                                            />
                                            <span className={`text-sm ${maxGratuityType === 'none' ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>No Maximum Limit</span>
                                        </label>
                                        <div className="flex items-center gap-6">
                                            <label className={`flex items-center gap-3 ${isEditing ? 'cursor-pointer' : 'cursor-default'} group`}>
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${maxGratuityType === 'custom' ? 'border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                                    {maxGratuityType === 'custom' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                                </div>
                                                <input 
                                                    type="radio" 
                                                    name="maxGratuityType" 
                                                    checked={maxGratuityType === 'custom'} 
                                                    onChange={() => isEditing && setMaxGratuityType('custom')} 
                                                    className="hidden" 
                                                    disabled={!isEditing} 
                                                />
                                                <span className={`text-sm ${maxGratuityType === 'custom' ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>Custom</span>
                                            </label>
                                            {maxGratuityType === 'custom' && (
                                                <div className="flex items-center gap-3 animate-in slide-in-from-left-2">
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                        <input 
                                                            type="text" 
                                                            min="1"
                                                            value={customMaxGratuityAmount}
                                                            onChange={(e) => {
                                                                const raw = e.target.value.replace(/[^\d]/g, '');
                                                                const formatted = raw ? parseInt(raw).toLocaleString('en-IN') : '';
                                                                setCustomMaxGratuityAmount(formatted);
                                                            }}
                                                            disabled={!isEditing}
                                                            className="w-40 pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 shadow-sm"
                                                            placeholder="Enter Amount"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mt-2">
                                        <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                            The statutory limit is revised periodically. Current limit is ₹20 lakhs.
                                        </p>
                                        <p className="text-[11px] text-amber-800 font-medium leading-relaxed mt-1">
                                            Tax Exemption: Up to ₹20 lakhs of gratuity is tax-free for non-government employees.
                                        </p>
                                    </div>
                                </div>

                                {/* Nomination Configuration */}
                                <div className="space-y-6 pt-6 border-t border-slate-100">
                                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-widest">Nomination Configuration</label>
                                    
                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-slate-700">1. Nomination mandatory</label>
                                        <div className="flex flex-col sm:flex-row gap-6">
                                            {[
                                                { id: 'yes', label: 'Yes (Employee must nominate at time of joining)' },
                                                { id: 'no', label: 'No' }
                                            ].map((opt) => (
                                                <label key={opt.id} className={`flex items-center gap-2.5 ${isEditing ? 'cursor-pointer' : 'cursor-default'} group`}>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${nominationMandatory === opt.id ? 'border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                                        {nominationMandatory === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                                    </div>
                                                    <input 
                                                        type="radio" 
                                                        name="nominationMandatory" 
                                                        checked={nominationMandatory === opt.id} 
                                                        onChange={() => isEditing && setNominationMandatory(opt.id as any)} 
                                                        className="hidden" 
                                                        disabled={!isEditing}
                                                    />
                                                    <span className={`text-sm ${nominationMandatory === opt.id ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>{opt.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-slate-700">2. Nomination can be changed</label>
                                        <div className="flex flex-col gap-4">
                                            {[
                                                { id: 'anytime', label: 'Yes, anytime during service' },
                                                { id: 'approval', label: 'Yes, but requires approval' },
                                                { id: 'events', label: 'Only during specific events (marriage, birth of child, etc.)' }
                                            ].map((opt) => (
                                                <label key={opt.id} className={`flex items-center gap-2.5 ${isEditing ? 'cursor-pointer' : 'cursor-default'} group`}>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${nominationChangeRule === opt.id ? 'border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                                        {nominationChangeRule === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                                    </div>
                                                    <input 
                                                        type="radio" 
                                                        name="nominationChangeRule" 
                                                        checked={nominationChangeRule === opt.id} 
                                                        onChange={() => isEditing && setNominationChangeRule(opt.id as any)} 
                                                        className="hidden" 
                                                        disabled={!isEditing}
                                                    />
                                                    <span className={`text-sm ${nominationChangeRule === opt.id ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>{opt.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-slate-700">3. Number of nominees allowed</label>
                                        <div className="flex flex-col gap-4">
                                            <label className={`flex items-center gap-2.5 ${isEditing ? 'cursor-pointer' : 'cursor-default'} group`}>
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${nomineeCountType === 'single' ? 'border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                                    {nomineeCountType === 'single' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                                </div>
                                                <input 
                                                    type="radio" 
                                                    name="nomineeCountType" 
                                                    checked={nomineeCountType === 'single'} 
                                                    onChange={() => isEditing && setNomineeCountType('single')} 
                                                    className="hidden" 
                                                    disabled={!isEditing}
                                                />
                                                <span className={`text-sm ${nomineeCountType === 'single' ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>Single nominee only</span>
                                            </label>
                                            
                                            <div className="flex items-center gap-6">
                                                <label className={`flex items-center gap-2.5 ${isEditing ? 'cursor-pointer' : 'cursor-default'} group`}>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${nomineeCountType === 'multiple' ? 'border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                                        {nomineeCountType === 'multiple' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                                    </div>
                                                    <input 
                                                        type="radio" 
                                                        name="nomineeCountType" 
                                                        checked={nomineeCountType === 'multiple'} 
                                                        onChange={() => isEditing && setNomineeCountType('multiple')} 
                                                        className="hidden" 
                                                        disabled={!isEditing}
                                                    />
                                                    <span className={`text-sm ${nomineeCountType === 'multiple' ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>Multiple nominees (with percentage distribution)</span>
                                                </label>
                                                {nomineeCountType === 'multiple' && (
                                                    <div className="flex items-center gap-3 animate-in slide-in-from-left-2">
                                                        <label className="text-xs font-bold text-slate-400 uppercase">Max nominees:</label>
                                                        <input 
                                                            type="number" 
                                                            min="1"
                                                            value={maxNominees}
                                                            onChange={(e) => setMaxNominees(e.target.value)}
                                                            disabled={!isEditing}
                                                            className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 shadow-sm"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-slate-700">4. If no nomination</label>
                                        <div className="flex flex-col gap-4">
                                            {[
                                                { id: 'legal_heirs', label: 'Pay to legal heirs as per succession law' },
                                                { id: 'certificate', label: 'Require legal heir certificate' },
                                                { id: 'hold', label: 'Company holds amount until claimed' }
                                            ].map((opt) => (
                                                <label key={opt.id} className={`flex items-center gap-2.5 ${isEditing ? 'cursor-pointer' : 'cursor-default'} group`}>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${noNominationRule === opt.id ? 'border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                                        {noNominationRule === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                                    </div>
                                                    <input 
                                                        type="radio" 
                                                        name="noNominationRule" 
                                                        checked={noNominationRule === opt.id} 
                                                        onChange={() => isEditing && setNoNominationRule(opt.id as any)} 
                                                        className="hidden" 
                                                        disabled={!isEditing}
                                                    />
                                                    <span className={`text-sm ${noNominationRule === opt.id ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>{opt.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. LWF Settings */}
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <Shield size={20} className="text-sky-600" />
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">LABOUR WELFARE FUND (LWF)</h3>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={enableLwf} onChange={() => isEditing && setEnableLwf(!enableLwf)} disabled={!isEditing} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                            </label>
                        </div>

                        {enableLwf && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">State</label>
                                    <div className="relative">
                                        <select 
                                            value={lwfState}
                                            onChange={(e) => setLwfState(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 appearance-none focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed bg-white"
                                        >
                                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Deduction Cycle</label>
                                    <input type="text" value="Half Yearly" disabled className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-500 cursor-not-allowed" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 4. Professional Tax */}
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-8 border-b border-slate-100 pb-4">PROFESSIONAL TAX</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">PT State</label>
                                <div className="relative">
                                    <select 
                                        value={ptState}
                                        onChange={(e) => setPtState(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 appearance-none focus:outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed bg-white"
                                    >
                                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">PT Number</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={ptNumber} 
                                        onChange={(e) => setPtNumber(e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="PT Number"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed pr-10 placeholder:text-slate-400"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        <Edit2 size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. NPS Settings */}
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <Briefcase size={20} className="text-sky-600" />
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">NATIONAL PENSION SYSTEM (NPS)</h3>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={enableNps} onChange={() => isEditing && setEnableNps(!enableNps)} disabled={!isEditing} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                            </label>
                        </div>

                        {enableNps && (
                            <div className="space-y-8 animate-in fade-in">
                                <p className="text-sm text-slate-500 -mt-4">
                                    NPS is a voluntary retirement scheme for private sector employees. Employer contributions up to 10% of (Basic + DA) are tax-deductible (as of Dec 2025).
                                </p>

                                {/* Registration ID */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Corporate NPS Registration ID</label>
                                    <input 
                                        type="text" 
                                        value={npsRegistrationId} 
                                        onChange={(e) => setNpsRegistrationId(e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="Optional – Enter company NPS ID from PFRDA"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed placeholder:text-slate-300"
                                    />
                                </div>

                                {/* Cycle & Base */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Deduction Cycle</label>
                                        <div className="relative">
                                            <select 
                                                value={npsDeductionCycle}
                                                onChange={(e) => setNpsDeductionCycle(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white appearance-none focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:text-slate-600"
                                            >
                                                <option>Monthly</option>
                                                <option>Quarterly</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Contribution Base</label>
                                        <input 
                                            type="text" 
                                            value={npsContributionBase} 
                                            disabled
                                            className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-700 cursor-not-allowed" 
                                        />
                                    </div>
                                </div>

                                {/* Rates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Employee Contribution Rate</label>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="number" 
                                                value={npsEmpRate}
                                                onChange={(e) => setNpsEmpRate(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                                            />
                                            <span className="text-sm text-slate-500 whitespace-nowrap bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200">% of (Basic + DA)</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Employer Contribution Rate</label>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="number" 
                                                value={npsEmprRate}
                                                onChange={(e) => setNpsEmprRate(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                                            />
                                            <span className="text-sm text-slate-500 whitespace-nowrap bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200">% of (Basic + DA)</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                                            <Info size={12} />
                                            Tax benefit capped at 10% for private sector
                                        </div>
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div className="space-y-4 pt-2">
                                    <label className="flex items-center justify-start gap-4 cursor-pointer">
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={npsWageCeiling} onChange={() => isEditing && setNpsWageCeiling(!npsWageCeiling)} disabled={!isEditing} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">Apply Wage Ceiling: Cap contributions at ₹15,000/month wage</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${npsIncludeInCtc ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                            {npsIncludeInCtc && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={npsIncludeInCtc} onChange={() => isEditing && setNpsIncludeInCtc(!npsIncludeInCtc)} disabled={!isEditing} />
                                        <span className="text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">Include employer contribution in employee CTC</span>
                                    </label>
                                </div>

                                <div className="bg-indigo-50 text-indigo-800 text-xs font-medium px-4 py-3 rounded-lg flex items-center gap-2 border border-indigo-100">
                                    <Info size={16} className="text-indigo-600" />
                                    NPS is voluntary for private companies. Consult tax advisor for latest benefits.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Contribution Period Modal */}
            {showContributionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">ESI Contribution & Benefit Periods</h3>
                            <button onClick={() => setShowContributionModal(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4">Contribution Period</th>
                                            <th className="px-6 py-4">Corresponding Benefit Period</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-5">1st April to 30th September</td>
                                            <td className="px-6 py-5">1st January to 30th June (of the following year)</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-5">1st October to 31st March</td>
                                            <td className="px-6 py-5">1st July to 31st December</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <ul className="mt-6 space-y-4 px-2">
                                <li className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></div>
                                    <span>This lag (e.g., April–Sept contributions enable benefits from Jan–June next year) ensures employees have a qualifying contribution history before claiming benefits.</span>
                                </li>
                                <li className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></div>
                                    <span>For <strong>new employees</strong>, the first Contribution Period starts from the date of joining, and the Benefit Period begins after 9 months (to allow accumulation of contributions).</span>
                                </li>
                            </ul>

                            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                                <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-800 leading-relaxed">
                                    The contribution made during a specific period determines the eligibility for medical and cash benefits during the corresponding benefit period.
                                </p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={() => setShowContributionModal(false)}
                                className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-100 transition-colors text-sm shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatutorySettings;