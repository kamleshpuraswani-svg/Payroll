import React, { useState } from 'react';
import { Edit2, Save, Activity, Shield, Briefcase, ChevronDown, Info, AlertCircle, Check, Calendar, X, Award, Trash2, Calculator, Building2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const BUSINESS_UNITS = [
    "MindInventory",
    "300 Minds",
    "CollabCRM"
];

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
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const isEditing = editingSection !== null;
    const setIsEditing = (val: boolean) => { if (!val) setEditingSection(null); };
    const [showContributionModal, setShowContributionModal] = useState(false);
    const [showGratuityFormulaModal, setShowGratuityFormulaModal] = useState(false);
    const [paygroups, setPaygroups] = useState<any[]>([]);
    const [selectedTarget, setSelectedTarget] = useState('bu:MindInventory');

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
            const { data, error } = await supabase
                .from('operational_config')
                .select('config_value')
                .eq('config_key', `statutory_settings:${selectedTarget}`)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            
            if (data?.config_value) {
                const config = data.config_value;
                setEnableEsi(config.enableEsi ?? true);
                setEsiNumber(config.esiNumber ?? '00-00-000000-000-0000');
                setEsiEstablishmentName(config.esiEstablishmentName ?? 'TechFlow Systems Pvt Ltd');
                setEsiCoverageDate(config.esiCoverageDate ?? '2023-01-12');
                setEsiEmpRate(config.esiEmpRate ?? '0.75%');
                setEsiEmprRate(config.esiEmprRate ?? '3.25%');
                setIncludeEmprContriEsi(config.includeEmprContriEsi ?? true);
                setEsiMappedComponents(config.esiMappedComponents ?? ESI_COMPONENTS);
                setEsiMaxMonthlySalary(config.esiMaxMonthlySalary ?? '21,000');
                setAllowEsiOverride(config.allowEsiOverride ?? false);
                setEsiRoundOff(config.esiRoundOff ?? 'floor');
                setEsiNegativeArrearImpact(config.esiNegativeArrearImpact ?? false);
                setEsiProvisionInCtc(config.esiProvisionInCtc ?? true);
                setEsiProcessOvertime(config.esiProcessOvertime ?? true);
                setEsiProcessArrear(config.esiProcessArrear ?? true);
                setEnableGratuity(config.enableGratuity ?? false);
                setIncludeInCtcGratuity(config.includeInCtcGratuity ?? true);
                setGratuityMode(config.gratuityMode ?? 'all');
                setGratuityCriteria(config.gratuityCriteria ?? ['Permanent employees only']);
                setSelectedGratuityDepts(config.selectedGratuityDepts ?? []);
                setGratuityCalculationComponents(config.gratuityCalculationComponents ?? ['Basic Salary', 'Dearness Allowance (DA)']);
                setMinServicePeriod(config.minServicePeriod ?? 'standard');
                setCustomServiceYears(config.customServiceYears ?? '5');
                setGratuityExceptions(config.gratuityExceptions ?? []);
                setOtherExceptionDetails(config.otherExceptionDetails ?? '');
                setDeathDisablementServiceType(config.deathDisablementServiceType ?? 'none');
                setDeathDisablementMinYears(config.deathDisablementMinYears ?? '0');
                setYearsCalculationMode(config.yearsCalculationMode ?? 'completed');
                setIncludedServicePeriods(config.includedServicePeriods ?? [
                    'Actual working days',
                    'Paid leave periods',
                    'Maternity/Paternity leave',
                    'Notice period served',
                    'Probation period'
                ]);
                setLwpLimitDays(config.lwpLimitDays ?? '30');
                setMaxGratuityType(config.maxGratuityType ?? 'statutory');
                setCustomMaxGratuityAmount(config.customMaxGratuityAmount ?? '20,00,000');
                setEnableLwf(config.enableLwf ?? true);
                setLwfState(config.lwfState ?? 'Karnataka');
                setLwfEstablishmentId(config.lwfEstablishmentId ?? '');
                setLwfRegistrationDate(config.lwfRegistrationDate ?? '');
                setPtState(config.ptState ?? 'Karnataka');
                setPtNumber(config.ptNumber ?? '');
                setEnableNps(config.enableNps ?? true);
                setNpsRegistrationId(config.npsRegistrationId ?? '');
                setNpsDeductionCycle(config.npsDeductionCycle ?? 'Monthly');
                setNpsEmpRate(config.npsEmpRate ?? '10');
                setNpsEmprRate(config.npsEmprRate ?? '10');
                setNpsWageCeiling(config.npsWageCeiling ?? false);
                setNpsIncludeInCtc(config.npsIncludeInCtc ?? true);

                // Initialize new Gratuity UI fields
                setGratuityProvisionRate(config.gratuityProvisionRate ?? '4.81');
                setGratuityTenureYears(config.gratuityTenureYears ?? (config.minServicePeriod === 'standard' ? '5' : (config.customServiceYears || '5')));
                setGratuityTenureMonths(config.gratuityTenureMonths ?? '0');
                setGratuityTaxFreeLimit(config.gratuityTaxFreeLimit ?? (config.maxGratuityType === 'statutory' ? '20,00,000' : (config.maxGratuityType === 'none' ? '0' : (config.customMaxGratuityAmount || '20,00,000'))));
            }
        } catch (err) {
            console.error('Error fetching statutory settings:', err);
        }
    };

    React.useEffect(() => {
        fetchPaygroups();
        fetchSettings();
    }, [selectedTarget]);

    // ESI State
    const [enableEsi, setEnableEsi] = useState(true);
    const [esiNumber, setEsiNumber] = useState('00-00-000000-000-0000');
    const [esiEstablishmentName, setEsiEstablishmentName] = useState('TechFlow Systems Pvt Ltd');
    const [esiCoverageDate, setEsiCoverageDate] = useState('2023-01-12');
    const [esiEmpRate, setEsiEmpRate] = useState('0.75%');
    const [esiEmprRate, setEsiEmprRate] = useState('3.25%');
    const [includeEmprContriEsi, setIncludeEmprContriEsi] = useState(true);
    const [esiMappedComponents, setEsiMappedComponents] = useState<string[]>(ESI_COMPONENTS);
    const [esiMaxMonthlySalary, setEsiMaxMonthlySalary] = useState('21,000');
    const [allowEsiOverride, setAllowEsiOverride] = useState(false);
    const [esiRoundOff, setEsiRoundOff] = useState<'floor' | 'ceiling'>('floor');
    const [esiNegativeArrearImpact, setEsiNegativeArrearImpact] = useState(false);
    const [esiProvisionInCtc, setEsiProvisionInCtc] = useState(true);
    const [esiProcessOvertime, setEsiProcessOvertime] = useState(true);
    const [esiProcessArrear, setEsiProcessArrear] = useState(true);

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

    // New Gratuity UI fields
    const [gratuityProvisionRate, setGratuityProvisionRate] = useState('4.81');
    const [gratuityTenureYears, setGratuityTenureYears] = useState('5');
    const [gratuityTenureMonths, setGratuityTenureMonths] = useState('0');
    const [gratuityTaxFreeLimit, setGratuityTaxFreeLimit] = useState('20,00,000');

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
    const [lwfEstablishmentId, setLwfEstablishmentId] = useState('');
    const [lwfRegistrationDate, setLwfRegistrationDate] = useState('');

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
            enableEsi, esiNumber, esiEstablishmentName, esiCoverageDate, esiEmpRate, esiEmprRate, includeEmprContriEsi, esiMappedComponents: [...esiMappedComponents], esiMaxMonthlySalary, allowEsiOverride, esiRoundOff, esiNegativeArrearImpact, esiProvisionInCtc, esiProcessOvertime, esiProcessArrear,
            enableGratuity, includeInCtcGratuity, gratuityMode, gratuityCriteria: [...gratuityCriteria],
            selectedGratuityDepts: [...selectedGratuityDepts], gratuityCalculationComponents: [...gratuityCalculationComponents],
            minServicePeriod, customServiceYears,
            gratuityExceptions: [...gratuityExceptions], otherExceptionDetails,
            deathDisablementServiceType, deathDisablementMinYears,
            yearsCalculationMode, includedServicePeriods: [...includedServicePeriods], lwpLimitDays,
            maxGratuityType, customMaxGratuityAmount,
            gratuityProvisionRate, gratuityTenureYears, gratuityTenureMonths, gratuityTaxFreeLimit,
            nominationMandatory, nominationChangeRule, nomineeCountType, maxNominees, noNominationRule,
            enableLwf, lwfState, lwfEstablishmentId, lwfRegistrationDate,
            ptState, ptNumber,
            enableNps, npsRegistrationId, npsDeductionCycle, npsEmpRate, npsEmprRate, npsWageCeiling, npsIncludeInCtc
        });
        // isEditing is now derived from editingSection
    };

    const handleSave = async () => {
        try {
            const configValue = {
                enableEsi, esiNumber, esiEstablishmentName, esiCoverageDate, esiEmpRate, esiEmprRate, includeEmprContriEsi, esiMappedComponents, esiMaxMonthlySalary, allowEsiOverride, esiRoundOff, esiNegativeArrearImpact, esiProvisionInCtc, esiProcessOvertime, esiProcessArrear,
                enableGratuity, includeInCtcGratuity, gratuityMode, gratuityCriteria,
                selectedGratuityDepts, gratuityCalculationComponents,
                minServicePeriod, customServiceYears,
                gratuityExceptions, otherExceptionDetails,
                deathDisablementServiceType, deathDisablementMinYears,
                yearsCalculationMode, includedServicePeriods, lwpLimitDays,
                maxGratuityType, customMaxGratuityAmount,
                gratuityProvisionRate, gratuityTenureYears, gratuityTenureMonths, gratuityTaxFreeLimit,
                enableLwf, lwfState, lwfEstablishmentId, lwfRegistrationDate,
                ptState, ptNumber,
                enableNps, npsRegistrationId, npsDeductionCycle, npsEmpRate, npsEmprRate, npsWageCeiling, npsIncludeInCtc
            };

            const { error } = await supabase
                .from('operational_config')
                .upsert({
                    config_key: `statutory_settings:${selectedTarget}`,
                    config_value: configValue,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'config_key' });

            if (error) throw error;
            setIsEditing(false);
        } catch (err) {
            console.error('Error saving statutory settings:', err);
            alert('Failed to save settings. Please try again.');
        }
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
            setEsiMaxMonthlySalary(backupState.esiMaxMonthlySalary);
            setAllowEsiOverride(backupState.allowEsiOverride);
            setEsiRoundOff(backupState.esiRoundOff);
            setEsiNegativeArrearImpact(backupState.esiNegativeArrearImpact);
            setEsiProvisionInCtc(backupState.esiProvisionInCtc);
            setEsiProcessOvertime(backupState.esiProcessOvertime);
            setEsiProcessArrear(backupState.esiProcessArrear);

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

            setGratuityProvisionRate(backupState.gratuityProvisionRate);
            setGratuityTenureYears(backupState.gratuityTenureYears);
            setGratuityTenureMonths(backupState.gratuityTenureMonths);
            setGratuityTaxFreeLimit(backupState.gratuityTaxFreeLimit);

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
            setLwfEstablishmentId(backupState.lwfEstablishmentId);
            setLwfRegistrationDate(backupState.lwfRegistrationDate);
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
                    <div className="flex items-center gap-3">
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

                <div className="w-full space-y-6">
                    {/* 1. ESI Settings */}
                    <div className={`bg-white p-8 rounded-xl border shadow-sm ${editingSection === 'esi' ? 'border-sky-300 ring-1 ring-sky-100' : 'border-slate-200'}`}>
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <Activity size={20} className="text-sky-600" />
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">EMPLOYEE STATE INSURANCE (ESI)</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={enableEsi} onChange={() => editingSection === 'esi' && setEnableEsi(!enableEsi)} disabled={editingSection !== 'esi'} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                                </label>
                                {editingSection === 'esi' ? (
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleCancel} className="px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
                                        <button onClick={() => handleSave()} className="px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors bg-emerald-600 text-white hover:bg-emerald-700"><Save size={14} /> Save</button>
                                    </div>
                                ) : (
                                    <button onClick={() => { handleEdit(); setEditingSection('esi'); }} className="px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors bg-white border border-slate-200 text-slate-600 hover:bg-slate-50" disabled={isEditing && editingSection !== 'esi'}><Edit2 size={14} /> Edit</button>
                                )}
                            </div>
                        </div>

                        <p className="text-sm text-slate-500 -mt-2 mb-6">
                            Organisations having 10 or more employees must register for Employee State Insurance (ESI). This scheme provides cash allowances and medical benefits for employees whose monthly salary is less than ₹{esiMaxMonthlySalary}. If the employee gets a salary revision which increases their monthly salary above ₹{esiMaxMonthlySalary}, they would have to continue making ESI contributions till the end of the contribution period in which the salary was revised (April-September or October-March).
                        </p>

                        {enableEsi && (
                            <div className="space-y-8 animate-in fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">ESIC Employer Code/Insurance Number <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            value={esiNumber}
                                            onChange={(e) => setEsiNumber(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Establishment Name <span className="text-rose-500">*</span></label>
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
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Date of Coverage / Applicability Date <span className="text-rose-500">*</span></label>
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
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Monthly gross salary eligible for ESI <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</div>
                                            <input
                                                type="text"
                                                value={esiMaxMonthlySalary}
                                                onChange={(e) => setEsiMaxMonthlySalary(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 font-bold focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                                            />
                                        </div>
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
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Component Mapping: <span className="text-rose-500">*</span></h4>
                                            <div className="group relative inline-block">
                                                <Info size={14} className="text-slate-400 cursor-help" />
                                                <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 text-center leading-relaxed font-normal normal-case whitespace-normal border border-slate-700">
                                                    Select the salary components that should be included in the calculation of ESI contributions.
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className={`group relative min-h-[50px] p-2 rounded-xl border flex flex-wrap gap-2 items-center transition-all shadow-sm ${isEditing ? 'bg-white border-slate-200 hover:border-sky-300 focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-50' : 'bg-slate-50 border-slate-100'}`}>
                                            {esiMappedComponents.map(comp => (
                                                <div key={comp} className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-lg text-xs font-bold border border-sky-100 shadow-sm animate-in zoom-in-95 group/tag hover:bg-sky-100 transition-colors">
                                                    {comp}
                                                    {isEditing && (
                                                        <button 
                                                            onClick={() => toggleEsiComponent(comp)}
                                                            className="text-sky-400 hover:text-rose-500 transition-colors"
                                                            title={`Remove ${comp}`}
                                                        >
                                                            <X size={14} strokeWidth={2.5} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            
                                            {isEditing && (
                                                <div className="flex-1 min-w-[120px] relative flex items-center justify-between">
                                                    <select 
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full"
                                                        value=""
                                                        onChange={(e) => {
                                                            if (e.target.value && !esiMappedComponents.includes(e.target.value)) {
                                                                toggleEsiComponent(e.target.value);
                                                            }
                                                        }}
                                                    >
                                                        <option value="" disabled>Add component...</option>
                                                        {ESI_COMPONENTS.filter(c => !esiMappedComponents.includes(c)).map(c => (
                                                            <option key={c} value={c}>{c}</option>
                                                        ))}
                                                        {ESI_COMPONENTS.filter(c => !esiMappedComponents.includes(c)).length === 0 && (
                                                            <option disabled>All components added</option>
                                                        )}
                                                    </select>
                                                    
                                                    <div className="flex-1 px-2 text-slate-400 text-xs italic font-medium pointer-events-none">
                                                        {esiMappedComponents.length === 0 ? "Select components..." : "Add more..."}
                                                    </div>

                                                    <div className="flex items-center gap-1.5 pr-1 text-slate-300 group-hover:text-slate-400 transition-colors">
                                                        {esiMappedComponents.length > 0 && (
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setEsiMappedComponents([]);
                                                                }}
                                                                className="p-1 hover:text-rose-500 transition-colors bg-white rounded-md hover:bg-rose-50 z-20"
                                                                title="Clear all"
                                                            >
                                                                <X size={16} strokeWidth={2.5} />
                                                            </button>
                                                        )}
                                                        <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
                                                        <ChevronDown size={18} strokeWidth={2.5} className="group-focus-within:rotate-180 transition-transform duration-200" />
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {!isEditing && esiMappedComponents.length === 0 && (
                                                <span className="text-sm text-slate-400 italic px-2 font-medium">No components mapped for ESI</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 pt-4">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Round off settings</h4>
                                            <div className="group relative inline-block">
                                                <Info size={14} className="text-slate-400 cursor-help" />
                                                <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 text-center leading-relaxed font-normal normal-case whitespace-normal border border-slate-700">
                                                    Floor: Rounds decimal down to the nearest whole number (e.g., 3.7 → 3). Ceiling: Rounds decimal up to the nearest whole number (e.g., 3.2 → 4).
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 pt-2">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${esiRoundOff === 'floor' ? 'border-sky-600 bg-sky-600' : 'border-slate-300 bg-white group-hover:border-slate-400'}`}>
                                                    {esiRoundOff === 'floor' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                </div>
                                                <input type="radio" className="hidden" name="esiRoundOff" value="floor" checked={esiRoundOff === 'floor'} onChange={() => isEditing && setEsiRoundOff('floor')} disabled={!isEditing} />
                                                <span className={`text-sm font-semibold transition-colors ${esiRoundOff === 'floor' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-600'}`}>Floor</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${esiRoundOff === 'ceiling' ? 'border-sky-600 bg-sky-600' : 'border-slate-300 bg-white group-hover:border-slate-400'}`}>
                                                    {esiRoundOff === 'ceiling' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                </div>
                                                <input type="radio" className="hidden" name="esiRoundOff" value="ceiling" checked={esiRoundOff === 'ceiling'} onChange={() => isEditing && setEsiRoundOff('ceiling')} disabled={!isEditing} />
                                                <span className={`text-sm font-semibold transition-colors ${esiRoundOff === 'ceiling' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-600'}`}>Ceiling</span>
                                            </label>
                                        </div>
                                    </div>

                                    <label className="flex items-start gap-3 cursor-pointer group pt-2">
                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${includeEmprContriEsi ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                            {includeEmprContriEsi && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={includeEmprContriEsi} onChange={() => isEditing && setIncludeEmprContriEsi(!includeEmprContriEsi)} disabled={!isEditing} />
                                        <span className="text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">Include employer's contribution in employee's salary structure.</span>
                                    </label>

                                    <label className="flex items-start gap-3 cursor-pointer group pt-2">
                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${esiNegativeArrearImpact ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                            {esiNegativeArrearImpact && <Check size={14} className="text-white stroke-[3]" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={esiNegativeArrearImpact} onChange={() => isEditing && setEsiNegativeArrearImpact(!esiNegativeArrearImpact)} disabled={!isEditing} />
                                        <span className="text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">Enable the impact of negative arrear on ESI.</span>
                                        <div className="group relative inline-block">
                                            <Info size={14} className="text-slate-400 cursor-help" />
                                            <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-3 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 text-left leading-relaxed font-normal normal-case whitespace-normal border border-slate-700">
                                                Example:<br/>
                                                Gross Salary (current month) = ₹18,000<br/>
                                                Negative Arrear (recovery) = ₹2,000<br/>
                                                Adjusted Gross = ₹16,000<br/><br/>
                                                If Yes → ESI = ₹16,000 × 0.75% = ₹120<br/>
                                                If No → ESI = ₹18,000 × 0.75% = ₹135
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                            </div>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-3 cursor-pointer group pt-2">
                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${esiProvisionInCtc ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                            {esiProvisionInCtc && <Check size={14} className="text-white stroke-[3]" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={esiProvisionInCtc} onChange={() => isEditing && setEsiProvisionInCtc(!esiProvisionInCtc)} disabled={!isEditing} />
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">Do you want to provision employer ESI in CTC?</span>
                                                <div className="group relative inline-block">
                                                    <Info size={14} className="text-slate-400 cursor-help" />
                                                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-3 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 text-left leading-relaxed font-normal normal-case whitespace-normal border border-slate-700">
                                                        When enabled, the employer's ESI contribution (3.25% of gross salary) is included as part of the employee's CTC package. This ensures the total cost-to-company reflects the actual expense borne by the employer.
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-3 cursor-pointer group pt-2">
                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${esiProcessOvertime ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                            {esiProcessOvertime && <Check size={14} className="text-white stroke-[3]" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={esiProcessOvertime} onChange={() => isEditing && setEsiProcessOvertime(!esiProcessOvertime)} disabled={!isEditing} />
                                        <span className="text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">Process ESI on overtime</span>
                                    </label>

                                    <label className="flex items-start gap-3 cursor-pointer group pt-2">
                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${esiProcessArrear ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                            {esiProcessArrear && <Check size={14} className="text-white stroke-[3]" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={esiProcessArrear} onChange={() => isEditing && setEsiProcessArrear(!esiProcessArrear)} disabled={!isEditing} />
                                        <span className="text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">Process ESI on arrear</span>
                                    </label>

                                    <label className="flex items-start gap-3 cursor-pointer group pt-2">
                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${allowEsiOverride ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                            {allowEsiOverride && <Check size={14} className="text-white stroke-[3]" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={allowEsiOverride} onChange={() => isEditing && setAllowEsiOverride(!allowEsiOverride)} disabled={!isEditing} />
                                        <span className="text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">Allow overriding of ESI at salary structure level.</span>
                                    </label>

                                    <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-6 mt-4">
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            <span className="font-bold">Note:</span> ESI deductions will be made only if the employee’s monthly salary is less than or equal to ₹{esiMaxMonthlySalary}. If the employee gets a salary revision which increases their monthly salary above ₹{esiMaxMonthlySalary}, they would have to continue making ESI contributions till the end of the contribution period in which the salary was revised (April-September or October-March).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. Gratuity Settings */}
                    <div className={`bg-white p-8 rounded-xl border shadow-sm ${editingSection === 'gratuity' ? 'border-sky-300 ring-1 ring-sky-100' : 'border-slate-200'}`}>
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <Award size={20} className="text-sky-600" />
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">GRATUITY</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={enableGratuity} onChange={() => editingSection === 'gratuity' && setEnableGratuity(!enableGratuity)} disabled={editingSection !== 'gratuity'} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                                </label>
                                {editingSection === 'gratuity' ? (
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleCancel} className="px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
                                        <button onClick={() => handleSave()} className="px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors bg-emerald-600 text-white hover:bg-emerald-700"><Save size={14} /> Save</button>
                                    </div>
                                ) : (
                                    <button onClick={() => { handleEdit(); setEditingSection('gratuity'); }} className="px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors bg-white border border-slate-200 text-slate-600 hover:bg-slate-50" disabled={isEditing && editingSection !== 'gratuity'}><Edit2 size={14} /> Edit</button>
                                )}
                            </div>
                        </div>

                        <p className="text-sm text-slate-500 -mt-2 mb-6">
                            The Payment of Gratuity Act, 1972 is applicable to establishments with 10 or more employees. It is a lump-sum payment made by the employer as a mark of recognition for the service rendered by the employee.
                        </p>

                        {enableGratuity && (
                            <div className="space-y-10 animate-in fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                                    {/* Gratuity provision rate */}
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Gratuity provision rate (% per year)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={gratuityProvisionRate}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^\d.]/g, '');
                                                    if (val === '' || !isNaN(Number(val))) {
                                                        setGratuityProvisionRate(val);
                                                    }
                                                }}
                                                disabled={!isEditing}
                                                placeholder="Enter %"
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-lg font-bold text-slate-700 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 shadow-sm"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center pb-2.5">
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




                                {/* Gratuity Calculation Components */}
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">GRATUITY CALCULATION COMPONENTS</label>
                                        <button 
                                            type="button"
                                            onClick={() => setShowGratuityFormulaModal(true)}
                                            className="text-sky-600 hover:text-sky-700 text-xs font-bold underline flex items-center gap-1"
                                        >
                                            Gratuity Formula
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <div className={`min-h-[48px] p-2 rounded-xl border flex flex-wrap gap-2 transition-all ${isEditing ? 'bg-white border-slate-200 hover:border-sky-300' : 'bg-slate-50 border-slate-100'}`}>
                                            {gratuityCalculationComponents.map(comp => (
                                                <div key={comp} className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 rounded-lg text-xs font-bold border border-sky-100 shadow-sm animate-in zoom-in-95">
                                                    {comp}
                                                    {isEditing && (
                                                        <button 
                                                            onClick={() => toggleGratuityComponent(comp)}
                                                            className="hover:text-rose-500 transition-colors"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            {isEditing && (
                                                <div className="flex-1 min-w-[200px] relative">
                                                    <select 
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        value=""
                                                        onChange={(e) => {
                                                            if (e.target.value && !gratuityCalculationComponents.includes(e.target.value)) {
                                                                toggleGratuityComponent(e.target.value);
                                                            }
                                                        }}
                                                    >
                                                        <option value="">Add component...</option>
                                                        {GRATUITY_COMPONENTS.filter(c => !gratuityCalculationComponents.includes(c)).map(c => (
                                                            <option key={c} value={c}>{c}</option>
                                                        ))}
                                                    </select>
                                                    <div className="h-full flex items-center px-2 text-slate-400 text-xs italic pointer-events-none">
                                                        Click here to add components...
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-medium italic">
                                        <Info size={14} className="text-sky-500" />
                                        Only Basic + DA is considered as per the GRATUITY Act.
                                    </p>
                                                  {/* Tenure for gratuity applicability */}
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Tenure for gratuity applicability</label>
                                    <div className="grid grid-cols-2 max-w-sm gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-slate-500"><span className="text-rose-500">*</span> Year</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={gratuityTenureYears}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^\d]/g, '');
                                                        setGratuityTenureYears(val);
                                                    }}
                                                    disabled={!isEditing}
                                                    placeholder="Enter years"
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm disabled:bg-slate-50 border-b-2 border-b-slate-300"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">Years</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-slate-500"><span className="text-rose-500">*</span> Month</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={gratuityTenureMonths}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^\d]/g, '');
                                                        setGratuityTenureMonths(val);
                                                    }}
                                                    disabled={!isEditing}
                                                    placeholder="Enter months"
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm disabled:bg-slate-50 border-b-2 border-b-slate-300"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">Months</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
               </div>





                                {/* Tax-free gratuity limit (₹) */}
                                <div className="space-y-4 pt-6 border-t border-slate-100">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Tax-free gratuity limit (₹)</label>
                                    <div className="max-w-xs relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</div>
                                        <input 
                                            type="text"
                                            value={gratuityTaxFreeLimit}
                                            onChange={(e) => {
                                                const raw = e.target.value.replace(/[^\d]/g, '');
                                                const formatted = raw ? parseInt(raw).toLocaleString('en-IN') : '';
                                                setGratuityTaxFreeLimit(formatted);
                                            }}
                                            disabled={!isEditing}
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-black text-slate-800 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 shadow-sm transition-all"
                                            placeholder="Enter Limit"
                                        />
                                    </div>
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mt-2">
                                        <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                            Tax Exemption: Up to ₹20 lakhs of gratuity is tax-free for non-government employees as per the GRATUITY Act.
                                        </p>
                                    </div>
                                </div>

                                {/* Nomination Configuration */}

                            </div>
                        )}
                    </div>

                    {/* 3. LWF Settings */}
                    <div className={`bg-white p-8 rounded-xl border shadow-sm ${editingSection === 'lwf' ? 'border-sky-300 ring-1 ring-sky-100' : 'border-slate-200'}`}>
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <Shield size={20} className="text-sky-600" />
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">LABOUR WELFARE FUND (LWF)</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={enableLwf} onChange={() => editingSection === 'lwf' && setEnableLwf(!enableLwf)} disabled={editingSection !== 'lwf'} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                                </label>
                                {editingSection === 'lwf' ? (
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleCancel} className="px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
                                        <button onClick={() => handleSave()} className="px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors bg-emerald-600 text-white hover:bg-emerald-700"><Save size={14} /> Save</button>
                                    </div>
                                ) : (
                                    <button onClick={() => { handleEdit(); setEditingSection('lwf'); }} className="px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors bg-white border border-slate-200 text-slate-600 hover:bg-slate-50" disabled={isEditing && editingSection !== 'lwf'}><Edit2 size={14} /> Edit</button>
                                )}
                            </div>
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
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Establishment ID</label>
                                    <input
                                        type="text"
                                        value={lwfEstablishmentId}
                                        onChange={(e) => setLwfEstablishmentId(e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="Enter Establishment ID"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Registration Date</label>
                                    <input
                                        type="date"
                                        value={lwfRegistrationDate}
                                        onChange={(e) => setLwfRegistrationDate(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 4. Professional Tax */}
                    <div className={`bg-white p-8 rounded-xl border shadow-sm ${editingSection === 'pt' ? 'border-sky-300 ring-1 ring-sky-100' : 'border-slate-200'}`}>
                        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">PROFESSIONAL TAX</h3>
                            {editingSection === 'pt' ? (
                                <div className="flex items-center gap-2">
                                    <button onClick={handleCancel} className="px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
                                    <button onClick={() => handleSave()} className="px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors bg-emerald-600 text-white hover:bg-emerald-700"><Save size={14} /> Save</button>
                                </div>
                            ) : (
                                <button onClick={() => { handleEdit(); setEditingSection('pt'); }} className="px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors bg-white border border-slate-200 text-slate-600 hover:bg-slate-50" disabled={isEditing && editingSection !== 'pt'}><Edit2 size={14} /> Edit</button>
                            )}
                        </div>
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
                    <div className={`bg-white p-8 rounded-xl border shadow-sm ${editingSection === 'nps' ? 'border-sky-300 ring-1 ring-sky-100' : 'border-slate-200'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <Briefcase size={20} className="text-sky-600" />
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">NATIONAL PENSION SYSTEM (NPS)</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={enableNps} onChange={() => editingSection === 'nps' && setEnableNps(!enableNps)} disabled={editingSection !== 'nps'} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                                </label>
                                {editingSection === 'nps' ? (
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleCancel} className="px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
                                        <button onClick={() => handleSave()} className="px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors bg-emerald-600 text-white hover:bg-emerald-700"><Save size={14} /> Save</button>
                                    </div>
                                ) : (
                                    <button onClick={() => { handleEdit(); setEditingSection('nps'); }} className="px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors bg-white border border-slate-200 text-slate-600 hover:bg-slate-50" disabled={isEditing && editingSection !== 'nps'}><Edit2 size={14} /> Edit</button>
                                )}
                            </div>
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

            {/* Gratuity Formula Modal */}
            {showGratuityFormulaModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-slate-200">
                        <div className="p-8 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Calculator size={24} />
                                </div>
                                <h3 className="font-black text-slate-400 uppercase tracking-[0.2em] text-sm">CALCULATION FORMULA</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <p className="text-base font-black text-slate-800">Standard Formula:</p>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
                                        <p className="font-mono text-lg text-indigo-700 font-bold text-center tracking-wide">
                                            Gratuity = (Basic + DA) × Years of Service × 15 / 26
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-base font-black text-slate-800">Example:</p>
                                    <ul className="space-y-3 px-2">
                                        <li className="flex items-center gap-3 text-slate-500 font-semibold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                            <span>Basic + DA = ₹50,000/month</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-500 font-semibold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                            <span>Service = 10 years 6 months (counted as 11 years)</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-500 font-semibold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                            <span>Gratuity = (50,000 × 11 × 15) / 26 = <span className="text-slate-800 font-black">₹3,17,307.69</span></span>
                                        </li>
                                    </ul>
                                </div>

                                <p className="text-xs text-slate-400 italic font-medium leading-relaxed mt-6">
                                    The divisor '26' represents average working days per month (excluding Sundays).
                                </p>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setShowGratuityFormulaModal(false)}
                                className="px-8 py-3 bg-white border border-slate-200 text-slate-700 font-black rounded-xl hover:bg-slate-100 transition-all text-sm shadow-sm active:scale-95"
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