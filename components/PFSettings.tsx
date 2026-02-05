
import React, { useState } from 'react';
import { Edit2, Save, Shield, Info, AlertCircle, ChevronDown } from 'lucide-react';

const PFSettings: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [enablePf, setEnablePf] = useState(true);
    const [pfNumber, setPfNumber] = useState('AA/AAA/1234567/000');
    
    // Contribution Rates
    const [empRate, setEmpRate] = useState('12% of Actual PF Wage');
    const [emprRate, setEmprRate] = useState('12% of Actual PF Wage');
    const [empLimit, setEmpLimit] = useState('1800');
    const [emprLimit, setEmprLimit] = useState('1800');

    // Configuration Flags
    const [includeEmprContri, setIncludeEmprContri] = useState(true);
    const [includeEdli, setIncludeEdli] = useState(false);
    const [includeAdminCharges, setIncludeAdminCharges] = useState(false);
    const [overrideRate, setOverrideRate] = useState(false);
    
    // LOP Configuration
    const [prorateRestricted, setProrateRestricted] = useState(false);
    const [considerComponents, setConsiderComponents] = useState(true);

    // Backup State for Cancel functionality
    const [backupState, setBackupState] = useState<any>(null);

    const handleEdit = () => {
        setBackupState({
            enablePf, pfNumber, empRate, emprRate, empLimit, emprLimit,
            includeEmprContri, includeEdli, includeAdminCharges, overrideRate,
            prorateRestricted, considerComponents
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (backupState) {
            setEnablePf(backupState.enablePf);
            setPfNumber(backupState.pfNumber);
            setEmpRate(backupState.empRate);
            setEmprRate(backupState.emprRate);
            setEmpLimit(backupState.empLimit);
            setEmprLimit(backupState.emprLimit);
            setIncludeEmprContri(backupState.includeEmprContri);
            setIncludeEdli(backupState.includeEdli);
            setIncludeAdminCharges(backupState.includeAdminCharges);
            setOverrideRate(backupState.overrideRate);
            setProrateRestricted(backupState.prorateRestricted);
            setConsiderComponents(backupState.considerComponents);
        }
        setIsEditing(false);
    };

    const handleSave = () => {
        setIsEditing(false);
        // Persist logic would be here
    };
    
    return (
        <div className="h-full overflow-y-auto">
            <div className="p-4 lg:p-8 w-full space-y-6 animate-in fade-in duration-300 pb-20">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">PF Settings</h2>
                        <p className="text-slate-500 mt-1">Configure Employee Provident Fund (EPF) contribution rules and identifiers.</p>
                    </div>
                    <div className="flex gap-3">
                        {isEditing && (
                            <button 
                                onClick={handleCancel}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                            onClick={isEditing ? handleSave : handleEdit} 
                            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${isEditing ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
                            {isEditing ? 'Save Settings' : 'Edit Settings'}
                        </button>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                    {/* Header Toggle */}
                    <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <Shield size={20} className="text-sky-600" />
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">PROVIDENT FUND (PF)</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={enablePf} onChange={() => isEditing && setEnablePf(!enablePf)} disabled={!isEditing} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                        </label>
                    </div>

                    {enablePf && (
                        <div className="space-y-8 animate-in fade-in">
                            <p className="text-sm text-slate-500 -mt-2">
                                Any organisation with 20 or more employees must register for the Employee Provident Fund (EPF) scheme, a retirement benefit plan for all salaried employees.
                            </p>

                            {/* Basic Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">EPF Number</label>
                                    <input 
                                        type="text" 
                                        value={pfNumber} 
                                        onChange={(e) => setPfNumber(e.target.value)} 
                                        disabled={!isEditing} 
                                        placeholder='AA/AAA/1234567/000'
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:text-slate-500 placeholder:text-slate-300" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Deduction Cycle <Info size={14} className="inline text-slate-400 ml-1" /></label>
                                    <input 
                                        type="text" 
                                        value="Monthly" 
                                        disabled 
                                        className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-500 cursor-not-allowed" 
                                    />
                                </div>
                            </div>

                            {/* Employee Contribution */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Employee Contribution Rate</label>
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                    <div className="relative flex-1 w-full">
                                        <select 
                                            disabled={!isEditing} 
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 appearance-none bg-white disabled:bg-slate-50 focus:outline-none focus:border-sky-500"
                                            value={empRate}
                                            onChange={(e) => setEmpRate(e.target.value)}
                                        >
                                            <option>12% of Actual PF Wage</option>
                                            <option>12% of Restricted PF Wage</option>
                                            <option>Fixed Amount</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <span className="text-sm text-slate-600 whitespace-nowrap">Limit employee's PF contribution amount maximum of</span>
                                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden w-32">
                                            <div className="px-3 py-2 bg-slate-50 text-xs font-bold text-slate-500 border-r border-slate-200">INR</div>
                                            <input 
                                                type="text" 
                                                value={empLimit}
                                                onChange={(e) => setEmpLimit(e.target.value)}
                                                disabled={!isEditing}
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
                                    <label className="block text-sm font-bold text-slate-700">Employer Contribution Rate</label>
                                    <button className="text-xs font-bold text-sky-600 hover:underline">View Splitup</button>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                    <div className="relative flex-1 w-full">
                                        <select 
                                            disabled={!isEditing} 
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 appearance-none bg-white disabled:bg-slate-50 focus:outline-none focus:border-sky-500"
                                            value={emprRate}
                                            onChange={(e) => setEmprRate(e.target.value)}
                                        >
                                            <option>12% of Actual PF Wage</option>
                                            <option>12% of Restricted PF Wage</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <span className="text-sm text-slate-600 whitespace-nowrap">Limit employer's PF contribution amount maximum of</span>
                                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden w-32">
                                            <div className="px-3 py-2 bg-slate-50 text-xs font-bold text-slate-500 border-r border-slate-200">INR</div>
                                            <input 
                                                type="text" 
                                                value={emprLimit}
                                                onChange={(e) => setEmprLimit(e.target.value)}
                                                disabled={!isEditing}
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
                                    <input type="checkbox" className="hidden" checked={includeEmprContri} onChange={() => isEditing && setIncludeEmprContri(!includeEmprContri)} disabled={!isEditing} />
                                    <span className="text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">Include employer's contribution in employee's salary structure.</span>
                                </label>

                                {includeEmprContri && (
                                    <div className="ml-8 space-y-3 pl-4 border-l-2 border-slate-100">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${includeEdli ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                                {includeEdli && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                            <input type="checkbox" className="hidden" checked={includeEdli} onChange={() => isEditing && setIncludeEdli(!includeEdli)} disabled={!isEditing} />
                                            <span className="text-sm text-slate-600">Include employer's EDLI contribution in employee's salary structure. <Info size={14} className="inline text-slate-400 ml-1" /></span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${includeAdminCharges ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                                {includeAdminCharges && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                            <input type="checkbox" className="hidden" checked={includeAdminCharges} onChange={() => isEditing && setIncludeAdminCharges(!includeAdminCharges)} disabled={!isEditing} />
                                            <span className="text-sm text-slate-600">Include admin charges in employee's salary structure. <Info size={14} className="inline text-slate-400 ml-1" /></span>
                                        </label>
                                    </div>
                                )}

                                <label className="flex items-start gap-3 cursor-pointer group pt-2">
                                    <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${overrideRate ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                        {overrideRate && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={overrideRate} onChange={() => isEditing && setOverrideRate(!overrideRate)} disabled={!isEditing} />
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
                                    <input type="checkbox" className="hidden" checked={prorateRestricted} onChange={() => isEditing && setProrateRestricted(!prorateRestricted)} disabled={!isEditing} />
                                    <div>
                                        <span className="block text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">Pro-rate Restricted PF Wage</span>
                                        <span className="block text-sm text-slate-500 mt-1">PF contribution will be pro-rated based on the number of days worked by the employee.</span>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer group">
                                     <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${considerComponents ? 'bg-sky-600 border-sky-600' : 'border-slate-300 bg-white'}`}>
                                        {considerComponents && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={considerComponents} onChange={() => isEditing && setConsiderComponents(!considerComponents)} disabled={!isEditing} />
                                    <div>
                                        <span className="block text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">Consider all applicable salary components if PF wage is less than ₹15,000 after Loss of Pay</span>
                                        <span className="block text-sm text-slate-500 mt-1">PF wage will be computed using the salary earned in that month rather than the structure amount.</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PFSettings;
