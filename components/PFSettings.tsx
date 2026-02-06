import React, { useState } from 'react';
import { Edit2, Save, Shield, Info, AlertCircle, ChevronDown, Lightbulb, Eye, X, Calculator, Check } from 'lucide-react';

const PFSettings: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [enablePf, setEnablePf] = useState(true);
    const [pfNumber, setPfNumber] = useState('AA/AAA/1234567/000');
    const [establishmentName, setEstablishmentName] = useState('TechFlow Systems Pvt Ltd');
    const [epfJoiningDate, setEpfJoiningDate] = useState('2023-01-12');
    const [showBelowLimitModal, setShowBelowLimitModal] = useState(false);
    const [showSplitupModal, setShowSplitupModal] = useState(false);
    
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

    // Below Limit Components
    const [belowLimitComponents, setBelowLimitComponents] = useState<string[]>(['Basic Salary', 'Dearness Allowances (DA)']);

    // Backup State for Cancel functionality
    const [backupState, setBackupState] = useState<any>(null);

    const handleEdit = () => {
        setBackupState({
            enablePf, pfNumber, establishmentName, epfJoiningDate, empRate, emprRate, empLimit, emprLimit,
            includeEmprContri, includeEdli, includeAdminCharges, overrideRate,
            prorateRestricted, considerComponents,
            belowLimitComponents: [...belowLimitComponents]
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (backupState) {
            setEnablePf(backupState.enablePf);
            setPfNumber(backupState.pfNumber);
            setEstablishmentName(backupState.establishmentName);
            setEpfJoiningDate(backupState.epfJoiningDate);
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
            setBelowLimitComponents(backupState.belowLimitComponents);
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

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    {/* Left: Main Settings */}
                    <div className="xl:col-span-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
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
                                        <label className="block text-sm font-bold text-slate-700 mb-2">EPF Number/Establishment ID</label>
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
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Establishment Name</label>
                                        <input 
                                            type="text" 
                                            value={establishmentName} 
                                            onChange={(e) => setEstablishmentName(e.target.value)} 
                                            disabled={!isEditing} 
                                            placeholder='Enter Establishment Name'
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:text-slate-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Joining Date under EPF</label>
                                        <input 
                                            type="date" 
                                            value={epfJoiningDate} 
                                            onChange={(e) => setEpfJoiningDate(e.target.value)} 
                                            disabled={!isEditing} 
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:text-slate-500" 
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
                                    <div className="flex items-center mb-2">
                                        <label className="block text-sm font-bold text-slate-700">Employee Contribution Rate</label>
                                        <button 
                                            onClick={() => setShowBelowLimitModal(true)}
                                            className="ml-3 text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                                        >
                                            <Calculator size={12} /> PF wages below 15000?
                                        </button>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                        <div className="relative flex-1 w-full">
                                            <select 
                                                disabled 
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 appearance-none bg-slate-50 focus:outline-none cursor-not-allowed"
                                                value="12% of Actual PF Wage"
                                            >
                                                <option>12% of Actual PF Wage</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            <span className="text-sm text-slate-600 whitespace-nowrap flex items-center gap-1">
                                                Limit employee's PF contribution amount maximum of
                                                <div className="group relative">
                                                    <Info size={14} className="text-slate-400 cursor-help" />
                                                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 text-center leading-relaxed font-normal normal-case whitespace-normal">
                                                        If no capping set, then actual contribution will be deducted as Employee Contribution.
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
                                        <button 
                                            onClick={() => setShowSplitupModal(true)}
                                            className="text-xs font-bold text-sky-600 hover:underline"
                                        >
                                            View Splitup
                                        </button>
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
                                                <input type="checkbox" className="hidden" checked={includeAdminCharges} onChange={() => isEditing && setIncludeAdminCharges(!includeAdminCharges)} disabled={!isEditing} />
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

                            {/* Nudge Banner */}
                            <div className="bg-amber-50 rounded-xl p-6 border border-amber-100/50 flex flex-col gap-4">
                                <div className="flex gap-3">
                                    <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg shrink-0">
                                        <Lightbulb size={20} />
                                    </div>
                                    <p className="text-sm font-medium text-amber-900 leading-relaxed">
                                        Do you want to preview EPF calculation for multiple cases, based on the preferences you have configured?
                                    </p>
                                </div>
                                <button className="flex items-center gap-2 text-blue-600 text-sm font-bold hover:text-blue-700 transition-colors w-fit pl-11">
                                    <Eye size={18} />
                                    Preview EPF Calculation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PF Wages Below 15000 Modal */}
            {showBelowLimitModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-3 text-slate-800">
                                <Calculator size={20} className="text-sky-600" />
                                <h3 className="font-bold text-lg">PF Calculation (Below ₹15,000)</h3>
                            </div>
                            <button 
                                onClick={() => setShowBelowLimitModal(false)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                            {/* Component Selection Section */}
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Components for Calculation</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {['Basic Salary', 'HRA', 'Dearness Allowances (DA)'].map(comp => (
                                        <label key={comp} className={`flex items-center gap-2 p-2 border rounded-xl cursor-pointer transition-all ${belowLimitComponents.includes(comp) ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${belowLimitComponents.includes(comp) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                                {belowLimitComponents.includes(comp) && <Check size={10} className="text-white stroke-[3]" />}
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                className="hidden" 
                                                checked={belowLimitComponents.includes(comp)}
                                                onChange={() => {
                                                    setBelowLimitComponents(prev => 
                                                        prev.includes(comp) ? prev.filter(c => c !== comp) : [...prev, comp]
                                                    );
                                                }}
                                            />
                                            <span className={`text-[11px] font-bold ${belowLimitComponents.includes(comp) ? 'text-indigo-900' : 'text-slate-600'}`}>{comp}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                                    <p className="text-[11px] font-bold text-indigo-700 flex items-center gap-2">
                                        <Info size={14} className="text-indigo-500 shrink-0" />
                                        Recommended: Gross - HRA + Statutory
                                    </p>
                                </div>
                            </div>

                            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                                <p className="text-sm text-sky-800 leading-relaxed font-medium">
                                    When PF wages are below ₹15,000, the contribution is calculated on the actual wages of selected components without capping.
                                </p>
                                <p className="text-[11px] text-sky-700/80 mt-2 font-medium italic">
                                    (Currently selected: {belowLimitComponents.join(', ')})
                                </p>
                                <div className="mt-3 text-xs text-sky-600 font-bold flex items-center gap-1">
                                    <Info size={14} /> Example Wage: ₹12,000
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Employee */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex justify-between">
                                        <span>Employee's Contribution</span>
                                        <span className="text-sky-600">12%</span>
                                    </h4>
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                                        <span className="text-sm text-slate-600">EPF (12% of 12000)</span>
                                        <span className="font-bold text-slate-800">₹ 1,440</span>
                                    </div>
                                </div>

                                {/* Employer */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex justify-between">
                                        <span>Employer's Contribution</span>
                                        <span className="text-sky-600">12% Split</span>
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                                            <span className="text-sm text-slate-600">EPS (8.33% of 12000)</span>
                                            <span className="font-bold text-slate-800">₹ 1,000</span>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                                            <span className="text-sm text-slate-600">EPF (Remaining 3.67%)</span>
                                            <span className="font-bold text-slate-800">₹ 440</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="pt-4 border-t-2 border-dashed border-slate-100 flex justify-between items-center px-2">
                                    <span className="text-base font-black text-slate-800 uppercase tracking-widest">Total Remittance</span>
                                    <span className="text-2xl font-black text-sky-600">₹ 2,880</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={() => setShowBelowLimitModal(false)}
                                className="px-6 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-lg shadow-slate-100 text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Employer Contribution Splitup Modal */}
            {showSplitupModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col animate-in zoom-in-95 duration-300 border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">CONTRIBUTION RATE</h3>
                            <button 
                                onClick={() => setShowSplitupModal(false)}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-0 rounded-b-2xl">
                            <table className="w-full text-left">
                                <thead className="bg-white border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">SUB COMPONENTS</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">EMPLOYER'S CONTRIBUTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 bg-white">
                                    <tr>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-700">Employees' Provident Fund (EPF)</td>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-700">3.67% of PF Wage</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-700">Employees' Pension Scheme</td>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-700 flex items-center gap-2">
                                            8.33% of PF Wage
                                            <div className="group relative">
                                                <Info size={14} className="text-slate-400 cursor-help" />
                                                <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max p-3 bg-slate-800 text-white text-[10px] rounded-lg shadow-2xl z-[110] text-center leading-relaxed font-normal normal-case whitespace-nowrap border border-slate-700">
                                                    Maximum Employer Contribution for EPS is 1250
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PFSettings;