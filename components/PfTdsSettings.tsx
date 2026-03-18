import React, { useState, useEffect } from 'react';
import { 
    Activity, Shield, Building2, ChevronDown, ChevronRight, 
    Edit2, Check, X, Info, Calendar, Lightbulb, Eye, Calculator,
    Plus, Search, User, Briefcase, AlertCircle, Mail, Landmark, Save
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

    // Editing State per section
    const [isEditingPf, setIsEditingPf] = useState(false);
    const [isEditingTds, setIsEditingTds] = useState(false);

    // PF Data State
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

    // TDS Data State
    const [enableTds, setEnableTds] = useState(true);
    const [tan, setTan] = useState('DELA12345B');
    const [defaultRegime, setDefaultRegime] = useState('New Regime');
    const [respName, setRespName] = useState('Rajesh Kumar');
    const [respDesg, setRespDesg] = useState('Finance Manager');
    const [respEmail, setRespEmail] = useState('rajesh.k@techflow.com');

    // Backup states
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
            const { data, error } = await supabase.from('paygroups').select('*').order('name');
            if (error) throw error;
            setPaygroups(data || []);
        } catch (err) { console.error('Error fetching paygroups:', err); }
    };

    const fetchSettings = async () => {
        try {
            const { data: pfData, error: pfError } = await supabase.from('operational_config').select('config_value').eq('config_key', `pf_settings:${selectedTarget}`).single();
            if (!pfError && pfData?.config_value) {
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
            const { data: tdsData, error: tdsError } = await supabase.from('operational_config').select('config_value').eq('config_key', `tds_settings:${selectedTarget}`).single();
            if (!tdsError && tdsData?.config_value) {
                const config = tdsData.config_value;
                setEnableTds(config.enableTds ?? true);
                setTan(config.tan ?? 'DELA12345B');
                setDefaultRegime(config.defaultRegime ?? 'New Regime');
                setRespName(config.respName ?? 'Rajesh Kumar');
                setRespDesg(config.respDesg ?? 'Finance Manager');
                setRespEmail(config.respEmail ?? 'rajesh.k@techflow.com');
            }
        } catch (err) { console.error('Error fetching settings:', err); }
    };

    const handleEditPf = () => {
        setBackupPf({ enablePf, pfNumber, establishmentName, epfJoiningDate, empRate, emprRate, empLimit, emprLimit, includeEmprContri, includeEdli, includeAdminCharges, overrideRate, prorateRestricted, considerComponents, belowLimitComponents: [...belowLimitComponents] });
        setIsEditingPf(true);
    };

    const handleSavePf = async () => {
        try {
            const configValue = { enablePf, pfNumber, establishmentName, epfJoiningDate, empRate, emprRate, empLimit, emprLimit, includeEmprContri, includeEdli, includeAdminCharges, overrideRate, prorateRestricted, considerComponents, belowLimitComponents };
            const { error } = await supabase.from('operational_config').upsert({ config_key: `pf_settings:${selectedTarget}`, config_value: configValue, updated_at: new Date().toISOString() }, { onConflict: 'config_key' });
            if (error) throw error;
            setIsEditingPf(false);
        } catch (err) { console.error('Error saving PF settings:', err); }
    };

    const handleCancelPf = () => {
        if (backupPf) {
            setEnablePf(backupPf.enablePf); setPfNumber(backupPf.pfNumber); setEstablishmentName(backupPf.establishmentName); setEpfJoiningDate(backupPf.epfJoiningDate); setEmpRate(backupPf.empRate); setEmprRate(backupPf.emprRate); setEmpLimit(backupPf.empLimit); setEmprLimit(backupPf.emprLimit); setIncludeEmprContri(backupPf.includeEmprContri); setIncludeEdli(backupPf.includeEdli); setIncludeAdminCharges(backupPf.includeAdminCharges); setOverrideRate(backupPf.overrideRate); setProrateRestricted(backupPf.prorateRestricted); setConsiderComponents(backupPf.considerComponents); setBelowLimitComponents(backupPf.belowLimitComponents);
        }
        setIsEditingPf(false);
    };

    const handleEditTds = () => {
        setBackupTds({ enableTds, tan, defaultRegime, respName, respDesg, respEmail });
        setIsEditingTds(true);
    };

    const handleSaveTds = async () => {
        try {
            const configValue = { enableTds, tan, defaultRegime, respName, respDesg, respEmail };
            const { error } = await supabase.from('operational_config').upsert({ config_key: `tds_settings:${selectedTarget}`, config_value: configValue, updated_at: new Date().toISOString() }, { onConflict: 'config_key' });
            if (error) throw error;
            setIsEditingTds(false);
        } catch (err) { console.error('Error saving TDS settings:', err); }
    };

    const handleCancelTds = () => {
        if (backupTds) {
            setEnableTds(backupTds.enableTds); setTan(backupTds.tan); setDefaultRegime(backupTds.defaultRegime); setRespName(backupTds.respName); setRespDesg(backupTds.respDesg); setRespEmail(backupTds.respEmail);
        }
        setIsEditingTds(false);
    };

    const toggleBelowLimitComponent = (item: string) => {
        if (!isEditingPf) return;
        setBelowLimitComponents(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    };

    return (
        <div className="h-full overflow-y-auto bg-[#F8FAFC]">
            <div className="p-4 lg:p-8 w-full space-y-8 animate-in fade-in duration-300 pb-20">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">PF & TDS Settings</h2>
                        <p className="text-slate-500 mt-1 text-sm font-medium">Manage PF and TDS configurations for your organization.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group/select">
                            <select
                                value={selectedTarget}
                                onChange={(e) => setSelectedTarget(e.target.value)}
                                className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none cursor-pointer focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none shadow-sm min-w-[180px]"
                            >
                                <optgroup label="Business Units" className="font-bold text-slate-900 bg-white">
                                    {BUSINESS_UNITS.map(bu => (
                                        <option key={bu} value={`bu:${bu}`} className="font-semibold py-2 italic">{bu}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Payroll Paygroups" className="font-bold text-slate-900 bg-white">
                                    {paygroups.map(pg => (
                                        <option key={pg.id} value={`pg:${pg.id}`} className="font-semibold py-2 italic text-emerald-600">
                                            {pg.name}
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover/select:text-indigo-500 transition-colors" size={16} />
                        </div>
                    </div>
                </div>


                <div className="space-y-12">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* PF Section */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm space-y-8 p-8">
                                <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <Shield size={20} className="text-sky-600" />
                                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">PROVIDENT FUND (PF)</h3>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center pr-6 border-r border-slate-200">
                                            <label className={`relative inline-flex items-center cursor-pointer ${!isEditingPf && 'cursor-default opacity-80'}`}>
                                                <input type="checkbox" checked={enablePf} onChange={() => isEditingPf && setEnablePf(!enablePf)} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {isEditingPf ? (
                                                <div className="flex gap-2">
                                                    <button onClick={handleCancelPf} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">Cancel</button>
                                                    <button onClick={handleSavePf} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm flex items-center gap-2 shadow-sm transition-all"><Save size={16} /> Save Settings</button>
                                                </div>
                                            ) : (
                                                <button onClick={handleEditPf} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm flex items-center gap-2 transition-all">
                                                    <Edit2 size={16} /> Edit Settings
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">

                                {enablePf && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                                            {/* Form Fields */}
                                            <div className="xl:col-span-8 space-y-10">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">EPF Code (Registration Number)</label>
                                                        <input type="text" value={pfNumber} onChange={e => setPfNumber(e.target.value)} disabled={!isEditingPf} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-sky-500/20 transition-all placeholder:text-slate-300 disabled:opacity-70" placeholder="AA/AAA/1234567/000" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">Establishment Name</label>
                                                        <input type="text" value={establishmentName} onChange={e => setEstablishmentName(e.target.value)} disabled={!isEditingPf} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-sky-500/20 transition-all disabled:opacity-70" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">EPF Registration Date</label>
                                                        <div className="relative">
                                                            <input type="date" value={epfJoiningDate} onChange={e => setEpfJoiningDate(e.target.value)} disabled={!isEditingPf} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-sky-500/20 transition-all disabled:opacity-70" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5 flex items-center gap-1.5">
                                                            Deduction Cycle 
                                                            <Info size={12} className="text-slate-300" />
                                                        </label>
                                                        <input type="text" value="Monthly" disabled className="w-full px-5 py-3.5 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-500 cursor-not-allowed uppercase tracking-widest" />
                                                    </div>
                                                </div>

                                                <div className="pt-8 border-t border-slate-100 space-y-12">
                                                    {/* Employee Contribution */}
                                                    <div className="space-y-6">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Employee Contribution Rate</h4>
                                                            <button onClick={() => setShowBelowLimitModal(true)} className="text-[10px] font-black text-sky-600 hover:text-sky-700 transition-colors uppercase tracking-widest flex items-center gap-1.5 p-1 hover:bg-sky-50 rounded-lg">
                                                                <Calculator size={14} /> PF wages below 15000?
                                                            </button>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div className="relative w-full md:w-80">
                                                                <select disabled className="w-full px-5 py-3.5 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-500 appearance-none cursor-not-allowed">
                                                                    <option>12% of Actual PF Wage</option>
                                                                </select>
                                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                            </div>
                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                                                    Limit employee's PF contribution amount maximum of
                                                                    <div className="group/info relative">
                                                                        <Info size={14} className="text-slate-300 cursor-help" />
                                                                        <div className="invisible group-hover/info:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-4 bg-slate-900 text-white text-[10px] rounded-2xl shadow-2xl z-50 text-center leading-relaxed font-bold border border-slate-800 pointer-events-none">
                                                                            If no capping set, then actual contribution will be deducted as Employee Contribution. If Zero, then actual deduction will be considered.
                                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900"></div>
                                                                        </div>
                                                                    </div>
                                                                </span>
                                                                <div className="flex items-center bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                                                                    <div className="px-3 py-2 bg-slate-200/50 text-[10px] font-black text-slate-500 border-r border-slate-100">INR</div>
                                                                    <input 
                                                                        type="text" 
                                                                        value={empLimit} 
                                                                        onChange={e => setEmpLimit(e.target.value)} 
                                                                        disabled={!isEditingPf} 
                                                                        className="w-24 px-3 py-2 bg-transparent text-sm font-bold text-slate-800 focus:outline-none disabled:opacity-70" 
                                                                    />
                                                                </div>
                                                                <span className="text-sm font-bold text-slate-600">monthly.</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Employer Contribution */}
                                                    <div className="space-y-6">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Employer Contribution Rate</h4>
                                                                <div className="group/rate relative">
                                                                    <Info size={14} className="text-slate-300 cursor-help" />
                                                                    <div className="invisible group-hover/rate:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 p-4 bg-slate-900 text-white text-[10px] rounded-2xl shadow-2xl z-50 text-left leading-relaxed font-bold border border-slate-800 pointer-events-none">
                                                                        <div className="mb-2 italic text-sky-400">Options:</div>
                                                                        <div className="mb-2">1. 12% of Actual PF Wage - Calculates based on employee's full Basic + DA.</div>
                                                                        <div>2. 12% of Restricted PF Wage - Calculates based on statutory wage ceiling (₹15,000).</div>
                                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => setShowSplitupModal(true)} className="text-xs font-black text-sky-600 hover:text-sky-700 transition-colors uppercase tracking-widest">View Splitup</button>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div className="relative w-full md:w-80">
                                                                <select 
                                                                    value={emprRate} 
                                                                    onChange={e => setEmprRate(e.target.value)} 
                                                                    disabled={!isEditingPf} 
                                                                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 appearance-none focus:ring-2 focus:ring-sky-500/20 disabled:opacity-70 transition-all ring-1 ring-slate-100"
                                                                >
                                                                    <option>12% of Actual PF Wage</option>
                                                                    <option>12% of Restricted PF Wage</option>
                                                                </select>
                                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                            </div>
                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                <span className="text-sm font-bold text-slate-600">Limit employer's PF contribution amount maximum of</span>
                                                                <div className="flex items-center bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                                                                    <div className="px-3 py-2 bg-slate-200/50 text-[10px] font-black text-slate-500 border-r border-slate-100">INR</div>
                                                                    <input 
                                                                        type="text" 
                                                                        value={emprLimit} 
                                                                        onChange={e => setEmprLimit(e.target.value)} 
                                                                        disabled={!isEditingPf} 
                                                                        className="w-24 px-3 py-2 bg-transparent text-sm font-bold text-slate-800 focus:outline-none disabled:opacity-70" 
                                                                    />
                                                                </div>
                                                                <span className="text-sm font-bold text-slate-600">monthly.</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Additional Configurations */}
                                                    <div className="space-y-4 pt-4">
                                                        <label className="flex items-start gap-4 cursor-pointer group/item">
                                                            <div onClick={() => isEditingPf && setIncludeEmprContri(!includeEmprContri)} className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${includeEmprContri ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-100' : 'border-slate-300 bg-white group-hover/item:border-sky-400'}`}>
                                                                {includeEmprContri && <Check size={14} strokeWidth={4} />}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Include employer's contribution in employee's salary structure</span>
                                                            </div>
                                                        </label>

                                                        {includeEmprContri && (
                                                            <div className="ml-10 space-y-4 pt-2 animate-in slide-in-from-left-4 duration-300">
                                                                <label className="flex items-center gap-3 cursor-pointer group/sub">
                                                                    <div onClick={() => isEditingPf && setIncludeEdli(!includeEdli)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${includeEdli ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 bg-white group-hover/sub:border-indigo-400'}`}>
                                                                        {includeEdli && <Check size={12} strokeWidth={4} />}
                                                                    </div>
                                                                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                                                        Include employer's EDLI contribution in employee's salary structure
                                                                        <div className="group/tip relative">
                                                                            <Info size={14} className="text-slate-300 cursor-help" />
                                                                            <div className="invisible group-hover/tip:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl shadow-xl z-50 text-center font-bold">
                                                                                EDLI Contribution is 0.50 % of PF Wage. Max Employer Contribution is 75.
                                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900"></div>
                                                                            </div>
                                                                        </div>
                                                                    </span>
                                                                </label>
                                                                <label className="flex items-center gap-3 cursor-pointer group/sub">
                                                                    <div onClick={() => isEditingPf && setIncludeAdminCharges(!includeAdminCharges)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${includeAdminCharges ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 bg-white group-hover/sub:border-indigo-400'}`}>
                                                                        {includeAdminCharges && <Check size={12} strokeWidth={4} />}
                                                                    </div>
                                                                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                                                        Include admin charges in employee's salary structure
                                                                        <div className="group/tip relative">
                                                                            <Info size={14} className="text-slate-300 cursor-help" />
                                                                            <div className="invisible group-hover/tip:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl shadow-xl z-50 text-center font-bold">
                                                                                EPF Admin Charges is 0.50% of PF Wage.
                                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900"></div>
                                                                            </div>
                                                                        </div>
                                                                    </span>
                                                                </label>
                                                            </div>
                                                        )}

                                                        <label className="flex items-start gap-4 cursor-pointer group/item pt-2">
                                                            <div onClick={() => isEditingPf && setOverrideRate(!overrideRate)} className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${overrideRate ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-100' : 'border-slate-300 bg-white group-hover/item:border-sky-400'}`}>
                                                                {overrideRate && <Check size={14} strokeWidth={4} />}
                                                            </div>
                                                            <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Override PF contribution rate at employee level</span>
                                                        </label>
                                                    </div>

                                                    {/* LOP Configuration Section */}
                                                    <div className="pt-10 border-t border-slate-100 space-y-6">
                                                        <div className="flex items-center gap-2.5 text-slate-800 font-black text-[10px] uppercase tracking-[0.2em]">
                                                            <AlertCircle size={16} className="text-sky-600" />
                                                            PF Configuration when LOP Applied
                                                        </div>

                                                        <div className="space-y-6">
                                                            <label className="flex items-start gap-4 cursor-pointer group/item">
                                                                <div onClick={() => isEditingPf && setProrateRestricted(!prorateRestricted)} className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${prorateRestricted ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-100' : 'border-slate-300 bg-white group-hover/item:border-sky-400'}`}>
                                                                    {prorateRestricted && <Check size={14} strokeWidth={4} />}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Pro-rate Restricted PF Wage</span>
                                                                        <div className="group/tip relative">
                                                                            <Info size={14} className="text-slate-300 cursor-help" />
                                                                            <div className="invisible group-hover/tip:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 bg-slate-900 text-white text-[10px] rounded-2xl shadow-xl z-50 text-center font-bold">
                                                                                Restricted PF Wage allows you to limit the EPF contribution to 15,000 even if the employees' PF Wage is greater than that.
                                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900"></div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-[10px] font-bold text-slate-400">PF contribution will be pro-rated based on the number of days worked by the employee.</p>
                                                                </div>
                                                            </label>

                                                            <label className="flex items-start gap-4 cursor-pointer group/item">
                                                                <div onClick={() => isEditingPf && setConsiderComponents(!considerComponents)} className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${considerComponents ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-100' : 'border-slate-300 bg-white group-hover/item:border-sky-400'}`}>
                                                                    {considerComponents && <Check size={14} strokeWidth={4} />}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight block">Consider all applicable salary components if PF wage is less than ₹15,000 after Loss of Pay</span>
                                                                    <p className="text-[10px] font-bold text-slate-400">PF wage will be computed using the salary earned in that month rather than the structure amount.</p>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column: Sample Calculation */}
                                            <div className="xl:col-span-4 space-y-6">
                                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-32">
                                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                                                        <Calculator className="text-sky-600" size={18} />
                                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Sample EPF Calculation</h3>
                                                    </div>
                                                    
                                                    <div className="p-6 space-y-6">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-bold text-slate-500">Employee Share (12%)</span>
                                                            <span className="text-sm font-black text-slate-800">₹ 2,400</span>
                                                        </div>
                                                        <div className="h-px bg-amber-200/30 w-full" />
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs font-bold text-slate-500">EPS Share (8.33%)</span>
                                                                <span className="text-sm font-black text-slate-800">₹ 1,250</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs font-bold text-slate-500">EPF Share (3.67%)</span>
                                                                <span className="text-sm font-black text-slate-800">₹ 1,150</span>
                                                            </div>
                                                            {includeEdli && (
                                                                <div className="flex justify-between items-center text-[10px] text-indigo-500 font-bold">
                                                                    <span>EDLI (0.50%)</span>
                                                                    <span>₹ 75</span>
                                                                </div>
                                                            )}
                                                            {includeAdminCharges && (
                                                                <div className="flex justify-between items-center text-[10px] text-indigo-500 font-bold">
                                                                    <span>Admin Charges</span>
                                                                    <span>₹ 100</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="pt-4 border-t-2 border-dashed border-slate-100 flex justify-between items-end">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Remittance</span>
                                                            <span className="text-2xl font-black text-sky-600 tracking-tighter leading-none">₹ {2400 + 1250 + 1150 + (includeEdli ? 75 : 0) + (includeAdminCharges ? 100 : 0)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                                                        <button onClick={() => setShowBelowLimitModal(true)} className="w-full py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"><Calculator size={14} /> View wages below limit</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                            {/* TDS Section */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm space-y-8 p-8">
                                <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <Calculator size={20} className="text-indigo-600" />
                                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">TDS CONFIGURATION</h3>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center pr-6 border-r border-slate-200">
                                            <label className={`relative inline-flex items-center cursor-pointer ${!isEditingTds && 'cursor-default opacity-80'}`}>
                                                <input type="checkbox" checked={enableTds} onChange={() => isEditingTds && setEnableTds(!enableTds)} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {isEditingTds ? (
                                                <div className="flex gap-2">
                                                    <button onClick={handleCancelTds} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">Cancel</button>
                                                    <button onClick={handleSaveTds} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm flex items-center gap-2 shadow-sm transition-all"><Save size={16} /> Save Settings</button>
                                                </div>
                                            ) : (
                                                <button onClick={handleEditTds} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm flex items-center gap-2 transition-all">
                                                    <Edit2 size={16} /> Edit Settings
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">

                                    {enableTds && (
                                        <div className="space-y-10 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">TAN (Tax Deduction Account Number)</label>
                                                    <input type="text" value={tan} onChange={e => setTan(e.target.value)} disabled={!isEditingTds} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-mono font-bold text-slate-800 uppercase focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:normal-case disabled:opacity-70" placeholder="e.g., DELA12345B" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">Default Tax Regime</label>
                                                    <div className="relative">
                                                        <select value={defaultRegime} onChange={e => setDefaultRegime(e.target.value)} disabled={!isEditingTds} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 appearance-none focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-70 ring-offset-2 ring-offset-white ring-1 ring-slate-100">
                                                            <option>New Regime</option>
                                                            <option>Old Regime</option>
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-10 border-t border-slate-100 space-y-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                                        <User size={18} strokeWidth={2.5} />
                                                    </div>
                                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Responsible Person (TRACES)</h4>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Full Name</label>
                                                        <div className="relative group">
                                                            <input type="text" value={respName} onChange={e => setRespName(e.target.value)} disabled={!isEditingTds} className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-70" placeholder="e.g. Rajesh Kumar" />
                                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400 transition-colors" size={16} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Designation</label>
                                                        <div className="relative group">
                                                            <input type="text" value={respDesg} onChange={e => setRespDesg(e.target.value)} disabled={!isEditingTds} className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-70" placeholder="e.g. Finance Head" />
                                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400 transition-colors" size={16} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Official Email</label>
                                                        <div className="relative group">
                                                            <input type="email" value={respEmail} onChange={e => setRespEmail(e.target.value)} disabled={!isEditingTds} className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-70" placeholder="name@company.com" />
                                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400 transition-colors" size={16} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-sky-50 border border-sky-100 rounded-xl p-6 flex items-start gap-5">
                                                <div className="p-2 bg-white rounded-2xl shadow-sm text-sky-500">
                                                    <Info size={20} strokeWidth={2.5} />
                                                </div>
                                                <p className="text-[13px] text-sky-800 leading-relaxed font-bold">
                                                    TAN is mandatory for generating Form 24Q. Tax Regime determines the default tax slab calculation for employees when no specific declarations are linked.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                    </div>
                </div>

                {/* PF Splitup Modal */}
                {showSplitupModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col animate-in zoom-in-95 duration-300 border border-slate-200 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Employer Rate Splitup</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Statutory Contribution Distribution</p>
                                </div>
                                <button onClick={() => setShowSplitupModal(false)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"><X size={20} /></button>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Component</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Distribution</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <tr className="group hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-5 text-sm font-bold text-slate-700">Employees' Provident Fund (EPF)</td>
                                            <td className="px-8 py-5 text-sm font-black text-sky-600 text-right">3.67% of Wage</td>
                                        </tr>
                                        <tr className="group hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-5 text-sm font-bold text-slate-700">Employees' Pension Scheme (EPS)</td>
                                            <td className="px-8 py-5 text-sm font-black text-indigo-600 text-right flex items-center justify-end gap-2">
                                                8.33% of Wage
                                                <Info size={14} className="text-slate-300" />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button onClick={() => setShowSplitupModal(false)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-xs shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all uppercase tracking-widest">Close Distribution</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* PF Below Limit Modal */}
                {showBelowLimitModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col">
                            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-sky-500 text-white rounded-2xl shadow-lg shadow-sky-100">
                                        <Calculator size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">EPF Calculation Model</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">When Wage is below ₹15,000</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowBelowLimitModal(false)} className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all"><X size={24} /></button>
                            </div>

                            <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar flex-1 max-h-[60vh]">
                                <div className="space-y-6">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Calculated on these components</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {['Basic Salary', 'HRA', 'Dearness Allowances (DA)'].map(comp => (
                                            <label key={comp} onClick={() => toggleBelowLimitComponent(comp)} className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${belowLimitComponents.includes(comp) ? 'bg-sky-50 border-sky-400 shadow-md' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                                                <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${belowLimitComponents.includes(comp) ? 'bg-sky-500 border-sky-500 text-white' : 'bg-slate-50 border-slate-200'}`}>
                                                    {belowLimitComponents.includes(comp) && <Check size={14} strokeWidth={4} />}
                                                </div>
                                                <span className={`text-xs font-black uppercase tracking-tight ${belowLimitComponents.includes(comp) ? 'text-sky-900' : 'text-slate-600'}`}>{comp}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-100/50 flex gap-4">
                                    <Info size={24} className="text-amber-500 shrink-0" />
                                    <p className="text-sm text-amber-900 leading-relaxed font-bold">
                                        Note: When actual wage calculation is active, the contribution is computed using the combined total of selected components without any statutory capping.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Employee Share (12%)</h4>
                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-xl transition-all">
                                            <span className="text-sm font-bold text-slate-500 italic">EPF Share</span>
                                            <span className="text-xl font-black text-indigo-700">₹ 1,440</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Employer Share (12%)</h4>
                                        <div className="space-y-3">
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-500 italic">EPS Share</span>
                                                <span className="text-base font-black text-sky-700">₹ 1,000</span>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-500 italic">EPF Share</span>
                                                <span className="text-base font-black text-sky-700">₹ 440</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 border-t-4 border-double border-slate-100 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Remittance</p>
                                        <p className="text-[11px] text-slate-400 font-bold italic">Based on wage of ₹12,000</p>
                                    </div>
                                    <span className="text-4xl font-black text-slate-900 tracking-tighter">₹ 2,880</span>
                                </div>
                            </div>

                            <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button onClick={() => setShowBelowLimitModal(false)} className="px-12 py-4 bg-slate-900 text-white rounded-xl font-black text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">Got it</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
);
};

export default PfTdsSettings;
