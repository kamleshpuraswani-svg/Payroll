
import React, { useState } from 'react';
import { Save, Info, ChevronDown, Check, AlertCircle, User, Briefcase, Mail, Edit2, X, Building2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const BUSINESS_UNITS = [
    "MindInventory",
    "300 Minds",
    "CollabCRM"
];

const TDSSettings: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
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
                .eq('config_key', `tds_settings:${selectedTarget}`)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data?.config_value) {
                const config = data.config_value;
                setEnableTds(config.enableTds ?? true);
                setTan(config.tan ?? 'DELA12345B');
                setDefaultRegime(config.defaultRegime ?? 'New Regime');
                setRespName(config.respName ?? 'Rajesh Kumar');
                setRespDesg(config.respDesg ?? 'Finance Manager');
                setRespEmail(config.respEmail ?? 'rajesh.k@techflow.com');
            }
        } catch (err) {
            console.error('Error fetching TDS settings:', err);
        }
    };

    React.useEffect(() => {
        fetchPaygroups();
        fetchSettings();
    }, [selectedTarget]);
    
    // Form State
    const [enableTds, setEnableTds] = useState(true);
    const [tan, setTan] = useState('DELA12345B');
    const [defaultRegime, setDefaultRegime] = useState('New Regime');
    
    // Responsible Person
    const [respName, setRespName] = useState('Rajesh Kumar');
    const [respDesg, setRespDesg] = useState('Finance Manager');
    const [respEmail, setRespEmail] = useState('rajesh.k@techflow.com');

    // Backup State for Cancel
    const [backup, setBackup] = useState<any>(null);

    const handleEdit = () => {
        setBackup({
            enableTds, tan, defaultRegime,
            respName, respDesg, respEmail
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        if(backup) {
            setEnableTds(backup.enableTds);
            setTan(backup.tan);
            setDefaultRegime(backup.defaultRegime);
            setRespName(backup.respName);
            setRespDesg(backup.respDesg);
            setRespEmail(backup.respEmail);
        }
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            const configValue = {
                enableTds, tan, defaultRegime,
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
            setIsEditing(false);
        } catch (err) {
            console.error('Error saving TDS settings:', err);
            alert('Failed to save settings. Please try again.');
        }
    };

    return (
        <div className="h-full overflow-y-auto">
            <div className="p-4 lg:p-8 w-full mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">TDS Configuration</h2>
                        <p className="text-slate-500 mt-1">Configure Tax Deducted at Source (TDS) parameters and filing details.</p>
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
                        <div className="flex gap-3">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors h-[42px]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm shadow-sm flex items-center gap-2 transition-colors h-[42px]"
                                    >
                                        <Save size={16} /> Save Changes
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleEdit}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm shadow-sm flex items-center gap-2 transition-colors h-[42px]"
                                >
                                    <Edit2 size={16} /> Edit Settings
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Top Toggle Section */}
                    <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Enable TDS on Salaries</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-xl">
                                Automatically calculate and deduct TDS on salaries as per Income Tax rules. Required for Form 24Q filing.
                            </p>
                        </div>
                        <label className={`relative inline-flex items-center mt-1 ${isEditing ? 'cursor-pointer' : 'cursor-default opacity-80'}`}>
                            <input 
                                type="checkbox" 
                                checked={enableTds} 
                                onChange={() => isEditing && setEnableTds(!enableTds)} 
                                disabled={!isEditing}
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {enableTds && (
                        <div className="p-8 space-y-8 animate-in slide-in-from-top-2">
                            {/* Form Fields */}
                            {/* TAN & Tax Regime Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* TAN */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        TAN (Tax Deduction Account Number) <span className="text-rose-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={tan}
                                        onChange={(e) => setTan(e.target.value)}
                                        disabled={!isEditing}
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
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white appearance-none focus:outline-none focus:border-purple-500 disabled:bg-slate-50 disabled:text-slate-600"
                                        >
                                            <option>New Regime</option>
                                            <option>Old Regime</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
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
                                                    disabled={!isEditing}
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
                                                    disabled={!isEditing}
                                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 disabled:bg-slate-50 disabled:text-slate-600"
                                                    placeholder="Designation"
                                                />
                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Email Address</label>
                                            <div className="relative">
                                                <input 
                                                    type="email" 
                                                    value={respEmail}
                                                    onChange={e => setRespEmail(e.target.value)}
                                                    disabled={!isEditing}
                                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 disabled:bg-slate-50 disabled:text-slate-600"
                                                    placeholder="official@company.com"
                                                />
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                            </div>
                                        </div>
                                    </div>


                                {/* Info Banner */}
                                <div className="space-y-6 pt-4 border-t border-slate-100">
                                    <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-start gap-3">
                                        <Info size={20} className="text-sky-600 mt-0.5 shrink-0" />
                                        <p className="text-sm text-sky-800 leading-relaxed">
                                            TAN is mandatory for generating Form 24Q. Tax Regime determines the default tax slab calculation for employees when no specific declarations are linked.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TDSSettings;
