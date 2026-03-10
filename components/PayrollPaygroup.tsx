
import React from 'react';
import { Landmark, Info } from 'lucide-react';

const PayrollPaygroup: React.FC = () => {
    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Payroll Paygroup</h2>
                    <p className="text-slate-500 mt-1">Manage and configure paygroups for your organization.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center text-sky-600 mb-2">
                        <Landmark size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No Paygroups Configured</h3>
                    <p className="text-slate-500 max-w-sm">
                        Paygroups help you group employees based on their pay frequencies and cycles. Start by creating your first paygroup.
                    </p>
                    <button className="px-6 py-2.5 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 mt-4">
                        + Create New Paygroup
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800">
                <Info size={20} className="shrink-0" />
                <p className="text-sm font-medium">
                    <span className="font-bold">Note:</span> Paygroups are essential for running payroll for different departments or locations with varying schedules.
                </p>
            </div>
        </div>
    );
};

export default PayrollPaygroup;
