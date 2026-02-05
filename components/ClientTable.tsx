import React from 'react';
import { Edit2, MoreVertical, ShieldCheck, AlertCircle, Clock } from 'lucide-react';
import { Company } from '../types';

interface ClientTableProps {
  companies: Company[];
}

const ClientTable: React.FC<ClientTableProps> = ({ companies }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Suspended': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
           <h2 className="text-lg font-bold text-slate-800">Client Companies</h2>
           <p className="text-sm text-slate-500">Manage payroll access and subscription plans</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
             Filter
           </button>
           <button className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 shadow-sm shadow-sky-200 transition-colors">
             Add Company
           </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="px-6 py-4">Company Name</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Employees</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Audit</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      {company.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{company.name}</div>
                      <div className="text-xs text-slate-400">ID: {company.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                    company.plan === 'Enterprise' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                    company.plan === 'Pro' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {company.plan === 'Enterprise' && <ShieldCheck size={12} />}
                    {company.plan}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">{company.employees.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(company.status)}`}>
                    {company.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-300" />
                    {company.lastAudit}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-sm text-slate-500">
         <span>Showing 5 of 128 companies</span>
         <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white bg-white text-slate-900 font-medium shadow-sm">1</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white">2</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white">3</button>
            <span className="px-2">...</span>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white">Next</button>
         </div>
      </div>
    </div>
  );
};

export default ClientTable;
