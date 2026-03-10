import React, { useState, useEffect } from 'react';
import { Landmark, X, Save, Building2, Check, Loader2, Edit2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const BUSINESS_UNITS = [
    "Digital Technology",
    "Retail Banking",
    "Supply Chain",
    "Product Innovation",
    "Strategic Consulting",
    "Wealth Management",
    "Corporate Strategy",
    "Creative Services",
    "Brand & Growth",
    "Product Management"
];

const PayrollPaygroup: React.FC = () => {
    const [isRSPOpen, setIsRSPOpen] = useState(false);
    const [editingPaygroup, setEditingPaygroup] = useState<any>(null);
    const [paygroups, setPaygroups] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [paygroupName, setPaygroupName] = useState('');
    const [selectedBUs, setSelectedBUs] = useState<string[]>([]);

    const fetchPaygroups = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('paygroups')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPaygroups(data || []);
        } catch (error) {
            console.error('Error fetching paygroups:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPaygroups();
    }, []);

    const handleToggleBU = (bu: string) => {
        setSelectedBUs(prev =>
            prev.includes(bu) ? prev.filter(b => b !== bu) : [...prev, bu]
        );
    };

    const handleOpenCreate = () => {
        setEditingPaygroup(null);
        setPaygroupName('');
        setSelectedBUs([]);
        setIsRSPOpen(true);
    };

    const handleOpenEdit = (pg: any) => {
        setEditingPaygroup(pg);
        setPaygroupName(pg.name);
        setSelectedBUs(pg.business_units || []);
        setIsRSPOpen(true);
    };

    const handleSave = async () => {
        if (!paygroupName) {
            alert('Please enter a paygroup name');
            return;
        }

        try {
            const payload = {
                name: paygroupName,
                business_units: selectedBUs,
                updated_at: new Date().toISOString()
            };

            if (editingPaygroup) {
                // Update existing paygroup
                const { error } = await supabase
                    .from('paygroups')
                    .update(payload)
                    .eq('id', editingPaygroup.id);
                if (error) throw error;
            } else {
                // Insert new paygroup
                const { error } = await supabase
                    .from('paygroups')
                    .insert([{
                        ...payload,
                        created_by: 'HR Manager'
                    }]);
                if (error) throw error;
            }

            await fetchPaygroups();
            setIsRSPOpen(false);
            setPaygroupName('');
            setSelectedBUs([]);
            setEditingPaygroup(null);
        } catch (error) {
            console.error('Error saving paygroup:', error);
            alert('Failed to save paygroup');
        }
    };

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500 relative min-h-screen">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Payroll Paygroup</h2>
                    <p className="text-slate-500 mt-1">Manage and configure paygroups for your organization.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[400px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-sky-600 animate-spin" />
                        <p className="text-slate-500 font-medium">Loading paygroups...</p>
                    </div>
                </div>
            ) : paygroups.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-24 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center text-sky-600 mb-2">
                            <Landmark size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No Paygroups Configured</h3>
                        <p className="text-slate-500 max-w-sm font-medium">
                            Paygroups help you group employees based on their pay frequencies and cycles. Start by creating your first paygroup.
                        </p>
                        <button
                            onClick={handleOpenCreate}
                            className="px-8 py-3 bg-[#0388d1] text-white rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 mt-4 active:scale-95"
                        >
                            Create New Paygroup
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paygroups.map(pg => (
                        <div key={pg.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative group/card">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
                                    <Landmark size={20} />
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleOpenEdit(pg)}
                                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all opacity-0 group-hover/card:opacity-100"
                                        title="Edit Paygroup"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {new Date(pg.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">{pg.name}</h4>
                            <div className="flex flex-wrap gap-2">
                                {pg.business_units?.map((bu: string) => (
                                    <span key={bu} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">
                                        {bu}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={handleOpenCreate}
                        className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition-all group min-h-[160px]"
                    >
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mb-2 group-hover:bg-sky-100 transition-colors">
                            <Save size={20} />
                        </div>
                        <span className="font-bold">Add Another Paygroup</span>
                    </button>
                </div>
            )}

            {/* Right Side Panel (RSP) */}
            {isRSPOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
                        onClick={() => setIsRSPOpen(false)}
                    />
                    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[110] flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
                        {/* RSP Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                                    {editingPaygroup ? 'Edit Paygroup' : 'Create New Paygroup'}
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsRSPOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* RSP Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    Paygroup Name <span className="text-rose-500 font-bold">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={paygroupName}
                                    onChange={(e) => setPaygroupName(e.target.value)}
                                    placeholder="Enter paygroup name (e.g. Technology Team)"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    Business Units <span className="text-slate-300 font-medium">(Select Multiple)</span>
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    {BUSINESS_UNITS.map(bu => (
                                        <div
                                            key={bu}
                                            onClick={() => handleToggleBU(bu)}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${selectedBUs.includes(bu)
                                                ? 'bg-sky-50 border-sky-200 shadow-sm shadow-sky-50'
                                                : 'bg-white border-slate-100 hover:border-slate-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg transition-colors ${selectedBUs.includes(bu) ? 'bg-white text-sky-600' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                                                    }`}>
                                                    <Building2 size={16} />
                                                </div>
                                                <span className={`text-sm font-bold transition-colors ${selectedBUs.includes(bu) ? 'text-sky-900' : 'text-slate-600'
                                                    }`}>{bu}</span>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedBUs.includes(bu)
                                                ? 'bg-sky-600 border-sky-600'
                                                : 'bg-white border-slate-200'
                                                }`}>
                                                {selectedBUs.includes(bu) && <Check size={14} className="text-white" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RSP Footer */}
                        <div className="p-8 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md sticky bottom-0 flex justify-end gap-3 z-20">
                            <button
                                onClick={() => setIsRSPOpen(false)}
                                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-8 py-2.5 bg-[#0388d1] text-white rounded-xl font-bold text-sm hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 flex items-center gap-2 active:scale-95"
                            >
                                <Save size={18} />
                                Save
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PayrollPaygroup;
