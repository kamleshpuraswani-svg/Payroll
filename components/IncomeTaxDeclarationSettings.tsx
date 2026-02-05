
import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Save, Calendar, ChevronDown, Bell, Check, Info, AlertCircle, Clock, FileText, History, AlertTriangle, Plus, Trash2, X } from 'lucide-react';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const CURRENT_YEAR = 2025;

const formatDate = (date: Date) => {
  return `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const DatePicker: React.FC<{
  date: Date;
  onChange: (date: Date) => void;
  label: string;
  disabled?: boolean;
  required?: boolean;
  subLabel?: string;
}> = ({ date, onChange, label, disabled = false, required = false, subLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center">
            {label} {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 flex justify-between items-center transition-all ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-80' : 'cursor-pointer hover:border-purple-400 hover:shadow-sm'}`}
      >
        <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <span className="font-medium text-sm">{formatDate(date)}</span>
        </div>
        <ChevronDown size={16} className="text-slate-400" />
      </div>
      {subLabel && <p className="text-[10px] text-slate-400 mt-1">{subLabel}</p>}
      
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-slate-200 shadow-xl rounded-xl z-50 animate-in fade-in zoom-in-95">
            <input 
                type="date" 
                value={date.toISOString().split('T')[0]} 
                onChange={(e) => { onChange(new Date(e.target.value)); setIsOpen(false); }}
                className="p-2 border rounded"
            />
        </div>
      )}
    </div>
  );
};

