import React, { useState, useEffect } from 'react';
import { Save, Edit2, ShieldCheck, Info, ChevronDown, Building2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const BUSINESS_UNITS = [
    "MindInventory",
    "300 Minds",
    "CollabCRM"
];

const INDIAN_BANKS = [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "Punjab National Bank",
    "Bank of Baroda",
    "Canara Bank",
    "Union Bank of India",
    "IndusInd Bank",
    "IDFC FIRST Bank",
    "Yes Bank",
    "Federal Bank",
    "IDBI Bank",
    "Central Bank of India"
];

const OrganizationTaxDetails: React.FC = () => {
    const [viewMode, setViewMode] = useState<'cards' | 'details'>('cards');
    const [isEditing, setIsEditing] = useState(false);

    // Statutory Identifiers
    const [panNumber, setPanNumber] = useState('ABCDE1234F');
    const [tanNumber, setTanNumber] = useState('BLRT12345C');
    const [gstin, setGstin] = useState('29ABCDE1234F1Z5');

    // AO Code
    const [ao1, setAo1] = useState('AAA');
    const [ao2, setAo2] = useState('AA');
    const [ao3, setAo3] = useState('000');
    const [ao4, setAo4] = useState('00');

    // Frequency
    const [frequency, setFrequency] = useState('Monthly');

    // Tax Deductor Details
    const [deductorType, setDeductorType] = useState('Employee');
    const [deductorName, setDeductorName] = useState('Suresh Kumar');
    const [fatherName, setFatherName] = useState('Ramesh Kumar');
    const [designation, setDesignation] = useState('');

    // Company's Bank Information
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [branch, setBranch] = useState('');
    const [selectedBusinessUnit, setSelectedBusinessUnit] = useState(BUSINESS_UNITS[0]);

    // Auto-populate branch based on IFSC
    const handleIfscChange = (code: string) => {
        const upperCode = code.toUpperCase();
        setIfscCode(upperCode);
        
        // Simple mock lookup logic
        if (upperCode.startsWith('SBIN')) setBranch('State Bank of India');
        else if (upperCode.startsWith('HDFC')) setBranch('HDFC Bank');
        else if (upperCode.startsWith('ICIC')) setBranch('ICICI Bank');
        else if (upperCode.startsWith('BARB')) setBranch('Bank of Baroda');
        else if (upperCode.startsWith('PUNB')) setBranch('Punjab National Bank');
        else if (upperCode.length >= 4) setBranch('Auto-populated Branch');
        else setBranch('');
    };

    // Supabase state
    const [allBuConfigs, setAllBuConfigs] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    // Sync individual fields when target BU or all configs change
    useEffect(() => {
        const config = allBuConfigs[selectedBusinessUnit];
        if (config) {
            setPanNumber(config.panNumber || 'ABCDE1234F');
            setTanNumber(config.tanNumber || 'BLRT12345C');
            setGstin(config.gstin || '29ABCDE1234F1Z5');
            setAo1(config.ao1 || 'AAA');
            setAo2(config.ao2 || 'AA');
            setAo3(config.ao3 || '000');
            setAo4(config.ao4 || '00');
            setFrequency(config.frequency || 'Monthly');
            setDeductorType(config.deductorType || 'Employee');
            setDeductorName(config.deductorName || 'Suresh Kumar');
            setFatherName(config.fatherName || 'Ramesh Kumar');
            setDesignation(config.designation || '');
            setBankName(config.bankName || '');
            setAccountNumber(config.accountNumber || '');
            setAccountName(config.accountName || '');
            setIfscCode(config.ifscCode || '');
            setBranch(config.branch || '');
        } else {
            // Revert to defaults if no specific config exists for this BU
            setPanNumber('ABCDE1234F');
            setTanNumber('BLRT12345C');
            setGstin('29ABCDE1234F1Z5');
            setAo1('AAA');
            setAo2('AA');
            setAo3('000');
            setAo4('00');
            setFrequency('Monthly');
            setDeductorType('Employee');
            setDeductorName('Suresh Kumar');
            setFatherName('Ramesh Kumar');
            setDesignation('');
            setBankName('');
            setAccountNumber('');
            setAccountName('');
            setIfscCode('');
            setBranch('');
        }
    }, [selectedBusinessUnit, allBuConfigs]);

    const fetchConfig = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('operational_config')
                .select('*')
                .eq('config_key', 'organization_tax_details')
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

            if (data && data.config_value) {
                setAllBuConfigs(data.config_value);
                // Note: individual field syncing happens in useEffect dependent on allBuConfigs
            }
        } catch (err: any) {
            console.error('Error fetching config:', err);
            setError('Failed to load configuration from Supabase.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!isEditing) {
            setIsEditing(true);
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            // Build config for the CURRENT selected BU
            const currentBuFields = {
                panNumber, tanNumber, gstin,
                ao1, ao2, ao3, ao4,
                frequency,
                deductorType, deductorName, fatherName, designation,
                bankName, accountNumber, accountName, ifscCode, branch
            };

            // Merge into the global map
            const newAllBuConfigs = {
                ...allBuConfigs,
                [selectedBusinessUnit]: currentBuFields
            };

            const { error: saveError } = await supabase
                .from('operational_config')
                .upsert({
                    config_key: 'organization_tax_details',
                    config_value: newAllBuConfigs
                }, { onConflict: 'config_key' });

            if (saveError) throw saveError;

            // Update local state map
            setAllBuConfigs(newAllBuConfigs);
            
            setSaveSuccess(true);
            setIsEditing(false);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            console.error('Error saving config:', err);
            setError('Failed to save configuration to Supabase.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCardClick = (bu: string) => {
        setSelectedBusinessUnit(bu);
        setViewMode('details');
        setIsEditing(false);
    };

    const handleBackToCards = () => {
        setViewMode('cards');
        setIsEditing(false);
    };

    const [isCompanyExpanded, setIsCompanyExpanded] = useState(true);
    const [isStatutoryExpanded, setIsStatutoryExpanded] = useState(true);
    const [isBankExpanded, setIsBankExpanded] = useState(true);
    const [isDeductorExpanded, setIsDeductorExpanded] = useState(true);

    return (
        <div className="p-4 lg:p-6 w-full space-y-6 bg-slate-50 min-h-screen pb-20">
            {/* Header section with title and global actions */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-slate-800">Organization Tax Details</h1>
                        <Info size={18} className="text-slate-400 cursor-help" />
                    </div>
                    <p className="text-slate-500 text-sm mt-1">Manage company details, statutory IDs, and contact information.</p>
                </div>
                <div className="flex items-center gap-4">
                    {saveSuccess && (
                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 animate-in fade-in zoom-in duration-300">
                            <CheckCircle2 size={16} />
                            <span className="text-xs font-bold">Changes Synced with Supabase</span>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                            <AlertCircle size={16} />
                            <span className="text-xs font-bold">{error}</span>
                        </div>
                    )}
                    <button
                        onClick={() => { setIsEditing(false); fetchConfig(); }}
                        disabled={isSaving || isLoading}
                        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className={`flex items-center gap-2 ${isEditing ? 'bg-sky-600 hover:bg-sky-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'} px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-sky-100/20 active:scale-95 disabled:opacity-50`}
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? <Save size={18} /> : <Edit2 size={18} />)}
                        {isSaving ? 'Syncing...' : (isEditing ? 'Save' : 'Edit')}
                    </button>
                </div>
            </div>

            {/* Business Unit Selector & Last Updated Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-xs">
                        <select
                            value={selectedBusinessUnit}
                            onChange={(e) => setSelectedBusinessUnit(e.target.value)}
                            disabled={isSaving || isLoading}
                            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer"
                        >
                            {BUSINESS_UNITS.map(bu => (
                                <option key={bu} value={bu}>{bu}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                            <ChevronDown size={18} />
                        </div>
                    </div>
                    {allBuConfigs[selectedBusinessUnit] && (
                        <p className="text-[11px] text-slate-400 italic">
                            (Last updated by Gurpreetsingh Dhillon (BL-001) on 13-Mar-2026, 03:12 PM)
                        </p>
                    )}
                </div>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse">
                    <Loader2 size={32} className="text-sky-500 animate-spin mb-4" />
                    <p className="text-slate-400 font-medium">Fetching configuration from Supabase...</p>
                </div>
            )}

            {!isLoading && (
                <div className="space-y-6">
                    {/* Company Information */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div 
                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => setIsCompanyExpanded(!isCompanyExpanded)}
                        >
                            <h3 className="font-semibold text-slate-800">Company Information</h3>
                            <button className="text-slate-400">
                                {isCompanyExpanded ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> : <ChevronDown size={20} />}
                            </button>
                        </div>
                        {isCompanyExpanded && (
                            <div className="p-6 border-t border-slate-100 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Registered Company Name</label>
                                        <input
                                            type="text"
                                            defaultValue="TechFlow Systems Pvt Ltd"
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:border-sky-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Company Address</label>
                                        <input
                                            type="text"
                                            defaultValue="123, Business Park, Sector 4, Bangalore - 560001"
                                            disabled={!isEditing}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-sky-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Statutory Identifiers */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div 
                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => setIsStatutoryExpanded(!isStatutoryExpanded)}
                        >
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-800">Statutory Identifiers</h3>
                                <ShieldCheck size={18} className="text-sky-600" />
                            </div>
                            <button className="text-slate-400">
                                {isStatutoryExpanded ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> : <ChevronDown size={20} />}
                            </button>
                        </div>
                        {isStatutoryExpanded && (
                            <div className="p-6 border-t border-slate-100">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">PAN NUMBER <span className="text-rose-500">*</span></label>
                                        <input type="text" value={panNumber} onChange={e => setPanNumber(e.target.value)} disabled={!isEditing} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-700 uppercase focus:outline-none focus:border-sky-500" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">TAN NUMBER</label>
                                        <input type="text" value={tanNumber} onChange={e => setTanNumber(e.target.value)} disabled={!isEditing} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-700 uppercase focus:outline-none focus:border-sky-500" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">GSTIN</label>
                                        <input type="text" value={gstin} onChange={e => setGstin(e.target.value)} disabled={!isEditing} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-700 uppercase focus:outline-none focus:border-sky-500" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">
                                            TDS circle / AO code <Info size={14} className="text-slate-400" />
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input type="text" value={ao1} onChange={e => setAo1(e.target.value)} disabled={!isEditing} placeholder="AAA" className="w-20 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center font-bold text-slate-700 focus:outline-none focus:border-sky-500" />
                                            <span className="text-slate-300">/</span>
                                            <input type="text" value={ao2} onChange={e => setAo2(e.target.value)} disabled={!isEditing} placeholder="AA" className="w-16 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center font-bold text-slate-700 focus:outline-none focus:border-sky-500" />
                                            <span className="text-slate-300">/</span>
                                            <input type="text" value={ao3} onChange={e => setAo3(e.target.value)} disabled={!isEditing} placeholder="000" className="w-20 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center font-bold text-slate-700 focus:outline-none focus:border-sky-500" />
                                            <span className="text-slate-300">/</span>
                                            <input type="text" value={ao4} onChange={e => setAo4(e.target.value)} disabled={!isEditing} placeholder="00" className="w-16 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center font-bold text-slate-700 focus:outline-none focus:border-sky-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">
                                            Tax Payment Frequency <Info size={14} className="text-slate-400" />
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={frequency}
                                                onChange={e => setFrequency(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:border-sky-500 transition-all"
                                            >
                                                <option>Monthly</option>
                                                <option>Quarterly</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Company's Bank Information */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div 
                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => setIsBankExpanded(!isBankExpanded)}
                        >
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-800">Company's Bank Information</h3>
                                <Building2 size={18} className="text-sky-600" />
                            </div>
                            <button className="text-slate-400">
                                {isBankExpanded ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> : <ChevronDown size={20} />}
                            </button>
                        </div>
                        {isBankExpanded && (
                            <div className="p-6 border-t border-slate-100 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Bank Name</label>
                                        <div className="relative">
                                            <select
                                                value={bankName}
                                                onChange={e => setBankName(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 appearance-none focus:outline-none focus:border-sky-500 transition-colors"
                                            >
                                                <option value="">Select Bank</option>
                                                {INDIAN_BANKS.map(bank => (
                                                    <option key={bank} value={bank}>{bank}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Account Number</label>
                                        <input 
                                            type="text" 
                                            value={accountNumber} 
                                            onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))} 
                                            disabled={!isEditing} 
                                            placeholder="Enter numeric account number"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-sky-500 transition-colors" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Account Name</label>
                                        <input 
                                            type="text" 
                                            value={accountName} 
                                            onChange={e => setAccountName(e.target.value)} 
                                            disabled={!isEditing} 
                                            placeholder="Enter account holder name"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-sky-500 transition-colors" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">IFSC Code</label>
                                        <input 
                                            type="text" 
                                            value={ifscCode} 
                                            onChange={e => handleIfscChange(e.target.value)} 
                                            disabled={!isEditing} 
                                            placeholder="e.g. SBIN0001234"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-700 uppercase focus:outline-none focus:border-sky-500 transition-colors" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Branch</label>
                                        <input 
                                            type="text" 
                                            value={branch} 
                                            disabled={true} 
                                            placeholder="Branch will be auto-populated"
                                            className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold text-slate-500 transition-colors" 
                                        />
                                    </div>
                                    <div />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tax Deductor Details */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div 
                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => setIsDeductorExpanded(!isDeductorExpanded)}
                        >
                            <h3 className="font-semibold text-slate-800">Tax Deductor Details</h3>
                            <button className="text-slate-400">
                                {isDeductorExpanded ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> : <ChevronDown size={20} />}
                            </button>
                        </div>
                        {isDeductorExpanded && (
                            <div className="p-6 border-t border-slate-100 space-y-8">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-4 tracking-wider">Deductor's Type</label>
                                    <div className="flex gap-8">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${deductorType === 'Employee' ? 'border-sky-600 bg-sky-50' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                                {deductorType === 'Employee' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                            </div>
                                            <input type="radio" className="hidden" checked={deductorType === 'Employee'} onChange={() => isEditing && setDeductorType('Employee')} disabled={!isEditing} />
                                            <span className={`text-sm font-bold ${deductorType === 'Employee' ? 'text-slate-800' : 'text-slate-500'}`}>Employee</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${deductorType === 'Non-Employee' ? 'border-sky-600 bg-sky-50' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                                {deductorType === 'Non-Employee' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                            </div>
                                            <input type="radio" className="hidden" checked={deductorType === 'Non-Employee'} onChange={() => isEditing && setDeductorType('Non-Employee')} disabled={!isEditing} />
                                            <span className={`text-sm font-bold ${deductorType === 'Non-Employee' ? 'text-slate-800' : 'text-slate-500'}`}>Non-Employee</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Deductor's Name</label>
                                        <div className="relative">
                                            <select
                                                value={deductorName}
                                                onChange={e => setDeductorName(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:border-sky-500 transition-all"
                                            >
                                                <option>Suresh Kumar</option>
                                                <option>Rajesh Kumar</option>
                                                <option>Kavita Sharma</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    {deductorType !== 'Employee' && (
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Deductor's Father's Name</label>
                                            <input
                                                type="text"
                                                value={fatherName}
                                                onChange={e => setFatherName(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:border-sky-500 transition-colors"
                                            />
                                        </div>
                                    )}
                                    {deductorType === 'Non-Employee' && (
                                        <div className="animate-in slide-in-from-top-2 duration-300">
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Deductor's Designation</label>
                                            <input
                                                type="text"
                                                value={designation}
                                                onChange={e => setDesignation(e.target.value)}
                                                disabled={!isEditing}
                                                placeholder="Enter Designation"
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-sky-500 transition-colors"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizationTaxDetails;
