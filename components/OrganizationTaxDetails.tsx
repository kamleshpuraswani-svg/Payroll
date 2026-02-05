
import React, { useState } from 'react';
import { Save, Edit2, ShieldCheck, Info, ChevronDown, Building2 } from 'lucide-react';

const OrganizationTaxDetails: React.FC = () => {
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
    
    return (
        <div className="h-full overflow-y-auto">
            <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Organization Tax Details</h2>
                        <p className="text-slate-500 mt-1">Manage company details, statutory IDs, and contact information.</p>
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
                            {isEditing ? 'Save Changes' : 'Edit Details'}
                        </button>
                    </div>
                </div>

                {/* Company Identity & Contact */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100">COMPANY IDENTITY & CONTACT</h3>
                    <div className="space-y-6">
                        <div>
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
                        <ShieldCheck size={18} className="text-indigo-600"/> STATUTORY IDENTIFIERS
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
        </div>
    );
};

export default OrganizationTaxDetails;