const IncomeTaxDeclarationSettings: React.FC = () => {
    // --- Investment Declaration State ---
    const [isEditingInv, setIsEditingInv] = useState(false);
    const [invEnabled, setInvEnabled] = useState(true);
    const [invDeadline, setInvDeadline] = useState(new Date(2026, 0, 15)); // Jan 15, 2026
    
    // Limits State
    const [limits, setLimits] = useState([
        { id: '1', section: '80C', limit: '1,50,000', description: 'Investments & Expenses' },
        { id: '2', section: '80D', limit: '25,000', description: 'Medical Insurance' }
    ]);

    // Regime State
    const [defaultRegime, setDefaultRegime] = useState('New Regime');
    const [allowSwitch, setAllowSwitch] = useState(true);
    const [switchLockDate, setSwitchLockDate] = useState(new Date(2025, 11, 31));

    // Alerts State
    const [notifyRelease, setNotifyRelease] = useState(true);
    const [emailReminder, setEmailReminder] = useState(false);
    const [notifyLock, setNotifyLock] = useState(true);

    // --- Proof of Investment State ---
    const [isEditingProof, setIsEditingProof] = useState(false);
    const [proofEnabled, setProofEnabled] = useState(true);
    const [proofDeadline, setProofDeadline] = useState(new Date(2026, 1, 28)); // Feb 28, 2026
    const [mandatoryProof, setMandatoryProof] = useState(true);
    const [autoReject, setAutoReject] = useState(false);
    const [notifyRejection, setNotifyRejection] = useState(true);
    const [autoAdjustTDS, setAutoAdjustTDS] = useState(true);
    const [allowedFileTypes, setAllowedFileTypes] = useState<string[]>(['PDF', 'JPG', 'PNG']);
    
    // New States for POI
    const [poiPayrollMonth, setPoiPayrollMonth] = useState('March');
    const [mandateComments, setMandateComments] = useState(true);

    // Backup states for cancel functionality
    const [invBackup, setInvBackup] = useState<any>(null);
    const [proofBackup, setProofBackup] = useState<any>(null);

    // -- Handlers for Investment Declaration --
    const handleEditInv = () => {
        setInvBackup({ 
            invEnabled, invDeadline, limits: JSON.parse(JSON.stringify(limits)), 
            defaultRegime, allowSwitch, switchLockDate,
            notifyRelease, emailReminder, notifyLock 
        });
        setIsEditingInv(true);
    };

    const handleCancelInv = () => {
        if(invBackup) {
            setInvEnabled(invBackup.invEnabled);
            setInvDeadline(invBackup.invDeadline);
            setLimits(invBackup.limits);
            setDefaultRegime(invBackup.defaultRegime);
            setAllowSwitch(invBackup.allowSwitch);
            setSwitchLockDate(invBackup.switchLockDate);
            setNotifyRelease(invBackup.notifyRelease);
            setEmailReminder(invBackup.emailReminder);
            setNotifyLock(invBackup.notifyLock);
        }
        setIsEditingInv(false);
    };

    const handleSaveInv = () => {
        setIsEditingInv(false);
        // Persist logic here
    };

    const handleAddLimit = () => {
        setLimits([...limits, { id: Date.now().toString(), section: '', limit: '', description: '' }]);
    };

    const handleRemoveLimit = (id: string) => {
        setLimits(limits.filter(l => l.id !== id));
    };

    const handleLimitChange = (id: string, field: string, value: string) => {
        setLimits(limits.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    // -- Handlers for Proof of Investment --
    const handleEditProof = () => {
        setProofBackup({ 
            proofEnabled, proofDeadline, mandatoryProof, autoReject, notifyRejection, autoAdjustTDS, allowedFileTypes,
            poiPayrollMonth, mandateComments
        });
        setIsEditingProof(true);
    };

    const handleCancelProof = () => {
        if(proofBackup) {
            setProofEnabled(proofBackup.proofEnabled);
            setProofDeadline(proofBackup.proofDeadline);
            setMandatoryProof(proofBackup.mandatoryProof);
            setAutoReject(proofBackup.autoReject);
            setNotifyRejection(proofBackup.notifyRejection);
            setAutoAdjustTDS(proofBackup.autoAdjustTDS);
            setAllowedFileTypes(proofBackup.allowedFileTypes);
            setPoiPayrollMonth(proofBackup.poiPayrollMonth);
            setMandateComments(proofBackup.mandateComments);
        }
        setIsEditingProof(false);
    };

    const handleSaveProof = () => {
        setIsEditingProof(false);
        // Persist logic here
    };

    const toggleFileType = (type: string) => {
        if (allowedFileTypes.includes(type)) {
            setAllowedFileTypes(allowedFileTypes.filter(t => t !== type));
        } else {
            setAllowedFileTypes([...allowedFileTypes, type]);
        }
    };

    return (
        <div className="h-full overflow-y-auto bg-slate-50 relative">
            {/* Top Summary Banner */}
            <div className="bg-indigo-50 border-b border-indigo-100 py-3 text-center sticky top-0 z-20">
                <p className="text-sm font-medium text-indigo-900 flex items-center justify-center gap-2">
                    <Info size={16} className="text-indigo-600"/>
                    Current Financial Year: <span className="font-bold">2025–26</span> · Declarations open until <span className="font-bold">15 Jan 2026</span>
                </p>
            </div>

            <div className="p-4 lg:p-8 max-w-full mx-auto space-y-6 pb-32">
                
                {/* 1. Investment Declaration Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-bold text-slate-800">Investment Declaration</h3>
                                {!isEditingInv && (
                                    <button onClick={handleEditInv} className="text-slate-400 hover:text-indigo-600 transition-colors p-1 hover:bg-slate-50 rounded">
                                        <Edit2 size={16} />
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-slate-500">Allow employees to declare tax-saving investments under Section 80C, 80D, HRA, etc.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {isEditingInv ? (
                                <div className="flex gap-2 animate-in fade-in slide-in-from-right-2">
                                    <button onClick={handleCancelInv} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">Cancel</button>
                                    <button onClick={handleSaveInv} className="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Save</button>
                                </div>
                            ) : null}
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={invEnabled} 
                                        onChange={() => setInvEnabled(!invEnabled)} 
                                        disabled={!isEditingInv} 
                                        className="sr-only peer" 
                                    />
                                    <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    {invEnabled && (
                        <div className="p-8 space-y-8 animate-in slide-in-from-top-2">
                            {/* Declaration Deadline */}
                            <div className="max-w-md">
                                <DatePicker 
                                    label="Declaration Deadline" 
                                    date={invDeadline} 
                                    onChange={setInvDeadline} 
                                    disabled={!isEditingInv}
                                    required
                                />
                            </div>

                            {/* Limits Section */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
                                    Maximum Limit per Section
                                    <div className="group relative">
                                        <Info size={12} className="text-orange-500 cursor-help" />
                                        <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 text-center">
                                            Per financial year; auto-validates submissions
                                        </div>
                                    </div>
                                </label>
                                
                                <div className="space-y-3 max-w-3xl">
                                    {limits.map((item, index) => (
                                        <div key={item.id} className="flex gap-4 items-center">
                                            <div className="w-32">
                                                <input 
                                                    type="text" 
                                                    value={item.section}
                                                    onChange={(e) => handleLimitChange(item.id, 'section', e.target.value)}
                                                    disabled={!isEditingInv} 
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:border-purple-500"
                                                    placeholder="Section"
                                                />
                                            </div>
                                            <div className="flex-1 relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                                <input 
                                                    type="text" 
                                                    value={item.limit} 
                                                    onChange={(e) => handleLimitChange(item.id, 'limit', e.target.value)}
                                                    disabled={!isEditingInv}
                                                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
                                                    placeholder="Limit"
                                                />
                                            </div>
                                            {isEditingInv && index > 1 && (
                                                <button onClick={() => handleRemoveLimit(item.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {isEditingInv && (
                                        <button 
                                            onClick={handleAddLimit}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2"
                                        >
                                            <Plus size={14} /> Add Section Limit
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Tax Regime Configuration */}
                            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Default Tax Regime</label>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <select 
                                                value={defaultRegime}
                                                onChange={(e) => setDefaultRegime(e.target.value)}
                                                disabled={!isEditingInv}
                                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 appearance-none focus:outline-none focus:border-purple-500 disabled:bg-slate-50"
                                            >
                                                <option>New Regime</option>
                                                <option>Old Regime</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex gap-3 items-start">
                                            <Info size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                                            <p className="text-xs text-indigo-800 leading-relaxed">
                                                <span className="font-bold">New Regime:</span> No 80C deductions but lower slabs; <span className="font-bold">Old Regime:</span> Deductions allowed but higher base rates.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Allow Regime Switch</label>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={allowSwitch} 
                                                onChange={() => isEditingInv && setAllowSwitch(!allowSwitch)} 
                                                disabled={!isEditingInv} 
                                                className="sr-only peer" 
                                            />
                                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>
                                    {allowSwitch && (
                                        <div className="pl-1">
                                            <DatePicker 
                                                label="Lock Switch After Date" 
                                                date={switchLockDate} 
                                                onChange={setSwitchLockDate} 
                                                disabled={!isEditingInv}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Alerts */}
                            <div className="pt-4 border-t border-slate-100">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                                    <Bell size={16} className="text-slate-400" /> Manage alerts for Employees
                                </h4>
                                <p className="text-sm text-slate-500 mb-4">Let employer send mail notifications and reminders automatically based on the configured lock date.</p>
                                <div className="space-y-3 pl-1">
                                    <label className={`flex items-center gap-3 group ${isEditingInv ? 'cursor-pointer' : ''}`}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${notifyRelease ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                            {notifyRelease && <Check size={14} className="text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={notifyRelease} onChange={() => isEditingInv && setNotifyRelease(!notifyRelease)} disabled={!isEditingInv} />
                                        <span className="text-sm text-slate-700">Notify when IT Declaration is RELEASED</span>
                                    </label>
                                    <label className={`flex items-center gap-3 group ${isEditingInv ? 'cursor-pointer' : ''}`}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${emailReminder ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                            {emailReminder && <Check size={14} className="text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={emailReminder} onChange={() => isEditingInv && setEmailReminder(!emailReminder)} disabled={!isEditingInv} />
                                        <span className="text-sm text-slate-700">Enable e-mail reminder to employees to submit before lock date</span>
                                    </label>
                                    <label className={`flex items-center gap-3 group ${isEditingInv ? 'cursor-pointer' : ''}`}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${notifyLock ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                            {notifyLock && <Check size={14} className="text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={notifyLock} onChange={() => isEditingInv && setNotifyLock(!notifyLock)} disabled={!isEditingInv} />
                                        <span className="text-sm text-slate-700">Notify when IT Declaration is LOCKED</span>
                                    </label>
                                </div>
                            </div>

                            {/* Progress Stats */}
                            <div className="pt-2 border-t border-slate-100">
                                <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                                    <span>Declarations Submitted</span>
                                    <span className="text-emerald-600">1,200/1,842 (65%)</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <div className="bg-emerald-500 h-2.5 rounded-full w-[65%]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Proof of Investment Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-bold text-slate-800">Proof of Investment</h3>
                                {!isEditingProof && (
                                    <button onClick={handleEditProof} className="text-slate-400 hover:text-indigo-600 transition-colors p-1 hover:bg-slate-50 rounded">
                                        <Edit2 size={16} />
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-slate-500">Mandate employees to upload proof (e.g., receipts, forms, statements) for declared investments.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {isEditingProof ? (
                                <div className="flex gap-2 animate-in fade-in slide-in-from-right-2">
                                    <button onClick={handleCancelProof} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">Cancel</button>
                                    <button onClick={handleSaveProof} className="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Save</button>
                                </div>
                            ) : null}
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={proofEnabled} onChange={() => setProofEnabled(!proofEnabled)} disabled={!isEditingProof} className="sr-only peer" />
                                    <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {proofEnabled && (
                        <div className="p-8 space-y-8 animate-in slide-in-from-top-2">
                            {/* Row 1: Deadline & File Types */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <DatePicker 
                                    label="Proof Submission Deadline" 
                                    date={proofDeadline} 
                                    onChange={setProofDeadline} 
                                    required
                                    disabled={!isEditingProof}
                                    subLabel="For final TDS adjustment and 24Q filing"
                                />
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Allowed File Types</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['PDF', 'JPG', 'PNG', 'ZIP'].map(type => {
                                            const isSelected = allowedFileTypes.includes(type);
                                            return (
                                                <button
                                                    key={type}
                                                    onClick={() => isEditingProof && toggleFileType(type)}
                                                    disabled={!isEditingProof}
                                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all uppercase ${
                                                        isSelected 
                                                            ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm' 
                                                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                                    } ${isEditingProof ? 'cursor-pointer hover:border-purple-300' : 'cursor-default opacity-80'}`}
                                                >
                                                    {type}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2">Max file size: 5MB per document</p>
                                </div>
                            </div>

                            {/* Row 2: Toggles Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 pt-2">
                                <label className={`flex items-center justify-between group ${isEditingProof ? 'cursor-pointer' : ''}`}>
                                    <span className="text-sm font-bold text-slate-700">Mandatory for All Declarations</span>
                                    <div className="relative inline-flex items-center">
                                        <input type="checkbox" checked={mandatoryProof} onChange={() => isEditingProof && setMandatoryProof(!mandatoryProof)} disabled={!isEditingProof} className="sr-only peer" />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                    </div>
                                </label>

                                <label className={`flex items-center justify-between group ${isEditingProof ? 'cursor-pointer' : ''}`}>
                                    <span className="text-sm font-bold text-slate-700">Link to TDS Adjustment</span>
                                    <div className="relative inline-flex items-center">
                                        <input type="checkbox" checked={autoAdjustTDS} onChange={() => isEditingProof && setAutoAdjustTDS(!autoAdjustTDS)} disabled={!isEditingProof} className="sr-only peer" />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                    </div>
                                </label>
                                <p className="text-xs text-slate-500 -mt-4 col-span-1 md:col-start-2">Auto-adjust TDS based on verified proofs</p>

                                <div className="col-span-1 md:col-span-2 bg-rose-50 border border-rose-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle size={20} className="text-rose-500" />
                                        <div>
                                            <span className="text-sm font-bold text-rose-800 block">Auto-reject if no proof by deadline</span>
                                            <span className="text-xs text-rose-600">Declarations without proofs will be rejected after {formatDate(proofDeadline)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <label className={`flex items-center gap-2 group ${isEditingProof ? 'cursor-pointer' : ''}`}>
                                            <span className="text-xs font-bold text-rose-700">Enable</span>
                                            <div className="relative inline-flex items-center">
                                                <input type="checkbox" checked={autoReject} onChange={() => isEditingProof && setAutoReject(!autoReject)} disabled={!isEditingProof} className="sr-only peer" />
                                                <div className="w-9 h-5 bg-rose-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-rose-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                                            </div>
                                        </label>
                                        {autoReject && (
                                            <label className={`flex items-center gap-2 group ${isEditingProof ? 'cursor-pointer' : ''}`}>
                                                <input type="checkbox" checked={notifyRejection} onChange={() => isEditingProof && setNotifyRejection(!notifyRejection)} disabled={!isEditingProof} className="rounded text-rose-600 focus:ring-rose-500" />
                                                <span className="text-xs font-bold text-rose-700">Notify on Rejection</span>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payroll Month Processing */}
                            <div className="pt-6 border-t border-slate-100">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="flex-1">
                                         <label className="block text-sm font-bold text-slate-800 mb-2">Process payroll with approved POI amount from</label>
                                         <p className="text-sm text-emerald-600 leading-relaxed">
                                            The approved POI amount will be considered for the payroll from <span className="font-bold bg-emerald-50 px-1 rounded">{poiPayrollMonth}</span> onwards to calculate and deduct income tax amount in subsequent payrolls.
                                         </p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="relative">
                                            <select
                                                value={poiPayrollMonth}
                                                onChange={(e) => setPoiPayrollMonth(e.target.value)}
                                                disabled={!isEditingProof}
                                                className="appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white focus:outline-none focus:border-purple-500 disabled:bg-slate-50 min-w-[140px]"
                                            >
                                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                        <span className="text-sm text-slate-500 whitespace-nowrap">for upcoming years.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Other Configs */}
                            <div className="pt-6 border-t border-slate-100">
                                <h4 className="text-sm font-bold text-slate-800 mb-4">Other Configurations</h4>
                                <label className={`flex items-center gap-3 group ${isEditingProof ? 'cursor-pointer' : ''}`}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${mandateComments ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                        {mandateComments && <Check size={14} className="text-white" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={mandateComments} onChange={() => isEditingProof && setMandateComments(!mandateComments)} disabled={!isEditingProof} />
                                    <span className="text-sm text-slate-700">Mandate reviewer comments for partial investment amount approval</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IncomeTaxDeclarationSettings;
