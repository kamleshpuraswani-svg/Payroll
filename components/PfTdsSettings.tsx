
import React, { useState, useEffect } from 'react';
import { 
    Activity, Shield, Building2, ChevronDown, ChevronRight, 
    Edit2, Check, X, Info, Calendar, Lightbulb, Eye, Calculator,
    Plus, Search, User, Briefcase
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const PfTdsSettings: React.FC = () => {
    // Selection State
    const [selectedTarget, setSelectedTarget] = useState('bu:MindInventory');
    const [businessUnits, setBusinessUnits] = useState<any[]>([]);
    const [paygroups, setPaygroups] = useState<any[]>([]);
    const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);

    // Section Expand/Collapse State
    const [pfExpanded, setPfExpanded] = useState(true);
    const [tdsExpanded, setTdsExpanded] = useState(false);

    // Editing State per section
    const [isEditingPf, setIsEditingPf] = useState(false);
    const [isEditingTds, setIsEditingTds] = useState(false);

    // Modal States
    const [showSplitupModal, setShowSplitupModal] = useState(false);
    const [showBelowLimitModal, setShowBelowLimitModal] = useState(false);

    // PF Data State
    const [enablePf, setEnablePf] = useState(false);
    const [pfNumber, setPfNumber] = useState('');
    const [pfEstablishmentName, setPfEstablishmentName] = useState('');
    const [epfJoiningDate, setEpfJoiningDate] = useState('');
    const [pfEmpRate, setPfEmpRate] = useState('12% of Restricted PF Wage');
    const [pfEmpLimit, setPfEmpLimit] = useState('0');
    const [pfEmprRate, setPfEmprRate] = useState('12% of Restricted PF Wage');
    const [includeEmprContriPf, setIncludeEmprContriPf] = useState(true);
    const [includeEdli, setIncludeEdli] = useState(true);
    const [includeAdminCharges, setIncludeAdminCharges] = useState(true);
    const [overridePfRate, setOverridePfRate] = useState(false);
    const [pfProrateRestricted, setPfProrateRestricted] = useState(true);
    const [pfBelowLimitComponents, setPfBelowLimitComponents] = useState<string[]>(['Basic Salary', 'Dearness Allowances (DA)']);

    // TDS Data State
    const [enableTds, setEnableTds] = useState(false);
    const [tan, setTan] = useState('');
    const [defaultRegime, setDefaultRegime] = useState('New Regime');
    const [linkDeclarations, setLinkDeclarations] = useState(true);
    const [challanReminder, setChallanReminder] = useState(true);
    const [respName, setRespName] = useState('');
    const [respDesg, setRespDesg] = useState('');
    const [respEmail, setRespEmail] = useState('');

    // Backup states for cancellation
    const [backupPf, setBackupPf] = useState<any>(null);
    const [backupTds, setBackupTds] = useState<any>(null);

    useEffect(() => {
        fetchPaygroups();
        fetchSettings();
    }, [selectedTarget]);

    const fetchPaygroups = async () => {
        const { data: buData } = await supabase.from('business_units').select('*');
        const { data: pgData } = await supabase.from('paygroups').select('*');
        if (buData) setBusinessUnits(buData);
        if (pgData) setPaygroups(pgData);
    };

    const fetchSettings = async () => {
        // Fetch PF Settings
        const { data: pfData } = await supabase
            .from('configuration')
            .select('config_value')
            .eq('config_key', `pf_settings:${selectedTarget}`)
            .single();

        if (pfData?.config_value) {
            const val = pfData.config_value;
            setEnablePf(val.enablePf ?? false);
            setPfNumber(val.pfNumber ?? '');
            setPfEstablishmentName(val.pfEstablishmentName ?? '');
            setEpfJoiningDate(val.epfJoiningDate ?? '');
            setPfEmpRate(val.pfEmpRate ?? '12% of Restricted PF Wage');
            setPfEmpLimit(val.pfEmpLimit ?? '0');
            setPfEmprRate(val.pfEmprRate ?? '12% of Restricted PF Wage');
            setIncludeEmprContriPf(val.includeEmprContriPf ?? true);
            setIncludeEdli(val.includeEdli ?? true);
            setIncludeAdminCharges(val.includeAdminCharges ?? true);
            setOverridePfRate(val.overridePfRate ?? false);
            setPfProrateRestricted(val.pfProrateRestricted ?? true);
            setPfBelowLimitComponents(val.pfBelowLimitComponents ?? ['Basic Salary', 'Dearness Allowances (DA)']);
        } else {
            // Reset to defaults if no data
            setEnablePf(false);
            setPfNumber('');
        }

        // Fetch TDS Settings
        const { data: tdsData } = await supabase
            .from('configuration')
            .select('config_value')
            .eq('config_key', `tds_settings:${selectedTarget}`)
            .single();

        if (tdsData?.config_value) {
            const val = tdsData.config_value;
            setEnableTds(val.enableTds ?? false);
            setTan(val.tan ?? '');
            setDefaultRegime(val.defaultRegime ?? 'New Regime');
            setLinkDeclarations(val.linkDeclarations ?? true);
            setChallanReminder(val.challanReminder ?? true);
            setRespName(val.respName ?? '');
            setRespDesg(val.respDesg ?? '');
            setRespEmail(val.respEmail ?? '');
        } else {
            setEnableTds(false);
            setTan('');
        }
    };

    const handleEditPf = () => {
        setBackupPf({
            enablePf, pfNumber, pfEstablishmentName, epfJoiningDate, pfEmpRate,
            pfEmpLimit, pfEmprRate, includeEmprContriPf, includeEdli, 
            includeAdminCharges, overridePfRate, pfProrateRestricted, pfBelowLimitComponents
        });
        setIsEditingPf(true);
        setPfExpanded(true);
    };

    const handleSavePf = async () => {
        const configValue = {
            enablePf, pfNumber, pfEstablishmentName, epfJoiningDate, pfEmpRate,
            pfEmpLimit, pfEmprRate, includeEmprContriPf, includeEdli, 
            includeAdminCharges, overridePfRate, pfProrateRestricted, pfBelowLimitComponents
        };

        await supabase.from('configuration').upsert({
            config_key: `pf_settings:${selectedTarget}`,
            config_value: configValue,
            updated_at: new Date().toISOString()
        });

        setIsEditingPf(false);
    };

    const handleCancelPf = () => {
        if (backupPf) {
            setEnablePf(backupPf.enablePf);
            setPfNumber(backupPf.pfNumber);
            setPfEstablishmentName(backupPf.pfEstablishmentName);
            setEpfJoiningDate(backupPf.epfJoiningDate);
            setPfEmpRate(backupPf.pfEmpRate);
            setPfEmpLimit(backupPf.pfEmpLimit);
            setPfEmprRate(backupPf.pfEmprRate);
            setIncludeEmprContriPf(backupPf.includeEmprContriPf);
            setIncludeEdli(backupPf.includeEdli);
            setIncludeAdminCharges(backupPf.includeAdminCharges);
            setOverridePfRate(backupPf.overridePfRate);
            setPfProrateRestricted(backupPf.pfProrateRestricted);
            setPfBelowLimitComponents(backupPf.pfBelowLimitComponents);
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
        const configValue = {
            enableTds, tan, defaultRegime, linkDeclarations, challanReminder,
            respName, respDesg, respEmail
        };

        await supabase.from('configuration').upsert({
            config_key: `tds_settings:${selectedTarget}`,
            config_value: configValue,
            updated_at: new Date().toISOString()
        });

        setIsEditingTds(false);
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

    const togglePfBelowLimitComponent = (item: string) => {
        if (!isEditingPf) return;
        setPfBelowLimitComponents(prev => 
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
                        <button 
                            onClick={() => setIsTargetDropdownOpen(!isTargetDropdownOpen)}
                            className="flex items-center gap-3 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 group"
                        >
                            <Building2 size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                            <div className="text-left leading-none">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Selected Target</p>
                                <p className="text-sm font-bold truncate max-w-[150px]">
                                    {selectedTarget.startsWith('bu:') ? 
                                        businessUnits.find(bu => `bu:${bu.name}` === selectedTarget)?.name || 'Default BU' :
                                        paygroups.find(pg => `pg:${pg.id}` === selectedTarget)?.paygroup_name || 'Default Paygroup'
                                    }
                                </p>
                            </div>
                            <ChevronDown size={18} className={`text-slate-500 transition-transform duration-300 ${isTargetDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isTargetDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 pb-2 mb-2 border-b border-slate-50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Units</p>
                                </div>
                                {businessUnits.map(bu => (
                                    <button
                                        key={bu.id}
                                        onClick={() => { setSelectedTarget(`bu:${bu.name}`); setIsTargetDropdownOpen(false); }}
                                        className={`w-full text-left px-5 py-2 text-sm font-bold flex items-center justify-between ${selectedTarget === `bu:${bu.name}` ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {bu.name}
                                        {selectedTarget === `bu:${bu.name}` && <Check size={16} />}
                                    </button>
                                ))}
                                <div className="px-4 py-2 mt-2 mb-2 border-b border-slate-50 border-t">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paygroups</p>
                                </div>
                                {paygroups.map(pg => (
                                    <button
                                        key={pg.id}
                                        onClick={() => { setSelectedTarget(`pg:${pg.id}`); setIsTargetDropdownOpen(false); }}
                                        className={`w-full text-left px-5 py-2 text-sm font-bold flex items-center justify-between ${selectedTarget === `pg:${pg.id}` ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        {pg.paygroup_name}
                                        {selectedTarget === `pg:${pg.id}` && <Check size={16} />}
                                    </button>
                                ))}
                            </div>
                        )}
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
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">EPF Number</label>
                                                <input type="text" value={pfNumber} onChange={(e) => setPfNumber(e.target.value)} disabled={!isEditingPf} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 disabled:bg-slate-50" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Establishment Name</label>
                                                <input type="text" value={pfEstablishmentName} onChange={(e) => setPfEstablishmentName(e.target.value)} disabled={!isEditingPf} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 disabled:bg-slate-50" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">EPF Joining Date</label>
                                                <div className="relative">
                                                    <input type="date" value={epfJoiningDate} onChange={(e) => setEpfJoiningDate(e.target.value)} disabled={!isEditingPf} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 disabled:bg-slate-50" />
                                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 border border-blue-100 bg-blue-50/30 rounded-xl space-y-4">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex gap-3">
                                                    <div className="p-2 bg-blue-100 rounded-lg shrink-0 h-fit">
                                                        <Lightbulb className="text-blue-600" size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-800">Understanding PF Contribution Calculations</h4>
                                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                            Calculations are performed on 'Actual PF Wage' (Sum of Basic, DA, and other specific components). 
                                                            Employer's 12% is split into EPF (3.67%) and EPS (8.33%). 
                                                        </p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => setShowSplitupModal(true)}
                                                    className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors flex items-center gap-1.5 shrink-0"
                                                >
                                                    <Eye size={14} /> View Splitup
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            {/* Employee Contribution */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-1.5 h-6 bg-sky-500 rounded-full"></div>
                                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">EMPLOYEE CONTRIBUTION</h4>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="block text-sm font-bold text-slate-700">PF Contribution Rate</label>
                                                    <div className="space-y-4">
                                                        {[
                                                            { label: '12% of Actual PF Wage', sub: 'Calculated on total PF-applicable earnings' },
                                                            { label: '12% of Restricted PF Wage', sub: 'Capped at statutory limit of ₹15,000 pm (Max ₹1,800)' }
                                                        ].map((rate) => (
                                                            <label key={rate.label} className={`flex items-start gap-3 p-4 border rounded-xl transition-all ${isEditingPf ? 'cursor-pointer hover:border-sky-300 hover:bg-sky-50/30' : 'cursor-default'} ${pfEmpRate === rate.label ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500/20' : 'border-slate-200 bg-white'}`}>
                                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${pfEmpRate === rate.label ? 'border-sky-600' : 'border-slate-300'}`}>
                                                                    {pfEmpRate === rate.label && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                                                </div>
                                                                <input type="radio" name="pfEmpRate" checked={pfEmpRate === rate.label} onChange={() => isEditingPf && setPfEmpRate(rate.label)} className="hidden" disabled={!isEditingPf} />
                                                                <div className="space-y-1">
                                                                    <div className="text-sm font-bold text-slate-800">{rate.label}</div>
                                                                    <div className="text-xs text-slate-500">{rate.sub}</div>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Employer Contribution */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
                                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">EMPLOYER CONTRIBUTION</h4>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="block text-sm font-bold text-slate-700">PF Contribution Rate</label>
                                                    <div className="space-y-4">
                                                        {[
                                                            { label: '12% of Actual PF Wage', sub: 'Calculated on total PF-applicable earnings' },
                                                            { label: '12% of Restricted PF Wage', sub: 'Capped at statutory limit of ₹15,000 pm (Max ₹1,800)' }
                                                        ].map((rate) => (
                                                            <label key={rate.label} className={`flex items-start gap-3 p-4 border rounded-xl transition-all ${isEditingPf ? 'cursor-pointer hover:border-slate-900/10 hover:bg-slate-50' : 'cursor-default'} ${pfEmprRate === rate.label ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900/10' : 'border-slate-200 bg-white'}`}>
                                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${pfEmprRate === rate.label ? 'border-slate-900 shadow-sm' : 'border-slate-300'}`}>
                                                                    {pfEmprRate === rate.label && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                                                                </div>
                                                                <input type="radio" name="pfEmprRate" checked={pfEmprRate === rate.label} onChange={() => isEditingPf && setPfEmprRate(rate.label)} className="hidden" disabled={!isEditingPf} />
                                                                <div className="space-y-1">
                                                                    <div className="text-sm font-bold text-slate-800">{rate.label}</div>
                                                                    <div className="text-xs text-slate-500">{rate.sub}</div>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
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
                                            <Building2 size={48} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-400">TDS is currently Disabled</h4>
                                            <p className="text-sm text-slate-400 max-w-xs mx-auto">Click the edit button above to enable and configure Tax Deducted at Source settings.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">TAN (Tax Deduction Account Number)</label>
                                                <input
                                                    type="text"
                                                    value={tan}
                                                    onChange={(e) => setTan(e.target.value)}
                                                    disabled={!isEditingTds}
                                                    placeholder="e.g., DELA12345B"
                                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 disabled:bg-slate-50 font-mono uppercase"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Default Tax Regime</label>
                                                <div className="relative">
                                                    <select
                                                        value={defaultRegime}
                                                        onChange={(e) => setDefaultRegime(e.target.value)}
                                                        disabled={!isEditingTds}
                                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 appearance-none focus:outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed bg-white"
                                                    >
                                                        <option>New Regime</option>
                                                        <option>Old Regime</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <User size={14} className="text-sky-600" /> Responsible Person (For TRACES)
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Full Name</label>
                                                    <input type="text" value={respName} onChange={e => setRespName(e.target.value)} disabled={!isEditingTds} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 disabled:bg-slate-50" placeholder="Name" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Designation</label>
                                                    <input type="text" value={respDesg} onChange={e => setRespDesg(e.target.value)} disabled={!isEditingTds} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 disabled:bg-slate-50" placeholder="Designation" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Email Address</label>
                                                    <input type="email" value={respEmail} onChange={e => setRespEmail(e.target.value)} disabled={!isEditingTds} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 disabled:bg-slate-50" placeholder="official@company.com" />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals are remains same as requested logic */}
            {/* PF Splitup Modal */}
            {showSplitupModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">PF Contribution Splitup</h3>
                                <p className="text-xs text-slate-400 font-bold mt-0.5 uppercase tracking-widest underline decoration-sky-300 underline-offset-4">Employer's 12% Breakdown</p>
                            </div>
                            <button onClick={() => setShowSplitupModal(false)} className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all text-slate-400 hover:text-rose-500">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-6">
                                <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-black text-indigo-900 uppercase tracking-widest">EPS Contribution</span>
                                        <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">8.33%</span>
                                    </div>
                                    <p className="text-xs font-bold text-indigo-700/70 leading-relaxed italic">
                                        Goes to Employee Pension Scheme. Capped at ₹1,250 pm (8.33% of ₹15,000).
                                    </p>
                                </div>

                                <div className="p-5 bg-sky-50 border border-sky-100 rounded-2xl">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-black text-sky-900 uppercase tracking-widest">EPF Contribution</span>
                                        <span className="bg-sky-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">3.67%</span>
                                    </div>
                                    <p className="text-xs font-bold text-sky-700/70 leading-relaxed italic">
                                        Goes to Employee Provident Fund account.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PfTdsSettings;
