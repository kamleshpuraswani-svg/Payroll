import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Save, Edit2, FileText, ChevronDown, Check, AlertCircle, Info, Landmark, User, CreditCard } from 'lucide-react';

const BUSINESS_UNITS = [
    "MindInventory",
    "300 Minds",
    "CollabCRM"
];

const ChallanSettings: React.FC = () => {
    // Target state
    const [selectedTarget, setSelectedTarget] = useState('bu:MindInventory');
    
    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Configurations state
    const [autoPfChallan, setAutoPfChallan] = useState(true);
    const [autoEsiChallan, setAutoEsiChallan] = useState(true);
    const [autoLwfChallan, setAutoLwfChallan] = useState(false);
    const [paymentMode, setPaymentMode] = useState('Direct Debit');
    const [authorizedSignatory, setAuthorizedSignatory] = useState('');
    const [bankName, setBankName] = useState('HDFC Bank');
    const [accountNumber, setAccountNumber] = useState('');

    // Backup state for cancel
    const [backup, setBackup] = useState<any>(null);

    // List of active employees for Signatory
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
                setAutoPfChallan(config.autoPfChallan ?? true);
                setAutoEsiChallan(config.autoEsiChallan ?? true);
                setAutoLwfChallan(config.autoLwfChallan ?? false);
                setPaymentMode(config.paymentMode ?? 'Direct Debit');
                setAuthorizedSignatory(config.authorizedSignatory ?? '');
                setBankName(config.bankName ?? 'HDFC Bank');
                setAccountNumber(config.accountNumber ?? '');
            } else {
                // Reset to default
                setAutoPfChallan(true);
                setAutoEsiChallan(true);
                setAutoLwfChallan(false);
                setPaymentMode('Direct Debit');
                setAuthorizedSignatory('');
                setBankName('HDFC Bank');
                setAccountNumber('');
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
        setBackup({
            autoPfChallan,
            autoEsiChallan,
            autoLwfChallan,
            paymentMode,
            authorizedSignatory,
            bankName,
            accountNumber
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (backup) {
            setAutoPfChallan(backup.autoPfChallan);
            setAutoEsiChallan(backup.autoEsiChallan);
            setAutoLwfChallan(backup.autoLwfChallan);
            setPaymentMode(backup.paymentMode);
            setAuthorizedSignatory(backup.authorizedSignatory);
            setBankName(backup.bankName);
            setAccountNumber(backup.accountNumber);
        }
        setIsEditing(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const configValue = {
                autoPfChallan,
                autoEsiChallan,
                autoLwfChallan,
                paymentMode,
                authorizedSignatory,
                bankName,
                accountNumber
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
                            disabled={isSaving}
                            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer"
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

            {/* Main Configurations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Cards */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* ECR & Challan Auto-generation */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <FileText size={20} className="text-indigo-600" />
                            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Challan Generation Rules</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Auto PF */}
                            <label className="flex items-start gap-4 cursor-pointer group">
                                <div
                                    onClick={() => isEditing && setAutoPfChallan(!autoPfChallan)}
                                    className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${autoPfChallan ? 'bg-sky-500 border-sky-500 text-white shadow-lg' : 'border-slate-300 bg-white group-hover:border-sky-400'}`}
                                >
                                    {autoPfChallan && <Check size={14} strokeWidth={4} />}
                                </div>
                                <div>
                                    <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Auto-generate PF ECR file on payroll finalization</span>
                                    <p className="text-xs text-slate-400 mt-1">Automatically compile and generate the Electronic Challan-cum-Return text file after monthly payroll signoff.</p>
                                </div>
                            </label>

                            {/* Auto ESI */}
                            <label className="flex items-start gap-4 cursor-pointer group pt-2">
                                <div
                                    onClick={() => isEditing && setAutoEsiChallan(!autoEsiChallan)}
                                    className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${autoEsiChallan ? 'bg-sky-500 border-sky-500 text-white shadow-lg' : 'border-slate-300 bg-white group-hover:border-sky-400'}`}
                                >
                                    {autoEsiChallan && <Check size={14} strokeWidth={4} />}
                                </div>
                                <div>
                                    <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Auto-generate ESI Challan on payroll finalization</span>
                                    <p className="text-xs text-slate-400 mt-1">Compile contributions and create the ESI challan summary sheet ready for portal uploading.</p>
                                </div>
                            </label>

                            {/* Auto LWF */}
                            <label className="flex items-start gap-4 cursor-pointer group pt-2">
                                <div
                                    onClick={() => isEditing && setAutoLwfChallan(!autoLwfChallan)}
                                    className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${autoLwfChallan ? 'bg-sky-500 border-sky-500 text-white shadow-lg' : 'border-slate-300 bg-white group-hover:border-sky-400'}`}
                                >
                                    {autoLwfChallan && <Check size={14} strokeWidth={4} />}
                                </div>
                                <div>
                                    <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Auto-generate LWF Challan on payroll finalization</span>
                                    <p className="text-xs text-slate-400 mt-1">Compute Labour Welfare Fund deductions and compile state-specific challan formats.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Authorized signatory & Bank details */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <Landmark size={20} className="text-indigo-600" />
                            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Signatory & Payment Bank</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Signatory Dropdown */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Authorized Signatory <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <select
                                        value={authorizedSignatory}
                                        onChange={e => setAuthorizedSignatory(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all disabled:opacity-70 cursor-pointer"
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
                                <div className="relative">
                                    <select
                                        value={paymentMode}
                                        onChange={e => setPaymentMode(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all disabled:opacity-70 cursor-pointer"
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
                                <div className="relative">
                                    <select
                                        value={bankName}
                                        onChange={e => setBankName(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all disabled:opacity-70 cursor-pointer"
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
                                    value={accountNumber}
                                    onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                                    disabled={!isEditing}
                                    placeholder="Enter bank account number"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all disabled:opacity-70"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Tips & Info */}
                <div className="space-y-6">
                    <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                            <Info size={18} />
                            <span>Remittance Timelines</span>
                        </div>
                        <div className="text-xs text-amber-900/80 space-y-2 leading-relaxed">
                            <p><strong>PF ECR:</strong> Must be filed and paid on or before the 15th of the following month.</p>
                            <p><strong>ESI Challan:</strong> Contribution remittance deadline is the 15th of the succeeding month.</p>
                            <p><strong>LWF Challan:</strong> Submission timelines vary by state (typically monthly, half-yearly, or annually).</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChallanSettings;
