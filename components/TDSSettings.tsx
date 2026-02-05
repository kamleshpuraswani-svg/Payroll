
import React, { useState } from 'react';
import { Save, Info, ChevronDown, Check, AlertCircle, User, Briefcase, Mail, Edit2, X } from 'lucide-react';

const TDSSettings: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    
    // Form State
    const [enableTds, setEnableTds] = useState(true);
    const [tan, setTan] = useState('DELA12345B');
    const [defaultRegime, setDefaultRegime] = useState('New Regime');
    const [linkDeclarations, setLinkDeclarations] = useState(true);
    const [challanReminder, setChallanReminder] = useState(true);
    
    // Responsible Person
    const [respName, setRespName] = useState('Rajesh Kumar');
    const [respDesg, setRespDesg] = useState('Finance Manager');
    const [respEmail, setRespEmail] = useState('rajesh.k@techflow.com');

    // Backup State for Cancel
    const [backup, setBackup] = useState<any>(null);

    const handleEdit = () => {
        setBackup({
            enableTds, tan, defaultRegime, linkDeclarations, challanReminder,
            respName, respDesg, respEmail
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        if(backup) {
            setEnableTds(backup.enableTds);
            setTan(backup.tan);
            setDefaultRegime(backup.defaultRegime);
            setLinkDeclarations(backup.linkDeclarations);
            setChallanReminder(backup.challanReminder);
            setRespName(backup.respName);
            setRespDesg(backup.respDesg);
            setRespEmail(backup.respEmail);
        }
        setIsEditing(false);
    };

    const handleSave = () => {
        setIsEditing(false);
        // Persist logic here
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
                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <button 
                                    onClick={handleCancel}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm shadow-sm flex items-center gap-2 transition-colors"
                                >
                                    <Save size={16} /> Save Changes
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={handleEdit}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm shadow-sm flex items-center gap-2 transition-colors"
                            >
                                <Edit2 size={16} /> Edit Settings
                            </button>
                        )}
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

                                {/* Link Declarations Toggle */}
                                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-start justify-between gap-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">Link Investment Declarations</h4>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Use employee declarations for TDS calculation. Ensures accurate exemptions (80C, 80D, HRA, etc.) are applied.
                                        </p>
                                    </div>
                                    <label className={`relative inline-flex items-center shrink-0 ${isEditing ? 'cursor-pointer' : 'cursor-default opacity-80'}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={linkDeclarations} 
                                            onChange={() => isEditing && setLinkDeclarations(!linkDeclarations)} 
                                            disabled={!isEditing}
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
                                        <label className={`relative inline-flex items-center ${isEditing ? 'cursor-pointer' : 'cursor-default opacity-80'}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={challanReminder} 
                                                onChange={() => isEditing && setChallanReminder(!challanReminder)} 
                                                disabled={!isEditing}
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
                                        <div className="md:col-span-2">
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default TDSSettings;
