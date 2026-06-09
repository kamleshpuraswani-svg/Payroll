import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Save, Edit2, FileText, ChevronDown, Check, AlertCircle, Info, Landmark, User, CreditCard, Shield, Activity, Briefcase, Building2 } from 'lucide-react';

const BUSINESS_UNITS = [
    "MindInventory",
    "300 Minds",
    "CollabCRM"
];

const ChallanSettings: React.FC = () => {
    // Target state
    const [selectedTarget, setSelectedTarget] = useState('bu:MindInventory');
    
    // Global edit state
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Configurations state
    // PF
    const [pfEnabled, setPfEnabled] = useState(true);
    const [autoPfChallan, setAutoPfChallan] = useState(true);
    const [pfPaymentMode, setPfPaymentMode] = useState('Direct Debit');
    const [pfAuthorizedSignatory, setPfAuthorizedSignatory] = useState('');
    const [pfBankName, setPfBankName] = useState('HDFC Bank');
    const [pfAccountNumber, setPfAccountNumber] = useState('');

    // ESI
    const [esiEnabled, setEsiEnabled] = useState(true);
    const [autoEsiChallan, setAutoEsiChallan] = useState(true);
    const [esiPaymentMode, setEsiPaymentMode] = useState('Direct Debit');
    const [esiAuthorizedSignatory, setEsiAuthorizedSignatory] = useState('');
    const [esiBankName, setEsiBankName] = useState('HDFC Bank');
    const [esiAccountNumber, setEsiAccountNumber] = useState('');

    // LWF
    const [lwfEnabled, setLwfEnabled] = useState(false);
    const [autoLwfChallan, setAutoLwfChallan] = useState(false);
    const [lwfPaymentMode, setLwfPaymentMode] = useState('Direct Debit');
    const [lwfAuthorizedSignatory, setLwfAuthorizedSignatory] = useState('');
    const [lwfBankName, setLwfBankName] = useState('HDFC Bank');
    const [lwfAccountNumber, setLwfAccountNumber] = useState('');

    // PT
    const [ptEnabled, setPtEnabled] = useState(false);
    const [autoPtChallan, setAutoPtChallan] = useState(false);
    const [ptPaymentMode, setPtPaymentMode] = useState('Direct Debit');
    const [ptAuthorizedSignatory, setPtAuthorizedSignatory] = useState('');
    const [ptBankName, setPtBankName] = useState('HDFC Bank');
    const [ptAccountNumber, setPtAccountNumber] = useState('');

    // Backup state for cancel
    const [backupState, setBackupState] = useState<any>(null);

    // List of active employees for Signatory dropdowns
    const [employees, setEmployees] = useState<string[]>([]);
    
    const fetchEmployees = async () => {
        try {
            const { data, error } = await supabase
                .from('employees')
                .select('name')
                .eq('status', 'Active');
            if (error) throw error;
            if (data) {
                setEmployees(data.map((e: any) => e.name).filter(Boolean).sort());
            }
        } catch (err) {
            console.error('Error fetching employees for Challan settings:', err);
        }
    };

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('operational_config')
                .select('config_value')
                .eq('config_key', `challan_settings:${selectedTarget}`)
                .single();
                
            if (!error && data?.config_value) {
                const config = data.config_value;
                
                // PF settings
                setPfEnabled(config.pfEnabled ?? true);
                setAutoPfChallan(config.autoPfChallan ?? true);
                setPfPaymentMode(config.pfPaymentMode ?? 'Direct Debit');
                setPfAuthorizedSignatory(config.pfAuthorizedSignatory ?? '');
                setPfBankName(config.pfBankName ?? 'HDFC Bank');
                setPfAccountNumber(config.pfAccountNumber ?? '');

                // ESI settings
                setEsiEnabled(config.esiEnabled ?? true);
                setAutoEsiChallan(config.autoEsiChallan ?? true);
                setEsiPaymentMode(config.esiPaymentMode ?? 'Direct Debit');
                setEsiAuthorizedSignatory(config.esiAuthorizedSignatory ?? '');
                setEsiBankName(config.esiBankName ?? 'HDFC Bank');
                setEsiAccountNumber(config.esiAccountNumber ?? '');

                // LWF settings
                setLwfEnabled(config.lwfEnabled ?? false);
                setAutoLwfChallan(config.autoLwfChallan ?? false);
                setLwfPaymentMode(config.lwfPaymentMode ?? 'Direct Debit');
                setLwfAuthorizedSignatory(config.lwfAuthorizedSignatory ?? '');
                setLwfBankName(config.lwfBankName ?? 'HDFC Bank');
                setLwfAccountNumber(config.lwfAccountNumber ?? '');

                // PT settings
                setPtEnabled(config.ptEnabled ?? false);
                setAutoPtChallan(config.autoPtChallan ?? false);
                setPtPaymentMode(config.ptPaymentMode ?? 'Direct Debit');
                setPtAuthorizedSignatory(config.ptAuthorizedSignatory ?? '');
                setPtBankName(config.ptBankName ?? 'HDFC Bank');
                setPtAccountNumber(config.ptAccountNumber ?? '');
            } else {
                // Reset to default
                setPfEnabled(true);
                setAutoPfChallan(true);
                setPfPaymentMode('Direct Debit');
                setPfAuthorizedSignatory('');
                setPfBankName('HDFC Bank');
                setPfAccountNumber('');

                setEsiEnabled(true);
                setAutoEsiChallan(true);
                setEsiPaymentMode('Direct Debit');
                setEsiAuthorizedSignatory('');
                setEsiBankName('HDFC Bank');
                setEsiAccountNumber('');

                setLwfEnabled(false);
                setAutoLwfChallan(false);
                setLwfPaymentMode('Direct Debit');
                setLwfAuthorizedSignatory('');
                setLwfBankName('HDFC Bank');
                setLwfAccountNumber('');

                setPtEnabled(false);
                setAutoPtChallan(false);
                setPtPaymentMode('Direct Debit');
                setPtAuthorizedSignatory('');
                setPtBankName('HDFC Bank');
                setPtAccountNumber('');
            }
        } catch (err) {
            console.error('Error fetching Challan settings:', err);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchSettings();
        setIsEditing(false);
    }, [selectedTarget]);

    const handleEdit = () => {
        setBackupState({
            pfEnabled, autoPfChallan, pfPaymentMode, pfAuthorizedSignatory, pfBankName, pfAccountNumber,
            esiEnabled, autoEsiChallan, esiPaymentMode, esiAuthorizedSignatory, esiBankName, esiAccountNumber,
            lwfEnabled, autoLwfChallan, lwfPaymentMode, lwfAuthorizedSignatory, lwfBankName, lwfAccountNumber,
            ptEnabled, autoPtChallan, ptPaymentMode, ptAuthorizedSignatory, ptBankName, ptAccountNumber
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (backupState) {
            setPfEnabled(backupState.pfEnabled);
            setAutoPfChallan(backupState.autoPfChallan);
            setPfPaymentMode(backupState.pfPaymentMode);
            setPfAuthorizedSignatory(backupState.pfAuthorizedSignatory);
            setPfBankName(backupState.pfBankName);
            setPfAccountNumber(backupState.pfAccountNumber);

            setEsiEnabled(backupState.esiEnabled);
            setAutoEsiChallan(backupState.autoEsiChallan);
            setEsiPaymentMode(backupState.esiPaymentMode);
            setEsiAuthorizedSignatory(backupState.esiAuthorizedSignatory);
            setEsiBankName(backupState.esiBankName);
            setEsiAccountNumber(backupState.esiAccountNumber);

            setLwfEnabled(backupState.lwfEnabled);
            setAutoLwfChallan(backupState.autoLwfChallan);
            setLwfPaymentMode(backupState.lwfPaymentMode);
            setLwfAuthorizedSignatory(backupState.lwfAuthorizedSignatory);
            setLwfBankName(backupState.lwfBankName);
            setLwfAccountNumber(backupState.lwfAccountNumber);

            setPtEnabled(backupState.ptEnabled);
            setAutoPtChallan(backupState.autoPtChallan);
            setPtPaymentMode(backupState.ptPaymentMode);
            setPtAuthorizedSignatory(backupState.ptAuthorizedSignatory);
            setPtBankName(backupState.ptBankName);
            setPtAccountNumber(backupState.ptAccountNumber);
        }
        setIsEditing(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const configValue = {
                pfEnabled, autoPfChallan, pfPaymentMode, pfAuthorizedSignatory, pfBankName, pfAccountNumber,
                esiEnabled, autoEsiChallan, esiPaymentMode, esiAuthorizedSignatory, esiBankName, esiAccountNumber,
                lwfEnabled, autoLwfChallan, lwfPaymentMode, lwfAuthorizedSignatory, lwfBankName, lwfAccountNumber,
                ptEnabled, autoPtChallan, ptPaymentMode, ptAuthorizedSignatory, ptBankName, ptAccountNumber
            };

            const { error } = await supabase
                .from('operational_config')
                .upsert({
                    config_key: `challan_settings:${selectedTarget}`,
                    config_value: configValue,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'config_key' });

            if (error) throw error;
            setIsEditing(false);
        } catch (err) {
            console.error('Error saving Challan settings:', err);
            alert('Failed to save Challan settings.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 lg:p-6 w-full space-y-6 bg-slate-50 min-h-screen pb-20">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Challan Settings</h1>
                    <p className="text-slate-500 text-sm mt-1">Configure statutory challan generation, bank routing, and payment preferences.</p>
                </div>
                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-sky-100/20 disabled:opacity-50"
                            >
                                <Save size={18} />
                                {isSaving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleEdit}
                            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
                        >
                            <Edit2 size={16} />
                            Edit Settings
                        </button>
                    )}
                </div>
            </div>

            {/* Business Unit Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-xs">
                        <select
                            value={selectedTarget}
                            onChange={(e) => setSelectedTarget(e.target.value)}
                            disabled={isSaving || isEditing}
                            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {BUSINESS_UNITS.map(bu => (
                                <option key={bu} value={`bu:${bu}`}>{bu}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                            <ChevronDown size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Configurations Accordion */}
            <div className="w-full space-y-6">
                
                {/* 1. Provident Fund (PF) Section */}
                <div className={`bg-white p-8 rounded-xl border shadow-sm ${isEditing ? 'border-sky-300 ring-1 ring-sky-100' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <Shield size={20} className="text-sky-600" />
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">PROVIDENT FUND (PF)</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={pfEnabled} 
                                    onChange={() => isEditing && setPfEnabled(!pfEnabled)} 
                                    disabled={!isEditing} 
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                            </label>
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 -mt-2 mb-6">
                        Configure Challan preferences for Provident Fund contributions. Enabling this will auto-generate the PF Electronic Challan-cum-Return (ECR) file during monthly payroll finalization.
                    </p>

                    {pfEnabled && (
                        <div className="space-y-6 border-t border-slate-100 pt-6 animate-in fade-in">
                            <label className="flex items-start gap-4 cursor-pointer group">
                                <div
                                    onClick={() => isEditing && setAutoPfChallan(!autoPfChallan)}
                                    className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${autoPfChallan ? 'bg-sky-500 border-sky-500 text-white shadow-lg' : 'border-slate-300 bg-white group-hover:border-sky-400'} ${!isEditing ? 'cursor-not-allowed opacity-70' : ''}`}
                                >
                                    {autoPfChallan && <Check size={14} strokeWidth={4} />}
                                </div>
                                <div>
                                    <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Auto-generate PF ECR file on payroll finalization</span>
                                    <p className="text-xs text-slate-400 mt-1">Automatically compile and generate the Electronic Challan-cum-Return text file after monthly payroll signoff.</p>
                                </div>
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                {/* Signatory Dropdown */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Authorized Signatory <span className="text-rose-500">*</span></label>
                                    <div className="relative max-w-xs">
                                        <select
                                            value={pfAuthorizedSignatory}
                                            onChange={e => setPfAuthorizedSignatory(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 appearance-none focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <option value="">Select Employee...</option>
                                            {employees.map(emp => (
                                                <option key={emp} value={emp}>{emp}</option>
                                            ))}
                                        </select>
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                {/* Payment Mode */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Payment Mode <span className="text-rose-500">*</span></label>
                                    <div className="relative max-w-xs">
                                        <select
                                            value={pfPaymentMode}
                                            onChange={e => setPfPaymentMode(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 appearance-none focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <option>Direct Debit</option>
                                            <option>Corporate Net Banking</option>
                                            <option>NEFT / RTGS Transfer</option>
                                        </select>
                                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                {/* Bank Name */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Authorized Bank <span className="text-rose-500">*</span></label>
                                    <div className="relative max-w-xs">
                                        <select
                                            value={pfBankName}
                                            onChange={e => setPfBankName(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 appearance-none focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <option>HDFC Bank</option>
                                            <option>State Bank of India</option>
                                            <option>ICICI Bank</option>
                                            <option>Axis Bank</option>
                                            <option>Kotak Mahindra Bank</option>
                                        </select>
                                        <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                {/* Account Number */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Account Number <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        value={pfAccountNumber}
                                        onChange={e => setPfAccountNumber(e.target.value.replace(/\D/g, ''))}
                                        disabled={!isEditing}
                                        placeholder="Enter bank account number"
                                        className="max-w-xs w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Employee State Insurance (ESI) Section */}
                <div className={`bg-white p-8 rounded-xl border shadow-sm ${isEditing ? 'border-sky-300 ring-1 ring-sky-100' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <Activity size={20} className="text-sky-600" />
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">EMPLOYEE STATE INSURANCE (ESI)</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={esiEnabled} 
                                    onChange={() => isEditing && setEsiEnabled(!esiEnabled)} 
                                    disabled={!isEditing} 
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                            </label>
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 -mt-2 mb-6">
                        Configure Challan preferences for Employee State Insurance contributions. Enabling this will compile and auto-generate ESI Challan details during monthly payroll finalization.
                    </p>

                    {esiEnabled && (
                        <div className="space-y-6 border-t border-slate-100 pt-6 animate-in fade-in">
                            <label className="flex items-start gap-4 cursor-pointer group">
                                <div
                                    onClick={() => isEditing && setAutoEsiChallan(!autoEsiChallan)}
                                    className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${autoEsiChallan ? 'bg-sky-500 border-sky-500 text-white shadow-lg' : 'border-slate-300 bg-white group-hover:border-sky-400'} ${!isEditing ? 'cursor-not-allowed opacity-70' : ''}`}
                                >
                                    {autoEsiChallan && <Check size={14} strokeWidth={4} />}
                                </div>
                                <div>
                                    <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Auto-generate ESI Challan on payroll finalization</span>
                                    <p className="text-xs text-slate-400 mt-1">Compile contributions and create the ESI challan summary sheet ready for portal uploading.</p>
                                </div>
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                {/* Signatory Dropdown */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Authorized Signatory <span className="text-rose-500">*</span></label>
                                    <div className="relative max-w-xs">
                                        <select
                                            value={esiAuthorizedSignatory}
                                            onChange={e => setEsiAuthorizedSignatory(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 appearance-none focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <option value="">Select Employee...</option>
                                            {employees.map(emp => (
                                                <option key={emp} value={emp}>{emp}</option>
                                            ))}
                                        </select>
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                {/* Payment Mode */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Payment Mode <span className="text-rose-500">*</span></label>
                                    <div className="relative max-w-xs">
                                        <select
                                            value={esiPaymentMode}
                                            onChange={e => setEsiPaymentMode(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 appearance-none focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <option>Direct Debit</option>
                                            <option>Corporate Net Banking</option>
                                            <option>NEFT / RTGS Transfer</option>
                                        </select>
                                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                {/* Bank Name */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Authorized Bank <span className="text-rose-500">*</span></label>
                                    <div className="relative max-w-xs">
                                        <select
                                            value={esiBankName}
                                            onChange={e => setEsiBankName(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 appearance-none focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <option>HDFC Bank</option>
                                            <option>State Bank of India</option>
                                            <option>ICICI Bank</option>
                                            <option>Axis Bank</option>
                                            <option>Kotak Mahindra Bank</option>
                                        </select>
                                        <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                {/* Account Number */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Account Number <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        value={esiAccountNumber}
                                        onChange={e => setEsiAccountNumber(e.target.value.replace(/\D/g, ''))}
                                        disabled={!isEditing}
                                        placeholder="Enter bank account number"
                                        className="max-w-xs w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Labour Welfare Fund (LWF) Section */}
                <div className={`bg-white p-8 rounded-xl border shadow-sm ${isEditing ? 'border-sky-300 ring-1 ring-sky-100' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <Briefcase size={20} className="text-sky-600" />
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">LABOUR WELFARE FUND (LWF)</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={lwfEnabled} 
                                    onChange={() => isEditing && setLwfEnabled(!lwfEnabled)} 
                                    disabled={!isEditing} 
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                            </label>
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 -mt-2 mb-6">
                        Configure Challan preferences for Labour Welfare Fund contributions. Enabling this will compute state-specific LWF challan formats and generation rules.
                    </p>

                    {lwfEnabled && (
                        <div className="space-y-6 border-t border-slate-100 pt-6 animate-in fade-in">
                            <label className="flex items-start gap-4 cursor-pointer group">
                                <div
                                    onClick={() => isEditing && setAutoLwfChallan(!autoLwfChallan)}
                                    className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${autoLwfChallan ? 'bg-sky-500 border-sky-500 text-white shadow-lg' : 'border-slate-300 bg-white group-hover:border-sky-400'} ${!isEditing ? 'cursor-not-allowed opacity-70' : ''}`}
                                >
                                    {autoLwfChallan && <Check size={14} strokeWidth={4} />}
                                </div>
                                <div>
                                    <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Auto-generate LWF Challan on payroll finalization</span>
                                    <p className="text-xs text-slate-400 mt-1">Compute Labour Welfare Fund deductions and compile state-specific challan formats.</p>
                                </div>
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                {/* Signatory Dropdown */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Authorized Signatory <span className="text-rose-500">*</span></label>
                                    <div className="relative max-w-xs">
                                        <select
                                            value={lwfAuthorizedSignatory}
                                            onChange={e => setLwfAuthorizedSignatory(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 appearance-none focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <option value="">Select Employee...</option>
                                            {employees.map(emp => (
                                                <option key={emp} value={emp}>{emp}</option>
                                            ))}
                                        </select>
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                {/* Payment Mode */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Payment Mode <span className="text-rose-500">*</span></label>
                                    <div className="relative max-w-xs">
                                        <select
                                            value={lwfPaymentMode}
                                            onChange={e => setLwfPaymentMode(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 appearance-none focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <option>Direct Debit</option>
                                            <option>Corporate Net Banking</option>
                                            <option>NEFT / RTGS Transfer</option>
                                        </select>
                                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                {/* Bank Name */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Authorized Bank <span className="text-rose-500">*</span></label>
                                    <div className="relative max-w-xs">
                                        <select
                                            value={lwfBankName}
                                            onChange={e => setLwfBankName(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 appearance-none focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <option>HDFC Bank</option>
                                            <option>State Bank of India</option>
                                            <option>ICICI Bank</option>
                                            <option>Axis Bank</option>
                                            <option>Kotak Mahindra Bank</option>
                                        </select>
                                        <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                {/* Account Number */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Account Number <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        value={lwfAccountNumber}
                                        onChange={e => setLwfAccountNumber(e.target.value.replace(/\D/g, ''))}
                                        disabled={!isEditing}
                                        placeholder="Enter bank account number"
                                        className="max-w-xs w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. Professional Tax (PT) Section */}
                <div className={`bg-white p-8 rounded-xl border shadow-sm ${isEditing ? 'border-sky-300 ring-1 ring-sky-100' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <Building2 size={20} className="text-sky-600" />
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">PROFESSIONAL TAX (PT)</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={ptEnabled} 
                                    onChange={() => isEditing && setPtEnabled(!ptEnabled)} 
                                    disabled={!isEditing} 
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                            </label>
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 -mt-2 mb-6">
                        Configure Challan preferences for Professional Tax. Enabling this will compile and auto-generate PT Challan summaries across active states during monthly finalization.
                    </p>

                    {ptEnabled && (
                        <div className="space-y-6 border-t border-slate-100 pt-6 animate-in fade-in">
                            <label className="flex items-start gap-4 cursor-pointer group">
                                <div
                                    onClick={() => isEditing && setAutoPtChallan(!autoPtChallan)}
                                    className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${autoPtChallan ? 'bg-sky-500 border-sky-500 text-white shadow-lg' : 'border-slate-300 bg-white group-hover:border-sky-400'} ${!isEditing ? 'cursor-not-allowed opacity-70' : ''}`}
                                >
                                    {autoPtChallan && <Check size={14} strokeWidth={4} />}
                                </div>
                                <div>
                                    <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Auto-generate PT Challan on payroll finalization</span>
                                    <p className="text-xs text-slate-400 mt-1">Automatically compile and generate the PT Challan summaries after monthly payroll signoff.</p>
                                </div>
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                {/* Signatory Dropdown */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Authorized Signatory <span className="text-rose-500">*</span></label>
                                    <div className="relative max-w-xs">
                                        <select
                                            value={ptAuthorizedSignatory}
                                            onChange={e => setPtAuthorizedSignatory(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 appearance-none focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <option value="">Select Employee...</option>
                                            {employees.map(emp => (
                                                <option key={emp} value={emp}>{emp}</option>
                                            ))}
                                        </select>
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                {/* Payment Mode */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Payment Mode <span className="text-rose-500">*</span></label>
                                    <div className="relative max-w-xs">
                                        <select
                                            value={ptPaymentMode}
                                            onChange={e => setPtPaymentMode(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 appearance-none focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <option>Direct Debit</option>
                                            <option>Corporate Net Banking</option>
                                            <option>NEFT / RTGS Transfer</option>
                                        </select>
                                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                {/* Bank Name */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Authorized Bank <span className="text-rose-500">*</span></label>
                                    <div className="relative max-w-xs">
                                        <select
                                            value={ptBankName}
                                            onChange={e => setPtBankName(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 appearance-none focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <option>HDFC Bank</option>
                                            <option>State Bank of India</option>
                                            <option>ICICI Bank</option>
                                            <option>Axis Bank</option>
                                            <option>Kotak Mahindra Bank</option>
                                        </select>
                                        <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                {/* Account Number */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Account Number <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        value={ptAccountNumber}
                                        onChange={e => setPtAccountNumber(e.target.value.replace(/\D/g, ''))}
                                        disabled={!isEditing}
                                        placeholder="Enter bank account number"
                                        className="max-w-xs w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-sky-500 disabled:bg-slate-50 disabled:cursor-not-allowed font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChallanSettings;
