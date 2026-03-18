
import React, { useState, useEffect } from 'react';
import { 
    Activity, Shield, Building2, ChevronDown, ChevronRight, 
    Edit2, Check, X, Info, Calendar, Lightbulb, Eye, Calculator,
    Plus, Search, User, Briefcase, AlertCircle, Mail, Landmark
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const BUSINESS_UNITS = [
    "MindInventory",
    "300 Minds",
    "CollabCRM"
];

const PfTdsSettings: React.FC = () => {
    // Selection State
    const [selectedTarget, setSelectedTarget] = useState('bu:MindInventory');
    const [paygroups, setPaygroups] = useState<any[]>([]);

    // Section Expand/Collapse State
    const [pfExpanded, setPfExpanded] = useState(true);
    const [tdsExpanded, setTdsExpanded] = useState(false);

    // Editing State per section
    const [isEditingPf, setIsEditingPf] = useState(false);
    const [isEditingTds, setIsEditingTds] = useState(false);

    // PF Data State (Exact from PFSettings.tsx)
    const [enablePf, setEnablePf] = useState(true);
    const [pfNumber, setPfNumber] = useState('AA/AAA/1234567/000');
    const [establishmentName, setEstablishmentName] = useState('TechFlow Systems Pvt Ltd');
    const [epfJoiningDate, setEpfJoiningDate] = useState('2023-01-12');
    const [empRate, setEmpRate] = useState('12% of Actual PF Wage');
    const [emprRate, setEmprRate] = useState('12% of Actual PF Wage');
    const [empLimit, setEmpLimit] = useState('1800');
    const [emprLimit, setEmprLimit] = useState('1800');
    const [includeEmprContri, setIncludeEmprContri] = useState(true);
    const [includeEdli, setIncludeEdli] = useState(false);
    const [includeAdminCharges, setIncludeAdminCharges] = useState(false);
    const [overrideRate, setOverrideRate] = useState(false);
    const [prorateRestricted, setProrateRestricted] = useState(false);
    const [considerComponents, setConsiderComponents] = useState(true);
    const [belowLimitComponents, setBelowLimitComponents] = useState<string[]>(['Basic Salary', 'Dearness Allowances (DA)']);

    // TDS Data State (Exact from TDSSettings.tsx)
    const [enableTds, setEnableTds] = useState(true);
    const [tan, setTan] = useState('DELA12345B');
    const [defaultRegime, setDefaultRegime] = useState('New Regime');
    const [linkDeclarations, setLinkDeclarations] = useState(true);
    const [challanReminder, setChallanReminder] = useState(true);
    const [respName, setRespName] = useState('Rajesh Kumar');
    const [respDesg, setRespDesg] = useState('Finance Manager');
    const [respEmail, setRespEmail] = useState('rajesh.k@techflow.com');

    // Backup states for cancellation
    const [backupPf, setBackupPf] = useState<any>(null);
    const [backupTds, setBackupTds] = useState<any>(null);

    // Modal States
    const [showSplitupModal, setShowSplitupModal] = useState(false);
    const [showBelowLimitModal, setShowBelowLimitModal] = useState(false);

    useEffect(() => {
        fetchPaygroups();
        fetchSettings();
    }, [selectedTarget]);

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
            // Fetch PF Settings
            const { data: pfData, error: pfError } = await supabase
                .from('operational_config')
                .select('config_value')
                .eq('config_key', `pf_settings:${selectedTarget}`)
                .single();

            if (pfError && pfError.code !== 'PGRST116') throw pfError;
            
            if (pfData?.config_value) {
                const config = pfData.config_value;
                setEnablePf(config.enablePf ?? true);
                setPfNumber(config.pfNumber ?? 'AA/AAA/1234567/000');
                setEstablishmentName(config.establishmentName ?? 'TechFlow Systems Pvt Ltd');
                setEpfJoiningDate(config.epfJoiningDate ?? '2023-01-12');
                setEmpRate(config.empRate ?? '12% of Actual PF Wage');
                setEmprRate(config.emprRate ?? '12% of Actual PF Wage');
                setEmpLimit(config.empLimit ?? '1800');
                setEmprLimit(config.emprLimit ?? '1800');
                setIncludeEmprContri(config.includeEmprContri ?? true);
                setIncludeEdli(config.includeEdli ?? false);
                setIncludeAdminCharges(config.includeAdminCharges ?? false);
                setOverrideRate(config.overrideRate ?? false);
                setProrateRestricted(config.prorateRestricted ?? false);
                setConsiderComponents(config.considerComponents ?? true);
                setBelowLimitComponents(config.belowLimitComponents ?? ['Basic Salary', 'Dearness Allowances (DA)']);
            }

            // Fetch TDS Settings
            const { data: tdsData, error: tdsError } = await supabase
                .from('operational_config')
                .select('config_value')
                .eq('config_key', `tds_settings:${selectedTarget}`)
                .single();

            if (tdsError && tdsError.code !== 'PGRST116') throw tdsError;

            if (tdsData?.config_value) {
                const config = tdsData.config_value;
                setEnableTds(config.enableTds ?? true);
                setTan(config.tan ?? 'DELA12345B');
                setDefaultRegime(config.defaultRegime ?? 'New Regime');
                setLinkDeclarations(config.linkDeclarations ?? true);
                setChallanReminder(config.challanReminder ?? true);
                setRespName(config.respName ?? 'Rajesh Kumar');
                setRespDesg(config.respDesg ?? 'Finance Manager');
                setRespEmail(config.respEmail ?? 'rajesh.k@techflow.com');
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    const handleEditPf = () => {
        setBackupPf({
            enablePf, pfNumber, establishmentName, epfJoiningDate, empRate, emprRate, empLimit, emprLimit,
            includeEmprContri, includeEdli, includeAdminCharges, overrideRate,
            prorateRestricted, considerComponents,
            belowLimitComponents: [...belowLimitComponents]
        });
        setIsEditingPf(true);
        setPfExpanded(true);
    };

    const handleSavePf = async () => {
        try {
            const configValue = {
                enablePf, pfNumber, establishmentName, epfJoiningDate, empRate, emprRate, empLimit, emprLimit,
                includeEmprContri, includeEdli, includeAdminCharges, overrideRate,
                prorateRestricted, considerComponents,
                belowLimitComponents
            };

            const { error } = await supabase
                .from('operational_config')
                .upsert({
                    config_key: `pf_settings:${selectedTarget}`,
                    config_value: configValue,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'config_key' });

            if (error) throw error;
            setIsEditingPf(false);
        } catch (err) {
            console.error('Error saving PF settings:', err);
            alert('Failed to save settings. Please try again.');
        }
    };

    const handleCancelPf = () => {
        if (backupPf) {
            setEnablePf(backupPf.enablePf);
            setPfNumber(backupPf.pfNumber);
            setEstablishmentName(backupPf.establishmentName);
            setEpfJoiningDate(backupPf.epfJoiningDate);
            setEmpRate(backupPf.empRate);
            setEmprRate(backupPf.emprRate);
            setEmpLimit(backupPf.empLimit);
            setEmprLimit(backupPf.emprLimit);
            setIncludeEmprContri(backupPf.includeEmprContri);
            setIncludeEdli(backupPf.includeEdli);
            setIncludeAdminCharges(backupPf.includeAdminCharges);
            setOverrideRate(backupPf.overrideRate);
            setProrateRestricted(backupPf.prorateRestricted);
            setConsiderComponents(backupPf.considerComponents);
            setBelowLimitComponents(backupPf.belowLimitComponents);
        }
        setIsEditingPf(false);
    };

    const handleEditTds = () => {
        setBackupTds({
            enableTds, tan, defaultRegime, linkDeclarations, challanReminder,
            respName, respDesg, respEmail
        });
        setIsEditingTds(true);
        setTdsExpanded(true);
    };

    const handleSaveTds = async () => {
        try {
            const configValue = {
                enableTds, tan, defaultRegime, linkDeclarations, challanReminder,
                respName, respDesg, respEmail
            };

            const { error } = await supabase
                .from('operational_config')
                .upsert({
                    config_key: `tds_settings:${selectedTarget}`,
                    config_value: configValue,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'config_key' });

            if (error) throw error;
            setIsEditingTds(false);
        } catch (err) {
            console.error('Error saving TDS settings:', err);
            alert('Failed to save settings. Please try again.');
        }
    };

    const handleCancelTds = () => {
        if (backupTds) {
            setEnableTds(backupTds.enableTds);
            setTan(backupTds.tan);
            setDefaultRegime(backupTds.defaultRegime);
            setLinkDeclarations(backupTds.linkDeclarations);
            setChallanReminder(backupTds.challanReminder);
            setRespName(backupTds.respName);
            setRespDesg(backupTds.respDesg);
            setRespEmail(backupTds.respEmail);
        }
        setIsEditingTds(false);
    };

    const toggleBelowLimitComponent = (item: string) => {
        if (!isEditingPf) return;
        setBelowLimitComponents(prev => 
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">PF & TDS Settings</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">Configure individual statutory parameters for your organization.</p>
                    </div>

                    <div className="relative">
                        <select
                            value={selectedTarget}
                            onChange={(e) => setSelectedTarget(e.target.value)}
                            className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none shadow-sm"
                        >
                            <optgroup label="Business Units">
                                {BUSINESS_UNITS.map(bu => (
                                    <option key={bu} value={`bu:${bu}`}>{bu}</option>
                                ))}
                            </optgroup>
                            <optgroup label="Payroll Paygroups">
                                {paygroups.map(pg => (
                                    <option key={pg.id} value={`pg:${pg.id}`}>
                                        {pg.name}
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Provident Fund Section */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                        <div 
                            className={`p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors ${pfExpanded ? 'bg-slate-50/30 border-b border-slate-100' : ''}`}
                            onClick={() => setPfExpanded(!pfExpanded)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-sky-100 rounded-xl text-sky-600">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Provident Fund (PF)</h3>
                                    <p className="text-xs text-slate-500 font-medium">Employee & Employer retirement contributions</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={enablePf} onChange={() => isEditingPf && setEnablePf(!enablePf)} disabled={!isEditingPf} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                                </label>
                                
                                {!isEditingPf ? (
                                    <button 
                                        onClick={handleEditPf}
                                        className="p-2.5 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl transition-all"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleSavePf} className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all">
                                            <Check size={18} />
                                        </button>
                                        <button onClick={handleCancelPf} className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all">
                                            <X size={18} />
                                        </button>
                                    </div>
                                )}
                                <div className={`p-1.5 rounded-full hover:bg-slate-200 transition-all ${pfExpanded ? 'rotate-180' : ''}`}>
                                    <ChevronDown size={20} className="text-slate-400" />
                                </div>
                            </div>
                        </div>

                        {pfExpanded && (
                            <div className="p-8 space-y-10 animate-in fade-in slide-in-from-top-1 duration-300">
                                {!enablePf && !isEditingPf ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="p-4 bg-slate-100 rounded-full text-slate-400 grayscale">
                                            <Shield size={48} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-400">PF is currently Disabled</h4>
                                            <p className="text-sm text-slate-400 max-w-xs mx-auto">Click the edit button above to enable and configure Provident Fund settings.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`${!enablePf ? 'opacity-40 pointer-events-none' : ''} space-y-8 animate-in fade-in`}>
                                        <p className="text-sm text-slate-500 -mt-2">
                                            Any organisation with 20 or more employees must register for the Employee Provident Fund (EPF) scheme, a retirement benefit plan for all salaried employees.
                                        </p>

                                        {/* Basic Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">EPF Number</label>
                                                <input
                                                    type="text"
                                                    value={pfNumber}
                                                    onChange={(e) => setPfNumber(e.target.value)}
                                                    disabled={!isEditingPf}
                                                    placeholder='AA/AAA/1234567/000'
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:text-slate-500 placeholder:text-slate-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Establishment Name</label>
                                                <input
                                                    type="text"
                                                    value={establishmentName}
                                                    onChange={(e) => setEstablishmentName(e.target.value)}
                                                    disabled={!isEditingPf}
                                                    placeholder='Enter Establishment Name'
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:text-slate-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Joining Date under EPF</label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        value={epfJoiningDate}
                                                        onChange={(e) => setEpfJoiningDate(e.target.value)}
                                                        disabled={!isEditingPf}
                                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:text-slate-500"
                                                    />
                                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                                            <div className="xl:col-span-8 space-y-8">
                                                {/* Employee Contribution */}
                                                <div>
                                                    <div className="flex items-center mb-2">
                                                        <label className="block text-sm font-bold text-slate-700">Employee Contribution Rate</label>
                                                        <button
                                                            onClick={() => setShowBelowLimitModal(true)}
                                                            className="ml-3 text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                                                        >
                                                            <Calculator size={12} /> PF wages below 15000?
                                                        </button>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="relative w-full md:min-w-[240px] md:w-auto">
                                                            <select
                                                                disabled
                                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 appearance-none bg-slate-50 focus:outline-none cursor-not-allowed"
                                                                value="12% of Actual PF Wage"
                                                            >
                                                                <option>12% of Actual PF Wage</option>
                                                            </select>
                                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                        </div>
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            <span className="text-sm text-slate-600 flex items-center gap-1">
                                                                Limit employee's PF contribution amount maximum of
                                                                <div className="group relative">
                                                                    <Info size={14} className="text-slate-400 cursor-help" />
                                                                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 text-center leading-relaxed font-normal normal-case whitespace-normal">
                                                                        If no capping set, then actual contribution will be deducted as Employee Contribution. If Zero, then actual deduction will be considered.
                                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                                    </div>
                                                                </div>
                                                            </span>
                                                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden w-32">
                                                                <div className="px-3 py-2 bg-slate-50 text-xs font-bold text-slate-500 border-r border-slate-200">INR</div>
                                                                <input
                                                                    type="text"
                                                                    value={empLimit}
                                                                    onChange={(e) => setEmpLimit(e.target.value)}
                                                                    disabled={!isEditingPf}
                                                                    className="w-full px-2 py-2 text-sm text-slate-700 focus:outline-none disabled:bg-slate-50"
                                                                />
                                                            </div>
                                                            <span className="text-sm text-slate-600">monthly.</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Employer Contribution */}
                                                <div>
                                                    <div className="flex justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <label className="block text-sm font-bold text-slate-700">Employer Contribution Rate</label>
                                                            <div className="group relative">
                                                                <Info size={14} className="text-slate-400 cursor-help" />
                                                                <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-3 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 text-left leading-relaxed font-normal normal-case whitespace-normal">
                                                                    <div className="mb-2">
                                                                        <strong>12% of Actual PF Wage</strong> - Calculates the contribution based on the employee's full Basic + DA, no matter how high it is.
                                                                    </div>
                                                                    <div>
                                                                        <strong>12% of Restricted PF Wage</strong> - Calculates the contribution based on the statutory wage ceiling. Recommended for most of the private companies.
                                                                    </div>
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setShowSplitupModal(true)}
                                                            className="text-xs font-bold text-sky-600 hover:underline"
                                                        >
                                                            View Splitup
                                                        </button>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="relative w-full md:min-w-[240px] md:w-auto">
                                                            <select
                                                                disabled={!isEditingPf}
                                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 appearance-none bg-white disabled:bg-slate-50 focus:outline-none focus:border-sky-500"
                                                                value={emprRate}
                                                                onChange={(e) => setEmprRate(e.target.value)}
                                                            >
                                                                <option>12% of Actual PF Wage</option>
                                                                <option>12% of Restricted PF Wage</option>
                                                            </select>
                                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                        </div>
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            <span className="text-sm text-slate-600">Limit employer's PF contribution amount maximum of</span>
                                                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden w-32">
                                                                <div className="px-3 py-2 bg-slate-50 text-xs font-bold text-slate-500 border-r border-slate-200">INR</div>
                                                                <input
                                                                    type="text"
                                                                    value={emprLimit}
                                                                    onChange={(e) => setEmprLimit(e.target.value)}
                                                                    disabled={!isEditingPf}
                                                                    className="w-full px-2 py-2 text-sm text-slate-700 focus:outline-none disabled:bg-slate-50"
                                                                />
                                                            </div>
                                                            <span className="text-sm text-slate-600">monthly.</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Checkbox Configurations */}
                                                <div className="space-y-4 pt-2">
                                                    <label className="flex items-start gap-3 cursor-pointer group">
                                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${includeEmprContri ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                                            {includeEmprContri && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                        </div>
                                                        <input type="checkbox" className="hidden" checked={includeEmprContri} onChange={() => isEditingPf && setIncludeEmprContri(!includeEmprContri)} disabled={!isEditingPf} />
                                                        <span className="text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">Include employer's contribution in employee's salary structure.</span>
                                                    </label>

                                                    {includeEmprContri && (
                                                        <div className="ml-8 space-y-3 pl-4 border-l-2 border-slate-100">
                                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${includeEdli ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                                                    {includeEdli && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                                </div>
                                                                <input type="checkbox" className="hidden" checked={includeEdli} onChange={() => isEditingPf && setIncludeEdli(!includeEdli)} disabled={!isEditingPf} />
                                                                <span className="text-sm text-slate-600 flex items-center gap-2">
                                                                    Include employer's EDLI contribution in employee's salary structure.
                                                                    <div className="group relative inline-block">
                                                                        <Info size={14} className="text-slate-400 cursor-help" />
                                                                        <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 text-center leading-relaxed font-normal normal-case whitespace-normal">
                                                                            EDLI Contribution is 0.50 %of PF Wage. Maximum Employer Contribution for EDLI is 75.
                                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                                        </div>
                                                                    </div>
                                                                </span>
                                                            </label>
                                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${includeAdminCharges ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                                                    {includeAdminCharges && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                                </div>
                                                                <input type="checkbox" className="hidden" checked={includeAdminCharges} onChange={() => isEditingPf && setIncludeAdminCharges(!includeAdminCharges)} disabled={!isEditingPf} />
                                                                <span className="text-sm text-slate-600 flex items-center gap-2">
                                                                    Include admin charges in employee's salary structure.
                                                                    <div className="group relative inline-block">
                                                                        <Info size={14} className="text-slate-400 cursor-help" />
                                                                        <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 text-center leading-relaxed font-normal normal-case whitespace-normal">
                                                                            EPF Admin Charges is 0.50% of PF Wage.
                                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                                        </div>
                                                                    </div>
                                                                </span>
                                                            </label>
                                                        </div>
                                                    )}

                                                    <label className="flex items-start gap-3 cursor-pointer group pt-2">
                                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${overrideRate ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                                            {overrideRate && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                        </div>
                                                        <input type="checkbox" className="hidden" checked={overrideRate} onChange={() => isEditingPf && setOverrideRate(!overrideRate)} disabled={!isEditingPf} />
                                                        <span className="text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">Override PF contribution rate at employee level</span>
                                                    </label>
                                                </div>

                                                {/* LOP Configuration */}
                                                <div className="pt-8 border-t border-slate-100 space-y-6">
                                                    <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                                                        <AlertCircle size={16} className="text-sky-600" />
                                                        PF Configuration when LOP Applied
                                                    </div>

                                                    <label className="flex items-start gap-3 cursor-pointer group">
                                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${prorateRestricted ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                                            {prorateRestricted && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                        </div>
                                                        <input type="checkbox" className="hidden" checked={prorateRestricted} onChange={() => isEditingPf && setProrateRestricted(!prorateRestricted)} disabled={!isEditingPf} />
                                                        <div>
                                                            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">
                                                                Pro-rate Restricted PF Wage
                                                                <div className="group/tip relative inline-block">
                                                                    <Info size={14} className="text-slate-400 cursor-help" />
                                                                    <div className="invisible group-hover/tip:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-[110] text-center leading-relaxed font-normal normal-case whitespace-normal border border-slate-700">
                                                                        Restricted PF Wage allows you to limit the EPF contribution to 15,000 even if the employees' PF Wage is greater than that.
                                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                                    </div>
                                                                </div>
                                                            </span>
                                                            <span className="block text-sm text-slate-500 mt-1">PF contribution will be pro-rated based on the number of days worked by the employee.</span>
                                                        </div>
                                                    </label>

                                                    <label className="flex items-start gap-3 cursor-pointer group">
                                                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${considerComponents ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                                            {considerComponents && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                        </div>
                                                        <input type="checkbox" className="hidden" checked={considerComponents} onChange={() => isEditingPf && setConsiderComponents(!considerComponents)} disabled={!isEditingPf} />
                                                        <div>
                                                            <span className="block text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">Consider all applicable salary components if PF wage is less than ₹15,000 after Loss of Pay</span>
                                                            <span className="block text-sm text-slate-500 mt-1">PF wage will be computed using the salary earned in that month rather than the structure amount.</span>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Right: Sample Calculation */}
                                            <div className="xl:col-span-4 space-y-6">
                                                <div className="bg-orange-50/40 rounded-2xl border border-orange-100 p-8 flex flex-col gap-6 shadow-sm">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-slate-800">Sample EPF Calculation</h3>
                                                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                                                            Let's assume the PF wage is <span className="font-bold text-slate-800">₹ 20,000</span>. The breakup of contribution will be:
                                                        </p>
                                                    </div>

                                                    {/* Calculation Card */}
                                                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                                        <div className="space-y-6">
                                                            {/* Employee's Contribution */}
                                                            <div className="space-y-3">
                                                                <h4 className="text-sm font-bold text-slate-800">Employee's Contribution</h4>
                                                                <div className="flex justify-between items-center text-sm">
                                                                    <span className="text-slate-600">EPF (12% of 20000)</span>
                                                                    <span className="font-bold text-slate-800">₹ 2400</span>
                                                                </div>
                                                            </div>

                                                            {/* Divider */}
                                                            <div className="border-t border-dashed border-slate-200"></div>

                                                            {/* Employer's Contribution */}
                                                            <div className="space-y-3">
                                                                <h4 className="text-sm font-bold text-slate-800">Employer's Contribution</h4>
                                                                <div className="flex justify-between items-center text-sm">
                                                                    <span className="text-slate-600">EPS (8.33% of 20000 (Max of ₹ 15,000))</span>
                                                                    <span className="font-bold text-slate-800">₹ 1250</span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-sm">
                                                                    <span className="text-slate-600">EPF (12% of 20000 - EPS)</span>
                                                                    <span className="font-bold text-slate-800">₹ 1150</span>
                                                                </div>
                                                                {includeEdli && (
                                                                    <div className="flex justify-between items-center text-sm animate-in fade-in slide-in-from-top-1">
                                                                        <span className="text-slate-600">EDLI Contribution (0.50% of 20000)</span>
                                                                        <span className="font-bold text-slate-800">₹ 75</span>
                                                                    </div>
                                                                )}
                                                                {includeAdminCharges && (
                                                                    <div className="flex justify-between items-center text-sm animate-in fade-in slide-in-from-top-1">
                                                                        <span className="text-slate-600">EPF Admin Charges (0.50% of 20000)</span>
                                                                        <span className="font-bold text-slate-800">₹ 100</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Final Total */}
                                                            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                                                <span className="text-base font-bold text-slate-800 uppercase tracking-wide">Total</span>
                                                                <span className="text-xl font-black text-slate-900">₹ {2400 + (includeEdli ? 75 : 0) + (includeAdminCharges ? 100 : 0)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        )}
                    </div>

                    {/* TDS Configuration Section */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                        <div 
                            className={`p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors ${tdsExpanded ? 'bg-slate-50/30 border-b border-slate-100' : ''}`}
                            onClick={() => setTdsExpanded(!tdsExpanded)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600">
                                    <Calculator size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">TDS Configuration</h3>
                                    <p className="text-xs text-slate-500 font-medium">Income Tax withholding & Responsible person details</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={enableTds} onChange={() => isEditingTds && setEnableTds(!enableTds)} disabled={!isEditingTds} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                                </label>
                                
                                {!isEditingTds ? (
                                    <button 
                                        onClick={handleEditTds}
                                        className="p-2.5 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl transition-all"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleSaveTds} className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all">
                                            <Check size={18} />
                                        </button>
                                        <button onClick={handleCancelTds} className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all">
                                            <X size={18} />
                                        </button>
                                    </div>
                                )}
                                <div className={`p-1.5 rounded-full hover:bg-slate-200 transition-all ${tdsExpanded ? 'rotate-180' : ''}`}>
                                    <ChevronDown size={20} className="text-slate-400" />
                                </div>
                            </div>
                        </div>

                        {tdsExpanded && (
                            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-top-1 duration-300">
                                {!enableTds && !isEditingTds ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="p-4 bg-slate-100 rounded-full text-slate-400 grayscale">
                                            <Landmark size={48} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-400">TDS is currently Disabled</h4>
                                            <p className="text-sm text-slate-400 max-w-xs mx-auto">Click the edit button above to enable and configure Tax Deducted at Source settings.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`space-y-8 animate-in fade-in ${!enableTds ? 'opacity-40 pointer-events-none' : ''}`}>
                                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                            {/* Top Toggle Section */}
                                            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-800">Enable TDS on Salaries</h3>
                                                    <p className="text-sm text-slate-500 mt-1 max-w-xl">
                                                        Automatically calculate and deduct TDS on salaries as per Income Tax rules. Required for Form 24Q filing.
                                                    </p>
                                                </div>
                                                <label className={`relative inline-flex items-center mt-1 ${isEditingTds ? 'cursor-pointer' : 'cursor-default opacity-80'}`}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={enableTds} 
                                                        onChange={() => isEditingTds && setEnableTds(!enableTds)} 
                                                        disabled={!isEditingTds}
                                                        className="sr-only peer" 
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>

                                            {enableTds && (
                                                <div className="p-8 space-y-8 animate-in slide-in-from-top-2">
                                                {/* Form Fields */}
                                                <div className="grid grid-cols-1 gap-6">
                                                    {/* TAN */}
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                                            TAN (Tax Deduction Account Number) <span className="text-rose-500">*</span>
                                                        </label>
                                                        <input 
                                                            type="text" 
                                                            value={tan}
                                                            onChange={(e) => setTan(e.target.value)}
                                                            disabled={!isEditingTds}
                                                            placeholder="e.g., DELA12345B" 
                                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:normal-case placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-600" 
                                                        />
                                                    </div>

                                                    {/* Tax Regime */}
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                                            Default Tax Regime
                                                            <div className="group relative">
                                                                <Info size={14} className="text-slate-400 cursor-help" />
                                                                <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl z-50 text-center leading-relaxed">
                                                                    <span className="font-bold text-emerald-300 block mb-1">New Regime:</span> Slabs up to 30% + cess
                                                                    <span className="block h-px bg-slate-600 my-1"></span>
                                                                    <span className="font-bold text-amber-300 block mb-1">Old Regime:</span> Allows deductions like 80C up to ₹1.5L
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                                </div>
                                                            </div>
                                                        </label>
                                                        <div className="relative">
                                                            <select 
                                                                value={defaultRegime}
                                                                onChange={(e) => setDefaultRegime(e.target.value)}
                                                                disabled={!isEditingTds}
                                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white appearance-none focus:outline-none focus:border-purple-500 disabled:bg-slate-50 disabled:text-slate-600"
                                                            >
                                                                <option>New Regime</option>
                                                                <option>Old Regime</option>
                                                            </select>
                                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                        </div>
                                                    </div>

                                                    {/* Link Declarations Toggle */}
                                                    <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-start justify-between gap-4">
                                                        <div>
                                                            <h4 className="text-sm font-bold text-slate-800">Link Investment Declarations</h4>
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                Use employee declarations for TDS calculation. Ensures accurate exemptions (80C, 80D, HRA, etc.) are applied.
                                                            </p>
                                                        </div>
                                                        <label className={`relative inline-flex items-center shrink-0 ${isEditingTds ? 'cursor-pointer' : 'cursor-default opacity-80'}`}>
                                                            <input 
                                                                type="checkbox" 
                                                                checked={linkDeclarations} 
                                                                onChange={() => isEditingTds && setLinkDeclarations(!linkDeclarations)} 
                                                                disabled={!isEditingTds}
                                                                className="sr-only peer" 
                                                            />
                                                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                                        </label>
                                                    </div>

                                                    {/* TDS Challan Reminder */}
                                                    <div className="flex items-center justify-between py-2">
                                                        <label className="text-sm font-bold text-slate-700">TDS Challan Deposit Reminder</label>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs text-slate-500">Send reminders before due date</span>
                                                            <label className={`relative inline-flex items-center ${isEditingTds ? 'cursor-pointer' : 'cursor-default opacity-80'}`}>
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={challanReminder} 
                                                                    onChange={() => isEditingTds && setChallanReminder(!challanReminder)} 
                                                                    disabled={!isEditingTds}
                                                                    className="sr-only peer" 
                                                                />
                                                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* Responsible Person */}
                                                    <div className="pt-4 border-t border-slate-100">
                                                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                                                            <User size={16} className="text-purple-600" /> Responsible Person (For TRACES)
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Full Name</label>
                                                                <div className="relative">
                                                                    <input 
                                                                        type="text" 
                                                                        value={respName}
                                                                        onChange={e => setRespName(e.target.value)}
                                                                        disabled={!isEditingTds}
                                                                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 disabled:bg-slate-50 disabled:text-slate-600"
                                                                        placeholder="Name"
                                                                    />
                                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Designation</label>
                                                                <div className="relative">
                                                                    <input 
                                                                        type="text" 
                                                                        value={respDesg}
                                                                        onChange={e => setRespDesg(e.target.value)}
                                                                        disabled={!isEditingTds}
                                                                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 disabled:bg-slate-50 disabled:text-slate-600"
                                                                        placeholder="Designation"
                                                                    />
                                                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                                </div>
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-xs font-bold text-slate-500 mb-1.5">Email Address</label>
                                                                <div className="relative">
                                                                    <input 
                                                                        type="email" 
                                                                        value={respEmail}
                                                                        onChange={e => setRespEmail(e.target.value)}
                                                                        disabled={!isEditingTds}
                                                                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 disabled:bg-slate-50 disabled:text-slate-600"
                                                                        placeholder="official@company.com"
                                                                    />
                                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Info Banner */}
                                                <div className="space-y-6 pt-4 border-t border-slate-100">
                                                    <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-start gap-3">
                                                        <Info size={20} className="text-sky-600 mt-0.5 shrink-0" />
                                                        <p className="text-sm text-sky-800 leading-relaxed">
                                                            TAN is mandatory for generating Form 24Q. Link declarations to reduce employee TDS burden by factoring in their tax-saving investments automatically.
                                                        </p>
                                                    </div>
                                                </div>
                                                    </div>
                                                </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* High-Fidelity PF Splitup Modal from Standalone Component */}
            {showSplitupModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col animate-in zoom-in-95 duration-300 border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">CONTRIBUTION RATE</h3>
                            <button
                                onClick={() => setShowSplitupModal(false)}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-left font-sans">
                                <thead className="bg-white border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">SUB COMPONENTS</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">EMPLOYER'S CONTRIBUTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 bg-white">
                                    <tr>
                                        <td className="px-6 py-5 text-sm font-bold text-slate-700">Employees' Provident Fund (EPF)</td>
                                        <td className="px-6 py-5 text-sm font-bold text-sky-600">3.67% of PF Wage</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-5 text-sm font-bold text-slate-700">Employees' Pension Scheme (EPS)</td>
                                        <td className="px-6 py-5 text-sm font-bold text-indigo-600 flex items-center gap-2">
                                            8.33% of PF Wage
                                            <div className="group relative">
                                                <Info size={14} className="text-slate-400 cursor-help" />
                                                <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max p-3 bg-slate-800 text-white text-[10px] rounded-lg shadow-2xl z-[110] text-center leading-relaxed font-normal normal-case whitespace-nowrap border border-slate-700">
                                                    Maximum Employer Contribution for EPS is ₹1,250
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button onClick={() => setShowSplitupModal(false)} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all">
                                Close Breakdown
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* High-Fidelity PF Below Limit Modal from Standalone Component */}
            {showBelowLimitModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-sky-100 text-sky-600 rounded-2xl">
                                    <Calculator size={22} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Sample EPF Calculation</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">When Wage is below ₹15,000</p>
                                </div>
                            </div>
                            <button onClick={() => setShowBelowLimitModal(false)} className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all text-slate-400 hover:text-rose-500">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Selected Components for Calculation</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {['Basic Salary', 'HRA', 'Dearness Allowances (DA)'].map(comp => (
                                        <label key={comp} onClick={() => isEditingPf && toggleBelowLimitComponent(comp)} className={`flex items-center gap-2 p-3 border rounded-2xl cursor-pointer transition-all ${belowLimitComponents.includes(comp) ? 'bg-sky-50 border-sky-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${belowLimitComponents.includes(comp) ? 'bg-sky-600 border-sky-600 scale-110' : 'bg-slate-50 border-slate-200'}`}>
                                                {belowLimitComponents.includes(comp) && <Check size={12} className="text-white stroke-[4]" />}
                                            </div>
                                            <span className={`text-xs font-bold ${belowLimitComponents.includes(comp) ? 'text-sky-900' : 'text-slate-600'}`}>{comp}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                                <div className="flex gap-3">
                                    <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-800 leading-relaxed font-bold">
                                        Note: When restricted wage is disabled, the contribution is calculated on the actual wages of selected components without capping.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest pl-1">Employee Share (12%)</h4>
                                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex justify-between items-center group hover:bg-indigo-50 transition-colors">
                                        <span className="text-sm font-bold text-slate-600">EPF Contribution</span>
                                        <span className="text-base font-black text-indigo-700">₹ 1,440</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-black text-sky-400 uppercase tracking-widest pl-1">Employer Share (12%)</h4>
                                    <div className="space-y-3">
                                        <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 flex justify-between items-center group hover:bg-sky-50 transition-colors">
                                            <span className="text-sm font-bold text-slate-600">EPS (8.33%)</span>
                                            <span className="text-base font-black text-sky-700">₹ 1,000</span>
                                        </div>
                                        <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 flex justify-between items-center group hover:bg-sky-50 transition-colors">
                                            <span className="text-sm font-bold text-slate-600">EPF (3.67%)</span>
                                            <span className="text-base font-black text-sky-700">₹ 440</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t-2 border-dashed border-slate-100 flex justify-between items-center">
                                <div>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Total Remittance</span>
                                    <p className="text-[10px] text-slate-400 font-bold italic">Calculated for wage of ₹12,000</p>
                                </div>
                                <span className="text-3xl font-black text-slate-900 tracking-tighter">₹ 2,880</span>
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button onClick={() => setShowBelowLimitModal(false)} className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PfTdsSettings;
