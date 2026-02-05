
import React, { useState } from 'react';
import { Edit2, Save, Activity, Shield, Briefcase, ChevronDown, Info, AlertCircle } from 'lucide-react';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const StatutorySettings: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    
    // ESI State
    const [enableEsi, setEnableEsi] = useState(true);
    const [esiNumber, setEsiNumber] = useState('00-00-000000-000-0000');
    const [esiEmpRate, setEsiEmpRate] = useState('0.75%');
    const [esiEmprRate, setEsiEmprRate] = useState('3.25%');

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
                                onClick={() => setIsEditing(false)} 
                                className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                            onClick={() => setIsEditing(!isEditing)} 
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

                        {enableEsi && (
                            <div className="space-y-6 animate-in fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">ESI Number</label>
                                        <input 
                                            type="text" 
                                            value={esiNumber} 
                                            onChange={(e) => setEsiNumber(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Deduction Cycle</label>
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
                            </div>
                        )}
                    </div>

                    {/* 2. LWF Settings */}
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

                    {/* 3. Professional Tax */}
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

                    {/* 4. NPS Settings */}
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
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white appearance-none focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                                            >
                                                <option>Monthly</option>
                                                <option>Quarterly</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
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
                                        <span className="text-sm font-semibold text-slate-700">Include employer contribution in employee CTC</span>
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
        </div>
    );
};

export default StatutorySettings;
