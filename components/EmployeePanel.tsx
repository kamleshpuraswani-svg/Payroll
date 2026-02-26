import React, { useState } from 'react';
import { X, Search, Filter, Download, ChevronLeft, ChevronRight, User, MapPin, Sigma, ChevronDown, Building, Briefcase, Activity } from 'lucide-react';
import { Employee } from '../types';
import { ExportEmployeesModal } from './CompanyActionModals';

interface EmployeePanelProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
}

const EmployeePanel: React.FC<EmployeePanelProps> = ({ isOpen, onClose, employees }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'New Joinee': return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'On Notice': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Relieved': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-in Panel */}
      <div
        className={`
          fixed inset-y-0 right-0 z-40 w-full max-w-5xl bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Employee Overview</h2>
              <p className="text-sm text-slate-500">45,237 total records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filters & Actions */}
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">

            {/* Lookup Field Selector */}
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-sky-600 transition-colors shadow-sm"
              >
                <Sigma size={18} className="text-indigo-600" />
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1">
                    Select Filter Field
                  </div>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-sky-600 flex items-center gap-3 transition-colors">
                    <Building size={16} className="text-slate-400" />
                    Company
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-sky-600 flex items-center gap-3 transition-colors">
                    <Briefcase size={16} className="text-slate-400" />
                    Department
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-sky-600 flex items-center gap-3 transition-colors">
                    <MapPin size={16} className="text-slate-400" />
                    Location
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-sky-600 flex items-center gap-3 transition-colors">
                    <Activity size={16} className="text-slate-400" />
                    Status
                  </button>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input
                type="text"
                placeholder="Filter Results..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 shadow-sm"
              />
            </div>

            {/* Filter Button */}
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              Filter
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-8 py-4 border-b border-slate-200">Employee</th>
                <th className="px-6 py-4 border-b border-slate-200">Company & Dept</th>
                <th className="px-6 py-4 border-b border-slate-200">Location</th>
                <th className="px-6 py-4 border-b border-slate-200">CTC</th>
                <th className="px-6 py-4 border-b border-slate-200">Joined On</th>
                <th className="px-6 py-4 border-b border-slate-200 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(employees || []).map((emp) => (
                <tr key={emp?.id || Math.random()} className="hover:bg-sky-50/30 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      {emp?.avatar_url ? (
                        <img src={emp.avatar_url} alt={`${emp.first_name || ''} ${emp.last_name || ''}`} className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                          <User size={18} />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{emp?.first_name || 'N/A'} {emp?.last_name || ''}</div>
                        <div className="text-xs font-medium text-slate-400">{emp?.employee_id || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-700">{emp?.company_id || 'N/A'}</div>
                    <div className="text-xs text-slate-500">{emp?.department || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <MapPin size={14} className="text-slate-400" />
                      {emp?.location || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    {emp?.ctc || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {emp?.date_of_joining || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(emp?.status || '')}`}>
                      {emp?.status || 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <span className="text-sm text-slate-500 font-medium">Showing 1-8 of 45,237</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              <button className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 border-r border-slate-200 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors shadow-sm"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <ExportEmployeesModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </>
  );
};

export default EmployeePanel;