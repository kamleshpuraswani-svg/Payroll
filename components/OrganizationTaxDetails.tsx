import React, { useState, useEffect } from 'react';
import { Save, Edit2, ShieldCheck, Info, ChevronDown, Building2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const BUSINESS_UNITS = [
    "MindInventory",
    "300 Minds",
    "CollabCRM"
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
                accountNumber, accountName, ifscCode, branch
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

    return (
        <div className="h-full overflow-y-auto bg-slate-50">
            <div className="p-4 lg:p-6 w-full space-y-6 animate-in fade-in duration-300 pb-20">
                {viewMode === 'cards' ? (
                    <>
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Organization Tax Details</h2>
                                <p className="text-slate-500 mt-1">Manage company details, statutory IDs, and contact information.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {BUSINESS_UNITS.map((bu, index) => {
                                // Mock data for cards
                                const domain = bu.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
                                const codePrefix = bu.substring(0, 4).toUpperCase();
                                const currency = index === 2 ? 'USD ($)' : (index === 1 ? 'GBP (£)' : 'INR (₹)');
                                const totalEmployees = index === 0 ? 0 : (index === 2 ? 41 : (index === 1 ? 71 : 3));
                                const email = index === 0 ? `james@${domain}` : `account${index * 5}@${domain}`;

                                return (
                                    <div 
                                        key={bu} 
                                        className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col h-full overflow-hidden"
                                        onClick={() => handleCardClick(bu)}
                                    >
                                        {/* Status Bar */}
                                        <div className="h-1 bg-indigo-500 w-1/4 rounded-br-lg" />
                                        
                                        <div className="p-5 flex-1 flex flex-col">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 font-bold text-xs shrink-0">
                                                        {bu.substring(0, 1)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{bu}</h3>
                                                        <p className="text-[11px] text-slate-500">({domain})</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Body */}
                                            <div className="mb-6 flex-1">
                                                <p className="text-[11px] text-slate-400 font-medium mb-1 uppercase tracking-wider">Registered Company Name</p>
                                                <p className="text-sm font-semibold text-slate-700 truncate">TechFlow Systems Pvt Ltd</p>
                                            </div>

                                            {/* Footer */}
                                            <div className="pt-4 border-t border-slate-100 flex justify-between items-end mt-auto">
                                                <div>
                                                    <p className="text-[11px] text-slate-400 mb-0.5">Last Modified by</p>
                                                    <p className="text-[10px] font-semibold text-slate-600 block">Isha P. | 21-Nov-2025, 01:30 PM</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleCardClick(bu); setIsEditing(true); }}
                                                        className="px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors text-xs font-medium"
                                                    >
                                                        <Edit2 size={12} />
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleBackToCards}
                                className="self-start px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                                Back
                            </button>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">Organization Tax Details: {selectedBusinessUnit}</h2>
                                    <p className="text-slate-500 mt-1">Manage company details, statutory IDs, and contact information.</p>
                                </div>
                                <div className="flex gap-3 items-center">
                                    {saveSuccess && (
                                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 animate-in fade-in zoom-in duration-300">
                                            <CheckCircle2 size={16} />
                                            <span className="text-xs font-bold">Changes Synced</span>
                                        </div>
                                    )}
                                    {error && (
                                        <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                                            <AlertCircle size={16} />
                                            <span className="text-xs font-bold">{error}</span>
                                        </div>
                                    )}
                                    {isEditing && (
                            <button
                                onClick={() => setIsEditing(false)}
                                disabled={isSaving}
                                className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${isEditing ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'} disabled:opacity-50`}
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : (isEditing ? <Save size={16} /> : <Edit2 size={16} />)}
                            {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Edit')}
                        </button>
                    </div>
                </div>
            </div>

                {/* Company Identity & Contact */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100">COMPANY INFORMATION</h3>
                    <div className="space-y-6">
                        <div className="md:w-1/2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">REGISTERED COMPANY NAME</label>
                            <input
                                type="text"
                                defaultValue="TechFlow Systems Pvt Ltd"
                                disabled={!isEditing}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">COMPANY ADDRESS</label>
                            <input
                                type="text"
                                defaultValue="123, Business Park, Sector 4, Bangalore - 560001"
                                disabled={!isEditing}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 disabled:bg-slate-50 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Statutory Identifiers */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-indigo-600" /> STATUTORY IDENTIFIERS
                    </h3>

                    <div className="space-y-8">
                        {/* Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">PAN NUMBER <span className="text-rose-500">*</span></label>
                                <input type="text" value={panNumber} onChange={e => setPanNumber(e.target.value)} disabled={!isEditing} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 uppercase disabled:bg-slate-50 focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">TAN NUMBER</label>
                                <input type="text" value={tanNumber} onChange={e => setTanNumber(e.target.value)} disabled={!isEditing} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 uppercase disabled:bg-slate-50 focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">GSTIN</label>
                                <input type="text" value={gstin} onChange={e => setGstin(e.target.value)} disabled={!isEditing} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 uppercase disabled:bg-slate-50 focus:outline-none focus:border-indigo-500" />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase mb-2">
                                    TDS circle / AO code <Info size={14} className="text-slate-400" />
                                </label>
                                <div className="flex gap-2">
                                    <input type="text" value={ao1} onChange={e => setAo1(e.target.value)} disabled={!isEditing} placeholder="AAA" className="w-16 px-2 py-2.5 border border-slate-200 rounded-lg text-sm text-center text-slate-600 disabled:bg-slate-50 focus:outline-none focus:border-indigo-500" />
                                    <span className="self-center text-slate-300">/</span>
                                    <input type="text" value={ao2} onChange={e => setAo2(e.target.value)} disabled={!isEditing} placeholder="AA" className="w-12 px-2 py-2.5 border border-slate-200 rounded-lg text-sm text-center text-slate-600 disabled:bg-slate-50 focus:outline-none focus:border-indigo-500" />
                                    <span className="self-center text-slate-300">/</span>
                                    <input type="text" value={ao3} onChange={e => setAo3(e.target.value)} disabled={!isEditing} placeholder="000" className="w-16 px-2 py-2.5 border border-slate-200 rounded-lg text-sm text-center text-slate-600 disabled:bg-slate-50 focus:outline-none focus:border-indigo-500" />
                                    <span className="self-center text-slate-300">/</span>
                                    <input type="text" value={ao4} onChange={e => setAo4(e.target.value)} disabled={!isEditing} placeholder="00" className="w-12 px-2 py-2.5 border border-slate-200 rounded-lg text-sm text-center text-slate-600 disabled:bg-slate-50 focus:outline-none focus:border-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase mb-2">
                                    Tax Payment Frequency <Info size={14} className="text-slate-400" />
                                </label>
                                <div className="relative">
                                    <select
                                        value={frequency}
                                        onChange={e => setFrequency(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white appearance-none disabled:bg-slate-50 focus:outline-none focus:border-indigo-500"
                                    >
                                        <option>Monthly</option>
                                        <option>Quarterly</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                            <div className="hidden md:block"></div>
                        </div>
                    </div>
                </div>

                {/* Company's Bank Information */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <Building2 size={18} className="text-indigo-600" /> COMPANY'S BANK INFORMATION
                    </h3>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Account Number</label>
                                <input 
                                    type="text" 
                                    value={accountNumber} 
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setAccountNumber(val);
                                    }} 
                                    disabled={!isEditing} 
                                    placeholder="Enter numeric account number"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 disabled:bg-slate-50 focus:outline-none focus:border-indigo-500 transition-colors" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Account Name</label>
                                <input 
                                    type="text" 
                                    value={accountName} 
                                    onChange={e => setAccountName(e.target.value)} 
                                    disabled={!isEditing} 
                                    placeholder="Enter account holder name"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 disabled:bg-slate-50 focus:outline-none focus:border-indigo-500 transition-colors" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">IFSC Code</label>
                                <input 
                                    type="text" 
                                    value={ifscCode} 
                                    onChange={e => handleIfscChange(e.target.value)} 
                                    disabled={!isEditing} 
                                    placeholder="e.g. SBIN0001234"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-700 uppercase disabled:bg-slate-50 focus:outline-none focus:border-indigo-500 transition-colors" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Branch</label>
                                <input 
                                    type="text" 
                                    value={branch} 
                                    disabled={true} 
                                    placeholder="Branch will be auto-populated"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-400 bg-slate-50 focus:outline-none transition-colors" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tax Deductor Details */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Tax Deductor Details</h3>

                    <div className="space-y-6">
                        {/* Deductor Type */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Deductor's Type</label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${deductorType === 'Employee' ? 'border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                        {deductorType === 'Employee' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={deductorType === 'Employee'} onChange={() => isEditing && setDeductorType('Employee')} disabled={!isEditing} />
                                    <span className={`text-sm ${deductorType === 'Employee' ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>Employee</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${deductorType === 'Non-Employee' ? 'border-sky-600' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                        {deductorType === 'Non-Employee' && <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />}
                                    </div>
                                    <input type="radio" className="hidden" checked={deductorType === 'Non-Employee'} onChange={() => isEditing && setDeductorType('Non-Employee')} disabled={!isEditing} />
                                    <span className={`text-sm ${deductorType === 'Non-Employee' ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>Non-Employee</span>
                                </label>
                            </div>
                        </div>

                        {/* Names */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Deductor's Name</label>
                                <div className="relative">
                                    <select
                                        value={deductorName}
                                        onChange={e => setDeductorName(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white appearance-none disabled:bg-slate-50 focus:outline-none focus:border-indigo-500"
                                    >
                                        <option>Suresh Kumar</option>
                                        <option>Rajesh Kumar</option>
                                        <option>Kavita Sharma</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Deductor's Father's Name</label>
                                <input
                                    type="text"
                                    value={fatherName}
                                    onChange={e => setFatherName(e.target.value)}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 disabled:bg-slate-50 focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Designation - Visible only for Non-Employee */}
                        {deductorType === 'Non-Employee' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Deductor's Designation</label>
                                <input
                                    type="text"
                                    value={designation}
                                    onChange={e => setDesignation(e.target.value)}
                                    disabled={!isEditing}
                                    placeholder="Enter Designation"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 disabled:bg-slate-50 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse">
                        <Loader2 size={32} className="text-sky-500 animate-spin mb-4" />
                        <p className="text-slate-400 font-medium">Fetching configuration from Supabase...</p>
                    </div>
                )}
                    </>
                )}
            </div>
        </div>
    );
};

export default OrganizationTaxDetails;
